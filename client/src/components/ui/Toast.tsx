import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-indigo-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-indigo-400" />
  };

  return (
    <div className="animate-slide-in flex w-80 items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-lg text-sm text-white">
      <div className="flex items-center gap-3">
        {icons[type]}
        <span className="break-words">{message}</span>
      </div>
      <button 
        onClick={onClose}
        className="text-zinc-400 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
