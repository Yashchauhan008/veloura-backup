// components/VideoCard.js
import React from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiClock, FiEye, FiUser, FiHeart, FiShare2, FiMoreVertical } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VideoCard = ({ video, viewMode = 'grid', showStats = false, showProgress = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleVideoClick = () => {
    // Enhanced debugging
    console.log('Video clicked:', video);
    console.log('Video ID:', video.id);
    console.log('Video ID type:', typeof video.id);
    
    if (!video.id) {
      console.error('Video ID is missing:', video);
      alert('Video ID is missing. Cannot play video.');
      return;
    }

    // Validate that it's a proper MongoDB ObjectId (24 character hex string)
    if (typeof video.id === 'string' && (video.id.match(/^[0-9a-fA-F]{24}$/) || video.id.length === 24)) {
      const userId = user?._id || user?.id;
      const videoUrl = `/video/${video.id}${userId ? `?userId=${userId}` : ''}`;
      
      console.log('Navigating to:', videoUrl);
      navigate(videoUrl);
    } else {
      console.error('Invalid video ID format:', video.id);
      alert(`Invalid video ID format: ${video.id}. Cannot play video.`);
    }
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    console.log(`${action} clicked for video:`, video.id);
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01, x: 5 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleVideoClick}
        className="group flex gap-4 p-5 bg-gradient-to-r from-gray-800/30 to-gray-700/30 backdrop-blur-xl rounded-2xl border border-gray-600/30 hover:border-emerald-400/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-emerald-500/10"
      >
        {/* Enhanced Thumbnail */}
        <div className="relative flex-shrink-0 w-64 h-36 rounded-xl overflow-hidden shadow-lg">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/320x180/374151/9CA3AF?text=Video+Thumbnail';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="w-16 h-16 bg-emerald-500/90 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <FiPlay className="text-white text-2xl ml-1" />
            </div>
          </div>
      
          {showProgress && (
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-600/50">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 w-1/3 rounded-full"></div>
            </div>
          )}
        </div>

        {/* Enhanced Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-100 mb-3 line-clamp-2 group-hover:text-emerald-300 transition-colors">
              {video.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                  <FiUser size={12} className="text-white" />
                </div>
                <span className="font-medium">{video.channel.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiEye size={14} />
                <span>{video.views} views</span>
              </div>
              <span>•</span>
              <span>{video.uploadedAt}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleActionClick(e, 'like')}
              className="p-2 bg-gray-700/50 hover:bg-emerald-500/20 rounded-lg transition-colors"
            >
              <FiHeart size={16} className="text-gray-400 hover:text-emerald-400" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleActionClick(e, 'share')}
              className="p-2 bg-gray-700/50 hover:bg-cyan-500/20 rounded-lg transition-colors"
            >
              <FiShare2 size={16} className="text-gray-400 hover:text-cyan-400" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -8 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleVideoClick}
      className="group bg-gradient-to-br from-gray-800/40 to-gray-700/40 backdrop-blur-xl rounded-2xl border border-gray-600/30 hover:border-emerald-400/50 transition-all duration-300 overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10"
    >
      
      {/* Enhanced Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/320x180/374151/9CA3AF?text=Video+Thumbnail';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            whileHover={{ scale: 1, rotate: 0 }}
            className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
          >
            <FiPlay className="text-white text-2xl ml-1" />
          </motion.div>
        </div>
        
        {video.duration && (
          <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
            {video.duration}
          </div>
        )}
        
        {showProgress && (
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-600/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '33%' }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
            />
          </div>
        )}
      </div>

      {/* Enhanced Content */}
      <div className="p-5">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative"
            >
              <img
                src={video.channel.avatar}
                alt={video.channel.name}
                className="w-10 h-10 rounded-full border-2 border-gray-600 group-hover:border-emerald-400 transition-colors"
                onError={(e) => {
                  e.target.src = `https://i.pravatar.cc/40?u=${video.channel.name}`;
                }}
              />
            </motion.div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-100 line-clamp-2 mb-2 text-base group-hover:text-emerald-300 transition-colors leading-tight">
              {video.title}
            </h3>
            <p className="text-sm text-gray-400 mb-2 font-medium group-hover:text-gray-300 transition-colors">
              {video.channel.name}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <FiEye size={12} />
                  <span>{video.views} views</span>
                </div>
                <span>•</span>
                <span>{video.uploadedAt}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => handleActionClick(e, 'like')}
                  className="p-1.5 hover:bg-emerald-500/20 rounded-lg transition-colors"
                >
                  <FiHeart size={14} className="text-gray-500 hover:text-emerald-400" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => handleActionClick(e, 'share')}
                  className="p-1.5 hover:bg-cyan-500/20 rounded-lg transition-colors"
                >
                  <FiShare2 size={14} className="text-gray-500 hover:text-cyan-400" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCard;
