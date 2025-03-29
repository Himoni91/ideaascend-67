
import { ProfileType } from "./profile";

export interface DiscoverItem {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  imageUrl: string | null;
  tags: string[] | null;
  viewCount: number;
  createdAt: string;
  trendingScore: number;
  isFeatured: boolean;
  createdBy: string | null;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  position: string | null;
}

export interface DiscoverContent {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  image_url?: string;
  tags?: string[];
  view_count?: number;
  created_at: string;
  trending_score?: number;
  is_featured?: boolean;
  created_by: string;
  user_has_liked?: boolean;
  user_has_saved?: boolean;
  likes_count?: number;
  profile?: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    is_verified?: boolean;
    position?: string;
    company?: string;
  };
  metadata?: {
    [key: string]: any;
    event_date?: string;
    location?: string;
    time?: string;
    host?: string;
    attendees_count?: number;
    event_type?: string;
    content_subtype?: string;
    duration?: string | number;
    source?: string;
    url?: string;
    comments_count?: number;
    content?: string;
  };
}

export interface DiscoverCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface DiscoverFilter {
  contentType?: string;
  searchTerm?: string;
  tags?: string[];
  category?: string;
  sortBy?: "latest" | "trending" | "popular";
  featured?: boolean;
}
