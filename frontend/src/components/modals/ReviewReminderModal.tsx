import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { getTodayDateString } from '../../services/reminderService';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { ReminderItem, IdentifiedInstruction } from '../../types';

interface ReviewReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSave: (reminder: ReminderItem) => void;
  initialData?: Partial<ReminderItem> | null;
  sourceInstruction?: IdentifiedInstruction | null;
  sourceDocTitle?: string;
  sourceDocId?: string;
}

export const ReviewReminderModal: React.FC<ReviewReminderModalProps> = ({
  isOpen,
  onClose,
  onConfirmSave,
  initialData,
  sourceInstruction,
  sourceDocTitle,
  sourceDocId,
}) => {
  const [title, setTitle] = useState('');
  const [instruction, setInstruction] = useState('');
  const [time, setTime] = useState('08:00');
  const [frequency, setFrequency] = useState('Once daily');
  const [category, setCategory] = useState<'medication' | 'routine' | 'measurement'>('medication');
  const [tag, setTag] = useState('Daily Care');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ title?: string; instruction?: string; time?: string; date?: string }>({});

  // Sync state whenever modal opens with new data
  useEffect(() => {
    if (isOpen) {
      const extractedAction = sourceInstruction?.instruction || initialData?.title || '';
      const extractedDetails = sourceInstruction?.sourceText || initialData?.instruction || '';
      const extractedTiming = sourceInstruction?.timing || initialData?.time || '08:00 AM';

      setTitle(extractedAction);
      setInstruction(extractedDetails);

      // Extract time e.g. 08:00 AM to 08:00 or default
      const timeMatch = extractedTiming.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (timeMatch) {
        let h = parseInt(timeMatch[1], 10);
        const m = timeMatch[2];
        const ampm = timeMatch[3]?.toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        setTime(`${String(h).padStart(2, '0')}:${m}`);
      } else {
        setTime('08:00');
      }

      setFrequency(initialData?.frequency || (sourceInstruction?.timing?.toLowerCase().includes('twice') ? 'Twice daily' : 'Once daily'));
      setCategory(initialData?.category || (sourceInstruction?.type === 'activity' ? 'routine' : sourceInstruction?.type === 'measurement' ? 'measurement' : 'medication'));
      setTag(initialData?.tag || (sourceInstruction?.type === 'activity' ? 'Activity' : sourceInstruction?.type === 'measurement' ? 'Vital Log' : 'Prescription'));
      setStartDate(initialData?.startDate || getTodayDateString());
      setEndDate(initialData?.endDate || '');
      setNotes(initialData?.notes || (sourceDocTitle ? `Extracted from ${sourceDocTitle}` : ''));
      setErrors({});
    }
  }, [isOpen, initialData, sourceInstruction, sourceDocTitle]);

  const validate = () => {
    const errs: { title?: string; instruction?: string; time?: string; date?: string } = {};

    if (!title.trim()) {
      errs.title = 'Medicine or Item name is required.';
    }
    if (!instruction.trim()) {
      errs.instruction = 'Care instruction is required.';
    }
    if (!time) {
      errs.time = 'Scheduled time is required.';
    }
    if (endDate && startDate && endDate < startDate) {
      errs.date = 'End date cannot be earlier than start date.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Format 24h time to 12h display
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    const formattedTime = `${String(displayH).padStart(2, '0')}:${minutes} ${ampm}`;

    const confirmedReminder: ReminderItem = {
      id: initialData?.id || `rem-${Date.now()}`,
      title: title.trim(),
      instruction: instruction.trim(),
      time: formattedTime,
      frequency,
      category,
      tag: tag.trim() || 'Care Routine',
      startDate,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined,
      sourceDocumentId: sourceDocId || initialData?.sourceDocumentId,
      sourceDocumentTitle: sourceDocTitle || initialData?.sourceDocumentTitle,
      createdAt: initialData?.createdAt || getTodayDateString(),
      completedDates: initialData?.completedDates || [],
      isDemo: false,
    };

    onConfirmSave(confirmedReminder);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Reminder"
      subtitle="Please verify this information before saving."
      maxWidth="md"
    >
      <form onSubmit={handleConfirm} className="space-y-4 animate-fadeIn">
        {/* Source Reference Tag */}
        {sourceDocTitle && (
          <div className="flex items-center justify-between p-2.5 bg-warm-100/60 rounded-xl border border-warm-200/80 text-xs">
            <span className="text-warm-900 font-semibold flex items-center gap-1.5 truncate">
              <FileText className="w-3.5 h-3.5 text-coffee-800 shrink-0" />
              Source: {sourceDocTitle}
            </span>
            <span className="text-[10px] font-bold text-coffee-800 bg-warm-200 px-2 py-0.5 rounded-md shrink-0">
              Extracted from your document
            </span>
          </div>
        )}

        {/* Medicine / Item Name */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-warm-900">
              Medicine / Routine Name <span className="text-rose-500">*</span>
            </label>
            {sourceInstruction && (
              <span className="text-[10px] text-coffee-800 bg-warm-100 px-2 py-0.2 rounded-full border border-warm-200">
                Extracted from document
              </span>
            )}
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="e.g., Metoprolol Tartrate 25mg, Blood Pressure Log"
            className={`w-full text-sm px-3.5 py-2.5 rounded-xl border ${
              errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-warm-200 focus:border-coffee-500'
            } focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900 placeholder:text-warm-400`}
          />
          {errors.title ? (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" /> {errors.title}
            </p>
          ) : !title && (
            <p className="text-[11px] text-caramel-700 mt-1 font-medium">
              Not identified — please enter or verify this information.
            </p>
          )}
        </div>

        {/* Instruction Details */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-warm-900">
              Exact Instruction / Direction <span className="text-rose-500">*</span>
            </label>
            {sourceInstruction?.sourceText && (
              <span className="text-[10px] text-coffee-800 bg-warm-100 px-2 py-0.2 rounded-full border border-warm-200">
                Extracted from document
              </span>
            )}
          </div>
          <textarea
            value={instruction}
            onChange={(e) => {
              setInstruction(e.target.value);
              if (errors.instruction) setErrors((prev) => ({ ...prev, instruction: undefined }));
            }}
            rows={2}
            placeholder="e.g., Take 1 tablet with morning meal and water"
            className={`w-full text-sm p-3 rounded-xl border ${
              errors.instruction ? 'border-rose-400 bg-rose-50/30' : 'border-warm-200 focus:border-coffee-500'
            } focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900 placeholder:text-warm-400`}
          />
          {errors.instruction ? (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" /> {errors.instruction}
            </p>
          ) : !instruction && (
            <p className="text-[11px] text-caramel-700 mt-1 font-medium">
              Not identified — please enter or verify this information.
            </p>
          )}
        </div>

        {/* Time & Frequency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-warm-900 mb-1">
              Scheduled Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-warm-200 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-warm-900 mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-warm-200 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900"
            >
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Every 8 hours">Every 8 hours</option>
              <option value="As needed">As needed</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
        </div>

        {/* Category & Routine Tag */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-warm-900 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'medication' | 'routine' | 'measurement')}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-warm-200 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900"
            >
              <option value="medication">Medication</option>
              <option value="routine">Routine Activity</option>
              <option value="measurement">Vital / Measurement</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-warm-900 mb-1">Routine Tag</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g., Morning, Bedtime"
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-warm-200 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900 placeholder:text-warm-400"
            />
          </div>
        </div>

        {/* Start Date & End Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-warm-900 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-warm-200 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-warm-900 mb-1">End Date (Optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-warm-200 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900"
            />
          </div>
        </div>
        {errors.date && (
          <p className="text-[11px] text-rose-600 -mt-2 font-medium">{errors.date}</p>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-warm-900 mb-1">
            Notes / Doctor Prescribing Info (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Prescribed by Dr. Jenkins"
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-warm-200 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900 placeholder:text-warm-400"
          />
        </div>

        {/* Healthcare Verification Notice */}
        <div className="bg-warm-100/60 border border-warm-200/80 rounded-xl p-3 text-xs text-warm-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-caramel-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-warm-900">Patient Verification Confirmation</p>
            <p className="text-[11px] text-warm-700 mt-0.5 leading-relaxed">
              Please make sure these details match the instructions provided by your healthcare professional before saving.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-warm-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="md"
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm & Save Reminder
          </Button>
        </div>
      </form>
    </Modal>
  );
};
