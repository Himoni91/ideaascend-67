
import { useState } from "react";
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

// Utility function to format profile data
const formatProfileData = (profileData: any): ProfileType => {
  return {
    ...profileData,
    expertise: profileData.expertise || [],
    badges: profileData.badges || [],
    stats: profileData.stats || {
      followers: 0,
      following: 0,
      ideas: 0,
      mentorSessions: 0,
      posts: 0,
      mentorRating: 0,
      mentorReviews: 0
    },
    level: profileData.level || 1,
    xp: profileData.xp || 0
  };
};

export function useMentor() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get all verified mentors
  const useMentors = (filters?: MentorFilter) => {
    return useQuery({
      queryKey: ["mentors", filters],
      queryFn: async () => {
        let query = supabase
          .from("profiles")
          .select(`*`)
          .eq("is_mentor", true);

        // Apply filters
        if (filters?.specialties && filters.specialties.length > 0) {
          query = query.overlaps("expertise", filters.specialties);
        }

        if (filters?.price_range) {
          query = query.gte("mentor_hourly_rate", filters.price_range[0])
            .lte("mentor_hourly_rate", filters.price_range[1]);
        }

        if (filters?.search) {
          query = query.or(`full_name.ilike.%${filters.search}%, bio.ilike.%${filters.search}%, position.ilike.%${filters.search}%, company.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Format mentors data to match ProfileType
        const formattedMentors = data.map(mentor => formatProfileData(mentor));

        // If we have a rating filter, filter on the client side
        if (filters?.rating && formattedMentors.length > 0) {
          return formattedMentors.filter(mentor => {
            const mentorRating = mentor.stats?.mentorRating || 0;
            return typeof mentorRating === 'number' ? 
              mentorRating >= (filters.rating || 0) : 
              parseFloat(mentorRating as any) >= (filters.rating || 0);
          });
        }

        return formattedMentors;
      },
      enabled: true,
    });
  };

  // Get a single mentor by ID
  const useMentorProfile = (mentorId?: string) => {
    return useQuery({
      queryKey: ["mentor", mentorId],
      queryFn: async () => {
        if (!mentorId) throw new Error("Mentor ID is required");
        
        const { data, error } = await supabase
          .from("profiles")
          .select(`*`)
          .eq("id", mentorId)
          .eq("is_mentor", true)
          .single();
          
        if (error) throw error;
        
        return formatProfileData(data);
      },
      enabled: !!mentorId,
    });
  };

  // Get availability slots for a mentor
  const useMentorAvailability = (mentorId?: string) => {
    return useQuery({
      queryKey: ["mentor-availability", mentorId],
      queryFn: async () => {
        if (!mentorId) throw new Error("Mentor ID is required");
        
        const { data, error } = await supabase.rpc('get_mentor_availability', {
          p_mentor_id: mentorId,
          p_future_only: true
        });
          
        if (error) throw error;
        
        if (!data || !Array.isArray(data)) {
          return [];
        }
        
        return data.map((slot: any) => ({
          id: slot.id,
          mentor_id: slot.mentor_id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_booked: slot.is_booked,
          session_id: slot.session_id,
          created_at: slot.created_at,
          recurring_rule: slot.recurring_rule
        }));
      },
      enabled: !!mentorId,
    });
  };

  // Get sessions for the current user (either as mentor or mentee)
  const useMentorSessions = (status?: string, role?: "mentor" | "mentee") => {
    return useQuery({
      queryKey: ["mentor-sessions", status, role],
      queryFn: async () => {
        if (!user) throw new Error("User must be logged in");
        
        const { data, error } = await supabase.rpc('get_mentor_sessions', {
          p_user_id: user.id,
          p_role: role,
          p_status: status === 'all' ? null : status
        });
          
        if (error) throw error;
        
        if (!data || !Array.isArray(data)) {
          return [];
        }
        
        return data.map((session: any) => ({
          id: session.id,
          mentor_id: session.mentor_id,
          mentee_id: session.mentee_id,
          title: session.title,
          description: session.description,
          start_time: session.start_time,
          end_time: session.end_time,
          status: session.status,
          payment_status: session.payment_status,
          payment_provider: session.payment_provider,
          payment_id: session.payment_id,
          payment_amount: session.payment_amount,
          payment_currency: session.payment_currency,
          session_url: session.session_url,
          session_notes: session.session_notes,
          cancellation_reason: session.cancellation_reason,
          cancelled_by: session.cancelled_by,
          session_type: session.session_type,
          created_at: session.created_at,
          mentor: session.mentor ? formatProfileData(session.mentor) : undefined,
          mentee: session.mentee ? formatProfileData(session.mentee) : undefined
        }));
      },
      enabled: !!user,
    });
  };

  // Get a specific session
  const useMentorSession = (sessionId?: string) => {
    return useQuery({
      queryKey: ["mentor-session", sessionId],
      queryFn: async () => {
        if (!sessionId || !user) throw new Error("Session ID and user are required");
        
        const { data, error } = await supabase.rpc('get_mentor_session_by_id', {
          p_session_id: sessionId,
          p_user_id: user.id
        });
          
        if (error) throw error;
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error("Session not found");
        }
        
        const session = data[0];
        
        // Format the data
        return {
          id: session.id,
          mentor_id: session.mentor_id,
          mentee_id: session.mentee_id,
          title: session.title,
          description: session.description,
          start_time: session.start_time,
          end_time: session.end_time,
          status: session.status,
          payment_status: session.payment_status,
          payment_provider: session.payment_provider,
          payment_id: session.payment_id,
          payment_amount: session.payment_amount,
          payment_currency: session.payment_currency,
          session_url: session.session_url,
          session_notes: session.session_notes,
          cancellation_reason: session.cancellation_reason,
          cancelled_by: session.cancelled_by,
          session_type: session.session_type,
          created_at: session.created_at,
          mentor: session.mentor ? formatProfileData(session.mentor) : undefined,
          mentee: session.mentee ? formatProfileData(session.mentee) : undefined
        };
      },
      enabled: !!sessionId && !!user,
    });
  };

  // Get reviews for a mentor
  const useMentorReviews = (mentorId?: string) => {
    return useQuery({
      queryKey: ["mentor-reviews", mentorId],
      queryFn: async () => {
        if (!mentorId) throw new Error("Mentor ID is required");
        
        const { data, error } = await supabase.rpc('get_mentor_reviews', {
          p_mentor_id: mentorId
        });
          
        if (error) throw error;
        
        if (!data || !Array.isArray(data)) {
          return [];
        }
        
        return data.map((review: any) => ({
          id: review.id,
          session_id: review.session_id,
          reviewer_id: review.reviewer_id,
          mentor_id: review.mentor_id,
          rating: review.rating,
          content: review.content,
          created_at: review.created_at,
          reviewer: review.reviewer ? formatProfileData(review.reviewer) : undefined
        }));
      },
      enabled: !!mentorId,
    });
  };

  // Apply to become a mentor
  const applyToBecomeMentor = async (application: Omit<MentorApplication, "id" | "user_id" | "created_at" | "updated_at" | "status">) => {
    if (!user) throw new Error("User must be logged in");
    
    const { data, error } = await supabase
      .from("mentor_applications")
      .insert({
        user_id: user.id,
        bio: application.bio,
        experience: application.experience,
        expertise: application.expertise,
        hourly_rate: application.hourly_rate,
        status: 'pending'
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Invalidate mentor application cache
    queryClient.invalidateQueries({ queryKey: ["mentor-application"] });
    
    toast.success("Your mentor application has been submitted!");
    return data as MentorApplication;
  };

  // Check application status
  const useMentorApplication = () => {
    return useQuery({
      queryKey: ["mentor-application"],
      queryFn: async () => {
        if (!user) throw new Error("User must be logged in");
        
        const { data, error } = await supabase
          .from("mentor_applications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .maybeSingle();
          
        if (error) throw error;
        
        return data as MentorApplication | null;
      },
      enabled: !!user,
    });
  };

  // Add availability slots as a mentor
  const addAvailabilitySlot = async (slot: { start_time: string; end_time: string; recurring_rule?: string }) => {
    if (!user) throw new Error("User must be logged in");
    
    const { data, error } = await supabase.rpc('add_mentor_availability_slot', {
      p_mentor_id: user.id,
      p_start_time: slot.start_time,
      p_end_time: slot.end_time,
      p_recurring_rule: slot.recurring_rule
    });
      
    if (error) throw error;
    
    // Invalidate availability slots cache
    queryClient.invalidateQueries({ queryKey: ["mentor-availability"] });
    
    toast.success("Availability slot added successfully");
    return data;
  };

  // Book a session with a mentor
  const bookMentorSession = async ({ mentorId, slotId, sessionData }: { 
    mentorId: string; 
    slotId: string; 
    sessionData: {
      title: string;
      description?: string;
      session_type: string;
      payment_provider?: string;
      payment_id?: string;
      payment_amount?: number;
    }
  }) => {
    if (!user) throw new Error("User must be logged in");
    
    const { data, error } = await supabase.rpc('book_mentor_session', {
      p_slot_id: slotId,
      p_mentee_id: user.id,
      p_title: sessionData.title,
      p_description: sessionData.description || '',
      p_session_type: sessionData.session_type,
      p_payment_provider: sessionData.payment_provider,
      p_payment_id: sessionData.payment_id,
      p_payment_amount: sessionData.payment_amount
    });
      
    if (error) throw error;
    
    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ["mentor-sessions"] });
    queryClient.invalidateQueries({ queryKey: ["mentor-availability"] });
    
    toast.success("Session booked successfully!");
    return data;
  };

  // Update session status
  const updateSessionStatus = async ({ sessionId, status, notes, cancellationReason }: { 
    sessionId: string; 
    status: string; 
    notes?: string;
    cancellationReason?: string;
  }) => {
    if (!user) throw new Error("User must be logged in");
    
    const { data, error } = await supabase.rpc('update_mentor_session_status', {
      p_session_id: sessionId,
      p_user_id: user.id,
      p_status: status,
      p_notes: notes,
      p_cancellation_reason: cancellationReason
    });
      
    if (error) throw error;
    
    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ["mentor-sessions"] });
    queryClient.invalidateQueries({ queryKey: ["mentor-session", sessionId] });
    
    const statusMessages: Record<string, string> = {
      scheduled: "Session has been scheduled",
      "in-progress": "Session is now in progress",
      completed: "Session has been marked as completed",
      cancelled: "Session has been cancelled",
      rescheduled: "Session has been rescheduled"
    };
    
    toast.success(statusMessages[status] || "Session status updated");
    return data;
  };

  // Submit a review for a session
  const submitSessionReview = async ({ sessionId, rating, content }: { 
    sessionId: string; 
    rating: number; 
    content: string;
  }) => {
    if (!user) throw new Error("User must be logged in");
    
    const { data, error } = await supabase.rpc('submit_mentor_session_review', {
      p_session_id: sessionId,
      p_reviewer_id: user.id,
      p_rating: rating,
      p_content: content
    });
      
    if (error) throw error;
    
    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ["mentor-reviews"] });
    
    toast.success("Your review has been submitted");
    return data;
  };

  // Setup mentor profile with session types
  const setupMentorProfile = async ({ bio, hourlyRate, sessionTypes, specialties }: { 
    bio: string; 
    hourlyRate?: number; 
    sessionTypes: MentorSessionTypeInfo[];
    specialties: string[];
  }) => {
    if (!user) throw new Error("User must be logged in");
    
    // First update the profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .update({
        mentor_bio: bio,
        mentor_hourly_rate: hourlyRate,
        expertise: specialties,
        is_mentor: true
      })
      .eq("id", user.id)
      .select()
      .single();
      
    if (profileError) throw profileError;
    
    // Then add session types
    for (const sessionType of sessionTypes) {
      const { error: sessionTypeError } = await supabase
        .from("mentor_session_types")
        .insert({
          mentor_id: user.id,
          name: sessionType.name,
          description: sessionType.description,
          duration: sessionType.duration,
          price: sessionType.price,
          currency: sessionType.currency || 'USD',
          is_free: sessionType.is_free || false,
          is_featured: sessionType.is_featured || false,
          color: sessionType.color
        });
        
      if (sessionTypeError) throw sessionTypeError;
    }
    
    // Invalidate profile queries
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    
    toast.success("Your mentor profile has been updated");
    return formatProfileData(profileData);
  };

  // Get mentor analytics
  const useMentorAnalytics = () => {
    return useQuery({
      queryKey: ["mentor-analytics"],
      queryFn: async () => {
        if (!user) throw new Error("User must be logged in");
        
        // Get sessions data
        const { data: sessionsData, error: sessionsError } = await supabase
          .from("mentor_sessions")
          .select("status, payment_amount, created_at, mentee_id")
          .eq("mentor_id", user.id);
          
        if (sessionsError) throw sessionsError;
        
        // Get reviews data
        const { data: reviewsData, error: reviewsError } = await supabase.rpc('get_mentor_reviews', {
          p_mentor_id: user.id
        });
          
        if (reviewsError) throw reviewsError;
          
        // Calculate analytics
        const completedSessions = sessionsData.filter((s) => s.status === 'completed');
        const upcomingSessions = sessionsData.filter((s) => s.status === 'scheduled' || s.status === 'rescheduled');
        const totalEarnings = completedSessions.reduce((sum, session) => sum + (session.payment_amount || 0), 0);
        
        // Count unique mentees
        const uniqueMentees = new Set(sessionsData.map(s => s.mentee_id)).size;
        
        // Calculate repeat mentees (mentees who have more than one session)
        const menteeCounts = sessionsData.reduce((acc: Record<string, number>, session) => {
          acc[session.mentee_id] = (acc[session.mentee_id] || 0) + 1;
          return acc;
        }, {});
        
        const repeatMentees = Object.values(menteeCounts).filter(count => count > 1).length;
        
        // Average rating
        const ratings = reviewsData.map((review: any) => review.rating);
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length 
          : 0;

        return {
          total_sessions: sessionsData.length,
          completed_sessions: completedSessions.length,
          upcoming_sessions: upcomingSessions.length,
          total_earnings: totalEarnings,
          average_rating: averageRating,
          unique_mentees: uniqueMentees,
          repeat_mentees: repeatMentees,
          reviews_count: reviewsData.length
        };
      },
      enabled: !!user,
    });
  };

  return {
    useMentors,
    useMentorProfile,
    useMentorAvailability,
    useMentorSessions,
    useMentorSession,
    useMentorReviews,
    applyToBecomeMentor,
    useMentorApplication,
    addAvailabilitySlot,
    bookMentorSession,
    updateSessionStatus,
    submitSessionReview,
    setupMentorProfile,
    useMentorAnalytics
  };
}
