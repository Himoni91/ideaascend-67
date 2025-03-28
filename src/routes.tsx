
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import ProfilePage from "@/pages/ProfilePage";
import EnhancedProfile from "@/pages/EnhancedProfile";
import NotFoundPage from "@/pages/NotFoundPage";
import PitchHub from "@/pages/PitchHub";
import SubmitPitch from "@/pages/SubmitPitch";
import PitchDetail from "@/pages/PitchDetail";
import PitchHubIdea from "@/pages/PitchHubIdea";
import PitchHubIdeaDetail from "@/pages/PitchHubIdeaDetail";

// Mentor Space Routes
import MentorSpacePage from "@/pages/MentorSpacePage";
import MentorProfilePage from "@/pages/MentorProfilePage";
import MentorApplicationPage from "@/pages/MentorApplicationPage";
import MentorSessionsPage from "@/pages/MentorSessionsPage";
import MentorAnalyticsPage from "@/pages/MentorAnalyticsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/auth/sign-in",
    element: <SignInPage />,
  },
  {
    path: "/auth/sign-up",
    element: <SignUpPage />,
  },
  {
    path: "/profile/:id",
    element: <ProfilePage />,
  },
  {
    path: "/profile/@:username",
    element: <EnhancedProfile />,
  },
  {
    path: "/pitch-hub",
    element: <PitchHub />,
  },
  {
    path: "/pitch-hub/submit",
    element: <SubmitPitch />,
  },
  {
    path: "/pitch-hub/:id",
    element: <PitchDetail />,
  },
  {
    path: "/pitch-hub/idea",
    element: <PitchHubIdea />,
  }, 
  {
    path: "/pitch-hub/idea/:id",
    element: <PitchHubIdeaDetail />,
  },
  // Mentor Space Routes
  {
    path: "/mentor-space",
    element: <MentorSpacePage />,
  },
  {
    path: "/mentor-space/:id",
    element: <MentorProfilePage />,
  },
  {
    path: "/mentor-space/apply",
    element: <MentorApplicationPage />,
  },
  {
    path: "/mentor-space/sessions",
    element: <MentorSessionsPage />,
  },
  {
    path: "/mentor-space/analytics",
    element: <MentorAnalyticsPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
