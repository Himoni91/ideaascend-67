
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, MessageSquare, Calendar, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/contexts/AuthContext";

const MentorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("about");
  
  const { profile, isLoading, error } = useProfile(id);
  const { user } = useAuth();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-idolyst-blue mb-4" />
          <span className="text-lg text-muted-foreground">Loading mentor profile...</span>
        </div>
      </AppLayout>
    );
  }

  if (error || !profile) {
    return (
      <AppLayout>
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
      </AppLayout>
    );
  }

  // Verify this is actually a mentor profile
  if (!profile.is_mentor) {
    return (
      <AppLayout>
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
              <Link to={`/profile/${id}`}>
                View Profile
              </Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

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
      <motion.div 
        className="max-w-4xl mx-auto px-4 sm:px-6 pb-20"
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
            <div className="h-32 bg-gradient-to-r from-idolyst-blue/30 to-idolyst-indigo/30 relative">
              <div className="absolute -bottom-16 left-6">
                <Avatar className="h-32 w-32 border-4 border-background">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || "Mentor"} />
                  <AvatarFallback className="text-3xl">
                    {profile.full_name?.charAt(0) || profile.username?.charAt(0) || "M"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge className="bg-idolyst-blue/90">Verified Mentor</Badge>
                {profile.id === user?.id && (
                  <Badge variant="outline" className="bg-background/80">This is you</Badge>
                )}
              </div>
            </div>
            
            <CardContent className="pt-20 pb-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{profile.full_name}</h1>
                  <p className="text-muted-foreground">
                    {profile.position && profile.company ? (
                      <>
                        {profile.position} at {profile.company} 
                        {profile.location && <> · {profile.location}</>}
                      </>
                    ) : (
                      profile.location || "@" + profile.username
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="font-medium">4.9</span>
                      <span className="text-muted-foreground ml-1 text-sm">(24 reviews)</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">{profile.stats?.mentorSessions || 0} sessions</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    Book a Session
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </div>
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
                  <Award className="mr-2 h-5 w-5 text-idolyst-blue" />
                  Areas of Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise?.map((item, i) => (
                    <Badge key={i} variant="outline" className="bg-primary/5">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Availability Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-idolyst-blue" />
                  Availability
                </CardTitle>
                <CardDescription>
                  Upcoming available time slots
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" className="justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Tomorrow, 10:00 AM
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Tomorrow, 2:00 PM
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Friday, 11:00 AM
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Friday, 3:00 PM
                  </Button>
                </div>
                <Button className="w-full">
                  View All Available Times
                </Button>
              </CardContent>
            </Card>
            
            {/* Session Types Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Session Types</CardTitle>
                <CardDescription>
                  Ways to connect with this mentor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Quick Chat</h3>
                      <p className="text-xs text-muted-foreground mt-1">30 minutes • Video call</p>
                    </div>
                    <Badge>Free</Badge>
                  </div>
                  <p className="text-sm mt-3">
                    Brief session for specific questions or quick advice on your startup journey.
                  </p>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Deep Dive</h3>
                      <p className="text-xs text-muted-foreground mt-1">60 minutes • Video call</p>
                    </div>
                    <Badge variant="outline">Credits: 2</Badge>
                  </div>
                  <p className="text-sm mt-3">
                    In-depth consultation for comprehensive feedback and strategic planning.
                  </p>
                </div>
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
              
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>About {profile.full_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm leading-relaxed">
                      {profile.bio || (
                        <p className="text-muted-foreground">
                          This mentor hasn't added a bio yet.
                        </p>
                      )}
                    </div>
                    
                    {(profile.website || profile.linkedin_url || profile.twitter_url) && (
                      <div className="pt-3 border-t">
                        <h3 className="font-medium mb-2">Connect</h3>
                        <div className="flex flex-wrap gap-3">
                          {profile.website && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={profile.website} target="_blank" rel="noopener noreferrer">
                                Website
                              </a>
                            </Button>
                          )}
                          {profile.linkedin_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                                LinkedIn
                              </a>
                            </Button>
                          )}
                          {profile.twitter_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">
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
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Mentor Reviews</CardTitle>
                    <CardDescription>
                      See what others say about sessions with {profile.full_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Mocked reviews */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {["JD", "AR", "MC"][i-1]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <p className="font-medium">{["Jane Doe", "Alex Rodriguez", "Mark Chen"][i-1]}</p>
                              <div className="flex text-yellow-500 mt-0.5">
                                {Array(5).fill(0).map((_, idx) => (
                                  <Star key={idx} className="h-3 w-3 fill-yellow-500" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {["2 weeks ago", "1 month ago", "2 months ago"][i-1]}
                          </span>
                        </div>
                        <p className="text-sm mt-3">
                          {[
                            "Incredibly insightful session. I came away with actionable steps to improve my startup's marketing strategy. Would highly recommend!",
                            "Great mentor! Provided valuable feedback on my pitch deck and helped me refine my value proposition.",
                            "Excellent advice on fundraising strategies. Very knowledgeable and approachable."
                          ][i-1]}
                        </p>
                      </div>
                    ))}
                    
                    <div className="text-center mt-4">
                      <Button variant="outline">View All Reviews</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="topics" className="mt-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Mentorship Topics</CardTitle>
                    <CardDescription>
                      Specific areas {profile.full_name} can help with
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          title: "Startup Fundraising",
                          description: "Strategies for raising seed and Series A funding, investor pitches, and term sheet negotiations."
                        },
                        {
                          title: "Product-Market Fit",
                          description: "Validating your business idea, identifying target customers, and optimizing your value proposition."
                        },
                        {
                          title: "Growth Hacking",
                          description: "Customer acquisition strategies, viral marketing techniques, and scaling user base efficiently."
                        }
                      ].map((topic, i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <h3 className="font-medium mb-2">{topic.title}</h3>
                          <p className="text-sm text-muted-foreground">{topic.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default MentorProfile;
