
import { ProfileType } from "./profile";

export type PostCategory = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  created_at: string;
};

export type PostReaction = {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
};

export type PostComment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  user?: ProfileType;
  replies?: PostComment[];
};

export type PollOption = {
  id: string;
  poll_id: string;
  option_text: string;
  created_at: string;
  votes_count?: number;
  has_voted?: boolean;
};

export type Poll = {
  id: string;
  post_id: string;
  question: string;
  created_at: string;
  expires_at: string | null;
  is_multiple_choice: boolean;
  options: PollOption[];
  total_votes?: number;
};

export type LinkPreview = {
  url: string;
  title: string;
  description: string;
  image: string;
  domain: string;
};

export type DatabaseProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  company: string | null;
  position: string | null;
  expertise: string[] | null;
  is_mentor: boolean | null;
  is_verified: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  level: number | null;
  xp: number | null;
  badges: any;
  stats: any;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  category: string | null;
  likes_count: number | null;
  comments_count: number | null;
  view_count: number | null;
  trending_score: number | null;
  reposts_count: number | null;
  created_at: string;
  author?: Omit<ProfileType, 'badges'> & {
    badges?: any;
  };
  categories?: PostCategory[];
  userReaction?: PostReaction | null;
  isReposted?: boolean;
  isTrending?: boolean;
  poll?: Poll;
  link_preview?: LinkPreview;
};

export type PostWithCategories = Post & {
  categories: PostCategory[];
};

export type FeedFilter = 'all' | 'following' | 'trending';

export type ReactionType = 'like' | 'insightful' | 'fundable' | 'repost';

export type SharingOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: (post: Post) => void;
};
