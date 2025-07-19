import React from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiLock, FiAward } from 'react-icons/fi';
import { Link } from 'react-router-dom'; // Import Link

const VideoCard = ({ video }) => {
  const { id, title, channel, views, thumbnail, isPremium } = video;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // If the video is premium, it's not a link.
  if (isPremium) {
    return (
      <motion.div variants={cardVariants} className="flex flex-col gap-3 group">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-white p-4">
            <FiLock size={40} className="text-amber-400" />
            <h3 className="font-bold text-lg text-center">Subscribe to watch</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors">
              <FiAward /> Go Premium
            </button>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <img src={channel.avatar} alt={channel.name} className="w-10 h-10 rounded-full shrink-0" />
          <div>
            <h3 className="font-semibold text-white leading-snug">
              <span className="text-amber-400">[Premium] </span>{title}
            </h3>
            <p className="text-sm text-gray-400">{channel.name}</p>
            <p className="text-sm text-gray-400">{views} views</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // If it's a regular video, wrap it in a Link and add the layoutId
  return (
    <Link to={`/video/${id}`} className="flex flex-col gap-3 cursor-pointer group">
      <motion.div variants={cardVariants}>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
          {/* THIS IS THE KEY ANIMATION ELEMENT */}
          <motion.img
            layoutId={`video-card-${id}`} // Unique layoutId for the animation
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-in-out"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FiPlay size={50} className="text-white" />
          </div>
        </div>
        <div className="flex gap-3 items-start mt-3">
          <img src={channel.avatar} alt={channel.name} className="w-10 h-10 rounded-full shrink-0" />
          <div>
            <h3 className="font-semibold text-white leading-snug">{title}</h3>
            <p className="text-sm text-gray-400">{channel.name}</p>
            <p className="text-sm text-gray-400">{views} views</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default VideoCard;