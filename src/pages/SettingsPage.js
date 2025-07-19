import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext'; // 1. IMPORT the useTheme hook
import { FiUser, FiMail, FiBell, FiEye } from 'react-icons/fi';

// 2. MODIFY SettingsInput to be theme-aware
const SettingsInput = ({ label, type, id, icon, defaultValue }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                {icon}
            </div>
            <input
                type={type}
                id={id}
                defaultValue={defaultValue}
                className="w-full py-2 pl-10 pr-4 bg-gray-100 dark:bg-[#1F222A] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
        </div>
    </div>
);

// 3. MODIFY SettingsToggle to be a controlled component
const SettingsToggle = ({ label, id, icon, isChecked, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-3">
            {icon}
            <span className="font-medium text-gray-800 dark:text-gray-200">{label}</span>
        </div>
        <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                id={id}
                className="sr-only peer"
                checked={isChecked}
                onChange={onChange} // Use the passed-in onChange handler
            />
            {/* Added dark: classes for the toggle switch itself */}
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
        </label>
    </div>
);

const SettingsPage = () => {
    // 4. GET the theme state and toggle function from the context
    const { theme, toggleTheme } = useTheme();

    // This component no longer needs the main layout wrapper, as ProtectedLayout handles it.
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Add dark: class for the main title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

            <div className="max-w-2xl mx-auto space-y-12">
                {/* Profile Settings */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Profile</h2>
                    <div className="space-y-4">
                        <SettingsInput label="Username" id="username" icon={<FiUser />} defaultValue="Yash Chauhan" />
                        <SettingsInput label="Email Address" id="email" icon={<FiMail />} type="email" defaultValue="yash@example.com" />
                    </div>
                </section>

                {/* Notification Settings */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Notifications</h2>
                    <div className="space-y-4">
                        {/* These toggles are now controlled components (though their state isn't managed yet) */}
                        <SettingsToggle label="New Video Alerts" id="video-alerts" icon={<FiBell className="text-gray-500 dark:text-gray-400" />} isChecked={true} onChange={() => {}} />
                        <SettingsToggle label="Comment Replies" id="comment-replies" icon={<FiMail className="text-gray-500 dark:text-gray-400" />} isChecked={true} onChange={() => {}} />
                    </div>
                </section>

                {/* Appearance Settings */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Appearance</h2>
                    <div className="space-y-4">
                        {/* 5. CONNECT the Dark Mode toggle to the theme context */}
                        <SettingsToggle
                            label="Dark Mode"
                            id="dark-mode"
                            icon={<FiEye className="text-gray-500 dark:text-gray-400" />}
                            isChecked={theme === 'dark'} // The toggle is "on" if the theme is 'dark'
                            onChange={toggleTheme}       // Clicking it calls the global toggleTheme function
                        />
                    </div>
                </section>

                <button className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                    Save Changes
                </button>
            </div>
        </motion.div>
    );
};

export default SettingsPage;
