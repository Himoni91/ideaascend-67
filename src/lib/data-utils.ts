
import { Json } from "@/integrations/supabase/types";
import { MentorAvailabilitySlot, MentorSession, MentorReviewExtended } from "@/types/mentor";
import { ProfileType } from "@/types/profile";

/**
 * Converts a raw database profile object to our frontend ProfileType
 */
export const formatProfileData = (data: any): ProfileType => {
  return {
    id: data.id,
    username: data.username,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    bio: data.bio,
    location: data.location,
    website: data.website,
    linkedin_url: data.linkedin_url,
    twitter_url: data.twitter_url,
    company: data.company,
    position: data.position,
    expertise: data.expertise || [],
    is_mentor: !!data.is_mentor,
    is_verified: !!data.is_verified,
    created_at: data.created_at,
    updated_at: data.updated_at,
    byline: data.byline,
    profile_completion_percentage: data.profile_completion_percentage,
    profile_header_url: data.profile_header_url,
    professional_headline: data.professional_headline,
    mentor_bio: data.mentor_bio,
    mentor_hourly_rate: data.mentor_hourly_rate,
    mentor_session_types: data.mentor_session_types,
    work_experience: data.work_experience,
    education: data.education,
    
    // UI data with defaults
    level: data.level || 1,
    xp: data.xp || 0,
    badges: Array.isArray(data.badges) ? data.badges : [],
    stats: data.stats || {
      followers: 0,
      following: 0,
      ideas: 0,
      mentorSessions: 0,
      posts: 0,
      mentorRating: data.mentor_rating || 4.5,
      mentorReviews: data.mentor_reviews_count || 0
    }
  };
};

/**
 * Converts raw availability slot data from the database
 */
export const formatAvailabilitySlotData = (data: any): MentorAvailabilitySlot => {
  return {
    id: data.id,
    mentor_id: data.mentor_id,
    start_time: data.start_time,
    end_time: data.end_time,
    is_booked: !!data.is_booked,
    session_id: data.session_id,
    created_at: data.created_at,
    recurring_rule: data.recurring_rule
  };
};

/**
 * Converts raw session data from the database
 */
export const formatSessionData = (data: any): MentorSession => {
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
    session_type: data.session_type || 'standard',
    created_at: data.created_at,
    metadata: data.metadata,
    mentor: data.mentor ? formatProfileData(data.mentor) : undefined,
    mentee: data.mentee ? formatProfileData(data.mentee) : undefined
  };
};

/**
 * Converts raw review data from the database
 */
export const formatReviewData = (data: any): MentorReviewExtended => {
  return {
    id: data.id,
    session_id: data.session_id,
    reviewer_id: data.reviewer_id,
    mentor_id: data.mentor_id || data.session?.mentor_id,
    rating: data.rating,
    content: data.content,
    created_at: data.created_at,
    reviewer: data.reviewer ? formatProfileData(data.reviewer) : undefined
  };
};
