
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useMentor } from "@/hooks/use-mentor";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/ui/page-transition";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MentorSession } from "@/types/mentor";
import MentorSessionCard from "@/components/mentor/MentorSessionCard";
import { ArrowLeft, Calendar, Check, Search, X, MessageSquare, Star } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function MentorSessionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useMentorSessions, submitSessionReview, updateSessionStatus } = useMentor();
  
  const [sessionStatus, setSessionStatus] = useState("all");
  const [sessionRole, setSessionRole] = useState<"mentor" | "mentee">("mentee");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Selected session state for actions (review, cancel, etc.)
  const [selectedSession, setSelectedSession] = useState<MentorSession | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"complete" | "cancel" | "reschedule">("complete");
  const [actionReason, setActionReason] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch sessions based on selected filters
  const { data: sessions = [], isLoading, refetch } = useMentorSessions(
    sessionStatus, 
    sessionRole
  );
  
  // Filter sessions by search term if entered
  const filteredSessions = searchTerm 
    ? sessions.filter((session: MentorSession) => 
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (session.description && session.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sessionRole === "mentee" && 
          session.mentor && 
          (session.mentor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           session.mentor.username?.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (sessionRole === "mentor" && 
          session.mentee && 
          (session.mentee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           session.mentee.username?.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    : sessions;
  
  if (!user) {
    navigate("/auth/sign-in");
    return null;
  }
  
  // Handle session status update
  const handleUpdateStatus = async (sessionId: string, status: string) => {
    setIsProcessing(true);
    try {
      await updateSessionStatus({ 
        sessionId, 
        status, 
        notes: actionReason.length > 0 ? actionReason : undefined,
        cancellationReason: status === "cancelled" ? actionReason : undefined 
      });
      
      // Reset state and refetch
      setSelectedSession(null);
      setActionReason("");
      setIsActionModalOpen(false);
      refetch();
      
    } catch (error) {
      console.error("Failed to update session:", error);
      toast.error("Failed to update session status. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle review submission
  const handleSubmitReview = async () => {
    if (!selectedSession) return;
    
    setIsProcessing(true);
    try {
      await submitSessionReview({
        sessionId: selectedSession.id,
        rating: reviewRating,
        content: reviewContent
      });
      
      // Reset state and refetch
      setSelectedSession(null);
      setReviewRating(5);
      setReviewContent("");
      setIsReviewModalOpen(false);
      refetch();
      
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const openActionModal = (session: MentorSession, action: "complete" | "cancel" | "reschedule") => {
    setSelectedSession(session);
    setActionType(action);
    setActionReason("");
    setIsActionModalOpen(true);
  };
  
  const openReviewModal = (session: MentorSession) => {
    setSelectedSession(session);
    setReviewRating(5);
    setReviewContent("");
    setIsReviewModalOpen(true);
  };
  
  return (
    <AppLayout>
      <PageTransition>
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Mentorship Sessions</h1>
              <p className="text-muted-foreground">
                {sessionRole === "mentor" 
                  ? "Manage your mentoring sessions" 
                  : "View and manage your mentee sessions"}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <Tabs 
              value={sessionRole} 
              onValueChange={(value) => setSessionRole(value as "mentor" | "mentee")}
              className="w-full md:w-auto"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mentee">As Mentee</TabsTrigger>
                <TabsTrigger value="mentor">As Mentor</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <Select 
                value={sessionStatus} 
                onValueChange={setSessionStatus}
              >
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="bg-muted/30 animate-pulse">
                  <CardContent className="p-6 h-28"></CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No sessions found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {sessionRole === "mentor" 
                    ? `You don't have any ${sessionStatus !== 'all' ? sessionStatus : ''} mentorship sessions yet.`
                    : `You haven't booked any ${sessionStatus !== 'all' ? sessionStatus : ''} mentorship sessions yet.`}
                </p>
                {sessionRole === "mentee" ? (
                  <Button onClick={() => navigate("/mentor-space")}>
                    Find a Mentor
                  </Button>
                ) : (
                  <Button onClick={() => navigate("/mentor-space/analytics")}>
                    View Analytics
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session: MentorSession) => (
                <MentorSessionCard
                  key={session.id}
                  session={session}
                  userRole={sessionRole}
                  onUpdateStatus={(sessionId, status) => handleUpdateStatus(sessionId, status)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Review Modal */}
        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Review</DialogTitle>
              <DialogDescription>
                Share your feedback about this mentorship session
              </DialogDescription>
            </DialogHeader>
            
            {selectedSession && (
              <div className="py-4 space-y-4">
                <div className="p-3 rounded-md bg-muted/40">
                  <h4 className="font-medium text-sm">{selectedSession.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(selectedSession.start_time), "PPP")} • {
                      sessionRole === "mentee" 
                        ? `With ${selectedSession.mentor?.full_name || selectedSession.mentor?.username || "Mentor"}` 
                        : `With ${selectedSession.mentee?.full_name || selectedSession.mentee?.username || "Mentee"}`
                    }
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">
                    Rating
                  </label>
                  <div className="flex items-center gap-1 mt-1.5">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewRating(rating)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            rating <= reviewRating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm">
                      {reviewRating}/5
                    </span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="review-content" className="text-sm font-medium">
                    Your Feedback
                  </label>
                  <Textarea
                    id="review-content"
                    placeholder="Share your experience and feedback..."
                    className="mt-1.5"
                    rows={4}
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsReviewModalOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!reviewContent || isProcessing}
                onClick={handleSubmitReview}
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>Submit Review</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Action Modal (Complete/Cancel) */}
        <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {actionType === "complete" 
                  ? "Complete Session" 
                  : actionType === "cancel" 
                    ? "Cancel Session" 
                    : "Reschedule Session"}
              </DialogTitle>
              <DialogDescription>
                {actionType === "complete" 
                  ? "Mark this session as completed" 
                  : actionType === "cancel" 
                    ? "Cancel this upcoming session" 
                    : "Request to reschedule this session"}
              </DialogDescription>
            </DialogHeader>
            
            {selectedSession && (
              <div className="py-4 space-y-4">
                <div className="p-3 rounded-md bg-muted/40">
                  <h4 className="font-medium text-sm">{selectedSession.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(selectedSession.start_time), "PPP")} • {
                      sessionRole === "mentee" 
                        ? `With ${selectedSession.mentor?.full_name || selectedSession.mentor?.username || "Mentor"}` 
                        : `With ${selectedSession.mentee?.full_name || selectedSession.mentee?.username || "Mentee"}`
                    }
                  </p>
                </div>
                
                <div>
                  <label htmlFor="action-reason" className="text-sm font-medium">
                    {actionType === "complete" 
                      ? "Session Notes (Optional)" 
                      : actionType === "cancel" 
                        ? "Cancellation Reason" 
                        : "Reason for Rescheduling"}
                  </label>
                  <Textarea
                    id="action-reason"
                    placeholder={
                      actionType === "complete" 
                        ? "Add any notes about the session..." 
                        : actionType === "cancel" 
                          ? "Please provide a reason for cancellation..." 
                          : "Please provide a reason for rescheduling..."
                    }
                    className="mt-1.5"
                    rows={4}
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    required={actionType !== "complete"}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsActionModalOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={(actionType !== "complete" && !actionReason) || isProcessing}
                onClick={() => 
                  handleUpdateStatus(
                    selectedSession!.id, 
                    actionType === "complete" 
                      ? "completed" 
                      : actionType === "cancel" 
                        ? "cancelled" 
                        : "rescheduled"
                  )
                }
                variant={actionType === "cancel" ? "destructive" : "default"}
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : actionType === "complete" ? (
                  <>Mark as Completed</>
                ) : actionType === "cancel" ? (
                  <>Cancel Session</>
                ) : (
                  <>Request Reschedule</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </AppLayout>
  );
}
