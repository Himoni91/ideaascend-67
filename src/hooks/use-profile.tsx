
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProfileType } from "@/types/profile";
import { useAuth } from "@/contexts/AuthContext";

export const useProfile = (profileId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = profileId || user?.id;
  const isCurrentUser = userId === user?.id;

  // Fetch profile data
  const { 
    data: profile, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) throw error;
      
      // For demo/MVP purposes, we'll add some mock data for the UI elements
      // In production, these would come from separate tables
      return {
        ...data,
        level: 3,
        xp: 1250,
        badges: [
          { name: "First Post", icon: "📝" },
          { name: "Idea Maker", icon: "💡" },
          { name: "Connector", icon: "🔗" },
        ],
        stats: {
          followers: 248,
          following: 124,
          ideas: 5,
          mentorSessions: 12
        }
      } as ProfileType;
    },
    enabled: !!userId,
  });

  // Update profile
  const updateProfile = useMutation({
    mutationFn: async (updatedProfile: Partial<ProfileType>) => {
      if (!userId) throw new Error("User ID is required");
      
      const { data, error } = await supabase
        .from("profiles")
        .update(updatedProfile)
        .eq("id", userId)
        .select("*")
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", userId], data);
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + (error as Error).message);
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          queryClient.setQueryData(["profile", userId], (oldData: ProfileType) => ({
            ...oldData,
            ...payload.new,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfile.mutate,
    isCurrentUser,
  };
};
