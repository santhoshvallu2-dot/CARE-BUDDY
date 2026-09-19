export interface IdentifiedInstruction {
  id: string;
  instruction: string;
  sourceText: string;
  confidence: 'clear' | 'needs_verification';
  timing?: string;
  type?: 'medication' | 'activity' | 'diet' | 'appointment' | 'measurement' | 'routine';
}

export interface CareAnalysisResult {
  summary: string;
  simpleExplanation: string;
  identifiedInstructions: IdentifiedInstruction[];
  uncertainInformation: string[];
  questionsForProfessional: string[];
  safetyNotice: string;
}

export interface DocumentQuestionAnswer {
  question: string;
  answer: string;
  sourceSnippets: string[];
  confidence: 'grounded' | 'unsupported';
  safetyNotice: string;
}

export interface AIServiceProvider {
  name: string;
  analyzeCareDocument(confirmedText: string): Promise<CareAnalysisResult>;
  answerDocumentQuestion(
    confirmedText: string,
    analysis: CareAnalysisResult | undefined,
    question: string
  ): Promise<DocumentQuestionAnswer>;
}

export interface AIServiceConfig {
  mode: 'mock' | 'gemini' | 'openai' | 'backend';
  apiKey?: string;
  apiEndpoint?: string;
}
