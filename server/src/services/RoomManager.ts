import { RoomModel } from '../models/Room';
import { RoomState, Role } from '../../../shared/types';

class RoomManagerService {
  private rooms: Map<string, RoomState> = new Map();

  async loadRoomsFromDB() {
    const dbRooms = await RoomModel.find();
    for (const doc of dbRooms) {
      this.rooms.set(doc.roomCode, {
        roomCode: doc.roomCode,
        hostUserId: doc.hostUserId,
        participants: doc.participants.map(p => ({
          userId: p.userId!,
          sessionId: p.sessionId!,
          username: p.username!,
          role: p.role as Role,
          connected: p.connected!,
          joinedAt: p.joinedAt!,
          lastSeen: p.lastSeen!,
        })),
        playback: doc.playback ? {
          videoId: doc.playback.videoId || null,
          isPlaying: doc.playback.isPlaying || false,
          currentTime: doc.playback.currentTime || 0,
          updatedAt: doc.playback.updatedAt || doc.createdAt,
        } : {
          videoId: null,
          isPlaying: false,
          currentTime: 0,
          updatedAt: doc.createdAt,
        },
        createdAt: doc.createdAt,
      });
    }
  }

  getRoom(roomCode: string): RoomState | undefined {
    return this.rooms.get(roomCode);
  }

  async createRoom(roomCode: string, hostUserId: string, username: string, sessionId: string): Promise<RoomState> {
    const now = new Date().toISOString();
    const roomState: RoomState = {
      roomCode,
      hostUserId,
      participants: [{
        userId: hostUserId,
        sessionId,
        username,
        role: Role.HOST,
        connected: true,
        joinedAt: now,
        lastSeen: now,
      }],
      playback: {
        videoId: null,
        isPlaying: false,
        currentTime: 0,
        updatedAt: now,
      },
      createdAt: now,
    };

    this.rooms.set(roomCode, roomState);
    await this.persistRoom(roomCode);
    return roomState;
  }

  async joinRoom(roomCode: string, userId: string, username: string, sessionId: string): Promise<RoomState | null> {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const existing = room.participants.find(p => p.userId === userId || p.sessionId === sessionId);
    const now = new Date().toISOString();

    if (existing) {
      existing.connected = true;
      existing.sessionId = sessionId;
      existing.lastSeen = now;
      existing.username = username;
    } else {
      room.participants.push({
        userId,
        sessionId,
        username,
        role: Role.PARTICIPANT,
        connected: true,
        joinedAt: now,
        lastSeen: now,
      });
    }

    await this.persistRoom(roomCode);
    return room;
  }

  async leaveRoom(roomCode: string, sessionId: string): Promise<RoomState | null> {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    
    const participant = room.participants.find(p => p.sessionId === sessionId);
    if (participant) {
      participant.connected = false;
      participant.lastSeen = new Date().toISOString();
    }
    
    await this.persistRoom(roomCode);
    return room;
  }

  async reconnectSession(roomCode: string, sessionId: string): Promise<RoomState | null> {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    
    const participant = room.participants.find(p => p.sessionId === sessionId);
    if (participant) {
      participant.connected = true;
      participant.lastSeen = new Date().toISOString();
      await this.persistRoom(roomCode);
      return room;
    }
    return null;
  }

  async persistRoom(roomCode: string) {
    const room = this.rooms.get(roomCode);
    if (!room) return;
    
    await RoomModel.findOneAndUpdate(
      { roomCode },
      room,
      { upsert: true, returnDocument: 'after' }
    ).exec();
  }

  async cleanupStaleRooms() {
    const now = Date.now();
    for (const [roomCode, room] of this.rooms.entries()) {
      const hasConnected = room.participants.some(p => p.connected);
      if (!hasConnected) {
        let allStale = true;
        for (const p of room.participants) {
          const lastSeenTime = new Date(p.lastSeen).getTime();
          if (now - lastSeenTime < 30 * 60 * 1000) {
            allStale = false;
            break;
          }
        }
        if (allStale) {
          this.rooms.delete(roomCode);
          await RoomModel.deleteOne({ roomCode }).exec();
        }
      }
    }
  }
}

export const RoomManager = new RoomManagerService();
