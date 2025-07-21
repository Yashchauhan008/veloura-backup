import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiPlay, FiUser, FiArrowRight, FiStar, FiTrendingUp, FiVideo, FiUsers, FiEye } from 'react-icons/fi';

const HomePage = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const floatingVariants = {
    float: {
      y: [-20, 20, -20],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#2D303A] text-gray-100 relative overflow-hidden">

      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-gray-800/20 to-gray-700/20 backdrop-blur-sm border border-slate-600/30"
            style={{
              width: Math.random() * 180 + 100,
              height: Math.random() * 180 + 100,
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -50, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 25 + 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}

        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-gray-800/30 to-slate-700/30 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-slate-800/25 to-gray-800/25 rounded-full filter blur-3xl"
          animate={{
            scale: [1.1, 0.9, 1.1],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />

        <motion.div
          className="absolute top-1/3 left-1/5 w-24 h-24 border border-emerald-400/40 rounded-lg bg-gray-800/20"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/5 w-16 h-16 border border-amber-400/40 rounded-full bg-gray-700/20"
          animate={{
            rotate: [360, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center min-h-screen px-6 relative z-10"
      >
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <motion.div
            variants={floatingVariants}
            animate="float"
            className="w-32 h-24 bg-gradient-to-r from-gray-700 to-slate-600 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden border border-gray-500/40"
          >

            <div className="w-0 h-0 border-l-[24px] border-l-emerald-400 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent ml-2 drop-shadow-lg"></div>

            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10"
              animate={{
                opacity: [0, 0.4, 0],
                scale: [1, 1.03, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="text-center mb-12 max-w-5xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-200 leading-tight">
            Welcome to
          </h1>
          <motion.h2
            className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Veloura
          </motion.h2>
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl">
            Experience premium video streaming with advanced technology and curated content in a sleek dark interface
          </p>
        </motion.div>

        {/* Feature highlights - Dark theme with colored icons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-6 mb-12"
        >
          {[
            { icon: FiPlay, text: "Ultra HD", color: "text-emerald-400", bg: "from-gray-800/60 to-gray-700/60", border: "border-emerald-400/30" },
            { icon: FiTrendingUp, text: "Smart Feed", color: "text-cyan-400", bg: "from-gray-800/60 to-slate-700/60", border: "border-cyan-400/30" },
            { icon: FiStar, text: "Premium", color: "text-amber-400", bg: "from-gray-800/60 to-gray-700/60", border: "border-amber-400/30" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{
                scale: 1.06,
                y: -3,
                boxShadow: "0 15px 30px rgba(0, 0, 0, 0.4)"
              }}
              className={`flex items-center gap-3 px-6 py-4 bg-gradient-to-r ${feature.bg} backdrop-blur-md rounded-2xl border ${feature.border} hover:border-opacity-60 transition-all duration-300 shadow-lg`}
            >
              <feature.icon className={feature.color} size={20} />
              <span className="text-gray-200 text-sm font-semibold">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Link to="/register">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="group bg-gradient-to-r from-emerald-600 to-cyan-600 text-gray-100 px-12 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300 relative overflow-hidden border border-emerald-500/40"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-400/15 to-cyan-400/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span className="relative flex items-center gap-3">
                Get Started
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <FiArrowRight className="text-gray-100" />
                </motion.div>
              </span>
            </motion.button>
          </Link>

          <Link to="/login">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="group bg-gray-800/90 backdrop-blur-md border-2 border-gray-600/60 text-gray-200 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-gray-700/90 hover:border-gray-500/80 transition-all duration-300 shadow-xl"
            >
              <span className="flex items-center gap-3">
                <FiUser className="text-gray-300" />
                Sign In
              </span>
            </motion.button>
          </Link>
        </motion.div>


      </motion.div>

    </div>
  );
};

export default HomePage;
