import React from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiTrendingUp, FiMusic, FiFilm, FiCpu } from 'react-icons/fi';
import Sidebar from './FeedPage/Sidebar'; // Assuming Sidebar is in FeedPage folder
import VideoCard from './FeedPage/VideoCard'; // Reusing the VideoCard component
import SkeletonCard from './FeedPage/SkeletonCard'; // Reusing the SkeletonCard

// Mock data for the Explore page
const exploreVideos = [
    { id: 10, title: "The Rise of Quantum Computing", channel: { name: "FutureTech", avatar: "https://i.pravatar.cc/40?u=10" }, views: "4.1M", thumbnail: "https://i.ytimg.com/vi/a_i2g_b27yE/maxresdefault.jpg" },
    { id: 11, title: "Lofi Beats to Relax/Study to", channel: { name: "ChillHop", avatar: "https://i.pravatar.cc/40?u=11" }, views: "102M", thumbnail: "https://i.ytimg.com/vi/5qap5aO4i9A/maxresdefault.jpg" },
    { id: 12, title: "Behind the Scenes of a Hollywood Blockbuster", channel: { name: "Cinephile", avatar: "https://i.pravatar.cc/40?u=12" }, views: "8.9M", thumbnail: "https://i.ytimg.com/vi/d1_JBMrrYw8/maxresdefault.jpg" },
    { id: 13, title: "Is This the Best Gaming Laptop of 2025?", channel: { name: "GamerNexus", avatar: "https://i.pravatar.cc/40?u=13" }, views: "2.3M", thumbnail: "https://i.ytimg.com/vi/B-a9i2_1w5k/maxresdefault.jpg" },
];

const CategoryTag = ({ icon, text } ) => (
    <button className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-full text-white hover:bg-gray-600 transition-colors">
        {icon}
        <span className="font-semibold">{text}</span>
    </button>
);

const ExplorePage = () => {
    // In a real app, you'd manage sidebar state here as well
    return (
        <div className="flex min-h-screen bg-[#2D303A]">
            <Sidebar /> {/* This should be the same shared sidebar component */}
            <main className="flex-1 p-8 overflow-y-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {/* Header and Search */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-4">Explore</h1>
                        <div className="relative max-w-lg">
                            <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for videos, creators, or topics..."
                                className="w-full py-3 pl-12 pr-4 bg-[#1F222A] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                    </div>

                    {/* Trending Categories */}
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-white mb-4">Trending Categories</h2>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            <CategoryTag icon={<FiTrendingUp />} text="Trending" />
                            <CategoryTag icon={<FiMusic />} text="Music" />
                            <CategoryTag icon={<FiFilm />} text="Movies" />
                            <CategoryTag icon={<FiCpu />} text="Technology" />
                        </div>
                    </div>

                    {/* Video Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                        {exploreVideos.map(video => <VideoCard key={video.id} video={video} />)}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default ExplorePage;