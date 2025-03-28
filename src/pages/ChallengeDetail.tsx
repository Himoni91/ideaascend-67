
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  AlertCircle,
  Award, 
  Calendar, 
  ChevronLeft, 
  Clock,
  Gift, 
  Info, 
  Lock,
  Play, 
  Star, 
  Target, 
  Trophy,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";
import { useAscendContext } from "@/contexts/AscendContext";
import { useChallenge } from "@/hooks/use-challenge";
import { cn } from "@/lib/utils";

export default function ChallengeDetail() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { challenges, userChallenges, loading } = useAscendContext();
  const { startChallenge, updateChallengeProgress, abandonChallenge, isLoading: actionLoading } = useChallenge();
  const [isStartingChallenge, setIsStartingChallenge] = useState(false);

  // Find the challenge and user challenge data
  const challenge = challenges.find(c => c.id === challengeId);
  const userChallenge = userChallenges.find(uc => uc.challenge_id === challengeId);

  // Calculate progress percentage if user has started this challenge
  const progressPercentage = userChallenge ? 
    Math.min(100, Math.round(Object.keys(userChallenge.progress || {}).length / 
    Object.keys(challenge?.requirements || {}).length * 100)) || 0 : 0;

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-500";
      case "intermediate": return "text-blue-500";
      case "advanced": return "text-amber-500";
      case "expert": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "onboarding": return <Calendar className="h-5 w-5" />;
      case "participation": return <Calendar className="h-5 w-5" />;
      case "community": return <Calendar className="h-5 w-5" />;
      case "networking": return <Calendar className="h-5 w-5" />;
      case "mentorship": return <Star className="h-5 w-5" />;
      case "engagement": return <Clock className="h-5 w-5" />;
      case "achievement": return <Trophy className="h-5 w-5" />;
      case "growth": return <Target className="h-5 w-5" />;
      case "creativity": return <Target className="h-5 w-5" />;
      case "recognition": return <Award className="h-5 w-5" />;
      default: return <Gift className="h-5 w-5" />;
    }
  };

  const handleStartChallenge = async () => {
    if (!challenge || !challengeId) return;
    
    setIsStartingChallenge(true);
    const result = await startChallenge(challengeId);
    setIsStartingChallenge(false);
    
    if (result) {
      toast.success("Challenge started successfully!");
    }
  };

  const handleAbandonChallenge = async () => {
    if (!userChallenge) return;
    
    const confirmed = window.confirm("Are you sure you want to abandon this challenge? Your progress will be lost.");
    if (!confirmed) return;
    
    const result = await abandonChallenge(userChallenge.id);
    if (result) {
      toast.success("Challenge abandoned");
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="max-w-3xl mx-auto px-4 py-8">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-64 w-full mb-8" />
            <Skeleton className="h-12 w-full mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  if (!challenge) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="max-w-3xl mx-auto px-4 py-8">
            <Button variant="ghost" className="mb-6" onClick={() => navigate("/ascend")}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Ascend
            </Button>
            
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Challenge Not Found</h2>
                <p className="text-muted-foreground text-center mb-6">
                  The challenge you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => navigate("/ascend")}>
                  Return to Ascend
                </Button>
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  const isCompleted = userChallenge?.status === "completed";
  const isInProgress = userChallenge?.status === "in_progress";
  const canStart = !isCompleted && !isInProgress;

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/ascend")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Ascend
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getCategoryIcon(challenge.category)}
                    <span className="capitalize">{challenge.category}</span>
                  </Badge>
                  {challenge.is_featured && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{challenge.title}</CardTitle>
                <CardDescription>{challenge.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">XP Reward</div>
                    <div className="text-lg font-medium flex items-center gap-1">
                      <Gift className="h-4 w-4 text-primary" />
                      {challenge.xp_reward} XP
                    </div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Difficulty</div>
                    <div className={`text-lg font-medium capitalize flex items-center gap-1 ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="text-lg font-medium flex items-center gap-1">
                      {isCompleted ? (
                        <span className="text-green-500 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </span>
                      ) : isInProgress ? (
                        <span className="text-amber-500 flex items-center">
                          <Play className="h-4 w-4 mr-1" />
                          In Progress
                        </span>
                      ) : (
                        <span className="text-muted-foreground flex items-center">
                          <Lock className="h-4 w-4 mr-1" />
                          Not Started
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Created</div>
                    <div className="text-lg font-medium">
                      {format(new Date(challenge.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                
                {(isInProgress || isCompleted) && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    {isInProgress && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {userChallenge && userChallenge.started_at && (
                          <span>Started on {format(new Date(userChallenge.started_at), 'MMMM d, yyyy')}</span>
                        )}
                      </div>
                    )}
                    {isCompleted && userChallenge?.completed_at && (
                      <div className="text-xs text-green-500 mt-2">
                        Completed on {format(new Date(userChallenge.completed_at), 'MMMM d, yyyy')}
                      </div>
                    )}
                  </div>
                )}
                
                <Alert className="bg-muted/50 border-primary/20">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Challenge Requirements</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 space-y-2">
                      {Object.entries(challenge.requirements || {}).map(([key, value]) => {
                        const isRequirementMet = userChallenge?.progress && 
                          key in userChallenge.progress && 
                          userChallenge.progress[key] >= value;
                          
                        return (
                          <li 
                            key={key} 
                            className={cn(
                              "flex items-center justify-between",
                              isRequirementMet ? "text-green-500" : ""
                            )}
                          >
                            <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-medium">
                              {isRequirementMet && <CheckCircle className="inline-block h-4 w-4 mr-1" />}
                              {userChallenge?.progress?.[key] || 0} / {value}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                {isCompleted ? (
                  <Button variant="outline" className="w-full" disabled>
                    <Trophy className="mr-2 h-4 w-4 text-amber-500" />
                    Challenge Completed
                  </Button>
                ) : isInProgress ? (
                  <div className="w-full flex gap-4">
                    <Button variant="outline" className="flex-1" onClick={handleAbandonChallenge} disabled={actionLoading}>
                      Abandon Challenge
                    </Button>
                    <Button className="flex-1" disabled>
                      <Play className="mr-2 h-4 w-4" />
                      In Progress
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={handleStartChallenge}
                    disabled={isStartingChallenge || actionLoading}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Challenge
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-4">How to Complete</h2>
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Step 1: Start the Challenge</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the "Start Challenge" button to begin tracking your progress.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2">Step 2: Complete Requirements</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete all the requirements listed above. The system will automatically track your progress
                      as you use the platform.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2">Step 3: Earn Rewards</h3>
                    <p className="text-sm text-muted-foreground">
                      Once all requirements are met, you'll automatically receive the XP reward and any associated badges.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-4">Tips & Resources</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Challenge Tips</h3>
                    <p className="text-sm text-muted-foreground">
                      This challenge is designed to help you {challenge.category === 'onboarding' ? 'get familiar with the platform' : `improve your ${challenge.category} skills`}. 
                      Focus on quality over quantity for the best results.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Related Resources</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Check out the Help section for detailed guides</li>
                      <li>Connect with other users for collaboration</li>
                      <li>Visit the community forum for discussions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
