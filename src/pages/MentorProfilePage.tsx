
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  Share,
  Linkedin,
  Globe,
  Twitter,
  CheckCircle,
  BookOpen,
  Verified
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import MentorSessionCard from "@/components/mentor/MentorSessionCard";
import MentorAvailabilityCalendar from "@/components/mentor/MentorAvailabilityCalendar";
import MentorBookingModal from "@/components/mentor/MentorBookingModal";
import { PageTransition } from "@/components/ui/page-transition";
import { formatDate, formatRelativeTime } from "@/lib/date-utils";

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
      toast.success("Session booked successfully! Check your upcoming sessions.");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book session. Please try again.");
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
  
  // Share profile
  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${mentor?.full_name || mentor?.username} - Mentor Profile`,
        url: window.location.href
      }).catch(err => console.error('Could not share:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied to clipboard!");
    }
  };
  
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
  
  // format the reviews
  const sortedReviews = reviews ? [...reviews].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }) : [];

  // Get average rating
  const averageRating = mentor.stats?.mentorRating || sortedReviews.reduce((sum, review) => sum + review.rating, 0) / (sortedReviews.length || 1);
  const reviewCount = mentor.stats?.mentorReviews || sortedReviews.length;
  
  // Get formatted experience and education
  const workExperience = mentor.work_experience || [];
  const education = mentor.education || [];
  
  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="relative rounded-xl overflow-hidden h-40 md:h-64 bg-gradient-to-r from-primary/20 to-primary/5">
              {mentor.profile_header_url && (
                <img 
                  src={mentor.profile_header_url} 
                  alt="Profile Header" 
                  className="w-full h-full object-cover"
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
              
              <div className="absolute bottom-4 left-4 md:left-8 flex items-end gap-4">
                <Avatar className="h-16 w-16 md:h-24 md:w-24 border-4 border-background rounded-xl">
                  <AvatarImage src={mentor.avatar_url || undefined} alt={mentor.full_name || mentor.username} />
                  <AvatarFallback className="text-2xl">
                    {mentor.full_name?.charAt(0) || mentor.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {mentor.full_name || mentor.username}
                    </h1>
                    {mentor.is_verified && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Verified className="h-5 w-5 text-blue-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Verified Mentor</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground">{mentor.position}{mentor.company ? ` at ${mentor.company}` : ''}</p>
                </div>
              </div>
              
              <div className="absolute top-4 right-4 flex gap-2">
                <Button size="sm" variant="ghost" className="bg-background/50 hover:bg-background/90" onClick={handleShareProfile}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                {!isOwnProfile && (
                  <Button size="sm" variant="ghost" className="bg-background/50 hover:bg-background/90" asChild>
                    <Link to={`/messages?user=${mentor.id}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Basic Info Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {mentor.mentor_bio || mentor.bio || "No bio provided."}
                  </p>
                  
                  <div className="space-y-2">
                    {mentor.location && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{mentor.location}</span>
                      </div>
                    )}
                    
                    {mentor.position && mentor.company && (
                      <div className="flex items-center text-sm">
                        <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{mentor.position} at {mentor.company}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Mentor since {formatDate(mentor.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{mentor.stats?.mentorSessions || 0} sessions completed</span>
                    </div>
                  </div>
                  
                  {(mentor.linkedin_url || mentor.twitter_url || mentor.website) && (
                    <div className="pt-2">
                      <div className="flex gap-2">
                        {mentor.linkedin_url && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                  <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="h-4 w-4" />
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>LinkedIn Profile</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        
                        {mentor.twitter_url && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                  <a href={mentor.twitter_url} target="_blank" rel="noopener noreferrer">
                                    <Twitter className="h-4 w-4" />
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Twitter Profile</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        
                        {mentor.website && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                  <a href={mentor.website} target="_blank" rel="noopener noreferrer">
                                    <Globe className="h-4 w-4" />
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Personal Website</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Expertise Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Areas of Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise && mentor.expertise.length > 0 ? (
                      mentor.expertise.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No expertise listed</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Ratings & Reviews Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Star className="mr-2 h-4 w-4 text-yellow-500" />
                    Ratings & Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviewCount > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-3xl font-bold mr-2">{averageRating.toFixed(1)}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < Math.round(averageRating)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = sortedReviews.filter(r => r.rating === rating).length;
                          const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                          
                          return (
                            <div key={rating} className="flex items-center text-sm">
                              <span className="w-12">{rating} stars</span>
                              <div className="flex-1 mx-2 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-yellow-500 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="w-8 text-right text-muted-foreground">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No reviews yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Session Types and Booking */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Session Types</CardTitle>
                  <CardDescription>
                    Choose the type of mentoring session that best fits your needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {typesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="h-24 rounded-lg bg-muted animate-pulse" />
                      ))}
                    </div>
                  ) : sessionTypes && sessionTypes.length > 0 ? (
                    <div className="space-y-4">
                      {sessionTypes.map((type) => (
                        <div
                          key={type.id}
                          className={`p-4 border rounded-lg hover:border-primary/50 transition-colors ${
                            type.is_featured ? "bg-primary/5 border-primary/20" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h3 className="font-medium">{type.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {type.description}
                              </p>
                            </div>
                            <div className="flex flex-col items-end">
                              {type.is_free ? (
                                <Badge variant="outline">Free</Badge>
                              ) : (
                                <span className="font-medium">
                                  ${type.price.toFixed(2)} {type.currency}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground mt-1">
                                {type.duration} minutes
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        This mentor has not set up any session types yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Available Time Slots */}
              {!isOwnProfile && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Book a Session</CardTitle>
                    <CardDescription>
                      Select an available time slot to schedule a session with {mentor.full_name || mentor.username}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MentorAvailabilityCalendar
                      availabilitySlots={availabilitySlots || []}
                      onSelectSlot={handleSelectSlot}
                      isLoading={slotsLoading}
                    />
                  </CardContent>
                </Card>
              )}
              
              {/* Mentor Experience */}
              <Card>
                <CardHeader>
                  <Tabs defaultValue="reviews">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="reviews" className="text-sm">
                        Reviews
                      </TabsTrigger>
                      <TabsTrigger value="experience" className="text-sm">
                        Experience
                      </TabsTrigger>
                      <TabsTrigger value="education" className="text-sm">
                        Education
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="reviews" className="mt-0">
                      {reviewsLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((n) => (
                            <div key={n} className="h-32 rounded-lg bg-muted animate-pulse" />
                          ))}
                        </div>
                      ) : sortedReviews.length > 0 ? (
                        <div className="space-y-6">
                          {sortedReviews.map((review) => (
                            <div key={review.id} className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage src={review.reviewer?.avatar_url || undefined} />
                                    <AvatarFallback>
                                      {review.reviewer?.full_name?.charAt(0) || 
                                       review.reviewer?.username?.charAt(0) || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {review.reviewer?.full_name || review.reviewer?.username || "Anonymous"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatRelativeTime(review.created_at)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "text-yellow-500 fill-yellow-500"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm pl-10">{review.content}</p>
                              <Separator className="my-4" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Star className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                          <h3 className="text-lg font-medium mb-1">No reviews yet</h3>
                          <p className="text-sm text-muted-foreground">
                            This mentor has not received any reviews yet.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="experience" className="mt-0">
                      {workExperience && workExperience.length > 0 ? (
                        <div className="space-y-6">
                          {workExperience.map((job: any, index: number) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-start">
                                <Briefcase className="h-5 w-5 mr-3 mt-1 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{job.position}</div>
                                  <div className="text-sm">{job.company}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {job.start_date} - {job.is_current ? "Present" : job.end_date}
                                  </div>
                                  {job.description && (
                                    <p className="text-sm text-muted-foreground mt-2">{job.description}</p>
                                  )}
                                </div>
                              </div>
                              {index < workExperience.length - 1 && <Separator className="my-4" />}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                          <h3 className="text-lg font-medium mb-1">No experience listed</h3>
                          <p className="text-sm text-muted-foreground">
                            This mentor has not added their work experience yet.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="education" className="mt-0">
                      {education && education.length > 0 ? (
                        <div className="space-y-6">
                          {education.map((edu: any, index: number) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-start">
                                <BookOpen className="h-5 w-5 mr-3 mt-1 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{edu.degree}</div>
                                  <div className="text-sm">{edu.institution}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {edu.start_date} - {edu.is_current ? "Present" : edu.end_date}
                                  </div>
                                  {edu.field && (
                                    <div className="text-sm">{edu.field}</div>
                                  )}
                                  {edu.description && (
                                    <p className="text-sm text-muted-foreground mt-2">{edu.description}</p>
                                  )}
                                </div>
                              </div>
                              {index < education.length - 1 && <Separator className="my-4" />}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                          <h3 className="text-lg font-medium mb-1">No education listed</h3>
                          <p className="text-sm text-muted-foreground">
                            This mentor has not added their education history yet.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
          
          {/* Booking Modal */}
          <MentorBookingModal
            isOpen={bookingModalOpen}
            onClose={() => setBookingModalOpen(false)}
            slot={selectedSlot}
            mentor={mentor}
            sessionTypes={sessionTypes}
            onConfirmBooking={handleConfirmBooking}
            isProcessing={bookSession.isPending}
          />
        </div>
      </PageTransition>
    </AppLayout>
  );
}
