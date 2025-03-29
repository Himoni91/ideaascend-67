import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  MentorApplication, 
  MentorAvailabilitySlot, 
  MentorSession,
  MentorSessionStatus,
  MentorSessionTypeInfo,
  MentorFilter,
  MentorProfile
} from "@/types/mentor";
import { ProfileType } from "@/types/profile";
import { formatProfileData, formatSessionData } from "@/lib/data-utils";

export interface MentorScheduleParams {
  mentorId: string;
  date: Date;
}

export interface BookSessionParams {
  mentorId: string;
  slotId: string;
  sessionData: {
    title: string;
    description?: string;
    sessionType: string;
    paymentMethod?: string;
    paymentId?: string;
    amount?: number;
  };
}

export interface CreateAvailabilityParams {
  startTime: Date;
  endTime: Date;
  recurring?: boolean;
  recurringRule?: string;
}

export interface UpdateMentorProfileParams {
  mentorBio?: string;
  hourlyRate?: number;
  sessionTypes?: MentorSessionTypeInfo[];
}

export function useMentorSpace() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get all verified mentors with optional filtering
  const getMentors = (filters?: MentorFilter) => {
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

        if (filters?.rating) {
          // We'll filter by rating client-side as it's not a direct column
        }

        if (filters?.search) {
          query = query.or(`full_name.ilike.%${filters.search}%, username.ilike.%${filters.search}%, bio.ilike.%${filters.search}%, position.ilike.%${filters.search}%, company.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching mentors:", error);
          throw error;
        }

        // Format mentors data to match MentorProfile type
        return data?.map(mentor => formatProfileData(mentor) as MentorProfile) || [];
      },
      enabled: true,
    });
  };

  // Get mentor details by ID
  const getMentorProfile = (mentorId?: string) => {
    return useQuery({
      queryKey: ["mentor-profile", mentorId],
      queryFn: async () => {
        if (!mentorId) throw new Error("Mentor ID is required");
        
        const { data, error } = await supabase
          .from("profiles")
          .select(`*`)
          .eq("id", mentorId)
          .eq("is_mentor", true)
          .single();
          
        if (error) {
          console.error("Error fetching mentor profile:", error);
          throw error;
        }
        
        return formatProfileData(data) as MentorProfile;
      },
      enabled: !!mentorId,
    });
  };

  // Get all session types for a mentor
  const getMentorSessionTypes = (mentorId?: string) => {
    return useQuery({
      queryKey: ["mentor-session-types", mentorId],
      queryFn: async () => {
        if (!mentorId) throw new Error("Mentor ID is required");
        
        const { data, error } = await supabase
          .from("mentor_session_types")
          .select("*")
          .eq("mentor_id", mentorId)
          .order("price", { ascending: true });
          
        if (error) {
          console.error("Error fetching session types:", error);
          throw error;
        }
        
        return data as MentorSessionTypeInfo[];
      },
      enabled: !!mentorId,
    });
  };

  // Get mentor's availability
  const getMentorAvailability = (mentorId?: string, startDate?: Date, endDate?: Date) => {
    return useQuery({
      queryKey: ["mentor-availability", mentorId, startDate, endDate],
      queryFn: async () => {
        if (!mentorId) throw new Error("Mentor ID is required");
        
        let query = supabase
          .from("mentor_availability_slots")
          .select("*")
          .eq("mentor_id", mentorId)
          .eq("is_booked", false);
          
        if (startDate) {
          query = query.gte('start_time', startDate.toISOString());
        } else {
          query = query.gte('start_time', new Date().toISOString());
        }
        
        if (endDate) {
          query = query.lte('start_time', endDate.toISOString());
        }
        
        const { data, error } = await query.order("start_time", { ascending: true });
          
        if (error) {
          console.error("Error fetching mentor availability:", error);
          throw error;
        }
        
        return data as MentorAvailabilitySlot[];
      },
      enabled: !!mentorId,
    });
  };

  // Get user's mentor application
  const getMentorApplication = () => {
    return useQuery({
      queryKey: ["mentor-application"],
      queryFn: async () => {
        if (!user?.id) throw new Error("User must be logged in");
        
        const { data, error } = await supabase
          .from("mentor_applications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching mentor application:", error);
          throw error;
        }
        
        return data as MentorApplication | null;
      },
      enabled: !!user?.id,
    });
  };

  // Apply to become a mentor
  const applyToBecomeMentor = useMutation({
    mutationFn: async (application: {
      bio: string;
      experience: string;
      expertise: string[];
      hourly_rate?: number;
    }) => {
      if (!user?.id) throw new Error("User must be logged in");
      
      const { data, error } = await supabase
        .from("mentor_applications")
        .insert({
          user_id: user.id,
          bio: application.bio,
          experience: application.experience,
          expertise: application.expertise,
          hourly_rate: application.hourly_rate
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error submitting mentor application:", error);
        throw error;
      }
      
      return data as MentorApplication;
    },
    onSuccess: () => {
      toast.success("Your mentor application has been submitted!");
      queryClient.invalidateQueries({ queryKey: ["mentor-application"] });
    },
    onError: (error) => {
      toast.error(`Failed to submit application: ${error.message}`);
    }
  });

  // Get mentor's sessions (for mentor view)
  const getMentorSessions = (status?: MentorSessionStatus) => {
    return useQuery({
      queryKey: ["mentor-sessions", status, "mentor"],
      queryFn: async () => {
        if (!user?.id) throw new Error("User must be logged in");
        
        let query = supabase
          .from("mentor_sessions")
          .select(`
            *,
            mentor:profiles!mentor_sessions_mentor_id_fkey(id, username, full_name, avatar_url),
            mentee:profiles!mentor_sessions_mentee_id_fkey(id, username, full_name, avatar_url)
          `)
          .eq("mentor_id", user.id);
          
        if (status) {
          query = query.eq("status", status);
        }
        
        const { data, error } = await query.order("start_time", { ascending: true });
          
        if (error) {
          console.error("Error fetching mentor sessions:", error);
          throw error;
        }
        
        // Format the data using formatSessionData to ensure type safety
        return data.map(session => formatSessionData(session)) as MentorSession[];
      },
      enabled: !!user?.id,
    });
  };

  // Get mentee's sessions (for mentee view)
  const getMenteeSessions = (status?: MentorSessionStatus) => {
    return useQuery({
      queryKey: ["mentee-sessions", status],
      queryFn: async () => {
        if (!user?.id) throw new Error("User must be logged in");
        
        let query = supabase
          .from("mentor_sessions")
          .select(`
            *,
            mentor:profiles!mentor_sessions_mentor_id_fkey(id, username, full_name, avatar_url),
            mentee:profiles!mentor_sessions_mentee_id_fkey(id, username, full_name, avatar_url)
          `)
          .eq("mentee_id", user.id);
          
        if (status) {
          query = query.eq("status", status);
        }
        
        const { data, error } = await query.order("start_time", { ascending: true });
          
        if (error) {
          console.error("Error fetching mentee sessions:", error);
          throw error;
        }
        
        // Format the data using formatSessionData to ensure type safety
        return data.map(session => formatSessionData(session)) as MentorSession[];
      },
      enabled: !!user?.id,
    });
  };

  // Add mentor availability slot
  const addAvailabilitySlot = useMutation({
    mutationFn: async (params: CreateAvailabilityParams) => {
      if (!user?.id) throw new Error("User must be logged in");
      
      const { data, error } = await supabase
        .from("mentor_availability_slots")
        .insert({
          mentor_id: user.id,
          start_time: params.startTime.toISOString(),
          end_time: params.endTime.toISOString(),
          recurring_rule: params.recurringRule,
          is_booked: false
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error adding availability slot:", error);
        throw error;
      }
      
      return data as MentorAvailabilitySlot;
    },
    onSuccess: () => {
      toast.success("Availability slot added successfully!");
      queryClient.invalidateQueries({ queryKey: ["mentor-availability"] });
    },
    onError: (error) => {
      toast.error(`Failed to add availability: ${error.message}`);
    }
  });

  // Add or update session type
  const upsertSessionType = useMutation({
    mutationFn: async (sessionType: Omit<MentorSessionTypeInfo, 'id' | 'created_at'> & { id?: string }) => {
      if (!user?.id) throw new Error("User must be logged in");
      
      const { id, ...sessionTypeData } = sessionType;
      
      if (id) {
        // Update existing session type
        const { data, error } = await supabase
          .from("mentor_session_types")
          .update({
            ...sessionTypeData,
            mentor_id: user.id
          })
          .eq("id", id)
          .eq("mentor_id", user.id)
          .select()
          .single();
          
        if (error) {
          console.error("Error updating session type:", error);
          throw error;
        }
        
        return data as MentorSessionTypeInfo;
      } else {
        // Insert new session type
        const { data, error } = await supabase
          .from("mentor_session_types")
          .insert({
            ...sessionTypeData,
            mentor_id: user.id
          })
          .select()
          .single();
          
        if (error) {
          console.error("Error adding session type:", error);
          throw error;
        }
        
        return data as MentorSessionTypeInfo;
      }
    },
    onSuccess: () => {
      toast.success("Session type saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["mentor-session-types"] });
    },
    onError: (error) => {
      toast.error(`Failed to save session type: ${error.message}`);
    }
  });

  // Book a session with a mentor
  const bookSession = useMutation({
    mutationFn: async (params: BookSessionParams) => {
      if (!user?.id) throw new Error("User must be logged in");
      
      // Get the slot details
      const { data: slotData, error: slotError } = await supabase
        .from("mentor_availability_slots")
        .select("*")
        .eq("id", params.slotId)
        .single();
        
      if (slotError) {
        console.error("Error getting availability slot:", slotError);
        throw slotError;
      }
      
      if (slotData.is_booked) {
        throw new Error("This slot is already booked");
      }
      
      // Begin a transaction by inserting the session
      const { data: sessionData, error: sessionError } = await supabase
        .from("mentor_sessions")
        .insert({
          mentor_id: params.mentorId,
          mentee_id: user.id,
          title: params.sessionData.title,
          description: params.sessionData.description || null,
          start_time: slotData.start_time,
          end_time: slotData.end_time,
          status: 'scheduled',
          payment_status: params.sessionData.paymentId ? 'completed' : 'pending',
          payment_provider: params.sessionData.paymentMethod,
          payment_id: params.sessionData.paymentId,
          payment_amount: params.sessionData.amount,
          session_type: params.sessionData.sessionType
        })
        .select()
        .single();
        
      if (sessionError) {
        console.error("Error creating session:", sessionError);
        throw sessionError;
      }
      
      // Update the slot to be booked
      const { error: updateError } = await supabase
        .from("mentor_availability_slots")
        .update({
          is_booked: true,
          session_id: sessionData.id
        })
        .eq("id", params.slotId);
        
      if (updateError) {
        console.error("Error updating slot:", updateError);
        throw updateError;
      }
      
      // Create notification for the mentor
      await supabase
        .from("notifications")
        .insert({
          user_id: params.mentorId,
          sender_id: user.id,
          notification_type: 'session_booked',
          related_id: sessionData.id,
          related_type: 'mentor_session',
          message: 'Your mentorship session has been booked',
          metadata: {
            session_id: sessionData.id,
            start_time: slotData.start_time,
            end_time: slotData.end_time
          }
        });
      
      return sessionData as MentorSession;
    },
    onSuccess: () => {
      toast.success("Session booked successfully!");
      queryClient.invalidateQueries({ queryKey: ["mentee-sessions"] });
    },
    onError: (error) => {
      toast.error(`Failed to book session: ${error.message}`);
    }
  });

  // Update session status
  const updateSessionStatus = useMutation({
    mutationFn: async ({ sessionId, status, cancellationReason, notes, meetingLink }: {
      sessionId: string;
      status: MentorSessionStatus;
      cancellationReason?: string;
      notes?: string;
      meetingLink?: string;
    }) => {
      if (!user?.id) throw new Error("User must be logged in");
      
      // First get the current session to have access to all fields
      const { data: currentSession, error: getError } = await supabase
        .from("mentor_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
        
      if (getError) {
        console.error("Error getting session:", getError);
        throw getError;
      }
      
      // Check if user is authorized (either mentor or mentee)
      if (currentSession.mentor_id !== user.id && currentSession.mentee_id !== user.id) {
        throw new Error("Not authorized to update this session");
      }
      
      // Update session status
      const { data, error } = await supabase
        .from("mentor_sessions")
        .update({
          status,
          cancellation_reason: status === 'cancelled' ? cancellationReason : currentSession.cancellation_reason,
          cancelled_by: status === 'cancelled' ? user.id : currentSession.cancelled_by,
          session_notes: notes || currentSession.session_notes,
          session_url: meetingLink || currentSession.session_url
        })
        .eq("id", sessionId)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating session:", error);
        throw error;
      }
      
      // If cancelled, free up the availability slot
      if (status === 'cancelled') {
        await supabase
          .from("mentor_availability_slots")
          .update({ is_booked: false, session_id: null })
          .eq("session_id", sessionId);
      }
      
      // Create notification for the other party
      const otherUserId = user.id === currentSession.mentor_id 
        ? currentSession.mentee_id 
        : currentSession.mentor_id;
        
      await supabase
        .from("notifications")
        .insert({
          user_id: otherUserId,
          sender_id: user.id,
          notification_type: `session_${status}`,
          related_id: sessionId,
          related_type: 'mentor_session',
          message: `Your session has been ${status}`
        });
      
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
      
      toast.success(statusMessages[data.status as MentorSessionStatus] || "Session status updated");
      queryClient.invalidateQueries({ queryKey: ["mentor-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["mentee-sessions"] });
    },
    onError: (error) => {
      toast.error(`Failed to update session: ${error.message}`);
    }
  });

  // Submit a review for a completed session
  const submitSessionReview = useMutation({
    mutationFn: async ({ sessionId, rating, content }: {
      sessionId: string;
      rating: number;
      content: string;
    }) => {
      if (!user?.id) throw new Error("User must be logged in");
      
      // Check if session exists and is completed
      const { data: sessionData, error: sessionError } = await supabase
        .from("mentor_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
        
      if (sessionError) {
        console.error("Error getting session:", sessionError);
        throw sessionError;
      }
      
      if (sessionData.status !== 'completed') {
        throw new Error("Can only review completed sessions");
      }
      
      // Check if user is participating in the session
      if (sessionData.mentor_id !== user.id && sessionData.mentee_id !== user.id) {
        throw new Error("Not authorized to review this session");
      }
      
      // Check if user already submitted a review
      const { data: existingReview, error: reviewCheckError } = await supabase
        .from("session_reviews")
        .select("*")
        .eq("session_id", sessionId)
        .eq("reviewer_id", user.id)
        .maybeSingle();
        
      if (reviewCheckError) {
        console.error("Error checking existing review:", reviewCheckError);
        throw reviewCheckError;
      }
      
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
        
      if (error) {
        console.error("Error submitting review:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["session-reviews"] });
    },
    onError: (error) => {
      toast.error(`Failed to submit review: ${error.message}`);
    }
  });

  // Update mentor profile settings (bio, rates, etc.)
  const updateMentorProfile = useMutation({
    mutationFn: async (params: UpdateMentorProfileParams) => {
      if (!user?.id) throw new Error("User must be logged in");
      
      const updates: Record<string, any> = {};
      
      if (params.mentorBio !== undefined) {
        updates.mentor_bio = params.mentorBio;
      }
      
      if (params.hourlyRate !== undefined) {
        updates.mentor_hourly_rate = params.hourlyRate;
      }
      
      // Only update fields that are provided
      if (Object.keys(updates).length === 0) {
        throw new Error("No fields to update");
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating mentor profile:", error);
        throw error;
      }
      
      return formatProfileData(data) as MentorProfile;
    },
    onSuccess: () => {
      toast.success("Mentor profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-profile"] });
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    }
  });

  // Set up realtime subscriptions for sessions
  useEffect(() => {
    if (!user?.id) return;
    
    // Set up realtime subscriptions
    const sessionChannel = supabase
      .channel('session-updates')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'mentor_sessions',
        filter: `mentor_id=eq.${user.id}`
      }, (payload) => {
        console.log('Session update received:', payload);
        queryClient.invalidateQueries({ queryKey: ["mentor-sessions"] });
      })
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'mentor_sessions',
        filter: `mentee_id=eq.${user.id}`
      }, (payload) => {
        console.log('Session update received:', payload);
        queryClient.invalidateQueries({ queryKey: ["mentee-sessions"] });
      })
      .subscribe();

    const availabilityChannel = supabase
      .channel('availability-updates')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'mentor_availability_slots',
        filter: `mentor_id=eq.${user.id}`
      }, (payload) => {
        console.log('Availability update received:', payload);
        queryClient.invalidateQueries({ queryKey: ["mentor-availability"] });
      })
      .subscribe();
    
    // Clean up subscriptions
    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(availabilityChannel);
    };
  }, [user?.id, queryClient]);

  return {
    // Queries
    getMentors,
    getMentorProfile,
    getMentorSessionTypes,
    getMentorAvailability,
    getMentorApplication,
    getMentorSessions,
    getMenteeSessions,
    
    // Mutations
    applyToBecomeMentor,
    addAvailabilitySlot,
    upsertSessionType,
    bookSession,
    updateSessionStatus,
    submitSessionReview,
    updateMentorProfile,
  };
}
