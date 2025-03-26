
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileAbout from "@/components/profile/ProfileAbout";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileContent from "@/components/profile/ProfileContent";
import ProfileEditModal from "@/components/profile/ProfileEditModal";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // If no ID provided, show current user's profile
  const { profile, isLoading, error, updateProfile, isCurrentUser } = useProfile(id || user?.id);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-idolyst-blue" />
          <span className="ml-2 text-lg text-gray-600 dark:text-gray-300">Loading profile...</span>
        </div>
      </AppLayout>
    );
  }

  if (error || !profile) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300">
            {error ? `Error: ${(error as Error).message}` : "The requested profile could not be found."}
          </p>
        </div>
      </AppLayout>
    );
  }

  const handleSaveProfile = (updatedProfile: Partial<typeof profile>) => {
    updateProfile(updatedProfile);
    setEditModalOpen(false);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <ProfileHeader 
          profile={profile} 
          isCurrentUser={isCurrentUser} 
          onEdit={() => setEditModalOpen(true)} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Profile Details */}
          <div className="md:col-span-1">
            <ProfileAbout profile={profile} />
            <ProfileStats profile={profile} />
          </div>
          
          {/* Right Column - Content Tabs */}
          <div className="md:col-span-2">
            <ProfileContent profile={profile} />
          </div>
        </div>
        
        {/* Edit Profile Modal */}
        <ProfileEditModal 
          profile={profile}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      </div>
    </AppLayout>
  );
};

export default Profile;
