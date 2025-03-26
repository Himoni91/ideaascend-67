
import { ReactNode, useState, useEffect } from "react";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const navigate = useNavigate();
  
  // Close right sidebar on mobile by default
  useEffect(() => {
    setShowRightSidebar(!isMobile);
  }, [isMobile]);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth/sign-in");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Left Sidebar - Hidden on mobile */}
      <Sidebar />
      
      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.main 
          className="flex-1 transition-all duration-300 overflow-x-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`container mx-auto px-4 py-6 max-w-7xl ${isMobile ? 'pb-20' : ''}`}>
            {children}
          </div>
          
          {/* Bottom Navigation - Only visible on mobile */}
          {isMobile && <BottomNav />}
        </motion.main>
      </AnimatePresence>
      
      {/* Right Sidebar - Toggleable on mobile */}
      {showRightSidebar && (
        <RightSidebar onClose={() => setShowRightSidebar(false)} />
      )}
      
      {/* Toggle right sidebar button - Only on mobile */}
      {isMobile && !showRightSidebar && (
        <motion.button 
          onClick={() => setShowRightSidebar(true)}
          className="fixed right-4 bottom-20 z-50 p-3 rounded-full bg-idolyst-blue text-white shadow-lg"
          aria-label="Show trending"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
          </svg>
        </motion.button>
      )}
    </div>
  );
}

export default AppLayout;
