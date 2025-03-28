
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, MapPin, Calendar, Clock, Award, ThumbsUp, Briefcase, CheckCircle, Info, Users, BadgeCheck, ExternalLink, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { useMentor } from "@/hooks/use-mentor";
import { useAuth } from "@/contexts/AuthContext";
import { usePayment } from "@/hooks/use-payment";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";
import MentorAvailabilityCalendar from "@/components/mentor/MentorAvailabilityCalendar";
import MentorReviews from "@/components/mentor/MentorReviews";
import { MentorBookingModal } from "@/components/mentor/MentorBookingModal";
import { MentorAvailabilitySlot } from "@/types/mentor";

export default function MentorProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<MentorAvailabilitySlot | null>(null);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  
  const { useMentorProfile, useMentorAvailability, useMentorReviews, bookMentorSession } = useMentor();
  
  const { data: mentor, isLoading: isLoadingMentor } = useMentorProfile(id);
  const { data: availabilitySlots = [], isLoading: isLoadingSlots } = useMentorAvailability(id);
  const { data: reviews = [], isLoading: isLoadingReviews } = useMentorReviews(id);
  
  // Check if the current user is the mentor
  const isCurrentUserMentor = user?.id === mentor?.id;
  
  // Sort availability slots by start time
  const sortedSlots = [...(availabilitySlots || [])].sort((a, b) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });
  
  // Filter out booked slots
  const availableSlots = sortedSlots.filter(slot => !slot.is_booked);
  
  // Handle booking a session
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
      navigate("/auth/sign-in");
      return;
    }
    
    try {
      setIsProcessingBooking(true);
      
      await bookMentorSession(bookingData);
      
      toast.success("Session booked successfully! Check your upcoming sessions for details.");
      setBookingModalOpen(false);
      setSelectedSlot(null);
      
      // Redirect to sessions page
      navigate("/mentor-space/sessions");
    } catch (error) {
      console.error("Error booking session:", error);
      toast.error("Failed to book session. Please try again.");
    } finally {
      setIsProcessingBooking(false);
    }
  };
  
  // Format expertise as badges
  const expertiseBadges = mentor?.expertise || [];
  
  // Calculate average rating
  const averageRating = mentor?.stats?.mentorRating || 0;
  
  // Render star rating
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };
  
  if (isLoadingMentor) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[70vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  if (!mentor) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>Mentor not found. The mentor may have been removed or you entered an incorrect URL.</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild>
              <Link to="/mentor-space">Back to Mentor Space</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background">
                <AvatarImage src={mentor.avatar_url || undefined} />
                <AvatarFallback className="text-3xl">
                  {mentor.full_name?.charAt(0) || mentor.username?.charAt(0) || "M"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold mr-2">{mentor.full_name || mentor.username}</h1>
                  {mentor.is_verified && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <BadgeCheck className="h-3.5 w-3.5 mr-1 fill-blue-600/50 dark:fill-blue-400/50" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="text-lg text-muted-foreground mb-3">
                  {mentor.position} {mentor.company && `at ${mentor.company}`}
                </div>
                
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-4">
                  {mentor.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1.5" />
                      {mentor.location}
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1.5" />
                    {mentor.stats?.mentorSessions || 0} Sessions
                  </div>
                  
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1.5" />
                    {mentor.stats?.mentorReviews || 0} Reviews
                  </div>
                  
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1.5 fill-yellow-500 text-yellow-500" />
                    {averageRating.toFixed(1)} Rating
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {expertiseBadges.slice(0, 5).map((expertise, index) => (
                    <Badge key={index} variant="outline" className="bg-primary/5">
                      {expertise}
                    </Badge>
                  ))}
                  {expertiseBadges.length > 5 && (
                    <Badge variant="outline">+{expertiseBadges.length - 5} more</Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {!isCurrentUserMentor && (
                    <Button onClick={() => setBookingModalOpen(true)}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Book a Session
                    </Button>
                  )}
                  
                  {mentor.linkedin_url && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  
                  {mentor.website && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={mentor.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Tabs defaultValue="about">
                <TabsList className="w-full">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Reviews ({reviews.length})
                  </TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>About</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-line">
                          {mentor.mentor_bio || mentor.bio || "No bio available."}
                        </p>
                        
                        {mentor.mentor_session_types && mentor.mentor_session_types.length > 0 && (
                          <div className="mt-8">
                            <h3 className="text-lg font-medium mb-4">Session Types</h3>
                            <div className="space-y-4">
                              {mentor.mentor_session_types.map((type) => (
                                <div key={type.id} className="p-4 border rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium">{type.name}</h4>
                                      <p className="text-sm text-muted-foreground">{type.description}</p>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">
                                        {type.is_free ? "Free" : `$${type.price} ${type.currency}`}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {type.duration} minutes
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="reviews" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Reviews ({reviews.length})</CardTitle>
                        <CardDescription>
                          What others are saying about {mentor.full_name || mentor.username}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <MentorReviews reviews={reviews} isLoading={isLoadingReviews} />
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="experience" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>Professional Experience</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {mentor.work_experience && mentor.work_experience.length > 0 ? (
                          <div className="space-y-6">
                            {mentor.work_experience.map((experience: any, index: number) => (
                              <div key={index} className="border-l-2 border-primary/30 pl-4">
                                <h3 className="font-medium">{experience.position}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {experience.company} • {experience.start_date} - {experience.end_date || "Present"}
                                </p>
                                {experience.description && (
                                  <p className="mt-2 text-sm">{experience.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No experience information available.</p>
                        )}
                        
                        {mentor.education && mentor.education.length > 0 && (
                          <div className="mt-8">
                            <h3 className="text-lg font-medium mb-4">Education</h3>
                            <div className="space-y-4">
                              {mentor.education.map((education: any, index: number) => (
                                <div key={index} className="border-l-2 border-primary/30 pl-4">
                                  <h4 className="font-medium">{education.degree}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {education.institution} • {education.graduation_year}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <MentorAvailabilityCalendar
                  mentorId={mentor.id}
                  availabilitySlots={availableSlots}
                  isLoading={isLoadingSlots}
                  onSlotSelected={setSelectedSlot}
                  selectedSlot={selectedSlot}
                />
                
                {selectedSlot && (
                  <div className="mt-6">
                    <Button
                      className="w-full"
                      onClick={() => setBookingModalOpen(true)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Book This Slot
                    </Button>
                  </div>
                )}
                
                <Card className="mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Stats & Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 rounded-lg bg-primary/5">
                        <div className="text-2xl font-bold text-primary">{mentor.stats?.mentorSessions || 0}</div>
                        <div className="text-xs text-muted-foreground">Sessions Completed</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-primary/5">
                        <div className="text-2xl font-bold text-primary">{averageRating.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Average Rating</div>
                      </div>
                    </div>
                    
                    {mentor.badges && mentor.badges.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium mb-2">Badges</h4>
                        <div className="flex flex-wrap gap-2">
                          {mentor.badges.map((badge: any, index: number) => (
                            <div key={index} className="p-2 rounded-lg bg-primary/5 flex items-center">
                              <Award className="h-4 w-4 mr-2 text-primary" />
                              <span className="text-xs">{badge.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
          
          {/* Booking Modal */}
          <MentorBookingModal
            isOpen={bookingModalOpen}
            onClose={() => setBookingModalOpen(false)}
            mentor={mentor}
            selectedSlot={selectedSlot}
            onConfirmBooking={handleBookSession}
            isProcessing={isProcessingBooking}
          />
        </div>
      </PageTransition>
    </AppLayout>
  );
}
