
import React from 'react';
import { motion } from "framer-motion";
import { Activity, Eye, Users, Rocket, MessageSquare, BarChart3 } from 'lucide-react';
import { AnalyticsCard } from './AnalyticsCard';
import { AnalyticsChart } from './AnalyticsChart';
import { AnalyticsEventList } from './AnalyticsEventList';
import { 
  UserAnalytics, 
  AnalyticsSnapshot, 
  AnalyticsEvent, 
  ChartData 
} from '@/types/analytics';

interface AnalyticsOverviewProps {
  userAnalytics?: UserAnalytics;
  analyticsSnapshots: AnalyticsSnapshot[];
  analyticsEvents: AnalyticsEvent[];
  chartData: ChartData[];
  isLoading: boolean;
}

export function AnalyticsOverview({
  userAnalytics,
  analyticsSnapshots,
  analyticsEvents,
  chartData,
  isLoading,
}: AnalyticsOverviewProps) {
  // Calculate trend percentages
  const calculateTrend = (metric: keyof UserAnalytics, snapshots: AnalyticsSnapshot[]) => {
    if (!snapshots || snapshots.length < 2) return { value: 0, isPositive: true };
    
    const currentValue = userAnalytics?.[metric as keyof UserAnalytics] as number || 0;
    let previousValue = 0;
    
    // Look for the same metric in snapshots, if available
    if (metric in snapshots[0]) {
      const oldestSnapshot = snapshots[0];
      previousValue = oldestSnapshot[metric as keyof AnalyticsSnapshot] as number || 0;
    }
    
    if (previousValue === 0) return { value: 0, isPositive: true };
    
    const change = currentValue - previousValue;
    const percentChange = Math.round((change / previousValue) * 100);
    
    return {
      value: Math.abs(percentChange),
      isPositive: percentChange >= 0,
    };
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Page Views"
          value={userAnalytics?.page_views || 0}
          icon={<Eye className="h-4 w-4" />}
          trend={calculateTrend('page_views', analyticsSnapshots)}
          description="All-time page views"
          delay={0}
        />
        <AnalyticsCard
          title="Total Followers"
          value={userAnalytics?.followers_count || 0}
          icon={<Users className="h-4 w-4" />}
          trend={calculateTrend('followers_count', analyticsSnapshots)}
          description="People following you"
          delay={1}
        />
        <AnalyticsCard
          title="Engagement Rate"
          value={`${(userAnalytics?.engagement_rate || 0).toFixed(1)}%`}
          icon={<Activity className="h-4 w-4" />}
          trend={{
            value: 0,
            isPositive: true,
          }}
          description="Interactions per view"
          delay={2}
        />
        <AnalyticsCard
          title="Pitch Views"
          value={userAnalytics?.pitch_views || 0}
          icon={<Rocket className="h-4 w-4" />}
          trend={calculateTrend('pitch_views', analyticsSnapshots)}
          description="Views on your pitches"
          delay={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsChart
            title="Performance Overview"
            description="Visualizing key metrics over time"
            data={chartData}
            type="area"
            dataKeys={['Page Views', 'Profile Views', 'Pitch Views']}
            colors={['#4f46e5', '#10b981', '#f59e0b']}
            height={300}
          />
        </div>
        <div>
          <AnalyticsEventList
            events={analyticsEvents}
            isLoading={isLoading}
            title="Recent Activity"
            maxHeight={300}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Audience Growth"
          description="Followers gained over time"
          data={chartData}
          type="bar"
          dataKeys={['Followers Gained']}
          colors={['#4f46e5']}
          height={300}
        />
        <AnalyticsChart
          title="Content Performance"
          description="Views by content type"
          data={[
            { name: 'Posts', value: userAnalytics?.total_posts || 0 },
            { name: 'Pitches', value: userAnalytics?.total_pitches || 0 },
            { name: 'Comments', value: userAnalytics?.total_comments || 0 },
          ]}
          type="bar"
          dataKeys={['value']}
          colors={['#10b981']}
          height={300}
        />
      </div>
    </motion.div>
  );
}
