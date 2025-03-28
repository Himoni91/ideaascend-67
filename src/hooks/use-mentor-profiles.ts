
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MentorFilter } from "@/types/mentor";
import { formatProfileData } from "@/lib/data-utils";

/**
 * Hook for mentor profile-related operations
 */
export function useMentorProfiles() {
  // Query function to get all mentors with optional filtering
  const useMentors = (filter?: MentorFilter) => {
    return useQuery({
      queryKey: ['mentors', filter],
      queryFn: async () => {
        let query = supabase
          .from('profiles')
          .select('*')
          .eq('is_mentor', true);

        // Apply filters
        if (filter) {
          if (filter.specialties?.length) {
            query = query.contains('expertise', filter.specialties);
          }
          
          if (filter.rating) {
            query = query.gte('mentor_rating', filter.rating);
          }
          
          if (filter.search) {
            query = query.or(`full_name.ilike.%${filter.search}%, username.ilike.%${filter.search}%, position.ilike.%${filter.search}%, company.ilike.%${filter.search}%`);
          }
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        return data.map(profile => formatProfileData(profile));
      }
    });
  };

  // Query function to get a single mentor profile
  const useMentorProfile = (mentorId: string) => {
    return useQuery({
      queryKey: ['mentor-profile', mentorId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, mentor_session_types(*)')
          .eq('id', mentorId)
          .eq('is_mentor', true)
          .single();
        
        if (error) throw error;
        
        return formatProfileData(data);
      },
      enabled: !!mentorId
    });
  };

  return {
    useMentors,
    useMentorProfile
  };
}
