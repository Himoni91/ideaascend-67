
import { Star, ThumbsUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { MentorReviewExtended } from "@/types/mentor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MentorReviewsProps {
  reviews: MentorReviewExtended[];
  isLoading?: boolean;
}

export default function MentorReviews({ reviews, isLoading = false }: MentorReviewsProps) {
  // Helper to render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? "text-yellow-500 fill-yellow-500"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-muted animate-pulse">
            <CardContent className="p-6 h-32"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="bg-muted/20">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No reviews yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                    <AvatarFallback>
                      {review.reviewer?.full_name?.charAt(0) ||
                        review.reviewer?.username?.charAt(0) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {review.reviewer?.full_name || review.reviewer?.username || "Anonymous"}
                    </h4>
                    <div className="flex items-center mt-1">
                      <div className="flex mr-2">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(parseISO(review.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm">{review.content}</p>
              <div className="flex justify-end mt-4">
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span className="text-xs">Helpful</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
