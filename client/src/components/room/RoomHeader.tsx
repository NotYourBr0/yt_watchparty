import React from 'react';
import { Copy, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { ConnectionStatus } from '../ui/ConnectionStatus';
import { useToast } from '../../hooks/useToast';

interface RoomHeaderProps {
  roomCode: string;
  isConnected: boolean;
  onLeave: () => void;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({ roomCode, isConnected, onLeave }) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    toast('Room code copied to clipboard', 'success');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 md:px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-white tracking-tight">Watch Party</h1>
        <div className="h-6 w-px bg-zinc-800 hidden md:block"></div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Room Code:</span>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            {roomCode}
            <Copy className="h-3 w-3 text-zinc-400" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <ConnectionStatus status={isConnected ? 'connected' : 'disconnected'} className="hidden sm:flex" />
        <Button variant="ghost" size="sm" onClick={onLeave} className="text-zinc-400 hover:text-white">
          <LogOut className="h-4 w-4 mr-2 hidden sm:block" />
          Leave
        </Button>
      </div>
    </header>
  );
};
