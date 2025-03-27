
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { MentorReview } from "@/types/pitch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MentorReviewsProps {
  reviews: MentorReview[];
  isLoading: boolean;
  onAddReview?: (content: string, rating: number) => void;
  isSubmitting?: boolean;
  canReview?: boolean;
}

export default function MentorReviews({ 
  reviews, 
  isLoading, 
  onAddReview, 
  isSubmitting = false,
  canReview = false 
}: MentorReviewsProps) {
  const { user } = useAuth();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  
  const handleSubmitReview = () => {
    if (!reviewText.trim()) return;
    onAddReview?.(reviewText, rating);
    setReviewText("");
    setRating(5);
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
      {user && canReview && onAddReview && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user.user_metadata?.full_name?.[0] || user.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
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
                            star <= rating 
                              ? "text-amber-500 fill-amber-500" 
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  placeholder="Provide a detailed review of this pitch..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="resize-none min-h-[120px]"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmitReview}
                    disabled={!reviewText.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <AnimatePresence>
        {reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <h3 className="text-lg font-medium mb-2">No mentor reviews yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This pitch hasn't received feedback from mentors yet.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="overflow-hidden border-blue-200 dark:border-blue-700">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={review.mentor?.avatar_url || undefined} />
                        <AvatarFallback>
                          {review.mentor?.full_name?.[0] || review.mentor?.username?.[0] || "M"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {review.mentor?.full_name || review.mentor?.username || "Anonymous Mentor"}
                          </span>
                          <Badge className="bg-blue-500 hover:bg-blue-600">
                            Mentor
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating 
                                  ? "text-amber-500 fill-amber-500" 
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {review.content}
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
