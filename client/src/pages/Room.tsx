import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Users, MessageSquare } from 'lucide-react';
import { useRoom } from '../hooks/useRoom';
import { useToast } from '../hooks/useToast';
import { sessionManager } from '../lib/session';
import { ClientEvents } from '@shared/events';
import { Role } from '@shared/types';
import { RoomHeader } from '../components/room/RoomHeader';
import { VideoPlayer } from '../components/room/VideoPlayer';
import { PlaybackControls } from '../components/room/PlaybackControls';
import { VideoInput } from '../components/room/VideoInput';
import { ParticipantsPanel } from '../components/room/ParticipantsPanel';
import { ChatPanel } from '../components/room/ChatPanel';
import { Tabs } from '../components/ui/Tabs';
import { ReactionPicker } from '../components/room/ReactionPicker';
import { PlaybackRequestPanel } from '../components/room/PlaybackRequestPanel';
import { ConnectionStatus } from '../components/ui/ConnectionStatus';

export const Room: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'participants' | 'chat'>('chat');
  const [hasJoined, setHasJoined] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  const {
    socket,
    isConnected,
    roomState,
    currentUser,
    messages,
    requests,
    reactions,
    error,
    joinRoom,
    reconnect,
    leaveRoom
  } = useRoom();

  useEffect(() => {
    if (!roomCode || hasJoined || !isConnected) return;

    const session = sessionManager.get();
    const stateUsername = location.state?.username;

    if (session && session.roomCode === roomCode) {
      reconnect(session);
      setHasJoined(true);
    } else if (stateUsername) {
      joinRoom(roomCode, stateUsername);
      setHasJoined(true);
    } else {
      // Direct URL with no session — redirect to landing with room code
      navigate('/', { state: { joinRoomCode: roomCode }, replace: true });
    }
  }, [roomCode, isConnected, hasJoined, location.state, joinRoom, reconnect, navigate]);

  useEffect(() => {
    if (error) {
      toast(error, 'error');
      if (error.includes('removed') || error.includes('not found') || error.includes('expired')) {
        sessionManager.clear();
        setTimeout(() => navigate('/'), 1500);
      }
    }
  }, [error, toast, navigate]);

  const handleLeave = () => {
    leaveRoom();
    sessionManager.clear();
    navigate('/');
  };

  if (!roomState || !currentUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-sm">Connecting to room...</p>
        {!isConnected && (
          <ConnectionStatus status="reconnecting" className="mt-4" />
        )}
      </div>
    );
  }

  const isHostOrMod = currentUser.role === Role.HOST || currentUser.role === Role.MODERATOR;
  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  return (
    <div className="flex flex-col h-screen bg-zinc-950 overflow-hidden">
      <RoomHeader
        roomCode={roomState.roomCode}
        isConnected={isConnected}
        onLeave={handleLeave}
      />

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col min-w-0 p-3 lg:p-5 gap-3 overflow-y-auto relative">

          {/* Floating Reactions */}
          <div className="pointer-events-none fixed inset-0 z-50">
            {reactions.map(r => (
              <div
                key={r.id}
                className="absolute animate-float-up text-4xl"
                style={{
                  left: `${40 + Math.random() * 20}%`,
                  bottom: '20%',
                }}
              >
                {r.type}
              </div>
            ))}
          </div>

          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
            <VideoPlayer
              videoId={roomState.playback.videoId}
              isPlaying={roomState.playback.isPlaying}
              currentTime={roomState.playback.currentTime}
              updatedAt={roomState.playback.updatedAt}
              role={currentUser.role}
              onPlay={(time) => socket?.emit(ClientEvents.PLAY, { time })}
              onPause={(time) => socket?.emit(ClientEvents.PAUSE, { time })}
              onSeek={(time) => socket?.emit(ClientEvents.SEEK, { time })}
              onDurationChange={(dur) => setVideoDuration(dur)}
              onSelectPreset={(vId) => {
                if (isHostOrMod) {
                  socket?.emit(ClientEvents.CHANGE_VIDEO, { videoId: vId });
                } else {
                  socket?.emit(ClientEvents.REQUEST_VIDEO, { videoUrl: vId });
                }
              }}
            />
          </div>

          <PlaybackControls
            isPlaying={roomState.playback.isPlaying}
            currentTime={roomState.playback.currentTime}
            updatedAt={roomState.playback.updatedAt}
            duration={videoDuration}
            role={currentUser.role}
            onPlay={() => socket?.emit(ClientEvents.PLAY, { time: roomState.playback.currentTime })}
            onPause={() => socket?.emit(ClientEvents.PAUSE, { time: roomState.playback.currentTime })}
            onSeek={(time) => socket?.emit(ClientEvents.SEEK, { time })}
            onRequestPlay={() => socket?.emit(ClientEvents.REQUEST_PLAY)}
            onRequestPause={() => socket?.emit(ClientEvents.REQUEST_PAUSE)}
            onRequestSeek={(time) => socket?.emit(ClientEvents.REQUEST_SEEK, { time })}
          />

          <VideoInput
            currentVideoId={roomState.playback.videoId}
            onChangeVideo={(videoId) => {
              if (isHostOrMod) {
                socket?.emit(ClientEvents.CHANGE_VIDEO, { videoId });
              } else {
                socket?.emit(ClientEvents.REQUEST_VIDEO, { videoUrl: videoId });
              }
            }}
          />

          {isHostOrMod && pendingRequests.length > 0 && (
            <PlaybackRequestPanel
              requests={pendingRequests}
              onApprove={(id) => socket?.emit(ClientEvents.APPROVE_REQUEST, { requestId: id })}
              onReject={(id) => socket?.emit(ClientEvents.REJECT_REQUEST, { requestId: id })}
            />
          )}

          {/* Reaction Picker - positioned at bottom of video area */}
          <div className="flex justify-center">
            <ReactionPicker onReact={(type) => socket?.emit(ClientEvents.SEND_REACTION, { type })} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[360px] xl:w-[400px] border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col bg-zinc-950 h-80 lg:h-auto shrink-0">
          <Tabs
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as 'participants' | 'chat')}
            tabs={[
              { id: 'chat', label: 'Chat', icon: <MessageSquare className="h-4 w-4" /> },
              { id: 'participants', label: `People (${roomState.participants.filter(p => p.connected).length})`, icon: <Users className="h-4 w-4" /> },
            ]}
          />

          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'chat' ? (
              <ChatPanel
                messages={messages}
                onSendMessage={(content) => socket?.emit(ClientEvents.SEND_MESSAGE, { content })}
              />
            ) : (
              <ParticipantsPanel
                participants={roomState.participants}
                currentUserRole={currentUser.role}
                onPromote={(userId) => socket?.emit(ClientEvents.ASSIGN_ROLE, { userId, role: Role.MODERATOR })}
                onDemote={(userId) => socket?.emit(ClientEvents.ASSIGN_ROLE, { userId, role: Role.PARTICIPANT })}
                onRemove={(userId) => socket?.emit(ClientEvents.REMOVE_PARTICIPANT, { userId })}
                onTransferHost={(newHostId) => socket?.emit(ClientEvents.TRANSFER_HOST, { newHostId })}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
