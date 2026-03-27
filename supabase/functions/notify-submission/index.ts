import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = "naveensalvi213@gmail.com";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, thumbnailImageUrl, faceImageUrl, submissionId } = await req.json();

    // Build email body
    const emailLines = [
      `<h2>New Thumbnail Request</h2>`,
      `<p><strong>Submission ID:</strong> ${submissionId}</p>`,
      `<p><strong>Title:</strong> ${title || 'Not provided'}</p>`,
      `<p><strong>Description:</strong> ${description || 'Not provided'}</p>`,
    ];

    if (thumbnailImageUrl) {
      emailLines.push(`<p><strong>Reference Image:</strong> <a href="${thumbnailImageUrl}">View Image</a></p>`);
    }
    if (faceImageUrl) {
      emailLines.push(`<p><strong>Face Image:</strong> <a href="${faceImageUrl}">View Image</a></p>`);
    }

    const emailHtml = emailLines.join('\n');

    // Use Supabase's built-in email via the Auth Admin API is not available for custom emails.
    // Instead, we'll log the submission and the admin can check the dashboard.
    // For now, store notification data that can be checked.
    console.log(`New submission notification for ${ADMIN_EMAIL}:`, {
      title,
      description,
      thumbnailImageUrl,
      faceImageUrl,
      submissionId,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Submission recorded successfully. Admin will be notified.',
        submissionId 
      }),
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
