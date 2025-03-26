
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ExtendedProfileType, UserRole } from "@/types/profile-extended";
import { toast } from "sonner";

export function useExtendedProfile(usernameOrId?: string) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ExtendedProfileType | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Determine if we're loading the current user's profile or someone else's
        const targetId = usernameOrId 
          ? usernameOrId.includes('-') 
            ? usernameOrId  // It's a UUID, use directly
            : null          // It's a username, we'll query by username
          : user?.id;       // No param, use current user id
        
        // If we have no target ID and no user is logged in, return early
        if (!targetId && !usernameOrId && !user) {
          setIsLoading(false);
          return;
        }

        let query = supabase.from('profiles').select('*');
        
        // Query by ID or username
        if (targetId) {
          query = query.eq('id', targetId);
        } else if (usernameOrId) {
          query = query.eq('username', usernameOrId);
        }

        const { data, error: profileError } = await query.single();

        if (profileError) {
          throw profileError;
        }

        // Set isOwnProfile flag
        const isOwnProfile = user?.id === data.id;
        setIsOwnProfile(isOwnProfile);

        // If it's the user's own profile, also load their roles
        if (isOwnProfile && user) {
          try {
            const { data: rolesData, error: rolesError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id);
              
            if (!rolesError && rolesData) {
              setRoles(rolesData.map((r: any) => r.role));
            }
          } catch (err) {
            console.error('Error fetching roles:', err);
          }
        }

        // Ensure proper structure of jsonb arrays
        const formattedProfile: ExtendedProfileType = {
          ...data,
          // Cast any types we know could be different between DB and our type system
          education: Array.isArray(data.education) ? data.education : [],
          work_experience: Array.isArray(data.work_experience) ? data.work_experience : [],
          skills: Array.isArray(data.skills) ? data.skills : [],
          achievements: Array.isArray(data.achievements) ? data.achievements : [],
          portfolio_items: Array.isArray(data.portfolio_items) ? data.portfolio_items : [],
          social_links: data.social_links || {},
          verification_documents: Array.isArray(data.verification_documents) ? data.verification_documents : [],
          verification_status: data.verification_status || 'unverified',
          onboarding_completed: !!data.onboarding_completed,
          onboarding_step: data.onboarding_step || 1,
          // Handle other potential type mismatches
          badges: Array.isArray(data.badges) 
            ? data.badges 
            : [{ name: "New Member", icon: "👋", description: "Welcome to Idolyst", earned: true }],
          stats: data.stats || {
            followers: 0,
            following: 0,
            ideas: 0,
            mentorSessions: 0,
            posts: 0
          }
        };

        setProfile(formattedProfile);
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
    
    // Subscribe to real-time changes if it's the user's own profile
    if (user?.id) {
      const channel = supabase
        .channel(`profile-changes-${user.id}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          (payload) => {
            if (payload.new) {
              setProfile(prev => prev ? { ...prev, ...payload.new } : payload.new as ExtendedProfileType);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, usernameOrId]);

  async function updateProfile(updates: Partial<ExtendedProfileType>) {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      navigate("/auth/sign-in");
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Ensure user can only update their own profile
      if (!isOwnProfile) {
        throw new Error("You can only update your own profile");
      }
      
      // Generate the correct object to update, handling nested objects properly
      const profileId = profile?.id || user.id;
      
      // Update the profile
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;
      
      toast.success("Profile updated successfully");
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      return profileId;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || "Failed to update profile");
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }

  async function uploadAvatar(file: File): Promise<string> {
    if (!user) {
      toast.error("You must be logged in to update your avatar");
      navigate("/auth/sign-in");
      throw new Error("Not authenticated");
    }
    
    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload the file
      const { error: uploadError, data } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || "Failed to upload avatar");
      throw error;
    }
  }

  async function submitVerification(documents: File[]): Promise<void> {
    if (!user) {
      toast.error("You must be logged in to submit verification");
      navigate("/auth/sign-in");
      return;
    }
    
    try {
      // First create a storage bucket if it doesn't exist
      try {
        // Check if the bucket exists by trying to get a file (this will fail if the bucket doesn't exist)
        await supabase.storage.from('verification').download('test.txt');
      } catch (error) {
        // Bucket likely doesn't exist, create it
        try {
          await supabase.storage.createBucket('verification', {
            public: false,
            fileSizeLimit: 5242880 // 5MB
          });
        } catch (createError) {
          // If it fails but not because it already exists, rethrow
          if (!(createError as Error).message.includes('already exists')) {
            throw createError;
          }
        }
      }
      
      // Upload each document and gather URLs
      const documentUrls = [];
      
      for (let i = 0; i < documents.length; i++) {
        const file = documents[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `verification/${user.id}/${i}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('verification')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('verification')
          .getPublicUrl(filePath);
          
        documentUrls.push({
          url: publicUrl,
          name: file.name,
          type: file.type,
          size: file.size
        });
      }
      
      // Update profile verification status using our updateProfile function
      await updateProfile({
        verification_status: 'pending',
        verification_documents: documentUrls
      });
      
      toast.success("Verification request submitted successfully");
      
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      toast.error(error.message || "Failed to submit verification");
      throw error;
    }
  }

  async function updateOnboardingStep(step: number, completed: boolean = false): Promise<void> {
    if (!user) {
      toast.error("You must be logged in to update onboarding");
      navigate("/auth/sign-in");
      return;
    }
    
    try {
      await updateProfile({
        onboarding_step: step,
        onboarding_completed: completed
      });
      
    } catch (error: any) {
      console.error('Error updating onboarding step:', error);
      toast.error(error.message || "Failed to update onboarding step");
      throw error;
    }
  }

  return {
    profile,
    roles,
    isLoading,
    isUpdating,
    error,
    isOwnProfile,
    updateProfile,
    uploadAvatar,
    submitVerification,
    updateOnboardingStep
  };
}
