
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
import { 
  formatProfileData, 
  formatAvailabilitySlotData, 
  formatSessionData, 
  formatReviewData,
  formatSessionTypeData
} from "@/lib/data-utils";
import { 
  asMentorAvailabilitySlot, 
  asMentorSessionType,
  asMentorSession,
  MentorAvailabilitySlotRow,
  MentorSessionTypeRow,
  MentorSessionRow
} from "@/lib/database-types";

// This is the base URL for the Supabase API
const SUPABASE_URL = "https://scicbwtczqunflsqnfzu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaWNid3RjenF1bmZsc3FuZnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5OTA1MjQsImV4cCI6MjA1ODU2NjUyNH0.vUFSDA1QOxSRUZIFXeZuQSfprASoVmiFSMQTTihsmbI";

// Use direct fetch for tables not in the generated types
const fetchFromCustomTable = async (tableName: string, queryParams: string = '') => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}${queryParams ? '?' + queryParams : ''}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${tableName}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    console.error(`Error in fetchFromCustomTable for ${tableName}:`, err);
    return { data: [], error: err };
  }
};

// Insert into custom table
const insertIntoCustomTable = async (tableName: string, values: any) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(values)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to insert into ${tableName}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    console.error(`Error inserting into ${tableName}:`, err);
    return { data: null, error: err };
  }
};

