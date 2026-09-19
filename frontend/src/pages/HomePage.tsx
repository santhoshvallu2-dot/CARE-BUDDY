import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SafetyBanner } from '../components/layout/SafetyBanner';
import { CareSummaryCard } from '../components/ui/CareSummaryCard';
import { CareInsightsSection } from '../components/insights/CareInsightsSection';
import { RoutineAnalyticsCard } from '../components/insights/RoutineAnalyticsCard';
import { HowCareBuddyWorksCard } from '../components/insights/HowCareBuddyWorksCard';
import { calculateTodayProgress, findNextUpcomingReminder } from '../services/reminderService';
import { getQuestionStats } from '../services/questionService';
import { InsightService } from '../services/insights/insightService';
import {
  Camera,
  Plus,
  FileText,
  ChevronRight,
  Pill,
  CheckCircle2,
  Stethoscope,
  Share2
} from 'lucide-react';
import { NavTab, DocumentItem, ReminderItem, QuestionItem, IdentifiedInstruction } from '../types';

interface HomePageProps {
  onNavigate: (tab: NavTab) => void;
  onOpenScan: () => void;
  onOpenAddReminder: () => void;
  onOpenDocDetail: (doc: DocumentItem) => void;
  onOpenReminderSchedule?: (instruction: IdentifiedInstruction, docTitle?: string) => void;
  onOpenHandoff?: () => void;
  onOpenReceiveHandoff?: () => void;
  documents: DocumentItem[];
  reminders: ReminderItem[];
  questions: QuestionItem[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenScan,
  onOpenAddReminder,
  onOpenDocDetail,
  onOpenReminderSchedule,
  onOpenHandoff,
  onOpenReceiveHandoff,
  documents,
  reminders,
  questions,
}) => {
  // Time-based dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const { completed, total, percentage } = calculateTodayProgress(reminders);
  const remaining = Math.max(0, total - completed);
  const nextReminder = findNextUpcomingReminder(reminders);
  const { activeCount: questionsToDiscuss, discussedCount: questionsDiscussed } = getQuestionStats(questions);
  const recentDoc = documents.length > 0 ? documents[0] : null;
  const docWithAnalysis = documents.find((d) => d.analysis || (d.instructions && d.instructions.length > 0));

  // Smart Care Insights and Weekly Analytics from deterministic engine
  const insights = InsightService.getInsights(documents, reminders, questions);
  const weeklyAnalytics = InsightService.getWeeklyAnalytics(reminders);

  const handleOpenDocByTitleOrId = (docId?: string, docTitle?: string) => {
    const found =
      documents.find((d) => d.id === docId || (docTitle && d.title.toLowerCase().includes(docTitle.toLowerCase()))) ||
      documents[0];
    if (found) {
      onOpenDocDetail(found);
    } else {
      onNavigate('documents');
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* 1. GREETING & PRODUCT IDENTITY */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-warm-500 font-medium">
            <span>{getGreeting()} 👋</span>
            <span>•</span>
            <span className="text-warm-700 font-semibold">Jane Doe</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-warm-900 mt-0.5">
            CareBuddy AI
          </h2>
          <p className="text-xs text-warm-600 mt-0.5 leading-snug font-medium">
            Understand your care. Remember your routine.
          </p>
        </div>

        <StatusBadge variant={total > 0 ? 'ready' : 'info'} size="sm">
          {total > 0 ? 'CARE ACTIVE' : 'READY'}
        </StatusBadge>
      </div>

      {/* 2. MAIN ACTION CARD — SCAN & UNDERSTAND */}
      <div className="bg-warm-900 rounded-3xl p-5 text-warm-50 shadow-sm transition-all relative overflow-hidden border border-warm-800">
        <div className="relative z-10 space-y-3.5">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-warm-800 flex items-center justify-center text-caramel-300 border border-warm-700">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-caramel-200 bg-warm-800 px-2.5 py-1 rounded-full border border-warm-700">
              OCR & AI Explanation
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-warm-50">Scan & Understand</h3>
            <p className="text-xs text-warm-300 mt-1 leading-relaxed max-w-sm">
              Turn healthcare instructions into simple, organized information.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="primary"
              size="md"
              onClick={onOpenScan}
              className="bg-caramel-400 hover:bg-caramel-500 text-warm-950 font-bold shadow-2xs border-0"
              icon={<Camera className="w-4 h-4 text-warm-950" />}
            >
              Scan & Understand
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onOpenAddReminder}
              className="bg-warm-800 hover:bg-warm-700 text-warm-50 border-warm-700 font-semibold"
              icon={<Plus className="w-4 h-4" />}
            >
              Add Reminder
            </Button>
          </div>
        </div>
      </div>

      {/* 2.5. CAREGIVER CROSS-DEVICE HANDOFF QUICK BAR */}
      <div className="bg-white border border-warm-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-warm-100 flex items-center justify-center text-warm-800 shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-warm-900 truncate">Caregiver Handoff</p>
            <p className="text-[11px] text-warm-500 truncate">Sync care routines to caregiver PC</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenHandoff && (
            <Button size="sm" variant="secondary" onClick={onOpenHandoff} className="text-xs font-bold">
              Share
            </Button>
          )}
          {onOpenReceiveHandoff && (
            <Button size="sm" variant="ghost" onClick={onOpenReceiveHandoff} className="text-xs">
              Receive
            </Button>
          )}
        </div>
      </div>

      {/* 3. TODAY'S CARE CARD */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-warm-600">
            Today's Care
          </h3>
          <button
            onClick={() => onNavigate('reminders')}
            className="text-xs font-bold text-warm-900 hover:text-coffee-700 flex items-center gap-0.5 cursor-pointer"
          >
            Open Reminders &rarr;
          </button>
        </div>

        {total > 0 ? (
          <Card className="p-4 bg-white border-warm-200/80 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-warm-900">Daily Routine Progress</h4>
                <p className="text-xs text-warm-500 mt-0.5">
                  {completed} completed • {remaining} remaining
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-coffee-800">{percentage}%</span>
                <span className="text-[10px] text-warm-400 block font-semibold uppercase">Done</span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-warm-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-warm-200/60">
              <div
                className="bg-warm-900 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-warm-600">
              <span className="flex items-center gap-1.5 text-natural-greenText font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {completed} of {total} routines done
              </span>
              <button
                type="button"
                onClick={() => onNavigate('reminders')}
                className="text-warm-900 font-bold hover:underline cursor-pointer"
              >
                View checklist
              </button>
            </div>
          </Card>
        ) : (
          <Card className="p-4 text-center space-y-2 border-dashed border-warm-300 bg-white">
            <p className="text-xs font-bold text-warm-900">Your routine is empty.</p>
            <p className="text-[11px] text-warm-500">
              Add reminders or scan instructions to track your daily care schedule.
            </p>
            <Button size="sm" variant="primary" onClick={onOpenAddReminder} icon={<Plus className="w-4 h-4" />}>
              Add First Reminder
            </Button>
          </Card>
        )}
      </div>

      {/* 4. NEXT REMINDER CARD */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-warm-600">
            Next Reminder
          </h3>
          <span className="text-[11px] text-warm-400">Scheduled routine</span>
        </div>

        {nextReminder ? (
          <Card className="flex items-center justify-between p-4 border-warm-200/80 hover:border-warm-300 transition-all shadow-2xs bg-white">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-warm-100 border border-warm-200 text-warm-900 flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-warm-900 truncate">
                    {nextReminder.title}
                  </h4>
                  <span className="text-xs font-bold bg-warm-100 text-warm-900 px-2 py-0.5 rounded-md border border-warm-200/90 shrink-0">
                    {nextReminder.time}
                  </span>
                </div>
                <p className="text-xs text-warm-600 truncate mt-0.5 font-medium">
                  {nextReminder.instruction}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('reminders')}
              className="shrink-0 ml-2"
            >
              View
            </Button>
          </Card>
        ) : (
          <Card className="p-4 flex items-center justify-between border-warm-200/80 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f2f8f0] text-natural-greenText flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-warm-900">No upcoming reminders</h4>
                <p className="text-[11px] text-warm-500">
                  {total > 0
                    ? "You're all caught up for today!"
                    : 'No reminders currently scheduled.'}
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('reminders')}>
              View All
            </Button>
          </Card>
        )}
      </div>

      {/* 5. CAREBUDDY INSIGHTS (SMART INSIGHT ENGINE) */}
      <CareInsightsSection
        insights={insights}
        onOpenDocument={(id, title) => handleOpenDocByTitleOrId(id, title)}
        onOpenReminderSchedule={onOpenReminderSchedule}
        onNavigateToQuestions={() => onNavigate('questions')}
        onNavigateToReminders={() => onNavigate('reminders')}
      />

      {/* 6. ROUTINE ANALYTICS CARD */}
      <RoutineAnalyticsCard
        completedCount={completed}
        totalCount={total}
        percentage={percentage}
        weeklyStats={weeklyAnalytics}
      />

      {/* 7. CARE SUMMARY */}
      {docWithAnalysis && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-warm-600">
              Care Summary
            </h3>
            <span className="text-[11px] text-warm-400">From verified documents</span>
          </div>

          <CareSummaryCard
            document={docWithAnalysis}
            onViewDetails={onOpenDocDetail}
            compact={true}
          />
        </div>
      )}

      {/* 8. DOCUMENTS & QUESTIONS SUMMARIES (2-COLUMN GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Documents Summary */}
        <Card className="p-4 border-warm-200/80 space-y-3 shadow-2xs bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-warm-100 text-warm-900 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-warm-900">Saved Documents</h4>
            </div>
            <span className="text-xs font-bold bg-warm-100 text-warm-800 px-2 py-0.5 rounded-full border border-warm-200">
              {documents.length}
            </span>
          </div>

          {recentDoc ? (
            <div
              onClick={() => onOpenDocDetail(recentDoc)}
              className="p-2.5 bg-warm-50 rounded-xl border border-warm-200/70 hover:border-warm-300 cursor-pointer transition-colors"
            >
              <p className="text-xs font-bold text-warm-900 truncate">{recentDoc.title}</p>
              <p className="text-[11px] text-warm-500 mt-0.5 truncate">{recentDoc.date}</p>
            </div>
          ) : (
            <p className="text-xs text-warm-500 italic">No documents uploaded yet.</p>
          )}

          <button
            type="button"
            onClick={() => onNavigate('documents')}
            className="text-xs font-bold text-warm-900 hover:text-coffee-700 flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>View all documents</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </Card>

        {/* Questions Summary */}
        <Card className="p-4 border-warm-200/80 space-y-3 shadow-2xs bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-warm-100 text-warm-900 flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-warm-900">Doctor Questions</h4>
            </div>
            <span className="text-xs font-bold bg-warm-100 text-warm-900 px-2 py-0.5 rounded-full border border-warm-200">
              {questionsToDiscuss} To Discuss
            </span>
          </div>

          <div className="space-y-1 text-xs text-warm-700">
            <div className="flex justify-between py-0.5">
              <span>Questions to discuss:</span>
              <span className="font-bold text-warm-900">{questionsToDiscuss}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Already discussed:</span>
              <span className="font-bold text-natural-greenText">{questionsDiscussed}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('questions')}
            className="text-xs font-bold text-warm-900 hover:text-coffee-700 flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>Open questions checklist</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </Card>
      </div>

      {/* 9. HOW CAREBUDDY WORKS */}
      <HowCareBuddyWorksCard />

      {/* 10. HEALTH SAFETY BANNER */}
      <SafetyBanner />
    </div>
  );
};
