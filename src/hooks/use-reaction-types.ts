
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReactionType } from "@/types/post";

export const useReactionTypes = () => {
  const { 
    data: reactionTypes, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["reactionTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reaction_types")
        .select("*")
        .order("weight", { ascending: false });
      
      if (error) throw error;
      return data as ReactionType[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    reactionTypes: reactionTypes || [],
    isLoading,
    error
  };
};
