import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { submissionId } = await req.json();
    if (!submissionId) {
      return new Response(JSON.stringify({ error: "submissionId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!YOUTUBE_API_KEY) throw new Error("YOUTUBE_API_KEY not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get submission
    const { data: submission, error: subErr } = await supabase
      .from("thumbnail_submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (subErr || !submission) {
      return new Response(JSON.stringify({ error: "Submission not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updateStage = async (stage: string) => {
      await supabase
        .from("thumbnail_submissions")
        .update({ pipeline_stage: stage })
        .eq("id", submissionId);
    };

    // ── STAGE 1: Search YouTube ──
    await updateStage("searching_youtube");

    const searchUrl = new URL(YOUTUBE_API_URL);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", submission.title);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoDuration", "medium"); // filters out shorts
    searchUrl.searchParams.set("maxResults", "30");
    searchUrl.searchParams.set("order", "relevance");
    searchUrl.searchParams.set("key", YOUTUBE_API_KEY);

    const ytRes = await fetch(searchUrl.toString());
    if (!ytRes.ok) {
      const errText = await ytRes.text();
      console.error("YouTube API error:", errText);
      throw new Error(`YouTube API failed: ${ytRes.status}`);
    }
    const ytData = await ytRes.json();
    const videos = ytData.items || [];

    if (videos.length === 0) {
      await updateStage("error_no_videos");
      throw new Error("No videos found for this title");
    }

    // Collect thumbnail URLs (use high quality)
    const thumbnails = videos.map((v: any, i: number) => ({
      index: i,
      videoId: v.id.videoId,
      title: v.snippet.title,
      thumbnailUrl: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url,
    })).filter((t: any) => t.thumbnailUrl);

    // ── STAGE 2: AI selects best thumbnail ──
    await updateStage("selecting_thumbnail");

    const selectionPrompt = `You are a YouTube thumbnail expert. I'm making a thumbnail for a video titled: "${submission.title}"

Here are ${thumbnails.length} thumbnails from top YouTube videos on this topic. Pick the ONE best thumbnail that has:
- Premium SaaS/app UI style, 3D elements, or modern glow effects
- High visual impact and professional design
- Best match for the title "${submission.title}"

Thumbnails:
${thumbnails.map((t: any) => `[${t.index}] "${t.title}" - ${t.thumbnailUrl}`).join("\n")}

Reply with ONLY the index number (e.g., "5") of the best thumbnail. Nothing else.`;

    const selectionRes = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: selectionPrompt }],
      }),
    });

    if (!selectionRes.ok) {
      const errText = await selectionRes.text();
      console.error("AI selection error:", errText);
      throw new Error(`AI selection failed: ${selectionRes.status}`);
    }

    const selectionData = await selectionRes.json();
    const selectedIndexStr = selectionData.choices?.[0]?.message?.content?.trim() || "0";
    const selectedIndex = parseInt(selectedIndexStr.replace(/\D/g, "")) || 0;
    const selectedThumbnail = thumbnails[Math.min(selectedIndex, thumbnails.length - 1)];

    console.log(`Selected thumbnail [${selectedIndex}]: ${selectedThumbnail.title}`);

    // Download the selected thumbnail
    const thumbRes = await fetch(selectedThumbnail.thumbnailUrl);
    if (!thumbRes.ok) throw new Error("Failed to download selected thumbnail");
    const thumbArrayBuf = await thumbRes.arrayBuffer();
    const thumbBase64 = btoa(String.fromCharCode(...new Uint8Array(thumbArrayBuf)));
    const thumbDataUrl = `data:image/jpeg;base64,${thumbBase64}`;

    // ── STAGE 3: AI face/element swap ──
    await updateStage("swapping_face");

    // Build the editing prompt based on what the user uploaded
    let editPrompt = "";
    const editImages: { type: string; image_url: { url: string } }[] = [];

    // Always include the selected thumbnail as base
    editImages.push({
      type: "image_url",
      image_url: { url: thumbDataUrl },
    });

    if (submission.face_image_url && submission.thumbnail_image_url) {
      // Both face and element uploaded
      editPrompt = `I have a YouTube thumbnail (first image). Replace the main person's face in the thumbnail with the face from the second image, keeping the same pose and expression style but using this new face. Also replace the main product/element/object in the thumbnail with the element from the third image. Make it look natural and professional for a video titled "${submission.title}". Keep the same style, colors, and composition of the original thumbnail.`;
      editImages.push({
        type: "image_url",
        image_url: { url: submission.face_image_url },
      });
      editImages.push({
        type: "image_url",
        image_url: { url: submission.thumbnail_image_url },
      });
    } else if (submission.face_image_url) {
      // Only face uploaded
      editPrompt = `I have a YouTube thumbnail (first image). Replace the main person's face in the thumbnail with the face from the second image. Keep the same pose, expression style, lighting, and composition but swap in this new face naturally. Make it look professional for a video titled "${submission.title}".`;
      editImages.push({
        type: "image_url",
        image_url: { url: submission.face_image_url },
      });
    } else if (submission.thumbnail_image_url) {
      // Only element uploaded
      editPrompt = `I have a YouTube thumbnail (first image). Replace the main product/element/object in the thumbnail with the element from the second image. Make it look natural and professional, maintaining the same style and composition. This is for a video titled "${submission.title}".`;
      editImages.push({
        type: "image_url",
        image_url: { url: submission.thumbnail_image_url },
      });
    } else {
      // No uploads - just enhance the selected thumbnail
      editPrompt = `Enhance this YouTube thumbnail to make it more eye-catching and professional for a video titled "${submission.title}". Add subtle glow effects, improve contrast, and make it more premium looking. Keep the same composition and subject.`;
    }

    await updateStage("generating_result");

    const editRes = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: editPrompt },
            ...editImages,
          ],
        }],
        modalities: ["image", "text"],
      }),
    });

    if (!editRes.ok) {
      const errText = await editRes.text();
      console.error("AI edit error:", errText);
      throw new Error(`AI image editing failed: ${editRes.status}`);
    }

    const editData = await editRes.json();
    const generatedImageUrl = editData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      console.error("No image in AI response:", JSON.stringify(editData).substring(0, 500));
      throw new Error("AI did not return an image");
    }

    // ── STAGE 4: Upload result ──
    await updateStage("uploading_result");

    // Convert base64 data URL to bytes
    const base64Data = generatedImageUrl.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const storagePath = `results/${submissionId}.png`;

    const { error: uploadErr } = await supabase.storage
      .from("thumbnail-uploads")
      .upload(storagePath, imageBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

    const { data: urlData } = supabase.storage
      .from("thumbnail-uploads")
      .getPublicUrl(storagePath);

    // ── STAGE 5: Complete ──
    const { error: updateErr } = await supabase
      .from("thumbnail_submissions")
      .update({
        result_image_url: urlData.publicUrl,
        status: "completed",
        pipeline_stage: "complete",
      })
      .eq("id", submissionId);

    if (updateErr) throw new Error(`Update failed: ${updateErr.message}`);

    // Send email notification
    if (submission.user_email) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            templateName: "result-ready",
            recipientEmail: submission.user_email,
            templateData: {
              title: submission.title,
              resultImageUrl: urlData.publicUrl,
            },
          }),
        });
      } catch (e) {
        console.error("Email notification failed:", e);
      }
    }

    // Notify via Telegram
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (TELEGRAM_BOT_TOKEN) {
      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: "6602989961",
            text: `🤖 *Auto-Generated!*\n\n📝 *Title:* ${submission.title}\n📧 *User:* ${submission.user_email || "Unknown"}\n🎯 *Source:* ${selectedThumbnail.title}\n\n✅ Result delivered automatically.`,
            parse_mode: "Markdown",
          }),
        });
      } catch (e) {
        console.error("Telegram notification failed:", e);
      }
    }

    return new Response(JSON.stringify({ ok: true, resultUrl: urlData.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Pipeline error:", err);
    
    // Try to update the submission with error stage
    try {
      const { submissionId } = await req.clone().json().catch(() => ({}));
      if (submissionId) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        await supabase
          .from("thumbnail_submissions")
          .update({ pipeline_stage: `error: ${(err as Error).message}` })
          .eq("id", submissionId);
      }
    } catch {}

    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
