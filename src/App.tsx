import React, { useState, useEffect } from 'react';
import { Issue, IssueCategory, IssueStatus } from './types';
import Map from './components/Map';
import IssueDetail from './components/IssueDetail';
import PredictiveReport from './components/PredictiveReport';
import StatsLeaderboard from './components/StatsLeaderboard';
import CivicAssistant from './components/CivicAssistant';
import { WorkspaceHub } from './components/WorkspaceHub';
import AgentPipeline from './components/AgentPipeline';
import InteractiveLogo, { generateSvgCode } from './components/InteractiveLogo';
import CameraMediaCapture from './components/CameraMediaCapture';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  MapPin,
  ListFilter,
  Plus,
  Compass,
  TrendingUp,
  Award,
  Users,
  Search,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  UserCheck,
  BookOpen,
  Layers,
  Home,
  ArrowRight,
  ChevronDown,
  Camera,
  Video,
  Download,
  Copy,
  Check,
  Film
} from 'lucide-react';

export default function App() {
  // Splash Screen transition state
  const [showSplash, setShowSplash] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);
  const [splashStatus, setSplashStatus] = useState('Initializing cognitive architectures...');

  useEffect(() => {
    let progressInterval = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 35); // 100 * 35ms = 3.5 seconds

    const timer1 = setTimeout(() => {
      setSplashStatus('Agent 1: Aligning Multimodal Computer Vision networks...');
    }, 800);

    const timer2 = setTimeout(() => {
      setSplashStatus('Agent 2: Mapping spatial database duplicates & clusters...');
    }, 1600);

    const timer3 = setTimeout(() => {
      setSplashStatus('Agent 3 & 4: Grounding Ward routing & SLA limits...');
    }, 2400);

    const timer4 = setTimeout(() => {
      setSplashStatus('Ready. Granting civic access to Valencia-Dolores District...');
    }, 3200);

    const timerSplash = setTimeout(() => {
      setShowSplash(false);
    }, 3800);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timerSplash);
    };
  }, []);

  // Tabs: 'home' | 'map' | 'predictive' | 'leaderboard' | 'assistant' | 'workspace' | 'pipeline'
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'predictive' | 'leaderboard' | 'assistant' | 'workspace' | 'pipeline'>('home');
  const [handbookSubTab, setHandbookSubTab] = useState<'overview' | 'workflow' | 'features' | 'faq' | 'logolab'>('overview');

  // Logo Customization Global State
  const [logoTheme, setLogoTheme] = useState<'amber' | 'toxic' | 'cobalt' | 'crimson' | 'onyx'>('amber');
  const [logoShape, setLogoShape] = useState<'diamond' | 'circle' | 'hexagon' | 'shield' | 'triangle'>('diamond');
  const [logoIcon, setLogoIcon] = useState<'p' | 'eye' | 'shield' | 'grid' | 'hazard'>('p');
  const [logoStroke, setLogoStroke] = useState<number>(1.5);
  const [logoRotate, setLogoRotate] = useState<number>(45);
  const [logoScale, setLogoScale] = useState<number>(1);
  const [logoAnim, setLogoAnim] = useState<'pulse' | 'spin' | 'ping' | 'breath' | 'none'>('pulse');

  const logoConfig = {
    theme: logoTheme,
    shape: logoShape,
    icon: logoIcon,
    strokeWidth: logoStroke,
    rotation: logoRotate,
    scale: logoScale,
    animation: logoAnim
  };

  // Capture Photo/Video states for reporting
  const [reportedMediaUrl, setReportedMediaUrl] = useState<string | null>(null);
  const [reportedMediaType, setReportedMediaType] = useState<'image' | 'video' | null>(null);

  // Issue Lists & Syncing
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [apiWarning, setApiWarning] = useState<string | null>(null);

  // User session simulation
  const [currentUser, setCurrentUser] = useState('luffyfocusmode@gmail.com');
  const [editingUser, setEditingUser] = useState(false);
  const [tempUser, setTempUser] = useState('luffyfocusmode@gmail.com');

  // Reporting Form Modal
  const [reportingOpen, setReportingOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [newLat, setNewLat] = useState<number | null>(null);
  const [newLng, setNewLng] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState<IssueCategory>('pothole');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportingOpen) {
      setLocating(false);
      setLocationError(null);
    }
  }, [reportingOpen]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewLat(Number(position.coords.latitude.toFixed(6)));
        setNewLng(Number(position.coords.longitude.toFixed(6)));
        setLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMsg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please allow location access in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Request to get user location timed out.';
        }
        setLocationError(errorMsg);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // List search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch issues from Express API
  const fetchIssues = async (autoFocusFirst = false) => {
    setLoadingIssues(true);
    try {
      const res = await fetch('/api/issues');
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
        if (autoFocusFirst && data.length > 0 && !selectedIssueId) {
          setSelectedIssueId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlIssueId = params.get('issueId');
    if (urlIssueId) {
      setSelectedIssueId(urlIssueId);
      fetchIssues(false);
    } else {
      fetchIssues(true);
    }
  }, []);

  // Post a new issue
  const handleReportIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || newLat === null || newLng === null) return;

    setIsReporting(true);
    setApiWarning(null);

    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          category: newCat,
          latitude: newLat,
          longitude: newLng,
          reporter: currentUser,
          imageUrl: reportedMediaType === 'image' ? reportedMediaUrl : undefined,
          videoUrl: reportedMediaType === 'video' ? reportedMediaUrl : undefined
        })
      });

      if (res.ok) {
        // Trigger haptic feedback for mobile devices (double pulse)
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          try {
            window.navigator.vibrate([100, 50, 100]);
          } catch (vibrateErr) {
            console.warn('Vibrate API ignored or failed:', vibrateErr);
          }
        }
        const data = await res.json();
        if (data.warning) {
          setApiWarning(data.warning);
        }
        // Reset form
        setNewTitle('');
        setNewDesc('');
        setNewCat('pothole');
        setNewLat(null);
        setNewLng(null);
        setReportedMediaUrl(null);
        setReportedMediaType(null);
        setReportingOpen(false);
        // Refresh & focus
        await fetchIssues();
        if (data.issue) {
          setSelectedIssueId(data.issue.id);
        }
      }
    } catch (err) {
      console.error('Error reporting issue:', err);
    } finally {
      setIsReporting(false);
    }
  };

  // Upvote/Verify action
  const handleVote = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser })
      });
      if (res.ok) {
        const updatedIssue = await res.json();
        setIssues(issues.map(i => i.id === issueId ? updatedIssue : i));
      }
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  // Comment action
  const handleAddComment = async (issueId: string, text: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: currentUser, text })
      });
      if (res.ok) {
        const updatedIssue = await res.json();
        setIssues(issues.map(i => i.id === issueId ? updatedIssue : i));
      }
    } catch (err) {
      console.error('Comment submission failed:', err);
    }
  };

  // Audit verify / dispute log action
  const handleVerify = async (issueId: string, type: 'verify' | 'dispute', notes: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser, type, notes })
      });
      if (res.ok) {
        const updatedIssue = await res.json();
        setIssues(issues.map(i => i.id === issueId ? updatedIssue : i));
      }
    } catch (err) {
      console.error('Audit verification failed:', err);
    }
  };

  // Update status (e.g. resolve) action
  const handleUpdateStatus = async (
    issueId: string, 
    status: IssueStatus, 
    notes?: string, 
    resolutionImageUrl?: string, 
    resolutionVideoUrl?: string
  ) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          resolutionNotes: notes, 
          resolutionImageUrl, 
          resolutionVideoUrl 
        })
      });
      if (res.ok) {
        const updatedIssue = await res.json();
        setIssues(issues.map(i => i.id === issueId ? updatedIssue : i));
      }
    } catch (err) {
      console.error('Status transition failed:', err);
    }
  };

  // Interactive Map helper to open report modal at specific coordinates
  const handleMapClickToReport = (lat: number, lng: number) => {
    setNewLat(lat);
    setNewLng(lng);
    setReportingOpen(true);
  };

  // Change active simulating user
  const handleUserChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUser.trim() && tempUser.includes('@')) {
      setCurrentUser(tempUser.trim());
      setEditingUser(false);
    }
  };

  // Filtering Logic
  const filteredIssues = issues.filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || issue.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const selectedIssue = issues.find(i => i.id === selectedIssueId) || null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'in_progress': return <Clock className="w-3.5 h-3.5 text-blue-600" />;
      default: return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    }
  };

  const getCategoryColorBorder = (cat: string) => {
    switch (cat) {
      case 'pothole': return 'border-l-4 border-l-red-500';
      case 'water_leak': return 'border-l-4 border-l-blue-500';
      case 'broken_light': return 'border-l-4 border-l-amber-500';
      case 'waste': return 'border-l-4 border-l-emerald-500';
      case 'infrastructure': return 'border-l-4 border-l-purple-500';
      default: return 'border-l-4 border-l-slate-400';
    }
  };

  const getUrgencyBadge = (category: string) => {
    switch (category) {
      case 'water_leak':
        return {
          label: 'Critical',
          class: 'bg-red-500/10 border-red-500/20 text-red-400'
        };
      case 'pothole':
      case 'broken_light':
      case 'infrastructure':
        return {
          label: 'Medium',
          class: 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        };
      case 'waste':
      case 'other':
      default:
        return {
          label: 'Low',
          class: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
        };
    }
  };

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 bg-[#060606] flex flex-col items-center justify-center p-6 text-slate-200 select-none overflow-hidden"
        >
          {/* Cosmic Ambient background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-md w-full text-center relative z-10 flex flex-col items-center">
            {/* Spinning custom abstract radar/loader logo representing civic surveillance */}
            <motion.div
              initial={{ rotate: 0, scale: 0.8 }}
              animate={{ rotate: 360, scale: 1 }}
              transition={{
                rotate: { repeat: Infinity, duration: 15, ease: 'linear' },
                scale: { duration: 1, ease: 'easeOut' }
              }}
              className="relative w-24 h-24 mb-8 flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-amber-500/20" />
              <div className="absolute inset-2 rounded-full border border-double border-amber-500/40 animate-pulse" />
              <div className="absolute inset-4 rounded-full border border-dotted border-amber-500/60" />
              <InteractiveLogo config={logoConfig} size={48} className="shadow-lg shadow-amber-500/20" />
            </motion.div>

            {/* Title / Description */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2 mb-1">
                PublicEye
              </h1>
              <p className="text-xs text-amber-500 font-mono tracking-widest uppercase mb-6">
                Autonomous Civic Technology Platform
              </p>
            </motion.div>

            {/* Custom high-tech segmented terminal progress log */}
            <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-5 mb-6 text-left">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase mb-2">
                <span>System Health Logs</span>
                <span>{splashProgress}%</span>
              </div>
              
              {/* Progress bar container */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                  style={{ width: `${splashProgress}%` }}
                />
              </div>

              {/* Status stream */}
              <div className="space-y-1.5 h-16 flex flex-col justify-center">
                <motion.div
                  key={splashStatus}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 text-xs font-medium text-slate-300"
                >
                  <span className="text-amber-500 font-mono">▸</span>
                  <span className="leading-snug">{splashStatus}</span>
                </motion.div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  <span>Valencia-Dolores District Ward Index: ONLINE</span>
                </div>
              </div>
            </div>

            {/* System footer badge */}
            <div className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">
              District Core Node • v1.4.2-Secure
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="app-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-[#0a0a0a] text-slate-200 flex flex-col font-sans antialiased"
        >
      {/* Top Professional Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a] border-b border-white/5 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <InteractiveLogo config={logoConfig} size={32} className="shrink-0" />
          <div>
            <h1 className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
              PublicEye <span className="text-[9px] bg-white/5 border border-white/5 text-slate-400 px-2 py-0.5 rounded font-mono font-medium">Valencia-Dolores</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Hyperlocal Auditing & Predictive Diagnostics</p>
          </div>
        </div>

        {/* Tab Selection Row */}
        <nav className="hidden md:flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'home'
                ? 'bg-amber-500 text-black shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" /> Home & Handbook
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'map'
                ? 'bg-amber-500 text-black shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" /> District Map
          </button>
          <button
            onClick={() => setActiveTab('predictive')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'predictive'
                ? 'bg-amber-500 text-black shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Predictive Hotspots
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'assistant'
                ? 'bg-amber-500 text-black shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> Civic AI Coprocessor
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-black shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" /> Leaderboard & Stats
          </button>
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'workspace'
                ? 'bg-amber-500 text-black shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Workspace Hub
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === 'pipeline'
                ? 'bg-amber-500 text-black shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-500" /> AI Agent Pipeline
          </button>
        </nav>

        {/* Acting Active User Badge */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {editingUser ? (
            <form onSubmit={handleUserChangeSubmit} className="flex items-center gap-1.5 bg-white/5 p-1 border border-white/10 rounded-lg">
              <input
                type="email"
                value={tempUser}
                onChange={(e) => setTempUser(e.target.value)}
                className="bg-[#121212] border border-white/10 px-2 py-1 text-[11px] rounded font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-black text-[10px] px-2 py-1 rounded cursor-pointer font-bold"
              >
                Set
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl font-medium font-mono text-slate-300">
                <UserCheck className="w-3.5 h-3.5 text-amber-500" /> {currentUser}
              </span>
              <button
                onClick={() => {
                  setTempUser(currentUser);
                  setEditingUser(true);
                }}
                className="text-amber-500 hover:text-amber-400 hover:underline font-semibold cursor-pointer text-[11px]"
              >
                Simulate Other
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Tab Selection Header Row */}
      <nav className="md:hidden flex items-center justify-around gap-1 bg-[#0a0a0a] border-b border-white/5 p-2 sticky top-[73px] z-30 overflow-x-auto">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-lg flex flex-col items-center justify-center cursor-pointer min-w-[50px] ${
            activeTab === 'home' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" /> Home
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-lg flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'map' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" /> Map
        </button>
        <button
          onClick={() => setActiveTab('predictive')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-lg flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'predictive' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" /> AI Insights
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-lg flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'assistant' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5 text-amber-500" /> Copilot
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-lg flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'leaderboard' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400'
          }`}
        >
          <Award className="w-4 h-4 mb-0.5" /> Metrics
        </button>
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-lg flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'workspace' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" /> Workspace
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-lg flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'pipeline' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4 mb-0.5" /> Pipeline
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <AnimatePresence mode="wait">
          {/* 0. Home & Handbook View */}
          {activeTab === 'home' && (
            <motion.div
              key="home-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Hero Banner Section */}
              <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent p-8 md:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="max-w-3xl space-y-4 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest rounded-full font-mono">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                    Autonomous District Ledger Active
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">
                    Decentralized Civic Auditing & <span className="text-amber-500">Predictive Diagnostics</span>
                  </h1>
                  
                  <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl">
                    Welcome to <strong className="text-slate-200">PublicEye</strong>, the next-generation civic technology framework for the Valencia-Dolores District. We combine peer-to-peer neighbor audits with AI-driven predictive maintenance to secure municipal infrastructure and automate public action.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('map')}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-amber-500/15"
                    >
                      <Compass className="w-4 h-4" /> Go to District Map <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveTab('assistant')}
                      className="bg-white/5 hover:bg-white/10 text-white font-bold text-xs px-5 py-3 rounded-xl border border-white/5 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" /> Talk to Civic AI Copilot
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-tab Navigation */}
              <div className="border-b border-white/5">
                <div className="flex flex-wrap gap-2 -mb-px">
                  {[
                    { id: 'overview', label: 'Overview & Stats', icon: Home },
                    { id: 'workflow', label: 'How it Works', icon: Clock },
                    { id: 'features', label: 'Platform Features', icon: Layers },
                    { id: 'faq', label: 'FAQ & Help Center', icon: HelpCircle },
                    { id: 'logolab', label: 'Logo Laboratory', icon: Sparkles },
                  ].map((subTab) => {
                    const Icon = subTab.icon;
                    const isActive = handbookSubTab === subTab.id;
                    return (
                      <button
                        key={subTab.id}
                        onClick={() => setHandbookSubTab(subTab.id as any)}
                        className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-all ${
                          isActive
                            ? 'border-amber-500 text-amber-500'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : ''}`} />
                        {subTab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Handbook Sub-tab Contents */}
              <AnimatePresence mode="wait">
                {/* 1. Overview */}
                {handbookSubTab === 'overview' && (
                  <motion.div
                    key="overview-subtab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Bento Grid Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Enrolled District Auditors</span>
                          <Users className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-extrabold text-white">14,820</div>
                        <p className="text-[10px] text-slate-500 font-medium">Active civic participants verifying local infrastructure</p>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Peer-Led Ledger Accuracy</span>
                          <UserCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-extrabold text-white">94.2%</div>
                        <p className="text-[10px] text-slate-500 font-medium">Proportion of verified reports confirmed by on-site neighbors</p>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="text-[10px] font-bold uppercase tracking-wider font-mono">SLA Auto-Dispatch</span>
                          <Layers className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-extrabold text-white">12 Models</div>
                        <p className="text-[10px] text-slate-500 font-medium">Neural prediction clusters monitoring district sewer and roads</p>
                      </div>

                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-2">
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Average Resolution SLA</span>
                          <Clock className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-extrabold text-white">2.4 Days</div>
                        <p className="text-[10px] text-slate-500 font-medium">Mean duration from citizen post to verified field repair</p>
                      </div>
                    </div>

                    {/* Left/Right splitting section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-4">
                        <h3 className="font-extrabold text-white text-base">Municipal Node Update Feed</h3>
                        <div className="space-y-3.5">
                          <div className="flex gap-3 text-xs leading-relaxed font-sans">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <div>
                              <span className="font-mono text-[10px] text-slate-500 block">System Event • 4 minutes ago</span>
                              <p className="text-slate-300">Neighborhood audit completed for <strong className="text-slate-200">Issue #104 (Pothole at Calle de Valencia)</strong>. Status promoted to <span className="text-amber-500 font-bold">Verified</span> with 3 verification logs and 0 disputes.</p>
                            </div>
                          </div>
                          <div className="flex gap-3 text-xs leading-relaxed font-sans">
                            <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0 animate-pulse" />
                            <div>
                              <span className="font-mono text-[10px] text-slate-500 block">AI Agent Dispatch • 28 minutes ago</span>
                              <p className="text-slate-300">AI Agent <strong className="text-slate-200">VisionNode-03</strong> run completed on sewer system satellite imagery: Predicted water leak anomaly near coordinates <code className="text-amber-500 bg-white/5 px-1 rounded font-mono font-sans">37.766, -122.424</code>. Status logged to workspace.</p>
                            </div>
                          </div>
                          <div className="flex gap-3 text-xs leading-relaxed font-sans">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            <div>
                              <span className="font-mono text-[10px] text-slate-500 block">SLA Resolution Log • 2 hours ago</span>
                              <p className="text-slate-300">Issue <strong className="text-slate-200">"Damaged pedestrian guardrail"</strong> resolved. Closure log appended: <em className="text-slate-400">"Steel rail section replaced, anchor bolts re-torqued."</em> Checked on foot by District Auditor luffyfocusmode@gmail.com.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Sidebar Quick Guide */}
                      <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <h3 className="font-extrabold text-white text-base">Your Active Identity</h3>
                          <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                              <span className="text-xs font-bold text-slate-200 font-mono leading-none">{currentUser.split('@')[0]}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">District Auditor Role</span>
                            <div className="border-t border-white/5 pt-2 mt-2 flex justify-between text-[11px] text-slate-400">
                              <span>Reputation Level:</span>
                              <span className="text-amber-500 font-bold">140 XP (Gold Node)</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans">
                            Your votes, comments, and reports directly alter the state of municipal work orders. If you inspect an issue physically in Valencia-Dolores, click <strong>"Audit & Log Verification"</strong> inside the issue detail card to contribute to the peer-reviewed district ledger.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setNewLat(37.765);
                            setNewLng(-122.421);
                            setReportingOpen(true);
                          }}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs py-2.5 rounded-xl text-center cursor-pointer block transition-colors"
                        >
                          <Plus className="inline w-4 h-4 mr-1.5" /> File a New Incident Report
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. How it Works */}
                {handbookSubTab === 'workflow' && (
                  <motion.div
                    key="workflow-subtab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8 space-y-8"
                  >
                    <div className="max-w-2xl">
                      <h3 className="font-extrabold text-white text-lg">Interactive Workflow Map</h3>
                      <p className="text-slate-400 text-xs leading-relaxed mt-1">
                        Learn how reports are filed, vetted, prioritized, dispatched, and cataloged. This system completely bypasses central bureaucracy, making district maintenance autonomous and verifiable.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                      {/* Workflow Card 1 */}
                      <div className="bg-black/30 border border-white/5 p-5 rounded-2xl space-y-3 relative">
                        <span className="absolute -top-3 left-4 bg-amber-500 text-black text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full">STEP 01</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                          <Plus className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-xs text-white">Citizen Report</h4>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Citizens submit issues on the real-time map with GPS coordinates, a description, and category (water leak, pothole, sanitation, etc.).
                        </p>
                      </div>

                      {/* Workflow Card 2 */}
                      <div className="bg-black/30 border border-white/5 p-5 rounded-2xl space-y-3 relative">
                        <span className="absolute -top-3 left-4 bg-amber-500 text-black text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full">STEP 02</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                          <Users className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-xs text-white">Local Audit Ledger</h4>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Neighbors physically inspect the location. They submit a formal auditing log to "Verify Active" or "Flag Dispute", ensuring ledger validity.
                        </p>
                      </div>

                      {/* Workflow Card 3 */}
                      <div className="bg-black/30 border border-white/5 p-5 rounded-2xl space-y-3 relative">
                        <span className="absolute -top-3 left-4 bg-amber-500 text-black text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full">STEP 03</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-xs text-white">AI Coprocessor</h4>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          The Gemini AI Coprocessor calculates a dynamic risk rating (Standard, Moderate, Critical), determines the municipal SLA target, and groups duplicate logs.
                        </p>
                      </div>

                      {/* Workflow Card 4 */}
                      <div className="bg-black/30 border border-white/5 p-5 rounded-2xl space-y-3 relative">
                        <span className="absolute -top-3 left-4 bg-amber-500 text-black text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full">STEP 04</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                          <Layers className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-xs text-white">Autonomous Dispatch</h4>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          SLA timers trigger dispatches. Repair teams receive machine-readable JSON logs directly through the AI Workspace Hub with optimized task schedules.
                        </p>
                      </div>

                      {/* Workflow Card 5 */}
                      <div className="bg-black/30 border border-white/5 p-5 rounded-2xl space-y-3 relative">
                        <span className="absolute -top-3 left-4 bg-amber-500 text-black text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full">STEP 05</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-xs text-white">Verified Closure</h4>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          A physical resolution log is recorded on the public ledger. An unalterable status timeline shows the entire journey, which is then made public for audits.
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                      <div className="space-y-2">
                        <h4 className="font-bold text-white text-sm">How Citizens and Neighbors Do Work</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          Unlike standard municipal tools, PublicEye works best because of peer enforcement. Your participation consists of:
                        </p>
                        <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                          <li><strong className="text-slate-200">Pinpointing</strong> reports on Calle de Dolores and Calle de Valencia.</li>
                          <li><strong className="text-slate-200">Writing specific logs</strong> (e.g., measuring puddle depth or identifying loose electrical wire cages).</li>
                          <li><strong className="text-slate-200">Adding comments</strong> in the District Discussion Board of specific incidents.</li>
                          <li><strong className="text-slate-200">Challenging false reports</strong> by submitting formal "Flag as Dispute" logs.</li>
                        </ul>
                      </div>

                      <div className="space-y-2 bg-white/[0.01] border border-white/5 rounded-2xl p-5">
                        <h4 className="font-bold text-white text-sm">Direct Collaboration Tooltips</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          To maximize impact, keep your reports and verification notes highly concrete. Mention nearby street numbers, specify weather triggers (e.g. "Overflows during storm surge"), and use the <strong>"Share Link"</strong> button inside any issue to immediately copy a direct deep-linked URL to post on WhatsApp, Reddit, or Slack channels!
                        </p>
                        <div className="pt-2 text-[10px] text-amber-500 font-mono flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Deep-linked sharing coordinates ledger alignment securely.</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. Features Directory */}
                {handbookSubTab === 'features' && (
                  <motion.div
                    key="features-subtab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans"
                  >
                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-4 hover:border-amber-500/25 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <Compass className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-white text-sm">District Map Ledger</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        An interactive maps board displaying reported infrastructure failures. Filter by severity level or status, view detailed neighborhood verification logs, and toggle satellite coordinates instantly.
                      </p>
                      <button onClick={() => setActiveTab('map')} className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                        View Map <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-4 hover:border-amber-500/25 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-white text-sm">AI Predictive Hotspots</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Applies predictive neural networks over local variables (humidity, soil compaction, traffic density) to forecast where critical sanitation, water leak, or pothole failures are highly likely to occur.
                      </p>
                      <button onClick={() => setActiveTab('predictive')} className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                        Analyze Hotspots <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-4 hover:border-amber-500/25 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                      </div>
                      <h3 className="font-bold text-white text-sm">AI Civic Coprocessor</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        An integrated district chat terminal backed by Gemini. Use natural language to inspect municipal statistics, write dispatch orders, search the ledger, or draft repair specifications automatically.
                      </p>
                      <button onClick={() => setActiveTab('assistant')} className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                        Consult AI Copilot <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-4 hover:border-amber-500/25 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <Award className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-white text-sm">Leaderboard & Stats</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Tracks top civic contributors by XP earned from logging audits, resolving problems, or filing highly accurate incidents. Features live municipal speed-to-resolution KPI charts.
                      </p>
                      <button onClick={() => setActiveTab('leaderboard')} className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                        Check Stats <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-4 hover:border-amber-500/25 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-white text-sm">Workspace Hub</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        The coordination cockpit for district maintenance teams. View dispatch schedules, review task queues grouped by urgency levels, and log structural resolution notes to close pending tickets.
                      </p>
                      <button onClick={() => setActiveTab('workspace')} className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                        Access Workspace <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 space-y-4 hover:border-amber-500/25 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <Layers className="w-5 h-5 text-amber-500" />
                      </div>
                      <h3 className="font-bold text-white text-sm">AI Agent Pipeline</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Inspect the raw multi-agent loop orchestrating PublicEye. Track the neural interactions of the vision agent, database deduplication agent, ward router agent, and public dispatch generator.
                      </p>
                      <button onClick={() => setActiveTab('pipeline')} className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                        View Pipeline <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 4. FAQ & Accordion Help Center */}
                {handbookSubTab === 'faq' && (
                  <motion.div
                    key="faq-subtab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-4xl mx-auto space-y-4 font-sans"
                  >
                    <div className="text-center pb-4">
                      <h3 className="font-extrabold text-white text-lg">Frequently Asked Questions</h3>
                      <p className="text-slate-400 text-xs mt-1">Get immediate explanations for core platform mechanics and peer consensus.</p>
                    </div>

                    {[
                      {
                        q: 'What makes PublicEye different from traditional 311 systems?',
                        a: 'Whenever an issue is filed, it begins as "Reported". To prevent spam and false alarms, municipal crews do not schedule work until the neighborhood completes an audit. Any logged user can inspect the location and submit a formal verification log (with notes). When multiple positive audits are registered, the status changes to "Verified". Conversely, if neighbors submit disputations, the risk rating decreases, and AI Coprocessors investigate for false data logging.',
                      },
                      {
                        q: 'How does the AI Coprocessor calculate SLA times automatically?',
                        a: 'The Coprocessor uses deep prompt instructions with @google/genai. It reads the category, citizen description, and peer verification notes, and then references standardized municipal hazard indexes. For example, a pothole deep enough to damage tires is flagged as "Critical" severity with a strict 24-hour SLA. A minor sanitation issue is flagged as "Standard" severity with a 72-hour SLA. This eliminates administrative overhead.',
                      },
                      {
                        q: 'Can I change my simulated identity to audit under a different name?',
                        a: 'Yes! In the top-right corner of the platform header, you will see your acting user email (e.g., "luffyfocusmode@gmail.com") next to a "Simulate Other" button. Click that button to input any other email address. This allows you to simulate distinct neighbors, chat from other personas, log independent verification logs, or check dispute interactions on the map.',
                      },
                      {
                        q: 'How are predictive hotspots generated inside the AI insights tab?',
                        a: 'Predictive hotspots are not random. The predictive model overlays historical failure patterns, rainfall logs, pipe corrosion index metrics, and road surface age data to highlight high-risk hex bins. These hexagons help municipal crews proactively sweep or inspect assets before water main bursts or massive sinkholes emerge.',
                      },
                      {
                        q: 'What is the "Deep Link Share Link" feature?',
                        a: 'Inside every single issue detail panel, there is a "Share Report Link" button. When clicked, it copies a unique, deep-linked URL representing that specific issue (e.g. `?issueId=101`) to your clipboard. If another neighbor or official clicks this URL, the applet bypasses splash screening and loads the incident details page directly, facilitating peer communication.',
                      },
                    ].map((faq, idx) => (
                      <FAQItem key={idx} question={faq.q} answer={faq.a} />
                    ))}
                  </motion.div>
                )}

                {/* 5. Logo Laboratory */}
                {handbookSubTab === 'logolab' && (
                  <motion.div
                    key="logolab-subtab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-6xl mx-auto space-y-6 font-sans text-slate-200"
                  >
                    <div className="text-center pb-2">
                      <h3 className="font-extrabold text-white text-xl flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" /> PublicEye Branding Laboratory
                      </h3>
                      <p className="text-slate-400 text-xs mt-1">
                        Interact, customize, and configure the district's autonomous identity mark. Export production-ready SVG/CSS or apply globally in real-time.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: Design Controls */}
                      <div className="lg:col-span-4 bg-white/[0.01] border border-white/5 p-5 rounded-2xl space-y-5">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono border-b border-white/5 pb-2">
                          1. Geometry & Colors
                        </h4>

                        {/* Theme select */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                            Branding Color Palette
                          </label>
                          <div className="grid grid-cols-5 gap-1.5">
                            {(['amber', 'toxic', 'cobalt', 'crimson', 'onyx'] as const).map((t) => {
                              const colors = {
                                amber: 'bg-amber-500 border-amber-600',
                                toxic: 'bg-emerald-500 border-emerald-600',
                                cobalt: 'bg-blue-500 border-blue-600',
                                crimson: 'bg-red-500 border-red-600',
                                onyx: 'bg-slate-300 border-slate-400',
                              }[t];
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setLogoTheme(t)}
                                  className={`h-8 rounded-lg flex items-center justify-center border text-[9px] font-bold capitalize transition-all cursor-pointer ${colors} ${
                                    logoTheme === t ? 'ring-2 ring-white scale-105 text-black' : 'opacity-60 hover:opacity-100 text-slate-900'
                                  }`}
                                >
                                  {t === 'onyx' ? 'Stealth' : t}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Shape select */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                            Outer Containment Frame
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['diamond', 'circle', 'hexagon', 'shield', 'triangle'] as const).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setLogoShape(s)}
                                className={`px-2.5 py-1.5 text-[10px] font-bold capitalize rounded-lg border cursor-pointer transition-all ${
                                  logoShape === s
                                    ? 'bg-white/10 text-white border-amber-500/50'
                                    : 'bg-transparent text-slate-400 border-white/5 hover:text-slate-200'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Inner icon select */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                            Core Emblem Insignia
                          </label>
                          <div className="grid grid-cols-5 gap-1.5">
                            {(['p', 'eye', 'shield', 'grid', 'hazard'] as const).map((ic) => (
                              <button
                                key={ic}
                                type="button"
                                onClick={() => setLogoIcon(ic)}
                                className={`py-1.5 text-[10px] font-extrabold uppercase rounded-lg border cursor-pointer transition-all ${
                                  logoIcon === ic
                                    ? 'bg-amber-500 text-black border-amber-600'
                                    : 'bg-transparent text-slate-400 border-white/5 hover:text-slate-200'
                                }`}
                                title={`Use ${ic} icon`}
                              >
                                {ic}
                              </button>
                            ))}
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono border-b border-white/5 pb-2 pt-2">
                          2. Precision Tuning
                        </h4>

                        {/* Sliders */}
                        <div className="space-y-3 font-mono text-[10px] text-slate-400">
                          {/* Stroke Slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Stroke Weight</span>
                              <span className="text-white">{logoStroke.toFixed(1)}px</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              step="0.5"
                              value={logoStroke}
                              onChange={(e) => setLogoStroke(Number(e.target.value))}
                              className="w-full accent-amber-500 bg-white/5 rounded-lg h-1"
                            />
                          </div>

                          {/* Rotate Slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Rotation Angle</span>
                              <span className="text-white">{logoRotate}°</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              step="15"
                              value={logoRotate}
                              onChange={(e) => setLogoRotate(Number(e.target.value))}
                              className="w-full accent-amber-500 bg-white/5 rounded-lg h-1"
                            />
                          </div>

                          {/* Scale Slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Global Scaling</span>
                              <span className="text-white">{logoScale.toFixed(2)}x</span>
                            </div>
                            <input
                              type="range"
                              min="0.8"
                              max="1.3"
                              step="0.05"
                              value={logoScale}
                              onChange={(e) => setLogoScale(Number(e.target.value))}
                              className="w-full accent-amber-500 bg-white/5 rounded-lg h-1"
                            />
                          </div>
                        </div>

                        {/* Animation Select */}
                        <div className="space-y-2 pt-2">
                          <label className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                            Surveillance Animation Routine
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {(['pulse', 'spin', 'ping', 'breath', 'none'] as const).map((an) => (
                              <button
                                key={an}
                                type="button"
                                onClick={() => setLogoAnim(an)}
                                className={`px-2 py-1 text-[10px] font-bold capitalize rounded-lg border cursor-pointer transition-all ${
                                  logoAnim === an
                                    ? 'bg-white/10 text-white border-amber-500/50'
                                    : 'bg-transparent text-slate-400 border-white/5 hover:text-slate-200'
                                }`}
                              >
                                {an}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Canvas and Mockups */}
                      <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* Live Canvas */}
                        <div className="bg-black/50 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden group">
                          <div className="absolute inset-0 bg-radial-gradient from-white/[0.02] to-transparent pointer-events-none" />
                          <div className="absolute top-2.5 left-3 text-[9px] font-mono text-slate-500 tracking-wider flex items-center gap-1">
                            <span className="w-1 h-1 bg-amber-500 rounded-full animate-ping" />
                            INTERACTIVE GENERATIVE VECTOR PREVIEW
                          </div>

                          <InteractiveLogo config={logoConfig} size={110} />

                          <div className="text-[10px] font-mono text-slate-500 mt-5 uppercase">
                            RENDER_SCALE: {logoScale.toFixed(2)} | ROTATION: {logoRotate}° | SHAPE: {logoShape.toUpperCase()}
                          </div>
                        </div>

                        {/* Real-world Mockups */}
                        <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl space-y-3.5">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                            Real-World Brand Mockup Scenarios
                          </h4>

                          <div className="grid grid-cols-2 gap-3 text-left">
                            {/* App Icon Mockup */}
                            <div className="bg-[#151515] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                              <div className="w-12 h-12 bg-black rounded-xl border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                                <InteractiveLogo config={logoConfig} size={30} />
                              </div>
                              <div>
                                <span className="block text-[10px] font-mono font-bold text-slate-300">App Icon</span>
                                <span className="block text-[8px] text-slate-500 leading-none">Dolores Auditing v1.4</span>
                              </div>
                            </div>

                            {/* Citizen Ledger ID Card */}
                            <div className="bg-[#151515] border border-white/5 rounded-xl p-3 flex flex-col justify-between h-[80px] relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 blur-md pointer-events-none" />
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="block text-[8px] font-mono font-black text-slate-400 uppercase tracking-wide">CITIZEN AUDITOR ID</span>
                                  <span className="block text-[7px] font-mono text-slate-600 leading-none">ACTIVE AUTHORIZATION</span>
                                </div>
                                <InteractiveLogo config={logoConfig} size={20} />
                              </div>
                              <span className="text-[7px] font-mono text-slate-500 mt-2">ID: {currentUser.split('@')[0]}@district.p2p</span>
                            </div>

                            {/* Safety Vest Screenprint */}
                            <div className="bg-gradient-to-r from-lime-500/95 to-green-500/95 border border-lime-400 rounded-xl p-3 flex items-center gap-3 relative overflow-hidden h-[80px]">
                              {/* Vest zipper line */}
                              <div className="absolute inset-y-0 right-1/2 border-r border-black/15 border-dashed" />
                              <div className="w-9 h-9 bg-black/90 rounded-lg flex items-center justify-center shrink-0">
                                <InteractiveLogo config={logoConfig} size={24} />
                              </div>
                              <div className="relative z-10">
                                <span className="block text-[9px] font-extrabold text-black uppercase leading-tight font-sans">CIVIC SAFETY CREW</span>
                                <span className="block text-[7px] font-medium text-black/70 font-mono leading-none">HIGH-VIS EMBLEM</span>
                              </div>
                            </div>

                            {/* Browser Favicon */}
                            <div className="bg-[#151515] border border-white/5 rounded-xl p-3 flex flex-col justify-center h-[80px]">
                              <div className="bg-[#1e1e1e] border border-white/5 rounded px-2 py-1 flex items-center gap-2 max-w-sm">
                                <InteractiveLogo config={logoConfig} size={14} />
                                <span className="text-[8px] font-mono text-slate-400 truncate">PublicEye System Node ...</span>
                              </div>
                              <span className="text-[7px] font-mono text-slate-600 mt-2 uppercase text-center">Simulated Browser Tab</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Code Exporter */}
                      <div className="lg:col-span-3 bg-white/[0.01] border border-white/5 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono border-b border-white/5 pb-2">
                            3. Export Center
                          </h4>

                          <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                            PublicEye uses lightweight inline SVGs. Copy the raw markup below to embed this customized brand asset on any web page.
                          </p>

                          <div className="relative group">
                            <textarea
                              readOnly
                              value={generateSvgCode(logoConfig)}
                              rows={10}
                              className="w-full bg-black/60 border border-white/10 p-3 rounded-xl text-[8px] font-mono text-slate-300 focus:outline-none resize-none leading-normal select-all h-[200px]"
                            />
                            
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(generateSvgCode(logoConfig));
                                const btn = document.getElementById('btn-copy-svg');
                                if (btn) {
                                  btn.innerText = '✓ SVG Copied!';
                                  setTimeout(() => { btn.innerText = 'Copy SVG Markup'; }, 2000);
                                }
                              }}
                              id="btn-copy-svg"
                              className="absolute bottom-2.5 right-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors shadow-lg"
                            >
                              Copy SVG Markup
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">CSS System Tokens</span>
                          <div className="bg-black/40 border border-white/5 rounded-xl p-3 font-mono text-[8px] text-slate-400 space-y-1">
                            <div>--brand-primary: <span className="text-amber-500">{logoTheme === 'amber' ? '#f59e0b' : logoTheme === 'toxic' ? '#22c55e' : logoTheme === 'cobalt' ? '#3b82f6' : logoTheme === 'crimson' ? '#ef4444' : '#e2e8f0'}</span>;</div>
                            <div>--brand-stroke: {logoStroke}px;</div>
                            <div>--brand-shape: '{logoShape}';</div>
                            <div>--brand-rotation: {logoRotate}deg;</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* 1. Map and Lists View */}
          {activeTab === 'map' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full"
            >
              {/* Left sidebar: list with filters (col-span-4) */}
              <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col h-[550px] overflow-hidden">
                <div className="space-y-4 mb-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-bold text-sm uppercase tracking-widest text-white">Active Reports</h2>
                    <button
                      onClick={() => {
                        setNewLat(37.765);
                        setNewLng(-122.421);
                        setReportingOpen(true);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" /> File Report
                    </button>
                  </div>

                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search reports or areas..."
                      className="w-full bg-white/5 border border-white/10 text-xs pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-white placeholder-slate-500"
                    />
                  </div>

                  {/* Filter Selects */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Category Selector */}
                    <div className="relative">
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-[11px] font-medium px-3 py-2 rounded-lg text-slate-300 focus:outline-none cursor-pointer appearance-none bg-[#121212]"
                      >
                        <option value="all">📁 All Categories</option>
                        <option value="pothole">Potholes</option>
                        <option value="water_leak">Water Leaks</option>
                        <option value="broken_light">Streetlights</option>
                        <option value="waste">Sanitation</option>
                        <option value="infrastructure">Infrastructure</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Status Selector */}
                    <div className="relative">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-[11px] font-medium px-3 py-2 rounded-lg text-slate-300 focus:outline-none cursor-pointer appearance-none bg-[#121212]"
                      >
                        <option value="all">⏱️ All Statuses</option>
                        <option value="reported">Reported</option>
                        <option value="verified">Verified</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* List Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {loadingIssues ? (
                    <div className="py-20 text-center space-y-2">
                      <RefreshCw className="w-7 h-7 text-amber-500 animate-spin mx-auto" />
                      <p className="text-xs text-slate-500">Loading reports...</p>
                    </div>
                  ) : filteredIssues.length > 0 ? (
                    filteredIssues.map((issue) => {
                      const isSelected = selectedIssueId === issue.id;
                      return (
                        <div
                          key={issue.id}
                          onClick={() => setSelectedIssueId(issue.id)}
                          className={`p-3.5 border rounded-xl text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-white/10 border-amber-500 text-white shadow-md scale-[0.98]'
                              : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.04] text-slate-300'
                          } ${getCategoryColorBorder(issue.category)}`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                                {issue.category.replace('_', ' ')}
                              </span>
                              {(() => {
                                const urgency = getUrgencyBadge(issue.category);
                                return (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border ${urgency.class}`}>
                                    {urgency.label}
                                  </span>
                                );
                              })()}
                            </div>
                            <span className="flex items-center gap-1 text-[9px] capitalize font-semibold">
                              {getStatusIcon(issue.status)}
                              <span className={isSelected ? 'text-slate-200' : 'text-slate-400'}>
                                {issue.status.replace('_', ' ')}
                              </span>
                            </span>
                          </div>

                          <h4 className="font-bold text-xs line-clamp-1 mb-1 text-white">{issue.title}</h4>
                          <p className={`text-[11px] line-clamp-2 leading-relaxed mb-2.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {issue.description}
                          </p>

                          <div className="flex items-center justify-between text-[10px] font-mono border-t pt-2 border-white/5">
                            <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>
                              By: {issue.reporter.split('@')[0]}
                            </span>
                            <span className={`font-semibold ${isSelected ? 'text-amber-400' : 'text-amber-500'}`}>
                              ▲ {issue.upvotes} Votes
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-20 text-slate-500 text-xs">
                      No matching reports found.
                    </div>
                  )}
                </div>
              </div>

              {/* Center Map (col-span-5) */}
              <div className="lg:col-span-5 flex flex-col h-full gap-4">
                <Map
                  issues={issues}
                  selectedIssueId={selectedIssueId}
                  onSelectIssue={(id) => setSelectedIssueId(id)}
                  onMapClickToReport={handleMapClickToReport}
                />
              </div>

              {/* Right Sidebar Details Inspector (col-span-3) */}
              <div className="lg:col-span-3 h-[550px] overflow-hidden">
                {selectedIssue ? (
                  <IssueDetail
                    issue={selectedIssue}
                    currentUser={currentUser}
                    onVote={handleVote}
                    onAddComment={handleAddComment}
                    onVerify={handleVerify}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ) : (
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full shadow-lg text-slate-500">
                    <Compass className="w-10 h-10 text-slate-600 mb-3" />
                    <h4 className="font-semibold text-slate-300 text-xs uppercase tracking-wider mb-1">Audit Details Inspector</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Select any reported issue on the map or left list to audit details, read safety advisories, or write comments.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 2. Predictive Insights View */}
          {activeTab === 'predictive' && (
            <motion.div
              key="predictive"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <PredictiveReport />
            </motion.div>
          )}

          {/* 3. Leaderboard & Stats View */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <StatsLeaderboard issues={issues} currentUser={currentUser} />
            </motion.div>
          )}

          {/* 4. Civic AI Coprocessor View */}
          {activeTab === 'assistant' && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="h-full"
            >
              <CivicAssistant issues={issues} currentUser={currentUser} />
            </motion.div>
          )}

          {/* 5. Google Workspace Integration Hub */}
          {activeTab === 'workspace' && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <WorkspaceHub issues={issues} currentUser={currentUser} />
            </motion.div>
          )}

          {/* 6. AI Agent Pipeline Handoff Loop & Diagram */}
          {activeTab === 'pipeline' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <AgentPipeline />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating File New Report Dialog Overlay */}
      {reportingOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-4 text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-bold text-base text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-5 h-5 text-amber-500" /> File Hyperlocal Report
              </h3>
              <button
                onClick={() => setReportingOpen(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReportIssueSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLat !== null ? newLat : ''}
                    onChange={(e) => setNewLat(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="37.7651"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newLng !== null ? newLng : ''}
                    onChange={(e) => setNewLng(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2 rounded-lg text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                    placeholder="-122.4211"
                    required
                  />
                </div>
              </div>

              <div>
                <motion.button
                  id="use-current-location-btn"
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={locating}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold py-2.5 rounded-xl cursor-pointer transition-all disabled:opacity-50"
                  animate={locating ? {
                    scale: [1, 1.02, 1],
                    borderColor: ["rgba(255, 255, 255, 0.1)", "rgba(245, 158, 11, 0.4)", "rgba(255, 255, 255, 0.1)"],
                    backgroundColor: ["rgba(255, 255, 255, 0.05)", "rgba(245, 158, 11, 0.08)", "rgba(255, 255, 255, 0.05)"],
                  } : {
                    scale: 1,
                  }}
                  transition={locating ? {
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  } : { duration: 0.2 }}
                >
                  {locating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                      <span>Locating current coordinates...</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-3.5 h-3.5 text-amber-500" />
                      <span>Use Current Location</span>
                    </>
                  )}
                </motion.button>
                {locationError && (
                  <p id="geolocation-error-msg" className="text-[10px] text-red-400 mt-2 font-medium leading-normal bg-red-500/10 border border-red-500/15 px-3 py-2 rounded-xl flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{locationError}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Issue Department Category</label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as IssueCategory)}
                  className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2.5 rounded-lg text-white focus:outline-none cursor-pointer bg-[#121212]"
                >
                  <option value="pothole">🔴 Potholes & Road Cracks</option>
                  <option value="water_leak">🔵 Water Line Leaks / Flooding</option>
                  <option value="broken_light">🟡 Street Light Failures</option>
                  <option value="waste">🟢 Bulky Dumping / Sanitation</option>
                  <option value="infrastructure">🟣 Sidewalk & Civil Infrastructure</option>
                  <option value="other">⚪ Other Concern</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Report Headline</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Broken streetlight on main pedestrian crosswalk"
                  className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2.5 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 font-mono uppercase tracking-wider">Context & Observations Details</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe specific observations, physical hazards, blocks to sidewalks..."
                  className="w-full bg-white/5 border border-white/10 text-xs px-3 py-2.5 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-amber-500 h-24 resize-none"
                  required
                />
              </div>

              <div>
                <CameraMediaCapture
                  onMediaCaptured={(url, type) => {
                    setReportedMediaUrl(url);
                    setReportedMediaType(type);
                  }}
                  onClear={() => {
                    setReportedMediaUrl(null);
                    setReportedMediaType(null);
                  }}
                  capturedUrl={reportedMediaUrl}
                  capturedType={reportedMediaType}
                />
              </div>

              <div className="flex items-center gap-1.5 justify-end border-t border-white/5 pt-3">
                <button
                  type="button"
                  onClick={() => setReportingOpen(false)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReporting}
                  className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-black font-bold text-xs px-4.5 py-2 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  {isReporting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing Report...
                    </>
                  ) : (
                    'Submit to AI Coprocessor'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* API Key Sandbox Warning toast indicator */}
      {apiWarning && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121212] border border-white/10 text-white px-4.5 py-3.5 rounded-xl shadow-2xl max-w-sm flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold uppercase tracking-wider block text-amber-400">Sandbox Analytics Notice</span>
            <p className="text-slate-400 mt-0.5 leading-relaxed">
              {apiWarning}
            </p>
          </div>
          <button
            onClick={() => setApiWarning(null)}
            className="text-slate-500 hover:text-white text-sm ml-auto cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string; key?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden transition-colors hover:bg-white/[0.02]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
      >
        <span className="font-bold text-xs text-white md:text-sm">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-500 hover:text-white shrink-0"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/5 bg-black/10">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
