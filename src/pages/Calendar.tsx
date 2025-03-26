
import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MoreHorizontal, Clock, Users, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/layout/AppLayout";
import { formatDate } from "date-fns";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  
  // Mock data for mentor sessions and events
  const upcomingSessions = [
    {
      id: 1,
      title: "Product Strategy Discussion",
      mentor: "Sarah Johnson",
      date: new Date(2023, 8, 15, 14, 0),
      duration: 30,
      avatar: ""
    },
    {
      id: 2,
      title: "Funding Strategy Review",
      mentor: "Michael Chen",
      date: new Date(2023, 8, 17, 10, 0),
      duration: 60,
      avatar: ""
    },
    {
      id: 3,
      title: "Technical Architecture Consultation",
      mentor: "Alex Rivera",
      date: new Date(2023, 8, 20, 15, 30),
      duration: 45,
      avatar: ""
    }
  ];
  
  const events = [
    {
      id: 1,
      title: "Startup Pitch Competition",
      type: "Event",
      date: new Date(2023, 8, 15, 18, 0),
      location: "Virtual",
      attendees: 45
    },
    {
      id: 2,
      title: "Fundraising Workshop",
      type: "Workshop",
      date: new Date(2023, 8, 22, 13, 0),
      location: "Tech Hub, Downtown",
      attendees: 60
    },
    {
      id: 3,
      title: "Tech Networking Mixer",
      type: "Networking",
      date: new Date(2023, 9, 5, 17, 30),
      location: "Innovation Center",
      attendees: 32
    }
  ];
  
  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mb-2 sm:mb-0">Calendar</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {date ? formatDate(date, 'MMMM yyyy') : ''}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="month" onValueChange={(v) => setView(v as any)}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="day">Day</TabsTrigger>
                </TabsList>
                <Button>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <TabsContent value="month" className="m-0">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border shadow-sm p-3 pointer-events-auto"
                    />
                  </TabsContent>
                  <TabsContent value="week" className="m-0">
                    <div className="p-6 text-center">
                      <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                      <h3 className="text-lg font-medium mb-1">Week View</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Week view coming soon!
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="day" className="m-0">
                    <div className="p-6 text-center">
                      <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                      <h3 className="text-lg font-medium mb-1">Day View</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Day view coming soon!
                      </p>
                    </div>
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </div>
          
          <div>
            <Tabs defaultValue="sessions">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="sessions">Mentor Sessions</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sessions" className="m-0 space-y-4">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <Card key={session.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-base">{session.title}</CardTitle>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription className="flex items-center text-xs">
                          <Clock className="mr-1 h-3 w-3" />
                          {session.date.toLocaleDateString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                          })} at {formatEventTime(session.date)} • {session.duration} mins
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={session.avatar} />
                            <AvatarFallback>{session.mentor.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{session.mentor}</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex space-x-2 w-full">
                          <Button variant="outline" className="flex-1" size="sm">
                            Reschedule
                          </Button>
                          <Button className="flex-1" size="sm">
                            Join Call
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                      <h3 className="text-lg font-medium mb-1">No upcoming sessions</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                        You don't have any scheduled mentorship sessions. Book a session with a mentor.
                      </p>
                      <Button>Book a Session</Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="events" className="m-0 space-y-4">
                {events.map((event) => (
                  <Card key={event.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-base">{event.title}</CardTitle>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                      <CardDescription className="flex items-center text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        {event.date.toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric',
                        })} at {formatEventTime(event.date)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2 space-y-2">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                        {event.attendees} attending
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex space-x-2 w-full">
                        <Button variant="outline" className="flex-1" size="sm">
                          Details
                        </Button>
                        <Button className="flex-1" size="sm">
                          RSVP
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Calendar;
