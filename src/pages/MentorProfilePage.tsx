
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CalendarDays, 
  Star, 
  MapPin, 
  Calendar,
  Briefcase,
  BadgeCheck,
  MessageSquare,
  ChevronRight,
  BarChart3,
  GraduationCap,
  Link as LinkIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { useMentor } from "@/hooks/use-mentor";
import { asMentorProfile, MentorAvailabilitySlot } from "@/types/mentor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";
import MentorAvailabilityCalendar from "@/components/mentor/MentorAvailabilityCalendar";
import MentorReviews from "@/components/mentor/MentorReviews";
import MentorBookingModal from "@/components/mentor/MentorBookingModal";
import { toast } from "sonner";

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("about");
  const [selectedSlot, setSelectedSlot] = useState<MentorAvailabilitySlot | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  
  const { profile: currentUser } = useProfile(user?.id);
  const { data: mentor, isLoading: isLoadingMentor } = useMentor().useMentorProfile(id);
  const { data: availability, isLoading: isLoadingSlots } = useMentor().useMentorAvailability(id);
  const { data: reviews, isLoading: isLoadingReviews } = useMentor().useMentorReviews(id);
  
  // Check if current user is the mentor
  const isOwnProfile = user?.id === id;
  
  // Handle selecting a time slot
  const handleSelectSlot = (slot: MentorAvailabilitySlot) => {
    setSelectedSlot(slot);
    setIsBookingModalOpen(true);
  };
  
  // Handle adding a new availability slot
  const handleAddSlot = async (slot: { start_time: string; end_time: string }) => {
    try {
      await useMentor().addAvailabilitySlot(slot);
      toast.success("Availability slot added successfully");
    } catch (error) {
      console.error("Failed to add slot:", error);
      toast.error("Failed to add availability slot");
    }
  };
  
  // Handle booking confirmation
  const handleConfirmBooking = async (bookingData: any) => {
    setIsBooking(true);
    try {
      await useMentor().bookMentorSession(bookingData);
      setIsBookingModalOpen(false);
      setSelectedSlot(null);
      toast.success("Session booked successfully!");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book session. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };
  
  if (isLoadingMentor) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="h-40 bg-muted animate-pulse rounded-xl mb-6"></div>
              <div className="space-y-4">
                <div className="h-10 bg-muted animate-pulse rounded-lg w-1/3"></div>
                <div className="h-20 bg-muted animate-pulse rounded-lg"></div>
                <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
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
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">Mentor Not Found</h1>
              <p className="text-muted-foreground mb-6">The mentor you're looking for doesn't exist or may have been removed.</p>
              <Button onClick={() => navigate('/mentor-space')}>
                Browse Other Mentors
              </Button>
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }
  
  const mentorProfile = asMentorProfile(mentor);

  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mentors
            </Button>
            
            {/* Mentor Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="flex flex-col md:flex-row items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage src={mentor.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {mentor.full_name?.charAt(0) || mentor.username?.charAt(0) || "M"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h1 className="text-3xl font-bold flex items-center">
                        {mentor.full_name || mentor.username}
                        {mentor.is_verified && (
                          <BadgeCheck className="ml-2 h-5 w-5 text-blue-500" />
                        )}
                      </h1>
                      <p className="text-xl text-muted-foreground">
                        {mentor.professional_headline || mentor.position}
                        {mentor.company && ` at ${mentor.company}`}
                      </p>
                    </div>
                    
                    {!isOwnProfile ? (
                      <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                        <Button onClick={() => navigate('/mentor-space/sessions')}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Book Session
                        </Button>
                        <Button variant="outline">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                        <Button variant="outline" onClick={() => navigate('/mentor-space/analytics')}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Analytics
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/mentor-space/sessions')}>
                          <CalendarDays className="mr-2 h-4 w-4" />
                          My Sessions
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    {mentor.location && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{mentor.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                      <span>{mentor.stats?.mentorRating || 5.0} ({mentor.stats?.mentorReviews || 0} reviews)</span>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground">
                      <CalendarDays className="h-4 w-4 mr-1" />
                      <span>{mentor.stats?.mentorSessions || 0} sessions completed</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {mentor.expertise?.slice(0, 5).map((expertise, i) => (
                      <Badge key={i} variant="outline">{expertise}</Badge>
                    ))}
                    {mentor.expertise && mentor.expertise.length > 5 && (
                      <Badge variant="outline">+{mentor.expertise.length - 5} more</Badge>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Tabs Navigation */}
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
                <div className="flex overflow-x-auto pb-px">
                  <TabsTrigger 
                    value="about" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-2.5 px-4"
                  >
                    About
                  </TabsTrigger>
                  <TabsTrigger 
                    value="availability" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-2.5 px-4"
                  >
                    Availability
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reviews" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-2.5 px-4"
                  >
                    Reviews ({reviews?.length || 0})
                  </TabsTrigger>
                </div>
              </TabsList>
              
              {/* About Tab */}
              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">
                      {mentorProfile.mentor_bio || mentor.bio || "No bio available yet."}
                    </p>
                    
                    {mentor.website && (
                      <div className="mt-4 flex items-center">
                        <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a href={mentor.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {mentor.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Experience */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center">
                        <Briefcase className="mr-2 h-5 w-5 text-primary" />
                        Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {mentor.work_experience && mentor.work_experience.length > 0 ? (
                        <div className="space-y-4">
                          {mentor.work_experience.map((work: any, index: number) => (
                            <div key={index} className="flex gap-3">
                              <div className="flex-shrink-0 mt-1">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              </div>
                              <div>
                                <h3 className="font-medium">{work.position}</h3>
                                <p className="text-sm">{work.company}</p>
                                <p className="text-xs text-muted-foreground">
                                  {work.start_date} - {work.is_current ? 'Present' : work.end_date}
                                </p>
                                {work.description && (
                                  <p className="text-sm mt-1">{work.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No experience information available.</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Education */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center">
                        <GraduationCap className="mr-2 h-5 w-5 text-primary" />
                        Education & Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {mentor.education && mentor.education.length > 0 ? (
                        <div className="space-y-4">
                          {mentor.education.map((edu: any, index: number) => (
                            <div key={index} className="flex gap-3">
                              <div className="flex-shrink-0 mt-1">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              </div>
                              <div>
                                <h3 className="font-medium">{edu.degree}{edu.field && `, ${edu.field}`}</h3>
                                <p className="text-sm">{edu.institution}</p>
                                <p className="text-xs text-muted-foreground">
                                  {edu.start_date} - {edu.is_current ? 'Present' : edu.end_date}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No education information available.</p>
                      )}
                      
                      {mentor.certifications && mentor.certifications.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <h3 className="text-sm font-medium mb-3">Certifications</h3>
                          <div className="space-y-3">
                            {mentor.certifications.map((cert: any, index: number) => (
                              <div key={index} className="flex gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">{cert.name}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {cert.issuer}, {cert.date}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Availability Tab */}
              <TabsContent value="availability" className="space-y-6">
                <MentorAvailabilityCalendar 
                  slots={availability || []}
                  isOwnProfile={isOwnProfile}
                  onAddSlot={isOwnProfile ? handleAddSlot : undefined}
                  onSelectSlot={!isOwnProfile ? handleSelectSlot : undefined}
                />
                
                {!isOwnProfile && (
                  <div className="flex justify-end">
                    <Button onClick={() => setIsBookingModalOpen(true)} disabled={!selectedSlot}>
                      {selectedSlot ? 'Book Selected Slot' : 'Select a Time Slot'}
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <MentorReviews reviews={reviews || []} isLoading={isLoadingReviews} />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Booking Modal */}
          <MentorBookingModal 
            isOpen={isBookingModalOpen} 
            onClose={() => setIsBookingModalOpen(false)}
            mentor={mentor}
            selectedSlot={selectedSlot}
            onConfirmBooking={handleConfirmBooking}
            isProcessing={isBooking}
          />
        </div>
      </PageTransition>
    </AppLayout>
  );
}
