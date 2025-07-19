import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VideoCard from './VideoCard';
import SkeletonCard from './SkeletonCard';

// Mock data remains the same...
const mockContinueWatching = [
    { id: 1, title: "Building a UI with Tailwind CSS", channel: { name: "DevPro", avatar: "https://i.pravatar.cc/40?u=1" }, views: "1.2M", thumbnail: "https://i.ytimg.com/vi/CL_1p9-Yv_0/maxresdefault.jpg" },
    { id: 2, title: "Framer Motion for Beginners", channel: { name: "AnimateCode", avatar: "https://i.pravatar.cc/40?u=2" }, views: "800K", thumbnail: "https://i.ytimg.com/vi/2V1e6sWIt_o/maxresdefault.jpg" },
];
const mockFeedVideos = [
    { id: 3, title: "The Future of AI", channel: { name: "TechVision", avatar: "https://i.pravatar.cc/40?u=3" }, views: "3M", thumbnail: "https://i.ytimg.com/vi/Sqa80msoJcg/maxresdefault.jpg" },
    { id: 4, title: "Advanced React Patterns", channel: { name: "CodeMasters", avatar: "https://i.pravatar.cc/40?u=4" }, views: "500K", thumbnail: "https://i.ytimg.com/vi/t2ypzz6gJm0/maxresdefault.jpg" },
    { id: 5, title: "Full Stack Node.js Course", channel: { name: "BackendPro", avatar: "https://i.pravatar.cc/40?u=5" }, views: "2.1M", thumbnail: "https://i.ytimg.com/vi/Oe421EPjeBE/maxresdefault.jpg", isPremium: true },
    { id: 6, title: "Cooking the Perfect Steak", channel: { name: "ChefLife", avatar: "https://i.pravatar.cc/40?u=6" }, views: "5.5M", thumbnail: "https://i.ytimg.com/vi/uJcO1W_TD74/maxresdefault.jpg" },
    { id: 7, title: "Travel Guide: Japan", channel: { name: "Wanderlust", avatar: "https://i.pravatar.cc/40?u=7" }, views: "1.8M", thumbnail: "https://i.ytimg.com/vi/V_2t_1DA_5c/maxresdefault.jpg" },
    { id: 8, title: "Mastering System Design", channel: { name: "CodeMasters", avatar: "https://i.pravatar.cc/40?u=4" }, views: "950K", thumbnail: "https://i.ytimg.com/vi/bU_q_I_2_dM/maxresdefault.jpg", isPremium: true },
];

const FeedPage = ( ) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  // Notice: No <Sidebar> or main layout tags. Just the page content!
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Continue Watching</h2>
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-8 lg:px-8">
          {isLoading
            ? Array(3).fill(0).map((_, index) => <div key={index} className="w-80 shrink-0"><SkeletonCard /></div>)
            : mockContinueWatching.map(video => <div key={video.id} className="w-80 shrink-0"><VideoCard video={video} /></div>)}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">For You</h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={!isLoading ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-6 gap-y-10"
        >
          {isLoading
            ? Array(8).fill(0).map((_, index) => <SkeletonCard key={index} />)
            : mockFeedVideos.map(video => <VideoCard key={video.id} video={video} />)}
        </motion.div>
      </section>
    </motion.div>
  );
};

export default FeedPage;
