import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiYoutube, 
  FiSettings, 
  FiLogOut, 
  FiUser,
  FiBarChart2,
  FiUsers,
  FiDollarSign,
  FiMessageSquare,
  FiVideo,
  FiBell,
  FiSearch,
  FiMenu,
  FiChevronDown,
  FiUploadCloud,
  FiFlag,
  FiHelpCircle
} from 'react-icons/fi';

const AdminNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isContentMenuOpen, setIsContentMenuOpen] = useState(false);
  const [isUsersMenuOpen, setIsUsersMenuOpen] = useState(false);
  const [isMonetizationMenuOpen, setIsMonetizationMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items with dropdowns
  const navItems = [
    {
      title: 'Dashboard',
      icon: <FiHome size={18} />,
      path: '/admin/dashboard',
      color: 'text-gray-300 hover:text-white'
    },
  
    {
      title: 'Users',
      icon: <FiUsers size={18} />,
      color: 'text-gray-300 hover:text-white',
      path: '/admin/users',
    
    },
    {
      title: 'videos',
      icon: <FiBarChart2 size={18} />,
      path: '/admin/videos',
      color: 'text-gray-300 hover:text-white'
    },

  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <nav className="bg-gray-800/95 backdrop-blur-xl border border-gray-600/30 shadow-2xl rounded-2xl">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                  <FiYoutube size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Veloura</h1>
                 
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div key={item.title} className="relative">
                  {item.hasDropdown ? (
                    <div className="relative">
                      <button
                        onClick={() => item.setIsOpen(!item.isOpen)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${item.color} hover:bg-gray-700/50`}
                      >
                        {item.icon}
                        <span className="text-sm font-medium">{item.title}</span>
                        <FiChevronDown size={14} className={`transition-transform duration-200 ${item.isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {item.isOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full mt-2 w-56 bg-gray-800/95 backdrop-blur-xl border border-gray-600/30 rounded-xl shadow-2xl overflow-hidden"
                          >
                            {item.dropdownItems.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.path}
                                to={dropdownItem.path}
                                onClick={() => item.setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 ${
                                  location.pathname === dropdownItem.path ? 'bg-gray-600/50 text-white border-r-2 border-gray-400' : ''
                                }`}
                              >
                                {dropdownItem.icon}
                                <span className="text-sm">{dropdownItem.title}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${item.color} hover:bg-gray-700/50 ${
                        location.pathname === item.path ? 'bg-gray-600/50 border border-gray-500/50' : ''
                      }`}
                    >
                      {item.icon}
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
             

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-all duration-200">
                <FiBell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-gray-500 rounded-full"></span>
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                    <FiUser size={16} className="text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-white">Admin User</p>
                    <p className="text-xs text-gray-400">Super Administrator</p>
                  </div>
                  <FiChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-xl border border-gray-600/30 rounded-xl shadow-2xl overflow-hidden"
                    >
                      <Link
                        to="/admin/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200"
                      >
                        <FiUser size={16} />
                        <span className="text-sm">Admin Profile</span>
                      </Link>
                   
                      <hr className="border-gray-600/50" />
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 hover:bg-gray-600/50 hover:text-white transition-all duration-200"
                      >
                        <FiLogOut size={16} />
                        <span className="text-sm">Admin Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-all duration-200">
                <FiMenu size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AdminNavbar;
