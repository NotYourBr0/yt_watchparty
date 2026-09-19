import React, { useEffect, useRef, useState } from 'react';
import { Role } from '@shared/types';
import { Skeleton } from '../ui/Skeleton';
import { Play, Music, Sparkles } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  updatedAt: string;
  role: Role;
  onPlay: (time: number) => void;
  onPause: (time: number) => void;
  onSeek: (time: number) => void;
  onSelectPreset?: (videoId: string) => void;
  onDurationChange?: (duration: number) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const PRESET_VIDEOS = [
  { id: 'jfKfPfyJRdk', title: 'Lofi Girl - chill beats', icon: <Music className="h-4 w-4 mr-1 text-indigo-400" /> },
  { id: 'aqz-KE-bpKQ', title: 'Big Buck Bunny (Open Movie)', icon: <Play className="h-4 w-4 mr-1 text-amber-400" /> },
  { id: 'L_LUpnjgPso', title: 'Earth from Space (4K)', icon: <Sparkles className="h-4 w-4 mr-1 text-emerald-400" /> },
];

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  isPlaying,
  currentTime,
  updatedAt,
  role,
  onPlay,
  onPause,
  onSeek,
  onSelectPreset,
  onDurationChange,
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isServerSyncingRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const lastStateUpdateRef = useRef<number>(0);

  // Load YT API script
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        if (videoId) initPlayer();
      };
    } else if (!playerRef.current && videoId) {
      initPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  const initPlayer = () => {
    if (!containerRef.current || !videoId) return;

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          setIsReady(true);
          const dur = playerRef.current?.getDuration();
          if (dur && onDurationChange) onDurationChange(dur);
        },
        onStateChange: handlePlayerStateChange,
      },
    });
  };

  const handlePlayerStateChange = (event: any) => {
    // Ignore any state change event triggered while server sync is active
    if (isServerSyncingRef.current || !playerRef.current) return;

    const state = event.data;
    const time = playerRef.current.getCurrentTime() || 0;

    // For participants: if they click YouTube player directly, revert to authoritative server state
    if (role === Role.PARTICIPANT) {
      isServerSyncingRef.current = true;
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
      setTimeout(() => { isServerSyncingRef.current = false; }, 1000);
      return;
    }

    // For host/mod: emit manual state changes to server
    if (state === window.YT?.PlayerState?.PLAYING && !isPlaying) {
      onPlay(time);
    } else if (state === window.YT?.PlayerState?.PAUSED && isPlaying) {
      onPause(time);
    }
  };

  // Sync videoId
  useEffect(() => {
    if (isReady && playerRef.current && videoId) {
      const currentVideoId = playerRef.current.getVideoData()?.video_id;
      if (currentVideoId !== videoId) {
        isServerSyncingRef.current = true;
        playerRef.current.loadVideoById(videoId);
        setTimeout(() => { isServerSyncingRef.current = false; }, 1000);
      }
    } else if (videoId && !playerRef.current && window.YT?.Player) {
      initPlayer();
    }
  }, [videoId, isReady]);

  // Sync playback state (play/pause/seek) from server props
  useEffect(() => {
    if (!isReady || !playerRef.current) return;

    isServerSyncingRef.current = true;

    try {
      const playerTime = playerRef.current.getCurrentTime() || 0;

      let expectedTime = currentTime;
      if (isPlaying) {
        const now = Date.now();
        const updatedTime = new Date(updatedAt).getTime();
        const elapsedSeconds = (now - updatedTime) / 1000;
        if (elapsedSeconds > 0 && elapsedSeconds < 86400) {
          expectedTime += elapsedSeconds;
        }
      }

      // 1. Drift seek check
      if (Math.abs(playerTime - expectedTime) > 1.2) {
        playerRef.current.seekTo(expectedTime, true);
      }

      // 2. Play / Pause state enforcement
      const playerState = playerRef.current.getPlayerState();
      const isPlayerPlaying = playerState === window.YT?.PlayerState?.PLAYING;
      const isPlayerPaused = playerState === window.YT?.PlayerState?.PAUSED;

      if (isPlaying) {
        if (!isPlayerPlaying) {
          playerRef.current.playVideo();
        }
      } else {
        if (!isPlayerPaused) {
          playerRef.current.pauseVideo();
        }
      }
    } catch (e) {
      console.error('Error syncing player', e);
    }

    const timer = setTimeout(() => {
      isServerSyncingRef.current = false;
    }, 1200);

    return () => {
      clearTimeout(timer);
    };
  }, [isPlaying, currentTime, updatedAt, isReady]);

  // Check for local seeks by Host/Mod
  useEffect(() => {
    if (!isReady || role === Role.PARTICIPANT) return;

    const interval = setInterval(() => {
      if (isServerSyncingRef.current || !playerRef.current || !isPlaying) return;

      const time = playerRef.current.getCurrentTime();
      if (time !== undefined && Math.abs(time - lastStateUpdateRef.current) > 3) {
        onSeek(time);
      }
      lastStateUpdateRef.current = time;
    }, 1000);

    return () => clearInterval(interval);
  }, [isReady, role, isPlaying, onSeek]);

  if (!videoId) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 p-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
          <Play className="h-7 w-7 text-indigo-400 ml-0.5" />
        </div>
        <h3 className="text-lg font-medium text-white mb-1">No Video Playing</h3>
        <p className="text-sm text-zinc-400 max-w-sm mb-6">
          Paste any YouTube video URL or ID below to start synchronized watching.
        </p>

        {onSelectPreset && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              Or pick a quick start video:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {PRESET_VIDEOS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset.id)}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700/60 transition-colors"
                >
                  {preset.icon}
                  {preset.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black rounded-lg overflow-hidden">
      {!isReady && <Skeleton className="absolute inset-0 z-10 rounded-lg" />}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
