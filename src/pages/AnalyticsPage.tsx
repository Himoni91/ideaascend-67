
import React, { useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useAnalytics } from "@/hooks/use-analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { PageTransition } from "@/components/ui/page-transition";
import { Helmet } from "react-helmet-async";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { Download, BarChart2, ArrowUpRight, Layers, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

const AnalyticsPage = () => {
  const { 
    timeRange, 
    setTimeRange,
    trackEvent,
    getAnalytics, 
    exportAnalytics
  } = useAnalytics();
  
  // Use react-query to fetch analytics data
  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: () => getAnalytics(timeRange),
  });
  
  useEffect(() => {
    // Track page view
    trackEvent("page_view", "analytics");
    
    // Fetch analytics data when component mounts
    refetch();
  }, [trackEvent, timeRange, refetch]);

  return (
    <AppLayout>
      <Helmet>
        <title>Analytics | Idolyst</title>
      </Helmet>
      
      <PageTransition>
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Track your engagement, growth, and content performance
              </p>
            </div>
            
            <div className="flex gap-2 self-end sm:self-auto">
              <CalendarDateRangePicker />
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportAnalytics()}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="growth">Growth</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-8">
              {/* Overview Stats */}
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
              
              {/* Growth Chart */}
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
              
              {/* Engagement Distribution */}
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
              {/* Engagement specific content */}
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
              {/* Growth specific content */}
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
              {/* Content specific analytics */}
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

export default AnalyticsPage;
