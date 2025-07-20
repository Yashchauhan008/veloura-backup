import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiVideo, FiLock, FiGift, FiRefreshCw, FiAlertCircle, FiCreditCard, FiX, FiCheck, FiDollarSign } from 'react-icons/fi';
import Sidebar from './FeedPage/Sidebar';
import VideoCard from './FeedPage/VideoCard';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const baseUrl = process.env.REACT_APP_BASE_URL;

// Mock data for subscribed channels
const subscribedChannels = [
    { id: 1, name: "CodeMasters", avatar: "https://i.pravatar.cc/40?u=4" },
    { id: 2, name: "DevPro", avatar: "https://i.pravatar.cc/40?u=1" },
    { id: 3, name: "AnimateCode", avatar: "https://i.pravatar.cc/40?u=2" },
    { id: 4, name: "Wanderlust", avatar: "https://i.pravatar.cc/40?u=7" },
];

const SubscriptionsPage = () => {
    const { user, login } = useAuth();
    const [premiumVideos, setPremiumVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [premiumLoading, setPremiumLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPremiumSuccess, setShowPremiumSuccess] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    // Check if user is premium
    const isUserPremium = user?.isPremium || user?.isPremiumUser;

    useEffect(() => {
        if (isUserPremium) {
            fetchPremiumVideos();
        }
    }, [isUserPremium]);

    const fetchPremiumVideos = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get(`${baseUrl}/api/video/getpremium-videos`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            if (response.status === 200 && response.data.success) {
                // Format videos to match VideoCard component requirements
                const formattedVideos = response.data.videos.map(video => ({
                    id: video._id,
                    title: video.title || 'Premium Video',
                    thumbnail: video.thumbnailUrl || 'https://via.placeholder.com/320x180/374151/9CA3AF?text=Premium+Video',
                    videoUrl: video.videoUrl,
                    channel: {
                        name: video.uploader?.username || 'Premium Creator',
                        avatar: `https://i.pravatar.cc/40?u=${video.uploader?.username || 'premium'}`
                    },
                    views: formatViews(video.views || 0),
                    duration: video.duration || '8:20',
                    uploadedAt: video.createdAt ? new Date(video.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
                    isPremium: true
                }));

                setPremiumVideos(formattedVideos);
            }
        } catch (error) {
            console.error('Error fetching premium videos:', error);
            setError('Failed to load premium videos');
        } finally {
            setLoading(false);
        }
    };

    const formatViews = (views) => {
        const numViews = Number(views) || 0;
        if (numViews >= 1000000) {
            return `${(numViews / 1000000).toFixed(1)}M`;
        } else if (numViews >= 1000) {
            return `${(numViews / 1000).toFixed(1)}K`;
        }
        return numViews.toString();
    };

    const handlePremiumUpgradeClick = () => {
        setShowConfirmationModal(true);
        setError(''); // Clear any previous errors
    };

    const handleConfirmUpgrade = async () => {
        if (!user?.id) {
            setError('User not found');
            return;
        }

        setPremiumLoading(true);
        setError('');

        try {
            const response = await axios.put(`${baseUrl}/api/user/update-premium/${user.id}`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000
            });

            if (response.status === 200) {
                // Update user data
                const updatedUser = {
                    ...user,
                    isPremiumUser: true,
                    isPremium: true
                };
                
                localStorage.setItem('user', JSON.stringify(updatedUser));
                const token = localStorage.getItem('token');
                login(token, updatedUser);

                setSuccess('🎉 Welcome to Premium! You now have access to exclusive content!');
                setShowPremiumSuccess(true);
                setShowConfirmationModal(false);

                // Fetch premium videos after upgrade
                setTimeout(() => {
                    fetchPremiumVideos();
                }, 1000);

                // Clear success message after 5 seconds
                setTimeout(() => {
                    setSuccess('');
                    setShowPremiumSuccess(false);
                }, 5000);
            }
        } catch (error) {
            console.error('Premium upgrade error:', error);
            
            if (error.response) {
                setError(error.response.data.message || 'Premium upgrade failed');
            } else if (error.request) {
                setError('Cannot connect to server. Please try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setPremiumLoading(false);
        }
    };

    const handleCancelUpgrade = () => {
        setShowConfirmationModal(false);
        setError('');
    };

    // Premium Confirmation Modal Component
    const PremiumConfirmationModal = () => (
        <AnimatePresence>
            {showConfirmationModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={handleCancelUpgrade}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-gray-800 rounded-3xl p-8 max-w-md w-full border border-gray-600/40 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                                    <FiStar className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Upgrade to Premium</h3>
                                    <p className="text-sm text-gray-400">Unlock exclusive content</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleCancelUpgrade}
                                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Pricing */}
                        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6 text-center">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <FiDollarSign className="text-yellow-400" size={32} />
                                <span className="text-4xl font-bold text-yellow-400">₹500</span>
                            </div>
                            <p className="text-gray-300 text-lg font-semibold mb-2">One-time Payment</p>
                            <p className="text-gray-400 text-sm">Lifetime access to premium content</p>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 mb-6">
                            <h4 className="text-lg font-semibold text-white mb-3">What you'll get:</h4>
                            {[
                                { icon: FiStar, text: "Exclusive premium videos" },
                                { icon: FiGift, text: "Ad-free experience" },
                                { icon: FiVideo, text: "High-quality content" },
                                { icon: FiCheck, text: "Lifetime access" }
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-3 text-gray-300"
                                >
                                    <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                        <feature.icon className="text-yellow-400" size={16} />
                                    </div>
                                    <span>{feature.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Payment Note */}
                        <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <FiCreditCard className="text-blue-400" size={20} />
                                <div>
                                    <p className="text-blue-300 font-medium text-sm">Secure Payment</p>
                                    <p className="text-gray-400 text-xs">Your payment information is protected</p>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-3 bg-red-500/10 border border-red-400/30 rounded-xl text-red-300 flex items-center gap-2"
                            >
                                <FiAlertCircle size={16} />
                                <span className="text-sm">{error}</span>
                            </motion.div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleConfirmUpgrade}
                                disabled={premiumLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                {premiumLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FiCreditCard size={18} />
                                        Pay ₹500 & Upgrade
                                    </>
                                )}
                            </motion.button>
                            
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCancelUpgrade}
                                disabled={premiumLoading}
                                className="px-6 py-4 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50"
                            >
                                Cancel
                            </motion.button>
                        </div>

                        {/* Terms */}
                        <p className="text-xs text-gray-500 mt-4 text-center">
                            By proceeding, you agree to our terms and conditions. This is a one-time payment for lifetime access.
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    const PremiumUpgradeCard = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-3xl p-8 text-center max-w-2xl mx-auto"
        >
            <motion.div
                animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.05, 1]
                }}
                transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                className="mb-6"
            >
                <FiLock size={64} className="text-yellow-400 mx-auto mb-4" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">Premium Content Awaits!</h2>
            <p className="text-gray-300 text-lg mb-6">
                Unlock exclusive premium videos with high-quality content from top creators.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center gap-3 text-gray-300">
                    <FiStar className="text-yellow-400" size={20} />
                    <span>Exclusive Content</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                    <FiGift className="text-yellow-400" size={20} />
                    <span>Premium Features</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                    <FiStar className="text-yellow-400" size={20} />
                    <span>Ad-Free Experience</span>
                </div>
            </div>

            {/* Price Display */}
            <div className="bg-gray-800/50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <FiDollarSign className="text-yellow-400" size={24} />
                    <span className="text-3xl font-bold text-yellow-400">₹500</span>
                </div>
                <p className="text-gray-400 text-sm">One-time payment • Lifetime access</p>
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePremiumUpgradeClick}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-lg rounded-2xl shadow-lg transition-all duration-300"
            >
                <FiStar className="inline-block mr-2" size={20} />
                Upgrade to Premium
            </motion.button>
        </motion.div>
    );

    const PremiumVideosSection = () => (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white">Premium Videos</h2>
                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                        <FiStar size={14} className="text-white" />
                        <span className="text-xs font-bold text-white">PREMIUM</span>
                    </div>
                </div>
                
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchPremiumVideos}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                    <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </motion.button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array(4).fill(0).map((_, index) => (
                        <div key={index} className="bg-gray-800/50 rounded-2xl p-4 animate-pulse">
                            <div className="w-full h-48 bg-gray-700/50 rounded-xl mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-6 bg-gray-700/50 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <FiAlertCircle className="mx-auto mb-4 text-red-400" size={48} />
                    <p className="text-red-400 text-lg mb-4">{error}</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchPremiumVideos}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        Try Again
                    </motion.button>
                </div>
            ) : premiumVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                    {premiumVideos.map(video => (
                        <div key={video.id} className="relative">
                            <VideoCard video={video} />
                            {/* Premium Badge */}
                            <div className="absolute top-2 left-2 z-10">
                                <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg">
                                    <FiStar size={12} className="text-white" />
                                    <span className="text-xs font-bold text-white">PREMIUM</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <FiVideo className="mx-auto mb-4 text-gray-500" size={48} />
                    <p className="text-gray-400 text-lg mb-2">No premium videos available</p>
                    <p className="text-gray-500">Check back later for exclusive content!</p>
                </div>
            )}
        </section>
    );

    return (
        <div className="flex min-h-screen bg-[#2D303A]">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Premium Confirmation Modal */}
                <PremiumConfirmationModal />

                {/* Premium Success Animation */}
                <AnimatePresence>
                    {showPremiumSuccess && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: -50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -50 }}
                                className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-3xl p-8 max-w-md w-full text-center"
                            >
                                <motion.div
                                    animate={{ 
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{ 
                                        duration: 0.5,
                                        repeat: 2
                                    }}
                                >
                                    <FiGift size={64} className="text-yellow-400 mx-auto mb-4" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-yellow-400 mb-2">Premium Activated!</h2>
                                <p className="text-gray-200 mb-4">Enjoy exclusive premium content!</p>
                                <div className="flex items-center justify-center gap-2 text-yellow-400">
                                    <FiStar size={16} />
                                    <span className="font-semibold">Welcome to Premium</span>
                                    <FiStar size={16} />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold text-white mb-8">
                        {isUserPremium ? 'Premium Subscriptions' : 'Subscriptions'}
                    </h1>

                    {/* Success Message */}
                    <AnimatePresence>
                        {success && !showPremiumSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mb-6 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl text-emerald-300"
                            >
                                {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

            

                    {/* Conditional Content Based on Premium Status */}
                    {isUserPremium ? (
                        <PremiumVideosSection />
                    ) : (
                        <PremiumUpgradeCard />
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default SubscriptionsPage;
