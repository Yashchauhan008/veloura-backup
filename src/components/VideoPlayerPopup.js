import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A modal popup component to play a video.
 * @param {object} props - The component props.
 * @param {object} props.video - The video object to play. Must contain `videoUrl`, `title`, etc.
 * @param {function} props.onClose - The function to call when the popup should be closed.
 */
const VideoPlayerPopup = ({ video, onClose }) => {
  // If there's no video object, don't render anything.
  if (!video) {
    return null;
  }

  return (
    // AnimatePresence allows the component to animate out when it's removed from the DOM.
    <AnimatePresence>
      {/* The semi-transparent background overlay */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
        onClick={onClose} // Close the popup when the user clicks on the background.
      >
        {/* The main popup container */}
        <motion.div
          key="popup"
          initial={{ scale: 0.8, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-gray-900 rounded-lg overflow-hidden w-full max-w-4xl shadow-2xl"
          // This stops the click from bubbling up to the background overlay,
          // preventing the popup from closing when the user clicks inside it.
          onClick={(e) => e.stopPropagation()}
        >
          {/* Video Player Area with a 16:9 aspect ratio */}
          <div className="relative bg-black" style={{ paddingBottom: '56.25%' }}>
            <video
              className="absolute top-0 left-0 w-full h-full"
              src={video.videoUrl}
              controls
              autoPlay
              // Most modern browsers require the video to be muted to autoplay programmatically.
              // Users can then unmute it manually.
              muted
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Information Section */}
          <div className="p-4 md:p-6">
            <h3 className="text-white text-xl md:text-2xl font-bold mb-2 truncate">
              {video.title}
            </h3>
            <div className="flex items-center text-sm text-gray-400">
              <p>by {video.uploader?.username || 'Unknown Creator'}</p>
              <span className="text-gray-600 mx-2">•</span>
              <p>{video.views} views</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoPlayerPopup;
