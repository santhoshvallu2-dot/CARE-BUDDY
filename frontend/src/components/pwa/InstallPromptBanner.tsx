import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '../ui/Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPromptBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if dismissed previously
    const isDismissed = localStorage.getItem('carebuddy_pwa_dismissed') === 'true';
    if (isDismissed) {
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        localStorage.setItem('carebuddy_pwa_dismissed', 'true');
      }
    } catch {
      // Ignored
    } finally {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('carebuddy_pwa_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <aside
      aria-label="Install application banner"
      className="bg-warm-900 text-warm-50 p-3.5 rounded-2xl shadow-md border border-warm-800 mb-3 animate-slideDown relative overflow-hidden"
    >
      <button
        onClick={handleDismiss}
        aria-label="Dismiss install banner"
        className="absolute top-2.5 right-2.5 p-1 text-warm-400 hover:text-warm-50 rounded-lg hover:bg-warm-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="w-10 h-10 rounded-xl bg-warm-800 text-caramel-300 flex items-center justify-center shrink-0 border border-warm-700">
          <Smartphone className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <h4 className="text-xs font-bold text-warm-50">Install CareBuddy</h4>
          <p className="text-[11px] text-warm-300 leading-tight">
            Add CareBuddy to your home screen for quick access to your care routine.
          </p>

          <div className="flex items-center gap-2 pt-1.5">
            <Button
              size="sm"
              variant="primary"
              onClick={handleInstallClick}
              className="bg-caramel-400 hover:bg-caramel-500 text-warm-950 font-bold text-xs py-1 px-3 shadow-2xs border-0"
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Install
            </Button>
            <button
              onClick={handleDismiss}
              className="text-xs text-warm-300 hover:text-warm-50 font-semibold px-2 py-1 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
