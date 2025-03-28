
import { useState } from "react";
import { Calendar, Clock, Video, MessageSquare, FileText, X, Loader2 } from "lucide-react";
import { format, parseISO, isPast, isToday } from "date-fns";
import { MentorSession } from "@/types/mentor";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface MentorSessionListProps {
  sessions: MentorSession[];
  isLoading: boolean;
  onCancelSession?: (session: MentorSession) => Promise<void>;
  onJoinSession?: (session: MentorSession) => void;
  onAddMeetingLink?: (session: MentorSession) => void; // Update the type definition
  onCompleteSession?: (session: MentorSession) => Promise<void>;
  onRescheduleSession?: (session: MentorSession) => void;
  asMentor?: boolean;
}

export default function MentorSessionList({
  sessions,
  isLoading,
  onCancelSession,
  onJoinSession,
  onAddMeetingLink,
  onCompleteSession,
  onRescheduleSession,
  asMentor = false
}: MentorSessionListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [processingSessionId, setProcessingSessionId] = useState<string | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [showMeetingLinkInput, setShowMeetingLinkInput] = useState<string | null>(null);
  
  if (!user) return null;
  
  const upcomingSessions = sessions.filter(
    session => session.status === "scheduled" || session.status === "rescheduled"
  );
  
  const completedSessions = sessions.filter(session => session.status === "completed");
  const cancelledSessions = sessions.filter(session => session.status === "cancelled");
  
  const handleCancelSession = async (session: MentorSession) => {
    if (!onCancelSession) return;
    
    try {
      setProcessingSessionId(session.id);
      await onCancelSession(session);
      toast({
        title: "Session cancelled",
        description: "The session has been successfully cancelled."
      });
    } catch (error) {
      console.error("Error cancelling session:", error);
      toast({
        title: "Error",
        description: "Failed to cancel the session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingSessionId(null);
    }
  };
  
  const handleAddMeetingLink = async (session: MentorSession) => {
    if (!onAddMeetingLink || !meetingLink) return;
    
    try {
      setProcessingSessionId(session.id);
      await onAddMeetingLink(session, meetingLink);
      toast({
        title: "Meeting link added",
        description: "The meeting link has been successfully added."
      });
      setShowMeetingLinkInput(null);
      setMeetingLink("");
    } catch (error) {
      console.error("Error adding meeting link:", error);
      toast({
        title: "Error",
        description: "Failed to add the meeting link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingSessionId(null);
    }
  };
  
  const handleCompleteSession = async (session: MentorSession) => {
    if (!onCompleteSession) return;
    
    try {
      setProcessingSessionId(session.id);
      await onCompleteSession(session);
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
    } finally {
      setProcessingSessionId(null);
    }
  };
  
  const getSessionStatusBadge = (session: MentorSession) => {
    switch (session.status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Scheduled</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300">Cancelled</Badge>;
      case "rescheduled":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Rescheduled</Badge>;
      default:
        return <Badge variant="outline">{session.status}</Badge>;
    }
  };
  
  const getParticipant = (session: MentorSession) => {
    return asMentor ? session.mentee : session.mentor;
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const renderSessionCards = (filteredSessions: MentorSession[]) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (filteredSessions.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
          <h3 className="text-lg font-medium mb-1">No sessions found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {activeTab === "upcoming" 
              ? "You don't have any upcoming sessions. Book a session with a mentor to get started." 
              : activeTab === "completed"
              ? "You haven't completed any sessions yet."
              : "You don't have any cancelled sessions."}
          </p>
          {activeTab === "upcoming" && (
            <Button className="mt-4" asChild>
              <Link to="/mentor-space">Find a Mentor</Link>
            </Button>
          )}
        </div>
      );
    }
    
    return (
      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredSessions.map((session) => (
          <motion.div key={session.id} variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={getParticipant(session)?.avatar_url || undefined} />
                      <AvatarFallback>
                        {getParticipant(session)?.full_name?.charAt(0) || 
                         getParticipant(session)?.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {session.title}
                      </CardTitle>
                      <CardDescription>
                        with {getParticipant(session)?.full_name || getParticipant(session)?.username}
                      </CardDescription>
                    </div>
                  </div>
                  {getSessionStatusBadge(session)}
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{format(parseISO(session.start_time), "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                      {format(parseISO(session.start_time), "h:mm a")} - {format(parseISO(session.end_time), "h:mm a")}
                    </span>
                  </div>
                </div>
                
                {session.description && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    <p>{session.description}</p>
                  </div>
                )}
                
                {showMeetingLinkInput === session.id && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                        placeholder="Enter meeting link (Zoom, Google Meet, etc.)"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowMeetingLinkInput(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!meetingLink || processingSessionId === session.id}
                      onClick={() => handleAddMeetingLink(session)}
                    >
                      {processingSessionId === session.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Meeting Link"
                      )}
                    </Button>
                  </div>
                )}
                
                {session.session_url && (
                  <Alert className="mt-3">
                    <div className="flex justify-between items-center">
                      <AlertDescription className="text-sm flex items-center">
                        <Video className="h-4 w-4 mr-2 text-primary" />
                        <a
                          href={session.session_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Join Meeting
                        </a>
                      </AlertDescription>
                      {onJoinSession && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onJoinSession(session)}
                        >
                          Join
                        </Button>
                      )}
                    </div>
                  </Alert>
                )}
                
                {session.cancellation_reason && (
                  <Alert className="mt-3 bg-red-50 dark:bg-red-900/20">
                    <AlertDescription className="text-sm">
                      <strong>Cancellation reason:</strong> {session.cancellation_reason}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex flex-wrap gap-2 w-full">
                  {/* Actions for upcoming sessions */}
                  {(session.status === "scheduled" || session.status === "rescheduled") && (
                    <>
                      {/* Mentor Actions */}
                      {asMentor && (
                        <>
                          {!session.session_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => setShowMeetingLinkInput(session.id)}
                              disabled={processingSessionId === session.id}
                            >
                              <Video className="mr-2 h-4 w-4" />
                              Add Meeting Link
                            </Button>
                          )}
                          
                          {isToday(parseISO(session.start_time)) && (
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleCompleteSession(session)}
                              disabled={processingSessionId === session.id}
                            >
                              {processingSessionId === session.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <FileText className="mr-2 h-4 w-4" />
                              )}
                              Complete Session
                            </Button>
                          )}
                        </>
                      )}
                      
                      {/* Common Actions */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <Link to={`/messages/${getParticipant(session)?.id}`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message
                        </Link>
                      </Button>
                      
                      {onCancelSession && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCancelSession(session)}
                          disabled={processingSessionId === session.id || isPast(parseISO(session.start_time))}
                        >
                          {processingSessionId === session.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <X className="mr-2 h-4 w-4" />
                          )}
                          Cancel
                        </Button>
                      )}
                    </>
                  )}
                  
                  {/* Actions for completed sessions */}
                  {session.status === "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/mentor-space/session/${session.id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  };
  
  return (
    <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="upcoming">
          Upcoming {upcomingSessions.length > 0 && `(${upcomingSessions.length})`}
        </TabsTrigger>
        <TabsTrigger value="completed">
          Completed {completedSessions.length > 0 && `(${completedSessions.length})`}
        </TabsTrigger>
        <TabsTrigger value="cancelled">
          Cancelled {cancelledSessions.length > 0 && `(${cancelledSessions.length})`}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming">
        {renderSessionCards(upcomingSessions)}
      </TabsContent>
      
      <TabsContent value="completed">
        {renderSessionCards(completedSessions)}
      </TabsContent>
      
      <TabsContent value="cancelled">
        {renderSessionCards(cancelledSessions)}
      </TabsContent>
    </Tabs>
  );
}
