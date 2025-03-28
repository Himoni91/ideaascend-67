
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight, Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Pitch } from '@/types/pitch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface PitchLeaderboardProps {
  pitches: Pitch[];
  isLoading: boolean;
  title: string;
  subtitle?: string;
}

export default function PitchLeaderboard({
  pitches,
  isLoading,
  title,
  subtitle
}: PitchLeaderboardProps) {
  const navigate = useNavigate();
  
  const handleViewPitch = (id: string) => {
    navigate(`/pitch-hub/${id}`);
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          {title}
        </CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="font-bold text-muted-foreground min-w-[24px] text-center">
                  #{i + 1}
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        ) : pitches.length === 0 ? (
          <div className="text-center py-6">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No ideas found</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {pitches.map((pitch, index) => (
              <motion.li
                key={pitch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors ${
                  index === 0 ? 'bg-amber-50 dark:bg-amber-950/20' : ''
                }`}
              >
                <div className={`font-bold min-w-[24px] text-center flex-shrink-0 mt-1 ${
                  index === 0 
                    ? 'text-amber-500' 
                    : index === 1 
                      ? 'text-zinc-500' 
                      : index === 2 
                        ? 'text-amber-800' 
                        : 'text-muted-foreground'
                }`}>
                  #{index + 1}
                </div>
                <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                  <AvatarImage 
                    src={pitch.author?.avatar_url || undefined} 
                    alt={pitch.author?.username || "User"} 
                  />
                  <AvatarFallback>{pitch.author?.username?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div 
                    className="font-medium truncate cursor-pointer hover:text-primary"
                    onClick={() => handleViewPitch(pitch.id)}
                  >
                    {pitch.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{pitch.author?.username || "Anonymous"}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(pitch.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => handleViewPitch(pitch.id)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.li>
            ))}
          </ul>
        )}
        
        {pitches.length > 0 && (
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => navigate("/pitch-hub")}
            >
              View All Ideas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
