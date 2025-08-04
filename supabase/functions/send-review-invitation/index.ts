
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReviewInvitationRequest {
  to: string;
  promptTitle: string;
  promptContent: string;
  inviterName: string;
  message?: string;
  invitationToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      to, 
      promptTitle, 
      promptContent, 
      inviterName, 
      message, 
      invitationToken 
    }: ReviewInvitationRequest = await req.json();

    const reviewUrl = `${req.headers.get('origin') || 'https://your-app.com'}/review/${invitationToken}`;
    
    const emailResponse = await resend.emails.send({
      from: "Prompt Library <onboarding@resend.dev>",
      to: [to],
      subject: `Review Request: "${promptTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #1f2937; margin-bottom: 20px;">🔍 Review Request</h1>
            
            <p style="color: #374151; margin-bottom: 20px;">
              Hi there! <strong>${inviterName}</strong> has invited you to review a prompt.
            </p>
            
            ${message ? `
              <div style="background: #e5e7eb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="color: #374151; margin: 0; font-style: italic;">"${message}"</p>
              </div>
            ` : ''}
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
              <h3 style="color: #1f2937; margin: 0 0 10px 0;">${promptTitle}</h3>
              <p style="color: #6b7280; margin: 0; line-height: 1.5;">
                ${promptContent.substring(0, 200)}${promptContent.length > 200 ? '...' : ''}
              </p>
            </div>
            
            <div style="text-align: center; margin-bottom: 25px;">
              <a href="${reviewUrl}" 
                 style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; font-weight: 500;">
                Start Review
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 14px; color: #6b7280;">
              <p>This invitation will expire in 7 days. If you don't have an account, you'll be able to sign up quickly during the review process.</p>
              <p style="margin-top: 15px;">
                <strong>Prompt Library</strong> - Collaborative prompt management
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending review invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
