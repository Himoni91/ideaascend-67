
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
  byline: string | null;
  profile_completion_percentage?: number;
  profile_header_url?: string | null;
  public_email?: boolean | null;
  
  // Additional fields that may be added by the backend
  professional_headline?: string | null;
  
  // Mentor-specific fields
  mentor_bio?: string | null;
  mentor_hourly_rate?: number | null;
  mentor_session_types?: MentorSessionTypeInfo[] | null;
  work_experience?: any; // Handle database Json type
  education?: any; // Handle database Json type
  
  // Additional fields for UI/UX
  level: number;
  xp: number;
  badges: Array<{name: string, icon: string, description: string, earned: boolean}> | any;
  stats: {
    followers: number;
    following: number;
    ideas: number;
    mentorSessions: number;
    posts: number;
    rank?: number; // Leaderboard position
    mentorRating?: number; // Average mentor rating
    mentorReviews?: number; // Number of reviews received
  } | any;
  followers?: ProfileType[];
  following?: ProfileType[];
  certifications?: Array<{name: string, issuer: string, date: string}>;
  availability?: Array<{date: string, slots: Array<{start: string, end: string, booked: boolean}>}>;
  reviews?: Array<{
    id: string,
    reviewer_id: string,
    reviewer_name: string,
    reviewer_avatar: string,
    rating: number,
    comment: string,
    date: string
  }>;
  posts?: Array<{
    id: string,
    content: string,
    category: string,
    createdAt: string,
    likes: number,
    comments: number
  }>;
  ideas?: Array<{
    id: string,
    title: string,
    description: string,
    tags: string[],
    votes: number,
    comments: number,
    mentorReviews: number,
    createdAt: string
  }>;
};

interface MentorSessionTypeInfo {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  currency?: string;
  is_free?: boolean;
  is_featured?: boolean;
  color?: string;
}
