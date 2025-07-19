import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './FeedPage/Sidebar';
import VideoCard from './FeedPage/VideoCard';

// Mock data for the Subscriptions page
const subscribedChannels = [
    { id: 1, name: "CodeMasters", avatar: "https://i.pravatar.cc/40?u=4" },
    { id: 2, name: "DevPro", avatar: "https://i.pravatar.cc/40?u=1" },
    { id: 3, name: "AnimateCode", avatar: "https://i.pravatar.cc/40?u=2" },
    { id: 4, name: "Wanderlust", avatar: "https://i.pravatar.cc/40?u=7" },
];

const subscriptionVideos = [
    { id: 14, title: "React Hooks Explained in 15 Minutes", channel: { name: "CodeMasters", avatar: "https://i.pravatar.cc/40?u=4" }, views: "12K", thumbnail: "https://i.ytimg.com/vi/TNhaISOUy6Q/maxresdefault.jpg" },
    { id: 15, title: "My New Desk Setup for 2025", channel: { name: "DevPro", avatar: "https://i.pravatar.cc/40?u=1" }, views: "5K", thumbnail: "https://i.ytimg.com/vi/R-XU_2-443s/maxresdefault.jpg" },
    { id: 16, title: "Animating SVGs with Framer Motion", channel: { name: "AnimateCode", avatar: "https://i.pravatar.cc/40?u=2" }, views: "8K", thumbnail: "https://i.ytimg.com/vi/4I1tGgKa_ss/maxresdefault.jpg" },
];

const SubscriptionsPage = ( ) => {
    return (
        <div className="flex min-h-screen bg-[#2D303A]">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-3xl font-bold text-white mb-8">Subscriptions</h1>

                    {/* Subscribed Channels List */}
                    <section className="mb-12">
                        <h2 className="text-xl font-bold text-white mb-4">Your Channels</h2>
                        <div className="flex gap-6 overflow-x-auto pb-4">
                            {subscribedChannels.map(channel => (
                                <div key={channel.id} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
                                    <img src={channel.avatar} alt={channel.name} className="w-20 h-20 rounded-full border-2 border-transparent group-hover:border-red-500 transition-all" />
                                    <p className="text-sm font-semibold text-white">{channel.name}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Latest Videos Feed */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">Latest Videos</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                            {subscriptionVideos.map(video => <VideoCard key={video.id} video={video} />)}
                        </div>
                    </section>
                </motion.div>
            </main>
        </div>
    );
};

export default SubscriptionsPage;
