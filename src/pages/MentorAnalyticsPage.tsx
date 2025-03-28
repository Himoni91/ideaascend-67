
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Users, 
  ThumbsUp, 
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useMentor } from "@/hooks/use-mentor";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";

// Import from recharts
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';

export default function MentorAnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("month");
  
  const { useMentorAnalytics, useMentorSessions } = useMentor();
  const { profile } = useProfile(user?.id);
  const { data: analytics, isLoading: isLoadingAnalytics } = useMentorAnalytics();
  const { data: sessions } = useMentorSessions();
  
  // Check if user is a mentor
  if (!isLoadingAnalytics && profile && !profile.is_mentor) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">Analytics Available for Mentors Only</h1>
              <p className="text-muted-foreground mb-6">
                This page is only available for mentors. Become a mentor to access analytics for your sessions.
              </p>
              <Button onClick={() => navigate("/mentor-space/apply")}>
                Become a Mentor
              </Button>
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }
  
  // Sample data for charts
  const sessionData = [
    { name: 'Jan', sessions: 2 },
    { name: 'Feb', sessions: 5 },
    { name: 'Mar', sessions: 3 },
    { name: 'Apr', sessions: 7 },
    { name: 'May', sessions: 4 },
    { name: 'Jun', sessions: 8 },
    { name: 'Jul', sessions: 6 },
  ];
  
  const earningsData = [
    { name: 'Jan', amount: 50 },
    { name: 'Feb', amount: 125 },
    { name: 'Mar', amount: 75 },
    { name: 'Apr', amount: 175 },
    { name: 'May', amount: 100 },
    { name: 'Jun', amount: 200 },
    { name: 'Jul', amount: 150 },
  ];
  
  const sessionTypeData = [
    { name: 'Quick Chat', value: 8 },
    { name: 'Standard', value: 12 },
    { name: 'Deep Dive', value: 5 },
    { name: 'Custom', value: 2 },
  ];
  
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

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
                    <BarChart3 className="mr-3 h-7 w-7 text-primary" />
                    Mentor Analytics
                  </h1>
                  <p className="text-muted-foreground">
                    Track your mentorship performance and earnings
                  </p>
                </div>
                
                <div>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last 7 days</SelectItem>
                      <SelectItem value="month">Last 30 days</SelectItem>
                      <SelectItem value="quarter">Last 3 months</SelectItem>
                      <SelectItem value="year">Last 12 months</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Sessions</p>
                        <h3 className="text-2xl font-bold">{analytics?.total_sessions || 0}</h3>
                      </div>
                      <div className="rounded-full p-2 bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <div className="flex items-center text-green-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>15%</span>
                      </div>
                      <span className="text-muted-foreground ml-2">vs previous period</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Earnings</p>
                        <h3 className="text-2xl font-bold">${analytics?.total_earnings || 0}</h3>
                      </div>
                      <div className="rounded-full p-2 bg-green-100 dark:bg-green-900/20">
                        <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <div className="flex items-center text-green-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>20%</span>
                      </div>
                      <span className="text-muted-foreground ml-2">vs previous period</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Average Rating</p>
                        <h3 className="text-2xl font-bold flex items-center">
                          {analytics?.average_rating.toFixed(1) || "0.0"}
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 ml-1 inline" />
                        </h3>
                      </div>
                      <div className="rounded-full p-2 bg-yellow-100 dark:bg-yellow-900/20">
                        <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400 fill-yellow-500" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <span className="text-muted-foreground">From {analytics?.reviews_count || 0} reviews</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Active Mentees</p>
                        <h3 className="text-2xl font-bold">{analytics?.repeat_mentees || 0}</h3>
                      </div>
                      <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/20">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <div className="flex items-center text-green-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span>5%</span>
                      </div>
                      <span className="text-muted-foreground ml-2">vs previous period</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Tabs defaultValue="overview" className="space-y-8">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="sessions">Sessions</TabsTrigger>
                  <TabsTrigger value="earnings">Earnings</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sessions Over Time</CardTitle>
                        <CardDescription>
                          Number of mentorship sessions conducted
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={sessionData}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Area 
                                type="monotone" 
                                dataKey="sessions" 
                                stroke="#8884d8" 
                                fill="#8884d8" 
                                fillOpacity={0.3} 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Session Types</CardTitle>
                        <CardDescription>
                          Distribution of session types
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={sessionTypeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label
                              >
                                {sessionTypeData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Earnings Trend</CardTitle>
                      <CardDescription>
                        Monthly earnings from mentorship sessions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={earningsData}
                            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                            <Bar dataKey="amount" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="sessions" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Session Details</CardTitle>
                      <CardDescription>
                        Detailed breakdown of your mentorship sessions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="py-3 px-4 text-left font-medium">Date</th>
                              <th className="py-3 px-4 text-left font-medium">Mentee</th>
                              <th className="py-3 px-4 text-left font-medium">Type</th>
                              <th className="py-3 px-4 text-left font-medium">Duration</th>
                              <th className="py-3 px-4 text-left font-medium">Status</th>
                              <th className="py-3 px-4 text-left font-medium">Earnings</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sessions?.slice(0, 10).map((session) => (
                              <tr key={session.id} className="border-b hover:bg-muted/50">
                                <td className="py-3 px-4">{new Date(session.start_time).toLocaleDateString()}</td>
                                <td className="py-3 px-4">{session.mentee?.full_name || session.mentee?.username}</td>
                                <td className="py-3 px-4">{session.session_type}</td>
                                <td className="py-3 px-4">
                                  {Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60))} mins
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    session.status === "completed" 
                                      ? "bg-green-100 text-green-700" 
                                      : session.status === "scheduled"
                                        ? "bg-blue-100 text-blue-700"
                                        : session.status === "in-progress"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-red-100 text-red-700"
                                  }`}>
                                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                  </span>
                                </td>
                                <td className="py-3 px-4">${session.payment_amount || 0}</td>
                              </tr>
                            ))}
                            {(!sessions || sessions.length === 0) && (
                              <tr>
                                <td colSpan={6} className="py-6 text-center text-muted-foreground">
                                  No sessions found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-4">
                      <Button variant="outline" size="sm" disabled>Previous</Button>
                      <div className="text-sm text-muted-foreground">Page 1 of 1</div>
                      <Button variant="outline" size="sm" disabled>Next</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="earnings" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Total Earnings</p>
                          <h3 className="text-2xl font-bold">${analytics?.total_earnings || 0}</h3>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Average Per Session</p>
                          <h3 className="text-2xl font-bold">
                            ${analytics && analytics.total_sessions > 0 
                              ? Math.round(analytics.total_earnings / analytics.total_sessions)
                              : 0}
                          </h3>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Upcoming Earnings</p>
                          <h3 className="text-2xl font-bold">
                            ${(sessions?.filter(s => s.status === "scheduled").reduce((acc, s) => acc + (s.payment_amount || 0), 0)) || 0}
                          </h3>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Earnings Breakdown</CardTitle>
                      <CardDescription>
                        Monthly earnings from mentorship sessions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={earningsData}
                            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                            <Bar dataKey="amount" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="reviews" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rating Distribution</CardTitle>
                      <CardDescription>
                        Breakdown of reviews by rating
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-5 gap-4 mb-6">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <Card key={rating}>
                            <CardContent className="p-4 flex flex-col items-center justify-center">
                              <div className="text-2xl font-bold mb-1">{rating}</div>
                              <div className="flex items-center mb-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < rating
                                        ? "text-yellow-500 fill-yellow-500"
                                        : "text-muted stroke-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {Math.floor(Math.random() * 20)} reviews
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Recent Reviews</h3>
                        <div className="space-y-4">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="border rounded-lg p-4">
                              <div className="flex justify-between mb-2">
                                <div className="flex items-center">
                                  <div className="flex">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                      <Star
                                        key={j}
                                        className={`h-4 w-4 ${
                                          j < 5 - i
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-muted stroke-muted-foreground"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="ml-2 text-sm text-muted-foreground">
                                    {new Date(Date.now() - i * 86400000 * 5).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="text-sm font-medium">
                                  Mentee {i + 1}
                                </div>
                              </div>
                              <p className="text-sm">
                                {[
                                  "Great mentor, very knowledgeable and helpful. Provided actionable advice that I could implement right away.",
                                  "Excellent session. The mentor was patient and explained complex concepts in simple terms. Would definitely book again.",
                                  "Very insightful session. The mentor helped me see things from a different perspective. Highly recommended."
                                ][i]}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
