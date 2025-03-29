
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from "@/integrations/supabase/types";

// Use export type for types when isolatedModules is enabled
export type { DiscoverContent } from '@/types/discover';
export type { DiscoverCategory } from '@/types/discover';
export type { DiscoverFilter } from '@/types/discover';

export function useDiscover() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch discover content
  const fetchDiscoverContent = async () => {
    try {
      const { data, error } = await supabase
        .from('discover_content')
        .select(`
          *,
          profile:created_by(id, username, full_name, avatar_url, is_verified, position, company)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform and return the data
      return data.map(item => ({
        id: item.id,
        title: item.title, 
        description: item.description,
        content_type: item.content_type,
        image_url: item.image_url,
        tags: item.tags,
        view_count: item.view_count,
        created_at: item.created_at,
        trending_score: item.trending_score,
        is_featured: item.is_featured,
        created_by: item.created_by,
        metadata: item.metadata || {},
        profile: {
          id: item.profile?.id || '',
          username: item.profile?.username || '',
          full_name: item.profile?.full_name || '',
          avatar_url: item.profile?.avatar_url || '',
          is_verified: item.profile?.is_verified || false,
          position: item.profile?.position || '',
          company: item.profile?.company || ''
        },
        likes_count: 0,
        user_has_liked: false,
        user_has_saved: false
      }));
    } catch (error) {
      console.error('Error fetching discover content:', error);
      return [];
    }
  };

  // Fetch a single discover content item by ID
  const fetchDiscoverContentById = async (contentId: string) => {
    try {
      const { data, error } = await supabase
        .from('discover_content')
        .select(`
          *,
          profile:created_by(id, username, full_name, avatar_url, is_verified, position, company)
        `)
        .eq('id', contentId)
        .single();

      if (error) {
        throw error;
      }

      // Get the likes count
      const { count: likesCount } = await supabase
        .from('discover_interactions')
        .select('*', { count: 'exact' })
        .eq('content_id', contentId)
        .eq('interaction_type', 'like');

      // Check if user has liked this content
      let userHasLiked = false;
      let userHasSaved = false;

      if (user) {
        const { data: likeData } = await supabase
          .from('discover_interactions')
          .select('*')
          .eq('content_id', contentId)
          .eq('user_id', user.id)
          .eq('interaction_type', 'like')
          .maybeSingle();

        const { data: saveData } = await supabase
          .from('discover_interactions')
          .select('*')
          .eq('content_id', contentId)
          .eq('user_id', user.id)
          .eq('interaction_type', 'save')
          .maybeSingle();

        userHasLiked = !!likeData;
        userHasSaved = !!saveData;
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        content_type: data.content_type,
        image_url: data.image_url,
        tags: data.tags,
        view_count: data.view_count,
        created_at: data.created_at,
        trending_score: data.trending_score,
        is_featured: data.is_featured,
        created_by: data.created_by,
        metadata: data.metadata || {},
        profile: {
          id: data.profile?.id || '',
          username: data.profile?.username || '',
          full_name: data.profile?.full_name || '',
          avatar_url: data.profile?.avatar_url || '',
          is_verified: data.profile?.is_verified || false,
          position: data.profile?.position || '',
          company: data.profile?.company || ''
        },
        likes_count: likesCount || 0,
        user_has_liked: userHasLiked,
        user_has_saved: userHasSaved
      };
    } catch (error) {
      console.error('Error fetching discover content by ID:', error);
      throw error;
    }
  };

  // Use query hook for discover content
  const useDiscoverContent = (filters?: DiscoverFilter) => {
    return useQuery({
      queryKey: ['discover-content', filters],
      queryFn: async () => {
        try {
          let query = supabase
            .from('discover_content')
            .select(`
              *,
              profile:created_by(id, username, full_name, avatar_url, is_verified, position, company)
            `);

          // Apply filters if provided
          if (filters) {
            if (filters.category) {
              query = query.eq('category', filters.category);
            }
            if (filters.contentType) {
              query = query.eq('content_type', filters.contentType);
            }
            if (filters.searchTerm) {
              query = query.ilike('title', `%${filters.searchTerm}%`);
            }
            if (filters.tags && filters.tags.length > 0) {
              query = query.contains('tags', filters.tags);
            }
          }

          let sortOrder = { column: 'created_at', ascending: false };
          if (filters?.sortBy === 'trending') {
            sortOrder = { column: 'trending_score', ascending: false };
          } else if (filters?.sortBy === 'popular') {
            sortOrder = { column: 'view_count', ascending: false };
          }

          query = query.order(sortOrder.column, { ascending: sortOrder.ascending });

          const { data, error } = await query;

          if (error) {
            throw error;
          }

          // Transform and return the data
          return data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            content_type: item.content_type,
            image_url: item.image_url,
            tags: item.tags,
            view_count: item.view_count,
            created_at: item.created_at,
            trending_score: item.trending_score,
            is_featured: item.is_featured,
            created_by: item.created_by,
            metadata: item.metadata || {},
            profile: {
              id: item.profile?.id || '',
              username: item.profile?.username || '',
              full_name: item.profile?.full_name || '',
              avatar_url: item.profile?.avatar_url || '',
              is_verified: item.profile?.is_verified || false,
              position: item.profile?.position || '',
              company: item.profile?.company || ''
            },
            likes_count: 0,
            user_has_liked: false,
            user_has_saved: false
          }));
        } catch (error) {
          console.error('Error fetching discover content:', error);
          return [];
        }
      },
    });
  };

  // Use query hook for a single discover content
  const useDiscoverContentById = (contentId: string) => {
    return useQuery({
      queryKey: ['discover-content', contentId],
      queryFn: () => fetchDiscoverContentById(contentId),
      enabled: !!contentId,
    });
  };

  // Use query hook for discover categories
  const useDiscoverCategories = () => {
    return useQuery({
      queryKey: ['discover-categories'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('discover_categories')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        return data;
      },
    });
  };

  // Toggle like on content
  const toggleLike = async (contentId: string, userId: string) => {
    if (!userId) {
      toast.error('You need to be logged in to like content');
      return false;
    }

    try {
      // Check if the user has already liked this content
      const { data: existingLike } = await supabase
        .from('discover_interactions')
        .select('*')
        .eq('content_id', contentId)
        .eq('user_id', userId)
        .eq('interaction_type', 'like')
        .maybeSingle();

      if (existingLike) {
        // Unlike
        await supabase
          .from('discover_interactions')
          .delete()
          .eq('id', existingLike.id);
        return false;
      } else {
        // Like
        await supabase
          .from('discover_interactions')
          .insert({ content_id: contentId, user_id: userId, interaction_type: 'like' });
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
      return false;
    }
  };

  // Toggle save on content
  const toggleSave = async (contentId: string, userId: string) => {
    if (!userId) {
      toast.error('You need to be logged in to save content');
      return false;
    }

    try {
      // Check if the user has already saved this content
      const { data: existingSave } = await supabase
        .from('discover_interactions')
        .select('*')
        .eq('content_id', contentId)
        .eq('user_id', userId)
        .eq('interaction_type', 'save')
        .maybeSingle();

      if (existingSave) {
        // Unsave
        await supabase
          .from('discover_interactions')
          .delete()
          .eq('id', existingSave.id);
        return false;
      } else {
        // Save
        await supabase
          .from('discover_interactions')
          .insert({ content_id: contentId, user_id: userId, interaction_type: 'save' });
        return true;
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update save status');
      return false;
    }
  };

  // Toggle follow creator
  const toggleFollow = async (creatorId: string, userId: string) => {
    if (!userId) {
      toast.error('You need to be logged in to follow users');
      return false;
    }

    if (creatorId === userId) {
      toast.error('You cannot follow yourself');
      return false;
    }

    try {
      // Check if the user is already following this creator
      const { data: existingFollow } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', userId)
        .eq('following_id', creatorId)
        .maybeSingle();

      if (existingFollow) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('id', existingFollow.id);
        toast.success('Unfollowed successfully');
        return false;
      } else {
        // Follow
        await supabase
          .from('user_follows')
          .insert({ follower_id: userId, following_id: creatorId });
        toast.success('Followed successfully');
        return true;
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
      return false;
    }
  };

  // Check if user is following a creator
  const checkIsFollowing = async (creatorId: string, userId: string) => {
    if (!userId || !creatorId) return false;

    try {
      const { data } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', userId)
        .eq('following_id', creatorId)
        .maybeSingle();

      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  };

  const isLoading = false;
  const error = null;

  return {
    fetchDiscoverContent,
    fetchDiscoverContentById,
    useDiscoverContent,
    useDiscoverCategories,
    useDiscoverContentById,
    toggleLike: useMutation({ 
      mutationFn: (data: { contentId: string; userId: string }) => toggleLike(data.contentId, data.userId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['discover-content'] })
    }),
    toggleSave: useMutation({ 
      mutationFn: (data: { contentId: string; userId: string }) => toggleSave(data.contentId, data.userId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['discover-content'] })
    }),
    toggleFollow: useMutation({ 
      mutationFn: (data: { creatorId: string; userId: string }) => toggleFollow(data.creatorId, data.userId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-follows'] })
    }),
    checkIsFollowing,
    isLoading,
    error
  };
}
