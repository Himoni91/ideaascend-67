
import { ReactNode, useState, useEffect } from "react";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  
  // Close right sidebar on mobile by default
  useEffect(() => {
    setShowRightSidebar(!isMobile);
  }, [isMobile]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar - Hidden on mobile */}
      {!isMobile && <Sidebar />}
      
      {/* Main Content */}
      <main className="flex-1 transition-all duration-300 animate-fade-in">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </div>
        
        {/* Bottom Navigation - Only visible on mobile */}
        {isMobile && <BottomNav />}
      </main>
      
      {/* Right Sidebar - Toggleable on mobile */}
      {showRightSidebar && (
        <RightSidebar onClose={() => setShowRightSidebar(false)} />
      )}
      
      {/* Toggle right sidebar button - Only on mobile */}
      {isMobile && !showRightSidebar && (
        <button 
          onClick={() => setShowRightSidebar(true)}
          className="fixed right-4 bottom-20 z-50 p-3 rounded-full bg-idolyst-blue text-white shadow-lg"
          aria-label="Show trending"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
          </svg>
        </button>
      )}
    </div>
  );
};

export default AppLayout;
