
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: AuthError | null;
  profile: any | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, metadata?: object) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: any) => Promise<{ error: any | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithLinkedIn: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user as User || null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user as User || null);
      
      if (initialSession?.user) {
        // Fetch additional profile data if needed
        fetchUserProfileData(initialSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfileData = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile data:', error);
        return;
      }

      // Update user with profile data including is_mentor
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          is_mentor: profile.is_mentor || false,
          profile: {
            avatar_url: profile.avatar_url,
            full_name: profile.full_name,
            username: profile.username,
            bio: profile.bio,
            expertise: profile.expertise,
            mentor_hourly_rate: profile.mentor_hourly_rate
          }
        };
      });

      // Also set profile data separately for components that need it
      setProfile(profile);
    } catch (error) {
      console.error('Error in profile fetch:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error);
      return { error };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    }
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: metadata }
      });
      if (error) setError(error);
      return { error };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await supabase.auth.signOut();
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      console.error("Sign out error:", authError);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) setError(error);
      return { error };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      if (error) setError(error);
      return { error };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    }
  };

  const refreshSession = async () => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        setError(error);
        console.error("Session refresh error:", error);
      } else {
        setSession(data.session);
        setUser(data.session?.user as User || null);
      }
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      console.error("Session refresh error:", authError);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) setError(error);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      console.error("Google sign in error:", authError);
    }
  };

  const signInWithLinkedIn = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) setError(error);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      console.error("LinkedIn sign in error:", authError);
    }
  };

  const updateUserProfile = async (updates: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);
      
      if (!error && user) {
        // Update local user state with new profile data
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            is_mentor: updates.is_mentor !== undefined ? updates.is_mentor : prev.is_mentor,
            profile: {
              ...prev.profile,
              ...updates
            }
          };
        });

        // Also update the separate profile state
        setProfile(prev => ({
          ...prev,
          ...updates
        }));
      }
      
      return { error };
    } catch (err) {
      return { error: err };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    error,
    profile,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    resetPassword,
    updatePassword,
    refreshSession,
    signInWithGoogle,
    signInWithLinkedIn
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
