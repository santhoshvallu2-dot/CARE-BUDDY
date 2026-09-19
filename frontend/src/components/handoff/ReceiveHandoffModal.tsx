import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CaregiverHandoffData } from '../../types/handoff';
import { decodeHandoffData, getHandoffSessionByCode } from '../../services/handoff/handoffService';
import {
  Upload,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface ReceiveHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHandoffLoaded: (data: CaregiverHandoffData) => void;
}

export const ReceiveHandoffModal: React.FC<ReceiveHandoffModalProps> = ({
  isOpen,
  onClose,
  onHandoffLoaded,
}) => {
  const [tab, setTab] = useState<'code' | 'paste' | 'file'>('code');
  const [syncCode, setSyncCode] = useState('');
  const [pasteString, setPasteString] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookupCode = () => {
    setErrorMsg('');
    const cleanCode = syncCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Please enter a 6-digit sync code.');
      return;
    }

    const data = getHandoffSessionByCode(cleanCode);
    if (!data) {
      setErrorMsg(`No active handoff session found for code "${cleanCode}". Verify the code or paste the transfer string.`);
      return;
    }

    onHandoffLoaded(data);
    onClose();
  };

  const handleDecodePaste = () => {
    setErrorMsg('');
    if (!pasteString.trim()) {
      setErrorMsg('Please paste the handoff transfer string or JSON.');
      return;
    }

    try {
      const data = decodeHandoffData(pasteString);
      onHandoffLoaded(data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid handoff data format.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = decodeHandoffData(text);
        onHandoffLoaded(data);
        onClose();
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to parse handoff JSON file.');
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receive Care Handoff"
      subtitle="Import verified patient care routines and doctor instructions to this caregiver device."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex bg-warm-100 p-1 rounded-xl border border-warm-200">
          <button
            onClick={() => { setTab('code'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'code' ? 'bg-white text-warm-900 shadow-2xs' : 'text-warm-600 hover:text-warm-900'
            }`}
          >
            6-Digit Code
          </button>
          <button
            onClick={() => { setTab('paste'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'paste' ? 'bg-white text-warm-900 shadow-2xs' : 'text-warm-600 hover:text-warm-900'
            }`}
          >
            Paste Transfer String
          </button>
          <button
            onClick={() => { setTab('file'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'file' ? 'bg-white text-warm-900 shadow-2xs' : 'text-warm-600 hover:text-warm-900'
            }`}
          >
            Import JSON
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: 6-Digit Code Entry */}
        {tab === 'code' && (
          <div className="space-y-3.5 py-1">
            <div className="text-center space-y-1">
              <label className="text-xs font-bold text-warm-700 uppercase tracking-wider block">
                Enter Caregiver Sync Code
              </label>
              <p className="text-[11px] text-warm-500">
                Found under "Share with Caregiver" on the patient's phone
              </p>
            </div>

            <input
              type="text"
              maxLength={8}
              placeholder="e.g. 8K2M9P"
              value={syncCode}
              onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
              className="w-full text-center text-2xl tracking-widest font-black uppercase font-mono py-3 rounded-2xl border-2 border-warm-300 focus:border-warm-900 focus:outline-hidden bg-white shadow-2xs"
            />

            <Button
              variant="primary"
              fullWidth
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={handleLookupCode}
              disabled={!syncCode.trim()}
            >
              Load Patient Care Plan
            </Button>
          </div>
        )}

        {/* Tab 2: Paste String */}
        {tab === 'paste' && (
          <div className="space-y-3 py-1">
            <label className="text-xs font-bold text-warm-700 block">
              Paste Encoded Handoff String
            </label>
            <textarea
              rows={4}
              placeholder="Paste the Base64 handoff payload here..."
              value={pasteString}
              onChange={(e) => setPasteString(e.target.value)}
              className="w-full p-3 text-xs font-mono rounded-xl border border-warm-300 focus:border-warm-900 focus:outline-hidden bg-white"
            />
            <Button
              variant="primary"
              fullWidth
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={handleDecodePaste}
              disabled={!pasteString.trim()}
            >
              Decode &amp; View Care Plan
            </Button>
          </div>
        )}

        {/* Tab 3: File Upload */}
        {tab === 'file' && (
          <div className="space-y-3 py-2 text-center">
            <label className="border-2 border-dashed border-warm-300 hover:border-warm-600 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white transition-colors">
              <Upload className="w-8 h-8 text-warm-400 mb-2" />
              <p className="text-xs font-bold text-warm-800">Select Handoff JSON File</p>
              <p className="text-[11px] text-warm-500 mt-0.5">carebuddy-handoff-*.json</p>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        <div className="pt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
