
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProfileType } from "@/types/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Json } from "@/integrations/supabase/types";

interface ProfileConnectionsProps {
  profile: ProfileType;
}

// Helper function to convert Supabase response to ProfileType
const convertToProfileType = (profile: any): ProfileType => {
  return {
    id: profile.id,
    username: profile.username || '',
    full_name: profile.full_name || '',
    avatar_url: profile.avatar_url || null,
    bio: profile.bio || null,
    location: profile.location || null,
    website: profile.website || null,
    linkedin_url: profile.linkedin_url || null,
    twitter_url: profile.twitter_url || null,
    company: profile.company || null,
    position: profile.position || null,
    expertise: profile.expertise || [],
    is_mentor: profile.is_mentor || false,
    is_verified: profile.is_verified || false,
    created_at: profile.created_at || '',
    updated_at: profile.updated_at || '',
    level: profile.level || 1,
    xp: profile.xp || 0,
    byline: profile.byline || null,
    badges: Array.isArray(profile.badges) 
      ? profile.badges 
      : [{ name: "New Member", icon: "👋", description: "Joined Idolyst", earned: true }],
    stats: typeof profile.stats === 'object' && profile.stats !== null
      ? profile.stats
      : {
          followers: 0,
          following: 0,
          ideas: 0,
          mentorSessions: 0,
          posts: 0
        }
  };
};

export default function ProfileConnections({ profile }: ProfileConnectionsProps) {
  const [activeTab, setActiveTab] = useState("followers");
  const [followers, setFollowers] = useState<ProfileType[]>([]);
  const [following, setFollowing] = useState<ProfileType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      // Fetch followers - people who follow this profile
      const { data: followerData, error: followerError } = await supabase
        .from('user_follows')
        .select(`
          follower_id,
          follower:profiles!user_follows_follower_id_fkey(*)
        `)
        .eq('following_id', profile.id);
      
      if (followerError) throw followerError;
      
      // Fetch following - people this profile follows
      const { data: followingData, error: followingError } = await supabase
        .from('user_follows')
        .select(`
          following_id,
          following:profiles!user_follows_following_id_fkey(*)
        `)
        .eq('follower_id', profile.id);
      
      if (followingError) throw followingError;
      
      // Convert followers data to ProfileType
      const convertedFollowers = followerData.map(item => convertToProfileType(item.follower));
      setFollowers(convertedFollowers);
      
      // Convert following data to ProfileType
      const convertedFollowing = followingData.map(item => convertToProfileType(item.following));
      setFollowing(convertedFollowing);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchConnections();
    
    // Set up realtime subscription for follower/following changes
    const channel = supabase
      .channel('connections-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'user_follows' },
          (payload) => {
            fetchConnections();
          }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.id]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <Users className="mr-2 h-5 w-5 text-idolyst-blue" />
          Connections
        </CardTitle>
        <CardDescription>
          People connected with {profile.full_name || profile.username}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="followers" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers" className="text-xs">
              Followers ({profile.stats?.followers || followers.length})
            </TabsTrigger>
            <TabsTrigger value="following" className="text-xs">
              Following ({profile.stats?.following || following.length})
            </TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="followers" className="mt-4 space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-muted"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-1/3 bg-muted rounded"></div>
                        <div className="h-3 w-1/4 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))
                ) : followers.length > 0 ? (
                  followers.map((follower) => (
                    <Link 
                      key={follower.id} 
                      to={`/profile/${follower.id}`}
                      className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={follower.avatar_url || undefined} />
                        <AvatarFallback>
                          {follower.full_name?.charAt(0) || follower.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{follower.full_name || follower.username}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {follower.position && follower.company ? 
                            `${follower.position} at ${follower.company}` : 
                            follower.location || `@${follower.username}`}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No followers yet</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="following" className="mt-4 space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-muted"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-1/3 bg-muted rounded"></div>
                        <div className="h-3 w-1/4 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))
                ) : following.length > 0 ? (
                  following.map((followed) => (
                    <Link 
                      key={followed.id} 
                      to={`/profile/${followed.id}`}
                      className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={followed.avatar_url || undefined} />
                        <AvatarFallback>
                          {followed.full_name?.charAt(0) || followed.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{followed.full_name || followed.username}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {followed.position && followed.company ? 
                            `${followed.position} at ${followed.company}` : 
                            followed.location || `@${followed.username}`}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">Not following anyone yet</p>
                  </div>
                )}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  );
}