// Update custom table
const updateCustomTable = async (tableName: string, values: any, id: string) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(values)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update ${tableName}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    console.error(`Error updating ${tableName}:`, err);
    return { data: null, error: err };
  }
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
        
        // Use direct fetch instead
        const { data, error } = await fetchFromCustomTable(
          'mentor_availability_slots',
          `mentor_id=eq.${mentorId}&start_time=gt.${new Date().toISOString()}&order=start_time.asc`
        );
        
        if (error) throw error;
        
        return (data || []).map((slot: any) => formatAvailabilitySlotData(asMentorAvailabilitySlot(slot)));
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
        return data.map(session => formatSessionData(asMentorSession(session))) as MentorSession[];
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
        return formatSessionData(asMentorSession(data));
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
        return data.map(review => formatReviewData(review)) as MentorReviewExtended[];
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
    
    // Create slot with correct type structure
    const newSlot = {
      mentor_id: user.id,
      start_time: slot.start_time,
      end_time: slot.end_time,
      recurring_rule: slot.recurring_rule,
      is_booked: false
    };
    
    // Use direct fetch for better type safety
    const { data, error } = await insertIntoCustomTable("mentor_availability_slots", newSlot);
    
    if (error) throw error;
    
    // Invalidate availability slots cache
    queryClient.invalidateQueries({ queryKey: ["mentor-availability"] });
    
    toast.success("Availability slot added successfully");
    return formatAvailabilitySlotData(asMentorAvailabilitySlot(data[0]));
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
    const { data: slotData, error: slotError } = await fetchFromCustomTable(
      'mentor_availability_slots',
      `id=eq.${slotId}`
    );
    
    if (slotError || !slotData || slotData.length === 0) {
      throw new Error(slotError ? slotError.message : "Slot not found");
    }
    
    // Format slot data correctly
    const formattedSlot = asMentorAvailabilitySlot(slotData[0]);
    
    if (formattedSlot.is_booked) {
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
        start_time: formattedSlot.start_time,
        end_time: formattedSlot.end_time,
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
    const updateData = {
      is_booked: true,
      session_id: sessionResult.id
    };
    
    const { error: updateError } = await updateCustomTable("mentor_availability_slots", updateData, slotId);
      
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
          start_time: formattedSlot.start_time,
          end_time: formattedSlot.end_time
        }
      });
    
    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ["mentor-sessions"] });
    queryClient.invalidateQueries({ queryKey: ["mentor-availability"] });
    
    toast.success("Session booked successfully!");
    return formatSessionData(asMentorSession(sessionResult));
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
    
    const typedSession = asMentorSession(sessionData);
    
    // Check if user is authorized
    if (typedSession.mentor_id !== user.id && typedSession.mentee_id !== user.id) {
      throw new Error("Not authorized to update this session");
    }
    
    const updateData: any = { status };
    
    if (notes !== undefined) {
      updateData.session_notes = notes;
    }
    
    if (status === 'cancelled') {
      updateData.cancellation_reason = cancellationReason;
      updateData.cancelled_by = user.id;
    }
    
    // Update session status
    const { data, error } = await supabase
      .from("mentor_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select()
      .single();
      
    if (error) throw error;
    
    // If cancelled, free up the slot
    if (status === 'cancelled') {
      const { data: slotData, error: slotError } = await fetchFromCustomTable(
        'mentor_availability_slots',
        `session_id=eq.${sessionId}`
      );
      
      if (!slotError && slotData && slotData.length > 0) {
        await updateCustomTable("mentor_availability_slots", 
          { is_booked: false, session_id: null }, 
          slotData[0].id
        );
      }
    }
    
    // Create notification for the other party
    const otherPartyId = user.id === typedSession.mentor_id ? typedSession.mentee_id : typedSession.mentor_id;
    
    await supabase
      .from("notifications")
      .insert({
        user_id: otherPartyId,
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
    return formatSessionData(asMentorSession(data));
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
    
    const typedSession = asMentorSession(sessionData);
    
    // Check if user is authorized
    if (typedSession.mentor_id !== user.id && typedSession.mentee_id !== user.id) {
      throw new Error("Not authorized to review this session");
    }
    
    // Check if session is completed
    if (typedSession.status !== 'completed') {
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
      .eq("session.mentor_id", typedSession.mentor_id);
      
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
        .eq("id", typedSession.mentor_id);
    }
    
    // Create notification for the mentor
    if (user.id !== typedSession.mentor_id) {
      await supabase
        .from("notifications")
        .insert({
          user_id: typedSession.mentor_id,
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
    return formatReviewData(data);
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
      // Check if the session type already exists
      const { data: existingTypes, error: checkError } = await fetchFromCustomTable(
        'mentor_session_types',
        `mentor_id=eq.${user.id}&name=eq.${encodeURIComponent(sessionType.name)}`
      );
      
      if (existingTypes && existingTypes.length > 0) {
        // Update existing session type
        await updateCustomTable("mentor_session_types", {
          description: sessionType.description,
          duration: sessionType.duration,
          price: sessionType.price,
          currency: sessionType.currency || 'USD',
          is_free: sessionType.is_free || false,
          is_featured: sessionType.is_featured || false,
          color: sessionType.color
        }, existingTypes[0].id);
      } else {
        // Create new session type
        await insertIntoCustomTable("mentor_session_types", {
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
          .select("*")
          .eq("mentor_id", user.id);
          
        if (sessionsError) throw sessionsError;
        
        if (!sessionsData) return {} as MentorAnalytics;
        
        // Get reviews data
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("session_reviews")
          .select(`
            rating,
            session:mentor_sessions!session_reviews_session_id_fkey(mentor_id)
          `)
          .eq("session.mentor_id", user.id);
          
        if (reviewsError) throw reviewsError;
        
        if (!reviewsData) return {} as MentorAnalytics;
          
        // Calculate analytics
        const typedSessions = sessionsData.map(session => asMentorSession(session));
        const completedSessions = typedSessions.filter((s) => s.status === 'completed');
        const upcomingSessions = typedSessions.filter((s) => s.status === 'scheduled' || s.status === 'rescheduled');
        
        // Calculate total earnings
        let totalEarnings = 0;
        for (const session of completedSessions) {
          if (typeof session.payment_amount === 'number') {
            totalEarnings += session.payment_amount;
          } else if (typeof session.price === 'number') {
            totalEarnings += session.price;
          }
        }
        
        // Count unique mentees
        const uniqueMentees = new Set(typedSessions.map(s => s.mentee_id)).size;
        
        // Calculate repeat mentees (mentees who have more than one session)
        const menteeCounts: Record<string, number> = {};
        typedSessions.forEach(session => {
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
          total_sessions: typedSessions.length,
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
