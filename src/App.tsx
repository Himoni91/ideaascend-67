import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { PageTransition } from "@/components/PageTransition";

// Import pages
import Index from "@/pages/Index";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword"; 
import Launchpad from "@/pages/Index";  // Using Index as Launchpad for now
import MentorSpace from "@/pages/MentorSpace";
import Ascend from "@/pages/Ascend";
import Profile from "@/pages/Profile";  // Regular profile page
import ProfileSettings from "@/pages/ProfileSettings"; // Profile settings page
import Discover from "@/pages/Discover";
import Calendar from "@/pages/Calendar";
import Analytics from "@/pages/Analytics";
import Achievements from "@/pages/Achievements";
import MentorProfile from "@/pages/MentorProfile";  // Mentor profile page
import PostDetailPage from "@/pages/post/[id]";
import Help from "@/pages/Help";
import NotFound from "@/pages/NotFound";
import AuthLayout from "@/components/layout/AuthLayout";
import PitchHub from "./pages/PitchHub";
import PitchHubIdeaDetail from "./pages/PitchHubIdeaDetail";

// Import mentor pages
import MentorApplicationPage from "@/pages/MentorApplicationPage";
import MentorSessionsPage from "@/pages/MentorSessionsPage";
import MentorAnalyticsPage from "@/pages/MentorAnalyticsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="sign-in" element={<SignIn />} />
                <Route path="sign-up" element={<SignUp />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
              </Route>

              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              
              {/* Protected Routes */}
              <Route path="/launchpad" element={
                <RouteGuard>
                  <Launchpad />
                </RouteGuard>
              } />
              <Route path="/mentor-space" element={
                <RouteGuard>
                  <MentorSpace />
                </RouteGuard>
              } />
              <Route path="/mentor-space/apply" element={
                <RouteGuard>
                  <MentorApplicationPage />
                </RouteGuard>
              } />
              <Route path="/mentor-space/sessions" element={
                <RouteGuard>
                  <MentorSessionsPage />
                </RouteGuard>
              } />
              <Route path="/mentor-space/analytics" element={
                <RouteGuard>
                  <MentorAnalyticsPage />
                </RouteGuard>
              } />
              <Route path="/mentor-space/:id" element={
                <RouteGuard>
                  <MentorProfile />
                </RouteGuard>
              } />
              <Route path="/ascend" element={
                <RouteGuard>
                  <Ascend />
                </RouteGuard>
              } />
              <Route path="/pitch-hub" element={
                <RouteGuard>
                  <PitchHub />
                </RouteGuard>
              } />
              <Route path="/pitch-hub/:id" element={
                <RouteGuard>
                  <PitchHubIdeaDetail />
                </RouteGuard>
              } />
              
              {/* Profile Routes - Important: Order matters for route matching */}
              <Route path="/profile/settings" element={
                <RouteGuard>
                  <ProfileSettings />
                </RouteGuard>
              } />
              <Route path="/profile/:username" element={
                <RouteGuard>
                  <Profile />
                </RouteGuard>
              } />
              <Route path="/profile" element={
                <RouteGuard>
                  <Profile />
                </RouteGuard>
              } />
              
              <Route path="/discover" element={
                <RouteGuard>
                  <Discover />
                </RouteGuard>
              } />
              <Route path="/calendar" element={
                <RouteGuard>
                  <Calendar />
                </RouteGuard>
              } />
              <Route path="/analytics" element={
                <RouteGuard>
                  <Analytics />
                </RouteGuard>
              } />
              <Route path="/achievements" element={
                <RouteGuard>
                  <Achievements />
                </RouteGuard>
              } />
              
              <Route path="/post/:id" element={
                <RouteGuard>
                  <PostDetailPage />
                </RouteGuard>
              } />
              <Route path="/help" element={
                <RouteGuard>
                  <Help />
                </RouteGuard>
              } />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Toaster position="top-right" />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
