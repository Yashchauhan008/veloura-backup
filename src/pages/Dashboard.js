import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
      <div className="text-center p-10 bg-gray-900/50 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Dashboard!</h1>
        <p className="text-lg text-white/80 mb-6">This is a protected area.</p>
        <div className="mb-8">
          <p className="text-sm text-white/60">Your Auth Token:</p>
          <p className="font-mono bg-gray-700 p-2 rounded text-green-400 break-all">{user}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-300 font-semibold"
        >
          <FiLogOut />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
