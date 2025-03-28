
import { Link, useLocation } from "react-router-dom";
import { HomeIcon, RocketIcon, TrophyIcon, UserIcon, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-t md:hidden py-2">
      <div className="flex justify-around items-center">
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center justify-center px-2 py-1 text-xs",
            isActive("/") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <HomeIcon className="h-5 w-5 mb-1" />
          <span>Home</span>
        </Link>
        
        <Link
          to="/mentor-space"
          className={cn(
            "flex flex-col items-center justify-center px-2 py-1 text-xs",
            isActive("/mentor-space") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <UsersIcon className="h-5 w-5 mb-1" />
          <span>Mentors</span>
        </Link>
        
        <Link
          to="/pitch-hub"
          className={cn(
            "flex flex-col items-center justify-center relative px-2 py-1 text-xs",
            isActive("/pitch-hub") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className="rounded-full bg-primary text-primary-foreground p-3 -mt-6 mb-1 shadow-lg">
            <RocketIcon className="h-5 w-5" />
          </div>
          <span>PitchHub</span>
        </Link>
        
        <Link
          to="/ascend"
          className={cn(
            "flex flex-col items-center justify-center px-2 py-1 text-xs",
            isActive("/ascend") ? "text-primary" : "text-muted-foreground"
          )}
        >
          <TrophyIcon className="h-5 w-5 mb-1" />
          <span>Ascend</span>
        </Link>
        
        <Link
          to={user ? `/profile/${user.id}` : "/auth/sign-in"}
          className={cn(
            "flex flex-col items-center justify-center px-2 py-1 text-xs",
            isActive(`/profile/${user?.id}`) ? "text-primary" : "text-muted-foreground"
          )}
        >
          {user && profile ? (
            <>
              <Avatar className="h-5 w-5 mb-1">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>{profile.full_name?.charAt(0) || profile.username?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <span>Profile</span>
            </>
          ) : (
            <>
              <UserIcon className="h-5 w-5 mb-1" />
              <span>Profile</span>
            </>
          )}
        </Link>
      </div>
    </div>
  );
}
