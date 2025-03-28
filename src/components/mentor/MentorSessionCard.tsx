
import { useState } from "react";
import { Link } from "react-router-dom";
import { format, isPast, isFuture, isToday as isDateToday } from "date-fns";
import { motion } from "framer-motion";
import { 
  Clock, 
  Calendar, 
  Video, 
  MessageSquare, 
  Star, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MentorSession } from "@/types/mentor";
import { formatTime } from "@/lib/date-utils";

interface MentorSessionCardProps {
  session: MentorSession;
  isAsMentor?: boolean;
  onStatusChange?: (sessionId: string, status: string) => Promise<void>;
  onReview?: (sessionId: string) => void;
}

export default function MentorSessionCard({ 
  session, 
  isAsMentor = false,
  onStatusChange,
  onReview 
}: MentorSessionCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);
  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  
  const profileToShow = isAsMentor ? session.mentee : session.mentor;
  
  const isCompleted = session.status === 'completed';
  const isScheduled = session.status === 'scheduled';
  const isCancelled = session.status === 'cancelled';
  
  const isUpcoming = isFuture(startTime);
  const isPastSession = isPast(endTime);
  const isToday = isDateToday(startTime);
  
  // Format dates and times
  const sessionDate = format(startTime, "MMMM d, yyyy");
  const startTimeFormatted = format(startTime, "h:mm a");
  const endTimeFormatted = format(endTime, "h:mm a");
  
  // Handle session actions
  const handleStatusChange = async (status: string) => {
    if (!onStatusChange) return;
    
    setIsLoading(true);
    try {
      await onStatusChange(session.id, status);
    } catch (error) {
      console.error("Failed to update session status:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReview = () => {
    if (onReview) {
      onReview(session.id);
    }
  };
  
  // Determine badge color based on status
  const getBadgeVariant = () => {
    if (isCompleted) return "default";
    if (isCancelled) return "destructive";
    if (isScheduled && isUpcoming) return "secondary";
    if (isScheduled && isPastSession) return "outline";
    return "outline";
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden transition-all hover:border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant={getBadgeVariant()} className="capitalize">
              {session.status}
              {isToday && isScheduled && " • Today"}
            </Badge>
            
            {session.payment_status && (
              <Badge variant={session.payment_status === 'completed' ? "outline" : "secondary"}>
                {session.payment_status}
              </Badge>
            )}
          </div>
          
          <CardTitle className="text-lg">{session.title}</CardTitle>
          <CardDescription>
            {session.session_type} • {durationMinutes} minutes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-3">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{sessionDate}</span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              <span>{startTimeFormatted} - {endTimeFormatted}</span>
            </div>
            
            <div className="flex items-center mt-1">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={profileToShow?.avatar_url || undefined} />
                <AvatarFallback>
                  {profileToShow?.full_name?.charAt(0) || 
                   profileToShow?.username?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {isAsMentor ? "Mentee: " : "Mentor: "}
                {profileToShow?.full_name || profileToShow?.username || "Unknown"}
              </span>
            </div>
          </div>
          
          {session.description && (
            <div className="mt-3 text-sm">
              <p className="line-clamp-2 text-muted-foreground">{session.description}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-wrap gap-2">
          {isScheduled && isUpcoming && session.session_url && (
            <Button variant="default" size="sm" className="flex-1" asChild>
              <a href={session.session_url} target="_blank" rel="noopener noreferrer">
                <Video className="h-4 w-4 mr-2" />
                Join Session
              </a>
            </Button>
          )}
          
          {isScheduled && isUpcoming && !session.session_url && (
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link to={`/messages?session=${session.id}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Link>
            </Button>
          )}
          
          {isScheduled && isUpcoming && onStatusChange && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-destructive hover:text-destructive"
              onClick={() => handleStatusChange('cancelled')}
              disabled={isLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          
          {isScheduled && isPastSession && onStatusChange && isAsMentor && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => handleStatusChange('completed')}
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          )}
          
          {isCompleted && !isAsMentor && onReview && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleReview}
            >
              <Star className="h-4 w-4 mr-2" />
              Leave Review
            </Button>
          )}
          
          {isCancelled && (
            <div className="w-full mt-1">
              {session.cancellation_reason && (
                <div className="flex items-start text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <span>Reason: {session.cancellation_reason}</span>
                </div>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
