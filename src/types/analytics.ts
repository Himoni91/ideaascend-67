
import { Json } from "@/integrations/supabase/types";

export interface UserAnalytics {
  id: string;
  user_id: string;
  page_views: number;
  profile_views: number;
  pitch_views: number;
  mentor_session_count: number;
  followers_count: number;
  following_count: number;
  total_posts: number;
  total_pitches: number;
  total_comments: number;
  engagement_rate: number;
  time_spent_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  page_views: number;
  profile_views: number;
  pitch_views: number;
  followers_gained: number;
  engagement_rate: number;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_source?: string;
  metadata?: Json;
  created_at: string;
}

export interface RealtimeAnalytics {
  id: string;
  active_users: number;
  page_views_last_hour: number;
  most_active_page?: string;
  updated_at: string;
}

export interface EngagementMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

export interface TimeRange {
  label: string;
  value: '7d' | '30d' | '90d' | 'year' | 'all';
}

export interface ChartData {
  name: string;
  [key: string]: string | number;
}

export type AnalyticsTab = 'overview' | 'engagement' | 'content' | 'audience' | 'pitches' | 'mentoring';
