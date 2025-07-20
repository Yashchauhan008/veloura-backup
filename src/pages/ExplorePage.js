import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiTrendingUp, FiMusic, FiFilm, FiCpu, FiVideo, FiGrid, FiList, FiRefreshCw } from 'react-icons/fi';
import Sidebar from './FeedPage/Sidebar';
import VideoCard from './FeedPage/VideoCard';
import SkeletonCard from './FeedPage/SkeletonCard';
import { useAuth } from '../context/AuthContext';

const baseUrl = process.env.REACT_APP_BASE_URL;

const CategoryTag = ({ icon, text, isActive, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
            isActive 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'bg-gray-800/40 backdrop-blur-md border border-gray-600/40 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
        }`}
    >
        {icon}
        <span>{text}</span>
    </motion.button>
);

const ExplorePage = () => {
    const [allVideos, setAllVideos] = useState([]);
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const userId = user?._id || user?.id;

    const categories = [
        { id: 'all', label: 'All Videos', icon: <FiVideo size={16} /> },
        { id: 'trending', label: 'Trending', icon: <FiTrendingUp size={16} /> },
        { id: 'music', label: 'Music', icon: <FiMusic size={16} /> },
        { id: 'movies', label: 'Movies', icon: <FiFilm size={16} /> },
        { id: 'technology', label: 'Technology', icon: <FiCpu size={16} /> },
    ];

    useEffect(() => {
        fetchAllVideos();
    }, []);

    useEffect(() => {
        filterVideos();
    }, [searchTerm, activeCategory, allVideos]);

    // ✅ Use the same fetch approach as FeedPage
    const fetchAllVideos = async () => {
        setIsLoading(true);
        setError('');
        
        try {
            console.log('🚀 Fetching public videos...');
            
            const response = await fetch(`${baseUrl}/api/video/public-videos`);
            const data = await response.json();
            
            console.log('📦 Public videos response:', data);
            
            if (response.ok && data.success && data.publicVideos) {
                const formattedVideos = processAllVideos(data.publicVideos);
                setAllVideos(formattedVideos);
                console.log('✅ Successfully loaded videos:', formattedVideos.length);
            } else {
                console.error('❌ API Error:', data);
                setError(data.message || "No videos available at the moment");
            }
            
        } catch (error) {
            console.error("❌ Error fetching public feed:", error);
            setError("Failed to load videos - please try again later");
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Use the exact same processAllVideos function from FeedPage
    const processAllVideos = (videosArray) => {
        return videosArray.map((video, index) => {
            console.log(`Processing video ${index}:`, video);
            
            const videoId = video._id || video.videoId || video.id;
            
            if (!videoId) {
                console.warn(`Video ${index} has no valid ID:`, video);
                return null;
            }

            // ✅ Handle both data formats properly (same as FeedPage)
            let channelName = 'Unknown Creator';
            let viewCount = 0;

            // Check for uploaderUsername (from public-videos endpoint)
            if (video.uploaderUsername) {
                channelName = video.uploaderUsername;
            }
            // Check for uploader.username (from other endpoints)
            else if (video.uploader?.username) {
                channelName = video.uploader.username;
            }

            // Check for viewsCount (from public-videos endpoint)
            if (video.viewsCount !== undefined) {
                viewCount = video.viewsCount;
            }
            // Check for views (from other endpoints)
            else if (video.views !== undefined) {
                viewCount = video.views;
            }

            const formattedVideo = {
                id: videoId.toString(),
                title: video.title || 'Untitled Video',
                thumbnail: video.thumbnailUrl || 'https://via.placeholder.com/320x180/374151/9CA3AF?text=Video+Thumbnail',
                videoUrl: video.videoUrl,
                channel: {
                    name: channelName,
                    id: video.uploaderId || video.uploader?._id,
                    avatar: `https://i.pravatar.cc/40?u=${channelName || `user-${index}`}`
                },
                views: formatViews(viewCount),
                rawViews: viewCount, // Keep for trending sort
                duration: '8:20',
                uploadedAt: video.createdAt ? new Date(video.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
                tags: video.tags || [],
                description: video.description || '',
                category: determineCategory(video.title, video.description, video.tags),
                _originalData: video
            };

            console.log(`Formatted video ${index}:`, { 
                id: formattedVideo.id, 
                title: formattedVideo.title,
                channelName: formattedVideo.channel.name,
                views: formattedVideo.views,
                originalViews: viewCount,
                hasValidId: !!formattedVideo.id 
            });
            
            return formattedVideo;
        }).filter(video => video !== null);
    };

    // ✅ Use the same formatViews function from FeedPage
    const formatViews = (views) => {
        const numViews = Number(views) || 0;
        if (numViews >= 1000000) {
            return `${(numViews / 1000000).toFixed(1)}M`;
        } else if (numViews >= 1000) {
            return `${(numViews / 1000).toFixed(1)}K`;
        }
        return numViews.toString();
    };

    // Determine video category based on content
    const determineCategory = (title, description, tags) => {
        const content = `${title} ${description} ${tags.join(' ')}`.toLowerCase();
        
        if (content.includes('music') || content.includes('song') || content.includes('audio') || content.includes('beat')) {
            return 'music';
        }
        if (content.includes('movie') || content.includes('film') || content.includes('cinema') || content.includes('trailer')) {
            return 'movies';
        }
        if (content.includes('tech') || content.includes('computer') || content.includes('software') || content.includes('programming')) {
            return 'technology';
        }
        return 'general';
    };

    // Filter videos based on search and category
    const filterVideos = () => {
        let filtered = [...allVideos];
        
        // Apply search filter
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(video => 
                video.title.toLowerCase().includes(search) ||
                video.channel.name.toLowerCase().includes(search) ||
                video.description.toLowerCase().includes(search) ||
                video.tags.some(tag => tag.toLowerCase().includes(search))
            );
        }
        
        // Apply category filter
        if (activeCategory !== 'all') {
            if (activeCategory === 'trending') {
                // Sort by views for trending (highest first)
                filtered = filtered
                    .sort((a, b) => b.rawViews - a.rawViews)
                    .slice(0, 20); // Show top 20 most viewed
            } else {
                filtered = filtered.filter(video => video.category === activeCategory);
            }
        }
        
        setFilteredVideos(filtered);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryChange = (categoryId) => {
        setActiveCategory(categoryId);
        setSearchTerm(''); // Clear search when changing category
    };

    const handleRefresh = () => {
        fetchAllVideos();
    };

    // ✅ Use the same grid classes function from FeedPage
    const getGridClasses = () => {
        if (viewMode === 'list') {
            return 'grid-cols-1 max-w-4xl';
        }
        
        // Use 3-column layout for explore page (similar to FeedPage "All Videos")
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="flex min-h-screen bg-[#2D303A]">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="min-h-screen bg-[#2D303A] text-gray-100 relative overflow-hidden">
                    
                    {/* Animated Background Elements - Same as FeedPage */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full bg-gradient-to-r from-gray-800/5 to-gray-700/5 backdrop-blur-sm"
                                style={{
                                    width: Math.random() * 200 + 100,
                                    height: Math.random() * 200 + 100,
                                    top: Math.random() * 100 + '%',
                                    left: Math.random() * 100 + '%',
                                }}
                                animate={{
                                    x: [0, 50, 0],
                                    y: [0, -50, 0],
                                    rotate: [0, 180, 360],
                                }}
                                transition={{
                                    duration: Math.random() * 30 + 20,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 container mx-auto px-6 py-8">
                        
                        {/* Header Section - Similar to FeedPage */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="mb-8"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                
                                {/* Title */}
                                <div>
                                    <h1 className="text-5xl font-bold bg-white bg-clip-text text-transparent mb-2">
                                        Explore Videos
                                    </h1>
                                    <p className="text-gray-400">Search and discover amazing content</p>
                                    {error && (
                                        <p className="text-red-400 text-sm mt-2">⚠️ {error}</p>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="flex flex-wrap items-center gap-4">
                                    
                                    {/* Refresh Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleRefresh}
                                        className="p-2 bg-gray-800/40 backdrop-blur-md rounded-xl border border-gray-600/40 text-gray-400 hover:text-emerald-400 transition-colors"
                                    >
                                        <FiRefreshCw size={18} />
                                    </motion.button>

                                    {/* View Mode Toggle */}
                                    <div className="flex items-center bg-gray-800/40 backdrop-blur-md rounded-xl border border-gray-600/40 p-1">
                                        {[
                                            { mode: 'grid', icon: FiGrid },
                                            { mode: 'list', icon: FiList }
                                        ].map((mode) => (
                                            <button
                                                key={mode.mode}
                                                onClick={() => setViewMode(mode.mode)}
                                                className={`p-2 rounded-lg transition-all duration-300 ${
                                                    viewMode === mode.mode
                                                        ? 'bg-cyan-500 text-white'
                                                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                                                }`}
                                            >
                                                <mode.icon size={18} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="mt-6 relative max-w-2xl">
                                <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    placeholder="Search for videos, creators, or topics..."
                                    className="w-full py-4 pl-12 pr-12 bg-gray-800/50 backdrop-blur-xl border border-gray-600/50 rounded-xl text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </motion.div>

                        {/* Categories Section */}
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-gray-100 mb-4">Categories</h2>
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                                {categories.map(category => (
                                    <CategoryTag
                                        key={category.id}
                                        icon={category.icon}
                                        text={category.label}
                                        isActive={activeCategory === category.id}
                                        onClick={() => handleCategoryChange(category.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Results Info */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full"></div>
                                <h2 className="text-2xl font-bold text-gray-100">
                                    {searchTerm ? `Search Results for "${searchTerm}"` : 
                                     activeCategory === 'trending' ? 'Trending Videos' :
                                     activeCategory === 'all' ? 'All Videos' : 
                                     `${categories.find(c => c.id === activeCategory)?.label || 'Videos'}`}
                                </h2>
                                <div className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded-full text-xs text-gray-400">
                                    <span>{filteredVideos.length}</span>
                                    <span>videos</span>
                                </div>
                                {activeCategory === 'trending' && (
                                    <div className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full hidden lg:block">
                                        Sorted by views
                                    </div>
                                )}
                            </div>

                            {/* Video Grid - Same layout as FeedPage */}
                            {isLoading ? (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className={`grid gap-6 ${getGridClasses()}`}
                                >
                                    {Array(6).fill(0).map((_, index) => (
                                        <SkeletonCard key={index} />
                                    ))}
                                </motion.div>
                            ) : filteredVideos.length > 0 ? (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className={`grid gap-6 ${getGridClasses()}`}
                                >
                                    {filteredVideos.map((video, index) => (
                                        <motion.div
                                            key={video.id}
                                            variants={itemVariants}
                                            transition={{ delay: index * 0.05 }}
                                            className={viewMode === 'list' ? 'w-full' : 'max-w-none'}
                                        >
                                            <VideoCard 
                                                video={video} 
                                                viewMode={viewMode}
                                                showStats
                                            />
                                            {/* Show trending rank for trending category */}
                                            {activeCategory === 'trending' && (
                                                <div className="mt-2 text-center">
                                                    <span className="inline-flex items-center px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                                                        #{index + 1} Trending
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-20 text-center"
                                >
                                    <div className="w-20 h-20 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center mb-6">
                                        <FiVideo className="text-3xl text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                                        {searchTerm ? 'No videos found' : 'No videos in this category'}
                                    </h3>
                                    <p className="text-gray-500 max-w-md">
                                        {searchTerm 
                                            ? "Try adjusting your search terms or browse different categories."
                                            : "This category doesn't have any videos yet. Try exploring other categories."
                                        }
                                    </p>
                                    {searchTerm && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSearchTerm('')}
                                            className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                                        >
                                            Clear Search
                                        </motion.button>
                                    )}
                                </motion.div>
                            )}
                        </motion.section>

                        {/* Stats Bar - Same as FeedPage */}
                        {!isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
                            >
                                {[
                                    { label: 'Total Videos', value: allVideos.length, color: 'text-emerald-400' },
                                    { label: 'Filtered Results', value: filteredVideos.length, color: 'text-cyan-400' },
                                    { label: 'Active Category', value: categories.find(c => c.id === activeCategory)?.label || 'All', color: 'text-blue-400' },
                                    { label: 'Search Term', value: searchTerm || 'None', color: 'text-purple-400' }
                                ].map((stat, index) => (
                                    <div key={index} className="p-4 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-600/40 text-center">
                                        <div className={`text-2xl font-bold ${stat.color}`}>
                                            {typeof stat.value === 'string' ? stat.value : stat.value}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ExplorePage;
