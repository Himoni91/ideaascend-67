
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  RocketIcon, 
  UsersIcon, 
  TrophyIcon, 
  BellIcon, 
  HomeIcon,
  MessagesSquareIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/use-notifications";
import { motion, AnimatePresence } from "framer-motion";

// Renamed from Sidebar to MainNav to match its current function
export default function MainNav() {
  const { user } = useAuth();
  const location = useLocation();
  const { profile } = useProfile(user?.id);
  const [indicatePitchhub, setIndicatePitchhub] = useState(false);
  const { unreadCount } = useNotifications();
  
  // Add animation for pitchhub indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 300 && !indicatePitchhub) {
        setIndicatePitchhub(true);
      } else if (scrollPosition <= 300 && indicatePitchhub) {
        setIndicatePitchhub(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [indicatePitchhub]);

  return (
    <nav className="hidden md:flex flex-col gap-1 p-2">
      <Button
        variant={location.pathname === "/" ? "default" : "ghost"}
        size="lg"
        className="justify-start"
        asChild
      >
        <Link to="/">
          <HomeIcon className="mr-2 h-5 w-5" />
          <span>Home</span>
        </Link>
      </Button>
      
      <Button
        variant={location.pathname.includes("/pitch-hub") ? "default" : "ghost"}
        size="lg"
        className="justify-start relative"
        asChild
      >
        <Link to="/pitch-hub">
          <RocketIcon className="mr-2 h-5 w-5" />
          <span>PitchHub</span>
          <AnimatePresence>
            {indicatePitchhub && !location.pathname.includes("/pitch-hub") && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full"
              />
            )}
          </AnimatePresence>
        </Link>
      </Button>
      
      <Button
        variant={location.pathname.includes("/mentor-space") ? "default" : "ghost"}
        size="lg"
        className="justify-start"
        asChild
      >
        <Link to="/mentor-space">
          <UsersIcon className="mr-2 h-5 w-5" />
          <span>MentorSpace</span>
        </Link>
      </Button>
      
      <Button
        variant={location.pathname.includes("/ascend") ? "default" : "ghost"}
        size="lg"
        className="justify-start"
        asChild
      >
        <Link to="/ascend">
          <TrophyIcon className="mr-2 h-5 w-5" />
          <span>Ascend</span>
        </Link>
      </Button>
      
      {user && (
        <>
          <Button
            variant={location.pathname.includes("/messages") ? "default" : "ghost"}
            size="lg"
            className="justify-start"
            asChild
          >
            <Link to="/messages">
              <MessagesSquareIcon className="mr-2 h-5 w-5" />
              <span>Messages</span>
            </Link>
          </Button>
          
          <Button
            variant={location.pathname.includes("/notifications") ? "default" : "ghost"}
            size="lg"
            className={cn("justify-start relative", unreadCount > 0 ? "font-medium" : "")}
            asChild
          >
            <Link to="/notifications">
              <BellIcon className="mr-2 h-5 w-5" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Link>
          </Button>
        </>
      )}
    </nav>
  );
}
