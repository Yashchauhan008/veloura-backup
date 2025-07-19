import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize state by parsing the stored JSON string
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      // If a user is stored, parse it. Otherwise, return null.
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      // If parsing fails, clear the invalid item and return null
      localStorage.removeItem('user');
      return null;
    }
  });

  // The login function now correctly stringifies the user object
  const login = (token, userData) => { // Assuming login in LoginPage provides token and user
    // Store the user object as a JSON string
    localStorage.setItem('user', JSON.stringify(userData));
    // Also store the token, which is good practice
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    // Remove both user and token on logout
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  // The value provided to consuming components
  const value = {
    user,
    isAuthenticated: !!user, // This check is now reliable
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
