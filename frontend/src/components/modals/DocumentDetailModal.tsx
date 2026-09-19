import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { SafetyBanner } from '../layout/SafetyBanner';
import { Card } from '../ui/Card';
import { ReadAloudButton } from '../voice/ReadAloudButton';
import { DocumentVoiceQA } from '../voice/DocumentVoiceQA';
import { Calendar, Sparkles, Clock, Check, AlertTriangle, HelpCircle } from 'lucide-react';
import { DocumentItem } from '../../types';

interface DocumentDetailModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateReminderFromDoc?: (doc: DocumentItem) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  isOpen,
  onClose,
  onCreateReminderFromDoc,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'routines' | 'ask' | 'questions' | 'raw_text'>('summary');

  if (!document) return null;

  const analysis = document.analysis;
  const uncertainInfo = analysis?.uncertainInformation || [];
  const aiQuestions = analysis?.questionsForProfessional || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={document.title}
      subtitle={document.source || `${document.category} • ${document.date}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Document Header Metadata */}
        <div className="flex items-center justify-between gap-2 p-3 bg-warm-100/50 rounded-2xl border border-warm-200/80 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-warm-600 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-warm-400" />
              {document.date}
            </span>
            {document.fileSize && (
              <span className="text-xs text-warm-400">({document.fileSize})</span>
            )}
          </div>
          <StatusBadge status={document.status} size="sm" />
        </div>

        {/* Tab Switcher inside Modal */}
        <div className="grid grid-cols-5 gap-1 bg-warm-200/60 p-1 rounded-xl text-xs font-medium text-warm-700">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'summary' ? 'bg-white text-warm-900 font-bold shadow-2xs' : 'hover:text-warm-900'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('routines')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'routines' ? 'bg-white text-warm-900 font-bold shadow-2xs' : 'hover:text-warm-900'
            }`}
          >
            Routines
          </button>
          <button
            onClick={() => setActiveTab('ask')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'ask' ? 'bg-white text-warm-900 font-bold shadow-2xs' : 'hover:text-warm-900'
            }`}
          >
            Ask AI
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'questions' ? 'bg-white text-warm-900 font-bold shadow-2xs' : 'hover:text-warm-900'
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => setActiveTab('raw_text')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer text-center ${
              activeTab === 'raw_text' ? 'bg-white text-warm-900 font-bold shadow-2xs' : 'hover:text-warm-900'
            }`}
          >
            Raw OCR
          </button>
        </div>

        {/* TAB 1: Care Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-3">
            <Card className="bg-warm-100/60 border-warm-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-warm-900">
                  <Sparkles className="w-4 h-4 text-coffee-800" />
                  <span>Plain-Language Explanation</span>
                </div>
                {document.summary && (
                  <ReadAloudButton text={document.summary} />
                )}
              </div>
              <p className="text-xs text-warm-900 leading-relaxed whitespace-pre-wrap font-medium">
                {document.summary || 'No AI summary generated for this document yet.'}
              </p>
            </Card>

            {/* Unclear / Needs Verification */}
            {uncertainInfo.length > 0 && (
              <div className="p-3 bg-warm-100/60 rounded-xl border border-warm-200/80 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-warm-900 font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-caramel-600" />
                  <span>Needs Verification</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-warm-700 space-y-0.5 pl-1">
                  {uncertainInfo.map((info, idx) => (
                    <li key={idx} className="leading-snug">{info}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-[11px] text-warm-500 italic">
              "Based on the information you provided. Please verify unclear information with your healthcare professional."
            </div>

            <SafetyBanner />
          </div>
        )}

        {/* TAB 2: Extracted Routines */}
        {activeTab === 'routines' && (
          <div className="space-y-2.5">
            {document.instructions && document.instructions.length > 0 ? (
              document.instructions.map((inst, index) => (
                <div
                  key={inst.id || index}
                  className="p-3 bg-white rounded-xl border border-warm-200/80 shadow-2xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-warm-900">{inst.action}</span>
                    <span className="text-[10px] bg-warm-100 text-warm-700 px-2 py-0.5 rounded font-medium">
                      {inst.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-coffee-800 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{inst.timing}</span>
                  </div>
                  <p className="text-[11px] text-warm-600">{inst.details}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-warm-500 text-center py-4">
                No active routines extracted from this document.
              </p>
            )}
          </div>
        )}

        {/* TAB 3: Ask AI (Voice & Text Q&A) */}
        {activeTab === 'ask' && (
          <div className="space-y-3">
            <DocumentVoiceQA
              documentText={document.rawText || document.extractedText || ''}
              analysis={document.analysis}
              documentTitle={document.title}
            />
          </div>
        )}

        {/* TAB 4: Questions for Doctor */}
        {activeTab === 'questions' && (
          <div className="space-y-2.5">
            {aiQuestions.length > 0 ? (
              aiQuestions.map((qText, index) => (
                <div
                  key={index}
                  className="p-3 bg-white rounded-xl border border-warm-200/80 shadow-2xs flex items-start gap-2.5"
                >
                  <HelpCircle className="w-4 h-4 text-coffee-800 shrink-0 mt-0.5" />
                  <p className="text-xs text-warm-900 leading-relaxed font-medium">{qText}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-warm-500 text-center py-4">
                No specific doctor questions generated for this document.
              </p>
            )}
            <p className="text-[11px] text-warm-400 text-center">
              Questions are also synced to your Questions tab.
            </p>
          </div>
        )}

        {/* TAB 5: Raw OCR Text */}
        {activeTab === 'raw_text' && (
          <div className="space-y-2">
            <div className="bg-warm-100/40 rounded-xl p-3 border border-warm-200 text-xs font-mono text-warm-900 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {document.rawText || document.extractedText || 'No raw text extracted yet.'}
            </div>
            <p className="text-[11px] text-warm-500">
              Extracted via verified OCR processing.
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-2 pt-2 border-t border-warm-100">
          <Button variant="outline" size="md" onClick={onClose} fullWidth>
            Close
          </Button>
          {document.instructions && document.instructions.length > 0 && onCreateReminderFromDoc && (
            <Button
              variant="primary"
              size="md"
              fullWidth
              icon={<Check className="w-4 h-4" />}
              onClick={() => {
                onCreateReminderFromDoc(document);
                onClose();
              }}
            >
              Add to Reminders
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
