
import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Star, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MentorReview } from "@/types/pitch";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface MentorReviewsProps {
  reviews: MentorReview[];
  isLoading: boolean;
  onAddReview: (content: string, rating: number) => void;
  isSubmitting: boolean;
  canReview: boolean;
}

export default function MentorReviews({
  reviews,
  isLoading,
  onAddReview,
  isSubmitting,
  canReview
}: MentorReviewsProps) {
  const { user } = useAuth();
  const [reviewContent, setReviewContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) return;
    
    onAddReview(reviewContent, rating);
    setReviewContent("");
    setRating(5);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-4" />
                    ))}
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {canReview && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submit Mentor Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-1">
                <span className="mr-2 text-sm">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= (hoveredRating || rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span className="sr-only">{star} stars</span>
                  </Button>
                ))}
              </div>

              <Textarea
                placeholder="Share your professional opinion about this idea..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isSubmitting}
              />

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!reviewContent.trim() || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-muted-foreground opacity-20" />
                ))}
              </div>
              <h3 className="text-lg font-medium mb-1">No mentor reviews yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                This idea is waiting for professional mentor feedback
              </p>
              {user && !canReview && (
                <Button variant="outline" size="sm" disabled>
                  Only mentors can add reviews
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={review.mentor?.avatar_url || undefined} />
                        <AvatarFallback>{review.mentor?.full_name?.[0] || review.mentor?.username?.[0] || "M"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {review.mentor?.full_name || review.mentor?.username || "Anonymous Mentor"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                            Mentor
                          </div>
                        </div>
                        <div className="flex mt-2 mb-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm whitespace-pre-line">
                          {review.content}
                        </div>
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
