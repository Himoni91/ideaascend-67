
import { useState } from "react";
import { ExtendedProfileType } from "@/types/profile-extended";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, User, MoreHorizontal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import FollowButton from "@/components/profile/FollowButton";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileConnectionsProps {
  profile: ExtendedProfileType;
}

export default function ProfileConnections({ profile }: ProfileConnectionsProps) {
  const [activeTab, setActiveTab] = useState("followers");
  const { user } = useAuth();
  const isOwnProfile = user?.id === profile.id;
  
  return (
    <Card className="border border-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-4 w-4" />
          Connections
        </CardTitle>
        <CardDescription>
          {activeTab === "followers" 
            ? `${profile.stats?.followers || 0} ${profile.stats?.followers === 1 ? 'follower' : 'followers'}`
            : `Following ${profile.stats?.following || 0} ${profile.stats?.following === 1 ? 'person' : 'people'}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="mt-0">
            {!profile.followers || profile.followers.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <User className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No followers yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <AnimatePresence>
                  <div className="space-y-3">
                    {profile.followers.map((follower, index) => (
                      <motion.div
                        key={follower.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between"
                      >
                        <Link 
                          to={`/profile/${follower.username}`}
                          className="flex items-center gap-3 flex-1"
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={follower.avatar_url || undefined} />
                            <AvatarFallback>
                              {follower.full_name?.[0] || follower.username?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {follower.full_name || follower.username}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              @{follower.username}
                            </p>
                          </div>
                        </Link>
                        
                        {isOwnProfile && user?.id !== follower.id && (
                          <FollowButton userId={follower.id} size="sm" variant="ghost" />
                        )}
                        
                        {!isOwnProfile && user?.id === follower.id && (
                          <div className="text-xs font-medium text-muted-foreground">
                            You
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="following" className="mt-0">
            {!profile.following || profile.following.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <UserCheck className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>Not following anyone yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <AnimatePresence>
                  <div className="space-y-3">
                    {profile.following.map((followedUser, index) => (
                      <motion.div
                        key={followedUser.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between"
                      >
                        <Link 
                          to={`/profile/${followedUser.username}`}
                          className="flex items-center gap-3 flex-1"
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={followedUser.avatar_url || undefined} />
                            <AvatarFallback>
                              {followedUser.full_name?.[0] || followedUser.username?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {followedUser.full_name || followedUser.username}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              @{followedUser.username}
                            </p>
                          </div>
                        </Link>
                        
                        {isOwnProfile && user?.id !== followedUser.id && (
                          <FollowButton userId={followedUser.id} size="sm" variant="ghost" />
                        )}
                        
                        {!isOwnProfile && user?.id === followedUser.id && (
                          <div className="text-xs font-medium text-muted-foreground">
                            You
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
