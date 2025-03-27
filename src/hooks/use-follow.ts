
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useFollow(targetUserId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if current user is following the target user
  const { data: followStatus, isLoading: isFollowCheckLoading } = useQuery({
    queryKey: ["follow-status", user?.id, targetUserId],
    queryFn: async () => {
      if (!user?.id || !targetUserId) return false;
      
      const { data, error } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .single();
        
      if (error && error.code !== "PGRST116") { // PGRST116 is expected when no row is found
        console.error("Error checking follow status:", error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!(user?.id && targetUserId && user.id !== targetUserId),
  });
  
  // Follow a user
  const followUser = async (userIdToFollow: string) => {
    if (!user) {
      toast.error("You must be logged in to follow users");
      return;
    }
    
    if (user.id === userIdToFollow) {
      toast.error("You cannot follow yourself");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if already following
      const { data: existingFollow } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", userIdToFollow)
        .single();
        
      if (existingFollow) {
        toast.info("You are already following this user");
        return;
      }
      
      // Insert new follow relationship
      const { error } = await supabase
        .from("user_follows")
        .insert({
          follower_id: user.id,
          following_id: userIdToFollow
        });
        
      if (error) throw error;
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["follow-status", user.id, userIdToFollow] });
      queryClient.invalidateQueries({ queryKey: ["followers-count", userIdToFollow] });
      queryClient.invalidateQueries({ queryKey: ["following-count", user.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", userIdToFollow] });
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      
      toast.success("You are now following this user");
    } catch (error: any) {
      console.error("Error following user:", error);
      toast.error(`Failed to follow user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Unfollow a user
  const unfollowUser = async (userIdToUnfollow: string) => {
    if (!user) {
      toast.error("You must be logged in to unfollow users");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userIdToUnfollow);
        
      if (error) throw error;
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["follow-status", user.id, userIdToUnfollow] });
      queryClient.invalidateQueries({ queryKey: ["followers-count", userIdToUnfollow] });
      queryClient.invalidateQueries({ queryKey: ["following-count", user.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", userIdToUnfollow] });
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      
      toast.success("You have unfollowed this user");
    } catch (error: any) {
      console.error("Error unfollowing user:", error);
      toast.error(`Failed to unfollow user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to check if a user is being followed
  const isFollowing = (userId: string): boolean => {
    if (!user) return false;
    // If we're checking the specific targetUserId that was passed to the hook
    if (targetUserId === userId) {
      return !!followStatus;
    }
    // For other user IDs, we need to manually check
    // This would trigger a new query, so use with caution
    return false;
  };
  
  return {
    isFollowing,
    isFollowingStatus: !!followStatus,
    isLoading: isLoading || isFollowCheckLoading,
    followUser,
    unfollowUser
  };
}
