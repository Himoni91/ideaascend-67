
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
      
      // In a production app, these would come from separate API calls
      // For MVP, we'll simulate the data with mock values
      return {
        ...data,
        level: Math.floor(Math.random() * 5) + 1, // Level 1-5
        xp: Math.floor(Math.random() * 2000) + 500, // XP between 500-2500
        badges: [
          { name: "First Post", icon: "📝", description: "Published your first post on Idolyst", earned: true },
          { name: "Idea Maker", icon: "💡", description: "Submitted your first idea to PitchHub", earned: true },
          { name: "Connector", icon: "🔗", description: "Connected with 10+ other members", earned: Math.random() > 0.5 },
          { name: "Rising Star", icon: "⭐", description: "Reached level 5 on the platform", earned: Math.random() > 0.7 },
          { name: "Thought Leader", icon: "🧠", description: "Had a post with 50+ likes", earned: Math.random() > 0.8 },
          { name: "Innovator", icon: "🚀", description: "Had a PitchHub idea with 100+ votes", earned: Math.random() > 0.9 },
          { name: "Mentor", icon: "👨‍🏫", description: "Conducted 5+ mentoring sessions", earned: data.is_mentor },
          { name: "Verified Pro", icon: "✅", description: "Verified professional status", earned: data.is_verified }
        ],
        stats: {
          followers: Math.floor(Math.random() * 300) + 50,
          following: Math.floor(Math.random() * 150) + 20,
          ideas: Math.floor(Math.random() * 10) + 1,
          mentorSessions: data.is_mentor ? Math.floor(Math.random() * 20) + 5 : 0,
          posts: Math.floor(Math.random() * 20) + 3,
          rank: Math.floor(Math.random() * 100) + 1
        }
      } as ProfileType;
    },
    enabled: !!userId,
  });

  // Fetch followers and following
  const fetchConnections = async () => {
    if (!userId || !profile) return;
    
    // In production, these would be real API calls
    // For MVP, we'll simulate the connection data
    const followers = Array(profile.stats?.followers || 0)
      .fill(null)
      .map((_, i) => ({
        id: `follower-${i}`,
        username: `user${i}`,
        full_name: `User ${i}`,
        avatar_url: null,
        is_mentor: Math.random() > 0.8,
        is_verified: Math.random() > 0.7
      })).slice(0, 10) as ProfileType[];
    
    const following = Array(profile.stats?.following || 0)
      .fill(null)
      .map((_, i) => ({
        id: `following-${i}`,
        username: `mentor${i}`,
        full_name: `Mentor ${i}`,
        avatar_url: null,
        is_mentor: Math.random() > 0.5,
        is_verified: Math.random() > 0.6
      })).slice(0, 10) as ProfileType[];
    
    return { followers, following };
  };

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
      queryClient.setQueryData(["profile", userId], (old: ProfileType) => ({
        ...old,
        ...data
      }));
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + (error as Error).message);
    },
  });

  // Set up real-time subscription for profile changes
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
          queryClient.setQueryData(["profile", userId], (oldData: ProfileType | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              ...payload.new,
            };
          });
          
          toast.info("Profile has been updated");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  // Fetch connections when profile is loaded
  useEffect(() => {
    if (profile) {
      fetchConnections().then((connections) => {
        if (connections) {
          queryClient.setQueryData(["profile", userId], (oldData: ProfileType | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              followers: connections.followers,
              following: connections.following,
            };
          });
        }
      });
    }
  }, [profile?.id]);

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfile.mutate,
    isCurrentUser,
  };
};
