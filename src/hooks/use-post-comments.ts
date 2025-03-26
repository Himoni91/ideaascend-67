
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PostComment } from "@/types/post";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function usePostComments(postId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Query to fetch comments for a post
  const {
    data: comments,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["post-comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post_comments")
        .select(`
          *,
          user:profiles(*)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
        
      if (error) throw error;
      
      // Organize comments into a thread structure
      const commentMap = new Map<string, PostComment>();
      const topLevelComments: PostComment[] = [];
      
      data.forEach((comment: any) => {
        const processedComment = { 
          ...comment, 
          user: comment.user,
          replies: [] 
        };
        
        commentMap.set(comment.id, processedComment);
        
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(processedComment);
          } else {
            // Fallback if parent isn't found (shouldn't happen with proper data)
            topLevelComments.push(processedComment);
          }
        } else {
          topLevelComments.push(processedComment);
        }
      });
      
      return topLevelComments;
    },
    enabled: !!postId
  });

  // Set up realtime subscription for comment changes
  useState(() => {
    const channel = supabase
      .channel(`post-comments-${postId}`)
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'post_comments', filter: `post_id=eq.${postId}` },
          () => {
            // Refetch comments when there are changes
            refetch();
          }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  });

  // Mutation to add a comment
  const addComment = useMutation({
    mutationFn: async ({ content, parentId = null }: { content: string; parentId?: string | null }) => {
      if (!user) throw new Error("You must be logged in to comment");
      
      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
          parent_id: parentId
        })
        .select(`
          *,
          user:profiles(*)
        `)
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      toast.success(replyingTo ? "Reply added!" : "Comment added!");
      setReplyingTo(null); // Reset replying state
    },
    onError: (error: any) => {
      toast.error(`Failed to add comment: ${error.message}`);
    }
  });

  // Mutation to delete a comment
  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("You must be logged in to delete a comment");
      
      const { error } = await supabase
        .from("post_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id); // Ensure user can only delete their own comments
        
      if (error) throw error;
      return commentId;
    },
    onSuccess: () => {
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      toast.success("Comment deleted");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete comment: ${error.message}`);
    }
  });

  return {
    comments: comments || [],
    isLoading,
    error,
    addComment: addComment.mutate,
    deleteComment: deleteComment.mutate,
    replyingTo,
    setReplyingTo
  };
}
