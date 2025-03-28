
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  Star,
  ArrowLeft,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  Calendar as CalendarIcon
} from "lucide-react";
import { Tab } from "@headlessui/react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useMentor } from "@/hooks/use-mentor";
import { MentorSession } from "@/types/mentor";
import MentorSessionCard from "@/components/mentor/MentorSessionCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function MentorSessionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedSession, setSelectedSession] = useState<MentorSession | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [review, setReview] = useState({ rating: 5, content: "" });
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [filter, setFilter] = useState<string>("all");

  // Mentor hooks
  const { useMentorSessions, useUpdateSessionStatus, useLeaveReview } = useMentor();
  const { data: sessions, isLoading, refetch } = useMentorSessions();
  const updateSessionStatus = useUpdateSessionStatus();
  const leaveReview = useLeaveReview();

  // Calculate week range for display
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  // Filter and sort sessions
  const filteredSessions = () => {
    if (!sessions) return [];

    let filtered = [...sessions];

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter(session => session.status === filter);
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

    return filtered;
  };

  // Filter sessions for weekly view
  const weekSessions = () => {
    if (!sessions) return [];

    return sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  // Handle status change (cancellation, completion)
  const handleStatusChange = async (sessionId: string, status: string) => {
    if (status === 'cancelled' && !cancellationReason) {
      setSelectedSession(sessions?.find(s => s.id === sessionId) || null);
      setShowCancelDialog(true);
      return;
    }

    try {
      await updateSessionStatus.mutateAsync({ 
        sessionId, 
        status,
        ...(status === 'cancelled' ? { cancellation_reason: cancellationReason } : {})
      });

      toast.success(`Session ${status === 'cancelled' ? 'cancelled' : 'marked as complete'}`);
      setShowCancelDialog(false);
      setCancellationReason("");
      setSelectedSession(null);
      refetch();
    } catch (error) {
      toast.error(`Failed to update session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle review submission
  const handleReview = (sessionId: string) => {
    setSelectedSession(sessions?.find(s => s.id === sessionId) || null);
    setShowReviewDialog(true);
  };

  const submitReview = async () => {
    if (!selectedSession) return;

    try {
      await leaveReview.mutateAsync({
        sessionId: selectedSession.id,
        rating: review.rating,
        content: review.content
      });

      toast.success("Review submitted successfully");
      setShowReviewDialog(false);
      setReview({ rating: 5, content: "" });
      setSelectedSession(null);
      refetch();
    } catch (error) {
      toast.error(`Failed to submit review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Check if user is mentor and has any role conflict
  useEffect(() => {
    // Check if user has mentor metadata or not
    const isMentor = user?.user_metadata?.is_mentor === true;
    
    // If we have sessions data and user is not a mentor, check if they should be
    if (sessions && sessions.length > 0) {
      const hasMentorSessions = sessions.some(s => s.mentor_id === user?.id);
      if (hasMentorSessions && !isMentor) {
        // User has mentor sessions but is not marked as mentor in metadata
        console.log("User has mentor sessions but is not marked as a mentor in metadata");
      }
    }
  }, [sessions, user]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Your Sessions</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold">Your Sessions</h1>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="scheduled">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-muted p-1 mb-6">
          <Tab 
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-offset-background
               ${selected 
                ? 'bg-background text-foreground shadow' 
                : 'text-muted-foreground hover:bg-muted/80'}`
            }
          >
            List View
          </Tab>
          <Tab 
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-offset-background
               ${selected 
                ? 'bg-background text-foreground shadow' 
                : 'text-muted-foreground hover:bg-muted/80'}`
            }
          >
            Week View
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            {filteredSessions().length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSessions().map(session => (
                  <MentorSessionCard 
                    key={session.id} 
                    session={session} 
                    isAsMentor={session.mentor_id === user?.id}
                    onStatusChange={handleStatusChange}
                    onReview={handleReview}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center p-8">
                <CardContent className="pt-8">
                  <p className="mb-4 text-muted-foreground">No sessions found for the selected filter.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/mentor-space')}
                  >
                    Browse Mentors
                  </Button>
                </CardContent>
              </Card>
            )}
          </Tab.Panel>

          <Tab.Panel>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous Week
                </Button>
                
                <div className="text-center">
                  <h3 className="font-medium">
                    {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
                  </h3>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                >
                  Next Week
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              
              {weekSessions().length > 0 ? (
                <div className="space-y-3">
                  {weekSessions().map(session => (
                    <Card key={session.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="bg-muted p-4 sm:w-48 flex flex-col justify-center items-center text-center">
                          <CalendarIcon className="h-5 w-5 mb-1 text-muted-foreground" />
                          <div className="font-medium">{format(new Date(session.start_time), "EEEE")}</div>
                          <div className="text-2xl font-bold">{format(new Date(session.start_time), "d")}</div>
                          <div className="text-sm text-muted-foreground">{format(new Date(session.start_time), "MMM yyyy")}</div>
                          <div className="mt-2 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span className="text-sm">
                              {format(new Date(session.start_time), "h:mm a")} - {format(new Date(session.end_time), "h:mm a")}
                            </span>
                          </div>
                        </div>
                        
                        <CardContent className="flex-1 p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge 
                                variant={
                                  session.status === "completed" ? "default" : 
                                  session.status === "cancelled" ? "destructive" : 
                                  "secondary"
                                }
                                className="mb-2"
                              >
                                {session.status}
                              </Badge>
                              <h3 className="font-medium text-lg">{session.title}</h3>
                              <div className="text-sm text-muted-foreground mt-1">{session.session_type}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {session.mentor_id === user?.id ? "Mentee" : "Mentor"}:
                              </div>
                              <div className="text-sm">
                                {session.mentor_id === user?.id 
                                  ? session.mentee?.full_name || session.mentee?.username 
                                  : session.mentor?.full_name || session.mentor?.username}
                              </div>
                            </div>
                          </div>
                          
                          {session.description && (
                            <div className="mt-3 text-sm">
                              <p className="line-clamp-2 text-muted-foreground">{session.description}</p>
                            </div>
                          )}
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            {session.status === "scheduled" && session.session_url && (
                              <Button variant="default" size="sm" asChild>
                                <a href={session.session_url} target="_blank" rel="noopener noreferrer">
                                  Join Session
                                </a>
                              </Button>
                            )}
                            
                            {session.status === "scheduled" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(session.id, 'cancelled')}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            )}
                            
                            {session.status === "completed" && session.mentee_id === user?.id && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleReview(session.id)}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center p-8">
                  <CardContent className="pt-8">
                    <p className="mb-4 text-muted-foreground">No sessions scheduled for this week.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/mentor-space')}
                    >
                      Browse Mentors
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      
      {/* Cancel Session Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Session</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this session. This will be visible to the other participant.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Cancellation Reason</Label>
              <Textarea
                id="reason"
                placeholder="Please explain why you're cancelling..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCancelDialog(false);
                setCancellationReason("");
                setSelectedSession(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedSession && handleStatusChange(selectedSession.id, 'cancelled')}
              disabled={!cancellationReason.trim()}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Session</DialogTitle>
            <DialogDescription>
              Share your experience with this mentor to help others find great mentors.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Select 
                value={review.rating.toString()} 
                onValueChange={(value) => setReview({...review, rating: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Below Average</SelectItem>
                  <SelectItem value="3">3 - Average</SelectItem>
                  <SelectItem value="4">4 - Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Share your experience with this mentor..."
                value={review.content}
                onChange={(e) => setReview({...review, content: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowReviewDialog(false);
                setReview({ rating: 5, content: "" });
                setSelectedSession(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitReview}
              disabled={!review.content.trim()}
            >
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
