import { Server, Socket } from 'socket.io';
import { ClientEvents, ServerEvents } from '../../../../shared/events';
import { RequestManager } from '../../services/RequestManager';
import { RequestType } from '../../../../shared/types';
import { RoomManager } from '../../services/RoomManager';

export const registerRequestHandlers = (io: Server, socket: Socket) => {
  socket.on(ClientEvents.REQUEST_PLAY, (payload?: { time?: number }) => {
    const { roomCode, userId, username } = socket.data;
    if (!roomCode || !userId) return;

    const req = RequestManager.createRequest(roomCode, userId, username, RequestType.PLAY, { seekTime: payload?.time });
    io.to(roomCode).emit(ServerEvents.PLAYBACK_REQUEST, req);
  });

  socket.on(ClientEvents.REQUEST_PAUSE, (payload?: { time?: number }) => {
    const { roomCode, userId, username } = socket.data;
    if (!roomCode || !userId) return;

    const req = RequestManager.createRequest(roomCode, userId, username, RequestType.PAUSE, { seekTime: payload?.time });
    io.to(roomCode).emit(ServerEvents.PLAYBACK_REQUEST, req);
  });

  socket.on(ClientEvents.REQUEST_SEEK, (payload: { time: number }) => {
    const { roomCode, userId, username } = socket.data;
    if (!roomCode || !userId) return;

    const req = RequestManager.createRequest(roomCode, userId, username, RequestType.SEEK, { seekTime: payload.time });
    io.to(roomCode).emit(ServerEvents.PLAYBACK_REQUEST, req);
  });

  socket.on(ClientEvents.REQUEST_VIDEO, (payload: { videoUrl: string }) => {
    const { roomCode, userId, username } = socket.data;
    if (!roomCode || !userId) return;

    const req = RequestManager.createRequest(roomCode, userId, username, RequestType.VIDEO, { videoUrl: payload.videoUrl });
    io.to(roomCode).emit(ServerEvents.PLAYBACK_REQUEST, req);
  });

  socket.on(ClientEvents.APPROVE_REQUEST, async (payload: { requestId: string }) => {
    const { roomCode, userId: hostUserId } = socket.data;
    if (!roomCode || !hostUserId) return;

    const req = await RequestManager.approveRequest(roomCode, hostUserId, payload.requestId);
    if (req) {
      io.to(roomCode).emit(ServerEvents.REQUEST_UPDATED, req);
      const room = RoomManager.getRoom(roomCode);
      if (req.type === RequestType.VIDEO) {
        io.to(roomCode).emit(ServerEvents.VIDEO_CHANGED, room?.playback);
      } else {
        io.to(roomCode).emit(ServerEvents.PLAYBACK_CHANGED, room?.playback);
      }
    }
  });

  socket.on(ClientEvents.REJECT_REQUEST, (payload: { requestId: string }) => {
    const { roomCode, userId: hostUserId } = socket.data;
    if (!roomCode || !hostUserId) return;

    const req = RequestManager.rejectRequest(roomCode, hostUserId, payload.requestId);
    if (req) {
      io.to(roomCode).emit(ServerEvents.REQUEST_UPDATED, req);
    }
  });
};
