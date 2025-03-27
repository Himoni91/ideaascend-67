
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileType } from "@/types/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { TrendingUp, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import { motion } from "framer-motion";

interface PostHeaderProps {
  author: ProfileType;
  timestamp: string;
  isTrending?: boolean;
  compact?: boolean;
}

export default function PostHeader({ 
  author, 
  timestamp, 
  isTrending, 
  compact = false 
}: PostHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { followUser, unfollowUser, isFollowing, isLoading } = useProfile();
  
  const isCurrentUser = user?.id === author.id;
  const isFollowingAuthor = author?.id && typeof isFollowing === 'function' ? isFollowing(author.id) : false;
  
  const handleFollowToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading || !user || !author?.id) return;
    
    if (isFollowingAuthor) {
      unfollowUser(author.id);
    } else {
      followUser(author.id);
    }
  };
  
  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (author?.id) {
      navigate(`/profile/${author.id}`);
    }
  };

  return (
    <div 
      className="flex items-start justify-between mb-3" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="flex items-center cursor-pointer group" 
        onClick={handleAuthorClick}
      >
        <Avatar className={cn("h-10 w-10", compact && "h-8 w-8")}>
          <AvatarImage 
            src={author?.avatar_url || undefined} 
            alt={author?.full_name || author?.username || "User"}
          />
          <AvatarFallback>
            {author?.full_name?.[0] || author?.username?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <div className="flex items-center">
            <p className={cn("font-medium group-hover:text-primary transition-colors", 
              compact ? "text-xs" : "text-sm")}>
              {author?.full_name || author?.username}
            </p>
            {author?.is_verified && (
              <Badge variant="outline" className="ml-1 px-1 py-0 text-xs">
                <CheckCircle className="h-3 w-3 text-primary" />
              </Badge>
            )}
          </div>
          
          {author?.byline && (
            <p className="text-xs text-muted-foreground">{author.byline}</p>
          )}
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>
            {!author?.byline && author?.position && !compact && (
              <span className="hidden sm:inline">{author.position}</span>
            )}
            {isTrending && (
              <span className="flex items-center text-amber-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </span>
            )}
          </div>
        </div>
      </div>

      {!isCurrentUser && user && (
        <motion.div
          initial={{ opacity: compact ? 0 : 1 }}
          animate={{ opacity: compact && isHovered ? 1 : compact ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant={isFollowingAuthor ? "outline" : "default"}
            size="sm"
            className={cn(
              "rounded-full text-xs h-8",
              compact && "h-7 px-2.5 py-1"
            )}
            onClick={handleFollowToggle}
            disabled={isLoading}
          >
            {isFollowingAuthor ? "Following" : "Follow"}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
