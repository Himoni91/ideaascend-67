
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Post, ReactionType } from "@/types/post";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, ThumbsUp, Lightbulb, DollarSign, Repeat, 
  Share2, ExternalLink, Bookmark, Copy, 
  Send, Twitter, Facebook, Linkedin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

interface ReactionButtonsProps {
  post: Post;
  onReaction?: (postId: string, reactionType: ReactionType) => void;
  onRepost?: (postId: string) => void;
  onBookmark?: (postId: string, bookmarked: boolean) => void;
  compact?: boolean;
}

export default function ReactionButtons({ 
  post, 
  onReaction, 
  onRepost,
  onBookmark,
  compact = false 
}: ReactionButtonsProps) {
  const { user } = useAuth();
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(
    post.userReaction ? post.userReaction.reaction_type as ReactionType : null
  );
  const [isReposted, setIsReposted] = useState<boolean>(post.isReposted || false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [reactionCounts, setReactionCounts] = useState({
    like: post.likes_count || 0,
    repost: post.reposts_count || 0,
    insightful: 0,
    fundable: 0
  });

  // Fetch additional reaction counts and check if user has reposted this post
  useEffect(() => {
    if (!post.id) return;

    const fetchReactionCounts = async () => {
      // Fetch counts for different reaction types
      const { data: insightfulData, error: insightfulError } = await supabase
        .from("post_reactions")
        .select("*", { count: "exact" })
        .eq("post_id", post.id)
        .eq("reaction_type", "insightful");

      const { data: fundableData, error: fundableError } = await supabase
        .from("post_reactions")
        .select("*", { count: "exact" })
        .eq("post_id", post.id)
        .eq("reaction_type", "fundable");

      if (!insightfulError && !fundableError) {
        setReactionCounts(prev => ({
          ...prev,
          insightful: insightfulData.length,
          fundable: fundableData.length
        }));
      }

      // Check if user has reposted this post
      if (user) {
        const { data: repostData } = await supabase
          .from("post_reposts")
          .select("*")
          .eq("post_id", post.id)
          .eq("user_id", user.id)
          .maybeSingle();

        setIsReposted(!!repostData);
      }
    };

    fetchReactionCounts();
  }, [post.id, user]);

  const handleReaction = (reactionType: ReactionType) => {
    if (!user) {
      toast.error("Please sign in to react to posts");
      return;
    }

    // Toggle reaction
    if (activeReaction === reactionType) {
      setActiveReaction(null);
      // Decrease count
      setReactionCounts(prev => ({
        ...prev,
        [reactionType]: Math.max(0, prev[reactionType] - 1)
      }));
    } else {
      // If already reacted with something else, decrease that count
      if (activeReaction) {
        setReactionCounts(prev => ({
          ...prev,
          [activeReaction]: Math.max(0, prev[activeReaction] - 1)
        }));
      }
      setActiveReaction(reactionType);
      // Increase count
      setReactionCounts(prev => ({
        ...prev,
        [reactionType]: prev[reactionType] + 1
      }));
    }

    if (onReaction) {
      onReaction(post.id, reactionType);
    }
  };

  const handleRepost = async () => {
    if (!user) {
      toast.error("Please sign in to repost");
      return;
    }

    if (user.id === post.user_id) {
      toast.error("You cannot repost your own post");
      return;
    }

    try {
      if (isReposted) {
        // Delete repost
        const { error } = await supabase
          .from("post_reposts")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);

        if (error) throw error;

        setIsReposted(false);
        setReactionCounts(prev => ({
          ...prev,
          repost: Math.max(0, prev.repost - 1)
        }));
        
        toast.success("Repost removed");
      } else {
        // Create repost
        const { error } = await supabase
          .from("post_reposts")
          .insert({
            post_id: post.id,
            user_id: user.id
          });

        if (error) throw error;

        setIsReposted(true);
        setReactionCounts(prev => ({
          ...prev,
          repost: prev.repost + 1
        }));
        
        toast.success("Post reposted to your profile");
      }

      if (onRepost) {
        onRepost(post.id);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    
    if (onBookmark) {
      onBookmark(post.id, !isBookmarked);
    }
    
    toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
  };

  const handleShare = async (platform?: string) => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    
    switch (platform) {
      case 'copy':
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copied to clipboard");
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=Check out this post&url=${encodeURIComponent(postUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=Check out this post&body=${encodeURIComponent(postUrl)}`, '_blank');
        break;
      default:
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copied to clipboard");
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleReaction('like')}
          className={cn(
            "text-xs flex items-center gap-1 text-muted-foreground",
            activeReaction === 'like' && "text-rose-500"
          )}
        >
          <Heart className={cn("h-3 w-3", activeReaction === 'like' && "fill-rose-500")} />
          {reactionCounts.like > 0 && reactionCounts.like}
        </button>
        <button 
          onClick={handleRepost}
          className={cn(
            "text-xs flex items-center gap-1 text-muted-foreground",
            isReposted && "text-emerald-500"
          )}
        >
          <Repeat className="h-3 w-3" />
          {reactionCounts.repost > 0 && reactionCounts.repost}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex gap-1 sm:gap-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('like')}
                className={cn(
                  "text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20",
                  activeReaction === 'like' && "text-rose-500"
                )}
              >
                <motion.div
                  animate={activeReaction === 'like' ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={cn(
                    "h-4 w-4 mr-1", 
                    activeReaction === 'like' && "fill-rose-500"
                  )} />
                </motion.div>
                {reactionCounts.like > 0 && <span>{reactionCounts.like}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Like</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('insightful')}
                className={cn(
                  "text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20",
                  activeReaction === 'insightful' && "text-amber-500"
                )}
              >
                <motion.div
                  animate={activeReaction === 'insightful' ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Lightbulb className={cn(
                    "h-4 w-4 mr-1", 
                    activeReaction === 'insightful' && "fill-amber-500"
                  )} />
                </motion.div>
                {reactionCounts.insightful > 0 && <span>{reactionCounts.insightful}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insightful</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('fundable')}
                className={cn(
                  "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20",
                  activeReaction === 'fundable' && "text-emerald-500"
                )}
              >
                <motion.div
                  animate={activeReaction === 'fundable' ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <DollarSign className={cn(
                    "h-4 w-4 mr-1", 
                    activeReaction === 'fundable' && "fill-emerald-500"
                  )} />
                </motion.div>
                {reactionCounts.fundable > 0 && <span>{reactionCounts.fundable}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fundable</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRepost}
                className={cn(
                  "text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20",
                  isReposted && "text-blue-500"
                )}
              >
                <motion.div
                  animate={isReposted ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Repeat className={cn("h-4 w-4 mr-1")} />
                </motion.div>
                {reactionCounts.repost > 0 && <span>{reactionCounts.repost}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Repost</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex gap-1">
        <TooltipProvider delayDuration={300}>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share</p>
              </TooltipContent>
            </Tooltip>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleShare('copy')}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy link</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('twitter')}>
                <Twitter className="mr-2 h-4 w-4" />
                <span>Share on Twitter</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('facebook')}>
                <Facebook className="mr-2 h-4 w-4" />
                <span>Share on Facebook</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                <Linkedin className="mr-2 h-4 w-4" />
                <span>Share on LinkedIn</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('email')}>
                <Send className="mr-2 h-4 w-4" />
                <span>Send via Email</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`/post/${post.id}`, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>Open in new tab</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={cn(
                  "text-muted-foreground hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20",
                  isBookmarked && "text-purple-500"
                )}
              >
                <Bookmark className={cn(
                  "h-4 w-4", 
                  isBookmarked && "fill-purple-500"
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isBookmarked ? "Remove bookmark" : "Bookmark"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
