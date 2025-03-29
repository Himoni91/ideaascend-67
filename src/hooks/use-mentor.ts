
import { useQuery, useMutation, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfileType } from '@/types/profile';
import { MentorFilter, MentorSession, MentorAvailabilitySlot, MentorSessionTypeInfo, MentorApplication, MentorReviewExtended, MentorAnalytics } from '@/types/mentor';
import { useAuth } from '@/contexts/AuthContext';
import { formatProfileData, formatAvailabilitySlotData, formatSessionData, formatReviewData } from '@/lib/data-utils';

export const useMentor = () => {
  const { user } = useAuth();
  
  // Fetch all mentors with optional filters
  const useMentors = (filters?: MentorFilter): UseQueryResult<ProfileType[], Error> => {
    return useQuery({
      queryKey: ['mentors', filters],
      queryFn: async () => {
        let query = supabase
          .from('profiles')
          .select('*')
          .eq('is_mentor', true);
        
        // Apply filters
        if (filters?.expertise && filters.expertise.length > 0) {
          query = query.contains('expertise', filters.expertise);
        }
        
        // Support for specialties as an alternative field name
        if (filters?.specialties && filters.specialties.length > 0) {
          query = query.overlaps('expertise', filters.specialties);
        }
        
        if (filters?.priceRange) {
          query = query.gte('mentor_hourly_rate', filters.priceRange[0]);
          query = query.lte('mentor_hourly_rate', filters.priceRange[1]);
        }
        
        // Support for price_range as alternative name
        if (filters?.price_range) {
          query = query.gte('mentor_hourly_rate', filters.price_range[0]);
          query = query.lte('mentor_hourly_rate', filters.price_range[1]);
        }
        
        if (filters?.searchTerm) {
          query = query.ilike('full_name', `%${filters.searchTerm}%`);
        }
        
        // Support for search as an alternative field name
        if (filters?.search) {
          query = query.or(`full_name.ilike.%${filters.search}%, username.ilike.%${filters.search}%, bio.ilike.%${filters.search}%, position.ilike.%${filters.search}%, company.ilike.%${filters.search}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw new Error(error.message);
        }
        
        return data ? data.map(formatProfileData) : [];
      },
    });
  };
  
  // Fetch a single mentor profile by ID
  const useMentorProfile = (mentorId?: string): UseQueryResult<ProfileType, Error> => {
    return useQuery({
      queryKey: ['mentor-profile', mentorId],
      queryFn: async () => {
        if (!mentorId) {
          throw new Error("Mentor ID is required");
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', mentorId)
          .eq('is_mentor', true)
          .single();
        
        if (error) {
          throw new Error(error.message);
        }
        
        return formatProfileData(data);
      },
      enabled: !!mentorId,
    });
  };
  
  // Fetch all mentor sessions for the current user
  const useMentorSessions = (status?: string) => {
    return useQuery({
      queryKey: ['mentor-sessions', status],
      queryFn: async () => {
        if (!user?.id) {
          throw new Error("User ID is required");
        }
        
        let query = supabase
          .from('mentor_sessions')
          .select(`
            *,
            mentor:mentor_id(id, full_name, avatar_url, username),
            mentee:mentee_id(id, full_name, avatar_url, username)
          `)
          .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
          .order('start_time', { ascending: false });
        
        if (status === "upcoming") {
          query = query.in('status', ['scheduled', 'confirmed', 'upcoming']);
        } else if (status === "past") {
          query = query.in('status', ['completed', 'cancelled']);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw new Error(error.message);
        }
        
        return data ? data.map(formatSessionData) : [];
      },
      enabled: !!user?.id,
    });
  };
  
  // Fetch a single mentor session by ID
  const useMentorSession = (sessionId?: string) => {
    return useQuery({
      queryKey: ['mentor-session', sessionId],
      queryFn: async () => {
        if (!sessionId) {
          throw new Error("Session ID is required");
        }
        
        const { data, error } = await supabase
          .from('mentor_sessions')
          .select(`
            *,
            mentor:mentor_id(id, full_name, avatar_url, username),
            mentee:mentee_id(id, full_name, avatar_url, username)
          `)
          .eq('id', sessionId)
          .single();
        
        if (error) {
          throw new Error(error.message);
        }
        
        return formatSessionData(data);
      },
      enabled: !!sessionId,
    });
  };
  
  // Update mentor session status
  const updateMentorSessionStatus = async (sessionId: string, status: string): Promise<void> => {
    const { error } = await supabase
      .from('mentor_sessions')
      .update({ status })
      .eq('id', sessionId);
    
    if (error) {
      throw new Error(error.message);
    }
  };
  
  // Mutation to update mentor session status
  const useUpdateMentorSessionStatus = () => {
    return useMutation({
      mutationFn: ({ sessionId, status }: { sessionId: string; status: string }) =>
        updateMentorSessionStatus(sessionId, status)
    });
  };
  
  // Fetch all availability slots for a mentor
  const useMentorAvailabilitySlots = (mentorId?: string) => {
    return useQuery({
      queryKey: ['mentor-availability-slots', mentorId],
      queryFn: async () => {
        if (!mentorId) {
          throw new Error("Mentor ID is required");
        }
        
        const { data, error } = await supabase
          .from('mentor_availability_slots')
          .select('*')
          .eq('mentor_id', mentorId);
        
        if (error) {
          throw new Error(error.message);
        }
        
        return data ? data.map(formatAvailabilitySlotData) : [];
      },
      enabled: !!mentorId,
    });
  };
  
  // Create a new availability slot
  const createAvailabilitySlot = async (slot: Omit<MentorAvailabilitySlot, 'id' | 'created_at'>): Promise<MentorAvailabilitySlot> => {
    const { data, error } = await supabase
      .from('mentor_availability_slots')
      .insert([slot])
      .select('*')
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return formatAvailabilitySlotData(data);
  };
  
  // Mutation to create a new availability slot
  const useCreateAvailabilitySlot = () => {
    return useMutation({
      mutationFn: (slot: Omit<MentorAvailabilitySlot, 'id' | 'created_at'>) =>
        createAvailabilitySlot(slot)
    });
  };
  
  // Update an existing availability slot
  const updateAvailabilitySlot = async (slotId: string, updates: Partial<MentorAvailabilitySlot>): Promise<MentorAvailabilitySlot> => {
    const { data, error } = await supabase
      .from('mentor_availability_slots')
      .update(updates)
      .eq('id', slotId)
      .select('*')
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return formatAvailabilitySlotData(data);
  };
  
  // Mutation to update an existing availability slot
  const useUpdateAvailabilitySlot = () => {
    return useMutation({
      mutationFn: ({ slotId, updates }: { slotId: string; updates: Partial<MentorAvailabilitySlot> }) =>
        updateAvailabilitySlot(slotId, updates)
    });
  };
  
  // Delete an availability slot
  const deleteAvailabilitySlot = async (slotId: string): Promise<void> => {
    const { error } = await supabase
      .from('mentor_availability_slots')
      .delete()
      .eq('id', slotId);
    
    if (error) {
      throw new Error(error.message);
    }
  };
  
  // Mutation to delete an availability slot
  const useDeleteAvailabilitySlot = () => {
    return useMutation({
      mutationFn: (slotId: string) =>
        deleteAvailabilitySlot(slotId)
    });
  };
  
  // Book a mentor session
  const bookMentorSession = async ({ mentorId, slotId, sessionData }: { mentorId: string; slotId: string; sessionData: Partial<MentorSession> }): Promise<MentorSession> => {
    if (!user?.id) {
      throw new Error("User ID is required");
    }
    
    // Start a transaction
    try {
      // 1. Create the mentor session
      const { data: session, error: sessionError } = await supabase
        .from('mentor_sessions')
        .insert([
          {
            mentor_id: mentorId,
            mentee_id: user.id,
            start_time: sessionData.start_time || '', // Will be updated from the slot
            end_time: sessionData.end_time || '', // Will be updated from the slot
            title: sessionData.title || 'Mentoring Session',
            description: sessionData.description,
            session_type: sessionData.session_type || 'standard',
            status: 'scheduled',
          }
        ])
        .select('*')
        .single();
      
      if (sessionError) {
        throw new Error(sessionError.message);
      }
      
      // 2. Update the availability slot to mark it as booked and link the session
      const { data: slot, error: slotError } = await supabase
        .from('mentor_availability_slots')
        .update({ is_booked: true, session_id: session.id })
        .eq('id', slotId)
        .select('*')
        .single();
      
      if (slotError) {
        throw new Error(slotError.message);
      }
      
      // 3. Update the mentor session with the correct start and end times from the slot
      const { data: updatedSession, error: updatedSessionError } = await supabase
        .from('mentor_sessions')
        .update({ start_time: slot.start_time, end_time: slot.end_time })
        .eq('id', session.id)
        .select(`
          *,
          mentor:mentor_id(id, full_name, avatar_url, username),
          mentee:mentee_id(id, full_name, avatar_url, username)
        `)
        .single();
      
      if (updatedSessionError) {
        throw new Error(updatedSessionError.message);
      }
      
      return formatSessionData(updatedSession);
    } catch (error) {
      console.error("Error booking session:", error);
      throw error;
    }
  };
  
  // Mutation to book a mentor session
  const useBookMentorSession = () => {
    return useMutation({
      mutationFn: ({ mentorId, slotId, sessionData }: { mentorId: string; slotId: string; sessionData: Partial<MentorSession> }) =>
        bookMentorSession({ mentorId, slotId, sessionData })
    });
  };
  
  // Apply to become a mentor
  const applyToBecomeMentor = async (applicationData: Omit<MentorApplication, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at' | 'approved_at' | 'reviewed_by'>): Promise<MentorApplication> => {
    if (!user?.id) {
      throw new Error("User ID is required");
    }
    
    const { data, error } = await supabase
      .from('mentor_applications')
      .insert([
        {
          user_id: user.id,
          bio: applicationData.bio,
          experience: applicationData.experience,
          expertise: applicationData.expertise,
          hourly_rate: applicationData.hourly_rate,
          status: 'pending',
        }
      ])
      .select('*')
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as MentorApplication;
  };
  
  // Mutation to apply to become a mentor
  const useApplyToBecomeMentor = () => {
    return useMutation({
      mutationFn: (applicationData: Omit<MentorApplication, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at' | 'approved_at' | 'reviewed_by'>) =>
        applyToBecomeMentor(applicationData)
    });
  };
  
  // Get mentor application for the current user
  const getMentorApplication = () => {
    return useQuery({
      queryKey: ['mentor-application', user?.id],
      queryFn: async () => {
        if (!user?.id) {
          return null;
        }
        
        const { data, error } = await supabase
          .from('mentor_applications')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          // If no application exists, return null instead of throwing an error
          if (error.message.includes('No rows found')) {
            return null;
          }
          throw new Error(error.message);
        }
        
        return data as MentorApplication;
      },
      enabled: !!user?.id,
    });
  };

  // Modified useMentorSessionTypes function
  const useMentorSessionTypes = (mentorId?: string) => {
    return useQuery({
      queryKey: ['mentor-session-types', mentorId],
      queryFn: async () => {
        if (!mentorId) return [];
        
        const { data, error } = await supabase
          .from('mentor_session_types')
          .select('*')
          .eq('mentor_id', mentorId);
          
        if (error) throw error;
        return data || [];
      },
      enabled: !!mentorId
    });
  };

  // Modified useMentorAvailability to accept params object
  const useMentorAvailability = (params: { mentorId?: string; startDate?: Date; endDate?: Date }) => {
    const { mentorId, startDate, endDate } = params;
    
    return useQuery({
      queryKey: ['mentor-availability', mentorId, startDate, endDate],
      queryFn: async () => {
        if (!mentorId) return [];
        
        let query = supabase
          .from('mentor_availability_slots')
          .select('*')
          .eq('mentor_id', mentorId)
          .eq('is_booked', false);
          
        // Add date filters if provided
        if (startDate) {
          query = query.gte('start_time', startDate.toISOString());
        }
        
        if (endDate) {
          query = query.lte('end_time', endDate.toISOString());
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      enabled: !!mentorId
    });
  };

  // Fetch mentor reviews
  const useMentorReviews = (mentorId?: string) => {
    return useQuery({
      queryKey: ['mentor-reviews', mentorId],
      queryFn: async () => {
        if (!mentorId) return [];

        const { data, error } = await supabase
          .from('session_reviews')
          .select(`
            *,
            reviewer:profiles!reviewer_id(id, full_name, avatar_url, username)
          `)
          .eq('mentor_id', mentorId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data ? data.map(formatReviewData) : [];
      },
      enabled: !!mentorId,
    });
  };

  // Create a mentor review
  const createMentorReview = async (reviewData: Omit<MentorReviewExtended, 'id' | 'created_at' | 'reviewer'>): Promise<MentorReviewExtended> => {
    const { data, error } = await supabase
      .from('session_reviews')
      .insert([reviewData])
      .select(`
        *,
        reviewer:profiles!reviewer_id(id, full_name, avatar_url, username)
      `)
      .single();

    if (error) throw error;
    return formatReviewData(data);
  };

  // Mutation to create a mentor review
  const useCreateMentorReview = () => {
    return useMutation({
      mutationFn: (reviewData: Omit<MentorReviewExtended, 'id' | 'created_at' | 'reviewer'>) =>
        createMentorReview(reviewData)
    });
  };

  // Fetch mentor analytics
  const useMentorAnalytics = () => {
    const { user } = useAuth();
    
    return useQuery({
      queryKey: ['mentor-analytics', user?.id],
      queryFn: async () => {
        if (!user?.id) {
          return null;
        }
        
        // Fetch total sessions
        const { count: totalSessions, error: totalSessionsError } = await supabase
          .from('mentor_sessions')
          .select('*', { count: 'exact' })
          .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`);
        
        if (totalSessionsError) {
          console.error("Error fetching total sessions:", totalSessionsError);
        }
        
        // Fetch completed sessions
        const { count: completedSessions, error: completedSessionsError } = await supabase
          .from('mentor_sessions')
          .select('*', { count: 'exact' })
          .eq('status', 'completed')
          .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`);
        
        if (completedSessionsError) {
          console.error("Error fetching completed sessions:", completedSessionsError);
        }
        
        // Fetch cancelled sessions
        const { count: cancelledSessions, error: cancelledSessionsError } = await supabase
          .from('mentor_sessions')
          .select('*', { count: 'exact' })
          .eq('status', 'cancelled')
          .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`);
        
        if (cancelledSessionsError) {
          console.error("Error fetching cancelled sessions:", cancelledSessionsError);
        }
        
        // Fetch average rating
        const { data: avgRatingData, error: avgRatingError } = await supabase
          .from('session_reviews')
          .select('rating')
          .eq('mentor_id', user.id);
        
        let averageRating = 0;
        if (avgRatingData && avgRatingData.length > 0) {
          const totalRating = avgRatingData.reduce((sum, review) => sum + review.rating, 0);
          averageRating = totalRating / avgRatingData.length;
        }
        
        if (avgRatingError) {
          console.error("Error fetching average rating:", avgRatingError);
        }
        
        // Fetch total earnings (example, adjust based on your actual payment tracking)
        const { data: earningsData, error: earningsError } = await supabase
          .from('mentor_sessions')
          .select('payment_amount')
          .eq('mentor_id', user.id)
          .eq('payment_status', 'completed');
        
        let totalEarnings = 0;
        if (earningsData && earningsData.length > 0) {
          totalEarnings = earningsData.reduce((sum, session) => sum + (session.payment_amount || 0), 0);
        }
        
        if (earningsError) {
          console.error("Error fetching total earnings:", earningsError);
        }
        
        // Fetch earnings by month (handled client-side since these are custom functions)
        const earningsByMonth: Record<string, number> = {};
        
        // Fetch sessions by month
        const sessionsByMonth: Record<string, number> = {};
        
        // Fetch upcoming sessions
        const { count: upcomingSessions, error: upcomingSessionsError } = await supabase
          .from('mentor_sessions')
          .select('*', { count: 'exact' })
          .in('status', ['scheduled', 'confirmed', 'upcoming'])
          .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`);

        if (upcomingSessionsError) {
          console.error("Error fetching upcoming sessions:", upcomingSessionsError);
        }
        
        // Fetch popular session types (handled client-side)
        const popularSessionTypes: Array<{ name: string; count: number }> = [];
        
        // Make sure we're returning a valid MentorAnalytics object
        return {
          total_sessions: totalSessions || 0,
          completed_sessions: completedSessions || 0,
          cancelled_sessions: cancelledSessions || 0,
          average_rating: averageRating || 0,
          total_earnings: totalEarnings || 0,
          earnings_by_month: earningsByMonth || {},
          sessions_by_month: sessionsByMonth || {},
          upcoming_sessions: upcomingSessions || 0,
          popular_session_types: popularSessionTypes || []
        };
      },
      enabled: !!user?.id
    });
  };

  return {
    useMentors,
    useMentorProfile,
    useMentorSessions,
    useMentorSession,
    useUpdateMentorSessionStatus,
    useMentorAvailabilitySlots,
    useCreateAvailabilitySlot,
    useUpdateAvailabilitySlot,
    useDeleteAvailabilitySlot,
    useBookMentorSession,
    useApplyToBecomeMentor,
    getMentorApplication,
    useMentorSessionTypes,
    useMentorAvailability,
    useMentorReviews,
    useCreateMentorReview,
    useMentorAnalytics
  };
};
