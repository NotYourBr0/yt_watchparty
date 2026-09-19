import React from 'react';
import { Check, X, Play, Pause, FastForward, Video } from 'lucide-react';
import { PlaybackRequest, RequestStatus, RequestType } from '@shared/types';
import { Button } from '../ui/Button';

interface PlaybackRequestPanelProps {
  requests: PlaybackRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const PlaybackRequestPanel: React.FC<PlaybackRequestPanelProps> = ({
  requests,
  onApprove,
  onReject,
}) => {
  const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING);

  if (pendingRequests.length === 0) return null;

  const getRequestIcon = (type: RequestType) => {
    switch (type) {
      case RequestType.PLAY: return <Play className="h-4 w-4" />;
      case RequestType.PAUSE: return <Pause className="h-4 w-4" />;
      case RequestType.SEEK: return <FastForward className="h-4 w-4" />;
      case RequestType.VIDEO: return <Video className="h-4 w-4" />;
    }
  };

  const getRequestText = (request: PlaybackRequest) => {
    switch (request.type) {
      case RequestType.PLAY: return 'requested to play';
      case RequestType.PAUSE: return 'requested to pause';
      case RequestType.SEEK: 
        const m = Math.floor((request.payload?.seekTime || 0) / 60);
        const s = Math.floor((request.payload?.seekTime || 0) % 60).toString().padStart(2, '0');
        return `requested to seek to ${m}:${s}`;
      case RequestType.VIDEO: return 'requested to change video';
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pending Requests</h3>
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar">
        {pendingRequests.map(req => (
          <div key={req.id} className="flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-md">
                {getRequestIcon(req.type)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{req.username}</span>
                <span className="text-xs text-indigo-300">{getRequestText(req)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="danger" onClick={() => onReject(req.id)} className="h-8 w-8 p-0 rounded-md bg-zinc-800 text-zinc-400 hover:bg-red-500/20 hover:text-red-400">
                <X className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={() => onApprove(req.id)} className="h-8 w-8 p-0 rounded-md bg-indigo-600 hover:bg-indigo-500">
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
