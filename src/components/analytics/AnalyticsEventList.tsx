
import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Timer, User, FileText, Rocket, MessageSquare, Users } from "lucide-react";
import { AnalyticsEvent } from "@/types/analytics";
import { formatDistanceToNow } from "date-fns";

interface AnalyticsEventListProps {
  events: AnalyticsEvent[];
  isLoading: boolean;
  title?: string;
  maxHeight?: number;
}

export function AnalyticsEventList({
  events,
  isLoading,
  title = "Recent Events",
  maxHeight = 400,
}: AnalyticsEventListProps) {
  const getEventIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'page_view':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'pitch_view':
      case 'pitch_create':
        return <Rocket className="h-4 w-4 text-purple-500" />;
      case 'profile_view':
        return <User className="h-4 w-4 text-green-500" />;
      case 'session_start':
      case 'session_end':
        return <Timer className="h-4 w-4 text-amber-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-pink-500" />;
      case 'follow':
      case 'unfollow':
        return <Users className="h-4 w-4 text-indigo-500" />;
      default:
        return <BarChart className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventDescription = (event: AnalyticsEvent) => {
    const type = event.event_type.toLowerCase();
    const source = event.event_source ? ` on ${event.event_source}` : '';
    
    switch (type) {
      case 'page_view':
        return `Viewed page${source}`;
      case 'pitch_view':
        return `Viewed pitch${source}`;
      case 'pitch_create':
        return `Created new pitch${source}`;
      case 'profile_view':
        return `Profile viewed${source}`;
      case 'session_start':
        return `Started session${source}`;
      case 'session_end':
        return `Ended session${source}`;
      case 'comment':
        return `Added comment${source}`;
      case 'follow':
        return `Followed user${source}`;
      case 'unfollow':
        return `Unfollowed user${source}`;
      default:
        return `${event.event_type}${source}`;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className={`pr-4 -mr-4`} style={{ maxHeight }}>
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No events recorded yet</p>
          ) : (
            <motion.div
              className="space-y-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  className="flex items-start gap-3 bg-background/70 p-3 rounded-md hover:bg-background/90 transition-colors"
                  variants={item}
                >
                  <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center">
                    {getEventIcon(event.event_type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{getEventDescription(event)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </p>
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground rounded bg-muted/50 p-1 max-w-xs overflow-hidden text-ellipsis">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-1">
                            <span className="font-medium">{key}:</span>
                            <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
