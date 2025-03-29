import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { DateRange } from 'react-day-picker';
import { CalendarDateRangePicker } from '@/components/ui/calendar-date-range-picker';
import { useToast } from '@/components/ui/use-toast';
import { useMentor } from '@/hooks/use-mentor';
import { Calendar, Clock, DollarSign, Grid3X3, CheckCircle2, Zap, Star, MessageSquare, Tag, PanelRight, Clock8, Files } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MentorReviews } from '@/components/mentor';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { PageTransition } from '@/components/ui/page-transition';

const MentorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { 
    useMentorProfile,
    useMentorSessionTypes,
    useMentorAvailability,
    useBookMentorSession,
    useMentorReviews
  } = useMentor();
  
  // State for date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 14))  // 2 weeks from now
  });
  
  // Get mentor profile
  const { data: mentor, isLoading: isLoadingMentor } = useMentorProfile(id);
  
  // Get mentor session types
  const { data: sessionTypes, isLoading: isLoadingSessionTypes } = useMentorSessionTypes(id);
  
  // Get mentor availability with the correct params object
  const { data: availabilitySlots, isLoading: isLoadingAvailability } = useMentorAvailability({
    mentorId: id,
    startDate: dateRange?.from,
    endDate: dateRange?.to
  });
  
  // Get mentor reviews
  const { data: reviews } = useMentorReviews(id);
  
  // Session booking mutation
  const bookSession = useBookMentorSession();
  
  // State for selected session type and slot
  const [selectedSessionType, setSelectedSessionType] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingDescription, setBookingDescription] = useState('');
  
  // Handle date range change
  const handleDateRangeChange = (range?: DateRange) => {
    setDateRange(range);
    
    // Reset selected slot when date range changes
    setSelectedSlot(null);
  };
  
  // Group availability slots by date
  const groupedSlots = availabilitySlots?.reduce((groups: Record<string, any[]>, slot) => {
    const date = format(new Date(slot.start_time), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(slot);
    return groups;
  }, {});
  
  // Handle slot selection
  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId === selectedSlot ? null : slotId);
  };
  
  // Handle session type selection
  const handleSessionTypeSelect = (typeId: string) => {
    setSelectedSessionType(typeId === selectedSessionType ? null : typeId);
  };
  
  // Handle booking submission
  const handleBookSession = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a session",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedSlot || !selectedSessionType) {
      toast({
        title: "Incomplete Selection",
        description: "Please select a session type and time slot",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await bookSession.mutateAsync({
        mentorId: id!, 
        slotId: selectedSlot,
        sessionData: {
          title: bookingTitle || "Mentorship Session",
          description: bookingDescription,
          sessionType: selectedSessionType,
        }
      });
      
      toast({
        title: "Session Booked",
        description: "Your mentorship session has been booked successfully!",
        variant: "default"
      });
      
      // Reset form
      setSelectedSlot(null);
      setBookingTitle('');
      setBookingDescription('');
    } catch (error) {
      console.error("Error booking session:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error booking your session. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <AppLayout>
      <PageTransition>
        <div className="container max-w-7xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {isLoadingMentor ? (
                <div className="animate-pulse">
                  <div className="h-8 w-48 bg-secondary rounded mb-2"></div>
                  <div className="h-4 w-32 bg-secondary rounded"></div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={mentor?.avatar_url || undefined} />
                      <AvatarFallback>{mentor?.full_name?.charAt(0) || mentor?.username?.charAt(0) || "M"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold">{mentor?.full_name || mentor?.username}</h1>
                        {mentor?.is_verified && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-lg">
                        {mentor?.professional_headline || (mentor?.position && mentor?.company ? `${mentor.position} at ${mentor.company}` : 'Mentor')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="rounded-md">
                          <Star className="h-3.5 w-3.5 mr-1 text-yellow-500 fill-yellow-500" />
                          {mentor?.stats?.mentorRating || '4.9'} ({mentor?.stats?.mentorReviews || '0'} reviews)
                        </Badge>
                        <Badge variant="secondary" className="rounded-md">
                          <Zap className="h-3.5 w-3.5 mr-1 text-amber-500" />
                          {mentor?.stats?.sessionCount || '0'} sessions
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">About Me</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {mentor?.mentor_bio || mentor?.bio || "No bio provided yet."}
                    </p>
                  </div>

                  {mentor?.expertise && mentor.expertise.length > 0 && (
                    <div className="mt-6">
                      <h2 className="text-xl font-semibold mb-2">Areas of Expertise</h2>
                      <div className="flex flex-wrap gap-2">
                        {mentor.expertise.map((expertise, index) => (
                          <Badge key={index} variant="outline" className="bg-primary/5 px-2.5 py-1">
                            {expertise}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              
              <Separator className="my-8" />
              
              <Tabs defaultValue="about">
                <TabsList className="mb-6">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="space-y-6">
                  {mentor?.work_experience && mentor.work_experience.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Work Experience</h3>
                      <div className="space-y-4">
                        {mentor.work_experience.map((exp, index) => (
                          <div key={index}>
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{exp.title}</h4>
                                <p className="text-muted-foreground">{exp.company}</p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {exp.startDate} - {exp.endDate || 'Present'}
                              </p>
                            </div>
                            {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {mentor?.education && mentor.education.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Education</h3>
                      <div className="space-y-4">
                        {mentor.education.map((edu, index) => (
                          <div key={index}>
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">{edu.degree}</h4>
                                <p className="text-muted-foreground">{edu.institution}</p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {edu.startYear} - {edu.endYear || 'Present'}
                              </p>
                            </div>
                            {edu.description && <p className="text-sm mt-1">{edu.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="experience" className="space-y-6">
                  {/* Another view of work experience possibly with more details */}
                  <p>More detailed work history and achievements...</p>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <MentorReviews mentorId={id || ''} />
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Booking sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Book a Session</CardTitle>
                  <CardDescription>Schedule time with {mentor?.full_name || 'this mentor'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Session Types */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Session Types</h3>
                    <div className="space-y-3">
                      {isLoadingSessionTypes ? (
                        Array.from({ length: 2 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-12 bg-muted rounded-md"></div>
                          </div>
                        ))
                      ) : sessionTypes && sessionTypes.length > 0 ? (
                        sessionTypes.map((type) => (
                          <div 
                            key={type.id} 
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedSessionType === type.id ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'}`}
                            onClick={() => handleSessionTypeSelect(type.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Grid3X3 className={`h-4 w-4 mr-2 ${type.color ? `text-${type.color}-500` : 'text-primary'}`} />
                                <span className="font-medium">{type.name}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{type.duration} min</span>
                              </div>
                            </div>
                            {selectedSessionType === type.id && (
                              <div className="mt-2">
                                <p className="text-sm text-muted-foreground">{type.description}</p>
                                <div className="flex items-center mt-2">
                                  <DollarSign className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                                  <span className="font-medium">
                                    {type.is_free ? 'Free' : `$${type.price} ${type.currency || 'USD'}`}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No session types available</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Date Range Picker */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Select Date Range</h3>
                    <CalendarDateRangePicker 
                      date={dateRange} 
                      onDateChange={handleDateRangeChange} 
                    />
                  </div>
                  
                  {/* Available Time Slots */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Available Time Slots</h3>
                    {isLoadingAvailability ? (
                      <div className="animate-pulse space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-10 bg-muted rounded-md"></div>
                        ))}
                      </div>
                    ) : groupedSlots && Object.keys(groupedSlots).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(groupedSlots).map(([date, slots]) => (
                          <div key={date}>
                            <h4 className="text-sm font-medium mb-2">{format(new Date(date), 'EEEE, MMMM d')}</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {slots.map((slot) => (
                                <Button
                                  key={slot.id}
                                  variant={selectedSlot === slot.id ? "default" : "outline"}
                                  className="justify-start"
                                  onClick={() => handleSlotSelect(slot.id)}
                                >
                                  <Clock8 className="h-3.5 w-3.5 mr-2" />
                                  {format(new Date(slot.start_time), 'h:mm a')}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-2">No available slots in the selected date range</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    disabled={!selectedSessionType || !selectedSlot || bookSession.isPending}
                    onClick={handleBookSession}
                  >
                    {bookSession.isPending ? (
                      <>Processing...</>
                    ) : (
                      <>Book Session</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default MentorProfilePage;
