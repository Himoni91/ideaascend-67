
import React from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Calendar, 
  Users, 
  Star,
  TrendingUp, 
  Clock, 
  DollarSign,
  Filter,
  Loader2
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useMentorSpace } from "@/hooks/use-mentor-space";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition } from "@/components/ui/page-transition";
import AppLayout from "@/components/layout/AppLayout";
import { Helmet } from "react-helmet-async";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Tooltip,
  CartesianGrid,
  Pie,
  PieChart as RePieChart,
  Cell,
  Legend
} from "recharts";

// Random data for demonstration
const generateSessionData = () => {
  const today = new Date();
  const days = eachDayOfInterval({
    start: subDays(today, 30),
    end: today
  });
  
  return days.map(day => ({
    date: format(day, 'MMM dd'),
    sessions: Math.floor(Math.random() * 3),
    earnings: Math.floor(Math.random() * 200)
  }));
};

const generateRatingData = () => [
  { name: '5 Stars', value: 15 },
  { name: '4 Stars', value: 8 },
  { name: '3 Stars', value: 3 },
  { name: '2 Stars', value: 1 },
  { name: '1 Star', value: 0 }
];

const generateExpertiseData = () => [
  { name: 'Startup Strategy', sessions: 12 },
  { name: 'Fundraising', sessions: 8 },
  { name: 'Product Development', sessions: 6 },
  { name: 'UX Design', sessions: 5 },
  { name: 'Technical Architecture', sessions: 4 },
  { name: 'Other', sessions: 7 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const MentorAnalyticsPage = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = React.useState('30d');
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Generate demo data
  const sessionData = React.useMemo(() => generateSessionData(), []);
  const ratingData = React.useMemo(() => generateRatingData(), []);
  const expertiseData = React.useMemo(() => generateExpertiseData(), []);
  
  // Mock mentor analytics
  const analytics = {
    total_sessions: 42,
    completed_sessions: 38,
    average_rating: 4.7,
    total_earnings: 1580,
    session_duration_total: 2520,
    upcoming_sessions: 4,
    repeat_mentees: 12,
    reviews_count: 27,
    unique_mentees: 22
  };
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // If user is not a mentor
  if (user && !user.is_mentor) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Mentor Analytics</h1>
          <p className="text-muted-foreground mb-6">
            You need to be a mentor to access analytics.
          </p>
          <Button asChild>
            <a href="/mentor-space/apply">Apply to Become a Mentor</a>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>Mentor Analytics | Idolyst</title>
      </Helmet>
      
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
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
              Track your mentorship performance and growth metrics
            </p>
          </motion.div>
          
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="ytd">Year to date</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline">
              <LineChart className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                    <h3 className="text-2xl font-bold mt-1">{analytics.total_sessions}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-green-600">+12%</span> from last period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                    <h3 className="text-2xl font-bold mt-1">{analytics.average_rating}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on {analytics.reviews_count} reviews
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                    <h3 className="text-2xl font-bold mt-1">${analytics.total_earnings}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-green-600">+8%</span> from last period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unique Mentees</p>
                    <h3 className="text-2xl font-bold mt-1">{analytics.unique_mentees}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {analytics.repeat_mentees} repeat mentees
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs for different analytics views */}
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sessions Over Time */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sessions Over Time</CardTitle>
                    <CardDescription>
                      Number of mentorship sessions completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={sessionData}
                          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="sessions" 
                            stroke="#8884d8" 
                            strokeWidth={2} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Sessions by Expertise */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sessions by Expertise</CardTitle>
                    <CardDescription>
                      Distribution across different expertise areas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={expertiseData}
                          margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            tickMargin={10}
                            width={120}
                          />
                          <Tooltip />
                          <Bar dataKey="sessions" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Earnings Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Overview</CardTitle>
                    <CardDescription>
                      Revenue from mentorship sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={sessionData}
                          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                          <Line 
                            type="monotone" 
                            dataKey="earnings" 
                            stroke="#82ca9d" 
                            strokeWidth={2} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Ratings Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ratings Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of mentor ratings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-0">
                    <div className="h-[300px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={ratingData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {ratingData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value} reviews`, name]} 
                          />
                          <Legend />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Time Mentoring</p>
                        <h3 className="text-2xl font-bold mt-1">{formatTime(analytics.session_duration_total)}</h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Total time spent mentoring
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                        <h3 className="text-2xl font-bold mt-1">{Math.round(analytics.completed_sessions / analytics.total_sessions * 100)}%</h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {analytics.completed_sessions} of {analytics.total_sessions} sessions completed
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Upcoming Sessions</p>
                        <h3 className="text-2xl font-bold mt-1">{analytics.upcoming_sessions}</h3>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Scheduled in the next 7 days
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Sessions Tab */}
            <TabsContent value="sessions">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Sessions Analysis</CardTitle>
                  <CardDescription>
                    Detailed breakdown of your mentorship sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    This view will include in-depth analysis of your sessions including:
                  </p>
                  <ul className="space-y-2 list-disc pl-5 mb-4">
                    <li>Session frequency by day of week and time of day</li>
                    <li>Length trends</li>
                    <li>Cancellation rates</li>
                    <li>Frequently discussed topics</li>
                    <li>Specialized session metrics</li>
                  </ul>
                  <div className="py-12 text-center text-muted-foreground">
                    <p className="mb-2">Detailed session analytics coming soon</p>
                    <p className="text-sm">
                      We're collecting more data to provide meaningful insights
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Feedback Tab */}
            <TabsContent value="feedback">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Feedback Analysis</CardTitle>
                  <CardDescription>
                    Insights from your mentee reviews and ratings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    This view will include analysis of feedback received from mentees:
                  </p>
                  <ul className="space-y-2 list-disc pl-5 mb-4">
                    <li>Rating trends over time</li>
                    <li>Sentiment analysis of written reviews</li>
                    <li>Areas of strength and improvement</li>
                    <li>Comparison to platform averages</li>
                    <li>Impact of feedback on future bookings</li>
                  </ul>
                  <div className="py-12 text-center text-muted-foreground">
                    <p className="mb-2">Detailed feedback analytics coming soon</p>
                    <p className="text-sm">
                      We're collecting more data to provide meaningful insights
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default MentorAnalyticsPage;
