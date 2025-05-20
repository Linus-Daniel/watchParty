// models/CallSession.ts
import { Schema, model } from 'mongoose';

const callSessionSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  callType: { type: String, enum: ['voice', 'video'], default: 'video' }
});

export const CallSession = model('CallSession', callSessionSchema);