"use client";
import React, { useState } from 'react';
import { useSocket } from '@/context/socketContext';

interface ControlsProps {
  roomId: string;
  isHost: boolean;
  currentUrl: string;
}

const Controls: React.FC<ControlsProps> = ({ roomId, isHost, currentUrl }) => {
  const [url, setUrl] = useState(currentUrl);
  const {socket} = useSocket();

  const handleUrlChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (isHost && socket) {
      socket.emit('urlChange', roomId, url);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Room Controls</h3>
      
      {isHost && (
        <form onSubmit={handleUrlChange} className="mb-4">
          <div className="flex">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter video URL (YouTube, Vimeo, etc.)"
              className="flex-1 px-3 py-2 rounded-l bg-gray-700 text-white focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r"
            >
              Change
            </button>
          </div>
        </form>
      )}

      <div className="flex space-x-2">
        <button
          onClick={() => socket?.emit('play', roomId)}
          disabled={!isHost}
          className={`px-4 py-2 rounded ${isHost ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 cursor-not-allowed'} text-white`}
        >
          Play
        </button>
        <button
          onClick={() => socket?.emit('pause', roomId)}
          disabled={!isHost}
          className={`px-4 py-2 rounded ${isHost ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 cursor-not-allowed'} text-white`}
        >
          Pause
        </button>
      </div>
    </div>
  );
};

export default Controls;