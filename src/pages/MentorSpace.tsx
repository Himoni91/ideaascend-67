
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, Award, Calendar, ThumbsUp, MessageSquare, ArrowRight, Star, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useMentor } from "@/hooks/use-mentor";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ProfileType } from "@/types/profile";
import { MentorSession } from "@/types/mentor";

const MentorSpace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("discover");
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const { useMentors, useMentorSessions } = useMentor();
  const { user } = useAuth();
  
  // Define expertise options - in real app this would come from a database
  const expertiseOptions = [
    "Product Strategy", "UX Design", "Fundraising", "Marketing", 
    "Engineering", "Leadership", "Financial Modeling", "Sales"
  ];
  
  // Fetch mentors with optional filters
  const { data: mentors = [], isLoading: isLoadingMentors, error: mentorsError } = useMentors({
    specialties: selectedExpertise.length > 0 ? selectedExpertise : undefined,
    search: searchTerm.length > 0 ? searchTerm : undefined,
  });

  // Fetch user's upcoming sessions
  const { data: upcomingSessions = [], isLoading: isLoadingSessions } = useMentorSessions(
    'scheduled', // Get scheduled sessions
    user?.id ? undefined : 'mentee' // If user is logged in, get sessions as mentee
  );
  
  useEffect(() => {
    if (mentorsError) {
      toast.error("Failed to load mentors. Please try again later.");
      console.error(mentorsError);
    }
  }, [mentorsError]);
  
  const toggleExpertise = (expertise: string) => {
    if (selectedExpertise.includes(expertise)) {
      setSelectedExpertise(selectedExpertise.filter(e => e !== expertise));
    } else {
      setSelectedExpertise([...selectedExpertise, expertise]);
    }
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Users className="mr-3 h-7 w-7 text-idolyst-blue" />
            Mentor Space
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Connect with experienced mentors who can help guide your startup journey, provide valuable feedback, 
            and share their expertise to help you overcome challenges.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
            <Tabs defaultValue="discover" onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
                <TabsTrigger value="discover">Discover Mentors</TabsTrigger>
                <TabsTrigger value="sessions">My Sessions</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>
              
              {/* Discover Tab */}
              <TabsContent value="discover">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search mentors by name, company, or position"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground hidden md:block" />
                    <span className="text-sm text-muted-foreground mr-3 hidden md:block">Filter by:</span>
                    <div className="flex flex-wrap gap-2">
                      {expertiseOptions.slice(0, 4).map((expertise) => (
                        <Badge
                          key={expertise}
                          variant={selectedExpertise.includes(expertise) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleExpertise(expertise)}
                        >
                          {expertise}
                        </Badge>
                      ))}
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        More...
                      </Button>
                    </div>
                  </div>
                </div>
                
                {isLoadingMentors ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : mentors.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                    <h3 className="text-lg font-medium mb-1">No mentors found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Try adjusting your search or filters to find mentors that match your criteria.
                    </p>
                  </div>
                ) : (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {mentors.map((mentor: ProfileType) => (
                      <motion.div key={mentor.id} variants={item}>
                        <Link to={`/mentor-space/${mentor.id}`}>
                          <Card className="h-full hover:border-primary/20 transition-all hover:shadow-sm">
                            <CardHeader className="pb-4">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={mentor.avatar_url || undefined} />
                                  <AvatarFallback>{mentor.full_name?.charAt(0) || mentor.username?.charAt(0) || 'M'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-lg">{mentor.full_name || mentor.username}</CardTitle>
                                  <CardDescription className="mt-1">
                                    {mentor.position} {mentor.company && `at ${mentor.company}`}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {mentor.mentor_bio || mentor.bio}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {mentor.expertise?.slice(0, 3).map((exp: string, i: number) => (
                                  <Badge key={i} variant="outline" className="bg-primary/5">
                                    {exp}
                                  </Badge>
                                ))}
                                {(mentor.expertise?.length || 0) > 3 && (
                                  <Badge variant="outline">+{(mentor.expertise?.length || 0) - 3} more</Badge>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                  <ThumbsUp className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  <span>{mentor.stats?.mentorRating || "New"}</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  <span>{mentor.stats?.mentorSessions || 0} Sessions</span>
                                </div>
                                <div className="flex items-center">
                                  <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  <span>{mentor.stats?.mentorReviews || 0} Reviews</span>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                              <Button className="w-full" variant="outline">
                                <Calendar className="mr-2 h-4 w-4" />
                                Schedule Session
                              </Button>
                            </CardFooter>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
              
              {/* Sessions Tab */}
              <TabsContent value="sessions">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-xl">Upcoming Sessions</CardTitle>
                        <CardDescription>
                          Your scheduled mentorship sessions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingSessions ? (
                          <div className="flex justify-center items-center py-8">
                            <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : upcomingSessions.length === 0 ? (
                          <div className="text-center py-8 border rounded-lg">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                            <h3 className="text-lg font-medium mb-1">No upcoming sessions</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                              You don't have any scheduled mentorship sessions. Find a mentor and book a session.
                            </p>
                            <Button 
                              className="mt-4" 
                              variant="outline"
                              onClick={() => setActiveTab("discover")}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Find a Mentor
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {upcomingSessions.map((session: MentorSession) => (
                              <div key={session.id} className="border rounded-lg p-4 hover:border-primary/20 transition-colors">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-medium">{session.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      With {session.mentor?.full_name || 'Unknown Mentor'} • 
                                      {new Date(session.end_time).getTime() - new Date(session.start_time).getTime() === 0 
                                        ? 'Duration unknown' 
                                        : `${Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60))} minutes`
                                      }
                                    </p>
                                    <p className="text-sm mt-1">
                                      {new Date(session.start_time).toLocaleDateString('en-US', { 
                                        weekday: 'short',
                                        month: 'short', 
                                        day: 'numeric',
                                      })} at {new Date(session.start_time).toLocaleTimeString('en-US', { 
                                        hour: 'numeric', 
                                        minute: '2-digit' 
                                      })}
                                    </p>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    {session.session_url ? 'Join Call' : 'View Details'}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">Past Sessions</CardTitle>
                        <CardDescription>
                          Your completed mentorship sessions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* We'll implement the past sessions view later */}
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No past sessions found.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">Growth Stats</CardTitle>
                        <CardDescription>
                          Your mentorship journey stats
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="text-center py-3 border rounded-lg bg-primary/5">
                          <h3 className="text-3xl font-bold text-primary">{upcomingSessions.length}</h3>
                          <p className="text-sm text-muted-foreground">Total Sessions</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center py-3 border rounded-lg">
                            <h3 className="text-2xl font-bold">0</h3>
                            <p className="text-xs text-muted-foreground">Hours Mentored</p>
                          </div>
                          <div className="text-center py-3 border rounded-lg">
                            <h3 className="text-2xl font-bold">0</h3>
                            <p className="text-xs text-muted-foreground">Different Mentors</p>
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t">
                          <h3 className="font-medium mb-3">Top Topics Discussed</h3>
                          <p className="text-sm text-muted-foreground">
                            Complete a session to see your most discussed topics.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              {/* Favorites Tab */}
              <TabsContent value="favorites">
                <div className="text-center py-12 border rounded-lg">
                  <div className="max-w-md mx-auto">
                    <Award className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                    <h3 className="text-lg font-medium mb-1">No favorite mentors yet</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      You haven't added any mentors to your favorites list yet. Discover mentors and add them to your favorites for quick access.
                    </p>
                    <Button onClick={() => setActiveTab("discover")}>
                      <Users className="mr-2 h-4 w-4" />
                      Discover Mentors
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Featured Mentors Section */}
        {activeTab === "discover" && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Mentors</h2>
              <Button variant="ghost" className="flex items-center gap-1 text-idolyst-blue">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoadingMentors ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : mentors.slice(0, 4).map((mentor: ProfileType) => (
                <Card key={mentor.id} className="hover:border-primary/20 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={mentor.avatar_url || undefined} />
                        <AvatarFallback>{mentor.full_name?.charAt(0) || mentor.username?.charAt(0) || 'M'}</AvatarFallback>
                      </Avatar>
                      <Badge className="bg-idolyst-blue/90">Featured</Badge>
                    </div>
                    <CardTitle className="mt-3 text-lg">{mentor.full_name || mentor.username}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {mentor.position} {mentor.company && `at ${mentor.company}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {mentor.expertise?.slice(0, 2).map((exp: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                      {(mentor.expertise?.length || 0) > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(mentor.expertise?.length || 0) - 2} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Star className="fill-yellow-500 text-yellow-500 h-3 w-3 mr-1" />
                        {mentor.stats?.mentorRating || "New"} ({mentor.stats?.mentorReviews || 0})
                      </div>
                      <div>
                        Available
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button className="w-full" variant="outline" asChild>
                      <Link to={`/mentor-space/${mentor.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MentorSpace;
