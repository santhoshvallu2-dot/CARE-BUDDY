import React from 'react';

export type StatusVariant =
  | 'ready'
  | 'processing'
  | 'uploaded'
  | 'uploading'
  | 'review'
  | 'error'
  | 'completed'
  | 'upcoming'
  | 'medication'
  | 'routine'
  | 'measurement'
  | 'demo'
  | 'info'
  | 'warning'
  | 'neutral';

interface StatusBadgeProps {
  status?: StatusVariant;
  variant?: StatusVariant;
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  children,
  className = '',
  size = 'sm',
}) => {
  const current = status || variant || 'neutral';

  const styles: Record<StatusVariant, string> = {
    ready: 'bg-[#f4f7f2] text-[#244521] border-[#d7e6d3] font-semibold',
    processing: 'bg-[#fef9ec] text-[#543d00] border-[#faeab7] font-semibold animate-pulse',
    uploading: 'bg-[#fef9ec] text-[#543d00] border-[#faeab7] font-semibold animate-pulse',
    review: 'bg-[#f7f3eb] text-[#3d332a] border-[#e4dbcc] font-semibold',
    uploaded: 'bg-[#f7f3eb] text-[#3d332a] border-[#e4dbcc] font-semibold',
    error: 'bg-[#fdf2f2] text-[#6b1e22] border-[#f8d4d4] font-semibold',
    completed: 'bg-[#f4f7f2] text-[#244521] border-[#d7e6d3] font-semibold',
    upcoming: 'bg-[#f7f3eb] text-[#3d332a] border-[#e4dbcc] font-semibold',
    medication: 'bg-[#f5f1eb] text-[#42362b] border-[#e6dcce] font-medium',
    routine: 'bg-[#f7f3eb] text-[#3b3228] border-[#e7dcce] font-medium',
    measurement: 'bg-[#f6f2ec] text-[#3f342c] border-[#e6dcce] font-medium',
    demo: 'bg-[#faeedb] text-[#5e2b0c] border-[#f5d7b5] font-bold uppercase tracking-wider',
    info: 'bg-[#f7f3eb] text-[#383027] border-[#e6ddce] font-medium',
    warning: 'bg-[#fef9ec] text-[#543d00] border-[#faeab7] font-semibold',
    neutral: 'bg-[#f7f3eb] text-[#52493f] border-[#ebe3d5] font-medium',
  };

  const labels: Partial<Record<StatusVariant, string>> = {
    ready: 'Ready to review',
    review: 'Verified OCR',
    processing: 'Processing...',
    uploading: 'Uploading...',
    uploaded: 'Uploaded',
    error: 'Needs Attention',
    completed: 'Completed',
    upcoming: 'Upcoming',
    demo: 'DEMO MODE',
  };

  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${styles[current]} ${sizeStyle} ${className}`}
    >
      {children || labels[current] || current}
    </span>
  );
};

export const Badge = StatusBadge;
