import React, { useState, useEffect } from 'react';
import { Issue, IssueCategory, IssueStatus } from './types';
import Map from './components/Map';
import IssueDetail from './components/IssueDetail';
import PredictiveReport from './components/PredictiveReport';
import StatsLeaderboard from './components/StatsLeaderboard';
import CivicAssistant from './components/CivicAssistant';
import { WorkspaceHub } from './components/WorkspaceHub';
import AgentPipeline from './components/AgentPipeline';
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
  Layers
} from 'lucide-react';

export default function App() {
  // Tabs: 'map' | 'predictive' | 'leaderboard' | 'assistant' | 'workspace' | 'pipeline'
  const [activeTab, setActiveTab] = useState<'map' | 'predictive' | 'leaderboard' | 'assistant' | 'workspace' | 'pipeline'>('map');

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
    fetchIssues(true);
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
          reporter: currentUser
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
  const handleUpdateStatus = async (issueId: string, status: IssueStatus, notes?: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolutionNotes: notes })
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
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex flex-col font-sans antialiased">
      {/* Top Professional Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a] border-b border-white/5 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-sm rotate-45 flex items-center justify-center shrink-0">
            <span className="text-black font-black text-xs -rotate-45 font-mono">P</span>
          </div>
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
      <nav className="md:hidden flex items-center justify-around gap-1 bg-[#0a0a0a] border-b border-white/5 p-2 sticky top-[73px] z-30">
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
    </div>
  );
}
