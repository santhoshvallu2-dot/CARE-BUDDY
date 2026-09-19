import React from 'react';
import { Card } from './Card';
import { ReadAloudButton } from '../voice/ReadAloudButton';
import { Sparkles, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { DocumentItem } from '../../types';

interface CareSummaryCardProps {
  document: DocumentItem;
  onViewDetails?: (doc: DocumentItem) => void;
  compact?: boolean;
}

export const CareSummaryCard: React.FC<CareSummaryCardProps> = ({
  document,
  onViewDetails,
  compact = false,
}) => {
  const analysis = document.analysis;
  const simpleExplanation = analysis?.simpleExplanation || document.summary;
  const identifiedInstructions = analysis?.identifiedInstructions || [];
  const uncertainInfo = analysis?.uncertainInformation || [];
  const instructionsList = document.instructions || [];

  return (
    <Card className="bg-white border-warm-200/80 p-4 space-y-3.5 shadow-2xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-warm-100 text-warm-900 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-caramel-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-warm-900 bg-warm-100 px-2 py-0.5 rounded border border-warm-200">
                Care Summary
              </span>
              <span className="text-[11px] text-warm-500 truncate">{document.date}</span>
            </div>
            <h4 className="text-xs font-bold text-warm-900 truncate mt-0.5">
              {document.title}
            </h4>
          </div>
        </div>

        {onViewDetails && (
          <button
            type="button"
            onClick={() => onViewDetails(document)}
            className="text-xs font-bold text-warm-800 hover:text-warm-950 flex items-center gap-0.5 cursor-pointer shrink-0"
          >
            View Doc &rarr;
          </button>
        )}
      </div>

      {/* Simple Explanation */}
      {simpleExplanation && (
        <div className="bg-warm-50 rounded-xl p-3 border border-warm-200/80 text-xs text-warm-800 leading-relaxed">
          <div className="flex items-center justify-between mb-1">
            <p className="font-bold text-warm-900 flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3 h-3 text-caramel-600" />
              Simple Explanation
            </p>
            <ReadAloudButton text={simpleExplanation} />
          </div>
          <p className="text-warm-700 font-medium">{simpleExplanation}</p>
        </div>
      )}

      {/* Identified Instructions Snippet */}
      {identifiedInstructions.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-warm-700 uppercase tracking-wider">
            Clearly Identified Instructions ({identifiedInstructions.length})
          </p>
          <div className="space-y-1.5">
            {identifiedInstructions.slice(0, compact ? 2 : 4).map((inst) => (
              <div
                key={inst.id}
                className="flex items-start gap-2 bg-warm-50 rounded-xl p-2.5 border border-warm-200/70 text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-natural-greenText shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-warm-900 truncate">{inst.instruction}</span>
                    {inst.timing && (
                      <span className="text-[10px] text-warm-800 bg-warm-200/80 px-1.5 py-0.2 rounded font-semibold shrink-0">
                        {inst.timing}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-warm-500 truncate mt-0.5">{inst.sourceText}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : instructionsList.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-warm-700 uppercase tracking-wider">
            Extracted Instructions ({instructionsList.length})
          </p>
          <div className="space-y-1.5">
            {instructionsList.slice(0, compact ? 2 : 4).map((inst) => (
              <div
                key={inst.id}
                className="flex items-start gap-2 bg-warm-50 rounded-xl p-2.5 border border-warm-200/70 text-xs"
              >
                <Clock className="w-3.5 h-3.5 text-warm-700 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-warm-900">{inst.action}</span>
                  <p className="text-[11px] text-warm-500 mt-0.5">{inst.timing} • {inst.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Unclear / Needs Verification Section */}
      {uncertainInfo.length > 0 && (
        <div className="bg-[#fefbee] rounded-xl p-3 border border-[#f5e9bd] space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-[#594002] font-bold text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#8a6800]" />
            <span>Needs Verification ({uncertainInfo.length})</span>
          </div>
          <ul className="list-disc list-inside text-[11px] text-[#594002] space-y-0.5 pl-1 font-medium">
            {uncertainInfo.map((info, idx) => (
              <li key={idx} className="leading-snug">{info}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Mandatory Safety Notice */}
      <div className="pt-1 text-[11px] text-warm-500 italic leading-relaxed">
        "Based on the information you provided. Please verify unclear information with your healthcare professional."
      </div>
    </Card>
  );
};
