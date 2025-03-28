
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  Star, 
  TrendingUp, 
  User,
  Loader2
} from "lucide-react";
import { useMentor } from "@/hooks/use-mentor";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";

export default function MentorAnalyticsPage() {
  const { user } = useAuth();
  const { useMentorAnalytics, useMentorSessions } = useMentor();
  
  const { data: analytics, isLoading: isLoadingAnalytics } = useMentorAnalytics();
  const { data: sessions = [], isLoading: isLoadingSessions } = useMentorSessions(undefined, "mentor");
  
  // Check if current user is a mentor
  const isMentor = user?.is_mentor || false;
  
  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16">
          <Alert>
            <AlertDescription>
              You need to be logged in to view mentor analytics.
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
  
  if (!isMentor) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16">
          <Alert>
            <AlertDescription>
              You need to be a mentor to access this page.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild>
              <Link to="/mentor-space/apply">Become a Mentor</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Get recent sessions (last 5)
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  
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
              <BarChart3 className="mr-3 h-7 w-7 text-primary" />
              Mentor Analytics
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Track your performance as a mentor, view earnings, and gain insights into your mentorship impact.
            </p>
          </motion.div>
          
          {isLoadingAnalytics ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Session Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="lg:col-span-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {analytics?.total_sessions || 0}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Completed Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {analytics?.completed_sessions || 0}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Unique Mentees
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {analytics?.unique_mentees || 0}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Average Rating
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold flex items-center">
                        {analytics?.average_rating ? analytics.average_rating.toFixed(1) : "N/A"}
                        {analytics?.average_rating ? (
                          <Star className="h-4 w-4 ml-1 text-yellow-500 fill-yellow-500" />
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-primary" />
                        Earnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold mb-4">${analytics?.total_earnings || 0}</div>
                      <p className="text-sm text-muted-foreground">
                        Total earnings from {analytics?.completed_sessions || 0} completed sessions
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Star className="h-5 w-5 mr-2 text-primary" />
                        Reviews
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold mb-4">{analytics?.reviews_count || 0}</div>
                      <p className="text-sm text-muted-foreground">
                        Total reviews from mentees with an average rating of {analytics?.average_rating ? analytics.average_rating.toFixed(1) : "N/A"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                    <CardDescription>
                      Your most recent mentorship sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSessions ? (
                      <div className="flex justify-center items-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : recentSessions.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No sessions recorded yet.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {recentSessions.map((session) => (
                          <div key={session.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={session.mentee?.avatar_url || undefined} />
                                <AvatarFallback>
                                  {session.mentee?.full_name?.charAt(0) || 
                                  session.mentee?.username?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">{session.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  with {session.mentee?.full_name || session.mentee?.username}
                                </p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                  <div className="flex items-center">
                                    <Calendar className="h-3.5 w-3.5 mr-1" />
                                    {new Date(session.start_time).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-3.5 w-3.5 mr-1" />
                                    {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                ${session.payment_amount || 0}
                              </div>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {session.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/mentor-space/sessions">
                        View All Sessions
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Upcoming Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSessions ? (
                      <div className="flex justify-center items-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : sessions.filter(s => s.status === "scheduled" || s.status === "rescheduled").length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No upcoming sessions.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sessions
                          .filter(s => s.status === "scheduled" || s.status === "rescheduled")
                          .slice(0, 3)
                          .map((session) => (
                            <div key={session.id} className="border rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={session.mentee?.avatar_url || undefined} />
                                  <AvatarFallback>
                                    {session.mentee?.full_name?.charAt(0) || 
                                    session.mentee?.username?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium text-sm">{session.mentee?.full_name || session.mentee?.username}</h4>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center mb-1">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {new Date(session.start_time).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Repeat mentees</span>
                        <span className="font-medium">{analytics?.repeat_mentees || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Reviews received</span>
                        <span className="font-medium">{analytics?.reviews_count || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Upcoming sessions</span>
                        <span className="font-medium">{analytics?.upcoming_sessions || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Completion rate</span>
                        <span className="font-medium">
                          {analytics?.total_sessions 
                            ? Math.round((analytics.completed_sessions / analytics.total_sessions) * 100) 
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/mentor-space/${user.id}`}>
                        View My Profile
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
}
