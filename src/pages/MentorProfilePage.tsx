
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Award, 
  Star, 
  Users, 
  CheckCircle2, 
  Shield, 
  Briefcase, 
  BookOpen,
  Globe,
  MessageSquare,
  ChevronRight,
  Check,
  DollarSign,
  Loader2
} from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { useMentorSpace } from "@/hooks/use-mentor-space";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageTransition } from "@/components/ui/page-transition";
import AppLayout from "@/components/layout/AppLayout";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { MentorSessionStatus, MentorSessionTypeInfo } from "@/types/mentor";

const MentorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getMentorProfile, 
    getMentorSessionTypes, 
    getMentorAvailability, 
    bookSession 
  } = useMentorSpace();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSessionType, setSelectedSessionType] = useState<MentorSessionTypeInfo | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Query mentor's profile
  const { 
    data: mentor, 
    isLoading: isLoadingMentor, 
    error: mentorError 
  } = getMentorProfile(id);

  // Query mentor's session types
  const { 
    data: sessionTypes, 
    isLoading: isLoadingSessionTypes 
  } = getMentorSessionTypes(id);

  // Query mentor's availability
  const startOfWeek = new Date();
  const endOfWeek = addDays(startOfWeek, 14); // Get 2 weeks of availability
  
  const { 
    data: availabilitySlots, 
    isLoading: isLoadingAvailability 
  } = getMentorAvailability(id, startOfWeek, endOfWeek);
  
  // Filter slots for the selected date
  const slotsForSelectedDate = availabilitySlots?.filter(slot => 
    isSameDay(new Date(slot.start_time), selectedDate)
  );
  
  // Group availability by date for the date picker
  const availabilityByDate = React.useMemo(() => {
    if (!availabilitySlots) return new Map();
    
    const dateMap = new Map();
    
    availabilitySlots.forEach(slot => {
      const date = new Date(slot.start_time).toDateString();
      if (!dateMap.has(date)) {
        dateMap.set(date, []);
      }
      dateMap.get(date).push(slot);
    });
    
    return dateMap;
  }, [availabilitySlots]);
  
  const isOwnProfile = user?.id === id;
  
  // Calculate dates for the date selector
  const dateOptions = React.useMemo(() => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const date = addDays(new Date(), i);
      // Only add dates that have availability
      if (availabilityByDate.has(date.toDateString()) || i === 0) {
        dates.push(date);
      }
    }
    return dates;
  }, [availabilityByDate]);
  
  // Handle booking a session
  const handleBookSession = async () => {
    if (!selectedSlotId || !selectedSessionType) {
      toast.error("Please select a session type and time slot");
      return;
    }
    
    if (!sessionTitle.trim()) {
      toast.error("Please enter a session title");
      return;
    }
    
    if (!id) {
      toast.error("Mentor ID is missing");
      return;
    }
    
    try {
      setIsBooking(true);
      
      await bookSession.mutateAsync({
        mentorId: id,
        slotId: selectedSlotId,
        sessionData: {
          title: sessionTitle,
          description: sessionDescription,
          sessionType: selectedSessionType.id,
          amount: selectedSessionType.price
        }
      });
      
      setBookingDialogOpen(false);
      navigate("/mentor-space/sessions");
    } catch (error) {
      console.error("Error booking session:", error);
    } finally {
      setIsBooking(false);
    }
  };
  
  if (mentorError) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">Error Loading Mentor Profile</h1>
          <p className="text-muted-foreground mb-4">
            Sorry, we couldn't load this mentor's profile. They may not be a mentor or the profile doesn't exist.
          </p>
          <Button onClick={() => navigate("/mentor-space")}>
            Back to Mentor Space
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  if (isLoadingMentor) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[70vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>{mentor?.full_name || 'Mentor'} | Mentor Profile | Idolyst</title>
      </Helmet>
      
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="relative">
              {/* Profile Header Background */}
              <div 
                className="h-48 sm:h-64 w-full rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 overflow-hidden"
              >
                {mentor?.profile_header_url && (
                  <img 
                    src={mentor.profile_header_url} 
                    alt="Profile header" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Profile Info */}
              <div className="sm:absolute bottom-0 left-0 transform sm:translate-y-1/2 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-background rounded-full">
                  <AvatarImage src={mentor?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {mentor?.full_name?.charAt(0) || mentor?.username?.charAt(0) || 'M'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="sm:mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold">{mentor?.full_name || mentor?.username}</h1>
                    {mentor?.is_verified && (
                      <Badge className="bg-blue-500 hover:bg-blue-600">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {mentor?.position && mentor?.company 
                      ? `${mentor.position} at ${mentor.company}`
                      : mentor?.byline || "Mentor"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats & Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-20 sm:mt-16 gap-4">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{mentor?.stats?.mentorRating || "New"}</span>
                  <span className="text-muted-foreground">
                    ({mentor?.stats?.mentorReviews || 0} reviews)
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{mentor?.stats?.mentorSessions || 0}</span>
                  <span className="text-muted-foreground">sessions</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    Typically responds in <span className="text-green-600">1 day</span>
                  </span>
                </div>
              </div>
              
              {!isOwnProfile && (
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${mentor?.username}@example.com`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </a>
                  </Button>
                  
                  <Button onClick={() => setBookingDialogOpen(true)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                </div>
              )}
              
              {isOwnProfile && (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate("/mentor-space/sessions")}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Sessions
                  </Button>
                  
                  <Button onClick={() => navigate("/mentor-space/settings")}>
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Tabs defaultValue="about">
                <TabsList className="mb-4">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="expertise">Expertise</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About Me</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <p>{mentor?.mentor_bio || mentor?.bio || "No bio available."}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {mentor?.work_experience && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Briefcase className="h-5 w-5 mr-2 text-primary" />
                          Work Experience
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {Array.isArray(mentor.work_experience) ? mentor.work_experience.map((work: any, index: number) => (
                          <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                            <h3 className="font-medium">{work.position} at {work.company}</h3>
                            <p className="text-sm text-muted-foreground">
                              {work.start_date} – {work.is_current ? 'Present' : work.end_date}
                            </p>
                            {work.description && (
                              <p className="mt-2 text-sm">{work.description}</p>
                            )}
                          </div>
                        )) : (
                          <p className="text-muted-foreground">No work experience available.</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  
                  {mentor?.education && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BookOpen className="h-5 w-5 mr-2 text-primary" />
                          Education
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {Array.isArray(mentor.education) ? mentor.education.map((edu: any, index: number) => (
                          <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                            <h3 className="font-medium">{edu.degree} in {edu.field}</h3>
                            <p className="text-sm">{edu.institution}</p>
                            <p className="text-sm text-muted-foreground">
                              {edu.start_date} – {edu.is_current ? 'Present' : edu.end_date}
                            </p>
                          </div>
                        )) : (
                          <p className="text-muted-foreground">No education information available.</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="reviews">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Star className="h-5 w-5 mr-2 text-yellow-500 fill-yellow-500" />
                        Reviews
                      </CardTitle>
                      <CardDescription>
                        {mentor?.stats?.mentorReviews 
                          ? `${mentor.stats.mentorReviews} review${mentor.stats.mentorReviews !== 1 ? 's' : ''}`
                          : 'No reviews yet'
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {mentor?.reviews && mentor.reviews.length > 0 ? (
                        <div className="space-y-4">
                          {mentor.reviews.map((review) => (
                            <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage src={review.reviewer_avatar} />
                                    <AvatarFallback>{review.reviewer_name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-medium">{review.reviewer_name}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(review.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  {Array(5).fill(0).map((_, i) => (
                                    <Star 
                                      key={i}
                                      className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="mt-2 text-sm">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No reviews yet</p>
                          <p className="text-sm mt-1">
                            Be the first to leave a review after your session!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="expertise">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="h-5 w-5 mr-2 text-primary" />
                        Expertise
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {mentor?.expertise?.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                        
                        {(!mentor?.expertise || mentor.expertise.length === 0) && (
                          <p className="text-muted-foreground">No expertise listed.</p>
                        )}
                      </div>
                      
                      {mentor?.skills && mentor.skills.length > 0 && (
                        <>
                          <h3 className="font-medium mb-2">Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {mentor.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="bg-primary/5">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
            
            {/* Right Column: Booking & Session Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Session Types */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    Session Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingSessionTypes ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : sessionTypes && sessionTypes.length > 0 ? (
                    <div className="space-y-4">
                      {sessionTypes.map((type) => (
                        <div 
                          key={type.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedSessionType?.id === type.id 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedSessionType(type)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{type.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {type.duration} min
                              </p>
                            </div>
                            <div className="flex items-center">
                              {type.is_free ? (
                                <Badge variant="outline" className="text-green-600">Free</Badge>
                              ) : (
                                <span className="font-medium">
                                  ${type.price.toFixed(2)}
                                </span>
                              )}
                              {selectedSessionType?.id === type.id && (
                                <Check className="ml-2 h-4 w-4 text-primary" />
                              )}
                            </div>
                          </div>
                          <p className="text-sm mt-1">{type.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No session types available.</p>
                      {isOwnProfile && (
                        <p className="text-sm mt-1">
                          <Button 
                            variant="link" 
                            className="p-0 h-auto" 
                            onClick={() => navigate("/mentor-space/settings")}
                          >
                            Add session types in your settings
                          </Button>
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {!isOwnProfile && (
                    <Button 
                      className="w-full" 
                      disabled={!selectedSessionType}
                      onClick={() => setBookingDialogOpen(true)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Book a Session
                    </Button>
                  )}
                </CardFooter>
              </Card>
              
              {/* Online Presence / Links */}
              {(mentor?.website || mentor?.linkedin_url || mentor?.twitter_url) && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-primary" />
                      Online Presence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {mentor.website && (
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a 
                          href={mentor.website.startsWith('http') ? mentor.website : `https://${mentor.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {mentor.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    
                    {mentor.linkedin_url && (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        <a 
                          href={mentor.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                    
                    {mentor.twitter_url && (
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        <a 
                          href={mentor.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Twitter Profile
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Location & Availability */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Availability
                  </CardTitle>
                  <CardDescription>
                    Select a date to see available time slots
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAvailability ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {/* Date Selector */}
                      <div className="flex overflow-x-auto gap-2 pb-2 mb-4 -mx-1 px-1">
                        {dateOptions.map((date, index) => {
                          const hasSlots = availabilityByDate.has(date.toDateString());
                          const isSelected = isSameDay(date, selectedDate);
                          
                          return (
                            <div 
                              key={index}
                              className={`flex-shrink-0 cursor-pointer flex flex-col items-center p-2 rounded-md border ${
                                isSelected 
                                  ? 'border-primary bg-primary/5' 
                                  : hasSlots 
                                  ? 'border-gray-200 hover:border-primary/50' 
                                  : 'border-gray-200 opacity-50'
                              }`}
                              onClick={() => hasSlots && setSelectedDate(date)}
                            >
                              <span className="text-xs uppercase">
                                {format(date, 'EEE')}
                              </span>
                              <span className="text-lg font-bold">
                                {format(date, 'd')}
                              </span>
                              <span className="text-xs">
                                {format(date, 'MMM')}
                              </span>
                              {hasSlots && (
                                <Badge variant="secondary" className="mt-1 text-xs h-5">
                                  {availabilityByDate.get(date.toDateString()).length} slots
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Time Slots */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">
                          Available Times {format(selectedDate, 'EEEE, MMMM d')}
                        </h3>
                        
                        {slotsForSelectedDate && slotsForSelectedDate.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {slotsForSelectedDate.map((slot) => (
                              <div
                                key={slot.id}
                                className={`p-2 border rounded-md text-center cursor-pointer ${
                                  selectedSlotId === slot.id 
                                    ? 'border-primary bg-primary/5' 
                                    : 'hover:border-primary/50'
                                }`}
                                onClick={() => setSelectedSlotId(slot.id)}
                              >
                                <span className="text-sm font-medium">
                                  {format(new Date(slot.start_time), 'h:mm a')}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground border rounded-md">
                            <p>No availability on this date</p>
                            <p className="text-xs mt-1">Try another date</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  {!isOwnProfile && (
                    <Button 
                      className="w-full" 
                      disabled={!selectedSessionType || !selectedSlotId}
                      onClick={() => setBookingDialogOpen(true)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Selected Time
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          </div>
          
          {/* Booking Session Dialog */}
          <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Book a Session</DialogTitle>
                <DialogDescription>
                  Confirm your session details with {mentor?.full_name || mentor?.username}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Session Type & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Session Type</label>
                    <div className="p-2 border rounded-md">
                      <div className="font-medium">{selectedSessionType?.name || "None selected"}</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedSessionType?.duration} minutes
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Time Slot</label>
                    <div className="p-2 border rounded-md">
                      {selectedSlotId && availabilitySlots?.find(s => s.id === selectedSlotId) ? (
                        <>
                          <div className="font-medium">
                            {format(new Date(availabilitySlots.find(s => s.id === selectedSlotId)!.start_time), 'h:mm a')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(availabilitySlots.find(s => s.id === selectedSlotId)!.start_time), 'EEEE, MMMM d')}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">None selected</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Price Summary */}
                <div className="p-3 bg-muted/50 rounded-md">
                  <div className="flex justify-between items-center">
                    <span>Session Price</span>
                    <span className="font-medium">
                      {selectedSessionType?.is_free 
                        ? "Free" 
                        : selectedSessionType 
                        ? `$${selectedSessionType.price.toFixed(2)}` 
                        : "$0.00"
                      }
                    </span>
                  </div>
                </div>
                
                {/* Session Title & Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="e.g., Career Guidance Session"
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Description (Optional)</label>
                  <textarea
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    placeholder="What would you like to discuss?"
                    className="w-full p-2 border rounded-md h-20 resize-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setBookingDialogOpen(false)}
                  disabled={isBooking}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleBookSession}
                  disabled={!selectedSessionType || !selectedSlotId || !sessionTitle.trim() || isBooking}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Confirm & Pay
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default MentorProfilePage;
