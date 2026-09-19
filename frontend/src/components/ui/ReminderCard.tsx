import React from 'react';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import {
  CheckCircle2,
  Circle,
  Clock,
  Pill,
  Activity,
  Info,
  Edit2,
  Trash2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { ReminderItem } from '../../types';

interface ReminderCardProps {
  reminder: ReminderItem;
  onToggleComplete?: (id: string) => void;
  onEdit?: (reminder: ReminderItem) => void;
  onDelete?: (reminder: ReminderItem) => void;
  onViewSource?: (sourceDocTitle: string, sourceDocId?: string) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onToggleComplete,
  onEdit,
  onDelete,
  onViewSource,
}) => {
  const getCategoryIcon = () => {
    switch (reminder.category) {
      case 'medication':
        return <Pill className="w-4 h-4 text-warm-800" />;
      case 'routine':
        return <Activity className="w-4 h-4 text-warm-800" />;
      case 'measurement':
        return <Clock className="w-4 h-4 text-warm-800" />;
      default:
        return <Clock className="w-4 h-4 text-warm-800" />;
    }
  };

  const isCompleted = !!reminder.completed;
  const isMissed = reminder.status === 'missed' && !isCompleted;

  return (
    <Card
      className={`relative transition-all duration-200 border-warm-200/80 ${
        isCompleted
          ? 'bg-warm-50/70 border-warm-200/60 opacity-85'
          : isMissed
          ? 'bg-[#fefbee] border-[#f5e9bd]'
          : 'bg-white hover:border-warm-300 shadow-2xs'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Toggle Complete Button */}
        <button
          onClick={() => onToggleComplete?.(reminder.id)}
          aria-label={isCompleted ? `Mark ${reminder.title} as incomplete` : `Mark ${reminder.title} as done`}
          className="mt-1 shrink-0 p-1 text-warm-400 hover:text-warm-900 active:scale-90 transition-transform cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-500"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-natural-greenText fill-[#d7e6d3]" />
          ) : (
            <Circle className={`w-6 h-6 ${isMissed ? 'text-[#8a6800] hover:text-warm-900' : 'text-warm-300 hover:text-warm-800'} transition-colors`} />
          )}
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                  isCompleted
                    ? 'bg-warm-200/70 text-warm-600'
                    : isMissed
                    ? 'bg-[#fef9ec] text-[#594002] border border-[#faeab7] font-bold'
                    : 'bg-warm-100 text-warm-900 border border-warm-200/90'
                }`}
              >
                <Clock className="w-3 h-3" />
                {reminder.time}
              </span>

              {reminder.frequency && (
                <span className="text-[11px] font-medium text-warm-600 bg-warm-100 px-2 py-0.5 rounded border border-warm-200/60">
                  {reminder.frequency}
                </span>
              )}

              {reminder.isDemo && (
                <StatusBadge variant="demo" size="sm">
                  DEMO
                </StatusBadge>
              )}

              {reminder.tag && (
                <span className="text-[11px] font-medium text-warm-500">
                  {reminder.tag}
                </span>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5">
              {isCompleted ? (
                <StatusBadge variant="completed" size="sm">
                  Done
                </StatusBadge>
              ) : isMissed ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#594002] bg-[#fef9ec] px-2 py-0.5 rounded-full border border-[#faeab7]">
                  <AlertCircle className="w-3 h-3" /> Missed routine
                </span>
              ) : (
                <StatusBadge variant="upcoming" size="sm">
                  Upcoming
                </StatusBadge>
              )}
            </div>
          </div>

          {/* Title & Icon */}
          <div className="flex items-center gap-2 mt-2">
            <span className="p-1 rounded-md bg-warm-100 shrink-0">{getCategoryIcon()}</span>
            <h4
              className={`text-sm font-bold truncate ${
                isCompleted ? 'line-through text-warm-400 font-medium' : 'text-warm-900'
              }`}
            >
              {reminder.title}
            </h4>
          </div>

          {/* Instruction */}
          <p className="text-xs text-warm-800 mt-1 leading-relaxed pl-6 font-medium">
            {reminder.instruction}
          </p>

          {/* Notes */}
          {reminder.notes && (
            <div className="mt-1.5 pl-6 flex items-center gap-1.5 text-[11px] text-warm-500">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{reminder.notes}</span>
            </div>
          )}

          {/* Source Document Link */}
          {reminder.sourceDocumentTitle && (
            <div className="mt-2 pl-6 flex items-center gap-2">
              <button
                onClick={() => onViewSource?.(reminder.sourceDocumentTitle!, reminder.sourceDocumentId)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-warm-800 bg-warm-100 hover:bg-warm-200 px-2 py-0.5 rounded-lg border border-warm-200/80 transition-colors cursor-pointer"
              >
                <FileText className="w-3 h-3 text-warm-600" />
                Source: {reminder.sourceDocumentTitle} &rarr;
              </button>
            </div>
          )}

          {/* Footer Card Controls */}
          <div className="mt-3 pt-2.5 border-t border-warm-200/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(reminder)}
                  className="text-xs font-semibold text-warm-600 hover:text-warm-950 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-warm-100 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(reminder)}
                  className="text-xs font-semibold text-natural-redText hover:text-red-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-natural-redBg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              )}
            </div>

            {/* Quick Action Toggle Button */}
            <button
              onClick={() => onToggleComplete?.(reminder.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-warm-200 text-warm-800 hover:bg-warm-300'
                  : 'bg-warm-900 text-warm-50 hover:bg-warm-800 shadow-2xs'
              }`}
            >
              {isCompleted ? '✓ Done (Undo)' : 'Mark Done'}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};
