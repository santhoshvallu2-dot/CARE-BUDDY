import React from 'react';
import { Card } from '../ui/Card';
import { Activity, Calendar } from 'lucide-react';
import { WeeklyRoutineStat } from '../../services/insights/insightTypes';

interface RoutineAnalyticsCardProps {
  completedCount: number;
  totalCount: number;
  percentage: number;
  weeklyStats: WeeklyRoutineStat[];
}

export const RoutineAnalyticsCard: React.FC<RoutineAnalyticsCardProps> = ({
  completedCount,
  totalCount,
  percentage,
  weeklyStats,
}) => {
  const remaining = Math.max(0, totalCount - completedCount);
  const hasHistory = weeklyStats.some((s) => s.completedCount > 0);

  return (
    <Card className="p-4 border-warm-200/80 bg-white space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-warm-100 text-warm-900 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-warm-900">Routine Analytics</h4>
            <p className="text-[11px] text-warm-500">Based on your daily checklist completions</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-lg font-black text-coffee-800">{percentage}%</span>
          <span className="text-[10px] text-warm-400 block font-semibold uppercase">Today</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 py-1">
        <div className="p-2.5 rounded-xl bg-warm-50 border border-warm-200/70 text-center">
          <span className="text-[10px] font-bold text-warm-400 uppercase tracking-wider block">Planned</span>
          <span className="text-sm font-bold text-warm-900 mt-0.5 block">{totalCount}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#f2f8f0] border border-[#d5e9cf] text-center">
          <span className="text-[10px] font-bold text-natural-greenText uppercase tracking-wider block">Completed</span>
          <span className="text-sm font-bold text-natural-greenText mt-0.5 block">{completedCount}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-warm-50 border border-warm-200/70 text-center">
          <span className="text-[10px] font-bold text-warm-400 uppercase tracking-wider block">Remaining</span>
          <span className="text-sm font-bold text-warm-700 mt-0.5 block">{remaining}</span>
        </div>
      </div>

      {/* Weekly Completion Bar Chart */}
      <div className="space-y-2 pt-1 border-t border-warm-200/60">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-warm-800 flex items-center gap-1 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-caramel-600" />
            7-Day Completion Trend
          </span>
          <span className="text-[10px] text-warm-400">Weekly view</span>
        </div>

        {hasHistory ? (
          <div className="flex items-end justify-between gap-2 pt-2 px-1 h-28">
            {weeklyStats.map((stat, idx) => {
              const isToday = idx === weeklyStats.length - 1;
              const barHeightPercent = stat.totalCount > 0 ? Math.max(8, stat.percentage) : 8;

              return (
                <div key={stat.dateStr} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  {/* Tooltip / Value on top */}
                  <span className="text-[9px] font-bold text-warm-500">
                    {stat.completedCount > 0 ? stat.completedCount : '-'}
                  </span>

                  {/* Bar */}
                  <div className="w-full max-w-[28px] bg-warm-100 rounded-t-lg h-20 flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-warm-900'
                          : stat.percentage > 0
                          ? 'bg-caramel-500'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${barHeightPercent}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-[10px] font-semibold ${
                      isToday ? 'text-warm-900 font-bold underline' : 'text-warm-400'
                    }`}
                  >
                    {stat.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 text-center bg-warm-50 rounded-xl border border-dashed border-warm-200">
            <p className="text-xs text-warm-700 font-medium">Not enough routine history yet.</p>
            <p className="text-[11px] text-warm-400 mt-0.5">
              Check off your daily reminders to build your 7-day completion chart.
            </p>
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="text-[10px] text-warm-400 italic pt-1 text-center">
        Organizational progress only. Does not reflect clinical outcomes.
      </div>
    </Card>
  );
};
