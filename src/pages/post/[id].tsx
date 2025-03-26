
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import EnhancedPostCard from "@/components/post/EnhancedPostCard";
import PostComments from "@/components/post/PostComments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { usePosts } from "@/hooks/use-posts";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reactToPost } = usePosts();
  
  // Fetch the specific post
  const {
    data: post,
    isLoading,
    error
  } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      if (!id) throw new Error("Post ID is required");
      
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_user_id_fkey(*),
          categories:post_categories(
            category:categories(*)
          )
        `)
        .eq("id", id)
        .single();
        
      if (error) throw error;
      
      // Transform categories
      const categories = data.categories.map((pc: any) => pc.category);
      
      // Check if post has a poll
      const { data: pollData } = await supabase
        .from("polls")
        .select(`
          *,
          options:poll_options(*)
        `)
        .eq("post_id", data.id)
        .maybeSingle();
        
      // Fetch user reaction if logged in
      let userReaction = null;
      if (user) {
        const { data: reactionData } = await supabase
          .from("post_reactions")
          .select("*")
          .eq("post_id", data.id)
          .eq("user_id", user.id)
          .maybeSingle();
          
        userReaction = reactionData;
      }
      
      // If there's a poll, format it properly
      let poll = null;
      if (pollData) {
        // Calculate total votes for each option
        const optionsWithVotes = await Promise.all(
          pollData.options.map(async (option: any) => {
            const { count } = await supabase
              .from("poll_votes")
              .select("*", { count: "exact" })
              .eq("poll_option_id", option.id);
              
            // If user is logged in, check if they voted for this option
            let hasVoted = false;
            if (user) {
              const { data: voteData } = await supabase
                .from("poll_votes")
                .select("*")
                .eq("poll_option_id", option.id)
                .eq("user_id", user.id)
                .single();
                
              hasVoted = !!voteData;
            }
            
            return {
              ...option,
              votes_count: count || 0,
              has_voted: hasVoted
            };
          })
        );
        
        // Calculate total votes
        const totalVotes = optionsWithVotes.reduce(
          (sum, option) => sum + (option.votes_count || 0), 
          0
        );
        
        poll = {
          ...pollData,
          options: optionsWithVotes,
          total_votes: totalVotes
        };
      }
      
      // Increment view count
      await supabase.rpc('increment_view_count', { post_id: id });
      
      return {
        ...data,
        categories,
        userReaction,
        poll,
        isTrending: data.trending_score > 50 // Arbitrary threshold
      };
    },
    enabled: !!id
  });
  
  // Handle post reaction
  const handleReaction = (postId: string, reactionType: string) => {
    reactToPost({ postId, reactionType });
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="space-y-4">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (error || !post) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The post you're looking for doesn't exist or has been removed.
          </p>
          
          <Button onClick={() => navigate("/")}>
            Return to Home
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EnhancedPostCard 
            post={post} 
            onReaction={handleReaction}
          />
          
          <div className="mt-6">
            <PostComments postId={post.id} />
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
