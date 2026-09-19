import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'reminder' | 'document' | 'text';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  return (
    <div className="space-y-3 animate-fadeIn">
      {items.map((_, i) => {
        if (type === 'reminder') {
          return (
            <div key={i} className="p-4 bg-white rounded-2xl border border-warm-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-20 h-5 bg-warm-100 rounded-lg animate-pulse" />
                <div className="w-14 h-4 bg-warm-100 rounded-full animate-pulse" />
              </div>
              <div className="w-3/4 h-5 bg-warm-200 rounded animate-pulse" />
              <div className="w-full h-4 bg-warm-100 rounded animate-pulse" />
            </div>
          );
        }

        if (type === 'document') {
          return (
            <div key={i} className="p-4 bg-white rounded-2xl border border-warm-200/80 flex items-center gap-3">
              <div className="w-10 h-10 bg-warm-100 rounded-xl animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-2/3 h-4 bg-warm-200 rounded animate-pulse" />
                <div className="w-1/3 h-3 bg-warm-100 rounded animate-pulse" />
              </div>
            </div>
          );
        }

        return (
          <div key={i} className="p-5 bg-white rounded-2xl border border-warm-200/80 space-y-3">
            <div className="w-1/2 h-5 bg-warm-200 rounded animate-pulse" />
            <div className="w-full h-4 bg-warm-100 rounded animate-pulse" />
            <div className="w-4/5 h-4 bg-warm-100 rounded animate-pulse" />
          </div>
        );
      })}
    </div>
  );
};
