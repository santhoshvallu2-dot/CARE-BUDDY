import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { QuestionCard } from '../components/ui/QuestionCard';
import { EmptyState } from '../components/ui/EmptyState';
import { SafetyBanner } from '../components/layout/SafetyBanner';
import { Plus, Stethoscope, HelpCircle, AlertCircle } from 'lucide-react';
import { QuestionItem } from '../types';

interface QuestionsPageProps {
  questions: QuestionItem[];
  onToggleResolved: (id: string) => void;
  onOpenAddQuestion: () => void;
  onDeleteQuestion?: (question: QuestionItem) => void;
  onViewSourceDoc?: (sourceDocTitle: string) => void;
}

export const QuestionsPage: React.FC<QuestionsPageProps> = ({
  questions,
  onToggleResolved,
  onOpenAddQuestion,
  onDeleteQuestion,
  onViewSourceDoc,
}) => {
  const [filter, setFilter] = useState<'to_discuss' | 'discussed' | 'all'>('to_discuss');

  const toDiscussCount = questions.filter((q) => !q.resolved).length;
  const discussedCount = questions.filter((q) => q.resolved).length;

  const filteredQuestions = questions.filter((q) => {
    if (filter === 'to_discuss') return !q.resolved;
    if (filter === 'discussed') return q.resolved;
    return true;
  });

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Doctor Questions"
        subtitle="Questions to discuss with your healthcare professional"
        action={
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenAddQuestion}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Question
          </Button>
        }
      />

      {/* Preparation Companion Banner */}
      <div className="bg-warm-100/60 border border-warm-200/80 rounded-2xl p-4 flex items-start gap-3.5 shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-warm-200 text-coffee-800 flex items-center justify-center shrink-0">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-warm-900">Healthcare Appointment Companion</h4>
          <p className="text-[11px] text-warm-700 mt-0.5 leading-relaxed">
            CareBuddy organizes questions whenever a prescription instruction or care plan has unclear details. Bring these questions to your next consultation.
          </p>
        </div>
      </div>

      {/* Mandatory Safety Notice */}
      <div className="bg-warm-100/40 border border-warm-200/80 rounded-xl p-3 flex items-start gap-2 text-warm-800">
        <AlertCircle className="w-4 h-4 text-warm-500 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <span className="font-semibold text-warm-900">Notice:</span> CareBuddy helps you prepare questions. Always confirm medical instructions, dosages, and routine changes directly with your healthcare professional.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-warm-200/60 p-1 rounded-2xl text-xs font-semibold text-warm-700">
        <button
          onClick={() => setFilter('to_discuss')}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            filter === 'to_discuss'
              ? 'bg-white text-warm-900 shadow-2xs font-bold'
              : 'hover:text-warm-900'
          }`}
        >
          To Discuss ({toDiscussCount})
        </button>
        <button
          onClick={() => setFilter('discussed')}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            filter === 'discussed'
              ? 'bg-white text-warm-900 shadow-2xs font-bold'
              : 'hover:text-warm-900'
          }`}
        >
          Discussed ({discussedCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-white text-warm-900 shadow-2xs font-bold'
              : 'hover:text-warm-900'
          }`}
        >
          All ({questions.length})
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-warm-500">
            {filter === 'to_discuss'
              ? 'Questions to Discuss'
              : filter === 'discussed'
              ? 'Discussed with Doctor'
              : 'All Questions'}
          </h3>
          <span className="text-[11px] text-warm-500">
            {filteredQuestions.length} {filteredQuestions.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {filteredQuestions.length > 0 ? (
          <div className="space-y-3">
            {filteredQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onToggleResolved={onToggleResolved}
                onDelete={onDeleteQuestion}
                onViewSourceDoc={onViewSourceDoc}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<HelpCircle className="w-6 h-6 text-coffee-700" />}
            title={
              filter === 'to_discuss'
                ? 'No pending questions'
                : filter === 'discussed'
                ? 'No discussed questions yet'
                : 'No questions saved yet'
            }
            description={
              filter === 'to_discuss'
                ? 'All questions have been marked as discussed. Scan a new healthcare document or add a custom question to prepare for your next visit.'
                : filter === 'discussed'
                ? 'When you discuss questions with your doctor, mark them as discussed to keep track of answered topics.'
                : 'Upload or scan your medical instructions to automatically extract doctor discussion questions, or add your own notes.'
            }
            actionText="Add Your Own Question"
            onAction={onOpenAddQuestion}
          />
        )}
      </div>

      {/* Health Safety Boundaries Banner */}
      <SafetyBanner />
    </div>
  );
};
