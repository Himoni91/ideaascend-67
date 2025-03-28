
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, Bookmark, Share2, MoreHorizontal, User } from "lucide-react";
import { toast } from "sonner";
import { DiscoverContent } from "@/hooks/use-discover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DiscoverCardProps {
  content: DiscoverContent;
  onLike?: (content: DiscoverContent) => void;
  onSave?: (content: DiscoverContent) => void;
  isCompact?: boolean;
}

export function DiscoverCard({ content, onLike, onSave, isCompact = false }: DiscoverCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleCardClick = () => {
    if (content.content_type === 'people') {
      navigate(`/profile/${content.profile?.username || content.created_by}`);
    } else {
      navigate(`/discover/${content.id}`);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${content.profile?.username || content.created_by}`);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(content);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) {
      onSave(content);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create the URL to share
    const shareUrl = `${window.location.origin}/discover/${content.id}`;
    
    // Check if the Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: content.title,
        text: content.description || '',
        url: shareUrl,
      }).catch(error => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success('Link copied to clipboard');
      });
    }
  };

  // Determine the correct icon based on content type
  const getContentTypeIcon = () => {
    switch (content.content_type) {
      case 'people':
        return <User className="h-4 w-4" />;
      case 'ideas':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
      case 'content':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
      case 'events':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (isCompact) {
    // Compact card (for mobile or sidebar)
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              {getContentTypeIcon()}
              <span className="capitalize">{content.content_type}</span>
            </Badge>
            <div className="text-xs text-muted-foreground">
              {formatDate(content.created_at)}
            </div>
          </div>
          
          <h3 className="font-semibold text-sm line-clamp-2 mb-1">{content.title}</h3>
          
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-6 w-6" onClick={handleProfileClick}>
              <AvatarImage src={content.profile?.avatar_url} alt={content.profile?.full_name || "User"} />
              <AvatarFallback>{content.profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {content.profile?.full_name || "Unknown User"}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full card
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden cursor-pointer"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {content.image_url && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={content.image_url} 
            alt={content.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70" />
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <Badge variant="outline" className="bg-black/50 text-white border-none flex items-center gap-1">
              {getContentTypeIcon()}
              <span className="capitalize">{content.content_type}</span>
            </Badge>
          </div>
        </div>
      )}

      <div className="p-6">
        {!content.image_url && (
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {getContentTypeIcon()}
              <span className="capitalize">{content.content_type}</span>
            </Badge>
            <div className="text-xs text-muted-foreground">
              {formatDate(content.created_at)}
            </div>
          </div>
        )}
        
        <h3 className="text-xl font-semibold mb-2 line-clamp-2">{content.title}</h3>
        
        {content.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{content.description}</p>
        )}
        
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {content.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 cursor-pointer" onClick={handleProfileClick}>
              <AvatarImage src={content.profile?.avatar_url} alt={content.profile?.full_name || "User"} />
              <AvatarFallback>{content.profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium hover:underline cursor-pointer" onClick={handleProfileClick}>
                {content.profile?.full_name || "Unknown User"}
              </p>
              {content.profile?.position && (
                <p className="text-xs text-muted-foreground">
                  {content.profile.position}{content.profile.company ? ` at ${content.profile.company}` : ''}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 rounded-full", 
                content.user_has_liked && "text-red-500"
              )}
              onClick={handleLikeClick}
            >
              <Heart className={cn("h-4 w-4", content.user_has_liked && "fill-current")} />
            </Button>
            
            <Button 
              variant="ghost"
              size="icon" 
              className={cn(
                "h-8 w-8 rounded-full",
                content.user_has_saved && "text-yellow-500"
              )}
              onClick={handleSaveClick}
            >
              <Bookmark className={cn("h-4 w-4", content.user_has_saved && "fill-current")} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={handleShareClick}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
