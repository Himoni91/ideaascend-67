
import { ProfileType } from "@/types/profile";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileSessionsProps {
  profile: ProfileType;
}

export default function ProfileSessions({ profile }: ProfileSessionsProps) {
  // This would come from the API in production
  const sessions = profile.is_mentor ? [
    {
      id: "1",
      title: "Product Roadmap Planning",
      date: "2023-10-25T14:00:00Z",
      duration: 45,
      mentee: "Alice Johnson",
      status: "upcoming"
    },
    {
      id: "2",
      title: "Seed Funding Strategy",
      date: "2023-10-20T10:30:00Z",
      duration: 60,
      mentee: "Bob Smith",
      status: "completed"
    }
  ] : [
    {
      id: "1",
      title: "Startup Financial Planning",
      date: "2023-10-22T15:00:00Z",
      duration: 45,
      mentor: "Jane Doe",
      status: "upcoming"
    },
    {
      id: "2",
      title: "Go-to-Market Strategy",
      date: "2023-10-15T11:00:00Z",
      duration: 60,
      mentor: "David Wilson",
      status: "completed"
    }
  ];

  if (sessions.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 text-center">
        <p className="text-gray-500 dark:text-gray-400">No mentor sessions yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Card 
          key={session.id} 
          className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in ${
            session.status === 'upcoming' 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
              : 'bg-white dark:bg-gray-800'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{session.title}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <CalendarDays className="w-4 h-4 mr-2 text-gray-500" />
                    {new Date(session.date).toLocaleDateString(undefined, { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    {new Date(session.date).toLocaleTimeString(undefined, { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} • {session.duration} minutes
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="w-4 h-4 mr-2 flex items-center justify-center text-gray-500">
                      {profile.is_mentor ? '👨‍🎓' : '👨‍🏫'}
                    </span>
                    {profile.is_mentor ? `Mentee: ${session.mentee}` : `Mentor: ${session.mentor}`}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-start md:items-end">
                <span className={`text-xs font-medium px-2 py-1 rounded-full mb-3 ${
                  session.status === 'upcoming' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                }`}>
                  {session.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                </span>
                
                {session.status === 'upcoming' && (
                  <Button size="sm" className="gap-2 w-full md:w-auto">
                    <Video className="w-4 h-4" />
                    Join Session
                  </Button>
                )}
                
                {session.status === 'completed' && (
                  <Button variant="outline" size="sm" className="gap-2 w-full md:w-auto">
                    View Notes
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
