
import { useState, useEffect } from "react";
import { ExtendedProfileType } from "@/types/profile-extended";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  MessageSquare, 
  UserPlus, 
  Check, 
  CheckCircle, 
  MapPin, 
  Briefcase, 
  Building, 
  Link as LinkIcon,
  Twitter,
  Linkedin,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ProfileEnhancedHeaderProps {
  profile: ExtendedProfileType;
  isCurrentUser: boolean;
  onEdit?: () => void;
}

export default function ProfileEnhancedHeader({ profile, isCurrentUser, onEdit }: ProfileEnhancedHeaderProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(profile.stats?.followers || 0);
  
  useEffect(() => {
    // Check if the current user is following this profile
    if (user && !isCurrentUser) {
      checkIfFollowing();
    }
  }, [user, profile.id]);
  
  async function checkIfFollowing() {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .maybeSingle();
        
      if (error) throw error;
      
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  }
  
  const handleFollow = async () => {
    if (!user) {
      toast.error("You must be logged in to follow users");
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);
          
        if (error) throw error;
        
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        toast.success(`Unfollowed ${profile.full_name || profile.username}`);
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: profile.id
          });
          
        if (error) throw error;
        
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast.success(`Now following ${profile.full_name || profile.username}`);
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast.error(error.message || "Failed to update follow status");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative mb-8">
      {/* Cover Image */}
      <div className="h-40 md:h-60 rounded-xl bg-gradient-to-r from-idolyst-blue to-idolyst-indigo relative overflow-hidden">
        <motion.div 
          className="w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30" />
          <div className="absolute bottom-4 left-4 text-white">
            {profile.is_mentor && (
              <Badge variant="secondary" className="bg-amber-500/80 text-white border-none">
                Mentor
              </Badge>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Profile Info */}
      <div className="relative px-4 md:px-6 -mt-16">
        <motion.div 
          className="flex flex-col md:flex-row items-start md:items-end"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Avatar */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-white p-1 shadow-md transition-transform hover:scale-105 duration-300">
            <Avatar className="w-full h-full rounded-lg bg-gradient-to-br from-idolyst-blue to-idolyst-indigo flex items-center justify-center text-white text-2xl font-bold">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name || "User"} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-idolyst-blue to-idolyst-indigo text-white text-2xl font-bold">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          
          {/* Name and Basic Info */}
          <div className="mt-4 md:mt-0 md:ml-6 md:mb-2 flex-1">
            <div className="flex items-center flex-wrap">
              <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              {profile.is_verified && (
                <Badge variant="outline" className="ml-2 px-1.5 py-0.5">
                  <CheckCircle className="h-3.5 w-3.5 text-primary mr-1" />
                  <span className="text-xs">Verified</span>
                </Badge>
              )}
              {profile.verification_status === 'pending' && (
                <Badge variant="outline" className="ml-2 px-1.5 py-0.5 bg-amber-500/10 text-amber-600 border-amber-200">
                  <span className="text-xs">Verification Pending</span>
                </Badge>
              )}
            </div>
            
            {profile.byline && (
              <p className="text-lg text-muted-foreground font-medium mt-1">{profile.byline}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-y-1 mt-2">
              {profile.company && (
                <div className="text-muted-foreground flex items-center text-sm mr-4">
                  <Building className="h-3.5 w-3.5 mr-1" />
                  {profile.company}
                </div>
              )}
              
              {profile.position && (
                <div className="text-muted-foreground flex items-center text-sm mr-4">
                  <Briefcase className="h-3.5 w-3.5 mr-1" />
                  {profile.position}
                </div>
              )}
              
              {profile.location && (
                <div className="text-muted-foreground flex items-center text-sm">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {profile.location}
                </div>
              )}
            </div>
            
            <div className="flex items-center mt-3 space-x-2">
              <TooltipProvider>
                {profile.linkedin_url && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>LinkedIn</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                
                {profile.twitter_url && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={profile.twitter_url.startsWith('http') ? profile.twitter_url : `https://twitter.com/${profile.twitter_url.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Twitter</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                
                {profile.website && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Website</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                
                {profile.public_email && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`mailto:${profile.public_email}`}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Email</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-4 md:mt-0 w-full md:w-auto flex flex-col md:flex-row gap-2">
            {isCurrentUser ? (
              <Button onClick={onEdit} className="group">
                <Edit className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleFollow}
                  variant={isFollowing ? "outline" : "default"}
                  className={cn(
                    "group transition-all duration-300",
                    isLoading && "opacity-80 pointer-events-none"
                  )}
                >
                  {isFollowing ? (
                    <>
                      <Check className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                      Follow
                    </>
                  )}
                </Button>
                <Button variant="outline" className="group">
                  <MessageSquare className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Message
                </Button>
              </>
            )}
          </div>
        </motion.div>
        
        {/* Stats */}
        <motion.div
          className="flex flex-wrap gap-4 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center">
            <p className="text-lg font-semibold">{followerCount}</p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{profile.stats?.following || 0}</p>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{profile.stats?.ideas || 0}</p>
            <p className="text-sm text-muted-foreground">Ideas</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{profile.stats?.posts || 0}</p>
            <p className="text-sm text-muted-foreground">Posts</p>
          </div>
          {profile.is_mentor && (
            <div className="text-center">
              <p className="text-lg font-semibold">{profile.stats?.mentorSessions || 0}</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
