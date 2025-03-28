
import React, { useState } from 'react';
import { MentorReview } from '@/types/pitch';
import { formatDistanceToNow } from 'date-fns';
import { Star, Loader2, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

export interface MentorReviewsProps {
  reviews: MentorReview[];
  isLoading: boolean;
  onAddReview: (content: string, rating: number) => void;
  isSubmitting: boolean;
  canAddReview: boolean;
}

export default function MentorReviews({
  reviews,
  isLoading,
  onAddReview,
  isSubmitting,
  canAddReview,
}: MentorReviewsProps) {
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewContent.trim()) {
      onAddReview(reviewContent, rating);
      setReviewContent('');
      setRating(5);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {canAddReview && (
        <Card>
          <CardContent className="p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-500" />
              Add Mentor Review
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          rating >= star
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="review" className="block text-sm font-medium mb-2">
                  Your Review
                </label>
                <Textarea
                  id="review"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Share your professional feedback on this idea..."
                  className="min-h-[120px]"
                />
              </div>
              <div className="flex justify-end">
                <Button disabled={isSubmitting || !reviewContent.trim()}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-6 bg-muted/30 rounded-lg">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">No Mentor Reviews Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Mentor reviews will appear here once mentors provide their professional feedback.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {reviews.map((review) => (
              <motion.div
                key={review.id}
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
                          src={review.mentor?.avatar_url || undefined}
                          alt={review.mentor?.full_name || 'Mentor'}
                        />
                        <AvatarFallback>
                          {review.mentor?.full_name?.[0] ||
                            review.mentor?.username?.[0] ||
                            'M'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <div className="font-medium flex items-center gap-2">
                            {review.mentor?.full_name || review.mentor?.username || 'Mentor'}
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              Mentor
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          </div>
                        </div>
                        <div className="flex mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                review.rating >= star
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm whitespace-pre-line">{review.content}</div>
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
