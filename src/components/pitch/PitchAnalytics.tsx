
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Pitch } from '@/types/pitch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, ThumbsUp, MessageSquare, BarChart3 } from 'lucide-react';

interface PitchAnalyticsProps {
  analytics: {
    views: number;
    votes: number;
    comments: number;
    reviews: number;
    trending_score: number;
  } | undefined;
  isLoading: boolean;
  pitch: Pitch;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function PitchAnalytics({ analytics, isLoading, pitch }: PitchAnalyticsProps) {
  const engagementData = [
    {
      name: 'Views',
      value: analytics?.views || 0,
      icon: <Eye className="h-4 w-4" />,
    },
    {
      name: 'Votes',
      value: analytics?.votes || 0,
      icon: <ThumbsUp className="h-4 w-4" />,
    },
    {
      name: 'Comments',
      value: analytics?.comments || 0,
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      name: 'Reviews',
      value: analytics?.reviews || 0,
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ];

  const pieData = engagementData.filter(item => item.value > 0);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  // If no analytics data exists yet
  if (!analytics) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Analytics Data Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Analytics data will be generated as users interact with your idea.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {engagementData.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4 md:p-6 flex flex-col items-center">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mb-2">
                {item.icon}
              </div>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-sm text-muted-foreground">{item.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={engagementData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {pieData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Engagement Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
