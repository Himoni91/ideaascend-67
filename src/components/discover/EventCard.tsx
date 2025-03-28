
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { DiscoverContent } from "@/hooks/use-discover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  content: DiscoverContent;
  onRsvp?: (content: DiscoverContent) => void;
}

export function EventCard({ content, onRsvp }: EventCardProps) {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/discover/${content.id}`);
  };

  const handleRsvp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRsvp) {
      onRsvp(content);
    }
  };

  // Format date
  const formatEventDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Date TBD";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Get event details from metadata
  const eventType = content.metadata?.event_type || 'In-Person';
  const eventDate = formatEventDate(content.metadata?.event_date || content.created_at);
  const eventLocation = content.metadata?.location || 'Location TBD';
  const attendees = content.metadata?.attendees_count || 0;

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
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg line-clamp-2">
                {content.title}
              </CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{eventDate}</span>
              </CardDescription>
            </div>
            <Badge>{eventType}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4 line-clamp-3">
            {content.description}
          </p>
          
          <div className="space-y-2 mb-4">
            {content.metadata?.time && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>{content.metadata.time}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{eventLocation}</span>
            </div>
            
            {attendees > 0 && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                <span>{attendees} attending</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              {content.metadata?.host ? `Hosted by ${content.metadata.host}` : ''}
            </div>
            <Button size="sm" onClick={handleRsvp}>
              {content.user_has_saved ? "Attending" : "RSVP"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
