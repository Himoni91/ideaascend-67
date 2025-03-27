
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { PitchComment } from "@/types/pitch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PitchCommentsProps {
  comments: PitchComment[];
  isLoading: boolean;
  onAddComment: (content: string) => void;
  isSubmitting: boolean;
}

export default function PitchComments({ comments, isLoading, onAddComment, isSubmitting }: PitchCommentsProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  
  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(commentText);
    setCommentText("");
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {user && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user.user_metadata?.full_name?.[0] || user.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Share your thoughts on this idea..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="resize-none min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Comment"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <AnimatePresence>
        {comments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <h3 className="text-lg font-medium mb-2">No comments yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Be the first to share your thoughts on this idea.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className={cn(
                  "overflow-hidden",
                  comment.is_mentor_comment && "border-blue-200 dark:border-blue-700"
                )}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={comment.author?.avatar_url || undefined} />
                        <AvatarFallback>
                          {comment.author?.full_name?.[0] || comment.author?.username?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {comment.author?.full_name || comment.author?.username || "Anonymous"}
                          </span>
                          {comment.is_mentor_comment && (
                            <Badge className="bg-blue-500 hover:bg-blue-600">
                              Mentor
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
