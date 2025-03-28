
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  SlidersHorizontal,
  Clock,
  X,
  Plus,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import {
  Slider
} from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckIcon } from "@radix-ui/react-icons";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";
import MentorCard from "@/components/mentor/MentorCard";
import MentorSessionCard from "@/components/mentor/MentorSessionCard";
import { useMentor } from "@/hooks/use-mentor";
import { MentorFilter, MentorSpecialty, MentorSession } from "@/types/mentor";
import { ProfileType } from "@/types/profile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const specialtyOptions: MentorSpecialty[] = [
  'Startup Strategy',
  'Product Development',
  'Fundraising',
  'Marketing',
  'User Acquisition',
  'Technical Architecture',
  'UX Design',
  'Business Model',
  'Team Building',
  'Pitch Deck',
  'Financial Modeling',
  'Growth Hacking',
  'Sales',
  'Customer Development'
];

export default function MentorSpacePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("discover");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyFree, setOnlyFree] = useState(false);
  const [onlyAvailableNow, setOnlyAvailableNow] = useState(false);
  const [sessionStatusFilter, setSessionStatusFilter] = useState<string>("all");
  const { user } = useAuth();
  
  // Create filter object
  const filters: MentorFilter = {
    specialties: selectedSpecialties,
    price_range: priceRange,
    rating: minRating,
    search: searchTerm
  };
  
  const { 
    useMentors, 
    useMentorSessions, 
    useMentorApplication
  } = useMentor();
  
  const { data: mentors, isLoading: isMentorsLoading } = useMentors(filters);
  const { data: upcomingSessions, isLoading: isSessionsLoading } = useMentorSessions("scheduled");
  const { data: inProgressSessions } = useMentorSessions("in-progress");
  const { data: completedSessions } = useMentorSessions("completed");
  const { data: application, isLoading: isApplicationLoading } = useMentorApplication();
  
  // Handle session status update
  const handleUpdateSessionStatus = async (sessionId: string, status: string) => {
    try {
      await useMentor().updateSessionStatus({
        sessionId,
        status,
        notes: ""
      });
      
      toast.success(`Session ${status} successfully`);
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Failed to update session status");
    }
  };
  
  // Get sessions based on status filter
  const getFilteredSessions = () => {
    if (sessionStatusFilter === "all") {
      return [
        ...(upcomingSessions || []),
        ...(inProgressSessions || []),
        ...(completedSessions || [])
      ];
    } else if (sessionStatusFilter === "scheduled") {
      return upcomingSessions || [];
    } else if (sessionStatusFilter === "in-progress") {
      return inProgressSessions || [];
    } else if (sessionStatusFilter === "completed") {
      return completedSessions || [];
    }
    
    return [];
  };
  
  // Toggle specialty filter
  const toggleSpecialty = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty));
    } else {
      setSelectedSpecialties([...selectedSpecialties, specialty]);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedSpecialties([]);
    setPriceRange([0, 200]);
    setMinRating(0);
    setOnlyFree(false);
    setOnlyAvailableNow(false);
  };
  
  // Check if there are any active filters
  const hasActiveFilters = selectedSpecialties.length > 0 || 
    priceRange[0] > 0 || 
    priceRange[1] < 200 || 
    minRating > 0 || 
    onlyFree || 
    onlyAvailableNow;
  
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
  
  const checkApplicationStatus = () => {
    if (isApplicationLoading) return null;
    
    if (!application) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 border border-dashed rounded-lg bg-background flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <h3 className="text-lg font-medium">Become a Mentor</h3>
            <p className="text-muted-foreground">
              Share your expertise and help other entrepreneurs succeed.
            </p>
          </div>
          <Button onClick={() => navigate("/mentor-space/apply")}>
            <Plus className="mr-2 h-4 w-4" />
            Apply to be a Mentor
          </Button>
        </motion.div>
      );
    }
    
    if (application.status === "pending") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <h3 className="font-medium">Application Pending</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Your mentor application is under review. We'll notify you once it's approved.
            </p>
          </div>
          <Button variant="outline" className="border-blue-300 dark:border-blue-700 bg-blue-100/50 dark:bg-blue-800/20">
            View Application
          </Button>
        </motion.div>
      );
    }
    
    return null;
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Users className="mr-3 h-7 w-7 text-primary" />
              Mentor Space
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Connect with experienced mentors who can help guide your startup journey, provide valuable feedback, 
              and share their expertise to help you overcome challenges.
            </p>
          </motion.div>
          
          {checkApplicationStatus()}
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
              <TabsTrigger value="discover">Discover Mentors</TabsTrigger>
              <TabsTrigger value="sessions">My Sessions</TabsTrigger>
            </TabsList>
            
            {/* Discover Tab */}
            <TabsContent value="discover">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search mentors by name, expertise, or company"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                      {hasActiveFilters && (
                        <Badge className="ml-2 bg-primary text-primary-foreground" variant="default">
                          {selectedSpecialties.length + (onlyFree ? 1 : 0) + (minRating > 0 ? 1 : 0) + (onlyAvailableNow ? 1 : 0) + ((priceRange[0] > 0 || priceRange[1] < 200) ? 1 : 0)}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[300px] sm:w-[400px] overflow-auto">
                    <SheetHeader>
                      <SheetTitle>Filter Mentors</SheetTitle>
                      <SheetDescription>
                        Refine your search to find the perfect mentor
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-6 space-y-6">
                      {/* Expertise */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                          {specialtyOptions.map((specialty) => (
                            <Badge
                              key={specialty}
                              variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleSpecialty(specialty)}
                            >
                              {selectedSpecialties.includes(specialty) && (
                                <CheckIcon className="h-3.5 w-3.5 mr-1.5" />
                              )}
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Price Range */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Price Range</h3>
                          <span className="text-sm text-muted-foreground">
                            ${priceRange[0]} - ${priceRange[1]}
                          </span>
                        </div>
                        <Slider
                          defaultValue={[0, 200]}
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                          step={10}
                          max={200}
                          className="cursor-pointer"
                        />
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="free-only"
                            checked={onlyFree}
                            onCheckedChange={setOnlyFree}
                          />
                          <Label htmlFor="free-only" className="text-sm">Show free sessions only</Label>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Minimum Rating */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Minimum Rating</h3>
                          <div className="flex items-center">
                            <span className="text-sm mr-1">{minRating}</span>
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          </div>
                        </div>
                        <Slider
                          defaultValue={[0]}
                          value={[minRating]}
                          onValueChange={(value) => setMinRating(value[0])}
                          step={0.5}
                          max={5}
                          className="cursor-pointer"
                        />
                      </div>
                      
                      {/* Availability */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Availability</h3>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="available-now"
                            checked={onlyAvailableNow}
                            onCheckedChange={setOnlyAvailableNow}
                          />
                          <Label htmlFor="available-now" className="text-sm">Available now</Label>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={clearFilters}
                          className="flex-1"
                          disabled={!hasActiveFilters}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Clear Filters
                        </Button>
                        <Button 
                          onClick={() => setFiltersOpen(false)}
                          className="flex-1"
                        >
                          Show Results
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              
              {/* Active filters display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedSpecialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="flex items-center">
                      {specialty}
                      <button
                        onClick={() => toggleSpecialty(specialty)}
                        className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-secondary-foreground/10"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                  
                  {(priceRange[0] > 0 || priceRange[1] < 200) && (
                    <Badge variant="secondary" className="flex items-center">
                      ${priceRange[0]} - ${priceRange[1]}
                      <button
                        onClick={() => setPriceRange([0, 200])}
                        className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-secondary-foreground/10"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  )}
                  
                  {onlyFree && (
                    <Badge variant="secondary" className="flex items-center">
                      Free Only
                      <button
                        onClick={() => setOnlyFree(false)}
                        className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-secondary-foreground/10"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  )}
                  
                  {minRating > 0 && (
                    <Badge variant="secondary" className="flex items-center">
                      {minRating}+ <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 ml-0.5" />
                      <button
                        onClick={() => setMinRating(0)}
                        className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-secondary-foreground/10"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  )}
                  
                  {onlyAvailableNow && (
                    <Badge variant="secondary" className="flex items-center">
                      Available Now
                      <button
                        onClick={() => setOnlyAvailableNow(false)}
                        className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-secondary-foreground/10"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-xs"
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                </div>
              )}
              
              {isMentorsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : mentors && mentors.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {mentors.map((mentor: ProfileType) => (
                    <motion.div key={mentor.id} variants={item}>
                      <MentorCard mentor={mentor} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No mentors found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Try adjusting your search or filters to find mentors that match your criteria.
                  </p>
                  {hasActiveFilters && (
                    <Button 
                      className="mt-4" 
                      variant="outline"
                      onClick={clearFilters}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* Sessions Tab */}
            <TabsContent value="sessions">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold">Your Mentorship Sessions</h2>
                  
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Select 
                      value={sessionStatusFilter} 
                      onValueChange={(value) => setSessionStatusFilter(value as any)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sessions</SelectItem>
                        <SelectItem value="scheduled">Upcoming</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {isSessionsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : getFilteredSessions().length > 0 ? (
                <motion.div 
                  className="space-y-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {getFilteredSessions()
                    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                    .map((session) => (
                      <motion.div key={session.id} variants={item}>
                        <MentorSessionCard 
                          session={session} 
                          userRole={session.mentor_id === user?.id ? "mentor" : "mentee"}
                          onUpdateStatus={handleUpdateSessionStatus}
                        />
                      </motion.div>
                    ))}
                </motion.div>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No sessions found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {sessionStatusFilter !== "all" 
                      ? `You don't have any ${sessionStatusFilter} sessions.`
                      : "You haven't booked any mentorship sessions yet. Find a mentor to get started."}
                  </p>
                  <Button 
                    className="mt-4" 
                    variant="outline"
                    onClick={() => setActiveTab("discover")}
                  >
                    Find a Mentor
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
