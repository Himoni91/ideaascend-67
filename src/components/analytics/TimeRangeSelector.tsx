
import React from 'react';
import { motion } from "framer-motion";
import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimeRange } from '@/types/analytics';

interface TimeRangeSelectorProps {
  timeRange: TimeRange['value'];
  onTimeRangeChange: (value: TimeRange['value']) => void;
  className?: string;
}

export function TimeRangeSelector({
  timeRange,
  onTimeRangeChange,
  className,
}: TimeRangeSelectorProps) {
  const timeRanges: TimeRange[] = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'This year', value: 'year' },
    { label: 'All time', value: 'all' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Select value={timeRange} onValueChange={(value) => onTimeRangeChange(value as TimeRange['value'])}>
        <SelectTrigger className="w-[160px]">
          <Calendar className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Select timeframe" />
        </SelectTrigger>
        <SelectContent>
          {timeRanges.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
}
