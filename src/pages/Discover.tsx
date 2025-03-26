
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Users, Lightbulb, BookOpen, Podcast, Film, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/layout/AppLayout";

const Discover = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Discover</h1>
          <p className="text-muted-foreground max-w-3xl">
            Explore content, people, and ideas in the entrepreneurship ecosystem.
          </p>
        </motion.div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for people, ideas, content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground hidden md:block" />
            <span className="text-sm text-muted-foreground mr-3 hidden md:block">Filter by:</span>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="cursor-pointer"
              >
                Entrepreneurship
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer"
              >
                Technology
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer"
              >
                Business
              </Badge>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="people" className="space-y-8">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-4">
            <TabsTrigger value="people">
              <Users className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">People</span>
            </TabsTrigger>
            <TabsTrigger value="ideas">
              <Lightbulb className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Ideas</span>
            </TabsTrigger>
            <TabsTrigger value="content">
              <BookOpen className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="people">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {["S", "M", "A", "J", "D", "L"][i % 6]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {["Sarah Johnson", "Michael Chen", "Alex Rivera", "Jessica Lee", "David Wilson", "Lisa Park"][i % 6]}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {["Product Lead", "Venture Partner", "CTO", "Marketing Strategist", "CEO", "UX Designer"][i % 6]} at {["TechCorp", "Sequoia Capital", "StartupX", "Growth Hackers", "LaunchPad", "DesignLab"][i % 6]}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {[
                        ["Product Strategy", "UX Design", "Team Management"],
                        ["Fundraising", "Pitch Decks", "Financial Modeling"],
                        ["Technical Architecture", "Engineering", "Scaling"],
                        ["Growth", "Conversion", "Analytics"],
                        ["Leadership", "Strategy", "Operations"],
                        ["User Research", "Prototyping", "Accessibility"]
                      ][i % 6].map((exp) => (
                        <Badge key={exp} variant="outline" className="bg-primary/5">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <Button size="sm">Follow</Button>
                      <Button size="sm" variant="outline">View Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="ideas">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>
                        {[
                          "AI-Powered Personal Fitness Coach",
                          "Sustainable Packaging Marketplace",
                          "Remote Team Collaboration Platform",
                          "Fintech Solution for Small Businesses"
                        ][i % 4]}
                      </CardTitle>
                      <Badge>{["AI", "Sustainability", "Remote Work", "Fintech"][i % 4]}</Badge>
                    </div>
                    <CardDescription>
                      By {["Sarah Johnson", "Michael Chen", "Alex Rivera", "Jessica Lee"][i % 4]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm">
                      {[
                        "An app that uses computer vision to provide real-time form correction and personalized workout plans.",
                        "A B2B marketplace connecting businesses with sustainable packaging suppliers and solutions.",
                        "A virtual office platform that creates spontaneous interaction opportunities for remote teams.",
                        "A suite of financial tools designed specifically for small businesses to manage cash flow effectively."
                      ][i % 4]}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[
                        ["AI", "Fitness", "Mobile App"],
                        ["Sustainability", "B2B", "Marketplace"],
                        ["Remote Work", "SaaS", "Productivity"],
                        ["Fintech", "Small Business", "SaaS"]
                      ][i % 4].map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-secondary/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        {[124, 95, 87, 112][i % 4]} votes
                      </div>
                      <Button size="sm">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {[
                          <><BookOpen className="mr-1 h-3.5 w-3.5" /> Article</>,
                          <><Podcast className="mr-1 h-3.5 w-3.5" /> Podcast</>,
                          <><Film className="mr-1 h-3.5 w-3.5" /> Video</>
                        ][i % 3]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {["3 days ago", "1 week ago", "2 weeks ago", "2 days ago", "5 days ago", "1 day ago"][i % 6]}
                      </span>
                    </div>
                    <CardTitle className="mt-2 text-lg">
                      {[
                        "10 Startup Mistakes to Avoid",
                        "Fundraising Strategies for Early Stage",
                        "Building a Remote Culture",
                        "Product-Market Fit: A Guide",
                        "The Art of Pivoting",
                        "Growing Through Partnerships"
                      ][i % 6]}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      By {["Startup Magazine", "VC Insights Podcast", "Tech Talks", "Growth Hackers", "Founder Stories", "Business Weekly"][i % 6]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4 line-clamp-3">
                      {[
                        "Learn from the common pitfalls that many startups encounter and how to navigate around them effectively.",
                        "Expert VCs discuss various fundraising approaches for startups at different stages.",
                        "Discover how to build and maintain a strong remote team culture in distributed companies.",
                        "A comprehensive guide to finding and validating product-market fit for your startup.",
                        "When and how to pivot your business model when the original plan isn't working.",
                        "Strategic partnerships can accelerate growth - learn how to identify and secure them."
                      ][i % 6]}
                    </p>
                    <Button size="sm" className="w-full">Read More</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="events">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {[
                            "Startup Pitch Competition",
                            "Fundraising Workshop",
                            "Tech Networking Mixer",
                            "Product Strategy Conference",
                            "Founder Fireside Chat",
                            "Investor Panel Discussion"
                          ][i % 6]}
                        </CardTitle>
                        <CardDescription>
                          {["Sep 15, 2023", "Sep 22, 2023", "Oct 5, 2023", "Oct 12, 2023", "Oct 20, 2023", "Nov 3, 2023"][i % 6]}
                        </CardDescription>
                      </div>
                      <Badge>{["In-Person", "Virtual", "Hybrid"][i % 3]}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      {[
                        "An opportunity for startups to pitch their ideas to a panel of judges and potential investors.",
                        "Learn effective strategies for raising capital from experienced investors and founders.",
                        "Connect with other tech professionals in a casual setting for networking and collaboration.",
                        "A day of insights and workshops focused on product strategy and development.",
                        "An intimate conversation with a successful founder sharing their journey and lessons.",
                        "A panel of investors discuss current trends and what they look for in startups."
                      ][i % 6]}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {[45, 60, 32, 75, 25, 50][i % 6]} attending
                      </div>
                      <Button size="sm">RSVP</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Discover;
