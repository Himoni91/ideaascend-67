
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { RouteGuard } from "@/components/auth/RouteGuard";

// Layouts
import AppLayout from "@/components/layout/AppLayout";

// Pages
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import EnhancedProfile from "@/pages/EnhancedProfile";
import ProfileSettings from "@/pages/ProfileSettings";
import ProfileSecuritySettings from "@/pages/ProfileSecuritySettings";
import MentorProfile from "@/pages/MentorProfile";
import MentorSpace from "@/pages/MentorSpace";
import PitchHub from "@/pages/PitchHub";
import PitchHubIdea from "@/pages/PitchHubIdea";
import Ascend from "@/pages/Ascend";
import Discover from "@/pages/Discover";
import Analytics from "@/pages/Analytics";
import Calendar from "@/pages/Calendar";
import Achievements from "@/pages/Achievements";
import Help from "@/pages/Help";
import NotFound from "@/pages/NotFound";

// Auth Pages
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import UpdatePassword from "@/pages/auth/UpdatePassword";
import Verification from "@/pages/auth/Verification";
import Callback from "@/pages/auth/Callback";
import CheckEmail from "@/pages/auth/CheckEmail";
import TwoFactor from "@/pages/auth/TwoFactor";
import SetupTwoFactor from "@/pages/auth/SetupTwoFactor";

// Post Pages
import PostDetail from "@/pages/post/[id]";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes that don't require auth */}
            <Route path="/auth/sign-in" element={<RouteGuard requireAuth={false}><SignIn /></RouteGuard>} />
            <Route path="/auth/sign-up" element={<RouteGuard requireAuth={false}><SignUp /></RouteGuard>} />
            <Route path="/auth/forgot-password" element={<RouteGuard requireAuth={false}><ForgotPassword /></RouteGuard>} />
            <Route path="/auth/update-password" element={<RouteGuard requireAuth={false}><UpdatePassword /></RouteGuard>} />
            <Route path="/auth/verification" element={<RouteGuard requireAuth={false}><Verification /></RouteGuard>} />
            <Route path="/auth/callback" element={<Callback />} />
            <Route path="/auth/check-email" element={<RouteGuard requireAuth={false}><CheckEmail /></RouteGuard>} />
            <Route path="/auth/two-factor" element={<RouteGuard requireAuth={false}><TwoFactor /></RouteGuard>} />
            
            {/* Protected routes */}
            <Route element={<AppLayout><Outlet /></AppLayout>}>
              <Route path="/" element={<RouteGuard><Index /></RouteGuard>} />
              <Route path="/profile" element={<RouteGuard><Profile /></RouteGuard>} />
              <Route path="/profile/enhanced" element={<RouteGuard><EnhancedProfile /></RouteGuard>} />
              <Route path="/profile/settings" element={<RouteGuard><ProfileSettings /></RouteGuard>} />
              <Route path="/profile/security" element={<RouteGuard><ProfileSecuritySettings /></RouteGuard>} />
              <Route path="/auth/setup-two-factor" element={<RouteGuard><SetupTwoFactor /></RouteGuard>} />
              <Route path="/mentor/:id" element={<RouteGuard><MentorProfile /></RouteGuard>} />
              <Route path="/mentor-space" element={<RouteGuard><MentorSpace /></RouteGuard>} />
              <Route path="/pitch-hub" element={<RouteGuard><PitchHub /></RouteGuard>} />
              <Route path="/pitch-hub/:id" element={<RouteGuard><PitchHubIdea /></RouteGuard>} />
              <Route path="/ascend" element={<RouteGuard><Ascend /></RouteGuard>} />
              <Route path="/discover" element={<RouteGuard><Discover /></RouteGuard>} />
              <Route path="/analytics" element={<RouteGuard><Analytics /></RouteGuard>} />
              <Route path="/calendar" element={<RouteGuard><Calendar /></RouteGuard>} />
              <Route path="/achievements" element={<RouteGuard><Achievements /></RouteGuard>} />
              <Route path="/help" element={<RouteGuard><Help /></RouteGuard>} />
              <Route path="/post/:id" element={<RouteGuard><PostDetail /></RouteGuard>} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <Toaster position="top-right" expand={false} richColors />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
