import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/layout/AppLayout";
import { useAscendContext } from "@/contexts/AscendContext";
import { PageTransition } from "@/components/ui/page-transition";
import { 
  Award, 
  BarChart2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Flame, 
  Gift, 
  Info, 
  Lock, 
  Medal, 
  MessageSquare, 
  Star, 
  Target, 
  TrendingUp, 
  Trophy, 
  Users
} from "lucide-react";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChallengeCard } from "@/components/ascend/ChallengeCard";
import { LeaderboardTable } from "@/components/ascend/LeaderboardTable";
import { ActivityFeed } from "@/components/ascend/ActivityFeed";
import { BadgeGrid } from "@/components/ascend/BadgeGrid";

export default function Ascend() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { 
    userProgress, 
    challenges, 
    userChallenges, 
    leaderboard, 
    levelInfo, 
    recentActivity,
    loading 
  } = useAscendContext();

  // Calculate stats
  const activeChallenges = userChallenges.filter(uc => uc.status === 'in_progress').length;
  const featuredChallenges = challenges.filter(c => c.is_featured);
  const completedChallenges = userChallenges.filter(uc => uc.status === 'completed').length;
  const userLeaderboardPosition = leaderboard.findIndex(entry => entry.user_id === userProgress?.user_id) + 1;

  if (loading) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="max-w-6xl mx-auto px-4 py-8">
            <Skeleton className="h-12 w-48 mb-4" />
            <Skeleton className="h-6 w-full max-w-2xl mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <div className="mt-8">
              <Skeleton className="h-8 w-32 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
              </div>
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
              Ascend
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Level up your entrepreneurial journey by completing challenges, earning badges, and climbing the leaderboard.
            </p>
          </motion.div>

          {/* User Progress Section */}
          {userProgress && levelInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card rounded-xl shadow-sm p-6 mb-8 border"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white font-bold text-xl">
                      {userProgress.level}
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        Level {userProgress.level}
                        <Badge variant="secondary" className="ml-2">
                          {levelInfo.progress_percentage}% to Level {userProgress.level + 1}
                        </Badge>
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {userProgress.xp.toLocaleString()} XP total • {levelInfo.xp_for_next_level - userProgress.xp} XP to next level
                      </p>
                    </div>
                  </div>
                  <Progress value={levelInfo.progress_percentage} className="h-2" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{userProgress.badges_earned}</div>
                    <div className="text-xs text-muted-foreground">Badges</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{completedChallenges}</div>
                    <div className="text-xs text-muted-foreground">Challenges</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{userLeaderboardPosition > 0 ? `#${userLeaderboardPosition}` : 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{userProgress.total_xp_earned?.toLocaleString() || 0}</div>
                    <div className="text-xs text-muted-foreground">Total XP</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Active Challenges */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Flame className="mr-2 h-5 w-5 text-amber-500" />
                  Active Challenges
                </h2>
                {activeChallenges > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userChallenges
                      .filter(uc => uc.status === 'in_progress')
                      .slice(0, 3)
                      .map(userChallenge => (
                        <ChallengeCard 
                          key={userChallenge.id}
                          userChallenge={userChallenge}
                        />
                      ))}
                  </div>
                ) : (
                  <Card className="bg-muted/40">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Info className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No Active Challenges</h3>
                      <p className="text-muted-foreground text-center mt-2 max-w-md">
                        Start a new challenge to earn badges, XP, and climb the leaderboard.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.section>

              {/* Featured Challenges */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" />
                  Featured Challenges
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredChallenges.slice(0, 3).map(challenge => {
                    const userChallenge = userChallenges.find(
                      uc => uc.challenge_id === challenge.id
                    );
                    
                    return (
                      <ChallengeCard 
                        key={challenge.id}
                        challenge={challenge}
                        userChallenge={userChallenge}
                      />
                    );
                  })}
                </div>
              </motion.section>

              {/* Two Column Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Leaderboard Preview */}
                <motion.div 
                  className="md:col-span-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                    Weekly Leaderboard
                  </h2>
                  <Card>
                    <CardContent className="p-4">
                      <LeaderboardTable
                        data={leaderboard.slice(0, 5)}
                        currentUserId={userProgress?.user_id}
                        showViewAll={true}
                        onViewAll={() => setActiveTab("leaderboard")}
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-blue-500" />
                    Recent Activity
                  </h2>
                  <Card>
                    <CardContent className="p-4">
                      <ActivityFeed
                        activities={recentActivity}
                        className="max-h-[320px] overflow-auto"
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Challenges Tab */}
            <TabsContent value="challenges">
              <div className="space-y-8">
                {/* Active Challenges Section */}
                <section>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Flame className="mr-2 h-5 w-5 text-amber-500" />
                    Your Active Challenges
                  </h2>
                  {activeChallenges > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userChallenges
                        .filter(uc => uc.status === 'in_progress')
                        .map(userChallenge => (
                          <ChallengeCard 
                            key={userChallenge.id}
                            userChallenge={userChallenge}
                          />
                        ))}
                    </div>
                  ) : (
                    <Card className="bg-muted/40">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <Info className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No Active Challenges</h3>
                        <p className="text-muted-foreground text-center mt-2 max-w-md">
                          Start a new challenge from the available challenges below.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </section>

                {/* Completed Challenges */}
                <section>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    Completed Challenges
                  </h2>
                  {userChallenges.filter(uc => uc.status === 'completed').length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userChallenges
                        .filter(uc => uc.status === 'completed')
                        .map(userChallenge => (
                          <ChallengeCard 
                            key={userChallenge.id}
                            userChallenge={userChallenge}
                          />
                        ))}
                    </div>
                  ) : (
                    <Card className="bg-muted/40">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <Info className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No Completed Challenges Yet</h3>
                        <p className="text-muted-foreground text-center mt-2 max-w-md">
                          Complete challenges to earn badges, XP, and climb the leaderboard.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </section>

                {/* Available Challenges */}
                <section>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Target className="mr-2 h-5 w-5 text-blue-500" />
                    Available Challenges
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges
                      .filter(challenge => 
                        !userChallenges.some(uc => 
                          uc.challenge_id === challenge.id && 
                          (uc.status === 'in_progress' || uc.status === 'completed')
                        )
                      )
                      .map(challenge => (
                        <ChallengeCard 
                          key={challenge.id}
                          challenge={challenge}
                        />
                      ))}
                  </div>
                </section>
              </div>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard">
              <div className="space-y-6">
                <section>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                        Weekly Leaderboard
                      </CardTitle>
                      <CardDescription>
                        Top entrepreneurs ranked by XP earned this week
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LeaderboardTable
                        data={leaderboard}
                        currentUserId={userProgress?.user_id}
                        highlightUser
                      />
                    </CardContent>
                  </Card>
                </section>

                <section>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Medal className="mr-2 h-5 w-5 text-amber-400" />
                          Top Challenge Completers
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {leaderboard.slice(0, 5).map((entry, index) => (
                            <div 
                              key={entry.id} 
                              className={cn(
                                "flex items-center justify-between py-2",
                                index < 4 ? "border-b" : ""
                              )}
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 flex items-center justify-center font-semibold">
                                  {index + 1}
                                </div>
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs">
                                    {entry.avatar_url ? (
                                      <img 
                                        src={entry.avatar_url} 
                                        alt={entry.username} 
                                        className="w-8 h-8 rounded-full"
                                      />
                                    ) : (
                                      entry.username?.substring(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <div className="ml-2">
                                    <div className="text-sm font-medium">
                                      {entry.full_name || entry.username}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm font-medium">
                                {Math.floor(Math.random() * 15) + 1} challenges
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                          Biggest Weekly Gainers
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {leaderboard
                            .sort((a, b) => b.weekly_xp - a.weekly_xp)
                            .slice(0, 5)
                            .map((entry, index) => (
                              <div 
                                key={entry.id} 
                                className={cn(
                                  "flex items-center justify-between py-2",
                                  index < 4 ? "border-b" : ""
                                )}
                              >
                                <div className="flex items-center">
                                  <div className="w-8 h-8 flex items-center justify-center font-semibold">
                                    {index + 1}
                                  </div>
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs">
                                      {entry.avatar_url ? (
                                        <img 
                                          src={entry.avatar_url} 
                                          alt={entry.username} 
                                          className="w-8 h-8 rounded-full"
                                        />
                                      ) : (
                                        entry.username?.substring(0, 2).toUpperCase()
                                      )}
                                    </div>
                                    <div className="ml-2">
                                      <div className="text-sm font-medium">
                                        {entry.full_name || entry.username}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-green-500">
                                  +{entry.weekly_xp} XP
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <Award className="mr-2 h-5 w-5 text-blue-500" />
                          Most Badges Earned
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {leaderboard.slice(0, 5).map((entry, index) => (
                            <div 
                              key={entry.id} 
                              className={cn(
                                "flex items-center justify-between py-2",
                                index < 4 ? "border-b" : ""
                              )}
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 flex items-center justify-center font-semibold">
                                  {index + 1}
                                </div>
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs">
                                    {entry.avatar_url ? (
                                      <img 
                                        src={entry.avatar_url} 
                                        alt={entry.username} 
                                        className="w-8 h-8 rounded-full"
                                      />
                                    ) : (
                                      entry.username?.substring(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <div className="ml-2">
                                    <div className="text-sm font-medium">
                                      {entry.full_name || entry.username}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm font-medium">
                                {Math.floor(Math.random() * 10) + 1} badges
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              </div>
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges">
              <div className="space-y-8">
                {/* Earned Badges */}
                <section>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Award className="mr-2 h-5 w-5 text-yellow-500" />
                    Your Badges
                  </h2>
                  <BadgeGrid />
                </section>

                {/* Badge Categories */}
                <section>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Gift className="mr-2 h-5 w-5 text-blue-500" />
                    Badge Categories
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { name: "Onboarding", icon: <Users className="h-8 w-8 text-blue-500" />, count: "3 badges" },
                      { name: "Participation", icon: <Calendar className="h-8 w-8 text-green-500" />, count: "4 badges" },
                      { name: "Community", icon: <MessageSquare className="h-8 w-8 text-purple-500" />, count: "5 badges" },
                      { name: "Achievement", icon: <Trophy className="h-8 w-8 text-amber-500" />, count: "6 badges" },
                      { name: "Mentorship", icon: <Star className="h-8 w-8 text-red-500" />, count: "3 badges" },
                      { name: "Analytics", icon: <BarChart2 className="h-8 w-8 text-cyan-500" />, count: "4 badges" },
                    ].map((category, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="flex items-center p-6 gap-4">
                          <div className="rounded-full p-3 bg-muted/50">
                            {category.icon}
                          </div>
                          <div>
                            <h3 className="font-medium">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">{category.count}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
