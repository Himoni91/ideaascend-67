
import { useState } from "react";
import { ProfileType } from "@/types/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, MessageSquare, UserPlus, Check } from "lucide-react";

interface ProfileHeaderProps {
  profile: ProfileType;
  isCurrentUser: boolean;
  onEdit?: () => void;
}

export default function ProfileHeader({ profile, isCurrentUser, onEdit }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // In production, this would call a mutation to follow/unfollow
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
      <div className="h-40 md:h-60 rounded-xl bg-gradient-to-r from-idolyst-blue to-idolyst-indigo animate-pulse-subtle"></div>
      
      {/* Profile Info */}
      <div className="relative px-4 md:px-6 -mt-16 animate-fade-in">
        <div className="flex flex-col md:flex-row items-start md:items-end">
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
            <h1 className="text-2xl font-bold">{profile.full_name}</h1>
            <p className="text-gray-600 dark:text-gray-300">
              {profile.position && profile.company ? (
                <>
                  {profile.position} at {profile.company} 
                  {profile.location && <> · {profile.location}</>}
                </>
              ) : (
                profile.location || "@" + profile.username
              )}
            </p>
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
                  className="group transition-all duration-300"
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
        </div>
      </div>
    </div>
  );
}
