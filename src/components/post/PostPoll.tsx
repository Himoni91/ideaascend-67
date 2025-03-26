
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { usePolls } from "@/hooks/use-polls";
import { toast } from "sonner";
import { PollOption } from "@/types/post";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock } from "lucide-react";

interface PostPollProps {
  postId: string;
}

export default function PostPoll({ postId }: PostPollProps) {
  const { user } = useAuth();
  const { poll, isLoading, voteOnPoll } = usePolls(postId);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Check if user has already voted or poll has expired
  useEffect(() => {
    if (poll) {
      const userVoted = poll.options.some(option => option.has_voted);
      setHasVoted(userVoted);
      setShowResults(userVoted);
      
      // Auto-select the option the user has voted for
      if (userVoted) {
        const votedOption = poll.options.find(option => option.has_voted);
        if (votedOption) {
          setSelectedOption(votedOption.id);
        }
      }
    }
  }, [poll]);

  const handleVote = () => {
    if (!user) {
      toast.error("You must be logged in to vote");
      return;
    }
    
    if (!selectedOption) {
      toast.error("Please select an option");
      return;
    }
    
    if (poll?.expires_at && new Date(poll.expires_at) < new Date()) {
      toast.error("This poll has expired");
      return;
    }
    
    voteOnPoll({ optionId: selectedOption });
  };
  
  const isPollExpired = poll?.expires_at ? new Date(poll.expires_at) < new Date() : false;
  
  if (isLoading || !poll) {
    return (
      <div className="rounded-lg border p-4 mt-3 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  const calculatePercentage = (optionVotes: number) => {
    if (!poll.total_votes) return 0;
    return Math.round((optionVotes / poll.total_votes) * 100);
  };
  
  return (
    <motion.div 
      className="rounded-lg border p-4 mt-3 bg-background/50 backdrop-blur-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="font-medium text-lg mb-3">{poll.question}</h3>
      
      <div className="space-y-3 mb-4">
        <AnimatePresence>
          {poll.options.map((option: PollOption) => (
            <motion.div 
              key={option.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`relative ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {showResults ? (
                <div 
                  className="rounded-lg border p-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-center z-10 relative">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{option.option_text}</span>
                      {option.has_voted && (
                        <span className="bg-primary/20 text-primary p-1 rounded-full">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-sm">{calculatePercentage(option.votes_count || 0)}%</span>
                  </div>
                  <Progress 
                    value={calculatePercentage(option.votes_count || 0)} 
                    className="h-full absolute top-0 left-0 bg-transparent z-0 rounded-lg"
                  />
                </div>
              ) : (
                <div 
                  className={`rounded-lg border p-3 transition-colors ${
                    selectedOption === option.id
                      ? 'border-primary bg-primary/10'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => !isPollExpired && !hasVoted && setSelectedOption(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{option.option_text}</span>
                    {selectedOption === option.id && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-4 w-4 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}
          {poll.expires_at && (
            <span className="ml-2 flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {isPollExpired ? 'Poll closed' : 'Closes ' + new Date(poll.expires_at).toLocaleDateString()}
            </span>
          )}
        </div>
        
        {!showResults && !isPollExpired && (
          <div className="flex gap-2">
            {hasVoted ? (
              <Button size="sm" variant="outline" onClick={() => setShowResults(true)}>
                Show Results
              </Button>
            ) : (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowResults(true)}
                  disabled={!poll.total_votes}
                >
                  View Results
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleVote} 
                  disabled={!selectedOption}
                  className="relative overflow-hidden"
                >
                  <span className={isLoading ? "opacity-0" : "opacity-100"}>Vote</span>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
        
        {(showResults || isPollExpired) && !hasVoted && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowResults(false)}
            disabled={isPollExpired}
          >
            Back to Poll
          </Button>
        )}
      </div>
    </motion.div>
  );
}
