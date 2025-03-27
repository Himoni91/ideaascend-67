
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePostViews(postId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Record a view when someone visits the post
  const recordView = useMutation({
    mutationFn: async (viewedPostId: string) => {
      if (!viewedPostId) throw new Error("Post ID is required");
      
      // Use a database function to increment view count
      const { error } = await supabase.rpc('increment_view_count', { 
        post_id: viewedPostId 
      });
        
      if (error) throw error;
      
      // If user is logged in, record who viewed the post
      if (user?.id) {
        await supabase
          .from("post_views")
          .upsert({
            post_id: viewedPostId,
            viewer_id: user.id,
            viewed_at: new Date().toISOString()
          }, { onConflict: 'post_id,viewer_id' });
      }
    },
    onSuccess: () => {
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["post", postId] });
        queryClient.invalidateQueries({ queryKey: ["post-views-count", postId] });
      }
    },
    onError: (error) => {
      console.error("Error recording post view:", error);
    }
  });

  // Get view count for a post
  const { data: viewersCount } = useQuery({
    queryKey: ["post-views-count", postId],
    queryFn: async () => {
      if (!postId) return 0;
      
      const { data, error } = await supabase
        .from("posts")
        .select("view_count")
        .eq("id", postId)
        .single();
        
      if (error) throw error;
      return data?.view_count || 0;
    },
    enabled: !!postId,
  });

  // Record a view when the component mounts
  useEffect(() => {
    if (postId) {
      recordView.mutate(postId);
    }
  }, [postId]);

  return {
    viewCount: viewersCount || 0,
    isLoading: isLoading,
    recordView: recordView.mutate
  };
}
