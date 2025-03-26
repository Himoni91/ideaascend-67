import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Post, PostWithCategories, FeedFilter } from "@/types/post";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileType } from "@/types/profile";

export function usePosts(categoryName?: string, feedFilter: FeedFilter = 'all') {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  const queryKey = ["posts", categoryName, feedFilter, currentPage, pageSize];

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

  const {
    data: posts,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_user_id_fkey(*),
          categories:post_categories!inner(
            category:categories(*)
          )
        `)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (categoryName && categoryName !== 'All') {
        query = query.eq('post_categories.category.name', categoryName);
      }

      if (feedFilter === 'trending') {
        query = query.order('trending_score', { ascending: false });
      } else if (feedFilter === 'following' && user) {
        const { data: followingData } = await supabase
          .from("user_follows")
          .select("following_id")
          .eq("follower_id", user.id);

        const followingIds = followingData?.map(f => f.following_id) || [];
        
        if (followingIds.length > 0) {
          query = query.in('user_id', followingIds);
        } else {
          return { data: [], hasMore: false };
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      const { count } = await supabase
        .from("posts")
        .select("*", { count: 'exact', head: true });

      const hasMore = count ? (currentPage * pageSize) < count : false;

      const transformedData = await Promise.all(data?.map(async (post) => {
        const formattedAuthor = formatProfileData(post.author);
        
        const categories = post.categories.map((pc: any) => pc.category);
        
        const { data: pollData } = await supabase
          .from("polls")
          .select(`
            *,
            options:poll_options(*)
          `)
          .eq("post_id", post.id)
          .maybeSingle();
          
        let poll = null;
        if (pollData) {
          const optionsWithVotes = await Promise.all(
            pollData.options.map(async (option: any) => {
              const { count } = await supabase
                .from("poll_votes")
                .select("*", { count: "exact" })
                .eq("poll_option_id", option.id);
                
              let hasVoted = false;
              if (user) {
                const { data: voteData } = await supabase
                  .from("poll_votes")
                  .select("*")
                  .eq("poll_option_id", option.id)
                  .eq("user_id", user.id)
                  .maybeSingle();
                  
                hasVoted = !!voteData;
              }
              
              return {
                ...option,
                votes_count: count || 0,
                has_voted: hasVoted
              };
            })
          );
          
          const totalVotes = optionsWithVotes.reduce(
            (sum, option) => sum + (option.votes_count || 0), 
            0
          );
          
          poll = {
            ...pollData,
            options: optionsWithVotes,
            total_votes: totalVotes
          };
        }

        let isReposted = false;
        if (user) {
          const { data: repostData } = await supabase
            .from("post_reposts")
            .select("*")
            .eq("post_id", post.id)
            .eq("user_id", user.id)
            .maybeSingle();
            
          isReposted = !!repostData;
        }
        
        return {
          ...post,
          author: formattedAuthor,
          categories,
          isReposted,
          isTrending: post.trending_score > 50,
          poll
        } as PostWithCategories;
      }) || []);

      return { data: transformedData, hasMore };
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData
  });

  useEffect(() => {
    if (user && posts?.data?.length) {
      const fetchUserReactions = async () => {
        const postIds = posts.data.map(post => post.id);
        
        const { data: reactions } = await supabase
          .from("post_reactions")
          .select("*")
          .eq("user_id", user.id)
          .in("post_id", postIds);
          
        if (reactions?.length) {
          queryClient.setQueryData(queryKey, (oldData: any) => {
            if (!oldData?.data) return oldData;
            
            return {
              ...oldData,
              data: oldData.data.map((post: Post) => {
                const userReaction = reactions.find(r => r.post_id === post.id);
                return { ...post, userReaction };
              })
            };
          });
        }
      };
      
      fetchUserReactions();
    }
  }, [user, posts?.data, queryClient, queryKey]);

  useEffect(() => {
    const channel = supabase
      .channel('posts-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'posts' },
          () => {
            refetch();
          }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const createPost = useMutation({
    mutationFn: async ({ 
      content, 
      categoryIds, 
      mediaUrl, 
      mediaType,
      pollData
    }: { 
      content: string; 
      categoryIds: string[];
      mediaUrl?: string;
      mediaType?: string;
      pollData?: {
        question: string;
        options: string[];
        isMultipleChoice: boolean;
        expiresIn: number | null;
      } | null;
    }) => {
      if (!user) throw new Error("You must be logged in to create a post");
      
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content,
          media_url: mediaUrl || null,
          media_type: mediaType || null
        })
        .select()
        .single();
        
      if (postError) throw postError;
      
      if (categoryIds.length > 0) {
        const postCategories = categoryIds.map(categoryId => ({
          post_id: post.id,
          category_id: categoryId
        }));
        
        const { error: categoriesError } = await supabase
          .from("post_categories")
          .insert(postCategories);
          
        if (categoriesError) throw categoriesError;
      }
      
      if (pollData) {
        let expiresAt = null;
        if (pollData.expiresIn) {
          expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + pollData.expiresIn);
        }
        
        const { data: poll, error: pollError } = await supabase
          .from("polls")
          .insert({
            post_id: post.id,
            question: pollData.question,
            is_multiple_choice: pollData.isMultipleChoice,
            expires_at: expiresAt ? expiresAt.toISOString() : null
          })
          .select()
          .single();
          
        if (pollError) throw pollError;
        
        const pollOptions = pollData.options.map(option => ({
          poll_id: poll.id,
          option_text: option
        }));
        
        const { error: optionsError } = await supabase
          .from("poll_options")
          .insert(pollOptions);
          
        if (optionsError) throw optionsError;
      }
      
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post created successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to create post: ${error.message}`);
    }
  });

  const reactToPost = useMutation({
    mutationFn: async ({ postId, reactionType }: { postId: string; reactionType: string }) => {
      if (!user) throw new Error("You must be logged in to react to a post");
      
      const { data: existingReaction } = await supabase
        .from("post_reactions")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .eq("reaction_type", reactionType)
        .maybeSingle();
        
      if (existingReaction) {
        const { error } = await supabase
          .from("post_reactions")
          .delete()
          .eq("id", existingReaction.id);
          
        if (error) throw error;
        
        if (reactionType === 'like') {
          toast.info("Removed like");
        } else {
          toast.info(`Removed ${reactionType} reaction`);
        }
        
        return { postId, removed: true, reactionType };
      } else {
        const { data: reactionTypeData } = await supabase
          .from("reaction_types")
          .select("id")
          .eq("name", reactionType)
          .single();
        
        await supabase
          .from("post_reactions")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
          
        const { data, error } = await supabase
          .from("post_reactions")
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType,
            reaction_type_id: reactionTypeData?.id
          })
          .select()
          .single();
          
        if (error) throw error;
        
        if (reactionType === 'like') {
          toast.success("Post liked");
        } else if (reactionType === 'fundable') {
          toast.success("Marked as fundable");
        } else if (reactionType === 'insightful') {
          toast.success("Marked as insightful");
        } else if (reactionType === 'innovative') {
          toast.success("Marked as innovative");
        } else if (reactionType === 'helpful') {
          toast.success("Marked as helpful");
        } else if (reactionType === 'inspiring') {
          toast.success("Marked as inspiring");
        }
        
        return { postId, reaction: data, removed: false, reactionType };
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.map((post: Post) => {
            if (post.id === result.postId) {
              const likesUpdate = result.reactionType === 'like' 
                ? { likes_count: result.removed 
                    ? Math.max(0, (post.likes_count || 0) - 1)
                    : (post.likes_count || 0) + 1 }
                : {};
                
              return {
                ...post,
                userReaction: result.removed ? null : result.reaction,
                ...likesUpdate
              };
            }
            return post;
          })
        };
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to react to post: ${error.message}`);
    }
  });

  const repostPost = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("You must be logged in to repost");
      
      const { data: existingRepost } = await supabase
        .from("post_reposts")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (existingRepost) {
        const { error } = await supabase
          .from("post_reposts")
          .delete()
          .eq("id", existingRepost.id);
          
        if (error) throw error;
        return { postId, removed: true };
      } else {
        const { data, error } = await supabase
          .from("post_reposts")
          .insert({
            post_id: postId,
            user_id: user.id
          })
          .select()
          .single();
          
        if (error) throw error;
        return { postId, repost: data, removed: false };
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.map((post: Post) => {
            if (post.id === result.postId) {
              return {
                ...post,
                isReposted: !result.removed,
                reposts_count: result.removed 
                  ? Math.max(0, (post.reposts_count || 0) - 1)
                  : (post.reposts_count || 0) + 1
              };
            }
            return post;
          })
        };
      });
      
      if (result.removed) {
        toast.success("Repost removed");
      } else {
        toast.success("Post reposted to your profile");
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to repost: ${error.message}`);
    }
  });

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return {
    posts: posts?.data || [],
    isLoading,
    error,
    hasMore: posts?.hasMore || false,
    loadMore,
    createPost: createPost.mutate,
    reactToPost: reactToPost.mutate,
    repostPost: repostPost.mutate
  };
}
