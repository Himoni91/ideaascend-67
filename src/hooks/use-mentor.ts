
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  MentorApplication, 
  MentorAvailabilitySlot, 
  MentorSession, 
  MentorReviewExtended,
  MentorSessionTypeInfo,
  MentorFilter,
  MentorAnalytics
} from "@/types/mentor";
import { ProfileType } from "@/types/profile";
import { 
  formatProfileData, 
  formatAvailabilitySlotData, 
  formatSessionData, 
  formatReviewData,
  formatSessionTypeData
} from "@/lib/data-utils";

// API URL constants for direct fetch when needed
const API_URL = "https://scicbwtczqunflsqnfzu.supabase.co";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaWNid3RjenF1bmZsc3FuZnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTA1MjQsImV4cCI6MjA1ODU2NjUyNH0.vUFSDA1QOxSRUZIFXeZuQSfprASoVmiFSMQTTihsmbI";

/**
 * Hook for all mentor-related operations
 */
export function useMentor() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all mentors with optional filtering
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
            // This assumes there's a mentor_rating field in profiles
            // You might need to join with reviews table instead
            query = query.gte('mentor_rating', filter.rating);
          }
          
          if (filter.search) {
            query = query.or(`full_name.ilike.%${filter.search}%, username.ilike.%${filter.search}%, position.ilike.%${filter.search}%, company.ilike.%${filter.search}%`);
          }
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Transform data to ProfileType
        return data.map(profile => formatProfileData(profile));
      }
    });
  };

  // Fetch a single mentor profile
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
        
        // Transform data to ProfileType
        return formatProfileData(data);
      },
      enabled: !!mentorId
    });
  };

  // Fetch availability slots for a mentor
  const useMentorAvailability = (mentorId: string) => {
    return useQuery({
      queryKey: ['mentor-availability', mentorId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('mentor_availability_slots')
          .select('*')
          .eq('mentor_id', mentorId)
          .order('start_time', { ascending: true });
        
        if (error) throw error;
        
        // Transform data to MentorAvailabilitySlot
        return data.map(slot => formatAvailabilitySlotData(slot));
      },
      enabled: !!mentorId
    });
  };

  // Fetch session types for a mentor
  const useMentorSessionTypes = (mentorId: string) => {
    return useQuery({
      queryKey: ['mentor-session-types', mentorId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('mentor_session_types')
          .select('*')
          .eq('mentor_id', mentorId);
        
        if (error) throw error;
        
        // Transform data to MentorSessionTypeInfo
        return data.map(type => formatSessionTypeData(type));
      },
      enabled: !!mentorId
    });
  };

  // Fetch sessions for current user (either as mentor or mentee)
  const useMentorSessions = (userRole?: 'mentor' | 'mentee') => {
    return useQuery({
      queryKey: ['mentor-sessions', userRole],
      queryFn: async () => {
        if (!user?.id) throw new Error('User not authenticated');
        
        let query = supabase
          .from('mentor_sessions')
          .select(`*, 
            mentor:mentor_id(id, username, full_name, avatar_url, position, company), 
            mentee:mentee_id(id, username, full_name, avatar_url)
          `);
        
        if (userRole === 'mentor') {
          query = query.eq('mentor_id', user.id);
        } else if (userRole === 'mentee') {
          query = query.eq('mentee_id', user.id);
        } else {
          // If no specific role, get sessions where user is either mentor or mentee
          query = query.or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`);
        }
        
        query = query.order('start_time', { ascending: true });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Transform data to MentorSession
        return data.map(session => formatSessionData(session));
      },
      enabled: !!user?.id
    });
  };

  // Fetch reviews for a mentor
  const useMentorReviews = (mentorId: string) => {
    return useQuery({
      queryKey: ['mentor-reviews', mentorId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('session_reviews')
          .select(`*, reviewer:reviewer_id(id, username, full_name, avatar_url)`)
          .eq('session:session_id(mentor_id)', mentorId);
        
        if (error) throw error;
        
        // Transform data to MentorReviewExtended
        return data.map(review => formatReviewData(review));
      },
      enabled: !!mentorId
    });
  };

  // Hook for mentor application
  const useApplyAsMentor = () => {
    // Fix for type instantiation error - explicitly define the return type
    return useMutation<
      any, 
      Error, 
      Omit<MentorApplication, 'id' | 'created_at' | 'updated_at' | 'status' | 'user_id'>
    >({
      mutationFn: async (application) => {
        if (!user?.id) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
          .from('mentor_applications')
          .insert({
            user_id: user.id,
            ...application,
            status: 'pending'
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return data;
      },
      onSuccess: () => {
        toast.success('Your mentor application has been submitted');
        queryClient.invalidateQueries({ queryKey: ['mentor-application'] });
      }
    });
  };

  // Create/update availability slots
  const useManageAvailability = () => {
    const addSlot = useMutation({
      mutationFn: async ({ start_time, end_time, recurring_rule }: { 
        start_time: string; 
        end_time: string;
        recurring_rule?: string;
      }) => {
        if (!user?.id) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
          .from('mentor_availability_slots')
          .insert({
            mentor_id: user.id,
            start_time,
            end_time,
            recurring_rule,
            is_booked: false
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return formatAvailabilitySlotData(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['mentor-availability'] });
      }
    });
    
    const updateSlot = useMutation({
      mutationFn: async ({ id, ...updates }: Partial<MentorAvailabilitySlot> & { id: string }) => {
        if (!user?.id) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
          .from('mentor_availability_slots')
          .update(updates)
          .eq('id', id)
          .eq('mentor_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        
        return formatAvailabilitySlotData(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['mentor-availability'] });
      }
    });
    
    const deleteSlot = useMutation({
      mutationFn: async (slotId: string) => {
        if (!user?.id) throw new Error('User not authenticated');
        
        const { error } = await supabase
          .from('mentor_availability_slots')
          .delete()
          .eq('id', slotId)
          .eq('mentor_id', user.id);
        
        if (error) throw error;
        
        return slotId;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['mentor-availability'] });
      }
    });
    
    return { addSlot, updateSlot, deleteSlot };
  };

  // Create/update session types
  const useManageSessionTypes = () => {
    const addSessionType = useMutation({
      mutationFn: async (sessionType: Omit<MentorSessionTypeInfo, 'id'>) => {
        if (!user?.id) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
          .from('mentor_session_types')
          .insert({
            mentor_id: user.id,
            ...sessionType
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return formatSessionTypeData(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['mentor-session-types'] });
      }
    });
    
    const updateSessionType = useMutation({
      mutationFn: async ({ id, ...updates }: Partial<MentorSessionTypeInfo> & { id: string }) => {
        if (!user?.id) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
          .from('mentor_session_types')
          .update(updates)
          .eq('id', id)
          .eq('mentor_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        
        return formatSessionTypeData(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['mentor-session-types'] });
      }
    });
    
    const deleteSessionType = useMutation({
      mutationFn: async (typeId: string) => {
        if (!user?.id) throw new Error('User not authenticated');
        
        const { error } = await supabase
          .from('mentor_session_types')
          .delete()
          .eq('id', typeId)
          .eq('mentor_id', user.id);
        
        if (error) throw error;
        
        return typeId;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['mentor-session-types'] });
      }
    });
    
    return { addSessionType, updateSessionType, deleteSessionType };
  };

  // Book a session
  const useBookSession = () => {
    const mutation = useMutation({
      mutationFn: async ({
        mentorId,
        slotId,
        sessionData
      }: {
        mentorId: string;
        slotId: string;
        sessionData: {
          title: string;
          description?: string;
          session_type: string;
          payment_provider?: string;
          payment_id?: string;
          payment_amount?: number;
          payment_currency?: string;
        }
      }) => {
        if (!user?.id) throw new Error('User not authenticated');
        
        // Start a transaction
        const { data: slot, error: slotError } = await supabase
          .from('mentor_availability_slots')
          .select('*')
          .eq('id', slotId)
          .eq('is_booked', false)
          .single();
        
        if (slotError) throw new Error('Slot not available or already booked');
        
        // Create session
        const { data: session, error: sessionError } = await supabase
          .from('mentor_sessions')
          .insert({
            mentor_id: mentorId,
            mentee_id: user.id,
            start_time: slot.start_time,
            end_time: slot.end_time,
            status: 'scheduled',
            payment_status: sessionData.payment_id ? 'completed' : 'pending',
            ...sessionData
          })
          .select()
          .single();
        
        if (sessionError) throw sessionError;
        
        // Update slot as booked
        const { error: updateError } = await supabase
          .from('mentor_availability_slots')
          .update({
            is_booked: true,
            session_id: session.id
          })
          .eq('id', slotId);
        
        if (updateError) throw updateError;
        
        return session;
      },
      onSuccess: () => {
        toast.success('Session booked successfully');
        queryClient.invalidateQueries({ queryKey: ['mentor-sessions'] });
        queryClient.invalidateQueries({ queryKey: ['mentor-availability'] });
      }
    });
    
    return mutation;
  };

  // Update session status
  const useUpdateSessionStatus = () => {
    const mutation = useMutation({
      mutationFn: async ({ sessionId, status }: { sessionId: string; status: string }) => {
        if (!user?.id) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
          .from('mentor_sessions')
          .update({ status })
          .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
          .eq('id', sessionId)
          .select()
          .single();
        
        if (error) throw error;
        
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['mentor-sessions'] });
      }
    });
    
    return mutation;
  };

  // Leave a review for a session
  const useLeaveReview = () => {
    const mutation = useMutation({
      mutationFn: async ({ 
        sessionId, 
        rating, 
        content 
      }: { 
        sessionId: string; 
        rating: number; 
        content: string 
      }) => {
        if (!user?.id) throw new Error('User not authenticated');
        
        // Get the session to verify the user is the mentee
        const { data: session, error: sessionError } = await supabase
          .from('mentor_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('mentee_id', user.id)
          .eq('status', 'completed')
          .single();
        
        if (sessionError) throw new Error('Session not found or not completed');
        
        // Create the review
        const { data, error } = await supabase
          .from('session_reviews')
          .insert({
            session_id: sessionId,
            reviewer_id: user.id,
            rating,
            content
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return data;
      },
      onSuccess: () => {
        toast.success('Review submitted successfully');
        queryClient.invalidateQueries({ queryKey: ['mentor-reviews'] });
      }
    });
    
    return mutation;
  };

  // Get mentor analytics
  const useMentorAnalytics = () => {
    return useQuery({
      queryKey: ['mentor-analytics'],
      queryFn: async () => {
        if (!user?.id) throw new Error('User not authenticated');
        
        // Get all completed sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('mentor_sessions')
          .select('*')
          .eq('mentor_id', user.id);
        
        if (sessionsError) throw sessionsError;
        
        // Get all reviews
        const { data: reviews, error: reviewsError } = await supabase
          .from('session_reviews')
          .select('*')
          .eq('session:session_id(mentor_id)', user.id);
        
        if (reviewsError) throw reviewsError;
        
        // Calculate analytics
        const completedSessions = sessions.filter(s => s.status === 'completed');
        const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
        
        // Get unique mentees
        const uniqueMentees = new Set(sessions.map(s => s.mentee_id));
        
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        
        // Calculate total earnings
        const totalEarnings = completedSessions.reduce((sum, session) => {
          return sum + (session.payment_amount || 0);
        }, 0);
        
        // Count repeat mentees (mentees with multiple sessions)
        const menteeCounts: Record<string, number> = {};
        sessions.forEach(session => {
          menteeCounts[session.mentee_id] = (menteeCounts[session.mentee_id] || 0) + 1;
        });
        const repeatMentees = Object.values(menteeCounts).filter(count => count > 1).length;
        
        const analytics: MentorAnalytics = {
          total_sessions: sessions.length,
          completed_sessions: completedSessions.length,
          average_rating: averageRating,
          total_earnings: totalEarnings,
          upcoming_sessions: upcomingSessions.length,
          repeat_mentees: repeatMentees,
          reviews_count: reviews.length,
          unique_mentees: uniqueMentees.size
        };
        
        return analytics;
      },
      enabled: !!user?.id
    });
  };

  return {
    useMentors,
    useMentorProfile,
    useMentorAvailability,
    useMentorSessionTypes,
    useMentorSessions,
    useMentorReviews,
    useApplyAsMentor,
    useManageAvailability,
    useManageSessionTypes,
    useBookSession,
    useUpdateSessionStatus,
    useLeaveReview,
    useMentorAnalytics
  };
}
