
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, TrendingUp, Users, BarChart3, ArrowUp, MessageSquare, Star } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Pitch } from "@/types/pitch";

interface PitchAnalyticsData {
  views: number;
  votes: number;
  comments: number;
  reviews: number;
  trending_score: number;
}

interface PitchAnalyticsProps {
  analytics: PitchAnalyticsData | undefined;
  isLoading: boolean;
  pitch: Pitch;
}

export default function PitchAnalytics({
  analytics,
  isLoading,
  pitch
}: PitchAnalyticsProps) {
  // Format data for charts
  const engagementData = [
    { name: "Votes", value: pitch.votes_count, color: "#4f46e5" },
    { name: "Comments", value: pitch.comments_count, color: "#0ea5e9" },
    { name: "Reviews", value: pitch.mentor_reviews_count, color: "#8b5cf6" },
    { name: "Views", value: analytics?.views || 0, color: "#10b981" },
  ];
  
  // Convert created_at to a Date object for display
  const createdDate = new Date(pitch.created_at);
  const updatedDate = new Date(pitch.updated_at);
  
  // Calculate age in days
  const ageInDays = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate engagement rate (total interactions / views)
  const totalInteractions = pitch.votes_count + pitch.comments_count + pitch.mentor_reviews_count;
  const views = analytics?.views || 1;
  const engagementRate = Math.round((totalInteractions / views) * 100) || 0;
  
  const interactionPerDay = ageInDays > 0 ? (totalInteractions / ageInDays).toFixed(1) : totalInteractions;

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>
            Insights into how your pitch is performing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Age</p>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold">{ageInDays}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">days</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Trending Score</p>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold">{pitch.trending_score}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">points</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Engagement Rate</p>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold">{engagementRate}%</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">interactions per view</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Activity</p>
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold">{interactionPerDay}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">interactions per day</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Engagement Breakdown</CardTitle>
          <CardDescription>
            See how users are interacting with your pitch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg shadow-md p-2">
                          <p className="font-medium">{payload[0].payload.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Count: <span className="font-medium">{payload[0].payload.value}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  fill="fill"
                  className="fill-primary"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>
              Key dates for your pitch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-8 w-8 flex items-center justify-center rounded-full bg-primary/10">
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <time className="text-sm text-muted-foreground">{format(createdDate, "PPP 'at' p")}</time>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(createdDate, { addSuffix: true })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-8 w-8 flex items-center justify-center rounded-full bg-primary/10">
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <time className="text-sm text-muted-foreground">{format(updatedDate, "PPP 'at' p")}</time>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(updatedDate, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Engagement Summary</CardTitle>
            <CardDescription>
              Overview of all interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Votes</span>
                </div>
                <Badge variant="outline" className="text-blue-600">
                  {pitch.votes_count}
                </Badge>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-medium">Comments</span>
                </div>
                <Badge variant="outline" className="text-indigo-600">
                  {pitch.comments_count}
                </Badge>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium">Mentor Reviews</span>
                </div>
                <Badge variant="outline" className="text-amber-600">
                  {pitch.mentor_reviews_count}
                </Badge>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium">Views</span>
                </div>
                <Badge variant="outline" className="text-emerald-600">
                  {analytics?.views || 0}
                </Badge>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
