
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MentorReviewExtended } from "@/types/mentor";
import { motion } from "framer-motion";

interface MentorReviewsProps {
  reviews: MentorReviewExtended[];
  isLoading: boolean;
}

export default function MentorReviews({ reviews, isLoading }: MentorReviewsProps) {
  const [showAll, setShowAll] = useState(false);
  const displayReviews = showAll ? reviews : reviews.slice(0, 3);
  
  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-3.5 w-3.5 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-200"}`} 
      />
    ));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex space-x-4 border-b pb-4 last:border-0 last:pb-0">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground">No reviews yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate average rating
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            Reviews ({reviews.length})
          </CardTitle>
          <div className="flex items-center">
            <div className="flex mr-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {displayReviews.map((review) => (
            <motion.div 
              key={review.id} 
              className="border-b last:border-0 pb-4 last:pb-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                    <AvatarFallback>
                      {review.reviewer?.full_name?.charAt(0) || review.reviewer?.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium">
                      {review.reviewer?.full_name || review.reviewer?.username || "Anonymous"}
                    </p>
                    <div className="flex text-yellow-500 mt-0.5">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm mt-3">{review.content}</p>
            </motion.div>
          ))}
          
          {reviews.length > 3 && (
            <div className="text-center pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show Less" : `View All ${reviews.length} Reviews`}
              </Button>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}
