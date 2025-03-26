
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Poll } from "@/types/post";
import { usePolls } from "@/hooks/use-polls";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, Clock, Vote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

interface PostPollProps {
  postId: string;
  className?: string;
}

export default function PostPoll({ postId, className }: PostPollProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { poll, isLoading, voteOnPoll } = usePolls(postId);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  
  if (isLoading) {
    return (
      <Card className={cn("mt-3", className)}>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-muted animate-pulse rounded"></div>
            <div className="space-y-2 mt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!poll) return null;
  
  const hasExpired = poll.expires_at ? new Date(poll.expires_at) < new Date() : false;
  const hasVoted = poll.options.some(option => option.has_voted);
  const totalVotes = poll.total_votes || 0;
  
  const handleOptionClick = (optionId: string) => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }
    
    if (hasVoted && !poll.is_multiple_choice) return;
    if (hasExpired) return;
    
    if (poll.is_multiple_choice) {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    } else {
      voteOnPoll({ optionId });
    }
  };
  
  const handleSubmitVotes = () => {
    if (selectedOptions.length === 0) return;
    
    // Vote on each selected option
    selectedOptions.forEach(optionId => {
      voteOnPoll({ optionId });
    });
    
    // Clear selections
    setSelectedOptions([]);
  };
  
  // Calculate which users can see results
  const canSeeResults = user || hasVoted || hasExpired;
  
  return (
    <Card className={cn("mt-3 overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Vote className="h-4 w-4 text-primary" />
            <h3 className="font-medium">{poll.question}</h3>
          </div>
          
          {poll.expires_at && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {hasExpired ? (
                "Poll ended"
              ) : (
                `Ends ${formatDistanceToNow(new Date(poll.expires_at), { addSuffix: true })}`
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {poll.options.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.votes_count || 0) / totalVotes * 100) : 0;
            const isSelected = selectedOptions.includes(option.id);
            const hasVotedForThis = option.has_voted;
            
            return (
              <button
                key={option.id}
                className={cn(
                  "relative w-full text-left p-2.5 rounded-md border border-input transition-all overflow-hidden",
                  (isSelected || hasVotedForThis) && "border-primary",
                  hasExpired && "opacity-80 cursor-default",
                  !hasExpired && !hasVoted && "hover:border-primary/50",
                  hasVoted && !poll.is_multiple_choice && "cursor-default"
                )}
                disabled={hasExpired}
                onClick={() => handleOptionClick(option.id)}
              >
                {/* Background fill for percentage */}
                {canSeeResults && (
                  <motion.div 
                    className="absolute inset-0 bg-primary/10 origin-left z-0"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: percentage / 100 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                )}
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    {poll.is_multiple_choice ? (
                      <div className={cn(
                        "h-4 w-4 border rounded flex items-center justify-center",
                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input"
                      )}>
                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    ) : (
                      <div className={cn(
                        "h-4 w-4 rounded-full border flex items-center justify-center",
                        hasVotedForThis ? "bg-primary border-primary" : "border-input"
                      )}>
                        {hasVotedForThis && (
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                    )}
                    <span>{option.option_text}</span>
                  </div>
                  
                  {canSeeResults && (
                    <span className="text-sm font-medium">
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        
        {poll.is_multiple_choice && selectedOptions.length > 0 && (
          <Button 
            size="sm" 
            className="w-full mt-3"
            onClick={handleSubmitVotes}
          >
            Submit Votes
          </Button>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-3 text-xs text-muted-foreground flex justify-between">
        <div className="flex items-center">
          <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
          <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
        </div>
        
        {poll.is_multiple_choice && (
          <div>Multiple choice poll</div>
        )}
      </CardFooter>
    </Card>
  );
}
