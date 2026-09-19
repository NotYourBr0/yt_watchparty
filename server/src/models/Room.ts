import { Schema, model } from 'mongoose';
import { Role } from '../../../shared/types';

const participantSchema = new Schema({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true },
  username: { type: String, required: true },
  role: { type: String, enum: Object.values(Role), required: true },
  connected: { type: Boolean, required: true },
  joinedAt: { type: String, required: true },
  lastSeen: { type: String, required: true },
}, { _id: false });

const roomSchema = new Schema({
  roomCode: { type: String, required: true, unique: true },
  hostUserId: { type: String, required: true },
  participants: [participantSchema],
  playback: {
    videoId: { type: String, default: null },
    isPlaying: { type: Boolean, default: false },
    currentTime: { type: Number, default: 0 },
    updatedAt: { type: String, required: true },
  },
  createdAt: { type: String, required: true },
}, { timestamps: true });

export const RoomModel = model('Room', roomSchema);
