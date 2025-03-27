
import { useState, useEffect, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { ProfileType } from "@/types/profile";

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
        const completeProfile: ProfileType = {
          ...data,
          // Add default values for required fields
          level: data.level || 1,
          xp: data.xp || 0,
          badges: Array.isArray(data.badges) 
            ? data.badges 
            : [{ name: "New Member", icon: "👋", description: "Joined Idolyst", earned: true }],
          stats: typeof data.stats === 'object' && data.stats !== null 
            ? data.stats as ProfileType['stats']
            : {
                followers: 0,
                following: 0,
                ideas: 0,
                mentorSessions: 0,
                posts: 0
              }
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
