
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Challenge, UserChallenge } from '@/types/ascend';

export function useChallenge() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const startChallenge = async (challengeId: string) => {
    if (!user) {
      toast.error("You must be logged in to start a challenge");
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          status: 'in_progress',
          progress: {}
        })
        .select('*, challenge:challenges(*)')
        .single();

      if (error) throw error;

      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: ['user-challenges', user.id] });
      
      toast.success('Challenge started successfully!');
      return data as UserChallenge;
    } catch (error: any) {
      console.error('Error starting challenge:', error);
      toast.error(error.message || 'Failed to start challenge');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateChallengeProgress = async (userChallengeId: string, progressData: Record<string, any>) => {
    if (!user) {
      toast.error("You must be logged in to update challenge progress");
      return false;
    }

    setIsLoading(true);
    try {
      const { data: existingChallenge, error: fetchError } = await supabase
        .from('user_challenges')
        .select('progress, challenge_id, challenge:challenges(requirements)')
        .eq('id', userChallengeId)
        .single();

      if (fetchError) throw fetchError;

      // Merge existing progress with new progress
      const updatedProgress = {
        ...existingChallenge.progress,
        ...progressData
      };

      // Check if all requirements are met
      let status = 'in_progress';
      const requirements = existingChallenge.challenge.requirements || {};
      const requirementsMet = Object.keys(requirements).every(key => 
        key in updatedProgress && updatedProgress[key] >= requirements[key]
      );

      if (requirementsMet) {
        status = 'completed';
      }

      const { error: updateError } = await supabase
        .from('user_challenges')
        .update({
          progress: updatedProgress,
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
          xp_earned: status === 'completed' ? existingChallenge.challenge.xp_reward : 0
        })
        .eq('id', userChallengeId);

      if (updateError) throw updateError;

      // If challenge is completed, award XP
      if (status === 'completed') {
        const { error: awardXpError } = await supabase.rpc('award_xp', {
          p_user_id: user.id,
          p_amount: existingChallenge.challenge.xp_reward,
          p_type: 'challenge_completed',
          p_reference_id: existingChallenge.challenge_id
        });

        if (awardXpError) {
          console.error('Error awarding XP:', awardXpError);
        } else {
          toast.success(`Challenge completed! +${existingChallenge.challenge.xp_reward} XP`);
        }
      }

      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: ['user-challenges', user.id] });
      await queryClient.invalidateQueries({ queryKey: ['user-progress', user.id] });
      
      return true;
    } catch (error: any) {
      console.error('Error updating challenge progress:', error);
      toast.error(error.message || 'Failed to update challenge progress');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const abandonChallenge = async (userChallengeId: string) => {
    if (!user) {
      toast.error("You must be logged in to abandon a challenge");
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_challenges')
        .update({
          status: 'failed'
        })
        .eq('id', userChallengeId);

      if (error) throw error;

      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: ['user-challenges', user.id] });
      
      toast.success('Challenge abandoned');
      return true;
    } catch (error: any) {
      console.error('Error abandoning challenge:', error);
      toast.error(error.message || 'Failed to abandon challenge');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startChallenge,
    updateChallengeProgress,
    abandonChallenge,
    isLoading
  };
}
