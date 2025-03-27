
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext"; 
import { RouteGuard } from "@/components/auth/RouteGuard";
import { AuthStatus } from "@/components/auth/AuthStatus";

// Pages
import Index from "./pages/Index";
import PostDetailPage from "./pages/post/[id]";
import PitchHub from "./pages/PitchHub";
import PitchHubIdeaDetail from "./pages/PitchHubIdeaDetail";
import MentorSpace from "./pages/MentorSpace";
import MentorProfile from "./pages/MentorProfile";
import Ascend from "./pages/Ascend";
import EnhancedProfile from "./pages/EnhancedProfile";
import ProfileSettings from "./pages/ProfileSettings";
import Discover from "./pages/Discover";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Achievements from "./pages/Achievements";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

// Auth Pages
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import CheckEmail from "./pages/auth/CheckEmail";
import UpdatePassword from "./pages/auth/UpdatePassword";
import Verification from "./pages/auth/Verification";
import Callback from "./pages/auth/Callback";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AuthStatus />
            <Routes>
              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <RouteGuard requireAuth={true}>
                    <Index />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/post/:id" 
                element={
                  <RouteGuard requireAuth={true}>
                    <PostDetailPage />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/pitch-hub" 
                element={
                  <RouteGuard requireAuth={true}>
                    <PitchHub />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/pitch-hub/:id" 
                element={
                  <RouteGuard requireAuth={true}>
                    <PitchHubIdeaDetail />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/mentor-space" 
                element={
                  <RouteGuard requireAuth={true}>
                    <MentorSpace />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/mentor-space/:id" 
                element={
                  <RouteGuard requireAuth={true}>
                    <MentorProfile />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/ascend" 
                element={
                  <RouteGuard requireAuth={true}>
                    <Ascend />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/discover" 
                element={
                  <RouteGuard requireAuth={true}>
                    <Discover />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <RouteGuard requireAuth={true}>
                    <EnhancedProfile />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/profile/:username" 
                element={
                  <RouteGuard requireAuth={true}>
                    <EnhancedProfile />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/profile/settings" 
                element={
                  <RouteGuard requireAuth={true}>
                    <ProfileSettings />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/calendar" 
                element={
                  <RouteGuard requireAuth={true}>
                    <Calendar />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <RouteGuard requireAuth={true}>
                    <Analytics />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/achievements" 
                element={
                  <RouteGuard requireAuth={true}>
                    <Achievements />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/help" 
                element={
                  <RouteGuard requireAuth={true}>
                    <Help />
                  </RouteGuard>
                } 
              />

              {/* Auth Routes */}
              <Route 
                path="/auth/sign-in" 
                element={
                  <RouteGuard requireAuth={false}>
                    <SignIn />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/auth/sign-up" 
                element={
                  <RouteGuard requireAuth={false}>
                    <SignUp />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/auth/forgot-password" 
                element={
                  <RouteGuard requireAuth={false}>
                    <ForgotPassword />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/auth/check-email" 
                element={
                  <RouteGuard requireAuth={false}>
                    <CheckEmail />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/auth/update-password" 
                element={
                  <RouteGuard requireAuth={false}>
                    <UpdatePassword />
                  </RouteGuard>
                } 
              />
              <Route 
                path="/auth/verification" 
                element={
                  <RouteGuard requireAuth={false}>
                    <Verification />
                  </RouteGuard>
                } 
              />
              <Route path="/auth/callback" element={<Callback />} />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
