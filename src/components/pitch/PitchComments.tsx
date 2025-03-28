
import React, { useState } from 'react';
import { PitchComment } from '@/types/pitch';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface PitchCommentsProps {
  comments: PitchComment[];
  isLoading: boolean;
  onAddComment: (content: string) => void;
  isSubmitting: boolean;
}

export default function PitchComments({
  comments,
  isLoading,
  onAddComment,
  isSubmitting,
}: PitchCommentsProps) {
  const { user } = useAuth();
  const [commentContent, setCommentContent] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentContent.trim()) {
      onAddComment(commentContent);
      setCommentContent('');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <label htmlFor="comment" className="block text-sm font-medium mb-1">
              Add Your Comment
            </label>
            <Textarea
              id="comment"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder={
                user
                  ? 'Share your thoughts on this idea...'
                  : 'Please sign in to comment'
              }
              className="min-h-[100px]"
              disabled={!user || isSubmitting}
            />
            <div className="flex justify-end">
              <Button 
                disabled={!user || isSubmitting || !commentContent.trim()}
                className="gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-6 bg-muted/30 rounded-lg">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">No Comments Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Be the first to comment on this idea!
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={comment.author?.avatar_url || undefined}
                          alt={comment.author?.full_name || 'User'}
                        />
                        <AvatarFallback>
                          {comment.author?.full_name?.[0] ||
                            comment.author?.username?.[0] ||
                            'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <div className="font-medium flex items-center gap-2">
                            {comment.author?.full_name || comment.author?.username || 'Anonymous'}
                            {comment.is_mentor_comment && (
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                Mentor
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </div>
                        </div>
                        <div className="text-sm whitespace-pre-line">{comment.content}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
