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

    return {
      ...data,
      level: data.level || Math.floor(Math.random() * 5) + 1,
      xp: data.xp || Math.floor(Math.random() * 2000) + 500,
      badges: badges,
      stats: stats
    } as ProfileType;
  };

  // Record profile view when viewing someone else's profile
  useEffect(() => {
    const recordProfileView = async () => {
      if (profileId && user?.id && profileId !== user.id) {
        try {
          await supabase
            .from("profile_views")
            .insert({
              profile_id: profileId,
              viewer_id: user.id
            });
        } catch (error) {
          console.error("Error recording profile view:", error);
        }
      }
    };
    
    if (profileId && user?.id && profileId !== user.id) {
      recordProfileView();
    }
  }, [profileId, user?.id]);

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
      
      return formatProfileData(data);
    },
    enabled: !!userId,
  });

  // Fetch followers and following
  const fetchConnections = async () => {
    if (!userId || !profile) return { followers: [], following: [] };
    
    try {
      const { data: followersData, error: followersError } = await supabase
        .from("user_follows")
        .select(`
          follower_id,
          followers:profiles!user_follows_follower_id_fkey(
            id, username, full_name, avatar_url, is_mentor, is_verified
          )
        `)
        .eq("following_id", userId)
        .limit(10);
      
      if (followersError) throw followersError;
      
      const { data: followingData, error: followingError } = await supabase
        .from("user_follows")
        .select(`
          following_id,
          following:profiles!user_follows_following_id_fkey(
            id, username, full_name, avatar_url, is_mentor, is_verified
          )
        `)
        .eq("follower_id", userId)
        .limit(10);
      
      if (followingError) throw followingError;
      
      const followers = followersData.map(f => {
        return f.followers as unknown as ProfileType;
      });
      
      const following = followingData.map(f => {
        return f.following as unknown as ProfileType;
      });
      
      return { 
        followers: followers.filter(Boolean), 
        following: following.filter(Boolean)
      };
    } catch (error) {
      console.error("Error fetching connections:", error);
      return { followers: [], following: [] };
    }
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
      const filePath = `${user.id}/${fileName}`;
      
      setIsUpdating(true);
      
      const { error: uploadError } = await supabase.storage
        .from("profile_images")
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from("profile_images")
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
  
  // Get profile views count
  const { data: profileViewsCount = 0 } = useQuery({
    queryKey: ["profile-views-count", profileId || user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileId || user?.id);
        
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
    profileViewsCount,
    isOwnProfile,
    followUser,
    unfollowUser,
    isFollowing,
    isFollowLoading
  };
};
