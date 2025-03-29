
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, MapPin, Video } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { MentorSession, MentorSessionStatus } from "@/types/mentor";
import { useMentor } from "@/hooks/use-mentor";
import AppLayout from "@/components/layout/AppLayout";
import NoDataPlaceholder from "@/components/shared/NoDataPlaceholder";
import SessionStatusBadge from "@/components/mentor/SessionStatusBadge";

export default function MentorSessionsPage() {
  const { useMentorSessions } = useMentor();
  const [activeTab, setActiveTab] = useState<MentorSessionStatus>("upcoming");
  const [upcomingSessions, setUpcomingSessions] = useState<MentorSession[]>([]);
  const [pastSessions, setPastSessions] = useState<MentorSession[]>([]);
  
  // Get upcoming sessions (scheduled, confirmed)
  const { 
    data: upcomingSessionsData,
    isLoading: isUpcomingLoading,
    error: upcomingError
  } = useQuery({
    queryKey: ["mentor-sessions", "upcoming"],
    queryFn: () => useMentorSessions("upcoming")
  });
  
  // Get past sessions (completed, cancelled)
  const { 
    data: pastSessionsData,
    isLoading: isPastLoading,
    error: pastError
  } = useQuery({
    queryKey: ["mentor-sessions", "past"],
    queryFn: () => useMentorSessions("past")
  });
  
  // Update state when data changes
  useEffect(() => {
    if (upcomingSessionsData) {
      setUpcomingSessions(upcomingSessionsData);
    }
  }, [upcomingSessionsData]);
  
  useEffect(() => {
    if (pastSessionsData) {
      setPastSessions(pastSessionsData);
    }
  }, [pastSessionsData]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as MentorSessionStatus);
  };
  
  // Render session cards
  const renderSessions = (sessions: MentorSession[]) => {
    if (!sessions || sessions.length === 0) {
      return (
        <NoDataPlaceholder
          title="No sessions found"
          description="You don't have any sessions in this category."
          icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
        />
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    );
  };
  
  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Sessions</h1>
              <p className="text-muted-foreground">Manage your mentoring sessions</p>
            </div>
            
            <Button onClick={() => window.location.href = "/mentor-space"}>
              Back to Mentor Space
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="mt-6">
              {isUpcomingLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin h-8 w-8 border-4 border-idolyst-blue border-t-transparent rounded-full"></div>
                  <p className="mt-2 text-muted-foreground">Loading upcoming sessions...</p>
                </div>
              ) : upcomingError ? (
                <div className="text-center py-10 text-red-500">
                  Error loading sessions. Please try again.
                </div>
              ) : (
                renderSessions(upcomingSessions)
              )}
            </TabsContent>
            
            <TabsContent value="past" className="mt-6">
              {isPastLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin h-8 w-8 border-4 border-idolyst-blue border-t-transparent rounded-full"></div>
                  <p className="mt-2 text-muted-foreground">Loading past sessions...</p>
                </div>
              ) : pastError ? (
                <div className="text-center py-10 text-red-500">
                  Error loading sessions. Please try again.
                </div>
              ) : (
                renderSessions(pastSessions)
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AppLayout>
  );
}

// Session Card Component
interface SessionCardProps {
  session: MentorSession;
}

function SessionCard({ session }: SessionCardProps) {
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);
  
  // Format session time range
  const formatTimeRange = () => {
    const startString = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endString = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${startString} - ${endString}`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{session.title}</CardTitle>
            <SessionStatusBadge status={session.status} />
          </div>
          <CardDescription>{session.session_type}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-idolyst-blue" />
              <span>{formatDate(startTime)}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-idolyst-blue" />
              <span>{formatTimeRange()}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-idolyst-blue" />
              <span>{session.is_mentor ? session.mentee_name : session.mentor_name}</span>
            </div>
            
            {session.session_url && (
              <div className="flex items-center text-sm">
                <Video className="h-4 w-4 mr-2 text-idolyst-blue" />
                <a 
                  href={session.session_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-idolyst-blue hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Join Meeting
                </a>
              </div>
            )}
            
            {session.location && (
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-idolyst-blue" />
                <span>{session.location}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <Button 
              className="w-full"
              variant={session.status === "scheduled" ? "default" : "outline"}
              onClick={() => window.location.href = `/mentor-sessions/${session.id}`}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
