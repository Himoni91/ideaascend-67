
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MessageSquare,
  CalendarDays,
  LineChart,
  User,
  RocketIcon,
  HomeIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/use-notifications";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  // Navigation items
  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: HomeIcon
    },
    {
      name: "MentorSpace",
      path: "/mentor-space",
      icon: CalendarDays
    },
    {
      name: "PitchHub",
      path: "/pitch-hub",
      icon: RocketIcon,
      primary: true
    },
    {
      name: "Messages",
      path: "/messages",
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    {
      name: "Profile",
      path: user ? `/profile/@${user.user_metadata?.username || user.id}` : "/auth/sign-in",
      icon: User
    }
  ];

  // Check if the current path matches a navigation item
  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border px-2 z-40"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <div className="flex h-full items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => (
          <motion.button
            key={item.name}
            className={cn(
              "relative flex flex-col items-center justify-center w-16 h-full",
              item.primary ? "text-primary" : "text-muted-foreground",
              isActivePath(item.path) && !item.primary && "text-foreground"
            )}
            onClick={() => navigate(item.path)}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.1 }}
          >
            {/* Special indicator for primary item */}
            {item.primary && (
              <div className="absolute -top-5 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <item.icon className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            
            {!item.primary && (
              <>
                <item.icon className={cn(
                  "h-5 w-5 mb-1",
                  isActivePath(item.path) && "text-primary"
                )} />
                <span className="text-xs">{item.name}</span>
                
                {/* Badge for unread items */}
                {item.badge && (
                  <span className="absolute top-1 right-2 bg-primary text-primary-foreground text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 font-medium">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
