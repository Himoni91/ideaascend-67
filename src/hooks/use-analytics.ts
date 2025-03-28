
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { AnalyticsSnapshot, EngagementMetric, TimeRange, UserAnalytics } from "@/types/analytics";
import { toast } from "sonner";

const DEFAULT_TIME_RANGE: TimeRange['value'] = '30d';

export const useAnalytics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState<TimeRange['value']>(DEFAULT_TIME_RANGE);

  // Track page view
  useEffect(() => {
    if (user) {
      trackEvent('page_view', 'analytics', { page: '/analytics' });
    }
  }, [user]);

  // Function to track analytics events
  const trackEvent = useCallback(async (
    eventType: string, 
    eventSource?: string, 
    metadata?: Record<string, any>
  ) => {
    try {
      const payload = {
        event_type: eventType,
        event_source: eventSource,
        metadata: metadata || {},
        user_id: user?.id
      };

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-tracker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession() ? (await supabase.auth.getSession()).data.session?.access_token : ''}`
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [user]);

  // Get user analytics summary
  const useUserAnalytics = () => {
    return useQuery({
      queryKey: ['user-analytics', user?.id],
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
              .select()
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
  };

  // Get analytics snapshots for historical data
  const useAnalyticsSnapshots = () => {
    return useQuery({
      queryKey: ['analytics-snapshots', user?.id, timeRange],
      queryFn: async () => {
        if (!user) throw new Error('User not authenticated');

        let query = supabase
          .from('analytics_snapshots')
          .select('*')
          .eq('user_id', user.id)
          .order('snapshot_date', { ascending: true });

        // Apply time range filter
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
          case '7d':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case '30d':
            startDate = new Date(now.setDate(now.getDate() - 30));
            break;
          case '90d':
            startDate = new Date(now.setDate(now.getDate() - 90));
            break;
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          case 'all':
          default:
            // No additional filter for 'all'
            break;
        }

        if (timeRange !== 'all') {
          query = query.gte('snapshot_date', startDate.toISOString().split('T')[0]);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as AnalyticsSnapshot[];
      },
      enabled: !!user,
    });
  };

  // Get analytics events
  const useAnalyticsEvents = (limit: number = 20) => {
    return useQuery({
      queryKey: ['analytics-events', user?.id, timeRange, limit],
      queryFn: async () => {
        if (!user) throw new Error('User not authenticated');

        let query = supabase
          .from('analytics_events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        // Apply time range filter
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
          case '7d':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case '30d':
            startDate = new Date(now.setDate(now.getDate() - 30));
            break;
          case '90d':
            startDate = new Date(now.setDate(now.getDate() - 90));
            break;
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          case 'all':
          default:
            // No additional filter for 'all'
            break;
        }

        if (timeRange !== 'all') {
          query = query.gte('created_at', startDate.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
      },
      enabled: !!user,
    });
  };

  // Get realtime analytics
  const useRealtimeAnalytics = () => {
    return useQuery({
      queryKey: ['realtime-analytics'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('realtime_analytics')
          .select('*')
          .single();

        if (error) {
          console.error('Error fetching realtime analytics:', error);
          return {
            active_users: 0,
            page_views_last_hour: 0,
            most_active_page: 'Unknown',
            updated_at: new Date().toISOString()
          };
        }

        return data;
      },
      refetchInterval: 15000, // Refetch every 15 seconds
    });
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const analyticsChannel = supabase
      .channel('analytics-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_analytics',
        filter: `user_id=eq.${user.id}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['user-analytics'] });
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'analytics_events',
        filter: `user_id=eq.${user.id}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['analytics-events'] });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'realtime_analytics'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['realtime-analytics'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(analyticsChannel);
    };
  }, [user, queryClient]);

  // Export analytics data
  const exportAnalytics = async () => {
    if (!user) {
      toast.error('You must be logged in to export analytics');
      return;
    }

    try {
      // Fetch user analytics
      const userAnalyticsPromise = supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch analytics snapshots
      const snapshotsPromise = supabase
        .from('analytics_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('snapshot_date', { ascending: true });

      // Fetch analytics events
      const eventsPromise = supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const [
        userAnalyticsResult,
        snapshotsResult,
        eventsResult
      ] = await Promise.all([
        userAnalyticsPromise,
        snapshotsPromise,
        eventsPromise
      ]);

      // Prepare data
      const exportData = {
        exportDate: new Date().toISOString(),
        userAnalytics: userAnalyticsResult.data,
        snapshots: snapshotsResult.data,
        events: eventsResult.data
      };

      // Create file and download
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `idolyst-analytics-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Analytics data exported successfully');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Failed to export analytics data');
    }
  };

  // Get engagement metrics
  const getEngagementMetrics = (analytics: UserAnalytics | undefined, snapshots: AnalyticsSnapshot[] | undefined): EngagementMetric[] => {
    if (!analytics) return [];

    // Calculate trends based on snapshots
    let viewsTrend: 'up' | 'down' | 'neutral' = 'neutral';
    let engagementTrend: 'up' | 'down' | 'neutral' = 'neutral';
    let followersTrend: 'up' | 'down' | 'neutral' = 'neutral';

    if (snapshots && snapshots.length >= 2) {
      const recent = snapshots[snapshots.length - 1];
      const previous = snapshots[snapshots.length - 2];
      
      viewsTrend = recent.page_views > previous.page_views ? 'up' : recent.page_views < previous.page_views ? 'down' : 'neutral';
      engagementTrend = recent.engagement_rate > previous.engagement_rate ? 'up' : recent.engagement_rate < previous.engagement_rate ? 'down' : 'neutral';
      followersTrend = recent.followers_gained > 0 ? 'up' : recent.followers_gained < 0 ? 'down' : 'neutral';
    }

    return [
      {
        name: 'Profile Views',
        value: analytics.profile_views,
        change: snapshots && snapshots.length > 0 ? snapshots[snapshots.length - 1].profile_views : 0,
        trend: viewsTrend,
        icon: 'user'
      },
      {
        name: 'Engagement Rate',
        value: Math.round(analytics.engagement_rate * 100) / 100,
        change: snapshots && snapshots.length > 0 ? Math.round((snapshots[snapshots.length - 1].engagement_rate) * 100) / 100 : 0,
        trend: engagementTrend,
        icon: 'activity'
      },
      {
        name: 'Followers',
        value: analytics.followers_count,
        change: snapshots && snapshots.length > 0 ? snapshots[snapshots.length - 1].followers_gained : 0,
        trend: followersTrend,
        icon: 'users'
      },
      {
        name: 'Total Posts',
        value: analytics.total_posts,
        change: 0, // We don't track this in snapshots currently
        trend: 'neutral',
        icon: 'file-text'
      }
    ];
  };

  // Return all hooks and functions
  return {
    timeRange,
    setTimeRange,
    trackEvent,
    useUserAnalytics,
    useAnalyticsSnapshots,
    useAnalyticsEvents,
    useRealtimeAnalytics,
    getEngagementMetrics,
    exportAnalytics
  };
};
