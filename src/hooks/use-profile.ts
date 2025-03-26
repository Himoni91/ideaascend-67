
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useFollow } from "./use-follow";
import { ProfileType } from "@/types/profile";

export function useProfile(profileId?: string) {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();
  const { followUser, unfollowUser, isFollowing, isLoading: isFollowLoading } = useFollow();
  
  // Get profile by ID
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", profileId || user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId || user?.id)
        .single();
        
      if (error) throw error;
      return data as ProfileType;
    },
    enabled: !!(profileId || user?.id),
  });
  
  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<ProfileType>) => {
      if (!user) throw new Error("Not authenticated");
      
      setIsUpdating(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });
  
  // Upload avatar
  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to upload an avatar");
      return null;
    }
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      setIsUpdating(true);
      
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from("profiles")
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error: any) {
      toast.error(`Error uploading avatar: ${error.message}`);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Get followers count
  const { data: followersCount = 0 } = useQuery({
    queryKey: ["followers-count", profileId || user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("user_follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profileId || user?.id);
        
      if (error) throw error;
      return count || 0;
    },
    enabled: !!(profileId || user?.id),
  });
  
  // Get following count
  const { data: followingCount = 0 } = useQuery({
    queryKey: ["following-count", profileId || user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("user_follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profileId || user?.id);
        
      if (error) throw error;
      return count || 0;
    },
    enabled: !!(profileId || user?.id),
  });
  
  // Check if the current user is the profile owner
  const isOwnProfile = user?.id === profileId || !profileId;
  
  return {
    profile,
    isLoading: isLoading || isUpdating,
    error,
    updateProfile: updateProfile.mutate,
    uploadAvatar,
    isUpdating,
    followersCount,
    followingCount,
    isOwnProfile,
    followUser,
    unfollowUser,
    isFollowing,
    isFollowLoading
  };
}
