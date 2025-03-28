
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, MessageSquare, Eye, Star, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Pitch } from '@/types/pitch';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface PitchCardProps {
  pitch: Pitch;
  onVote?: (voteType: 'up' | 'down') => void;
}

export default function PitchCard({ pitch, onVote }: PitchCardProps) {
  const navigate = useNavigate();
  
  const handleViewPitch = () => {
    navigate(`/pitch-hub/${pitch.id}`);
  };
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full overflow-hidden flex flex-col">
        <CardContent className="p-4 md:p-6 flex-grow">
          <div className="flex justify-between items-start gap-2 mb-3">
            <Badge variant="outline" className="font-normal">
              {pitch.category}
            </Badge>
            <div className="flex gap-1">
              {pitch.trending_score > 50 && (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800 flex items-center gap-1">
                  <Rocket className="h-3 w-3" />
                  <span className="sr-only md:not-sr-only md:inline-block">Trending</span>
                </Badge>
              )}
              {pitch.is_premium && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  <span className="sr-only md:not-sr-only md:inline-block">Premium</span>
                </Badge>
              )}
            </div>
          </div>
          
          <h3 
            className="font-semibold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
            onClick={handleViewPitch}
          >
            {pitch.title}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={pitch.author?.avatar_url || undefined} alt={pitch.author?.username || 'User'} />
              <AvatarFallback>{pitch.author?.username?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-sm text-muted-foreground">
              {pitch.author?.username || 'Anonymous'}
              <span className="inline-block mx-1">•</span>
              {formatDistanceToNow(new Date(pitch.created_at), { addSuffix: true })}
            </div>
          </div>
          
          <p 
            className="text-sm text-muted-foreground line-clamp-3 mb-3 cursor-pointer"
            onClick={handleViewPitch}
          >
            {pitch.problem_statement}
          </p>
          
          {pitch.tags && pitch.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {pitch.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))}
              {pitch.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs font-normal">
                  +{pitch.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="px-4 md:px-6 py-4 flex justify-between items-center border-t">
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className={`px-2 ${pitch.user_vote === 'up' ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => onVote?.('up')}
              >
                <ArrowUp className={`h-4 w-4 ${pitch.user_vote === 'up' && 'fill-current'}`} />
              </Button>
              <span className="text-sm font-medium">
                {pitch.votes_count}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className={`px-2 ${pitch.user_vote === 'down' ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => onVote?.('down')}
              >
                <ArrowDown className={`h-4 w-4 ${pitch.user_vote === 'down' && 'fill-current'}`} />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-muted-foreground text-sm">
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{pitch.comments_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{Math.floor(pitch.trending_score / 5)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
