
import { User } from "./auth";

export type ChallengeStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';
export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ChallengeCategory = 
  | 'onboarding' 
  | 'participation' 
  | 'community' 
  | 'networking' 
  | 'mentorship'
  | 'engagement'
  | 'achievement'
  | 'growth'
  | 'creativity'
  | 'recognition';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  xp_reward: number;
  badge_id?: string;
  requirements: Record<string, any>;
  created_at: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  is_featured: boolean;
  completion_criteria?: Record<string, any>;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  status: ChallengeStatus;
  progress: Record<string, any>;
  started_at: string;
  completed_at?: string;
  xp_earned: number;
  created_at: string;
  challenge?: Challenge;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  date_range: 'weekly' | 'monthly';
  xp: number;
  weekly_xp: number;
  monthly_xp: number;
  rank: number;
  level: number;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

export interface XpTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  reference_id?: string;
  reference_type?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UserProgress {
  user_id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  level: number;
  xp: number;
  total_challenges_started: number;
  challenges_completed: number;
  badges_earned: number;
  total_xp_earned: number;
  profile_completion_percentage: number;
}

export interface LevelInfo {
  level: number;
  xp_required: number;
  xp_for_next_level: number;
  progress_percentage: number;
}

export interface AscendContextType {
  userProgress: UserProgress | null;
  challenges: Challenge[];
  userChallenges: UserChallenge[];
  leaderboard: LeaderboardEntry[];
  levelInfo: LevelInfo | null;
  recentActivity: XpTransaction[];
  loading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
}
