
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type RouteGuardProps = {
  children: ReactNode;
  requireAuth?: boolean;
};

export function RouteGuard({ children, requireAuth = true }: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Add a slight delay before showing the loader to prevent flashes
    // for quick auth checks
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowLoader(true);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) {
      // Hide the loader as soon as loading is done
      setShowLoader(false);
      
      if (requireAuth && !user) {
        // User is not logged in but the route requires auth
        // Store the current location so we can redirect back after login
        navigate("/auth/sign-in", { state: { from: location.pathname } });
      } else if (!requireAuth && user) {
        // User is logged in but the route is for non-authenticated users (like sign in)
        navigate("/");
      } else {
        // User is authenticated and the route requires auth, or
        // User is not authenticated and the route doesn't require auth
        setIsAuthorized(true);
      }
    }
  }, [user, isLoading, requireAuth, navigate, location]);

  if (showLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <Loader2 className="size-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your experience...</p>
        </motion.div>
      </div>
    );
  }

  // Only render children if conditions are met
  return isAuthorized ? <>{children}</> : null;
}
