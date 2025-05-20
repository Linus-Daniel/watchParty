import { Server, Socket } from 'socket.io';
import { Room } from '@/models/Room';

const configureSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);

    // Join room
    socket.on('joinRoom', async (roomId: string, userId: string) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);

      // Notify others in the room
      socket.to(roomId).emit('userJoined', userId);

      // Load room state
      const room = await Room.findById(roomId);
      if (room) {
        socket.emit('roomState', {
          url: room.currentVideo,
          playing: room.isPlaying,
          time: room.currentTime,
        });
      }
    });

    // Video control events
    socket.on('play', (roomId: string) => {
      socket.to(roomId).emit('play');
      Room.findByIdAndUpdate(roomId, { isPlaying: true }).exec();
    });

    socket.on('pause', (roomId: string) => {
      socket.to(roomId).emit('pause');
      Room.findByIdAndUpdate(roomId, { isPlaying: false }).exec();
    });

    socket.on('seek', (roomId: string, time: number) => {
      socket.to(roomId).emit('seek', time);
      Room.findByIdAndUpdate(roomId, { currentTime: time }).exec();
    });

    socket.on('urlChange', (roomId: string, newUrl: string) => {
      socket.to(roomId).emit('urlChange', newUrl);
      Room.findByIdAndUpdate(roomId, { 
        currentVideo: newUrl,
        isPlaying: false,
        currentTime: 0
      }).exec();
    });

    // Chat events
    socket.on('sendMessage', async ({ roomId, sender, text }) => {
      const message = {
        sender,
        text,
        timestamp: new Date(),
      };

      // Save to DB
      await Room.findByIdAndUpdate(roomId, {
        $push: { messages: message }
      }).exec();

      // Broadcast to room
      io.to(roomId).emit('newMessage', {
        ...message,
        id: Date.now().toString(),
      });
    });

    socket.on('getMessages', async (roomId: string) => {
      const room = await Room.findById(roomId);
      if (room) {
        socket.emit('messages', room.messages);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

export default configureSocket;