import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VideoCard from './VideoCard';
import SkeletonCard from './SkeletonCard';
import { useAuth } from '../../context/AuthContext';

const baseUrl = process.env.REACT_APP_BASE_URL;

const FeedPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [feedVideos, setFeedVideos] = useState([]);
  const [historyVideos, setHistoryVideos] = useState([]);
  const { user } = useAuth();
  
  // Use optional chaining to safely access the user ID
  const userId = user?._id || user?.id;

  useEffect(() => {
    // --- DEBUG STEP 1: Log the userId to ensure it's available ---
    // console.log("FeedPage Effect Triggered. User ID:", userId);

    if (!userId) {
      console.warn("User ID is not available. Halting API fetch.");
      setIsLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const historyUrl = `${baseUrl}/api/user/getUserhistory?userId=${userId}`;
        const feedUrl = `${baseUrl}/api/video/personalizedFeed?userId=${userId}`;

        // --- DEBUG STEP 2: Log the URLs being requested ---
        // console.log("Requesting History from:", historyUrl);
        // console.log("Requesting Feed from:", feedUrl);

        const [historyResponse, feedResponse] = await Promise.all([
          fetch(historyUrl),
          fetch(feedUrl)
        ]);

        // --- DEBUG STEP 3: Log the raw server responses ---
        // We clone the response to read it as text without consuming the body,
        // which is needed for the later .json() call.
        const historyResponseText = await historyResponse.clone().text();
        const feedResponseText = await feedResponse.clone().text();
        // console.log("RAW History Response Text:", historyResponseText);
        // console.log("RAW Feed Response Text:", feedResponseText);

        if (!historyResponse.ok) throw new Error(`History fetch failed with status ${historyResponse.status}: ${historyResponseText}`);
        if (!feedResponse.ok) throw new Error(`Feed fetch failed with status ${feedResponse.status}: ${feedResponseText}`);

        const historyData = await historyResponse.json();
        const feedData = await feedResponse.json();

        // --- DEBUG STEP 4: Log the parsed JSON data ---
        // console.log("PARSED History JSON:", historyData);
        // console.log("PARSED Feed JSON:", feedData);

        // Process History videos
        const formattedHistory = historyData.history.map(video => ({
          id: video._id,
          title: video.title,
          thumbnail: video.thumbnailUrl,
          videoUrl: video.videoUrl,
          channel: {
            name: video.uploader?.username || 'Unknown',
            avatar: `https://i.pravatar.cc/40?u=${video.uploader?.username || video._id}`
          },
          views: `${(video.views / 1000 ).toFixed(1)}K`
        }));
        setHistoryVideos(formattedHistory);

        // Process Personalized Feed videos
        const formattedFeed = feedData.videos.map(video => ({
          id: video._id,
          title: video.title,
          thumbnail: video.thumbnailUrl,
          videoUrl: video.videoUrl,
          channel: {
            name: video.uploader?.username || 'Unknown',
            avatar: `https://i.pravatar.cc/40?u=${video.uploader?.username || video._id}`
          },
          views: `${(video.views / 1000 ).toFixed(1)}K`
        }));
        setFeedVideos(formattedFeed);

        // --- DEBUG STEP 5: Log the final formatted data ---
        // console.log("FINAL Formatted History for State:", formattedHistory);
        // console.log("FINAL Formatted Feed for State:", formattedFeed);

      } catch (error) {
        // --- DEBUG STEP 6: Log any errors that occur during the process ---
        console.error("An error occurred in fetchAllData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [userId]);

  // ... The rest of your return statement remains the same ...
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Continue Watching</h2>
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-8 lg:px-8">
          {isLoading
            ? Array(3).fill(0).map((_, index) => <div key={index} className="w-80 shrink-0"><SkeletonCard /></div>)
            : historyVideos.length > 0
              ? historyVideos.map(video => <div key={video.id} className="w-80 shrink-0"><VideoCard video={video} /></div>)
              : !isLoading && <p className="text-gray-400">Your watch history is empty.</p>
          }
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
            : feedVideos.length > 0
              ? feedVideos.map(video => <div key={video.id} className="w-80 shrink-0"><VideoCard video={video} /></div>)
              : !isLoading && <p className="text-gray-400">No recommendations available right now.</p>
          }
        </motion.div>
      </section>
    </motion.div>
  );
};

export default FeedPage;
