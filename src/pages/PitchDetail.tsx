
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  Star, 
  MessageSquare, 
  Share2, 
  ExternalLink,
  Tag,
  Users,
  EyeIcon,
  BarChart2
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePitches } from "@/hooks/use-pitches";
import PitchComments from "@/components/pitch/PitchComments";
import PitchAnalytics from "@/components/pitch/PitchAnalytics";
import { cn } from "@/lib/utils";
import { useFollow } from "@/hooks/use-follow";

export default function PitchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { followUser, unfollowUser, isFollowing, isLoading: isFollowLoading } = useFollow();
  const [activeTab, setActiveTab] = useState("feedback");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const { 
    usePitch, 
    votePitch, 
    usePitchComments, 
    addComment,
    useMentorReviews,
    useAnalytics 
  } = usePitches();
  
  const {
    data: pitch,
    isLoading: isPitchLoading,
    error: pitchError,
    refetch: refetchPitch
  } = usePitch(id || "");
  
  const {
    data: comments,
    isLoading: areCommentsLoading,
    refetch: refetchComments
  } = usePitchComments(id || "");
  
  const {
    data: mentorReviews,
    isLoading: areMentorReviewsLoading
  } = useMentorReviews(id || "");
  
  const { data: analytics } = useAnalytics(id || "");
  
  const handleVote = (voteType: 'up' | 'down') => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }
    
    if (!id) return;
    
    votePitch({ pitchId: id, voteType }, {
      onSuccess: () => {
        refetchPitch();
      }
    });
  };
  
  const handleAddComment = (content: string) => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }
    
    if (!id) return;
    
    setIsSubmittingComment(true);
    
    addComment({ pitchId: id, content }, {
      onSuccess: () => {
        refetchComments();
        refetchPitch();
        setIsSubmittingComment(false);
      },
      onError: () => {
        setIsSubmittingComment(false);
      }
    });
  };
  
  const handleShare = async () => {
    const url = `${window.location.origin}/pitch-hub/${id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: pitch?.title || 'Checkout this startup idea',
          text: `${pitch?.problem_statement?.substring(0, 100)}...`,
          url
        });
      } catch (error) {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard");
  };
  
  const handleFollowAuthor = () => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }
    
    if (!pitch?.author?.id) return;
    
    const authorId = pitch.author.id;
    
    if (isFollowing(authorId)) {
      unfollowUser(authorId);
    } else {
      followUser(authorId);
    }
  };
  
  if (isPitchLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-6"
            onClick={() => navigate("/pitch-hub")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to PitchHub
          </Button>
          
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }
  
  if (pitchError || !pitch) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-6"
            onClick={() => navigate("/pitch-hub")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to PitchHub
          </Button>
          
          <h1 className="text-2xl font-bold mb-4">Idea Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The startup idea you're looking for doesn't exist or has been removed.
          </p>
          
          <Button onClick={() => navigate("/pitch-hub")}>
            Browse PitchHub
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  const isAuthor = user?.id === pitch.user_id;
  
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/pitch-hub")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to PitchHub
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-6 pt-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src={pitch.author?.avatar_url || undefined} alt={pitch.author?.full_name || "User"} />
                    <AvatarFallback>{pitch.author?.full_name?.[0] || pitch.author?.username?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">
                        {pitch.author?.full_name || pitch.author?.username || "Anonymous"}
                      </h3>
                      {pitch.author?.is_verified && (
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-2">
                        {formatDistanceToNow(new Date(pitch.created_at), { addSuffix: true })}
                      </span>
                      {pitch.author?.id !== user?.id && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 ml-2 text-xs"
                          onClick={handleFollowAuthor}
                          disabled={isFollowLoading}
                        >
                          {pitch.author?.id && isFollowing(pitch.author.id) ? 'Following' : 'Follow'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {pitch.is_premium && (
                    <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                      <Star className="mr-1 h-3 w-3" /> Premium
                    </Badge>
                  )}
                  <Badge variant="outline" className="font-normal">
                    {pitch.category}
                  </Badge>
                </div>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-4">
                {pitch.title}
              </h1>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Problem Statement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {pitch.problem_statement}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Solution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {pitch.solution}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Target Audience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {pitch.target_audience || "Not specified"}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {pitch.tags.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                    <h3 className="text-base font-medium">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pitch.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-secondary/40 hover:bg-secondary/60">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {pitch.media_url && pitch.media_type?.includes('image') && (
                <div className="mt-6">
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">Attached Media</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <motion.img 
                        src={pitch.media_url} 
                        alt={pitch.title} 
                        className="w-full h-auto max-h-[400px] object-contain rounded-md" 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.01 }}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
            
            <Separator />
            
            <CardFooter className="p-4 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center">
                <div className="flex items-center gap-2 mr-6">
                  <Button
                    variant={pitch.user_vote === 'up' ? "default" : "outline"} 
                    size="sm"
                    className={cn(
                      "h-9 w-9 p-0",
                      pitch.user_vote === 'up' && "bg-primary/90 hover:bg-primary/80"
                    )}
                    onClick={() => handleVote('up')}
                  >
                    <ArrowUp className={cn(
                      "h-5 w-5",
                      pitch.user_vote === 'up' && "fill-primary-foreground"
                    )} />
                    <span className="sr-only">Upvote</span>
                  </Button>
                  
                  <span className="text-lg font-medium">{pitch.votes_count}</span>
                  
                  <Button
                    variant={pitch.user_vote === 'down' ? "default" : "outline"} 
                    size="sm"
                    className={cn(
                      "h-9 w-9 p-0",
                      pitch.user_vote === 'down' && "bg-primary/90 hover:bg-primary/80"
                    )}
                    onClick={() => handleVote('down')}
                  >
                    <ArrowDown className={cn(
                      "h-5 w-5",
                      pitch.user_vote === 'down' && "fill-primary-foreground"
                    )} />
                    <span className="sr-only">Downvote</span>
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 mr-4"
                  onClick={() => setActiveTab("feedback")}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{pitch.comments_count} Feedback</span>
                </Button>
                
                {analytics && (
                  <div className="flex items-center text-sm text-muted-foreground mr-4">
                    <EyeIcon className="h-4 w-4 mr-1.5" />
                    <span>{analytics.views || 0} Views</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 mr-2"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
                
                {pitch.author?.id === user?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="feedback" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback ({pitch.comments_count || 0})
              </TabsTrigger>
              <TabsTrigger value="mentor-reviews" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Mentor Reviews ({pitch.mentor_reviews_count || 0})
              </TabsTrigger>
              {isAuthor && (
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="feedback" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Community Feedback</CardTitle>
                  <CardDescription>
                    Share your thoughts on this startup idea
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PitchComments 
                    comments={comments || []} 
                    isLoading={areCommentsLoading}
                    onAddComment={handleAddComment}
                    isSubmitting={isSubmittingComment}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="mentor-reviews" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Mentor Reviews</CardTitle>
                  <CardDescription>
                    Feedback and reviews from industry experts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {areMentorReviewsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : mentorReviews?.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                      <h3 className="text-lg font-medium mb-1">No mentor reviews yet</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        This idea hasn't received any reviews from mentors yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mentorReviews?.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarImage src={review.mentor?.avatar_url || undefined} />
                                <AvatarFallback>{review.mentor?.full_name?.[0] || review.mentor?.username?.[0] || "M"}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center">
                                      <p className="font-medium">
                                        {review.mentor?.full_name || review.mentor?.username || "Mentor"}
                                      </p>
                                      <Badge className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none">
                                        Mentor
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                    </p>
                                  </div>
                                  <div className="flex">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={cn(
                                          "h-4 w-4",
                                          i < review.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground"
                                        )}
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
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {isAuthor && (
              <TabsContent value="analytics" className="mt-0">
                {id && <PitchAnalytics pitchId={id} />}
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </div>
    </AppLayout>
  );
}
