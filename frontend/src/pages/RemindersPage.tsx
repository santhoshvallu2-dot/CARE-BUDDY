import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { ProgressCard } from '../components/ui/ProgressCard';
import { ReminderCard } from '../components/ui/ReminderCard';
import { EmptyState } from '../components/ui/EmptyState';
import { SafetyBanner } from '../components/layout/SafetyBanner';
import { calculateTodayProgress, isCompletedForDate } from '../services/reminderService';
import { Plus, Clock, Sparkles } from 'lucide-react';
import { ReminderItem } from '../types';

interface RemindersPageProps {
  reminders: ReminderItem[];
  onToggleComplete: (id: string) => void;
  onOpenAddReminder: () => void;
  onEditReminder: (reminder: ReminderItem) => void;
  onDeleteReminder: (reminder: ReminderItem) => void;
  onViewSourceDoc: (sourceDocTitle: string, sourceDocId?: string) => void;
}

type ReminderTab = 'today' | 'upcoming' | 'completed';

export const RemindersPage: React.FC<RemindersPageProps> = ({
  reminders,
  onToggleComplete,
  onOpenAddReminder,
  onEditReminder,
  onDeleteReminder,
  onViewSourceDoc,
}) => {
  const [activeTab, setActiveTab] = useState<ReminderTab>('today');

  const { completed, total } = calculateTodayProgress(reminders);
  const hasDemoOnly = reminders.length > 0 && reminders.every((r) => r.isDemo);

  const filteredReminders = reminders.filter((r) => {
    const isDone = isCompletedForDate(r);
    if (activeTab === 'today') return true;
    if (activeTab === 'upcoming') return !isDone;
    if (activeTab === 'completed') return isDone;
    return true;
  });

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Care Routine"
        subtitle="Keep track of your daily routine"
        badge={hasDemoOnly ? 'DEMO DATA' : undefined}
        action={
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenAddReminder}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Reminder
          </Button>
        }
      />

      {/* Progress Summary Card */}
      {total > 0 ? (
        <ProgressCard
          completedCount={completed}
          totalCount={total}
          title="Today's Care Routine"
          subtitle="Mark routines as you follow healthcare instructions."
        />
      ) : (
        <div className="bg-warm-100/50 border border-warm-200/80 rounded-2xl p-5 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-warm-200 text-coffee-800 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-warm-900">Your routine is empty</h3>
            <p className="text-xs text-warm-600 mt-1 max-w-xs mx-auto">
              Scan a healthcare instruction or create a new routine reminder to get started.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={onOpenAddReminder} icon={<Plus className="w-4 h-4" />}>
            Add Reminder
          </Button>
        </div>
      )}

      {/* Filter Tabs */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-1 bg-warm-200/60 p-1 rounded-2xl text-xs font-semibold text-warm-700">
          <button
            onClick={() => setActiveTab('today')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'today'
                ? 'bg-white text-warm-900 shadow-2xs font-bold'
                : 'hover:text-warm-900'
            }`}
          >
            Today ({total})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-white text-warm-900 shadow-2xs font-bold'
                : 'hover:text-warm-900'
            }`}
          >
            Upcoming ({total - completed})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-white text-warm-900 shadow-2xs font-bold'
                : 'hover:text-warm-900'
            }`}
          >
            Completed ({completed})
          </button>
        </div>
      )}

      {/* Timeline List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-warm-500">
            {activeTab === 'today'
              ? "Today's Schedule Timeline"
              : activeTab === 'upcoming'
              ? 'Remaining Tasks'
              : 'Completed Today'}
          </h3>
          {hasDemoOnly && <span className="text-[11px] text-caramel-700 font-semibold">Demo Schedule</span>}
        </div>

        {filteredReminders.length > 0 ? (
          <div className="space-y-2.5">
            {filteredReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggleComplete={onToggleComplete}
                onEdit={onEditReminder}
                onDelete={onDeleteReminder}
                onViewSource={onViewSourceDoc}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Clock className="w-6 h-6 text-warm-400" />}
            title={activeTab === 'completed' ? 'No completed tasks yet' : 'No upcoming routines'}
            description={
              activeTab === 'completed'
                ? 'Check off routines from your Today timeline as you finish them.'
                : 'All routine reminders for today have been checked off!'
            }
            actionText="Add New Reminder"
            onAction={onOpenAddReminder}
          />
        )}
      </div>

      <SafetyBanner />
    </div>
  );
};
