
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileAbout from "@/components/profile/ProfileAbout";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileContent from "@/components/profile/ProfileContent";
import ProfileEditModal from "@/components/profile/ProfileEditModal";
import ProfileMentor from "@/components/profile/ProfileMentor";
import ProfileConnections from "@/components/profile/ProfileConnections";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  // If no ID provided, show current user's profile
  const { profile, isLoading, error, updateProfile, isCurrentUser } = useProfile(id || user?.id);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, y: -20 }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  useEffect(() => {
    // Scroll to top when profile changes
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-idolyst-blue mb-4" />
          <span className="text-lg text-gray-600 dark:text-gray-300">Loading profile...</span>
        </div>
      </AppLayout>
    );
  }

  if (error || !profile) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error ? `Error: ${(error as Error).message}` : "The requested profile could not be found."}
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
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
      <motion.div 
        className="max-w-4xl mx-auto px-4 sm:px-6 pb-20"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        {/* Back Button (when viewing someone else's profile) */}
        {!isCurrentUser && (
          <motion.div 
            className="mb-4" 
            variants={itemVariants}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </motion.div>
        )}
        
        {/* Profile Header */}
        <motion.div variants={itemVariants}>
          <ProfileHeader 
            profile={profile} 
            isCurrentUser={isCurrentUser} 
            onEdit={() => setEditModalOpen(true)} 
          />
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Profile Details */}
          <motion.div 
            className="md:col-span-1 space-y-6"
            variants={itemVariants}
          >
            <ProfileAbout profile={profile} />
            <ProfileStats profile={profile} />
            <ProfileConnections profile={profile} />
            {profile.is_mentor && <ProfileMentor profile={profile} isCurrentUser={isCurrentUser} />}
          </motion.div>
          
          {/* Right Column - Content Tabs */}
          <motion.div 
            className="md:col-span-2"
            variants={itemVariants}
          >
            <ProfileContent profile={profile} />
          </motion.div>
        </div>
        
        {/* Edit Profile Modal */}
        <ProfileEditModal 
          profile={profile}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      </motion.div>
    </AppLayout>
  );
};

export default Profile;
