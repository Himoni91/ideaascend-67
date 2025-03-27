
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import FollowButton from "@/components/profile/FollowButton";
import type { ProfileType } from "@/types/profile";
import { useAuth } from "@/contexts/AuthContext";

interface PostHeaderProps {
  author?: Omit<ProfileType, 'badges'> & {
    badges?: any;
  };
  timestamp?: string;
  isTrending?: boolean;
  onFollowClick?: () => void;
  hideFollow?: boolean;
}

export default function PostHeader({ 
  author, 
  timestamp, 
  isTrending, 
  onFollowClick,
  hideFollow = false
}: PostHeaderProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  if (!author) return null;
  
  const formattedTime = timestamp 
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true }) 
    : "";
  
  const isCurrentUser = user?.id === author.id;

  return (
    <div className="flex items-start justify-between w-full">
      <Link to={`/profile/${author.username}`} className="flex items-center group flex-shrink min-w-0">
        <Avatar className="h-10 w-10 mr-3 border group-hover:border-primary transition-colors flex-shrink-0">
          <AvatarImage src={author.avatar_url || undefined} alt={author.full_name || author.username} />
          <AvatarFallback>{author.full_name?.charAt(0) || author.username?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        
        <div className="min-w-0">
          <div className="flex items-center flex-wrap gap-1">
            <span className="font-medium group-hover:text-primary transition-colors truncate">
              {author.full_name || author.username}
            </span>
            
            {author.is_verified && (
              <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
            )}
            
            {isTrending && !isMobile && (
              <Badge variant="outline" className="ml-1 bg-orange-100 text-orange-800 border-orange-200 text-xs dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30 flex-shrink-0">
                <BarChart3 className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="truncate">{author.byline || author.position}</span>
            {timestamp && (
              <>
                <span className="mx-1 text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{formattedTime}</span>
              </>
            )}
          </div>
        </div>
      </Link>
      
      {!isCurrentUser && !hideFollow && !isMobile && (
        <FollowButton 
          userId={author.id}
          variant="outline"
          size="sm"
          className="text-xs h-8 ml-2 whitespace-nowrap flex-shrink-0"
          showIcon={false}
        />
      )}
    </div>
  );
}
