import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pitch, PitchFormData, PitchVote, PitchComment, MentorReview, PitchRawData } from "@/types/pitch";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ProfileType } from "@/types/profile";

// Helper function to format profile data
const formatProfileData = (profileData: any): ProfileType => {
  const defaultBadges = [
    { name: "New Member", icon: "👋", description: "Welcome to Idolyst", earned: true }
  ];
  
  const defaultStats = {
    followers: 0,
    following: 0,
    ideas: 0,
    mentorSessions: 0,
    posts: 0,
    rank: 0
  };

  let badges = defaultBadges;
  let stats = defaultStats;

  try {
    if (profileData.badges) {
      if (Array.isArray(profileData.badges)) {
        badges = profileData.badges;
      }
    }
    
    if (profileData.stats) {
      if (typeof profileData.stats === 'object' && !Array.isArray(profileData.stats)) {
        stats = { ...defaultStats, ...profileData.stats };
      }
    }
  } catch (e) {
    console.error("Error parsing profile data:", e);
  }

  return {
    ...profileData,
    badges,
    stats
  } as ProfileType;
};

// Helper function to convert database records to Pitch type
const formatPitchData = (data: PitchRawData, userVote?: 'up' | 'down' | null): Pitch => {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    problem_statement: data.description,
    solution: data.solution || '',
    target_audience: data.target_audience || '',
    target_market: data.target_audience || '', // Map target_audience as target_market
    business_model: data.category || '', // Use category as business_model if needed
    status: 'open' as const, // Default to open status
    tags: data.tags || [],
    is_premium: !!data.is_premium,
    user_id: data.user_id,
    created_at: data.created_at,
    updated_at: data.updated_at || data.created_at,
    votes_count: data.votes_count || 0,
    views_count: data.trending_score || 0, // Use trending_score as views_count
    comments_count: data.comments_count || 0,
    mentor_reviews_count: data.mentor_reviews_count || 0,
    trending_score: data.trending_score || 0,
    category: data.category,
    media_url: data.media_url,
    media_type: data.media_type as 'image' | 'video' | 'document',
    follower_count: data.follower_count || 0,
    author: data.author ? formatProfileData(data.author) : {
      id: data.user_id,
      username: 'unknown',
    },
    user_vote: userVote || null,
  };
};

