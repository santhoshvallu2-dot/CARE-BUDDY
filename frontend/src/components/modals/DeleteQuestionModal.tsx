import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { QuestionItem } from '../../types';

interface DeleteQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
  question: QuestionItem | null;
}

export const DeleteQuestionModal: React.FC<DeleteQuestionModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  question,
}) => {
  if (!question) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Question?"
      subtitle="Remove this question from your consultation list"
      maxWidth="sm"
    >
      <div className="space-y-4 animate-fadeIn">
        <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-200 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-warm-900 leading-snug line-clamp-2">{question.question}</h4>
            {question.sourceDoc && (
              <p className="text-[11px] text-warm-600 mt-1 truncate">Doc: {question.sourceDoc}</p>
            )}
          </div>
        </div>

        <p className="text-xs text-warm-700 leading-relaxed">
          Are you sure you want to delete this question? You can always add it again later or scan the document to regenerate questions.
        </p>

        <div className="flex gap-2 pt-2 border-t border-warm-100">
          <Button variant="outline" size="md" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            fullWidth
            onClick={() => {
              onConfirmDelete(question.id);
              onClose();
            }}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
