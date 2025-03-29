
import { Json } from "@/integrations/supabase/types";

export interface DiscoverCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  created_at?: string;
}

export interface DiscoverFilter {
  category?: string;
  searchTerm?: string;
  contentType?: string;
  sortBy?: 'trending' | 'latest' | 'popular';
  tags?: string[];
}

export interface DiscoverContent {
  id: string;
  title: string;
  description: string;
  content_type: string;
  image_url: string;
  tags: string[];
  view_count: number;
  created_at: string;
  trending_score: number;
  is_featured: boolean;
  created_by: string;
  metadata: {
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
  profile: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    is_verified?: boolean;
    position?: string;
    company?: string;
  };
  user_has_liked?: boolean;
  user_has_saved?: boolean;
  likes_count?: number;
}
