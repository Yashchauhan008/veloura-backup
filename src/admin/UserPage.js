import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiUser,
  FiMail,
  FiShield,
  FiCalendar,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiStar,
  FiAward, // Replace FiCrown with FiAward
  FiAlertCircle,
  FiMoreVertical,
  FiEdit,
  FiTrash2
} from 'react-icons/fi';

const baseUrl = process.env.REACT_APP_BASE_URL;

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${baseUrl}/api/user/getAllUsers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
        setTotalCount(data.totalCount || 0);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'from-red-500 to-pink-500';
      case 'premium':
        return 'from-yellow-500 to-orange-500';
      case 'moderator':
        return 'from-purple-500 to-indigo-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FiShield size={16} className="text-red-400" />;
      case 'premium':
        return <FiStar size={16} className="text-yellow-400" />;
      case 'moderator':
        return <FiAward size={16} className="text-purple-400" />; // Changed from FiCrown to FiAward
      default:
        return <FiUser size={16} className="text-blue-400" />;
    }
  };

  const UserCard = ({ user, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-800/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6 hover:border-gray-500/50 transition-all duration-300 group"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-16 h-16 bg-gradient-to-br ${getRoleColor(user.role)} rounded-2xl flex items-center justify-center shadow-lg`}>
          <FiUser size={24} className="text-white" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors">
            <FiMoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="space-y-3">
        {/* Username */}
        <div>
          <h3 className="text-lg font-semibold text-white truncate">
            {user.username || 'Unknown User'}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {getRoleIcon(user.role)}
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
              user.role === 'premium' ? 'bg-yellow-500/20 text-yellow-300' :
              user.role === 'moderator' ? 'bg-purple-500/20 text-purple-300' :
              'bg-blue-500/20 text-blue-300'
            }`}>
              {user.role || 'user'}
            </span>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 text-gray-400">
          <FiMail size={14} />
          <span className="text-sm truncate">{user.email}</span>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="text-gray-300 text-sm">
            <p className="line-clamp-2">{user.bio}</p>
          </div>
        )}

        {/* Join Date */}
        <div className="flex items-center gap-2 text-gray-500">
          <FiCalendar size={14} />
          <span className="text-xs">
            Joined {formatDate(user.createdAt)}
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-4 border-t border-gray-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>ID: {user._id?.slice(-6) || 'N/A'}</span>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
              <FiEdit size={14} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <FiRefreshCw className="animate-spin text-gray-400" size={24} />
          <span className="text-gray-400">Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={fetchAllUsers}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 mt-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">All Users</h1>
              <p className="text-gray-400">Manage and view all platform users</p>
            </div>
            <button
              onClick={fetchAllUsers}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{totalCount}</p>
                <p className="text-gray-400 text-sm">Total Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">
                  {users.filter(user => user.role === 'admin').length}
                </p>
                <p className="text-gray-400 text-sm">Administrators</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {users.filter(user => user.role === 'premium').length}
                </p>
                <p className="text-gray-400 text-sm">Premium Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {users.filter(user => !user.role || user.role === 'user').length}
                </p>
                <p className="text-gray-400 text-sm">Regular Users</p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 pl-12 pr-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <FiFilter className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="py-3 pl-12 pr-8 bg-gray-800/50 border border-gray-600/50 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="premium">Premium</option>
                <option value="moderator">Moderator</option>
                <option value="user">Regular User</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user, index) => (
              <UserCard key={user._id || index} user={user} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FiUsers className="mx-auto mb-4 text-gray-500" size={64} />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Users Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || roleFilter !== 'all' 
                ? 'No users match your current filters.' 
                : 'No users are registered on the platform yet.'
              }
            </p>
            {(searchTerm || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Results Info */}
        {filteredUsers.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Showing {filteredUsers.length} of {totalCount} users
              {(searchTerm || roleFilter !== 'all') && (
                <span className="ml-2">
                  • <button 
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('all');
                    }}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Clear filters
                  </button>
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPage;
