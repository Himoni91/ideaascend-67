
import { Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Pitch } from "@/types/pitch";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface PitchLeaderboardProps {
  pitches: Pitch[];
  isLoading: boolean;
  title: string;
  subtitle: string;
}

export default function PitchLeaderboard({
  pitches,
  isLoading,
  title,
  subtitle
}: PitchLeaderboardProps) {
  const navigate = useNavigate();

  const handleClick = (pitchId: string) => {
    navigate(`/pitch-hub/${pitchId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : pitches.length === 0 ? (
          <div className="py-3 text-center text-muted-foreground">
            No ideas available
          </div>
        ) : (
          <div className="space-y-4">
            {pitches.map((pitch, index) => (
              <motion.div
                key={pitch.id}
                className="group cursor-pointer"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleClick(pitch.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 relative">
                    <Avatar>
                      <AvatarImage 
                        src={pitch.author?.avatar_url || undefined} 
                        alt={pitch.author?.full_name || "User"} 
                      />
                      <AvatarFallback>
                        {pitch.author?.full_name?.[0] || pitch.author?.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-medium">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                        {pitch.title}
                      </h3>
                      <div className="flex gap-1">
                        {pitch.is_premium && (
                          <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
                      <span>
                        {pitch.votes_count} {pitch.votes_count === 1 ? 'vote' : 'votes'}
                      </span>
                      <span>•</span>
                      <span className="line-clamp-1">
                        {formatDistanceToNow(new Date(pitch.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                {index < pitches.length - 1 && (
                  <div className="border-b mt-4" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
