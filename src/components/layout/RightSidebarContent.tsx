
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/use-posts";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { PopularCategories } from "./PopularCategories";
import EnhancedPostCard from "../post/EnhancedPostCard";
import { motion } from "framer-motion";

export function RightSidebarContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Get trending posts
  const { posts, isLoading } = usePosts(undefined, "trending");
  
  // Take just the first 3 trending posts
  const trendingPosts = posts.slice(0, 3);
  
  return (
    <div className="space-y-6 p-4">
      {!user && (
        <motion.div 
          className="bg-card rounded-lg p-4 border shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="font-medium mb-2">Join Idolyst</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect with entrepreneurs, get mentorship, and grow your network.
          </p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => navigate("/auth/sign-up")}
              className="w-full"
            >
              Sign Up
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => navigate("/auth/sign-in")}
              className="w-full"
            >
              Sign In
            </Button>
          </div>
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <PopularCategories />
      </motion.div>
      
      <Separator />
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-3"
      >
        <h3 className="font-medium text-sm">Trending Now</h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[100px] bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        ) : trendingPosts.length > 0 ? (
          <div className="space-y-3">
            {trendingPosts.map((post) => (
              <EnhancedPostCard 
                key={post.id} 
                post={post} 
                compact={true}
              />
            ))}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs text-muted-foreground"
              onClick={() => navigate("/?filter=trending")}
            >
              See More Trending
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No trending posts at the moment.
          </p>
        )}
      </motion.div>
      
      <Separator />
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h3 className="font-medium text-sm mb-3">Discover More</h3>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => navigate("/pitch-hub")}
          >
            PitchHub
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => navigate("/mentor-space")}
          >
            MentorSpace
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => navigate("/ascend")}
          >
            Ascend Leaderboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
