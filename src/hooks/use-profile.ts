import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProfileType } from "@/types/profile";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";
import { useFollow } from "./use-follow";

export const useProfile = (profileId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = profileId || user?.id;
  const isCurrentUser = userId === user?.id;
  const [isUpdating, setIsUpdating] = useState(false);
  const { followUser, unfollowUser, isFollowing, isLoading: isFollowLoading } = useFollow();

  // Helper function to parse and convert JSON to strongly typed formats
  const formatProfileData = (data: any): ProfileType => {
    // Default values
    const defaultBadges = [
      { name: "New Member", icon: "👋", description: "Welcome to Idolyst", earned: true }
    ];
    
    const defaultStats = {
      followers: 0,
      following: 0,
      ideas: 0,
      mentorSessions: 0,
      posts: 0,
      rank: Math.floor(Math.random() * 100) + 1
    };

    // Parse badges from JSON
    let badges = defaultBadges;
    try {
      if (data.badges) {
        if (Array.isArray(data.badges)) {
          badges = data.badges as any;
        } else if (typeof data.badges === 'object') {
          badges = Object.values(data.badges);
        }
      }
    } catch (e) {
      console.error("Error parsing badges:", e);
    }

    // Parse stats from JSON
    let stats = defaultStats;
    try {
      if (data.stats) {
        if (typeof data.stats === 'object' && !Array.isArray(data.stats)) {
          stats = {
            ...defaultStats,
            ...data.stats
          };
        }
      }
    } catch (e) {
      console.error("Error parsing stats:", e);
    }

    // Return formatted profile
    return {
      ...data,
      level: data.level || Math.floor(Math.random() * 5) + 1,
      xp: data.xp || Math.floor(Math.random() * 2000) + 500,
      badges: badges,
      stats: stats
    } as ProfileType;
  };

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
      
      // Format the data with proper type conversions
      return formatProfileData(data);
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
};
