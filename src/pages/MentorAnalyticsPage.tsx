
import { motion } from "framer-motion";
import { 
  BarChart, 
  Calendar, 
  DollarSign, 
  Star, 
  Users, 
  Award, 
  TrendingUp, 
  Clock,
  Repeat
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMentor } from "@/hooks/use-mentor";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";

export default function MentorAnalyticsPage() {
  const { user } = useAuth();
  const { useMentorSessions, useMentorAnalytics, useMentorReviews } = useMentor();
  
  // Fetch mentor data
  const { data: analytics, isLoading: analyticsLoading } = useMentorAnalytics();
  const { data: sessions, isLoading: sessionsLoading } = useMentorSessions('mentor');
  const { data: reviews, isLoading: reviewsLoading } = useMentorReviews(user?.id || "");
  
  // Loading state
  if (!user || analyticsLoading || sessionsLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-8 w-1/3 bg-muted rounded"></div>
            <div className="h-4 w-1/2 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Group sessions by status
  const completedSessions = sessions?.filter(s => s.status === 'completed') || [];
  const upcomingSessions = sessions?.filter(s => s.status === 'scheduled') || [];
  
  // Group mentees by frequency
  const menteeFrequency: Record<string, number> = {};
  sessions?.forEach(session => {
    if (session.mentee_id) {
      menteeFrequency[session.mentee_id] = (menteeFrequency[session.mentee_id] || 0) + 1;
    }
  });
  
  const repeatMentees = Object.values(menteeFrequency).filter(count => count > 1).length;
  
  // Calculate session duration distribution (30min, 60min, etc.)
  const durationDistribution: Record<number, number> = {};
  completedSessions.forEach(session => {
    const start = new Date(session.start_time);
    const end = new Date(session.end_time);
    const durationInMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    // Round to nearest common duration (30, 45, 60, 90, 120)
    let bucket: number;
    if (durationInMinutes <= 30) bucket = 30;
    else if (durationInMinutes <= 45) bucket = 45;
    else if (durationInMinutes <= 60) bucket = 60;
    else if (durationInMinutes <= 90) bucket = 90;
    else bucket = 120;
    
    durationDistribution[bucket] = (durationDistribution[bucket] || 0) + 1;
  });
  
  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold mb-1">Mentor Dashboard</h1>
              <p className="text-muted-foreground">
                Track your mentoring impact and performance
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="/mentor-space/sessions">
                  <Calendar className="mr-2 h-4 w-4" />
                  My Sessions
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href={`/mentor-space/${user.id}`}>
                  <Users className="mr-2 h-4 w-4" />
                  View Profile
                </a>
              </Button>
            </div>
          </motion.div>
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium">Total Sessions</p>
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-bold">
                  {analytics?.total_sessions || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {analytics?.completed_sessions || 0} completed, {upcomingSessions.length} upcoming
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium">Total Earnings</p>
                  <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-700" />
                  </div>
                </div>
                <p className="text-3xl font-bold">
                  ${analytics?.total_earnings?.toFixed(2) || "0.00"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  From {analytics?.completed_sessions || 0} paid sessions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium">Average Rating</p>
                  <div className="h-9 w-9 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold">
                  {analytics?.average_rating ? analytics.average_rating.toFixed(1) : "N/A"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  From {analytics?.reviews_count || 0} reviews
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium">Unique Mentees</p>
                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-700" />
                  </div>
                </div>
                <p className="text-3xl font-bold">
                  {analytics?.unique_mentees || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {repeatMentees} returned for multiple sessions
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Session Insights */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Session Insights</CardTitle>
                <CardDescription>
                  Performance metrics and session distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="duration">
                  <TabsList className="mb-4">
                    <TabsTrigger value="duration">
                      <Clock className="h-4 w-4 mr-2" />
                      Session Duration
                    </TabsTrigger>
                    <TabsTrigger value="mentees">
                      <Users className="h-4 w-4 mr-2" />
                      Mentee Engagement
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="duration">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Distribution of session durations from completed sessions
                      </p>
                      
                      {Object.keys(durationDistribution).length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(durationDistribution)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([duration, count]) => (
                              <div key={duration} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{duration} min sessions</span>
                                  <span className="font-medium">{count}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                                  <div 
                                    className="bg-primary h-full rounded-full" 
                                    style={{ 
                                      width: `${(count / completedSessions.length) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          No completed sessions data available yet
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="mentees">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Repeat vs. one-time mentees distribution
                      </p>
                      
                      {analytics?.unique_mentees ? (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>One-time mentees</span>
                              <span className="font-medium">
                                {(analytics.unique_mentees - repeatMentees)} 
                                ({Math.round((analytics.unique_mentees - repeatMentees) / analytics.unique_mentees * 100)}%)
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                              <div 
                                className="bg-blue-500 h-full rounded-full" 
                                style={{ 
                                  width: `${((analytics.unique_mentees - repeatMentees) / analytics.unique_mentees) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Repeat mentees</span>
                              <span className="font-medium">
                                {repeatMentees} 
                                ({Math.round(repeatMentees / analytics.unique_mentees * 100)}%)
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                              <div 
                                className="bg-green-500 h-full rounded-full" 
                                style={{ 
                                  width: `${(repeatMentees / analytics.unique_mentees) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t mt-6">
                            <p className="text-sm font-medium mb-3">Repeat Mentee Analysis</p>
                            <div className="flex items-center justify-between text-sm">
                              <span>Average sessions per mentee:</span>
                              <span className="font-medium">
                                {(sessions?.length || 0) / (analytics.unique_mentees || 1) > 0 
                                  ? ((sessions?.length || 0) / (analytics.unique_mentees || 1)).toFixed(1) 
                                  : "0"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span>Most sessions by one mentee:</span>
                              <span className="font-medium">
                                {Math.max(...Object.values(menteeFrequency), 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          No mentee engagement data available yet
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Recent Reviews */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Recent Reviews
                </CardTitle>
                <CardDescription>
                  Feedback from your mentees
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-24 bg-muted rounded"></div>
                    <div className="h-24 bg-muted rounded"></div>
                  </div>
                ) : reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Avatar className="h-7 w-7 mr-2">
                              <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                              <AvatarFallback>
                                {review.reviewer?.full_name?.charAt(0) || 
                                 review.reviewer?.username?.charAt(0) || 
                                 "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {review.reviewer?.full_name || review.reviewer?.username || "Anonymous"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {review.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    
                    {reviews.length > 3 && (
                      <Button variant="outline" className="w-full mt-2">
                        View All Reviews
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="h-8 w-8 mx-auto text-muted-foreground opacity-20 mb-3" />
                    <h3 className="text-sm font-medium mb-1">No reviews yet</h3>
                    <p className="text-xs text-muted-foreground">
                      You haven't received any reviews from mentees yet
                    </p>
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
