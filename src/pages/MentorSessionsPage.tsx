
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { ChevronLeft, Calendar, Loader2, Clock, Check, X, ExternalLink, MessageSquare, FileText } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useMentor } from "@/hooks/use-mentor";
import { MentorSession, MentorSessionStatus } from "@/types/mentor";
import { toast } from "sonner";

export default function MentorSessionsPage() {
  const navigate = useNavigate();
  const { useMentorSessions, updateSessionStatus, submitSessionReview } = useMentor();
  
  const [activeTab, setActiveTab] = useState<MentorSessionStatus | "all">("all");
  const [selectedSession, setSelectedSession] = useState<MentorSession | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get mentor sessions
  const { data: sessions = [], isLoading } = useMentorSessions(activeTab === "all" ? undefined : activeTab);
  
  // Filter sessions based on role (mentor or mentee)
  const [roleFilter, setRoleFilter] = useState<"all" | "mentor" | "mentee">("all");
  
  const filteredSessions = roleFilter === "all" 
    ? sessions 
    : sessions.filter(session => roleFilter === "mentor" 
        ? session.mentor?.id === session.mentor_id 
        : session.mentee?.id === session.mentee_id);
  
  // Handle status update
  const handleCompleteSession = async () => {
    if (!selectedSession) return;
    
    setIsProcessing(true);
    
    try {
      await updateSessionStatus({ 
        sessionId: selectedSession.id, 
        status: "completed",
        notes: sessionNotes 
      });
      
      toast.success("Session marked as completed!");
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update session status");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle session cancellation
  const handleCancelSession = async () => {
    if (!selectedSession) return;
    
    if (!cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await updateSessionStatus({ 
        sessionId: selectedSession.id, 
        status: "cancelled",
        cancellationReason 
      });
      
      toast.success("Session cancelled successfully");
      setIsCancelModalOpen(false);
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error("Failed to cancel the session");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle review submission
  const handleSubmitReview = async () => {
    if (!selectedSession) return;
    
    if (!reviewContent.trim()) {
      toast.error("Please provide review content");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await submitSessionReview({
        sessionId: selectedSession.id,
        rating: reviewRating,
        content: reviewContent
      });
      
      toast.success("Review submitted successfully");
      setIsReviewModalOpen(false);
    } catch (error) {
      console.error("Review error:", error);
      toast.error("Failed to submit review");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Format session status badge
  const getStatusBadge = (status: MentorSessionStatus) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case "rescheduled":
        return <Badge className="bg-purple-500">Rescheduled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/mentor-space')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Mentor Space
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Mentorship Sessions</h1>
            <p className="text-muted-foreground">
              Manage your upcoming and past mentorship sessions
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setRoleFilter("all")}>
              All
            </Button>
            <Button variant="outline" size="sm" onClick={() => setRoleFilter("mentor")}>
              As Mentor
            </Button>
            <Button variant="outline" size="sm" onClick={() => setRoleFilter("mentee")}>
              As Mentee
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as MentorSessionStatus | "all")}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="scheduled">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                <h3 className="text-lg font-medium mb-1">No sessions found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {activeTab === "all" 
                    ? "You don't have any mentorship sessions yet."
                    : activeTab === "scheduled"
                    ? "You don't have any upcoming mentorship sessions."
                    : activeTab === "completed"
                    ? "You don't have any completed mentorship sessions."
                    : "You don't have any cancelled mentorship sessions."
                  }
                </p>
                {(activeTab === "all" || activeTab === "scheduled") && (
                  <Button 
                    className="mt-4" 
                    variant="outline"
                    onClick={() => navigate('/mentor-space')}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Find a Mentor
                  </Button>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {filteredSessions.map((session) => (
                  <Card key={session.id} className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-2/3">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage 
                                src={
                                  roleFilter === "mentor"
                                    ? session.mentee?.avatar_url
                                    : session.mentor?.avatar_url
                                } 
                              />
                              <AvatarFallback>
                                {roleFilter === "mentor"
                                  ? session.mentee?.full_name?.charAt(0) || session.mentee?.username?.charAt(0) || 'U'
                                  : session.mentor?.full_name?.charAt(0) || session.mentor?.username?.charAt(0) || 'M'
                                }
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-medium">{session.title}</h3>
                                {getStatusBadge(session.status)}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mt-1">
                                {roleFilter === "mentor" 
                                  ? `With: ${session.mentee?.full_name || session.mentee?.username || 'Unknown Mentee'}`
                                  : `With: ${session.mentor?.full_name || session.mentor?.username || 'Unknown Mentor'}`
                                }
                              </p>
                              
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                                <span className="flex items-center">
                                  <Calendar className="mr-1 h-3.5 w-3.5" />
                                  {format(parseISO(session.start_time), 'EEEE, MMMM d, yyyy')}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="mr-1 h-3.5 w-3.5" />
                                  {format(parseISO(session.start_time), 'h:mm a')} - {format(parseISO(session.end_time), 'h:mm a')}
                                </span>
                                <span className="flex items-center">
                                  {session.session_type}
                                </span>
                              </div>
                              
                              {session.description && (
                                <p className="text-sm mt-3 line-clamp-2">
                                  {session.description}
                                </p>
                              )}
                              
                              {session.cancellation_reason && (
                                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded">
                                  <strong>Cancellation reason:</strong> {session.cancellation_reason}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:w-1/3 flex flex-col gap-2 justify-end">
                          {session.status === "scheduled" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setSelectedSession(session);
                                  setSessionNotes("");
                                  setIsUpdateModalOpen(true);
                                }}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Complete Session
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setSelectedSession(session);
                                  setCancellationReason("");
                                  setIsCancelModalOpen(true);
                                }}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancel Session
                              </Button>
                              {session.session_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  asChild
                                >
                                  <a href={session.session_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Join Meeting
                                  </a>
                                </Button>
                              )}
                            </>
                          )}
                          
                          {session.status === "completed" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setSelectedSession(session);
                                  setReviewContent("");
                                  setReviewRating(5);
                                  setIsReviewModalOpen(true);
                                }}
                              >
                                <Star className="mr-2 h-4 w-4" />
                                Leave Review
                              </Button>
                              {session.session_notes && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Notes
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message
                              </Button>
                            </>
                          )}
                          
                          {session.status === "cancelled" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => navigate('/mentor-space')}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Reschedule
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Complete Session Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Session</DialogTitle>
            <DialogDescription>
              Mark this mentorship session as completed and add any notes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="p-3 bg-muted/40 rounded-md">
              <p className="font-medium text-sm">Session Details</p>
              <p className="text-sm mt-1">
                {selectedSession?.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedSession?.start_time && format(parseISO(selectedSession.start_time), 'EEEE, MMMM d, yyyy')}
                {" at "}
                {selectedSession?.start_time && format(parseISO(selectedSession.start_time), 'h:mm a')}
              </p>
            </div>
            
            <div>
              <label htmlFor="notes" className="text-sm font-medium block mb-2">
                Session Notes (Optional)
              </label>
              <Textarea
                id="notes"
                placeholder="Add any notes about what was discussed or action items..."
                rows={4}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteSession}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Mark as Completed
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cancel Session Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Session</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this session
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="p-3 bg-muted/40 rounded-md">
              <p className="font-medium text-sm">Session Details</p>
              <p className="text-sm mt-1">
                {selectedSession?.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedSession?.start_time && format(parseISO(selectedSession.start_time), 'EEEE, MMMM d, yyyy')}
                {" at "}
                {selectedSession?.start_time && format(parseISO(selectedSession.start_time), 'h:mm a')}
              </p>
            </div>
            
            <div>
              <label htmlFor="reason" className="text-sm font-medium block mb-2">
                Cancellation Reason
              </label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for cancelling..."
                rows={3}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
            >
              Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSession}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel Session
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your feedback about this mentorship session
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="p-3 bg-muted/40 rounded-md">
              <p className="font-medium text-sm">Session Details</p>
              <p className="text-sm mt-1">
                {selectedSession?.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                With {selectedSession?.mentor?.full_name || selectedSession?.mentor?.username || 'Unknown Mentor'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    type="button"
                    variant={reviewRating >= rating ? "default" : "outline"}
                    size="sm"
                    className="h-10 w-10 p-0"
                    onClick={() => setReviewRating(rating)}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="review" className="text-sm font-medium block mb-2">
                Review
              </label>
              <Textarea
                id="review"
                placeholder="Share your experience and feedback..."
                rows={4}
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export function Star({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
