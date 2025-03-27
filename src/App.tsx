import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { RouteGuard } from "@/guards/RouteGuard";
import { PageTransition } from "@/components/PageTransition";

// Import pages
import Index from "@/pages/Index";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import Launchpad from "@/pages/Launchpad";
import MentorSpace from "@/pages/MentorSpace";
import Ascend from "@/pages/Ascend";
import EnhancedProfile from "@/pages/profile/[username]";
import Discover from "@/pages/Discover";
import Calendar from "@/pages/Calendar";
import Analytics from "@/pages/Analytics";
import Achievements from "@/pages/Achievements";
import MentorProfile from "@/pages/mentor/[username]";
import PostDetailPage from "@/pages/post/[id]";
import Help from "@/pages/Help";
import NotFound from "@/pages/NotFound";
import AuthLayout from "@/components/layout/AuthLayout";
import PitchHub from "./pages/PitchHub";
import PitchDetail from "./pages/PitchDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {

  return (
    <ThemeProvider defaultTheme="system" storageKey="idolyst-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
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
              <Route element={<RouteGuard />}>
                <Route path="/launchpad" element={<Launchpad />} />
                <Route path="/mentor-space" element={<MentorSpace />} />
                <Route path="/ascend" element={<Ascend />} />
                <Route path="/pitch-hub" element={<PitchHub />} />
                <Route path="/pitch-hub/:id" element={<PitchDetail />} />
                <Route path="/profile/:username" element={<EnhancedProfile />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/mentor/:username" element={<MentorProfile />} />
                <Route path="/post/:id" element={<PostDetailPage />} />
                <Route path="/help" element={<Help />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Toaster position="top-right" />
            <PageTransition />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
