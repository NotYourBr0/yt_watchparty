export enum Role {
  HOST = 'HOST',
  MODERATOR = 'MODERATOR',
  PARTICIPANT = 'PARTICIPANT',
}

export interface Participant {
  userId: string;
  sessionId: string;
  username: string;
  role: Role;
  connected: boolean;
  joinedAt: string;
  lastSeen: string;
}

export interface PlaybackState {
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  updatedAt: string;
}

export interface RoomState {
  roomCode: string;
  hostUserId: string;
  participants: Participant[];
  playback: PlaybackState;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
}

export type ReactionType = '👍' | '❤️' | '😂' | '👏' | '🔥';

export interface Reaction {
  id: string;
  userId: string;
  username: string;
  type: ReactionType;
  timestamp: string;
}

export enum RequestType {
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  SEEK = 'SEEK',
  VIDEO = 'VIDEO',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface PlaybackRequest {
  id: string;
  userId: string;
  username: string;
  type: RequestType;
  payload?: {
    seekTime?: number;
    videoId?: string;
    videoUrl?: string;
  };
  status: RequestStatus;
  timestamp: string;
}

export interface SessionData {
  sessionId: string;
  roomCode: string;
  userId: string;
  username: string;
}
