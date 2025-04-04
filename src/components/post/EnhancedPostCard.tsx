
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/types/post";
import { BarChart3, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; 
import { useFollow } from "@/hooks/use-follow";
import { motion, AnimatePresence } from "framer-motion";
import { useEnhancedLinkPreview } from "@/hooks/use-enhanced-link-preview";
import { Button } from "@/components/ui/button";
import EnhancedLinkPreview from "./EnhancedLinkPreview";
import PostPoll from "./PostPoll";
import PostComments from "./PostComments";
import ReactionButtons from "./ReactionButtons";
import PostHeader from "./PostHeader";
import PostActionsMenu from "./PostActionsMenu";
import EditPostModal from "./EditPostModal";
import { usePostViews } from "@/hooks/use-post-views";
import { useIsMobile } from "@/hooks/use-mobile";

interface EnhancedPostCardProps {
  post: Post;
  onReaction?: (postId: string, reactionType: string) => void;
  onRepost?: (postId: string) => void;
  compact?: boolean;
  onClickComment?: (postId: string) => void;
  showComments?: boolean;
  onPostUpdated?: (updatedPost: Post) => void;
  onPostDeleted?: (postId: string) => void;
}

export default function EnhancedPostCard({ 
  post, 
  onReaction, 
  onRepost,
  compact = false, 
  onClickComment,
  showComments = false,
  onPostUpdated,
  onPostDeleted
}: EnhancedPostCardProps) {
  const { user } = useAuth();
  const { followUser, unfollowUser, isFollowing } = useFollow();
  const [showAllContent, setShowAllContent] = useState(false);
  const [showCommentsSection, setShowCommentsSection] = useState(showComments);
  const [showEditModal, setShowEditModal] = useState(false);
  const { linkPreview } = useEnhancedLinkPreview(post.content);
  const { viewCount } = usePostViews(post.id);
  const isMobile = useIsMobile();
  
  const isLongContent = post.content.length > 280;
  const displayContent = !showAllContent && isLongContent 
    ? post.content.substring(0, 280) + '...' 
    : post.content;
  
  const isAuthor = user?.id === post.user_id;
  
  const formattedDate = post.created_at 
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) 
    : "";
  
  const handleReaction = (postId: string, reactionType: string) => {
    if (!user) {
      toast.error("Please sign in to react to posts");
      return;
    }
    
    if (onReaction) {
      onReaction(postId, reactionType);
    }
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
  
  const handleFollowClick = () => {
    if (!user) {
      toast.error("Please sign in to follow users");
      return;
    }
    
    if (isAuthor) {
      toast.error("You cannot follow yourself");
      return;
    }
    
    const authorId = post.author?.id;
    if (!authorId) return;
    
    if (isFollowing(authorId)) {
      unfollowUser(authorId);
    } else {
      followUser(authorId);
    }
  };

  const handleCommentClick = () => {
    if (onClickComment) {
      onClickComment(post.id);
    } else {
      setShowCommentsSection(!showCommentsSection);
    }
  };
  
  const handleEditClick = () => {
    setShowEditModal(true);
  };
  
  const handlePostUpdated = (updatedPost: Post) => {
    if (onPostUpdated) {
      onPostUpdated(updatedPost);
    }
  };
  
  const handlePostDeleted = () => {
    if (onPostDeleted) {
      onPostDeleted(post.id);
    }
  };

  if (compact) {
    return (
      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-3">
          <Link to={`/post/${post.id}`} className="hover:underline">
            <h3 className="text-sm font-medium line-clamp-2">{post.content.substring(0, 100)}</h3>
          </Link>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to={`/profile/${post.author?.username}`} className="flex items-center">
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarImage src={post.author?.avatar_url || undefined} />
                  <AvatarFallback>
                    {post.author?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span>{post.author?.full_name || post.author?.username}</span>
              </Link>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
            <ReactionButtons post={post} onReaction={handleReaction} onRepost={handleRepost} compact={true} onClickComment={handleCommentClick} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <PostHeader 
            author={post.author}
            timestamp={post.created_at}
            isTrending={post.isTrending}
            onFollowClick={handleFollowClick}
          />
          
          <PostActionsMenu 
            post={post} 
            onEdit={handleEditClick} 
            onDelete={handlePostDeleted}
          />
        </div>
        
        <div className="mt-3 mb-4">
          <div className="whitespace-pre-wrap mb-4">
            {displayContent}
            {isLongContent && (
              <button
                onClick={() => setShowAllContent(!showAllContent)}
                className="ml-1 text-primary hover:underline text-sm font-medium"
              >
                {showAllContent ? "Show less" : "Read more"}
              </button>
            )}
          </div>
          
          {post.poll && (
            <PostPoll postId={post.id} />
          )}
          
          {linkPreview && !post.link_preview && (
            <EnhancedLinkPreview preview={linkPreview} />
          )}
          
          {post.media_url && (
            <div className="mt-3 rounded-lg overflow-hidden">
              {post.media_type?.includes('image') ? (
                <motion.img 
                  src={post.media_url} 
                  alt="Post attachment" 
                  className="w-full h-auto max-h-[500px] object-cover rounded-lg"
                  loading="lazy"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.01 }}
                />
              ) : post.media_type?.includes('video') ? (
                <video 
                  src={post.media_url} 
                  controls 
                  className="w-full h-auto max-h-[500px] rounded-lg"
                />
              ) : null}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {post.categories?.map((category) => (
            <Badge 
              key={category.id} 
              variant="outline"
              className="text-xs transition-all hover:bg-opacity-100"
              style={{ 
                backgroundColor: category.color ? `${category.color}20` : undefined,
                color: category.color || undefined
              }}
            >
              {category.icon && <span className="mr-1">{category.icon}</span>}
              {category.name}
            </Badge>
          ))}
          
          {post.isTrending && (
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30">
              <BarChart3 className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          )}
          
          {viewCount > 0 && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30">
              <Eye className="h-3 w-3 mr-1" />
              {viewCount} {viewCount === 1 ? 'view' : 'views'}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-3 flex justify-between">
        <ReactionButtons 
          post={post} 
          onReaction={handleReaction}
          onRepost={handleRepost}
          onClickComment={handleCommentClick}
          showComments={showCommentsSection}
          compact={isMobile}
        />
      </CardFooter>
      
      <AnimatePresence>
        {showCommentsSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pb-4">
              <PostComments postId={post.id} minimized={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <EditPostModal
        post={post}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onPostUpdated={handlePostUpdated}
      />
    </Card>
  );
}
