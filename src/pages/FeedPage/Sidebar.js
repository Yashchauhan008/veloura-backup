import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// 1. Import the new FiUploadCloud and FiUser icons
import { FiHome, FiCompass, FiYoutube, FiSettings, FiLogOut, FiX, FiUploadCloud, FiUser } from 'react-icons/fi';

// NavItem with smaller colored icons
const NavItem = ({ to, icon, text, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-3 mx-2 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-gray-700 text-white' 
        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
    }`}
  >
    <div className={`w-6 h-6 rounded flex items-center justify-center ${
      active ? 'bg-blue-500' : 'bg-gray-600'
    }`}>
      {React.cloneElement(icon, { 
        size: 12, 
        className: active ? 'text-white' : 'text-gray-200' 
      })}
    </div>
    <span className="text-xs font-medium">{text}</span>
  </Link>
);

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 },
  };

  // 2. Add the "Upload" link to this array
  const navLinks = [
    { to: '/dashboard', icon: <FiHome />, text: 'Home' },
    { to: '/explore', icon: <FiCompass />, text: 'Explore' },
    { to: '/subscriptions', icon: <FiYoutube />, text: 'Subscriptions' },
    { to: '/upload', icon: <FiUploadCloud />, text: 'Upload' }, // <-- NEW LINK ADDED HERE
    { to: '/settings', icon: <FiSettings />, text: 'Settings' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-30 lg:hidden"
          />

          {/* Sidebar with margin, rounded corners, and blur effect */}
          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-4 left-4 z-40 w-64 h-[calc(100vh-2rem)] bg-[#2A2D36]/95 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl text-white flex flex-col overflow-hidden"
          >
            {/* Header Section with smaller colored icon */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-700/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                  <FiYoutube size={12} className="text-white" />
                </div>
                <h1 className="text-sm font-semibold text-white">Veloura</h1>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="lg:hidden p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-700/50 transition-all duration-200"
              >
                <FiX size={14} />
              </button>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 px-3 py-3">
              {/* All Types Header with smaller colored icon */}
              <div className="flex items-center gap-3 px-3 py-3 mx-2 mb-2">
                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                  <FiHome size={12} className="text-white" />
                </div>
                <span className="text-xs font-medium text-gray-300">All Types</span>
              </div>

              {/* Dotted separator line */}
              <div className="mx-3 mb-3 border-t border-dotted border-gray-600/50"></div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <NavItem
                    key={link.to}
                    to={link.to}
                    icon={link.icon}
                    text={link.text}
                    active={location.pathname === link.to}
                  />
                ))}
              </nav>
            </div>

            {/* Footer Section with Profile and Logout */}
            <div className="px-3 py-3 border-t border-gray-700/30 mt-auto">
              {/* Profile Navigation */}
              <NavItem
                to="/profile"
                icon={<FiUser />}
                text="Profile"
                active={location.pathname === '/profile'}
              />
              
              {/* Logout Button */}
              <div
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 mx-2 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-white cursor-pointer transition-all duration-200 mt-1"
              >
                <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                  <FiLogOut size={12} className="text-white" />
                </div>
                <span className="text-xs font-medium">Logout</span>
              </div>
              
              <div className="mt-3 px-3">
                <p className="text-[10px] text-gray-500 text-center">© 2025 Veloura</p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
