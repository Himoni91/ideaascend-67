
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DiscoverContent, DiscoverCategory, DiscoverFilter } from "@/types/discover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export {
  DiscoverContent,
  DiscoverCategory,
  DiscoverFilter
};

export function useDiscover() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<DiscoverFilter>({
    contentType: undefined,
    searchTerm: "",
    tags: undefined,
    category: undefined,
    sortBy: "latest",
    featured: false
  });

  // Fetch content based on filters
  const useDiscoverContent = (customFilters?: DiscoverFilter) => {
    const activeFilters = customFilters || filters;
    
    return useQuery({
      queryKey: ["discover-content", activeFilters],
      queryFn: async () => {
        let query = supabase
          .from("discover_content")
          .select(`
            *,
            profile: created_by (
              id,
              username,
              full_name,
              avatar_url,
              is_verified,
              position,
              company
            )
          `);
        
        // Apply filters
        if (activeFilters.contentType) {
          query = query.eq("content_type", activeFilters.contentType);
        }
        
        if (activeFilters.searchTerm) {
          query = query.or(`title.ilike.%${activeFilters.searchTerm}%,description.ilike.%${activeFilters.searchTerm}%`);
        }
        
        if (activeFilters.tags && activeFilters.tags.length > 0) {
          query = query.contains('tags', activeFilters.tags);
        }
        
        if (activeFilters.category) {
          query = query.eq('category', activeFilters.category);
        }
        
        if (activeFilters.featured) {
          query = query.eq('is_featured', true);
        }
        
        // Apply sorting
        switch(activeFilters.sortBy) {
          case "trending":
            query = query.order('trending_score', { ascending: false });
            break;
          case "popular":
            query = query.order('view_count', { ascending: false });
            break;
          case "latest":
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }
        
        const { data, error } = await query.limit(50);
        
        if (error) throw error;
        
        return data || [];
      },
      staleTime: 1000 * 60, // 1 minute
    });
  };

  // Fetch content by ID
  const useDiscoverContentById = (id?: string) => {
    return useQuery({
      queryKey: ["discover-content", id],
      queryFn: async () => {
        if (!id) throw new Error("Content ID is required");
        
        const { data, error } = await supabase
          .from("discover_content")
          .select(`
            *,
            profile: created_by (
              id,
              username,
              full_name,
              avatar_url,
              is_verified,
              position,
              company
            )
          `)
          .eq("id", id)
          .single();
        
        if (error) throw error;
        
        return data as DiscoverContent;
      },
      staleTime: 1000 * 60, // 1 minute
      enabled: !!id
    });
  };

  // Fetch categories
  const useDiscoverCategories = () => {
    return useQuery({
      queryKey: ["discover-categories"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("discover_categories")
          .select("*")
          .order("name");
        
        if (error) throw error;
        
        return data as DiscoverCategory[];
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Toggle like on content
  const toggleLike = useMutation({
    mutationFn: async ({ contentId, isLiked }: { contentId: string, isLiked: boolean }) => {
      if (isLiked) {
        const { error } = await supabase
          .from("discover_interactions")
          .delete()
          .eq("content_id", contentId)
          .eq("interaction_type", "like");
        
        if (error) throw error;
        
        return { contentId, action: "unliked" };
      } else {
        const { error } = await supabase
          .from("discover_interactions")
          .insert({
            content_id: contentId,
            interaction_type: "like"
          });
        
        if (error) throw error;
        
        return { contentId, action: "liked" };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["discover-content"] });
      toast.success(`Content ${data.action}`);
    },
    onError: (error) => {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    }
  });

  // Toggle save content
  const toggleSave = useMutation({
    mutationFn: async ({ contentId, isSaved }: { contentId: string, isSaved: boolean }) => {
      if (isSaved) {
        const { error } = await supabase
          .from("discover_interactions")
          .delete()
          .eq("content_id", contentId)
          .eq("interaction_type", "save");
        
        if (error) throw error;
        
        return { contentId, action: "unsaved" };
      } else {
        const { error } = await supabase
          .from("discover_interactions")
          .insert({
            content_id: contentId,
            interaction_type: "save"
          });
        
        if (error) throw error;
        
        return { contentId, action: "saved" };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["discover-content"] });
      toast.success(`Content ${data.action}`);
    },
    onError: (error) => {
      console.error("Error toggling save:", error);
      toast.error("Failed to update saved status");
    }
  });

  // Toggle follow user
  const toggleFollow = useMutation({
    mutationFn: async ({ createdBy, isFollowing }: { contentId: string, createdBy: string, isFollowing: boolean }) => {
      if (isFollowing) {
        const { error } = await supabase
          .from("user_follows")
          .delete()
          .eq("following_id", createdBy);
        
        if (error) throw error;
        
        return { createdBy, action: "unfollowed" };
      } else {
        const { error } = await supabase
          .from("user_follows")
          .insert({
            following_id: createdBy
          });
        
        if (error) throw error;
        
        return { createdBy, action: "followed" };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["discover-content"] });
      toast.success(`User ${data.action}`);
    },
    onError: (error) => {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    }
  });

  return {
    filters,
    setFilters,
    useDiscoverContent,
    useDiscoverContentById,
    useDiscoverCategories,
    toggleLike,
    toggleSave,
    toggleFollow
  };
}
