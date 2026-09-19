import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Processing...',
  description = 'CareBuddy is working on your healthcare information.',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-warm-200/80 shadow-2xs ${className}`}>
      <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-warm-100 text-warm-900 mb-3 border border-warm-200/60">
        <Loader2 className="w-7 h-7 animate-spin text-warm-900" />
        <Sparkles className="w-3.5 h-3.5 absolute top-2 right-2 text-caramel-500 animate-pulse" />
      </div>
      <h3 className="text-base font-bold text-warm-900 tracking-tight">{title}</h3>
      <p className="text-xs text-warm-500 max-w-xs mt-1 leading-relaxed font-medium">{description}</p>
    </div>
  );
};
