import { useState, useEffect, useRef, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/use-posts";
import { useCategories } from "@/hooks/use-categories";
import { FeedFilter, ReactionTypeString } from "@/types/post";
import { useInView } from "framer-motion";

// Components
import FeedTabs from "@/components/post/FeedTabs";
import CreatePostCard from "@/components/post/CreatePostCard";
import EnhancedPostCard from "@/components/post/EnhancedPostCard";
import PostComments from "@/components/post/PostComments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Index() {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const categoryParam = searchParams.get("category") || "All";
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  
  const filterParam = searchParams.get("filter") as FeedFilter || "all";
  const [activeFilter, setActiveFilter] = useState<FeedFilter>(filterParam);
  
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const { categories } = useCategories();
  const loaderRef = useRef<HTMLDivElement>(null);
  const isLoaderInView = useInView(loaderRef);
  
  const {
    posts,
    isLoading,
    hasMore,
    loadMore,
    reactToPost,
    repostPost
  } = usePosts(
    activeCategory === "All" ? undefined : activeCategory,
    activeFilter
  );

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

  useEffect(() => {
    if (isLoaderInView && hasMore && !isLoading) {
      loadMore();
    }
  }, [isLoaderInView, hasMore, loadMore, isLoading]);

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-0">
        <motion.div 
          className="mb-8"
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
                My Followings
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
          <FeedTabs
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
                      delay: Math.min(0.1 * index, 0.5) 
                    }}
                  >
                    <EnhancedPostCard
                      post={post}
                      onClickComment={() => handleCommentClick(post.id)}
                      onReaction={handleReaction}
                      onRepost={handleRepost}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {hasMore && (
                <div 
                  ref={loaderRef} 
                  className="flex justify-center py-8"
                >
                  <Button 
                    variant="outline" 
                    onClick={loadMore} 
                    disabled={isLoading}
                    className="relative overflow-hidden"
                  >
                    {isLoading ? (
                      <>
                        <span className="opacity-0">Load More</span>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
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
                {activeFilter === "following" 
                  ? "No posts from people you follow. Start following more people!" 
                  : activeFilter === "trending"
                    ? "No trending posts in this category right now."
                    : "No posts found in this category."}
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

      <Dialog open={!!expandedPost} onOpenChange={(open) => !open && setExpandedPost(null)}>
        <DialogContent className="max-w-xl">
          {expandedPost && (
            <>
              {posts.find(p => p.id === expandedPost) && (
                <EnhancedPostCard 
                  post={posts.find(p => p.id === expandedPost)!} 
                  onReaction={handleReaction}
                  onRepost={handleRepost}
                />
              )}
              
              <PostComments postId={expandedPost} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
