
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  BadgeCheck,
  ChevronRight,
  XIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMentor } from "@/hooks/use-mentor";
import { MentorSpecialty } from "@/types/mentor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import MentorCard from "@/components/mentor/MentorCard";
import { PageTransition } from "@/components/ui/page-transition";

export default function MentorSpacePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [minRating, setMinRating] = useState<number>(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const { useMentors } = useMentor();
  const { data: mentors, isLoading, error } = useMentors({
    specialties: selectedSpecialties,
    price_range: priceRange,
    rating: minRating,
    search: searchTerm
  });
  
  useEffect(() => {
    if (error) {
      console.error("Error loading mentors:", error);
      toast.error("Failed to load mentors. Please try again.");
    }
  }, [error]);
  
  // Available specialties for filtering
  const specialties: MentorSpecialty[] = [
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
  
  // Toggle specialty selection
  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedSpecialties([]);
    setPriceRange([0, 200]);
    setMinRating(0);
    setSearchTerm("");
  };
  
  // Calculate counts for display
  const featuredMentors = mentors?.filter(mentor => mentor.is_verified) || [];
  const hasFilters = selectedSpecialties.length > 0 || 
                     priceRange[0] > 0 || 
                     priceRange[1] < 200 || 
                     minRating > 0 || 
                     searchTerm.length > 0;

  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">Find Your Perfect Mentor</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Connect with experienced mentors who can guide you through challenges, share insights, 
              and help you grow professionally.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {!user && (
                <Button size="lg" onClick={() => navigate("/auth/sign-in")}>
                  Sign In to Get Started
                </Button>
              )}
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/mentor-space/apply")}
              >
                Become a Mentor
              </Button>
            </div>
          </motion.div>
          
          {/* Search & Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for mentors by name, expertise, position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-auto sm:h-10">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {hasFilters && (
                    <Badge className="ml-2 bg-primary text-primary-foreground">{selectedSpecialties.length + (priceRange[0] > 0 || priceRange[1] < 200 ? 1 : 0) + (minRating > 0 ? 1 : 0)}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader className="flex flex-row justify-between items-center">
                  <SheetTitle>Filter Mentors</SheetTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </SheetHeader>
                
                <div className="py-6 space-y-6">
                  {/* Expertise */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Expertise</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {specialties.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`filter-${specialty}`} 
                            checked={selectedSpecialties.includes(specialty)}
                            onCheckedChange={() => toggleSpecialty(specialty)}
                          />
                          <Label 
                            htmlFor={`filter-${specialty}`}
                            className="text-sm cursor-pointer"
                          >
                            {specialty}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Price Range */}
                  <div>
                    <div className="flex justify-between mb-3">
                      <h3 className="text-sm font-medium">Price Range (USD)</h3>
                      <p className="text-sm">${priceRange[0]} - ${priceRange[1]}</p>
                    </div>
                    <Slider
                      value={priceRange}
                      min={0}
                      max={200}
                      step={5}
                      onValueChange={(value: number[]) => setPriceRange([value[0], value[1]])}
                      className="mb-6"
                    />
                  </div>
                  
                  <Separator />
                  
                  {/* Minimum Rating */}
                  <div>
                    <div className="flex justify-between mb-3">
                      <h3 className="text-sm font-medium">Minimum Rating</h3>
                      <p className="text-sm">{minRating}+ stars</p>
                    </div>
                    <Slider
                      value={[minRating]}
                      min={0}
                      max={5}
                      step={0.5}
                      onValueChange={(value: number[]) => setMinRating(value[0])}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      className="w-full" 
                      onClick={() => setFiltersOpen(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* CTA buttons */}
            <Button onClick={() => navigate("/mentor-space/apply")}>
              Become a Mentor
            </Button>
          </div>
          
          {/* Applied Filters */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm("")} className="ml-1">
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {selectedSpecialties.map(specialty => (
                <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                  {specialty}
                  <button onClick={() => toggleSpecialty(specialty)} className="ml-1">
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {(priceRange[0] > 0 || priceRange[1] < 200) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ${priceRange[0]} - ${priceRange[1]}
                  <button onClick={() => setPriceRange([0, 200])} className="ml-1">
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {minRating > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {minRating}+ stars
                  <button onClick={() => setMinRating(0)} className="ml-1">
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2">
                  Clear All
                </Button>
              )}
            </div>
          )}
          
          {/* Verified Mentors Section */}
          {!hasFilters && featuredMentors.length > 0 && (
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <BadgeCheck className="mr-2 h-5 w-5 text-blue-500" />
                  Verified Mentors
                </h2>
                <Button variant="ghost" size="sm" asChild className="gap-1">
                  <Link to="/mentor-space/verified">
                    View all <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredMentors.slice(0, 3).map((mentor) => (
                  <MentorCard key={mentor.id} mentor={mentor} />
                ))}
              </div>
            </section>
          )}
          
          {/* All Mentors Grid */}
          <section>
            <h2 className="text-2xl font-bold mb-6">
              {hasFilters ? 'Search Results' : 'All Mentors'}
              {mentors && <span className="text-muted-foreground font-normal text-lg ml-2">({mentors.length})</span>}
            </h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-64 animate-pulse bg-muted" />
                ))}
              </div>
            ) : mentors && mentors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map((mentor) => (
                  <MentorCard key={mentor.id} mentor={mentor} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No mentors found matching your search criteria.</p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </CardContent>
              </Card>
            )}
          </section>
          
          {/* Why Get a Mentor Section */}
          <section className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">Why Get a Mentor?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Accelerate Growth</h3>
                <p className="text-muted-foreground">
                  Learn from the experiences of those who have already walked your path and achieve your goals faster.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Expert Guidance</h3>
                <p className="text-muted-foreground">
                  Get personalized advice on challenging problems from industry experts with proven success.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Focused Accountability</h3>
                <p className="text-muted-foreground">
                  Transform your ideas into action with structured guidance and consistent accountability.
                </p>
              </motion.div>
            </div>
            
            <div className="text-center mt-12">
              <Button size="lg" onClick={() => navigate(user ? "/mentor-space/sessions" : "/auth/sign-in")}>
                {user ? "Book Your First Session" : "Sign Up and Get Started"}
              </Button>
            </div>
          </section>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
