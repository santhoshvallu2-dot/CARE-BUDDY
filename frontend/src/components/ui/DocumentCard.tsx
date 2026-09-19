import React from 'react';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { FileText, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import { DocumentItem } from '../../types';

interface DocumentCardProps {
  document: DocumentItem;
  onClick?: (document: DocumentItem) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onClick }) => {
  return (
    <Card
      hoverable
      onClick={() => onClick?.(document)}
      className="flex items-center justify-between gap-3 p-4 group border-warm-200/80 bg-white"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-warm-100 border border-warm-200 text-warm-900 flex items-center justify-center shrink-0 group-hover:bg-warm-200 transition-colors shadow-2xs">
          <FileText className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-bold text-warm-900 truncate group-hover:text-coffee-700 transition-colors">
              {document.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 text-xs text-warm-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-warm-400" />
              {document.date}
            </span>
            <span>•</span>
            <span className="truncate">{document.category}</span>
          </div>

          {document.instructions && document.instructions.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-warm-700 font-semibold mt-1">
              <Sparkles className="w-3 h-3 text-caramel-600" />
              <span>{document.instructions.length} routines extracted</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={document.status} size="sm" />
        <ChevronRight className="w-4 h-4 text-warm-400 group-hover:text-warm-700 transition-colors" />
      </div>
    </Card>
  );
};
