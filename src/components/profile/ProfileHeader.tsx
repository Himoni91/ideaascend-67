
import { ProfileType } from "@/types/profile";
import { 
  Edit, 
  Users, 
  Briefcase, 
  MapPin, 
  Link as LinkIcon, 
  CheckCircle,
  MessageCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import FollowButton from "./FollowButton";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";

interface ProfileHeaderProps {
  profile: ProfileType;
  isCurrentUser: boolean;
  onEdit: () => void;
}

export default function ProfileHeader({ profile, isCurrentUser, onEdit }: ProfileHeaderProps) {
  const { user } = useAuth();
  const { followersCount, followingCount, profileViewsCount } = useProfile(profile.id);
  
  const stats = [
    {
      label: "Followers",
      value: followersCount,
      icon: <Users className="w-3 h-3" />
    },
    {
      label: "Following",
      value: followingCount,
      icon: <Users className="w-3 h-3" />
    },
    { 
      label: "Views", 
      value: profileViewsCount,
      icon: <Users className="w-3 h-3" />
    },
    { 
      label: "Posts", 
      value: profile.stats?.posts || 0 
    },
    { 
      label: "Level", 
      value: profile.level || 1 
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg border border-border p-6"
    >
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0">
          <Avatar className="w-24 h-24 border-2 border-muted-foreground/10">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-xl">
              {profile.full_name?.[0] || profile.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">
                  {profile.full_name || profile.username}
                </h1>
                
                {profile.is_verified && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-200 dark:border-blue-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                
                {profile.is_mentor && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Mentor
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center text-muted-foreground mt-1">
                <span className="text-sm">@{profile.username}</span>
              </div>
              
              {profile.byline && (
                <p className="text-sm font-medium mt-2">
                  {profile.byline}
                </p>
              )}
            </div>
            
            <div>
              {isCurrentUser ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onEdit}
                  className="gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  {user && (
                    <Button variant="outline" size="sm" className="gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Message
                    </Button>
                  )}
                  {user && user.id !== profile.id && (
                    <FollowButton userId={profile.id} size="sm" />
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-y-2 sm:flex sm:flex-wrap sm:gap-x-4">
            {profile.location && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="h-3.5 w-3.5" />
                <span>{profile.location}</span>
              </div>
            )}
            
            {profile.company && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{profile.company}</span>
              </div>
            )}
            
            {profile.website && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <LinkIcon className="h-3.5 w-3.5" />
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
          
          {profile.bio && (
            <div className="mt-4">
              <p className="text-sm">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 justify-around sm:justify-start">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-lg font-semibold">{stat.value}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              {stat.icon}
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
