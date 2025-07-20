import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, 
  FiEye, 
  FiCalendar, 
  FiUser, 
  FiArrowLeft, 
  FiMoreVertical, 
  FiBookmark,
  FiFlag,
  FiMessageCircle,
  FiSend,
  FiHeart,
  FiCornerUpLeft // ✅ Use this instead of FiReply
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
  const [bookmarked, setBookmarked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Comment-related state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState('');

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

  // Fetch comments when video loads
  useEffect(() => {
    if (videoId) {
      fetchComments();
    }
  }, [videoId]);

  const fetchComments = async () => {
    setIsLoadingComments(true);
    setCommentsError('');
    
    try {
      const response = await fetch(`${baseUrl}/api/comment/${videoId}`);
      const data = await response.json();
      
      if (response.ok) {
        setComments(data.comments || []);
      } else {
        setCommentsError('Failed to load comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setCommentsError('Failed to load comments');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    if (!userId) {
      setCommentsError('Please log in to post a comment');
      return;
    }

    setIsPostingComment(true);
    setCommentsError('');

    try {
      const response = await fetch(`${baseUrl}/api/comment/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          videoId,
          content: newComment.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setNewComment('');
        // Refresh comments to show the new one
        await fetchComments();
      } else {
        setCommentsError(data.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      setCommentsError('Failed to post comment');
    } finally {
      setIsPostingComment(false);
    }
  };

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

  const formatCommentTime = (timestamp) => {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffInMs = now - commentDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return commentDate.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
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
      <div className="min-h-screen bg-transparent flex items-center justify-center">
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
    <div className="min-h-screen bg-transparent text-gray-100 relative overflow-hidden">
      
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: Math.random() * 200 + 80,
              height: Math.random() * 200 + 80,
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              background: `radial-gradient(circle, ${i % 2 === 0 ? '#10B981' : '#06B6D4'}40 0%, transparent 70%)`,
            }}
            animate={{
              x: [0, Math.random() * 60 - 30],
              y: [0, Math.random() * 60 - 30],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 25 + 20,
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
        </div>
      </div>

      {/* Full Width Video Section */}
      <div className="relative px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Full Width Video Player */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl group mb-8"
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
                <div className="relative w-28 h-28 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 group-hover/play:border-emerald-400/50 transition-all duration-300 shadow-2xl">
                  <FiPlay size={36} className="text-gray-900 ml-1 group-hover/play:text-emerald-600 transition-colors" />
                </div>
              </motion.button>
            </div>

            {/* Video Duration Badge */}
            <div className="absolute bottom-6 right-6 px-4 py-2 bg-black/80 backdrop-blur-sm text-white text-sm font-semibold rounded-lg border border-white/20">
              12:34
            </div>

            {/* Quality Badge */}
            <div className="absolute top-6 left-6 px-4 py-2 bg-emerald-500/90 backdrop-blur-sm text-white text-sm font-bold rounded-lg">
              HD
            </div>
          </motion.div>

          {/* Video Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            {/* Video Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6 leading-tight text-center">
              {video.title}
            </h1>
            
            {/* Video Meta Information */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                <FiEye size={16} className="text-emerald-400" />
                <span className="text-emerald-300 font-medium">
                  {formatViews(video.views)} views
                </span>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
                <FiCalendar size={16} className="text-cyan-400" />
                <span className="text-cyan-300 font-medium">
                  {formatDuration(video.createdAt)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
                <FiUser size={16} className="text-blue-400" />
                <span className="text-blue-300 font-medium">
                  {video.uploader?.username || 'Unknown Creator'}
                </span>
              </div>
            </div>

            {/* Description Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12"
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
                    <div className="text-center md:text-left">
                      <span className="text-gray-500">Published</span>
                      <p className="text-gray-300 font-medium">{new Date(video.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-500">Category</span>
                      <p className="text-gray-300 font-medium">Entertainment</p>
                    </div>
                    <div className="text-center md:text-right">
                      <span className="text-gray-500">Language</span>
                      <p className="text-gray-300 font-medium">English</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                    <FiMessageCircle className="text-blue-400" />
                    Comments
                    <span className="text-lg text-gray-400 font-normal">({comments.length})</span>
                  </h2>
                </div>

                {/* Comment Form */}
                {userId ? (
                  <form onSubmit={handlePostComment} className="mb-8">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300 resize-none"
                          rows={3}
                          disabled={isPostingComment}
                        />
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">
                            {newComment.length}/500 characters
                          </span>
                          
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setNewComment('')}
                              className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                              disabled={isPostingComment}
                            >
                              Cancel
                            </button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="submit"
                              disabled={!newComment.trim() || isPostingComment}
                              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-300"
                            >
                              {isPostingComment ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-transparent border-t-white"></div>
                              ) : (
                                <FiSend size={16} />
                              )}
                              {isPostingComment ? 'Posting...' : 'Comment'}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="mb-8 p-4 bg-gray-700/30 border border-gray-600/30 rounded-xl text-center">
                    <p className="text-gray-400 mb-3">Please log in to leave a comment</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {commentsError && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm">
                    {commentsError}
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-6">
                  {isLoadingComments ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-emerald-400 mx-auto mb-2"></div>
                      <p className="text-gray-400">Loading comments...</p>
                    </div>
                  ) : comments.length > 0 ? (
                    comments.map((comment, index) => (
                      <motion.div
                        key={comment._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4 p-4 bg-gray-700/20 rounded-xl hover:bg-gray-700/30 transition-all duration-300"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-200">
                              {comment.user?.username || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatCommentTime(comment.createdAt)}
                            </span>
                          </div>
                          
                          <p className="text-gray-300 leading-relaxed mb-3">
                            {comment.content}
                          </p>
                          
                          <div className="flex items-center gap-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <FiHeart size={14} />
                              <span className="text-xs">Like</span>
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors"
                            >
                              {/* ✅ Fixed: Use FiCornerUpLeft instead of FiReply */}
                              <FiCornerUpLeft size={14} />
                              <span className="text-xs">Reply</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiMessageCircle className="text-gray-500 text-2xl" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-300 mb-2">No comments yet</h3>
                      <p className="text-gray-500">Be the first to share your thoughts about this video!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
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
