
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DiscoverFilter } from "@/components/discover/DiscoverFilter";
import { DiscoverCard } from "@/components/discover/DiscoverCard";
import { PeopleCard } from "@/components/discover/PeopleCard";
import { IdeasCard } from "@/components/discover/IdeasCard";
import { ContentCard } from "@/components/discover/ContentCard";
import { EventCard } from "@/components/discover/EventCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/layout/AppLayout";
import { Users, Lightbulb, BookOpen, Calendar } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useDiscover, DiscoverContent } from "@/hooks/use-discover";

export default function Discover() {
  const {
    filters,
    setFilters,
    useDiscoverContent,
    useDiscoverCategories,
    toggleLike,
    toggleSave,
    toggleFollow
  } = useDiscover();
  const { user } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Fetch discover content and categories
  const { data: content = [], isLoading: isContentLoading } = useDiscoverContent();
  const { data: categories = [], isLoading: isCategoriesLoading } = useDiscoverCategories();
  
  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, [setFilters]);
  
  // Handle content type changes
  const handleContentTypeChange = useCallback((type: "people" | "ideas" | "content" | "events") => {
    setFilters(prev => ({ ...prev, contentType: type }));
  }, [setFilters]);
  
  // Handle interactions
  const handleLike = useCallback((content: DiscoverContent) => {
    if (!user) {
      toast.error("Please sign in to like content");
      return;
    }
    
    toggleLike.mutate({
      contentId: content.id,
      isLiked: !!content.user_has_liked
    });
  }, [user, toggleLike]);
  
  const handleSave = useCallback((content: DiscoverContent) => {
    if (!user) {
      toast.error("Please sign in to save content");
      return;
    }
    
    toggleSave.mutate({
      contentId: content.id,
      isSaved: !!content.user_has_saved
    });
  }, [user, toggleSave]);
  
  const handleFollow = useCallback((content: DiscoverContent) => {
    if (!user) {
      toast.error("Please sign in to follow users");
      return;
    }
    
    toggleFollow.mutate({
      contentId: content.id,
      createdBy: content.created_by,
      isFollowing: false // This should be dynamic based on user's follow status
    });
  }, [user, toggleFollow]);
  
  // Render content based on type
  const renderContent = useCallback((content: DiscoverContent) => {
    switch (content.content_type) {
      case "people":
        return (
          <PeopleCard 
            key={content.id} 
            content={content}
            onFollow={handleFollow}
          />
        );
      case "ideas":
        return (
          <IdeasCard 
            key={content.id} 
            content={content}
            onVote={(content, isUpvote) => {
              handleLike(content);
            }}
          />
        );
      case "content":
        return (
          <ContentCard 
            key={content.id} 
            content={content}
          />
        );
      case "events":
        return (
          <EventCard 
            key={content.id} 
            content={content}
            onRsvp={handleSave}
          />
        );
      default:
        return (
          <DiscoverCard 
            key={content.id} 
            content={content}
            onLike={handleLike}
            onSave={handleSave}
          />
        );
    }
  }, [handleLike, handleSave, handleFollow]);
  
  // Loading skeletons
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4">
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
        
        <DiscoverFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
          categories={categories}
          contentType={filters.contentType}
          onContentTypeChange={handleContentTypeChange}
        />
        
        <Tabs 
          defaultValue={filters.contentType || "people"} 
          value={filters.contentType || "people"}
          onValueChange={(value) => handleContentTypeChange(value as any)}
          className="mt-8"
        >
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
          
          {Object.entries({
            people: "Connect with entrepreneurs, mentors, and industry experts.",
            ideas: "Explore and validate innovative startup ideas.",
            content: "Discover articles, podcasts, and resources.",
            events: "Find relevant events and networking opportunities."
          }).map(([type, description]) => (
            <TabsContent key={type} value={type} className="mt-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <p className="text-muted-foreground">{description}</p>
                </div>
                
                {isContentLoading || isCategoriesLoading ? (
                  renderSkeletons()
                ) : content.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {content
                      .filter(item => !filters.contentType || item.content_type === filters.contentType)
                      .map(renderContent)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">No content found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or check back later.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => setFilters({
                        contentType: filters.contentType,
                        searchTerm: "",
                        tags: undefined,
                        category: undefined,
                        sortBy: "latest",
                        featured: false
                      })}
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
