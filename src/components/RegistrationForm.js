import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiArrowRight, FiAward, FiAlertCircle, FiArrowLeft, FiUserPlus } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
const baseUrl = process.env.REACT_APP_BASE_URL;

const RegistrationForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' // default role
  });

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Form validation
  const validateForm = () => {
    const { username, email, password } = formData;
    
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!password.trim()) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${baseUrl}/api/user/register`, {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      if (response.status === 201) {
        setSuccess(true);
        setStep(2);
        localStorage.setItem('userId', response.data.userId);
        console.log('Registration successful:', response.data);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        setError(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: '100%' },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
    exit: { opacity: 0, x: '-100%', transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  return (
    <div className="min-h-screen bg-[#2D303A] text-gray-100 relative overflow-hidden flex items-center justify-center">
      
      {/* Animated Background Elements - Same as HomePage */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dark accent circles */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-gray-800/15 to-gray-700/15 backdrop-blur-sm border border-slate-600/20"
            style={{
              width: Math.random() * 120 + 80,
              height: Math.random() * 120 + 80,
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

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-16 h-16 border border-emerald-400/30 rounded-lg bg-gray-800/20"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/6 w-12 h-12 border border-cyan-400/30 rounded-full bg-gray-700/20"
          animate={{
            rotate: [360, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Large gradient orbs */}
        <motion.div
          className="absolute top-10 right-10 w-48 h-48 bg-gradient-to-r from-gray-800/20 to-slate-700/20 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Back to Home Button */}
      <Link to="/" className="absolute top-6 left-6 z-20">
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-700/80 hover:border-gray-500/60 transition-all duration-300"
        >
          <FiArrowLeft size={16} />
          <span className="text-sm">Back to Home</span>
        </motion.button>
      </Link>

      {/* Main Registration Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 space-y-8 bg-transparent backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-600/40 relative z-10"
      >
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* Header Section */}
              <div className="text-center space-y-4">
                {/* Logo */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <FiUserPlus className="text-gray-100 text-xl" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Create Account
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">Join our community of creators</p>
                </motion.div>
              </div>
              
              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className="w-full p-4 bg-red-500/10 border border-red-400/30 rounded-xl flex items-center gap-3 text-red-300 backdrop-blur-sm"
                  >
                    <FiAlertCircle className="text-red-400 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Registration Form */}
              <div className="space-y-5">
                {/* Username Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative"
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <div className="relative">
                    <FiUser className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      name="username" 
                      placeholder="Enter your username" 
                      value={formData.username}
                      onChange={handleInput}
                      disabled={loading}
                      className="w-full py-4 pl-12 pr-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
                      required
                    />
                  </div>
                </motion.div>
                
                {/* Email Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative"
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="Enter your email" 
                      value={formData.email}
                      onChange={handleInput}
                      disabled={loading}
                      className="w-full py-4 pl-12 pr-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
                      required
                    />
                  </div>
                </motion.div>
                
                {/* Password Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="relative"
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <FiLock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="password" 
                      name="password" 
                      placeholder="Enter password (min 6 characters)" 
                      value={formData.password}
                      onChange={handleInput}
                      disabled={loading}
                      className="w-full py-4 pl-12 pr-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
                      required
                    />
                  </div>
                </motion.div>

                {/* Role Selection */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="relative"
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">Account Type</label>
                  <select 
                    name="role" 
                    value={formData.role}
                    onChange={handleInput}
                    disabled={loading}
                    className="w-full py-4 pl-4 pr-4 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
                  >
                    <option value="user" className="bg-gray-800">User</option>
                    <option value="admin" className="bg-gray-800">Admin</option>
                  </select>
                </motion.div>
              </div>

              {/* Create Account Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.button 
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-500 to-cyan-600 text-gray-100 font-semibold rounded-xl shadow-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-100"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <FiArrowRight className="text-gray-100" />
                      </motion.div>
                    </>
                  )}
                  
                  {/* Button glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </motion.div>
              
              {/* Login Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center"
              >
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                    Sign In
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2" 
              variants={stepVariants} 
              initial="hidden" 
              animate="visible" 
              exit="exit" 
              className="flex flex-col items-center text-center space-y-6"
            >
              {/* Success Icon */}
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1, rotate: 360 }} 
                transition={{ duration: 0.7, type: 'spring', stiffness: 120 }}
                className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl"
              >
                <FiAward className="text-4xl text-gray-100" />
              </motion.div>
              
              {/* Success Message */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Registration Successful!
                </h2>
                
                <p className="text-gray-300 text-lg">
                  Welcome to Veloura, <span className="font-bold text-emerald-400">{formData.username}</span>!
                </p>

                <div className="text-gray-500 text-sm">
                  Redirecting to login page in 3 seconds...
                </div>
              </div>
              
              {/* Action Button */}
              <Link to="/login" className="w-full">
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-gray-100 font-semibold rounded-xl shadow-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300"
                >
                  Continue to Login
                </motion.button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </div>
  );
};

export default RegistrationForm;
