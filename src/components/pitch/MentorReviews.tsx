
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Award, Send, Star as StarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MentorReview } from "@/types/pitch";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface StarRatingProps {
  rating: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

const StarRating = ({ rating, onChange, disabled = false }: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={`${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} p-1`}
          onClick={() => !disabled && onChange(star)}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
        >
          <StarIcon
            className={`h-6 w-6 transition-colors ${
              star <= (hoverRating || rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

interface MentorReviewsProps {
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
  canAddReview
}: MentorReviewsProps) {
  const { user } = useAuth();
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim() || rating === 0) return;
    
    onAddReview(review, rating);
    setReview("");
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
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-3 w-24" />
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
      {canAddReview && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Add Mentor Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="font-medium text-sm">Rating</label>
                <StarRating 
                  rating={rating} 
                  onChange={setRating} 
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-medium text-sm">Review</label>
                <Textarea
                  placeholder="Share your expert insights on this pitch..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isSubmitting}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={!user || !review.trim() || rating === 0 || isSubmitting}
                className="w-full gap-2"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit Review
              </Button>
            </CardContent>
          </Card>
        </form>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
              <h3 className="text-lg font-medium mb-1">No mentor reviews yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {canAddReview 
                  ? "Be the first mentor to review this idea" 
                  : "Mentors haven't reviewed this idea yet"}
              </p>
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
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={review.mentor?.avatar_url || undefined} />
                        <AvatarFallback>{review.mentor?.full_name?.[0] || review.mentor?.username?.[0] || "M"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {review.mentor?.full_name || review.mentor?.username || "Anonymous"}
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300">
                                Mentor
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="mt-2 text-sm whitespace-pre-line">
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
