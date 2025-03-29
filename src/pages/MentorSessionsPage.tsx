
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus, User, MessageSquare, Filter, Star } from "lucide-react";
import { format, addDays } from "date-fns";
import AppLayout from "@/components/layout/AppLayout";
import MentorSessionList from "@/components/mentor/MentorSessionList";
import { useMentorSpace } from "@/hooks/use-mentor-space";
import { useAuth } from "@/contexts/AuthContext";
import { MentorSession } from "@/types/mentor";
import { PageTransition } from "@/components/ui/page-transition";
import { toast } from "sonner";

const MentorSessionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getMentorSessions,
    getMenteeSessions,
    cancelMentorSession,
    cancelMenteeSession,
    addMeetingLink,
    completeSession,
    isMentor,
  } = useMentorSpace();
  
  const [activeRole, setActiveRole] = useState<"mentor" | "mentee">("mentee");
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        if (activeRole === "mentor" && isMentor) {
          const mentorSessions = await getMentorSessions();
          setSessions(mentorSessions);
        } else {
          const menteeSessions = await getMenteeSessions();
          setSessions(menteeSessions);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast.error("Failed to load sessions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessions();
  }, [user, activeRole, isMentor]);
  
  const handleCancelSession = async (session: MentorSession) => {
    try {
      const reason = window.prompt("Please provide a reason for cancellation:");
      if (reason === null) return; // User clicked cancel on prompt
      
      if (activeRole === "mentor") {
        await cancelMentorSession(session.id, reason);
      } else {
        await cancelMenteeSession(session.id, reason);
      }
      
      // Refresh sessions after cancellation
      if (activeRole === "mentor") {
        const mentorSessions = await getMentorSessions();
        setSessions(mentorSessions);
      } else {
        const menteeSessions = await getMenteeSessions();
        setSessions(menteeSessions);
      }
      
      toast.success("Session cancelled successfully");
    } catch (error) {
      console.error("Error cancelling session:", error);
      toast.error("Failed to cancel session. Please try again.");
    }
  };
  
  const handleAddMeetingLink = async (session: MentorSession) => {
    try {
      const link = window.prompt("Enter the meeting link (Zoom, Google Meet, etc.):");
      if (!link) return; // User clicked cancel or entered empty string
      
      await addMeetingLink(session.id, link);
      
      // Refresh sessions
      const mentorSessions = await getMentorSessions();
      setSessions(mentorSessions);
      
      toast.success("Meeting link added successfully");
    } catch (error) {
      console.error("Error adding meeting link:", error);
      toast.error("Failed to add meeting link. Please try again.");
    }
  };
  
  const handleCompleteSession = async (session: MentorSession) => {
    try {
      await completeSession(session.id);
      
      // Refresh sessions
      const mentorSessions = await getMentorSessions();
      setSessions(mentorSessions);
      
      toast.success("Session marked as completed");
    } catch (error) {
      console.error("Error completing session:", error);
      toast.error("Failed to complete session. Please try again.");
    }
  };
  
  return (
    <AppLayout>
      <Helmet>
        <title>Mentor Sessions | Idolyst</title>
      </Helmet>
      
      <PageTransition>
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Mentor Sessions</h1>
              <p className="text-muted-foreground">
                Manage your mentoring sessions and appointments
              </p>
            </div>
            
            <div className="flex gap-2 self-end sm:self-auto">
              {isMentor && (
                <Tabs 
                  value={activeRole} 
                  onValueChange={(value) => setActiveRole(value as "mentor" | "mentee")}
                  className="w-[400px]"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mentee">As Mentee</TabsTrigger>
                    <TabsTrigger value="mentor">As Mentor</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
              
              <Button onClick={() => navigate("/mentor-space")}>
                <Plus className="mr-1 h-4 w-4" />
                Book Session
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <MentorSessionList 
              sessions={sessions}
              isLoading={isLoading}
              onCancelSession={handleCancelSession}
              onAddMeetingLink={activeRole === "mentor" ? handleAddMeetingLink : undefined}
              onCompleteSession={activeRole === "mentor" ? handleCompleteSession : undefined}
              asMentor={activeRole === "mentor"}
            />
          </div>
          
          {!isLoading && sessions.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
              <h3 className="text-lg font-medium mb-1">No sessions found</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {activeRole === "mentor" 
                  ? "You don't have any mentoring sessions scheduled. Check back later once someone books you."
                  : "You haven't booked any mentoring sessions yet. Book a session with a mentor to get started."}
              </p>
              
              {activeRole === "mentee" && (
                <Button className="mt-4" onClick={() => navigate("/mentor-space")}>
                  Browse Mentors
                </Button>
              )}
              
              {activeRole === "mentor" && !sessions.length && (
                <div className="mt-8 max-w-md mx-auto">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Star className="text-yellow-500 h-5 w-5 mr-2" />
                    Mentor Tips
                  </h4>
                  <ul className="space-y-3 text-sm text-left">
                    <li className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <p>Make sure your availability is up to date so mentees can book you</p>
                    </li>
                    <li className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <p>Complete your mentor profile to attract more mentees</p>
                    </li>
                    <li className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Star className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <p>Ask for reviews after completing sessions to build your reputation</p>
                    </li>
                  </ul>
                  
                  <div className="mt-4 flex gap-3">
                    <Button onClick={() => navigate("/mentor-space/settings")} variant="outline" size="sm">
                      Update Profile
                    </Button>
                    <Button onClick={() => navigate("/mentor-space/analytics")} variant="outline" size="sm">
                      View Analytics
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default MentorSessionsPage;
