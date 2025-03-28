
import { format, parseISO, isPast, isFuture } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Clock, Video, MessageSquare, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MentorSession } from "@/types/mentor";
import { ProfileType } from "@/types/profile";
import { useState } from "react";
import { toast } from "sonner";

interface MentorSessionCardProps {
  session: MentorSession;
  userRole: "mentor" | "mentee";
  onUpdateStatus: (sessionId: string, status: string) => Promise<void>;
}

export default function MentorSessionCard({ session, userRole, onUpdateStatus }: MentorSessionCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const otherParty: ProfileType | undefined = userRole === "mentor" ? session.mentee : session.mentor;
  const startTime = parseISO(session.start_time);
  const endTime = parseISO(session.end_time);
  const isUpcoming = isFuture(startTime);
  const isPastSession = isPast(endTime);
  
  const handleUpdateStatus = async (status: string) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(session.id, status);
      toast.success(`Session ${status} successfully`);
    } catch (error) {
      console.error("Failed to update session:", error);
      toast.error("Failed to update session status");
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Get status badge variant and label
  const getStatusInfo = () => {
    switch (session.status) {
      case "scheduled":
        return { variant: "outline", label: "Scheduled" };
      case "in-progress":
        return { variant: "default", label: "In Progress" };
      case "completed":
        return { variant: "success", label: "Completed" };
      case "cancelled":
        return { variant: "destructive", label: "Cancelled" };
      case "rescheduled":
        return { variant: "warning", label: "Rescheduled" };
      default:
        return { variant: "outline", label: session.status };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-lg">{session.title}</CardTitle>
              <CardDescription className="mt-1 flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                {format(startTime, "EEEE, MMMM d, yyyy")}
              </CardDescription>
            </div>
            <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-3">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">
                  {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                </span>
              </div>
              
              {session.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {session.description}
                </p>
              )}
              
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">{session.session_type}</Badge>
                {session.payment_status === "completed" && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Paid
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:items-end justify-between">
              <div className="flex items-center mb-3">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={otherParty?.avatar_url || undefined} />
                  <AvatarFallback>{otherParty?.full_name?.charAt(0) || otherParty?.username?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{otherParty?.full_name || otherParty?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {userRole === "mentor" ? "Mentee" : "Mentor"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 flex flex-wrap gap-2">
          {isUpdating ? (
            <Button disabled className="w-full sm:w-auto">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </Button>
          ) : (
            <>
              {isUpcoming && session.status === "scheduled" && (
                <>
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => handleUpdateStatus("in-progress")}>
                    <Video className="mr-2 h-4 w-4" />
                    Start Session
                  </Button>
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1 sm:flex-none" onClick={() => handleUpdateStatus("cancelled")}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}
              
              {session.status === "in-progress" && (
                <>
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    <Video className="mr-2 h-4 w-4" />
                    Join Session
                  </Button>
                  <Button variant="default" className="flex-1 sm:flex-none" onClick={() => handleUpdateStatus("completed")}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Session
                  </Button>
                </>
              )}
              
              {session.status === "completed" && userRole === "mentee" && (
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Star className="mr-2 h-4 w-4" />
                  Leave Review
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

import { Star } from "lucide-react";
