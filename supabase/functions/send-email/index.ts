
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailTemplate {
  template: 'review-invitation' | 'welcome' | 'notification' | 'comment-notification' | 'edit-notification';
  to: string;
  data: Record<string, any>;
}

const generateEmailContent = (template: string, data: Record<string, any>) => {
  switch (template) {
    case 'review-invitation':
      return {
        subject: `Review Request: ${data.promptTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Review Request</h2>
            
            <p>Hi there,</p>
            
            <p><strong>${data.inviterName}</strong> has invited you to review a prompt:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #555;">${data.promptTitle}</h3>
              <p style="color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
                ${data.promptContent.substring(0, 200)}${data.promptContent.length > 200 ? '...' : ''}
              </p>
            </div>
            
            ${data.message ? `
            <div style="background-color: #e8f4f8; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #1976D2;">Personal Message:</h4>
              <p style="margin-bottom: 0; font-style: italic;">"${data.message}"</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.reviewUrl}" 
                 style="background-color: #2196F3; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Review This Prompt
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This invitation will expire in 7 days. If you have any questions, please contact ${data.inviterName}.
            </p>
          </div>
        `
      };

    case 'comment-notification':
      return {
        subject: `New Comment on "${data.promptTitle}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">New Comment Added</h2>
            
            <p>Hi there,</p>
            
            <p><strong>${data.commenterName}</strong> has added a new comment to the prompt you're reviewing:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #555;">${data.promptTitle}</h3>
            </div>
            
            <div style="background-color: #e8f4f8; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #1976D2;">New Comment:</h4>
              <p style="margin-bottom: 0; font-style: italic;">"${data.commentContent.substring(0, 300)}${data.commentContent.length > 300 ? '...' : ''}"</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.promptUrl}" 
                 style="background-color: #2196F3; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Comment & Respond
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              You're receiving this because you're reviewing this prompt. You can reply to continue the conversation.
            </p>
          </div>
        `
      };

    case 'edit-notification':
      return {
        subject: `"${data.promptTitle}" has been updated`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Prompt Updated</h2>
            
            <p>Hi there,</p>
            
            <p><strong>${data.editorName}</strong> has made changes to the prompt you're reviewing:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #555;">${data.promptTitle}</h3>
              <p style="color: #666; font-size: 14px; margin-bottom: 0;">
                <strong>Change:</strong> ${data.changeType}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.promptUrl}" 
                 style="background-color: #2196F3; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Updated Prompt
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              You're receiving this because you're reviewing this prompt. Check out the latest changes and provide feedback.
            </p>
          </div>
        `
      };
    
    case 'welcome':
      return {
        subject: 'Welcome to the Platform!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Welcome!</h2>
            <p>Thank you for joining our platform. We're excited to have you on board!</p>
            <p>Get started by creating your first prompt or exploring existing ones.</p>
          </div>
        `
      };
    
    case 'notification':
      return {
        subject: data.subject || 'Notification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Notification</h2>
            <p>${data.message || 'You have a new notification.'}</p>
          </div>
        `
      };
    
    default:
      return {
        subject: 'Message',
        html: `<p>${data.message || 'You have received a message.'}</p>`
      };
  }
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailData: EmailTemplate = await req.json();
    console.log('Received email data:', emailData);

    // Validate required fields
    if (!emailData.template || !emailData.to || !emailData.data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: template, to, or data' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate email content based on template
    const { subject, html } = generateEmailContent(emailData.template, emailData.data);

    // Send email using Resend
    const apiKey = Deno.env.get('RESEND_API_KEY') || 're_QxAQwfFR_EyDK8Mc5K3jFRcAjtUWpBR6f';
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Prompt Reviews <noreply@cascadeaipartners.com>',
        to: emailData.to,
        subject: subject,
        html: html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return new Response(
        JSON.stringify({ error: `Email service error: ${error}` }), 
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, data: result }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
