import React, { useState } from 'react';
import { Issue, Comment, VerificationLog, IssueStatus } from '../types';
import CameraMediaCapture from './CameraMediaCapture';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import {
  ThumbsUp,
  MessageSquare,
  Shield,
  Activity,
  AlertTriangle,
  User,
  Calendar,
  Sparkles,
  MapPin,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Send,
  Wrench,
  Check,
  Share2,
  Cpu
} from 'lucide-react';

interface IssueDetailProps {
  issue: Issue;
  currentUser: string;
  onVote: (issueId: string) => void;
  onAddComment: (issueId: string, text: string) => void;
  onVerify: (issueId: string, type: 'verify' | 'dispute', notes: string) => void;
  onUpdateStatus: (
    issueId: string, 
    status: IssueStatus, 
    notes?: string, 
    resolutionImageUrl?: string, 
    resolutionVideoUrl?: string
  ) => void;
}

export default function IssueDetail({
  issue,
  currentUser,
  onVote,
  onAddComment,
  onVerify,
  onUpdateStatus
}: IssueDetailProps) {
  const [commentText, setCommentText] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolutionMediaUrl, setResolutionMediaUrl] = useState<string | null>(null);
  const [resolutionMediaType, setResolutionMediaType] = useState<'image' | 'video' | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Generate stable mock trend data based on issue ID
  const sparklineData = React.useMemo(() => {
    let seed = 0;
    for (let i = 0; i < issue.id.length; i++) {
      seed += issue.id.charCodeAt(i);
    }
    const data = [];
    let currentVal = 5 + (seed % 10);
    for (let i = 6; i >= 0; i--) {
      data.push({
        day: `${i === 0 ? 'Today' : i + 'd ago'}`,
        reports: currentVal
      });
      // Random walk
      const change = ((seed + i * 17) % 5) - 2;
      currentVal = Math.max(0, currentVal + change);
    }
    return data.reverse();
  }, [issue.id]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?issueId=${issue.id}`;
    const shareData = {
      title: `PublicEye: ${issue.title}`,
      text: `🚨 [Valencia-Dolores] Help audit: "${issue.title}"\nCategory: ${issue.category.replace('_', ' ')}\nStatus: ${issue.status.toUpperCase()}\nLocation: Lat ${issue.latitude.toFixed(5)}, Lng ${issue.longitude.toFixed(5)}\n\n"${issue.description}"`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareFeedback('Shared successfully!');
        setTimeout(() => setShareFeedback(null), 3000);
      } catch (err) {
        console.error('Web Share failed, falling back:', err);
        if ((err as Error).name !== 'AbortError') {
          fallbackCopyToClipboard(shareData);
        }
      }
    } else {
      fallbackCopyToClipboard(shareData);
    }
  };

  const fallbackCopyToClipboard = async (data: { title: string; text: string; url: string }) => {
    const fullText = `${data.title}\n${data.text}\nView here: ${data.url}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setShareFeedback('Details copied to clipboard!');
      setTimeout(() => setShareFeedback(null), 3000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      setShareFeedback('Failed to share or copy.');
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(issue.id, commentText.trim());
    setCommentText('');
  };

  const handleVerifySubmit = (e: React.FormEvent, type: 'verify' | 'dispute') => {
    e.preventDefault();
    onVerify(issue.id, type, verifyNotes.trim() || `${type === 'verify' ? 'Verified' : 'Disputed'} by citizen.`);
    setVerifyNotes('');
    setShowVerifyForm(false);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus(
      issue.id, 
      'resolved', 
      resolveNotes.trim() || 'Resolved by community & public coordination.',
      resolutionMediaType === 'image' ? (resolutionMediaUrl || undefined) : undefined,
      resolutionMediaType === 'video' ? (resolutionMediaUrl || undefined) : undefined
    );
    setResolveNotes('');
    setResolutionMediaUrl(null);
    setResolutionMediaType(null);
    setShowResolveForm(false);
  };

  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

  const handleQuickResolve = async () => {
    setIsGeneratingDraft(true);
    setResolveNotes('Generating draft...');
    try {
      const response = await fetch('/api/draft-resolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: issue.title,
          category: issue.category,
          description: issue.description
        })
      });
      const data = await response.json();
      if (data.draft) {
        setResolveNotes(data.draft);
      } else {
        setResolveNotes('Failed to generate draft.');
      }
    } catch (err) {
      console.error(err);
      setResolveNotes('Error generating draft. Please write manually.');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const hasVoted = issue.votedUsers?.includes(currentUser);

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'reported':
        return { label: 'Reported', color: 'bg-red-500/10 text-red-400 border-red-500/20', desc: 'Newly submitted by citizen' };
      case 'verified':
        return { label: 'Verified', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', desc: 'Confirmed by neighborhood logs' };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', desc: 'Dispatched to municipal crew' };
      case 'resolved':
        return { label: 'Resolved', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', desc: 'Issue resolved & verified' };
      default:
        return { label: 'Reported', color: 'bg-white/5 text-slate-300 border-white/5', desc: '' };
    }
  };

  const getSeverityBadge = (lvl: string) => {
    switch (lvl) {
      case 'high':
        return (
          <motion.span
            key={`high-${issue.id}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
          >
            Critical
          </motion.span>
        );
      case 'medium':
        return (
          <motion.span
            key={`medium-${issue.id}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
          >
            Moderate
          </motion.span>
        );
      default:
        return (
          <motion.span
            key={`standard-${issue.id}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/5 text-slate-300 border border-white/5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
          >
            Standard
          </motion.span>
        );
    }
  };

  const steps: { status: IssueStatus; label: string }[] = [
    { status: 'reported', label: 'Reported' },
    { status: 'verified', label: 'Verified' },
    { status: 'in_progress', label: 'In Progress' },
    { status: 'resolved', label: 'Resolved' }
  ];

  const getStageTimestamp = (status: IssueStatus): string | null => {
    if (issue.statusHistory) {
      const entry = issue.statusHistory.find(h => h.status === status);
      if (entry) return entry.timestamp;
    }

    if (status === 'reported') return issue.createdAt;
    if (status === 'verified') {
      if (issue.verifiedAt) return issue.verifiedAt;
      const ver = issue.verifications?.find(v => v.type === 'verify');
      if (ver) return ver.createdAt;
      
      const currentIdx = steps.findIndex(s => s.status === issue.status);
      const targetIdx = steps.findIndex(s => s.status === 'verified');
      if (currentIdx >= targetIdx) {
        return issue.updatedAt || issue.createdAt;
      }
    }
    if (status === 'in_progress') {
      if (issue.inProgressAt) return issue.inProgressAt;
      const currentIdx = steps.findIndex(s => s.status === issue.status);
      const targetIdx = steps.findIndex(s => s.status === 'in_progress');
      if (currentIdx >= targetIdx) {
        return issue.updatedAt || issue.createdAt;
      }
    }
    if (status === 'resolved') {
      return issue.resolvedAt || null;
    }
    return null;
  };

  const formatStepTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
      return `${formattedDate} ${formattedTime}`;
    } catch (e) {
      return '';
    }
  };

  const currentStepIdx = steps.findIndex(s => s.status === issue.status);

  return (
    <motion.div
      key={issue.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-white/[0.02] border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full"
    >
      {/* Detail Header */}
      <div className="p-6 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center justify-between gap-3 mb-3">
          <motion.span
            key={`category-${issue.id}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[11px] font-semibold text-amber-500 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 rounded-md px-2.5 py-1"
          >
            {issue.category.replace('_', ' ')}
          </motion.span>
          <div className="flex items-center gap-1.5">
            {getSeverityBadge(issue.aiSeverity)}
            <motion.span
              key={issue.status}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusDetails(issue.status).color}`}
            >
              {getStatusDetails(issue.status).label}
            </motion.span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white leading-snug mb-2">{issue.title}</h3>
        <div className="flex items-center justify-between gap-4 text-xs text-slate-400 font-mono relative">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-500" /> {issue.reporter.split('@')[0]}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="relative flex items-center gap-2">
            <AnimatePresence>
              {shareFeedback && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg font-mono z-50"
                >
                  {shareFeedback}
                </motion.span>
              )}
            </AnimatePresence>

            <button
              id="btn-share-issue"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 hover:border-amber-500/20 cursor-pointer transition-all active:scale-95"
              title="Share report and coordinates"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content body (scrollable) */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Citizen Report Details</h4>
          <p className="text-sm text-slate-300 leading-relaxed bg-white/[0.02] border border-white/5 p-4 rounded-xl">{issue.description}</p>
        </div>

        {/* 7-Day Trend Sparkline */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-500" /> 
            Vicinity Trend (7-Day)
          </h4>
          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl h-24 flex items-center justify-between gap-4">
            <div className="w-full h-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', borderRadius: '8px' }}
                    itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reports" 
                    name="Reports"
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    dot={{ r: 2, fill: '#f59e0b', strokeWidth: 0 }}
                    activeDot={{ r: 4, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="shrink-0 text-right pr-2">
              <span className="block text-2xl font-bold text-white">
                {sparklineData[sparklineData.length - 1].reports}
              </span>
              <span className="block text-[9px] text-slate-400 uppercase font-mono tracking-wider">
                Active Now
              </span>
            </div>
          </div>
        </div>

        {/* Status Tracker Timeline */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5 font-mono">Lifecycle Tracking</h4>
          <div className="relative flex items-center justify-between">
            {/* Background line */}
            <div className="absolute left-[10%] right-[10%] top-[16px] h-0.5 bg-white/5 -z-10" />
            <motion.div
              className="absolute left-[10%] top-[16px] h-0.5 bg-amber-500 -z-10"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStepIdx / (steps.length - 1)) * 80}%` }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            />

            {steps.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const timestamp = getStageTimestamp(step.status);

              return (
                <div key={step.status} className="flex flex-col items-center flex-1 z-10">
                  <motion.div
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      backgroundColor: isPast ? '#f59e0b' : isCurrent ? '#000000' : 'rgba(255, 255, 255, 0.02)',
                      borderColor: isPast || isCurrent ? '#f59e0b' : 'rgba(255, 255, 255, 0.05)',
                      color: isPast ? '#000000' : isCurrent ? '#f59e0b' : '#64748b',
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                      isCurrent ? 'ring-4 ring-amber-500/15 font-black' : ''
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                  </motion.div>
                  <span className={`text-[10px] font-semibold mt-1.5 font-mono ${isCurrent ? 'text-amber-500 font-bold' : isPast ? 'text-slate-200' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                  {timestamp ? (
                    <span className="text-[9px] text-slate-400 mt-0.5 font-mono tracking-tighter text-center whitespace-nowrap">
                      {formatStepTime(timestamp)}
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-600 mt-0.5 font-mono tracking-tighter text-center whitespace-nowrap">
                      Pending
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick resolution note display */}
          <AnimatePresence>
            {issue.status === 'resolved' && issue.resolutionNotes && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-4 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-400 overflow-hidden"
              >
                <span className="font-bold text-emerald-200 block mb-1">✅ RESOLUTION LOG:</span>
                <p className="italic leading-relaxed">"{issue.resolutionNotes}"</p>
                {issue.resolutionImageUrl && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-emerald-500/20 bg-black">
                    <img
                      src={issue.resolutionImageUrl}
                      alt="Resolution Evidence Image"
                      referrerPolicy="no-referrer"
                      className="max-h-[180px] w-full object-contain"
                    />
                  </div>
                )}
                {issue.resolutionVideoUrl && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-emerald-500/20 bg-black">
                    <video
                      src={issue.resolutionVideoUrl}
                      controls
                      playsInline
                      className="max-h-[180px] w-full object-contain"
                    />
                  </div>
                )}
                {issue.resolvedAt && (
                  <span className="block mt-2 font-mono text-[9px] text-emerald-500">
                    Closed at: {new Date(issue.resolvedAt).toLocaleString()}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chronological Vertical Status Timeline list */}
          {issue.statusHistory && issue.statusHistory.length > 0 && (
            <div className="mt-6 border-t border-white/5 pt-4 space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block mb-2">Chronological Progress Logs</span>
              <div className="relative pl-4 border-l border-white/5 space-y-3.5">
                {issue.statusHistory.map((h, index) => {
                  const details = getStatusDetails(h.status);
                  const isLast = index === (issue.statusHistory?.length || 0) - 1;
                  return (
                    <motion.div
                      key={h.status + h.timestamp}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                    >
                      {/* Timeline dot marker */}
                      <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border ${
                        isLast 
                          ? 'bg-amber-500 border-amber-400 ring-4 ring-amber-500/10' 
                          : 'bg-slate-700 border-slate-600'
                      }`} />
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${details.color}`}>
                          {details.label}
                        </span>
                        <span className="text-slate-400 font-medium">{details.desc}</span>
                      </div>
                      
                      <span className="text-[10px] text-slate-500 font-mono sm:text-right">
                        {new Date(h.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AI Coprocessor Insight Box */}
        <div className="bg-black/40 text-slate-200 border border-white/5 p-5 rounded-xl relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 bg-amber-500 text-[9px] font-bold tracking-widest text-black px-2.5 py-1 rounded-bl-lg flex items-center gap-1 font-mono uppercase">
            <Sparkles className="w-3 h-3 fill-black" /> AI Co-Processor
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">Hyperlocal Evaluation Analysis</h4>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-amber-400 font-bold block mb-0.5">⚠️ Citizens Preventive Safety Tip</span>
              <p className="text-slate-300 leading-relaxed italic">"{issue.aiSafetyTips || 'Maintain a safe corridor from active hazard lanes.'}"</p>
            </div>

            <div className="border-t border-white/5 pt-3">
              <span className="text-amber-400 font-bold block mb-0.5">🛠️ Municipal Work Order Proposal</span>
              <p className="text-slate-300 leading-relaxed">{issue.aiSuggestedAction || 'Dispatch road inspection or light maintenance crew.'}</p>
            </div>

            {issue.aiTags && issue.aiTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {issue.aiTags.map((tag, i) => (
                  <span key={i} className="bg-white/5 text-[10px] text-slate-300 border border-white/5 rounded-md px-2 py-0.5 font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Multi-Agent Trace Log List */}
        {issue.agentTrace && issue.agentTrace.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Agentic Execution Trace</h4>
            </div>
            
            <p className="text-[10px] text-slate-500 leading-normal mb-1.5">
              Review real-time autonomous pipeline transactions recorded for this hyperlocal report:
            </p>

            <div className="relative border-l border-white/5 pl-4 ml-2.5 space-y-3.5">
              {issue.agentTrace.map((trace, i) => (
                <div key={i} className="relative text-xs">
                  {/* Icon dot */}
                  <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border ${
                    trace.status === 'success' 
                      ? 'bg-emerald-500 border-emerald-400 ring-4 ring-emerald-500/10' 
                      : trace.status === 'warning'
                      ? 'bg-amber-500 border-amber-400 ring-4 ring-amber-500/10'
                      : 'bg-blue-500 border-blue-400 ring-4 ring-blue-500/10'
                  }`} />
                  
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <span className="font-bold text-slate-200 font-mono text-[10px]">{trace.agentName}</span>
                    <span className="text-[9px] text-slate-500 font-mono">{new Date(trace.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-300 font-medium leading-relaxed">{trace.message}</p>
                  {trace.details && (
                    <p className="text-[9px] text-slate-500 leading-normal bg-black/30 border border-white/5 p-2 rounded mt-1 font-mono">{trace.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verifications Log list */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Neighborhood Auditing & Verifications</h4>
            <span className="text-[10px] bg-white/5 text-slate-400 border border-white/5 px-2 py-0.5 rounded font-mono font-medium">
              Score: {issue.upvotes} Verification Votes
            </span>
          </div>

          <div className="space-y-2 max-h-[160px] overflow-y-auto mb-3">
            <AnimatePresence initial={false}>
              {issue.verifications && issue.verifications.length > 0 ? (
                issue.verifications.map((v) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    key={v.id}
                    className="bg-white/[0.02] border border-white/5 p-2.5 rounded-lg text-xs flex items-start gap-2.5"
                  >
                    <Shield className={`w-4 h-4 mt-0.5 shrink-0 ${v.type === 'verify' ? 'text-amber-500' : 'text-red-500'}`} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200 font-mono">{v.user.split('@')[0]}</span>
                        <span className={`text-[9px] font-bold uppercase rounded px-1 ${v.type === 'verify' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                          {v.type === 'verify' ? 'Verified' : 'Disputed'}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-0.5">{v.notes}</p>
                      <span className="text-[9px] text-slate-500 font-mono mt-1 block">{new Date(v.createdAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4 bg-white/[0.01] border border-dashed border-white/5 rounded-xl text-xs text-slate-500">
                  No formal neighborhood auditing logs yet. Be the first to verify or dispute this report!
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onVote(issue.id)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                hasVoted
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-amber-500 stroke-amber-500' : ''}`} />
              {hasVoted ? 'Voted' : 'Upvote / Verify'}
            </button>

            <button
              onClick={() => setShowVerifyForm(!showVerifyForm)}
              className="bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-amber-500" />
              Audit Report
            </button>

            {issue.status !== 'resolved' && (
              <>
                {issue.status !== 'in_progress' ? (
                  <button
                    onClick={() => onUpdateStatus(issue.id, 'in_progress')}
                    className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 ml-auto cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5 text-black" /> Work In-Progress
                  </button>
                ) : (
                  <button
                    onClick={() => setShowResolveForm(!showResolveForm)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 ml-auto cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Resolve Issue
                  </button>
                )}
              </>
            )}
          </div>

          {/* Collapsible Verify Auditing form */}
          <AnimatePresence>
            {showVerifyForm && (
              <motion.form
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                onSubmit={(e) => handleVerifySubmit(e, 'verify')}
                className="mt-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 overflow-hidden"
              >
                <label className="block text-xs font-bold text-slate-300 mb-1.5 font-mono">Formal Verification Log</label>
                <textarea
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Write specific auditing observation notes... (e.g., 'Inspected on foot. Pothole is active and blocking traffic')"
                  className="w-full bg-black/40 border border-white/5 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-200 placeholder-slate-500 resize-none h-16"
                />
                <div className="flex items-center gap-1.5 mt-2 justify-end">
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs px-2.5 py-1.5 rounded-md cursor-pointer"
                  >
                    Verify Active
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleVerifySubmit(e, 'dispute')}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-xs px-2.5 py-1.5 rounded-md cursor-pointer"
                  >
                    Flag as Dispute
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVerifyForm(false)}
                    className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs px-2.5 py-1.5 rounded-md cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Collapsible Resolution form */}
          <AnimatePresence>
            {showResolveForm && (
              <motion.form
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                onSubmit={handleResolveSubmit}
                className="mt-3 bg-emerald-950/20 border border-emerald-500/25 rounded-xl p-3 overflow-hidden"
              >
                <label className="block text-xs font-bold text-emerald-300 mb-1.5 font-mono">Closing Resolution Action Notes</label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Write specific resolution details... (e.g., 'Asphalt patching is complete. Debris swept.')"
                  className="w-full bg-black/40 border border-white/5 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-200 placeholder-slate-500 resize-none h-16 mb-3"
                  required
                />
                <div className="mb-3">
                  <CameraMediaCapture
                    onMediaCaptured={(url, type) => {
                      setResolutionMediaUrl(url);
                      setResolutionMediaType(type);
                    }}
                    onClear={() => {
                      setResolutionMediaUrl(null);
                      setResolutionMediaType(null);
                    }}
                    capturedUrl={resolutionMediaUrl}
                    capturedType={resolutionMediaType}
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2 justify-between">
                  <button
                    type="button"
                    onClick={handleQuickResolve}
                    disabled={isGeneratingDraft}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <Sparkles className={`w-3 h-3 ${isGeneratingDraft ? 'animate-spin' : ''}`} />
                    {isGeneratingDraft ? 'Drafting...' : 'AI Quick Resolve'}
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs px-3 py-1.5 rounded-md cursor-pointer"
                    >
                      Confirm Resolution
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResolveForm(false)}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs px-3 py-1.5 rounded-md cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Conversation Thread */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 font-mono">District Discussion Board</h4>
          <div className="space-y-3 mb-4 max-h-[220px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {issue.comments && issue.comments.length > 0 ? (
                issue.comments.map((comment) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    key={comment.id}
                    className="bg-white/[0.01] border border-white/5 rounded-xl p-3 text-xs leading-relaxed"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-500 font-mono">{comment.author.split('@')[0]}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300 font-normal">{comment.text}</p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500 text-xs">
                  No discussion entries yet. Start the conversation with local neighbors!
                </div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Join conversation or supply field updates..."
              className="flex-1 bg-white/5 border border-white/5 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-200 placeholder-slate-500"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-black px-3 py-2 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
