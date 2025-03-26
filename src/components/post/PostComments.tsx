
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { usePostComments } from "@/hooks/use-post-comments";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Reply, Send, Trash2, MoreVertical, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { PostComment } from "@/types/post";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

interface PostCommentsProps {
  postId: string;
  minimized?: boolean;
}

export default function PostComments({ postId, minimized = true }: PostCommentsProps) {
  const { user } = useAuth();
  const {
    comments,
    isLoading,
    addComment,
    deleteComment,
    replyingTo,
    setReplyingTo,
  } = usePostComments(postId);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [showAll, setShowAll] = useState(!minimized);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (replyingTo && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replyingTo]);

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment({ content: commentText.trim() });
      setCommentText("");
    }
  };

  const handleAddReply = () => {
    if (replyText.trim() && replyingTo) {
      addComment({ content: replyText.trim(), parentId: replyingTo });
      setReplyText("");
      setReplyingTo(null);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    action: () => void
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  const renderComment = (comment: PostComment, isReply = false) => {
    const isCommentOwner = user?.id === comment.user_id;
    const formattedDate = comment.created_at
      ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
      : "";

    return (
      <motion.div
        key={comment.id}
        className={`${isReply ? "ml-12 mt-3" : "mt-4"}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex gap-3">
          <Link to={`/profile/${comment.user?.username}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user?.avatar_url || undefined} />
              <AvatarFallback>
                {comment.user?.full_name?.[0] || comment.user?.username?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 space-y-1">
            <div className="bg-muted/40 dark:bg-muted/20 rounded-lg p-3 relative group">
              <div className="flex items-center justify-between">
                <Link
                  to={`/profile/${comment.user?.username}`}
                  className="font-medium text-sm hover:underline"
                >
                  {comment.user?.full_name || comment.user?.username}
                </Link>
                {isCommentOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => deleteComment(comment.id)}
                        className="text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="text-sm whitespace-pre-wrap my-1">{comment.content}</div>
              <div className="text-xs text-muted-foreground">{formattedDate}</div>
            </div>
            <div className="flex items-center space-x-2 px-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setReplyingTo(comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            </div>

            {replyingTo === comment.id && (
              <motion.div
                className="mt-2 flex gap-2 items-start"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar className="h-6 w-6 mt-1">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.user_metadata?.name?.[0] || user?.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    ref={replyInputRef}
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleAddReply)}
                    className="min-h-[60px] resize-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplyText("");
                        setReplyingTo(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={!replyText.trim()}
                      onClick={handleAddReply}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {comment.replies &&
                comment.replies.map((reply) => renderComment(reply, true))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  };

  // Determine which comments to display based on minimized state
  const visibleComments = showAll ? comments : comments.slice(0, 2);
  const hasMoreComments = minimized && comments.length > 2 && !showAll;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
        
        {hasMoreComments && (
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => setShowAll(true)}
            className="text-primary"
          >
            Show all comments
          </Button>
        )}
        
        {showAll && minimized && comments.length > 2 && (
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => setShowAll(false)}
            className="text-primary"
          >
            Show less
          </Button>
        )}
      </div>

      {user ? (
        <div className="flex gap-3 items-start">
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata?.name?.[0] || user?.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              ref={commentInputRef}
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleAddComment)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button
                disabled={!commentText.trim()}
                onClick={handleAddComment}
                className="relative overflow-hidden"
              >
                <span className={isLoading ? "opacity-0" : "opacity-100"}>
                  Post Comment
                </span>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card className="p-4 text-center">
          <p className="text-muted-foreground mb-2">
            Sign in to join the discussion
          </p>
          <Button asChild>
            <Link to="/auth/sign-in">Sign In</Link>
          </Button>
        </Card>
      )}

      {isLoading && comments.length === 0 ? (
        <div className="space-y-4 mt-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-muted"></div>
              <div className="flex-1">
                <div className="h-20 bg-muted rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <AnimatePresence>
            {visibleComments.map((comment) => renderComment(comment))}
          </AnimatePresence>

          {comments.length === 0 && !isLoading && (
            <div className="text-center py-6 text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </div>
          )}
        </>
      )}
    </div>
  );
}
