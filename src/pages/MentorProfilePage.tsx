
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  MessageSquare, 
  Calendar, 
  Star, 
  Award, 
  Clock,
  BookOpen,
  Briefcase,
  Globe,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/ui/page-transition";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useMentor } from "@/hooks/use-mentor";
import MentorAvailability from "@/components/mentor/MentorAvailability";
import MentorReviews from "@/components/mentor/MentorReviews";
import MentorBookingModal from "@/components/mentor/MentorBookingModal";
import { MentorAvailabilitySlot, MentorSessionTypeInfo } from "@/types/mentor";
import { useAuth } from "@/contexts/AuthContext";

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("about");
  const [selectedSlot, setSelectedSlot] = useState<MentorAvailabilitySlot | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const { user } = useAuth();
  
  const {
    useMentorProfile,
    useMentorAvailability,
    useMentorReviews,
    bookMentorSession
  } = useMentor();
  
  const { data: mentor, isLoading: isMentorLoading, error } = useMentorProfile(id);
  const { data: availabilitySlots, isLoading: isAvailabilityLoading } = useMentorAvailability(id);
  const { data: reviews, isLoading: isReviewsLoading } = useMentorReviews(id);
  const [isBookingProcessing, setIsBookingProcessing] = useState(false);
  
  // Check if this is the current user's profile
  const isOwnProfile = user?.id === id;
  
  // Handle slot selection
  const handleSelectSlot = (slot: MentorAvailabilitySlot) => {
    setSelectedSlot(slot);
    setBookingModalOpen(true);
  };
  
  // Handle booking confirmation
  const handleConfirmBooking = async (bookingData: {
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
      setIsBookingProcessing(true);
      
      await bookMentorSession({
        mentorId: bookingData.mentorId,
        slotId: bookingData.slotId,
        sessionData: bookingData.sessionData
      });
      
      setBookingModalOpen(false);
      setSelectedSlot(null);
      
      // Navigate to sessions tab
      navigate("/mentor-space?tab=sessions");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book session. Please try again.");
    } finally {
      setIsBookingProcessing(false);
    }
  };

  if (isMentorLoading) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col justify-center items-center min-h-[60vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <span className="text-lg text-muted-foreground">Loading mentor profile...</span>
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  if (error || !mentor) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-4xl mx-auto text-center py-12">
              <h2 className="text-2xl font-semibold mb-2">Mentor Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {error ? `Error: ${(error as Error).message}` : "The requested mentor could not be found."}
              </p>
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  // Verify this is actually a mentor profile
  if (!mentor.is_mentor) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-4xl mx-auto text-center py-12">
              <h2 className="text-2xl font-semibold mb-2">Not a Mentor</h2>
              <p className="text-muted-foreground mb-6">
                This user is not currently offering mentorship.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate(-1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
                <Button variant="outline" asChild>
                  <a href={`/profile/${id}`}>
                    View Profile
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  // Get mentor session types
  const sessionTypes: MentorSessionTypeInfo[] = (mentor.mentor_session_types as any || [
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
  ]);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, y: -20 }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <AppLayout>
      <PageTransition>
        <motion.div 
          className="container mx-auto px-4 py-6 pb-20"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
        >
          {/* Back Button */}
          <motion.div variants={itemVariants} className="mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mentors
            </Button>
          </motion.div>
          
          {/* Mentor Header Card */}
          <motion.div variants={itemVariants}>
            <Card className="mb-6 overflow-hidden border-2 border-primary/5">
              <div className="h-32 bg-gradient-to-r from-primary/30 to-primary/10 relative">
                <div className="absolute -bottom-16 left-6">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-sm">
                    <AvatarImage src={mentor.avatar_url || undefined} alt={mentor.full_name || "Mentor"} />
                    <AvatarFallback className="text-3xl">
                      {mentor.full_name?.charAt(0) || mentor.username?.charAt(0) || "M"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge className="bg-primary text-primary-foreground">Verified Mentor</Badge>
                  {isOwnProfile && (
                    <Badge variant="outline" className="bg-background/80">This is you</Badge>
                  )}
                </div>
              </div>
              
              <CardContent className="pt-20 pb-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">{mentor.full_name || mentor.username}</h1>
                    <p className="text-muted-foreground">
                      {mentor.position && mentor.company ? (
                        <>
                          {mentor.position} at {mentor.company} 
                          {mentor.location && <> · {mentor.location}</>}
                        </>
                      ) : (
                        mentor.location || "@" + mentor.username
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-medium">{mentor.stats?.mentorRating || 4.9}</span>
                        <span className="text-muted-foreground ml-1 text-sm">({reviews?.length || 0} reviews)</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground text-sm">{mentor.stats?.mentorSessions || 0} sessions</span>
                      </div>
                    </div>
                  </div>
                  {!isOwnProfile && (
                    <div className="flex gap-3">
                      <Button onClick={() => setBookingModalOpen(true)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Book a Session
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Sidebar Info */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Expertise Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Award className="mr-2 h-5 w-5 text-primary" />
                    Areas of Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise?.map((item, i) => (
                      <Badge key={i} variant="outline" className="bg-primary/5">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Availability Card */}
              <MentorAvailability 
                slots={availabilitySlots || []}
                isLoading={isAvailabilityLoading}
                onSelectSlot={handleSelectSlot}
                selectedSlot={selectedSlot}
              />
              
              {/* Session Types Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Session Types</CardTitle>
                  <CardDescription>
                    Ways to connect with this mentor
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sessionTypes.map((type, i) => (
                    <div key={i} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{type.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{type.duration} minutes</p>
                        </div>
                        {type.is_free || type.price === 0 ? (
                          <Badge>Free</Badge>
                        ) : (
                          <Badge variant="outline">{type.currency || "$"}{type.price}</Badge>
                        )}
                      </div>
                      <p className="text-sm mt-3">{type.description}</p>
                      {!isOwnProfile && (
                        <div className="mt-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setBookingModalOpen(true)}
                          >
                            <Calendar className="mr-2 h-3.5 w-3.5" />
                            Book {type.name}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Right Column - Main Content Tabs */}
            <motion.div variants={itemVariants} className="md:col-span-2">
              <Tabs defaultValue="about" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="topics">Topics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>About {mentor.full_name || mentor.username}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm leading-relaxed">
                        {mentor.mentor_bio || mentor.bio || (
                          <p className="text-muted-foreground">
                            This mentor hasn't added a bio yet.
                          </p>
                        )}
                      </div>
                      
                      {/* Experience */}
                      {mentor.work_experience && mentor.work_experience.length > 0 && (
                        <div className="pt-4 border-t">
                          <h3 className="font-medium mb-3 flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                            Work Experience
                          </h3>
                          <div className="space-y-3">
                            {(mentor.work_experience as any[]).map((work: any, i: number) => (
                              <div key={i} className="flex">
                                <div className="mr-4 flex flex-col items-center">
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                  {i < (mentor.work_experience as any[]).length - 1 && (
                                    <div className="h-full w-0.5 bg-muted flex-1 mt-1" />
                                  )}
                                </div>
                                <div className="flex-1 pb-3">
                                  <h4 className="font-medium">{work.position}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {work.company} • {work.start_date} {work.is_current ? "- Present" : work.end_date ? `- ${work.end_date}` : ""}
                                  </p>
                                  {work.description && (
                                    <p className="text-sm mt-1">{work.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Education */}
                      {mentor.education && mentor.education.length > 0 && (
                        <div className="pt-4 border-t">
                          <h3 className="font-medium mb-3 flex items-center">
                            <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                            Education
                          </h3>
                          <div className="space-y-3">
                            {(mentor.education as any[]).map((edu: any, i: number) => (
                              <div key={i} className="flex">
                                <div className="mr-4 flex flex-col items-center">
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                  {i < (mentor.education as any[]).length - 1 && (
                                    <div className="h-full w-0.5 bg-muted flex-1 mt-1" />
                                  )}
                                </div>
                                <div className="flex-1 pb-3">
                                  <h4 className="font-medium">{edu.degree}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {edu.institution} • {edu.field}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {edu.start_date} {edu.is_current ? "- Present" : edu.end_date ? `- ${edu.end_date}` : ""}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Social Links */}
                      {(mentor.website || mentor.linkedin_url || mentor.twitter_url) && (
                        <div className="pt-4 border-t">
                          <h3 className="font-medium mb-3 flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                            Connect
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            {mentor.website && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={mentor.website} target="_blank" rel="noopener noreferrer">
                                  Website
                                </a>
                              </Button>
                            )}
                            {mentor.linkedin_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer">
                                  LinkedIn
                                </a>
                              </Button>
                            )}
                            {mentor.twitter_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={mentor.twitter_url} target="_blank" rel="noopener noreferrer">
                                  Twitter
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="reviews" className="mt-6">
                  <MentorReviews 
                    reviews={reviews || []}
                    isLoading={isReviewsLoading}
                  />
                </TabsContent>
                
                <TabsContent value="topics" className="mt-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Mentorship Topics</CardTitle>
                      <CardDescription>
                        Specific areas {mentor.full_name || mentor.username} can help with
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mentor.expertise?.map((expertise, i) => (
                          <div key={i} className="border rounded-lg p-4">
                            <h3 className="font-medium mb-2">{expertise}</h3>
                            <p className="text-sm text-muted-foreground">
                              {getTopicDescription(expertise)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
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
            isProcessing={isBookingProcessing}
          />
        </motion.div>
      </PageTransition>
    </AppLayout>
  );
}

// Helper function to get topic descriptions
function getTopicDescription(topic: string): string {
  const descriptions: Record<string, string> = {
    "Startup Strategy": "Guidance on business models, market entry strategies, and competitive analysis to position your startup for success.",
    "Product Development": "Advice on product roadmaps, feature prioritization, and user-centered design to build products users love.",
    "Fundraising": "Strategies for raising seed and Series A funding, investor pitches, and term sheet negotiations.",
    "Marketing": "Help with marketing strategy, brand development, and customer acquisition to grow your user base efficiently.",
    "User Acquisition": "Tactics for customer acquisition, retention strategies, and building sustainable growth.",
    "Technical Architecture": "Guidance on tech stack selection, system design, and scaling infrastructure as your startup grows.",
    "UX Design": "Feedback on user experience, interface design, and usability testing to create intuitive products.",
    "Business Model": "Analysis of revenue models, pricing strategies, and identifying the most viable path to profitability.",
    "Team Building": "Strategies for hiring, team culture, leadership development, and organizational structure.",
    "Pitch Deck": "Feedback on pitch presentations, storytelling, and communicating your vision to investors effectively.",
    "Financial Modeling": "Help with creating financial projections, unit economics, and understanding key metrics for investor presentations.",
    "Growth Hacking": "Creative strategies to accelerate growth, viral marketing techniques, and data-driven experimentation.",
    "Sales": "Guidance on sales processes, customer conversations, and scaling your sales team to drive revenue.",
    "Customer Development": "Methods for validating customer problems, conducting interviews, and building user feedback loops."
  };
  
  return descriptions[topic] || 
    "Personalized guidance and expertise in this area to help you overcome challenges and achieve your goals.";
}
