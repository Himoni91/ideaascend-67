import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Loader2, ClipboardList, X, Video } from "lucide-react";
import { useMentor } from "@/hooks/use-mentor";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";
import MentorSessionList from "@/components/mentor/MentorSessionList";
import { MentorSession } from "@/types/mentor";

export default function MentorSessionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"mentee" | "mentor">("mentee");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState<MentorSession | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [meetingLinkDialogOpen, setMeetingLinkDialogOpen] = useState(false);
  const [sessionToAddLink, setSessionToAddLink] = useState<MentorSession | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  
  const { useMentorSessions, updateSessionStatus } = useMentor();
  
  const { 
    data: menteeSessions = [], 
    isLoading: isLoadingMenteeSessions 
  } = useMentorSessions(undefined, "mentee");
  
  const { 
    data: mentorSessions = [], 
    isLoading: isLoadingMentorSessions 
  } = useMentorSessions(undefined, "mentor");
  
  const isMentor = user?.is_mentor || false;
  
  const handleCancelSession = async (session: MentorSession) => {
    setSessionToCancel(session);
    setCancelDialogOpen(true);
  };
  
  const confirmCancelSession = async () => {
    if (!sessionToCancel) return;
    
    try {
      await updateSessionStatus({
        sessionId: sessionToCancel.id,
        status: "cancelled",
        cancellationReason
      });
      
      toast({
        title: "Session cancelled",
        description: "The session has been successfully cancelled."
      });
      
      setCancelDialogOpen(false);
      setSessionToCancel(null);
      setCancellationReason("");
    } catch (error) {
      console.error("Error cancelling session:", error);
      toast({
        title: "Error",
        description: "Failed to cancel the session. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleAddMeetingLink = (session: MentorSession) => {
    setSessionToAddLink(session);
    setMeetingLinkDialogOpen(true);
  };
  
  const confirmAddMeetingLink = async () => {
    if (!sessionToAddLink) return;
    
    try {
      await updateSessionStatus({
        sessionId: sessionToAddLink.id,
        status: sessionToAddLink.status,
        notes: sessionToAddLink.session_notes,
        meetingLink: meetingLink
      });
      
      toast({
        title: "Meeting link added",
        description: "The meeting link has been successfully added to the session."
      });
      
      setMeetingLinkDialogOpen(false);
      setSessionToAddLink(null);
      setMeetingLink("");
    } catch (error) {
      console.error("Error adding meeting link:", error);
      toast({
        title: "Error",
        description: "Failed to add the meeting link. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleCompleteSession = async (session: MentorSession) => {
    try {
      await updateSessionStatus({
        sessionId: session.id,
        status: "completed"
      });
      
      toast({
        title: "Session completed",
        description: "The session has been marked as completed."
      });
    } catch (error) {
      console.error("Error completing session:", error);
      toast({
        title: "Error",
        description: "Failed to mark the session as completed. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleJoinSession = (session: MentorSession) => {
    if (session.session_url) {
      window.open(session.session_url, "_blank");
    }
  };
  
  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16">
          <Alert>
            <AlertDescription>
              You need to be logged in to view your mentorship sessions.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild>
              <Link to="/auth/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Calendar className="mr-3 h-7 w-7 text-primary" />
              My Mentorship Sessions
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Manage all your mentorship sessions, view upcoming sessions, and access your session history.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {isMentor ? (
                <Tabs defaultValue="mentee" value={activeTab} onValueChange={(value) => setActiveTab(value as "mentee" | "mentor")}>
                  <TabsList className="w-full max-w-md grid grid-cols-2 mb-6">
                    <TabsTrigger value="mentee">My Sessions as Mentee</TabsTrigger>
                    <TabsTrigger value="mentor">My Sessions as Mentor</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="mentee">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MentorSessionList
                        sessions={menteeSessions}
                        isLoading={isLoadingMenteeSessions}
                        onCancelSession={handleCancelSession}
                        onJoinSession={handleJoinSession}
                      />
                    </motion.div>
                  </TabsContent>
                  
                  <TabsContent value="mentor">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MentorSessionList
                        sessions={mentorSessions}
                        isLoading={isLoadingMentorSessions}
                        onCancelSession={handleCancelSession}
                        onJoinSession={handleJoinSession}
                        onAddMeetingLink={handleAddMeetingLink}
                        onCompleteSession={handleCompleteSession}
                        asMentor={true}
                      />
                    </motion.div>
                  </TabsContent>
                </Tabs>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MentorSessionList
                    sessions={menteeSessions}
                    isLoading={isLoadingMenteeSessions}
                    onCancelSession={handleCancelSession}
                    onJoinSession={handleJoinSession}
                  />
                </motion.div>
              )}
            </div>
            
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Session Stats</CardTitle>
                    <CardDescription>
                      Your mentorship journey at a glance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-primary/5 rounded-lg text-center">
                        <h3 className="text-2xl font-bold text-primary">
                          {activeTab === "mentee" 
                            ? menteeSessions.filter(s => s.status === "scheduled" || s.status === "rescheduled").length
                            : mentorSessions.filter(s => s.status === "scheduled" || s.status === "rescheduled").length}
                        </h3>
                        <p className="text-xs text-muted-foreground">Upcoming Sessions</p>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-lg text-center">
                        <h3 className="text-2xl font-bold text-primary">
                          {activeTab === "mentee" 
                            ? menteeSessions.filter(s => s.status === "completed").length
                            : mentorSessions.filter(s => s.status === "completed").length}
                        </h3>
                        <p className="text-xs text-muted-foreground">Completed Sessions</p>
                      </div>
                      {isMentor && activeTab === "mentor" && (
                        <>
                          <div className="p-4 bg-primary/5 rounded-lg text-center">
                            <h3 className="text-2xl font-bold text-primary">
                              {mentorSessions.filter(s => s.status === "completed")
                                .reduce((total, session) => total + (session.payment_amount || 0), 0)}
                            </h3>
                            <p className="text-xs text-muted-foreground">Total Earnings ($)</p>
                          </div>
                          <div className="p-4 bg-primary/5 rounded-lg text-center">
                            <h3 className="text-2xl font-bold text-primary">
                              {new Set(mentorSessions.map(s => s.mentee_id)).size}
                            </h3>
                            <p className="text-xs text-muted-foreground">Unique Mentees</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" asChild>
                      <Link to="/mentor-space">
                        <Calendar className="mr-2 h-4 w-4" />
                        Find Mentors
                      </Link>
                    </Button>
                    
                    {!isMentor && (
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/mentor-space/apply">
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Become a Mentor
                        </Link>
                      </Button>
                    )}
                    
                    {isMentor && (
                      <>
                        <Button variant="outline" className="w-full" asChild>
                          <Link to="/mentor-space/analytics">
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Mentor Analytics
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <Link to={`/mentor-space/${user.id}`}>
                            <ClipboardList className="mr-2 h-4 w-4" />
                            My Mentor Profile
                          </Link>
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
          
          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Session</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel this session? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div>
                <label htmlFor="cancellation-reason" className="text-sm font-medium">
                  Reason for cancellation
                </label>
                <Textarea
                  id="cancellation-reason"
                  placeholder="Please provide a reason for cancellation"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                  Keep Session
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmCancelSession}
                  disabled={!cancellationReason}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Session
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={meetingLinkDialogOpen} onOpenChange={setMeetingLinkDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Meeting Link</DialogTitle>
                <DialogDescription>
                  Add a video conferencing link for this mentorship session.
                </DialogDescription>
              </DialogHeader>
              <div>
                <label htmlFor="meeting-link" className="text-sm font-medium">
                  Meeting Link
                </label>
                <Input
                  id="meeting-link"
                  placeholder="https://zoom.us/j/123456789 or similar"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setMeetingLinkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={confirmAddMeetingLink}
                  disabled={!meetingLink}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Add Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
