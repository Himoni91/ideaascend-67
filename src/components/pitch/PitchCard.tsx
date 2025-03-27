
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ArrowUp, ArrowDown, MessageSquare, Star, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pitch } from "@/types/pitch";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface PitchCardProps {
  pitch: Pitch;
  onVote?: (voteType: 'up' | 'down') => void;
  compact?: boolean;
}

export default function PitchCard({ pitch, onVote, compact = false }: PitchCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const formattedDate = pitch.created_at 
    ? formatDistanceToNow(new Date(pitch.created_at), { addSuffix: true }) 
    : "";
    
  // Use problem_statement or description based on what's available
  const problemText = pitch.problem_statement || pitch.description || "";
  const truncatedProblem = problemText.length > 150
    ? `${problemText.substring(0, 150)}...`
    : problemText;
    
  const handleVote = (e: React.MouseEvent, voteType: 'up' | 'down') => {
    e.stopPropagation(); // Prevent card click
    
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }
    
    if (onVote) {
      onVote(voteType);
    }
  };
  
  const cardVariants = {
    hover: { y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" },
    initial: { y: 0, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" }
  };

  const handleCardClick = () => {
    navigate(`/pitch-hub/${pitch.id}`);
  };
  
  if (compact) {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        transition={{ duration: 0.3 }}
        onClick={handleCardClick}
        className="cursor-pointer"
      >
        <Card className="overflow-hidden h-full">
          <CardContent className="p-4">
            <div className="mb-1.5 flex items-center justify-between">
              <Badge variant="outline" className="font-normal">
                {pitch.category}
              </Badge>
              {pitch.is_premium && (
                <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                  <Star className="mr-1 h-3 w-3" /> Premium
                </Badge>
              )}
            </div>
            <h3 className="text-base font-medium mb-1 line-clamp-1">
              {pitch.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {truncatedProblem}
            </p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <Avatar className="h-5 w-5 mr-1.5">
                  <AvatarImage src={pitch.author?.avatar_url || undefined} alt={pitch.author?.full_name || "User"} />
                  <AvatarFallback>{pitch.author?.full_name?.[0] || pitch.author?.username?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground">
                  {pitch.author?.full_name || pitch.author?.username || "Anonymous"}
                </span>
              </div>
              <span className="text-muted-foreground">{formattedDate}</span>
            </div>
          </CardContent>
          <CardFooter className="p-3 pt-0 flex justify-between items-center border-t">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <ArrowUp className={cn(
                  "h-3.5 w-3.5 mr-1",
                  pitch.user_vote === 'up' ? "text-primary fill-primary" : "text-muted-foreground"
                )} />
                <span className="text-xs">{pitch.votes_count}</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span className="text-xs">{pitch.comments_count}</span>
              </div>
            </div>
            <div className="flex items-center">
              {pitch.mentor_reviews_count > 0 && (
                <Badge variant="outline" className="text-xs py-0 h-5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <Star className="h-3 w-3 mr-1" />
                  {pitch.mentor_reviews_count}
                </Badge>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden h-full">
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <Avatar className="h-9 w-9 mr-2">
                <AvatarImage src={pitch.author?.avatar_url || undefined} alt={pitch.author?.full_name || "User"} />
                <AvatarFallback>{pitch.author?.full_name?.[0] || pitch.author?.username?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {pitch.author?.full_name || pitch.author?.username || "Anonymous"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formattedDate}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {pitch.is_premium && (
                <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                  <Star className="mr-1 h-3 w-3" /> Premium
                </Badge>
              )}
              <Badge variant="outline" className="font-normal">
                {pitch.category}
              </Badge>
            </div>
          </div>
          
          <h3 className="text-xl font-medium mb-2">
            {pitch.title}
          </h3>
          
          <p className="text-muted-foreground mb-4">
            {truncatedProblem}
          </p>
          
          {pitch.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {pitch.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-secondary/40 hover:bg-secondary/60">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {pitch.media_url && pitch.media_type?.includes('image') && (
            <div className="mt-3 rounded-md overflow-hidden">
              <img 
                src={pitch.media_url} 
                alt={pitch.title} 
                className="w-full h-auto max-h-[200px] object-cover" 
              />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 bg-muted/30 border-t flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Button
                variant={pitch.user_vote === 'up' ? "default" : "ghost"} 
                size="sm"
                className={cn(
                  "h-8 px-2",
                  pitch.user_vote === 'up' && "bg-primary/90 hover:bg-primary/80"
                )}
                onClick={(e) => handleVote(e, 'up')}
              >
                <ArrowUp className={cn(
                  "h-4 w-4 mr-1.5",
                  pitch.user_vote === 'up' && "fill-primary-foreground"
                )} />
                <span>{pitch.votes_count}</span>
              </Button>
              
              <Button
                variant={pitch.user_vote === 'down' ? "default" : "ghost"} 
                size="sm"
                className={cn(
                  "h-8 px-2",
                  pitch.user_vote === 'down' && "bg-primary/90 hover:bg-primary/80"
                )}
                onClick={(e) => handleVote(e, 'down')}
              >
                <ArrowDown className={cn(
                  "h-4 w-4",
                  pitch.user_vote === 'down' && "fill-primary-foreground"
                )} />
              </Button>
            </div>
            
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1.5 text-muted-foreground" />
              <span className="text-sm">{pitch.comments_count} Feedback</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {pitch.trending_score > 50 && (
              <Badge className="bg-orange-500 hover:bg-orange-600">
                <Rocket className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
            
            {pitch.mentor_reviews_count > 0 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <Star className="h-3.5 w-3.5 mr-1" />
                {pitch.mentor_reviews_count} Reviews
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
