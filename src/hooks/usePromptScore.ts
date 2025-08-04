
import { useState, useEffect } from 'react';
import { getPromptScore, getPromptScoreSync } from '@/utils/promptScore';

interface ScoreData {
  score: number;
  colorCode: string;
  summary: string;
}

export const usePromptScore = (promptId: string, content: string, refreshTrigger?: number) => {
  const [scoreData, setScoreData] = useState<ScoreData>(() => {
    // Provide immediate sync score while loading async score
    return getPromptScoreSync(content);
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadScore = async () => {
      try {
        const result = await getPromptScore(promptId, content);
        if (isMounted) {
          setScoreData(result);
        }
      } catch (error) {
        console.error('Error loading prompt score:', error);
        // Keep the sync score on error
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadScore();

    return () => {
      isMounted = false;
    };
  }, [promptId, content, refreshTrigger]);

  return { scoreData, isLoading };
};
