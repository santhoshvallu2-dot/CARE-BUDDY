import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { getTodayDateString } from '../../services/reminderService';
import { AlertCircle, Check } from 'lucide-react';
import { ReminderItem } from '../../types';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: ReminderItem) => void;
  initialReminder?: ReminderItem | null;
}

export const AddReminderModal: React.FC<AddReminderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialReminder,
}) => {
  const [title, setTitle] = useState('');
  const [instruction, setInstruction] = useState('');
  const [time, setTime] = useState('08:00');
  const [frequency, setFrequency] = useState('Once daily');
  const [category, setCategory] = useState<'medication' | 'routine' | 'measurement'>('medication');
  const [tag, setTag] = useState('Morning Routine');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState<{ title?: string; instruction?: string; time?: string; date?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialReminder) {
        setTitle(initialReminder.title);
        setInstruction(initialReminder.instruction);
        setFrequency(initialReminder.frequency || 'Once daily');
        setCategory(initialReminder.category || 'medication');
        setTag(initialReminder.tag || 'Routine');
        setStartDate(initialReminder.startDate || getTodayDateString());
        setEndDate(initialReminder.endDate || '');
        setNotes(initialReminder.notes || '');

        // Parse time to 24h
        const match = initialReminder.time?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (match) {
          let h = parseInt(match[1], 10);
          const m = match[2];
          const ampm = match[3]?.toUpperCase();
          if (ampm === 'PM' && h < 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          setTime(`${String(h).padStart(2, '0')}:${m}`);
        } else {
          setTime('08:00');
        }
      } else {
        setTitle('');
        setInstruction('');
        setTime('08:00');
        setFrequency('Once daily');
        setCategory('medication');
        setTag('Morning Routine');
        setNotes('');
        setStartDate(getTodayDateString());
        setEndDate('');
      }
      setErrors({});
    }
  }, [isOpen, initialReminder]);

  const validate = () => {
    const errs: { title?: string; instruction?: string; time?: string; date?: string } = {};
    if (!title.trim()) {
      errs.title = 'Item or Medicine name is required';
    }
    if (!instruction.trim()) {
      errs.instruction = 'Please enter clear care instructions provided by your doctor';
    }
    if (!time) {
      errs.time = 'Scheduled time is required';
    }
    if (endDate && startDate && endDate < startDate) {
      errs.date = 'End date cannot be earlier than start date.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Convert 24h format to 12h display
    const [hours, minutes] = time.split(':');
    const hourNum = parseInt(hours, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    const formattedTime = `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;

    const newReminder: ReminderItem = {
      id: initialReminder?.id || `rem-${Date.now()}`,
      title: title.trim(),
      instruction: instruction.trim(),
      time: formattedTime,
      frequency,
      completed: initialReminder?.completed || false,
      tag: tag.trim() || 'Care Routine',
      category,
      startDate,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined,
      sourceDocumentId: initialReminder?.sourceDocumentId,
      sourceDocumentTitle: initialReminder?.sourceDocumentTitle,
      createdAt: initialReminder?.createdAt || getTodayDateString(),
      completedDates: initialReminder?.completedDates || [],
      isDemo: false,
    };

    onSave(newReminder);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialReminder ? 'Edit Care Routine' : 'Add Care Routine'}
      subtitle="Enter instructions provided by your healthcare provider"
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4 animate-fadeIn">
        {/* Safety Guideline */}
        <div className="bg-warm-100/60 border border-warm-200/80 rounded-xl p-3 text-xs text-warm-900 leading-relaxed">
          <p className="font-semibold text-warm-900">Patient Instruction Reminder</p>
          <p className="text-warm-700 text-[11px] mt-0.5">
            Please enter information based strictly on instructions already given by your doctor or prescription label.
          </p>
        </div>

        {/* Name / Medicine */}
        <div>
          <label className="block text-xs font-bold text-warm-900 mb-1">
            Medicine or Routine Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="e.g., Metoprolol Tartrate 25mg, Blood Pressure Log"
            className={`w-full text-sm px-3.5 py-2.5 rounded-xl border ${
              errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-warm-200 focus:border-coffee-500'
            } focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900 placeholder:text-warm-400`}
          />
          {errors.title && (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" /> {errors.title}
            </p>
          )}
        </div>

        {/* Instruction Details */}
        <div>
          <label className="block text-xs font-bold text-warm-900 mb-1">
            Care Instruction / Direction <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={instruction}
            onChange={(e) => {
              setInstruction(e.target.value);
              if (errors.instruction) setErrors((prev) => ({ ...prev, instruction: undefined }));
            }}
            rows={2}
            placeholder="e.g., Take 1 tablet with food and full glass of water"
            className={`w-full text-sm p-3 rounded-xl border ${
              errors.instruction ? 'border-rose-400 bg-rose-50/20' : 'border-warm-200 focus:border-coffee-500'
            } focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900 placeholder:text-warm-400`}
          />
          {errors.instruction && (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" /> {errors.instruction}
            </p>
          )}
        </div>

        {/* Time & Frequency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-warm-900 mb-1">
              Time <span className="text-rose-500">*</span>
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
              placeholder="e.g., Morning, Night"
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-warm-200 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900 placeholder:text-warm-400"
            />
          </div>
        </div>

        {/* Start Date & Optional End Date */}
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

        {/* Doctor Notes */}
        <div>
          <label className="block text-xs font-bold text-warm-900 mb-1">
            Doctor Notes / Prescribing Info (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Prescribed by Dr. Jenkins on Oct 12"
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-warm-200 focus:border-coffee-500 focus:outline-none focus:ring-2 focus:ring-coffee-500/20 bg-white text-warm-900 placeholder:text-warm-400"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex gap-2 pt-2 border-t border-warm-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth size="md" icon={<Check className="w-4 h-4" />}>
            {initialReminder ? 'Save Changes' : 'Save Reminder'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
