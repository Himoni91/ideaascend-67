
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
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  UserCheck,
  Star,
  Users,
  TrendingUp,
} from "lucide-react";

export default function MentorAnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useMentorAnalytics, useMentorSessions, useMentorReviews } = useMentor();
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "year">("month");

  // Fetch mentor analytics data
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useMentorAnalytics();
  
  // Fetch sessions data
  const { data: sessionsData, isLoading: isSessionsLoading } = useMentorSessions();
  
  // Fetch reviews data
  const { data: reviewsData, isLoading: isReviewsLoading } = useMentorReviews(user?.id);
  
  if (!user) {
    navigate("/auth/sign-in");
    return null;
  }
  
  const isLoading = isAnalyticsLoading || isSessionsLoading || isReviewsLoading;
  
  // Prepare data for charts
  const sessionsPerMonthData = [
    { name: "Jan", sessions: 2 },
    { name: "Feb", sessions: 4 },
    { name: "Mar", sessions: 3 },
    { name: "Apr", sessions: 5 },
    { name: "May", sessions: 7 },
    { name: "Jun", sessions: 9 },
    { name: "Jul", sessions: 8 },
  ];
  
  const earningsPerMonthData = [
    { name: "Jan", earnings: 50 },
    { name: "Feb", earnings: 100 },
    { name: "Mar", earnings: 75 },
    { name: "Apr", earnings: 125 },
    { name: "May", earnings: 175 },
    { name: "Jun", earnings: 225 },
    { name: "Jul", earnings: 200 },
  ];
  
  const sessionStatusData = [
    { name: "Completed", value: analyticsData?.completed_sessions || 0 },
    { name: "Upcoming", value: analyticsData?.upcoming_sessions || 0 },
  ];
  
  const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444"];

  return (
    <AppLayout>
      <PageTransition>
        <div className="container max-w-6xl mx-auto px-4 py-8">
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
              <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Track your mentorship performance and earnings
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-20" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-32 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Total Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData?.total_sessions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analyticsData?.completed_sessions || 0} completed, {analyticsData?.upcoming_sessions || 0} upcoming
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Total Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${analyticsData?.total_earnings || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From {analyticsData?.completed_sessions || 0} completed sessions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Star className="mr-2 h-4 w-4" />
                    Average Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(analyticsData?.average_rating || 0).toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From {analyticsData?.reviews_count || 0} reviews
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Unique Mentees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData?.unique_mentees || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analyticsData?.repeat_mentees || 0} repeat mentees
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="sessions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <div className="flex justify-end mb-4">
              <div className="bg-muted rounded-md p-1 inline-flex">
                <Button
                  variant={timePeriod === "week" ? "default" : "ghost"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setTimePeriod("week")}
                >
                  Week
                </Button>
                <Button
                  variant={timePeriod === "month" ? "default" : "ghost"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setTimePeriod("month")}
                >
                  Month
                </Button>
                <Button
                  variant={timePeriod === "year" ? "default" : "ghost"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setTimePeriod("year")}
                >
                  Year
                </Button>
              </div>
            </div>

            <TabsContent value="sessions" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Sessions Overview</CardTitle>
                    <CardDescription>
                      Number of sessions over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {isLoading ? (
                      <div className="animate-pulse w-full h-full bg-muted rounded-md" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={sessionsPerMonthData}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="sessions"
                            stroke="#6366f1"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Session Status</CardTitle>
                    <CardDescription>
                      Breakdown by status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {isLoading ? (
                      <div className="animate-pulse w-full h-full bg-muted rounded-md" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sessionStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {sessionStatusData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}`, 'Sessions']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Overview</CardTitle>
                  <CardDescription>
                    Total earnings over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="animate-pulse w-full h-full bg-muted rounded-md" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={earningsPerMonthData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                        <Legend />
                        <Bar dataKey="earnings" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Review Ratings</CardTitle>
                  <CardDescription>
                    Distribution of review ratings
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="animate-pulse w-full h-full bg-muted rounded-md" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { rating: "5 ★", count: reviewsData?.filter((r: any) => r.rating === 5).length || 0 },
                          { rating: "4 ★", count: reviewsData?.filter((r: any) => r.rating === 4).length || 0 },
                          { rating: "3 ★", count: reviewsData?.filter((r: any) => r.rating === 3).length || 0 },
                          { rating: "2 ★", count: reviewsData?.filter((r: any) => r.rating === 2).length || 0 },
                          { rating: "1 ★", count: reviewsData?.filter((r: any) => r.rating === 1).length || 0 },
                        ]}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rating" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
