"use client";
import React, { useEffect, useState } from 'react';
import { useSocket } from '@/context/socketContext';
import { User } from '@/types';

interface ParticipantsProps {
  roomId: string;
  currentUser: User;
}

const Participants: React.FC<ParticipantsProps> = ({ roomId, currentUser }) => {
  const [participants, setParticipants] = useState<User[]>([]);
  const {socket} = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Load initial participants
    socket.emit('getParticipants', roomId);

    socket.on('participants', (users: User[]) => {
      setParticipants(users);
    });

    socket.on('userJoined', (user: User) => {
      setParticipants(prev => [...prev, user]);
    });

    socket.on('userLeft', (userId: string) => {
      setParticipants(prev => prev.filter(u => u.id !== userId));
    });

    return () => {
      socket.off('participants');
      socket.off('userJoined');
      socket.off('userLeft');
    };
  }, [socket, roomId]);

  return (
    <div className="bg-gray-800 my-5 h-full rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-white">Participants ({participants.length})</h3>
      <div className="space-y-3">
        {participants.map(user => (
          <div key={user.id} className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-white">
              {user.username} 
              {user.id === currentUser.id && ' (You)'}
              {user.id === currentUser.id && <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded">Host</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Participants;