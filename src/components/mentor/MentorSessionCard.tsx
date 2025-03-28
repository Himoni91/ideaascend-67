
import { useMemo } from "react";
import { format, parseISO, differenceInMinutes, isBefore, isAfter } from "date-fns";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  MessageSquare,
  CheckCircle2,
  XCircle,
  PlayCircle,
  AlertCircle,
  ExternalLink,
  MoreHorizontal
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MentorSession } from "@/types/mentor";

interface MentorSessionCardProps {
  session: MentorSession;
  userRole: "mentor" | "mentee";
  onUpdateStatus: (sessionId: string, status: string) => Promise<void>;
}

export default function MentorSessionCard({ 
  session, 
  userRole, 
  onUpdateStatus 
}: MentorSessionCardProps) {
  const otherParty = userRole === "mentor" ? session.mentee : session.mentor;
  
  const statusColor = useMemo(() => {
    switch(session.status) {
      case "scheduled": return "bg-blue-50 text-blue-700 border-blue-200";
      case "in-progress": return "bg-amber-50 text-amber-700 border-amber-200";
      case "completed": return "bg-green-50 text-green-700 border-green-200";
      case "cancelled": return "bg-red-50 text-red-700 border-red-200";
      case "rescheduled": return "bg-purple-50 text-purple-700 border-purple-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  }, [session.status]);
  
  const statusIcon = useMemo(() => {
    switch(session.status) {
      case "scheduled": return <Calendar className="h-4 w-4 text-blue-500" />;
      case "in-progress": return <PlayCircle className="h-4 w-4 text-amber-500" />;
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "cancelled": return <XCircle className="h-4 w-4 text-red-500" />;
      case "rescheduled": return <AlertCircle className="h-4 w-4 text-purple-500" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  }, [session.status]);
  
  const sessionDuration = useMemo(() => {
    const startTime = parseISO(session.start_time);
    const endTime = parseISO(session.end_time);
    return differenceInMinutes(endTime, startTime);
  }, [session.start_time, session.end_time]);
  
  const isUpcoming = useMemo(() => {
    const startTime = parseISO(session.start_time);
    return isBefore(new Date(), startTime) && session.status !== "cancelled";
  }, [session.start_time, session.status]);
  
  const isPast = useMemo(() => {
    const endTime = parseISO(session.end_time);
    return isAfter(new Date(), endTime);
  }, [session.end_time]);
  
  const canStart = useMemo(() => {
    if (session.status !== "scheduled") return false;
    
    const startTime = parseISO(session.start_time);
    const now = new Date();
    const timeToStart = differenceInMinutes(startTime, now);
    
    // Can start 5 minutes before scheduled time
    return timeToStart <= 5 && !isPast;
  }, [session.status, session.start_time, isPast]);
  
  const canComplete = useMemo(() => {
    return session.status === "in-progress" && isPast;
  }, [session.status, isPast]);
  
  const canCancel = useMemo(() => {
    return isUpcoming && session.status === "scheduled";
  }, [isUpcoming, session.status]);
  
  const handleUpdateStatus = async (status: string) => {
    await onUpdateStatus(session.id, status);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{session.title}</CardTitle>
              <CardDescription>{session.session_type} Session</CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={`${statusColor} uppercase flex items-center space-x-1 px-2 py-1`}
            >
              {statusIcon}
              <span>{session.status}</span>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-4">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={otherParty?.avatar_url || undefined} />
              <AvatarFallback>{otherParty?.full_name?.charAt(0) || otherParty?.username?.charAt(0) || (userRole === "mentor" ? "M" : "U")}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-sm font-medium">
                {userRole === "mentor" ? "Mentee" : "Mentor"}: {otherParty?.full_name || otherParty?.username}
              </h4>
              {otherParty?.position && otherParty?.company && (
                <p className="text-xs text-muted-foreground">
                  {otherParty.position} at {otherParty.company}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {format(parseISO(session.start_time), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {format(parseISO(session.start_time), 'h:mm a')} - {format(parseISO(session.end_time), 'h:mm a')} ({sessionDuration} minutes)
              </span>
            </div>
            
            {session.description && (
              <div className="mt-2 text-sm text-muted-foreground">
                <p className="line-clamp-2">{session.description}</p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2 pb-4 border-t">
          <div className="flex gap-2">
            {session.session_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={session.session_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join
                </a>
              </Button>
            )}
            
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
          
          <div>
            {canStart && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => handleUpdateStatus("in-progress")}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            )}
            
            {canComplete && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => handleUpdateStatus("completed")}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete
              </Button>
            )}
            
            {canCancel && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Session Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => handleUpdateStatus("cancelled")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
