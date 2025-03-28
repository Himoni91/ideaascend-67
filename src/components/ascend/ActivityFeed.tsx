
import { XpTransaction } from "@/types/ascend";
import { format } from "date-fns";
import { 
  Award, 
  BadgeCheck, 
  Calendar, 
  MessageSquare, 
  Star, 
  Target, 
  ThumbsUp, 
  Trophy, 
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  activities: XpTransaction[];
  className?: string;
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "challenge_completed": return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "badge_earned": return <Award className="h-4 w-4 text-blue-500" />;
      case "profile_update": return <Users className="h-4 w-4 text-green-500" />;
      case "login_streak": return <Calendar className="h-4 w-4 text-purple-500" />;
      case "pitch_created": return <Target className="h-4 w-4 text-red-500" />;
      case "pitch_feedback": return <MessageSquare className="h-4 w-4 text-cyan-500" />;
      case "mentor_session": return <Star className="h-4 w-4 text-amber-500" />;
      case "post_like": return <ThumbsUp className="h-4 w-4 text-indigo-500" />;
      case "verification": return <BadgeCheck className="h-4 w-4 text-blue-500" />;
      default: return <Award className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getActivityLabel = (activity: XpTransaction) => {
    switch (activity.transaction_type) {
      case "challenge_completed":
        return "Completed a challenge";
      case "badge_earned":
        return "Earned a new badge";
      case "profile_update":
        return "Updated your profile";
      case "login_streak":
        return "Maintained login streak";
      case "pitch_created":
        return "Created a new pitch";
      case "pitch_feedback":
        return "Provided feedback";
      case "mentor_session":
        return "Completed mentor session";
      case "post_like":
        return "Received likes on post";
      case "verification":
        return "Account verified";
      default:
        return "Earned XP";
    }
  };
  
  if (activities.length === 0) {
    return (
      <div className={cn("text-center py-6", className)}>
        <p className="text-muted-foreground">No recent activity</p>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {activities.map((activity) => (
        <div 
          key={activity.id} 
          className="flex items-start justify-between pb-3 border-b last:border-0 last:pb-0"
        >
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-muted/50 mr-3">
              {getActivityIcon(activity.transaction_type)}
            </div>
            <div>
              <p className="text-sm font-medium">{getActivityLabel(activity)}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(activity.created_at), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
          <div className="text-sm font-medium text-green-600">
            +{activity.amount} XP
          </div>
        </div>
      ))}
    </div>
  );
}
