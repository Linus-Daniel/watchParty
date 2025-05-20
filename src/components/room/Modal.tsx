// components/CreateRoomModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiVideo, FiLock, FiUsers } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/socketContext';
import axios from 'axios';
import api from '@/lib/api';
import { User } from '@/models/User';
import { useAuth } from '@/context/AuthContext';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function CreateRoomModal({ isOpen, onClose, userId }: CreateRoomModalProps) {
    const {user} = useAuth()
  const router = useRouter();
  const { socket } = useSocket();
  const [formData, setFormData] = useState({
    name: '',
    isPrivate: false,
    maxParticipants: 10,
    videoUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Room name is required');
      }

      if (formData.videoUrl && !isValidUrl(formData.videoUrl)) {
        throw new Error('Please enter a valid video URL');
      }

    // Create room via API using Axios
    const userId = user?.id
    const roomName = formData.name;
    const response = await api.post('/rooms/', {
      userId,
        roomName
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(response.data);

        const newRoom = response.data;

      // Join room via socket
      socket?.emit('createRoom', newRoom._id);

      // Redirect to new room
      router.push(`/room/${newRoom._id}`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
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
                Create New Room
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-sm">
                  {error}
                </div>
              )}

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

              {/* <div className="space-y-2">
                <label htmlFor="videoUrl" className="block text-sm font-medium">
                  Video URL (Optional)
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
              </div> */}

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
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiVideo />
                      Create Room
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