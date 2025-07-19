import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, 
  FiHeart, 
  FiShare2, 
  FiEye, 
  FiCalendar, 
  FiUser, 
  FiArrowLeft, 
  FiMoreVertical, 
  FiThumbsUp, 
  FiDownload,
  FiVideo,
  FiClock,
  FiUserPlus,
  FiBookmark,
  FiFlag,
  FiMessageCircle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import VideoPlayerPopup from '../components/VideoPlayerPopup';

const baseUrl = process.env.REACT_APP_BASE_URL;

const VideoDetailPage = () => {
  const { id: videoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?._id || user?.id;

  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!videoId) return;
      setIsLoading(true);
      setError(null);
      
      try {
        const url = `${baseUrl}/api/video/getVideoByID/${videoId}?userId=${userId || ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Video not found or server error.');
        }
        const data = await response.json();
        setVideo(data.video);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoData();
  }, [videoId, userId]);

  const handlePlayClick = () => {
    setShowPlayer(true);
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views?.toString() || '0';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0B0F] via-[#111827] to-[#1F2937] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-emerald-400 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-emerald-400/20 mx-auto"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">Loading Video</h3>
          <p className="text-gray-400">Please wait while we load the content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0B0F] via-[#111827] to-[#1F2937] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiFlag className="text-red-400 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Unable to Load Video</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300"
          >
            Go Back
          </motion.button>
        </div>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0F] via-[#111827] to-[#1F2937] text-gray-100 relative overflow-hidden">
      
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              background: `radial-gradient(circle, ${i % 2 === 0 ? '#10B981' : '#06B6D4'}20 0%, transparent 70%)`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 30 + 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Navigation Bar */}
      <div className="relative z-20 p-6">
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 px-6 py-3 bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 text-gray-200 rounded-full hover:bg-gray-700/80 hover:border-emerald-500/50 transition-all duration-300 shadow-lg"
          >
            <FiArrowLeft size={20} />
            <span className="font-medium">Back to Videos</span>
          </motion.button>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setBookmarked(!bookmarked)}
              className={`p-3 backdrop-blur-xl border rounded-full transition-all duration-300 ${
                bookmarked
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-gray-800/80 border-gray-700/50 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50'
              }`}
            >
              <FiBookmark size={20} className={bookmarked ? 'fill-current' : ''} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 text-gray-400 rounded-full hover:text-gray-200 hover:border-gray-600/50 transition-all duration-300"
            >
              <FiMoreVertical size={20} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Video Preview */}
            <div className="xl:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl group"
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/1920x1080/374151/9CA3AF?text=Video+Thumbnail';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePlayClick}
                    className="group/play relative"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-150 group-hover/play:bg-emerald-400/30 transition-all duration-300"></div>
                    <div className="relative w-24 h-24 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 group-hover/play:border-emerald-400/50 transition-all duration-300 shadow-2xl">
                      <FiPlay size={32} className="text-gray-900 ml-1 group-hover/play:text-emerald-600 transition-colors" />
                    </div>
                  </motion.button>
                </div>

                {/* Video Duration Badge */}
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-sm font-semibold rounded-lg border border-white/20">
                  12:34
                </div>

                {/* Quality Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-lg">
                  HD
                </div>
              </motion.div>

              {/* Video Title & Meta */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4 leading-tight">
                  {video.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                    <FiEye size={14} className="text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-medium">
                      {formatViews(video.views)} views
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
                    <FiClock size={14} className="text-cyan-400" />
                    <span className="text-cyan-300 text-sm font-medium">
                      {formatDuration(video.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                    <FiUser size={14} className="text-blue-400" />
                    <span className="text-blue-300 text-sm font-medium">
                      {video.uploader?.username || 'Unknown Creator'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-300 ${
                      liked
                        ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                        : 'bg-gray-800/80 border border-gray-700/50 text-gray-300 hover:bg-gray-700/80 hover:border-gray-600/50'
                    }`}
                  >
                    <FiHeart size={18} className={liked ? 'fill-current' : ''} />
                    <span>{liked ? 'Liked' : 'Like'}</span>
                    <span className="text-xs opacity-70">1.2K</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-800/80 border border-gray-700/50 text-gray-300 font-semibold rounded-xl hover:bg-gray-700/80 hover:border-gray-600/50 transition-all duration-300"
                  >
                    <FiShare2 size={18} />
                    <span>Share</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-800/80 border border-gray-700/50 text-gray-300 font-semibold rounded-xl hover:bg-gray-700/80 hover:border-gray-600/50 transition-all duration-300"
                  >
                    <FiDownload size={18} />
                    <span>Download</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* Creator Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">
                        {video.uploader?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-2 border-gray-800 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-100 mb-1">
                      {video.uploader?.username || 'Unknown Creator'}
                    </h3>
                    <p className="text-sm text-gray-400">Content Creator</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-emerald-400">2.1K subscribers</span>
                    </div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFollowing(!following)}
                  className={`w-full py-3 font-semibold rounded-xl transition-all duration-300 ${
                    following
                      ? 'bg-gray-700/80 text-gray-300 hover:bg-gray-600/80'
                      : 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FiUserPlus size={16} />
                    {following ? 'Following' : 'Follow'}
                  </div>
                </motion.button>
              </motion.div>

              {/* Video Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
                  <FiVideo className="text-emerald-400" />
                  Video Statistics
                </h3>
                
                <div className="space-y-4">
                  {[
                    { label: 'Views', value: formatViews(video.views), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Likes', value: '1.2K', color: 'text-red-400', bg: 'bg-red-500/10' },
                    { label: 'Comments', value: '89', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Shares', value: '156', color: 'text-purple-400', bg: 'bg-purple-500/10' }
                  ].map((stat, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 ${stat.bg} rounded-xl`}>
                      <span className="text-gray-300 text-sm">{stat.label}</span>
                      <span className={`${stat.color} font-bold text-lg`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-bold text-gray-100 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 rounded-full text-sm border border-emerald-500/30 hover:border-emerald-400/50 transition-all cursor-pointer"
                      >
                        #{tag}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 max-w-4xl"
          >
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-2">
                <FiMessageCircle className="text-cyan-400" />
                About this video
              </h2>
              
              {video.description && (
                <div className="space-y-4">
                  <p className={`text-gray-300 leading-relaxed text-lg ${showFullDescription ? '' : 'line-clamp-4'}`}>
                    {video.description}
                  </p>
                  {video.description.length > 200 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      {showFullDescription ? 'Show less' : 'Show more'}
                    </motion.button>
                  )}
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Published</span>
                    <p className="text-gray-300 font-medium">{new Date(video.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Category</span>
                    <p className="text-gray-300 font-medium">Entertainment</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Language</span>
                    <p className="text-gray-300 font-medium">English</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Comments Section Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 max-w-4xl"
          >
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-2">
                <FiMessageCircle className="text-blue-400" />
                Comments <span className="text-sm text-gray-500 font-normal">(Coming Soon)</span>
              </h2>
              
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMessageCircle className="text-gray-500 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Comments Coming Soon</h3>
                <p className="text-gray-500">We're working on bringing you an amazing commenting experience</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Player Popup */}
      <AnimatePresence>
        {showPlayer && (
          <VideoPlayerPopup video={video} onClose={() => setShowPlayer(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoDetailPage;
