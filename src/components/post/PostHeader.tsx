
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useFollow } from "@/hooks/use-follow";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import type { ProfileType } from "@/types/profile";

interface PostHeaderProps {
  author?: Omit<ProfileType, 'badges'> & {
    badges?: any;
  };
  timestamp?: string;
  isTrending?: boolean;
  onFollowClick?: () => void;
}

export default function PostHeader({ author, timestamp, isTrending, onFollowClick }: PostHeaderProps) {
  const { isFollowing } = useFollow();
  const { user } = useAuth();
  
  if (!author) return null;
  
  const formattedTime = timestamp 
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true }) 
    : "";
  
  const isCurrentUser = user?.id === author.id;
  const isFollowingAuthor = author?.id ? isFollowing(author.id) : false;

  return (
    <div className="flex items-start justify-between">
      <Link to={`/profile/${author.username}`} className="flex items-center group">
        <Avatar className="h-10 w-10 mr-3 border group-hover:border-primary transition-colors">
          <AvatarImage src={author.avatar_url || undefined} alt={author.full_name || author.username} />
          <AvatarFallback>{author.full_name?.charAt(0) || author.username?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        
        <div>
          <div className="flex items-center">
            <span className="font-medium group-hover:text-primary transition-colors">
              {author.full_name || author.username}
            </span>
            
            {author.is_verified && (
              <CheckCircle2 className="h-4 w-4 text-blue-500 ml-1" />
            )}
            
            {isTrending && (
              <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-800 border-orange-200 text-xs dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30">
                <BarChart3 className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground">{author.byline || author.position}</span>
            {timestamp && (
              <>
                <span className="mx-1 text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{formattedTime}</span>
              </>
            )}
          </div>
        </div>
      </Link>
      
      {!isCurrentUser && (
        <Button
          variant={isFollowingAuthor ? "outline" : "default"}
          size="sm"
          className="text-xs h-8"
          onClick={onFollowClick}
        >
          {isFollowingAuthor ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}
