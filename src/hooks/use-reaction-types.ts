
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReactionType } from "@/types/post";

export function useReactionTypes() {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reaction-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reaction_types")
        .select("*")
        .order("weight", { ascending: false });

      if (error) throw error;
      return data as ReactionType[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return {
    reactionTypes: data,
    isLoading,
    error,
  };
}
