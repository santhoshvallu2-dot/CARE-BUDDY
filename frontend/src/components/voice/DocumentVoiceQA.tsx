import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Mic,
  Volume2,
  Square,
  Sparkles,
  Send,
  AlertCircle,
  RotateCcw,
  FileText
} from 'lucide-react';
import {
  isSpeechRecognitionSupported,
  startSpeechRecognition,
  stopSpeechRecognition,
  speakText,
  stopSpeaking,
} from '../../services/speechService';
import { askDocumentQuestion } from '../../services/ai/aiService';
import { CareAnalysisResult, DocumentQuestionAnswer } from '../../services/ai/types';

interface DocumentVoiceQAProps {
  documentText: string;
  analysis?: CareAnalysisResult;
  documentTitle?: string;
  onQuestionResolved?: (questionText: string) => void;
}

type QAState = 'idle' | 'listening' | 'processing' | 'result' | 'error';

export const DocumentVoiceQA: React.FC<DocumentVoiceQAProps> = ({
  documentText,
  analysis,
  documentTitle = 'Current Document',
}) => {
  const [qaState, setQaState] = useState<QAState>('idle');
  const [queryText, setQueryText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [answerResult, setAnswerResult] = useState<DocumentQuestionAnswer | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const isMicSupported = isSpeechRecognitionSupported();

  // Cleanup active audio/speech on unmount
  useEffect(() => {
    return () => {
      stopSpeechRecognition();
      stopSpeaking();
    };
  }, []);

  // 1. Handle Voice Input via Microphone
  const handleStartListening = () => {
    if (!isMicSupported) {
      setErrorMessage('Voice input is not supported on this browser. You can type your question instead.');
      setQaState('error');
      return;
    }

    setErrorMessage('');
    setIsPermissionDenied(false);
    setInterimTranscript('');
    setQaState('listening');

    startSpeechRecognition({
      onStart: () => {
        setQaState('listening');
      },
      onResult: (transcript, isFinal) => {
        setInterimTranscript(transcript);
        setQueryText(transcript);
        if (isFinal && transcript.trim().length > 0) {
          stopSpeechRecognition();
          executeAskQuestion(transcript);
        }
      },
      onError: (msg, isDenied) => {
        setErrorMessage(msg);
        setIsPermissionDenied(Boolean(isDenied));
        setQaState('error');
      },
      onEnd: () => {
        if (qaState === 'listening') {
          // If we captured something, submit it, otherwise return to idle
          if (queryText.trim().length > 0) {
            executeAskQuestion(queryText);
          } else {
            setQaState('idle');
          }
        }
      },
    });
  };

  const handleStopListening = () => {
    stopSpeechRecognition();
    if (queryText.trim().length > 0) {
      executeAskQuestion(queryText);
    } else {
      setQaState('idle');
    }
  };

  // 2. Execute Document Question Request
  const executeAskQuestion = async (questionToAsk: string) => {
    const text = questionToAsk.trim();
    if (!text) return;

    setQaState('processing');
    try {
      const result = await askDocumentQuestion(documentText, analysis, text);
      setAnswerResult(result);
      setQaState('result');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to answer question.';
      setErrorMessage(msg);
      setQaState('error');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryText.trim()) {
      executeAskQuestion(queryText);
    }
  };

  // 3. Text-to-Speech playback for answer
  const handleToggleAudio = () => {
    if (isAudioPlaying) {
      stopSpeaking();
      setIsAudioPlaying(false);
    } else if (answerResult?.answer) {
      setIsAudioPlaying(true);
      speakText(answerResult.answer, {
        onStart: () => setIsAudioPlaying(true),
        onEnd: () => setIsAudioPlaying(false),
        onError: () => setIsAudioPlaying(false),
      });
    }
  };

  const handleReset = () => {
    stopSpeaking();
    stopSpeechRecognition();
    setIsAudioPlaying(false);
    setQueryText('');
    setInterimTranscript('');
    setAnswerResult(null);
    setErrorMessage('');
    setQaState('idle');
  };

  const quickQuestions = [
    'Can you explain this instruction simply?',
    'When should I take this medication?',
    'What should I ask my doctor about this?',
  ];

  return (
    <Card className="bg-warm-100/50 border-warm-200/80 p-4 sm:p-5 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-warm-200 text-coffee-800 flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-warm-900">Ask about this document</h4>
            <p className="text-[11px] text-warm-500">Voice or text questions strictly answered from verified text</p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-coffee-800 bg-warm-200 px-2 py-0.5 rounded-full border border-warm-300/80">
          Safe AI Scope
        </span>
      </div>

      {/* ========================================================
          STATE 1: IDLE / FORM
         ======================================================== */}
      {qaState === 'idle' && (
        <div className="space-y-3 animate-fadeIn">
          {/* Large Mobile Microphone CTA */}
          <div className="flex flex-col items-center justify-center p-4 bg-warm-100/60 rounded-2xl border border-warm-200/70 text-center space-y-2">
            <button
              type="button"
              onClick={handleStartListening}
              aria-label="Tap to speak your question"
              className="w-16 h-16 rounded-full bg-coffee-800 hover:bg-coffee-900 active:scale-95 text-warm-50 flex items-center justify-center shadow-2xs transition-all cursor-pointer group"
            >
              <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </button>
            <div>
              <span className="text-xs font-bold text-warm-900 block">Tap microphone to speak</span>
              <span className="text-[11px] text-warm-600">Or type your question below</span>
            </div>
          </div>

          {/* Quick Question Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-warm-400 uppercase tracking-wider block">
              Suggested Questions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQueryText(q);
                    executeAskQuestion(q);
                  }}
                  className="text-left text-xs bg-white hover:bg-warm-100 text-warm-800 hover:text-coffee-900 px-2.5 py-1.5 rounded-xl border border-warm-200/80 hover:border-warm-300 transition-colors shadow-2xs cursor-pointer leading-snug"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Fallback Form */}
          <form onSubmit={handleFormSubmit} className="pt-1 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Type your question..."
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-warm-200 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900 placeholder:text-warm-400"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!queryText.trim()}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Ask
            </Button>
          </form>
        </div>
      )}

      {/* ========================================================
          STATE 2: LISTENING STATE
         ======================================================== */}
      {qaState === 'listening' && (
        <div className="py-6 px-4 bg-warm-100/70 rounded-2xl border border-warm-300/80 text-center space-y-4 animate-fadeIn">
          {/* Animated Pulsing Wave */}
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-coffee-500/20 animate-ping absolute" />
            <div className="w-16 h-16 rounded-full bg-coffee-800 text-warm-50 flex items-center justify-center relative shadow-2xs">
              <Mic className="w-7 h-7 animate-pulse" />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-warm-900">Listening to your voice...</h4>
            <p className="text-xs text-warm-700 mt-1 max-w-xs mx-auto italic min-h-[20px]">
              {interimTranscript ? `"${interimTranscript}"` : 'Speak clearly near your phone...'}
            </p>
          </div>

          <div className="flex justify-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleStopListening}
              icon={<Square className="w-3.5 h-3.5" />}
            >
              Done Speaking
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================
          STATE 3: PROCESSING
         ======================================================== */}
      {qaState === 'processing' && (
        <div className="py-8 text-center space-y-3 bg-warm-100/40 rounded-2xl border border-warm-200/70 animate-fadeIn">
          <div className="w-10 h-10 rounded-2xl bg-warm-200 text-coffee-800 flex items-center justify-center mx-auto animate-spin">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-warm-900">Understanding your question...</h4>
            <p className="text-[11px] text-warm-600 mt-0.5">Matching strictly against verified document text</p>
          </div>
        </div>
      )}

      {/* ========================================================
          STATE 4: RESULT
         ======================================================== */}
      {qaState === 'result' && answerResult && (
        <div className="space-y-3.5 animate-fadeIn">
          {/* User Question Bubble */}
          <div className="bg-warm-100/70 rounded-xl p-2.5 text-xs text-warm-800">
            <span className="text-[10px] font-bold text-warm-400 uppercase tracking-wider block mb-0.5">
              Your Question
            </span>
            <p className="font-semibold text-warm-900">"{answerResult.question}"</p>
          </div>

          {/* AI Grounded Answer */}
          <div className="bg-white rounded-2xl p-4 border border-warm-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-warm-900">
                <Sparkles className="w-4 h-4 text-coffee-800" />
                <span>CareBuddy Explanation</span>
              </div>

              {/* Text to Speech Button */}
              <button
                type="button"
                onClick={handleToggleAudio}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isAudioPlaying
                    ? 'bg-coffee-800 text-warm-50 shadow-2xs'
                    : 'bg-warm-100 text-coffee-800 hover:bg-warm-200 border border-warm-200/80'
                }`}
              >
                {isAudioPlaying ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read aloud</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-warm-900 leading-relaxed whitespace-pre-wrap">
              {answerResult.answer}
            </p>

            {/* Source Document Citation */}
            {answerResult.sourceSnippets.length > 0 && (
              <div className="bg-warm-100/40 rounded-xl p-2 border border-warm-200/60 text-[11px] text-warm-700 space-y-1">
                <span className="font-bold text-warm-800 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-coffee-800" />
                  Source: {documentTitle}
                </span>
                <p className="italic text-warm-500 truncate">
                  "{answerResult.sourceSnippets[0]}"
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Ask another question
            </Button>

            <span className="text-[10px] text-warm-400 italic">
              Verified document scope
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          STATE 5: ERROR / PERMISSION DENIED
         ======================================================== */}
      {qaState === 'error' && (
        <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200/80 space-y-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h5 className="text-xs font-bold text-rose-950">
                {isPermissionDenied ? 'Microphone Permission Needed' : 'Voice Input Notice'}
              </h5>
              <p className="text-[11px] text-rose-900 mt-0.5 leading-relaxed">
                {errorMessage || 'Microphone permission is required for voice input. You can continue by typing.'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="bg-white"
            >
              Continue by typing
            </Button>
          </div>
        </div>
      )}

      {/* Health Safety Boundaries Notice */}
      <div className="text-[10px] text-warm-500 leading-tight pt-1">
        CareBuddy answers strictly from your uploaded document. It never provides medical diagnoses or alters dosages.
      </div>
    </Card>
  );
};
