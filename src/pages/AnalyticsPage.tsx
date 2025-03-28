
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/components/layout/AppLayout";
import { useAnalytics } from "@/hooks/use-analytics";
import { TimeRangeSelector } from "@/components/analytics/TimeRangeSelector";
import { AnalyticsTabs } from "@/components/analytics/AnalyticsTabs";
import { AnalyticsOverview } from "@/components/analytics/AnalyticsOverview";
import { EngagementTab } from "@/components/analytics/EngagementTab";
import { RealtimeCounter } from "@/components/analytics/RealtimeCounter";
import { useToast } from "@/hooks/use-toast";
import { AnalyticsTab, TimeRange } from "@/types/analytics";
import { useAuth } from "@/contexts/AuthContext";

export default function AnalyticsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  
  const {
    userAnalytics,
    analyticsSnapshots,
    analyticsEvents,
    realtimeAnalytics,
    chartData,
    isLoading,
    timeRange,
    setTimeRange,
    isRealtime,
    setIsRealtime,
    recordEvent,
    incrementMetric,
  } = useAnalytics();

  // Record page view on component mount
  useEffect(() => {
    if (user) {
      // Record analytics event
      recordEvent('page_view', 'analytics');
      
      // Increment page view counter
      incrementMetric.mutate({ metric: 'page_views' });
    }
  }, [user]);

  // Generate CSV data for export
  const exportCSV = () => {
    if (!analyticsSnapshots || analyticsSnapshots.length === 0) {
      toast({
        title: "No data to export",
        description: "Your analytics data is empty",
        variant: "destructive",
      });
      return;
    }
    
    // Convert snapshots to CSV
    const headers = ["Date", "Page Views", "Profile Views", "Pitch Views", "Followers Gained", "Engagement Rate"];
    const rows = analyticsSnapshots.map(snapshot => [
      snapshot.snapshot_date,
      snapshot.page_views,
      snapshot.profile_views,
      snapshot.pitch_views,
      snapshot.followers_gained,
      snapshot.engagement_rate
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export complete",
      description: "Your analytics data has been exported as CSV",
    });
  };

  // Handle manual refresh
  const handleRefresh = () => {
    // Force refetch of all analytics data
    window.location.reload();
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
      }
    }
  };

  return (
    <AppLayout>
      <motion.div 
        initial="initial"
        animate="animate"
        variants={pageVariants}
        className="max-w-7xl mx-auto px-4 pb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track your performance and audience engagement
            </p>
          </motion.div>
          
          <div className="flex flex-wrap items-center gap-2">
            <RealtimeCounter 
              isRealtime={isRealtime}
              setIsRealtime={setIsRealtime}
            />
            
            <TimeRangeSelector 
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportCSV}
              className="flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        <AnalyticsTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-6"
        />
        
        <Separator className="my-6" />
        
        {activeTab === 'overview' && (
          <AnalyticsOverview
            userAnalytics={userAnalytics}
            analyticsSnapshots={analyticsSnapshots || []}
            analyticsEvents={analyticsEvents || []}
            chartData={chartData}
            isLoading={isLoading}
          />
        )}
        
        {activeTab === 'engagement' && (
          <EngagementTab
            userAnalytics={userAnalytics}
            chartData={chartData}
          />
        )}
        
        {/* Placeholder for other tabs that would be implemented similarly */}
        {(activeTab === 'content' || 
          activeTab === 'audience' || 
          activeTab === 'pitches' || 
          activeTab === 'mentoring') && (
          <div className="flex items-center justify-center py-12 text-center">
            <div>
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">Coming Soon</h2>
              <p className="text-muted-foreground max-w-md">
                We're currently building this analytics section. 
                Check back soon for detailed insights on {activeTab === 'content' ? 'your content' : 
                  activeTab === 'audience' ? 'your audience' : 
                  activeTab === 'pitches' ? 'your pitches' : 'your mentoring'}.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
