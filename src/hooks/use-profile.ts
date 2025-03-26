import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileType } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";

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
            badges: data.badges || [
              { name: "New Member", icon: "👋", description: "Joined Idolyst", earned: true },
            ],
            stats: data.stats || {
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
                ...updatedData
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
