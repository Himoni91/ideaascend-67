
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Poll, PollOption } from "@/types/post";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function usePolls(postId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch poll data for a post
  const {
    data: poll,
    isLoading,
    error
  } = useQuery({
    queryKey: ["poll", postId],
    queryFn: async () => {
      // Fetch poll data
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .select("*")
        .eq("post_id", postId)
        .single();
        
      if (pollError) return null;
      if (!pollData) return null;
      
      // Fetch poll options
      const { data: optionsData, error: optionsError } = await supabase
        .from("poll_options")
        .select("*")
        .eq("poll_id", pollData.id)
        .order("created_at", { ascending: true });
        
      if (optionsError) throw optionsError;
      
      // Fetch total votes for each option
      const optionsWithVotes = await Promise.all(
        optionsData.map(async (option) => {
          const { count, error: countError } = await supabase
            .from("poll_votes")
            .select("*", { count: "exact" })
            .eq("poll_option_id", option.id);
            
          // If user is logged in, check if they voted for this option
          let hasVoted = false;
          if (user) {
            const { data: voteData } = await supabase
              .from("poll_votes")
              .select("*")
              .eq("poll_option_id", option.id)
              .eq("user_id", user.id)
              .single();
              
            hasVoted = !!voteData;
          }
          
          return {
            ...option,
            votes_count: count || 0,
            has_voted: hasVoted
          };
        })
      );
      
      // Calculate total votes
      const totalVotes = optionsWithVotes.reduce(
        (sum, option) => sum + (option.votes_count || 0), 
        0
      );
      
      return {
        ...pollData,
        options: optionsWithVotes,
        total_votes: totalVotes
      } as Poll;
    },
    enabled: !!postId,
  });
  
  // Set up realtime subscription for poll changes
  useEffect(() => {
    if (!postId) return;
    
    const channel = supabase
      .channel(`polls-channel-${postId}`)
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'polls', filter: `post_id=eq.${postId}` },
          () => {
            queryClient.invalidateQueries({ queryKey: ["poll", postId] });
          }
      )
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'poll_options' },
          () => {
            queryClient.invalidateQueries({ queryKey: ["poll", postId] });
          }
      )
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'poll_votes' },
          () => {
            queryClient.invalidateQueries({ queryKey: ["poll", postId] });
          }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);
  
  // Mutation to vote on a poll option
  const voteOnPoll = useMutation({
    mutationFn: async ({ optionId }: { optionId: string }) => {
      if (!user) throw new Error("You must be logged in to vote on a poll");
      
      // Check if user already voted on this poll and this is not a multiple choice poll
      if (poll && !poll.is_multiple_choice) {
        const hasVoted = poll.options.some(o => o.has_voted);
        
        if (hasVoted) {
          // Remove previous vote if not a multiple choice poll
          const optionToRemove = poll.options.find(o => o.has_voted);
          
          if (optionToRemove) {
            const { error: deleteError } = await supabase
              .from("poll_votes")
              .delete()
              .eq("poll_option_id", optionToRemove.id)
              .eq("user_id", user.id);
              
            if (deleteError) throw deleteError;
          }
        }
      }
      
      // Add new vote
      const { data, error } = await supabase
        .from("poll_votes")
        .insert({
          poll_option_id: optionId,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll", postId] });
      toast.success("Vote recorded successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to vote: ${error.message}`);
    }
  });
  
  // Mutation to create a poll
  const createPoll = useMutation({
    mutationFn: async ({ 
      question, 
      options, 
      isMultipleChoice = false,
      expiresIn = null 
    }: { 
      question: string; 
      options: string[];
      isMultipleChoice?: boolean;
      expiresIn?: number | null; // in hours
    }) => {
      if (!user) throw new Error("You must be logged in to create a poll");
      
      // Calculate expiry date if provided
      let expiresAt = null;
      if (expiresIn) {
        expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiresIn);
      }
      
      // Insert poll
      const { data: poll, error: pollError } = await supabase
        .from("polls")
        .insert({
          post_id: postId,
          question,
          is_multiple_choice: isMultipleChoice,
          expires_at: expiresAt ? expiresAt.toISOString() : null
        })
        .select()
        .single();
        
      if (pollError) throw pollError;
      
      // Insert poll options
      const pollOptions = options.map(option => ({
        poll_id: poll.id,
        option_text: option
      }));
      
      const { data: createdOptions, error: optionsError } = await supabase
        .from("poll_options")
        .insert(pollOptions)
        .select();
        
      if (optionsError) throw optionsError;
      
      return {
        ...poll,
        options: createdOptions
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poll", postId] });
      toast.success("Poll created successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to create poll: ${error.message}`);
    }
  });
  
  return {
    poll,
    isLoading,
    error,
    voteOnPoll: voteOnPoll.mutate,
    createPoll: createPoll.mutate
  };
}
