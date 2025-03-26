
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Post } from "@/types/post";
import { motion, AnimatePresence } from "framer-motion";
import { useReactionTypes } from "@/hooks/use-reaction-types";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  BookmarkPlus,
  Repeat
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

type ReactionButtonsProps = {
  post: Post;
  onReaction?: (postId: string, reactionType: string) => void;
  onRepost?: (postId: string) => void;
  compact?: boolean;
  showComments?: boolean;
  onClickComment?: () => void;
};

export default function ReactionButtons({
  post,
  onReaction,
  onRepost,
  compact = false,
  showComments = false,
  onClickComment,
}: ReactionButtonsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { reactionTypes, isLoading } = useReactionTypes();
  const [showReactions, setShowReactions] = useState(false);
  
  const handleReactionClick = (reactionType: string) => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }
    if (onReaction) {
      onReaction(post.id, reactionType);
      setShowReactions(false);
    }
  };

  const handleRepostClick = () => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }
    if (onRepost) {
      onRepost(post.id);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post on Idolyst',
          text: post.content.substring(0, 100) + '...',
          url: shareUrl
        });
      } catch (error) {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard");
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-full",
            post.userReaction?.reaction_type === "like" && "text-primary"
          )}
          onClick={() => handleReactionClick("like")}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </Button>
        <span className="text-xs">{post.likes_count || 0}</span>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full"
          onClick={onClickComment}
        >
          <MessageSquare className="h-3.5 w-3.5" />
        </Button>
        <span className="text-xs">{post.comments_count || 0}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 w-full">
      <div className="flex items-center">
        <Popover open={showReactions} onOpenChange={setShowReactions}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-muted-foreground hover:text-foreground group",
                post.userReaction && "text-primary hover:text-primary"
              )}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center"
              >
                {post.userReaction ? (
                  <span className="mr-1 text-lg group-hover:animate-bounce">
                    {reactionTypes.find(
                      (r) => r.name === post.userReaction?.reaction_type
                    )?.icon || "👍"}
                  </span>
                ) : (
                  <ThumbsUp className="h-4 w-4 mr-1 group-hover:text-primary" />
                )}
                <span>
                  {post.userReaction?.reaction_type === "like"
                    ? "Liked"
                    : post.userReaction?.reaction_type
                    ? post.userReaction.reaction_type.charAt(0).toUpperCase() +
                      post.userReaction.reaction_type.slice(1)
                    : "React"}
                </span>
                {post.likes_count ? (
                  <span className="ml-1">({post.likes_count})</span>
                ) : null}
              </motion.div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-1 flex bg-background/80 backdrop-blur-lg border rounded-full"
            align="start"
          >
            <AnimatePresence>
              <div className="flex gap-1">
                {reactionTypes.map((reaction) => (
                  <TooltipProvider key={reaction.id} delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          whileHover={{ 
                            scale: 1.2, 
                            y: -5,
                            transition: { type: "spring", stiffness: 400, damping: 10 }
                          }}
                          onClick={() => handleReactionClick(reaction.name)}
                          className={cn(
                            "text-2xl p-2 rounded-full hover:bg-muted transition-all",
                            post.userReaction?.reaction_type === reaction.name &&
                              "bg-primary/10"
                          )}
                          style={{
                            color: reaction.color || "currentColor",
                          }}
                        >
                          {reaction.icon}
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <span className="capitalize">{reaction.name}</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </AnimatePresence>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={onClickComment}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex items-center"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>Comment</span>
            {post.comments_count ? (
              <span className="ml-1">({post.comments_count})</span>
            ) : null}
          </motion.div>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-muted-foreground",
            post.isReposted && "text-green-500"
          )}
          onClick={handleRepostClick}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex items-center"
          >
            <Repeat className={cn(
              "h-4 w-4 mr-1",
              post.isReposted && "text-green-500"
            )} />
            <span>{post.isReposted ? "Reposted" : "Repost"}</span>
            {post.reposts_count ? (
              <span className="ml-1">({post.reposts_count})</span>
            ) : null}
          </motion.div>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={handleShare}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex items-center"
          >
            <Share2 className="h-4 w-4 mr-1" />
            <span>Share</span>
          </motion.div>
        </Button>
      </div>
    </div>
  );
}
