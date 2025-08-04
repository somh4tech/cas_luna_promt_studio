
import { supabase } from '@/integrations/supabase/client';
import { PromptAnalysisResult } from './promptAnalyzer';
import crypto from 'crypto-js';

export async function storeQuickAnalysis(promptId: string, promptContent: string, analysis: PromptAnalysisResult) {
  try {
    const contentHash = crypto.SHA256(promptContent).toString();
    
    const { error } = await supabase
      .from('prompt_ai_analysis')
      .insert({
        prompt_id: promptId,
        content_hash: contentHash,
        analysis_result: {
          overallScore: analysis.overallScore,
          colorCode: analysis.colorCode,
          summary: analysis.summary,
          techniques: analysis.techniqueResults.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            present: t.present,
            score: t.score,
            suggestions: t.suggestions,
            examples: t.examples
          })),
          suggestions: analysis.suggestions
        } as any,
        analysis_type: 'quick',
        analysis_version: 'v1'
      });

    if (error) {
      console.error('Error storing quick analysis:', error);
    }
  } catch (error) {
    console.error('Error storing quick analysis:', error);
  }
}

export async function storeAiAnalysis(promptId: string, promptContent: string, analysis: any) {
  try {
    const contentHash = crypto.SHA256(promptContent).toString();
    
    const { error } = await supabase
      .from('prompt_ai_analysis')
      .insert({
        prompt_id: promptId,
        content_hash: contentHash,
        analysis_result: analysis as any,
        analysis_type: 'ai',
        analysis_version: 'v1'
      });

    if (error) {
      console.error('Error storing AI analysis:', error);
    }
  } catch (error) {
    console.error('Error storing AI analysis:', error);
  }
}
