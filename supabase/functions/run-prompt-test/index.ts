
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestRequest {
  promptId: string;
  testInput: string;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
}

const OPENROUTER_MODELS = {
  // Gemini models via OpenRouter
  'google/gemini-flash-1.5': {
    costPer1kTokens: 0.00015
  },
  'google/gemini-pro-1.5': {
    costPer1kTokens: 0.0035
  },
  // OpenAI models via OpenRouter
  'openai/gpt-4-turbo': {
    costPer1kTokens: 0.01
  },
  'openai/o1-preview': {
    costPer1kTokens: 0.015
  },
  'openai/gpt-4o-mini': {
    costPer1kTokens: 0.0015
  },
  'openai/gpt-4.1-2025-04-14': {
    costPer1kTokens: 0.01
  },
  'openai/o3-2025-04-16': {
    costPer1kTokens: 0.02
  },
  'openai/o4-mini-2025-04-16': {
    costPer1kTokens: 0.002
  },
  // Claude models
  'anthropic/claude-3.5-sonnet': {
    costPer1kTokens: 0.003
  },
  'anthropic/claude-3-opus': {
    costPer1kTokens: 0.015
  },
  'anthropic/claude-3-haiku': {
    costPer1kTokens: 0.00025
  },
  'anthropic/claude-opus-4-20250514': {
    costPer1kTokens: 0.02
  },
  'anthropic/claude-sonnet-4-20250514': {
    costPer1kTokens: 0.01
  },
  'anthropic/claude-3-5-haiku-20241022': {
    costPer1kTokens: 0.0003
  }
};

const isValidModel = (modelName: string): boolean => {
  return modelName in OPENROUTER_MODELS;
};

