import { RoomManager } from './RoomManager';
import { Role } from '../../../shared/types';
import { parseYouTubeUrl } from '../utils/helpers';

class PlaybackManagerService {
  canControlPlayback(role: Role): boolean {
    return role === Role.HOST || role === Role.MODERATOR;
  }

  async play(roomCode: string, userId: string, currentTime: number): Promise<boolean> {
    const room = RoomManager.getRoom(roomCode);
    if (!room) return false;
    const p = room.participants.find(p => p.userId === userId);
    if (!p || !this.canControlPlayback(p.role)) return false;

    room.playback.isPlaying = true;
    room.playback.currentTime = currentTime;
    room.playback.updatedAt = new Date().toISOString();
    return true;
  }

  async pause(roomCode: string, userId: string, currentTime: number): Promise<boolean> {
    const room = RoomManager.getRoom(roomCode);
    if (!room) return false;
    const p = room.participants.find(p => p.userId === userId);
    if (!p || !this.canControlPlayback(p.role)) return false;

    room.playback.isPlaying = false;
    room.playback.currentTime = currentTime;
    room.playback.updatedAt = new Date().toISOString();
    return true;
  }

  async seek(roomCode: string, userId: string, currentTime: number): Promise<boolean> {
    const room = RoomManager.getRoom(roomCode);
    if (!room) return false;
    const p = room.participants.find(p => p.userId === userId);
    if (!p || !this.canControlPlayback(p.role)) return false;

    room.playback.currentTime = currentTime;
    room.playback.updatedAt = new Date().toISOString();
    return true;
  }

  async changeVideo(roomCode: string, userId: string, videoStr: string): Promise<string | null> {
    const room = RoomManager.getRoom(roomCode);
    if (!room) return null;
    const p = room.participants.find(p => p.userId === userId);
    if (!p || !this.canControlPlayback(p.role)) return null;

    const videoId = parseYouTubeUrl(videoStr) || videoStr;
    room.playback.videoId = videoId;
    room.playback.isPlaying = false;
    room.playback.currentTime = 0;
    room.playback.updatedAt = new Date().toISOString();
    
    await RoomManager.persistRoom(roomCode);
    return videoId;
  }
}

export const PlaybackManager = new PlaybackManagerService();
