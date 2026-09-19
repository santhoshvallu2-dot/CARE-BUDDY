import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { ShieldCheck, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export const HowCareBuddyWorksCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    { num: '1', title: 'You provide a document', desc: 'Scan with camera or upload a photo of your healthcare instructions.' },
    { num: '2', title: 'CareBuddy extracts text', desc: 'Browser OCR reads the document text right on your device.' },
    { num: '3', title: 'You verify the information', desc: 'Review and edit the extracted text before sending it to AI.' },
    { num: '4', title: 'AI explains simply', desc: 'Instructions are simplified into plain language and doctor questions.' },
    { num: '5', title: 'You confirm every reminder', desc: 'Reminders are created ONLY after your explicit review and confirmation.' },
    { num: '6', title: 'Unclear details are flagged', desc: 'Ambiguous notes are clearly flagged for doctor verification.' },
  ];

  return (
    <Card className="p-4 border-warm-200/80 bg-white space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-warm-100 text-warm-900 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-warm-900">How CareBuddy Works</h4>
            <p className="text-[11px] text-warm-500">Your care, organized safely with you in control</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Collapse How CareBuddy Works' : 'Expand How CareBuddy Works'}
          className="p-1 text-warm-400 hover:text-warm-800 rounded-lg cursor-pointer"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-2.5 pt-2 border-t border-warm-200/60 animate-fadeIn">
          <div className="grid grid-cols-1 gap-2">
            {steps.map((s) => (
              <div key={s.num} className="flex items-start gap-2.5 text-xs">
                <span className="w-5 h-5 rounded-full bg-warm-100 text-warm-900 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-warm-200/70">
                  {s.num}
                </span>
                <div className="min-w-0">
                  <span className="font-bold text-warm-900">{s.title}</span>
                  <p className="text-[11px] text-warm-500 mt-0.2 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#fefbee] rounded-xl border border-[#f5e9bd] text-[11px] text-[#4d3800] flex items-start gap-2 mt-1">
            <Sparkles className="w-3.5 h-3.5 text-caramel-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-bold">Human-in-the-Loop Safety:</span> CareBuddy is an information organizer. It does not diagnose, prescribe, or create routines without your approval.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
