
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  Search
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MentorReviewExtended } from "@/types/mentor";

interface MentorReviewsProps {
  reviews: MentorReviewExtended[];
  isLoading: boolean;
}

export default function MentorReviews({ reviews, isLoading }: MentorReviewsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;
  
  // Get rating counts
  const ratingCounts = reviews.reduce((acc: Record<number, number>, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {});
  
  // Filter reviews based on search and rating
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = searchTerm === "" || 
      review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewer?.username?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRating = ratingFilter === "all" || review.rating === parseInt(ratingFilter);
    
    return matchesSearch && matchesRating;
  });
  
  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortOrder === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortOrder === "highest") {
      return b.rating - a.rating;
    } else {
      return a.rating - b.rating;
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mentor Reviews & Ratings</CardTitle>
          <CardDescription>
            What mentees are saying about this mentor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                  <div className="flex mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(averageRating)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground stroke-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Based on {reviews.length} reviews
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <div className="flex items-center w-12">
                      <span className="mr-1">{rating}</span>
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden mr-2">
                      <div
                        className="h-full bg-yellow-500"
                        style={{
                          width: `${(ratingCounts[rating] || 0) / reviews.length * 100}%`
                        }}
                      />
                    </div>
                    <div className="w-8 text-xs text-right">
                      {ratingCounts[rating] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">Filter Reviews</h3>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="rating-filter" className="text-sm font-medium block mb-1.5">
                    Rating
                  </label>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger id="rating-filter">
                      <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="sort-order" className="text-sm font-medium block mb-1.5">
                    Sort By
                  </label>
                  <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                    <SelectTrigger id="sort-order">
                      <SelectValue placeholder="Sort reviews" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="highest">Highest Rated</SelectItem>
                      <SelectItem value="lowest">Lowest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="rounded-full bg-muted h-10 w-10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded" />
                      <div className="space-y-1">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="h-3 bg-muted rounded col-span-2" />
                          <div className="h-3 bg-muted rounded col-span-1" />
                        </div>
                        <div className="h-3 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedReviews.length > 0 ? (
          <>
            {sortedReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-3">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                          <AvatarFallback>
                            {review.reviewer?.full_name?.charAt(0) || review.reviewer?.username?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">
                            {review.reviewer?.full_name || review.reviewer?.username || "Anonymous"}
                          </h4>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>{format(parseISO(review.created_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-muted-foreground stroke-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm whitespace-pre-line">{review.content}</p>
                    
                    <div className="flex justify-end mt-4">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        <span className="text-xs">Helpful</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {sortedReviews.length > 5 && (
              <div className="flex justify-center mt-6">
                <Button variant="outline">
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Load More Reviews
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
              <h3 className="text-lg font-medium mb-1">No Reviews Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                This mentor hasn't received any reviews yet. Be the first to book a session and leave a review!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
