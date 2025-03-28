
import { Json } from "@/integrations/supabase/types";
import { MentorAvailabilitySlotRow, MentorSessionTypeRow, MentorSessionRow } from "./database-types";
import { MentorAvailabilitySlot, MentorSession, MentorSessionTypeInfo, MentorReviewExtended } from "@/types/mentor";
import { ProfileType } from "@/types/profile";

export const formatProfileData = (data: any): ProfileType => {
  const defaultBadges = [
    { name: "New Member", icon: "👋", description: "Welcome to Idolyst", earned: true }
  ];
  
  const defaultStats = {
    followers: 0,
    following: 0,
    ideas: 0,
    mentorSessions: 0,
    posts: 0,
    rank: Math.floor(Math.random() * 100) + 1
  };

  let badges = defaultBadges;
  try {
    if (data.badges) {
      if (Array.isArray(data.badges)) {
        badges = data.badges as any;
      } else if (typeof data.badges === 'object') {
        badges = Object.values(data.badges);
      }
    }
  } catch (e) {
    console.error("Error parsing badges:", e);
  }

  let stats = defaultStats;
  try {
    if (data.stats) {
      if (typeof data.stats === 'object' && !Array.isArray(data.stats)) {
        stats = {
          ...defaultStats,
          ...data.stats
        };
      }
    }
  } catch (e) {
    console.error("Error parsing stats:", e);
  }

  return {
    ...data,
    level: data.level || Math.floor(Math.random() * 5) + 1,
    xp: data.xp || Math.floor(Math.random() * 2000) + 500,
    badges: badges,
    stats: stats
  } as ProfileType;
};

export const formatAvailabilitySlotData = (data: MentorAvailabilitySlotRow): MentorAvailabilitySlot => {
  if (!data) return {} as MentorAvailabilitySlot;
  
  return {
    id: data.id,
    mentor_id: data.mentor_id,
    start_time: data.start_time,
    end_time: data.end_time,
    is_booked: data.is_booked || false,
    session_id: data.session_id,
    created_at: data.created_at,
    recurring_rule: data.recurring_rule
  };
};

export const formatSessionData = (data: MentorSessionRow): MentorSession => {
  if (!data) return {} as MentorSession;
  
  return {
    id: data.id,
    mentor_id: data.mentor_id,
    mentee_id: data.mentee_id,
    title: data.title,
    description: data.description,
    start_time: data.start_time,
    end_time: data.end_time,
    status: data.status as any,
    payment_status: data.payment_status as any,
    payment_provider: data.payment_provider as any,
    payment_id: data.payment_id,
    payment_amount: data.payment_amount,
    payment_currency: data.payment_currency,
    session_url: data.session_url,
    session_notes: data.session_notes,
    cancellation_reason: data.cancellation_reason,
    cancelled_by: data.cancelled_by,
    session_type: data.session_type as any,
    created_at: data.created_at,
    metadata: data.metadata,
    mentor: data.mentor ? formatProfileData(data.mentor) : undefined,
    mentee: data.mentee ? formatProfileData(data.mentee) : undefined
  };
};

export const formatSessionTypeData = (data: MentorSessionTypeRow): MentorSessionTypeInfo => {
  if (!data) return {} as MentorSessionTypeInfo;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    duration: data.duration,
    price: data.price,
    currency: data.currency,
    is_free: data.is_free,
    is_featured: data.is_featured,
    color: data.color
  };
};

export const formatReviewData = (data: any): MentorReviewExtended => {
  if (!data) return {} as MentorReviewExtended;
  
  return {
    id: data.id,
    session_id: data.session_id,
    reviewer_id: data.reviewer_id,
    mentor_id: data.session?.mentor_id,
    rating: data.rating,
    content: data.content,
    created_at: data.created_at,
    reviewer: data.reviewer ? formatProfileData(data.reviewer) : undefined
  };
};
