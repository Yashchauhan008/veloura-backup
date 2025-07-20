import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiClock, FiTrendingUp, FiVideo, FiGrid, FiList, FiFilter, FiRefreshCw, FiSearch } from 'react-icons/fi';
import Sidebar from './FeedPage/Sidebar';
import VideoCard from './FeedPage/VideoCard';
import SkeletonCard from './FeedPage/SkeletonCard';
import { useAuth } from '../context/AuthContext';

const baseUrl = process.env.REACT_APP_BASE_URL;

const ExplorePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [allVideos, setAllVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTrending, setShowTrending] = useState(false); // ✅ NEW: Trending state
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

  // Filter videos when search term or trending changes
  useEffect(() => {
    filterVideos();
  }, [searchTerm, allVideos, showTrending]); // ✅ NEW: Added showTrending dependency

  // ✅ UPDATED: Filter videos based on search and trending
  const filterVideos = () => {
    let filtered = [...allVideos];

    // Apply search filter first
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(search) ||
        video.channel.name.toLowerCase().includes(search) ||
        video.description.toLowerCase().includes(search) ||
        video.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // ✅ NEW: Apply trending filter (sort by highest view count)
    if (showTrending) {
      filtered = filtered
        .sort((a, b) => {
          // Extract numeric values from views for sorting
          const aViews = extractNumericViews(a.views);
          const bViews = extractNumericViews(b.views);
          return bViews - aViews; // Highest first
        })
        .slice(0, 20); // Show top 20 trending videos
    }
    
    setFilteredVideos(filtered);
    console.log(`Filtered to ${filtered.length} videos (search: "${searchTerm}", trending: ${showTrending})`);
  };

  // ✅ NEW: Extract numeric value from formatted view string
  const extractNumericViews = (viewString) => {
    if (!viewString) return 0;
    const numStr = viewString.toString().toLowerCase();
    if (numStr.includes('m')) {
      return parseFloat(numStr) * 1000000;
    } else if (numStr.includes('k')) {
      return parseFloat(numStr) * 1000;
    }
    return parseInt(numStr) || 0;
  };

  // ✅ Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // ✅ NEW: Toggle trending filter
  const handleTrendingToggle = () => {
    setShowTrending(!showTrending);
  };

  // ✅ Copied from FeedPage
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
        setFilteredVideos(formattedVideos);
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

  // ✅ Copied from FeedPage - Only for all videos
  const fetchAllData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const allVideosUrl = `${baseUrl}/api/video/public-videos`;

      console.log('Fetching from URL:', allVideosUrl);

      const allVideosResponse = await fetch(allVideosUrl).catch(err => {
        console.error('All videos fetch failed:', err);
        return { ok: false, error: err };
      });

      let allVideosData = { publicVideos: [] };

      if (allVideosResponse.ok) {
        try {
          allVideosData = await allVideosResponse.json();
        } catch (e) {
          console.error('Error parsing all videos response:', e);
        }
      }

      console.log('Parsed API response:', { 
        allVideosCount: allVideosData.publicVideos?.length || 0
      });

      // Process All Videos from public-videos endpoint
      if (allVideosData.publicVideos && Array.isArray(allVideosData.publicVideos)) {
        const formattedAllVideos = processAllVideos(allVideosData.publicVideos);
        setAllVideos(formattedAllVideos);
        setFilteredVideos(formattedAllVideos);
        console.log('Processed all videos:', formattedAllVideos.length);
      }

    } catch (error) {
      console.error("An error occurred in fetchAllData:", error);
      setError("Failed to load some content");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Copied EXACTLY from FeedPage
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
        rawViews: viewCount, // ✅ NEW: Keep raw number for sorting
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

  // ✅ Copied EXACTLY from FeedPage
  const formatViews = (views) => {
    const numViews = Number(views) || 0;
    if (numViews >= 1000000) {
      return `${(numViews / 1000000).toFixed(1)}M`;
    } else if (numViews >= 1000) {
      return `${(numViews / 1000).toFixed(1)}K`;
    }
    return numViews.toString();
  };

  const handleRefresh = () => {
    if (userId) {
      fetchAllData();
    } else {
      fetchPublicFeed();
    }
  };

  // ✅ Use 3-column layout like FeedPage "All Videos"
  const getGridClasses = () => {
    if (viewMode === 'list') {
      return 'grid-cols-1 max-w-4xl';
    }
    
    // For "All Videos" use 3-column layout on desktop
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
    <div className="flex min-h-screen bg-[#2D303A]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="min-h-screen bg-[#2D303A] text-gray-100 relative overflow-hidden">
          
          {/* Animated Background Elements - Same as FeedPage */}
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
            
            {/* Header Section - Enhanced with Search and Trending */}
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
                    Explore Videos
                  </h1>
                  <p className="text-gray-400">
                    {searchTerm ? `Searching for "${searchTerm}"` : 
                     showTrending ? 'Showing trending videos by view count' :
                     'Discover amazing content'}
                  </p>
                  {error && (
                    <p className="text-red-400 text-sm mt-2">⚠️ {error}</p>
                  )}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-4">
                  
                  {/* ✅ NEW: Trending Toggle Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTrendingToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      showTrending
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'bg-gray-800/40 backdrop-blur-md border border-gray-600/40 text-gray-400 hover:text-orange-400'
                    }`}
                  >
                    <FiTrendingUp size={16} />
                    <span className="hidden sm:inline">
                      {showTrending ? 'Trending ON' : 'Trending'}
                    </span>
                  </motion.button>
                  
                  {/* Refresh Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRefresh}
                    className="p-2 bg-gray-800/40 backdrop-blur-md rounded-xl border border-gray-600/40 text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    <FiRefreshCw size={18} />
                  </motion.button>

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

              {/* Search Bar */}
              <div className="mt-6 relative max-w-2xl">
                <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search for videos, creators, or topics..."
                  className="w-full py-4 pl-12 pr-12 bg-gray-800/50 backdrop-blur-xl border border-gray-600/50 rounded-xl text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>

            {/* Main Content Section - Updated with search and trending */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-100">
                  {searchTerm ? `Search Results for "${searchTerm}"` :
                   showTrending ? 'Trending Videos' : 'All Videos'}
                </h2>
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded-full text-xs text-gray-400">
                  <span>{searchTerm || showTrending ? filteredVideos.length : allVideos.length}</span>
                  <span>videos</span>
                </div>
                {/* ✅ NEW: Trending indicator */}
                {showTrending && !searchTerm && (
                  <div className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full border border-orange-500/30">
                    🔥 Sorted by highest views
                  </div>
                )}
              </div>

              {isLoading ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className={`grid gap-6 ${getGridClasses()}`}
                >
                  {Array(6).fill(0).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </motion.div>
              ) : (searchTerm || showTrending ? filteredVideos : allVideos).length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className={`grid gap-6 ${getGridClasses()}`}
                >
                  {(searchTerm || showTrending ? filteredVideos : allVideos).map((video, index) => (
                    <motion.div
                      key={video.id}
                      variants={itemVariants}
                      transition={{ delay: index * 0.05 }}
                      className={`${viewMode === 'list' ? 'w-full' : ''} max-w-none relative`}
                    >
                      <VideoCard 
                        video={video} 
                        viewMode={viewMode}
                        showStats
                      />
                      {/* ✅ NEW: Show trending rank for trending videos */}
                      {showTrending && !searchTerm && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                            #{index + 1}
                          </span>
                        </div>
                      )}
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
                    {searchTerm ? 'No videos found' : 'No videos found'}
                  </h3>
                  <p className="text-gray-500 max-w-md mb-4">
                    {searchTerm 
                      ? `No videos match your search for "${searchTerm}". Try different keywords.`
                      : 'No videos are currently available. Check back later for new content.'
                    }
                  </p>
                  {searchTerm && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSearchTerm('')}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Clear Search
                    </motion.button>
                  )}
                </motion.div>
              )}
            </motion.section>

           
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExplorePage;
