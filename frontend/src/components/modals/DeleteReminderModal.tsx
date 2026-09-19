import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { ReminderItem } from '../../types';

interface DeleteReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
  reminder: ReminderItem | null;
}

export const DeleteReminderModal: React.FC<DeleteReminderModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  reminder,
}) => {
  if (!reminder) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Reminder?"
      subtitle="Remove this routine from your schedule"
      maxWidth="sm"
    >
      <div className="space-y-4 animate-fadeIn">
        <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-200 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-warm-900">{reminder.title}</h4>
            <p className="text-xs text-warm-600 mt-0.5">{reminder.time} • {reminder.instruction}</p>
          </div>
        </div>

        <p className="text-xs text-warm-700 leading-relaxed">
          Are you sure you want to delete this reminder? This action cannot be undone.
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
              onConfirmDelete(reminder.id);
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
