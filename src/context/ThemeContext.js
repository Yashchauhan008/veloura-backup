import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Create the context with a default value
const ThemeContext = createContext();

// 2. Create the provider component
export const ThemeProvider = ({ children }) => {
  // We check localStorage for a saved theme, otherwise default to 'dark'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // This effect runs when the `theme` state changes
  useEffect(() => {
    const root = window.document.documentElement; // This is the <html> element

    const oldTheme = theme === 'dark' ? 'light' : 'dark';
    root.classList.remove(oldTheme);
    root.classList.add(theme);

    // Save the current theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // The function to toggle the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // The value that will be available to all consuming components
  const value = {
    theme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// 3. Create a custom hook for easy access to the context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
