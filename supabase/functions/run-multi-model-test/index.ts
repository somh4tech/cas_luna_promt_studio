import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MultiTestRequest {
  promptId: string;
  testInput: string;
  modelNames: string[];
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create authenticated client for user validation
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      throw new Error('Authentication required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Create service role client for database operations
    const supabaseServiceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { promptId, testInput, modelNames, temperature = 0.7, maxTokens = 1000 }: MultiTestRequest = await req.json();
    
    console.log('Multi-model test request received:', { promptId, modelNames, temperature, maxTokens });
    
    // Validate models
    for (const modelName of modelNames) {
      if (!isValidModel(modelName)) {
        throw new Error(`Unsupported model: ${modelName}`);
      }
    }

    // Validate user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated');
    }

    console.log('Authenticated user:', user.id);

    // Get current prompt version with service role client
    console.log('Fetching current prompt version for promptId:', promptId);
    const { data: promptVersion, error: promptError } = await supabaseServiceClient
      .rpc('get_current_prompt_version', { p_prompt_id: promptId });
    
    console.log('Prompt version query result:', { promptVersion, promptError });
    
    if (promptError) {
      console.error('Error fetching prompt version:', promptError);
      throw new Error(`Database error: ${promptError.message}`);
    }
    
    if (!promptVersion || promptVersion.length === 0) {
      console.error('No current prompt version found for promptId:', promptId);
      throw new Error(`No current version found for prompt ${promptId}. Please ensure the prompt exists and has a current version.`);
    }

    const currentVersion = promptVersion[0];
    console.log('Using prompt version:', currentVersion.version_number);
    
    // Construct the full prompt
    const fullPrompt = `${currentVersion.content}\n\nUser Input: ${testInput}`;
    
    // Generate a batch ID for grouping results
    const batchId = crypto.randomUUID();
    
    // Run tests for all models in parallel
    const testPromises = modelNames.map(async (modelName) => {
      const startTime = Date.now();
      
      try {
        console.log(`Calling OpenRouter API for model: ${modelName}`);
        
        const result = await callOpenRouterAPI(modelName, fullPrompt, temperature, maxTokens);

        const responseTime = Date.now() - startTime;
        const outputText = result.text;
        
        // Estimate tokens and cost
        const promptTokens = Math.ceil(fullPrompt.length / 4);
        const completionTokens = Math.ceil(outputText.length / 4);
        const totalTokens = promptTokens + completionTokens;
        const costEstimate = (totalTokens / 1000) * result.costPer1kTokens;

        console.log(`Test completed for model ${modelName}, storing result`);

        // Store test result using service role client
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
            status: 'completed',
            batch_id: batchId
          });

        if (insertError) {
          console.error(`Error storing test result for ${modelName}:`, insertError);
          throw new Error(`Failed to store test result for ${modelName}: ${insertError.message}`);
        }

        return {
          modelName,
          success: true,
          outputText,
          responseTime,
          costEstimate,
          tokensUsed: totalTokens
        };
      } catch (error) {
        console.error(`Error testing model ${modelName}:`, error);
        
        // Store error result
        const responseTime = Date.now() - startTime;
        await supabaseServiceClient
          .from('test_results')
          .insert({
            prompt_id: promptId,
            prompt_version_id: currentVersion.version_id,
            user_id: user.id,
            input_data: testInput,
            model_name: modelName,
            model_version: 'via-openrouter',
            temperature: temperature,
            max_tokens: maxTokens,
            response_time_ms: responseTime,
            error_message: error.message,
            status: 'failed',
            batch_id: batchId
          });

        return {
          modelName,
          success: false,
          error: error.message,
          responseTime
        };
      }
    });

    const results = await Promise.all(testPromises);
    console.log('All tests completed, results:', results);

    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);

    return new Response(JSON.stringify({
      success: true,
      batchId,
      totalTests: results.length,
      successfulTests: successfulResults.length,
      failedTests: failedResults.length,
      results: successfulResults,
      errors: failedResults.map(r => ({ model: r.modelName, error: r.error })),
      metadata: {
        totalCost: successfulResults.reduce((sum, r) => sum + r.costEstimate, 0),
        averageResponseTime: successfulResults.length > 0 
          ? successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length 
          : 0,
        totalTokens: successfulResults.reduce((sum, r) => sum + r.tokensUsed, 0)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in run-multi-model-test function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);