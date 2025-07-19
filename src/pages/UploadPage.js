import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiType, FiFileText, FiTag, FiEye, FiVideo, FiImage, FiUploadCloud, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const baseUrl = process.env.REACT_APP_BASE_URL;

const UploadPage = () => {
  // The user object from useAuth is now correctly parsed
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
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'videoFile') setVideoFile(files[0]);
    else if (name === 'thumbnailFile') setThumbnailFile(files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if the user object exists before trying to get the ID
    if (!user) {
      return setError('You must be logged in to upload a video.');
    }
    
    // Safely get the user ID. MongoDB uses `_id`, but we check for `id` just in case.
    const uploaderId = user._id || user.id;

    if (!uploaderId) {
      return setError('Could not find user ID. Please try logging in again.');
    }

    if (!formData.title) return setError('Title is required.');
    if (!videoFile) return setError('A video file is required.');
    if (!thumbnailFile) return setError('A thumbnail image is required.');

    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    const data = new FormData();
    
    // Append all fields exactly as the backend expects them
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('tags', formData.tags);
    data.append('accessLevel', formData.accessLevel);
    data.append('uploader', uploaderId); // <-- This will now have the correct ID

    // Append files
    data.append('video', videoFile);
    data.append('thumbnail', thumbnailFile);

    try {
      const response = await axios.post(`${baseUrl}/api/video/upload-video`, data, {
        headers: {
          // The backend expects multipart/form-data, which axios sets automatically with FormData
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (response.status === 201) {
        setSuccess('Video uploaded successfully!');
        setFormData({ title: '', description: '', tags: '', accessLevel: 'public' });
        setVideoFile(null);
        setThumbnailFile(null);
        document.getElementById('videoFile').value = null;
        document.getElementById('thumbnailFile').value = null;
      }
    } catch (err) {
      const message = err.response?.data?.message || 'An error occurred during upload.';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upload Video</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Add a new video to your collection</p>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
        {/* Form fields remain the same */}
        <div className="relative"><FiType className="absolute top-3.5 left-4 text-gray-400" /><input type="text" name="title" placeholder="Video Title" value={formData.title} onChange={handleInputChange} className="w-full py-3 pl-12 pr-4 bg-gray-100 dark:bg-[#1F222A] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
        <div className="relative"><FiFileText className="absolute top-3.5 left-4 text-gray-400" /><textarea name="description" placeholder="Video Description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full py-3 pl-12 pr-4 bg-gray-100 dark:bg-[#1F222A] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"></textarea></div>
        <div className="relative"><FiTag className="absolute top-3.5 left-4 text-gray-400" /><input type="text" name="tags" placeholder="Tags (comma-separated)" value={formData.tags} onChange={handleInputChange} className="w-full py-3 pl-12 pr-4 bg-gray-100 dark:bg-[#1F222A] border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
        <div className="relative"><FiEye className="absolute top-3.5 left-4 text-gray-400" /><select name="accessLevel" value={formData.accessLevel} onChange={handleInputChange} className="w-full py-3 pl-12 pr-4 bg-gray-100 dark:bg-[#1F222A] border border-gray-300 dark:border-gray-700 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-red-500">
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
            <FiVideo className="mx-auto text-4xl text-gray-400 mb-2" />
            <label htmlFor="videoFile" className="font-semibold text-red-500 cursor-pointer">Choose Video File</label>
            <input type="file" id="videoFile" name="videoFile" accept="video/*" onChange={handleFileChange} className="hidden" />
            {videoFile && <p className="text-sm text-gray-500 mt-2 truncate">{videoFile.name}</p>}
          </div>
          <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
            <FiImage className="mx-auto text-4xl text-gray-400 mb-2" />
            <label htmlFor="thumbnailFile" className="font-semibold text-red-500 cursor-pointer">Choose Thumbnail</label>
            <input type="file" id="thumbnailFile" name="thumbnailFile" accept="image/*" onChange={handleFileChange} className="hidden" />
            {thumbnailFile && <p className="text-sm text-gray-500 mt-2 truncate">{thumbnailFile.name}</p>}
          </div>
        </div>
        {uploading && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}
        {error && <div className="flex items-center gap-2 text-red-500"><FiAlertCircle /> {error}</div>}
        {success && <div className="flex items-center gap-2 text-green-500"><FiCheckCircle /> {success}</div>}
        <button type="submit" disabled={uploading} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400">
          {uploading ? 'Uploading...' : <><FiUploadCloud /> Upload Video</>}
        </button>
      </form>
    </motion.div>
  );
};

export default UploadPage;
