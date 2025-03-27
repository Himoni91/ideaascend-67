
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Users, BarChart2, TrendingUp } from "lucide-react";

interface PostAnalyticsProps {
  postId: string;
}

export default function PostAnalytics({ postId }: PostAnalyticsProps) {
  const { theme } = useTheme();
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["post-analytics", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_analytics")
        .select("*")
        .eq("post_id", postId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });
  
  const { data: viewsHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["post-views-history", postId],
    queryFn: async () => {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 7);
      
      const { data, error } = await supabase
        .from("post_views")
        .select("viewed_at")
        .eq("post_id", postId)
        .gte("viewed_at", dateFrom.toISOString())
        .order("viewed_at", { ascending: true });
        
      if (error) throw error;
      
      // Process data for chart by grouping views by day
      const viewsByDay = data.reduce((acc: Record<string, number>, view) => {
        const day = new Date(view.viewed_at).toLocaleDateString();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});
      
      // Convert to chart data format
      return Object.entries(viewsByDay).map(([date, count]) => ({
        date,
        views: count,
      }));
    },
    enabled: !!postId,
  });
  
  if (isLoading || isHistoryLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Post Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-6">
            <Skeleton className="h-20 w-1/4" />
            <Skeleton className="h-20 w-1/4" />
            <Skeleton className="h-20 w-1/4" />
          </div>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Post Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No analytics data available for this post yet.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <h3 className="text-2xl font-bold">{analytics.views || 0}</h3>
                </div>
                <Eye className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Unique Viewers</p>
                  <h3 className="text-2xl font-bold">{analytics.unique_viewers || 0}</h3>
                </div>
                <Users className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                  <h3 className="text-2xl font-bold">
                    {analytics.views > 0 
                      ? `${((analytics.unique_viewers / analytics.views) * 100).toFixed(1)}%` 
                      : '0%'
                    }
                  </h3>
                </div>
                <BarChart2 className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="h-[300px]">
          <h3 className="text-sm font-medium mb-4">Views over the last 7 days</h3>
          {viewsHistory && viewsHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#444' : '#eee'} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  stroke={theme === 'dark' ? '#888' : '#666'}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  stroke={theme === 'dark' ? '#888' : '#666'}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#333' : '#fff', 
                    border: 'none', 
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                  }}
                  itemStyle={{ color: theme === 'dark' ? '#fff' : '#333' }}
                />
                <Bar 
                  dataKey="views" 
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                  name="Views"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <TrendingUp className="h-12 w-12 mb-2 opacity-20" />
              <p>Not enough data to display chart</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
