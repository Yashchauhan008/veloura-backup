import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  FiUser,
  FiMail,
  FiLock,
  FiEdit3,
  FiSave,
  FiX,
  FiEye,
  FiEyeOff,
  FiUsers,
  FiVideo,
  FiBarChart,
  FiClock,
  FiSettings,
  FiShield,
  FiRefreshCw,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';

const baseUrl = process.env.REACT_APP_BASE_URL;

const AdminProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile data
  const [profileData, setProfileData] = useState({
    admin: null,
    stats: { totalUsers: 0, totalVideos: 0, totalViews: 0 },
    recentUsers: [],
    recentVideos: []
  });

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchAdminProfile();
    }
  }, [user]);

  const fetchAdminProfile = async () => {
    if (!user?.id) {
      setError('Admin ID not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Fix 1: Use correct endpoint and pass actual admin ID
      const response = await fetch(`${baseUrl}/api/admin/admin-profile?adminId=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setProfileData(data);
        setFormData({
          username: data.admin?.username || '',
          bio: data.admin?.bio || '',
          currentPassword: '',
          newPassword: ''
        });
      } else {
        setError(data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Fetch admin profile error:', err);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError('Admin ID not found');
      return;
    }

    // Validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      setError('Current password is required to change password');
      return;
    }

    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      // Fix 2: Use actual admin ID from user context
      const updateData = {
        adminId: user.id,
        username: formData.username.trim(),
        bio: formData.bio.trim()
      };

      // Only include password fields if they're filled
      if (formData.newPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Fix 3: Use correct endpoint
      const response = await fetch(`${baseUrl}/api/admin/admin-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setShowPasswordFields(false);
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: ''
        });
        
        // Update local profile data
        setProfileData(prev => ({
          ...prev,
          admin: data.admin || prev.admin
        }));

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowPasswordFields(false);
    setFormData({
      username: profileData.admin?.username || '',
      bio: profileData.admin?.bio || '',
      currentPassword: '',
      newPassword: ''
    });
    setError('');
    setSuccess('');
  };

  // Fix 4: StatCard component with proper React element cloning
  const StatCard = ({ icon, title, value, color }) => {
    const IconComponent = icon;
    return (
      <div className={`bg-gray-800/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6 ${color}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            color.includes('blue') ? 'bg-blue-500/20' :
            color.includes('green') ? 'bg-green-500/20' :
            color.includes('purple') ? 'bg-purple-500/20' : 'bg-gray-500/20'
          }`}>
            <IconComponent 
              size={20} 
              className={
                color.includes('blue') ? 'text-blue-400' :
                color.includes('green') ? 'text-green-400' :
                color.includes('purple') ? 'text-purple-400' : 'text-gray-400'
              }
            />
          </div>
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">
              {typeof value === 'number' ? value.toLocaleString() : value || 0}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Fix 5: Format views helper
  const formatViews = (views) => {
    if (!views || views === 0) return 0;
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views;
  };

  // Fix 6: Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <FiRefreshCw className="animate-spin text-gray-400" size={24} />
          <span className="text-gray-400">Loading admin profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Profile</h1>
          <p className="text-gray-400">Manage your administrator account and view system overview</p>
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {(success || error) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
                success 
                  ? 'bg-green-500/10 border-green-400/30 text-green-300'
                  : 'bg-red-500/10 border-red-400/30 text-red-300'
              }`}
            >
              {success ? <FiCheck /> : <FiAlertCircle />}
              <span className="text-sm">{success || error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-8"
            >
              {/* Profile Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                    <FiShield size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {profileData.admin?.username || user?.username || 'Admin User'}
                    </h2>
                    <p className="text-gray-400">{profileData.admin?.email || user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                        Super Administrator
                      </span>
                    </div>
                  </div>
                </div>
                
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <FiEdit3 size={16} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave size={16} />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <FiX size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Form */}
              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <FiUser className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={!isEditing || updating}
                      className={`w-full py-3 pl-12 pr-4 rounded-lg text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all ${
                        isEditing && !updating
                          ? 'bg-gray-700/50 border border-gray-600/50 focus:ring-blue-400/50 focus:border-blue-400/50'
                          : 'bg-gray-700/30 border border-gray-600/30 cursor-not-allowed opacity-50'
                      }`}
                      placeholder="Enter username"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing || updating}
                    rows={3}
                    placeholder="Enter admin bio..."
                    className={`w-full py-3 px-4 rounded-lg text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all resize-none ${
                      isEditing && !updating
                        ? 'bg-gray-700/50 border border-gray-600/50 focus:ring-blue-400/50 focus:border-blue-400/50'
                        : 'bg-gray-700/30 border border-gray-600/30 cursor-not-allowed opacity-50'
                    }`}
                  />
                </div>

                {/* Password Section */}
                {isEditing && (
                  <div className="border-t border-gray-600/30 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Change Password</h3>
                      <button
                        onClick={() => setShowPasswordFields(!showPasswordFields)}
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        disabled={updating}
                      >
                        {showPasswordFields ? 'Hide' : 'Change Password'}
                      </button>
                    </div>

                    <AnimatePresence>
                      {showPasswordFields && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 overflow-hidden"
                        >
                          {/* Current Password */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <FiLock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                              <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                disabled={updating}
                                className="w-full py-3 pl-12 pr-12 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all disabled:opacity-50"
                                placeholder="Enter current password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                disabled={updating}
                                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
                              >
                                {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                              </button>
                            </div>
                          </div>

                          {/* New Password */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              New Password
                            </label>
                            <div className="relative">
                              <FiLock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                disabled={updating}
                                className="w-full py-3 pl-12 pr-12 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all disabled:opacity-50"
                                placeholder="Enter new password (min 6 characters)"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                disabled={updating}
                                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
                              >
                                {showNewPassword ? <FiEyeOff /> : <FiEye />}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* System Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">System Overview</h3>
              <div className="space-y-4">
                <StatCard
                  icon={FiUsers}
                  title="Total Users"
                  value={profileData.stats.totalUsers}
                  color="border-blue-500/30"
                />
                <StatCard
                  icon={FiVideo}
                  title="Total Videos"
                  value={profileData.stats.totalVideos}
                  color="border-green-500/30"
                />
                <StatCard
                  icon={FiBarChart}
                  title="Total Views"
                  value={formatViews(profileData.stats.totalViews)}
                  color="border-purple-500/30"
                />
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
              <div className="space-y-3">
                {profileData.recentUsers && profileData.recentUsers.length > 0 ? (
                  profileData.recentUsers.slice(0, 3).map((recentUser, index) => (
                    <div key={recentUser._id || index} className="flex items-center gap-3 p-2 bg-gray-700/30 rounded-lg">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <FiUser size={14} className="text-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {recentUser.username || 'Unknown User'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="capitalize">{recentUser.role || 'user'}</span>
                          <span>•</span>
                          <span>{formatDate(recentUser.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">No recent users</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Admin Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  className="w-full flex items-center gap-3 p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors text-left"
                  onClick={() => {
                    // Add your system settings navigation logic here
                    alert('System settings coming soon!');
                  }}
                >
                  <FiSettings className="text-gray-400" />
                  <span className="text-gray-300 text-sm">System Settings</span>
                </button>
                <button 
                  onClick={fetchAdminProfile}
                  disabled={loading}
                  className="w-full flex items-center gap-3 p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiRefreshCw className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-gray-300 text-sm">
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
