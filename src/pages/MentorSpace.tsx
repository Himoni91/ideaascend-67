import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, Award, Calendar, ThumbsUp, MessageSquare, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

// Mock mentor data
const mentors = [
  {
    id: "mentor1",
    name: "Sarah Johnson",
    position: "Product Lead",
    company: "TechCorp",
    avatar: "",
    expertise: ["Product Strategy", "UX Design", "Team Management"],
    rating: 4.9,
    sessions: 24,
    testimonials: 17,
    availability: ["Mon", "Wed", "Fri"],
    bio: "10+ years helping startups build successful products. Previously led product at Dropbox and Slack.",
  },
  {
    id: "mentor2",
    name: "Michael Chen",
    position: "Venture Partner",
    company: "Sequoia Capital",
    avatar: "",
    expertise: ["Fundraising", "Pitch Decks", "Financial Modeling"],
    rating: 4.8,
    sessions: 36,
    testimonials: 29,
    availability: ["Tue", "Thu", "Sat"],
    bio: "Helped 20+ startups raise over $50M in funding. Angel investor in 15 companies.",
  },
  {
    id: "mentor3",
    name: "Alex Rivera",
    position: "CTO",
    company: "StartupX",
    avatar: "",
    expertise: ["Technical Architecture", "Engineering Leadership", "Scaling Systems"],
    rating: 4.7,
    sessions: 19,
    testimonials: 14,
    availability: ["Mon", "Wed", "Fri"],
    bio: "Led engineering teams at scale. Expertise in helping technical founders build scalable products.",
  },
  {
    id: "mentor4",
    name: "Priya Sharma",
    position: "Growth Advisor",
    company: "Growth Hackers",
    avatar: "",
    expertise: ["User Acquisition", "Conversion Optimization", "Analytics"],
    rating: 4.9,
    sessions: 42,
    testimonials: 31,
    availability: ["Tue", "Thu", "Sun"],
    bio: "Specializing in helping startups achieve product-market fit and scale their user acquisition.",
  },
  {
    id: "mentor5",
    name: "David Wilson",
    position: "CEO",
    company: "LaunchPad",
    avatar: "",
    expertise: ["Leadership", "Strategic Planning", "Startup Operations"],
    rating: 4.8,
    sessions: 28,
    testimonials: 22,
    availability: ["Mon", "Wed", "Fri"],
    bio: "Serial entrepreneur with 3 successful exits. Passionate about helping first-time founders succeed.",
  },
];

// Mock upcoming sessions data
const upcomingSessions = [
  {
    id: "session1",
    mentor: "Sarah Johnson",
    title: "Product Strategy Discussion",
    date: "2023-07-15T14:00:00",
    duration: 30,
  },
  {
    id: "session2",
    mentor: "Michael Chen",
    title: "Funding Strategy Review",
    date: "2023-07-17T10:00:00",
    duration: 60,
  },
];

