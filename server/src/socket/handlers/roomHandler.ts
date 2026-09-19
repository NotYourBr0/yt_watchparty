import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { ClientEvents, ServerEvents } from '../../../../shared/events';
import { RoomManager } from '../../services/RoomManager';

export const registerRoomHandlers = (io: Server, socket: Socket) => {
  socket.on(ClientEvents.JOIN_ROOM, async (payload: { roomCode: string; username: string }) => {
    let room = RoomManager.getRoom(payload.roomCode);
    const userId = uuidv4();
    const sessionId = uuidv4();

    if (!room) {
      room = await RoomManager.createRoom(payload.roomCode, userId, payload.username, sessionId);
    } else {
      await RoomManager.joinRoom(payload.roomCode, userId, payload.username, sessionId);
    }
    
    socket.join(payload.roomCode);
    socket.data.roomCode = payload.roomCode;
    socket.data.sessionId = sessionId;
    socket.data.userId = userId;
    socket.data.username = payload.username;

    const updatedRoom = RoomManager.getRoom(payload.roomCode);
    socket.emit(ServerEvents.ROOM_STATE, { roomState: updatedRoom, userId, sessionId });
    socket.to(payload.roomCode).emit(ServerEvents.ROOM_STATE, updatedRoom);
    socket.to(payload.roomCode).emit(ServerEvents.USER_JOINED, updatedRoom?.participants.find(p => p.userId === userId));
  });

  socket.on(ClientEvents.LEAVE_ROOM, async () => {
    const { roomCode, sessionId, userId } = socket.data;
    if (roomCode && sessionId) {
      await RoomManager.leaveRoom(roomCode, sessionId);
      socket.leave(roomCode);
      const room = RoomManager.getRoom(roomCode);
      io.to(roomCode).emit(ServerEvents.ROOM_STATE, room);
      io.to(roomCode).emit(ServerEvents.USER_LEFT, { userId });
      socket.data = {};
    }
  });

  socket.on(ClientEvents.RECONNECT_SESSION, async (payload: { sessionId: string; roomCode: string; userId: string; username: string }) => {
    const room = await RoomManager.reconnectSession(payload.roomCode, payload.sessionId);
    if (room) {
      socket.join(payload.roomCode);
      socket.data.roomCode = payload.roomCode;
      socket.data.sessionId = payload.sessionId;
      socket.data.userId = payload.userId;
      socket.data.username = payload.username;
      
      socket.emit(ServerEvents.RECONNECT_SUCCESS, { roomState: room, userId: payload.userId, sessionId: payload.sessionId });
      socket.to(payload.roomCode).emit(ServerEvents.ROOM_STATE, room);
    } else {
      socket.emit(ServerEvents.RECONNECT_FAILED);
    }
  });

  socket.on('disconnect', async () => {
    const { roomCode, sessionId, userId } = socket.data;
    if (roomCode && sessionId) {
      await RoomManager.leaveRoom(roomCode, sessionId);
      const room = RoomManager.getRoom(roomCode);
      if (room) {
        io.to(roomCode).emit(ServerEvents.ROOM_STATE, room);
        io.to(roomCode).emit(ServerEvents.USER_LEFT, { userId });
      }
    }
  });
};
