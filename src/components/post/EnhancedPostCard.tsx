
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface EnhancedPostCardProps {
  post: Post;
  onClickComment?: (postId: string) => void;
  onClickShare?: (postId: string) => void;
}

export default function EnhancedPostCard({
  post,
  onClickComment,
  onClickShare,
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
      setIsExpanded(!isExpanded);
    }
  };

  const handleShare = () => {
    if (onClickShare) {
      onClickShare(post.id);
    } else {
      // Default share action - copy link to clipboard
      const url = `${window.location.origin}/post/${post.id}`;
      navigator.clipboard.writeText(url);
      // Use toast if available, otherwise alert
      if (window.toast) {
        window.toast.success("Link copied to clipboard");
      } else {
        alert("Link copied to clipboard");
      }
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.author?.id) {
      navigate(`/profile/${post.author.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          {/* Author information */}
          <div className="flex items-start justify-between mb-4">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={handleAuthorClick}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={post.author?.avatar_url || undefined} 
                  alt={post.author?.full_name || post.author?.username || "User"}
                />
                <AvatarFallback>
                  {post.author?.full_name?.[0] || post.author?.username?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="flex items-center">
                  <p className="text-sm font-medium">
                    {post.author?.full_name || post.author?.username}
                  </p>
                  {post.author?.is_verified && (
                    <Badge variant="outline" className="ml-1 px-1 py-0 text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                  {post.isTrending && (
                    <span className="flex items-center text-amber-500">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </span>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
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
          </div>

          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.categories.map((category) => (
                <Badge
                  key={category.id}
                  style={{ backgroundColor: category.color || undefined }}
                  className="text-xs py-0"
                >
                  {category.icon && <span className="mr-1">{category.icon}</span>}
                  {category.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Post content */}
          <div className="space-y-3">
            <p className="text-sm whitespace-pre-line">{displayContent}</p>
            
            {contentIsTooLong && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleExpandContent}
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
              <div className="mt-3 rounded-lg overflow-hidden">
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
        <CardFooter className="border-t py-3 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-muted-foreground",
              hasLiked && "text-primary"
            )}
            onClick={handleLike}
          >
            <ThumbsUp
              className={cn(
                "mr-1 h-4 w-4",
                hasLiked && "fill-current"
              )}
            />
            {post.likes_count || 0}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={handleComment}
          >
            <MessageSquare className="mr-1 h-4 w-4" />
            {post.comments_count || 0}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={handleShare}
          >
            <Share2 className="mr-1 h-4 w-4" />
            Share
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
