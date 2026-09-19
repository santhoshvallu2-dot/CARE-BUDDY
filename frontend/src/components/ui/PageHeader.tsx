import React from 'react';
import { StatusBadge } from './StatusBadge';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
}) => {
  return (
    <div className="flex items-start justify-between gap-3 pb-1">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xl font-bold tracking-tight text-warm-900">{title}</h2>
          {badge && <StatusBadge variant="demo">{badge}</StatusBadge>}
        </div>
        {subtitle && (
          <p className="text-xs text-warm-500 mt-0.5 leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
