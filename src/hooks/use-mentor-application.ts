
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MentorApplication } from "@/types/mentor";

export function useMentorApplication(userId: string) {
  return useQuery({
    queryKey: ['mentor-application', userId],
    queryFn: async (): Promise<MentorApplication | null> => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('mentor_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No application found, return null instead of throwing
          return null;
        }
        throw error;
      }
      
      return data as MentorApplication;
    },
    enabled: !!userId
  });
}
