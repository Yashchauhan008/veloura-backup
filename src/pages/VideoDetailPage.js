import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlay, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext'; // ✅ 1. Import auth context to get user ID
import VideoPlayerPopup from '../components/VideoPlayerPopup'; // ✅ 2. Import the player popup

const baseUrl = process.env.REACT_APP_BASE_URL;

// --- MOCK DATA is no longer needed ---

const VideoDetailPage = () => {
  const { id: videoId } = useParams(); // ✅ 3. Rename 'id' to 'videoId' for clarity
  const { user } = useAuth(); // Get the logged-in user
  const userId = user?._id || user?.id;

  // ✅ 4. Add state for loading and video data
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false); // State to control the video player popup

  // ✅ 5. Fetch video data when the component mounts or videoId changes
  useEffect(() => {
    const fetchVideoData = async () => {
      if (!videoId) return;
      setIsLoading(true);
      setError(null);
      try {
        // Construct the URL with userId as a query parameter to update history
        const url = `${baseUrl}/api/video/getVideoByID/${videoId}?userId=${userId || ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Video not found or server error.');
        }
        const data = await response.json();
        setVideo(data.video); // The API returns { video: { ... } }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoData();
  }, [videoId, userId]); // Re-fetch if the videoId or userId changes

  // ✅ 6. Handle loading and error states
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center h-screen text-white">Video not found.</div>;
  }

  // ✅ 7. The "Play" button now opens the popup
  const handlePlayClick = () => {
    setShowPlayer(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-white"
      >
        {/* --- HERO SECTION --- */}
        <div className="relative w-full h-[60vh] lg:h-[70vh]">
          <motion.div
            // The layoutId should be unique to the video
            layoutId={`video-card-${videoId}`}
            className="absolute inset-0"
          >
            {/* ✅ 8. Use real data from the API */}
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </motion.div>

          <div className="relative z-10 flex flex-col justify-end h-full p-4 md:p-8 lg:p-12">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white shadow-2xl">
                  {video.title}
                </h1>
                <div className="flex items-center gap-4 mt-4 text-gray-300">
                  {/* Format date nicely if you have it, otherwise show views */}
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{video.uploader?.username || 'Unknown Creator'}</span>
                </div>
                <p className="mt-4 text-lg text-gray-200 leading-relaxed">
                  {video.description}
                </p>
              </div>
              <div className="flex items-center gap-4 mt-8">
                <button
                  onClick={handlePlayClick}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-lg text-lg hover:bg-gray-200 transition-colors"
                >
                  <FiPlay />
                  Play
                </button>
                {/* <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700/50 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                  <FiPlus />
                  My List
                </button> */}
              </div>
            </motion.div>
          </div>
        </div>

        {/* --- CONTENT BELOW THE FOLD --- */}
        <div className="p-4 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Comments</h2>
              <p className="text-gray-400">Comment section coming soon.</p>
            </div>
            <div className="lg:col-span-1">
              <div className="space-y-2 text-gray-300">
                <p><span className="font-semibold text-gray-500">Views:</span> {video.views}</p>
                <p><span className="font-semibold text-gray-500">Tags:</span> {video.tags.join(', ')}</p>
              </div>
            </div>
          </div>
          {/* You can later fetch recommended videos for the "Up Next" section */}
        </div>
      </motion.div>

      {/* ✅ 9. Conditionally render the VideoPlayerPopup */}
      {showPlayer && (
        <VideoPlayerPopup video={video} onClose={() => setShowPlayer(false)} />
      )}
    </>
  );
};

export default VideoDetailPage;
