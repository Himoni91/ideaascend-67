
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
  Repeat,
  Rocket,
  Heart,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Post, ReactionType } from "@/types/post";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { useReactionTypes } from "@/hooks/use-reaction-types";
import { motion, AnimatePresence } from "framer-motion";

interface ReactionButtonsProps {
  post: Post;
  onReaction?: (postId: string, reactionType: string) => void;
  onRepost?: (postId: string) => void;
  compact?: boolean;
  onCommentClick?: () => void;
}

export default function ReactionButtons({ 
  post, 
  onReaction, 
  onRepost,
  compact = false,
  onCommentClick
}: ReactionButtonsProps) {
  const { user } = useAuth();
  const { reactionTypes } = useReactionTypes();
  const [copied, setCopied] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  
  // Map reaction icons
  const reactionIcons: Record<string, React.ReactNode> = {
    like: <ThumbsUp className="h-4 w-4" />,
    insightful: <Lightbulb className="h-4 w-4" />,
    fundable: <DollarSign className="h-4 w-4" />,
    innovative: <Rocket className="h-4 w-4" />,
    helpful: <Heart className="h-4 w-4" />,
    inspiring: <Star className="h-4 w-4" />
  };
  
  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleReaction = (reactionType: string) => {
    if (!user) {
      toast.error("Please sign in to react to posts");
      return;
    }
    
    if (onReaction) {
      onReaction(post.id, reactionType);
    }
    
    setShowReactions(false);
  };

  const handleRepost = (postId: string) => {
    if (!user) {
      toast.error("Please sign in to repost");
      return;
    }

    if (onRepost) {
      onRepost(postId);
    }
  };
  
  const handleCommentClick = () => {
    if (onCommentClick) {
      onCommentClick();
    }
  };
  
  const likeCount = post.likes_count || 0;
  const commentCount = post.comments_count || 0;
  const repostCount = post.reposts_count || 0;
  
  const getUserReactionIcon = () => {
    if (!post.userReaction) return null;
    if (post.userReaction.reaction_type === 'repost') return <Repeat className="h-4 w-4 mr-1" />;
    return reactionIcons[post.userReaction.reaction_type] || <ThumbsUp className="h-4 w-4 mr-1" />;
  };
  
  const getUserReactionColor = () => {
    if (!post.userReaction) return "";
    
    const reactionType = reactionTypes.find(rt => rt.name === post.userReaction?.reaction_type);
    return reactionType?.color || "#3b82f6";
  };
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleReaction('like')} 
          className={cn(
            "text-muted-foreground hover:text-blue-500 transition-colors", 
            post.userReaction?.reaction_type === 'like' && "text-blue-500"
          )}
        >
          <ThumbsUp size={14} />
        </button>
        <span className="text-xs">{likeCount}</span>
        
        <button 
          className="text-muted-foreground hover:text-primary transition-colors ml-1"
          onClick={handleCommentClick}
        >
          <MessageSquare size={14} />
        </button>
        <span className="text-xs">{commentCount}</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex space-x-1">
        <Popover open={showReactions} onOpenChange={setShowReactions}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-muted-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors",
                post.userReaction && `text-[${getUserReactionColor()}]`
              )}
              style={post.userReaction ? { color: getUserReactionColor() } : undefined}
            >
              {getUserReactionIcon() || <ThumbsUp className="h-4 w-4 mr-1" />}
              <span>{likeCount > 0 ? likeCount : 'React'}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start" sideOffset={5}>
            <div className="flex gap-1">
              <AnimatePresence>
                {reactionTypes.filter(rt => rt.name !== 'repost').map((reaction) => (
                  <motion.button
                    key={reaction.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "p-2 rounded-full hover:bg-muted transition-colors",
                      post.userReaction?.reaction_type === reaction.name && `text-[${reaction.color}]`
                    )}
                    style={post.userReaction?.reaction_type === reaction.name ? { color: reaction.color || undefined } : undefined}
                    onClick={() => handleReaction(reaction.name)}
                    title={reaction.name.charAt(0).toUpperCase() + reaction.name.slice(1)}
                  >
                    <div className="text-xl">{reaction.icon}</div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </PopoverContent>
        </Popover>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCommentClick}
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{commentCount > 0 ? commentCount : 'Comment'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Comment on this post</p>
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
                onClick={() => handleRepost(post.id)}
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
            <DropdownMenuSeparator />
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
