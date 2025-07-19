import React from "react";
import { FiHome, FiUsers, FiVideo, FiMonitor } from "react-icons/fi";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: <FiHome /> },
  { key: "users", label: "Users", icon: <FiUsers /> },
  { key: "videos", label: "Videos", icon: <FiVideo /> },
  { key: "subscriptions", label: "Subscriptions", icon: <FiMonitor /> },
];

const Sidebar = ({ selected, onSelect }) => {
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-lg">
      <div className="p-5 border-b border-gray-700">
        <h1 className="text-lg font-bold">Admin Panel</h1>
      </div>
      <nav className="mt-4 space-y-1">
        {navItems.map((item) => (
          <div
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-all
              ${
                selected === item.key
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:bg-gray-800"
              }`}
          >
            <div className="w-5 h-5">{item.icon}</div>
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
