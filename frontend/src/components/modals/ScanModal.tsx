import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { SafetyBanner } from '../layout/SafetyBanner';
import { ReviewReminderModal } from './ReviewReminderModal';
import { ReadAloudButton } from '../voice/ReadAloudButton';
import { DocumentVoiceQA } from '../voice/DocumentVoiceQA';
import { recognizeTextFromImage } from '../../services/ocrService';
import { analyzeCareDocument } from '../../services/ai/aiService';
import { generatePrescriptionDataUrl, SAMPLE_PRESCRIPTION_1, SAMPLE_PRESCRIPTION_2 } from '../../data/samplePrescriptions';
import {
  Camera,
  UploadCloud,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Edit3,
  RotateCcw,
  Loader2,
  AlertTriangle,
  FileWarning,
  Trash2,
  Save,
  HelpCircle,
  Clock,
  Pill,
  Check,
  AlertCircle,
  PlusCircle
} from 'lucide-react';
import { DocumentItem, OcrProgress, CareAnalysisResult, ExtractedInstruction, ReminderItem, IdentifiedInstruction } from '../../types';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newDoc: DocumentItem) => void;
  onSaveCustomReminder?: (reminder: ReminderItem) => void;
}

type ScanStep = 'choose' | 'preview' | 'ocr_processing' | 'review_text' | 'ai_analyzing' | 'ai_summary' | 'error_state';

