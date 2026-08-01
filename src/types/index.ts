export interface UserProfile {
  name: string;
  email: string;
  age: number | null;
  occupation: string;
  monthlyIncome: number | null;
  riskLevel: RiskLevel | null;
  joinedAt: string;
  notificationsEnabled: boolean;
  isAdmin?: boolean;
}

export type BetOutcome = 'won' | 'lost';
export type BetStatus = 'pending' | 'settled';

export interface BetRecord {
  id: string;
  date: string;
  platform: string;
  sport: string;
  amount: number;
  outcome: BetOutcome;
  notes: string;
  status?: BetStatus;
  source?: 'manual' | 'sportsbook';
}

export type MatchSport = 'Football' | 'Basketball' | 'Tennis';
export type MatchStatus = 'upcoming' | 'live' | 'finished';
export type SlipStatus = 'pending' | 'won' | 'lost';
export type SlipMarket = 'home' | 'draw' | 'away';

export interface Match {
  id: string;
  sport: MatchSport;
  league: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  homeOdds: number;
  drawOdds: number | null;
  awayOdds: number;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  featured?: boolean;
}

export interface SlipSelection {
  matchId: string;
  team: string;
  market: SlipMarket;
  odds: number;
}

export interface SportsbookBet {
  id: string;
  betId: string;
  selections: SlipSelection[];
  stake: number;
  combinedOdds: number;
  potentialReturn: number;
  placedAt: string;
  status: SlipStatus;
  payout?: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  createdAt: string;
}

export type NotificationType =
  | 'warning'
  | 'success'
  | 'info'
  | 'achievement'
  | 'reminder';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface PostComment {
  id: string;
  author: string;
  content: string;
  date: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  authorId?: string;
  title: string;
  content: string;
  tag: string;
  likes: number;
  liked: boolean;
  comments: PostComment[];
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'coach';
  text: string;
  time: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  target: number;
  progress: number;
  unit: string;
  reward: string;
  completed: boolean;
  claimed: boolean;
}

export interface RiskAssessmentResult {
  level: RiskLevel;
  score: number;
  answers: number[];
  completedAt: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  completedAt: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  icon: string;
  gradient: string;
  sections: { heading: string; body: string }[];
}
