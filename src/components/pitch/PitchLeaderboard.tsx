
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ThumbsUp, Star, Trophy, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Pitch } from "@/types/pitch";

interface PitchLeaderboardProps {
  pitches: Pitch[];
  isLoading: boolean;
  title?: string;
  subtitle?: string;
  limit?: number;
}

export default function PitchLeaderboard({ pitches, isLoading, title = "Top Ideas This Week", subtitle, limit = 5 }: PitchLeaderboardProps) {
  const navigate = useNavigate();
  
  const topPitches = useMemo(() => {
    // Sort by votes and then by trending score
    return [...pitches]
      .sort((a, b) => {
        // First by votes
        if (b.votes_count !== a.votes_count) {
          return b.votes_count - a.votes_count;
        }
        // Then by trending score
        return b.trending_score - a.trending_score;
      })
      .slice(0, limit);
  }, [pitches, limit]);
  
  const getPlacementColor = (index: number) => {
    switch (index) {
      case 0: return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case 1: return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300";
      case 2: return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{title}</CardTitle>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center p-4 gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topPitches.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{title}</CardTitle>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
        <CardContent className="py-8 flex flex-col items-center justify-center">
          <Trophy className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-center">No ideas to rank yet!</p>
          <p className="text-sm text-muted-foreground text-center">
            Submit your pitch to be the first on the leaderboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {topPitches.map((pitch, index) => (
            <motion.div
              key={pitch.id}
              className="flex items-center p-4 hover:bg-muted/50 cursor-pointer"
              whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
              onClick={() => navigate(`/pitch-hub/${pitch.id}`)}
            >
              <div className={`flex items-center justify-center h-8 w-8 rounded-full font-semibold text-sm mr-3 ${getPlacementColor(index)}`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <h4 className="font-medium text-sm truncate">{pitch.title}</h4>
                  <Badge variant="outline" size="sm" className="ml-2 text-xs">
                    {pitch.category}
                  </Badge>
                </div>
                <div className="flex items-center mt-1">
                  <Avatar className="h-5 w-5 mr-1.5">
                    <AvatarImage src={pitch.author?.avatar_url || undefined} alt={pitch.author?.full_name || "User"} />
                    <AvatarFallback>{pitch.author?.full_name?.[0] || pitch.author?.username?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">
                    {pitch.author?.full_name || pitch.author?.username}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <ThumbsUp className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span className="text-sm">{pitch.votes_count}</span>
                </div>
                {pitch.mentor_reviews_count > 0 && (
                  <div className="flex items-center">
                    <Star className="h-3.5 w-3.5 mr-1 text-amber-500" />
                    <span className="text-sm">{pitch.mentor_reviews_count}</span>
                  </div>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <button
          className="text-sm text-primary hover:underline w-full text-center"
          onClick={() => navigate("/pitch-hub")}
        >
          View all ideas
        </button>
      </CardFooter>
    </Card>
  );
}
