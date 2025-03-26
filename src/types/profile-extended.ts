
// Update the import to match the proper types
import type { Json } from "@/integrations/supabase/types";
import { ProfileType } from "./profile";

export interface Education {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
  description?: string;
  is_current?: boolean;
}

export interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description?: string;
  is_current?: boolean;
  skills_used?: string[];
}

export interface Achievement {
  title: string;
  date: string;
  description: string;
  url?: string;
}

export interface PortfolioItem {
  title: string;
  description: string;
  image_url?: string;
  project_url?: string;
  tags?: string[];
  date: string;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  dribbble?: string;
  behance?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
  [key: string]: string | undefined;
}

export interface ExtendedProfileType extends ProfileType {
  professional_summary?: string | null;
  education?: Education[] | null;
  work_experience?: WorkExperience[] | null;
  skills?: string[] | null;
  achievements?: Achievement[] | null;
  portfolio_items?: PortfolioItem[] | null;
  social_links?: SocialLinks | null;
  onboarding_completed?: boolean | null;
  onboarding_step?: number | null;
  mentor_bio?: string | null;
  mentor_hourly_rate?: number | null;
  mentor_availability?: Record<string, any> | null;
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected' | null;
  verification_documents?: any[] | null;
  public_email?: boolean | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  documents: any[];
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  feedback?: string;
}

export type ProfileTab = 'about' | 'posts' | 'ideas' | 'sessions' | 'badges' | 'portfolio' | 'experience';
