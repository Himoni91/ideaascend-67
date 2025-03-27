
import { useState } from "react";
import { motion } from "framer-motion";
import { usePitches } from "@/hooks/use-pitches";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, BarChart2, MessageSquare, Eye, Star } from "lucide-react";
import { AreaChart, Area, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface PitchAnalyticsProps {
  pitchId: string;
}

// Sample data for charts (in a real app, this would come from an API)
const generateDummyData = (base: number, days: number = 7) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: Math.floor(base * 0.8 + Math.random() * base * 0.4),
      votes: Math.floor(base * 0.3 + Math.random() * base * 0.2),
      upvotes: Math.floor(base * 0.2 + Math.random() * base * 0.15),
      downvotes: Math.floor(Math.random() * base * 0.05),
      feedback: Math.floor(base * 0.1 + Math.random() * base * 0.1),
    });
  }
  
  return data;
};

export default function PitchAnalytics({ pitchId }: PitchAnalyticsProps) {
  const { useAnalytics } = usePitches();
  const { data: analytics, isLoading } = useAnalytics(pitchId);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  
  const baseValue = analytics?.views || 50;
  const chartData = generateDummyData(baseValue, timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365);
  
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-40" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }
  
  return (
    <motion.div 
      className="space-y-6"
      variants={containerAnimation}
      initial="hidden"
      animate="show"
    >
      <Tabs 
        defaultValue="week" 
        value={timeRange}
        onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'year')}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pitch Analytics</h2>
          <TabsList>
            <TabsTrigger value="week">7 Days</TabsTrigger>
            <TabsTrigger value="month">30 Days</TabsTrigger>
            <TabsTrigger value="year">1 Year</TabsTrigger>
          </TabsList>
        </div>
        
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={itemAnimation}
        >
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="flex items-center text-muted-foreground mb-1">
                <Eye className="h-4 w-4 mr-1.5" />
                <span className="text-sm">Views</span>
              </div>
              <div className="text-2xl font-bold">{analytics?.views || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="flex items-center text-muted-foreground mb-1">
                <ArrowUp className="h-4 w-4 mr-1.5" />
                <span className="text-sm">Votes</span>
              </div>
              <div className="text-2xl font-bold">{analytics?.votes || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="flex items-center text-muted-foreground mb-1">
                <MessageSquare className="h-4 w-4 mr-1.5" />
                <span className="text-sm">Feedback</span>
              </div>
              <div className="text-2xl font-bold">{analytics?.comments || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="flex items-center text-muted-foreground mb-1">
                <Star className="h-4 w-4 mr-1.5" />
                <span className="text-sm">Reviews</span>
              </div>
              <div className="text-2xl font-bold">{analytics?.reviews || 0}</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <TabsContent value="week" className="mt-6">
          <motion.div variants={itemAnimation}>
            <Card>
              <CardHeader>
                <CardTitle>Engagement Overview - Last 7 Days</CardTitle>
                <CardDescription>
                  Track views, votes, and feedback over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="votes" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="feedback" stackId="3" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemAnimation} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Vote Distribution</CardTitle>
                <CardDescription>
                  Upvotes vs. downvotes performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="upvotes" name="Upvotes" fill="#4ade80" />
                      <Bar dataKey="downvotes" name="Downvotes" fill="#f87171" />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="month" className="mt-6">
          {/* Similar components for monthly view */}
          <motion.div variants={itemAnimation}>
            <Card>
              <CardHeader>
                <CardTitle>Engagement Overview - Last 30 Days</CardTitle>
                <CardDescription>
                  Track views, votes, and feedback over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="votes" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="feedback" stackId="3" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="year" className="mt-6">
          {/* Similar components for yearly view */}
          <motion.div variants={itemAnimation}>
            <Card>
              <CardHeader>
                <CardTitle>Engagement Overview - Last Year</CardTitle>
                <CardDescription>
                  Track views, votes, and feedback over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="votes" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="feedback" stackId="3" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
