
export type Pitch = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  user_id: string;
  created_at: string;
  updated_at: string; 
  votes_count: number;
  comments_count: number;
  mentor_reviews_count: number;
  trending_score: number;
  is_premium: boolean;
  media_url: string | null;
  media_type: string | null;
  solution: string;
  target_audience: string;
  problem_statement: string;
  follower_count: number;
  user_vote?: 'up' | 'down' | null;
  author?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    is_mentor: boolean;
    is_verified: boolean;
  };
};

export type PitchFormData = {
  title: string;
  problem_statement: string;
  target_audience: string;
  solution: string;
  category: string;
  tags: string[];
  media_file?: File;
  is_premium?: boolean;
};

export type PitchVote = {
  id: string;
  pitch_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
};

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

export type PitchComment = {
  id: string;
  pitch_id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_mentor_comment: boolean;
  author?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    is_mentor: boolean;
    is_verified: boolean;
  };
};

export type MentorReview = {
  id: string;
  pitch_id: string;
  mentor_id: string;
  content: string;
  rating: number;
  created_at: string;
  mentor?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    is_mentor: boolean;
    is_verified: boolean;
  };
};

export type PitchAnalytics = {
  id: string;
  pitch_id: string;
  views: number;
  unique_views: number;
  engagement_time_avg: number;
  trending_score: number;
  device_breakdown: Record<string, number>;
  referring_sites: Record<string, number>;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
};

// Filter for pitch queries
export type PitchFilter = {
  category?: string;
  tag?: string;
  sort?: 'newest' | 'trending' | 'top_rated';
  is_premium?: boolean;
  search?: string;
  user_id?: string;
};
