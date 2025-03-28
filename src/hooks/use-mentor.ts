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
import { formatProfileData } from "@/lib/data-utils";

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
        
        const { data, error } = await supabase
          .from("mentor_availability_slots")
          .select("*")
          .eq("mentor_id", mentorId)
          .gt("start_time", new Date().toISOString())
          .order("start_time", { ascending: true });
          
        if (error) throw error;
        
        return data as MentorAvailabilitySlot[];
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
        
        let query = supabase
          .from("mentor_sessions")
          .select(`
            *,
            mentor:profiles!mentor_sessions_mentor_id_fkey(id, username, full_name, avatar_url, bio, position, company, expertise, is_mentor, stats),
            mentee:profiles!mentor_sessions_mentee_id_fkey(id, username, full_name, avatar_url, bio, position, company, expertise, is_mentor, stats)
          `);
          
        // Apply filters based on role and status
        if (role === "mentor") {
          query = query.eq("mentor_id", user.id);
        } else if (role === "mentee") {
          query = query.eq("mentee_id", user.id);
        } else {
          query = query.or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`);
        }
        
        if (status && status !== 'all') {
          query = query.eq("status", status);
        }
        
        // Sort by start time descending
        query = query.order("start_time", { ascending: false });
        
        const { data, error } = await query;
          
        if (error) throw error;
        
        if (!data || !Array.isArray(data)) {
          return [];
        }
        
        // Transform the data to match MentorSession type
        return data.map((session) => ({
          id: session.id,
          mentor_id: session.mentor_id,
          mentee_id: session.mentee_id,
          title: session.title,
          description: session.description,
          start_time: session.start_time,
          end_time: session.end_time,
          status: session.status,
          payment_status: session.payment_status,
          payment_provider: session.payment_provider || undefined,
          payment_id: session.payment_id || undefined,
          payment_amount: session.payment_amount || undefined,
          payment_currency: session.payment_currency || undefined,
          session_url: session.session_url,
          session_notes: session.session_notes || undefined,
          cancellation_reason: session.cancellation_reason || undefined,
          cancelled_by: session.cancelled_by || undefined,
          session_type: session.session_type || 'standard',
          created_at: session.created_at,
          mentor: session.mentor ? formatProfileData(session.mentor) : undefined,
          mentee: session.mentee ? formatProfileData(session.mentee) : undefined
        })) as MentorSession[];
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
        
        const { data, error } = await supabase
          .from("mentor_sessions")
          .select(`
            *,
            mentor:profiles!mentor_sessions_mentor_id_fkey(id, username, full_name, avatar_url, bio, position, company, expertise, is_mentor, stats),
            mentee:profiles!mentor_sessions_mentee_id_fkey(id, username, full_name, avatar_url, bio, position, company, expertise, is_mentor, stats)
          `)
          .eq("id", sessionId)
          .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
          .single();
          
        if (error) throw error;
        
        // Transform the data to match MentorSession type
        return {
          id: data.id,
          mentor_id: data.mentor_id,
          mentee_id: data.mentee_id,
          title: data.title,
          description: data.description,
          start_time: data.start_time,
          end_time: data.end_time,
          status: data.status,
          payment_status: data.payment_status,
          payment_provider: data.payment_provider || undefined,
          payment_id: data.payment_id || undefined,
          payment_amount: data.payment_amount || undefined,
          payment_currency: data.payment_currency || undefined,
          session_url: data.session_url,
          session_notes: data.session_notes || undefined,
          cancellation_reason: data.cancellation_reason || undefined,
          cancelled_by: data.cancelled_by || undefined,
          session_type: data.session_type || 'standard',
          created_at: data.created_at,
          mentor: data.mentor ? formatProfileData(data.mentor) : undefined,
          mentee: data.mentee ? formatProfileData(data.mentee) : undefined
        } as MentorSession;
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
        
        const { data, error } = await supabase
          .from("session_reviews")
          .select(`
            *,
            session:mentor_sessions!session_reviews_session_id_fkey(mentor_id),
            reviewer:profiles!session_reviews_reviewer_id_fkey(id, username, full_name, avatar_url, bio, position, company, expertise, stats)
          `)
          .eq("session.mentor_id", mentorId)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        if (!data || !Array.isArray(data)) {
          return [];
        }
        
        // Transform the data to match MentorReviewExtended type
        return data.map((review) => ({
          id: review.id,
          session_id: review.session_id,
          reviewer_id: review.reviewer_id,
          mentor_id: review.session?.mentor_id,
          rating: review.rating,
          content: review.content,
          created_at: review.created_at,
          reviewer: review.reviewer ? formatProfileData(review.reviewer) : undefined
        })) as MentorReviewExtended[];
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
    
    const { data, error } = await supabase
      .from("mentor_availability_slots")
      .insert({
        mentor_id: user.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        recurring_rule: slot.recurring_rule,
        is_booked: false
      })
      .select()
      .single();
      
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
    
    // Get the slot details
    const { data: slotData, error: slotError } = await supabase
      .from("mentor_availability_slots")
      .select("*")
      .eq("id", slotId)
      .single();
      
    if (slotError) throw slotError;
    
    if (slotData.is_booked) {
      throw new Error("This slot is already booked");
    }
    
    // Create the session
    const { data: sessionResult, error: sessionError } = await supabase
      .from("mentor_sessions")
      .insert({
        mentor_id: mentorId,
        mentee_id: user.id,
        title: sessionData.title,
        description: sessionData.description || '',
        start_time: slotData.start_time,
        end_time: slotData.end_time,
        status: 'scheduled',
        payment_status: sessionData.payment_id ? 'completed' : 'pending',
        payment_provider: sessionData.payment_provider,
        payment_id: sessionData.payment_id,
        payment_amount: sessionData.payment_amount,
        session_type: sessionData.session_type
      })
      .select()
      .single();
      
    if (sessionError) throw sessionError;
    
    // Update the slot to be booked
    const { error: updateError } = await supabase
      .from("mentor_availability_slots")
      .update({
        is_booked: true,
        session_id: sessionResult.id
      })
      .eq("id", slotId);
      
    if (updateError) throw updateError;
    
    // Create notification for the mentor
    await supabase
      .from("notifications")
      .insert({
        user_id: mentorId,
        sender_id: user.id,
        notification_type: 'session_booked',
        related_id: sessionResult.id,
        related_type: 'mentor_session',
        message: 'Your mentorship session has been booked',
        metadata: {
          session_id: sessionResult.id,
          start_time: slotData.start_time,
          end_time: slotData.end_time
        }
      });
    
    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ["mentor-sessions"] });
    queryClient.invalidateQueries({ queryKey: ["mentor-availability"] });
    
    toast.success("Session booked successfully!");
    return sessionResult;
  };

  // Update session status
  const updateSessionStatus = async ({ sessionId, status, notes, cancellationReason }: { 
    sessionId: string; 
    status: string; 
    notes?: string;
    cancellationReason?: string;
  }) => {
    if (!user) throw new Error("User must be logged in");
    
    // Get the session first
    const { data: sessionData, error: sessionError } = await supabase
      .from("mentor_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();
      
    if (sessionError) throw sessionError;
    
    // Check if user is authorized
    if (sessionData.mentor_id !== user.id && sessionData.mentee_id !== user.id) {
      throw new Error("Not authorized to update this session");
    }
    
    // Update session status
    const { data, error } = await supabase
      .from("mentor_sessions")
      .update({
        status,
        session_notes: notes || sessionData.session_notes,
        cancellation_reason: status === 'cancelled' ? cancellationReason : sessionData.cancellation_reason,
        cancelled_by: status === 'cancelled' ? user.id : sessionData.cancelled_by
      })
      .eq("id", sessionId)
      .select()
      .single();
      
    if (error) throw error;
    
    // If cancelled, free up the slot
    if (status === 'cancelled') {
      await supabase
        .from("mentor_availability_slots")
        .update({ is_booked: false })
        .eq("session_id", sessionId);
    }
    
    // Create notification for the other party
    await supabase
      .from("notifications")
      .insert({
        user_id: user.id === sessionData.mentor_id ? sessionData.mentee_id : sessionData.mentor_id,
        sender_id: user.id,
        notification_type: `session_${status}`,
        related_id: sessionId,
        related_type: 'mentor_session',
        message: `Your session has been ${status}`
      });
    
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
    
    // Get the session first
    const { data: sessionData, error: sessionError } = await supabase
      .from("mentor_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();
      
    if (sessionError) throw sessionError;
    
    // Check if user is authorized
    if (sessionData.mentor_id !== user.id && sessionData.mentee_id !== user.id) {
      throw new Error("Not authorized to review this session");
    }
    
    // Check if session is completed
    if (sessionData.status !== 'completed') {
      throw new Error("Can only review completed sessions");
    }
    
    // Check if user already submitted a review
    const { data: existingReview, error: reviewCheckError } = await supabase
      .from("session_reviews")
      .select("*")
      .eq("session_id", sessionId)
      .eq("reviewer_id", user.id)
      .maybeSingle();
      
    if (reviewCheckError) throw reviewCheckError;
    
    if (existingReview) {
      throw new Error("You've already submitted a review for this session");
    }
    
    // Create the review
    const { data, error } = await supabase
      .from("session_reviews")
      .insert({
        session_id: sessionId,
        reviewer_id: user.id,
        rating,
        content
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Update profile stats for mentor
    // Get all reviews for the mentor
    const { data: mentorReviews, error: mentorReviewsError } = await supabase
      .from("session_reviews")
      .select(`
        rating,
        session:mentor_sessions!session_reviews_session_id_fkey(mentor_id)
      `)
      .eq("session.mentor_id", sessionData.mentor_id);
      
    if (!mentorReviewsError && mentorReviews) {
      // Calculate average rating
      const ratings = mentorReviews.map((review) => review.rating);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : 0;
      
      // Update the mentor's profile stats
      await supabase
        .from("profiles")
        .update({
          stats: {
            mentorRating: averageRating,
            mentorReviews: mentorReviews.length
          }
        })
        .eq("id", sessionData.mentor_id);
    }
    
    // Create notification for the mentor
    if (user.id !== sessionData.mentor_id) {
      await supabase
        .from("notifications")
        .insert({
          user_id: sessionData.mentor_id,
          sender_id: user.id,
          notification_type: 'new_review',
          related_id: data.id,
          related_type: 'session_review',
          message: 'You received a new review'
        });
    }
    
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
      // Check if this session type already exists
      const { data: existingTypes, error: checkError } = await supabase
        .from("mentor_session_types")
        .select("id")
        .eq("mentor_id", user.id)
        .eq("name", sessionType.name);
        
      if (checkError) throw checkError;
      
      // If it exists, update it instead of inserting
      if (existingTypes && existingTypes.length > 0) {
        const { error: updateError } = await supabase
          .from("mentor_session_types")
          .update({
            description: sessionType.description,
            duration: sessionType.duration,
            price: sessionType.price,
            currency: sessionType.currency || 'USD',
            is_free: sessionType.is_free || false,
            is_featured: sessionType.is_featured || false,
            color: sessionType.color
          })
          .eq("id", existingTypes[0].id);
          
        if (updateError) throw updateError;
      } else {
        // Otherwise insert a new session type
        const { error: insertError } = await supabase
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
          
        if (insertError) throw insertError;
      }
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
          .select("status, payment_amount, created_at, mentee_id, price")
          .eq("mentor_id", user.id);
          
        if (sessionsError) throw sessionsError;
        
        // Get reviews data
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("session_reviews")
          .select(`
            rating,
            session:mentor_sessions!session_reviews_session_id_fkey(mentor_id)
          `)
          .eq("session.mentor_id", user.id);
          
        if (reviewsError) throw reviewsError;
          
        // Calculate analytics
        const completedSessions = sessionsData.filter((s) => s.status === 'completed');
        const upcomingSessions = sessionsData.filter((s) => s.status === 'scheduled' || s.status === 'rescheduled');
        
        // Use price as fallback since payment_amount might not exist
        const totalEarnings = completedSessions.reduce((sum, session) => {
          const amount = session.payment_amount !== null ? session.payment_amount : session.price;
          return sum + (amount || 0);
        }, 0);
        
        // Count unique mentees
        const uniqueMentees = new Set(sessionsData.map(s => s.mentee_id)).size;
        
        // Calculate repeat mentees (mentees who have more than one session)
        const menteeCounts: Record<string, number> = {};
        sessionsData.forEach(session => {
          if (session.mentee_id) {
            menteeCounts[session.mentee_id] = (menteeCounts[session.mentee_id] || 0) + 1;
          }
        });
        
        const repeatMentees = Object.values(menteeCounts).filter(count => count > 1).length;
        
        // Average rating
        const ratings = reviewsData.map((review) => review.rating);
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
          : 0;

        const analytics: MentorAnalytics = {
          total_sessions: sessionsData.length,
          completed_sessions: completedSessions.length,
          upcoming_sessions: upcomingSessions.length,
          total_earnings: totalEarnings,
          average_rating: averageRating,
          unique_mentees: uniqueMentees,
          repeat_mentees: repeatMentees,
          reviews_count: reviewsData.length
        };
        
        return analytics;
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
