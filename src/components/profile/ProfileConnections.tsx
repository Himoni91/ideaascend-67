
import { useState } from "react";
import { Link } from "react-router-dom";
import { ProfileType } from "@/types/profile";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserRoundCheck, Users } from "lucide-react";

interface ProfileConnectionsProps {
  profile: ProfileType;
}

export default function ProfileConnections({ profile }: ProfileConnectionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'followers' | 'following'>('followers');
  
  const stats = profile.stats || { followers: 0, following: 0 };
  
  const openFollowers = () => {
    setDialogType('followers');
    setDialogOpen(true);
  };
  
  const openFollowing = () => {
    setDialogType('following');
    setDialogOpen(true);
  };
  
  // Mock data for UI display - in production this would come from the API
  const followersList = profile.followers || Array(stats.followers).fill(null).map((_, i) => ({
    id: `follower-${i}`,
    username: `user${i}`,
    full_name: `User ${i}`,
    avatar_url: null,
  })) as ProfileType[];
  
  const followingList = profile.following || Array(stats.following).fill(null).map((_, i) => ({
    id: `following-${i}`,
    username: `mentor${i}`,
    full_name: `Mentor ${i}`,
    avatar_url: null,
  })) as ProfileType[];
  
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <>
      <div className="flex justify-between mt-4">
        <Button 
          variant="ghost" 
          onClick={openFollowers}
          className="flex-1 justify-start"
        >
          <UserRoundCheck className="w-4 h-4 mr-2" />
          <span className="font-medium">{stats.followers}</span>
          <span className="ml-1 text-gray-500 dark:text-gray-400">Followers</span>
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={openFollowing}
          className="flex-1 justify-start"
        >
          <Users className="w-4 h-4 mr-2" />
          <span className="font-medium">{stats.following}</span>
          <span className="ml-1 text-gray-500 dark:text-gray-400">Following</span>
        </Button>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'followers' ? 'Followers' : 'Following'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {(dialogType === 'followers' ? followersList : followingList).map((user) => (
              <Link 
                key={user.id} 
                to={`/profile/${user.id}`}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setDialogOpen(false)}
              >
                <Avatar className="w-10 h-10 rounded-full">
                  {user.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={user.full_name || "User"} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-idolyst-blue to-idolyst-indigo text-white">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="ml-3">
                  <p className="font-medium">{user.full_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                </div>
              </Link>
            ))}
            
            {(dialogType === 'followers' ? followersList : followingList).length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No {dialogType} yet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
