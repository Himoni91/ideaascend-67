
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Calendar, 
  DollarSign, 
  Star, 
  Clock, 
  ChevronRight,
  TrendingUp,
  CalendarClock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMentor } from "@/hooks/use-mentor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, PieChart, Pie, Cell
} from "recharts";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";

// Mock data for charts
const sessionsByDay = [
  { name: "Mon", value: 2 },
  { name: "Tue", value: 3 },
  { name: "Wed", value: 1 },
  { name: "Thu", value: 4 },
  { name: "Fri", value: 3 },
  { name: "Sat", value: 1 },
  { name: "Sun", value: 0 },
];

const earningsByMonth = [
  { name: "Jan", value: 150 },
  { name: "Feb", value: 280 },
  { name: "Mar", value: 320 },
  { name: "Apr", value: 450 },
  { name: "May", value: 380 },
  { name: "Jun", value: 520 },
];

const sessionTypes = [
  { name: "Quick Chat", value: 12 },
  { name: "Standard", value: 22 },
  { name: "Deep Dive", value: 8 },
  { name: "Custom", value: 3 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function MentorAnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState("month");
  
  const { useMentorAnalytics } = useMentor();
  const { data: analytics, isLoading } = useMentorAnalytics();
  
  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
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
                    Track your mentorship performance and income
                  </p>
                </div>
                
                <Button variant="outline" onClick={() => navigate("/mentor-space/sessions")}>
                  <CalendarClock className="mr-2 h-4 w-4" />
                  View Sessions
                </Button>
              </div>
              
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-muted-foreground text-sm">Total Sessions</p>
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-bold">{analytics?.total_sessions || 0}</h3>
                      <div className="flex items-center text-xs text-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>+12%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-muted-foreground text-sm">Total Earnings</p>
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-bold">${analytics?.total_earnings || 0}</h3>
                      <div className="flex items-center text-xs text-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>+8%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-muted-foreground text-sm">Avg. Rating</p>
                      <Star className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-bold">{analytics?.average_rating || 0}</h3>
                      <div className="flex items-center text-xs text-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>+0.2</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-muted-foreground text-sm">Repeat Mentees</p>
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-bold">{analytics?.repeat_mentees || 0}</h3>
                      <div className="flex items-center text-xs text-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>+3</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Analytics */}
              <Tabs defaultValue={timeframe} onValueChange={setTimeframe} className="space-y-8">
                <div className="flex justify-between items-center">
                  <TabsList>
                    <TabsTrigger value="week">This Week</TabsTrigger>
                    <TabsTrigger value="month">This Month</TabsTrigger>
                    <TabsTrigger value="year">This Year</TabsTrigger>
                  </TabsList>
                </div>
                
                {/* Chart Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sessions by Day */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Sessions by Day</CardTitle>
                      <CardDescription>Number of sessions conducted each day</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={sessionsByDay}
                          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`${value} sessions`, 'Sessions']}
                            contentStyle={{ 
                              backgroundColor: 'var(--background)', 
                              borderColor: 'var(--border)'
                            }}
                          />
                          <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  {/* Earnings by Month */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Earnings Trend</CardTitle>
                      <CardDescription>Monthly earnings from mentorship sessions</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={earningsByMonth}
                          margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`$${value}`, 'Earnings']}
                            contentStyle={{ 
                              backgroundColor: 'var(--background)', 
                              borderColor: 'var(--border)'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="var(--primary)" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Session Type Breakdown */}
                  <Card className="lg:col-span-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Session Types</CardTitle>
                      <CardDescription>Breakdown of session types</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sessionTypes}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {sessionTypes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value} sessions`, name]}
                            contentStyle={{ 
                              backgroundColor: 'var(--background)', 
                              borderColor: 'var(--border)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  {/* Upcoming Sessions */}
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                      <CardDescription>Your next scheduled mentorship sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* List of upcoming sessions */}
                      <div className="space-y-4">
                        <div className="flex items-start justify-between border-b pb-3">
                          <div>
                            <p className="font-medium">Product Development Strategy</p>
                            <p className="text-sm text-muted-foreground">with Alex Johnson</p>
                            <div className="flex items-center mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              <span className="text-xs">Tomorrow, 10:00 AM</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Start
                          </Button>
                        </div>
                        
                        <div className="flex items-start justify-between border-b pb-3">
                          <div>
                            <p className="font-medium">Startup Funding Options</p>
                            <p className="text-sm text-muted-foreground">with Maria Chen</p>
                            <div className="flex items-center mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              <span className="text-xs">Friday, 2:00 PM</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <Button variant="link" size="sm" onClick={() => navigate("/mentor-space/sessions")} className="gap-1">
                          View all sessions <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
