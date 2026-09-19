import React from 'react';
import { NavTab } from '../../types';
import { TopHeader } from './TopHeader';
import { BottomNavigation } from './BottomNavigation';
import { Home, FileText, Clock, HelpCircle, User, HeartPulse, Sparkles, Share2, DownloadCloud } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { InstallPromptBanner } from '../pwa/InstallPromptBanner';
import { SyncStatusBanner } from './SyncStatusBanner';

interface AppShellProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenNotifications?: () => void;
  onOpenHandoff?: () => void;
  onOpenReceiveHandoff?: () => void;
  isSyncing?: boolean;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onChangeTab,
  onOpenNotifications,
  onOpenHandoff,
  onOpenReceiveHandoff,
  isSyncing,
  children,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" />, description: 'Overview & care plan' },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-5 h-5" />, description: 'Prescriptions & notes' },
    { id: 'reminders', label: 'Reminders', icon: <Clock className="w-5 h-5" />, description: "Today's routines" },
    { id: 'questions', label: 'Questions', icon: <HelpCircle className="w-5 h-5" />, description: 'Doctor appointment notes' },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" />, description: 'Caregiver & app settings' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f1eb] flex justify-center text-warm-900 selection:bg-caramel-100 selection:text-coffee-900">
      {/* Desktop/Tablet Side Navigation (Visible on lg screens) */}
      <aside className="hidden lg:flex flex-col w-72 p-6 bg-[#fcfbf9] border-r border-warm-200/80 shrink-0 sticky top-0 h-screen justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-warm-900 flex items-center justify-center text-warm-50 shadow-xs">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-warm-900 leading-tight">CareBuddy AI</h1>
              </div>
              <p className="text-xs text-warm-500 mt-0.5">Care companion</p>
            </div>
          </div>

          <div className="bg-[#faeedb] border border-[#f5d7b5] rounded-2xl p-3 flex items-center justify-between">
            <span className="text-xs font-bold text-[#5e2b0c]">Cross-Device Handoff</span>
            <StatusBadge variant="demo">ACTIVE</StatusBadge>
          </div>

          <nav className="space-y-1.5" aria-label="Sidebar Navigation">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onChangeTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-warm-100 text-warm-900 font-bold border border-warm-200/90 shadow-2xs'
                      : 'text-warm-600 hover:bg-warm-50 hover:text-warm-900 font-medium'
                  }`}
                >
                  <span className={`p-1.5 rounded-xl ${isActive ? 'bg-warm-900 text-warm-50 shadow-2xs' : 'text-warm-400'}`}>
                    {tab.icon}
                  </span>
                  <div>
                    <p className="text-sm leading-snug">{tab.label}</p>
                    <p className="text-[11px] text-warm-400 font-normal leading-tight">{tab.description}</p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Cross-Device Caregiver Handoff triggers for Desktop / Laptop */}
          <div className="pt-2 border-t border-warm-200/70 space-y-2">
            <p className="text-[11px] font-bold text-warm-500 uppercase tracking-wider px-1">
              Cross-Device Handoff
            </p>
            {onOpenReceiveHandoff && (
              <button
                onClick={onOpenReceiveHandoff}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-warm-50 hover:bg-warm-100 border border-warm-200 text-xs font-bold text-warm-800 transition-colors cursor-pointer"
              >
                <DownloadCloud className="w-4 h-4 text-warm-700" />
                <span>Receive Care Handoff</span>
              </button>
            )}
            {onOpenHandoff && (
              <button
                onClick={onOpenHandoff}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-warm-600 hover:bg-warm-50 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-warm-500" />
                <span>Share from Patient Phone</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-warm-50 border border-warm-200/80 text-xs text-warm-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-warm-900">
            <Sparkles className="w-3.5 h-3.5 text-caramel-600" />
            <span>HealthTech Hackathon Demo</span>
          </div>
          <p className="text-[11px] text-warm-500 leading-relaxed">
            Phone-first healthcare routine organizer. No medical diagnosis provided.
          </p>
        </div>
      </aside>

      {/* Main App Container (Mobile viewport optimized) */}
      <div className="w-full max-w-md min-h-screen bg-warm-50 flex flex-col shadow-xl relative border-x border-warm-200/70">
        <TopHeader onOpenNotifications={onOpenNotifications} onOpenHandoff={onOpenHandoff} />

        <main className="flex-1 px-4 py-4 sm:px-5 overflow-y-auto">
          <SyncStatusBanner syncState={isSyncing ? 'syncing' : undefined} />
          <InstallPromptBanner />
          {children}
        </main>

        <BottomNavigation activeTab={activeTab} onChangeTab={onChangeTab} />
      </div>
    </div>
  );
};
