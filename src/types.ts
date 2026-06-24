export type IssueCategory = 'pothole' | 'water_leak' | 'broken_light' | 'waste' | 'infrastructure' | 'other';
export type IssueStatus = 'reported' | 'verified' | 'in_progress' | 'resolved';
export type SeverityLevel = 'low' | 'medium' | 'high';

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface VerificationLog {
  id: string;
  user: string;
  type: 'verify' | 'dispute';
  notes?: string;
  images?: string[];
  createdAt: string;
}

export interface StatusTransition {
  status: IssueStatus;
  timestamp: string;
}

export interface AgentTraceStep {
  agentName: string;
  status: 'success' | 'warning' | 'info';
  timestamp: string;
  message: string;
  details?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  latitude: number;
  longitude: number;
  reporter: string;
  upvotes: number;
  votedUsers: string[];
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  videoUrl?: string;
  media?: { type: 'image' | 'video'; url: string }[];
  aiCategorized: boolean;
  aiSeverity: SeverityLevel;
  aiSafetyTips?: string;
  aiSuggestedAction?: string;
  aiTags: string[];
  comments: Comment[];
  verifications: VerificationLog[];
  resolutionNotes?: string;
  resolutionImageUrl?: string;
  resolutionVideoUrl?: string;
  resolvedAt?: string;
  verifiedAt?: string;
  inProgressAt?: string;
  statusHistory?: StatusTransition[];
  agentTrace?: AgentTraceStep[];
}

export interface LeaderboardUser {
  email: string;
  points: number;
  reportsCount: number;
  verificationsCount: number;
  badge: string;
}

export interface CommunityStats {
  totalIssues: number;
  resolvedCount: number;
  inProgressCount: number;
  reportedCount: number;
  verifiedCount: number;
  categoryDistribution: Record<IssueCategory, number>;
  pointsLeaderboard: LeaderboardUser[];
}
