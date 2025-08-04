export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4
  }).format(amount);
};

export const formatTime = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

export const getTokensUsed = (tokensUsed: any): number => {
  // Handle null/undefined
  if (!tokensUsed) {
    return 0;
  }
  
  // Handle numeric values
  if (typeof tokensUsed === 'number') {
    return Math.max(0, tokensUsed);
  }
  
  // Handle object with various token fields
  if (typeof tokensUsed === 'object' && tokensUsed !== null) {
    // Try different common token field names
    const totalTokens = tokensUsed.total_tokens || 
                       tokensUsed.totalTokens || 
                       tokensUsed.total || 
                       (tokensUsed.prompt_tokens || 0) + (tokensUsed.completion_tokens || 0);
    
    if (typeof totalTokens === 'number' && totalTokens > 0) {
      return totalTokens;
    }
  }
  
  return 0;
};

// Sanitize error messages for safe display
export const sanitizeErrorMessage = (errorMessage: string): string => {
  if (!errorMessage || typeof errorMessage !== 'string') {
    return 'Unknown error occurred';
  }
  
  try {
    // Try to parse as JSON first to handle structured error messages
    const parsed = JSON.parse(errorMessage);
    if (parsed.error && typeof parsed.error === 'string') {
      return parsed.error;
    }
    if (parsed.message && typeof parsed.message === 'string') {
      return parsed.message;
    }
  } catch {
    // Not JSON, proceed with string sanitization
  }
  
  // Remove or escape problematic characters
  return errorMessage
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/"/g, '"') // Replace smart quotes
    .replace(/'/g, "'") // Replace smart quotes
    .trim()
    .substring(0, 1000); // Limit length
};

// Validate test result data
export const validateTestResult = (result: any): result is TestResult => {
  return result && 
         typeof result === 'object' && 
         typeof result.id === 'string' && 
         typeof result.model_name === 'string' &&
         typeof result.created_at === 'string';
};

export interface TestResult {
  id: string;
  model_name: string;
  output_data: string;
  input_data: string;
  response_time_ms: number;
  cost_estimate: number;
  tokens_used: any;
  created_at: string;
  error_message?: string;
  batch_id?: string;
  prompt_versions?: {
    version_number: number;
  } | null;
}