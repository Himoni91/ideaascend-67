import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "@/components/layout/AppLayout";

// Lazy loaded components
const HomePage = lazy(() => import("@/pages/Index"));
const SignInPage = lazy(() => import("@/pages/auth/SignIn"));
const SignUpPage = lazy(() => import("@/pages/auth/SignUp"));
const ProfilePage = lazy(() => import("@/pages/Profile"));
const EnhancedProfile = lazy(() => import("@/pages/EnhancedProfile"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));
const PitchHub = lazy(() => import("@/pages/PitchHub"));
const SubmitPitch = lazy(() => import("@/pages/PitchHub"));
const PitchDetail = lazy(() => import("@/pages/PitchDetail"));
const PitchHubIdea = lazy(() => import("@/pages/PitchHubIdea"));
const PitchHubIdeaDetail = lazy(() => import("@/pages/PitchHubIdeaDetail"));

// Mentor Space Routes
const MentorSpacePage = lazy(() => import("@/pages/MentorSpacePage"));
const MentorProfilePage = lazy(() => import("@/pages/MentorProfilePage"));
const MentorApplicationPage = lazy(() => import("@/pages/MentorApplicationPage"));
const MentorSessionsPage = lazy(() => import("@/pages/MentorSessionsPage"));
const MentorAnalyticsPage = lazy(() => import("@/pages/MentorAnalyticsPage"));

// Loading component for suspense fallback
const Loading = () => (
  <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<Loading />}>
        <HomePage />
      </Suspense>
    ),
  },
  {
    path: "/auth/sign-in",
    element: (
      <Suspense fallback={<Loading />}>
        <SignInPage />
      </Suspense>
    ),
  },
  {
    path: "/auth/sign-up",
    element: (
      <Suspense fallback={<Loading />}>
        <SignUpPage />
      </Suspense>
    ),
  },
  {
    path: "/profile/:id",
    element: (
      <Suspense fallback={<Loading />}>
        <ProfilePage />
      </Suspense>
    ),
  },
  {
    path: "/profile/@:username",
    element: (
      <Suspense fallback={<Loading />}>
        <EnhancedProfile />
      </Suspense>
    ),
  },
  {
    path: "/pitch-hub",
    element: (
      <Suspense fallback={<Loading />}>
        <PitchHub />
      </Suspense>
    ),
  },
  {
    path: "/pitch-hub/submit",
    element: (
      <Suspense fallback={<Loading />}>
        <SubmitPitch />
      </Suspense>
    ),
  },
  {
    path: "/pitch-hub/:id",
    element: (
      <Suspense fallback={<Loading />}>
        <PitchDetail />
      </Suspense>
    ),
  },
  {
    path: "/pitch-hub/idea",
    element: (
      <Suspense fallback={<Loading />}>
        <PitchHubIdea />
      </Suspense>
    ),
  }, 
  {
    path: "/pitch-hub/idea/:id",
    element: (
      <Suspense fallback={<Loading />}>
        <PitchHubIdeaDetail />
      </Suspense>
    ),
  },
  // Mentor Space Routes
  {
    path: "/mentor-space",
    element: (
      <Suspense fallback={<Loading />}>
        <MentorSpacePage />
      </Suspense>
    ),
  },
  {
    path: "/mentor-space/:id",
    element: (
      <Suspense fallback={<Loading />}>
        <MentorProfilePage />
      </Suspense>
    ),
  },
  {
    path: "/mentor-space/apply",
    element: (
      <Suspense fallback={<Loading />}>
        <MentorApplicationPage />
      </Suspense>
    ),
  },
  {
    path: "/mentor-space/sessions",
    element: (
      <Suspense fallback={<Loading />}>
        <MentorSessionsPage />
      </Suspense>
    ),
  },
  {
    path: "/mentor-space/analytics",
    element: (
      <Suspense fallback={<Loading />}>
        <MentorAnalyticsPage />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<Loading />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
