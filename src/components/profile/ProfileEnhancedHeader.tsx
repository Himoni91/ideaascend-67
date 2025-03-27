
import { useState } from "react";
import { ExtendedProfileType } from "@/types/profile-extended";
import { 
  CheckCircle, 
  MapPin, 
  Link2, 
  Briefcase, 
  Building, 
  Pencil, 
  MessageCircle,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import FollowButton from "./FollowButton";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";

interface ProfileEnhancedHeaderProps {
  profile: ExtendedProfileType;
  isCurrentUser: boolean;
  onEdit: () => void;
}

export default function ProfileEnhancedHeader({ 
  profile, 
  isCurrentUser, 
  onEdit 
}: ProfileEnhancedHeaderProps) {
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
      transition={{ duration: 0.3 }}
      className="rounded-xl overflow-hidden bg-card border border-border"
    >
      {/* Cover image */}
      <div className="relative h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900">
        {profile.profile_header_url && (
          <img 
            src={profile.profile_header_url} 
            alt="Profile cover" 
            className="w-full h-full object-cover" 
          />
        )}
      </div>
      
      {/* Profile info section */}
      <div className="relative px-4 sm:px-6 pb-6">
        {/* Avatar */}
        <div className="absolute -top-16 left-4 sm:left-6 border-4 border-background rounded-full">
          <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl sm:text-3xl">
              {profile.full_name?.[0] || profile.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end pt-4">
          {isCurrentUser ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="gap-1"
            >
              <Pencil className="w-3.5 h-3.5" />
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
        
        {/* Name and badges */}
        <div className="mt-12 sm:mt-16">
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
        
        {/* Location, company, etc. */}
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          {profile.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>{profile.location}</span>
            </div>
          )}
          
          {(profile.company || profile.position) && (
            <div className="flex items-center gap-2">
              {profile.company && profile.position ? (
                <>
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{profile.position} at {profile.company}</span>
                </>
              ) : profile.company ? (
                <>
                  <Building className="h-3.5 w-3.5" />
                  <span>{profile.company}</span>
                </>
              ) : (
                <>
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{profile.position}</span>
                </>
              )}
            </div>
          )}
          
          {profile.website && (
            <div className="flex items-center gap-2">
              <Link2 className="h-3.5 w-3.5" />
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
        
        {/* Bio */}
        {profile.bio && (
          <div className="mt-4">
            <p className="text-sm whitespace-pre-line">{profile.bio}</p>
          </div>
        )}
        
        {/* Stats */}
        <div className="mt-6 flex flex-wrap gap-4">
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
      </div>
    </motion.div>
  );
}
