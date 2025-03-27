
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Medal, Trophy, Award, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pitch } from "@/types/pitch";
import { cn } from "@/lib/utils";

interface PitchLeaderboardProps {
  pitches: Pitch[];
  isLoading: boolean;
  title?: string;
  subtitle?: string; 
}

export default function PitchLeaderboard({
  pitches,
  isLoading,
  title = "Top Ideas",
  subtitle = "The most popular ideas this week"
}: PitchLeaderboardProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-700" />;
      default:
        return <Award className="h-5 w-5 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-6" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pitches.length === 0 ? (
          <div className="text-center py-6">
            <Flame className="mx-auto h-10 w-10 text-muted-foreground opacity-20 mb-2" />
            <p className="text-sm text-muted-foreground">No ideas to display</p>
          </div>
        ) : (
          pitches.map((pitch, index) => (
            <motion.div
              key={pitch.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-3 p-2 -mx-2 rounded-md transition-colors",
                "hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-full text-xs font-medium",
                index < 3 ? "bg-primary/10" : "bg-muted"
              )}>
                {getRankIcon(index)}
              </div>
              
              <div className="flex-1 min-w-0">
                <Link to={`/pitch-hub/${pitch.id}`} className="block">
                  <h4 className="font-medium text-sm truncate hover:text-primary transition-colors">
                    {pitch.title}
                  </h4>
                  <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                    <span className="truncate mr-2">by {pitch.author?.full_name || pitch.author?.username || "Anonymous"}</span>
                    <Badge variant="outline" className="text-xs py-0 h-5">
                      {pitch.votes_count} votes
                    </Badge>
                  </div>
                </Link>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                asChild
              >
                <Link to={`/pitch-hub/${pitch.id}`}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">View idea</span>
                </Link>
              </Button>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
