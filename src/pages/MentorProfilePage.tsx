
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Plus, 
  User, 
  MessageSquare, 
  Link as LinkIcon,
  Twitter,
  Linkedin,
  Globe,
  Briefcase,
  GraduationCap,
  CheckCircle,
  Loader2,
  Star
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useMentorSpace } from "@/hooks/use-mentor-space";
import { useProfile } from "@/hooks/use-profile";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";
import { Helmet } from "react-helmet-async";
import { ProfileType } from "@/types/profile";
import { MentorProfile, MentorSessionTypeInfo, MentorAvailabilitySlot } from "@/types/mentor";
import { DateRange } from "react-day-picker";

const MentorProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getMentorProfile, getMentorSessionTypes, getMentorAvailability } = useMentorSpace();
  const { profile, isLoading: isProfileLoading } = useProfile();
  
  const [mentorData, setMentorData] = useState<MentorProfile | null>(null);
  const [sessionTypes, setSessionTypes] = useState<MentorSessionTypeInfo[]>([]);
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedSessionType, setSelectedSessionType] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMentorData = async () => {
      setIsLoading(true);
      try {
        if (!username) throw new Error("Username is required");
        
        // Fetch profile by username
        const { data: profiles, error: profileError } = await (await fetch(`/api/profile/get-by-username?username=${username}`)).json();
        if (profileError) throw profileError;
        
        const mentorProfile = profiles[0];
        if (!mentorProfile) throw new Error("Mentor profile not found");
        
        // Fetch mentor profile details
        const mentorProfileData = await getMentorProfile(mentorProfile.id);
        if (mentorProfileData.data) {
          setMentorData(mentorProfileData.data as MentorProfile);
        }
        
        // Fetch session types
        const sessionTypesData = await getMentorSessionTypes(mentorProfile.id);
        if (sessionTypesData.data) {
          setSessionTypes(sessionTypesData.data || []);
        }
        
        // Fetch availability
        const availabilityData = await getMentorAvailability(mentorProfile.id);
        if (availabilityData.data) {
          setAvailability(availabilityData.data || []);
        }
      } catch (error: any) {
        console.error("Error fetching mentor data:", error);
        // toast.error(`Failed to fetch mentor data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMentorData();
  }, [username, getMentorProfile, getMentorSessionTypes, getMentorAvailability]);
  
  const handleBookSession = async () => {
    if (!selectedSessionType || !selectedDateRange?.from) {
      setBookingError("Please select a session type and date");
      return;
    }
    
    setIsBooking(true);
    setBookingError(null);
    
    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // toast.success("Session booked successfully!");
      setShowBookingDialog(false);
    } catch (error: any) {
      console.error("Error booking session:", error);
      setBookingError("Failed to book session. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-6 w-24" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Skeleton className="h-24 w-24 rounded-full mb-4" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-2" />
                </CardContent>
              </Card>
            </div>
            
            <div className="md:w-2/3">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-6 w-32" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (!mentorData) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 px-4">
          <Alert>
            <AlertDescription>
              Mentor profile not found.
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <Helmet>
        <title>{mentorData.full_name} | Mentor Profile | Idolyst</title>
      </Helmet>
      
      <PageTransition>
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Profile Summary */}
            <div className="md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Summary</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={mentorData.avatar_url || undefined} alt={mentorData.full_name} />
                    <AvatarFallback>{mentorData.full_name?.charAt(0) || mentorData.username?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold mt-4">{mentorData.full_name}</h2>
                  <p className="text-muted-foreground">{mentorData.professional_headline}</p>
                  <p className="text-muted-foreground">{mentorData.position} at {mentorData.company}</p>
                  
                  <div className="flex gap-2 mt-3">
                    {mentorData.website && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={mentorData.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {mentorData.linkedin_url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={mentorData.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {mentorData.twitter_url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={mentorData.twitter_url} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button onClick={() => navigate(`/messages/${mentorData.id}`)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact
                  </Button>
                </CardFooter>
              </Card>
              
              {mentorData?.expertise && mentorData.expertise.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentorData.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {mentorData.location && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground">{mentorData.location}</p>
                </div>
              )}
            </div>
            
            {/* Right Column - Profile Details */}
            <div className="md:w-2/3">
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                  <CardDescription>Learn more about {mentorData.full_name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mentorData.bio && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Biography</h3>
                      <p className="text-muted-foreground">{mentorData.bio}</p>
                    </div>
                  )}
                  
                  {mentorData.mentor_bio && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Mentoring Philosophy</h3>
                      <p className="text-muted-foreground">{mentorData.mentor_bio}</p>
                    </div>
                  )}
                  
                  {mentorData.work_experience && mentorData.work_experience.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Work Experience</h3>
                      {mentorData.work_experience.map((work, index) => (
                        <div key={index} className="mb-3">
                          <h4 className="font-medium flex items-center gap-1">
                            <Briefcase className="h-4 w-4 mr-1 text-muted-foreground" />
                            {work.title} at {work.company}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(work.start_date), "MMM yyyy")} - {work.end_date ? format(parseISO(work.end_date), "MMM yyyy") : "Present"}
                          </p>
                          <p className="text-muted-foreground">{work.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {mentorData.education && mentorData.education.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Education</h3>
                      {mentorData.education.map((edu, index) => (
                        <div key={index} className="mb-3">
                          <h4 className="font-medium flex items-center gap-1">
                            <GraduationCap className="h-4 w-4 mr-1 text-muted-foreground" />
                            {edu.degree} in {edu.field_of_study}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {edu.institution} ({format(parseISO(edu.start_date), "yyyy")} - {edu.end_date ? format(parseISO(edu.end_date), "yyyy") : "Present"})
                          </p>
                          <p className="text-muted-foreground">{edu.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {sessionTypes && sessionTypes.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Mentoring Sessions</CardTitle>
                    <CardDescription>Book a session with {mentorData.full_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sessionTypes.map(sessionType => (
                        <Card key={sessionType.id} className="border-primary/20">
                          <CardHeader>
                            <CardTitle>{sessionType.name}</CardTitle>
                            <CardDescription>{sessionType.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              Duration: {sessionType.duration} minutes
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Price: ${sessionType.price}
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              variant="outline"
                              onClick={() => {
                                setSelectedSessionType(sessionType.id);
                                setShowBookingDialog(true);
                              }}
                            >
                              Book Session
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Booking Dialog */}
          <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Book a Session</DialogTitle>
                <DialogDescription>
                  Select a date and time for your session with {mentorData.full_name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="session-type">Session Type</Label>
                  <Select 
                    value={selectedSessionType || ""}
                    onValueChange={(value) => setSelectedSessionType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a session type" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessionTypes.map(sessionType => (
                        <SelectItem key={sessionType.id} value={sessionType.id}>
                          {sessionType.name} (${sessionType.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <CalendarDateRangePicker 
                    date={selectedDateRange}
                    onChange={setSelectedDateRange}
                  />
                </div>
                
                {bookingError && (
                  <Alert variant="destructive">
                    <AlertDescription>{bookingError}</AlertDescription>
                  </Alert>
                )}
              </div>
              
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setShowBookingDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleBookSession} disabled={isBooking}>
                  {isBooking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default MentorProfilePage;
