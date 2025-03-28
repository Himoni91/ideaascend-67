
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DiscoverContent } from "@/hooks/use-discover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PeopleCardProps {
  content: DiscoverContent;
  onFollow?: (content: DiscoverContent) => void;
  isFollowing?: boolean;
}

export function PeopleCard({ content, onFollow, isFollowing = false }: PeopleCardProps) {
  const navigate = useNavigate();
  
  const handleViewProfile = () => {
    navigate(`/profile/${content.profile?.username || content.created_by}`);
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFollow) {
      onFollow(content);
    }
  };

  // Extract skills from metadata or tags
  const skills = content.tags || 
    (content.metadata?.skills ? 
      (Array.isArray(content.metadata.skills) ? content.metadata.skills : []) : 
      []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewProfile}>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={content.profile?.avatar_url} alt={content.profile?.full_name || "User"} />
              <AvatarFallback>{content.profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">
                {content.profile?.full_name || "Unknown User"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {content.profile?.position || content.title}
                {content.profile?.company ? ` at ${content.profile.company}` : ''}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {content.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{content.description}</p>
          )}
          
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-primary/5">
                  {skill}
                </Badge>
              ))}
              {skills.length > 3 && (
                <Badge variant="outline" className="bg-primary/5">
                  +{skills.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex justify-between mt-3">
            <Button 
              size="sm" 
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollow}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleViewProfile}>View Profile</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
