
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Post } from "@/types/post";
import { useDebounce } from "@/hooks/use-debounce";

export function usePostSearch(initialQuery: string = '') {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  const {
    data: searchResults,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["post-search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_user_id_fkey(*),
          categories:post_categories(
            category:categories(*)
          )
        `)
        .or(`content.ilike.%${debouncedQuery}%`)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      
      // Transform the data to match Post type
      return data.map((post: any) => {
        // Transform categories
        const categories = post.categories.map((pc: any) => pc.category);
        
        return {
          ...post,
          categories,
          isTrending: post.trending_score > 50
        };
      });
    },
    enabled: debouncedQuery.length >= 2,
  });
  
  return {
    searchQuery,
    setSearchQuery,
    searchResults: searchResults as Post[] || [],
    isLoading,
    error,
    refetch
  };
}
