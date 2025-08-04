
import { promptAnalyzer } from './promptAnalyzer';
import { supabase } from '@/integrations/supabase/client';
import crypto from 'crypto-js';

export async function getPromptScore(promptId: string, content: string) {
  const currentContentHash = crypto.SHA256(content).toString();
  
  // Get both AI and quick analysis for this prompt
  const storedAnalyses = await getStoredAnalyses(promptId);
  
  // Priority logic: AI analysis > Quick analysis > Rule-based
  let bestAnalysis = null;
  
  // First, check for AI analysis
  const aiAnalysis = storedAnalyses.find(a => a.analysis_type === 'ai');
  if (aiAnalysis) {
    // Use AI analysis if content matches or is similar
    if (aiAnalysis.content_hash === currentContentHash) {
      bestAnalysis = aiAnalysis;
    }
  }
  
  // If no matching AI analysis, use the most recent quick analysis
  if (!bestAnalysis) {
    const quickAnalysis = storedAnalyses
      .filter(a => a.analysis_type === 'quick')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    if (quickAnalysis) {
      bestAnalysis = quickAnalysis;
    }
  }
  
  if (bestAnalysis) {
    const result = bestAnalysis.analysis_result as any;
    
    // Handle both quick and AI analysis result formats
    if (bestAnalysis.analysis_type === 'ai' && result.techniques) {
      // AI analysis format - count present techniques
      const overallScore = result.techniques.filter((t: any) => t.present).length;
      return {
        score: overallScore,
        colorCode: getColorCode(overallScore),
        summary: generateSummary(overallScore)
      };
    } else if (result.overallScore !== undefined) {
      // Quick analysis format - already count-based
      return {
        score: result.overallScore,
        colorCode: result.colorCode,
        summary: result.summary
      };
    }
  }
  
  // Fall back to rule-based analysis
  const analysis = promptAnalyzer.analyzePrompt(content);
  return {
    score: analysis.overallScore,
    colorCode: analysis.colorCode,
    summary: analysis.summary
  };
}

// Legacy function for backward compatibility (content-only)
export function getPromptScoreSync(content: string) {
  const analysis = promptAnalyzer.analyzePrompt(content);
  return {
    score: analysis.overallScore,
    colorCode: analysis.colorCode,
    summary: analysis.summary
  };
}

async function getStoredAnalyses(promptId: string) {
  try {
    const { data, error } = await supabase
      .from('prompt_ai_analysis')
      .select('analysis_result, analysis_type, created_at, content_hash')
      .eq('prompt_id', promptId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching stored analyses:', error);
    return [];
  }
}

function getColorCode(score: number): 'red' | 'orange' | 'yellow' | 'green' {
  if (score >= 9) return 'green';
  if (score >= 7) return 'yellow';
  if (score >= 4) return 'orange';
  return 'red';
}

function generateSummary(score: number) {
  if (score >= 9) {
    return `Excellent prompt engineering! Uses ${score}/11 advanced techniques.`;
  } else if (score >= 7) {
    return `Good prompt engineering. Uses ${score}/11 techniques effectively.`;
  } else if (score >= 4) {
    return `Basic prompt engineering. Uses ${score}/11 techniques, room for improvement.`;
  } else {
    return `Needs improvement. Only uses ${score}/11 techniques.`;
  }
}

export function getScoreColorClasses(colorCode: string) {
  switch (colorCode) {
    case 'green': return 'bg-green-500 text-white';
    case 'yellow': return 'bg-yellow-500 text-white';
    case 'orange': return 'bg-orange-500 text-white';
    case 'red': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
}

export function getScoreBorderClasses(colorCode: string) {
  switch (colorCode) {
    case 'green': return 'border-green-200';
    case 'yellow': return 'border-yellow-200';
    case 'orange': return 'border-orange-200';
    case 'red': return 'border-red-200';
    default: return 'border-gray-200';
  }
}
