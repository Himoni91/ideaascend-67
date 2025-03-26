
export type ProfileType = {
  id: string;
  username: string;
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
  is_mentor: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};
