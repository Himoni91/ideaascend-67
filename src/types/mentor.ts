export type MentorSessionStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'upcoming' | 'past' | 'in-progress' | 'rescheduled';

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
  mentor?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    username?: string;
  };
  mentee?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    username?: string;
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
  mentor_hourly_rate?: number;
}

export interface MentorFilter {
  expertise?: string[];
  priceRange?: [number, number];
  rating?: number;
  availability?: string[];
  searchTerm?: string;
  specialties?: string[];
  price_range?: [number, number];
  search?: string;
}

export interface MentorApplication {
  id: string;
  user_id: string;
  bio: string;
  experience: string;
  expertise: string[];
  status: string;
  hourly_rate?: number;
  created_at: string;
  updated_at?: string;
  approved_at?: string;
  reviewed_by?: string;
  feedback?: string;
}

export interface MentorReviewExtended {
  id: string;
  session_id: string;
  reviewer_id: string;
  mentor_id: string;
  rating: number;
  content: string;
  created_at: string;
  reviewer?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    username?: string;
  };
}

export interface MentorAnalytics {
  total_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  average_rating: number;
  total_earnings: number;
  earnings_by_month: Record<string, number>;
  sessions_by_month: Record<string, number>;
  upcoming_sessions?: number;
  popular_session_types: Array<{
    name: string;
    count: number;
  }>;
}

export enum MentorSpecialty {
  BUSINESS_STRATEGY = "Business Strategy",
  MARKETING = "Marketing",
  PRODUCT_DEVELOPMENT = "Product Development",
  FUNDING = "Funding & Investment",
  TECHNOLOGY = "Technology & Engineering",
  DESIGN = "Design & UX",
  LEADERSHIP = "Leadership & Management",
  SALES = "Sales & Business Development",
  FINANCE = "Finance & Accounting",
  LEGAL = "Legal & Compliance",
  STARTUP_STRATEGY = "Startup Strategy",
  FUNDRAISING = "Fundraising",
  USER_ACQUISITION = "User Acquisition",
  TECHNICAL_ARCHITECTURE = "Technical Architecture",
  UX_DESIGN = "UX Design",
  BUSINESS_MODEL = "Business Model",
  TEAM_BUILDING = "Team Building",
  PITCH_DECK = "Pitch Deck",
  FINANCIAL_MODELING = "Financial Modeling",
  GROWTH_HACKING = "Growth Hacking",
  CUSTOMER_DEVELOPMENT = "Customer Development",
  OTHER = "Other"
}

export function asMentorProfile(profile: ProfileType): MentorProfile {
  return profile as unknown as MentorProfile;
}
