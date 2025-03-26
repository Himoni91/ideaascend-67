
import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/use-posts";
import { useCategories } from "@/hooks/use-categories";
import { FeedFilter } from "@/types/post";
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

export default function Index() {
  const { user, profile } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("all");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const { categories } = useCategories();
  const loaderRef = useRef<HTMLDivElement>(null);
  const isLoaderInView = useInView(loaderRef);
  
  // Get posts with the active category and filter
  const {
    posts,
    isLoading,
    hasMore,
    loadMore
  } = usePosts(
    activeCategory === "All" ? undefined : activeCategory,
    activeFilter
  );

  // Load more posts when the loader comes into view
  useEffect(() => {
    if (isLoaderInView && hasMore) {
      loadMore();
    }
  }, [isLoaderInView, hasMore, loadMore]);

  // Handle changes to the active filter
  const handleFilterChange = (filter: FeedFilter) => {
    setActiveFilter(filter);
  };

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-idolyst-blue to-idolyst-indigo bg-clip-text text-transparent">
            {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover insights, connect with mentors, and stay updated on the startup ecosystem
          </p>
        </div>

        {/* Create Post Card */}
        {user && <CreatePostCard />}

        {/* Feed Filters */}
        <Tabs value={activeFilter} onValueChange={handleFilterChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="following">
              My Followings
            </TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Category Tabs */}
        <FeedTabs
          categories={categories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />

        {/* Post List */}
        <div className="space-y-4">
          {isLoading && posts.length === 0 ? (
            // Loading placeholders
            Array.from({ length: 3 }).map((_, i) => (
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
            ))
          ) : posts.length > 0 ? (
            <>
              {posts.map((post) => (
                <EnhancedPostCard
                  key={post.id}
                  post={post}
                  onClickComment={() => setExpandedPost(post.id)}
                />
              ))}
              
              {/* Infinite scroll loader */}
              {hasMore && (
                <div 
                  ref={loaderRef} 
                  className="flex justify-center py-8"
                >
                  <Button 
                    variant="outline" 
                    onClick={loadMore} 
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {activeFilter === "following" 
                  ? "No posts from people you follow. Start following more people!" 
                  : activeFilter === "trending"
                    ? "No trending posts in this category right now."
                    : "No posts found in this category."}
              </p>
              
              {activeFilter === "following" && user && (
                <Button onClick={() => setActiveFilter("all")}>
                  Browse All Posts
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comments Dialog */}
      <Dialog open={!!expandedPost} onOpenChange={(open) => !open && setExpandedPost(null)}>
        <DialogContent className="max-w-xl">
          {expandedPost && (
            <>
              {/* Find and display the post */}
              {posts.find(p => p.id === expandedPost) && (
                <EnhancedPostCard post={posts.find(p => p.id === expandedPost)!} />
              )}
              
              {/* Comments for the post */}
              <PostComments postId={expandedPost} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
