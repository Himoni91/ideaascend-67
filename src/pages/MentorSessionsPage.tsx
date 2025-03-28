
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useMentor } from "@/hooks/use-mentor";
import {
  Calendar,
  History,
  ChevronRight,
  ChevronLeft,
  Star,
  Loader2,
  Plus,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import MentorSessionCard from "@/components/mentor/MentorSessionCard";
import { PageTransition } from "@/components/ui/page-transition";

// Review form schema
const reviewSchema = z.object({
  rating: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Rating is required").max(5, "Maximum rating is 5")
  ),
  content: z.string()
    .min(10, "Please provide at least 10 characters of feedback")
    .max(500, "Feedback cannot exceed 500 characters")
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function MentorSessionsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [sessionToReview, setSessionToReview] = useState<string | null>(null);
  
  // Hooks for mentor-related data
  const { 
    useMentorSessions, 
    useUpdateSessionStatus, 
    useLeaveReview
  } = useMentor();
  
  // Get sessions data
  const { data: sessions, isLoading, error } = useMentorSessions();
  const updateStatus = useUpdateSessionStatus();
  const leaveReview = useLeaveReview();
  
  // Review form
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      content: "",
    },
  });
  
  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your sessions</h1>
          <Button onClick={() => window.location.href = "/auth/sign-in"}>
            Sign In
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  const handleReviewSession = (sessionId: string) => {
    setSessionToReview(sessionId);
    setReviewModalOpen(true);
  };
  
  const handleStatusUpdate = async (sessionId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ sessionId, status });
      toast.success(`Session ${status === 'completed' ? 'marked as complete' : status}`);
    } catch (error) {
      console.error("Failed to update session status:", error);
      toast.error("Failed to update session status");
    }
  };
  
  const onSubmitReview = async (values: ReviewFormValues) => {
    if (!sessionToReview) return;
    
    try {
      await leaveReview.mutateAsync({
        sessionId: sessionToReview,
        rating: values.rating,
        content: values.content
      });
      
      toast.success("Thank you for your review!");
      setReviewModalOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Failed to submit review");
    }
  };
  
  // Filter sessions based on status
  const upcomingSessions = sessions?.filter(s => 
    s.status === "scheduled" && 
    new Date(s.start_time) > new Date()
  ) || [];
  
  const pastSessions = sessions?.filter(s => 
    s.status === "completed" || 
    (s.status === "scheduled" && new Date(s.end_time) < new Date())
  ) || [];
  
  const cancelledSessions = sessions?.filter(s => 
    s.status === "cancelled"
  ) || [];
  
  // Check if user is a mentor from profile data
  const userIsMentor = user.user_metadata?.is_mentor === true;
  
  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold mb-1">Your Sessions</h1>
              <p className="text-muted-foreground">
                Manage your mentoring sessions and bookings
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="/mentor-space">
                  <Plus className="mr-2 h-4 w-4" />
                  Find Mentors
                </a>
              </Button>
              {userIsMentor && (
                <Button variant="outline" asChild>
                  <a href="/mentor-space/analytics">
                    <Calendar className="mr-2 h-4 w-4" />
                    Mentor Dashboard
                  </a>
                </Button>
              )}
            </div>
          </motion.div>
          
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="upcoming" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Upcoming</span>
                {upcomingSessions.length > 0 && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                    {upcomingSessions.length}
                  </span>
                )}
              </TabsTrigger>
              
              <TabsTrigger value="past" className="flex items-center">
                <History className="mr-2 h-4 w-4" />
                <span>Past Sessions</span>
              </TabsTrigger>
              
              <TabsTrigger value="cancelled" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Cancelled</span>
                {cancelledSessions.length > 0 && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                    {cancelledSessions.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-12 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">Error loading sessions</h3>
                <p className="text-muted-foreground">
                  There was a problem loading your sessions. Please try again.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <TabsContent value="upcoming" className="mt-0">
                  <div className="space-y-6">
                    {upcomingSessions.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {upcomingSessions.map((session) => (
                            <MentorSessionCard
                              key={session.id}
                              session={session}
                              isAsMentor={session.mentor_id === user.id}
                              onStatusChange={handleStatusUpdate}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 border rounded-lg">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                        <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                        <p className="text-muted-foreground mb-4">
                          You don't have any scheduled sessions coming up.
                        </p>
                        <Button asChild>
                          <a href="/mentor-space">Find Mentors</a>
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="past" className="mt-0">
                  <div className="space-y-6">
                    {pastSessions.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {pastSessions.map((session) => (
                            <MentorSessionCard
                              key={session.id}
                              session={session}
                              isAsMentor={session.mentor_id === user.id}
                              onStatusChange={handleStatusUpdate}
                              onReview={session.mentor_id !== user.id ? handleReviewSession : undefined}
                            />
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-center space-x-4 mt-8">
                          <Button variant="outline" size="sm">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground">Page 1 of 1</span>
                          <Button variant="outline" size="sm">
                            Next
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 border rounded-lg">
                        <History className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                        <h3 className="text-lg font-medium mb-2">No past sessions</h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't completed any sessions yet.
                        </p>
                        <Button asChild>
                          <a href="/mentor-space">Find Mentors</a>
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="cancelled" className="mt-0">
                  <div className="space-y-6">
                    {cancelledSessions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cancelledSessions.map((session) => (
                          <MentorSessionCard
                            key={session.id}
                            session={session}
                            isAsMentor={session.mentor_id === user.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border rounded-lg">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                        <h3 className="text-lg font-medium mb-2">No cancelled sessions</h3>
                        <p className="text-muted-foreground">
                          You don't have any cancelled sessions.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
          
          {/* Leave a Review Modal */}
          <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" />
                  <span>Leave a Review</span>
                </DialogTitle>
                <DialogDescription>
                  Share your feedback about the mentoring session to help others.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="range"
                              min="1"
                              max="5"
                              step="1"
                              className="w-full"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                            <span className="text-lg font-semibold min-w-8 text-center">
                              {field.value} / 5
                            </span>
                          </div>
                        </FormControl>
                        <div className="flex justify-between px-1 text-xs text-muted-foreground">
                          <span>Poor</span>
                          <span>Excellent</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Feedback</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your experience with this mentor..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          What did you find most helpful? What could be improved?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setReviewModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={leaveReview.isPending}>
                      {leaveReview.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
