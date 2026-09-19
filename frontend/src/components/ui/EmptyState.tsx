import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-dashed border-warm-200/90 shadow-2xs">
      <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-warm-100 text-warm-900 mb-3 border border-warm-200/60">
        {icon}
      </div>
      <h3 className="text-base font-bold text-warm-900 mb-1">{title}</h3>
      <p className="text-xs text-warm-500 max-w-xs mb-4 leading-relaxed font-medium">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="text-xs font-bold text-warm-900 hover:text-coffee-800 bg-warm-100 hover:bg-warm-200 px-3.5 py-2 rounded-xl border border-warm-200 transition-colors cursor-pointer"
        >
          {actionText} &rarr;
        </button>
      )}
    </div>
  );
};
