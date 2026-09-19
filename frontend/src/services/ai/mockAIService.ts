import { AIServiceProvider, CareAnalysisResult, IdentifiedInstruction, DocumentQuestionAnswer } from './types';
import { HEALTHCARE_SAFETY_DISCLAIMER } from './prompts';

export class MockAIService implements AIServiceProvider {
  name = 'Mock / Demo AI Engine (Offline)';

  async analyzeCareDocument(confirmedText: string): Promise<CareAnalysisResult> {
    // Simulate realistic AI network latency (900ms)
    await new Promise((resolve) => setTimeout(resolve, 900));

    const lower = confirmedText.toLowerCase();
    const lines = confirmedText.split('\n').map((l) => l.trim()).filter(Boolean);

    const identifiedInstructions: IdentifiedInstruction[] = [];
    const uncertainInformation: string[] = [];
    const questionsForProfessional: string[] = [];

    // 1. Rule-based intelligent parser for known and general medical text
    // Detection: Metoprolol / Blood pressure
    if (lower.includes('metoprolol') || lower.includes('blood pressure') || lower.includes('bid')) {
      identifiedInstructions.push({
        id: `inst-ai-${Date.now()}-1`,
        instruction: 'Metoprolol Tartrate 25mg — Take 1 tablet twice daily with meals (e.g. 08:00 AM, 08:00 PM).',
        sourceText: lines.find((l) => l.toLowerCase().includes('metoprolol')) || 'Rx: Metoprolol Tartrate 25mg PO BID with meals',
        confidence: 'clear',
        timing: 'Twice daily with meals (08:00 AM, 08:00 PM)',
        type: 'medication',
      });
    }

    // Detection: Atorvastatin / Bedtime / Cholesterol
    if (lower.includes('atorvastatin') || lower.includes('qhs') || lower.includes('bedtime') || lower.includes('lipid')) {
      identifiedInstructions.push({
        id: `inst-ai-${Date.now()}-2`,
        instruction: 'Atorvastatin 20mg — Take 1 tablet once daily at bedtime with water.',
        sourceText: lines.find((l) => l.toLowerCase().includes('atorvastatin')) || 'Rx: Atorvastatin 20mg PO QHS',
        confidence: 'clear',
        timing: 'Once daily at bedtime (09:30 PM)',
        type: 'medication',
      });
    }

    // Detection: Blood Pressure Log / Measurement
    if (lower.includes('log') || lower.includes('pressure') || lower.includes('measure')) {
      identifiedInstructions.push({
        id: `inst-ai-${Date.now()}-3`,
        instruction: 'Daily Blood Pressure Log — Measure and record blood pressure every morning after resting 5 minutes.',
        sourceText: lines.find((l) => l.toLowerCase().includes('log') || l.toLowerCase().includes('pressure')) || 'Log morning blood pressure daily',
        confidence: 'clear',
        timing: 'Daily at 07:30 AM',
        type: 'measurement',
      });
    }

    // Detection: Activity / Walking / Recovery
    if (lower.includes('walk') || lower.includes('activity') || lower.includes('exercise')) {
      identifiedInstructions.push({
        id: `inst-ai-${Date.now()}-4`,
        instruction: 'Light Daily Walk — Take a 15–20 minute gentle walk on flat terrain.',
        sourceText: lines.find((l) => l.toLowerCase().includes('walk')) || 'Light walking 15-20 mins daily',
        confidence: 'clear',
        timing: 'Daily at 01:00 PM',
        type: 'activity',
      });
    }

    // Detection: Wound care or lifting restriction
    if (lower.includes('wound') || lower.includes('dressing') || lower.includes('lifting')) {
      identifiedInstructions.push({
        id: `inst-ai-${Date.now()}-5`,
        instruction: 'Post-Procedure Care — Keep dressing clean and dry; avoid lifting heavy items (>10 lbs).',
        sourceText: lines.find((l) => l.toLowerCase().includes('lifting') || l.toLowerCase().includes('dressing')) || 'Avoid heavy lifting for 2 weeks',
        confidence: 'clear',
        timing: 'Ongoing for 2 weeks',
        type: 'activity',
      });
    }

    // Detection: General fallback for custom text lines if none matched
    if (identifiedInstructions.length === 0) {
      lines.forEach((line, idx) => {
        if (line.length > 5 && !line.startsWith('MERCY') && !line.startsWith('Sign:')) {
          identifiedInstructions.push({
            id: `inst-ai-custom-${Date.now()}-${idx}`,
            instruction: line.replace(/^(Rx:|Sig:|Instruction:|\d+\.)\s*/i, ''),
            sourceText: line,
            confidence: 'clear',
            timing: 'As directed on document',
            type: 'routine',
          });
        }
      });
    }

    // 2. Identify uncertain information or abbreviations requiring doctor verification
    if (lower.includes('prn') || lower.includes('as needed')) {
      uncertainInformation.push(
        'The term "as needed / PRN" is used without a specified minimum hour interval between doses. Please clarify exact timing with your pharmacist.'
      );
    }

    if (lower.includes('po') || lower.includes('bid') || lower.includes('qhs')) {
      uncertainInformation.push(
        'Medical Latin abbreviations (PO, BID, QHS) were detected. While commonly indicating oral intake, twice daily, and bedtime, please confirm the schedule with your clinic.'
      );
    }

    if (lower.includes('follow-up') || lower.includes('4 weeks') || lower.includes('clinic')) {
      uncertainInformation.push(
        'Follow-up appointment timeframe is noted. Please confirm the exact clinic date and time with reception.'
      );
    }

    if (uncertainInformation.length === 0) {
      uncertainInformation.push(
        'Always double-check medication strengths and brand names with the physical label printed on your bottle.'
      );
    }

    // 3. Generate thoughtful, relevant questions for the doctor / pharmacist
    if (lower.includes('meals') || lower.includes('food') || lower.includes('breakfast')) {
      questionsForProfessional.push(
        'Should I still take this morning dose if I skip breakfast or fast before blood tests?'
      );
    }

    if (lower.includes('metoprolol') || lower.includes('pressure')) {
      questionsForProfessional.push(
        'What blood pressure numbers should I consider outside my target range when logging every morning?'
      );
    }

    if (lower.includes('atorvastatin') || lower.includes('lipid')) {
      questionsForProfessional.push(
        'Are there any specific dietary or supplement interactions (such as grapefruit) I should avoid with this prescription?'
      );
    }

    if (questionsForProfessional.length === 0) {
      questionsForProfessional.push(
        'Can you confirm how many weeks or months I should continue this exact care routine before our next checkup?'
      );
      questionsForProfessional.push(
        'What should I do if I accidentally miss a scheduled dose by a few hours?'
      );
    }

    // 4. Construct plain-language summary & simple explanation
    const summary = `Healthcare instruction document containing ${identifiedInstructions.length} clearly identified care items.`;
    
    const explanationBullets = identifiedInstructions
      .map((item) => `• ${item.instruction}`)
      .join('\n');

    const simpleExplanation = `Here is a plain-language summary of your verified care instructions:\n${explanationBullets}\n\nAll items are organized strictly from your document.`;

    return {
      summary,
      simpleExplanation,
      identifiedInstructions,
      uncertainInformation,
      questionsForProfessional,
      safetyNotice: HEALTHCARE_SAFETY_DISCLAIMER,
    };
  }

