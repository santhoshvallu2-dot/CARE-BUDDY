import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'Information unclear. Please verify with your healthcare professional.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-[#fdf2f2] rounded-2xl border border-[#f8d4d4] shadow-2xs ${className}`}>
      <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#f8d4d4] text-[#661b1e] mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-warm-900 mb-1">{title}</h3>
      <p className="text-xs text-[#661b1e] max-w-xs mb-4 leading-relaxed font-semibold">{description}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
