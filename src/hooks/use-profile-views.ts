
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileType } from "@/types/profile";

// Define a proper type for profile view data
interface ProfileView {
  id: string;
  viewed_at: string;
  viewer_id: string | null;
  is_anonymous: boolean;
  profiles?: {
    id?: string;
    username?: string;
    full_name?: string;
    avatar_url?: string | null;
  } | null;
}

export function useProfileViews(profileId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Record a view when someone visits the profile
  const recordView = useMutation({
    mutationFn: async (viewedProfileId: string) => {
      if (!viewedProfileId) throw new Error("Profile ID is required");
      if (viewedProfileId === user?.id) return; // Don't record a view of your own profile
      
      const { error } = await supabase
        .from("profile_views")
        .insert({
          profile_id: viewedProfileId,
          viewer_id: user?.id || null,
          is_anonymous: !user
        });
        
      if (error) throw error;
    },
    onError: (error) => {
      console.error("Error recording profile view:", error);
    }
  });

  // Get profile views
  const { data: viewsData, isLoading: viewsLoading } = useQuery({
    queryKey: ["profile-views", profileId || user?.id],
    queryFn: async () => {
      const targetId = profileId || user?.id;
      if (!targetId) throw new Error("No profile ID available");
      
      const { data, error } = await supabase
        .from("profile_views")
        .select(`
          id,
          viewed_at,
          viewer_id,
          is_anonymous,
          profiles:viewer_id(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("profile_id", targetId)
        .order("viewed_at", { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      // Convert any potential errors to a safe format with default values
      return (data || []).map((view: any): ProfileView => ({
        id: view.id,
        viewed_at: view.viewed_at,
        viewer_id: view.viewer_id,
        is_anonymous: view.is_anonymous,
        profiles: view.profiles || null
      }));
    },
    enabled: !!(profileId || user?.id),
  });
  
  // Get unique viewers count
  const { data: viewersCount } = useQuery({
    queryKey: ["profile-viewers-count", profileId || user?.id],
    queryFn: async () => {
      const targetId = profileId || user?.id;
      if (!targetId) throw new Error("No profile ID available");
      
      const { count, error } = await supabase
        .from("profile_views")
        .select("viewer_id", { count: "exact", head: true })
        .eq("profile_id", targetId);
        
      if (error) throw error;
      return count || 0;
    },
    enabled: !!(profileId || user?.id),
  });

  // Record a view when the component mounts
  useEffect(() => {
    if (profileId && profileId !== user?.id) {
      recordView.mutate(profileId);
    }
  }, [profileId, user?.id]);

  return {
    views: viewsData || [],
    viewersCount: viewersCount || 0,
    isLoading: viewsLoading || isLoading,
    recordView: recordView.mutate
  };
}
