
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type DiscoverContentType = 'people' | 'ideas' | 'content' | 'events';

export interface DiscoverContent {
  id: string;
  title: string;
  description: string | null;
  content_type: DiscoverContentType;
  created_by: string;
  created_at: string;
  updated_at: string;
  image_url: string | null;
  tags: string[] | null;
  metadata: any;
  is_featured: boolean;
  view_count: number;
  trending_score: number;
  // Join with profiles
  profile?: {
    username: string;
    full_name: string;
    avatar_url: string;
    position: string;
    company: string;
  } | null;
  // Computed properties
  likes_count?: number;
  saves_count?: number;
  user_has_liked?: boolean;
  user_has_saved?: boolean;
}

export interface DiscoverCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  created_at: string;
}

export interface DiscoverFilter {
  contentType?: DiscoverContentType;
  category?: string;
  searchTerm?: string;
  tags?: string[];
  sortBy?: 'latest' | 'trending' | 'popular';
  featured?: boolean;
}

export function useDiscover() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<DiscoverFilter>({
    contentType: undefined,
    category: undefined,
    searchTerm: "",
    tags: undefined,
    sortBy: "latest",
    featured: false,
  });

  // Fetch discover content based on filters
  const useDiscoverContent = (initialFilters?: Partial<DiscoverFilter>) => {
    const currentFilters = { ...filters, ...initialFilters };
    
    return useQuery({
      queryKey: ['discover-content', currentFilters],
      queryFn: async () => {
        let query = supabase
          .from('discover_content')
          .select(`
            *,
            profile:profiles!discover_content_created_by_fkey(
              username, full_name, avatar_url, position, company
            )
          `);

        // Apply content type filter
        if (currentFilters.contentType) {
          query = query.eq('content_type', currentFilters.contentType);
        }

        // Apply search filter
        if (currentFilters.searchTerm && currentFilters.searchTerm.trim() !== "") {
          query = query.or(`title.ilike.%${currentFilters.searchTerm}%,description.ilike.%${currentFilters.searchTerm}%`);
        }

        // Apply tags filter
        if (currentFilters.tags && currentFilters.tags.length > 0) {
          query = query.contains('tags', currentFilters.tags);
        }

        // Apply featured filter
        if (currentFilters.featured) {
          query = query.eq('is_featured', true);
        }

        // Apply sorting
        switch (currentFilters.sortBy) {
          case 'trending':
            query = query.order('trending_score', { ascending: false });
            break;
          case 'popular':
            query = query.order('view_count', { ascending: false });
            break;
          case 'latest':
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // Process data to match DiscoverContent interface
        const processedData = data.map(item => {
          // Initialize default properties with proper type handling for profile
          const processedItem: DiscoverContent = {
            ...item,
            content_type: item.content_type as DiscoverContentType, // Cast to DiscoverContentType
            likes_count: 0,
            saves_count: 0,
            user_has_liked: false,
            user_has_saved: false,
            // Handle profile data safely with null checks
            profile: item.profile && typeof item.profile === 'object' && !('error' in item.profile) ? {
              username: item.profile?.username || '',
              full_name: item.profile?.full_name || '',
              avatar_url: item.profile?.avatar_url || '',
              position: item.profile?.position || '',
              company: item.profile?.company || ''
            } : null
          };
          
          return processedItem;
        });

        // If user is logged in, get their interactions with the content
        if (user) {
          const contentIds = processedData.map(item => item.id);
          
          if (contentIds.length > 0) {
            const { data: interactionsData, error: interactionsError } = await supabase
              .from('discover_interactions')
              .select('content_id, interaction_type')
              .eq('user_id', user.id)
              .in('content_id', contentIds);

            if (!interactionsError && interactionsData) {
              // Enhance data with user interaction information
              processedData.forEach(content => {
                content.user_has_liked = interactionsData.some(
                  int => int.content_id === content.id && int.interaction_type === 'like'
                );
                content.user_has_saved = interactionsData.some(
                  int => int.content_id === content.id && int.interaction_type === 'save'
                );
              });
            }
          }
        }

        // Get interaction counts
        for (const item of processedData) {
          const { count: likesCount, error: likesError } = await supabase
            .from('discover_interactions')
            .select('*', { count: 'exact', head: true })
            .eq('content_id', item.id)
            .eq('interaction_type', 'like');

          const { count: savesCount, error: savesError } = await supabase
            .from('discover_interactions')
            .select('*', { count: 'exact', head: true })
            .eq('content_id', item.id)
            .eq('interaction_type', 'save');

          if (!likesError) item.likes_count = likesCount || 0;
          if (!savesError) item.saves_count = savesCount || 0;
        }

        return processedData;
      },
    });
  };

  // Fetch content by ID
  const useDiscoverContentById = (id: string | undefined) => {
    return useQuery({
      queryKey: ['discover-content', id],
      queryFn: async () => {
        if (!id) return null;

        const { data, error } = await supabase
          .from('discover_content')
          .select(`
            *,
            profile:profiles!discover_content_created_by_fkey(
              username, full_name, avatar_url, position, company
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        // Create a properly shaped content item with safe profile handling
        const contentItem: DiscoverContent = {
          ...data,
          content_type: data.content_type as DiscoverContentType, // Cast to DiscoverContentType
          likes_count: 0,
          saves_count: 0,
          user_has_liked: false,
          user_has_saved: false,
          // Handle profile data safely with null checks
          profile: data.profile && typeof data.profile === 'object' && !('error' in data.profile) ? {
            username: data.profile?.username || '',
            full_name: data.profile?.full_name || '',
            avatar_url: data.profile?.avatar_url || '',
            position: data.profile?.position || '',
            company: data.profile?.company || ''
          } : null
        };

        // Record a view
        if (data) {
          await recordContentView(id);
        }

        // Get interaction counts
        const { count: likesCount, error: likesError } = await supabase
          .from('discover_interactions')
          .select('*', { count: 'exact', head: true })
          .eq('content_id', id)
          .eq('interaction_type', 'like');

        const { count: savesCount, error: savesError } = await supabase
          .from('discover_interactions')
          .select('*', { count: 'exact', head: true })
          .eq('content_id', id)
          .eq('interaction_type', 'save');

        if (!likesError) contentItem.likes_count = likesCount || 0;
        if (!savesError) contentItem.saves_count = savesCount || 0;

        // If user is logged in, get their interactions with this content
        if (user) {
          const { data: interactionsData, error: interactionsError } = await supabase
            .from('discover_interactions')
            .select('interaction_type')
            .eq('user_id', user.id)
            .eq('content_id', id);

          if (!interactionsError && interactionsData) {
            contentItem.user_has_liked = interactionsData.some(int => int.interaction_type === 'like');
            contentItem.user_has_saved = interactionsData.some(int => int.interaction_type === 'save');
          }
        }

        return contentItem;
      },
      enabled: !!id,
    });
  };

  // Fetch categories
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

        return data as DiscoverCategory[];
      },
    });
  };

  // Record content view
  const recordContentView = async (contentId: string) => {
    try {
      await supabase.from('discover_views').insert({
        content_id: contentId,
        user_id: user?.id,
        source: window.location.pathname,
        referrer: document.referrer,
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  // Create content
  const createContent = useMutation({
    mutationFn: async (newContent: Omit<DiscoverContent, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'trending_score'>) => {
      if (!user) throw new Error('You must be logged in to create content');

      const { data, error } = await supabase
        .from('discover_content')
        .insert({
          ...newContent,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discover-content'] });
      toast.success('Content created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create content: ${error.message}`);
    }
  });

  // Handle like/unlike content
  const toggleLike = useMutation({
    mutationFn: async ({ contentId, isLiked }: { contentId: string, isLiked: boolean }) => {
      if (!user) throw new Error('You must be logged in to like content');

      if (isLiked) {
        // Unlike - delete the interaction
        const { error } = await supabase
          .from('discover_interactions')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', contentId)
          .eq('interaction_type', 'like');

        if (error) throw error;
      } else {
        // Like - insert the interaction
        const { error } = await supabase
          .from('discover_interactions')
          .insert({
            user_id: user.id,
            content_id: contentId,
            interaction_type: 'like'
          });

        if (error) throw error;
      }

      return { contentId, isLiked: !isLiked };
    },
    onSuccess: (result) => {
      // Update the cache
      queryClient.invalidateQueries({ queryKey: ['discover-content'] });
      queryClient.invalidateQueries({ queryKey: ['discover-content', result.contentId] });
    },
    onError: (error: any) => {
      toast.error(`Action failed: ${error.message}`);
    }
  });

  // Handle save/unsave content
  const toggleSave = useMutation({
    mutationFn: async ({ contentId, isSaved }: { contentId: string, isSaved: boolean }) => {
      if (!user) throw new Error('You must be logged in to save content');

      if (isSaved) {
        // Unsave - delete the interaction
        const { error } = await supabase
          .from('discover_interactions')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', contentId)
          .eq('interaction_type', 'save');

        if (error) throw error;
      } else {
        // Save - insert the interaction
        const { error } = await supabase
          .from('discover_interactions')
          .insert({
            user_id: user.id,
            content_id: contentId,
            interaction_type: 'save'
          });

        if (error) throw error;
      }

      return { contentId, isSaved: !isSaved };
    },
    onSuccess: (result) => {
      // Update the cache
      queryClient.invalidateQueries({ queryKey: ['discover-content'] });
      queryClient.invalidateQueries({ queryKey: ['discover-content', result.contentId] });
      
      toast.success(result.isSaved ? 'Content saved' : 'Content removed from saved items');
    },
    onError: (error: any) => {
      toast.error(`Action failed: ${error.message}`);
    }
  });

  // Handle follow/unfollow
  const toggleFollow = useMutation({
    mutationFn: async ({ contentId, createdBy, isFollowing }: { contentId: string, createdBy: string, isFollowing: boolean }) => {
      if (!user) throw new Error('You must be logged in to follow users');
      if (createdBy === user.id) throw new Error('You cannot follow yourself');

      try {
        if (isFollowing) {
          // Unfollow
          await supabase
            .from('user_follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', createdBy);
        } else {
          // Follow
          await supabase
            .from('user_follows')
            .insert({
              follower_id: user.id,
              following_id: createdBy
            });
        }

        // Also update the discover interaction to track discover-originated follows
        if (isFollowing) {
          await supabase
            .from('discover_interactions')
            .delete()
            .eq('user_id', user.id)
            .eq('content_id', contentId)
            .eq('interaction_type', 'follow');
        } else {
          await supabase
            .from('discover_interactions')
            .insert({
              user_id: user.id,
              content_id: contentId,
              interaction_type: 'follow'
            });
        }

        return { createdBy, isFollowing: !isFollowing };
      } catch (error: any) {
        throw error;
      }
    },
    onSuccess: (result) => {
      toast.success(result.isFollowing ? 'Following user' : 'Unfollowed user');
    },
    onError: (error: any) => {
      toast.error(`Action failed: ${error.message}`);
    }
  });

  return {
    filters,
    setFilters,
    useDiscoverContent,
    useDiscoverContentById,
    useDiscoverCategories,
    createContent,
    toggleLike,
    toggleSave,
    toggleFollow
  };
}
