
export type MentorSessionStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'upcoming' | 'past';

export interface MentorAvailabilitySlot {
  id: string;
  mentor_id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  session_id?: string;
  created_at: string;
  recurring_rule?: string;
}

export interface MentorSessionTypeInfo {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  is_free: boolean;
  color?: string;
  is_featured?: boolean;
  currency?: string;
  mentor_id: string;
}

export interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  start_time: string;
  end_time: string;
  title: string;
  description?: string;
  session_type: string;
  status: MentorSessionStatus;
  session_url?: string;
  price?: number;
  payment_status?: string;
  payment_id?: string;
  payment_amount?: number;
  payment_currency?: string;
  payment_provider?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  session_notes?: string;
  created_at: string;
  mentor_name?: string;
  mentee_name?: string;
  mentor_avatar_url?: string;
  mentee_avatar_url?: string;
  location?: string;
  is_mentor?: boolean;
  metadata?: {
    [key: string]: any;
  };
}

export interface MentorProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
  bio?: string;
  mentor_bio?: string;
  position?: string;
  company?: string;
  expertise?: string[];
  is_verified?: boolean;
  is_mentor: boolean;
  stats?: {
    mentorRating?: number;
    mentorReviews?: number;
    sessionCount?: number;
    completionRate?: number;
  };
  professional_headline?: string;
  work_experience?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    startYear: string;
    endYear?: string;
    description?: string;
  }>;
  mentor_session_types?: MentorSessionTypeInfo[];
}

export interface MentorFilter {
  expertise?: string[];
  priceRange?: [number, number];
  rating?: number;
  availability?: string[];
  searchTerm?: string;
}
