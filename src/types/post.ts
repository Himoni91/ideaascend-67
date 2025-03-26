
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
  created_at: string;
  author?: ProfileType;
  categories?: PostCategory[];
  userReaction?: PostReaction | null;
  isTrending?: boolean;
};

export type PostWithCategories = Post & {
  categories: PostCategory[];
};

export type FeedFilter = 'all' | 'following' | 'trending';
