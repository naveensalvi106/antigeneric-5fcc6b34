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
      if (String(message.chat.id) !== TELEGRAM_CHAT_ID) continue;

      const caption = message.caption || "";
      const text = message.text || "";
      const replyToMessage = message.reply_to_message;

      // ── Method 1: Reply to notification with a photo ──
      if (message.photo && replyToMessage) {
        const replyMsgId = replyToMessage.message_id;

        // Find submission by the Telegram message ID it was notified with
        const { data: submission, error: findErr } = await supabase
          .from("thumbnail_submissions")
          .select("id, title, user_email")
          .eq("telegram_message_id", replyMsgId)
          .single();

        if (findErr || !submission) {
          await sendTelegramMessage(
            TELEGRAM_BOT_TOKEN,
            TELEGRAM_CHAT_ID,
            "❌ Could not find a submission linked to that message. Use `/result <submission_id>` as caption instead.",
          );
          continue;
        }

        await deliverResult(TELEGRAM_BOT_TOKEN, supabase, supabaseUrl, supabaseServiceKey, message, submission);
        totalProcessed++;
        continue;
      }

      // ── Method 2: /result <id> as photo caption ──
      if (message.photo && caption.toLowerCase().startsWith("/result")) {
        const submissionId = caption.replace(/^\/result\s*/i, "").trim();
        if (!submissionId) {
          await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID,
            "❌ Please provide the submission ID.\nFormat: `/result <submission_id>`");
          continue;
        }

        const { data: submission, error: findErr } = await supabase
          .from("thumbnail_submissions")
          .select("id, title, user_email")
          .eq("id", submissionId)
          .single();

        if (findErr || !submission) {
          await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID,
            `❌ Submission \`${submissionId}\` not found.`);
          continue;
        }

        await deliverResult(TELEGRAM_BOT_TOKEN, supabase, supabaseUrl, supabaseServiceKey, message, submission);
        totalProcessed++;
        continue;
      }

      // ── /flag email ──
      if (text.toLowerCase().startsWith("/flag ")) {
        const targetEmail = text.replace(/^\/flag\s+/i, "").trim().toLowerCase();
        if (!targetEmail || !targetEmail.includes("@")) {
          await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, "❌ Usage: `/flag user@gmail.com`");
          continue;
        }
        // Find user by email
        const { data: flagUser } = await supabase.rpc("add_credits_by_email", { p_email: targetEmail, p_credits: 0 });
        // Now flag them
        const { error: flagErr } = await supabase
          .from("user_credits")
          .update({ is_flagged: true })
          .eq("user_id", (await supabase.from("user_credits").select("user_id").limit(100)).data?.find(async () => true)?.user_id || "");
        
        // Better approach: use a direct SQL-based update via a dedicated query
        const { error: flagErr2 } = await supabase.rpc("flag_user_by_email", { p_email: targetEmail, p_flagged: true });
        if (flagErr2) {
          await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, `❌ Failed to flag: ${flagErr2.message}`);
        } else {
          await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, `🚩 *Flagged!* \`${targetEmail}\`\nThey'll see a suspicious activity warning and must buy credits to continue.`);
        }
        continue;
      }

      // ── /unflag email ──
      if (text.toLowerCase().startsWith("/unflag ")) {
        const targetEmail = text.replace(/^\/unflag\s+/i, "").trim().toLowerCase();
        if (!targetEmail || !targetEmail.includes("@")) {
          await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, "❌ Usage: `/unflag user@gmail.com`");
          continue;
        }
        const { error: unflagErr } = await supabase.rpc("flag_user_by_email", { p_email: targetEmail, p_flagged: false });
        if (unflagErr) {
          await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, `❌ Failed to unflag: ${unflagErr.message}`);
        } else {
          await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, `✅ *Unflagged!* \`${targetEmail}\` can now use free credits again.`);
        }
        continue;
      }

      // ── /help or /start ──
      if (text.toLowerCase() === "/help" || text.toLowerCase() === "/start") {
        await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID,
          `🤖 *AntiGeneric Bot*\n\n` +
          `📸 *Send Result (Easy):*\nJust *reply* to a submission notification with the result photo!\n\n` +
          `📸 *Send Result (Manual):*\nSend photo with caption: \`/result <id>\`\n\n` +
          `🚩 *Flag User:* \`/flag email@gmail.com\`\n` +
          `✅ *Unflag User:* \`/unflag email@gmail.com\`\n\n` +
          `📋 *List Pending:* /pending`);
      }

      // ── /pending ──
      if (text.toLowerCase() === "/pending") {
        const { data: pending } = await supabase
          .from("thumbnail_submissions")
          .select("id, title, user_email, created_at")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(10);

        if (!pending || pending.length === 0) {
          await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, "✨ No pending submissions!");
        } else {
          let msg = `📋 *Pending (${pending.length}):*\n\n`;
          for (const s of pending) {
            msg += `• *${s.title}*\n  📧 ${s.user_email || "Anon"}\n  🆔 \`${s.id}\`\n\n`;
          }
          msg += `_Reply to the original notification with the result photo!_`;
          await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, msg);
        }
      }
    }

    const newOffset = Math.max(...updates.map((u: any) => u.update_id)) + 1;
    await supabase
      .from("telegram_bot_state")
      .update({ update_offset: newOffset, updated_at: new Date().toISOString() })
      .eq("id", 1);
    currentOffset = newOffset;
  }

  return new Response(JSON.stringify({ ok: true, processed: totalProcessed }));
});

