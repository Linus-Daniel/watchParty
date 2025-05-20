"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/socketContext';
import { FiSend } from 'react-icons/fi';

interface Message {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

const Chat: React.FC<{ roomId: string; userId: string }> = ({ roomId, userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample user data for dummy messages
  const dummyUsers = [
    { id: 'user1', name: 'Alex Johnson' },
    { id: 'user2', name: 'Sam Wilson' },
    { id: 'user3', name: 'Taylor Swift' },
    { id: 'user4', name: 'Jordan Lee' },
  ];

  // Sample chat messages
  const sampleMessages = [
    "Hey everyone! 👋",
    "What are we watching next?",
    "This scene is amazing!",
    "Can someone explain what just happened?",
    "I'll bring snacks for the next session!",
    "The cinematography in this movie is stunning",
    "Anyone else confused about the plot?",
    "Let's take a 5 min break?",
    "The soundtrack is 🔥",
    "I think we should watch the sequel next week"
  ];

  // Initialize with some dummy messages
  useEffect(() => {
    const initialMessages: Message[] = Array.from({ length: 5 }, (_, i) => {
      const randomUser = dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
      return {
        id: `init-${i}`,
        sender: randomUser.id,
        senderName: randomUser.name,
        text: sampleMessages[i % sampleMessages.length],
        timestamp: new Date(Date.now() - (1000 * 60 * (5 - i))),
      };
    });
    setMessages(initialMessages);
  }, []);

  // Simulate receiving messages in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of a new message
        const randomUser = dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
        const newMessage: Message = {
          id: Math.random().toString(36).substring(2, 9),
          sender: randomUser.id,
          senderName: randomUser.name,
          text: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMessage]);
      }
    }, 3000 + Math.random() * 7000); // Random interval between 3-10 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage: Message = {
        id: Math.random().toString(36).substring(2, 9),
        sender: userId,
        senderName: 'You', // This would normally come from user data
        text: message,
        timestamp: new Date(),
      };
      
      // In a real app, this would go to the socket
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Simulate other users occasionally responding
      if (Math.random() > 0.6) {
        setTimeout(() => {
          const randomUser = dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
          const responseMessage: Message = {
            id: Math.random().toString(36).substring(2, 9),
            sender: randomUser.id,
            senderName: randomUser.name,
            text: getResponseToMessage(message),
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, responseMessage]);
        }, 1000 + Math.random() * 4000); // Reply after 1-5 seconds
      }
    }
  };

  // Helper function to generate responses
  const getResponseToMessage = (msg: string): string => {
    if (msg.includes('?')) {
      const answers = [
        "I'm not sure about that",
        "Good question!",
        "Let me check...",
        "I think so!",
        "Definitely!",
        "Maybe someone else knows?"
      ];
      return answers[Math.floor(Math.random() * answers.length)];
    }
    
    const responses = [
      "Interesting point!",
      "I agree!",
      "Tell me more about that",
      "That's what I was thinking too",
      "👍",
      "😂",
      "Wow, really?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="flex flex-col h-[50vh] bg-gray-800 overflow-y-scroll rounded-lg border border-gray-700">
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