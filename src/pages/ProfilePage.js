import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiEdit3, FiSave, FiX, FiEye, FiEyeOff, FiCamera, FiSettings, FiShield, FiCalendar, FiVideo, FiPlay, FiTrash2, FiStar, FiMoreVertical, FiAward, FiLock, FiCheck, FiGift } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const baseUrl = process.env.REACT_APP_BASE_URL;

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState(null);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [showPremiumSuccess, setShowPremiumSuccess] = useState(false);
  
  // Video related states
  const [userVideos, setUserVideos] = useState([]);
  const [videoStats, setVideoStats] = useState({
    totalVideos: 0,
    totalViews: 0
  });
  
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
      
      // Fetch user videos
      fetchUserVideos();
    }
  }, [user]);

  const fetchUserVideos = async () => {
    if (!user?.id) return;

    setVideosLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/api/video/getVideoByUserID/${user.id}`, {
        timeout: 10000
      });

      if (response.status === 200 && response.data.videos) {
        setUserVideos(response.data.videos);
        
        // Calculate stats
        const totalVideos = response.data.videos.length;
        const totalViews = response.data.videos.reduce((sum, video) => sum + (video.views || 0), 0);
        
        setVideoStats({
          totalVideos,
          totalViews
        });
      }
    } catch (error) {
      console.error('Error fetching user videos:', error);
      if (error.response?.status !== 404) {
        setError('Failed to load your videos');
      }
    } finally {
      setVideosLoading(false);
    }
  };

  // Handle image load error
  const handleImageError = (videoId) => {
    setImageErrors(prev => ({
      ...prev,
      [videoId]: true
    }));
  };

  // Check if video is restricted
  const isVideoRestricted = (video) => {
    return video.accessLevel === 'private' || video.isRestricted || !video.thumbnailUrl;
  };

  // Get video display title
  const getVideoTitle = (video) => {
    if (isVideoRestricted(video)) {
      return 'This is restricted';
    }
    return video.title || 'Untitled Video';
  };

  // ✅ Delete video functionality
  const handleDeleteVideo = async (videoId) => {
    setDeletingVideoId(videoId);
    
    try {
      const response = await axios.delete(`${baseUrl}/api/user/delete/${videoId}?userId=${user.id}`, {
        timeout: 10000
      });

      if (response.status === 200) {
        setUserVideos(prevVideos => prevVideos.filter(video => video._id !== videoId));
        
        const deletedVideo = userVideos.find(video => video._id === videoId);
        if (deletedVideo) {
          setVideoStats(prevStats => ({
            totalVideos: prevStats.totalVideos - 1,
            totalViews: prevStats.totalViews - (deletedVideo.views || 0)
          }));
        }
        
        setSuccess('Video deleted successfully!');
        setShowDeleteConfirm(false);
        setVideoToDelete(null);

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      if (error.response?.status === 403) {
        setError('You are not authorized to delete this video');
      } else if (error.response?.status === 404) {
        setError('Video not found');
      } else {
        setError('Failed to delete video. Please try again.');
      }
    } finally {
      setDeletingVideoId(null);
    }
  };

  // Confirm delete dialog
  const confirmDelete = (video) => {
    setVideoToDelete(video);
    setShowDeleteConfirm(true);
  };

  // ✅ Handle premium upgrade - Updated to use backend API
  const handlePremiumUpgrade = async () => {
    if (!user?.id) {
      setError('User not found');
      return;
    }

    setPremiumLoading(true);
    setError('');

    try {
      const response = await axios.put(`${baseUrl}/api/user/update-premium/${user.id}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      if (response.status === 200) {
        // Update user data in localStorage and context
        const updatedUser = {
          ...user,
          isPremiumUser: true, // Backend uses isPremiumUser
          isPremium: true      // Frontend uses isPremium
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        const token = localStorage.getItem('token');
        login(token, updatedUser);

        setSuccess('🎉 Congratulations! You are now a Premium user!');
        setShowPremiumSuccess(true);

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
          setShowPremiumSuccess(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Premium upgrade error:', error);
      
      if (error.response) {
        setError(error.response.data.message || 'Premium upgrade failed');
      } else if (error.request) {
        setError('Cannot connect to server. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setPremiumLoading(false);
    }
  };

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
        const updatedUser = {
          ...user,
          username: formData.username.trim(),
          bio: formData.bio.trim()
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        const token = localStorage.getItem('token');
        login(token, updatedUser);
        
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setFormData({ ...formData, password: '' });

        setTimeout(() => setSuccess(''), 3000);
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

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDuration = (createdAt) => {
    const now = new Date();
    const videoDate = new Date(createdAt);
    const diffInMs = now - videoDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  // Check if user is premium (handle both isPremium and isPremiumUser)
  const isUserPremium = user?.isPremium || user?.isPremiumUser;

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

      {/* ✅ Premium Success Animation */}
      <AnimatePresence>
        {showPremiumSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-3xl p-8 max-w-md w-full text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: 2
                }}
              >
                <FiGift size={64} className="text-yellow-400 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">Welcome to Premium!</h2>
              <p className="text-gray-200 mb-4">You now have access to all premium features!</p>
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <FiStar size={16} />
                <span className="font-semibold">Premium Activated</span>
                <FiStar size={16} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-600/40"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <FiTrash2 className="text-red-400" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">Delete Video</h3>
                  <p className="text-sm text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "<span className="font-medium">{getVideoTitle(videoToDelete)}</span>"?
              </p>
              
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDeleteVideo(videoToDelete._id)}
                  disabled={deletingVideoId === videoToDelete?._id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {deletingVideoId === videoToDelete?._id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 size={16} />
                      Delete
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-white bg-clip-text text-transparent mb-2">
              Profile Settings
            </h1>
            <p className="text-gray-400">Manage your account information and videos</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-gray-600/40 overflow-hidden shadow-2xl">
                
                {/* Profile Header */}
                <div className="relative bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 p-8 border-b border-gray-600/40">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg ${
                        isUserPremium 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                          : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                      }`}>
                        <FiUser className="text-3xl text-white" />
                      </div>
                      <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600 hover:bg-gray-600 transition-colors">
                        <FiCamera className="text-gray-300" size={14} />
                      </button>
                    </div>
                    
                    <div className="text-center sm:text-left flex-1">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h2 className="text-2xl font-bold text-gray-100">
                          {user?.username || 'Username'}
                        </h2>
                        {isUserPremium && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg"
                          >
                            <FiStar size={14} className="text-white" />
                            <span className="text-sm font-bold text-white">PREMIUM</span>
                          </motion.div>
                        )}
                      </div>
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
                        {isUserPremium && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <FiStar size={12} />
                            <span>Premium Member</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!isUserPremium && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handlePremiumUpgrade}
                          disabled={premiumLoading}
                          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl text-white font-medium transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {premiumLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span className="hidden sm:inline">Upgrading...</span>
                            </>
                          ) : (
                            <>
                              <FiStar size={16} />
                              <span className="hidden sm:inline">Upgrade to Pro</span>
                              <span className="sm:hidden">Pro</span>
                            </>
                          )}
                        </motion.button>
                      )}

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
                    
                    {success && !showPremiumSuccess && (
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

                    {/* Email Field */}
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
            </div>

            {/* Right Column - Stats and Videos */}
            <div className="space-y-6">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Videos Uploaded', value: videoStats.totalVideos, icon: FiVideo, color: 'text-emerald-400' },
                  { label: 'Total Views', value: formatViews(videoStats.totalViews), icon: FiEye, color: 'text-cyan-400' },
                  { 
                    label: 'Account Status', 
                    value: isUserPremium ? 'Premium' : 'Free', 
                    icon: isUserPremium ? FiStar : FiShield, 
                    color: isUserPremium ? 'text-yellow-400' : 'text-blue-400' 
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className={`p-4 backdrop-blur-sm rounded-2xl border text-center ${
                      isUserPremium && index === 2 
                        ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30' 
                        : 'bg-gray-800/40 border-gray-600/40'
                    }`}
                  >
                    <stat.icon className={`${stat.color} mx-auto mb-2`} size={20} />
                    <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Videos */}
              <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-600/40 overflow-hidden">
                <div className="p-6 border-b border-gray-600/40">
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">Your Videos</h3>
                  <p className="text-sm text-gray-400">Recently uploaded videos</p>
                </div>
                
                <div className="p-6">
                  {videosLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                    </div>
                  ) : userVideos.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {userVideos.slice(0, 5).map((video) => {
                        const isRestricted = isVideoRestricted(video);
                        const hasImageError = imageErrors[video._id];
                        
                        return (
                          <motion.div
                            key={video._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="relative flex-shrink-0">
                              {isRestricted || hasImageError ? (
                                <div className="w-16 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                                  <FiLock className="text-gray-400" size={16} />
                                </div>
                              ) : (
                                <>
                                  <img
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    className="w-16 h-12 object-cover rounded-lg"
                                    onError={() => handleImageError(video._id)}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FiPlay className="text-white" size={16} />
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-medium truncate ${
                                isRestricted ? 'text-gray-400 italic' : 'text-gray-100'
                              }`}>
                                {getVideoTitle(video)}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                {isRestricted ? (
                                  <>
                                    <FiLock size={10} />
                                    <span>Restricted content</span>
                                  </>
                                ) : (
                                  <>
                                    <span>{formatViews(video.views || 0)} views</span>
                                    <span>•</span>
                                    <span>{formatDuration(video.createdAt)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => confirmDelete(video)}
                              disabled={deletingVideoId === video._id}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                            >
                              {deletingVideoId === video._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                              ) : (
                                <FiTrash2 size={16} />
                              )}
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiVideo className="mx-auto mb-3 text-gray-500" size={32} />
                      <p className="text-gray-400 text-sm">No videos uploaded yet</p>
                      <p className="text-gray-500 text-xs mt-1">Start creating content to see your videos here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
