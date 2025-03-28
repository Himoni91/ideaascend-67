
import React from 'react';
import { motion } from "framer-motion";
import { 
  MessageSquare, Heart, Share2, Eye, Clock, RefreshCw, 
  ThumbsUp, BarChart, LineChart, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsCard } from './AnalyticsCard';
import { AnalyticsChart } from './AnalyticsChart';
import { 
  UserAnalytics, 
  ChartData 
} from '@/types/analytics';

interface EngagementTabProps {
  userAnalytics?: UserAnalytics;
  chartData: ChartData[];
}

export function EngagementTab({
  userAnalytics,
  chartData,
}: EngagementTabProps) {
  // Calculate simplified engagement metrics
  const engagementMetrics = [
    {
      title: 'Comments',
      value: userAnalytics?.total_comments || 0,
      icon: <MessageSquare className="h-4 w-4" />,
      color: '#4f46e5'
    },
    {
      title: 'Likes Received',
      value: userAnalytics?.total_posts || 0 * 2.5, // Just for demonstration
      icon: <Heart className="h-4 w-4" />,
      color: '#ef4444'
    },
    {
      title: 'Content Shares',
      value: Math.floor((userAnalytics?.total_posts || 0) * 0.3), // Just for demonstration
      icon: <Share2 className="h-4 w-4" />,
      color: '#10b981'
    },
    {
      title: 'Avg. Time on Page',
      value: `${Math.floor((userAnalytics?.time_spent_minutes || 0) / Math.max(userAnalytics?.page_views || 1, 1))}m`,
      icon: <Clock className="h-4 w-4" />,
      color: '#f59e0b'
    },
  ];

  // Create bounce rate and return visitor data (simulated)
  const bounceRate = 65 - Math.floor(Math.random() * 30);
  const returnVisitors = 20 + Math.floor(Math.random() * 30);

  // Create engagement by time of day data (simulated)
  const engagementByTime = [
    { name: '6am-9am', value: 10 + Math.floor(Math.random() * 20) },
    { name: '9am-12pm', value: 20 + Math.floor(Math.random() * 30) },
    { name: '12pm-3pm', value: 30 + Math.floor(Math.random() * 40) },
    { name: '3pm-6pm', value: 40 + Math.floor(Math.random() * 30) },
    { name: '6pm-9pm', value: 50 + Math.floor(Math.random() * 20) },
    { name: '9pm-12am', value: 30 + Math.floor(Math.random() * 20) },
    { name: '12am-3am', value: 10 + Math.floor(Math.random() * 10) },
    { name: '3am-6am', value: 5 + Math.floor(Math.random() * 5) },
  ];

  // Create user engagement funnel data (simulated)
  const engagementFunnel = [
    { name: 'Views', value: userAnalytics?.page_views || 0 },
    { name: 'Engagement', value: (userAnalytics?.total_comments || 0) + (userAnalytics?.total_posts || 0) * 3 },
    { name: 'Follows', value: userAnalytics?.followers_count || 0 },
    { name: 'Repeated', value: Math.floor((userAnalytics?.page_views || 0) * 0.2) },
  ];

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
        {engagementMetrics.map((metric, index) => (
          <AnalyticsCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            delay={index}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Engagement Over Time"
          description="Interactions with your content"
          data={chartData}
          type="line"
          dataKeys={['Page Views', 'Profile Views']}
          colors={['#4f46e5', '#10b981']}
          height={300}
        />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
              Visitor Retention Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-bold">{bounceRate}%</div>
                <div className="text-sm text-muted-foreground mt-1">Bounce Rate</div>
                <div className="flex items-center mt-2 text-xs">
                  <ThumbsUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-500">Good</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-bold">{returnVisitors}%</div>
                <div className="text-sm text-muted-foreground mt-1">Return Visitors</div>
                <div className="flex items-center mt-2 text-xs">
                  <ThumbsUp className="h-3 w-3 mr-1 text-green-500" />
                  <span className="text-green-500">Growing</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Engagement by Time of Day"
          description="When your audience is most active"
          data={engagementByTime}
          type="bar"
          dataKeys={['value']}
          colors={['#4f46e5']}
          height={300}
        />
        
        <AnalyticsChart
          title="Engagement Funnel"
          description="User journey through your content"
          data={engagementFunnel}
          type="bar"
          dataKeys={['value']}
          colors={['#10b981']}
          height={300}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            Engagement Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Most Active Hours</h3>
              <p className="text-sm text-muted-foreground">Your content gets the most engagement between <span className="font-medium text-foreground">6pm-9pm</span>.</p>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Content Type Performance</h3>
              <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Pitches</span> receive 2.5x more engagement than regular posts.</p>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Retention Opportunities</h3>
              <p className="text-sm text-muted-foreground">Engaging with commenters increases return visits by <span className="font-medium text-foreground">35%</span>.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
