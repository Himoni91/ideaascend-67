
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO, isAfter } from "date-fns";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar,
  Clock,
  Award,
  Star,
  BookOpen,
  Check,
  MapPin,
  Briefcase,
  GraduationCap,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  FileText,
  Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";
import MentorReviews from "@/components/mentor/MentorReviews";
import MentorBookingModal from "@/components/mentor/MentorBookingModal";
import { useMentor } from "@/hooks/use-mentor";
import { useAuth } from "@/contexts/AuthContext";
import { asMentorProfile } from "@/types/mentor";
import { toast } from "sonner";

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("about");
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBookingProcessing, setIsBookingProcessing] = useState(false);
  
  const { 
    useMentorProfile, 
    useMentorAvailability, 
    useMentorReviews,
    bookMentorSession
  } = useMentor();
  
  const { data: mentor, isLoading } = useMentorProfile(id);
  const { data: availabilitySlots, isLoading: isLoadingSlots } = useMentorAvailability(id);
  const { data: reviews, isLoading: isLoadingReviews } = useMentorReviews(id);
  
  const mentorProfile = mentor ? asMentorProfile(mentor) : null;
  
  // Handle slot selection
  const handleSelectSlot = (slot: any) => {
    setSelectedSlot(slot);
    setIsBookingModalOpen(true);
  };
  
  // Handle booking confirmation
  const handleConfirmBooking = async (bookingData: any) => {
    if (!user) {
      toast.error("Please sign in to book a session");
      navigate("/auth/sign-in");
      return;
    }
    
    try {
      setIsBookingProcessing(true);
      
      await useMentor().bookMentorSession({
        mentorId: bookingData.mentorId,
        slotId: bookingData.slotId,
        sessionData: bookingData.sessionData
      });
      
      toast.success("Session booked successfully! You can view your upcoming sessions in your dashboard.");
      setIsBookingModalOpen(false);
      
      // Refresh availability data
      setTimeout(() => {
        // Reload the page or refetch the availability data
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book session. Please try again.");
    } finally {
      setIsBookingProcessing(false);
    }
  };
  
  // Categorize sessions by day
  const availabilityByDay = availabilitySlots?.reduce((acc: any, slot) => {
    const date = format(parseISO(slot.start_time), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});
  
  // Filter out past days
  const filteredAvailabilityByDay = availabilityByDay ? 
    Object.entries(availabilityByDay).filter(([date]) => 
      isAfter(parseISO(date), new Date())
    ) : [];

  if (isLoading) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <div className="space-y-4 flex-1">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-full" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
                
                <Skeleton className="h-12 w-full" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <Skeleton className="h-64 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-64 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }
  
  if (!mentor) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">Mentor Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The mentor you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/mentor-space")}>
                Browse Mentors
              </Button>
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }
  
  // Get session types from mentor profile
  const sessionTypes = mentorProfile?.mentor_session_types || [
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
      price: mentorProfile?.mentor_hourly_rate || 25
    }
  ];

  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-24 w-24 border-2 border-primary/10">
                  <AvatarImage src={mentor.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {mentor.full_name?.charAt(0) || mentor.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <h1 className="text-3xl font-bold">{mentor.full_name || mentor.username}</h1>
                    <p className="text-lg text-muted-foreground">
                      {mentor.position} {mentor.company && `at ${mentor.company}`}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{mentor.stats?.mentorRating || 5.0} Rating</span>
                    <span className="text-muted-foreground">
                      ({reviews?.length || 0} reviews)
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise?.slice(0, 5).map((skill, i) => (
                      <Badge key={i} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {mentor.expertise && mentor.expertise.length > 5 && (
                      <Badge variant="secondary">+{mentor.expertise.length - 5} more</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {mentor.linkedin_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    
                    {mentor.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={mentor.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Website
                        </a>
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="reviews">
                      Reviews ({reviews?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>About {mentor.full_name?.split(' ')[0] || mentor.username}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-line">
                          {mentorProfile?.mentor_bio || mentor.bio || 
                           "This mentor hasn't added a bio yet."}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Expertise</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {mentor.expertise?.map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                              {skill}
                            </Badge>
                          ))}
                          {(!mentor.expertise || mentor.expertise.length === 0) && (
                            <p className="text-muted-foreground">
                              No expertise listed.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Location & Contact</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mentor.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{mentor.location}</span>
                          </div>
                        )}
                        
                        {mentor.website && (
                          <div className="flex items-center">
                            <Link2 className="h-4 w-4 mr-2 text-muted-foreground" />
                            <a 
                              href={mentor.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {mentor.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="experience" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Briefcase className="h-5 w-5 mr-2 text-primary" />
                          Work Experience
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {mentor.work_experience && mentor.work_experience.length > 0 ? (
                          <div className="space-y-6">
                            {mentor.work_experience.map((job: any, i: number) => (
                              <div key={i} className="border-l-2 border-primary/20 pl-4 relative">
                                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1" />
                                <h3 className="text-base font-medium">{job.position}</h3>
                                <p className="text-muted-foreground">
                                  {job.company}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {job.start_date} - {job.is_current ? 'Present' : job.end_date}
                                </p>
                                {job.description && (
                                  <p className="mt-2 text-sm">{job.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No work experience listed.</p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                          Education
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {mentor.education && mentor.education.length > 0 ? (
                          <div className="space-y-6">
                            {mentor.education.map((edu: any, i: number) => (
                              <div key={i} className="border-l-2 border-primary/20 pl-4 relative">
                                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1" />
                                <h3 className="text-base font-medium">{edu.degree}</h3>
                                <p className="text-muted-foreground">
                                  {edu.institution}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {edu.start_date} - {edu.is_current ? 'Present' : edu.end_date}
                                </p>
                                {edu.description && (
                                  <p className="mt-2 text-sm">{edu.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No education listed.</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="reviews">
                    <MentorReviews 
                      reviews={reviews || []} 
                      isLoading={isLoadingReviews} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="availability">
                    <Card>
                      <CardHeader>
                        <CardTitle>Available Time Slots</CardTitle>
                        <CardDescription>
                          Book a session with {mentor.full_name?.split(' ')[0] || mentor.username}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingSlots ? (
                          <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <Skeleton key={i} className="h-24 w-full" />
                            ))}
                          </div>
                        ) : filteredAvailabilityByDay.length > 0 ? (
                          <div className="space-y-6">
                            {filteredAvailabilityByDay.map(([date, slots]: [string, any[]]) => (
                              <div key={date} className="space-y-3">
                                <h3 className="text-sm font-medium flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                                  {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {slots.map(slot => (
                                    <Button
                                      key={slot.id}
                                      variant="outline"
                                      size="sm"
                                      className="flex justify-start items-center"
                                      onClick={() => handleSelectSlot(slot)}
                                    >
                                      <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                      {format(parseISO(slot.start_time), 'h:mm a')}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                            <h3 className="text-lg font-medium mb-1">No available slots</h3>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                              This mentor hasn't added any available time slots yet. Check back later or message them directly.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div>
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Session Types</CardTitle>
                    <CardDescription>
                      Choose a session type that fits your needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sessionTypes.map((type: any) => (
                      <motion.div
                        key={type.id}
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                        className="cursor-pointer"
                        onClick={() => setSelectedTab("availability")}
                      >
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{type.name}</h4>
                              <Badge 
                                variant={type.is_free ? "outline" : "default"}
                                className={type.is_free ? "bg-green-50 text-green-700 hover:bg-green-50" : ""}
                              >
                                {type.is_free ? "Free" : `$${type.price}`}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {type.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {type.duration} mins
                              </div>
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Why book with {mentor.full_name?.split(' ')[0] || mentor.username}?</h4>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <div className="p-1">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-sm ml-2">Verified professional background</p>
                        </div>
                        <div className="flex items-start">
                          <div className="p-1">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-sm ml-2">Personalized 1:1 guidance</p>
                        </div>
                        <div className="flex items-start">
                          <div className="p-1">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-sm ml-2">Secure and easy booking process</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedTab("availability")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      View Availability
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        
        {mentor && selectedSlot && (
          <MentorBookingModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            mentor={mentor}
            selectedSlot={selectedSlot}
            onConfirmBooking={handleConfirmBooking}
            isProcessing={isBookingProcessing}
          />
        )}
      </PageTransition>
    </AppLayout>
  );
}
