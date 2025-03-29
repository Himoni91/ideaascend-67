
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Filter, Users, User, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMentor } from "@/hooks/use-mentor";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";
import MentorFilter from "@/components/mentor/MentorFilter";
import MentorCard from "@/components/mentor/MentorCard";
import { ProfileType } from "@/types/profile";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Define specialties as strings instead of enum
const featuredSpecialties: string[] = [
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

const MentorSpacePage = () => {
  const { user } = useAuth();
  const { useMentors } = useMentor();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    specialties: [] as string[],
    priceRange: [0, 500] as [number, number],
    rating: 0,
  });
  
  const { data: mentors, isLoading } = useMentors({
    specialties: selectedFilters.specialties,
    priceRange: selectedFilters.priceRange,
    rating: selectedFilters.rating,
    searchTerm: searchTerm,
  });
  
  const handleFilterChange = (filters: any) => {
    setSelectedFilters(filters);
  };
  
  const handleSpecialtyClick = (specialty: string) => {
    setSelectedFilters(prev => {
      const specialties = prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty];
      
      return { ...prev, specialties };
    });
  };
  
  const resetFilters = () => {
    setSelectedFilters({
      specialties: [],
      priceRange: [0, 500],
      rating: 0,
    });
    setSearchTerm("");
  };
  
  const filteredMentors = mentors?.filter(mentor => {
    if (searchTerm && !mentor.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  }) || [];
  
  return (
    <AppLayout>
      <Helmet>
        <title>Find a Mentor | Idolyst</title>
      </Helmet>
      
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold">MentorSpace</h1>
              <p className="text-muted-foreground">Find the perfect mentor to guide your journey</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search mentors..."
                  className="pl-9 w-full md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </Button>
                )}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
          
          {user?.is_mentor ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mb-8"
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Mentor Dashboard</h3>
                      <p className="text-muted-foreground">Manage your mentorship activities and see your impact</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" asChild>
                        <a href="/mentor-space/settings">
                          <User className="mr-2 h-4 w-4" />
                          Mentor Profile
                        </a>
                      </Button>
                      <Button asChild>
                        <a href="/mentor-space/sessions">
                          <Users className="mr-2 h-4 w-4" />
                          Manage Sessions
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mb-8"
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Become a Mentor</h3>
                      <p className="text-muted-foreground">Share your expertise and help others succeed</p>
                    </div>
                    <Button asChild>
                      <a href="/mentor-space/apply">Become a Mentor</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Featured Specialties */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-lg font-semibold mb-4">Popular Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {featuredSpecialties.map((specialty) => (
                <Badge
                  key={specialty}
                  variant={selectedFilters.specialties.includes(specialty) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleSpecialtyClick(specialty)}
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          </motion.div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Advanced Filters</CardTitle>
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Reset all filters
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <MentorFilter
                    filters={selectedFilters}
                    onChange={handleFilterChange}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Mentor Listing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {isLoading ? "Loading mentors..." : `${filteredMentors.length} Mentors Available`}
              </h2>
              <div className="flex items-center gap-2">
                {selectedFilters.specialties.length > 0 && (
                  <span className="text-sm">
                    Filters: {selectedFilters.specialties.length}
                  </span>
                )}
              </div>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-64 animate-pulse">
                    <div className="h-full bg-muted/20"></div>
                  </Card>
                ))}
              </div>
            ) : filteredMentors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map((mentor) => (
                  <MentorCard key={mentor.id} mentor={mentor} />
                ))}
              </div>
            ) : (
              <Card className="py-12">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">No mentors found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default MentorSpacePage;
