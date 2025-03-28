
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckSquare, 
  AlertTriangle,
  Search,
  FilterX
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMentor } from "@/hooks/use-mentor";
import { MentorSession } from "@/types/mentor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/layout/AppLayout";
import MentorSessionCard from "@/components/mentor/MentorSessionCard";
import { PageTransition } from "@/components/ui/page-transition";

export default function MentorSessionsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { useMentorSessions, useUpdateSessionStatus } = useMentor();
  
  // Fetch sessions based on user role
  const { data: myMentorSessions, isLoading: sessionsLoading, error: sessionsError } = useMentorSessions();
  const updateSessionStatus = useUpdateSessionStatus();
  
  // Filter sessions by role (mentor or mentee)
  const mentorSessions = myMentorSessions?.filter((session) => session.mentor_id === user?.id) || [];
  const menteeSessions = myMentorSessions?.filter((session) => session.mentee_id === user?.id) || [];
  
  // Additional filtering
  const filterSessions = (sessions: MentorSession[]) => {
    return sessions
      .filter(session => 
        statusFilter === "all" || session.status === statusFilter
      )
      .filter(session => 
        searchTerm === "" || 
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (session.mentor?.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
        (session.mentee?.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
  };
  
  const filteredMentorSessions = filterSessions(mentorSessions);
  const filteredMenteeSessions = filterSessions(menteeSessions);
  
  // Handler for session status updates
  const handleUpdateStatus = async (sessionId: string, status: string) => {
    await updateSessionStatus.mutateAsync({ sessionId, status });
  };
  
  // Group sessions by date for calendar view
  const groupSessionsByDate = (sessions: MentorSession[]) => {
    const grouped: Record<string, MentorSession[]> = {};
    
    sessions.forEach(session => {
      const date = new Date(session.start_time).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });
    
    return grouped;
  };
  
  const mentorSessionsByDate = groupSessionsByDate(filteredMentorSessions);
  const menteeSessionsByDate = groupSessionsByDate(filteredMenteeSessions);
  
  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold mb-1">My Sessions</h1>
              <p className="text-muted-foreground">
                Manage all your mentorship sessions in one place
              </p>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" asChild>
                <a href="/mentor-space">
                  <Users className="mr-2 h-4 w-4" />
                  Find Mentors
                </a>
              </Button>
              {mentorSessions.length > 0 && (
                <Button variant="outline" asChild>
                  <a href="/mentor-space/analytics">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Mentor Analytics
                  </a>
                </Button>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="sessions">
            <TabsList className="mb-6 grid grid-cols-2 w-full sm:w-[400px]">
              <TabsTrigger value="sessions">
                <Calendar className="mr-2 h-4 w-4" />
                Sessions List
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar View
              </TabsTrigger>
            </TabsList>
            
            {/* Sessions List View */}
            <TabsContent value="sessions">
              <div className="flex flex-col md:flex-row items-stretch gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sessions by title, mentor or mentee..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                {(searchTerm || statusFilter !== "all") && (
                  <Button variant="ghost" onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }} className="flex md:w-auto">
                    <FilterX className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sessions as Mentor */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-semibold">My Mentoring Sessions</h2>
                    <span className="text-sm text-muted-foreground">
                      ({filteredMentorSessions.length})
                    </span>
                  </div>
                  
                  {sessionsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <Card key={i} className="h-40 animate-pulse" />
                      ))}
                    </div>
                  ) : filteredMentorSessions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredMentorSessions.map((session) => (
                        <MentorSessionCard
                          key={session.id}
                          session={session}
                          userRole="mentor"
                          onUpdateStatus={handleUpdateStatus}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-12 flex flex-col items-center justify-center">
                        <Clock className="h-12 w-12 text-muted-foreground opacity-20 mb-3" />
                        <h3 className="text-lg font-medium mb-1">No mentor sessions found</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                          {mentorSessions.length > 0
                            ? "No sessions match the current filters. Try adjusting your search criteria."
                            : "You haven't conducted any mentorship sessions yet. Apply to become a mentor to start helping others."}
                        </p>
                        {mentorSessions.length === 0 && (
                          <Button className="mt-4" variant="outline" asChild>
                            <a href="/mentor-space/apply">
                              <Users className="mr-2 h-4 w-4" />
                              Apply to Become a Mentor
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                {/* Divider */}
                <div className="md:col-span-3 my-6 border-t"></div>
                
                {/* Sessions as Mentee */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-semibold">My Booked Sessions</h2>
                    <span className="text-sm text-muted-foreground">
                      ({filteredMenteeSessions.length})
                    </span>
                  </div>
                  
                  {sessionsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <Card key={i} className="h-40 animate-pulse" />
                      ))}
                    </div>
                  ) : filteredMenteeSessions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredMenteeSessions.map((session) => (
                        <MentorSessionCard
                          key={session.id}
                          session={session}
                          userRole="mentee"
                          onUpdateStatus={handleUpdateStatus}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-12 flex flex-col items-center justify-center">
                        <Calendar className="h-12 w-12 text-muted-foreground opacity-20 mb-3" />
                        <h3 className="text-lg font-medium mb-1">No booked sessions found</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                          {menteeSessions.length > 0
                            ? "No sessions match the current filters. Try adjusting your search criteria."
                            : "You haven't booked any mentorship sessions yet. Find a mentor to schedule your first session."}
                        </p>
                        {menteeSessions.length === 0 && (
                          <Button className="mt-4" variant="outline" asChild>
                            <a href="/mentor-space">
                              <Users className="mr-2 h-4 w-4" />
                              Find a Mentor
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Calendar View */}
            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle>Sessions Calendar</CardTitle>
                  <CardDescription>
                    View all your upcoming and past sessions in a calendar format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Mentor Sessions Calendar */}
                    {mentorSessions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">My Mentoring Sessions</h3>
                        {Object.keys(mentorSessionsByDate).length > 0 ? (
                          <div className="space-y-4">
                            {Object.keys(mentorSessionsByDate)
                              .sort()
                              .map(date => (
                                <div key={date} className="border rounded-lg p-4">
                                  <h4 className="font-medium mb-3 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                                    {new Date(date).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </h4>
                                  <div className="space-y-2">
                                    {mentorSessionsByDate[date].map(session => (
                                      <div key={session.id} className="border-l-2 border-primary pl-3 py-1">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="font-medium">{session.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                              {new Date(session.start_time).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit'
                                              })} - 
                                              {new Date(session.end_time).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit'
                                              })}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-sm font-medium">
                                              {session.mentee?.full_name || session.mentee?.username}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{session.status}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No sessions found in the calendar view.</p>
                        )}
                      </div>
                    )}
                    
                    {/* Mentee Sessions Calendar */}
                    {menteeSessions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">My Booked Sessions</h3>
                        {Object.keys(menteeSessionsByDate).length > 0 ? (
                          <div className="space-y-4">
                            {Object.keys(menteeSessionsByDate)
                              .sort()
                              .map(date => (
                                <div key={date} className="border rounded-lg p-4">
                                  <h4 className="font-medium mb-3 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                                    {new Date(date).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      month: 'long',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </h4>
                                  <div className="space-y-2">
                                    {menteeSessionsByDate[date].map(session => (
                                      <div key={session.id} className="border-l-2 border-primary pl-3 py-1">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="font-medium">{session.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                              {new Date(session.start_time).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit'
                                              })} - 
                                              {new Date(session.end_time).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit'
                                              })}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-sm font-medium">
                                              {session.mentor?.full_name || session.mentor?.username}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{session.status}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No sessions found in the calendar view.</p>
                        )}
                      </div>
                    )}
                    
                    {mentorSessions.length === 0 && menteeSessions.length === 0 && (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                        <h3 className="text-lg font-medium mb-1">No sessions on your calendar</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          You don't have any scheduled mentorship sessions yet.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center mt-4">
                          <Button variant="outline" asChild>
                            <a href="/mentor-space">
                              <Users className="mr-2 h-4 w-4" />
                              Find a Mentor
                            </a>
                          </Button>
                          <Button variant="outline" asChild>
                            <a href="/mentor-space/apply">
                              <CheckSquare className="mr-2 h-4 w-4" />
                              Become a Mentor
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
