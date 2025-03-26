
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Post, PostWithCategories, FeedFilter } from "@/types/post";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function usePosts(categoryName?: string, feedFilter: FeedFilter = 'all') {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  // Use a consistent query key pattern for caching
  const queryKey = ["posts", categoryName, feedFilter, currentPage, pageSize];

  // Query to fetch posts with author and categories
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

      // Apply category filter if specified
      if (categoryName && categoryName !== 'All') {
        query = query.eq('post_categories.category.name', categoryName);
      }

      // Apply feed filter
      if (feedFilter === 'trending') {
        query = query.order('trending_score', { ascending: false });
      } else if (feedFilter === 'following' && user) {
        // Get the list of users that the current user follows
        const { data: followingData } = await supabase
          .from("user_follows")
          .select("following_id")
          .eq("follower_id", user.id);

        const followingIds = followingData?.map(f => f.following_id) || [];
        
        if (followingIds.length > 0) {
          query = query.in('user_id', followingIds);
        } else {
          // If user isn't following anyone, return empty array
          return { data: [], hasMore: false };
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Check if there are more posts
      const { count } = await supabase
        .from("posts")
        .select("*", { count: 'exact', head: true });

      const hasMore = count ? (currentPage * pageSize) < count : false;

      // Transform the data to flatten the nested structure
      const transformedData = await Promise.all(data?.map(async (post) => {
        const categories = post.categories.map((pc: any) => pc.category);
        
        // Check if post has a poll
        const { data: pollData } = await supabase
          .from("polls")
          .select(`
            *,
            options:poll_options(*)
          `)
          .eq("post_id", post.id)
          .maybeSingle();
          
        // If there's a poll, append it to the post
        let poll = null;
        if (pollData) {
          // Calculate total votes for each option
          const optionsWithVotes = await Promise.all(
            pollData.options.map(async (option: any) => {
              const { count } = await supabase
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
          
          poll = {
            ...pollData,
            options: optionsWithVotes,
            total_votes: totalVotes
          };
        }
        
        return {
          ...post,
          author: post.author,
          categories,
          isTrending: post.trending_score > 50, // Arbitrary threshold
          poll
        };
      }) || []);

      return { data: transformedData as PostWithCategories[], hasMore };
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData // This replaces keepPreviousData in React Query v5
  });

  // If user is authenticated, fetch their reactions to posts
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
          // Add user reactions to cached posts
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

  // Set up realtime subscription for post changes
  useEffect(() => {
    const channel = supabase
      .channel('posts-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'posts' },
          () => {
            // Refetch posts when there are changes
            refetch();
          }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Mutation to create a new post
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
      
      // Step 1: Insert the post
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
      
      // Step 2: Associate categories with the post
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
      
      // Step 3: Create poll if pollData is provided
      if (pollData) {
        // Calculate expiry date if provided
        let expiresAt = null;
        if (pollData.expiresIn) {
          expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + pollData.expiresIn);
        }
        
        // Insert poll
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
        
        // Insert poll options
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
      // Invalidate posts queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post created successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to create post: ${error.message}`);
    }
  });

  // Mutation to react to a post
  const reactToPost = useMutation({
    mutationFn: async ({ postId, reactionType }: { postId: string; reactionType: string }) => {
      if (!user) throw new Error("You must be logged in to react to a post");
      
      // Check if user already reacted with this type
      const { data: existingReaction } = await supabase
        .from("post_reactions")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .eq("reaction_type", reactionType)
        .maybeSingle();
        
      if (existingReaction) {
        // Remove the reaction if it already exists (toggle behavior)
        const { error } = await supabase
          .from("post_reactions")
          .delete()
          .eq("id", existingReaction.id);
          
        if (error) throw error;
        return { postId, removed: true };
      } else {
        // Add the reaction
        const { data, error } = await supabase
          .from("post_reactions")
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          })
          .select()
          .single();
          
        if (error) throw error;
        return { postId, reaction: data, removed: false };
      }
    },
    onSuccess: (result) => {
      // Update the post in cache
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        return {
          ...oldData,
          data: oldData.data.map((post: Post) => {
            if (post.id === result.postId) {
              return {
                ...post,
                userReaction: result.removed ? null : result.reaction,
                likes_count: result.removed 
                  ? (post.likes_count || 0) - 1 
                  : (post.likes_count || 0) + 1
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

  // Get next page of posts
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
  };
}
