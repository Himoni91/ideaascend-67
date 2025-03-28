
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
  
  // Updated to match the actual hook interface
  const {
    timeRange,
    setTimeRange,
    trackEvent,
    fetchAnalytics,
    loading: isLoading,
    data: analyticsData,
    exportAnalytics
  } = useAnalytics();

  const [isRealtime, setIsRealtime] = useState(false);
  
  // Extract the data needed from the hook
  const userAnalytics = analyticsData?.userAnalytics;
  const analyticsSnapshots = analyticsData?.snapshots;
  const analyticsEvents = analyticsData?.events;
  const chartData = analyticsData?.chartData;

  // Record page view on component mount
  useEffect(() => {
    if (user) {
      // Record analytics event
      trackEvent('page_view', 'analytics');
    }
  }, [user, trackEvent]);

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
    
    // Execute the export function
    exportAnalytics();
    
    toast({
      title: "Export complete",
      description: "Your analytics data has been exported as CSV",
    });
  };

  // Handle manual refresh
  const handleRefresh = () => {
    // Force refetch of all analytics data
    fetchAnalytics();
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
