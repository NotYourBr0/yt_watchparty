import { Server, Socket } from 'socket.io';
import { ClientEvents, ServerEvents } from '../../../../shared/events';
import { ParticipantManager } from '../../services/ParticipantManager';
import { RoomManager } from '../../services/RoomManager';
import { Role } from '../../../../shared/types';

export const registerParticipantHandlers = (io: Server, socket: Socket) => {
  socket.on(ClientEvents.ASSIGN_ROLE, async (payload: { userId: string; role: Role }) => {
    const { roomCode, userId: hostUserId } = socket.data;
    if (!roomCode || !hostUserId) return;

    const success = await ParticipantManager.assignRole(roomCode, hostUserId, payload.userId, payload.role);
    if (success) {
      const room = RoomManager.getRoom(roomCode);
      io.to(roomCode).emit(ServerEvents.ROOM_STATE, room);
    }
  });

  socket.on(ClientEvents.REMOVE_PARTICIPANT, async (payload: { userId: string }) => {
    const { roomCode, userId: hostUserId } = socket.data;
    if (!roomCode || !hostUserId) return;

    const success = await ParticipantManager.removeParticipant(roomCode, hostUserId, payload.userId);
    if (success) {
      const room = RoomManager.getRoom(roomCode);
      io.to(roomCode).emit(ServerEvents.ROOM_STATE, room);
      io.to(roomCode).emit(ServerEvents.PARTICIPANT_REMOVED, { userId: payload.userId });
    }
  });

  socket.on(ClientEvents.TRANSFER_HOST, async (payload: { newHostId: string }) => {
    const { roomCode, userId: hostUserId } = socket.data;
    if (!roomCode || !hostUserId) return;

    const success = await ParticipantManager.transferHost(roomCode, hostUserId, payload.newHostId);
    if (success) {
      const room = RoomManager.getRoom(roomCode);
      io.to(roomCode).emit(ServerEvents.ROOM_STATE, room);
    }
  });
};
