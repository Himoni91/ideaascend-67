
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useXp() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const awardXp = async (amount: number, type: string, referenceId?: string) => {
    if (!user) {
      console.error("User must be logged in to award XP");
      return false;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("award_xp", {
        p_user_id: user.id,
        p_amount: amount,
        p_type: type,
        p_reference_id: referenceId
      });

      if (error) throw error;

      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: ["user-progress", user.id] });
      await queryClient.invalidateQueries({ queryKey: ["xp-transactions", user.id] });
      await queryClient.invalidateQueries({ queryKey: ["leaderboard"] });

      return true;
    } catch (error: any) {
      console.error("Error awarding XP:", error);
      toast.error("Failed to award XP: " + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getXpHistory = async () => {
    if (!user) {
      console.error("User must be logged in to get XP history");
      return [];
    }

    try {
      const { data, error } = await supabase
        .from("xp_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error getting XP history:", error);
      toast.error("Failed to get XP history: " + error.message);
      return [];
    }
  };

  return {
    awardXp,
    getXpHistory,
    isLoading
  };
}