  async answerDocumentQuestion(
    confirmedText: string,
    analysis: CareAnalysisResult | undefined,
    question: string
  ): Promise<DocumentQuestionAnswer> {
    // Simulate brief processing latency (600ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    const qLower = question.toLowerCase();
    const sourceSnippets: string[] = [];

    // Strict safety check for diagnostic/prescriptive requests
    const isUnsafeRequest =
      qLower.includes('diagnose') ||
      qLower.includes('disease') ||
      qLower.includes('cure') ||
      qLower.includes('stop taking') ||
      qLower.includes('increase dose') ||
      qLower.includes('double dose') ||
      qLower.includes('treatment plan');

    if (isUnsafeRequest) {
      return {
        question,
        answer:
          'CareBuddy AI cannot diagnose conditions, prescribe medications, or recommend altering doses. Please consult your doctor or pharmacist directly for clinical decisions.',
        sourceSnippets: [],
        confidence: 'unsupported',
        safetyNotice: HEALTHCARE_SAFETY_DISCLAIMER,
      };
    }

    // Question: Explain simply / what does this mean
    if (
      qLower.includes('explain') ||
      qLower.includes('simpler') ||
      qLower.includes('what does this mean') ||
      qLower.includes('summary')
    ) {
      if (analysis?.simpleExplanation) {
        sourceSnippets.push(analysis.summary || 'Document Overview');
        return {
          question,
          answer: `According to your document, this care plan guides your daily routine. Here is the simplest summary:\n${analysis.simpleExplanation}`,
          sourceSnippets,
          confidence: 'grounded',
          safetyNotice: HEALTHCARE_SAFETY_DISCLAIMER,
        };
      }
    }

    // Question: When to take / timing / schedule
    if (
      qLower.includes('when') ||
      qLower.includes('time') ||
      qLower.includes('schedule') ||
      qLower.includes('take') ||
      qLower.includes('morning') ||
      qLower.includes('night')
    ) {
      const instructions = analysis?.identifiedInstructions || [];
      if (instructions.length > 0) {
        const timings = instructions
          .map((i) => `• ${i.instruction} (${i.timing || 'As directed'})`)
          .join('\n');
        sourceSnippets.push(...instructions.map((i) => i.sourceText));
        return {
          question,
          answer: `Based on the verified instructions on your document:\n${timings}\nAlways follow the timing printed on your physical bottle.`,
          sourceSnippets,
          confidence: 'grounded',
          safetyNotice: HEALTHCARE_SAFETY_DISCLAIMER,
        };
      }
    }

    // Question: Doctor questions / what to ask
    if (
      qLower.includes('ask') ||
      qLower.includes('doctor') ||
      qLower.includes('question') ||
      qLower.includes('pharmacist')
    ) {
      const questions = analysis?.questionsForProfessional || [];
      if (questions.length > 0) {
        return {
          question,
          answer: `Here are suggested questions to clarify with your healthcare provider:\n${questions.map((q) => `• ${q}`).join('\n')}`,
          sourceSnippets: ['Generated based on prescription notes'],
          confidence: 'grounded',
          safetyNotice: HEALTHCARE_SAFETY_DISCLAIMER,
        };
      }
    }

    // Check if query matches specific terms in document
    const lines = confirmedText.split('\n').filter((l) => l.trim().length > 0);
    const matchingLines = lines.filter((line) => {
      const words = qLower.split(/\s+/).filter((w) => w.length > 3);
      return words.some((word) => line.toLowerCase().includes(word));
    });

    if (matchingLines.length > 0) {
      sourceSnippets.push(...matchingLines.slice(0, 2));
      return {
        question,
        answer: `From your verified document:\n"${matchingLines.join(' ')}"\n\nPlease confirm any unclear details with your healthcare provider.`,
        sourceSnippets,
        confidence: 'grounded',
        safetyNotice: HEALTHCARE_SAFETY_DISCLAIMER,
      };
    }

    // Fallback: Information not present in document
    return {
      question,
      answer:
        'Information not available in the provided document. Please verify with your healthcare professional.',
      sourceSnippets: [],
      confidence: 'unsupported',
      safetyNotice: HEALTHCARE_SAFETY_DISCLAIMER,
    };
  }
}
