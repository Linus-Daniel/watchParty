// lib/socketServer.ts
import { Server } from 'socket.io';
import { Room } from '@/models/Room';

export const configureSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Join Room
    socket.on('joinRoom', async (roomId: string, userId: string) => {
      socket.join(roomId);
      const room = await Room.findById(roomId);
      if (!room) return;

      // Add participant if not already in room
      if (!room.participants.some(p => p.user?.toString() === userId)) {
        room.participants.push({ user: userId });
        await room.save();
      }

      // Broadcast to room
      io.to(roomId).emit('userJoined', userId);
    });

    // Video Control Events
    socket.on('play', (roomId: string) => {
      io.to(roomId).emit('play');
      Room.findByIdAndUpdate(roomId, { isPlaying: true }).exec();
    });

    socket.on('pause', (roomId: string) => {
      io.to(roomId).emit('pause');
      Room.findByIdAndUpdate(roomId, { isPlaying: false }).exec();
    });

    socket.on('seek', (roomId: string, time: number) => {
      io.to(roomId).emit('seek', time);
      Room.findByIdAndUpdate(roomId, { currentTime: time }).exec();
    });

    // Chat Events
    socket.on('sendMessage', async ({ roomId, senderId, text }) => {
      const room = await Room.findById(roomId);
      if (!room) return;

      const message = { sender: senderId, text };
      room.messages.push(message);
      await room.save();

      io.to(roomId).emit('newMessage', message);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};