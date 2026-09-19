import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DocumentItem, ReminderItem, QuestionItem } from '../../types';
import { HandoffSelectionOptions, CaregiverHandoffData } from '../../types/handoff';
import {
  createHandoffPayload,
  encodeHandoffData,
  saveHandoffSession
} from '../../services/handoff/handoffService';
import { generateQRCodeSVG } from '../../services/handoff/qrGenerator';
import {
  ShieldCheck,
  Copy,
  Check,
  Download,
  Clock,
  HelpCircle,
  FileText,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface CaregiverHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  documents: DocumentItem[];
  reminders: ReminderItem[];
  questions: QuestionItem[];
}

export const CaregiverHandoffModal: React.FC<CaregiverHandoffModalProps> = ({
  isOpen,
  onClose,
  patientName,
  documents,
  reminders,
  questions,
}) => {
  const [step, setStep] = useState<'select' | 'share'>('select');
  const [copied, setCopied] = useState(false);
  const [handoffData, setHandoffData] = useState<CaregiverHandoffData | null>(null);
  const [encodedPayload, setEncodedPayload] = useState<string>('');

  const [options, setOptions] = useState<HandoffSelectionOptions>({
    shareSummary: true,
    shareTodayRoutines: true,
    shareReminders: true,
    shareQuestions: true,
  });

  const handleGenerateHandoff = () => {
    const payload = createHandoffPayload(
      patientName,
      options,
      documents,
      reminders,
      questions
    );
    const encoded = encodeHandoffData(payload);
    saveHandoffSession(payload);
    setHandoffData(payload);
    setEncodedPayload(encoded);
    setStep('share');
  };

  const handleCopy = () => {
    if (!encodedPayload) return;
    navigator.clipboard.writeText(encodedPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJSON = () => {
    if (!handoffData) return;
    const blob = new Blob([JSON.stringify(handoffData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carebuddy-handoff-${handoffData.transferCode}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setStep('select');
    setHandoffData(null);
    setEncodedPayload('');
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={step === 'select' ? 'Share with Caregiver' : 'Caregiver Handoff Ready'}
      subtitle={
        step === 'select'
          ? 'Securely transfer verified care routines to a family member or caregiver PC.'
          : 'Caregiver can scan the QR code or enter the 6-digit sync code.'
      }
      maxWidth="md"
    >
      <div className="space-y-4">
        {step === 'select' ? (
          <>
            {/* Privacy and Scope Shield */}
            <div className="bg-[#f2f8f2] border border-[#d2ebd2] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-[#1c4d1c]">
              <ShieldCheck className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#143d14]">Privacy & Safety Controlled</p>
                <p className="text-[11px] text-[#285e28] mt-0.5 leading-relaxed">
                  Only the specific sections checked below will be shared. Internal raw notes, system credentials, and unverified data are never transferred.
                </p>
              </div>
            </div>

            {/* Checkbox item selectors */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-warm-700 uppercase tracking-wider">
                Select Information to Share
              </p>

              {/* 1. Care Summary */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-warm-200 bg-white hover:bg-warm-50/70 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-warm-100 flex items-center justify-center text-warm-700">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-warm-900">Care Plan Summary</p>
                    <p className="text-[11px] text-warm-500">Plain-language doctor instructions & timings</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={options.shareSummary}
                  onChange={(e) => setOptions({ ...options, shareSummary: e.target.checked })}
                  className="w-4 h-4 accent-warm-900 rounded cursor-pointer"
                />
              </label>

              {/* 2. Today's Care Routine & Progress */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-warm-200 bg-white hover:bg-warm-50/70 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-natural-greenBg flex items-center justify-center text-natural-greenText">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-warm-900">Today's Care Progress</p>
                    <p className="text-[11px] text-warm-500">Active doses scheduled & completed today</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={options.shareTodayRoutines}
                  onChange={(e) => setOptions({ ...options, shareTodayRoutines: e.target.checked })}
                  className="w-4 h-4 accent-warm-900 rounded cursor-pointer"
                />
              </label>

              {/* 3. Full Reminders Schedule */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-warm-200 bg-white hover:bg-warm-50/70 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-caramel-50 flex items-center justify-center text-caramel-700">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-warm-900">Medication Schedule</p>
                    <p className="text-[11px] text-warm-500">{reminders.length} active routine items</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={options.shareReminders}
                  onChange={(e) => setOptions({ ...options, shareReminders: e.target.checked })}
                  className="w-4 h-4 accent-warm-900 rounded cursor-pointer"
                />
              </label>

              {/* 4. Doctor Questions */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-warm-200 bg-white hover:bg-warm-50/70 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-warm-900">Doctor Appointment Questions</p>
                    <p className="text-[11px] text-warm-500">{questions.length} saved questions to discuss</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={options.shareQuestions}
                  onChange={(e) => setOptions({ ...options, shareQuestions: e.target.checked })}
                  className="w-4 h-4 accent-warm-900 rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="pt-2 flex gap-2.5">
              <Button variant="ghost" fullWidth onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={handleGenerateHandoff}
                disabled={!options.shareSummary && !options.shareTodayRoutines && !options.shareReminders && !options.shareQuestions}
              >
                Confirm &amp; Generate Handoff
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Share Screen */}
            <div className="text-center space-y-3">
              {/* QR Code display */}
              <div className="inline-block p-3 bg-white rounded-2xl border border-warm-200 shadow-xs">
                <div
                  className="w-48 h-48 mx-auto flex items-center justify-center"
                  dangerouslySetInnerHTML={{
                    __html: generateQRCodeSVG(
                      `carebuddy://handoff?code=${handoffData?.transferCode}&id=${handoffData?.sessionId}`,
                      192
                    ),
                  }}
                />
              </div>

              {/* 6-digit Sync Code */}
              <div className="bg-[#faeedb] border border-[#f5d7b5] rounded-2xl p-3 max-w-xs mx-auto text-center">
                <p className="text-[11px] font-bold text-[#6b3510] uppercase tracking-wider">
                  Caregiver Sync Code
                </p>
                <p className="text-2xl font-black text-[#421f08] tracking-widest mt-0.5 font-mono">
                  {handoffData?.transferCode}
                </p>
                <p className="text-[10px] text-[#7a3f16] mt-0.5">
                  Valid for 24 hours on caregiver PC
                </p>
              </div>

              <p className="text-xs text-warm-600 max-w-xs mx-auto">
                On the caregiver laptop, click <strong>"Receive Care Handoff"</strong> and enter this 6-digit code or paste the handoff string.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                variant="secondary"
                fullWidth
                icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                onClick={handleCopy}
              >
                {copied ? 'Handoff Code Copied!' : 'Copy Handoff Transfer String'}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  fullWidth
                  size="sm"
                  icon={<Download className="w-3.5 h-3.5" />}
                  onClick={handleDownloadJSON}
                >
                  Download JSON
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  size="sm"
                  onClick={handleReset}
                >
                  Done
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
