import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Hand } from 'lucide-react';
import { Role } from '@shared/types';
import { Button } from '../ui/Button';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  updatedAt: string;
  duration?: number;
  role: Role;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onRequestPlay: () => void;
  onRequestPause: () => void;
  onRequestSeek: (time: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  currentTime,
  updatedAt,
  duration = 0,
  role,
  onPlay,
  onPause,
  onSeek,
  onRequestPlay,
  onRequestPause,
  onRequestSeek
}) => {
  const [localTime, setLocalTime] = useState(currentTime);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  const canControl = role === Role.HOST || role === Role.MODERATOR;

  useEffect(() => {
    if (isScrubbing) return;
    
    setLocalTime(currentTime);
    
    if (isPlaying) {
      const start = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - start) / 1000;
        setLocalTime(currentTime + elapsed);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTime, isScrubbing]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleScrub = (e: React.MouseEvent) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const maxDuration = duration > 0 ? duration : 600;
    const newTime = percent * maxDuration;
    
    setLocalTime(newTime);
    if (canControl) {
      onSeek(newTime);
    } else {
      onRequestSeek(newTime);
    }
  };

  const maxDuration = duration > 0 ? duration : 600;

  return (
    <div className="flex flex-col gap-2 p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
      <div 
        ref={progressBarRef}
        className={`h-2 bg-zinc-800 rounded-full relative cursor-pointer group ${!canControl && 'opacity-70'}`}
        onMouseDown={(e) => {
          setIsScrubbing(true);
          handleScrub(e);
        }}
        onMouseUp={() => setIsScrubbing(false)}
        onMouseLeave={() => setIsScrubbing(false)}
        onMouseMove={(e) => isScrubbing && handleScrub(e)}
      >
        <div 
          className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-150 ease-out"
          style={{ width: `${Math.min(100, (localTime / maxDuration) * 100)}%` }}
        />
        <div className="absolute top-1/2 -mt-2 -ml-2 h-4 w-4 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" 
             style={{ left: `${Math.min(100, (localTime / maxDuration) * 100)}%` }} />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {canControl ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={isPlaying ? onPause : onPlay}
              className="text-white hover:bg-zinc-800 p-2 rounded-full"
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={isPlaying ? onRequestPause : onRequestPlay}
                className="text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 px-3"
              >
                <Hand className="h-4 w-4 mr-2" />
                Request {isPlaying ? 'Pause' : 'Play'}
              </Button>
            </div>
          )}
          
          <span className="text-xs font-medium text-zinc-400 font-mono">
            {formatTime(localTime)} {duration > 0 && `/ ${formatTime(duration)}`}
          </span>
        </div>
      </div>
    </div>
  );
};
