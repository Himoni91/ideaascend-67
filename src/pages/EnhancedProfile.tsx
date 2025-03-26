
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExtendedProfile } from "@/hooks/use-extended-profile";
import AppLayout from "@/components/layout/AppLayout";
import ProfileEnhancedHeader from "@/components/profile/ProfileEnhancedHeader";
import ProfileAdvancedContent from "@/components/profile/ProfileAdvancedContent";
import EnhancedProfileEditModal from "@/components/profile/EnhancedProfileEditModal";
import ProfileOnboarding from "@/components/profile/ProfileOnboarding";
import ProfileVerification from "@/components/profile/ProfileVerification";
import ProfileConnections from "@/components/profile/ProfileConnections";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { ArrowLeft } from "lucide-react";
import { ExtendedProfileType } from "@/types/profile-extended";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function EnhancedProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
    isOwnProfile
  } = useExtendedProfile(username || undefined);

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sorry, we couldn't find the profile you're looking for.
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (updatedProfile: Partial<ExtendedProfileType>) => {
    try {
      await updateProfile(updatedProfile);
      setIsEditModalOpen(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 pb-8">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center text-muted-foreground mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          ) : profile ? (
            <>
              {isOwnProfile && !profile.onboarding_completed && (
                <ProfileOnboarding profile={profile} />
              )}
              
              <ProfileEnhancedHeader 
                profile={profile} 
                isCurrentUser={isOwnProfile} 
                onEdit={handleEdit} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="md:col-span-2">
                  <ProfileAdvancedContent profile={profile} isOwnProfile={isOwnProfile} />
                </div>
                <div>
                  <div className="space-y-6 sticky top-20">
                    <ProfileVerification profile={profile} />
                    <ProfileConnections profile={profile} />
                  </div>
                </div>
              </div>
              
              {isOwnProfile && (
                <EnhancedProfileEditModal
                  profile={profile}
                  isOpen={isEditModalOpen}
                  onClose={() => setIsEditModalOpen(false)}
                  onSave={handleSaveProfile}
                  onUploadAvatar={uploadAvatar}
                />
              )}
            </>
          ) : null}
        </div>
      </PageTransition>
    </AppLayout>
  );
}
