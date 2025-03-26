
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ProfileType } from "@/types/profile";

type UserVerification = {
  email_verified: boolean;
  two_factor_enabled: boolean;
  two_factor_method: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: ProfileType | null;
  userVerification: UserVerification | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithLinkedIn: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<boolean>;
  setupTwoFactor: () => Promise<{ qrCode: string; secret: string } | null>;
  enableTwoFactor: (code: string) => Promise<boolean>;
  disableTwoFactor: (code: string) => Promise<boolean>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [userVerification, setUserVerification] = useState<UserVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const isAuthenticated = !!session && !!user;

  useEffect(() => {
    // Set up auth state listener FIRST to prevent missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetching to prevent deadlocks
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchUserVerification(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserVerification(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchUserVerification(session.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        // Create a complete ProfileType object with default values for missing fields
        const completeProfile: ProfileType = {
          ...data,
          // Add default values for the new required fields
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
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }

  async function fetchUserVerification(userId: string) {
    try {
      const { data, error } = await supabase
        .from("user_verification")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user verification:", error);
      } else if (data) {
        setUserVerification({
          email_verified: data.email_verified || false,
          two_factor_enabled: data.two_factor_enabled || false,
          two_factor_method: data.two_factor_method || 'app',
        });
      }
    } catch (error) {
      console.error("Error fetching user verification:", error);
    }
  }

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
      toast({
        title: "Error creating account",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Check if 2FA is required
      if (data.session && data.user) {
        const { data: verificationData } = await supabase
          .from("user_verification")
          .select("two_factor_enabled")
          .eq("id", data.user.id)
          .single();
        
        if (verificationData?.two_factor_enabled) {
          // Store partial session temporarily and redirect to 2FA page
          localStorage.setItem('partialSession', JSON.stringify(data.session));
          
          toast({
            title: "Two-factor authentication required",
            description: "Please enter your verification code to continue.",
          });
          
          navigate("/auth/two-factor");
          return;
        }
      }
      
      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Invalid email or password",
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
      toast({
        title: "Google sign in failed",
        description: error.message || "An unexpected error occurred",
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
      toast({
        title: "LinkedIn sign in failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any local storage related to authentication
      localStorage.removeItem('partialSession');
      
      toast({
        title: "Signed out successfully",
        description: "You've been signed out of your account.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "An unexpected error occurred",
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
      toast({
        title: "Password reset failed",
        description: error.message || "An unexpected error occurred",
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
      toast({
        title: "Password update failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    }
  }

  async function verifyTwoFactor(code: string): Promise<boolean> {
    try {
      // Get partial session from localStorage
      const partialSessionStr = localStorage.getItem('partialSession');
      if (!partialSessionStr) {
        throw new Error("No partial session found");
      }
      
      const partialSession = JSON.parse(partialSessionStr);
      
      // Verify 2FA code 
      // In a real implementation, this would include a proper 2FA validation logic
      const { data: verificationData, error: verificationError } = await supabase
        .from("user_verification")
        .select("*")
        .eq("id", partialSession.user.id)
        .single();
        
      if (verificationError) throw verificationError;
      
      // For demo purposes, any 6-digit code is valid
      // In a real implementation, we would use a proper TOTP verification
      if (code.length === 6 && /^\d+$/.test(code)) {
        // Restore the session
        await supabase.auth.setSession({
          access_token: partialSession.access_token,
          refresh_token: partialSession.refresh_token,
        });
        
        // Clear the partial session
        localStorage.removeItem('partialSession');
        
        toast({
          title: "Two-factor authentication successful",
          description: "You have been signed in successfully.",
        });
        
        navigate("/");
        return true;
      } else {
        toast({
          title: "Invalid verification code",
          description: "Please enter a valid 6-digit code.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  }

  async function setupTwoFactor(): Promise<{ qrCode: string; secret: string } | null> {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to set up two-factor authentication.",
          variant: "destructive",
        });
        return null;
      }
      
      // In a real implementation, we would generate a TOTP secret
      // For demo purposes, we're using placeholder values
      const secret = "EXAMPLETOTP234567";
      const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Idolyst:${user.email}?secret=${secret}&issuer=Idolyst`;
      
      return { qrCode, secret };
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message || "Failed to set up two-factor authentication",
        variant: "destructive",
      });
      return null;
    }
  }

  async function enableTwoFactor(code: string): Promise<boolean> {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to enable two-factor authentication.",
          variant: "destructive",
        });
        return false;
      }
      
      // For demo purposes, any 6-digit code is valid
      if (code.length === 6 && /^\d+$/.test(code)) {
        // Update the user_verification record
        const { error } = await supabase
          .from("user_verification")
          .update({
            two_factor_enabled: true,
            two_factor_method: 'app',
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id);
          
        if (error) throw error;
        
        // Update local state
        setUserVerification(prev => prev ? {
          ...prev,
          two_factor_enabled: true,
          two_factor_method: 'app',
        } : null);
        
        toast({
          title: "Two-factor authentication enabled",
          description: "Your account is now more secure.",
        });
        
        return true;
      } else {
        toast({
          title: "Invalid verification code",
          description: "Please enter a valid 6-digit code.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Failed to enable 2FA",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  }

  async function disableTwoFactor(code: string): Promise<boolean> {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to disable two-factor authentication.",
          variant: "destructive",
        });
        return false;
      }
      
      // For demo purposes, any 6-digit code is valid
      if (code.length === 6 && /^\d+$/.test(code)) {
        // Update the user_verification record
        const { error } = await supabase
          .from("user_verification")
          .update({
            two_factor_enabled: false,
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id);
          
        if (error) throw error;
        
        // Update local state
        setUserVerification(prev => prev ? {
          ...prev,
          two_factor_enabled: false,
        } : null);
        
        toast({
          title: "Two-factor authentication disabled",
          description: "Your account security has been updated.",
        });
        
        return true;
      } else {
        toast({
          title: "Invalid verification code",
          description: "Please enter a valid 6-digit code.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Failed to disable 2FA",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  }

  async function refreshSession() {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
    } catch (error: any) {
      console.error("Failed to refresh session:", error);
    }
  }

  const value = {
    session,
    user,
    profile,
    userVerification,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithLinkedIn,
    signOut,
    resetPassword,
    updatePassword,
    verifyTwoFactor,
    setupTwoFactor,
    enableTwoFactor,
    disableTwoFactor,
    refreshSession,
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
