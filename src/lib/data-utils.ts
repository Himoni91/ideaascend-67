
import { 
  MentorAvailabilitySlotRow, 
  MentorSessionRow, 
  MentorSessionTypeRow,
  asMentorAvailabilitySlot,
  asMentorSessionType,
  asMentorSession
} from "@/lib/database-types";
import { 
  MentorAvailabilitySlot, 
  MentorSession, 
  MentorSessionTypeInfo,
  MentorReviewExtended
} from "@/types/mentor";
import { ProfileType } from "@/types/profile";

/**
 * Format profile data from database
 */
export function formatProfileData(data: any): ProfileType {
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
    expertise: data.expertise,
    is_mentor: data.is_mentor || false,
    is_verified: data.is_verified || false,
    created_at: data.created_at,
    updated_at: data.updated_at || data.created_at,
    byline: data.byline || null,
    profile_completion_percentage: data.profile_completion_percentage || 0,
    profile_header_url: data.profile_header_url || null,
    professional_headline: data.professional_headline || null,
    mentor_bio: data.mentor_bio || null,
    mentor_hourly_rate: data.mentor_hourly_rate || null,
    level: data.level || 1,
    xp: data.xp || 0,
    badges: data.badges || [],
    stats: data.stats || {
      followers: 0,
      following: 0,
      ideas: 0,
      mentorSessions: 0,
      posts: 0,
      rank: 0,
      mentorRating: 0,
      mentorReviews: 0
    },
    
    // If mentor_session_types is included in the query
    mentor_session_types: data.mentor_session_types 
      ? data.mentor_session_types.map((type: any) => formatSessionTypeData(type))
      : null,
      
    // Additional fields that may be used in the UI
    work_experience: data.work_experience || [],
    education: data.education || []
  };
}

/**
 * Format availability slot data from database
 */
export function formatAvailabilitySlotData(data: MentorAvailabilitySlotRow): MentorAvailabilitySlot {
  const slot = asMentorAvailabilitySlot(data);
  
  return {
    id: slot.id,
    mentor_id: slot.mentor_id,
    start_time: slot.start_time,
    end_time: slot.end_time,
    is_booked: slot.is_booked,
    session_id: slot.session_id,
    created_at: slot.created_at,
    recurring_rule: slot.recurring_rule
  };
}

/**
 * Format session type data from database
 */
export function formatSessionTypeData(data: MentorSessionTypeRow): MentorSessionTypeInfo {
  const sessionType = asMentorSessionType(data);
  
  return {
    id: sessionType.id,
    name: sessionType.name,
    description: sessionType.description,
    duration: sessionType.duration,
    price: sessionType.price,
    currency: sessionType.currency || 'USD',
    is_free: sessionType.is_free || false,
    is_featured: sessionType.is_featured || false,
    color: sessionType.color || null
  };
}

/**
 * Format session data from database
 */
export function formatSessionData(data: MentorSessionRow): MentorSession {
  const session = asMentorSession(data);
  
  return {
    id: session.id,
    mentor_id: session.mentor_id,
    mentee_id: session.mentee_id,
    title: session.title,
    description: session.description,
    start_time: session.start_time,
    end_time: session.end_time,
    status: session.status as any,
    payment_status: session.payment_status as any,
    payment_provider: session.payment_provider as any,
    payment_id: session.payment_id,
    payment_amount: session.payment_amount,
    payment_currency: session.payment_currency,
    session_url: session.session_url,
    session_notes: session.session_notes,
    cancellation_reason: session.cancellation_reason,
    cancelled_by: session.cancelled_by,
    session_type: session.session_type || "",
    created_at: session.created_at,
    price: session.price,
    metadata: session.metadata || {},
    
    // If the mentor/mentee profile is included in the query
    mentor: data.mentor ? formatProfileData(data.mentor) : undefined,
    mentee: data.mentee ? formatProfileData(data.mentee) : undefined
  };
}

/**
 * Format review data from database
 */
export function formatReviewData(data: any): MentorReviewExtended {
  return {
    id: data.id,
    session_id: data.session_id,
    reviewer_id: data.reviewer_id,
    mentor_id: data.mentor_id || "",
    rating: data.rating,
    content: data.content,
    created_at: data.created_at,
    
    // If the reviewer profile is included in the query
    reviewer: data.reviewer ? formatProfileData(data.reviewer) : undefined
  };
}

/**
 * Transform any database data to the expected frontend format
 */
export function transformDatabaseData<T>(data: any, transform: (item: any) => T): T[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(transform);
}

/**
 * Create a safe placeholder profile
 */
export function createSafeProfile(partialProfile?: Partial<ProfileType>): ProfileType {
  return {
    id: partialProfile?.id || "",
    username: partialProfile?.username || "",
    full_name: partialProfile?.full_name || null,
    avatar_url: partialProfile?.avatar_url || null,
    bio: partialProfile?.bio || null,
    location: partialProfile?.location || null,
    website: partialProfile?.website || null,
    linkedin_url: partialProfile?.linkedin_url || null,
    twitter_url: partialProfile?.twitter_url || null,
    company: partialProfile?.company || null,
    position: partialProfile?.position || null,
    expertise: partialProfile?.expertise || null,
    is_mentor: partialProfile?.is_mentor || false,
    is_verified: partialProfile?.is_verified || false,
    created_at: partialProfile?.created_at || new Date().toISOString(),
    updated_at: partialProfile?.updated_at || new Date().toISOString(),
    byline: partialProfile?.byline || null,
    level: partialProfile?.level || 1,
    xp: partialProfile?.xp || 0,
    badges: partialProfile?.badges || [],
    stats: partialProfile?.stats || {
      followers: 0,
      following: 0,
      ideas: 0,
      mentorSessions: 0,
      posts: 0,
    },
  };
}
