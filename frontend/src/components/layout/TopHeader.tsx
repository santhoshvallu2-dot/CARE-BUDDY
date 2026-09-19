import React from 'react';
import { HeartPulse, Bell, Share2 } from 'lucide-react';

interface TopHeaderProps {
  onOpenNotifications?: () => void;
  onOpenHandoff?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenNotifications, onOpenHandoff }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#faf8f5]/95 backdrop-blur-md border-b border-warm-200/80 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Brand & Companion Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-warm-900 flex items-center justify-center text-warm-50 shadow-2xs">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-warm-900 leading-tight">
                CareBuddy AI
              </h1>
              <span className="inline-flex items-center gap-1 bg-natural-greenBg text-natural-greenText text-[10px] font-bold px-2 py-0.5 rounded-full border border-natural-greenBorder">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Care companion
              </span>
            </div>
            <p className="text-[11px] font-medium text-warm-500 leading-none mt-0.5">
              Understand your care. Remember your routine.
            </p>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-1">
          {onOpenHandoff && (
            <button
              onClick={onOpenHandoff}
              aria-label="Share with Caregiver"
              title="Share with Caregiver"
              className="p-2 text-warm-600 hover:text-warm-900 hover:bg-warm-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onOpenNotifications}
            aria-label="View notifications"
            className="p-2 text-warm-500 hover:text-warm-900 hover:bg-warm-100 rounded-xl transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-caramel-500 rounded-full ring-2 ring-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
