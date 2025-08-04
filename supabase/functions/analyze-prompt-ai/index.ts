import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Starting simple AI analysis request`);
  
  try {
    // Get API key
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      console.error(`[${requestId}] OpenRouter API key not configured`);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'OpenRouter API key not configured'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Basic auth check
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error(`[${requestId}] Missing or invalid authorization header`);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Authentication required'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error(`[${requestId}] Invalid JSON:`, parseError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid JSON request body'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { content, mode = 'analyze' } = body;
    console.log(`[${requestId}] Request parsed:`, { mode, contentLength: content?.length });
    
    if (!content || typeof content !== 'string') {
      console.error(`[${requestId}] Missing or invalid content parameter`);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing or invalid content parameter'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Simple AI analysis with OpenRouter
    console.log(`[${requestId}] Calling OpenRouter API for AI analysis`);
    
    const systemPrompt = `You are a prompt engineering expert. Analyze the following prompt and identify which prompt engineering techniques are being used. For each technique, provide a confidence score (0-100) and explain why.

Available techniques to analyze:
- clarity: Clear, specific instructions
- context: Adequate background information
- examples: Includes examples of desired output
- structure: Well-organized with logical flow
- specificity: Specific rather than vague requests
- constraints: Clear boundaries and limitations
- persona: Defines a role or persona for the AI
- format: Specifies output format
- tone: Defines desired tone or style
- step_by_step: Breaks down complex tasks
- reasoning: Asks for explanations of thinking
- error_handling: Includes error handling instructions

Respond with valid JSON in this exact format:
{
  "techniques": [
    {
      "name": "technique_name",
      "score": 85,
      "explanation": "Detailed explanation of why this technique is present and how well it's implemented",
      "suggestions": ["Specific suggestion 1", "Specific suggestion 2"]
    }
  ],
  "overall_score": 78,
  "summary": "Brief summary of the prompt's strengths and weaknesses"
}`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://cawtawfdvoghtskkjdr.supabase.co',
          'X-Title': 'Context Engineering Platform'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: content }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${requestId}] OpenRouter API error:`, errorText);
        throw new Error(`OpenRouter API error: ${errorText}`);
      }

      const data = await response.json();
      console.log(`[${requestId}] OpenRouter response received successfully`);

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from AI model');
      }

      const rawContent = data.choices[0].message.content;

      // Parse the JSON response
      let analysisResult;
      try {
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          analysisResult = JSON.parse(rawContent);
        }
      } catch (parseError) {
        console.error(`[${requestId}] Failed to parse JSON response:`, parseError);
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }

      // Validate the structure
      if (!analysisResult.techniques || !Array.isArray(analysisResult.techniques)) {
        throw new Error('Invalid analysis structure: missing or invalid techniques array');
      }

      // Transform to expected format
      const aiResult = {
        techniques: analysisResult.techniques.map(tech => ({
          name: tech.name,
          present: tech.score > 30,
          score: tech.score,
          explanation: tech.explanation,
          suggestions: tech.suggestions || []
        })),
        overall_score: analysisResult.overall_score,
        summary: analysisResult.summary,
        analysis_type: 'ai',
        language: 'auto-detected'
      };

      console.log(`[${requestId}] Analysis completed successfully`);

      return new Response(JSON.stringify({
        success: true,
        analysis: aiResult,
        requestId
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (apiError) {
      console.error(`[${requestId}] OpenRouter API error:`, apiError);
      
      return new Response(JSON.stringify({
        success: false,
        error: `AI analysis failed: ${apiError.message}`,
        requestId
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (unexpectedError) {
    console.error(`[${requestId}] Unexpected error:`, unexpectedError);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Unexpected error occurred',
      requestId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
