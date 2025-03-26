
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, Users, Lightbulb, Sparkles, Settings, LogOut, 
  User, Calendar, BarChart, Award, HelpCircle, Compass
} from "lucide-react";
import { UserProfileMenu } from "../auth/UserProfileMenu";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { Logo } from "@/components/ui/logo";
import { useIsMobile } from "@/hooks/use-mobile";

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { signOut } = useAuth();
  const isMobile = useIsMobile();
  
  const isActive = (route: string) => {
    if (route === "/") {
      return path === route;
    }
    return path.startsWith(route);
  };

  const navItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Mentor Space", icon: Users, path: "/mentor-space" },
    { name: "Pitch Hub", icon: Lightbulb, path: "/pitch-hub" },
    { name: "Ascend", icon: Sparkles, path: "/ascend" },
    { name: "Discover", icon: Compass, path: "/discover" },
  ];

  const secondaryNavItems = [
    { name: "Calendar", icon: Calendar, path: "/calendar" },
    { name: "Analytics", icon: BarChart, path: "/analytics" },
    { name: "Achievements", icon: Award, path: "/achievements" },
  ];

  if (isMobile) return null;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen p-4 border-r border-border bg-background">
      <div className="flex items-center mb-6 animate-fade-in">
        <Logo className="h-8 w-auto" />
        <h1 className="ml-2 text-xl font-bold bg-gradient-to-r from-idolyst-blue to-idolyst-indigo bg-clip-text text-transparent">
          Idolyst
        </h1>
      </div>
      
      <div className="mb-2 px-3">
        <UserProfileMenu />
      </div>
      
      <Separator className="my-4" />
      
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm transition-colors group relative overflow-hidden",
              isActive(item.path) 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-foreground/60 hover:text-foreground hover:bg-accent/50"
            )}
          >
            {isActive(item.path) && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
            )}
            <item.icon 
              className={cn(
                "h-4 w-4 mr-3 transition-transform", 
                isActive(item.path) 
                  ? "text-primary" 
                  : "text-muted-foreground group-hover:text-foreground"
              )} 
            />
            <span className={isActive(item.path) ? "text-foreground" : ""}>{item.name}</span>
          </Link>
        ))}
        
        <Separator className="my-4" />
        
        {secondaryNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm transition-colors group relative overflow-hidden",
              isActive(item.path) 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-foreground/60 hover:text-foreground hover:bg-accent/50"
            )}
          >
            {isActive(item.path) && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
            )}
            <item.icon 
              className={cn(
                "h-4 w-4 mr-3 transition-transform", 
                isActive(item.path) 
                  ? "text-primary" 
                  : "text-muted-foreground group-hover:text-foreground"
              )} 
            />
            <span className={isActive(item.path) ? "text-foreground" : ""}>{item.name}</span>
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto space-y-2">
        <Separator className="my-2" />
        <Link
          to="/profile/settings"
          className="flex items-center px-3 py-2 rounded-md text-sm text-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
          Settings
        </Link>
        <Link
          to="/help"
          className="flex items-center px-3 py-2 rounded-md text-sm text-foreground/60 hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <HelpCircle className="h-4 w-4 mr-3 text-muted-foreground" />
          Help & Support
        </Link>
        <div className="flex items-center justify-between px-3 py-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="text-foreground/60 hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
