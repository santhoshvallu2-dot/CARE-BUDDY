import React from 'react';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { CheckCircle2, Circle, FileText, Trash2, RotateCcw, Stethoscope } from 'lucide-react';
import { QuestionItem } from '../../types';

interface QuestionCardProps {
  question: QuestionItem;
  onToggleResolved?: (id: string) => void;
  onDelete?: (question: QuestionItem) => void;
  onViewSourceDoc?: (sourceDocTitle: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onToggleResolved,
  onDelete,
  onViewSourceDoc,
}) => {
  return (
    <Card
      className={`transition-all duration-200 border-warm-200/80 ${
        question.resolved
          ? 'bg-warm-50/70 border-warm-200/60 opacity-85'
          : 'bg-white hover:border-warm-300 shadow-2xs'
      }`}
    >
      <div className="space-y-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-warm-900 bg-warm-100 px-2 py-0.5 rounded-md border border-warm-200/80 flex items-center gap-1">
              <Stethoscope className="w-2.5 h-2.5 text-caramel-600" />
              {question.category || 'Doctor Discussion'}
            </span>
            <span className="text-[11px] text-warm-500">
              {question.createdAt}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <StatusBadge variant={question.resolved ? 'completed' : 'warning'} size="sm">
              {question.resolved ? 'Discussed' : 'To Discuss'}
            </StatusBadge>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(question)}
                aria-label={`Delete question: ${question.question}`}
                className="p-1.5 text-warm-400 hover:text-natural-redText hover:bg-natural-redBg rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Question Content */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onToggleResolved?.(question.id)}
            aria-label={question.resolved ? 'Mark question as To Discuss' : 'Mark question as Discussed'}
            className="mt-0.5 shrink-0 p-1 text-warm-400 hover:text-warm-900 transition-colors cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-500 min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            {question.resolved ? (
              <CheckCircle2 className="w-5 h-5 text-natural-greenText fill-[#d7e6d3]" />
            ) : (
              <Circle className="w-5 h-5 text-warm-300 hover:text-warm-800" />
            )}
          </button>

          <p
            className={`text-sm leading-relaxed font-semibold flex-1 ${
              question.resolved ? 'line-through text-warm-400 font-normal' : 'text-warm-900'
            }`}
          >
            {question.question}
          </p>
        </div>

        {/* Footer Meta & Action Row */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-warm-200/60 text-xs">
          {question.sourceDoc ? (
            <button
              type="button"
              onClick={() => onViewSourceDoc?.(question.sourceDoc!)}
              className="flex items-center gap-1.5 text-[11px] text-warm-800 hover:text-warm-950 hover:underline bg-warm-100 px-2 py-1 rounded-lg border border-warm-200/80 truncate max-w-[200px] cursor-pointer"
              title={`Source document: ${question.sourceDoc}`}
            >
              <FileText className="w-3 h-3 text-warm-600 shrink-0" />
              <span className="truncate">{question.sourceDoc}</span>
            </button>
          ) : (
            <span className="text-[11px] text-warm-400 italic">User added note</span>
          )}

          {/* Direct Mark / Undo Button */}
          <button
            type="button"
            onClick={() => onToggleResolved?.(question.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer min-h-[36px] ${
              question.resolved
                ? 'bg-warm-100 text-warm-800 hover:bg-warm-200'
                : 'bg-warm-100 text-warm-900 hover:bg-warm-200 border border-warm-200'
            }`}
          >
            {question.resolved ? (
              <>
                <RotateCcw className="w-3 h-3 text-warm-500" />
                <span>Undo</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-natural-greenText" />
                <span>Mark Discussed</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};
