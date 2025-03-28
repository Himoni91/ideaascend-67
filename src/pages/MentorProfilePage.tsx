
import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useMentor } from "@/hooks/use-mentor";
import { MentorAvailabilitySlot } from "@/types/mentor";
import { 
  Calendar, 
  Mail, 
  Clock, 
  Star, 
  Award, 
  Users, 
  Briefcase, 
  MapPin,
  ExternalLink,
  MessageSquare,
  Share
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import MentorSessionCard from "@/components/mentor/MentorSessionCard";
import MentorAvailabilityCalendar from "@/components/mentor/MentorAvailabilityCalendar";
import MentorBookingModal from "@/components/mentor/MentorBookingModal";
import { PageTransition } from "@/components/ui/page-transition";

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<MentorAvailabilitySlot | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  
  // Custom hooks for mentor-related data
  const { useMentorProfile, useMentorAvailability, useMentorSessionTypes, useMentorReviews, useBookSession, useUpdateSessionStatus } = useMentor();
  
  // Fetch mentor data
  const { data: mentor, isLoading: mentorLoading, error: mentorError } = useMentorProfile(id || "");
  const { data: availabilitySlots, isLoading: slotsLoading } = useMentorAvailability(id || "");
  const { data: sessionTypes, isLoading: typesLoading } = useMentorSessionTypes(id || "");
  const { data: reviews, isLoading: reviewsLoading } = useMentorReviews(id || "");
  
  // Book session mutation
  const bookSession = useBookSession();
  const updateSessionStatus = useUpdateSessionStatus();
  
  // Handle session booking
  const handleConfirmBooking = async (bookingData: any) => {
    try {
      await bookSession.mutateAsync(bookingData);
      setBookingModalOpen(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book session");
    }
  };
  
  // Handle slot selection
  const handleSelectSlot = (slot: MentorAvailabilitySlot) => {
    setSelectedSlot(slot);
    setBookingModalOpen(true);
  };
  
  const handleSessionStatusUpdate = async (sessionId: string, status: string) => {
    try {
      await updateSessionStatus.mutateAsync({ sessionId, status });
      toast.success(`Session ${status} successfully`);
    } catch (error) {
      console.error("Failed to update session:", error);
      toast.error("Failed to update session status");
    }
  };
  
  // Check if current user is the mentor
  const isOwnProfile = user?.id === id;
  
  // Handle errors
  if (mentorError) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading mentor profile</h1>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </AppLayout>
    );
  }
  
  // Loading state
  if (mentorLoading || !mentor) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-8 w-1/3 bg-muted rounded"></div>
            <div className="h-4 w-1/2 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded-lg"></div>
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
          <div className="rounded-lg overflow-hidden mb-8">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/5 relative">
              {mentor.profile_header_url && (
                <img
                  src={mentor.profile_header_url}
                  alt="Profile header"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Profile Info */}
            <div className="bg-card border rounded-b-lg p-6 pt-0 relative">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="-mt-12">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage src={mentor.avatar_url || undefined} />
                    <AvatarFallback className="text-xl">
                      {mentor.full_name?.charAt(0) || mentor.username?.charAt(0) || "M"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 mt-4 md:mt-0">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-3xl font-bold">
                          {mentor.full_name || mentor.username}
                        </h1>
                        {mentor.is_verified && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            <Award className="h-3.5 w-3.5 mr-1" />
                            Verified Mentor
                          </Badge>
                        )}
                      </div>
                      <p className="text-lg text-muted-foreground">
                        {mentor.position} {mentor.company && `at ${mentor.company}`}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {mentor.location && (
                          <span className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {mentor.location}
                          </span>
                        )}
                        
                        <span className="flex items-center text-sm">
                          <Star className="h-3.5 w-3.5 mr-1 text-yellow-500 fill-yellow-500" />
                          {mentor.stats?.mentorRating?.toFixed(1) || "New"} 
                          {mentor.stats?.mentorReviews ? ` (${mentor.stats.mentorReviews} reviews)` : ""}
                        </span>
                        
                        <span className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          {mentor.stats?.mentorSessions || 0} sessions completed
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {!isOwnProfile && (
                        <>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                          <Button size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Session
                          </Button>
                        </>
                      )}
                      {isOwnProfile && (
                        <Button variant="outline" size="sm" asChild>
                          <a href="/mentor-space/analytics">
                            <Award className="h-4 w-4 mr-2" />
                            Mentor Dashboard
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expertise Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {mentor.expertise && mentor.expertise.map((exp) => (
                  <Badge key={exp} variant="outline" className="bg-primary/5">
                    {exp}
                  </Badge>
                ))}
              </div>
              
              {/* Bio */}
              <div className="mt-4">
                <p className="text-muted-foreground">
                  {mentor.mentor_bio || mentor.bio || "No bio provided."}
                </p>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar */}
            <div className="order-2 lg:order-1 lg:col-span-1">
              <div className="space-y-6 sticky top-24">
                {/* Session Types */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mentorship Options</CardTitle>
                    <CardDescription>
                      Session types offered by this mentor
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {typesLoading ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-16 bg-muted rounded"></div>
                        <div className="h-16 bg-muted rounded"></div>
                      </div>
                    ) : sessionTypes && sessionTypes.length > 0 ? (
                      sessionTypes.map((type) => (
                        <div
                          key={type.id}
                          className="border rounded-lg p-3 hover:border-primary/20 transition-colors"
                        >
                          <div className="flex justify-between">
                            <h3 className="font-medium">{type.name}</h3>
                            <span className="text-sm font-medium">
                              {type.is_free ? "Free" : `$${type.price}`}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {type.description}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {type.duration} minutes
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No session types defined yet
                      </div>
                    )}
                    
                    {!isOwnProfile && sessionTypes && sessionTypes.length > 0 && (
                      <Button className="w-full mt-2" onClick={() => setBookingModalOpen(true)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Book a Session
                      </Button>
                    )}
                  </CardContent>
                </Card>
                
                {/* Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                    
                    {mentor.linkedin_url && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-4 w-4 mr-2 fill-current"
                          >
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                          LinkedIn Profile
                        </a>
                      </Button>
                    )}
                    
                    {mentor.website && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <a href={mentor.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Website
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="order-1 lg:order-2 lg:col-span-2">
              <Tabs defaultValue="availability">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="availability">Availability</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                </TabsList>
                
                {/* Availability Tab */}
                <TabsContent value="availability" className="mt-6">
                  <MentorAvailabilityCalendar 
                    slots={availabilitySlots || []}
                    isOwnProfile={isOwnProfile}
                    onSelectSlot={handleSelectSlot}
                  />
                </TabsContent>
                
                {/* Reviews Tab */}
                <TabsContent value="reviews" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Star className="h-5 w-5 mr-2 text-yellow-500 fill-yellow-500" />
                        Reviews
                        {mentor.stats?.mentorReviews && mentor.stats.mentorReviews > 0 && (
                          <Badge variant="outline" className="ml-2">
                            {mentor.stats.mentorReviews}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        What mentees are saying about {mentor.full_name || mentor.username}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reviewsLoading ? (
                        <div className="animate-pulse space-y-4">
                          <div className="h-24 bg-muted rounded"></div>
                          <div className="h-24 bg-muted rounded"></div>
                        </div>
                      ) : reviews && reviews.length > 0 ? (
                        <div className="space-y-6">
                          {reviews.map((review) => (
                            <motion.div
                              key={review.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex items-start gap-4">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                                  <AvatarFallback>
                                    {review.reviewer?.full_name?.charAt(0) || 
                                     review.reviewer?.username?.charAt(0) || 
                                     "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">
                                      {review.reviewer?.full_name || review.reviewer?.username || "Anonymous"}
                                    </h4>
                                    <div className="flex items-center">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${
                                            i < review.rating
                                              ? "text-yellow-500 fill-yellow-500"
                                              : "text-muted-foreground"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </p>
                                  <p className="mt-2">{review.content}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Star className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                          <h3 className="text-lg font-medium mb-1">No reviews yet</h3>
                          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            This mentor hasn't received any reviews yet.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* About Tab */}
                <TabsContent value="about" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About {mentor.full_name || mentor.username}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Bio Section */}
                      <div>
                        <h3 className="text-lg font-medium mb-2">Bio</h3>
                        <p className="text-muted-foreground">
                          {mentor.mentor_bio || mentor.bio || "No detailed bio provided."}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      {/* Work Experience */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Work Experience</h3>
                        {mentor.work_experience && mentor.work_experience.length > 0 ? (
                          <div className="space-y-4">
                            {mentor.work_experience.map((exp: any, index: number) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-md bg-primary/10">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{exp.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {exp.company} • {exp.startDate}
                                      {exp.endDate ? ` - ${exp.endDate}` : " - Present"}
                                    </p>
                                  </div>
                                </div>
                                {exp.description && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    {exp.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No work experience listed.</p>
                        )}
                      </div>
                      
                      <Separator />
                      
                      {/* Education */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Education</h3>
                        {mentor.education && mentor.education.length > 0 ? (
                          <div className="space-y-4">
                            {mentor.education.map((edu: any, index: number) => (
                              <div key={index} className="border rounded-lg p-4">
                                <h4 className="font-medium">{edu.degree}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {edu.institution} • {edu.startYear}
                                  {edu.endYear ? ` - ${edu.endYear}` : " - Present"}
                                </p>
                                {edu.description && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    {edu.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No education listed.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Booking Modal */}
          <MentorBookingModal
            isOpen={bookingModalOpen}
            onClose={() => {
              setBookingModalOpen(false);
              setSelectedSlot(null);
            }}
            mentor={mentor}
            selectedSlot={selectedSlot}
            onConfirmBooking={handleConfirmBooking}
            isProcessing={bookSession.isPending}
          />
        </div>
      </PageTransition>
    </AppLayout>
  );
}
