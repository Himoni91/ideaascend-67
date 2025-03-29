import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Heart, 
  Bookmark, 
  Share2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft, 
  BookOpen, 
  Podcast, 
  Film, 
  User, 
  Eye
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDiscover } from "@/hooks/use-discover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function DiscoverDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    useDiscoverContentById, 
    toggleLike, 
    toggleSave, 
    toggleFollow
  } = useDiscover();
  
  const { data: content, isLoading, error: contentError } = useQuery({
    queryKey: ['discover-content', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('discover_content')
        .select(`
          *,
          profile:created_by(id, username, full_name, avatar_url, is_verified, position, company)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  
  if (contentError) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-10 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Content</h1>
            <p className="text-muted-foreground mb-6">
              {contentError instanceof Error ? contentError.message : "An unknown error occurred."}
            </p>
            <Button onClick={() => navigate('/discover')}>
              Back to Discover
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  const handleLike = async () => {
    if (!content) return;
    
    toggleLike.mutate({
      contentId: content.id,
      userId: content.user_id || ''
    });
  };
  
  const handleSave = async () => {
    if (!content) return;
    
    toggleSave.mutate({
      contentId: content.id,
      userId: content.user_id || ''
    });
  };
  
  const handleFollow = async (creatorId: string) => {
    if (!content) return;
    
    toggleFollow.mutate({
      creatorId,
      userId: content.user_id || ''
    });
  };
  
  const handleShare = () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: content?.title || 'Discover content',
        text: content?.description || '',
        url: shareUrl,
      }).catch(error => {
        console.error('Error sharing:', error);
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success('Link copied to clipboard');
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  const renderContentTypeSpecificDetails = () => {
    if (!content) return null;
    
    switch (content.content_type) {
      case 'events':
        return (
          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Event Details</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-muted-foreground">
                    {content.metadata?.event_date ? 
                      formatDate(content.metadata.event_date as string) : 
                      formatDate(content.created_at)}
                  </p>
                </div>
              </div>
              
              {content.metadata?.time && (
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-muted-foreground">{content.metadata.time as string}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">
                    {content.metadata?.location || 'Location TBD'}
                  </p>
                </div>
              </div>
              
              {content.metadata?.attendees_count && (
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Attendees</p>
                    <p className="text-muted-foreground">
                      {content.metadata.attendees_count} registered
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <Button className="w-full">
                {content.user_has_saved ? 'Cancel Registration' : 'Register for Event'}
              </Button>
            </div>
          </div>
        );
      
      case 'content':
        const getContentSubtype = () => {
          const subtype = content.metadata?.content_subtype || 'article';
          
          switch (String(subtype).toLowerCase()) {
            case 'podcast':
              return { name: 'Podcast', icon: <Podcast className="h-5 w-5 mr-3 text-primary" /> };
            case 'video':
              return { name: 'Video', icon: <Film className="h-5 w-5 mr-3 text-primary" /> };
            case 'article':
            default:
              return { name: 'Article', icon: <BookOpen className="h-5 w-5 mr-3 text-primary" /> };
          }
        };
        
        const contentSubtype = getContentSubtype();
        
        return (
          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Content Details</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                {contentSubtype.icon}
                <div>
                  <p className="font-medium">Type</p>
                  <p className="text-muted-foreground">{contentSubtype.name}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="font-medium">Published</p>
                  <p className="text-muted-foreground">{formatDate(content.created_at)}</p>
                </div>
              </div>
              
              {content.metadata?.duration && (
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-muted-foreground">
                      {typeof content.metadata.duration === 'number' && content.metadata.duration < 60
                        ? `${content.metadata.duration} minutes`
                        : typeof content.metadata.duration === 'number'
                        ? `${Math.floor(content.metadata.duration / 60)}h ${content.metadata.duration % 60}m`
                        : content.metadata.duration}
                    </p>
                  </div>
                </div>
              )}
              
              {content.metadata?.source && (
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Source</p>
                    <p className="text-muted-foreground">{String(content.metadata.source)}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <Eye className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="font-medium">Views</p>
                  <p className="text-muted-foreground">{content.view_count} views</p>
                </div>
              </div>
            </div>
            
            {content.metadata?.url && (
              <div className="mt-6">
                <Button 
                  className="w-full"
                  onClick={() => window.open(String(content.metadata?.url), '_blank')}
                >
                  {content.metadata?.content_subtype === 'podcast' 
                    ? 'Listen to Podcast' 
                    : content.metadata?.content_subtype === 'video'
                    ? 'Watch Video'
                    : 'Read Full Article'}
                </Button>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-4 px-4 m:py-8 md:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <div className="flex items-center gap-4 mt-6">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </div>
          ) : content ? (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-sm">
                      {content.content_type.charAt(0).toUpperCase() + content.content_type.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(content.created_at)}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={cn(content.user_has_liked && "text-red-500")}
                    onClick={handleLike}
                  >
                    <Heart className={cn("h-5 w-5", content.user_has_liked && "fill-current")} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={cn(content.user_has_saved && "text-yellow-500")}
                    onClick={handleSave}
                  >
                    <Bookmark className={cn("h-5 w-5", content.user_has_saved && "fill-current")} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Avatar 
                    className="h-12 w-12 cursor-pointer"
                    onClick={() => navigate(`/profile/${content.profile?.username || content.created_by}`)}
                  >
                    <AvatarImage src={content.profile?.avatar_url} alt={content.profile?.full_name || "User"} />
                    <AvatarFallback>{content.profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p 
                      className="font-medium hover:underline cursor-pointer"
                      onClick={() => navigate(`/profile/${content.profile?.username || content.created_by}`)}
                    >
                      {content.profile?.full_name || "Unknown User"}
                    </p>
                    {content.profile?.position && (
                      <p className="text-sm text-muted-foreground">
                        {content.profile.position}
                        {content.profile.company ? ` at ${content.profile.company}` : ''}
                      </p>
                    )}
                  </div>
                </div>
                
                {content.content_type === 'people' && (
                  <Button onClick={() => handleFollow(content.created_by)}>
                    Follow
                  </Button>
                )}
              </div>
              
              {content.image_url && (
                <div className="mb-8 rounded-lg overflow-hidden">
                  <img 
                    src={content.image_url} 
                    alt={content.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="prose max-w-none">
                    {content.description && (
                      <p className="text-lg text-muted-foreground mb-6">
                        {content.description}
                      </p>
                    )}
                    
                    {content.metadata?.content && (
                      <div dangerouslySetInnerHTML={{ __html: content.metadata.content }} />
                    )}
                  </div>
                  
                  {content.tags && content.tags.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {content.tags.map(tag => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="md:w-80">
                  {renderContentTypeSpecificDetails()}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
              <Button onClick={() => navigate('/discover')}>
                Back to Discover
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
