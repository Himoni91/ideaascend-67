
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BookOpen, Podcast, Film } from "lucide-react";
import { DiscoverContent } from "@/types/discover";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  content: DiscoverContent;
}

export function ContentCard({ content }: ContentCardProps) {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    // Check if there's an external URL in metadata
    if (content.metadata?.url) {
      window.open(content.metadata.url, '_blank');
    } else {
      navigate(`/discover/${content.id}`);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    }
  };

  // Determine content subtype and icon
  const getContentSubtype = () => {
    const subtype = content.metadata?.content_subtype || 'article';
    
    switch (subtype.toLowerCase()) {
      case 'podcast':
        return { name: 'Podcast', icon: <Podcast className="mr-1 h-3.5 w-3.5" /> };
      case 'video':
        return { name: 'Video', icon: <Film className="mr-1 h-3.5 w-3.5" /> };
      case 'article':
      default:
        return { name: 'Article', icon: <BookOpen className="mr-1 h-3.5 w-3.5" /> };
    }
  };

  const contentSubtype = getContentSubtype();

  // Determine duration
  const getDuration = () => {
    if (content.metadata?.duration) {
      // Check if duration is in minutes or seconds
      const duration = typeof content.metadata.duration === 'string' 
        ? parseInt(content.metadata.duration) 
        : content.metadata.duration;
      
      if (duration < 60) {
        return `${duration} min read`;
      } else if (duration < 3600) {
        return `${Math.floor(duration / 60)} min read`;
      } else {
        return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
      }
    }
    return null;
  };

  const duration = getDuration();

  // Get author info
  const getAuthorInfo = () => {
    if (content.metadata?.source) {
      return content.metadata.source;
    } else if (content.profile) {
      return content.profile.full_name;
    }
    return "Unknown Source";
  };

  const authorInfo = getAuthorInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="flex items-center text-xs">
              {contentSubtype.icon}
              <span>{contentSubtype.name}</span>
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(content.created_at)}
            </span>
          </div>
          <h3 className="mt-2 text-lg font-semibold line-clamp-2">
            {content.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            By {authorInfo}
            {duration && <span className="ml-2">·</span>}
            {duration && <span className="ml-2">{duration}</span>}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4 line-clamp-3">
            {content.description}
          </p>
          
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {content.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {content.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">+{content.tags.length - 3}</Badge>
              )}
            </div>
          )}
          
          <Button size="sm" className="w-full mt-2">
            {content.metadata?.url ? "Read More" : "View Details"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
