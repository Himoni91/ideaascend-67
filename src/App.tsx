
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RouteGuard } from "@/components/auth/RouteGuard";

// Pages
import Index from "./pages/Index";
import PitchHub from "./pages/PitchHub";
import MentorSpace from "./pages/MentorSpace";
import Ascend from "./pages/Ascend";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Auth Pages
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import CheckEmail from "./pages/auth/CheckEmail";
import UpdatePassword from "./pages/auth/UpdatePassword";
import Verification from "./pages/auth/Verification";
import Callback from "./pages/auth/Callback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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
              path="/pitch-hub" 
              element={
                <RouteGuard requireAuth={true}>
                  <PitchHub />
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
              path="/ascend" 
              element={
                <RouteGuard requireAuth={true}>
                  <Ascend />
                </RouteGuard>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <RouteGuard requireAuth={true}>
                  <Profile />
                </RouteGuard>
              } 
            />
            <Route 
              path="/profile/:id" 
              element={
                <RouteGuard requireAuth={true}>
                  <Profile />
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
