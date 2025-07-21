import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiLogIn, FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff, FiUser, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
const baseUrl = process.env.REACT_APP_BASE_URL;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Form validation
  const validateForm = () => {
    const { email, password } = formData;
    
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!password.trim()) {
      setError('Password is required');
      return false;
    }
    
    return true;
  };

  // Admin credentials check
  const isAdminCredentials = (email, password) => {
    return email === 'admin@gmail.com' && password === 'admin@123';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Making request to:', `${baseUrl}/api/user/login`);
      
      // Check for admin credentials first
      if (isAdminCredentials(formData.email.trim(), formData.password)) {
        // For admin, create a mock user object or use a special admin user
        const adminUser = {
          id: 'admin-id',
          username: 'Admin',
          email: formData.email,
          role: 'admin'
        };
        
        // Create a token (you might want to generate a proper token)
        const adminToken = 'admin-token-' + Date.now();
        
        localStorage.setItem('token', adminToken);
        localStorage.setItem('user', JSON.stringify(adminUser));
        
        login(adminToken, adminUser);
        
        // Navigate to admin dashboard
        navigate('/admin');
        return;
      }
      
      // For regular users, proceed with API call
      const response = await axios.post(`${baseUrl}/api/user/login`, {
        email: formData.email.trim(),
        password: formData.password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      if (response.status === 200) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        login(token, user);
        
        // Navigate to regular dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else if (error.response) {
        setError(error.response.data.message || 'Login failed');
      } else if (error.request) {
        setError('Cannot connect to server. Is the backend running?');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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

      {/* Main Login Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 space-y-8 bg-transparent backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-600/40 relative z-10"
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
            <FiUser className="text-gray-100 text-xl" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm mt-2">Sign in to continue to Veloura</p>
          </motion.div>
        </div>

        {/* Admin Login Info (Optional - Remove in production) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 text-center"
        >
          <p className="text-blue-300 text-sm">
            <strong>Admin Access:</strong> admin@gmail.com / admin@123
          </p>
        </motion.div>

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

        <form onSubmit={handleLogin} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
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

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInput}
                disabled={loading}
                className="w-full py-4 pl-12 pr-12 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              type="submit"
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-600 text-gray-100 font-semibold rounded-xl shadow-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-100"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <FiLogIn />
                  <span>Sign In</span>
                </>
              )}
              
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-6"
        >
          <div className="text-center">
            <Link 
              to="/forgot-password" 
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-800/40 text-gray-400 backdrop-blur-sm">or</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>
        </motion.div>

      </motion.div>

    </div>
  );
};

export default LoginPage;
