"use client";
import React from 'react';
import Header from '@/components/Header';
import SideBar from '@/components/room/SideBar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SideBar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-900">
      <Header />
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;