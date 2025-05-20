import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">WatchParty</h3>
            <p className="text-gray-400">Watch videos together in real-time</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-blue-300">Terms</a>
            <a href="#" className="hover:text-blue-300">Privacy</a>
            <a href="#" className="hover:text-blue-300">Contact</a>
          </div>
        </div>
        <div className="mt-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} WatchParty. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;