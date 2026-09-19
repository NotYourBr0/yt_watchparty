import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'connected' | 'reconnecting' | 'disconnected';
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, className = '' }) => {
  if (status === 'connected') {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full ${className}`}>
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </div>
        <span>Connected</span>
      </div>
    );
  }

  if (status === 'reconnecting') {
    return (
      <div className={`flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full ${className}`}>
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        <span>Reconnecting...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full ${className}`}>
      <WifiOff className="h-3.5 w-3.5" />
      <span>Disconnected</span>
    </div>
  );
};
