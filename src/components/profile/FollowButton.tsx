
import { useFollow } from "@/hooks/use-follow";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
}

export default function FollowButton({ 
  userId, 
  variant = "default", 
  size = "default",
  className = "",
  showIcon = true
}: FollowButtonProps) {
  const { isFollowing, isLoading, followUser, unfollowUser } = useFollow(userId);
  
  const handleFollowAction = () => {
    if (isFollowing) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  };
  
  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleFollowAction}
      disabled={isLoading}
      className={className}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center"
          >
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading
          </motion.div>
        ) : isFollowing ? (
          <motion.div
            key="following"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center"
          >
            {showIcon && <UserMinus className="h-4 w-4 mr-2" />}
            Following
          </motion.div>
        ) : (
          <motion.div
            key="follow"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center"
          >
            {showIcon && <UserPlus className="h-4 w-4 mr-2" />}
            Follow
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
