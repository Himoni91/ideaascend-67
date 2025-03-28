export type PitchStatus = 'open' | 'in_review' | 'funded' | 'rejected';

export type Pitch = {
  id: string;
  title: string;
  description: string;
  problem_statement: string;
  solution: string;
  target_market: string;
  business_model: string;
  funding_stage?: string;
  funding_amount?: number;
  team_members?: string[];
  status: PitchStatus;
  tags: string[];
  is_premium: boolean;
  user_id: string;
  created_at: string;
  updated_at: string; // Added to fix TypeScript errors
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
};

export type PitchComment = {
  id: string;
  pitch_id: string;
  user_id: string;
  content: string;
  created_at: string;
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
  created_at: string;
};

export type PitchView = {
  id: string;
  pitch_id: string;
  user_id: string;
  created_at: string;
};
