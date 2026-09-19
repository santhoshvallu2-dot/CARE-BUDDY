import React, { useState } from 'react';
import { Card } from '../ui/Card';
import {
  Sparkles,
  AlertTriangle,
  CalendarCheck,
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import { CareInsight } from '../../services/insights/insightTypes';
import { IdentifiedInstruction } from '../../types';

interface CareInsightsSectionProps {
  insights: CareInsight[];
  onOpenDocument?: (docId?: string, docTitle?: string) => void;
  onOpenReminderSchedule?: (instruction: IdentifiedInstruction, docTitle?: string) => void;
  onNavigateToQuestions?: () => void;
  onNavigateToReminders?: () => void;
}

export const CareInsightsSection: React.FC<CareInsightsSectionProps> = ({
  insights,
  onOpenDocument,
  onOpenReminderSchedule,
  onNavigateToQuestions,
  onNavigateToReminders,
}) => {
  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});

  const toggleWhy = (id: string) => {
    setExpandedWhy((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getPriorityBadge = (priority: CareInsight['priority'], label: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#594002] bg-[#fef9ec] px-2 py-0.5 rounded-full border border-[#faeab7]">
            <AlertTriangle className="w-3 h-3 text-[#8a6800]" />
            {label}
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5c381c] bg-[#fbf0de] px-2 py-0.5 rounded-full border border-[#f6debc]">
            <Sparkles className="w-3 h-3 text-caramel-600" />
            {label}
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-warm-800 bg-warm-100 px-2 py-0.5 rounded-full border border-warm-200">
            <CheckCircle2 className="w-3 h-3 text-warm-600" />
            {label}
          </span>
        );
    }
  };

  const getInsightIcon = (type: CareInsight['type']) => {
    switch (type) {
      case 'verification':
        return <AlertTriangle className="w-4 h-4 text-[#8a6800]" />;
      case 'action':
        return <Clock className="w-4 h-4 text-caramel-600" />;
      case 'question':
        return <HelpCircle className="w-4 h-4 text-coffee-600" />;
      case 'routine':
      default:
        return <CalendarCheck className="w-4 h-4 text-warm-700" />;
    }
  };

  const handleAction = (insight: CareInsight) => {
    switch (insight.actionType) {
      case 'view_document':
        onOpenDocument?.(insight.sourceDocId, insight.sourceDocTitle);
        break;
      case 'create_reminder':
        if (insight.instructionPayload) {
          onOpenReminderSchedule?.(insight.instructionPayload, insight.sourceDocTitle);
        } else {
          onNavigateToReminders?.();
        }
        break;
      case 'view_questions':
        onNavigateToQuestions?.();
        break;
      case 'view_routine':
        onNavigateToReminders?.();
        break;
    }
  };

  if (insights.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-warm-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-caramel-600" />
            CareBuddy Insights
          </h3>
          <span className="text-[11px] text-warm-500 font-medium">All organized</span>
        </div>
        <Card className="p-4 border-warm-200/80 bg-white text-center space-y-1">
          <p className="text-xs font-bold text-warm-900">Your care is up to date.</p>
          <p className="text-[11px] text-warm-500">
            All clearly stated instructions have reminders scheduled and no pending verification alerts.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-caramel-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-warm-900">
            CareBuddy Insights
          </h3>
        </div>
        <span className="text-[11px] font-bold text-warm-800 bg-warm-100 px-2 py-0.5 rounded-full border border-warm-200">
          {insights.length} insight{insights.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Insight Cards List */}
      <div className="space-y-2.5">
        {insights.map((insight) => {
          const isWhyOpen = Boolean(expandedWhy[insight.id]);

          return (
            <Card
              key={insight.id}
              className={`p-4 transition-all duration-200 border-warm-200/80 space-y-3 shadow-2xs ${
                insight.priority === 'high'
                  ? 'bg-[#fefbee] hover:border-[#f5e9bd]'
                  : insight.priority === 'medium'
                  ? 'bg-white hover:border-warm-300'
                  : 'bg-[#faf8f5] hover:border-warm-300'
              }`}
            >
              {/* Header: Priority & Icon */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      insight.priority === 'high'
                        ? 'bg-[#fbf0de]'
                        : insight.priority === 'medium'
                        ? 'bg-warm-100'
                        : 'bg-warm-100'
                    }`}
                  >
                    {getInsightIcon(insight.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-warm-900 leading-snug">
                      {insight.title}
                    </h4>
                    {insight.sourceDocTitle && (
                      <span className="text-[10px] text-warm-500 flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3 text-warm-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{insight.sourceDocTitle}</span>
                      </span>
                    )}
                  </div>
                </div>

                {getPriorityBadge(insight.priority, insight.priorityLabel)}
              </div>

              {/* Message */}
              <p className="text-xs text-warm-800 leading-relaxed font-medium">
                {insight.message}
              </p>

              {/* Source Snippet Citation */}
              {insight.sourceText && (
                <div className="bg-warm-50/80 rounded-xl p-2.5 border border-warm-200/70 text-[11px] text-warm-600 italic">
                  "{insight.sourceText}"
                </div>
              )}

              {/* "Why am I seeing this?" Accordion */}
              <div className="pt-1 border-t border-warm-200/60">
                <button
                  type="button"
                  onClick={() => toggleWhy(insight.id)}
                  className="flex items-center justify-between w-full text-[11px] text-warm-600 hover:text-warm-900 transition-colors cursor-pointer py-0.5"
                >
                  <span className="flex items-center gap-1 font-medium">
                    <Info className="w-3 h-3 text-warm-400" />
                    Why am I seeing this?
                  </span>
                  {isWhyOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-warm-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-warm-400" />
                  )}
                </button>

                {isWhyOpen && (
                  <div className="mt-1.5 p-2.5 bg-warm-100 rounded-xl border border-warm-200/80 text-[11px] text-warm-900 leading-relaxed animate-fadeIn">
                    {insight.whyText}
                  </div>
                )}
              </div>

              {/* Action Button */}
              {insight.actionLabel && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleAction(insight)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs bg-warm-900 hover:bg-warm-800 text-warm-50"
                  >
                    <span>{insight.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