const callOpenRouterAPI = async (modelName: string, fullPrompt: string, temperature: number, maxTokens: number) => {
  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const modelConfig = OPENROUTER_MODELS[modelName as keyof typeof OPENROUTER_MODELS];
  if (!modelConfig) {
    throw new Error(`Unsupported model: ${modelName}`);
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://cawtawfdvoghtskkjdr.supabase.co',
      'X-Title': 'Context Engineering Platform'
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: 'user',
          content: fullPrompt
        }
      ],
      temperature: temperature,
      max_tokens: maxTokens,
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenRouter API error: ${errorData}`);
  }

  const data = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from OpenRouter API');
  }

  return {
    text: data.choices[0].message.content,
    costPer1kTokens: modelConfig.costPer1kTokens
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Starting prompt test request`);
  
  // Helper function to return standardized error responses with 200 status
  const createErrorResponse = (errorMessage: string, errorType: string = 'unknown') => {
    console.error(`[${requestId}] ${errorType} error:`, errorMessage);
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage,
      errorType,
      requestId
    }), {
      status: 200, // Always return 200 to prevent "non-2xx status code" errors
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  };

  try {
    // Validate environment variables first
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return createErrorResponse('Supabase environment variables not configured properly', 'configuration');
    }

    if (!openRouterApiKey) {
      return createErrorResponse('OpenRouter API key not configured', 'configuration');
    }

    // Validate request body format
    let requestBody: TestRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return createErrorResponse('Invalid JSON request body', 'validation');
    }

    const { promptId, testInput, modelName, temperature = 0.7, maxTokens = 1000 } = requestBody;
    
    console.log(`[${requestId}] Test request received:`, { promptId, modelName, temperature, maxTokens, inputLength: testInput?.length });
    
    // Validate required parameters
    if (!promptId || typeof promptId !== 'string') {
      return createErrorResponse('Missing or invalid promptId parameter', 'validation');
    }
    if (!testInput || typeof testInput !== 'string') {
      return createErrorResponse('Missing or invalid testInput parameter', 'validation');
    }
    if (!modelName || typeof modelName !== 'string') {
      return createErrorResponse('Missing or invalid modelName parameter', 'validation');
    }
    if (typeof temperature !== 'number' || temperature < 0 || temperature > 2) {
      return createErrorResponse('Invalid temperature parameter (must be number between 0 and 2)', 'validation');
    }
    if (typeof maxTokens !== 'number' || maxTokens < 1 || maxTokens > 4000) {
      return createErrorResponse('Invalid maxTokens parameter (must be number between 1 and 4000)', 'validation');
    }
    
    // Validate model
    if (!isValidModel(modelName)) {
      console.error(`[${requestId}] Invalid model requested:`, modelName);
      return createErrorResponse(`Unsupported model: ${modelName}. Supported models: ${Object.keys(OPENROUTER_MODELS).join(', ')}`, 'validation');
    }
    
    console.log(`[${requestId}] Model validation passed for:`, modelName);

    // Comprehensive authentication validation
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return createErrorResponse('No authorization header provided', 'authentication');
    }

    // Validate authorization header format
    if (!authHeader.startsWith('Bearer ')) {
      return createErrorResponse('Invalid authorization header format - must start with "Bearer "', 'authentication');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return createErrorResponse('Empty authorization token', 'authentication');
    }

    // Validate JWT token format
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return createErrorResponse('Invalid JWT token format - malformed token', 'authentication');
    }

    // Validate token payload
    let tokenPayload;
    try {
      tokenPayload = JSON.parse(atob(tokenParts[1]));
      console.log(`[${requestId}] Token payload decoded:`, {
        sub: tokenPayload.sub,
        exp: tokenPayload.exp,
        iat: tokenPayload.iat,
        role: tokenPayload.role
      });
    } catch (decodeError) {
      console.error(`[${requestId}] Failed to decode token payload:`, decodeError);
      return createErrorResponse('Invalid JWT token - cannot decode payload', 'authentication');
    }

    // Check token expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (!tokenPayload.exp) {
      return createErrorResponse('Invalid JWT token - missing expiration', 'authentication');
    }
    
    if (tokenPayload.exp < currentTime) {
      console.error(`[${requestId}] Token expired:`, {
        exp: tokenPayload.exp,
        currentTime,
        expiredSince: currentTime - tokenPayload.exp
      });
      return createErrorResponse('JWT token has expired - please refresh your session', 'authentication');
    }

    // Check if token is expiring soon (within 5 minutes)
    const fiveMinutesFromNow = currentTime + (5 * 60);
    if (tokenPayload.exp < fiveMinutesFromNow) {
      console.warn(`[${requestId}] Token expiring soon:`, {
        exp: tokenPayload.exp,
        currentTime,
        expiresInSeconds: tokenPayload.exp - currentTime
      });
    }

    // Check subject (user ID)
    if (!tokenPayload.sub) {
      return createErrorResponse('Invalid JWT token - missing user ID', 'authentication');
    }

    let supabaseClient, supabaseServiceClient;
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      });

      supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);
    } catch (clientError) {
      console.error(`[${requestId}] Failed to initialize Supabase clients:`, clientError);
      return createErrorResponse('Failed to initialize Supabase clients', 'configuration');
    }

    // Validate user authentication with enhanced error handling
    let user;
    try {
      console.log(`[${requestId}] Validating user authentication...`);
      const { data: { user: authenticatedUser }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError) {
        console.error(`[${requestId}] Supabase auth error:`, authError);
        
        // Provide specific error messages for different auth errors
        if (authError.message?.includes('Invalid JWT')) {
          return createErrorResponse('Invalid authentication token - please log in again', 'authentication');
        } else if (authError.message?.includes('expired')) {
          return createErrorResponse('Authentication token has expired - please refresh your session', 'authentication');
        } else if (authError.message?.includes('malformed')) {
          return createErrorResponse('Malformed authentication token - please log in again', 'authentication');
        } else {
          return createErrorResponse(`Authentication failed: ${authError.message}`, 'authentication');
        }
      }
      
      if (!authenticatedUser) {
        return createErrorResponse('User not authenticated - token validation failed', 'authentication');
      }

      // Cross-validate user ID from token payload with authenticated user
      if (authenticatedUser.id !== tokenPayload.sub) {
        console.error(`[${requestId}] User ID mismatch:`, {
          tokenSub: tokenPayload.sub,
          authenticatedUserId: authenticatedUser.id
        });
        return createErrorResponse('Authentication token mismatch - please log in again', 'authentication');
      }
      
      user = authenticatedUser;
      console.log(`[${requestId}] Authentication validated successfully for user:`, user.id);
    } catch (authError) {
      console.error(`[${requestId}] Authentication validation error:`, authError);
      return createErrorResponse('Authentication service unavailable - please try again', 'authentication');
    }

    // Get current prompt version
    console.log(`[${requestId}] Fetching current prompt version for promptId:`, promptId);
    let currentVersion;
    try {
      const { data: promptVersion, error: promptError } = await supabaseServiceClient
        .rpc('get_current_prompt_version', { p_prompt_id: promptId });
      
      console.log(`[${requestId}] Prompt version query result:`, { promptVersion, promptError });
      
      if (promptError) {
        console.error(`[${requestId}] Error fetching prompt version:`, promptError);
        return createErrorResponse(`Database error: ${promptError.message}`, 'database');
      }
      
      if (!promptVersion || promptVersion.length === 0) {
        console.error(`[${requestId}] No current prompt version found for promptId:`, promptId);
        return createErrorResponse(`No current version found for prompt ${promptId}. Please ensure the prompt exists and has a current version.`, 'database');
      }

      currentVersion = promptVersion[0];
      console.log(`[${requestId}] Using prompt version:`, currentVersion.version_number);
    } catch (dbError) {
      return createErrorResponse('Database service unavailable', 'database');
    }
    
    // Construct the full prompt
    const fullPrompt = `${currentVersion.content}\n\nUser Input: ${testInput}`;
    
    const startTime = Date.now();
    
    // Call OpenRouter API with comprehensive error handling
    console.log(`[${requestId}] Calling OpenRouter API with model:`, modelName);
    let result;
    try {
      result = await callOpenRouterAPI(modelName, fullPrompt, temperature, maxTokens);
    } catch (apiError) {
      console.error(`[${requestId}] OpenRouter API error:`, apiError);
      return createErrorResponse(`AI model service error: ${apiError.message}`, 'api');
    }

    const responseTime = Date.now() - startTime;
    const outputText = result.text;
    
    if (!outputText || typeof outputText !== 'string') {
      return createErrorResponse('Invalid response from AI model service', 'api');
    }
    
    console.log(`[${requestId}] API response received, length:`, outputText.length);
    
    // Estimate tokens and cost
    const promptTokens = Math.ceil(fullPrompt.length / 4);
    const completionTokens = Math.ceil(outputText.length / 4);
    const totalTokens = promptTokens + completionTokens;
    const costEstimate = (totalTokens / 1000) * result.costPer1kTokens;

    console.log(`[${requestId}] Storing test result for user:`, user.id);

    // Store test result with error handling
    try {
      const { error: insertError } = await supabaseServiceClient
        .from('test_results')
        .insert({
          prompt_id: promptId,
          prompt_version_id: currentVersion.version_id,
          user_id: user.id,
          input_data: testInput,
          output_data: outputText,
          model_name: modelName,
          model_version: 'via-openrouter',
          temperature: temperature,
          max_tokens: maxTokens,
          response_time_ms: responseTime,
          cost_estimate: costEstimate,
          tokens_used: {
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: totalTokens
          },
          parameters: {
            temperature,
            maxTokens,
            model: modelName
          },
          status: 'completed'
        });

      if (insertError) {
        console.error(`[${requestId}] Error storing test result:`, insertError);
        return createErrorResponse(`Failed to store test result: ${insertError.message}`, 'database');
      }
    } catch (insertError) {
      return createErrorResponse('Database storage service unavailable', 'database');
    }

    console.log(`[${requestId}] Test completed successfully`);

    return new Response(JSON.stringify({
      success: true,
      output: outputText,
      metadata: {
        responseTime,
        tokensUsed: totalTokens,
        costEstimate,
        model: modelName,
        version: currentVersion.version_number
      },
      requestId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (unexpectedError) {
    // Final safety net for any unhandled errors
    console.error(`[${requestId}] Unexpected error in run-prompt-test function:`, unexpectedError);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'An unexpected error occurred. Please try again.',
      errorType: 'unexpected',
      requestId
    }), {
      status: 200, // Still return 200 to prevent client-side "non-2xx" errors
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
