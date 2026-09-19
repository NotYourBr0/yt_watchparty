import { RoomManager } from './RoomManager';
import { Role } from '../../../shared/types';

class ParticipantManagerService {
  async assignRole(roomCode: string, hostUserId: string, targetUserId: string, newRole: Role): Promise<boolean> {
    const room = RoomManager.getRoom(roomCode);
    if (!room || room.hostUserId !== hostUserId) return false;
    
    const target = room.participants.find(p => p.userId === targetUserId);
    if (!target || target.userId === hostUserId) return false;

    target.role = newRole;
    await RoomManager.persistRoom(roomCode);
    return true;
  }

  async removeParticipant(roomCode: string, hostUserId: string, targetUserId: string): Promise<boolean> {
    const room = RoomManager.getRoom(roomCode);
    if (!room || room.hostUserId !== hostUserId) return false;
    if (hostUserId === targetUserId) return false;

    room.participants = room.participants.filter(p => p.userId !== targetUserId);
    await RoomManager.persistRoom(roomCode);
    return true;
  }

  async transferHost(roomCode: string, hostUserId: string, targetUserId: string): Promise<boolean> {
    const room = RoomManager.getRoom(roomCode);
    if (!room || room.hostUserId !== hostUserId) return false;
    
    const target = room.participants.find(p => p.userId === targetUserId);
    const host = room.participants.find(p => p.userId === hostUserId);
    if (!target || !host) return false;

    room.hostUserId = targetUserId;
    target.role = Role.HOST;
    host.role = Role.MODERATOR;
    await RoomManager.persistRoom(roomCode);
    return true;
  }
}

export const ParticipantManager = new ParticipantManagerService();
