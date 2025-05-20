// models/Room.ts
import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const participantSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  joinedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const roomSchema = new Schema({
  name: { type: String, required: true },
  host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  currentVideo: { type: String, default: "" },
  isPlaying: { type: Boolean, default: false },
  currentTime: { type: Number, default: 0 },
  participants: [participantSchema],
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) } // 24h expiry
});

roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired rooms

export const Room = model('Room', roomSchema);