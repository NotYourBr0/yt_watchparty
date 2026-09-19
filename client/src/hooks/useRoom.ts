import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import { ServerEvents, ClientEvents } from '@shared/events';
import { RoomState, Participant, ChatMessage, PlaybackRequest, Reaction, SessionData } from '@shared/types';
import { sessionManager } from '../lib/session';

interface JoinResponse {
  roomState: RoomState;
  userId: string;
  sessionId: string;
}

export const useRoom = () => {
  const { socket, isConnected } = useSocket();
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [requests, setRequests] = useState<PlaybackRequest[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  const updateCurrentUser = useCallback((state: RoomState) => {
    const uid = userIdRef.current;
    if (uid) {
      const user = state.participants.find(p => p.userId === uid);
      if (user) setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Full room state update (sent after joins, role changes, etc.)
    socket.on(ServerEvents.ROOM_STATE, (data: RoomState | JoinResponse) => {
      // Check if this is a JoinResponse (has userId/sessionId) or plain RoomState
      if ('userId' in data && 'sessionId' in data) {
        const joinResp = data as JoinResponse;
        userIdRef.current = joinResp.userId;
        setRoomState(joinResp.roomState);
        updateCurrentUser(joinResp.roomState);
        // Save session
        sessionManager.set({
          sessionId: joinResp.sessionId,
          roomCode: joinResp.roomState.roomCode,
          userId: joinResp.userId,
          username: joinResp.roomState.participants.find(p => p.userId === joinResp.userId)?.username || '',
        });
      } else {
        const state = data as RoomState;
        setRoomState(state);
        updateCurrentUser(state);
      }
    });

    socket.on(ServerEvents.RECONNECT_SUCCESS, (data: JoinResponse) => {
      userIdRef.current = data.userId;
      setRoomState(data.roomState);
      updateCurrentUser(data.roomState);
    });

    socket.on(ServerEvents.RECONNECT_FAILED, () => {
      setError('Session expired or room no longer exists.');
      sessionManager.clear();
    });

    socket.on(ServerEvents.USER_JOINED, (participant: Participant) => {
      setRoomState(prev => prev ? {
        ...prev,
        participants: [...prev.participants.filter(p => p.userId !== participant.userId), participant]
      } : null);
    });

    socket.on(ServerEvents.USER_LEFT, ({ userId }: { userId: string }) => {
      setRoomState(prev => prev ? {
        ...prev,
        participants: prev.participants.map(p =>
          p.userId === userId ? { ...p, connected: false } : p
        )
      } : null);
    });

    socket.on(ServerEvents.PLAYBACK_CHANGED, (playback: RoomState['playback']) => {
      setRoomState(prev => prev ? { ...prev, playback } : null);
    });

    socket.on(ServerEvents.VIDEO_CHANGED, (playback: RoomState['playback']) => {
      setRoomState(prev => prev ? { ...prev, playback } : null);
    });

    socket.on(ServerEvents.ROLE_UPDATED, ({ userId, role }: { userId: string; role: string }) => {
      setRoomState(prev => {
        if (!prev) return null;
        const updated = {
          ...prev,
          participants: prev.participants.map(p =>
            p.userId === userId ? { ...p, role: role as any } : p
          )
        };
        return updated;
      });
      setCurrentUser(prev => (prev?.userId === userId) ? { ...prev, role: role as any } : prev);
    });

    socket.on(ServerEvents.PARTICIPANT_REMOVED, ({ userId }: { userId: string }) => {
      if (userIdRef.current === userId) {
        setError('You have been removed from the room.');
        setRoomState(null);
        setCurrentUser(null);
        return;
      }
      setRoomState(prev => prev ? {
        ...prev,
        participants: prev.participants.filter(p => p.userId !== userId)
      } : null);
    });

    socket.on(ServerEvents.HOST_TRANSFERRED, ({ newHostId, oldHostId }: { newHostId: string; oldHostId: string }) => {
      setRoomState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          hostUserId: newHostId,
          participants: prev.participants.map(p => {
            if (p.userId === newHostId) return { ...p, role: 'HOST' as any };
            if (p.userId === oldHostId) return { ...p, role: 'MODERATOR' as any };
            return p;
          })
        };
      });
      // Update currentUser if affected
      if (userIdRef.current === newHostId || userIdRef.current === oldHostId) {
        setCurrentUser(prev => {
          if (!prev) return null;
          if (prev.userId === newHostId) return { ...prev, role: 'HOST' as any };
          if (prev.userId === oldHostId) return { ...prev, role: 'MODERATOR' as any };
          return prev;
        });
      }
    });

    socket.on(ServerEvents.CHAT_MESSAGE, (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on(ServerEvents.PLAYBACK_REQUEST, (request: PlaybackRequest) => {
      setRequests(prev => [...prev, request]);
    });

    socket.on(ServerEvents.REQUEST_UPDATED, (request: PlaybackRequest) => {
      setRequests(prev => prev.map(r => r.id === request.id ? request : r));
    });

    socket.on(ServerEvents.REACTION, (reaction: Reaction) => {
      setReactions(prev => [...prev, reaction]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 3000);
    });

    socket.on(ServerEvents.ROOM_ERROR, ({ message }: { message: string }) => {
      setError(message);
    });

    return () => {
      Object.values(ServerEvents).forEach(event => {
        socket.off(event);
      });
    };
  }, [socket, updateCurrentUser]);

  const joinRoom = useCallback((roomCode: string, username: string) => {
    if (socket) {
      socket.emit(ClientEvents.JOIN_ROOM, { roomCode, username });
    }
  }, [socket]);

  const reconnect = useCallback((session: SessionData) => {
    if (socket) {
      userIdRef.current = session.userId;
      socket.emit(ClientEvents.RECONNECT_SESSION, session);
    }
  }, [socket]);

  const leaveRoom = useCallback(() => {
    if (socket) {
      socket.emit(ClientEvents.LEAVE_ROOM);
      setRoomState(null);
      setCurrentUser(null);
      setMessages([]);
      setRequests([]);
    }
  }, [socket]);

  return {
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
    leaveRoom,
  };
};