export function usePitches(category?: string, sortBy: 'trending' | 'newest' | 'votes' = 'newest', limit: number = 10) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  // Query pitches with pagination
  const {
    data: pitches,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["pitches", category, sortBy, currentPage, limit],
    queryFn: async () => {
      let query = supabase
        .from("pitches")
        .select(`
          *,
          author:profiles!pitches_user_id_fkey(*)
        `)
        .order(sortBy === 'newest' ? 'created_at' : (sortBy === 'trending' ? 'trending_score' : 'votes_count'), { ascending: false })
        .range((currentPage - 1) * limit, currentPage * limit - 1);

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get user votes
      let userVotes: Record<string, 'up' | 'down'> = {};
      if (user) {
        const { data: votesData } = await supabase
          .from("pitch_votes")
          .select("pitch_id, vote_type")
          .eq("user_id", user.id);

        if (votesData) {
          userVotes = votesData.reduce((acc, vote) => {
            acc[vote.pitch_id] = vote.vote_type as 'up' | 'down';
            return acc;
          }, {} as Record<string, 'up' | 'down'>);
        }
      }

      const enhancedPitches = data?.map(pitch => {
        return formatPitchData(pitch, userVotes[pitch.id]);
      }) || [];

      // Get total count for pagination
      const { count } = await supabase
        .from("pitches")
        .select("*", { count: "exact", head: true });

      return {
        data: enhancedPitches,
        totalCount: count || 0,
        hasMore: enhancedPitches.length === limit
      };
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });

  // Set up real-time listeners
  useEffect(() => {
    // Use a combined channel for all table changes
    const channel = supabase
      .channel('pitches-realtime')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'pitches' },
          (payload) => {
            console.log('Pitch changed:', payload);
            // Refetch to get the latest data
            setTimeout(() => {
              refetch();
            }, 1000);
          }
      )
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'pitch_votes' },
          (payload) => {
            console.log('Pitch vote changed:', payload);
            setTimeout(() => {
              refetch();
            }, 1000);
          }
      )
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'pitch_comments' },
          (payload) => {
            console.log('Pitch comment changed:', payload);
            setTimeout(() => {
              refetch();
            }, 1000);
          }
      )
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'mentor_reviews' },
          (payload) => {
            console.log('Mentor review changed:', payload);
            setTimeout(() => {
              refetch();
            }, 1000);
          }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Create a new pitch
  const createPitch = useMutation({
    mutationFn: async (pitchData: PitchFormData) => {
      if (!user) throw new Error("You must be logged in to create a pitch");
      
      let mediaUrl = null;
      let mediaType = null;

      // Upload media if provided
      if (pitchData.media_file) {
        const fileExt = pitchData.media_file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        // Create the bucket if it doesn't exist
        const { data: bucketExists } = await supabase.storage.getBucket('pitch-media');
        
        if (!bucketExists) {
          await supabase.storage.createBucket('pitch-media', {
            public: true
          });
        }
        
        const { error: uploadError } = await supabase.storage
          .from('pitch-media')
          .upload(filePath, pitchData.media_file);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('pitch-media')
          .getPublicUrl(filePath);
          
        mediaUrl = publicUrl;
        mediaType = pitchData.media_file.type;
      }
      
      // Create the pitch - fixed field names to match database schema
      const { data, error } = await supabase
        .from("pitches")
        .insert({
          user_id: user.id,
          title: pitchData.title,
          description: pitchData.problem_statement, // Map problem_statement to description
          target_audience: pitchData.target_audience,
          solution: pitchData.solution,
          category: pitchData.category,
          tags: pitchData.tags,
          media_url: mediaUrl,
          media_type: mediaType,
          is_premium: pitchData.is_premium || false
        })
        .select(`
          *,
          author:profiles!pitches_user_id_fkey(*)
        `)
        .single();
        
      if (error) throw error;
      
      // Format the response and map fields correctly
      return formatPitchData(data, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pitches"] });
      toast.success("Pitch created successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to create pitch: ${error.message}`);
    }
  });

  // Vote on a pitch
  const votePitch = useMutation({
    mutationFn: async ({ pitchId, voteType }: { pitchId: string; voteType: 'up' | 'down' }) => {
      if (!user) throw new Error("You must be logged in to vote");
      
      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from("pitch_votes")
        .select("*")
        .eq("pitch_id", pitchId)
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (existingVote) {
        // Remove vote if clicking the same type
        if (existingVote.vote_type === voteType) {
          const { error } = await supabase
            .from("pitch_votes")
            .delete()
            .eq("id", existingVote.id);
            
          if (error) throw error;
          
          return { pitchId, voteType: null as null };
        }
        
        // Change vote type
        const { data, error } = await supabase
          .from("pitch_votes")
          .update({ vote_type: voteType })
          .eq("id", existingVote.id)
          .select()
          .single();
          
        if (error) throw error;
        
        return { pitchId, voteType };
      } else {
        // Create new vote
        const { data, error } = await supabase
          .from("pitch_votes")
          .insert({
            pitch_id: pitchId,
            user_id: user.id,
            vote_type: voteType
          })
          .select()
          .single();
          
        if (error) throw error;
        
        return { pitchId, voteType };
      }
    },
    onSuccess: (result) => {
      // Update cache
      queryClient.setQueryData(
        ["pitches", category, sortBy],
        (oldData: any) => {
          if (!oldData) return oldData;
          
          const updatedPitches = oldData.data.map((pitch: Pitch) => {
            if (pitch.id === result.pitchId) {
              return {
                ...pitch,
                user_vote: result.voteType
              };
            }
            return pitch;
          });
          
          return {
            ...oldData,
            data: updatedPitches
          };
        }
      );
      
      if (result.voteType === null) {
        toast.info("Vote removed");
      } else {
        toast.success(`${result.voteType === 'up' ? 'Upvoted' : 'Downvoted'} successfully`);
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to vote: ${error.message}`);
    }
  });

  // Get a single pitch by ID
  const usePitch = (pitchId: string) => {
    return useQuery({
      queryKey: ["pitch", pitchId],
      queryFn: async () => {
        if (!pitchId) throw new Error("Pitch ID is required");
        
        const { data, error } = await supabase
          .from("pitches")
          .select(`
            *,
            author:profiles!pitches_user_id_fkey(*)
          `)
          .eq("id", pitchId)
          .single();
          
        if (error) throw error;
        
        let userVote = null;
        if (user) {
          const { data: voteData } = await supabase
            .from("pitch_votes")
            .select("vote_type")
            .eq("pitch_id", pitchId)
            .eq("user_id", user.id)
            .maybeSingle();
            
          if (voteData) {
            userVote = voteData.vote_type as 'up' | 'down';
          }
        }
        
        // Record view using RPC function if available
        try {
          // Try to use the RPC function first
          const rpcResult = await supabase.rpc('increment_pitch_view', { 
            pitch_id: pitchId
          });
          
          // If RPC call fails, fall back to direct update
          if (rpcResult.error) {
            await supabase.from('pitches')
              .update({ trending_score: data.trending_score + 1 })
              .eq('id', pitchId);
          }
        } catch (e) {
          console.error("Failed to record view:", e);
        }
        
        // Map fields correctly using the format helper
        return formatPitchData(data, userVote);
      },
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    });
  };

  // Get comments for a pitch
  const usePitchComments = (pitchId: string) => {
    return useQuery({
      queryKey: ["pitch-comments", pitchId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("pitch_comments")
          .select(`
            *,
            author:profiles!pitch_comments_user_id_fkey(*)
          `)
          .eq("pitch_id", pitchId)
          .order("created_at", { ascending: true });
          
        if (error) throw error;
        
        return data.map(comment => ({
          ...comment,
          author: comment.author ? formatProfileData(comment.author) : undefined
        })) as PitchComment[];
      },
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    });
  };

  // Get mentor reviews for a pitch
  const useMentorReviews = (pitchId: string) => {
    return useQuery({
      queryKey: ["mentor-reviews", pitchId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("mentor_reviews")
          .select(`
            *,
            mentor:profiles!mentor_reviews_mentor_id_fkey(*)
          `)
          .eq("pitch_id", pitchId)
          .order("created_at", { ascending: true });
          
        if (error) throw error;
        
        return data.map(review => ({
          ...review,
          mentor: review.mentor ? formatProfileData(review.mentor) : undefined
        })) as MentorReview[];
      },
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    });
  };

  // Add a comment to a pitch
  const addComment = useMutation({
    mutationFn: async ({ pitchId, content }: { pitchId: string; content: string }) => {
      if (!user) throw new Error("You must be logged in to comment");
      
      // Check if user is a mentor
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_mentor")
        .eq("id", user.id)
        .single();
        
      const isMentor = profileData?.is_mentor || false;
      
      const { data, error } = await supabase
        .from("pitch_comments")
        .insert({
          pitch_id: pitchId,
          user_id: user.id,
          content,
          is_mentor_comment: isMentor
        })
        .select(`
          *,
          author:profiles!pitch_comments_user_id_fkey(*)
        `)
        .single();
        
      if (error) throw error;
      
      return {
        ...data,
        author: data.author ? formatProfileData(data.author) : undefined
      } as PitchComment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pitch-comments", variables.pitchId] });
      toast.success("Feedback added successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to add feedback: ${error.message}`);
    }
  });

  // Add a mentor review to a pitch
  const addMentorReview = useMutation({
    mutationFn: async ({ pitchId, content, rating }: { pitchId: string; content: string; rating: number }) => {
      if (!user) throw new Error("You must be logged in to add a review");
      
      // Check if user is a mentor
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_mentor")
        .eq("id", user.id)
        .single();
        
      if (!profileData?.is_mentor) {
        throw new Error("Only mentors can add reviews");
      }
      
      const { data, error } = await supabase
        .from("mentor_reviews")
        .insert({
          pitch_id: pitchId,
          mentor_id: user.id,
          content,
          rating
        })
        .select(`
          *,
          mentor:profiles!mentor_reviews_mentor_id_fkey(*)
        `)
        .single();
        
      if (error) throw error;
      
      return {
        ...data,
        mentor: data.mentor ? formatProfileData(data.mentor) : undefined
      } as MentorReview;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mentor-reviews", variables.pitchId] });
      toast.success("Review added successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to add review: ${error.message}`);
    }
  });

  // Load more pitches
  const loadMore = () => {
    if (!isLoading && pitches?.hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Get top pitches for leaderboard
  const useTopPitches = (timeFrame: 'week' | 'month' | 'all' = 'week', limit: number = 5) => {
    return useQuery({
      queryKey: ["top-pitches", timeFrame, limit],
      queryFn: async () => {
        let query = supabase
          .from("pitches")
          .select(`
            *,
            author:profiles!pitches_user_id_fkey(*)
          `)
          .order('votes_count', { ascending: false })
          .limit(limit);
        
        // Add time filter if needed
        if (timeFrame === 'week') {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          query = query.gte('created_at', oneWeekAgo.toISOString());
        } else if (timeFrame === 'month') {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          query = query.gte('created_at', oneMonthAgo.toISOString());
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        return data.map(pitch => formatPitchData(pitch));
      },
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    });
  };

  // Get pitch analytics
  const useAnalytics = (pitchId: string) => {
    return useQuery({
      queryKey: ["pitch-analytics", pitchId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("pitches")
          .select(`
            votes_count,
            comments_count,
            mentor_reviews_count,
            trending_score
          `)
          .eq("id", pitchId)
          .single();
          
        if (error) throw error;
        
        return {
          views: Math.floor(data.trending_score / 5), // Estimate views from trending score
          votes: data.votes_count,
          comments: data.comments_count,
          reviews: data.mentor_reviews_count,
          trending_score: data.trending_score
        };
      },
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    });
  };

  return {
    pitches: pitches?.data || [],
    isLoading,
    error,
    hasMore: pitches?.hasMore || false,
    totalCount: pitches?.totalCount || 0,
    loadMore,
    createPitch: createPitch.mutate,
    votePitch: votePitch.mutate,
    usePitch,
    usePitchComments,
    useMentorReviews,
    addComment: addComment.mutate,
    addMentorReview: addMentorReview.mutate,
    useTopPitches,
    useAnalytics,
    refetch
  };
}
