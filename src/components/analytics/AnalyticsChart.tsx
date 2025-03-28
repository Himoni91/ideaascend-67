
import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartData } from "@/types/analytics";

interface AnalyticsChartProps {
  title: string;
  description?: string;
  data: ChartData[];
  type?: 'line' | 'bar' | 'area';
  dataKeys: string[];
  colors?: string[];
  className?: string;
  height?: number;
}

export function AnalyticsChart({
  title,
  description,
  data,
  type = 'line',
  dataKeys,
  colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'],
  className,
  height = 300,
}: AnalyticsChartProps) {
  const chartConfig = {
    data1: {
      label: dataKeys[0],
      color: colors[0],
    },
    data2: dataKeys.length > 1 ? {
      label: dataKeys[1],
      color: colors[1],
    } : undefined,
    data3: dataKeys.length > 2 ? {
      label: dataKeys[2],
      color: colors[2],
    } : undefined,
    data4: dataKeys.length > 3 ? {
      label: dataKeys[3],
      color: colors[3],
    } : undefined,
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              {dataKeys.map((key, index) => (
                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fillOpacity={1}
                fill={`url(#gradient-${key})`}
              />
            ))}
          </AreaChart>
        );
      case 'line':
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4, fill: colors[index % colors.length] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
        <CardContent>
          <div style={{ height }}>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
