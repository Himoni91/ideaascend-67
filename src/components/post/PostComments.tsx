
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePostComments } from "@/hooks/use-post-comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, CornerDownRight, Trash } from "lucide-react";
import { PostComment } from "@/types/post";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface PostCommentsProps {
  postId: string;
  minimized?: boolean;
}

export default function PostComments({ postId, minimized = false }: PostCommentsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    comments,
    isLoading,
    addComment,
    deleteComment,
    replyingTo,
    setReplyingTo,
  } = usePostComments(postId);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState("");
  
  const handleSubmitComment = () => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }

    if (!newComment.trim()) return;
    
    addComment({ content: newComment });
    setNewComment("");
  };
  
  const handleSubmitReply = (parentId: string) => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }

    if (!replyContent.trim()) return;
    
    addComment({ content: replyContent, parentId });
    setReplyContent("");
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };
  
  const handleReplyKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>, parentId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitReply(parentId);
    }
  };

  // Comment component to display a single comment
  const Comment = ({ comment, isReply = false }: { comment: PostComment, isReply?: boolean }) => {
    const isUsersComment = user?.id === comment.user_id;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group ${isReply ? 'ml-8 pl-4 border-l border-muted' : ''}`}
      >
        <div className="flex items-start gap-3 py-3">
          <Avatar 
            className="h-8 w-8 cursor-pointer"
            onClick={() => navigate(`/profile/${comment.user?.id}`)}
          >
            <AvatarImage 
              src={comment.user?.avatar_url || undefined} 
              alt={comment.user?.full_name || comment.user?.username || "User"}
            />
            <AvatarFallback>
              {comment.user?.full_name?.[0] || comment.user?.username?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-semibold cursor-pointer hover:underline"
                onClick={() => navigate(`/profile/${comment.user?.id}`)}
              >
                {comment.user?.full_name || comment.user?.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            
            <p className="text-sm whitespace-pre-line">{comment.content}</p>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button 
                className="hover:text-foreground"
                onClick={() => {
                  if (!user) {
                    navigate("/auth/sign-in");
                    return;
                  }
                  setReplyingTo(comment.id);
                }}
              >
                Reply
              </button>
              
              {isUsersComment && (
                <button 
                  className="hover:text-destructive flex items-center gap-1"
                  onClick={() => deleteComment(comment.id)}
                >
                  <Trash className="h-3 w-3" />
                  Delete
                </button>
              )}
            </div>
            
            {/* Reply input */}
            <AnimatePresence>
              {replyingTo === comment.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 mt-2"
                >
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyPress={(e) => handleReplyKeyPress(e, comment.id)}
                    placeholder="Write a reply..."
                    className="min-h-[80px] text-sm"
                    autoFocus
                  />
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyContent.trim()}
                    >
                      Reply
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-0">
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // If minimized, show a simplified input for quick comments
  if (minimized) {
    return (
      <div className="border-t pt-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata?.name?.[0] || user?.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <Input
            placeholder="Write a comment..."
            className="text-sm rounded-full h-9"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onClick={() => !user && navigate("/auth/sign-in")}
          />
          <Button 
            size="sm" 
            className="rounded-full h-9"
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || !user}
          >
            Post
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-primary" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Comment input */}
        <div className="flex gap-3 mb-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata?.name?.[0] || user?.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder={user ? "Share your thoughts..." : "Sign in to comment"}
              className="min-h-[100px] text-sm"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!user}
              onClick={() => !user && navigate("/auth/sign-in")}
            />
            <div className="flex justify-end mt-2">
              <Button 
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || !user}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="my-3" />
        
        {/* Comments list */}
        <div className="space-y-0">
          {isLoading ? (
            <div className="text-center py-6">
              <div className="animate-pulse h-4 w-1/2 bg-muted rounded mx-auto mb-2"></div>
              <div className="animate-pulse h-4 w-1/3 bg-muted rounded mx-auto"></div>
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p>No comments yet</p>
              <p className="text-sm">Be the first to share your thoughts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
