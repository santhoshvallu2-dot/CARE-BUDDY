import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Stethoscope, Plus } from 'lucide-react';
import { QuestionItem } from '../../types';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: QuestionItem) => void;
  availableDocs?: string[];
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  availableDocs = ['Care Instructions — Cardiology', 'Discharge Summary', 'General Health'],
}) => {
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState('Medication Clarification');
  const [sourceDoc, setSourceDoc] = useState(availableDocs[0] || 'General');
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setError('Please enter the question you wish to discuss.');
      return;
    }

    const newQuestion: QuestionItem = {
      id: `q-${Date.now()}`,
      question: questionText.trim(),
      category,
      sourceDoc,
      resolved: false,
      createdAt: 'Today',
    };

    onSave(newQuestion);
    setQuestionText('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Question for Doctor"
      subtitle="Organize questions for your next appointment"
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-warm-100/60 border border-warm-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-warm-900 leading-relaxed">
          <Stethoscope className="w-4 h-4 text-coffee-800 shrink-0 mt-0.5" />
          <p className="text-[11px] text-warm-700">
            Write down any uncertainty about timing, symptoms, or missed doses to discuss during your consultation.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-warm-900 mb-1">
            Question <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={questionText}
            onChange={(e) => {
              setQuestionText(e.target.value);
              if (error) setError('');
            }}
            rows={3}
            placeholder="e.g., Can I take this medicine on an empty stomach if I am fasting?"
            className="w-full text-sm p-3 rounded-xl border border-warm-200 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900 placeholder:text-warm-400"
          />
          {error && <p className="text-[11px] text-rose-600 mt-1 font-medium">{error}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-warm-900 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-warm-200 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900"
            >
              <option value="Medication Clarification">Medication Timing</option>
              <option value="Side Effects">Symptoms / Side Effects</option>
              <option value="Diet & Activity">Diet & Activity</option>
              <option value="Follow-up">Next Appointment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-warm-900 mb-1">Related Document</label>
            <select
              value={sourceDoc}
              onChange={(e) => setSourceDoc(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-warm-200 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900"
            >
              {availableDocs.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
              <option value="General Health Note">General Health Note</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-warm-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth size="md" icon={<Plus className="w-4 h-4" />}>
            Save Question
          </Button>
        </div>
      </form>
    </Modal>
  );
};
