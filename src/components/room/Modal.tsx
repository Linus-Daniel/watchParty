'use client';

import { FormEvent, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiVideo, FiLock, FiUsers, FiLink } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/socketContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import CopyText from './CopyId';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'join';
  initialRoomId?: string;
}

export default function CreateRoomModal({ 
  isOpen, 
  onClose, 
  mode = 'create', 
  initialRoomId = '' 
}: CreateRoomModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { socket } = useSocket();
  
  const [formData, setFormData] = useState({
    name: '',
    isPrivate: false,
    maxParticipants: 10,
    roomId: initialRoomId,
    videoUrl: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };



  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.name.trim()) {
        throw new Error('Room name is required');
      }

      if (!user?._id) {
        throw new Error('User not authenticated');
      }

      const response = await api.post('/rooms/', {
        userId: user._id,
        roomName: formData.name,
        videoUrl: formData.videoUrl
      });

      const newRoom = response.data;

      // Connect to room via socket
      socket?.emit('joinRoom', { 
        roomId: newRoom._id, 
        userId: user._id,
        username: user.name 
      });

      setSuccess('Room created successfully!');
      toast.success('Room created');
      
      // Redirect to new room after a brief delay
      setTimeout(() => {
        router.push(`/room/${newRoom._id}`);
        onClose();
      }, 1000);

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create room';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');
    try {
      if (!formData.roomId.trim()) {
        throw new Error('Room ID is required');
      }

      if (!user?._id) {
        throw new Error('User not authenticated');
      }

      // Verify room exists and get room details
      const response = await api.post(`/rooms/${formData.roomId}/join`,{
        
          headers: {
            Authorization: `Bearer ${token}`,
          },
        
      });
      const room = response.data;

      if (room.isPrivate) {
        // In a real app, you'd handle private room authentication here
        throw new Error('This room is private');
      }

      // Connect to room via socket
      socket?.emit('joinRoom', { 
        roomId: formData.roomId, 
        userId: user._id,
        username: user.name 
      });

      setSuccess('Joining room...');
      toast.success('Joining room');

      // Redirect to room after a brief delay
      setTimeout(() => {
        router.push(`/room/${formData.roomId}`);
        onClose();
      }, 1000);

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to join room';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-md bg-gray-800 rounded-xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiVideo className="text-blue-400" />
                {mode === 'create' ? 'Create New Room' : 'Join Existing Room'}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>
            </div>

            <form 
              onSubmit={mode === 'create' ? handleCreateRoom : handleJoinRoom} 
              className="p-6 space-y-4"
            >
              {error && (
                <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-900/50 border border-green-500 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {mode === 'create' ? (
                <>
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">
                      Room Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Friday Movie Night"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="videoUrl" className="block text-sm font-medium">
                      Starting Video URL (Optional)
                    </label>
                    <input
                      type="url"
                      id="videoUrl"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        name="isPrivate"
                        checked={formData.isPrivate}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                      <label htmlFor="isPrivate" className="ml-2 flex items-center gap-1 text-sm">
                        <FiLock size={14} />
                        Private Room
                      </label>
                    </div>

                    <div className="flex-1">
                      <label htmlFor="maxParticipants" className="block text-sm font-medium mb-1">
                        <FiUsers className="inline mr-1" />
                        Max Participants
                      </label>
                      <select
                        id="maxParticipants"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                        className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-sm"
                      >
                        {[2, 5, 10, 20, 50].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'person' : 'people'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label htmlFor="roomId" className="block text-sm font-medium">
                      Room ID *
                    </label>
                    <input
                      type="text"
                      id="roomId"
                      name="roomId"
                      value={formData.roomId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter room ID"
                      required
                    />
                  </div>

                  {formData.roomId && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <FiLink className="flex-shrink-0" />
                      <CopyText text={`${window.location.origin}/room/${formData.roomId}`} />
                    </div>
                  )}
                </>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      {mode === 'create' ? 'Creating...' : 'Joining...'}
                    </>
                  ) : (
                    <>
                      <FiVideo />
                      {mode === 'create' ? 'Create Room' : 'Join Room'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}