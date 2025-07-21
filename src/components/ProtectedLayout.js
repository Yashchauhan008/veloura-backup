import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import Sidebar from '../pages/FeedPage/Sidebar';

const ProtectedLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  return (
    // Add dark mode background class to the main container
    <div className="relative min-h-screen bg-white dark:bg-[#2D303A]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="w-full transition-all duration-300 lg:pl-64">
        {/* Add dark mode classes to the mobile header */}
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white/80 dark:bg-[#2D303A]/80 backdrop-blur-sm lg:hidden">
          <div className="text-xl font-bold text-red-500">Veloura</div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-800 dark:text-white">
            <FiMenu size={24} />
          </button>
        </header>

        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProtectedLayout;
