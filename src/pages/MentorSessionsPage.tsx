
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Filter, 
  Search as SearchIcon,
  CheckCircle, 
  XCircle, 
  LayoutList,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";
import MentorSessionCard from "@/components/mentor/MentorSessionCard";
import { useMentor } from "@/hooks/use-mentor";
import { useAuth } from "@/contexts/AuthContext";
import { MentorSession } from "@/types/mentor";
import { toast } from "sonner";

export default function MentorSessionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionStatusFilter, setSessionStatusFilter] = useState<string>("all");
  
  const { useMentorSessions, updateSessionStatus } = useMentor();
  
  const { data: scheduledSessions, isLoading: isLoadingScheduled } = useMentorSessions("scheduled");
  const { data: inProgressSessions, isLoading: isLoadingInProgress } = useMentorSessions("in-progress");
  const { data: completedSessions, isLoading: isLoadingCompleted } = useMentorSessions("completed");
  const { data: cancelledSessions, isLoading: isLoadingCancelled } = useMentorSessions("cancelled");
  
  // Handle session status update
  const handleUpdateSessionStatus = async (sessionId: string, status: string) => {
    try {
      await updateSessionStatus({
        sessionId,
        status,
        notes: ""
      });
      
      toast.success(`Session ${status} successfully`);
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Failed to update session status");
    }
  };
  
  // Get sessions based on active tab
  const getSessions = () => {
    switch (activeTab) {
      case "upcoming":
        return scheduledSessions || [];
      case "active":
        return inProgressSessions || [];
      case "past":
        return [...(completedSessions || []), ...(cancelledSessions || [])];
      default:
        return [];
    }
  };
  
  // Filter sessions based on search term
  const filteredSessions = getSessions().filter((session: MentorSession) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      session.title.toLowerCase().includes(searchLower) ||
      (session.mentor?.full_name?.toLowerCase().includes(searchLower) || false) ||
      (session.mentee?.full_name?.toLowerCase().includes(searchLower) || false)
    );
  });
  
  // Get user role based on session
  const getUserRole = (session: MentorSession) => {
    return session.mentor_id === user?.id ? "mentor" : "mentee";
  };
  
  // Check if sessions are loading
  const isLoading = isLoadingScheduled || isLoadingInProgress || isLoadingCompleted || isLoadingCancelled;

  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2 flex items-center">
                    <CalendarDays className="mr-3 h-7 w-7 text-primary" />
                    Your Sessions
                  </h1>
                  <p className="text-muted-foreground">
                    Manage all your mentorship sessions in one place
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="h-9 w-9"
                  >
                    <LayoutList className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="h-9 w-9"
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="past">Past Sessions</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search sessions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {activeTab === "past" && (
                      <Select 
                        value={sessionStatusFilter} 
                        onValueChange={setSessionStatusFilter}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                
                <TabsContent value="upcoming" className="mt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-36 bg-muted animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : filteredSessions.length > 0 ? (
                    <div className={viewMode === "list" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                      {filteredSessions.map((session) => (
                        <MentorSessionCard 
                          key={session.id}
                          session={session}
                          userRole={getUserRole(session)}
                          onUpdateStatus={handleUpdateSessionStatus}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                      <h3 className="text-lg font-medium mb-1">No upcoming sessions</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                        You don't have any upcoming mentorship sessions scheduled. Find a mentor to book a session or add availability if you're a mentor.
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <Button 
                          onClick={() => navigate("/mentor-space")}
                        >
                          Find a Mentor
                        </Button>
                        {user && (
                          <Button 
                            variant="outline"
                            onClick={() => navigate("/mentor-space/apply")}
                          >
                            Become a Mentor
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="active" className="mt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-36 bg-muted animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : filteredSessions.length > 0 ? (
                    <div className={viewMode === "list" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                      {filteredSessions.map((session) => (
                        <MentorSessionCard 
                          key={session.id}
                          session={session}
                          userRole={getUserRole(session)}
                          onUpdateStatus={handleUpdateSessionStatus}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg">
                      <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                      <h3 className="text-lg font-medium mb-1">No active sessions</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        You don't have any mentorship sessions in progress right now.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="past" className="mt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-36 bg-muted animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : filteredSessions.length > 0 ? (
                    <>
                      <div className={viewMode === "list" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                        {filteredSessions
                          .filter(session => 
                            sessionStatusFilter === "all" || 
                            session.status === sessionStatusFilter
                          )
                          .map((session) => (
                            <MentorSessionCard 
                              key={session.id}
                              session={session}
                              userRole={getUserRole(session)}
                              onUpdateStatus={handleUpdateSessionStatus}
                            />
                          ))}
                      </div>
                      
                      {filteredSessions.length > 10 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                          <Button variant="outline" size="sm">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                          <Button variant="outline" size="sm" className="px-3">1</Button>
                          <Button variant="outline" size="sm" className="px-3 bg-primary text-primary-foreground">2</Button>
                          <Button variant="outline" size="sm" className="px-3">3</Button>
                          <Button variant="outline" size="sm">
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 border rounded-lg">
                      <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                      <h3 className="text-lg font-medium mb-1">No past sessions</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        You don't have any completed or cancelled sessions yet.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
