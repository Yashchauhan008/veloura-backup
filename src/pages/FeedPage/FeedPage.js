// components/FeedPage.js - Updated with 3 cards per row on desktop
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiClock, FiTrendingUp, FiVideo, FiGrid, FiList, FiFilter, FiRefreshCw } from 'react-icons/fi';
import VideoCard from './VideoCard';
import SkeletonCard from './SkeletonCard';
import { useAuth } from '../../context/AuthContext';

const baseUrl = process.env.REACT_APP_BASE_URL;

const FeedPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [feedVideos, setFeedVideos] = useState([]);
  const [historyVideos, setHistoryVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState('');
  const { user } = useAuth();
  
  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!userId) {
      console.warn("User ID is not available. Loading public feed only.");
      fetchPublicFeed();
      return;
    }
    fetchAllData();
  }, [userId]);

  const fetchPublicFeed = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🚀 Fetching public videos...');
      
      const response = await fetch(`${baseUrl}/api/video/public-videos`);
      const data = await response.json();
      
      console.log('📦 Public videos response:', data);
      
      if (response.ok && data.success && data.publicVideos) {
        const formattedVideos = processAllVideos(data.publicVideos);
        setAllVideos(formattedVideos);
        console.log('✅ Successfully loaded videos:', formattedVideos.length);
      } else {
        console.error('❌ API Error:', data);
        setError(data.message || "No videos available at the moment");
      }
      
    } catch (error) {
      console.error("❌ Error fetching public feed:", error);
      setError("Failed to load videos - please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const historyUrl = `${baseUrl}/api/user/getUserHistory?userId=${userId}`;
      const feedUrl = `${baseUrl}/api/video/personalizedFeed?userId=${userId}`;
      const allVideosUrl = `${baseUrl}/api/video/public-videos`;

      console.log('Fetching from URLs:', { historyUrl, feedUrl, allVideosUrl });

      const [historyResponse, feedResponse, allVideosResponse] = await Promise.all([
        fetch(historyUrl).catch(err => {
          console.error('History fetch failed:', err);
          return { ok: false, error: err };
        }),
        fetch(feedUrl).catch(err => {
          console.error('Feed fetch failed:', err);
          return { ok: false, error: err };
        }),
        fetch(allVideosUrl).catch(err => {
          console.error('All videos fetch failed:', err);
          return { ok: false, error: err };
        })
      ]);

      // Process responses with better error handling
      let historyData = { history: [] };
      let feedData = { videos: [] };
      let allVideosData = { publicVideos: [] };

      if (historyResponse.ok) {
        try {
          historyData = await historyResponse.json();
        } catch (e) {
          console.error('Error parsing history response:', e);
        }
      }

      if (feedResponse.ok) {
        try {
          feedData = await feedResponse.json();
        } catch (e) {
          console.error('Error parsing feed response:', e);
        }
      }

      if (allVideosResponse.ok) {
        try {
          allVideosData = await allVideosResponse.json();
        } catch (e) {
          console.error('Error parsing all videos response:', e);
        }
      }

      console.log('Parsed API responses:', { 
        historyCount: historyData.history?.length || 0,
        feedCount: feedData.videos?.length || 0,
        allVideosCount: allVideosData.publicVideos?.length || 0
      });

      // Process History videos
      if (historyData.history && Array.isArray(historyData.history)) {
        const formattedHistory = historyData.history.map(video => ({
          id: video._id,
          title: video.title,
          thumbnail: video.thumbnailUrl,
          videoUrl: video.videoUrl,
          channel: {
            name: video.uploader?.username || 'Unknown',
            avatar: `https://i.pravatar.cc/40?u=${video.uploader?.username || video._id}`
          },
          views: formatViews(video.views || 0),
          duration: '12:34',
          uploadedAt: new Date(video.createdAt).toLocaleDateString()
        }));
        setHistoryVideos(formattedHistory);
        console.log('Processed history videos:', formattedHistory.length);
      }

      // Process Personalized Feed videos - FIXED
      if (feedData.videos && Array.isArray(feedData.videos)) {
        const formattedFeed = feedData.videos.map(video => ({
          id: video._id,
          title: video.title,
          thumbnail: video.thumbnailUrl,
          videoUrl: video.videoUrl,
          channel: {
            name: video.uploader?.username || 'Unknown',
            avatar: `https://i.pravatar.cc/40?u=${video.uploader?.username || video._id}`
          },
          views: formatViews(video.views || 0), // ✅ Use 'views' not 'viewsCount'
          duration: '10:45',
          uploadedAt: new Date(video.createdAt).toLocaleDateString()
        }));
        setFeedVideos(formattedFeed);
        console.log('Processed feed videos:', formattedFeed.length);
      }

      // Process All Videos from public-videos endpoint
      if (allVideosData.publicVideos && Array.isArray(allVideosData.publicVideos)) {
        const formattedAllVideos = processAllVideos(allVideosData.publicVideos);
        setAllVideos(formattedAllVideos);
        console.log('Processed all videos:', formattedAllVideos.length);
      }

    } catch (error) {
      console.error("An error occurred in fetchAllData:", error);
      setError("Failed to load some content");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UPDATED: Fixed processAllVideos function
  const processAllVideos = (videosArray) => {
    return videosArray.map((video, index) => {
      console.log(`Processing video ${index}:`, video);
      
      const videoId = video._id || video.videoId || video.id;
      
      if (!videoId) {
        console.warn(`Video ${index} has no valid ID:`, video);
        return null;
      }

      // ✅ FIXED: Handle both data formats properly
      let channelName = 'Unknown Creator';
      let viewCount = 0;

      // Check for uploaderUsername (from public-videos endpoint)
      if (video.uploaderUsername) {
        channelName = video.uploaderUsername;
      }
      // Check for uploader.username (from other endpoints)
      else if (video.uploader?.username) {
        channelName = video.uploader.username;
      }

      // Check for viewsCount (from public-videos endpoint)
      if (video.viewsCount !== undefined) {
        viewCount = video.viewsCount;
      }
      // Check for views (from other endpoints)
      else if (video.views !== undefined) {
        viewCount = video.views;
      }

      const formattedVideo = {
        id: videoId.toString(),
        title: video.title || 'Untitled Video',
        thumbnail: video.thumbnailUrl || 'https://via.placeholder.com/320x180/374151/9CA3AF?text=Video+Thumbnail',
        videoUrl: video.videoUrl,
        channel: {
          name: channelName,
          id: video.uploaderId || video.uploader?._id,
          avatar: `https://i.pravatar.cc/40?u=${channelName || `user-${index}`}`
        },
        views: formatViews(viewCount),
        duration: '8:20',
        uploadedAt: video.createdAt ? new Date(video.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        tags: video.tags || [],
        description: video.description || '',
        _originalData: video
      };

      console.log(`Formatted video ${index}:`, { 
        id: formattedVideo.id, 
        title: formattedVideo.title,
        channelName: formattedVideo.channel.name,
        views: formattedVideo.views,
        originalViews: viewCount,
        hasValidId: !!formattedVideo.id 
      });
      
      return formattedVideo;
    }).filter(video => video !== null);
  };

  const formatViews = (views) => {
    const numViews = Number(views) || 0;
    if (numViews >= 1000000) {
      return `${(numViews / 1000000).toFixed(1)}M`;
    } else if (numViews >= 1000) {
      return `${(numViews / 1000).toFixed(1)}K`;
    }
    return numViews.toString();
  };

  const getFilteredVideos = () => {
    switch (activeFilter) {
      case 'history':
        return historyVideos;
      case 'recommended':
        return feedVideos;
      case 'all':
      default:
        return allVideos;
    }
  };

  const handleRefresh = () => {
    if (userId) {
      fetchAllData();
    } else {
      fetchPublicFeed();
    }
  };

  // ✅ UPDATED: Function to get grid classes based on filter
  const getGridClasses = () => {
    if (viewMode === 'list') {
      return 'grid-cols-1 max-w-4xl';
    }
    
    // For history, use original 4-column layout
    if (activeFilter === 'history') {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
    
    // For "All Videos" and "For You", use 3-column layout on desktop
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#2D303A] text-gray-100 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-gray-800/5 to-gray-700/5 backdrop-blur-sm"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -50, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 30 + 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Title */}
            <div>
              <h1 className="text-5xl font-bold bg-white bg-clip-text text-transparent mb-2">
                Discover Videos
              </h1>
              <p className="text-gray-400">Explore content tailored for you</p>
              {error && (
                <p className="text-red-400 text-sm mt-2">⚠️ {error}</p>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="p-2 bg-gray-800/40 backdrop-blur-md rounded-xl border border-gray-600/40 text-gray-400 hover:text-emerald-400 transition-colors"
              >
                <FiRefreshCw size={18} />
              </motion.button>
              
              {/* Filter Tabs */}
              <div className="flex items-center bg-gray-800/40 backdrop-blur-md rounded-xl border border-gray-600/40 p-1">
                {[
                  { id: 'all', label: 'All Videos', icon: FiVideo },
                  { id: 'recommended', label: 'For You', icon: FiTrendingUp },
                  { id: 'history', label: 'History', icon: FiClock }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                      activeFilter === filter.id
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                    }`}
                  >
                    <filter.icon size={16} />
                    <span className="hidden sm:inline">{filter.label}</span>
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-800/40 backdrop-blur-md rounded-xl border border-gray-600/40 p-1">
                {[
                  { mode: 'grid', icon: FiGrid },
                  { mode: 'list', icon: FiList }
                ].map((mode) => (
                  <button
                    key={mode.mode}
                    onClick={() => setViewMode(mode.mode)}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === mode.mode
                        ? 'bg-cyan-500 text-white'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                    }`}
                  >
                    <mode.icon size={18} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Continue Watching Section */}
        <AnimatePresence>
          {activeFilter === 'history' && historyVideos.length > 0 && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-100">Continue Watching</h2>
                <FiClock className="text-emerald-400" size={20} />
              </div>
              
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {historyVideos.slice(0, 5).map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex-shrink-0 w-80"
                  >
                    <VideoCard video={video} showProgress />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Main Content Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-100">
              {activeFilter === 'all' && 'All Videos'}
              {activeFilter === 'recommended' && 'Recommended for You'}
              {activeFilter === 'history' && 'Watch History'}
            </h2>
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded-full text-xs text-gray-400">
              <span>{getFilteredVideos().length}</span>
              <span>videos</span>
            </div>
           
          </div>

          {isLoading ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`grid gap-6 ${getGridClasses()}`}
            >
              {Array(viewMode === 'list' ? 6 : (activeFilter === 'history' ? 8 : 6)).fill(0).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </motion.div>
          ) : getFilteredVideos().length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`grid gap-6 ${getGridClasses()}`}
            >
              {getFilteredVideos().map((video, index) => (
                <motion.div
                  key={video.id}
                  variants={itemVariants}
                  transition={{ delay: index * 0.05 }}
                  className={`${viewMode === 'list' ? 'w-full' : ''} ${
                    (activeFilter === 'all' || activeFilter === 'recommended') && viewMode === 'grid'
                      ? 'max-w-none' // Allow full width for 3-column layout
                      : ''
                  }`}
                >
                  <VideoCard 
                    video={video} 
                    viewMode={viewMode}
                    showStats
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center mb-6">
                <FiVideo className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No videos found
              </h3>
              <p className="text-gray-500 max-w-md">
                {activeFilter === 'history' 
                  ? "Your watch history is empty. Start watching videos to see them here."
                  : activeFilter === 'recommended'
                  ? "No personalized recommendations yet. Watch more videos to get better suggestions."
                  : "No videos are currently available. Check back later for new content."
                }
              </p>
            </motion.div>
          )}
        </motion.section>

      </div>
    </div>
  );
};

export default FeedPage;