export const ScanModal: React.FC<ScanModalProps> = ({ isOpen, onClose, onComplete, onSaveCustomReminder }) => {
  const [step, setStep] = useState<ScanStep>('choose');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [fileSizeText, setFileSizeText] = useState<string>('');
  
  // OCR Progress State
  const [ocrProgress, setOcrProgress] = useState<OcrProgress>({
    status: 'Initializing OCR engine...',
    progress: 0,
  });

  // Extracted Text State (editable by user)
  const [extractedText, setExtractedText] = useState<string>('');
  const [ocrConfidence, setOcrConfidence] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // AI Analysis State
  const [aiResult, setAiResult] = useState<CareAnalysisResult | null>(null);
  const [aiError, setAiError] = useState<string>('');

  // Review Reminder Modal State
  const [reviewingInstruction, setReviewingInstruction] = useState<IdentifiedInstruction | null>(null);

  // Hidden File Inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetScanner = () => {
    setStep('choose');
    setSelectedImage(null);
    setSelectedFileName('');
    setFileSizeText('');
    setExtractedText('');
    setOcrConfidence(0);
    setErrorMessage('');
    setAiResult(null);
    setAiError('');
    setOcrProgress({ status: 'Initializing...', progress: 0 });
  };

  const handleClose = () => {
    resetScanner();
    onClose();
  };

  // 1. File Handling & Validation
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported file type. Please upload a JPG, PNG, or WEBP image.');
      setStep('error_state');
      return;
    }

    // Validation: Size (Max 10MB)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage('File size exceeds 10MB. Please select a smaller photo or document image.');
      setStep('error_state');
      return;
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSizeText(`${sizeMb} MB`);
    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImage(reader.result);
        setStep('preview');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Fast Sample Prescription Selector for Quick Testing
  const handleSelectSample = (sample: typeof SAMPLE_PRESCRIPTION_1) => {
    const dataUrl = generatePrescriptionDataUrl(sample.title, sample.lines);
    setSelectedImage(dataUrl);
    setSelectedFileName(sample.name);
    setFileSizeText('Simulated High-Res Document');
    setStep('preview');
  };

  // 2. Real OCR Trigger
  const handleStartOcr = async () => {
    if (!selectedImage) return;

    setStep('ocr_processing');
    setOcrProgress({ status: 'Preparing document for OCR...', progress: 5 });

    try {
      const result = await recognizeTextFromImage(selectedImage, (progress) => {
        setOcrProgress(progress);
      });

      if (result.error || !result.text || result.text.trim().length === 0) {
        if (!result.text || result.text.trim().length === 0) {
          setErrorMessage("We couldn't read this document clearly. The image may be blurry, low contrast, or missing readable text.");
        } else {
          setErrorMessage(result.error || 'Something went wrong while reading the document.');
        }
        setStep('error_state');
        return;
      }

      setExtractedText(result.text);
      setOcrConfidence(Math.round(result.confidence));
      setStep('review_text');
    } catch (err) {
      console.error(err);
      setErrorMessage('Something went wrong while reading the document. Please try again or enter the information manually.');
      setStep('error_state');
    }
  };

  // 3. User Confirms Text & Triggers AI Analysis
  const handleConfirmAndAnalyze = async () => {
    if (!extractedText.trim()) return;

    setStep('ai_analyzing');
    setAiError('');

    try {
      const result = await analyzeCareDocument(extractedText);
      setAiResult(result);
      setStep('ai_summary');
    } catch (err: unknown) {
      console.error('AI Analysis Failed:', err);
      const msg = err instanceof Error ? err.message : 'AI analysis is temporarily unavailable.';
      setAiError(msg);
      setStep('error_state');
    }
  };

  // 4. Save Document
  const handleSaveDocument = () => {
    const instructions: ExtractedInstruction[] = (aiResult?.identifiedInstructions || []).map((inst) => ({
      id: inst.id,
      action: inst.instruction,
      timing: inst.timing || 'As directed',
      details: inst.sourceText,
      type: (inst.type as ExtractedInstruction['type']) || 'medication',
    }));

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: selectedFileName.replace(/\.[^/.]+$/, '') || 'Prescription Document',
      date: 'Uploaded today',
      status: 'ready',
      category: 'Care Plan & Prescription',
      fileSize: fileSizeText || '1.5 MB',
      imageUrl: selectedImage || undefined,
      rawText: extractedText,
      extractedText: extractedText,
      summary: aiResult?.simpleExplanation || 'Care plan instructions summarized by CareBuddy AI.',
      instructions,
      analysis: aiResult || undefined,
      source: 'Scanned & AI Analyzed Document',
    };

    onComplete(newDoc);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Scan & Understand"
      subtitle="Extract and simplify healthcare instructions with AI"
      maxWidth="md"
    >
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* Step Indicator Progress Bar */}
      <div className="flex items-center justify-between gap-1 text-[11px] font-medium text-warm-400 border-b border-warm-100 pb-3">
        <span className={step === 'choose' ? 'text-coffee-800 font-bold' : 'text-coffee-700 font-semibold'}>
          STEP 1: Choose {step !== 'choose' && step !== 'error_state' ? '✓' : ''}
        </span>
        <span>&rarr;</span>
        <span className={step === 'preview' || step === 'ocr_processing' ? 'text-coffee-800 font-bold' : step === 'review_text' || step === 'ai_analyzing' || step === 'ai_summary' ? 'text-coffee-700 font-semibold' : ''}>
          STEP 2: Read {step === 'review_text' || step === 'ai_analyzing' || step === 'ai_summary' ? '✓' : ''}
        </span>
        <span>&rarr;</span>
        <span className={step === 'review_text' ? 'text-coffee-800 font-bold' : step === 'ai_analyzing' || step === 'ai_summary' ? 'text-coffee-700 font-semibold' : ''}>
          STEP 3: Review {step === 'ai_analyzing' || step === 'ai_summary' ? '✓' : ''}
        </span>
        <span>&rarr;</span>
        <span className={step === 'ai_analyzing' || step === 'ai_summary' ? 'text-coffee-800 font-bold' : ''}>
          STEP 4: AI Explanation {step === 'ai_summary' ? '●' : ''}
        </span>
      </div>

      {/* ========================================================
          STEP 1: CHOOSE / CAPTURE DOCUMENT
         ======================================================== */}
      {step === 'choose' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="text-center">
            <h4 className="text-sm font-bold text-warm-900">Upload Healthcare Instruction</h4>
            <p className="text-xs text-warm-600 mt-0.5">
              Select a photo, prescription, discharge summary, or doctor note.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => cameraInputRef.current?.click()}
              icon={<Camera className="w-5 h-5" />}
              className="flex-col py-5 h-auto text-center gap-1.5"
            >
              <span className="font-bold">Take Photo</span>
              <span className="text-[11px] font-normal text-warm-200 opacity-90">Use Mobile Camera</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => fileInputRef.current?.click()}
              icon={<UploadCloud className="w-5 h-5 text-coffee-800" />}
              className="flex-col py-5 h-auto text-center gap-1.5 border-warm-200 hover:border-coffee-400 bg-white"
            >
              <span className="font-bold text-warm-900">Upload Document</span>
              <span className="text-[11px] font-normal text-warm-500">JPG, PNG, WEBP</span>
            </Button>
          </div>

          {/* Sample Prescriptions For Quick Testing */}
          <div className="space-y-2 pt-1 border-t border-warm-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-warm-800">Or Test with Sample Prescription:</span>
              <StatusBadge variant="demo" size="sm">Quick Test</StatusBadge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleSelectSample(SAMPLE_PRESCRIPTION_1)}
                className="text-left p-3 rounded-xl border border-warm-200 bg-warm-100/40 hover:bg-warm-100/80 hover:border-warm-300 transition-all text-xs cursor-pointer group"
              >
                <p className="font-bold text-warm-900 group-hover:text-coffee-800">1. Cardiology Care Plan</p>
                <p className="text-[11px] text-warm-600 mt-0.5">Metoprolol 25mg, Atorvastatin, BP log</p>
              </button>

              <button
                onClick={() => handleSelectSample(SAMPLE_PRESCRIPTION_2)}
                className="text-left p-3 rounded-xl border border-warm-200 bg-warm-100/40 hover:bg-warm-100/80 hover:border-warm-300 transition-all text-xs cursor-pointer group"
              >
                <p className="font-bold text-warm-900 group-hover:text-coffee-800">2. Discharge Recovery Note</p>
                <p className="text-[11px] text-warm-600 mt-0.5">Post-procedure recovery instructions</p>
              </button>
            </div>
          </div>

          <SafetyBanner />
        </div>
      )}

      {/* ========================================================
          STEP 2: IMAGE PREVIEW & CONFIRMATION
         ======================================================== */}
      {step === 'preview' && selectedImage && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-warm-900">Document Preview</h4>
              <p className="text-xs text-warm-500">
                {selectedFileName} {fileSizeText && `• ${fileSizeText}`}
              </p>
            </div>
            <StatusBadge variant="info">Ready to Read</StatusBadge>
          </div>

          {/* Image Container */}
          <div className="relative rounded-2xl overflow-hidden border border-warm-200 bg-warm-100/30 max-h-64 flex items-center justify-center p-2 shadow-inner">
            <img
              src={selectedImage}
              alt="Selected healthcare document preview"
              className="max-h-60 w-auto object-contain rounded-xl shadow-xs"
            />
          </div>

          <div className="bg-emerald-50 text-emerald-950 rounded-xl p-3 text-xs flex items-center gap-2 border border-emerald-200 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Document loaded. Tap "Read Document" to start OCR text extraction.</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="md"
              onClick={resetScanner}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Retake / Change
            </Button>
            <Button
              variant="primary"
              fullWidth
              size="md"
              onClick={handleStartOcr}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Read Document (OCR)
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 3: OCR PROCESSING PROGRESS
         ======================================================== */}
      {step === 'ocr_processing' && (
        <div className="py-8 space-y-5 text-center animate-fadeIn">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-warm-200 text-coffee-800 mx-auto shadow-inner">
            <Loader2 className="w-8 h-8 animate-spin text-coffee-800" />
            <Sparkles className="w-4 h-4 absolute top-2 right-2 text-caramel-600 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-warm-900">Reading your document...</h4>
            <p className="text-xs text-warm-600 font-medium">
              {ocrProgress.status}
            </p>
          </div>

          {/* Real Progress Bar */}
          <div className="max-w-xs mx-auto space-y-1.5">
            <div className="w-full bg-warm-200 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-coffee-800 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(10, ocrProgress.progress))}%` }}
              />
            </div>
            <p className="text-[11px] text-warm-500 font-mono">{ocrProgress.progress}%</p>
          </div>

          <p className="text-[11px] text-warm-500 max-w-xs mx-auto leading-relaxed">
            Running browser-based Tesseract OCR engine. No document images are sent to external servers.
          </p>
        </div>
      )}

      {/* ========================================================
          STEP 4: REVIEW & EDIT EXTRACTED TEXT (USER CONFIRMATION)
         ======================================================== */}
      {step === 'review_text' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-warm-900">Review & Confirm Text</h4>
              <p className="text-xs text-warm-500">Verify extracted words before AI care analysis.</p>
            </div>
            {ocrConfidence > 0 && (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {ocrConfidence}% OCR Match
              </span>
            )}
          </div>

          {/* Editable Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-warm-600 px-1">
              <span className="font-semibold text-warm-900 flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5 text-coffee-800" /> Extracted Text (Editable)
              </span>
              <button
                onClick={() => setExtractedText('')}
                className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Clear Text
              </button>
            </div>

            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              rows={7}
              placeholder="Enter or edit extracted prescription instructions..."
              className="w-full text-xs font-mono p-3.5 rounded-xl border border-warm-300 text-warm-900 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 focus:border-coffee-700 bg-white leading-relaxed resize-y"
            />
          </div>

          {/* Important Accuracy Warning */}
          <div className="bg-warm-100/60 text-warm-900 rounded-xl p-3 text-xs flex items-start gap-2.5 border border-warm-200/80">
            <AlertTriangle className="w-4 h-4 text-caramel-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-warm-900">User Confirmation Required</p>
              <p className="text-[11px] text-warm-700 mt-0.5 leading-relaxed">
                CareBuddy AI will analyze ONLY the verified text above. Please make sure medication names and timings match your original prescription.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="md"
              onClick={resetScanner}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Scan Again
            </Button>
            <Button
              variant="primary"
              fullWidth
              size="md"
              onClick={handleConfirmAndAnalyze}
              disabled={!extractedText.trim()}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Confirm & Analyze with AI
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 5: AI ANALYZING SPINNER
         ======================================================== */}
      {step === 'ai_analyzing' && (
        <div className="py-10 space-y-4 text-center animate-fadeIn">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-coffee-800 text-warm-50 mx-auto shadow-md">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-bold text-warm-900">Analyzing your information...</h4>
            <p className="text-xs text-warm-600 max-w-xs mx-auto mt-1 leading-relaxed">
              CareBuddy AI is translating instructions into plain language and identifying routines.
            </p>
          </div>
          <div className="w-44 bg-warm-200 h-2 rounded-full mx-auto overflow-hidden">
            <div className="bg-coffee-800 h-full rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 6: AI ANALYSIS RESULT (CARE SUMMARY & INSTRUCTIONS)
         ======================================================== */}
      {step === 'ai_summary' && aiResult && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-warm-900">AI Care Explanation</h4>
              <p className="text-xs text-warm-500">Organized from your confirmed document</p>
            </div>
            <StatusBadge variant="ready" size="sm">AI Analyzed</StatusBadge>
          </div>

          {/* 1. CARE SUMMARY (Simple Explanation) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-warm-900">
                <Sparkles className="w-3.5 h-3.5 text-coffee-800" />
                <span>Care Summary</span>
              </div>
              <ReadAloudButton text={aiResult.simpleExplanation} />
            </div>
            <Card className="bg-warm-100/60 border-warm-200/80 p-3.5 space-y-2">
              <p className="text-xs text-warm-900 leading-relaxed whitespace-pre-wrap font-medium">
                {aiResult.simpleExplanation}
              </p>
            </Card>
          </div>

          {/* 2. CLEARLY IDENTIFIED INSTRUCTIONS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-warm-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-700" /> Clearly Identified ({aiResult.identifiedInstructions.length})
              </span>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                Clear Confidence
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {aiResult.identifiedInstructions.map((inst) => (
                <div
                  key={inst.id}
                  className="p-3 bg-white rounded-xl border border-warm-200/70 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-warm-900 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-coffee-700 shrink-0" />
                      {inst.instruction}
                    </span>
                    <span className="text-[10px] bg-warm-100 text-warm-700 px-2 py-0.5 rounded font-medium">
                      {inst.type || 'medication'}
                    </span>
                  </div>
                  {inst.timing && (
                    <div className="flex items-center gap-1 text-xs text-coffee-800 font-medium pl-5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{inst.timing}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pl-5 pt-1">
                    <p className="text-[11px] text-warm-500 italic truncate max-w-[200px]">
                      Source: "{inst.sourceText}"
                    </p>
                    <button
                      onClick={() => setReviewingInstruction(inst)}
                      className="text-[11px] font-bold text-coffee-800 hover:text-coffee-900 bg-warm-100 hover:bg-warm-200 px-2.5 py-1 rounded-lg border border-warm-200/80 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <PlusCircle className="w-3 h-3" /> Review & Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. UNCERTAIN INFORMATION / NEEDS VERIFICATION */}
          {aiResult.uncertainInformation && aiResult.uncertainInformation.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-warm-900 px-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-caramel-600" /> Needs Verification ({aiResult.uncertainInformation.length})
              </span>

              <div className="space-y-1.5">
                {aiResult.uncertainInformation.map((uncertain, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-warm-100/60 rounded-xl border border-warm-200/80 text-xs text-warm-900 flex items-start gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-caramel-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-warm-900">{uncertain}</p>
                      <p className="text-[11px] text-warm-700 mt-0.5">
                        Please verify this information with your healthcare professional.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. QUESTIONS FOR HEALTHCARE PROFESSIONAL */}
          {aiResult.questionsForProfessional && aiResult.questionsForProfessional.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-warm-900 px-1 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-coffee-700" /> Questions to Discuss ({aiResult.questionsForProfessional.length})
              </span>

              <div className="space-y-1.5">
                {aiResult.questionsForProfessional.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-warm-100/40 rounded-xl border border-warm-200/70 text-xs text-warm-900 flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-warm-200 text-coffee-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      ?
                    </span>
                    <span className="text-warm-900 font-medium leading-snug">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. VOICE & TEXT DOCUMENT QUESTION ASKING */}
          <DocumentVoiceQA
            documentText={extractedText}
            analysis={aiResult}
            documentTitle={selectedFileName || 'Prescription Document'}
          />

          <SafetyBanner />

          {/* Footer Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setStep('review_text')}
                icon={<Edit3 className="w-4 h-4" />}
                className="w-1/2"
              >
                Edit Information
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleSaveDocument}
                icon={<Save className="w-4 h-4" />}
                className="w-1/2"
              >
                Save Document
              </Button>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => {
                if (aiResult.identifiedInstructions.length > 0) {
                  setReviewingInstruction(aiResult.identifiedInstructions[0]);
                } else {
                  handleSaveDocument();
                }
              }}
              icon={<CheckCircle2 className="w-5 h-5" />}
            >
              Review & Create Reminder
            </Button>
          </div>

          {/* Embedded Review Reminder Modal */}
          <ReviewReminderModal
            isOpen={!!reviewingInstruction}
            onClose={() => setReviewingInstruction(null)}
            sourceInstruction={reviewingInstruction}
            sourceDocTitle={selectedFileName.replace(/\.[^/.]+$/, '') || 'Prescription Document'}
            onConfirmSave={(confirmedReminder) => {
              onSaveCustomReminder?.(confirmedReminder);
              setReviewingInstruction(null);
            }}
          />
        </div>
      )}

      {/* ========================================================
          ERROR / UNCLEAR DOCUMENT STATE
         ======================================================== */}
      {step === 'error_state' && (
        <div className="py-4 space-y-4 animate-fadeIn">
          <div className="flex flex-col items-center justify-center p-6 text-center bg-rose-50/70 rounded-2xl border border-rose-200">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-3">
              <FileWarning className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-warm-900">
              {aiError
                ? 'AI analysis is temporarily unavailable.'
                : errorMessage.includes('clearly')
                ? "We couldn't read this document clearly."
                : 'Processing Error'}
            </h4>
            <p className="text-xs text-rose-900 max-w-xs mt-1.5 leading-relaxed font-medium">
              {aiError || errorMessage || 'Information unclear. Please verify with your healthcare professional.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              fullWidth
              size="md"
              onClick={resetScanner}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Try Again
            </Button>
            <Button
              variant="secondary"
              fullWidth
              size="md"
              onClick={() => {
                setExtractedText('');
                setStep('review_text');
              }}
              icon={<Edit3 className="w-4 h-4" />}
            >
              Edit / Enter Manually
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