const MentorSpace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("discover");
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  
  const expertiseOptions = [
    "Product Strategy", "UX Design", "Fundraising", "Marketing", 
    "Engineering", "Leadership", "Financial Modeling", "Sales"
  ];
  
  const toggleExpertise = (expertise: string) => {
    if (selectedExpertise.includes(expertise)) {
      setSelectedExpertise(selectedExpertise.filter(e => e !== expertise));
    } else {
      setSelectedExpertise([...selectedExpertise, expertise]);
    }
  };
  
  const filteredMentors = mentors.filter(mentor => {
    // Filter by search term (name, company, position)
    const matchesSearch = 
      searchTerm === "" || 
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by selected expertise
    const matchesExpertise = 
      selectedExpertise.length === 0 || 
      mentor.expertise.some(exp => selectedExpertise.includes(exp));
    
    return matchesSearch && matchesExpertise;
  });

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
                
                {filteredMentors.length === 0 ? (
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
                    {filteredMentors.map((mentor) => (
                      <motion.div key={mentor.id} variants={item}>
                        <Link to={`/mentor-space/${mentor.id}`}>
                          <Card className="h-full hover:border-primary/20 transition-all hover:shadow-sm">
                            <CardHeader className="pb-4">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={mentor.avatar} />
                                  <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-lg">{mentor.name}</CardTitle>
                                  <CardDescription className="mt-1">
                                    {mentor.position} at {mentor.company}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {mentor.bio}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {mentor.expertise.map((exp) => (
                                  <Badge key={exp} variant="outline" className="bg-primary/5">
                                    {exp}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                  <ThumbsUp className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  <span>{mentor.rating} Rating</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  <span>{mentor.sessions} Sessions</span>
                                </div>
                                <div className="flex items-center">
                                  <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  <span>{mentor.testimonials} Reviews</span>
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
                        {upcomingSessions.length === 0 ? (
                          <div className="text-center py-8 border rounded-lg">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                            <h3 className="text-lg font-medium mb-1">No upcoming sessions</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                              You don't have any scheduled mentorship sessions. Find a mentor and book a session.
                            </p>
                            <Button className="mt-4" variant="outline">
                              <Calendar className="mr-2 h-4 w-4" />
                              Find a Mentor
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {upcomingSessions.map((session) => (
                              <div key={session.id} className="border rounded-lg p-4 hover:border-primary/20 transition-colors">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-medium">{session.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      With {session.mentor} • {session.duration} minutes
                                    </p>
                                    <p className="text-sm mt-1">
                                      {new Date(session.date).toLocaleDateString('en-US', { 
                                        weekday: 'short',
                                        month: 'short', 
                                        day: 'numeric',
                                      })} at {new Date(session.date).toLocaleTimeString('en-US', { 
                                        hour: 'numeric', 
                                        minute: '2-digit' 
                                      })}
                                    </p>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    Join Call
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
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium">{
                                    ["Product Strategy Session", "Fundraising Strategy", "Technical Architecture Review"][i-1]
                                  }</h3>
                                  <p className="text-sm text-muted-foreground">
                                    With {["Sarah Johnson", "Michael Chen", "Alex Rivera"][i-1]} • 
                                    {[30, 60, 45][i-1]} minutes
                                  </p>
                                  <p className="text-sm mt-1">
                                    {["Jun 5, 2023", "May 22, 2023", "May 10, 2023"][i-1]} at 
                                    {["10:00 AM", "2:00 PM", "11:30 AM"][i-1]}
                                  </p>
                                </div>
                                <Button variant="outline" size="sm">
                                  View Notes
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" className="w-full">
                          View All Past Sessions
                        </Button>
                      </CardFooter>
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
                          <h3 className="text-3xl font-bold text-primary">{upcomingSessions.length + 5}</h3>
                          <p className="text-sm text-muted-foreground">Total Sessions</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center py-3 border rounded-lg">
                            <h3 className="text-2xl font-bold">12</h3>
                            <p className="text-xs text-muted-foreground">Hours Mentored</p>
                          </div>
                          <div className="text-center py-3 border rounded-lg">
                            <h3 className="text-2xl font-bold">4</h3>
                            <p className="text-xs text-muted-foreground">Different Mentors</p>
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t">
                          <h3 className="font-medium mb-3">Top Topics Discussed</h3>
                          <div className="space-y-2">
                            {["Product Strategy", "Fundraising", "Team Building"].map((topic, i) => (
                              <div key={topic} className="flex items-center justify-between text-sm">
                                <span>{topic}</span>
                                <span className="text-muted-foreground">{[3, 2, 1][i]} sessions</span>
                              </div>
                            ))}
                          </div>
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
              {mentors.slice(0, 4).map((mentor) => (
                <Card key={mentor.id} className="hover:border-primary/20 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={mentor.avatar} />
                        <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Badge className="bg-idolyst-blue/90">Featured</Badge>
                    </div>
                    <CardTitle className="mt-3 text-lg">{mentor.name}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {mentor.position} at {mentor.company}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {mentor.expertise.slice(0, 2).map((exp) => (
                        <Badge key={exp} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                      {mentor.expertise.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{mentor.expertise.length - 2} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Star className="fill-yellow-500 text-yellow-500 h-3 w-3 mr-1" />
                        {mentor.rating} ({mentor.testimonials})
                      </div>
                      <div>
                        Available on: {mentor.availability.join(", ")}
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
