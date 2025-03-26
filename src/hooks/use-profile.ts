
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileType } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

export function useProfile(profileId?: string) {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch profile with realtime updates
  useEffect(() => {
    if (!profileId) return;

    setIsLoading(true);
    setError(null);

    // Check if this is the current user's profile
    setIsCurrentUser(profileId === user?.id);

    // If this is the current user and we already have their profile from auth context
    if (isCurrentUser && authProfile) {
      setProfile(authProfile);
      setIsLoading(false);
      return;
    }

    // Otherwise fetch the profile
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .single();

        if (error) {
          setError(new Error(error.message));
        } else if (data) {
          // Create a complete ProfileType object with default values
          const completeProfile: ProfileType = {
            ...data,
            level: data.level || 1,
            xp: data.xp || 0,
            badges: Array.isArray(data.badges) 
              ? (data.badges as any[]).map(badge => ({
                  name: badge.name || '',
                  icon: badge.icon || '',
                  description: badge.description || '',
                  earned: badge.earned || false
                }))
              : [{ name: "New Member", icon: "👋", description: "Joined Idolyst", earned: true }],
            stats: typeof data.stats === 'object' && data.stats !== null
              ? {
                  followers: (data.stats as any).followers || 0,
                  following: (data.stats as any).following || 0,
                  ideas: (data.stats as any).ideas || 0,
                  mentorSessions: (data.stats as any).mentorSessions || 0,
                  posts: (data.stats as any).posts || 0,
                  rank: (data.stats as any).rank || undefined
                }
              : {
                  followers: 0,
                  following: 0,
                  ideas: 0,
                  mentorSessions: 0,
                  posts: 0
                }
          };
          setProfile(completeProfile);
        }
      } catch (error: any) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();

    // Set up realtime subscription for profile changes
    const channel = supabase
      .channel(`profile-${profileId}`)
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${profileId}` },
          (payload) => {
            const updatedData = payload.new as any;
            setProfile(prevProfile => {
              if (!prevProfile) return null;
              return {
                ...prevProfile,
                ...updatedData,
                badges: Array.isArray(updatedData.badges) 
                  ? updatedData.badges.map((badge: any) => ({
                      name: badge.name || '',
                      icon: badge.icon || '',
                      description: badge.description || '',
                      earned: badge.earned || false
                    }))
                  : prevProfile.badges,
                stats: typeof updatedData.stats === 'object' && updatedData.stats !== null
                  ? {
                      followers: (updatedData.stats as any).followers || prevProfile.stats.followers,
                      following: (updatedData.stats as any).following || prevProfile.stats.following,
                      ideas: (updatedData.stats as any).ideas || prevProfile.stats.ideas,
                      mentorSessions: (updatedData.stats as any).mentorSessions || prevProfile.stats.mentorSessions,
                      posts: (updatedData.stats as any).posts || prevProfile.stats.posts,
                      rank: (updatedData.stats as any).rank || prevProfile.stats.rank
                    }
                  : prevProfile.stats
              };
            });
          }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, user?.id, authProfile, isCurrentUser]);

  // Update profile function
  const updateProfile = async (updates: Partial<ProfileType>) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  return { profile, isLoading, error, updateProfile, isCurrentUser };
}
