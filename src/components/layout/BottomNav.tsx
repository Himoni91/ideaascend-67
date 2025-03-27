
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, Rocket, Sparkles, Menu, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/mentor-space", label: "Mentor", icon: Users },
    { path: "/pitch-hub", label: "Pitch", icon: Rocket, highlight: true },
    { path: "/ascend", label: "Ascend", icon: Sparkles },
    { path: "/messages", label: "Messages", icon: MessageSquare, badge: unreadCount },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  // Fetch unread message count
  useEffect(() => {
    if (!user) return;
    
    // Example: fetch unread count from supabase
    const fetchUnreadCount = async () => {
      try {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('is_read', false);
          
        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    
    fetchUnreadCount();
    
    // Set up realtime subscription for new messages
    const channel = supabase
      .channel('unread-messages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages', filter: `recipient_id=eq.${user.id}` },
        () => {
          fetchUnreadCount();
        })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <>
      <motion.nav
        className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center justify-around px-2 z-40"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        {navItems.map((item) => (
          <motion.button
            key={item.path}
            className={cn(
              "flex flex-col items-center justify-center h-full w-16 relative",
              isActive(item.path) ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => navigate(item.path)}
            whileTap={{ scale: 0.9 }}
          >
            {isActive(item.path) && (
              <motion.span
                className="absolute -top-1.5 w-8 h-1 bg-primary rounded-b-full"
                layoutId="activeTab"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              />
            )}
            
            <motion.div
              className={cn(
                "flex items-center justify-center rounded-full h-10 w-10",
                isActive(item.path) && "bg-primary/10",
                item.highlight && !isActive(item.path) && "text-idolyst-blue"
              )}
              whileHover={{ scale: 1.1 }}
            >
              <item.icon className={cn(
                "h-5 w-5",
                item.highlight && !isActive(item.path) ? "text-idolyst-blue" : ""
              )} />
              
              {item.badge && item.badge > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0"
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </Badge>
              )}
            </motion.div>
            
            <span className="text-xs mt-1">{item.label}</span>
          </motion.button>
        ))}
        
        <motion.button
          className="flex flex-col items-center justify-center h-full w-16 text-muted-foreground relative"
          onClick={() => setIsMenuOpen(true)}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            className="flex items-center justify-center rounded-full h-10 w-10"
            whileHover={{ scale: 1.1 }}
          >
            {user && profile ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>{profile.full_name?.[0] || profile.username?.[0] || "U"}</AvatarFallback>
              </Avatar>
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </motion.div>
          <span className="text-xs mt-1">More</span>
        </motion.button>
      </motion.nav>
      
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
            
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-xl p-4 z-50"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">More Options</h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full p-2 hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-1">
                <button
                  className="w-full text-left py-3 px-4 rounded-lg hover:bg-muted flex items-center"
                  onClick={() => {
                    navigate('/profile');
                    setIsMenuOpen(false);
                  }}
                >
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>{profile?.full_name?.[0] || profile?.username?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {profile?.full_name || profile?.username || "Your Profile"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      View your profile
                    </div>
                  </div>
                </button>
                
                {[
                  { label: "Calendar", path: "/calendar" },
                  { label: "Analytics", path: "/analytics" },
                  { label: "Achievements", path: "/achievements" },
                  { label: "Settings", path: "/profile/settings" },
                  { label: "Help & Support", path: "/help" },
                ].map((item) => (
                  <button
                    key={item.path}
                    className="w-full text-left py-3 px-4 rounded-lg hover:bg-muted"
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
