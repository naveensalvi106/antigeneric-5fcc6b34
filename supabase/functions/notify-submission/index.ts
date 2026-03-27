import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, thumbnailImageUrl, faceImageUrl, submissionId, userEmail } = await req.json();

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
