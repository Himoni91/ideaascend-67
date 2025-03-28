
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  VideoIcon,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MentorSession } from "@/types/mentor";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MentorSessionCardProps {
  session: MentorSession;
  userRole: "mentor" | "mentee";
  onUpdateStatus?: (sessionId: string, status: MentorSession["status"]) => void;
  isUpdating?: boolean;
}

export default function MentorSessionCard({ 
  session, 
  userRole,
  onUpdateStatus,
  isUpdating = false
}: MentorSessionCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Get the other participant based on user role
  const otherParticipant = userRole === "mentor" ? session.mentee : session.mentor;
  
  // Determine status color
  const getStatusColor = (status: MentorSession["status"]) => {
    switch(status) {
      case "scheduled": return "bg-blue-500 hover:bg-blue-600";
      case "in-progress": return "bg-purple-500 hover:bg-purple-600";
      case "completed": return "bg-green-500 hover:bg-green-600";
      case "cancelled": return "bg-red-500 hover:bg-red-600";
      case "rescheduled": return "bg-yellow-500 hover:bg-yellow-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };
  
  // Format session duration
  const formatDuration = () => {
    const start = parseISO(session.start_time);
    const end = parseISO(session.end_time);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    return `${diffMins} min`;
  };
  
  // Get badge variant based on payment status
  const getPaymentBadgeVariant = (status: string) => {
    switch(status) {
      case "completed": return "secondary";
      case "pending": return "outline";
      case "refunded": return "destructive";
      case "failed": return "destructive";
      default: return "outline";
    }
  };
  
  // Get action buttons based on session status and user role
  const getActionButtons = () => {
    if (isUpdating) {
      return (
        <Button disabled className="w-full sm:w-auto">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating
        </Button>
      );
    }
    
    switch(session.status) {
      case "scheduled":
        const isUpcoming = new Date(session.start_time) > new Date();
        
        if (isUpcoming) {
          return (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              {session.session_url && (
                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <a href={session.session_url} target="_blank" rel="noopener noreferrer">
                    <VideoIcon className="mr-2 h-4 w-4" />
                    Session Link
                  </a>
                </Button>
              )}
              
              {onUpdateStatus && (
                <>
                  <Button 
                    variant="default"
                    className="w-full sm:w-auto"
                    onClick={() => onUpdateStatus(session.id, "in-progress")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Start Session
                  </Button>
                  
                  <Button 
                    variant="destructive"
                    className="w-full sm:w-auto"
                    onClick={() => onUpdateStatus(session.id, "cancelled")}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          );
        } else {
          return onUpdateStatus ? (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button 
                variant="default"
                className="w-full sm:w-auto"
                onClick={() => onUpdateStatus(session.id, "in-progress")}
              >
                <Clock className="mr-2 h-4 w-4" />
                Start Session
              </Button>
              
              <Button 
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => onUpdateStatus(session.id, "cancelled")}
              >
                Cancel
              </Button>
            </div>
          ) : null;
        }
        
      case "in-progress":
        return onUpdateStatus ? (
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button 
              variant="default"
              className={cn("w-full sm:w-auto", getStatusColor("completed"))}
              onClick={() => onUpdateStatus(session.id, "completed")}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Session
            </Button>
          </div>
        ) : null;
        
      case "completed":
        return userRole === "mentee" ? (
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button variant="outline" className="w-full sm:w-auto">
              <MessageSquare className="mr-2 h-4 w-4" />
              Write Review
            </Button>
            
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="mr-2 h-4 w-4" />
              Book Again
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="w-full sm:w-auto">
            <FileText className="mr-2 h-4 w-4" />
            View Notes
          </Button>
        );
        
      default:
        return null;
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Status bar */}
          <div className={cn("h-2", getStatusColor(session.status))} />
          
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* Session info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-base font-medium truncate">{session.title}</h3>
                  <Badge className={getStatusColor(session.status)}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </Badge>
                  <Badge variant={getPaymentBadgeVariant(session.payment_status)}>
                    {session.payment_status === "completed" ? "Paid" : session.payment_status}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-3.5 w-3.5" />
                    {format(parseISO(session.start_time), 'EEE, MMM d, yyyy')}
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3.5 w-3.5" />
                    {format(parseISO(session.start_time), 'h:mm a')} - {format(parseISO(session.end_time), 'h:mm a')}
                  </span>
                  <span className="flex items-center">
                    {formatDuration()}
                  </span>
                </div>
                
                <div className="flex items-center mt-3">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={otherParticipant?.avatar_url || undefined} />
                    <AvatarFallback>
                      {otherParticipant?.full_name?.charAt(0) || otherParticipant?.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {userRole === "mentor" ? "Mentee: " : "Mentor: "}
                    <span className="font-medium">
                      {otherParticipant?.full_name || otherParticipant?.username || "Anonymous"}
                    </span>
                  </span>
                </div>
              </div>
              
              {/* Expand/collapse button */}
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Expanded content */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t">
                    {session.description && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-1">Description</h4>
                        <p className="text-sm text-muted-foreground">{session.description}</p>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">Session Details</h4>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <dt className="text-muted-foreground">Type</dt>
                          <dd>{session.session_type || "Standard"}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Duration</dt>
                          <dd>{formatDuration()}</dd>
                        </div>
                        {session.payment_amount && (
                          <div>
                            <dt className="text-muted-foreground">Amount</dt>
                            <dd>
                              {session.payment_currency || "$"}{session.payment_amount}
                            </dd>
                          </div>
                        )}
                        {session.payment_provider && (
                          <div>
                            <dt className="text-muted-foreground">Payment Method</dt>
                            <dd>
                              {session.payment_provider.charAt(0).toUpperCase() + session.payment_provider.slice(1)}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    
                    {session.session_notes && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-1">Session Notes</h4>
                        <p className="text-sm text-muted-foreground">{session.session_notes}</p>
                      </div>
                    )}
                    
                    {session.cancelled_by && session.cancellation_reason && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md">
                        <div className="flex items-start">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
                          <div>
                            <h4 className="text-sm font-medium mb-1 text-red-800 dark:text-red-300">Cancellation Reason</h4>
                            <p className="text-sm text-red-700 dark:text-red-400">{session.cancellation_reason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {getActionButtons()}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Always visible action buttons */}
            {!expanded && (
              <div className="flex flex-wrap gap-2 mt-4">
                {getActionButtons()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
