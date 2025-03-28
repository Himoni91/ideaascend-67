
import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

export function AnalyticsCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  className,
  delay = 0
}: AnalyticsCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        delay: delay * 0.1
      }
    }
  };

  return (
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            {icon && (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                {icon}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div className="flex items-center mt-1">
              <div className={cn(
                "text-xs font-medium rounded-full px-1.5 py-0.5 flex items-center",
                trend.isPositive ? "text-green-500 bg-green-50 dark:bg-green-900/20" : "text-red-500 bg-red-50 dark:bg-red-900/20"
              )}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={cn(
                    "w-3 h-3 mr-1",
                    !trend.isPositive && "transform rotate-180"
                  )}
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 01-1 1H9v1a1 1 0 01-2 0V8H6a1 1 0 010-2h1V5a1 1 0 112 0v1h1a1 1 0 011 1z"
                    clipRule="evenodd"
                  />
                </svg>
                {trend.value}%
              </div>
              {description && (
                <CardDescription className="ml-2 text-xs">{description}</CardDescription>
              )}
            </div>
          )}
          {!trend && description && (
            <CardDescription className="text-xs mt-1">{description}</CardDescription>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
