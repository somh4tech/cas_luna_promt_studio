
import React, { createContext, useContext, useState, useCallback } from 'react';

interface AnalysisContextType {
  analysisCompletionCounter: number;
  notifyAnalysisCompleted: (promptId: string) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analysisCompletionCounter, setAnalysisCompletionCounter] = useState(0);

  const notifyAnalysisCompleted = useCallback((promptId: string) => {
    console.log(`Analysis completed for prompt: ${promptId}`);
    setAnalysisCompletionCounter(prev => prev + 1);
  }, []);

  return (
    <AnalysisContext.Provider value={{
      analysisCompletionCounter,
      notifyAnalysisCompleted
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysisContext = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysisContext must be used within an AnalysisProvider');
  }
  return context;
};
