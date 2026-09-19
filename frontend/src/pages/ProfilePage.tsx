import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  User,
  Mail,
  Phone,
  Heart,
  Shield,
  Bell,
  Volume2,
  Sparkles,
  Building2,
  RotateCcw,
  Share2,
  DownloadCloud
} from 'lucide-react';
import { UserProfile, UserPreferences } from '../types';

interface ProfilePageProps {
  profile: UserProfile;
  preferences: UserPreferences;
  onUpdatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  onShowToast: (title: string, message: string) => void;
  onResetDemo?: () => void;
  onOpenHandoff?: () => void;
  onOpenReceiveHandoff?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  preferences,
  onUpdatePreferences,
  onShowToast,
  onResetDemo,
  onOpenHandoff,
  onOpenReceiveHandoff,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Care Profile & Settings"
        subtitle="Manage care contacts, preferences & security"
        badge="DEMO"
      />

      {/* User Identity Card */}
      <Card className="p-4 flex items-center gap-3.5 border-warm-200/80 bg-white shadow-2xs">
        <div className="w-14 h-14 rounded-2xl bg-coffee-800 text-warm-50 flex items-center justify-center font-bold text-xl shadow-2xs shrink-0">
          JD
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-warm-900 truncate">{profile.name}</h3>
            <StatusBadge variant="completed" size="sm">Active</StatusBadge>
          </div>
          <p className="text-xs text-warm-500 flex items-center gap-1.5 mt-0.5 truncate">
            <Mail className="w-3.5 h-3.5 text-warm-400 shrink-0" />
            {profile.email}
          </p>
        </div>
      </Card>

