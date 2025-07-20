import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiVideo,
  FiEye,
  FiUserPlus,
  FiUpload,
  FiTrendingUp,
  FiBarChart2,
  FiGlobe,
  FiLock,
  FiAward,
  FiRefreshCw
} from 'react-icons/fi';

const baseUrl = process.env.REACT_APP_BASE_URL;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVideos: 0,
    totalViews: 0,
    publicVideos: 0,
    privateVideos: 0,
    recentUploads: 0
  });
  const [topUploaders, setTopUploaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users data
      const usersResponse = await fetch(`${baseUrl}/api/user/getAllUsers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      let totalUsers = 12;
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        totalUsers = usersData.totalCount || 0;
      }

      // Fetch videos data
      const videosResponse = await fetch(`${baseUrl}/api/video/public-videos`);
      const videosData = await videosResponse.json();
      
      if (videosResponse.ok && videosData.publicVideos) {
        const videos = videosData.publicVideos;
        
        // Calculate stats from videos
        const totalVideos = videos.length;
        const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
        
        // Check for public vs private videos
        const publicVideos = videos.filter(video => 
          !video.accessLevel || video.accessLevel === 'public'
        ).length;
        const privateVideos = totalVideos - publicVideos;

        // Get recent uploads (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUploads = videos.filter(video => 
          video.createdAt && new Date(video.createdAt) >= thirtyDaysAgo
        ).length;

        // Calculate top uploaders
        const uploaderStats = {};
        videos.forEach(video => {
          if (video.uploader && video.uploader.username) {
            const uploaderId = video.uploader._id || video.uploader.username;
            if (!uploaderStats[uploaderId]) {
              uploaderStats[uploaderId] = {
                _id: uploaderId,
                username: video.uploader.username,
                videoCount: 0
              };
            }
            uploaderStats[uploaderId].videoCount++;
          }
        });

        const sortedUploaders = Object.values(uploaderStats)
          .sort((a, b) => b.videoCount - a.videoCount)
          .slice(0, 5);

        setStats({
          totalUsers, // Use actual user count from API
          totalVideos,
          totalViews,
          publicVideos,
          privateVideos,
          recentUploads
        });

        setTopUploaders(sortedUploaders);
      } else {
        // If videos fetch fails, still show user count
        setStats(prevStats => ({
          ...prevStats,
          totalUsers
        }));
        throw new Error(videosData.message || 'Failed to fetch videos data');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(`Failed to fetch dashboard statistics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => {
    const IconComponent = icon;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gray-800/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 ${color}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
            <p className="text-3xl font-bold text-white mb-1">
              {typeof value === 'number' ? value.toLocaleString() : '0'}
            </p>
            {subtitle && (
              <p className="text-gray-500 text-xs">{subtitle}</p>
            )}
            {trend && trend > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <FiTrendingUp size={12} className="text-green-400" />
                <span className="text-green-400 text-xs">+{trend} this month</span>
              </div>
            )}
          </div>
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            color.includes('blue') ? 'bg-blue-500/20' : 
            color.includes('red') ? 'bg-red-500/20' : 
            color.includes('green') ? 'bg-green-500/20' : 
            color.includes('yellow') ? 'bg-yellow-500/20' : 
            color.includes('purple') ? 'bg-purple-500/20' : 'bg-gray-500/20'
          }`}>
            <IconComponent 
              size={24} 
              className={
                color.includes('blue') ? 'text-blue-400' : 
                color.includes('red') ? 'text-red-400' : 
                color.includes('green') ? 'text-green-400' : 
                color.includes('yellow') ? 'text-yellow-400' : 
                color.includes('purple') ? 'text-purple-400' : 'text-gray-400'
              }
            />
          </div>
        </div>
      </motion.div>
    );
  };

  const TopUploaderCard = ({ uploader, index }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
      <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
        <span className="text-sm font-bold text-white">#{index + 1}</span>
      </div>
      <div className="flex-1">
        <p className="text-white text-sm font-medium">{uploader.username}</p>
        <p className="text-gray-400 text-xs">Content Creator</p>
      </div>
      <div className="text-right">
        <p className="text-white text-sm font-semibold">{uploader.videoCount}</p>
        <p className="text-gray-400 text-xs">videos</p>
      </div>
    </div>
  );

  const UserRoleCard = ({ role, count, color }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-gray-300 capitalize">{role}</span>
      </div>
      <span className="text-white font-semibold">{count}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <FiRefreshCw className="animate-spin text-gray-400" size={24} />
          <span className="text-gray-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 mt-5">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Overview of your YouTube platform</p>
        </div>

        {/* Main Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={FiUsers}
            color="border-blue-500/30 hover:border-blue-400/50"
            subtitle="Registered platform users"
          />
          <StatCard
            title="Total Videos"
            value={stats.totalVideos}
            icon={FiVideo}
            color="border-red-500/30 hover:border-red-400/50"
            trend={stats.recentUploads}
          />
          <StatCard
            title="Total Views"
            value={stats.totalViews}
            icon={FiEye}
            color="border-green-500/30 hover:border-green-400/50"
            subtitle="All time views"
          />
          <StatCard
            title="Recent Uploads"
            value={stats.recentUploads}
            icon={FiUserPlus}
            color="border-purple-500/30 hover:border-purple-400/50"
            subtitle="Last 30 days"
          />
        </div>

        {/* Secondary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Public Videos"
            value={stats.publicVideos}
            icon={FiGlobe}
            color="border-green-500/30 hover:border-green-400/50"
            subtitle="Publicly available"
          />
          <StatCard
            title="Private Videos"
            value={stats.privateVideos}
            icon={FiLock}
            color="border-yellow-500/30 hover:border-yellow-400/50"
            subtitle="Private content"
          />
          <StatCard
            title="Platform Growth"
            value={`${stats.totalVideos > 0 ? Math.round((stats.recentUploads / stats.totalVideos) * 100) : 0}%`}
            icon={FiUpload}
            color="border-blue-500/30 hover:border-blue-400/50"
            subtitle="Growth this month"
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Uploaders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <FiAward size={20} className="text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Top Uploaders</h3>
                <p className="text-gray-400 text-sm">Most active content creators</p>
              </div>
            </div>
            <div className="space-y-3">
              {topUploaders.length > 0 ? (
                topUploaders.map((uploader, index) => (
                  <TopUploaderCard key={uploader._id} uploader={uploader} index={index} />
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No uploaders found</p>
              )}
            </div>
          </motion.div>

          {/* Content Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <FiBarChart2 size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Content Distribution</h3>
                <p className="text-gray-400 text-sm">Video accessibility breakdown</p>
              </div>
            </div>
            <div className="space-y-4">
              <UserRoleCard 
                role="Public Videos" 
                count={stats.publicVideos} 
                color="bg-green-500" 
              />
              <UserRoleCard 
                role="Private Videos" 
                count={stats.privateVideos} 
                color="bg-yellow-500" 
              />
              <UserRoleCard 
                role="Recent Uploads" 
                count={stats.recentUploads} 
                color="bg-blue-500" 
              />
              <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Average Views per Video</span>
                  <span className="text-white font-semibold">
                    {stats.totalVideos > 0 ? Math.round(stats.totalViews / stats.totalVideos).toLocaleString() : 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Platform Insights */}
        <div className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Platform Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                <p className="text-2xl font-bold text-green-400">
                  {stats.totalVideos > 0 ? ((stats.publicVideos / stats.totalVideos) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-gray-400 text-sm">Public Content</p>
              </div>
              <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                <p className="text-2xl font-bold text-blue-400">
                  {stats.totalVideos > 0 ? Math.round(stats.totalViews / stats.totalVideos).toLocaleString() : 0}
                </p>
                <p className="text-gray-400 text-sm">Avg Views/Video</p>
              </div>
              <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                <p className="text-2xl font-bold text-purple-400">
                  {topUploaders.length > 0 ? topUploaders[0]?.videoCount || 0 : 0}
                </p>
                <p className="text-gray-400 text-sm">Top Creator Videos</p>
              </div>
              <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                <p className="text-2xl font-bold text-yellow-400">
                  {stats.totalUsers > 0 && stats.totalVideos > 0 ? (stats.totalVideos / stats.totalUsers).toFixed(1) : 0}
                </p>
                <p className="text-gray-400 text-sm">Videos per User</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchDashboardStats}
            disabled={loading}
            className="flex items-center gap-2 mx-auto bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
