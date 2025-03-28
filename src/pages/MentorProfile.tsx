import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO, isBefore } from "date-fns";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/layout/AppLayout";
import { Calendar, Clock, MapPin, Briefcase, CheckCircle, ThumbsUp, MessageSquare, Star, Users, ExternalLink, FileText, ChevronLeft, CalendarClock, Loader } from "lucide-react";
import { useMentor } from "@/hooks/use-mentor";
import { useAuth } from "@/contexts/AuthContext";
import { MentorBookingModal } from "@/components/mentor/MentorBookingModal";
import { MentorAvailabilitySlot } from "@/types/mentor";
import { toast } from "sonner";
import { PageTransition } from "@/components/PageTransition";

export default function MentorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useMentorProfile, useMentorAvailability, useMentorReviews, bookMentorSession } = useMentor();
  const { user } = useAuth();
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<MentorAvailabilitySlot | null>(null);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  
  const { data: mentor, isLoading: isLoadingMentor, error: mentorError } = useMentorProfile(id);
  const { data: availabilitySlots = [], isLoading: isLoadingAvailability } = useMentorAvailability(id);
  const { data: reviews = [], isLoading: isLoadingReviews } = useMentorReviews(id);
  
  useEffect(() => {
    if (mentorError) {
      toast.error("Failed to load mentor profile. Please try again.");
      console.error(mentorError);
    }
  }, [mentorError]);
  
  const handleSelectTimeSlot = (slot: MentorAvailabilitySlot) => {
    setSelectedSlot(slot);
    setIsBookingModalOpen(true);
  };
  
  const handleBookSession = async (bookingData: {
    mentorId: string;
    slotId: string;
    sessionData: {
      title: string;
      description?: string;
      session_type: string;
      payment_provider?: string;
      payment_id?: string;
      payment_amount?: number;
    }
  }) => {
    if (!user) {
      toast.error("You must be logged in to book a session");
      return;
    }
    
    setIsProcessingBooking(true);
    
    try {
      await bookMentorSession(bookingData);
      toast.success("Session booked successfully!");
      setIsBookingModalOpen(false);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book the session. Please try again.");
    } finally {
      setIsProcessingBooking(false);
    }
  };
  
  const futureSlots = availabilitySlots.filter(slot => 
    !slot.is_booked && isBefore(new Date(), parseISO(slot.start_time))
  );

  const slotsByDate: Record<string, MentorAvailabilitySlot[]> = {};
  futureSlots.forEach(slot => {
    const date = format(parseISO(slot.start_time), 'yyyy-MM-dd');
    if (!slotsByDate[date]) {
      slotsByDate[date] = [];
    }
    slotsByDate[date].push(slot);
  });
  
  if (isLoadingMentor) {
    return (
      <AppLayout>
        <div className="container max-w-6xl mx-auto py-8 flex justify-center items-center min-h-[60vh]">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }
  
  if (!mentor) {
    return (
      <AppLayout>
        <div className="container max-w-6xl mx-auto py-8">
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
            <h2 className="text-2xl font-bold mb-2">Mentor Not Found</h2>
            <p className="text-muted-foreground">The mentor you're looking for doesn't exist or may have been removed.</p>
            <Button 
              className="mt-6" 
              onClick={() => navigate('/mentor-space')}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Mentor Space
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 pb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/mentor-space')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Mentor Space
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-start gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={mentor.avatar_url || undefined} />
                    <AvatarFallback>{mentor.full_name?.charAt(0) || mentor.username?.charAt(0) || 'M'}</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <h1 className="text-3xl font-bold">{mentor.full_name || mentor.username}</h1>
                      {mentor.is_verified && (
                        <Badge className="bg-idolyst-blue/90">Verified</Badge>
                      )}
                    </div>
                    
                    <p className="text-xl text-muted-foreground mt-1">
                      {mentor.position} {mentor.company && `at ${mentor.company}`}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                      {mentor.location && (
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="mr-1 h-4 w-4" />
                          {mentor.location}
                        </div>
                      )}
                      
                      <div className="flex items-center text-muted-foreground">
                        <Briefcase className="mr-1 h-4 w-4" />
                        {mentor.stats?.mentorSessions || 0} sessions conducted
                      </div>
                      
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{mentor.stats?.mentorRating || "New"}</span>
                        <span className="text-muted-foreground ml-1">({mentor.stats?.mentorReviews || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-muted-foreground whitespace-pre-line">
                    {mentor.mentor_bio || mentor.bio}
                  </p>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Areas of Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise?.map((expertise, i) => (
                      <Badge key={i} variant="outline" className="bg-primary/5">
                        {expertise}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-10"
              >
                <Tabs defaultValue="about">
                  <TabsList className="w-full max-w-md">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Background & Experience</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {mentor.work_experience && mentor.work_experience.length > 0 ? (
                          <div>
                            <h3 className="text-lg font-medium mb-3">Work Experience</h3>
                            <div className="space-y-4">
                              {(mentor.work_experience as any[]).map((work, i) => (
                                <div key={i} className="border-l-2 border-muted pl-4">
                                  <h4 className="font-medium">{work.title}</h4>
                                  <p className="text-sm text-muted-foreground">{work.company}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {work.start_date} - {work.end_date || 'Present'}
                                  </p>
                                  {work.description && (
                                    <p className="text-sm mt-1">{work.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-lg font-medium mb-2">Work Experience</h3>
                            <p className="text-muted-foreground">No work experience information provided.</p>
                          </div>
                        )}
                        
                        <div className="pt-4">
                          <h3 className="text-lg font-medium mb-3">External Links</h3>
                          <div className="flex flex-wrap gap-3">
                            {mentor.linkedin_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer">
                                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                  </svg>
                                  LinkedIn
                                </a>
                              </Button>
                            )}
                            
                            {mentor.website && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={mentor.website} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Website
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Mentor Reviews</CardTitle>
                        <CardDescription>
                          What others are saying about {mentor.full_name || mentor.username}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingReviews ? (
                          <div className="flex justify-center items-center py-8">
                            <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : reviews.length === 0 ? (
                          <div className="text-center py-6 border rounded-lg">
                            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-2" />
                            <h3 className="text-lg font-medium mb-1">No Reviews Yet</h3>
                            <p className="text-sm text-muted-foreground">
                              This mentor doesn't have any reviews yet.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {reviews.map((review) => (
                              <div key={review.id} className="border-b pb-5 last:border-0">
                                <div className="flex items-start">
                                  <Avatar className="h-8 w-8 mr-3">
                                    <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                                    <AvatarFallback>
                                      {review.reviewer?.full_name?.charAt(0) || review.reviewer?.username?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center">
                                      <h4 className="font-medium">
                                        {review.reviewer?.full_name || review.reviewer?.username || 'Anonymous'}
                                      </h4>
                                    </div>
                                    <div className="flex items-center my-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star 
                                          key={i} 
                                          className={`h-3.5 w-3.5 ${
                                            i < review.rating 
                                              ? 'text-yellow-500 fill-yellow-500' 
                                              : 'text-gray-300 dark:text-gray-600'
                                          }`} 
                                        />
                                      ))}
                                      <span className="text-xs text-muted-foreground ml-2">
                                        {new Date(review.created_at).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-sm">
                                      {review.content}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="availability" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Book a Session</CardTitle>
                        <CardDescription>
                          Select an available time slot to schedule a mentorship session
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingAvailability ? (
                          <div className="flex justify-center items-center py-8">
                            <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : futureSlots.length === 0 ? (
                          <div className="text-center py-6 border rounded-lg">
                            <CalendarClock className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-2" />
                            <h3 className="text-lg font-medium mb-1">No Available Slots</h3>
                            <p className="text-sm text-muted-foreground">
                              This mentor hasn't set any available time slots yet.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {Object.entries(slotsByDate).map(([date, slots]) => {
                              const formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');
                              
                              return (
                                <div key={date}>
                                  <h4 className="text-sm font-medium mb-3 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                    {formattedDate}
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {slots.map(slot => {
                                      const startTime = parseISO(slot.start_time);
                                      const endTime = parseISO(slot.end_time);
                                      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
                                      
                                      return (
                                        <Button 
                                          key={slot.id} 
                                          variant="outline" 
                                          className="justify-start"
                                          onClick={() => handleSelectTimeSlot(slot)}
                                        >
                                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                          <span>
                                            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                                          </span>
                                          <span className="text-xs text-muted-foreground ml-auto">
                                            {duration} min
                                          </span>
                                        </Button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
            
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Schedule a Session</CardTitle>
                    <CardDescription>
                      Book time with {mentor.full_name || mentor.username} to get personalized mentorship
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {(mentor.mentor_session_types || [
                        {
                          id: "quick",
                          name: "Quick Chat",
                          description: "30-minute session for specific questions",
                          duration: 30,
                          price: 0,
                          is_free: true
                        },
                        {
                          id: "standard",
                          name: "Standard Session",
                          description: "60-minute in-depth consultation",
                          duration: 60,
                          price: 25
                        }
                      ]).map((sessionType: any, i: number) => (
                        <Card key={i} className="overflow-hidden">
                          <div className={`p-2 text-center text-white ${sessionType.color || "bg-idolyst-blue"}`}>
                            <p className="text-sm font-medium">{sessionType.name}</p>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-sm">{sessionType.duration} min</span>
                              </div>
                              <div className="font-semibold">
                                {sessionType.is_free || sessionType.price === 0 
                                  ? 'Free' 
                                  : `${sessionType.currency || '$'}${sessionType.price}`}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {sessionType.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      <Button
                        onClick={() => {
                          const tabElement = document.querySelector('[data-value="availability"]');
                          if (tabElement instanceof HTMLElement) {
                            tabElement.click();
                          }
                        }}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        View Available Times
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={`mailto:${mentor.public_email || ''}`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Contact Mentor
                        </a>
                      </Button>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center mb-2 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>Money-back satisfaction guarantee</span>
                      </div>
                      <div className="flex items-center mb-2 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>Secure payment via Razorpay/PayPal</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FileText className="h-4 w-4 mr-2 text-green-500" />
                        <span>Post-session notes & resources</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </PageTransition>
      
      {isBookingModalOpen && selectedSlot && (
        <MentorBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          mentor={mentor}
          selectedSlot={selectedSlot}
          onConfirmBooking={handleBookSession}
          isProcessing={isProcessingBooking}
        />
      )}
    </AppLayout>
  );
}
