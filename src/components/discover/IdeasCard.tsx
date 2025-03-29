
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { DiscoverContent } from "@/types/discover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface IdeasCardProps {
  content: DiscoverContent;
  onVote?: (content: DiscoverContent, isUpvote: boolean) => void;
}

export function IdeasCard({ content, onVote }: IdeasCardProps) {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/discover/${content.id}`);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${content.profile?.username || content.created_by}`);
  };

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVote) {
      onVote(content, true);
    }
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVote) {
      onVote(content, false);
    }
  };

  // Extract the primary category from tags or metadata
  const primaryCategory = content.tags && content.tags.length > 0 ? content.tags[0] : 'Idea';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle className="line-clamp-2 text-lg">
              {content.title}
            </CardTitle>
            <Badge>{primaryCategory}</Badge>
          </div>
          <CardDescription className="flex items-center gap-1 cursor-pointer" onClick={handleProfileClick}>
            <span>By</span>
            <Avatar className="h-5 w-5 mr-1">
              <AvatarImage src={content.profile?.avatar_url} alt={content.profile?.full_name || "User"} />
              <AvatarFallback>{content.profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <span className="hover:underline">{content.profile?.full_name || "Unknown User"}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm line-clamp-3">
            {content.description}
          </p>
          
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {content.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-secondary/20">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={cn("h-8 w-8 rounded-full", content.user_has_liked && "text-green-500")}
                  onClick={handleUpvote}
                >
                  <ThumbsUp className={cn("h-4 w-4", content.user_has_liked && "fill-current")} />
                </Button>
                <span className="text-sm text-muted-foreground">{content.likes_count || 0}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {content.metadata?.comments_count || 0}
                </span>
              </div>
            </div>
            
            <Button size="sm">View Details</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
