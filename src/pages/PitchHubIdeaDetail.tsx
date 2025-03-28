import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Eye,
  Award,
  Star,
  Rocket,
  BarChart3
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePitches } from "@/hooks/use-pitches";
import PitchComments from "@/components/pitch/PitchComments";
import MentorReviews from "@/components/pitch/MentorReviews";
import { supabase } from "@/integrations/supabase/client";

export default function PitchHubIdeaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("comments");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isAddingReview, setIsAddingReview] = useState(false);
  
  const { usePitch, usePitchComments, useMentorReviews, votePitch, addComment, addMentorReview, useAnalytics } = usePitches();
  
  const { data: pitch, isLoading: isPitchLoading, error: pitchError } = usePitch(id!);
  const { data: comments, isLoading: isCommentsLoading } = usePitchComments(id!);
  const { data: reviews, isLoading: isReviewsLoading } = useMentorReviews(id!);
  const { data: analytics, isLoading: isAnalyticsLoading } = useAnalytics(id!);
  
  const [isMentor, setIsMentor] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  
  useEffect(() => {
    const checkIsMentor = async () => {
      if (!user) {
        setIsMentor(false);
        return;
      }
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('is_mentor')
          .eq('id', user.id)
          .single();
          
        setIsMentor(!!data?.is_mentor);
      } catch (error) {
        console.error("Error checking mentor status:", error);
        setIsMentor(false);
      }
    };
    
    checkIsMentor();
  }, [user]);
  
  useEffect(() => {
    if (user && reviews) {
      setHasReviewed(reviews.some(review => review.mentor_id === user.id));
    } else {
      setHasReviewed(false);
    }
  }, [user, reviews]);
  
  const handleVote = (voteType: 'up' | 'down') => {
    if (!user) {
      toast.error("Please sign in to vote");
      navigate("/auth/sign-in");
      return;
    }
    
    if (!id) return;
    
    votePitch({ pitchId: id, voteType });
  };
  
  const handleAddComment = (content: string) => {
    if (!user) {
      toast.error("Please sign in to comment");
      navigate("/auth/sign-in");
      return;
    }
    
    if (!id) return;
    
    setIsAddingComment(true);
    
    addComment(
      { pitchId: id, content },
      {
        onSettled: () => {
          setIsAddingComment(false);
        },
        onSuccess: () => {
          toast.success("Comment added successfully");
        },
        onError: (error: any) => {
          toast.error(`Failed to add comment: ${error.message}`);
        }
      }
    );
  };
  
  const handleAddReview = (content: string, rating: number) => {
    if (!user) {
      toast.error("Please sign in to review");
      navigate("/auth/sign-in");
      return;
    }
    
    if (!id) return;
    
    if (!isMentor) {
      toast.error("Only mentors can add reviews");
      return;
    }
    
    if (hasReviewed) {
      toast.error("You have already reviewed this pitch");
      return;
    }
    
    setIsAddingReview(true);
    
    addMentorReview(
      { pitchId: id, content, rating },
      {
        onSettled: () => {
          setIsAddingReview(false);
        },
        onSuccess: () => {
          toast.success("Review added successfully");
        },
        onError: (error: any) => {
          toast.error(`Failed to add review: ${error.message}`);
        }
      }
    );
  };
  
  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pitch?.title || 'Startup Idea on Idolyst',
          text: `Check out this startup idea: ${pitch?.title}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };
  
  if (isPitchLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/pitch-hub")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to PitchHub
          </Button>
          
          <div className="space-y-6">
            <Skeleton className="h-8 w-2/3" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (pitchError || !pitch) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Idea Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The requested idea could not be found or you may not have permission to view it.
          </p>
          <Button onClick={() => navigate("/pitch-hub")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to PitchHub
          </Button>
        </div>
      </AppLayout>
    );
  }
  
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
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <Badge variant="outline" className="font-normal">
                  {pitch.category}
                </Badge>
                
                <div className="flex gap-2">
                  {pitch.trending_score > 50 && (
                    <Badge className="gap-1 bg-orange-500 hover:bg-orange-600">
                      <Rocket className="h-3.5 w-3.5 mr-1" />
                      Trending
                    </Badge>
                  )}
                  
                  {pitch.is_premium && (
                    <Badge className="gap-1 bg-amber-500 hover:bg-amber-600">
                      <Star className="h-3.5 w-3.5 mr-1" />
                      Premium
                    </Badge>
                  )}
                  
                  {reviews && reviews.length > 0 && (
                    <Badge className="gap-1 bg-blue-500 hover:bg-blue-600">
                      <Award className="h-3.5 w-3.5 mr-1" />
                      Reviewed
                    </Badge>
                  )}
                </div>
              </div>
              
              <h1 className="text-3xl font-bold mb-4">
                {pitch.title}
              </h1>
              
              <div className="flex items-center mb-6">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={pitch.author?.avatar_url || undefined} alt={pitch.author?.full_name || "User"} />
                  <AvatarFallback>{pitch.author?.full_name?.[0] || pitch.author?.username?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {pitch.author?.full_name || pitch.author?.username || "Anonymous"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(pitch.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsUp className="h-5 w-5 text-idolyst-blue" />
                    <span className="text-lg font-semibold">{pitch.votes_count}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Votes</p>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-idolyst-blue" />
                    <span className="text-lg font-semibold">{pitch.comments_count}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Comments</p>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-idolyst-blue" />
                    <span className="text-lg font-semibold">
                      {isAnalyticsLoading ? (
                        <Skeleton className="h-6 w-12" />
                      ) : (
                        analytics?.views || 0
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Views</p>
                </div>
              </div>
              
              <div className="space-y-6 mb-8">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Problem Statement</h2>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="whitespace-pre-line">{pitch.problem_statement}</p>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-2">Target Audience</h2>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="whitespace-pre-line">{pitch.target_audience}</p>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-2">Solution</h2>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="whitespace-pre-line">{pitch.solution}</p>
                  </div>
                </div>
                
                {pitch.media_url && pitch.media_type?.includes('image') && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Media</h2>
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={pitch.media_url}
                        alt={pitch.title}
                        className="w-full h-auto object-contain max-h-[400px]"
                      />
                    </div>
                  </div>
                )}
                
                {pitch.tags.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {pitch.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 justify-between items-center border-t pt-6">
                <div className="flex items-center gap-3">
                  <Button
                    variant={pitch.user_vote === 'up' ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleVote('up')}
                    className="gap-1"
                  >
                    <ThumbsUp className={`h-4 w-4 ${pitch.user_vote === 'up' && "fill-current"}`} />
                    Upvote {pitch.votes_count > 0 && `(${pitch.votes_count})`}
                  </Button>
                  
                  <Button
                    variant={pitch.user_vote === 'down' ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleVote('down')}
                    className="gap-1"
                  >
                    <ThumbsDown className={`h-4 w-4 ${pitch.user_vote === 'down' && "fill-current"}`} />
                    Downvote
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("comments")}
                    className="gap-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {comments && comments.length > 0 
                      ? `${comments.length} Comments` 
                      : "Comments"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareClick}
                    className="gap-1"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:grid-cols-3">
              <TabsTrigger value="comments" className="gap-1.5">
                <MessageSquare className="h-4 w-4" />
                Comments {comments && `(${comments.length})`}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-1.5">
                <Star className="h-4 w-4" />
                Mentor Reviews {reviews && `(${reviews.length})`}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1.5">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="comments" className="pt-6">
              <PitchComments
                comments={comments || []}
                isLoading={isCommentsLoading}
                onAddComment={handleAddComment}
                isSubmitting={isAddingComment}
              />
            </TabsContent>
            
            <TabsContent value="reviews" className="pt-6">
              <MentorReviews
                reviews={reviews || []}
                isLoading={isReviewsLoading}
                onAddReview={handleAddReview}
                isSubmitting={isAddingReview}
                canAddReview={isMentor && !hasReviewed}
              />
            </TabsContent>
            
            <TabsContent value="analytics" className="pt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Idea Analytics</h3>
                  
                  {isAnalyticsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                          <span className="text-sm text-muted-foreground mb-1">Views</span>
                          <span className="text-2xl font-semibold">{analytics?.views || 0}</span>
                        </div>
                        
                        <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                          <span className="text-sm text-muted-foreground mb-1">Votes</span>
                          <span className="text-2xl font-semibold">{analytics?.votes || 0}</span>
                        </div>
                        
                        <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                          <span className="text-sm text-muted-foreground mb-1">Comments</span>
                          <span className="text-2xl font-semibold">{analytics?.comments || 0}</span>
                        </div>
                        
                        <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                          <span className="text-sm text-muted-foreground mb-1">Reviews</span>
                          <span className="text-2xl font-semibold">{analytics?.reviews || 0}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Trending Score</h4>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div 
                            className="bg-idolyst-blue h-2.5 rounded-full" 
                            style={{ width: `${Math.min(100, (analytics?.trending_score || 0) / 2)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0</span>
                          <span>200</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>This idea ranks {pitch.votes_count > 20 ? 'high' : pitch.votes_count > 10 ? 'average' : 'low'} in community engagement compared to other ideas.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AppLayout>
  );
}
