"use client";
import React from 'react';
import Link from 'next/link';
import Button from './Buttton';
import { useAuth } from '@/context/AuthContext';

const Header: React.FC = () => {
  const {user,logout} = useAuth();

  return (
    <header className="bg-gray-900 sticky top-0 z-10 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <p className="text-xl font-bold">WatchParty</p>
        </Link>

        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/room/create">
                <p className="hover:text-blue-300">Create Room</p>
              </Link>
              <span className="text-gray-300">Hello, {user.name}</span>
              <Button 
                onClick={() => logout()}
                className="bg-red-500 hover:bg-red-600"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <p className="hover:text-blue-300">Login</p>
              </Link>
              <Link href="/auth/signup">
                <p className="hover:text-blue-300">Sign Up</p>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;