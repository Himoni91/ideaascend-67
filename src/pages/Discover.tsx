import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Search, Filter, Bookmark, Heart, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscoverContent, DiscoverCategory } from "@/types/discover";
import { useDiscover } from "@/hooks/use-discover";
import AppLayout from "@/components/layout/AppLayout";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export default function Discover() {
  const { user } = useAuth();
  const { fetchDiscoverContent, checkIsFollowing, isLoading, error } = useDiscover();
  
  // Create local state variables to replace missing properties
  const [localFilters, setLocalFilters] = useState({});
  const { data: content, isLoading: isContentLoading } = useQuery({
    queryKey: ['discover-content'],
    queryFn: fetchDiscoverContent
  });
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['discover-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('discover_categories').select('*');
      return data || [];
    }
  });

  // Create handle functions for actions
  const handleLike = async (contentId: string) => {
    // Implementation
  };

  const handleSave = async (contentId: string) => {
    // Implementation
  };

  const handleFollow = async (creatorId: string) => {
    // Implementation
  };
  
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "trending" | "popular">("trending");
  
  // Filter content based on active tab and search term
  const filteredContent = content?.filter((item) => {
    // Filter by content type (tab)
    if (activeTab !== "all" && item.content_type !== activeTab) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory && (!item.tags || !item.tags.includes(selectedCategory))) {
      return false;
    }
    
    return true;
  });
  
  // Sort content
  const sortedContent = filteredContent?.sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === "trending") {
      return (b.trending_score || 0) - (a.trending_score || 0);
    } else {
      return (b.view_count || 0) - (a.view_count || 0);
    }
  });
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSortBy("trending");
  };
  
  // Render content card
  const renderContentCard = (item: DiscoverContent) => {
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Card className="h-full hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={item.profile?.avatar_url || undefined} />
                  <AvatarFallback>{item.profile?.full_name?.charAt(0) || item.profile?.username?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{item.profile?.full_name || item.profile?.username}</span>
                    {item.profile?.is_verified && (
                      <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleFollow(item.profile?.id || "")}
              >
                <span className="sr-only">Follow</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
            <CardDescription className="line-clamp-2">{item.description}</CardDescription>
            
            {item.image_url && (
              <div className="mt-3 rounded-md overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {item.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{item.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 flex justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => handleLike(item.id)}
              >
                <Heart className={`h-4 w-4 mr-1 ${item.user_has_liked ? "fill-red-500 text-red-500" : ""}`} />
                <span>{item.likes_count || 0}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => handleSave(item.id)}
              >
                <Bookmark className={`h-4 w-4 mr-1 ${item.user_has_saved ? "fill-current" : ""}`} />
                <span>Save</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => window.location.href = `/discover/${item.id}`}
            >
              View
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };
  
  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Discover</h1>
            <p className="text-muted-foreground">Explore content from the community</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
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
                  <span className="sr-only">Clear</span>
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
        </div>
        
        {showFilters && (
          <div className="mb-6 p-4 border rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-medium">Filters</h2>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset filters
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Categories</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories?.map((category: DiscoverCategory) => (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Sort by</label>
                <div className="flex gap-2 mt-2">
                  <Badge
                    variant={sortBy === "trending" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSortBy("trending")}
                  >
                    Trending
                  </Badge>
                  <Badge
                    variant={sortBy === "latest" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSortBy("latest")}
                  >
                    Latest
                  </Badge>
                  <Badge
                    variant={sortBy === "popular" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSortBy("popular")}
                  >
                    Popular
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="article">Articles</TabsTrigger>
            <TabsTrigger value="event">Events</TabsTrigger>
            <TabsTrigger value="resource">Resources</TabsTrigger>
            <TabsTrigger value="question">Questions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {isContentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16 mt-1" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <Skeleton className="h-48 w-full rounded-md" />
                    </CardContent>
                    <CardFooter className="pt-2">
                      <div className="flex justify-between w-full">
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500">Error loading content. Please try again.</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </div>
            ) : sortedContent && sortedContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content && content.map((item) => renderContentCard(item))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No content found matching your filters.</p>
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="article" className="mt-0">
            {/* Same content as "all" tab but filtered for articles */}
            {isContentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16 mt-1" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <Skeleton className="h-48 w-full rounded-md" />
                    </CardContent>
                    <CardFooter className="pt-2">
                      <div className="flex justify-between w-full">
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : sortedContent && sortedContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedContent.map((item) => renderContentCard(item))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No articles found matching your filters.</p>
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="event" className="mt-0">
            {/* Event content */}
            {isContentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16 mt-1" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <Skeleton className="h-48 w-full rounded-md" />
                    </CardContent>
                    <CardFooter className="pt-2">
                      <div className="flex justify-between w-full">
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : sortedContent && sortedContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedContent.map((item) => renderContentCard(item))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No events found matching your filters.</p>
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="resource" className="mt-0">
            {/* Resource content */}
            {isContentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16 mt-1" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <Skeleton className="h-48 w-full rounded-md" />
                    </CardContent>
                    <CardFooter className="pt-2">
                      <div className="flex justify-between w-full">
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : sortedContent && sortedContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedContent.map((item) => renderContentCard(item))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No resources found matching your filters.</p>
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="question" className="mt-0">
            {/* Question content */}
            {isContentLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16 mt-1" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <Skeleton className="h-48 w-full rounded-md" />
                    </CardContent>
                    <CardFooter className="pt-2">
                      <div className="flex justify-between w-full">
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : sortedContent && sortedContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedContent.map((item) => renderContentCard(item))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No questions found matching your filters.</p>
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
