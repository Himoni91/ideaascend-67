
import { useState } from "react";
import {
  Rocket,
  Plus,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  ArrowUp,
  Search,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PitchCategory } from "@/types/pitch";
import { usePitches } from "@/hooks/use-pitches";
import { useAuth } from "@/contexts/AuthContext";
import PitchCard from "@/components/pitch/PitchCard";
import PitchLeaderboard from "@/components/pitch/PitchLeaderboard";
import MultiStepPitchForm from "@/components/pitch/MultiStepPitchForm";
import { useIsMobile } from "@/hooks/use-mobile";

const PITCH_CATEGORIES: PitchCategory[] = [
  'AI',
  'Fintech',
  'Health',
  'Education',
  'E-commerce',
  'SaaS',
  'Mobile App',
  'Social Media',
  'Blockchain',
  'Gaming',
  'Environment',
  'Other'
];

export default function PitchHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<'newest' | 'trending' | 'votes'>('newest');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();
  
  const { 
    pitches, 
    isLoading, 
    loadMore, 
    hasMore,
    createPitch,
    votePitch,
    useTopPitches
  } = usePitches(
    selectedCategory === "All" ? undefined : selectedCategory,
    sortBy
  );
  
  const { data: topPitches, isLoading: isTopPitchesLoading } = useTopPitches('week', 5);
  
  const handleSubmitPitch = (data: any) => {
    if (!user) {
      navigate("/auth/sign-in");
      return;
    }
    
    setIsSubmitting(true);
    
    createPitch(data, {
      onSuccess: () => {
        setIsSubmitDialogOpen(false);
        setIsSubmitting(false);
      },
      onError: () => {
        setIsSubmitting(false);
      }
    });
  };
  
  const getSortIcon = () => {
    switch (sortBy) {
      case 'newest': return <Clock className="h-4 w-4" />;
      case 'trending': return <TrendingUp className="h-4 w-4" />;
      case 'votes': return <ArrowUp className="h-4 w-4" />;
    }
  };
  
  const filteredPitches = searchQuery.trim() === ""
    ? pitches
    : pitches.filter(pitch => 
        pitch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pitch.problem_statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pitch.solution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pitch.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="mb-6 md:flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-idolyst-blue to-idolyst-indigo">
              PitchHub
            </h1>
            <p className="text-muted-foreground mt-1 md:max-w-xl">
              Submit your startup ideas, get feedback from the community, and connect with potential mentors and co-founders
            </p>
          </div>
          
          <Button 
            size="lg"
            className="hidden md:flex mt-4 md:mt-0"
            onClick={() => setIsSubmitDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Submit Your Idea
          </Button>
        </div>
        
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search ideas..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
                
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full sm:w-[180px] shrink-0">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {PITCH_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-wrap justify-between items-center gap-2">
                <Tabs 
                  defaultValue="newest" 
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as 'newest' | 'trending' | 'votes')}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                    <TabsTrigger value="newest" className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Newest</span>
                    </TabsTrigger>
                    <TabsTrigger value="trending" className="flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Trending</span>
                    </TabsTrigger>
                    <TabsTrigger value="votes" className="flex items-center gap-1">
                      <ArrowUp className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Top Voted</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {searchQuery && (
                  <div className="w-full sm:w-auto flex items-center">
                    <Badge variant="outline" className="gap-1">
                      <span>Search:</span>
                      <span className="font-semibold">{searchQuery}</span>
                      <button onClick={() => setSearchQuery("")}>
                        <X className="h-3 w-3 ml-1" />
                      </button>
                    </Badge>
                  </div>
                )}
                
                {selectedCategory !== "All" && (
                  <div className="w-full sm:w-auto flex items-center">
                    <Badge variant="outline" className="gap-1">
                      <span>Category:</span>
                      <span className="font-semibold">{selectedCategory}</span>
                      <button onClick={() => setSelectedCategory("All")}>
                        <X className="h-3 w-3 ml-1" />
                      </button>
                    </Badge>
                  </div>
                )}
                
                {filteredPitches.length > 0 && (
                  <div className="text-sm text-muted-foreground ml-auto">
                    {filteredPitches.length} {filteredPitches.length === 1 ? 'idea' : 'ideas'}
                  </div>
                )}
              </div>
            </div>
            
            <AnimatePresence>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-[300px]">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredPitches.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-background border rounded-lg p-8 text-center"
                >
                  <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No ideas found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {searchQuery.trim() !== "" || selectedCategory !== "All"
                      ? "Try adjusting your filters or search query."
                      : "Be the first to submit your startup idea!"}
                  </p>
                  <Button onClick={() => setIsSubmitDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Submit Your Idea
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {filteredPitches.map((pitch) => (
                    <motion.div
                      key={pitch.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PitchCard 
                        pitch={pitch} 
                        onVote={(voteType) => votePitch({ pitchId: pitch.id, voteType })}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            {!isLoading && hasMore && (
              <div className="mt-8 text-center">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  className="min-w-[200px]"
                >
                  Load More Ideas
                </Button>
              </div>
            )}
          </div>
          
          <div>
            <div className="mt-8 lg:mt-0 space-y-6">
              <div className="lg:sticky lg:top-6">
                <PitchLeaderboard
                  pitches={topPitches || []}
                  isLoading={isTopPitchesLoading}
                  title="Top Ideas This Week"
                  subtitle="The most popular startup ideas right now"
                />
                
                <div className="mt-6 bg-muted/40 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-3">
                    Have a Startup Idea?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Submit your idea to get feedback from mentors and the community.
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => setIsSubmitDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Submit Your Idea
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Submit Button */}
      <div className="fixed right-4 bottom-20 md:hidden z-50">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsSubmitDialogOpen(true)}
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Submit Idea</span>
        </Button>
      </div>
      
      {/* Submit Idea Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className={`${isMobile ? 'w-[calc(100%-32px)] p-4' : 'sm:max-w-xl'} max-h-[calc(100vh-40px)] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle>Submit Your Startup Idea</DialogTitle>
            <DialogDescription>
              Share your innovative idea with the community and get valuable feedback.
            </DialogDescription>
          </DialogHeader>
          
          <MultiStepPitchForm
            onSubmit={handleSubmitPitch}
            isSubmitting={isSubmitting}
            onCancel={() => setIsSubmitDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
