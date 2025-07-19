import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Users from "./user";
import Videos from "./videos";
import Subscriptions from "./Subscriptions";

export default function AdminSection() {
  const [selectedPage, setSelectedPage] = useState("dashboard");

  const renderPage = () => {
    switch (selectedPage) {
      case "users":
        return <Users />;
      case "videos":
        return <Videos />;
      case "subscriptions":
        return <Subscriptions />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex">
      <Sidebar selected={selectedPage} onSelect={setSelectedPage} />
      <main className="ml-64 p-6 w-full min-h-screen bg-gray-100">
        {renderPage()}
      </main>
    </div>
  );
}
