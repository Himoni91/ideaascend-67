
import React from 'react';
import { motion } from "framer-motion";
import { 
  Activity, 
  Users, 
  BarChart2, 
  MessageSquare, 
  Rocket, 
  UserCheck 
} from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { AnalyticsTab } from '@/types/analytics';

interface AnalyticsTabsProps {
  activeTab: AnalyticsTab;
  onTabChange: (tab: AnalyticsTab) => void;
  className?: string;
}

export function AnalyticsTabs({
  activeTab,
  onTabChange,
  className,
}: AnalyticsTabsProps) {
  const tabs = [
    { value: 'overview' as AnalyticsTab, label: 'Overview', icon: <Activity className="h-4 w-4" /> },
    { value: 'engagement' as AnalyticsTab, label: 'Engagement', icon: <BarChart2 className="h-4 w-4" /> },
    { value: 'content' as AnalyticsTab, label: 'Content', icon: <MessageSquare className="h-4 w-4" /> },
    { value: 'audience' as AnalyticsTab, label: 'Audience', icon: <Users className="h-4 w-4" /> },
    { value: 'pitches' as AnalyticsTab, label: 'Pitches', icon: <Rocket className="h-4 w-4" /> },
    { value: 'mentoring' as AnalyticsTab, label: 'Mentoring', icon: <UserCheck className="h-4 w-4" /> },
  ];

  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as AnalyticsTab)} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <TabsList className="w-full overflow-x-auto flex-wrap justify-start sm:justify-center p-1">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              className="flex items-center gap-1.5 px-3 py-1.5 data-[state=active]:bg-primary/10"
            >
              {tab.icon}
              <span className="hidden xs:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </motion.div>
    </Tabs>
  );
}
