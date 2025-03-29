
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import RouteGuard from "@/guards/RouteGuard";
import AppLayout from "@/components/layout/AppLayout";

// Lazy load each page for better performance
const Home = lazy(() => import("@/pages/Index"));
const SignIn = lazy(() => import("@/pages/auth/SignIn"));
const SignUp = lazy(() => import("@/pages/auth/SignUp"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const UpdatePassword = lazy(() => import("@/pages/auth/UpdatePassword"));
const Callback = lazy(() => import("@/pages/auth/Callback"));
const PitchHub = lazy(() => import("@/pages/PitchHub"));
const PitchDetail = lazy(() => import("@/pages/PitchDetail"));
const Ascend = lazy(() => import("@/pages/Ascend"));
const MentorSpacePage = lazy(() => import("@/pages/MentorSpacePage"));
const MentorProfilePage = lazy(() => import("@/pages/MentorProfilePage"));
const MentorSessionsPage = lazy(() => import("@/pages/MentorSessionsPage"));
const PostDetail = lazy(() => import("@/pages/post/[id]"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Discover = lazy(() => import("@/pages/Discover"));

// Routes configuration
export const router = createBrowserRouter([
  // Public routes
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/auth/callback",
    element: <Callback />,
  },
  {
    path: "/update-password",
    element: <UpdatePassword />,
  },
  {
    path: "/post/:id",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <PostDetail />
      </Suspense>
    ),
  },
  
  // Protected routes
  {
    path: "/",
    element: (
      <RouteGuard>
        <Suspense fallback={<div>Loading...</div>}>
          <Home />
        </Suspense>
      </RouteGuard>
    ),
  },
  {
    path: "/pitch-hub",
    element: (
      <RouteGuard>
        <Suspense fallback={<div>Loading...</div>}>
          <PitchHub />
        </Suspense>
      </RouteGuard>
    ),
  },
  {
    path: "/pitch-hub/:id",
    element: (
      <RouteGuard>
        <Suspense fallback={<div>Loading...</div>}>
          <PitchDetail />
        </Suspense>
      </RouteGuard>
    ),
  },
  {
    path: "/ascend",
    element: (
      <RouteGuard>
        <Suspense fallback={<div>Loading...</div>}>
          <Ascend />
        </Suspense>
      </RouteGuard>
    ),
  },
  {
    path: "/mentor-space",
    element: (
      <RouteGuard>
        <Suspense fallback={<div>Loading...</div>}>
          <MentorSpacePage />
        </Suspense>
      </RouteGuard>
    ),
  },
  {
    path: "/mentor-space/sessions",
    element: (
      <RouteGuard>
        <Suspense fallback={<div>Loading...</div>}>
          <MentorSessionsPage />
        </Suspense>
      </RouteGuard>
    ),
  },
  {
    path: "/mentor/:username",
    element: (
      <RouteGuard>
        <Suspense fallback={<div>Loading...</div>}>
          <MentorProfilePage />
        </Suspense>
      </RouteGuard>
    ),
  },
  {
    path: "/discover",
    element: (
      <RouteGuard>
        <Suspense fallback={<div>Loading...</div>}>
          <Discover />
        </Suspense>
      </RouteGuard>
    ),
  },
  // Catch-all route
  {
    path: "*",
    element: <NotFound />,
  },
]);
