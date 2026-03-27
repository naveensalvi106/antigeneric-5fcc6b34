import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TELEGRAM_CHAT_ID = '6602989961';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, thumbnailImageUrl, faceImageUrl, submissionId, userEmail } = await req.json();

    // --- Discord Notification ---
    const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL');
    if (DISCORD_WEBHOOK_URL) {
      const fields = [
        { name: "📝 Title", value: title || "Not provided", inline: true },
        { name: "📧 Email", value: userEmail || "Anonymous", inline: true },
        { name: "🆔 Submission ID", value: submissionId || "N/A", inline: false },
        { name: "📄 Description", value: description || "Not provided", inline: false },
      ];
      if (thumbnailImageUrl) {
        fields.push({ name: "🖼️ Reference Image", value: `[View Image](${thumbnailImageUrl})`, inline: true });
      }
      if (faceImageUrl) {
        fields.push({ name: "🧑 Face Image", value: `[View Image](${faceImageUrl})`, inline: true });
      }
      const embed = {
        title: "🎨 New Thumbnail Request!",
        color: 0x00ff88,
        fields,
        timestamp: new Date().toISOString(),
        footer: { text: "AntiGeneric AI" },
      };
      const discordRes = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
      });
      if (!discordRes.ok) {
        console.error('Discord webhook failed:', discordRes.status, await discordRes.text());
      }
    } else {
      console.warn('DISCORD_WEBHOOK_URL not configured');
    }

    // --- Telegram Notification ---
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (TELEGRAM_BOT_TOKEN) {
      let message = `🎨 *New Thumbnail Request!*\n\n`;
      message += `📝 *Title:* ${title || 'Not provided'}\n`;
      message += `📧 *Email:* ${userEmail || 'Anonymous'}\n`;
      message += `🆔 *ID:* \`${submissionId || 'N/A'}\`\n`;
      message += `📄 *Description:* ${description || 'Not provided'}\n`;
      if (thumbnailImageUrl) {
        message += `🖼️ [View Reference Image](${thumbnailImageUrl})\n`;
      }
      if (faceImageUrl) {
        message += `🧑 [View Face Image](${faceImageUrl})\n`;
      }

      const telegramRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: false,
        }),
      });
      if (!telegramRes.ok) {
        console.error('Telegram send failed:', telegramRes.status, await telegramRes.text());
      }
    } else {
      console.warn('TELEGRAM_BOT_TOKEN not configured');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Submission recorded and notification sent.', submissionId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing submission:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
