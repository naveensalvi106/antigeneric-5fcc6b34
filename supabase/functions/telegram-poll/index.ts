import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TELEGRAM_CHAT_ID = "6602989961";
const MAX_RUNTIME_MS = 55_000;
const MIN_REMAINING_MS = 5_000;

Deno.serve(async () => {
  const startTime = Date.now();

  const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!TELEGRAM_BOT_TOKEN) {
    return new Response(JSON.stringify({ error: "TELEGRAM_BOT_TOKEN not configured" }), { status: 500 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let totalProcessed = 0;

  // Read initial offset
  const { data: state, error: stateErr } = await supabase
    .from("telegram_bot_state")
    .select("update_offset")
    .eq("id", 1)
    .single();

  if (stateErr) {
    return new Response(JSON.stringify({ error: stateErr.message }), { status: 500 });
  }

  let currentOffset = state.update_offset;

  while (true) {
    const elapsed = Date.now() - startTime;
    const remainingMs = MAX_RUNTIME_MS - elapsed;
    if (remainingMs < MIN_REMAINING_MS) break;

    const timeout = Math.min(50, Math.floor(remainingMs / 1000) - 5);
    if (timeout < 1) break;

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offset: currentOffset,
          timeout,
          allowed_updates: ["message"],
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), { status: 502 });
    }

    const updates = data.result ?? [];
    if (updates.length === 0) continue;

    for (const update of updates) {
      const message = update.message;
      if (!message) continue;

      // Only process messages from admin chat
      if (String(message.chat.id) !== TELEGRAM_CHAT_ID) continue;

      // Check if this is a result submission: photo with caption starting with /result
      const caption = message.caption || "";
      const text = message.text || "";

      // Handle /result command with photo
      if (message.photo && caption.toLowerCase().startsWith("/result")) {
        const submissionId = caption.replace(/^\/result\s*/i, "").trim();

        if (!submissionId) {
          await sendTelegramMessage(
            TELEGRAM_BOT_TOKEN,
            TELEGRAM_CHAT_ID,
            "❌ Please provide the submission ID.\n\nFormat: `/result <submission_id>`\nSend this as the photo caption.",
          );
          continue;
        }

        // Get the highest resolution photo
        const photo = message.photo[message.photo.length - 1];
        const fileId = photo.file_id;

        try {
          // Step 1: Get file path from Telegram
          const fileRes = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ file_id: fileId }),
            }
          );
          const fileData = await fileRes.json();
          if (!fileData.ok) throw new Error("Failed to get file info");

          const filePath = fileData.result.file_path;

          // Step 2: Download the file
          const downloadRes = await fetch(
            `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`
          );
          if (!downloadRes.ok) throw new Error("Failed to download file");

          const fileBytes = await downloadRes.arrayBuffer();
          const ext = filePath.split(".").pop() || "jpg";
          const storagePath = `results/${submissionId}.${ext}`;

          // Step 3: Upload to Supabase Storage
          const { error: uploadErr } = await supabase.storage
            .from("thumbnail-uploads")
            .upload(storagePath, fileBytes, {
              contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
              upsert: true,
            });

          if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

          // Step 4: Get public URL
          const { data: urlData } = supabase.storage
            .from("thumbnail-uploads")
            .getPublicUrl(storagePath);

          const publicUrl = urlData.publicUrl;

          // Step 5: Update the submission
          const { data: submission, error: updateErr } = await supabase
            .from("thumbnail_submissions")
            .update({
              result_image_url: publicUrl,
              status: "completed",
            })
            .eq("id", submissionId)
            .select("title, user_email")
            .single();

          if (updateErr) throw new Error(`Update failed: ${updateErr.message}`);

          // Step 6: Send email notification to user
          if (submission?.user_email) {
            try {
              const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${supabaseServiceKey}`,
                },
                body: JSON.stringify({
                  to: submission.user_email,
                  template: "result-ready",
                  data: {
                    title: submission.title,
                    resultUrl: publicUrl,
                  },
                }),
              });
              const emailText = await emailRes.text();
              console.log("Email notification sent:", emailRes.status, emailText);
            } catch (emailErr) {
              console.error("Email notification failed:", emailErr);
            }
          }

          await sendTelegramMessage(
            TELEGRAM_BOT_TOKEN,
            TELEGRAM_CHAT_ID,
            `✅ *Result delivered!*\n\n📝 *Title:* ${submission?.title || submissionId}\n📧 *User:* ${submission?.user_email || "Unknown"}\n\nThe user will receive a popup notification and email automatically.`,
          );

          totalProcessed++;
        } catch (err) {
          await sendTelegramMessage(
            TELEGRAM_BOT_TOKEN,
            TELEGRAM_CHAT_ID,
            `❌ *Failed to deliver result*\n\nID: \`${submissionId}\`\nError: ${err.message}`,
          );
        }
      }

      // Handle /help command
      if (text.toLowerCase() === "/help" || text.toLowerCase() === "/start") {
        await sendTelegramMessage(
          TELEGRAM_BOT_TOKEN,
          TELEGRAM_CHAT_ID,
          `🤖 *AntiGeneric Bot Commands*\n\n` +
          `📸 *Send Result:*\nSend a photo with caption:\n\`/result <submission_id>\`\n\n` +
          `📋 *List Pending:*\n\`/pending\`\n\n` +
          `The submission ID is included in the new request notifications.`,
        );
      }

      // Handle /pending command - list pending submissions
      if (text.toLowerCase() === "/pending") {
        const { data: pending } = await supabase
          .from("thumbnail_submissions")
          .select("id, title, user_email, created_at")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(10);

        if (!pending || pending.length === 0) {
          await sendTelegramMessage(
            TELEGRAM_BOT_TOKEN,
            TELEGRAM_CHAT_ID,
            "✨ No pending submissions!",
          );
        } else {
          let msg = `📋 *Pending Submissions (${pending.length}):*\n\n`;
          for (const s of pending) {
            msg += `• *${s.title}*\n  📧 ${s.user_email || "Anonymous"}\n  🆔 \`${s.id}\`\n\n`;
          }
          msg += `_Reply with a photo + caption \`/result <id>\` to deliver._`;
          await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, msg);
        }
      }
    }

    // Advance offset
    const newOffset = Math.max(...updates.map((u: any) => u.update_id)) + 1;
    await supabase
      .from("telegram_bot_state")
      .update({ update_offset: newOffset, updated_at: new Date().toISOString() })
      .eq("id", 1);
    currentOffset = newOffset;
  }

  return new Response(JSON.stringify({ ok: true, processed: totalProcessed }));
});

async function sendTelegramMessage(token: string, chatId: string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  });
  if (!res.ok) {
    console.error("Failed to send Telegram message:", res.status, await res.text());
  } else {
    await res.text(); // consume body
  }
}
