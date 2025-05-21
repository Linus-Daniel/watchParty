"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/socketContext';
import { FiSend } from 'react-icons/fi';
import { User } from '@/types';

interface Message {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: Date;
}


const Chat: React.FC<{ roomId: string; userId: string; className?: string; userData: User }> = ({ 
  roomId, 
  userId, 
  className,
  userData 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (socket && roomId) {
    socket.emit('joinRoom', roomId, userId);

    // Clean previous listeners first
    socket.off('new-message');
    socket.off('userJoined');

    socket.on('new-message', (newMessage: any) => {
      const formattedMessage: Message = {
        id: newMessage._id,
        sender: newMessage.sender._id,
        senderName: newMessage.sender.username,
        text: newMessage.content,
        timestamp: new Date(newMessage.createdAt),
      };
      setMessages(prev => [...prev, formattedMessage]);
    });

    socket.on('userJoined', (userId: string) => {
      console.log(`User ${userId} joined the chat`);
    });
  }

  return () => {
    if (socket) {
      socket.off('new-message');
      socket.off('userJoined');
    }
  };
}, [socket, roomId, userId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit('send-message', {
        roomId,
        senderId: userId,
        content: message
      });
      setMessage('');
    }
  };
  

  return (
    <div className={`flex flex-col h-[50vh] bg-gray-800 hide-scrollbar overflow-y-scroll rounded-lg border border-gray-700 ${className}`}>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`mb-3 ${msg.sender === userId ? 'text-right' : 'text-left'}`}
          >
            {msg.sender !== userId && (
              <p className="text-xs text-gray-400 mb-1">{msg.senderName}</p>
            )}
            <div 
              className={`inline-block p-3 rounded-lg max-w-xs md:max-w-md ${
                msg.sender === userId 
                  ? 'bg-blue-600 rounded-br-none' 
                  : 'bg-gray-700 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs text-gray-300 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className="p-3 border-t border-gray-700">
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 rounded-l-lg bg-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors"
            disabled={!message.trim()}
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;