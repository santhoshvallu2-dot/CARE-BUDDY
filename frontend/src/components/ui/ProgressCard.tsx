import React from 'react';
import { Card } from './Card';
import { Sparkles } from 'lucide-react';

interface ProgressCardProps {
  completedCount: number;
  totalCount: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  completedCount,
  totalCount,
  title = "Today's Care Routine",
  subtitle = "Keep up the great momentum!",
  className = '',
}) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

  return (
    <Card className={`bg-white text-warm-900 p-5 border border-warm-200/90 shadow-2xs ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-warm-500 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-caramel-500" />
            <span>{title}</span>
          </div>
          <h3 className="text-2xl font-bold mt-1 tracking-tight text-warm-900">
            {completedCount} of {totalCount} completed
          </h3>
          <p className="text-xs text-warm-600 mt-1 leading-relaxed font-medium">
            {isAllCompleted ? "✓ All scheduled routines completed for today!" : subtitle}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-warm-100 border border-warm-200 text-warm-900">
          <span className="text-lg font-black text-coffee-800">{percentage}%</span>
          <span className="text-[10px] text-warm-500 font-semibold leading-none">done</span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-warm-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-warm-200/60">
          <div
            className="bg-warm-900 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      </div>
    </Card>
  );
};
