import { AIServiceProvider, CareAnalysisResult, DocumentQuestionAnswer } from './types';
import { MockAIService } from './mockAIService';
import { HEALTHCARE_SAFETY_DISCLAIMER } from './prompts';

let activeProvider: AIServiceProvider = new MockAIService();

/**
 * Configure the active AI service provider (Mock, Backend Proxy, etc.)
 */
export function setAIProvider(provider: AIServiceProvider): void {
  activeProvider = provider;
}

/**
 * Validates and sanitizes the AI response object to prevent UI crashes.
 */
function validateAndSanitizeResult(result: Partial<CareAnalysisResult>): CareAnalysisResult {
  return {
    summary: typeof result.summary === 'string' && result.summary.trim() ? result.summary : 'Care Document Overview',
    simpleExplanation:
      typeof result.simpleExplanation === 'string' && result.simpleExplanation.trim()
        ? result.simpleExplanation
        : 'The document instructions have been organized for your routine.',
    identifiedInstructions: Array.isArray(result.identifiedInstructions) ? result.identifiedInstructions : [],
    uncertainInformation: Array.isArray(result.uncertainInformation) ? result.uncertainInformation : [],
    questionsForProfessional: Array.isArray(result.questionsForProfessional) ? result.questionsForProfessional : [],
    safetyNotice: result.safetyNotice || HEALTHCARE_SAFETY_DISCLAIMER,
  };
}

/**
 * Main AI analysis entry point.
 * Accepts ONLY the user-confirmed OCR text and returns structured care explanation.
 */
export async function analyzeCareDocument(confirmedText: string): Promise<CareAnalysisResult> {
  const trimmed = confirmedText ? confirmedText.trim() : '';
  if (!trimmed) {
    throw new Error('No confirmed document text provided for AI analysis.');
  }

  try {
    const rawResult = await activeProvider.analyzeCareDocument(trimmed);
    return validateAndSanitizeResult(rawResult);
  } catch (error: unknown) {
    console.error('AI Service Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown AI analysis failure';
    throw new Error(`AI Analysis Error: ${message}`);
  }
}

/**
 * Safe Voice / Text Question Answerer strictly grounded on the verified document.
 */
export async function askDocumentQuestion(
  documentText: string,
  analysis: CareAnalysisResult | undefined,
  question: string
): Promise<DocumentQuestionAnswer> {
  const trimmed = question ? question.trim() : '';
  if (!trimmed) {
    throw new Error('Please provide a question to ask.');
  }

  try {
    const response = await activeProvider.answerDocumentQuestion(
      documentText || '',
      analysis,
      trimmed
    );
    return response;
  } catch (error: unknown) {
    console.error('AI Document QA Error:', error);
    return {
      question: trimmed,
      answer: 'Information not available in the provided document. Please verify with your healthcare professional.',
      sourceSnippets: [],
      confidence: 'unsupported',
      safetyNotice: HEALTHCARE_SAFETY_DISCLAIMER,
    };
  }
}
