import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { SafetyBanner } from '../layout/SafetyBanner';
import { CaregiverHandoffData } from '../../types/handoff';
import {
  HeartPulse,
  Clock,
  CheckCircle2,
  HelpCircle,
  FileText
} from 'lucide-react';

interface CaregiverDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CaregiverHandoffData | null;
}

export const CaregiverDashboardModal: React.FC<CaregiverDashboardModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!data) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Caregiver Companion View"
      subtitle={`Verified patient care plan received from ${data.patientName}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Header Badge & Meta */}
        <div className="bg-[#f2f8f2] border border-[#d2ebd2] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#1c4d1c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2e7d32] text-white flex items-center justify-center font-bold">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#143d14]">{data.patientName}'s Active Care Plan</p>
              <p className="text-[11px] text-[#285e28] mt-0.5">
                Session Code: <span className="font-mono font-bold">{data.transferCode}</span> • Verified via CareBuddy AI
              </p>
            </div>
          </div>
          <StatusBadge variant="ready">VERIFIED HANDOFF</StatusBadge>
        </div>

        {/* Safety Notice */}
        <SafetyBanner />

        {/* 1. Care Summary Section */}
        {data.summary && (
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-warm-900 font-bold text-sm">
                <FileText className="w-4 h-4 text-warm-700" />
                <span>Document Explanation ({data.summary.title})</span>
              </div>
              <p className="text-xs text-warm-700 leading-relaxed bg-warm-50 p-3 rounded-xl border border-warm-200/70">
                {data.summary.simpleExplanation}
              </p>
            </div>
          </Card>
        )}

        {/* 2. Today's Care Routine & Progress */}
        {data.todayRoutines && (
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-warm-900 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Today's Care Progress</span>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {data.todayRoutines.completedDoses} / {data.todayRoutines.totalDoses} Doses ({data.todayRoutines.adherencePercentage}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-warm-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${data.todayRoutines.adherencePercentage}%` }}
                />
              </div>

              <div className="space-y-2 pt-1">
                {data.todayRoutines.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start justify-between p-2.5 rounded-xl border text-xs ${
                      item.completed
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-white border-warm-200 text-warm-900'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{item.title}</p>
                      <p className="text-[11px] text-warm-500 mt-0.5">{item.instruction}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-[11px] block">{item.time}</span>
                      <span className={`text-[10px] font-bold ${item.completed ? 'text-emerald-700' : 'text-warm-400'}`}>
                        {item.completed ? 'Completed' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* 3. Full Reminders Schedule */}
        {data.remindersSchedule && data.remindersSchedule.length > 0 && (
          <Card className="p-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-warm-900 font-bold text-sm">
                <Clock className="w-4 h-4 text-caramel-700" />
                <span>Full Care Routine Schedule ({data.remindersSchedule.length} Items)</span>
              </div>
              <div className="space-y-2">
                {data.remindersSchedule.map((rem) => (
                  <div key={rem.id} className="p-2.5 bg-white rounded-xl border border-warm-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-warm-900">{rem.title}</p>
                      <p className="text-[11px] text-warm-500">{rem.instruction}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-warm-800">{rem.time}</span>
                      <span className="text-[10px] text-warm-500 block">{rem.frequency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* 4. Doctor Questions */}
        {data.doctorQuestions && data.doctorQuestions.length > 0 && (
          <Card className="p-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-warm-900 font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-sky-700" />
                <span>Doctor Appointment Discussion Questions ({data.doctorQuestions.length})</span>
              </div>
              <div className="space-y-2">
                {data.doctorQuestions.map((q) => (
                  <div key={q.id} className="p-2.5 bg-sky-50/50 rounded-xl border border-sky-200/70 text-xs">
                    <p className="font-semibold text-warm-900">"{q.question}"</p>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-warm-500">
                      <span>Category: {q.category}</span>
                      <span className={q.resolved ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                        {q.resolved ? 'Discussed with Doctor' : 'To Discuss at Next Visit'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        <div className="pt-2">
          <Button variant="primary" fullWidth onClick={onClose}>
            Close Companion View
          </Button>
        </div>
      </div>
    </Modal>
  );
};
