import { ProfileType } from "./profile";

export type MentorSessionType = 'quick' | 'standard' | 'deep-dive' | 'custom';
export type MentorSessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
export type MentorPaymentStatus = 'pending' | 'completed' | 'refunded' | 'failed';
export type MentorPaymentProvider = 'razorpay' | 'paypal' | 'credits' | 'free';
export type MentorApplicationStatus = 'pending' | 'approved' | 'rejected' | 'more_info';

export type MentorSpecialty = 
  | 'Startup Strategy'
  | 'Product Development'
  | 'Fundraising'
  | 'Marketing'
  | 'User Acquisition'
  | 'Technical Architecture'
  | 'UX Design'
  | 'Business Model'
  | 'Team Building'
  | 'Pitch Deck'
  | 'Financial Modeling'
  | 'Growth Hacking'
  | 'Sales'
  | 'Customer Development'
  | 'Other';

export interface MentorSessionTypeInfo {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  currency?: string;
  is_free?: boolean;
  is_featured?: boolean;
  color?: string;
}

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

export interface MentorSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: MentorSessionStatus;
  payment_status: MentorPaymentStatus;
  payment_provider?: MentorPaymentProvider;
  payment_id?: string;
  payment_amount?: number;
  payment_currency?: string;
  session_url?: string;
  session_notes?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  session_type: string;
  created_at: string;
  metadata?: Record<string, any>;
  mentor?: ProfileType;
  mentee?: ProfileType;
}

export interface MentorReviewExtended {
  id: string;
  session_id: string;
  reviewer_id: string;
  mentor_id: string;
  rating: number;
  content: string;
  created_at: string;
  reviewer?: ProfileType;
}

export interface MentorPortfolioItem {
  title: string;
  description: string;
  url?: string;
  image_url?: string;
  date: string;
}

export interface MentorCertification {
  name: string;
  issuer: string;
  date: string;
  url?: string;
  image_url?: string;
}

export interface MentorApplication {
  id: string;
  user_id: string;
  bio: string;
  experience: string;
  expertise: string[];
  hourly_rate?: number;
  status: MentorApplicationStatus;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  reviewed_by?: string;
  feedback?: string;
  certifications?: MentorCertification[];
  portfolio_links?: MentorPortfolioItem[];
}

export interface MentorFilter {
  specialties?: string[];
  price_range?: [number, number];
  rating?: number;
  availability?: string; // day of week or date
  search?: string;
}

export interface MentorAnalytics {
  total_sessions: number;
  completed_sessions: number;
  average_rating: number;
  total_earnings: number;
  session_duration_total: number; // minutes
  upcoming_sessions: number;
  repeat_mentees: number;
  reviews_count: number;
}

export interface MentorProfile extends ProfileType {
  mentor_bio?: string;
  mentor_hourly_rate?: number;
  mentor_session_types?: MentorSessionTypeInfo[];
}

export const asMentorProfile = (profile: ProfileType): MentorProfile => {
  return profile as MentorProfile;
};
