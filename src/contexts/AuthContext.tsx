
import { createContext, useContext, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ProfileType } from "@/types/profile";
import { useAuthState } from "@/hooks/use-auth-state";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: ProfileType | null;
  isLoading: boolean;
  error: Error | null;
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithLinkedIn: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authState = useAuthState();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<Error | null>(null);

  const handleError = (error: any, defaultMessage: string) => {
    const errorMessage = error.message || defaultMessage;
    console.error("Auth error:", error);
    setAuthError(new Error(errorMessage));
    return errorMessage;
  };

  async function signUp(email: string, password: string, metadata?: { full_name?: string }) {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      
      toast({
        title: "Account created successfully",
        description: "Please check your email for the confirmation link.",
      });
      
      navigate("/auth/verification");
    } catch (error: any) {
      const message = handleError(error, "An unexpected error occurred during sign up");
      toast({
        title: "Error creating account",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
      
      navigate("/");
    } catch (error: any) {
      const message = handleError(error, "Invalid email or password");
      toast({
        title: "Sign in failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }

  async function signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      const message = handleError(error, "An unexpected error occurred during Google sign in");
      toast({
        title: "Google sign in failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }

  async function signInWithLinkedIn() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "linkedin_oidc",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      const message = handleError(error, "An unexpected error occurred during LinkedIn sign in");
      toast({
        title: "LinkedIn sign in failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You've been signed out of your account.",
      });
      
      navigate("/");
    } catch (error: any) {
      const message = handleError(error, "An unexpected error occurred during sign out");
      toast({
        title: "Sign out failed",
        description: message,
        variant: "destructive",
      });
    }
  }

  async function resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link.",
      });
      
      navigate("/auth/check-email");
    } catch (error: any) {
      const message = handleError(error, "An unexpected error occurred during password reset");
      toast({
        title: "Password reset failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }

  async function updatePassword(password: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Password updated successfully",
        description: "Your password has been changed. You can now sign in with your new password.",
      });
      
      navigate("/auth/sign-in");
    } catch (error: any) {
      const message = handleError(error, "An unexpected error occurred during password update");
      toast({
        title: "Password update failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }

  const value = {
    ...authState,
    error: authError || authState.error,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithLinkedIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession: authState.refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
