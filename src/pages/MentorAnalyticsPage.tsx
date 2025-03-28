
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
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";

export default function MentorAnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useMentorAnalytics, useMentorSessions, useMentorReviews } = useMentor();
  
  const [timeRange, setTimeRange] = useState<"all" | "month" | "week">("all");
  
  // Get mentor analytics
  const { data: analytics, isLoading: isLoadingAnalytics } = useMentorAnalytics();
  
  // Get recent sessions
  const { data: recentSessions = [], isLoading: isLoadingSessions } = useMentorSessions(
    "all", 
    "mentor"
  );
  
  // Get recent reviews
  const { data: reviews = [], isLoading: isLoadingReviews } = useMentorReviews(
    user?.id
  );
  
  if (!user) {
    navigate("/auth/sign-in");
    return null;
  }
  
  // Filter sessions based on time range
  const filteredSessions = recentSessions.filter(session => {
    const sessionDate = new Date(session.created_at);
    const now = new Date();
    
    if (timeRange === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return sessionDate >= weekAgo;
    } else if (timeRange === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return sessionDate >= monthAgo;
    }
    
    return true;
  });
  
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
              <h1 className="text-2xl font-bold">Mentor Analytics</h1>
              <p className="text-muted-foreground">
                Track your mentorship performance and impact
              </p>
            </div>
          </div>
          
          <Tabs 
            value={timeRange} 
            onValueChange={(value) => setTimeRange(value as "all" | "month" | "week")}
            className="mb-6"
          >
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="all">All Time</TabsTrigger>
              <TabsTrigger value="month">Past Month</TabsTrigger>
              <TabsTrigger value="week">Past Week</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {isLoadingAnalytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="bg-muted/30 animate-pulse">
                  <CardContent className="p-6 h-28"></CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
                      <p className="text-3xl font-bold">{analytics?.total_sessions || 0}</p>
                    </div>
                    <Calendar className="h-10 w-10 text-primary/20" />
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <span className="text-green-500 font-medium flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" /> 
                      {analytics?.upcoming_sessions || 0} upcoming
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Completed</p>
                      <p className="text-3xl font-bold">{analytics?.completed_sessions || 0}</p>
                    </div>
                    <Clock className="h-10 w-10 text-primary/20" />
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {analytics?.total_sessions ? (
                      <span className="font-medium">
                        {Math.round((analytics.completed_sessions / analytics.total_sessions) * 100)}% completion rate
                      </span>
                    ) : (
                      <span>No sessions yet</span>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                      <p className="text-3xl font-bold">${analytics?.total_earnings || 0}</p>
                    </div>
                    <DollarSign className="h-10 w-10 text-primary/20" />
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {analytics?.completed_sessions ? (
                      <span className="font-medium">
                        ${Math.round((analytics.total_earnings / analytics.completed_sessions) * 100) / 100} avg. per session
                      </span>
                    ) : (
                      <span>No completed sessions yet</span>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Rating</p>
                      <div className="flex items-center">
                        <p className="text-3xl font-bold mr-1">{Math.round(analytics?.average_rating * 10) / 10 || 0}</p>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    <Users className="h-10 w-10 text-primary/20" />
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    <span className="font-medium">
                      {analytics?.reviews_count || 0} reviews from {analytics?.unique_mentees || 0} mentees
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  Recent Sessions
                </CardTitle>
                <CardDescription>Your most recent mentorship sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSessions ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="bg-muted/30 animate-pulse h-16 rounded-md"></div>
                    ))}
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No sessions found in the selected time range</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="border p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-sm">{session.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(session.start_time), "PP")} with {session.mentee?.full_name || session.mentee?.username}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            session.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                            session.status === 'scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                            session.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {filteredSessions.length > 5 && (
                      <Button variant="outline" className="w-full" onClick={() => navigate("/mentor-space/sessions")}>
                        View All Sessions
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Star className="mr-2 h-4 w-4 text-muted-foreground" />
                  Recent Reviews
                </CardTitle>
                <CardDescription>What your mentees are saying about you</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReviews ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="bg-muted/30 animate-pulse h-16 rounded-md"></div>
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${
                                    i < review.rating 
                                      ? 'text-yellow-500 fill-yellow-500' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs ml-2">
                              {review.reviewer?.full_name || review.reviewer?.username}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), "PP")}
                          </span>
                        </div>
                        <p className="text-sm mt-2 line-clamp-2">{review.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
