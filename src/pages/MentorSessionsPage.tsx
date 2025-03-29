
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  User, 
  MoreHorizontal, 
  Check, 
  X, 
  MessageSquare, 
  Link as LinkIcon,
  Loader2,
  FileText,
  Video
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMentorSpace } from "@/hooks/use-mentor-space";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageTransition } from "@/components/ui/page-transition";
import AppLayout from "@/components/layout/AppLayout";
import { Helmet } from "react-helmet-async";
import { MentorSession, MentorSessionStatus } from "@/types/mentor";

interface SessionModalState {
  isOpen: boolean;
  type: 'cancel' | 'notes' | 'review' | 'meetingLink';
  sessionId: string | null;
}

const MentorSessionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getMentorSessions,
    getMenteeSessions,
    updateSessionStatus,
    submitSessionReview 
  } = useMentorSpace();
  
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isMentorView, setIsMentorView] = useState(true);
  const [selectedSession, setSelectedSession] = useState<MentorSession | null>(null);
  const [modalState, setModalState] = useState<SessionModalState>({
    isOpen: false,
    type: 'cancel',
    sessionId: null
  });
  
  // Form state
  const [cancellationReason, setCancellationReason] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get session data based on user role and tab
  const getSessionStatus = (): MentorSessionStatus | undefined => {
    if (activeTab === "upcoming") return "scheduled";
    if (activeTab === "past") return "completed";
    if (activeTab === "cancelled") return "cancelled";
    return undefined;
  };
  
  const { 
    data: mentorSessions, 
    isLoading: isLoadingMentorSessions 
  } = getMentorSessions(getSessionStatus());
  
  const { 
    data: menteeSessions, 
    isLoading: isLoadingMenteeSessions 
  } = getMenteeSessions(getSessionStatus());
  
  const sessions = isMentorView ? mentorSessions : menteeSessions;
  const isLoading = isMentorView ? isLoadingMentorSessions : isLoadingMenteeSessions;
  
  // Open modal with specific type
  const openModal = (type: SessionModalState['type'], session: MentorSession) => {
    setSelectedSession(session);
    setModalState({
      isOpen: true,
      type,
      sessionId: session.id
    });
    
    // Pre-fill form fields based on modal type
    if (type === 'notes') {
      setSessionNotes(session.session_notes || "");
    } else if (type === 'meetingLink') {
      setMeetingLink(session.session_url || "");
    }
  };
  
  // Close modal and reset state
  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: 'cancel',
      sessionId: null
    });
    setSelectedSession(null);
    setCancellationReason("");
    setSessionNotes("");
    setMeetingLink("");
    setReviewRating(5);
    setReviewContent("");
  };
  
  // Handle update session status (cancel, complete, in-progress)
  const handleUpdateStatus = async (sessionId: string, status: MentorSessionStatus, data?: object) => {
    try {
      setIsSubmitting(true);
      
      await updateSessionStatus.mutateAsync({
        sessionId,
        status,
        ...(data || {})
      });
      
      // Close modal if open
      if (modalState.isOpen) {
        closeModal();
      }
      
      // Show toast notification
      const successMessages = {
        scheduled: "Session has been scheduled",
        "in-progress": "Session is now in progress",
        completed: "Session has been marked as completed",
        cancelled: "Session has been cancelled",
        rescheduled: "Session has been rescheduled"
      };
      
      toast.success(successMessages[status] || "Session status updated");
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Failed to update session status");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel session
  const handleCancelSession = async () => {
    if (!modalState.sessionId) return;
    
    await handleUpdateStatus(modalState.sessionId, 'cancelled', {
      cancellationReason
    });
  };
  
  // Handle save session notes
  const handleSaveNotes = async () => {
    if (!modalState.sessionId) return;
    
    try {
      setIsSubmitting(true);
      
      await updateSessionStatus.mutateAsync({
        sessionId: modalState.sessionId,
        status: selectedSession?.status as MentorSessionStatus,
        notes: sessionNotes
      });
      
      closeModal();
      toast.success("Session notes saved successfully");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save session notes");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle save meeting link
  const handleSaveMeetingLink = async () => {
    if (!modalState.sessionId) return;
    
    try {
      setIsSubmitting(true);
      
      await updateSessionStatus.mutateAsync({
        sessionId: modalState.sessionId,
        status: selectedSession?.status as MentorSessionStatus,
        meetingLink
      });
      
      closeModal();
      toast.success("Meeting link saved successfully");
    } catch (error) {
      console.error("Error saving meeting link:", error);
      toast.error("Failed to save meeting link");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle submit review
  const handleSubmitReview = async () => {
    if (!modalState.sessionId) return;
    
    try {
      setIsSubmitting(true);
      
      await submitSessionReview.mutateAsync({
        sessionId: modalState.sessionId,
        rating: reviewRating,
        content: reviewContent
      });
      
      closeModal();
      toast.success("Review submitted successfully");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(`Failed to submit review: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to get status badge
  const getStatusBadge = (status: MentorSessionStatus) => {
    const statusConfig = {
      scheduled: { label: 'Scheduled', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
      'in-progress': { label: 'In Progress', class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' },
      completed: { label: 'Completed', class: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
      cancelled: { label: 'Cancelled', class: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
      rescheduled: { label: 'Rescheduled', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' }
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    
    return (
      <Badge variant="outline" className={config.class}>
        {config.label}
      </Badge>
    );
  };
  
  return (
    <AppLayout>
      <Helmet>
        <title>My Sessions | Mentor Space | Idolyst</title>
      </Helmet>
      
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">My Mentorship Sessions</h1>
            <p className="text-muted-foreground max-w-3xl">
              Manage your mentorship sessions, reschedule appointments, and track your mentoring journey.
            </p>
          </motion.div>
          
          {/* View Toggle */}
          {user?.is_mentor && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium mr-3">View as:</span>
                <div className="flex bg-muted rounded-lg p-1">
                  <Button 
                    variant={isMentorView ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setIsMentorView(true)}
                    className="relative"
                  >
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Mentor
                    </span>
                  </Button>
                  <Button 
                    variant={!isMentorView ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setIsMentorView(false)}
                    className="relative"
                  >
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Mentee
                    </span>
                  </Button>
                </div>
              </div>
              
              <Button onClick={() => navigate("/mentor-space")}>
                Find Mentors
              </Button>
            </div>
          )}
          
          {/* Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isMentorView ? "Mentor Sessions" : "Mentee Sessions"}
              </CardTitle>
              <CardDescription>
                {isMentorView 
                  ? "Sessions where you are the mentor" 
                  : "Sessions where you are the mentee"
                }
              </CardDescription>
            </CardHeader>
            <Tabs 
              defaultValue="upcoming" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="px-6">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="upcoming" className="p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sessions && sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.map(session => (
                      <div 
                        key={session.id}
                        className="border rounded-lg p-4 hover:border-primary/20 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{session.title}</h3>
                              {getStatusBadge(session.status as MentorSessionStatus)}
                            </div>
                            
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1.5" />
                              <span>
                                {format(new Date(session.start_time), 'EEEE, MMMM d, yyyy')}
                              </span>
                              <span className="mx-1.5">•</span>
                              <Clock className="h-4 w-4 mr-1.5" />
                              <span>
                                {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage 
                                  src={isMentorView 
                                    ? session.mentee?.avatar_url 
                                    : session.mentor?.avatar_url
                                  } 
                                />
                                <AvatarFallback>
                                  {isMentorView 
                                    ? session.mentee?.full_name?.charAt(0) || session.mentee?.username?.charAt(0) 
                                    : session.mentor?.full_name?.charAt(0) || session.mentor?.username?.charAt(0)
                                  }
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {isMentorView 
                                  ? `Mentee: ${session.mentee?.full_name || session.mentee?.username}` 
                                  : `Mentor: ${session.mentor?.full_name || session.mentor?.username}`
                                }
                              </span>
                            </div>
                            
                            {session.session_type && (
                              <Badge variant="outline" className="bg-primary/5">
                                {session.session_type}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-row sm:flex-col justify-between items-end gap-2">
                            {session.session_url && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" asChild>
                                      <a href={session.session_url} target="_blank" rel="noopener noreferrer">
                                        <Video className="h-4 w-4 mr-2" />
                                        Join Call
                                      </a>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Join video call for this session</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {isMentorView && (
                                  <>
                                    <DropdownMenuItem onClick={() => openModal('meetingLink', session)}>
                                      <LinkIcon className="h-4 w-4 mr-2" />
                                      Add/Edit Meeting Link
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem onClick={() => openModal('notes', session)}>
                                      <FileText className="h-4 w-4 mr-2" />
                                      Add/Edit Notes
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem 
                                      onClick={() => handleUpdateStatus(session.id, 'in-progress')}
                                      disabled={session.status !== 'scheduled'}
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Mark as In Progress
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem 
                                      onClick={() => handleUpdateStatus(session.id, 'completed')}
                                      disabled={session.status !== 'in-progress' && session.status !== 'scheduled'}
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Mark as Completed
                                    </DropdownMenuItem>
                                  </>
                                )}
                                
                                {!isMentorView && session.status === 'completed' && (
                                  <DropdownMenuItem onClick={() => openModal('review', session)}>
                                    <Star className="h-4 w-4 mr-2" />
                                    Leave Review
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuItem 
                                  onClick={() => openModal('cancel', session)}
                                  disabled={session.status !== 'scheduled'}
                                  className="text-red-500 focus:text-red-500"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel Session
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        {session.description && (
                          <>
                            <Separator className="my-3" />
                            <div className="text-sm">
                              <p className="text-muted-foreground mb-1 font-medium">Session Details:</p>
                              <p>{session.description}</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                    <h3 className="text-lg font-medium mb-1">No upcoming sessions</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                      {isMentorView 
                        ? "You don't have any upcoming mentorship sessions scheduled."
                        : "You don't have any upcoming sessions with mentors."
                      }
                    </p>
                    <Button onClick={() => navigate("/mentor-space")}>
                      {isMentorView ? "Update Your Availability" : "Find a Mentor"}
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="past" className="p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sessions && sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.map(session => (
                      <div 
                        key={session.id}
                        className="border rounded-lg p-4 hover:border-primary/20 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{session.title}</h3>
                              {getStatusBadge(session.status as MentorSessionStatus)}
                            </div>
                            
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1.5" />
                              <span>
                                {format(new Date(session.start_time), 'EEEE, MMMM d, yyyy')}
                              </span>
                              <span className="mx-1.5">•</span>
                              <Clock className="h-4 w-4 mr-1.5" />
                              <span>
                                {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage 
                                  src={isMentorView 
                                    ? session.mentee?.avatar_url 
                                    : session.mentor?.avatar_url
                                  } 
                                />
                                <AvatarFallback>
                                  {isMentorView 
                                    ? session.mentee?.full_name?.charAt(0) || session.mentee?.username?.charAt(0) 
                                    : session.mentor?.full_name?.charAt(0) || session.mentor?.username?.charAt(0)
                                  }
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {isMentorView 
                                  ? `Mentee: ${session.mentee?.full_name || session.mentee?.username}` 
                                  : `Mentor: ${session.mentor?.full_name || session.mentor?.username}`
                                }
                              </span>
                            </div>
                            
                            {session.session_type && (
                              <Badge variant="outline" className="bg-primary/5">
                                {session.session_type}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-row sm:flex-col justify-between items-end gap-2">
                            {!isMentorView && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openModal('review', session)}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Leave Review
                              </Button>
                            )}
                            
                            {isMentorView && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openModal('notes', session)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View/Edit Notes
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {session.session_notes && (
                          <>
                            <Separator className="my-3" />
                            <div className="text-sm">
                              <p className="text-muted-foreground mb-1 font-medium">Session Notes:</p>
                              <p>{session.session_notes}</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                    <h3 className="text-lg font-medium mb-1">No past sessions</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      {isMentorView 
                        ? "You don't have any completed mentorship sessions yet."
                        : "You don't have any completed sessions with mentors yet."
                      }
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="cancelled" className="p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sessions && sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.map(session => (
                      <div 
                        key={session.id}
                        className="border rounded-lg p-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{session.title}</h3>
                            {getStatusBadge(session.status as MentorSessionStatus)}
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1.5" />
                            <span>
                              {format(new Date(session.start_time), 'EEEE, MMMM d, yyyy')}
                            </span>
                            <span className="mx-1.5">•</span>
                            <Clock className="h-4 w-4 mr-1.5" />
                            <span>
                              {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage 
                                src={isMentorView 
                                  ? session.mentee?.avatar_url 
                                  : session.mentor?.avatar_url
                                } 
                              />
                              <AvatarFallback>
                                {isMentorView 
                                  ? session.mentee?.full_name?.charAt(0) || session.mentee?.username?.charAt(0) 
                                  : session.mentor?.full_name?.charAt(0) || session.mentor?.username?.charAt(0)
                                }
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {isMentorView 
                                ? `Mentee: ${session.mentee?.full_name || session.mentee?.username}` 
                                : `Mentor: ${session.mentor?.full_name || session.mentor?.username}`
                              }
                            </span>
                          </div>
                          
                          {session.cancellation_reason && (
                            <>
                              <Separator className="my-2" />
                              <div className="text-sm">
                                <p className="text-muted-foreground mb-1 font-medium">Cancellation Reason:</p>
                                <p>{session.cancellation_reason}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                    <h3 className="text-lg font-medium mb-1">No cancelled sessions</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      You don't have any cancelled sessions.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
          
          {/* Cancel Session Modal */}
          <Dialog open={modalState.isOpen && modalState.type === 'cancel'} onOpenChange={(open) => !open && closeModal()}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Cancel Session</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel this session? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <Label htmlFor="cancellation-reason">
                  Cancellation Reason <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="cancellation-reason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation"
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Keep Session
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleCancelSession}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Session"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Session Notes Modal */}
          <Dialog open={modalState.isOpen && modalState.type === 'notes'} onOpenChange={(open) => !open && closeModal()}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Session Notes</DialogTitle>
                <DialogDescription>
                  Add or edit notes for this mentorship session.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <Label htmlFor="session-notes">Notes</Label>
                <Textarea
                  id="session-notes"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Add notes about topics discussed, action items, etc."
                  className="resize-none"
                  rows={6}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveNotes}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Notes"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Meeting Link Modal */}
          <Dialog open={modalState.isOpen && modalState.type === 'meetingLink'} onOpenChange={(open) => !open && closeModal()}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Meeting Link</DialogTitle>
                <DialogDescription>
                  Add or update the meeting link for this session.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <Label htmlFor="meeting-link">Video Call Link</Label>
                <Input
                  id="meeting-link"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://zoom.us/j/123456789"
                />
                <p className="text-xs text-muted-foreground">
                  Add a Zoom, Google Meet, or other video conferencing link
                </p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveMeetingLink}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Link"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Review Modal */}
          <Dialog open={modalState.isOpen && modalState.type === 'review'} onOpenChange={(open) => !open && closeModal()}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Leave a Review</DialogTitle>
                <DialogDescription>
                  Share your feedback about your mentorship session.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-1 py-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewRating(rating)}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={`h-8 w-8 ${
                            rating <= reviewRating 
                              ? "text-yellow-500 fill-yellow-500" 
                              : "text-gray-300"
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="review-content">Review</Label>
                  <Textarea
                    id="review-content"
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Share your experience and feedback"
                    className="resize-none"
                    rows={5}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitReview}
                  disabled={!reviewContent.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default MentorSessionsPage;
