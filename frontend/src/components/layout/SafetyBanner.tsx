import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const SafetyBanner: React.FC = () => {
  return (
    <div className="bg-[#fefbee] border border-[#f5e9bd] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-[#4d3800] leading-relaxed shadow-2xs">
      <ShieldAlert className="w-4 h-4 text-[#8a6800] shrink-0 mt-0.5" />
      <div>
        <p className="font-bold text-[#362700]">Health Safety Notice</p>
        <p className="text-[#4d3800] text-[11px] mt-0.5 leading-relaxed font-medium">
          CareBuddy organizes and explains information you provide. It does not diagnose, prescribe, or replace professional medical advice.
        </p>
      </div>
    </div>
  );
};
