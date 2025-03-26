
import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Lock, ChevronRight, Star, Trophy, Target, Zap, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";

const Achievements = () => {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();
  const [activeTab, setActiveTab] = useState("badges");
  
  // Mock badges data
  const allBadges = [
    { name: "First Post", icon: "📝", description: "Published your first post on Idolyst", category: "Contributor", earned: true, date: "2023-07-12" },
    { name: "Idea Maker", icon: "💡", description: "Submitted your first idea to PitchHub", category: "Innovator", earned: true, date: "2023-07-15" },
    { name: "Connector", icon: "🔗", description: "Connected with 10+ other members", category: "Networker", earned: true, date: "2023-08-05" },
    { name: "Rising Star", icon: "⭐", description: "Reached level 5 on the platform", category: "Progress", earned: false },
    { name: "Thought Leader", icon: "🧠", description: "Had a post with 50+ likes", category: "Contributor", earned: false },
    { name: "Innovator", icon: "🚀", description: "Had a PitchHub idea with 100+ votes", category: "Innovator", earned: false },
    { name: "Mentor", icon: "👨‍🏫", description: "Conducted 5+ mentoring sessions", category: "Mentor", earned: false },
    { name: "Verified Pro", icon: "✅", description: "Verified professional status", category: "Profile", earned: true, date: "2023-08-10" },
    { name: "First Follower", icon: "👤", description: "Someone followed you for the first time", category: "Networker", earned: true, date: "2023-07-18" },
    { name: "Feedback Guru", icon: "💬", description: "Provided feedback on 10+ ideas", category: "Contributor", earned: false },
    { name: "Community Pillar", icon: "🏛️", description: "Been a member for 6 months", category: "Progress", earned: false },
    { name: "Content Creator", icon: "✍️", description: "Posted 20+ times", category: "Contributor", earned: false },
  ];
  
  // Challenges data
  const challenges = [
    { 
      id: 1,
      title: "Conversation Starter",
      description: "Post 3 times in one week",
      progress: 2,
      target: 3,
      xp: 50,
      icon: <Users className="h-6 w-6" />,
      deadline: "2 days left"
    },
    { 
      id: 2,
      title: "Idea Machine",
      description: "Submit 2 ideas to PitchHub",
      progress: 1,
      target: 2,
      xp: 100,
      icon: <Zap className="h-6 w-6" />,
      deadline: "5 days left"
    },
    { 
      id: 3,
      title: "Networking Pro",
      description: "Follow 10 new people in your industry",
      progress: 4,
      target: 10,
      xp: 75,
      icon: <Users className="h-6 w-6" />,
      deadline: "1 week left"
    },
  ];
  
  // Leaderboard data
  const leaderboard = [
    { rank: 1, name: "Sarah Johnson", avatar: "", points: 1245, isCurrent: false },
    { rank: 2, name: "Michael Chen", avatar: "", points: 1120, isCurrent: false },
    { rank: 3, name: "Alex Rivera", avatar: "", points: 980, isCurrent: false },
    { rank: 4, name: "Jessica Lee", avatar: "", points: 875, isCurrent: false },
    { rank: 5, name: "David Wilson", avatar: "", points: 810, isCurrent: true },
    { rank: 6, name: "Lisa Park", avatar: "", points: 750, isCurrent: false },
    { rank: 7, name: "Robert Garcia", avatar: "", points: 690, isCurrent: false },
    { rank: 8, name: "Emma Thompson", avatar: "", points: 645, isCurrent: false },
    { rank: 9, name: "James Kim", avatar: "", points: 580, isCurrent: false },
    { rank: 10, name: "Olivia Martinez", avatar: "", points: 520, isCurrent: false },
  ];
  
  // Level progress
  const currentLevel = profile?.level || 1;
  const nextLevel = currentLevel + 1;
  const xpForNextLevel = 1000;
  const currentXP = profile?.xp || 0;
  const xpProgress = (currentXP % xpForNextLevel) / xpForNextLevel * 100;
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Award className="mr-3 h-7 w-7 text-idolyst-blue" />
            Ascend
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Track your progress, earn badges, complete challenges, and climb the leaderboard.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
            <Tabs defaultValue="badges" onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
                <TabsTrigger value="badges">
                  <Award className="mr-2 h-4 w-4" />
                  Badges
                </TabsTrigger>
                <TabsTrigger value="challenges">
                  <Target className="mr-2 h-4 w-4" />
                  Challenges
                </TabsTrigger>
                <TabsTrigger value="leaderboard">
                  <Trophy className="mr-2 h-4 w-4" />
                  Leaderboard
                </TabsTrigger>
              </TabsList>
              
              {/* Badges Tab */}
              <TabsContent value="badges">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl">Your Progress</CardTitle>
                    <CardDescription>
                      Level up your profile by earning XP through platform activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-lg font-bold">Level {currentLevel}</span>
                        <span className="text-sm text-muted-foreground ml-2">({currentXP} XP)</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {xpForNextLevel - (currentXP % xpForNextLevel)} XP to Level {nextLevel}
                      </div>
                    </div>
                    <Progress value={xpProgress} className="h-2" />
                    
                    <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{allBadges.filter(b => b.earned).length}</div>
                        <div className="text-sm text-muted-foreground">Badges Earned</div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{allBadges.length}</div>
                        <div className="text-sm text-muted-foreground">Total Badges</div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{Math.round(currentXP / 10)}</div>
                        <div className="text-sm text-muted-foreground">Activities</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold">Your Badges</h2>
                  <Badge variant="outline" className="font-normal">
                    {allBadges.filter(b => b.earned).length}/{allBadges.length}
                  </Badge>
                </div>
                
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {allBadges.map((badge) => (
                    <motion.div key={badge.name} variants={itemVariants}>
                      <Card className={`hover:shadow-md transition-all ${!badge.earned && 'opacity-60'}`}>
                        <CardHeader className="pb-2 pt-4 text-center">
                          <div className="text-4xl mb-2 mx-auto">{badge.icon}</div>
                          <CardTitle className="text-base flex items-center justify-center">
                            {badge.name}
                            {!badge.earned && <Lock className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" />}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {badge.category}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pt-0 pb-4">
                          <p className="text-xs text-muted-foreground mb-3 px-2">
                            {badge.description}
                          </p>
                          {badge.earned ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                              Earned on {badge.date}
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Not yet earned
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
              
              {/* Challenges Tab */}
              <TabsContent value="challenges">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl">Active Challenges</CardTitle>
                    <CardDescription>
                      Complete these challenges to earn XP and level up
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <motion.div 
                      className="space-y-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      {challenges.map((challenge) => (
                        <motion.div key={challenge.id} variants={itemVariants}>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-start">
                                <div className="bg-primary/10 p-3 rounded-full mr-4">
                                  {challenge.icon}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h3 className="font-medium">{challenge.title}</h3>
                                      <p className="text-sm text-muted-foreground">
                                        {challenge.description}
                                      </p>
                                    </div>
                                    <Badge variant="outline">+{challenge.xp} XP</Badge>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>{challenge.progress} of {challenge.target} completed</span>
                                      <span className="text-muted-foreground">{challenge.deadline}</span>
                                    </div>
                                    <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                      
                      <Button variant="outline" className="w-full">
                        View More Challenges
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Completed Challenges</CardTitle>
                    <CardDescription>
                      Challenges you've successfully completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                        <h3 className="text-lg font-medium mb-1">No completed challenges yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Work on your active challenges to see them completed here
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Leaderboard Tab */}
              <TabsContent value="leaderboard">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl">Weekly Leaderboard</CardTitle>
                        <CardDescription>
                          Top performers this week based on XP earned
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Star className="mr-2 h-4 w-4" />
                        Your Rank: {leaderboard.find(user => user.isCurrent)?.rank || "-"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <motion.div 
                      className="space-y-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      {leaderboard.map((user) => (
                        <motion.div 
                          key={user.rank} 
                          variants={itemVariants}
                          className={`${user.isCurrent ? 'bg-primary/5 border-primary/20 border rounded-lg' : ''}`}
                        >
                          <div className="flex items-center p-3">
                            <div className="w-8 text-center font-bold">
                              {user.rank}.
                            </div>
                            <div className="flex-1 flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium mr-3">
                                {user.name.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">
                                  {user.name} {user.isCurrent && <span className="text-xs text-muted-foreground">(You)</span>}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Level {Math.floor(user.points / 250) + 1}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{user.points}</div>
                                <div className="text-xs text-muted-foreground">points</div>
                              </div>
                              <ChevronRight className="ml-2 h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      <Button variant="outline" className="w-full">
                        View Full Leaderboard
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Achievements;
