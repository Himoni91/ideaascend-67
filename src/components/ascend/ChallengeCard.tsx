
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Challenge, UserChallenge } from "@/types/ascend";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle,
  Clock,
  Gift,
  Lock,
  Play,
  Star,
  Trophy,
  Users,
  MessageSquare,
  Target,
  Award,
  Flame
} from "lucide-react";

interface ChallengeCardProps {
  challenge?: Challenge;
  userChallenge?: UserChallenge;
}

export function ChallengeCard({ challenge: propChallenge, userChallenge }: ChallengeCardProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Use either the challenge from userChallenge or the prop
  const challenge = userChallenge?.challenge || propChallenge;
  
  if (!challenge) return null;
  
  // Calculate progress if user has started this challenge
  const progressPercentage = userChallenge ? 
    Math.min(100, Math.round(Object.keys(userChallenge.progress || {}).length / 
      Object.keys(challenge.requirements || {}).length * 100)) || 0 : 0;
  
  // Get appropriate icon for challenge category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "onboarding": return <Users className="h-5 w-5" />;
      case "participation": return <Calendar className="h-5 w-5" />;
      case "community": return <MessageSquare className="h-5 w-5" />;
      case "networking": return <Users className="h-5 w-5" />;
      case "mentorship": return <Star className="h-5 w-5" />;
      case "engagement": return <Clock className="h-5 w-5" />;
      case "achievement": return <Trophy className="h-5 w-5" />;
      case "growth": return <Flame className="h-5 w-5" />;
      case "creativity": return <Target className="h-5 w-5" />;
      case "recognition": return <Award className="h-5 w-5" />;
      default: return <Gift className="h-5 w-5" />;
    }
  };
  
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
  
  // Start challenge handler
  const handleStartChallenge = async () => {
    if (!user || !challenge) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_challenges")
        .insert({
          user_id: user.id,
          challenge_id: challenge.id,
          status: "in_progress",
          progress: {}
        })
        .select("*")
        .single();
        
      if (error) throw error;
      
      toast.success("Challenge started successfully!");
    } catch (error) {
      console.error("Error starting challenge:", error);
      toast.error("Failed to start challenge. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine card status and actions
  const isCompleted = userChallenge?.status === "completed";
  const isInProgress = userChallenge?.status === "in_progress";
  const canStart = !isCompleted && !isInProgress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
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
          <CardTitle className="text-lg">{challenge.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground mb-4">
            {challenge.description}
          </p>
          
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-1">
              <Gift className="h-4 w-4 text-primary" />
              <span>{challenge.xp_reward} XP</span>
            </div>
            <div className={`flex items-center gap-1 ${getDifficultyColor(challenge.difficulty)}`}>
              <span className="capitalize">{challenge.difficulty}</span>
            </div>
          </div>
          
          {(isInProgress || isCompleted) && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2">
          {isCompleted ? (
            <Button variant="ghost" className="w-full" disabled>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Completed
            </Button>
          ) : isInProgress ? (
            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
              <span className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                Started {format(new Date(userChallenge.started_at), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center">
                <Trophy className="mr-1 h-4 w-4" />
                {userChallenge.xp_earned || 0} / {challenge.xp_reward} XP
              </span>
            </div>
          ) : (
            <Button 
              className="w-full" 
              onClick={handleStartChallenge}
              disabled={isLoading}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Challenge
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
