
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

type RouteGuardProps = {
  children: ReactNode;
  requireAuth?: boolean;
};

export function RouteGuard({ children, requireAuth = true }: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        // User is not logged in but the route requires auth
        navigate("/auth/sign-in", { state: { from: location.pathname } });
      } else if (!requireAuth && user) {
        // User is logged in but the route is for non-authenticated users (like sign in)
        navigate("/");
      }
    }
  }, [user, isLoading, requireAuth, navigate, location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only render children if conditions are met
  if ((requireAuth && user) || (!requireAuth && !user) || (!requireAuth && user && location.pathname === "/")) {
    return <>{children}</>;
  }

  return null;
}
