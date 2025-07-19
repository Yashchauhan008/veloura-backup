import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Toggle theme"
    >
      <motion.div
        className="w-6 h-6 bg-white rounded-full shadow-md"
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        style={{
          position: 'absolute',
          left: theme.label === 'light' ? '0.25rem' : 'auto',
          right: theme.label === 'dark' ? '0.25rem' : 'auto',
        }}
      />
      <div className="relative w-full flex justify-between items-center px-1">
        <FiSun className="text-yellow-500" />
        <FiMoon className="text-blue-300" />
      </div>
    </button>
  );
};

export default ThemeToggle;
