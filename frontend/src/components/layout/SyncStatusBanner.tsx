import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export type SyncState = 'synced' | 'syncing' | 'offline' | 'error';

interface SyncStatusBannerProps {
  syncState?: SyncState;
}

export const SyncStatusBanner: React.FC<SyncStatusBannerProps> = ({ syncState: propSyncState }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const currentState: SyncState = !isOnline ? 'offline' : propSyncState || 'synced';

  if (currentState === 'synced') {
    return null; // Keep UI ultra-clean when normal and synced
  }

  if (currentState === 'offline') {
    return (
      <aside
        aria-label="Offline status banner"
        className="bg-[#fefbee] text-[#4d3800] text-xs px-3.5 py-2 rounded-2xl mb-3 flex items-center justify-between border border-[#f5e9bd] animate-fadeIn shadow-2xs"
      >
        <div className="flex items-center gap-2">
          <WifiOff className="w-3.5 h-3.5 text-[#8a6800] shrink-0" />
          <span className="font-semibold">You're offline — local routines are available</span>
        </div>
        <span className="text-[10px] bg-[#f5e9bd] px-2 py-0.5 rounded text-[#4d3800] font-bold">
          OFFLINE
        </span>
      </aside>
    );
  }

  if (currentState === 'syncing') {
    return (
      <div className="bg-warm-100 text-warm-900 text-xs px-3.5 py-1.5 rounded-2xl mb-3 flex items-center gap-2 border border-warm-200/90 animate-fadeIn">
        <RefreshCw className="w-3.5 h-3.5 text-caramel-600 animate-spin" />
        <span className="font-semibold">Syncing with backend...</span>
      </div>
    );
  }

  return null;
};
