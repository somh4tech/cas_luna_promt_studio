export interface TechniqueAnalysis {
  id: string;
  name: string;
  description: string;
  present: boolean;
  score: number;
  explanation?: string;
  evidence?: string;
  suggestions: string[];
  examples: string[];
}

export interface PromptAnalysisResult {
  overallScore: number;
  colorCode: 'red' | 'orange' | 'yellow' | 'green';
  techniqueResults: TechniqueAnalysis[];
  summary: string;
  suggestions: string[];
}

export class PromptAnalyzer {
  private techniques = [
    {
      id: 'hyper-specific',
      name: 'Hyper-specific & Detailed Instructions',
      description: 'Contains precise, detailed instructions with context and background',
      keywords: ['specifically', 'exactly', 'precisely', 'detailed', 'context', 'background'],
      patterns: [/\b(specifically|exactly|precisely|detailed|context|background)\b/gi]
    },
    {
      id: 'role-assignment',
      name: 'Clear Role Assignment (Persona Prompting)',
      description: 'Starts with "You are an expert..." or similar role definition',
      keywords: ['you are', 'expert', 'specialist', 'professional', 'role'],
      patterns: [/you are (an?|the) (expert|specialist|professional)/gi, /act as (an?|the) (expert|specialist)/gi]
    },
    {
      id: 'step-by-step',
      name: 'Clear Task & Step-by-Step Plan',
      description: 'Breaks complex tasks into numbered steps with clear action words',
      keywords: ['step', 'first', 'then', 'next', 'finally', 'process'],
      patterns: [/step \d+/gi, /\d+\./g, /first.*then.*finally/gi]
    },
    {
      id: 'structured-format',
      name: 'Structured Format',
      description: 'Uses headers, bullet points, numbered lists, or XML-like tags',
      keywords: ['##', '###', '-', '*', '<', '>'],
      patterns: [/#{2,}/g, /^\s*[-*]\s/gm, /^\s*\d+\.\s/gm, /<[^>]+>/g]
    },
    {
      id: 'constraints',
      name: 'Clear Constraints & Guidelines',
      description: 'Specifies what to do and what not to do with quality standards',
      keywords: ['do not', 'avoid', 'must', 'should', 'required', 'constraint'],
      patterns: [/do not|don't/gi, /avoid/gi, /must|should|required/gi, /constraint|guideline/gi]
    },
    {
      id: 'examples',
      name: 'Provide Examples (Few-shot)',
      description: 'Includes concrete input/output examples showing desired format',
      keywords: ['example', 'for instance', 'such as', 'input:', 'output:'],
      patterns: [/example/gi, /for instance/gi, /such as/gi, /input:|output:/gi]
    },
    {
      id: 'dynamic-generation',
      name: 'Dynamic Generation & Folding',
      description: 'Includes conditional logic with "If X, then Y" patterns',
      keywords: ['if', 'then', 'when', 'otherwise', 'depending on'],
      patterns: [/if.*then/gi, /when.*then/gi, /otherwise/gi, /depending on/gi]
    },
    {
      id: 'escape-hatch',
      name: 'Escape Hatch Instructions',
      description: 'Handles uncertainty with fallback behaviors and safety instructions',
      keywords: ['if unsure', 'if uncertain', 'ask for clarification', 'fallback'],
      patterns: [/if (unsure|uncertain)/gi, /ask for clarification/gi, /fallback/gi]
    },
    {
      id: 'debug-reasoning',
      name: 'Debug & Reasoning Traces',
      description: 'Asks for step-by-step thinking and explanation of reasoning',
      keywords: ['explain', 'reasoning', 'think step', 'show your work', 'because'],
      patterns: [/explain.*reasoning/gi, /think step/gi, /show your work/gi, /because/gi]
    },
    {
      id: 'quality-validation',
      name: 'Quality Validation (Evals)',
      description: 'Defines success criteria and includes validation steps',
      keywords: ['criteria', 'validate', 'check', 'ensure', 'quality'],
      patterns: [/criteria/gi, /validate|check|ensure/gi, /quality/gi]
    },
    {
      id: 'model-awareness',
      name: 'Model Personality Awareness',
      description: 'Acknowledges AI capabilities and includes meta-instructions',
      keywords: ['AI', 'model', 'capability', 'limitation', 'meta'],
      patterns: [/AI|artificial intelligence/gi, /model/gi, /capability|limitation/gi]
    }
  ];

  analyzePrompt(content: string): PromptAnalysisResult {
    const techniqueResults: TechniqueAnalysis[] = this.techniques.map(technique => {
      const score = this.evaluateTechnique(content, technique);
      return {
        id: technique.id,
        name: technique.name,
        description: technique.description,
        present: score > 0.5,
        score,
        suggestions: this.getSuggestions(technique.id, score),
        examples: this.getExamples(technique.id)
      };
    });

    // Count-based scoring: simply count techniques that are present
    const overallScore = techniqueResults.filter(result => result.present).length;
    
    const colorCode = this.getColorCode(overallScore);
    const summary = this.generateSummary(overallScore, techniqueResults);
    const suggestions = this.generateOverallSuggestions(techniqueResults);

    return {
      overallScore,
      colorCode,
      techniqueResults,
      summary,
      suggestions
    };
  }

  private evaluateTechnique(content: string, technique: any): number {
    let score = 0;
    let maxScore = 0;

    // Check for patterns
    technique.patterns.forEach((pattern: RegExp) => {
      maxScore += 1;
      const matches = content.match(pattern);
      if (matches) {
        score += Math.min(matches.length / 2, 1); // Cap at 1 per pattern
      }
    });

    // Check for keywords
    technique.keywords.forEach((keyword: string) => {
      maxScore += 0.5;
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        score += 0.5;
      }
    });

    return maxScore > 0 ? Math.min(score / maxScore, 1) : 0;
  }

  private getColorCode(score: number): 'red' | 'orange' | 'yellow' | 'green' {
    if (score >= 9) return 'green';
    if (score >= 7) return 'yellow';
    if (score >= 4) return 'orange';
    return 'red';
  }

  private generateSummary(score: number, techniques: TechniqueAnalysis[]): string {
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

  private generateOverallSuggestions(techniques: TechniqueAnalysis[]): string[] {
    const missing = techniques.filter(t => !t.present);
    const suggestions = [
      `Consider adding ${missing.length} missing techniques to improve effectiveness`
    ];

    if (missing.some(t => t.id === 'role-assignment')) {
      suggestions.push('Start with "You are an expert..." to establish clear role context');
    }
    if (missing.some(t => t.id === 'structured-format')) {
      suggestions.push('Use headers, bullets, or numbered lists for better organization');
    }
    if (missing.some(t => t.id === 'examples')) {
      suggestions.push('Add concrete examples to clarify desired output format');
    }

    return suggestions;
  }

  private getSuggestions(techniqueId: string, score: number): string[] {
    if (score > 0.5) return [];

    const suggestionMap: Record<string, string[]> = {
      'hyper-specific': [
        'Add more specific details about the desired outcome',
        'Include relevant context and background information',
        'Be more precise about requirements and expectations'
      ],
      'role-assignment': [
        'Start with "You are an expert [role]..." to establish expertise',
        'Define the specific domain or specialization needed',
        'Set clear professional context for the task'
      ],
      'step-by-step': [
        'Break the task into numbered, sequential steps',
        'Use action-oriented language (analyze, create, evaluate)',
        'Provide a clear process flow from start to finish'
      ],
      'structured-format': [
        'Use headers (##, ###) to organize sections',
        'Add bullet points or numbered lists for clarity',
        'Consider using XML-like tags for complex structure'
      ],
      'constraints': [
        'Specify what TO do and what NOT to do',
        'Define output format requirements clearly',
        'Set quality standards and boundaries'
      ],
      'examples': [
        'Include concrete input/output examples',
        'Show the desired format and style',
        'Use "Example:" or "Input/Output:" patterns'
      ],
      'dynamic-generation': [
        'Add conditional logic with "If X, then Y" patterns',
        'Include decision trees for different scenarios',
        'Use multi-stage instructions for complex tasks'
      ],
      'escape-hatch': [
        'Add "If you\'re unsure about X, ask for clarification"',
        'Provide fallback behaviors for uncertain situations',
        'Include safety instructions for edge cases'
      ],
      'debug-reasoning': [
        'Ask for step-by-step thinking process',
        'Request explanation of reasoning behind decisions',
        'Include "Show your work" or "Explain your logic" instructions'
      ],
      'quality-validation': [
        'Define clear success criteria',
        'Include quality checkpoints throughout the process',
        'Add validation steps to ensure accuracy'
      ],
      'model-awareness': [
        'Acknowledge AI capabilities and limitations',
        'Adapt tone and complexity appropriately',
        'Include meta-instructions about desired AI behavior'
      ]
    };

    return suggestionMap[techniqueId] || [];
  }

  private getExamples(techniqueId: string): string[] {
    const exampleMap: Record<string, string[]> = {
      'role-assignment': [
        'You are an expert marketing strategist with 10+ years of experience...',
        'Act as a professional data scientist specializing in machine learning...'
      ],
      'step-by-step': [
        '1. First, analyze the input data\n2. Then, identify key patterns\n3. Finally, provide recommendations',
        'Process: Analyze → Synthesize → Recommend'
      ],
      'examples': [
        'Example input: "Increase sales"\nExample output: "Implement targeted email campaigns..."',
        'For instance: Input: [problem] → Output: [solution format]'
      ]
    };

    return exampleMap[techniqueId] || [];
  }
}

export const promptAnalyzer = new PromptAnalyzer();
