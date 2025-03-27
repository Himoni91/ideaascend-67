
import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/use-posts";
import { useCategories } from "@/hooks/use-categories";
import { FeedFilter, Post } from "@/types/post";
import { supabase } from "@/integrations/supabase/client";

// Components
import CategoryFilter from "@/components/post/CategoryFilter";
import CreatePostCard from "@/components/post/CreatePostCard";
import EnhancedPostCard from "@/components/post/EnhancedPostCard";
import PostSearch from "@/components/post/PostSearch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpIcon, MessageSquareIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

export default function Index() {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get category from URL or default to "All"
  const categoryParam = searchParams.get("category") || "All";
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  
  // Get feed filter from URL or default to "all"
  const filterParam = searchParams.get("filter") as FeedFilter || "all";
  const [activeFilter, setActiveFilter] = useState<FeedFilter>(filterParam);
  
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const { categories } = useCategories();
  
  const {
    posts,
    isLoading,
    hasMore,
    loadMore,
    reactToPost,
    repostPost,
    refetch,
    updatePost,
    deletePost
  } = usePosts(
    activeCategory === "All" ? undefined : activeCategory,
    activeFilter
  );

  // Set up infinite scroll
  const { setRef, isIntersecting } = useInfiniteScroll({
    threshold: 0.5,
    rootMargin: '200px',
    enabled: hasMore && !isLoading
  });

  // Update URL when category or filter changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (activeCategory !== "All") {
      params.set("category", activeCategory);
    } else {
      params.delete("category");
    }
    
    if (activeFilter !== "all") {
      params.set("filter", activeFilter);
    } else {
      params.delete("filter");
    }
    
    setSearchParams(params, { replace: true });
  }, [activeCategory, activeFilter, searchParams, setSearchParams]);

  // Load more posts when infinite scroll triggers
  useEffect(() => {
    if (isIntersecting && hasMore && !isLoading) {
      loadMore();
    }
  }, [isIntersecting, hasMore, loadMore, isLoading]);

  // Set up real-time subscription for new posts
  useEffect(() => {
    const channel = supabase
      .channel('posts-changes')
      .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'posts' },
          () => {
            toast.info("New posts available!", {
              action: {
                label: "Refresh",
                onClick: () => refetch()
              }
            });
          }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleFilterChange = useCallback((filter: FeedFilter) => {
    setActiveFilter(filter);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCommentClick = useCallback((postId: string) => {
    setExpandedPost(postId);
  }, []);

  const handleReaction = useCallback((postId: string, reactionType: string) => {
    reactToPost({ postId, reactionType });
  }, [reactToPost]);

  const handleRepost = useCallback((postId: string) => {
    repostPost(postId);
  }, [repostPost]);
  
  const handlePostUpdated = useCallback((updatedPost: Post) => {
    updatePost(updatedPost);
    toast.success("Post updated successfully");
  }, [updatePost]);
  
  const handlePostDeleted = useCallback((postId: string) => {
    deletePost(postId);
    toast.success("Post deleted successfully");
  }, [deletePost]);

  const handleRefresh = useCallback(() => {
    refetch();
    toast.success("Feed refreshed!");
  }, [refetch]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Show scroll to top button when scrolled down
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Empty state messages based on filter
  const getEmptyStateMessage = () => {
    if (activeFilter === "following") {
      return "No posts from people you follow. Start following more people!";
    } else if (activeFilter === "trending") {
      return "No trending posts in this category right now.";
    } else {
      return "No posts found in this category.";
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-0">
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-idolyst-blue to-idolyst-indigo bg-clip-text text-transparent">
            {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover insights, connect with mentors, and stay updated on the startup ecosystem
          </p>
        </motion.div>

        {/* Search component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <PostSearch />
        </motion.div>

        {/* Refresh button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-end mb-4"
        >
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCwIcon className="h-4 w-4" />
            Refresh
          </Button>
        </motion.div>

        <AnimatePresence>
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <CreatePostCard />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Tabs value={activeFilter} onValueChange={handleFilterChange as any} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="following">
                My Network
              </TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onChange={handleCategoryChange}
          />
        </motion.div>

        <div className="space-y-4">
          {isLoading && posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl p-4 space-y-4 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-40 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : posts.length > 0 ? (
            <>
              <AnimatePresence>
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: Math.min(0.05 * index, 0.3) 
                    }}
                  >
                    <EnhancedPostCard
                      post={post}
                      onClickComment={() => handleCommentClick(post.id)}
                      onReaction={handleReaction}
                      onRepost={handleRepost}
                      onPostUpdated={handlePostUpdated}
                      onPostDeleted={handlePostDeleted}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Infinite scroll loader */}
              {hasMore && (
                <div 
                  ref={setRef} 
                  className="flex justify-center py-4"
                >
                  {isLoading && (
                    <div className="flex flex-col items-center">
                      <RefreshCwIcon className="h-6 w-6 animate-spin text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Loading more posts...</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center py-10"
            >
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {getEmptyStateMessage()}
              </p>
              
              {activeFilter === "following" && user && (
                <Button 
                  onClick={() => handleFilterChange("all")}
                  className="animate-pulse"
                >
                  Browse All Posts
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Expanded post dialog */}
      <Dialog open={!!expandedPost} onOpenChange={(open) => !open && setExpandedPost(null)}>
        <DialogContent className="max-w-xl">
          {expandedPost && (
            posts.find(p => p.id === expandedPost) && (
              <>
                <EnhancedPostCard 
                  post={posts.find(p => p.id === expandedPost)!} 
                  onReaction={handleReaction}
                  onRepost={handleRepost}
                  onPostUpdated={handlePostUpdated}
                  onPostDeleted={postId => {
                    handlePostDeleted(postId);
                    setExpandedPost(null);
                  }}
                />
                
                <div className="mt-4">
                  <h3 className="font-medium mb-3">Comments</h3>
                  <div className="rounded-lg border p-4">
                    {/* Add the PostComments component here */}
                  </div>
                </div>
              </>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            className="fixed bottom-20 right-4 z-30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="icon"
              className="rounded-full h-10 w-10 shadow-md bg-idolyst-blue text-white hover:bg-idolyst-blue/90"
              onClick={scrollToTop}
              aria-label="Scroll to top"
            >
              <ArrowUpIcon className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
