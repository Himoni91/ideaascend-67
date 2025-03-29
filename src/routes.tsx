
import { Suspense, lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import { RouteGuard } from "@/guards/RouteGuard";
import Index from "@/pages/Index";
import Discover from "@/pages/Discover";
import MentorSpace from "@/pages/MentorSpace";
import MentorProfilePage from "@/pages/MentorProfilePage";
import MentorSessionsPage from "@/pages/MentorSessionsPage";
import NotFound from "@/pages/NotFound";
import Ascend from "@/pages/Ascend";
import ChallengeDetail from "@/pages/ChallengeDetail";
import PitchHub from "@/pages/PitchHub";
import Help from "@/pages/Help";
import Analytics from "@/pages/Analytics";
import Profile from "@/pages/Profile";
import ProfileSettings from "@/pages/ProfileSettings";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import UpdatePassword from "@/pages/auth/UpdatePassword";
import CheckEmail from "@/pages/auth/CheckEmail";
import DiscoverDetail from "@/pages/discover/DiscoverDetail";

const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <RouteGuard requireAuth>
        <Index />
      </RouteGuard>
    ),
  },
  {
    path: "/discover",
    element: (
      <RouteGuard requireAuth>
        <Discover />
      </RouteGuard>
    ),
  },
  {
    path: "/discover/:id",
    element: (
      <RouteGuard requireAuth>
        <DiscoverDetail />
      </RouteGuard>
    ),
  },
  {
    path: "/mentor-space",
    element: (
      <RouteGuard requireAuth>
        <MentorSpace />
      </RouteGuard>
    ),
  },
  {
    path: "/mentor-profile/:id",
    element: (
      <RouteGuard requireAuth>
        <MentorProfilePage />
      </RouteGuard>
    ),
  },
  {
    path: "/mentor-sessions",
    element: (
      <RouteGuard requireAuth>
        <MentorSessionsPage />
      </RouteGuard>
    ),
  },
  {
    path: "/ascend",
    element: (
      <RouteGuard requireAuth>
        <Ascend />
      </RouteGuard>
    ),
  },
  {
    path: "/challenge/:id",
    element: (
      <RouteGuard requireAuth>
        <ChallengeDetail />
      </RouteGuard>
    ),
  },
  {
    path: "/pitchhub",
    element: (
      <RouteGuard requireAuth>
        <PitchHub />
      </RouteGuard>
    ),
  },
  {
    path: "/help",
    element: <Help />,
  },
  {
    path: "/analytics",
    element: (
      <RouteGuard requireAuth>
        <Analytics />
      </RouteGuard>
    ),
  },
  {
    path: "/profile/:username",
    element: (
      <RouteGuard requireAuth>
        <Profile />
      </RouteGuard>
    ),
  },
  {
    path: "/profile-settings",
    element: (
      <RouteGuard requireAuth>
        <ProfileSettings />
      </RouteGuard>
    ),
  },
  {
    path: "/login",
    element: (
      <RouteGuard requireGuest>
        <SignIn />
      </RouteGuard>
    ),
  },
  {
    path: "/signup",
    element: (
      <RouteGuard requireGuest>
        <SignUp />
      </RouteGuard>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <RouteGuard requireGuest>
        <ForgotPassword />
      </RouteGuard>
    ),
  },
  {
    path: "/update-password",
    element: (
      <RouteGuard requireGuest>
        <UpdatePassword />
      </RouteGuard>
    ),
  },
  {
    path: "/check-email",
    element: (
      <RouteGuard requireGuest>
        <CheckEmail />
      </RouteGuard>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
