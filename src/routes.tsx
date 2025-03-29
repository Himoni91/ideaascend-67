import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RouteGuard } from '@/guards/RouteGuard';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import MentorSpace from './pages/MentorSpace';
import MentorProfilePage from './pages/MentorProfilePage';
import MentorSessionsPage from './pages/MentorSessionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import Discover from './pages/Discover';
import DiscoverDetail from './pages/discover/DiscoverDetail';
import ChallengesPage from './pages/ChallengesPage';
import PricingPage from './pages/PricingPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';
import PostEditor from './pages/PostEditor';
import PostDetail from './pages/PostDetail';

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={
        <RouteGuard requireGuest>
          <LoginPage />
        </RouteGuard>
      } />
      <Route path="/signup" element={
        <RouteGuard requireGuest>
          <SignupPage />
        </RouteGuard>
      } />
      <Route path="/" element={
        <RouteGuard requireAuth>
          <HomePage />
        </RouteGuard>
      } />
      <Route path="/profile/:username" element={
        <RouteGuard requireAuth>
          <ProfilePage />
        </RouteGuard>
      } />
      <Route path="/edit-profile" element={
        <RouteGuard requireAuth>
          <EditProfilePage />
        </RouteGuard>
      } />
      <Route path="/mentor-space" element={
        <RouteGuard requireAuth>
          <MentorSpace />
        </RouteGuard>
      } />
      <Route path="/mentor-profile/:id" element={
        <RouteGuard requireAuth>
          <MentorProfilePage />
        </RouteGuard>
      } />
      <Route path="/mentor-sessions" element={
        <RouteGuard requireAuth>
          <MentorSessionsPage />
        </RouteGuard>
      } />
      <Route path="/analytics" element={
        <RouteGuard requireAuth>
          <AnalyticsPage />
        </RouteGuard>
      } />
      <Route path="/discover" element={
        <RouteGuard requireAuth>
          <Discover />
        </RouteGuard>
      } />
      <Route path="/discover/:id" element={
        <RouteGuard requireAuth>
          <DiscoverDetail />
        </RouteGuard>
      } />
      <Route path="/challenges" element={
        <RouteGuard requireAuth>
          <ChallengesPage />
        </RouteGuard>
      } />
      <Route path="/pricing" element={
        <RouteGuard requireAuth>
          <PricingPage />
        </RouteGuard>
      } />
      <Route path="/settings" element={
        <RouteGuard requireAuth>
          <SettingsPage />
        </RouteGuard>
      } />
      <Route path="/notifications" element={
        <RouteGuard requireAuth>
          <NotificationsPage />
        </RouteGuard>
      } />
      <Route path="/messages" element={
        <RouteGuard requireAuth>
          <MessagesPage />
        </RouteGuard>
      } />
       <Route path="/post/new" element={
        <RouteGuard requireAuth>
          <PostEditor />
        </RouteGuard>
      } />
      <Route path="/post/:id" element={
        <RouteGuard requireAuth>
          <PostDetail />
        </RouteGuard>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
