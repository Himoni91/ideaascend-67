
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileType } from "@/types/profile";

type ProfileCompletionStep = {
  id: string;
  title: string;
  description: string;
  fields: (keyof ProfileType)[];
  isComplete: boolean;
  percentage: number;
};

export function useProfileCompletion() {
  const { user, profile } = useAuth();
  
  // Get profile completion percentage from DB
  const { data: completionData } = useQuery({
    queryKey: ["profile-completion", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User is required");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("profile_completion_percentage")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      return data.profile_completion_percentage || 0;
    },
    enabled: !!user,
    initialData: profile?.profile_completion_percentage || 0
  });
  
  // Define completion steps
  const steps: ProfileCompletionStep[] = [
    {
      id: "basic-info",
      title: "Basic Information",
      description: "Add your name, bio, and location",
      fields: ["full_name", "bio", "location"],
      isComplete: !!(profile?.full_name && profile?.bio && profile?.location),
      percentage: 30
    },
    {
      id: "profile-image",
      title: "Profile Image",
      description: "Upload a profile image",
      fields: ["avatar_url"],
      isComplete: !!profile?.avatar_url,
      percentage: 20
    },
    {
      id: "professional-info",
      title: "Professional Details",
      description: "Add your company, position, and expertise",
      fields: ["company", "position", "expertise"],
      isComplete: !!(profile?.company && profile?.position && profile?.expertise && profile.expertise.length > 0),
      percentage: 30
    },
    {
      id: "social-links",
      title: "Social Links",
      description: "Add your social media profiles",
      fields: ["linkedin_url", "twitter_url", "website"],
      isComplete: !!(profile?.linkedin_url || profile?.twitter_url || profile?.website),
      percentage: 20
    }
  ];
  
  // Calculate completed steps
  const completedSteps = steps.filter(step => step.isComplete);
  const nextStep = steps.find(step => !step.isComplete);
  
  // Calculate our own completion percentage
  const calculatedPercentage = completedSteps.reduce((acc, step) => acc + step.percentage, 0);
  
  return {
    completionPercentage: completionData,
    calculatedPercentage,
    steps,
    completedSteps,
    nextStep,
    totalSteps: steps.length,
    completedStepsCount: completedSteps.length
  };
}
