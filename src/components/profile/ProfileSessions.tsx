
import { ProfileType } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, User } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileSessionsProps {
  profile: ProfileType;
}

export default function ProfileSessions({ profile }: ProfileSessionsProps) {
  // Mocked session data
  const mockSessions = [
    {
      id: "1",
      date: "2023-07-15T14:00:00",
      duration: 30,
      title: "Product Strategy Discussion",
      participant: {
        id: "user1",
        name: "Sarah Johnson",
        avatar: "",
        expertise: "Product Management"
      },
      status: "completed"
    },
    {
      id: "2",
      date: "2023-08-02T10:00:00",
      duration: 60,
      title: "Funding Strategy Review",
      participant: {
        id: "user2",
        name: "Michael Chen",
        avatar: "",
        expertise: "VC Funding"
      },
      status: "completed"
    },
    {
      id: "3",
      date: "2023-09-10T15:30:00",
      duration: 45,
      title: "UI/UX Feedback Session",
      participant: {
        id: "user3",
        name: "Alex Rivera",
        avatar: "",
        expertise: "UX Design"
      },
      status: "scheduled"
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (mockSessions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
        <h3 className="text-lg font-medium mb-1">No mentorship sessions yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {profile.id === profile.id 
            ? profile.is_mentor 
              ? "You haven't conducted any mentorship sessions yet."
              : "You haven't participated in any mentorship sessions yet."
            : `${profile.full_name || profile.username} hasn't participated in any mentorship sessions yet.`}
        </p>
        {profile.is_mentor ? (
          <Button className="mt-4" variant="outline" asChild>
            <a href="/mentor-space">
              <Calendar className="mr-2 h-4 w-4" />
              Manage Availability
            </a>
          </Button>
        ) : (
          <Button className="mt-4" variant="outline" asChild>
            <a href="/mentor-space">
              <User className="mr-2 h-4 w-4" />
              Find a Mentor
            </a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {mockSessions.length} {mockSessions.length === 1 ? "session" : "sessions"}
        </div>
        <Button variant="outline" size="sm" className="h-8">
          <Calendar className="mr-2 h-4 w-4" />
          {profile.is_mentor ? "Manage Availability" : "Book a Session"}
        </Button>
      </div>
      
      <motion.div 
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {mockSessions.map((session) => (
          <motion.div 
            key={session.id}
            variants={item}
            className="border rounded-lg p-4 bg-card hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="hidden sm:block">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.participant.avatar} />
                  <AvatarFallback>{session.participant.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-base font-medium">{session.title}</h3>
                  <Badge variant={session.status === "completed" ? "secondary" : "default"} className="text-xs">
                    {session.status === "completed" ? "Completed" : "Upcoming"}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-3.5 w-3.5" />
                    {new Date(session.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                  <span>
                    {new Date(session.date).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <span>{session.duration} min</span>
                </div>
                
                <div className="mt-2 flex items-center">
                  <span className="text-sm">
                    {profile.is_mentor ? "With: " : "Mentor: "}
                    <a href="#" className="font-medium hover:underline">{session.participant.name}</a>
                  </span>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{session.participant.expertise}</span>
                </div>
              </div>
              
              <div>
                {session.status === "completed" ? (
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    View Notes
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    <MessageSquare className="mr-2 h-3.5 w-3.5" />
                    Join Call
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
