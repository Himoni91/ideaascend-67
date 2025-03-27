
import { useState, useEffect, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { ProfileType } from "@/types/profile";
import { Json } from "@/integrations/supabase/types";

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: ProfileType | null;
  isLoading: boolean;
  error: Error | null;
};

export function useAuthState() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      } 
      
      if (data) {
        // Create a complete ProfileType object with default values for missing fields
        const defaultBadge = { name: "New Member", icon: "👋", description: "Joined Idolyst", earned: true };
        const defaultStats = {
          followers: 0,
          following: 0,
          ideas: 0,
          mentorSessions: 0,
          posts: 0
        };
        
        // Handle badges conversion - ensure it's an array of the right structure
        let formattedBadges: ProfileType['badges'] = [defaultBadge];
        
        if (data.badges) {
          try {
            if (Array.isArray(data.badges)) {
              // Verify each item has the required structure before assigning
              formattedBadges = data.badges.filter((badge: any) => 
                typeof badge === 'object' && 
                badge !== null && 
                'name' in badge && 
                'icon' in badge && 
                'description' in badge && 
                'earned' in badge
              ) as ProfileType['badges'];
              
              // If the filter removed all items, use the default
              if (formattedBadges.length === 0) {
                formattedBadges = [defaultBadge];
              }
            }
          } catch (e) {
            console.error("Error parsing badges:", e);
            formattedBadges = [defaultBadge];
          }
        }
        
        // Handle stats conversion
        let formattedStats: ProfileType['stats'] = defaultStats;
        
        if (data.stats && typeof data.stats === 'object' && data.stats !== null) {
          try {
            formattedStats = {
              ...defaultStats,
              ...Object.entries(data.stats as object).reduce((acc, [key, value]) => {
                if (['followers', 'following', 'ideas', 'mentorSessions', 'posts', 'rank'].includes(key)) {
                  acc[key as keyof ProfileType['stats']] = 
                    typeof value === 'number' ? value : 
                    typeof value === 'string' ? parseInt(value, 10) || 0 : 0;
                }
                return acc;
              }, {} as Record<keyof ProfileType['stats'], number>)
            };
          } catch (e) {
            console.error("Error parsing stats:", e);
          }
        }
        
        const completeProfile: ProfileType = {
          ...data,
          // Add default values for required fields
          level: typeof data.level === 'number' ? data.level : 1,
          xp: typeof data.xp === 'number' ? data.xp : 0,
          badges: formattedBadges,
          stats: formattedStats
        };
        
        return completeProfile;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      const session = data.session;
      const user = session?.user ?? null;
      
      if (user) {
        const profile = await fetchProfile(user.id);
        setState({ session, user, profile, isLoading: false, error: null });
      } else {
        setState({ session: null, user: null, profile: null, isLoading: false, error: null });
      }
    } catch (error: any) {
      console.error("Error refreshing session:", error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: new Error(error.message || "Failed to refresh session") 
      }));
    }
  }, [fetchProfile]);

  useEffect(() => {
    // Set up auth state listener FIRST to prevent missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        const user = session?.user ?? null;
        
        setState(prev => ({ ...prev, session, user }));
        
        // Defer profile fetching to prevent deadlocks
        if (user) {
          setTimeout(async () => {
            const profile = await fetchProfile(user.id);
            setState(prev => ({ ...prev, profile }));
          }, 0);
        } else {
          setState(prev => ({ ...prev, profile: null }));
        }
      }
    );

    // Check for existing session
    refreshSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, refreshSession]);

  return {
    ...state,
    refreshSession,
  };
}
