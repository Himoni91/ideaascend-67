
import { User as SupabaseUser } from '@supabase/supabase-js';

// Extended User interface to include custom properties from the profiles table
export interface User extends SupabaseUser {
  is_mentor?: boolean;
  profile?: {
    avatar_url?: string;
    full_name?: string;
    username?: string;
    bio?: string;
    expertise?: string[];
    mentor_hourly_rate?: number;
  };
}
