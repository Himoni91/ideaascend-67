import React, { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { motion } from "framer-motion";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/layout/AppLayout";
import { useAnalytics } from "@/hooks/use-analytics";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { PageTransition } from "@/components/ui/page-transition";
import { Helmet } from "react-helmet-async";
import { Download, BarChart2, ArrowUpRight, Layers, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState("overview");

  const { 
    timeRange, 
    setTimeRange,
    trackEvent,
    exportAnalytics
  } = useAnalytics();
  
  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: () => {
      return Promise.resolve({
        profileViews: 540,
        profileViewsChange: 12,
        followers: 238,
        followersChange: 5,
        pitchViews: 1240,
        pitchViewsChange: 28,
        engagementRate: 4.7,
        engagementRateChange: -0.2,
        growthData: [
          { name: 'Jan', views: 400, followers: 150 },
          { name: 'Feb', views: 500, followers: 190 },
          { name: 'Mar', views: 600, followers: 220 },
          { name: 'Apr', views: 540, followers: 238 }
        ],
        engagementSourceData: [
          { name: 'Posts', value: 55 },
          { name: 'Pitches', value: 25 },
          { name: 'Mentor Sessions', value: 15 },
          { name: 'Other', value: 5 }
        ],
        contentPerformanceData: [
          { name: 'Posts', views: 450 },
          { name: 'Pitches', views: 280 },
          { name: 'Mentor Content', views: 180 },
          { name: 'Comments', views: 120 }
        ],
        detailedEngagementData: [
          { name: 'Week 1', likes: 45, comments: 23, shares: 12 },
          { name: 'Week 2', likes: 58, comments: 29, shares: 18 },
          { name: 'Week 3', likes: 52, comments: 31, shares: 15 },
          { name: 'Week 4', likes: 64, comments: 37, shares: 22 }
        ],
        audienceGrowthData: [
          { name: 'Week 1', followers: 180, views: 320 },
          { name: 'Week 2', followers: 200, views: 380 },
          { name: 'Week 3', followers: 220, views: 450 },
          { name: 'Week 4', followers: 238, views: 540 }
        ],
        contentAnalyticsData: [
          { name: 'Post A', views: 128, engagement: 45 },
          { name: 'Post B', views: 98, engagement: 32 },
          { name: 'Pitch C', views: 156, engagement: 67 },
          { name: 'Pitch D', views: 124, engagement: 52 }
        ],
      });
    }
  });
  
  useEffect(() => {
    trackEvent("page_view", "analytics");
    refetch();
  }, [trackEvent, timeRange, refetch]);

  return (
    <AppLayout>
      <Helmet>
        <title>Analytics | Idolyst</title>
      </Helmet>
      
      <PageTransition>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold">Analytics</h1>
                <p className="text-muted-foreground">Track your performance and growth</p>
              </div>
              
              <CalendarDateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
            
            <Tabs defaultValue="overview" className="space-y-8">
              <TabsList className="grid grid-cols-4 w-full max-w-md">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="growth">Growth</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    title="Profile Views"
                    value={loading ? undefined : data?.profileViews || 0}
                    change={loading ? undefined : data?.profileViewsChange || 0}
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                  />
                  
                  <StatsCard
                    title="Followers"
                    value={loading ? undefined : data?.followers || 0}
                    change={loading ? undefined : data?.followersChange || 0}
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                  />
                  
                  <StatsCard
                    title="Pitch Views"
                    value={loading ? undefined : data?.pitchViews || 0}
                    change={loading ? undefined : data?.pitchViewsChange || 0}
                    icon={<Layers className="h-4 w-4 text-muted-foreground" />}
                  />
                  
                  <StatsCard
                    title="Engagement Rate"
                    value={loading ? undefined : `${(data?.engagementRate || 0).toFixed(1)}%`}
                    change={loading ? undefined : data?.engagementRateChange || 0}
                    icon={<BarChart2 className="h-4 w-4 text-muted-foreground" />}
                  />
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Growth Overview</CardTitle>
                    <CardDescription>
                      Profile views and followers over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="w-full h-[300px] rounded-lg" />
                    ) : (
                      <LineChart data={data?.growthData || []} />
                    )}
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Engagement Source</CardTitle>
                      <CardDescription>
                        Where your engagement comes from
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <Skeleton className="w-full h-[300px] rounded-lg" />
                      ) : (
                        <PieChart data={data?.engagementSourceData || []} />
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Performance</CardTitle>
                      <CardDescription>
                        Views across different content types
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <Skeleton className="w-full h-[300px] rounded-lg" />
                      ) : (
                        <BarChart data={data?.contentPerformanceData || []} />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="engagement">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Metrics</CardTitle>
                    <CardDescription>Detailed engagement analytics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="w-full h-[400px] rounded-lg" />
                    ) : (
                      <LineChart data={data?.detailedEngagementData || []} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="growth">
                <Card>
                  <CardHeader>
                    <CardTitle>Audience Growth</CardTitle>
                    <CardDescription>Follower and view growth over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="w-full h-[400px] rounded-lg" />
                    ) : (
                      <LineChart data={data?.audienceGrowthData || []} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Analytics</CardTitle>
                    <CardDescription>Performance metrics for your content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="w-full h-[400px] rounded-lg" />
                    ) : (
                      <BarChart data={data?.contentAnalyticsData || []} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </PageTransition>
    </AppLayout>
  );
};

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

export default AnalyticsPage;
