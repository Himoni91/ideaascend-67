
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { Helmet } from "react-helmet-async";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { 
  Download, 
  BarChart2, 
  ArrowUpRight, 
  Users, 
  Calendar, 
  DollarSign,
  Star
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMentorSpace } from "@/hooks/use-mentor-space";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart as RechartsBarChart,
  Bar
} from "recharts";
import { format, parseISO, subDays } from "date-fns";

// Sample data for demonstration
const getLastNDays = (n: number) => {
  return Array.from({ length: n }).map((_, i) => {
    const date = subDays(new Date(), n - i - 1);
    return {
      date: format(date, "yyyy-MM-dd"),
      sessions: Math.floor(Math.random() * 5),
      earnings: Math.floor(Math.random() * 500),
    };
  });
};

const sampleSessionData = getLastNDays(30);

const sampleRatingData = [
  { rating: 5, count: 12 },
  { rating: 4, count: 8 },
  { rating: 3, count: 3 },
  { rating: 2, count: 1 },
  { rating: 1, count: 0 },
];

const MentorAnalyticsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  
  if (!user?.is_mentor) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Mentor Access Required</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You need to be a mentor to access the analytics dashboard. Apply to become a mentor today!
            </p>
            <Button onClick={() => navigate("/mentor-space/apply")}>
              Apply to Become a Mentor
            </Button>
          </div>
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
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Mentor Analytics</h1>
              <p className="text-muted-foreground">
                Track your mentorship performance and earnings
              </p>
            </div>
            
            <div className="flex gap-2 self-end sm:self-auto">
              <Tabs
                value={timeRange}
                onValueChange={(v) => setTimeRange(v as any)}
                className="w-fit"
              >
                <TabsList>
                  <TabsTrigger value="7d">Week</TabsTrigger>
                  <TabsTrigger value="30d">Month</TabsTrigger>
                  <TabsTrigger value="90d">Quarter</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Sessions"
              value={42}
              change={15}
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            />
            
            <StatsCard
              title="Completion Rate"
              value="92%"
              change={3}
              icon={<BarChart2 className="h-4 w-4 text-muted-foreground" />}
            />
            
            <StatsCard
              title="Total Earnings"
              value="$2,450"
              change={22}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            
            <StatsCard
              title="Average Rating"
              value="4.7"
              change={5}
              icon={<Star className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-8">
              {/* Sessions & Earnings Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Sessions & Earnings Overview</CardTitle>
                  <CardDescription>
                    Track your sessions and earnings over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={sampleSessionData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(parseISO(value), "MMM dd")}
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === "earnings") return [`$${value}`, "Earnings"];
                          return [value, "Sessions"];
                        }}
                        labelFormatter={(label) => format(parseISO(label), "MMMM d, yyyy")}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="sessions"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="Sessions"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="earnings"
                        stroke="#82ca9d"
                        name="Earnings"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Engagement Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Rating Distribution</CardTitle>
                    <CardDescription>
                      How your mentees rate your sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={sampleRatingData}
                        margin={{
                          top: 20,
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
                        <Bar dataKey="count" name="Number of Ratings" fill="#8884d8" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Session Type Performance</CardTitle>
                    <CardDescription>
                      Performance metrics by session type
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={[
                          { type: "Career Advice", count: 18, earnings: 900 },
                          { type: "Code Review", count: 12, earnings: 720 },
                          { type: "Portfolio Review", count: 8, earnings: 560 },
                          { type: "Interview Prep", count: 4, earnings: 280 },
                        ]}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="count" name="Sessions" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="earnings" name="Earnings ($)" fill="#82ca9d" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="sessions">
              {/* Sessions specific content */}
              <Card>
                <CardHeader>
                  <CardTitle>Session Analytics</CardTitle>
                  <CardDescription>Detailed session metrics over time</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={sampleSessionData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(parseISO(value), "MMM dd")}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(label) => format(parseISO(label), "MMMM d, yyyy")}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sessions"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="Sessions"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="earnings">
              {/* Earnings specific content */}
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Analytics</CardTitle>
                  <CardDescription>Revenue and earnings metrics</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={sampleSessionData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(parseISO(value), "MMM dd")}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, "Earnings"]}
                        labelFormatter={(label) => format(parseISO(label), "MMMM d, yyyy")}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="earnings"
                        stroke="#82ca9d"
                        activeDot={{ r: 8 }}
                        name="Earnings"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="feedback">
              {/* Feedback specific analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Feedback Analysis</CardTitle>
                  <CardDescription>Ratings and review metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={sampleRatingData}
                          margin={{
                            top: 20,
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
                          <Bar dataKey="count" name="Number of Ratings" fill="#8884d8" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Recent Feedback</h3>
                      
                      <div className="space-y-4">
                        <FeedbackCard 
                          rating={5}
                          comment="Extremely helpful session. The mentor provided clear guidance and actionable advice for my career transition."
                          date="2023-05-15"
                          sessionType="Career Advice"
                        />
                        
                        <FeedbackCard 
                          rating={4}
                          comment="Good code review session. Found several bugs in my implementation and suggested better approaches."
                          date="2023-05-10"
                          sessionType="Code Review"
                        />
                        
                        <FeedbackCard 
                          rating={5}
                          comment="Amazing portfolio review! Got detailed feedback on my design work and suggestions for improvement."
                          date="2023-05-05"
                          sessionType="Portfolio Review"
                        />
                      </div>
                    </div>
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

// Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  change, 
  icon 
}: { 
  title: string; 
  value?: number | string; 
  change?: number; 
  icon: React.ReactNode 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon}
        </div>
        
        <div className="mt-2">
          {value !== undefined ? (
            <h3 className="text-2xl font-bold">{value}</h3>
          ) : (
            <Skeleton className="h-8 w-20" />
          )}
          
          {change !== undefined ? (
            <div className={`flex items-center mt-1 text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <ArrowUpRight className={`h-4 w-4 mr-1 ${change < 0 ? 'rotate-180 transform' : ''}`} />
              <span>{Math.abs(change)}% {change >= 0 ? 'increase' : 'decrease'}</span>
            </div>
          ) : (
            <Skeleton className="h-4 w-24 mt-1" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Feedback Card Component
const FeedbackCard = ({
  rating,
  comment,
  date,
  sessionType
}: {
  rating: number;
  comment: string;
  date: string;
  sessionType: string;
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {format(parseISO(date), "MMM d, yyyy")}
              </span>
            </div>
            <div className="text-sm mb-1 font-medium">{sessionType} Session</div>
            <p className="text-muted-foreground text-sm">{comment}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentorAnalyticsPage;
