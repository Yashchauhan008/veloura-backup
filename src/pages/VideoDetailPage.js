import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlay, FiPlus, FiMessageSquare, FiThumbsUp } from 'react-icons/fi';

// --- MOCK DATA (No changes needed here) ---
const mockVideoData = {
  id: 3,
  title: "The Future of AI: A Deep Dive",
  channel: { name: "TechVision", avatar: "https://i.pravatar.cc/40?u=3" },
  views: "3.1M",
  uploadDate: "2 weeks ago",
  description: "From large language models to autonomous systems, we cover it all in this feature-length documentary on the state of artificial intelligence.",
  thumbnail: "https://i.ytimg.com/vi/Sqa80msoJcg/maxresdefault.jpg",
  tags: ["AI", "Technology", "Documentary"],
};
const mockUpNext = [
    { id: 4, title: "Advanced React Patterns", channel: { name: "CodeMasters" }, thumbnail: "https://i.ytimg.com/vi/t2ypzz6gJm0/maxresdefault.jpg" },
    { id: 10, title: "The Rise of Quantum Computing", channel: { name: "FutureTech" }, thumbnail: "https://i.ytimg.com/vi/a_i2g_b27yE/maxresdefault.jpg" },
];
const mockComments = [
    { user: "Alex", avatar: "https://i.pravatar.cc/40?u=15", text: "Incredible production quality!" },
    { user: "Maria", avatar: "https://i.pravatar.cc/40?u=16", text: "The ethics section was so important." },
];
// --- END MOCK DATA ---

const VideoDetailPage = ( ) => {
  const { id } = useParams();
  const video = mockVideoData;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-white"
    >
      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-[60vh] lg:h-[70vh]">
        {/* The expanding thumbnail - This is the key animated element */}
        <motion.div
          layoutId={`video-card-${id}`}
          className="absolute inset-0"
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </motion.div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-end h-full p-4 md:p-8 lg:p-12">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white shadow-2xl">
                {video.title}
              </h1>
              <div className="flex items-center gap-4 mt-4 text-gray-300">
                <span>{video.uploadDate}</span>
                <span>•</span>
                <span>{video.channel.name}</span>
              </div>
              <p className="mt-4 text-lg text-gray-200 leading-relaxed">
                {video.description}
              </p>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-4 mt-8">
              <button className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-lg text-lg hover:bg-gray-200 transition-colors">
                <FiPlay />
                Play
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700/50 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                <FiPlus />
                My List
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- CONTENT BELOW THE FOLD --- */}
      <div className="p-4 md:p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Comments and Details */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Comments ({mockComments.length})</h2>
            <div className="space-y-6">
              {mockComments.map((comment, index) => (
                <div key={index} className="flex items-start gap-4">
                  <img src={comment.avatar} className="w-12 h-12 rounded-full" alt={comment.user} />
                  <div>
                    <p className="font-semibold text-white">{comment.user}</p>
                    <p className="text-gray-300">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: More Details */}
          <div className="lg:col-span-1">
            <div className="space-y-2 text-gray-300">
              <p><span className="font-semibold text-gray-500">Views:</span> {video.views}</p>
              <p><span className="font-semibold text-gray-500">Tags:</span> {video.tags.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Up Next Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-4">Up Next</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockUpNext.map(nextVideo => (
              // We reuse the original VideoCard component here for consistency
              <Link to={`/video/${nextVideo.id}`} key={nextVideo.id}>
                <div className="bg-gray-800 rounded-lg overflow-hidden group">
                  <img src={nextVideo.thumbnail} className="w-full aspect-video object-cover group-hover:opacity-80 transition-opacity" alt={nextVideo.title} />
                  <div className="p-3">
                    <h3 className="font-semibold text-white truncate">{nextVideo.title}</h3>
                    <p className="text-sm text-gray-400">{nextVideo.channel.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoDetailPage;
