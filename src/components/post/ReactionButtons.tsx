
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ThumbsUp, 
  MessageSquare, 
  Share, 
  BarChart3, 
  Lightbulb, 
  DollarSign,
  Repeat
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Post, ReactionType } from "@/types/post";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ReactionButtonsProps {
  post: Post;
  onReaction?: (postId: string, reactionType: ReactionType) => void;
  onRepost?: (postId: string) => void;
  compact?: boolean;
}

export default function ReactionButtons({ 
  post, 
  onReaction, 
  onRepost,
  compact = false 
}: ReactionButtonsProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleReaction = (reactionType: ReactionType) => {
    if (!user) {
      toast.error("Please sign in to react to posts");
      return;
    }
    
    if (onReaction) {
      onReaction(post.id, reactionType);
    }
  };

  const handleRepost = () => {
    if (!user) {
      toast.error("Please sign in to repost");
      return;
    }
    
    if (onRepost) {
      onRepost(post.id);
    }
  };
  
  const likeCount = post.likes_count || 0;
  const commentCount = post.comments_count || 0;
  const repostCount = post.reposts_count || 0;
  
  const isLiked = post.userReaction?.reaction_type === 'like';
  const isInsightful = post.userReaction?.reaction_type === 'insightful';
  const isFundable = post.userReaction?.reaction_type === 'fundable';
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleReaction('like')} 
          className={cn("text-muted-foreground hover:text-blue-500 transition-colors", 
                         isLiked && "text-blue-500")}
        >
          <ThumbsUp size={14} />
        </button>
        <span className="text-xs">{likeCount}</span>
        
        <button className="text-muted-foreground hover:text-primary transition-colors ml-1">
          <MessageSquare size={14} />
        </button>
        <span className="text-xs">{commentCount}</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('like')}
                className={cn(
                  "text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors",
                  isLiked && "text-blue-500 bg-blue-50 dark:bg-blue-950"
                )}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span>{likeCount > 0 ? likeCount : 'Like'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Like this post</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('insightful')}
                className={cn(
                  "text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors",
                  isInsightful && "text-amber-500 bg-amber-50 dark:bg-amber-950"
                )}
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                <span>Insightful</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mark as insightful</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('fundable')}
                className={cn(
                  "text-muted-foreground hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950 transition-colors",
                  isFundable && "text-green-500 bg-green-50 dark:bg-green-950"
                )}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                <span>Fundable</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mark as fundable</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-muted-foreground hover:text-green-500 transition-colors",
                  post.isReposted && "text-green-500"
                )}
                onClick={handleRepost}
              >
                <Repeat className="h-4 w-4 mr-1" />
                <span>{repostCount > 0 ? repostCount : 'Repost'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Repost to your followers</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Share className="h-4 w-4 mr-1" />
                    <span>Share</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share this post</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopyLink}>
              {copied ? "Copied!" : "Copy link"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${window.location.origin}/post/${post.id}`)}&text=${encodeURIComponent(post.content.substring(0, 100) + '...')}`, '_blank')}>
              Share on Twitter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/post/${post.id}`)}`, '_blank')}>
              Share on LinkedIn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
