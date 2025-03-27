
import { useState, useEffect, useCallback } from "react";
import { ProfileType } from "@/types/profile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Post } from "@/types/post";
import EnhancedPostCard from "@/components/post/EnhancedPostCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ProfilePostsProps {
  profile: ProfileType;
}

export default function ProfilePosts({ profile }: ProfilePostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("newest");

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:user_id(
            id, username, full_name, avatar_url, is_verified, position, byline
          ),
          categories:post_categories(
            id,
            category:category_id(id, name, icon, color)
          )
        `)
        .eq('user_id', profile.id);
      
      if (filter === "newest") {
        query = query.order('created_at', { ascending: false });
      } else if (filter === "popular") {
        query = query.order('likes_count', { ascending: false });
      } else if (filter === "discussed") {
        query = query.order('comments_count', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Format post data
      const formattedPosts = data?.map(post => ({
        ...post,
        categories: post.categories?.map((c: any) => c.category) || []
      })) || [];
      
      setPosts(formattedPosts as Post[]);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPosts();
    
    // Set up realtime subscription for post changes
    const channel = supabase
      .channel(`posts-${profile.id}`)
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'posts', filter: `user_id=eq.${profile.id}` },
          (payload) => {
            fetchPosts();
          }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.id, filter]);

  const handleReaction = useCallback(async (postId: string, reactionType: string) => {
    try {
      // Check if user already reacted to this post
      const { data: existingReaction } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', profile.id)
        .single();
      
      if (existingReaction) {
        // If same reaction, remove it (toggle off)
        if (existingReaction.reaction_type === reactionType) {
          await supabase
            .from('post_reactions')
            .delete()
            .eq('id', existingReaction.id);
        } else {
          // If different reaction, update it
          await supabase
            .from('post_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);
        }
      } else {
        // Create new reaction
        await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: profile.id,
            reaction_type: reactionType
          });
      }
      
      // Refetch posts to get updated reaction counts
      fetchPosts();
    } catch (error) {
      console.error("Error handling reaction:", error);
      toast.error("Failed to record reaction");
    }
  }, [profile.id]);
  
  const handlePostUpdated = useCallback((updatedPost: Post) => {
    setPosts(prevPosts => 
      prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
    toast.success("Post updated successfully");
  }, []);
  
  const handlePostDeleted = useCallback((postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    toast.success("Post deleted successfully");
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const getPostsText = () => {
    if (posts.length === 0) {
      return "No posts shared yet";
    }
    return posts.length === 1 ? "1 post" : `${posts.length} posts`;
  };

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

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {getPostsText()}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-3.5 w-3.5" />
              <span>{filter === "newest" ? "Newest" : filter === "popular" ? "Most Liked" : "Most Discussed"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter("newest")}>
              Newest
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("popular")}>
              Most Liked
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("discussed")}>
              Most Discussed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3 className="text-lg font-medium mb-1">No posts yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {profile.id === profile.id 
              ? "Share your thoughts, insights or questions with the community."
              : `${profile.full_name || profile.username} hasn't shared any posts yet.`}
          </p>
        </div>
      ) : (
        <motion.div 
          className="space-y-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {posts.map((post) => (
            <motion.div key={post.id} variants={item}>
              <EnhancedPostCard 
                post={post}
                onReaction={handleReaction}
                onPostUpdated={handlePostUpdated}
                onPostDeleted={handlePostDeleted}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
}
