import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMentor } from "@/hooks/use-mentor";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MentorAnalytics } from "@/types/mentor";
import { Loader2 } from "lucide-react";

export default function MentorAnalyticsPage() {
  const { user } = useAuth();
  const { useMentorSessions } = useMentor();
  const { data: sessions, isLoading } = useMentorSessions(undefined, "mentor");
  const [analytics, setAnalytics] = useState<MentorAnalytics>({
    total_sessions: 0,
    completed_sessions: 0,
    average_rating: 0,
    total_earnings: 0,
    session_duration_total: 0,
    upcoming_sessions: 0,
    repeat_mentees: 0,
    reviews_count: 0
  });

  // Calculate analytics from sessions
  useEffect(() => {
    if (sessions) {
      const now = new Date();
      const completedSessions = sessions.filter(s => s.status === "completed");
      const upcomingSessions = sessions.filter(s => new Date(s.start_time) > now && s.status !== "cancelled");
      
      // Get unique mentees
      const uniqueMentees = [...new Set(sessions.map(s => s.mentee_id))];
      
      // Check for repeat mentees
      const menteeCounts: Record<string, number> = {};
      sessions.forEach(s => {
        menteeCounts[s.mentee_id] = (menteeCounts[s.mentee_id] || 0) + 1;
      });
      const repeatMentees = Object.values(menteeCounts).filter(count => count > 1).length;
      
      // Calculate total earnings
      const totalEarnings = sessions.reduce((sum, session) => {
        return sum + (session.payment_amount || 0);
      }, 0);
      
      setAnalytics({
        total_sessions: sessions.length,
        completed_sessions: completedSessions.length,
        average_rating: 4.5, // Placeholder - would come from reviews
        total_earnings: totalEarnings,
        session_duration_total: sessions.reduce((sum, s) => {
          const start = new Date(s.start_time);
          const end = new Date(s.end_time);
          return sum + ((end.getTime() - start.getTime()) / (1000 * 60)); // in minutes
        }, 0),
        upcoming_sessions: upcomingSessions.length,
        repeat_mentees: repeatMentees,
        reviews_count: 0 // Would come from a reviews query
      });
    }
  }, [sessions]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // Prepare chart data
  const sessionStatusData = [
    { name: 'Completed', value: analytics.completed_sessions },
    { name: 'Upcoming', value: analytics.upcoming_sessions },
    { name: 'Others', value: analytics.total_sessions - analytics.completed_sessions - analytics.upcoming_sessions }
  ];

  const COLORS = ['#4CAF50', '#2196F3', '#9E9E9E'];

  const earningsData = sessions 
    ? sessions
        .filter(s => s.payment_status === "completed")
        .map(session => ({
          date: new Date(session.created_at).toLocaleDateString(),
          amount: session.payment_amount || 0
        }))
        .reduce((acc: {date: string, amount: number}[], curr) => {
          const existing = acc.find(item => item.date === curr.date);
          if (existing) {
            existing.amount += curr.amount;
          } else {
            acc.push(curr);
          }
          return acc;
        }, [])
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentor Analytics</h1>
          <p className="text-muted-foreground">
            View and track your mentorship performance and earnings
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_sessions}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.completed_sessions} completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${analytics.total_earnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {analytics.completed_sessions} completed sessions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.average_rating.toFixed(1)}/5.0</div>
              <p className="text-xs text-muted-foreground">
                Based on {analytics.reviews_count} reviews
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.upcoming_sessions}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled sessions
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="earnings">
          <TabsList>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="earnings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Over Time</CardTitle>
                <CardDescription>
                  Your earnings from completed sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={earningsData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Amount']}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="#4CAF50" 
                      name="Earnings" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Session Status</CardTitle>
                <CardDescription>
                  Distribution of your sessions by status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sessionStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {sessionStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, 'Sessions']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
