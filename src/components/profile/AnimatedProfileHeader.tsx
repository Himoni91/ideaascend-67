import React, { useState, useEffect } from "react";
import { ProfileType } from "@/types/profile";
import { CheckCircle, MapPin, Link2, Briefcase, Building, Pencil, MessageCircle, Users, Upload, Camera, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import FollowButton from "./FollowButton";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { useProfileImage } from "@/hooks/use-profile-image";
import { useProfileBanner } from "@/hooks/use-profile-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
interface AnimatedProfileHeaderProps {
  profile: ProfileType;
  isCurrentUser: boolean;
  onEdit: () => void;
}
export default function AnimatedProfileHeader({
  profile,
  isCurrentUser,
  onEdit
}: AnimatedProfileHeaderProps) {
  const {
    user
  } = useAuth();
  const {
    followersCount,
    followingCount,
    profileViewsCount
  } = useProfile(profile.id);
  const {
    uploadProfileImage,
    isUploading: isUploadingAvatar,
    progress: avatarProgress
  } = useProfileImage();
  const {
    uploadProfileBanner,
    isUploading: isUploadingBanner,
    progress: bannerProgress
  } = useProfileBanner();
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const isMobile = useIsMobile();
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      await uploadProfileImage(file);
    }
  };
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      await uploadProfileBanner(file);
    }
  };
  const handleAvatarClick = () => {
    if (profile.avatar_url) {
      setPreviewImage(profile.avatar_url);
      setImagePreviewOpen(true);
    }
  };
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  const stats = [{
    label: "Followers",
    value: followersCount || 0,
    icon: <Users className="w-3 h-3" />
  }, {
    label: "Following",
    value: followingCount || 0,
    icon: <Users className="w-3 h-3" />
  }, {
    label: "Views",
    value: profileViewsCount || 0,
    icon: <Users className="w-3 h-3" />
  }, {
    label: "Posts",
    value: profile.stats?.posts || 0
  }, {
    label: "Level",
    value: profile.level || 1
  }];

  // Create execution of the edge function to ensure the bucket exists
  useEffect(() => {
    const checkAndCreateBucket = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-buckets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        if (!response.ok) {
          console.error('Failed to check/create buckets');
        }
      } catch (error) {
        console.error('Error calling bucket creation function:', error);
      }
    };
    checkAndCreateBucket();
  }, []);
  return <>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="rounded-xl overflow-hidden bg-card border border-border relative">
        {/* Banner */}
        <div className="relative h-36 md:h-56 bg-gradient-to-r from-indigo-500/40 to-purple-600/40 dark:from-indigo-900/40 dark:to-purple-900/40">
          {profile.profile_header_url ? <motion.img initial={{
          scale: 1.1,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} transition={{
          duration: 0.5
        }} src={profile.profile_header_url} alt="Profile banner" className="w-full h-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/40 to-purple-600/40 dark:from-indigo-900/40 dark:to-purple-900/40 z-0"></div>}
          
          {isCurrentUser && <div className="absolute bottom-3 right-3 z-10">
              <label htmlFor="banner-upload" className="cursor-pointer">
                <div className="bg-background/80 backdrop-blur-sm text-foreground rounded-md p-2 shadow-md hover:bg-background/90 transition-colors flex items-center">
                  <Camera className="h-4 w-4 mr-2" />
                  <span className="text-xs">Change Banner</span>
                </div>
              </label>
              <input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
            </div>}
          
          {isUploadingBanner && <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2">
              <Progress value={bannerProgress} className="h-1" />
            </div>}
        </div>
        
        {/* Profile content */}
        <div className="p-4 md:p-6 pt-16 md:pt-20">
          {/* Avatar - Position it like mobile view consistently */}
          <div className={`absolute ${isMobile ? '-top-12 left-4' : '-top-16 left-1/2 transform -translate-x-1/2'} z-10`}>
            <div className="relative group py-0 my-[183px] mx-0">
              <motion.div initial={{
              scale: 0.8,
              opacity: 0
            }} animate={{
              scale: 1,
              opacity: 1
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }} className="rounded-full border-4 border-background">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 cursor-pointer hover:opacity-90 transition-opacity" onClick={handleAvatarClick}>
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl md:text-3xl bg-muted">
                    {profile.full_name?.[0] || profile.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              {isCurrentUser && <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 cursor-pointer">
                  <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:brightness-110 transition-all">
                    <Camera className="h-3.5 w-3.5" />
                  </div>
                </label>}
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              
              {isUploadingAvatar && <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                  <Progress value={avatarProgress} className="h-1 w-16 absolute bottom-2" />
                </div>}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-2">
            <motion.div variants={itemVariants} className="space-y-2 md:ml-0 text-center md:text-left mt-14 md:mt-0">
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                <h1 className="text-xl md:text-2xl font-bold">
                  {profile.full_name || profile.username}
                </h1>
                
                <div className="flex gap-1">
                  {profile.is_verified && <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-200 dark:border-blue-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>}
                  
                  {profile.is_mentor && <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Mentor
                    </Badge>}
                </div>
              </div>
              
              <motion.div variants={itemVariants} className="text-muted-foreground">
                <span className="text-sm">@{profile.username}</span>
              </motion.div>
              
              {profile.byline && <motion.p variants={itemVariants} className="text-sm font-medium">
                  {profile.byline}
                </motion.p>}
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex justify-center md:justify-end mt-2 md:mt-0">
              {isCurrentUser ? <Button variant="outline" size="sm" onClick={onEdit} className="gap-1 hover:bg-muted/80">
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Profile
                </Button> : <div className="flex gap-2">
                  {user && <Button variant="outline" size="sm" className="gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Message
                    </Button>}
                  {user && user.id !== profile.id && <FollowButton userId={profile.id} size="sm" />}
                </div>}
            </motion.div>
          </div>
          
          <motion.div variants={itemVariants} className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {profile.location && <div className="flex items-center gap-2 justify-center md:justify-start">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{profile.location}</span>
                </div>}
              
              {(profile.company || profile.position) && <div className="flex items-center gap-2 justify-center md:justify-start">
                  {profile.company && profile.position ? <>
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{profile.position} at {profile.company}</span>
                    </> : profile.company ? <>
                      <Building className="h-3.5 w-3.5" />
                      <span>{profile.company}</span>
                    </> : <>
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{profile.position}</span>
                    </>}
                </div>}
              
              {profile.website && <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Link2 className="h-3.5 w-3.5" />
                  <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>}
            </div>
          </motion.div>
          
          {profile.bio && <motion.div variants={itemVariants} className="mt-4 text-center md:text-left">
              <p className="text-sm whitespace-pre-line">{profile.bio}</p>
            </motion.div>}
          
          <motion.div variants={itemVariants} className="mt-6 grid grid-cols-3 md:grid-cols-5 gap-4">
            {stats.map((stat, index) => <motion.div key={index} className="text-center" variants={itemVariants} whileHover={{
            scale: 1.05
          }}>
                <div className="text-lg font-semibold">{stat.value}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  {stat.icon}
                  {stat.label}
                </div>
              </motion.div>)}
          </motion.div>
        </div>
      </motion.div>

      {/* Image Preview Dialog */}
      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Image</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-2">
            <img src={previewImage} alt="Profile" className="max-h-[70vh] rounded-md object-contain" />
          </div>
        </DialogContent>
      </Dialog>
    </>;
}