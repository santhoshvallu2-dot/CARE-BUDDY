import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Undo2 } from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-natural-greenText shrink-0" />,
    info: <Info className="w-5 h-5 text-warm-800 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-natural-yellowText shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-natural-redText shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-[#f2f8f0] border-[#d5e9cf] text-[#234a21]',
    info: 'bg-[#fbf9f4] border-[#ded3c1] text-[#241e18]',
    warning: 'bg-[#fef9ec] border-[#faeab7] text-[#594002]',
    error: 'bg-[#fdf2f2] border-[#f8d4d4] text-[#661b1e]',
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-slideDown">
      <div
        className={`flex items-start gap-3 p-3.5 rounded-2xl border shadow-md backdrop-blur-md ${bgStyles[toast.type]}`}
        role="alert"
      >
        {icons[toast.type]}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold leading-tight">{toast.title}</p>
          {toast.message && (
            <p className="text-[11px] opacity-90 mt-0.5 leading-snug">{toast.message}</p>
          )}
        </div>

        {toast.actionText && toast.onAction && (
          <button
            onClick={() => {
              toast.onAction?.();
              onClose();
            }}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-warm-100 text-xs font-bold text-warm-900 shadow-2xs border border-warm-300 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <Undo2 className="w-3 h-3" />
            {toast.actionText}
          </button>
        )}

        <button
          onClick={onClose}
          aria-label="Dismiss notification"
          className="text-warm-500 hover:text-warm-900 p-1 rounded-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
