
import { useState } from "react";
import { useProfileViews } from "@/hooks/use-profile-views";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, User } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileViewersProps {
  profileId?: string;
  limit?: number;
}

export default function ProfileViewers({ profileId, limit = 5 }: ProfileViewersProps) {
  const { views, viewersCount, isLoading } = useProfileViews(profileId);
  const [showAll, setShowAll] = useState(false);
  
  const displayViews = showAll ? views : views.slice(0, limit);
  
  return (
    <Card className="border border-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Profile Visitors
        </CardTitle>
        <CardDescription>
          {viewersCount > 0 
            ? `${viewersCount} ${viewersCount === 1 ? 'person has' : 'people have'} viewed your profile`
            : 'No profile views yet'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {views.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <User className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No profile visitors yet</p>
              </div>
            ) : (
              <ScrollArea className={showAll ? "h-[300px]" : "h-auto"}>
                <div className="space-y-3">
                  <AnimatePresence>
                    {displayViews.map((view, index) => (
                      <motion.div 
                        key={view.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        {view.is_anonymous || !view.profiles ? (
                          <Avatar>
                            <AvatarFallback className="bg-muted">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar>
                            <AvatarImage src={view.profiles?.avatar_url || undefined} />
                            <AvatarFallback>
                              {view.profiles?.full_name?.[0] || view.profiles?.username?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div>
                          {view.is_anonymous || !view.profiles ? (
                            <p className="text-sm font-medium">Anonymous Visitor</p>
                          ) : (
                            <Link 
                              to={`/profile/${view.profiles?.username}`}
                              className="text-sm font-medium hover:underline"
                            >
                              {view.profiles?.full_name || view.profiles?.username}
                            </Link>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(view.viewed_at), { addSuffix: true })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}
            
            {views.length > limit && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-4" 
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show Less" : `View All (${views.length})`}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
