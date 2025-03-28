
import { useState, useEffect } from "react";
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
          .select(`
            *
          `)
          .eq("is_mentor", true);

        // Apply filters
        if (filters?.specialties && filters.specialties.length > 0) {
          query = query.overlaps("expertise", filters.specialties);
        }

        if (filters?.price_range) {
          query = query.gte("mentor_hourly_rate", filters.price_range[0])
            .lte("mentor_hourly_rate", filters.price_range[1]);
        }

        if (filters?.rating) {
          // This would need a join or a separate query to calculate average rating
          // For now, we'll filter on the client side
        }

        if (filters?.search) {
          query = query.or(`full_name.ilike.%${filters.search}%, bio.ilike.%${filters.search}%, position.ilike.%${filters.search}%, company.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        // If we have a rating filter, we need to fetch ratings separately
        if (filters?.rating) {
          const mentorIds = data.map((mentor: any) => mentor.id);
          
          const { data: reviewsData, error: reviewsError } = await supabase
            .from("mentor_reviews")
            .select("mentor_id, rating")
            .in("mentor_id", mentorIds);
            
          if (reviewsError) throw reviewsError;
          
          // Calculate average rating for each mentor
          const mentorRatings: Record<string, { sum: number, count: number }> = {};
          
          reviewsData?.forEach((review: any) => {
            if (!mentorRatings[review.mentor_id]) {
              mentorRatings[review.mentor_id] = { sum: 0, count: 0 };
            }
            mentorRatings[review.mentor_id].sum += review.rating;
            mentorRatings[review.mentor_id].count += 1;
          });
          
          // Filter mentors by rating
          return data.filter((mentor: any) => {
            const rating = mentorRatings[mentor.id];
            if (!rating || rating.count === 0) return false;
            return (rating.sum / rating.count) >= (filters.rating || 0);
          }) as ProfileType[];
        }

        return data as ProfileType[];
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
          .select(`
            *
          `)
          .eq("id", mentorId)
          .eq("is_mentor", true)
          .single();
          
        if (error) throw error;
        
        return data as ProfileType;
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
          .eq("is_booked", false)
          .gte("start_time", new Date().toISOString())
          .order("start_time", { ascending: true });
          
        if (error) throw error;
        
        return data as MentorAvailabilitySlot[];
      },
      enabled: !!mentorId,
    });
  };

  // Get sessions for the current user (either as mentor or mentee)
  const useMentorSessions = (status?: MentorSession["status"], role?: "mentor" | "mentee") => {
    return useQuery({
      queryKey: ["mentor-sessions", status, role],
      queryFn: async () => {
        if (!user) throw new Error("User must be logged in");
        
        let query = supabase
          .from("mentor_sessions")
          .select(`
            *,
            mentor:mentor_id(id, username, full_name, avatar_url, position, company),
            mentee:mentee_id(id, username, full_name, avatar_url)
          `);

        // Filter by role
        if (role === "mentor") {
          query = query.eq("mentor_id", user.id);
        } else if (role === "mentee") {
          query = query.eq("mentee_id", user.id);
        } else {
          query = query.or(`mentor_id.eq.${user.id}, mentee_id.eq.${user.id}`);
        }

        // Filter by status
        if (status) {
          query = query.eq("status", status);
        }

        // Order by start_time
        query = query.order("start_time", { ascending: true });
          
        const { data, error } = await query;
          
        if (error) throw error;
        
        return data as MentorSession[];
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
        
        const { data, error } = await supabase
          .from("mentor_sessions")
          .select(`
            *,
            mentor:mentor_id(id, username, full_name, avatar_url, position, company),
            mentee:mentee_id(id, username, full_name, avatar_url)
          `)
          .eq("id", sessionId)
          .single();
          
        if (error) throw error;
        
        return data as MentorSession;
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
        
        const { data, error } = await supabase
          .from("session_reviews")
          .select(`
            *,
            reviewer:reviewer_id(id, username, full_name, avatar_url)
          `)
          .eq("mentor_id", mentorId)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        return data as MentorReviewExtended[];
      },
      enabled: !!mentorId,
    });
  };

  // Apply to become a mentor
  const applyToBecomeMentor = useMutation({
    mutationFn: async (application: Omit<MentorApplication, "id" | "user_id" | "created_at" | "updated_at" | "status">) => {
      if (!user) throw new Error("User must be logged in");
      
      const { data, error } = await supabase
        .from("mentor_applications")
        .insert({
          user_id: user.id,
          bio: application.bio,
          experience: application.experience,
          expertise: application.expertise,
          hourly_rate: application.hourly_rate,
          certifications: application.certifications,
          portfolio_links: application.portfolio_links
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data as MentorApplication;
    },
    onSuccess: () => {
      toast.success("Your mentor application has been submitted!");
      queryClient.invalidateQueries({ queryKey: ["mentor-application"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to submit application: ${error.message}`);
    }
  });

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
  const addAvailabilitySlot = useMutation({
    mutationFn: async (slot: { start_time: string; end_time: string; recurring_rule?: string }) => {
      if (!user) throw new Error("User must be logged in");
      
      // Check if user is a mentor
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_mentor")
        .eq("id", user.id)
        .single();
        
      if (profileError) throw profileError;
      if (!profileData.is_mentor) throw new Error("Only mentors can add availability slots");
      
      const { data, error } = await supabase
        .from("mentor_availability_slots")
        .insert({
          mentor_id: user.id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_booked: false,
          recurring_rule: slot.recurring_rule
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data as MentorAvailabilitySlot;
    },
    onSuccess: () => {
      toast.success("Availability slot added successfully");
      queryClient.invalidateQueries({ queryKey: ["mentor-availability"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to add availability slot: ${error.message}`);
    }
  });

  // Book a session with a mentor
  const bookMentorSession = useMutation({
    mutationFn: async ({ mentorId, slotId, sessionData }: { 
      mentorId: string; 
      slotId: string; 
      sessionData: {
        title: string;
        description?: string;
        session_type: string;
        payment_provider?: MentorPaymentProvider;
        payment_id?: string;
        payment_amount?: number;
      }
    }) => {
      if (!user) throw new Error("User must be logged in");
      
      // Get the availability slot
      const { data: slotData, error: slotError } = await supabase
        .from("mentor_availability_slots")
        .select("*")
        .eq("id", slotId)
        .single();
        
      if (slotError) throw slotError;
      if (slotData.is_booked) throw new Error("This slot is already booked");
      
      // Start a transaction to book the slot and create the session
      const { data: session, error: sessionError } = await supabase
        .from("mentor_sessions")
        .insert({
          mentor_id: mentorId,
          mentee_id: user.id,
          title: sessionData.title,
          description: sessionData.description,
          start_time: slotData.start_time,
          end_time: slotData.end_time,
          status: "scheduled",
          payment_status: sessionData.payment_id ? "completed" : "pending",
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
          session_id: session.id
        })
        .eq("id", slotId);
        
      if (updateError) throw updateError;
      
      return session as MentorSession;
    },
    onSuccess: () => {
      toast.success("Session booked successfully!");
      queryClient.invalidateQueries({ queryKey: ["mentor-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-availability"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to book session: ${error.message}`);
    }
  });

  // Update session status
  const updateSessionStatus = useMutation({
    mutationFn: async ({ sessionId, status, notes, cancellationReason }: { 
      sessionId: string; 
      status: MentorSession["status"]; 
      notes?: string;
      cancellationReason?: string;
    }) => {
      if (!user) throw new Error("User must be logged in");
      
      const updateData: Record<string, any> = { status };
      
      if (notes) updateData.session_notes = notes;
      if (status === "cancelled") {
        updateData.cancellation_reason = cancellationReason;
        updateData.cancelled_by = user.id;
      }
      
      const { data, error } = await supabase
        .from("mentor_sessions")
        .update(updateData)
        .eq("id", sessionId)
        .select()
        .single();
        
      if (error) throw error;
      
      return data as MentorSession;
    },
    onSuccess: (data) => {
      const statusMessages = {
        scheduled: "Session has been scheduled",
        "in-progress": "Session is now in progress",
        completed: "Session has been marked as completed",
        cancelled: "Session has been cancelled",
        rescheduled: "Session has been rescheduled"
      };
      
      toast.success(statusMessages[data.status] || "Session status updated");
      queryClient.invalidateQueries({ queryKey: ["mentor-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-session", data.id] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update session status: ${error.message}`);
    }
  });

  // Submit a review for a session
  const submitSessionReview = useMutation({
    mutationFn: async ({ sessionId, rating, content }: { 
      sessionId: string; 
      rating: number; 
      content: string;
    }) => {
      if (!user) throw new Error("User must be logged in");
      
      // Get the session to make sure we're the mentee
      const { data: sessionData, error: sessionError } = await supabase
        .from("mentor_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
        
      if (sessionError) throw sessionError;
      if (sessionData.mentee_id !== user.id) throw new Error("Only the mentee can review this session");
      
      const { data, error } = await supabase
        .from("session_reviews")
        .insert({
          session_id: sessionId,
          reviewer_id: user.id,
          mentor_id: sessionData.mentor_id,
          rating,
          content
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data as MentorReviewExtended;
    },
    onSuccess: () => {
      toast.success("Your review has been submitted");
      queryClient.invalidateQueries({ queryKey: ["mentor-reviews"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to submit review: ${error.message}`);
    }
  });

  // Get mentor analytics
  const useMentorAnalytics = () => {
    return useQuery({
      queryKey: ["mentor-analytics"],
      queryFn: async () => {
        if (!user) throw new Error("User must be logged in");
        
        // Get total sessions count
        const { count: totalSessions, error: sessionsError } = await supabase
          .from("mentor_sessions")
          .select("*", { count: "exact", head: true })
          .eq("mentor_id", user.id);
          
        if (sessionsError) throw sessionsError;
        
        // Get completed sessions count
        const { count: completedSessions, error: completedError } = await supabase
          .from("mentor_sessions")
          .select("*", { count: "exact", head: true })
          .eq("mentor_id", user.id)
          .eq("status", "completed");
          
        if (completedError) throw completedError;
        
        // Get average rating
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("session_reviews")
          .select("rating")
          .eq("mentor_id", user.id);
          
        if (reviewsError) throw reviewsError;
        
        let averageRating = 0;
        if (reviewsData && reviewsData.length > 0) {
          const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
          averageRating = sum / reviewsData.length;
        }
        
        // Get total earnings
        const { data: earningsData, error: earningsError } = await supabase
          .from("mentor_sessions")
          .select("payment_amount")
          .eq("mentor_id", user.id)
          .eq("payment_status", "completed");
          
        if (earningsError) throw earningsError;
        
        const totalEarnings = earningsData?.reduce((acc, session) => acc + (session.payment_amount || 0), 0) || 0;
        
        // Get upcoming sessions
        const { count: upcomingSessions, error: upcomingError } = await supabase
          .from("mentor_sessions")
          .select("*", { count: "exact", head: true })
          .eq("mentor_id", user.id)
          .eq("status", "scheduled")
          .gte("start_time", new Date().toISOString());
          
        if (upcomingError) throw upcomingError;
        
        // Get repeat mentees
        const { data: menteesData, error: menteesError } = await supabase
          .from("mentor_sessions")
          .select("mentee_id, count")
          .eq("mentor_id", user.id)
          .eq("status", "completed")
          .group("mentee_id");
          
        if (menteesError) throw menteesError;
        
        const repeatMentees = menteesData?.filter(mentee => mentee.count > 1).length || 0;
        
        return {
          total_sessions: totalSessions || 0,
          completed_sessions: completedSessions || 0,
          average_rating: averageRating,
          total_earnings: totalEarnings,
          session_duration_total: 0, // Would need additional calculations
          upcoming_sessions: upcomingSessions || 0,
          repeat_mentees: repeatMentees,
          reviews_count: reviewsData?.length || 0
        } as MentorAnalytics;
      },
      enabled: !!user,
    });
  };

  // Setup mentor profile with session types
  const setupMentorProfile = useMutation({
    mutationFn: async ({ bio, hourlyRate, sessionTypes, specialties }: { 
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
      
      return data;
    },
    onSuccess: () => {
      toast.success("Your mentor profile has been updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update mentor profile: ${error.message}`);
    }
  });

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
    useMentorAnalytics,
    setupMentorProfile
  };
}
