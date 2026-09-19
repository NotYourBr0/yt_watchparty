import { RoomManager } from './RoomManager';
import { PlaybackRequest, RequestType, RequestStatus } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';
import { PlaybackManager } from './PlaybackManager';

class RequestManagerService {
  private requests: Map<string, PlaybackRequest[]> = new Map();

  createRequest(roomCode: string, userId: string, username: string, type: RequestType, payload?: any): PlaybackRequest {
    if (!this.requests.has(roomCode)) {
      this.requests.set(roomCode, []);
    }
    const req: PlaybackRequest = {
      id: uuidv4(),
      userId,
      username,
      type,
      payload,
      status: RequestStatus.PENDING,
      timestamp: new Date().toISOString(),
    };
    this.requests.get(roomCode)!.push(req);
    return req;
  }

  async approveRequest(roomCode: string, hostUserId: string, requestId: string): Promise<PlaybackRequest | null> {
    const room = RoomManager.getRoom(roomCode);
    if (!room) return null;
    const host = room.participants.find(p => p.userId === hostUserId);
    if (!host || host.role === 'PARTICIPANT') return null;

    const reqs = this.requests.get(roomCode) || [];
    const req = reqs.find(r => r.id === requestId);
    if (!req || req.status !== RequestStatus.PENDING) return null;

    req.status = RequestStatus.APPROVED;
    
    if (req.type === RequestType.PLAY) {
      await PlaybackManager.play(roomCode, hostUserId, req.payload?.seekTime || room.playback.currentTime);
    } else if (req.type === RequestType.PAUSE) {
      await PlaybackManager.pause(roomCode, hostUserId, req.payload?.seekTime || room.playback.currentTime);
    } else if (req.type === RequestType.SEEK) {
      await PlaybackManager.seek(roomCode, hostUserId, req.payload?.seekTime || 0);
    } else if (req.type === RequestType.VIDEO && req.payload?.videoUrl) {
      await PlaybackManager.changeVideo(roomCode, hostUserId, req.payload.videoUrl);
    }

    return req;
  }

  rejectRequest(roomCode: string, hostUserId: string, requestId: string): PlaybackRequest | null {
    const room = RoomManager.getRoom(roomCode);
    if (!room) return null;
    const host = room.participants.find(p => p.userId === hostUserId);
    if (!host || host.role === 'PARTICIPANT') return null;

    const reqs = this.requests.get(roomCode) || [];
    const req = reqs.find(r => r.id === requestId);
    if (!req || req.status !== RequestStatus.PENDING) return null;

    req.status = RequestStatus.REJECTED;
    return req;
  }

  getRequests(roomCode: string): PlaybackRequest[] {
    return this.requests.get(roomCode) || [];
  }
}

export const RequestManager = new RequestManagerService();
