
export type PitchStatus = 'open' | 'in_review' | 'funded' | 'rejected';

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

export type Pitch = {
  id: string;
  title: string;
  description: string;
  problem_statement: string;
  solution: string;
  target_market: string;
  target_audience?: string;
  business_model: string;
  funding_stage?: string;
  funding_amount?: number;
  team_members?: string[];
  status: PitchStatus;
  tags: string[];
  is_premium: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  votes_count: number;
  views_count: number;
  comments_count: number;
  mentor_reviews_count: number;
  trending_score: number;
  category: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'document';
  follower_count: number;
  author: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
  user_vote?: 'up' | 'down' | null;
};

export type PitchComment = {
  id: string;
  pitch_id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_mentor_comment?: boolean;
  author: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
};

export type PitchVote = {
  id: string;
  pitch_id: string;
  user_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
};

export type PitchView = {
  id: string;
  pitch_id: string;
  user_id: string;
  created_at: string;
};

export type MentorReview = {
  id: string;
  pitch_id: string;
  mentor_id: string;
  content: string;
  rating: number;
  created_at: string;
  mentor: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    is_verified?: boolean;
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
  is_premium: boolean;
};

// This type represents the actual shape of data coming from the database
export type PitchRawData = {
  id: string;
  title: string;
  description: string;
  target_audience?: string;
  solution?: string;
  category: string;
  tags: string[];
  is_premium: boolean;
  user_id: string;
  created_at: string;
  votes_count: number;
  comments_count: number;
  mentor_reviews_count: number;
  trending_score: number;
  media_url?: string;
  media_type?: string;
  follower_count: number;
  author?: any;
  updated_at?: string;
};
