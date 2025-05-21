export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedRooms?: string[];
  lastActive?: Date;
  createdAt?: Date;
  isHost?: boolean;
  socketId?: string;
  isOnline?: boolean;
  isAdmin?: boolean; }


  export interface Room {
    _id: string;
    roomId: string;
    roomName: string;
    creator: {
      _id: string;
      avatar?: string;
    };
    participants: string[];
    videoUrl: string;
    isPlaying: boolean;
    currentTime: number;
    createdAt: string;     // ISO date string, can be converted to Date
    updatedAt: string;     // same here
    lastUpdated: string;
    __v: number;
  }
  