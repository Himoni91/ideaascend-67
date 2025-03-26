
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useFollow() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  // Fetch who the current user is following
  const { isLoading: isLoadingFollowing } = useQuery({
    queryKey: ["following", user?.id],
    queryFn: async () => {
      if (!user) return { data: [] };
      
      const { data, error } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", user.id);
        
      if (error) throw error;
      
      const ids = data.map(follow => follow.following_id);
      setFollowingIds(ids);
      
      return { data: ids };
    },
    enabled: !!user,
  });

  // Follow a user
  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error("You must be logged in to follow users");
      
      // Check if already following this user
      if (followingIds.includes(userId)) {
        throw new Error("You are already following this user");
      }
      
      const { data, error } = await supabase
        .from("user_follows")
        .insert({
          follower_id: user.id,
          following_id: userId
        })
        .select()
        .single();
        
      if (error) {
        // If it's a duplicate key error, handle it gracefully
        if (error.code === '23505') {
          // This is redundant with our check above, but serves as a fallback
          return { 
            follower_id: user.id, 
            following_id: userId,
            alreadyFollowing: true
          };
        }
        throw error;
      }
      
      return data;
    },
    onSuccess: (data, userId) => {
      // Only update state if not already following
      if (!data.alreadyFollowing && !followingIds.includes(userId)) {
        setFollowingIds(prev => [...prev, userId]);
        queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        toast.success("User followed successfully");
      } else if (data.alreadyFollowing) {
        toast.info("You are already following this user");
      }
    },
    onError: (error: any) => {
      // If the error indicates already following, show a friendly message
      if (error.message === "You are already following this user") {
        toast.info(error.message);
      } else {
        toast.error(`Failed to follow: ${error.message}`);
      }
    }
  });

  // Unfollow a user
  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error("You must be logged in to unfollow users");
      
      const { error } = await supabase
        .from("user_follows")
        .delete()
        .match({
          follower_id: user.id,
          following_id: userId
        });
        
      if (error) throw error;
      return { userId };
    },
    onSuccess: (_, userId) => {
      setFollowingIds(prev => prev.filter(id => id !== userId));
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("User unfollowed successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to unfollow: ${error.message}`);
    }
  });

  const followUser = useCallback((userId: string) => {
    if (userId === user?.id) {
      toast.error("You cannot follow yourself");
      return;
    }
    followMutation.mutate(userId);
  }, [followMutation, user?.id]);

  const unfollowUser = useCallback((userId: string) => {
    unfollowMutation.mutate(userId);
  }, [unfollowMutation]);

  const isFollowing = useCallback((userId: string) => {
    return followingIds.includes(userId);
  }, [followingIds]);

  return {
    followUser,
    unfollowUser,
    isFollowing,
    followingIds,
    isLoading: isLoadingFollowing || followMutation.isPending || unfollowMutation.isPending
  };
}
