
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useFollow() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if the current user is following another user
  const { data: followedUsers, isLoading: isFollowedLoading } = useQuery({
    queryKey: ["followed-users", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (error) throw error;
      return data.map(item => item.following_id);
    },
    enabled: !!user,
  });

  // Function to check if the current user is following a specific user
  const isFollowing = (userId: string): boolean => {
    if (!followedUsers) return false;
    return followedUsers.includes(userId);
  };

  // Follow a user
  const followUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error("You must be logged in to follow users");
      if (user.id === userId) throw new Error("You cannot follow yourself");

      const { error } = await supabase
        .from("user_follows")
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) throw error;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["followed-users", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["following-count", userId] });
      queryClient.invalidateQueries({ queryKey: ["followers-count", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("User followed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to follow user");
    }
  });

  // Unfollow a user
  const unfollowUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error("You must be logged in to unfollow users");

      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userId);

      if (error) throw error;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["followed-users", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["following-count", userId] });
      queryClient.invalidateQueries({ queryKey: ["followers-count", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("User unfollowed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unfollow user");
    }
  });

  return {
    isFollowing,
    isFollowedLoading,
    followUser: followUserMutation.mutate,
    unfollowUser: unfollowUserMutation.mutate,
    followedUsers,
    isLoading: followUserMutation.isPending || unfollowUserMutation.isPending || isFollowedLoading
  };
}
