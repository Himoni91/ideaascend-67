
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  UserAnalytics, 
  AnalyticsSnapshot, 
  AnalyticsEvent, 
  RealtimeAnalytics,
  TimeRange,
  ChartData
} from "@/types/analytics";

export const useAnalytics = (initialTimeRange: TimeRange['value'] = '30d') => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState<TimeRange['value']>(initialTimeRange);
  const [isRealtime, setIsRealtime] = useState(true);

  // Convert time range to date
  const getRangeDate = () => {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case '30d':
        return new Date(now.setDate(now.getDate() - 30)).toISOString();
      case '90d':
        return new Date(now.setDate(now.getDate() - 90)).toISOString();
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      case 'all':
      default:
        return null;
    }
  };

  // Fetch user analytics
  const { data: userAnalytics, isLoading: isLoadingAnalytics, error: analyticsError } = useQuery({
    queryKey: ['userAnalytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        // If no record exists, create one
        if (error.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from('user_analytics')
            .insert({ user_id: user.id })
            .select('*')
            .single();
          
          if (insertError) throw insertError;
          return newData as UserAnalytics;
        }
        throw error;
      }
      
      return data as UserAnalytics;
    },
    enabled: !!user,
  });

  // Fetch analytics snapshots based on time range
  const { data: analyticsSnapshots, isLoading: isLoadingSnapshots } = useQuery({
    queryKey: ['analyticsSnapshots', user?.id, timeRange],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const rangeDate = getRangeDate();
      let query = supabase
        .from('analytics_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('snapshot_date', { ascending: true });
      
      if (rangeDate) {
        query = query.gte('snapshot_date', rangeDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as AnalyticsSnapshot[];
    },
    enabled: !!user,
  });

  // Fetch recent analytics events
  const { data: analyticsEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['analyticsEvents', user?.id, timeRange],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const rangeDate = getRangeDate();
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (rangeDate) {
        query = query.gte('created_at', rangeDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as AnalyticsEvent[];
    },
    enabled: !!user,
  });

  // Fetch realtime analytics
  const { data: realtimeAnalytics, isLoading: isLoadingRealtime } = useQuery({
    queryKey: ['realtimeAnalytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('realtime_analytics')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data as RealtimeAnalytics;
    },
    refetchInterval: isRealtime ? 30000 : false, // Refetch every 30 seconds if realtime is enabled
  });

  // Record an analytics event
  const recordEvent = async (eventType: string, eventSource?: string, metadata?: any) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: user.id,
        event_type: eventType,
        event_source: eventSource,
        metadata: metadata || {}
      });
    
    if (error) {
      console.error('Error recording analytics event:', error);
      toast({
        title: 'Error recording event',
        description: error.message,
        variant: 'destructive',
      });
    }
    
    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['analyticsEvents', user.id] });
  };

  // Increment a specific analytics metric
  const incrementMetric = useMutation({
    mutationFn: async ({ 
      metric, 
      amount = 1 
    }: { 
      metric: keyof Omit<UserAnalytics, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'engagement_rate'>,
      amount?: number 
    }) => {
      if (!user || !userAnalytics) return;
      
      // Only increment numeric fields
      if (typeof userAnalytics[metric] !== 'number') return;
      
      const updates = {
        [metric]: (userAnalytics[metric] as number) + amount,
        // Recalculate engagement rate
        engagement_rate: metric === 'page_views' ? 
          ((userAnalytics.total_comments + userAnalytics.total_posts) / Math.max(userAnalytics.page_views + amount, 1)) * 100 :
          userAnalytics.engagement_rate
      };
      
      const { data, error } = await supabase
        .from('user_analytics')
        .update(updates)
        .eq('id', userAnalytics.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as UserAnalytics;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAnalytics', user?.id] });
    },
    onError: (error) => {
      console.error('Error updating analytics metric:', error);
      toast({
        title: 'Error updating analytics',
        description: 'Could not update analytics metric',
        variant: 'destructive',
      });
    }
  });

  // Helper function to prepare chart data from snapshots
  const prepareChartData = (): ChartData[] => {
    if (!analyticsSnapshots || analyticsSnapshots.length === 0) return [];
    
    return analyticsSnapshots.map(snapshot => ({
      name: new Date(snapshot.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      'Page Views': snapshot.page_views,
      'Profile Views': snapshot.profile_views,
      'Pitch Views': snapshot.pitch_views,
      'Followers Gained': snapshot.followers_gained,
      date: snapshot.snapshot_date, // Keep original date for sorting
    }));
  };

  // Set up realtime subscription for analytics updates
  useEffect(() => {
    if (!user || !isRealtime) return;
    
    const channel = supabase
      .channel('analytics-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_analytics',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['userAnalytics', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_snapshots',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['analyticsSnapshots', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_events',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['analyticsEvents', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'realtime_analytics'
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['realtimeAnalytics'] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isRealtime, queryClient]);

  return {
    userAnalytics,
    analyticsSnapshots,
    analyticsEvents,
    realtimeAnalytics,
    chartData: prepareChartData(),
    isLoading: isLoadingAnalytics || isLoadingSnapshots || isLoadingEvents || isLoadingRealtime,
    error: analyticsError,
    timeRange,
    setTimeRange,
    isRealtime,
    setIsRealtime,
    recordEvent,
    incrementMetric,
  };
};
