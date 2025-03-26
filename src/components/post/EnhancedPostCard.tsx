
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Post } from "@/types/post";
import { usePosts } from "@/hooks/use-posts";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  MoreHorizontal,
  Bookmark,
  Link as LinkIcon,
  Flag,
  User,
  Trash,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import PostHeader from "./PostHeader";

interface EnhancedPostCardProps {
  post: Post;
  onClickComment?: (postId: string) => void;
  onClickShare?: (postId: string) => void;
  compact?: boolean;
}

export default function EnhancedPostCard({
  post,
  onClickComment,
  onClickShare,
  compact = false,
}: EnhancedPostCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { reactToPost } = usePosts();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const hasLiked = post.userReaction?.reaction_type === "like";
  const contentIsTooLong = post.content.length > 400;

  const displayContent = showFullContent || !contentIsTooLong
    ? post.content
    : `${post.content.substring(0, 400)}...`;

  const handleExpandContent = () => {
    setShowFullContent(!showFullContent);
  };

  const handleLike = () => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }
    reactToPost({ postId: post.id, reactionType: "like" });
  };

  const handleComment = () => {
    if (onClickComment) {
      onClickComment(post.id);
    } else {
      navigate(`/post/${post.id}`);
    }
  };

  const handleShare = () => {
    if (onClickShare) {
      onClickShare(post.id);
    } else {
      // Default share action - copy link to clipboard
      const url = `${window.location.origin}/post/${post.id}`;
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  const handleCardClick = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
    >
      <Card 
        className={cn(
          "mb-4 overflow-hidden hover:shadow-md transition-shadow cursor-pointer",
          compact && "shadow-sm"
        )}
        onClick={handleCardClick}
      >
        <CardContent className={cn("pt-6", compact && "p-4")}>
          {/* Author information */}
          <PostHeader 
            author={post.author!} 
            timestamp={post.created_at}
            isTrending={post.isTrending}
            compact={compact}
          />

          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.categories.map((category) => (
                <Badge
                  key={category.id}
                  style={{ backgroundColor: category.color || undefined }}
                  className="text-xs py-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/?category=${category.name}`);
                  }}
                >
                  {category.icon && <span className="mr-1">{category.icon}</span>}
                  {category.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Post content */}
          <div className="space-y-3">
            <p className={cn(
              "whitespace-pre-line",
              compact ? "text-xs" : "text-sm"
            )}>{displayContent}</p>
            
            {contentIsTooLong && !compact && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpandContent();
                }}
                className="flex items-center text-xs text-muted-foreground px-0"
              >
                {showFullContent ? "Show less" : "Read more"}
                <ChevronDown 
                  className={cn(
                    "ml-1 h-3 w-3 transition-transform", 
                    showFullContent && "rotate-180"
                  )} 
                />
              </Button>
            )}

            {/* Media display */}
            {post.media_url && post.media_type === "image" && (
              <div className={cn(
                "mt-3 rounded-lg overflow-hidden",
                compact && "max-h-[200px]"
              )}>
                <img
                  src={post.media_url}
                  alt="Post attachment"
                  className="w-full object-cover max-h-[400px]"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </CardContent>

        {/* Actions */}
        <CardFooter className={cn(
          "border-t py-3 flex justify-between",
          compact && "py-2 px-4"
        )}>
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            className={cn(
              "text-muted-foreground",
              hasLiked && "text-primary",
              compact && "h-8 px-2"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
          >
            <ThumbsUp
              className={cn(
                "mr-1 h-4 w-4",
                compact && "h-3.5 w-3.5",
                hasLiked && "fill-current"
              )}
            />
            <span className={cn(compact && "text-xs")}>
              {post.likes_count || 0}
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            className={cn(
              "text-muted-foreground",
              compact && "h-8 px-2"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleComment();
            }}
          >
            <MessageSquare className={cn("mr-1 h-4 w-4", compact && "h-3.5 w-3.5")} />
            <span className={cn(compact && "text-xs")}>
              {post.comments_count || 0}
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size={compact ? "sm" : "default"}
            className={cn(
              "text-muted-foreground",
              compact && "h-8 px-2"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
          >
            <Share2 className={cn("mr-1 h-4 w-4", compact && "h-3.5 w-3.5")} />
            <span className={cn(compact && "text-xs")}>Share</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-10 w-10", compact && "h-8 w-8")}
              >
                <MoreHorizontal className={cn("h-4 w-4", compact && "h-3.5 w-3.5")} />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={() => handleShare()}>
                <LinkIcon className="mr-2 h-4 w-4" />
                <span>Copy link</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(`/post/${post.id}`, '_blank')}>
                <Bookmark className="mr-2 h-4 w-4" />
                <span>Save post</span>
              </DropdownMenuItem>
              {post.author?.id === user?.id ? (
                <DropdownMenuItem className="cursor-pointer text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Delete post</span>
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/profile/${post.author?.id}`)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>View profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-destructive">
                    <Flag className="mr-2 h-4 w-4" />
                    <span>Report</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
