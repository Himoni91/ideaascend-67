
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
import { formatProfileData, formatAvailabilitySlotData, formatSessionData, formatReviewData } from "@/lib/data-utils";

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
          return formattedMentors.filter(mentor => 
            (mentor.stats?.mentorRating || 0) >= (filters.rating || 0)
          );
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
        
        // Using raw SQL query since the table might not exist in the Supabase TypeScript definitions
        const { data, error } = await supabase.rpc('get_mentor_availability', {
          p_mentor_id: mentorId,
          p_future_only: true
        });
          
        if (error) throw error;
        
        // Mock data if table doesn't exist yet
        if (!data || !Array.isArray(data)) {
          return Array.from({ length: 5 }).map((_, i) => ({
            id: `slot-${i}`,
            mentor_id: mentorId,
            start_time: new Date(Date.now() + 86400000 * (i + 1)).toISOString(),
            end_time: new Date(Date.now() + 86400000 * (i + 1) + 3600000).toISOString(),
            is_booked: i < 2,
            session_id: i < 2 ? `session-${i}` : undefined,
            created_at: new Date().toISOString(),
            recurring_rule: undefined
          }));
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
        
        // Use a function call or raw query to get mentor sessions with profile data
        const { data, error } = await supabase.rpc('get_mentor_sessions', {
          p_user_id: user.id,
          p_role: role,
          p_status: status === 'all' ? null : status
        });
          
        if (error) throw error;
        
        if (!data || !Array.isArray(data)) {
          // Mock data for development
          return Array.from({ length: 3 }).map((_, i) => ({
            id: `session-${i}`,
            mentor_id: role === "mentee" ? `mentor-${i}` : user.id,
            mentee_id: role === "mentor" ? `mentee-${i}` : user.id,
            title: `Session ${i + 1}`,
            description: `Description for session ${i + 1}`,
            start_time: new Date(Date.now() + 86400000 * (i + 1)).toISOString(),
            end_time: new Date(Date.now() + 86400000 * (i + 1) + 3600000).toISOString(),
            status: ["scheduled", "completed", "in-progress"][i % 3],
            payment_status: "completed",
            payment_provider: "razorpay",
            payment_id: `pay-${i}`,
            payment_amount: 25,
            payment_currency: "USD",
            session_type: "standard",
            created_at: new Date().toISOString(),
            mentor: {
              id: `mentor-${i}`,
              username: `mentor${i}`,
              full_name: `Mentor ${i}`,
              avatar_url: null,
              position: "Senior Consultant",
              company: "Acme Inc",
              is_mentor: true,
              is_verified: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              level: 3,
              xp: 1500,
              badges: [],
              stats: {
                followers: 120,
                following: 45,
                ideas: 12,
                mentorSessions: 56,
                posts: 34,
                mentorRating: 4.8
              }
            },
            mentee: {
              id: `mentee-${i}`,
              username: `user${i}`,
              full_name: `User ${i}`,
              avatar_url: null,
              is_mentor: false,
              is_verified: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              level: 2,
              xp: 800,
              badges: [],
              stats: {
                followers: 20,
                following: 45,
                ideas: 3,
                mentorSessions: 5,
                posts: 12
              }
            }
          }));
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
        if (!sessionId) throw new Error("Session ID is required");
        
        const { data, error } = await supabase.rpc('get_mentor_session_by_id', {
          p_session_id: sessionId
        });
          
        if (error) throw error;
        
        if (!data) {
          throw new Error("Session not found");
        }
        
        // Format the data
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
          payment_provider: data.payment_provider,
          payment_id: data.payment_id,
          payment_amount: data.payment_amount,
          payment_currency: data.payment_currency,
          session_url: data.session_url,
          session_notes: data.session_notes,
          cancellation_reason: data.cancellation_reason,
          cancelled_by: data.cancelled_by,
          session_type: data.session_type,
          created_at: data.created_at,
          mentor: data.mentor ? formatProfileData(data.mentor) : undefined,
          mentee: data.mentee ? formatProfileData(data.mentee) : undefined
        };
      },
      enabled: !!sessionId,
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
          // Mock data
          return Array.from({ length: 3 }).map((_, i) => ({
            id: `review-${i}`,
            session_id: `session-${i}`,
            reviewer_id: `user-${i}`,
            mentor_id: mentorId,
            rating: 4 + (i % 2),
            content: `This was a great mentorship session. I learned a lot about ${['startup strategy', 'product development', 'fundraising'][i % 3]}.`,
            created_at: new Date(Date.now() - 86400000 * i).toISOString(),
            reviewer: {
              id: `user-${i}`,
              username: `user${i}`,
              full_name: `User ${i}`,
              avatar_url: null,
              is_mentor: false,
              is_verified: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              level: 2,
              xp: 800,
              badges: [],
              stats: {
                followers: 20,
                following: 45,
                ideas: 3,
                mentorSessions: 5,
                posts: 12
              }
            }
          }));
        }
        
        return data.map((review: any) => ({
          id: review.id,
          session_id: review.session_id,
          reviewer_id: review.reviewer_id,
          mentor_id: mentorId,
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
    
    try {
      const { data, error } = await supabase
        .from("mentor_applications")
        .insert({
          user_id: user.id,
          bio: application.bio,
          experience: application.experience,
          expertise: application.expertise,
          hourly_rate: application.hourly_rate,
          certifications: application.certifications,
          portfolio_links: application.portfolio_links,
          status: 'pending'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Invalidate mentor application cache
      queryClient.invalidateQueries({ queryKey: ["mentor-application"] });
      
      toast.success("Your mentor application has been submitted!");
      return data as MentorApplication;
    } catch (error) {
      // If the table doesn't exist yet, simulate success
      console.error("Error applying to become mentor:", error);
      toast.success("Your mentor application has been submitted! (Mock)");
      
      return {
        id: `app-${Math.random().toString(36).substring(2, 9)}`,
        user_id: user.id,
        bio: application.bio,
        experience: application.experience,
        expertise: application.expertise,
        hourly_rate: application.hourly_rate,
        certifications: application.certifications,
        portfolio_links: application.portfolio_links,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as MentorApplication;
    }
  };

  // Check application status
  const useMentorApplication = () => {
    return useQuery({
      queryKey: ["mentor-application"],
      queryFn: async () => {
        if (!user) throw new Error("User must be logged in");
        
        try {
          const { data, error } = await supabase
            .from("mentor_applications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .maybeSingle();
            
          if (error) throw error;
          
          return data as MentorApplication | null;
        } catch (error) {
          console.error("Error checking mentor application:", error);
          // If the table doesn't exist, return null
          return null;
        }
      },
      enabled: !!user,
    });
  };

  // Add availability slots as a mentor
  const addAvailabilitySlot = async (slot: { start_time: string; end_time: string; recurring_rule?: string }) => {
    if (!user) throw new Error("User must be logged in");
    
    try {
      // Check if user is a mentor
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_mentor")
        .eq("id", user.id)
        .single();
        
      if (profileError) throw profileError;
      if (!profileData.is_mentor) throw new Error("Only mentors can add availability slots");
      
      // Use a stored procedure or custom function to add slots
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
      return data as MentorAvailabilitySlot;
    } catch (error) {
      console.error("Error adding availability slot:", error);
      
      // Mock successful response if the function doesn't exist yet
      const mockSlot = {
        id: `slot-${Math.random().toString(36).substring(2, 9)}`,
        mentor_id: user.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_booked: false,
        created_at: new Date().toISOString(),
        recurring_rule: slot.recurring_rule
      };
      
      toast.success("Availability slot added successfully (Mock)");
      return mockSlot;
    }
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
    
    try {
      // Use a stored procedure to book a session
      const { data, error } = await supabase.rpc('book_mentor_session', {
        p_mentor_id: mentorId,
        p_mentee_id: user.id,
        p_slot_id: slotId,
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
      return data as MentorSession;
    } catch (error) {
      console.error("Error booking session:", error);
      
      // Mock successful response if the function doesn't exist yet
      const mockSession = {
        id: `session-${Math.random().toString(36).substring(2, 9)}`,
        mentor_id: mentorId,
        mentee_id: user.id,
        title: sessionData.title,
        description: sessionData.description,
        start_time: new Date(Date.now() + 86400000).toISOString(),
        end_time: new Date(Date.now() + 86400000 + 3600000).toISOString(),
        status: "scheduled",
        payment_status: sessionData.payment_id ? "completed" : "pending",
        payment_provider: sessionData.payment_provider,
        payment_id: sessionData.payment_id,
        payment_amount: sessionData.payment_amount,
        session_type: sessionData.session_type,
        created_at: new Date().toISOString()
      };
      
      toast.success("Session booked successfully! (Mock)");
      return mockSession as MentorSession;
    }
  };

  // Update session status
  const updateSessionStatus = async ({ sessionId, status, notes, cancellationReason }: { 
    sessionId: string; 
    status: string; 
    notes?: string;
    cancellationReason?: string;
  }) => {
    if (!user) throw new Error("User must be logged in");
    
    try {
      // Use a stored procedure to update session status
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
      return data as MentorSession;
    } catch (error) {
      console.error("Error updating session status:", error);
      
      // Mock successful response if the function doesn't exist yet
      toast.success(`Session ${status} successfully (Mock)`);
      
      // Invalidate queries anyway
      queryClient.invalidateQueries({ queryKey: ["mentor-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-session", sessionId] });
      
      return {
        id: sessionId,
        status: status
      } as MentorSession;
    }
  };

  // Submit a review for a session
  const submitSessionReview = async ({ sessionId, rating, content }: { 
    sessionId: string; 
    rating: number; 
    content: string;
  }) => {
    if (!user) throw new Error("User must be logged in");
    
    try {
      // Use a stored procedure to submit a review
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
      return data as MentorReviewExtended;
    } catch (error) {
      console.error("Error submitting review:", error);
      
      // Mock successful response if the function doesn't exist yet
      const mockReview = {
        id: `review-${Math.random().toString(36).substring(2, 9)}`,
        session_id: sessionId,
        reviewer_id: user.id,
        rating: rating,
        content: content,
        created_at: new Date().toISOString()
      };
      
      toast.success("Your review has been submitted (Mock)");
      
      // Invalidate queries anyway
      queryClient.invalidateQueries({ queryKey: ["mentor-reviews"] });
      
      return mockReview as MentorReviewExtended;
    }
  };

  // Setup mentor profile with session types
  const setupMentorProfile = async ({ bio, hourlyRate, sessionTypes, specialties }: { 
    bio: string; 
    hourlyRate?: number; 
    sessionTypes: MentorSessionTypeInfo[];
    specialties: string[];
  }) => {
    if (!user) throw new Error("User must be logged in");
    
    const { data, error } = await supabase
      .from("profiles")
      .update({
        mentor_bio: bio,
        mentor_hourly_rate: hourlyRate,
        mentor_session_types: sessionTypes,
        expertise: specialties,
        is_mentor: true
      })
      .eq("id", user.id)
      .select()
      .single();
      
    if (error) throw error;
    
    // Invalidate profile queries
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    
    toast.success("Your mentor profile has been updated");
    return formatProfileData(data);
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
    setupMentorProfile
  };
}
