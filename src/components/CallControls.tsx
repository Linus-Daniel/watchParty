// components/CallControls.tsx
import { useState, useEffect } from 'react';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhone } from 'react-icons/fi';

type CallControlsProps = {
  onEndCall: () => void;
  onToggleMic: (isMuted: boolean) => void;
  onToggleVideo: (isVideoOff: boolean) => void;
};

export const CallControls = ({ onEndCall, onToggleMic, onToggleVideo }:CallControlsProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <div className="flex justify-center space-x-4">
      <button
        onClick={() => { onToggleMic(!isMuted); setIsMuted(!isMuted); }}
        className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'}`}
      >
        {isMuted ? <FiMicOff /> : <FiMic />}
      </button>
      <button
        onClick={() => { onToggleVideo(!isVideoOff); setIsVideoOff(!isVideoOff); }}
        className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'}`}
      >
        {isVideoOff ? <FiVideoOff /> : <FiVideo />}
      </button>
      <button
        onClick={onEndCall}
        className="p-3 rounded-full bg-red-500"
      >
        <FiPhone />
      </button>
    </div>
  );
};