import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiType, FiFileText, FiTag, FiEye, FiVideo, FiImage, FiUploadCloud, FiAlertCircle, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const baseUrl = process.env.REACT_APP_BASE_URL;

const UploadPage = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    accessLevel: 'public',
  });

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'videoFile') setVideoFile(files[0]);
    else if (name === 'thumbnailFile') setThumbnailFile(files[0]);
    // Clear messages when user selects files
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      return setError('You must be logged in to upload a video.');
    }
    
    const uploaderId = user._id || user.id;

    if (!uploaderId) {
      return setError('Could not find user ID. Please try logging in again.');
    }

    // Enhanced validation
    if (!formData.title.trim()) return setError('Title is required.');
    if (formData.title.length < 3) return setError('Title must be at least 3 characters long.');
    if (!videoFile) return setError('A video file is required.');
    if (!thumbnailFile) return setError('A thumbnail image is required.');

    // File size validation (optional)
    if (videoFile.size > 100 * 1024 * 1024) { // 100MB limit
      return setError('Video file must be smaller than 100MB.');
    }
    
    if (thumbnailFile.size > 5 * 1024 * 1024) { // 5MB limit
      return setError('Thumbnail file must be smaller than 5MB.');
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('tags', formData.tags.trim());
    data.append('accessLevel', formData.accessLevel);
    data.append('uploader', uploaderId);
    data.append('video', videoFile);
    data.append('thumbnail', thumbnailFile);

    try {
      const response = await axios.post(`${baseUrl}/api/video/upload-video`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
        timeout: 300000, // 5 minute timeout for large uploads
      });

      if (response.status === 201) {
        setSuccess('Video uploaded successfully!');
        // Reset form
        setFormData({ title: '', description: '', tags: '', accessLevel: 'public' });
        setVideoFile(null);
        setThumbnailFile(null);
        setUploadProgress(0);
        // Reset file inputs
        document.getElementById('videoFile').value = '';
        document.getElementById('thumbnailFile').value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      const message = err.response?.data?.message || 'An error occurred during upload.';
      setError(message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2D303A] text-gray-100 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-gray-800/10 to-gray-700/10 backdrop-blur-sm border border-slate-600/20"
            style={{
              width: Math.random() * 100 + 60,
              height: Math.random() * 100 + 60,
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Back Button */}
      <Link to="/dashboard" className="absolute top-6 left-6 z-20">
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-700/80 hover:border-gray-500/60 transition-all duration-300"
        >
          <FiArrowLeft size={16} />
          <span className="text-sm">Back to Dashboard</span>
        </motion.button>
      </Link>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg mb-4"
            >
              <FiUploadCloud className="text-gray-100 text-2xl" />
            </motion.div>
            
            <h1 className="text-4xl font-bold bg-white bg-clip-text text-transparent mb-2">
              Upload Video
            </h1>
            <p className="text-gray-400">Share your content with the world</p>
          </div>

          {/* Upload Form */}
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-gray-600/40 overflow-hidden shadow-2xl">
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              {/* Status Messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-400/30 rounded-xl text-red-300"
                >
                  <FiAlertCircle className="flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl text-emerald-300"
                >
                  <FiCheckCircle className="flex-shrink-0" />
                  <span className="text-sm">{success}</span>
                </motion.div>
              )}

              {/* Title Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video Title *
                </label>
                <div className="relative">
                  <FiType className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter your video title"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={uploading}
                    className="w-full py-4 pl-12 pr-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300 disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <div className="relative">
                  <FiFileText className="absolute top-4 left-4 text-gray-400" size={18} />
                  <textarea
                    name="description"
                    placeholder="Describe your video content..."
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={uploading}
                    rows={4}
                    className="w-full py-4 pl-12 pr-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300 resize-none disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Tags and Access Level Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tags Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="relative">
                    <FiTag className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="tags"
                      placeholder="gaming, tutorial, vlog (comma-separated)"
                      value={formData.tags}
                      onChange={handleInputChange}
                      disabled={uploading}
                      className="w-full py-4 pl-12 pr-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Access Level Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Privacy
                  </label>
                  <div className="relative">
                    <FiEye className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      name="accessLevel"
                      value={formData.accessLevel}
                      onChange={handleInputChange}
                      disabled={uploading}
                      className="w-full py-4 pl-12 pr-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300 appearance-none disabled:opacity-50"
                    >
                      <option value="public" className="bg-gray-800">Public</option>
                      <option value="private" className="bg-gray-800">Private</option>
                       <option value="premium" className="bg-gray-800">premium</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Video File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Video File *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="videoFile"
                      name="videoFile"
                      accept="video/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                      required
                    />
                    <label
                      htmlFor="videoFile"
                      className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600/50 rounded-xl bg-gray-700/30 hover:bg-gray-700/40 transition-all duration-300 cursor-pointer"
                    >
                      <FiVideo className="text-4xl text-emerald-400 mb-3" />
                      <span className="font-semibold text-emerald-400 mb-1">
                        Choose Video File
                      </span>
                      <span className="text-xs text-gray-500">
                        MP4, AVI, MOV (max 100MB)
                      </span>
                    </label>
                    {videoFile && (
                      <div className="mt-2 p-2 bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-300 truncate">
                          📹 {videoFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thumbnail *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="thumbnailFile"
                      name="thumbnailFile"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                      required
                    />
                    <label
                      htmlFor="thumbnailFile"
                      className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600/50 rounded-xl bg-gray-700/30 hover:bg-gray-700/40 transition-all duration-300 cursor-pointer"
                    >
                      <FiImage className="text-4xl text-cyan-400 mb-3" />
                      <span className="font-semibold text-cyan-400 mb-1">
                        Choose Thumbnail
                      </span>
                      <span className="text-xs text-gray-500">
                        JPG, PNG (max 5MB)
                      </span>
                    </label>
                    {thumbnailFile && (
                      <div className="mt-2 p-2 bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-300 truncate">
                          🖼️ {thumbnailFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    >
                      {uploadProgress > 10 && (
                        <span className="text-xs text-white font-medium">
                          {uploadProgress}%
                        </span>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={uploading}
                whileHover={!uploading ? { scale: 1.02 } : {}}
                whileTap={!uploading ? { scale: 0.98 } : {}}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold rounded-xl shadow-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <FiUploadCloud size={20} />
                    Upload Video
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default UploadPage;