      {/* Healthcare Contacts */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-warm-500 px-1">
          Care Contacts
        </h3>

        <Card className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-warm-100 text-coffee-800 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <span className="text-warm-500 font-medium block">Primary Doctor</span>
                <span className="font-bold text-warm-900 block mt-0.5">{profile.primaryDoctor}</span>
                <span className="text-[11px] text-warm-600 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-warm-400" />
                  {profile.clinicName}
                </span>
              </div>
            </div>
            <a
              href={`tel:${profile.doctorPhone}`}
              className="text-xs font-bold text-coffee-800 bg-warm-100 px-2.5 py-1.5 rounded-xl border border-warm-200/80 hover:bg-warm-200 transition-colors flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
          </div>

          <div className="border-t border-warm-100 pt-3 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-warm-100 text-coffee-800 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-warm-500 font-medium block">Caregiver / Family</span>
                <span className="font-bold text-warm-900 block mt-0.5">{profile.primaryCaregiver}</span>
                <span className="text-[11px] text-warm-600 block mt-0.5">{profile.caregiverPhone}</span>
              </div>
            </div>
            <a
              href={`tel:${profile.caregiverPhone}`}
              className="text-xs font-bold text-coffee-800 bg-warm-100 px-2.5 py-1.5 rounded-xl border border-warm-200/80 hover:bg-warm-200 transition-colors flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
          </div>
        </Card>
      </div>

      {/* Cross-Device Caregiver Handoff */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-warm-500 px-1">
          Cross-Device Caregiver Handoff
        </h3>

        <Card className="p-4 bg-white border-warm-200/80 space-y-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-warm-100 text-warm-800 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-warm-900">Caregiver PC Companion Sync</h4>
              <p className="text-[11px] text-warm-600 mt-0.5 leading-relaxed">
                Securely transfer verified care summaries and routines from this patient device to a caregiver laptop via 6-digit sync code or QR code.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {onOpenHandoff && (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                icon={<Share2 className="w-3.5 h-3.5" />}
                onClick={onOpenHandoff}
              >
                Share with Caregiver
              </Button>
            )}
            {onOpenReceiveHandoff && (
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={<DownloadCloud className="w-3.5 h-3.5" />}
                onClick={onOpenReceiveHandoff}
              >
                Receive Handoff
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Preferences & Routine Alerts */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-warm-500 px-1">
          Preferences & Alerts
        </h3>

        <Card className="divide-y divide-warm-100 p-0 overflow-hidden">
          {/* Notification Permission & Activation Block */}
          <div className="p-4 space-y-3 bg-warm-100/30">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-warm-200 text-coffee-800 border border-warm-300/80 shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-warm-900">Reminder Notifications</h4>
                  <p className="text-[11px] text-warm-600 mt-0.5 leading-relaxed">
                    Allow notifications to receive reminders for routines you have created.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {typeof window !== 'undefined' && 'Notification' in window ? (
                  Notification.permission === 'granted' ? (
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Enabled
                    </span>
                  ) : Notification.permission === 'denied' ? (
                    <span className="inline-flex items-center text-[10px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      Blocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-bold text-warm-700 bg-warm-200 px-2.5 py-1 rounded-full">
                      Not enabled
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center text-[10px] font-bold text-warm-600 bg-warm-100 px-2.5 py-1 rounded-full">
                    Unsupported
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons based on status */}
            <div className="flex items-center gap-2 pt-1">
              {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' ? (
                Notification.permission === 'denied' ? (
                  <p className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 leading-tight">
                    Notifications are disabled in browser settings. You can still use CareBuddy normally.
                  </p>
                ) : (
                  <button
                    onClick={async () => {
                      if ('Notification' in window) {
                        const status = await Notification.requestPermission();
                        if (status === 'granted') {
                          onUpdatePreferences({ pushNotifications: true });
                          onShowToast('Notifications Enabled', 'You will receive reminders for your saved routines.');
                        } else {
                          onShowToast('Notifications Disabled', 'You can still track routines inside CareBuddy.');
                        }
                      }
                    }}
                    className="w-full text-xs font-bold bg-coffee-800 hover:bg-coffee-900 text-warm-50 py-2 px-3.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    Enable Reminder Notifications
                  </button>
                )
              ) : (
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                      try {
                        const testNotif = new Notification('CareBuddy Routine Reminder', {
                          body: 'Review your saved care instructions.',
                          icon: '/icons/icon-192x192.png',
                          badge: '/icons/icon-192x192.png',
                        });
                        testNotif.onclick = () => window.focus();
                      } catch {
                        // ignore
                      }
                      onShowToast('Test Notification Sent', 'Check your device notification center.');
                    }
                  }}
                  className="text-xs font-semibold text-coffee-800 bg-warm-100 hover:bg-warm-200 border border-warm-200/80 py-1.5 px-3 rounded-xl transition-colors cursor-pointer"
                >
                  Send Test Notification
                </button>
              )}
            </div>
          </div>

          {/* Sound alert chime */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-warm-100 text-coffee-800">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-warm-900 block">Sound Chime</span>
                <span className="text-[11px] text-warm-500">Gentle audio alert on routine times</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.soundAlerts}
                onChange={(e) => {
                  onUpdatePreferences({ soundAlerts: e.target.checked });
                  onShowToast('Preference Updated', `Sound alerts ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-warm-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-warm-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-800"></div>
            </label>
          </div>

          {/* Demo Mode Toggle */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-caramel-50 text-coffee-800">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-warm-900 block">Demo / Simulation Mode</span>
                <span className="text-[11px] text-warm-500">Enable preloaded sample data for testing</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.demoMode}
                onChange={(e) => {
                  onUpdatePreferences({ demoMode: e.target.checked });
                  onShowToast('Demo Mode', `Demo simulation ${e.target.checked ? 'activated' : 'deactivated'}`);
                }}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-warm-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-warm-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-caramel-500"></div>
            </label>
          </div>

          {/* Reset Demo State Action */}
          {preferences.demoMode && onResetDemo && (
            <div className="p-3.5 bg-warm-50/60 border-t border-warm-100 flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-warm-900 block">Reset Demo State</span>
                <span className="text-[11px] text-warm-500">Restore original hackathon starting state</span>
              </div>
              {showResetConfirm ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      onResetDemo();
                      setShowResetConfirm(false);
                      onShowToast('Demo Reset', 'Restored initial sample documents, routines, and questions.');
                    }}
                  >
                    Confirm Reset
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowResetConfirm(true)}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="shrink-0"
                >
                  Reset Demo
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Safety Notice & Medical Disclaimer */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-warm-500 px-1">
          Safety & Disclaimers
        </h3>
        <Card className="bg-warm-100/50 border-warm-200/80 p-4 space-y-2 text-xs text-warm-900">
          <div className="flex items-center gap-2 font-bold text-warm-900">
            <Shield className="w-4 h-4 text-caramel-600" />
            <span>Healthcare Safety Boundary Commitment</span>
          </div>
          <p className="text-[11px] text-warm-700 leading-relaxed">
            CareBuddy AI provides organizational and informational assistance. It does not diagnose conditions or replace professional medical advice. Always consult your doctor for dosage changes, symptoms, or medical emergencies.
          </p>
        </Card>
      </div>

      {/* About Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-warm-500 px-1">
          About CareBuddy AI
        </h3>
        <Card className="p-4 space-y-2 text-xs text-warm-700">
          <div className="flex items-center justify-between">
            <span className="font-bold text-warm-900">CareBuddy AI</span>
            <span className="text-coffee-800 font-semibold text-[11px]">v1.0.0 (HealthTech Final)</span>
          </div>
          <p className="text-[11px] text-warm-600 leading-relaxed">
            Designed for healthtech hackathons to assist patients and caregivers in managing medication routines and clarifying medical instructions.
          </p>
        </Card>
      </div>
    </div>
  );
};