async function deliverResult(
  botToken: string,
  supabase: any,
  supabaseUrl: string,
  supabaseServiceKey: string,
  message: any,
  submission: { id: string; title: string; user_email: string | null },
) {
  const photo = message.photo[message.photo.length - 1];
  const fileId = photo.file_id;

  try {
    // Get file path
    const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_id: fileId }),
    });
    const fileData = await fileRes.json();
    if (!fileData.ok) throw new Error("Failed to get file info");

    const filePath = fileData.result.file_path;

    // Download file
    const downloadRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
    if (!downloadRes.ok) throw new Error("Failed to download file");

    const fileBytes = await downloadRes.arrayBuffer();
    const ext = filePath.split(".").pop() || "jpg";
    const storagePath = `results/${submission.id}.${ext}`;

    // Upload to storage
    const { error: uploadErr } = await supabase.storage
      .from("thumbnail-uploads")
      .upload(storagePath, fileBytes, {
        contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
        upsert: true,
      });
    if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("thumbnail-uploads")
      .getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    // Update submission
    const { error: updateErr } = await supabase
      .from("thumbnail_submissions")
      .update({ result_image_url: publicUrl, status: "completed" })
      .eq("id", submission.id);
    if (updateErr) throw new Error(`Update failed: ${updateErr.message}`);

    // Send email notification
    if (submission.user_email) {
      try {
        const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            templateName: "result-ready",
            recipientEmail: submission.user_email,
            templateData: { title: submission.title, resultImageUrl: publicUrl },
          }),
        });
        await emailRes.text();
      } catch (e) {
        console.error("Email failed:", e);
      }
    }

    await sendTelegramMessage(botToken, TELEGRAM_CHAT_ID,
      `✅ *Result delivered!*\n\n📝 *Title:* ${submission.title}\n📧 *User:* ${submission.user_email || "Unknown"}\n\n🔔 User will get popup + email automatically.`);
  } catch (err) {
    await sendTelegramMessage(botToken, TELEGRAM_CHAT_ID,
      `❌ *Failed:* ${err.message}\nID: \`${submission.id}\``);
  }
}

async function sendTelegramMessage(token: string, chatId: string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
  if (!res.ok) {
    console.error("Telegram send failed:", res.status, await res.text());
  } else {
    await res.text();
  }
}
