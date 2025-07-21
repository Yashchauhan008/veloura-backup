import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Import all your components and pages
import ProtectedLayout from "./components/ProtectedLayout";
import RegistrationForm from "./components/RegistrationForm";
import ProtectedRoute from "./components/ProtectedRoute";
import FeedPage from "./pages/FeedPage/FeedPage";
import ExplorePage from "./pages/ExplorePage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import SettingsPage from "./pages/SettingsPage";
import VideoDetailPage from "./pages/VideoDetailPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import ProfilePage from "./pages/ProfilePage";
import AdminNavbar from "./admin/AdminNavbar";
import AdminDashboard from "./admin/DashboardPage";
import AdminProfile from "./admin/AdminProfile";
import UserPage from "./admin/UserPage";
import VideosPage from "./admin/VideosPage";

// Admin Layout Component that renders navbar and child routes
const AdminLayout = () => {
  return (
    <div>
      <AdminNavbar />
      <Outlet /> {/* This renders child routes */}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationForm />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<FeedPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/video/:id" element={<VideoDetailPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Admin Routes */} 
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} /> 
              <Route path="dashboard" element={<AdminDashboard />} />
               <Route path="profile" element={<AdminProfile />} />
                 <Route path="users" element={<UserPage />} /> 
                 <Route path="videos" element={<VideosPage />} />
           
            </Route>

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">404</h2>
                    <p className="text-gray-400">Page Not Found</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
