import { Server, Socket } from 'socket.io';
import { ClientEvents, ServerEvents } from '../../../../shared/events';
import { PlaybackManager } from '../../services/PlaybackManager';
import { RoomManager } from '../../services/RoomManager';

export const registerPlaybackHandlers = (io: Server, socket: Socket) => {
  socket.on(ClientEvents.PLAY, async (payload: { time?: number }) => {
    const { roomCode, userId } = socket.data;
    if (!roomCode || !userId) return;
    
    const time = payload?.time || 0;
    const success = await PlaybackManager.play(roomCode, userId, time);
    if (success) {
      const room = RoomManager.getRoom(roomCode);
      io.to(roomCode).emit(ServerEvents.PLAYBACK_CHANGED, room?.playback);
    }
  });

  socket.on(ClientEvents.PAUSE, async (payload: { time?: number }) => {
    const { roomCode, userId } = socket.data;
    if (!roomCode || !userId) return;

    const time = payload?.time || 0;
    const success = await PlaybackManager.pause(roomCode, userId, time);
    if (success) {
      const room = RoomManager.getRoom(roomCode);
      io.to(roomCode).emit(ServerEvents.PLAYBACK_CHANGED, room?.playback);
    }
  });

  socket.on(ClientEvents.SEEK, async (payload: { time: number }) => {
    const { roomCode, userId } = socket.data;
    if (!roomCode || !userId) return;

    const success = await PlaybackManager.seek(roomCode, userId, payload.time);
    if (success) {
      const room = RoomManager.getRoom(roomCode);
      io.to(roomCode).emit(ServerEvents.PLAYBACK_CHANGED, room?.playback);
    }
  });

  socket.on(ClientEvents.CHANGE_VIDEO, async (payload: { videoId: string }) => {
    const { roomCode, userId } = socket.data;
    if (!roomCode || !userId) return;

    const videoId = await PlaybackManager.changeVideo(roomCode, userId, payload.videoId);
    if (videoId) {
      const room = RoomManager.getRoom(roomCode);
      io.to(roomCode).emit(ServerEvents.VIDEO_CHANGED, room?.playback);
    }
  });
};
