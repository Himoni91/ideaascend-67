
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Loader2, ArrowLeft, ThumbsUp, ThumbsDown, 
  MessageSquare, Share2, Calendar, Eye, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { usePitches } from "@/hooks/use-pitches";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { Pitch } from "@/types/pitch";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PitchHubIdea = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [mentorReview, setMentorReview] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const { 
    usePitch, 
    usePitchComments, 
    useMentorReviews, 
    votePitch,
    addComment,
    addMentorReview,
    useAnalytics
  } = usePitches();
  
  const { data: pitch, isLoading, error } = usePitch(id as string);
  const { data: comments = [], refetch: refetchComments } = usePitchComments(id as string);
  const { data: reviews = [], refetch: refetchReviews } = useMentorReviews(id as string);
  const { data: analytics } = useAnalytics(id as string);
  
  // Handle voting
  const handleVote = (voteType: 'up' | 'down') => {
    if (!user) {
      toast.error("You must be logged in to vote");
      return;
    }
    
    votePitch({ pitchId: id as string, voteType });
  };
  
  // Handle adding a comment
  const handleAddComment = async () => {
    if (!comment.trim()) return;
    if (!user) {
      toast.error("You must be logged in to comment");
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      await addComment({
        pitchId: id as string,
        content: comment
      });
      
      setComment("");
      refetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Handle adding a mentor review
  const handleAddMentorReview = async () => {
    if (!mentorReview.trim()) return;
    if (!user) {
      toast.error("You must be logged in to add a review");
      return;
    }
    
    if (!profile?.is_mentor) {
      toast.error("Only mentors can add reviews");
      return;
    }
    
    setIsSubmittingReview(true);
    
    try {
      await addMentorReview({
        pitchId: id as string,
        content: mentorReview,
        rating
      });
      
      setMentorReview("");
      setRating(5);
      refetchReviews();
    } catch (error) {
      console.error("Error adding mentor review:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };
  
  // Handle sharing
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pitch?.title,
        text: `Check out this startup idea: ${pitch?.title}`,
        url: window.location.href
      }).catch((error) => console.error("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-idolyst-blue mb-4" />
          <span className="text-lg text-gray-600 dark:text-gray-300">Loading idea...</span>
        </div>
      </AppLayout>
    );
  }

  if (error || !pitch) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Idea Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error?.message || "The requested idea could not be found."}
          </p>
          <Button onClick={() => navigate("/pitch-hub")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to PitchHub
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isAuthor = user?.id === pitch.user_id;
  const isMentor = profile?.is_mentor;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/pitch-hub")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to PitchHub
        </Button>
        
        {/* Main Pitch Card */}
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={pitch.author?.avatar_url || undefined} />
                  <AvatarFallback>{pitch.author?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{pitch.author?.full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(pitch.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {pitch.is_premium && (
                  <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                    Premium
                  </Badge>
                )}
                <Badge>{pitch.category}</Badge>
                
                {isAuthor && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="sr-only">Open menu</span>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                          <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Idea</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete Idea</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            
            <CardTitle className="mt-4 text-2xl sm:text-3xl font-bold">{pitch.title}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Analytics Section */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 px-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="flex justify-center items-center mb-1">
                  <Eye className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-lg font-semibold">{analytics?.views || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Views</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center items-center mb-1">
                  <ThumbsUp className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-lg font-semibold">{pitch.votes_count || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Votes</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center items-center mb-1">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-lg font-semibold">{pitch.comments_count || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center items-center mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-lg font-semibold">{format(new Date(pitch.created_at), 'MMM d')}</span>
                </div>
                <p className="text-xs text-muted-foreground">Posted</p>
              </div>
            </div>
            
            {/* Problem Statement Section */}
            <div>
              <h3 className="font-semibold mb-2 text-lg">Problem Statement</h3>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {pitch.problem_statement}
              </div>
            </div>
            
            {/* Target Audience Section */}
            {pitch.target_audience && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Target Audience</h3>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {pitch.target_audience}
                </div>
              </div>
            )}
            
            {/* Solution Section */}
            {pitch.solution && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Solution</h3>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {pitch.solution}
                </div>
              </div>
            )}
            
            {/* Media Section */}
            {pitch.media_url && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Media</h3>
                <div className="rounded-lg overflow-hidden bg-muted/30 p-2">
                  <img 
                    src={pitch.media_url} 
                    alt={pitch.title} 
                    className="max-h-[400px] w-auto mx-auto object-contain rounded"
                  />
                </div>
              </div>
            )}
            
            {/* Tags Section */}
            <div>
              <h3 className="font-semibold mb-2 text-lg">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {pitch.tags && pitch.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="bg-secondary/20">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Button 
                variant={pitch.user_vote === "up" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleVote("up")}
                className="gap-1"
              >
                <ThumbsUp className="h-4 w-4" />
                {pitch.votes_count > 0 ? pitch.votes_count : 'Upvote'}
              </Button>
              
              <Button 
                variant={pitch.user_vote === "down" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleVote("down")}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShare}
                className="gap-1"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {/* Comments and Mentor Reviews Tabs */}
        <Tabs defaultValue="comments">
          <TabsList className="mb-4 w-full grid grid-cols-2">
            <TabsTrigger value="comments" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Comments ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="mentorFeedback" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Mentor Feedback ({reviews.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="comments">
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Add Comment Form */}
                {user && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{profile?.full_name}</span>
                    </div>
                    
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your comment..."
                      className="min-h-[100px]"
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleAddComment}
                        disabled={isSubmittingComment || !comment.trim()}
                      >
                        {isSubmittingComment ? (
                          <>
                            <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          "Add Comment"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Comments List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {comments.length > 0 ? `${comments.length} Comments` : "No comments yet"}
                  </h3>
                  
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                      <h3 className="text-lg font-medium mb-1">No comments yet</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                        Be the first to comment on this idea
                      </p>
                      {!user && (
                        <Button onClick={() => navigate("/auth/sign-in")}>
                          Sign In to Comment
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {comments.map((comment) => (
                        <div key={comment.id} className="py-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.author?.avatar_url || undefined} />
                              <AvatarFallback>{comment.author?.full_name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{comment.author?.full_name}</span>
                                {comment.is_mentor_comment && (
                                  <Badge variant="outline" className="text-xs bg-primary/10">Mentor</Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="mt-1 text-gray-700 dark:text-gray-300">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="mentorFeedback">
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Add Mentor Review Form */}
                {user && isMentor && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium text-sm">{profile?.full_name}</span>
                        <Badge variant="outline" className="ml-2 text-xs bg-primary/10">Mentor</Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="rating" className="block text-sm font-medium">
                        Rating
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`h-8 w-8 flex items-center justify-center rounded-full ${
                              star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                            }`}
                          >
                            <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M7.5 1.28a.75.75 0 0 0-.75.75v3.5H3.25a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5a.75.75 0 0 0-.75-.75z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                            </svg>
                          </button>
                        ))}
                        <span className="ml-2 text-sm font-medium">{rating} / 5</span>
                      </div>
                    </div>
                    
                    <Textarea
                      value={mentorReview}
                      onChange={(e) => setMentorReview(e.target.value)}
                      placeholder="Write your mentor review..."
                      className="min-h-[100px]"
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleAddMentorReview}
                        disabled={isSubmittingReview || !mentorReview.trim()}
                      >
                        {isSubmittingReview ? (
                          <>
                            <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          "Add Mentor Review"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Mentor Reviews List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {reviews.length > 0 ? `${reviews.length} Mentor Reviews` : "No mentor reviews yet"}
                  </h3>
                  
                  {reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                      <h3 className="text-lg font-medium mb-1">No mentor reviews yet</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                        This idea is waiting for mentor feedback
                      </p>
                      {user && !isMentor && (
                        <Button variant="outline" onClick={() => navigate("/mentor-space")}>
                          Connect with Mentors
                        </Button>
                      )}
                      {!user && (
                        <Button onClick={() => navigate("/auth/sign-in")}>
                          Sign In
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {reviews.map((review) => (
                        <div key={review.id} className="py-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.mentor?.avatar_url || undefined} />
                              <AvatarFallback>{review.mentor?.full_name?.charAt(0) || "M"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{review.mentor?.full_name}</span>
                                <Badge variant="outline" className="text-xs bg-primary/10">Mentor</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <svg 
                                    key={i} 
                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="ml-2 text-xs text-muted-foreground">Rating: {review.rating}/5</span>
                              </div>
                              <p className="mt-2 text-gray-700 dark:text-gray-300">{review.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PitchHubIdea;
