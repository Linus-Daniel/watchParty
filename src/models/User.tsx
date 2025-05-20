// models/User.ts
import { Schema, model, models } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  joinedRooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export const User = models.User || model('User', userSchema);
