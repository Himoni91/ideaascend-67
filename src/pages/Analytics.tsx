
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronDown, TrendingUp, Users, Lightbulb, Activity, BarChart4, PieChart, LineChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import AppLayout from "@/components/layout/AppLayout";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  
  // Mock data for charts and analytics
  const activityData = [
    { name: "Week 1", sessions: 4, posts: 8, ideas: 1 },
    { name: "Week 2", sessions: 3, posts: 5, ideas: 0 },
    { name: "Week 3", sessions: 5, posts: 12, ideas: 2 },
    { name: "Week 4", sessions: 7, posts: 10, ideas: 1 },
  ];
  
  const engagementData = [
    { name: "Posts", value: 35 },
    { name: "Comments", value: 48 },
    { name: "Likes", value: 127 },
    { name: "Shares", value: 14 },
  ];
  
  const growthData = [
    { name: "Jan", followers: 10 },
    { name: "Feb", followers: 25 },
    { name: "Mar", followers: 30 },
    { name: "Apr", followers: 40 },
    { name: "May", followers: 45 },
    { name: "Jun", followers: 55 },
    { name: "Jul", followers: 70 },
    { name: "Aug", followers: 85 },
    { name: "Sep", followers: 100 },
  ];
  
  const ideaPerformanceData = [
    { name: "Idea 1", votes: 124, comments: 32 },
    { name: "Idea 2", votes: 95, comments: 27 },
    { name: "Idea 3", votes: 87, comments: 19 },
  ];
  
  const mentorSessionsData = [
    { subject: "Product Strategy", value: 5 },
    { subject: "Fundraising", value: 2 },
    { subject: "Marketing", value: 3 },
    { subject: "Tech", value: 4 },
    { subject: "Operations", value: 1 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };
  
  return (
    <AppLayout>
      <motion.div 
        className="max-w-7xl mx-auto px-4"
        initial="initial"
        animate="animate"
        variants={pageVariants}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <motion.h1 
            className="text-3xl font-bold mb-2 md:mb-0"
            variants={itemVariants}
          >
            Analytics
          </motion.h1>
          <motion.div 
            className="flex items-center space-x-2"
            variants={itemVariants}
          >
            <Select defaultValue={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Export
            </Button>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                <CardDescription>30-day growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">107</div>
                  <div className="text-sm text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                    +12%
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <CardDescription>Interactions per post</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">5.2</div>
                  <div className="text-sm text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-1" />
                    +3.8%
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Idea Performance</CardTitle>
                <CardDescription>Average votes per idea</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">85</div>
                  <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full flex items-center">
                    <TrendingUp className="h-3.5 w-3.5 mr-1 rotate-180" />
                    -5.1%
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Activity className="mr-2 h-5 w-5 text-idolyst-blue" />
                  Activity Overview
                </CardTitle>
                <CardDescription>Your activity over the past month</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="posts" fill="#8884d8" name="Posts" />
                    <Bar dataKey="sessions" fill="#82ca9d" name="Mentor Sessions" />
                    <Bar dataKey="ideas" fill="#ffc658" name="Ideas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <LineChart className="mr-2 h-5 w-5 text-idolyst-blue" />
                  Follower Growth
                </CardTitle>
                <CardDescription>Growth trend over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={growthData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="followers" 
                      stroke="#8884d8" 
                      fillOpacity={1} 
                      fill="url(#colorFollowers)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <PieChart className="mr-2 h-5 w-5 text-idolyst-blue" />
                  Engagement Breakdown
                </CardTitle>
                <CardDescription>Types of engagement</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={engagementData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {engagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="md:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Lightbulb className="mr-2 h-5 w-5 text-idolyst-blue" />
                  Idea Performance
                </CardTitle>
                <CardDescription>Votes and comments on your ideas</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={ideaPerformanceData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="votes" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }}
                      name="Votes"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="comments" 
                      stroke="#82ca9d"
                      name="Comments"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Analytics;
