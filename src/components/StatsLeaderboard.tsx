import React, { useState, useEffect } from 'react';
import { CommunityStats, LeaderboardUser, Issue } from '../types';
import { 
  Award, 
  Trophy, 
  CheckCircle, 
  BarChart3, 
  AlertCircle, 
  Wrench, 
  Shield, 
  Users, 
  RefreshCw,
  User,
  ChevronDown,
  ChevronUp,
  FileText,
  MessageSquare,
  ThumbsUp,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StatsLeaderboardProps {
  issues?: Issue[];
  currentUser?: string;
}

export default function StatsLeaderboard({ issues = [], currentUser = 'luffyfocusmode@gmail.com' }: StatsLeaderboardProps) {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileExpanded, setProfileExpanded] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error('Failed to retrieve district audit data.');
      const result = await res.json();
      setStats(result);
    } catch (err: any) {
      setError(err.message || 'Server did not respond to audit request.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-2 glass-panel border-0 rounded-2xl shadow-2xl">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-300">Calculating district metrics & citizen scoreboards...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center bg-red-500/5 border border-red-500/20 rounded-2xl space-y-2">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <p className="text-sm font-semibold text-red-400">Metrics Sync Failed</p>
        <p className="text-xs text-red-400/80">{error || 'Unknown error'}</p>
        <button
          onClick={fetchStats}
          className="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
        >
          Retry Sync
        </button>
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    pothole: 'Potholes Patching',
    water_leak: 'Water Line Leaks',
    broken_light: 'Street Light Hazards',
    waste: 'Bulk Trash & Waste',
    infrastructure: 'Sidewalk/Road Infrastructure',
    other: 'Other Concerns'
  };

  const categoryColors: Record<string, string> = {
    pothole: 'bg-red-500',
    water_leak: 'bg-blue-500',
    broken_light: 'bg-amber-500',
    waste: 'bg-emerald-500',
    infrastructure: 'bg-purple-500',
    other: 'bg-slate-400'
  };

  const totalClosedPercentage = stats.totalIssues > 0
    ? Math.round((stats.resolvedCount / stats.totalIssues) * 100)
    : 0;

  // Dynamic user-specific calculations
  const userIssues = issues.filter(issue => issue.reporter === currentUser);
  const totalReportsCount = userIssues.length;

  const resolvedReportsCount = userIssues.filter(issue => issue.status === 'resolved').length;
  const resolutionSuccessRate = totalReportsCount > 0
    ? Math.round((resolvedReportsCount / totalReportsCount) * 100)
    : 0;

  // Find user data in leaderboard if exists
  const leaderboardInfo = stats?.pointsLeaderboard?.find(
    (u) => u.email.toLowerCase() === currentUser.toLowerCase()
  );
  const userRank = stats?.pointsLeaderboard?.findIndex(
    (u) => u.email.toLowerCase() === currentUser.toLowerCase()
  ) !== -1
    ? (stats?.pointsLeaderboard?.findIndex(
        (u) => u.email.toLowerCase() === currentUser.toLowerCase()
      ) ?? -1) + 1
    : null;

  const userPoints = leaderboardInfo ? leaderboardInfo.points : 100;
  const userBadge = leaderboardInfo ? leaderboardInfo.badge : 'Active Citizen';

  interface ActivityItem {
    id: string;
    type: 'report' | 'comment' | 'verify' | 'vote';
    issueTitle: string;
    timestamp: string;
    details?: string;
  }

  const activities: ActivityItem[] = [];

  issues.forEach(issue => {
    // 1. Created issues
    if (issue.reporter === currentUser) {
      activities.push({
        id: `report-${issue.id}`,
        type: 'report',
        issueTitle: issue.title,
        timestamp: issue.createdAt,
        details: `Filed under ${issue.category.replace('_', ' ')}`
      });
    }

    // 2. Comments
    issue.comments?.forEach(comment => {
      if (comment.author === currentUser) {
        activities.push({
          id: `comment-${comment.id}`,
          type: 'comment',
          issueTitle: issue.title,
          timestamp: comment.createdAt,
          details: comment.text
        });
      }
    });

    // 3. Verifications
    issue.verifications?.forEach(v => {
      if (v.user === currentUser) {
        activities.push({
          id: `verify-${v.id}`,
          type: 'verify',
          issueTitle: issue.title,
          timestamp: v.createdAt,
          details: `${v.type === 'verify' ? 'Verified' : 'Disputed'}: ${v.notes || ''}`
        });
      }
    });

    // 4. Votes/Upvotes
    if (issue.votedUsers?.includes(currentUser)) {
      activities.push({
        id: `vote-${issue.id}`,
        type: 'vote',
        issueTitle: issue.title,
        timestamp: issue.updatedAt || issue.createdAt,
        details: 'Supported with a civic upvote'
      });
    }
  });

  // Sort activities by timestamp desc
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const recentActivities = activities.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6.5 h-6.5 text-amber-500" /> District Impact & Leaderboard
        </h2>
        <p className="text-xs text-slate-400 max-w-xl">
          Real-time accountability dashboard summarizing local resolution metrics and active civic contributions across our neighborhood bounds.
        </p>
      </div>

      {/* Interactive Current User Mini-Profile Card */}
      <div 
        id="user-profile-card-container"
        className="bg-gradient-to-r from-amber-500/10 via-amber-500/[0.02] to-transparent border border-amber-500/20 rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-amber-500/30"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div 
          onClick={() => setProfileExpanded(!profileExpanded)}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-bold text-lg font-mono shadow-md shadow-amber-500/20 shrink-0">
              {currentUser.split('@')[0].substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base font-mono">
                  {currentUser.split('@')[0]}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3" /> {userBadge}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-2">
                <span>Rank: <strong className="text-amber-500">#{userRank || 'N/A'}</strong></span>
                <span>•</span>
                <span>Civic Score: <strong className="text-amber-500">{userPoints} pts</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-10">
            {/* Reports Metric */}
            <div className="text-left font-mono">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Total Reports</span>
              <span className="text-xl font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                <FileText className="w-4 h-4 text-amber-500" />
                {totalReportsCount}
              </span>
            </div>

            {/* Resolution Success Rate */}
            <div className="text-left font-mono">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Resolution Success</span>
              <span className="text-xl font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                {resolutionSuccessRate}%
              </span>
            </div>

            {/* Expand Chevron */}
            <div className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
                {profileExpanded ? 'Hide History' : 'View History'}
              </span>
              {profileExpanded ? <ChevronUp className="w-4 h-4 text-amber-500" /> : <ChevronDown className="w-4 h-4 text-amber-500" />}
            </div>
          </div>
        </div>

        {/* Expanded Profile Activity Section */}
        <AnimatePresence>
          {profileExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-5 pt-5 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Recent Activity Timeline
                  </h4>
                </div>

                {recentActivities.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No recent activities recorded for this citizen profile. Create reports, verify issues, or support others with upvotes to populate your timeline!
                  </p>
                ) : (
                  <div className="relative pl-4 space-y-4 border-l border-white/10 ml-2 font-mono">
                    {recentActivities.map((act) => {
                      let Icon = FileText;
                      let iconColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                      let actLabel = 'Reported';

                      if (act.type === 'comment') {
                        Icon = MessageSquare;
                        iconColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                        actLabel = 'Commented';
                      } else if (act.type === 'verify') {
                        Icon = Shield;
                        iconColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                        actLabel = 'Audited';
                      } else if (act.type === 'vote') {
                        Icon = ThumbsUp;
                        iconColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
                        actLabel = 'Supported';
                      }

                      return (
                        <div key={act.id} className="relative group">
                          {/* Timeline dot */}
                          <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-all group-hover:scale-125" />
                          
                          <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3 hover:bg-white/[0.03] transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                                <span className={`p-1 rounded-md border ${iconColor}`}>
                                  <Icon className="w-3 h-3" />
                                </span>
                                {actLabel}: "{act.issueTitle}"
                              </span>
                              <span className="text-[9px] text-slate-500">
                                {new Date(act.timestamp).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            {act.details && (
                              <p className="text-[10px] text-slate-400 pl-6 leading-relaxed italic">
                                "{act.details}"
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total issues card */}
        <div className="glass-panel border-0 p-5 rounded-xl shadow-md flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-white/5 border border-white/5 text-amber-500 flex items-center justify-center font-mono font-bold text-lg">
            {stats.totalIssues}
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider block">Total Filed</span>
            <span className="text-sm font-bold text-slate-200">Street Reports</span>
          </div>
        </div>

        {/* Resolved Card */}
        <div className="glass-panel border-0 p-5 rounded-xl shadow-md flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider block">Resolved</span>
            <span className="text-sm font-bold text-slate-200">{stats.resolvedCount} Closed Cases</span>
          </div>
        </div>

        {/* In Progress Card */}
        <div className="glass-panel border-0 p-5 rounded-xl shadow-md flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider block">In Progress</span>
            <span className="text-sm font-bold text-slate-200">{stats.inProgressCount} Crew Workings</span>
          </div>
        </div>

        {/* Resolution Ratio card */}
        <div className="glass-panel border-0 p-5 rounded-xl shadow-md flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-mono font-black">
            {totalClosedPercentage}%
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider block">Resolution Ratio</span>
            <span className="text-sm font-bold text-slate-200">Closed efficiency</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: Category Distribution (2 cols) */}
        <div className="lg:col-span-2 glass-panel border-0 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-white/5 pb-3">
            <h3 className="font-bold text-white text-sm font-sans">Active Issue Distribution</h3>
            <p className="text-slate-500 text-[10px] mt-0.5">Statistical tally divided by infrastructure departments.</p>
          </div>

          <div className="space-y-4">
            {Object.entries(stats.categoryDistribution).map(([category, count]) => {
              const numericCount = Number(count);
              const percentage = stats.totalIssues > 0 ? Math.round((numericCount / stats.totalIssues) * 100) : 0;
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-medium">{categoryLabels[category] || category}</span>
                    <span className="font-mono font-semibold text-slate-200">{count} issues ({percentage}%)</span>
                  </div>
                  {/* Progress Bar background */}
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${categoryColors[category] || 'bg-slate-400'} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Leaderboard list (3 cols) */}
        <div className="lg:col-span-3 glass-panel border-0 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-white/5 pb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-white text-sm font-sans">District Community Heroes</h3>
              <p className="text-slate-500 text-[10px] mt-0.5">Top-contributing citizens based on verified reports and formal neighborhood audits.</p>
            </div>
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {stats.pointsLeaderboard?.map((user: LeaderboardUser, idx: number) => {
              const isTop3 = idx < 3;
              const trophyColors = ['text-amber-500 bg-amber-500/10 border border-amber-500/25', 'text-slate-400 bg-slate-500/10 border border-slate-500/25', 'text-amber-700 bg-amber-700/10 border border-amber-700/25'];

              return (
                <div
                  key={user.email}
                  className="flex items-center justify-between gap-4 p-3 border border-white/5 rounded-xl hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Number or Trophy */}
                    <div className="w-7.5 h-7.5 shrink-0 flex items-center justify-center text-xs font-bold font-mono rounded-lg">
                      {isTop3 ? (
                        <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center font-bold ${trophyColors[idx]}`}>
                          🏆
                        </div>
                      ) : (
                        <span className="text-slate-500">#{idx + 1}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200 text-xs font-mono">{user.email.split('@')[0]}</span>
                        <span className="text-[9px] bg-white/5 border border-white/5 font-medium px-1.5 py-0.5 rounded text-slate-400">
                          {user.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[10px] text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          📄 <strong>{user.reportsCount}</strong> reports
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          🛡️ <strong>{user.verificationsCount}</strong> audits
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-amber-500 text-sm font-mono block">
                      {user.points} pts
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wide font-semibold block font-mono">
                      Civic Score
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
