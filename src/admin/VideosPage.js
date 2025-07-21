import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, 
  FiVideo, 
  FiRefreshCw, 
  FiLock,
  FiEye,
  FiCalendar,
  FiUser,
  FiAlertCircle,
  FiCheck,
  FiShield
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const baseUrl = process.env.REACT_APP_BASE_URL;

const VideosPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [allVideos, setAllVideos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [restrictingVideoId, setRestrictingVideoId] = useState(null);
  const [videoToRestrict, setVideoToRestrict] = useState(null);
  const [showRestrictConfirm, setShowRestrictConfirm] = useState(false);
  
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

  const processAllVideos = (videosArray) => {
    return videosArray.map((video, index) => {
      console.log(`Processing video ${index}:`, video);
      
      const videoId = video._id || video.videoId || video.id;
      
      if (!videoId) {
        console.warn(`Video ${index} has no valid ID:`, video);
        return null;
      }

      let channelName = 'Unknown Creator';
      let viewCount = 0;

      if (video.uploaderUsername) {
        channelName = video.uploaderUsername;
      } else if (video.uploader?.username) {
        channelName = video.uploader.username;
      }

      if (video.viewsCount !== undefined) {
        viewCount = video.viewsCount;
      } else if (video.views !== undefined) {
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
        rawViews: viewCount,
        duration: '8:20',
        uploadedAt: video.createdAt ? new Date(video.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        tags: video.tags || [],
        description: video.description || '',
        accessLevel: video.accessLevel || 'public', // Track access level
        _originalData: video
      };

      console.log(`Formatted video ${index}:`, { 
        id: formattedVideo.id, 
        title: formattedVideo.title,
        channelName: formattedVideo.channel.name,
        views: formattedVideo.views,
        originalViews: viewCount,
        accessLevel: formattedVideo.accessLevel,
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

  // ✅ NEW: Restrict video functionality
  const handleRestrictVideo = async (videoId) => {
    if (!userId) {
      setError('You must be logged in to restrict videos');
      return;
    }

    // Find the original video ID from the formatted video
    const originalVideo = allVideos.find(v => v.id === videoId);
    const originalVideoId = originalVideo?._originalData?._id || videoId;

    setRestrictingVideoId(videoId);
    
    try {
      const response = await fetch(`${baseUrl}/api/admin/restrict-video/${originalVideoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update video access level in local state
        setAllVideos(prevVideos => 
          prevVideos.map(video => 
            video.id === videoId 
              ? { ...video, accessLevel: 'restricted' }
              : video
          )
        );
        
        setSuccess('Video access level updated to restricted successfully!');
        setShowRestrictConfirm(false);
        setVideoToRestrict(null);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          setError('You are not authorized to restrict this video');
        } else if (response.status === 404) {
          setError('Video not found');
        } else {
          setError(errorData.message || 'Failed to restrict video');
        }
      }
    } catch (error) {
      console.error('Error restricting video:', error);
      setError('Failed to restrict video. Please try again.');
    } finally {
      setRestrictingVideoId(null);
    }
  };

  const confirmRestrict = (video) => {
    setVideoToRestrict(video);
    setShowRestrictConfirm(true);
  };

  const handleRefresh = () => {
    if (userId) {
      fetchAllData();
    } else {
      fetchPublicFeed();
    }
  };

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

  const VideoCard = ({ video }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`backdrop-blur-xl border rounded-2xl p-4 transition-all duration-300 group ${
        video.accessLevel === 'restricted' 
          ? 'bg-red-800/20 border-red-500/30 hover:border-red-400/50' 
          : 'bg-gray-800/50 border-gray-600/30 hover:border-gray-500/50'
      }`}
    >
      {/* Video Thumbnail */}
      <div className="relative mb-4 rounded-xl overflow-hidden">
        <img
          src={video.thumbnail || 'https://via.placeholder.com/320x180/374151/9CA3AF?text=Video+Thumbnail'}
          alt={video.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Access Level Badge */}
        {video.accessLevel === 'restricted' && (
          <div className="absolute top-2 left-2 z-10">
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/80 rounded-full shadow-lg">
              <FiLock size={12} className="text-white" />
              <span className="text-xs font-bold text-white">RESTRICTED</span>
            </div>
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
            <FiPlay className="text-gray-800 ml-1" size={20} />
          </div>
        </div>

        {/* Restrict Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => confirmRestrict(video)}
          disabled={restrictingVideoId === video.id || video.accessLevel === 'restricted'}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            video.accessLevel === 'restricted'
              ? 'bg-gray-500/80 cursor-not-allowed'
              : 'bg-orange-500/80 hover:bg-orange-500'
          }`}
        >
          {restrictingVideoId === video.id ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <FiLock size={14} className="text-white" />
          )}
        </motion.button>
      </div>

      {/* Video Info */}
      <div className="space-y-3">
        <h3 className={`font-semibold text-lg line-clamp-2 transition-colors ${
          video.accessLevel === 'restricted' 
            ? 'text-red-300 group-hover:text-red-200' 
            : 'text-white group-hover:text-cyan-400'
        }`}>
          {video.title || 'Untitled Video'}
        </h3>

        {/* Channel Info */}
        <div className="flex items-center gap-2 text-gray-400">
          <FiUser size={14} />
          <span className="text-sm truncate">
            {video.channel?.name || 'Unknown Creator'}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <FiEye size={14} />
            <span>{video.views || '0'} views</span>
          </div>
          <div className="flex items-center gap-1">
            <FiCalendar size={14} />
            <span>{video.uploadedAt || 'Unknown'}</span>
          </div>
        </div>

        {/* Access Level Status */}
        <div className="flex items-center gap-2">
          {video.accessLevel === 'restricted' ? (
            <div className="flex items-center gap-1 text-red-400 text-xs">
              <FiLock size={12} />
              <span>Restricted Access</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <FiShield size={12} />
              <span>Public Access</span>
            </div>
          )}
        </div>

        {/* Video Description */}
        {video.description && (
          <p className="text-gray-400 text-sm line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </motion.div>
  );

  const SkeletonCard = () => (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-4 animate-pulse">
      <div className="w-full h-48 bg-gray-700/50 rounded-xl mb-4"></div>
      <div className="space-y-3">
        <div className="h-6 bg-gray-700/50 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
        <div className="flex gap-4">
          <div className="h-4 bg-gray-700/50 rounded w-16"></div>
          <div className="h-4 bg-gray-700/50 rounded w-20"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Restrict Confirmation Modal */}
        <AnimatePresence>
          {showRestrictConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowRestrictConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-600/40"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <FiLock className="text-orange-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100">Restrict Video Access</h3>
                    <p className="text-sm text-gray-400">This will limit video accessibility</p>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-6">
                  Are you sure you want to restrict access to "<span className="font-medium">{videoToRestrict?.title}</span>"?
                </p>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRestrictVideo(videoToRestrict.id)}
                    disabled={restrictingVideoId === videoToRestrict?.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    {restrictingVideoId === videoToRestrict?.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Restricting...
                      </>
                    ) : (
                      <>
                        <FiLock size={16} />
                        Restrict Access
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowRestrictConfirm(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                All Videos
              </h1>
              <p className="text-gray-400">
                Manage video access levels and content
              </p>
              {error && (
                <p className="text-red-400 text-sm mt-2">⚠️ {error}</p>
              )}
            </div>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <FiRefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Status Messages */}
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

        {/* Stats */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {allVideos.length}
              </p>
              <p className="text-gray-400 text-sm">Total Videos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {allVideos.filter(video => video.accessLevel === 'public').length}
              </p>
              <p className="text-gray-400 text-sm">Public Videos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">
                {allVideos.filter(video => video.accessLevel === 'restricted').length}
              </p>
              <p className="text-gray-400 text-sm">Restricted Videos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {new Set(allVideos.map(video => video.channel?.name)).size}
              </p>
              <p className="text-gray-400 text-sm">Unique Creators</p>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-100">All Videos</h2>
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded-full text-xs text-gray-400">
              <span>{allVideos.length}</span>
              <span>videos</span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array(8).fill(0).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : allVideos.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {allVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
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
                No videos available
              </h3>
              <p className="text-gray-500 max-w-md mb-4">
                No videos are currently available on the platform.
              </p>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default VideosPage;
