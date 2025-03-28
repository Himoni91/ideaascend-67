
import { ProfileType } from "./profile";

export type PitchCategory = 
  | 'AI' 
  | 'Fintech' 
  | 'Health' 
  | 'Education' 
  | 'E-commerce' 
  | 'SaaS' 
  | 'Mobile App' 
  | 'Social Media' 
  | 'Blockchain' 
  | 'Gaming' 
  | 'Environment' 
  | 'Other';

export interface Pitch {
  id: string;
  user_id: string;
  title: string;
  problem_statement: string; // Maps to 'description' in the database
  target_audience: string;
  solution: string;
  category: PitchCategory | string;
  tags: string[];
  media_url?: string | null;
  media_type?: string | null;
  votes_count: number;
  comments_count: number;
  mentor_reviews_count: number;
  trending_score: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string; // Changed from optional to required to match usage in use-pitches.ts
  author?: ProfileType;
  user_vote?: 'up' | 'down' | null;
  
  // For database compatibility
  description?: string; // This maps to problem_statement in our UI
  follower_count?: number;
}

export interface PitchComment {
  id: string;
  pitch_id: string;
  user_id: string;
  content: string;
  is_mentor_comment: boolean;
  created_at: string;
  author?: ProfileType;
}

export interface MentorReview {
  id: string;
  pitch_id: string;
  mentor_id: string;
  content: string;
  rating: number;
  created_at: string;
  mentor?: ProfileType;
}

export interface PitchVote {
  id: string;
  pitch_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface PitchFormData {
  title: string;
  problem_statement: string;
  target_audience: string;
  solution: string;
  category: PitchCategory | string;
  tags: string[];
  media_file?: File | null;
  is_premium?: boolean;
}

export interface PitchAnalytics {
  views: number;
  votes: number;
  comments: number;
  reviews: number;
  trending_score: number;
}
