import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiEdit3, FiSave, FiX, FiEye, FiEyeOff, FiCamera, FiSettings, FiShield, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const baseUrl = process.env.REACT_APP_BASE_URL;

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    password: ''
  });

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        password: ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        userId: user.id,
        username: formData.username.trim(),
        bio: formData.bio.trim()
      };

      // Only include password if it's provided
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const response = await axios.put(`${baseUrl}/api/user/update`, updateData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      if (response.status === 200) {
        // Update user data in context
        const updatedUser = {
          ...user,
          username: formData.username.trim(),
          bio: formData.bio.trim()
        };
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update auth context
        const token = localStorage.getItem('token');
        login(token, updatedUser);
        
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setFormData({ ...formData, password: '' }); // Clear password field
      }
    } catch (error) {
      console.error('Update error:', error);
      
      if (error.response) {
        setError(error.response.data.message || 'Update failed');
      } else if (error.request) {
        setError('Cannot connect to server. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
      password: ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-[#2D303A] text-gray-100 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-gray-800/10 to-gray-700/10 backdrop-blur-sm border border-slate-600/20"
            style={{
              width: Math.random() * 100 + 60,
              height: Math.random() * 100 + 60,
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Profile Settings
            </h1>
            <p className="text-gray-400">Manage your account information</p>
          </div>

          {/* Profile Card */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-gray-600/40 overflow-hidden shadow-2xl">
            
            {/* Profile Header */}
            <div className="relative bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 p-8 border-b border-gray-600/40">
              {/* Profile Avatar */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                    <FiUser className="text-3xl text-white" />
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600 hover:bg-gray-600 transition-colors">
                    <FiCamera className="text-gray-300" size={14} />
                  </button>
                </div>
                
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl font-bold text-gray-100">
                    {user?.username || 'Username'}
                  </h2>
                  <p className="text-emerald-400 text-sm">{user?.email || 'email@example.com'}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 justify-center sm:justify-start">
                    <div className="flex items-center gap-1">
                      <FiShield size={12} />
                      <span className="capitalize">{user?.role || 'user'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiCalendar size={12} />
                      <span>Joined 2025</span>
                    </div>
                  </div>
                </div>

                {/* Edit Toggle Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-medium transition-colors flex items-center gap-2"
                >
                  {isEditing ? <FiX size={16} /> : <FiEdit3 size={16} />}
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </motion.button>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-8">
              
              {/* Status Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-xl text-red-300"
                  >
                    {error}
                  </motion.div>
                )}
                
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-6 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl text-emerald-300"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Fields */}
              <div className="space-y-6">
                
                {/* Username Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <FiUser className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={!isEditing || loading}
                      className={`w-full py-4 pl-12 pr-4 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                        isEditing 
                          ? 'bg-gray-700/50 border border-gray-600/50 focus:ring-emerald-400/50 focus:border-emerald-400/50' 
                          : 'bg-gray-700/30 border border-gray-600/30 cursor-not-allowed'
                      } ${loading ? 'opacity-50' : ''}`}
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                {/* Email Field (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full py-4 pl-12 pr-4 bg-gray-700/30 border border-gray-600/30 rounded-xl text-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Bio Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    rows={3}
                    className={`w-full py-4 px-4 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
                      isEditing 
                        ? 'bg-gray-700/50 border border-gray-600/50 focus:ring-emerald-400/50 focus:border-emerald-400/50' 
                        : 'bg-gray-700/30 border border-gray-600/30 cursor-not-allowed'
                    } ${loading ? 'opacity-50' : ''}`}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Password Field (Only visible when editing) */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password (Optional)
                      </label>
                      <div className="relative">
                        <FiShield className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          disabled={loading}
                          className={`w-full py-4 pl-12 pr-12 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300 ${loading ? 'opacity-50' : ''}`}
                          placeholder="Enter new password (min 6 characters)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                          className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex gap-4 mt-8"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold rounded-xl shadow-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave size={18} />
                          Save Changes
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancel}
                      disabled={loading}
                      className="px-6 py-4 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
                    >
                      Cancel
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Additional Stats/Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { label: 'Videos Uploaded', value: '0', icon: FiSettings, color: 'text-emerald-400' },
              { label: 'Total Views', value: '0', icon: FiEye, color: 'text-cyan-400' },
              { label: 'Account Status', value: 'Active', icon: FiShield, color: 'text-blue-400' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="p-4 bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-600/40 text-center"
              >
                <stat.icon className={`${stat.color} mx-auto mb-2`} size={20} />
                <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
