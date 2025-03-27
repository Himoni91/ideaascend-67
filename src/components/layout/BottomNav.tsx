
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Home, 
  Rocket, 
  Users, 
  TrendingUp, 
  User,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItemType = {
  name: string;
  path: string;
  icon: LucideIcon;
  centerButton?: boolean;
};

const navItems: NavItemType[] = [
  {
    name: "Launchpad",
    path: "/",
    icon: Home,
  },
  {
    name: "MentorSpace",
    path: "/mentor-space",
    icon: Users,
  },
  {
    name: "PitchHub",
    path: "/pitch-hub",
    icon: Rocket,
    centerButton: true,
  },
  {
    name: "Ascend",
    path: "/ascend",
    icon: TrendingUp,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: User,
  },
];

export function BottomNav() {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 z-40 w-full md:hidden">
      <nav className="h-16 bg-background border-t flex items-center justify-around px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/" && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center relative px-2",
                item.centerButton ? "flex-1" : ""
              )}
            >
              {item.centerButton ? (
                <div className="absolute -top-5">
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shadow-lg",
                      isActive 
                        ? "bg-idolyst-blue text-white" 
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </motion.div>
                </div>
              ) : (
                <>
                  <item.icon
                    className={cn(
                      "h-5 w-5 mb-1",
                      isActive 
                        ? "text-idolyst-blue" 
                        : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isActive 
                        ? "text-foreground" 
                        : "text-muted-foreground"
                    )}
                  >
                    {item.name}
                  </span>
                </>
              )}
              {isActive && !item.centerButton && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-1 w-12 h-0.5 bg-idolyst-blue rounded-t-full"
                  transition={{ duration: 0.3 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
