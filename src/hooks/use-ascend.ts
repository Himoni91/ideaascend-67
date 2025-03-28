
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Challenge, 
  UserChallenge, 
  LeaderboardEntry, 
  XpTransaction, 
  UserProgress,
  LevelInfo
} from '@/types/ascend';

export function useAscend() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user progress data
  const { 
    data: userProgress, 
    isLoading: userProgressLoading, 
    error: userProgressError 
  } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User must be logged in');
      
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      return data as UserProgress;
    },
    enabled: !!user,
  });

  // Fetch all challenges
  const { 
    data: challenges = [], 
    isLoading: challengesLoading, 
    error: challengesError 
  } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Challenge[];
    },
    enabled: !!user,
  });

  // Fetch user's challenges
  const { 
    data: userChallenges = [], 
    isLoading: userChallengesLoading, 
    error: userChallengesError 
  } = useQuery({
    queryKey: ['user-challenges', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User must be logged in');
      
      const { data, error } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenge:challenges(*)
        `)
        .eq('user_id', user.id);
        
      if (error) throw error;
      return data as UserChallenge[];
    },
    enabled: !!user,
  });

  // Fetch leaderboard data
  const { 
    data: leaderboard = [], 
    isLoading: leaderboardLoading, 
    error: leaderboardError 
  } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('date_range', 'weekly')
        .order('rank', { ascending: true })
        .limit(100);
        
      if (error) throw error;
      return data as LeaderboardEntry[];
    },
    enabled: !!user,
  });

  // Fetch recent XP transactions
  const { 
    data: recentActivity = [], 
    isLoading: recentActivityLoading, 
    error: recentActivityError 
  } = useQuery({
    queryKey: ['xp-transactions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User must be logged in');
      
      const { data, error } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      return data as XpTransaction[];
    },
    enabled: !!user,
  });

  // Calculate level information based on user XP
  const levelInfo = useMemo(() => {
    if (!userProgress) return null;
    
    const xpPerLevel = 100;
    const currentLevel = userProgress.level;
    const currentXp = userProgress.xp;
    const xpForCurrentLevel = (currentLevel - 1) * xpPerLevel;
    const xpForNextLevel = currentLevel * xpPerLevel;
    const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
    const xpProgressInCurrentLevel = currentXp - xpForCurrentLevel;
    const progressPercentage = Math.min(
      100,
      Math.round((xpProgressInCurrentLevel / xpNeededForNextLevel) * 100)
    );
    
    return {
      level: currentLevel,
      xp_required: xpNeededForNextLevel,
      xp_for_next_level: xpForNextLevel,
      progress_percentage: progressPercentage
    } as LevelInfo;
  }, [userProgress]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to changes in user progress
    const userProgressChannel = supabase
      .channel('user-progress-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['user-progress', user.id] });
        }
      )
      .subscribe();

    // Subscribe to changes in user challenges
    const userChallengesChannel = supabase
      .channel('user-challenges-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_challenges',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['user-challenges', user.id] });
        }
      )
      .subscribe();

    // Subscribe to changes in XP transactions
    const xpTransactionsChannel = supabase
      .channel('xp-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'xp_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['xp-transactions', user.id] });
        }
      )
      .subscribe();

    // Subscribe to changes in leaderboard
    const leaderboardChannel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leaderboard'
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userProgressChannel);
      supabase.removeChannel(userChallengesChannel);
      supabase.removeChannel(xpTransactionsChannel);
      supabase.removeChannel(leaderboardChannel);
    };
  }, [user, queryClient]);

  const refreshData = async () => {
    if (!user) return;
    
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['user-progress', user.id] }),
      queryClient.invalidateQueries({ queryKey: ['challenges'] }),
      queryClient.invalidateQueries({ queryKey: ['user-challenges', user.id] }),
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] }),
      queryClient.invalidateQueries({ queryKey: ['xp-transactions', user.id] }),
    ]);
  };

  return {
    userProgress,
    challenges,
    userChallenges,
    leaderboard,
    recentActivity,
    levelInfo,
    loading: userProgressLoading || challengesLoading || userChallengesLoading || leaderboardLoading || recentActivityLoading,
    error: userProgressError || challengesError || userChallengesError || leaderboardError || recentActivityError,
    refreshData
  };
}
