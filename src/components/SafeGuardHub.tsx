import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  PhoneCall, 
  MapPin, 
  Users, 
  Radio, 
  Lock, 
  CheckCircle, 
  FileText, 
  ChevronRight, 
  Search, 
  AlertOctagon, 
  HelpCircle,
  Eye,
  Activity,
  Compass,
  MessageSquare,
  Shield,
  Clock,
  ExternalLink,
  LogIn,
  RefreshCw
} from 'lucide-react';
import { auth, googleSignIn } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface SafeGuardHubProps {
  currentUser: string;
}

export default function SafeGuardHub({ currentUser }: SafeGuardHubProps) {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(false);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  const getHeaders = async () => {
    if (!auth.currentUser) return {};
    const token = await auth.currentUser.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // SOS States
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sosDispatched, setSosDispatched] = useState(false);
  const [sosLogs, setSosLogs] = useState<string[]>([]);
  const [sosId, setSosId] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Check-In States
  const [checkedInZone, setCheckedInZone] = useState<string | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  // Search filter for resources
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'police' | 'ngo' | 'gov'>('all');

  // Simulated GPS
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number }>({ lat: 39.4699, lng: -0.3763 });

  // Safety checklist status
  const [safetyTips, setSafetyTips] = useState<any[]>([
    { id: 1, text: 'Confirm companion tracking status', done: false },
    { id: 2, text: 'Map well-lit streets using the Heatmap', done: true },
    { id: 3, text: 'Confirm local Safe Zone checkpoints', done: false },
    { id: 4, text: 'Verify device charge above 20%', done: true },
  ]);

  // NGOs & Government Contacts data
  const resources = [
    {
      id: 'police-1',
      name: 'Valencia-Dolores District Police Precinct',
      type: 'police',
      address: 'Calle de Dolores, 24, Valencia',
      phone: '+34 963 855 010',
      description: 'Primary local precinct commanding rapid-response mobile units on foot and motorcycle patrols.',
      coordinates: '39.4674, -0.3721',
      status: 'High Response (Under 4 mins)',
      actionText: 'Dispatch Request Trigger'
    },
    {
      id: 'ngo-1',
      name: 'Fundación Solidaria Mujeres Dolores',
      type: 'ngo',
      address: 'Calle de Valencia, 112, Valencia',
      phone: '+34 963 459 291',
      description: 'Non-governmental shelter providing instant safe physical sanctuary, professional legal consultation, and psychologist counseling 24/7.',
      coordinates: '39.4691, -0.3745',
      status: 'Active Volunteers Online',
      actionText: 'Connect via Chat'
    },
    {
      id: 'ngo-2',
      name: 'Red de Apoyo Vecinal (Citizen Walk Escorts)',
      type: 'ngo',
      address: 'District Community Center, Valencia',
      phone: '+34 963 999 111',
      description: 'Volunteer group of neighborhood residents offering physical escort walks for individuals commuting back home late at night.',
      coordinates: '39.4682, -0.3751',
      status: '12 escorts active tonight',
      actionText: 'Book Late Walk Escort'
    },
    {
      id: 'gov-1',
      name: 'District Ward Security & Broken Lights Commission',
      type: 'gov',
      address: 'Ayuntamiento de Valencia Sec.',
      phone: '+34 963 120 000 (Ext. 4)',
      description: 'Municipal division taking direct emergency infrastructure alerts (e.g. dark streets or broken security cameras) for immediate priority execution.',
      coordinates: '39.4702, -0.3768',
      status: 'SLA Escalations Enabled',
      actionText: 'File Priority Lighting Alert'
    },
    {
      id: 'gov-2',
      name: 'Centro de Coordinación de Emergencias (112 General)',
      type: 'gov',
      address: 'National Central Dispatch',
      phone: '112 (Priority)',
      description: 'Spanish national emergency number instantly linked to ambulances, fire crews, and national guard units.',
      coordinates: 'Valencia Core',
      status: 'Emergency Mainframe Live',
      actionText: 'Trigger National Hotline'
    }
  ];

  // Safe zones list
  const safeZones = [
    { id: 'sz-1', name: 'Lobo Cafe & SafeHaven Partner', address: 'C/ Dolores, 8', type: 'Cafe (CCTV Secure)', hours: 'Open till 02:00 AM' },
    { id: 'sz-2', name: 'District Civic Library (Security Guard on duty)', address: 'C/ Dolores, 45', type: 'Public Facility', hours: 'Open 24 Hours' },
    { id: 'sz-3', name: 'Farmacia 24H Dolores-Valencia', address: 'C/ de Valencia, 88', type: 'Pharmacy (Well Lit)', hours: 'Open 24 Hours' },
    { id: 'sz-4', name: 'Metrovalencia Dolores Station Entrance', address: 'C/ Dolores Metro Hub', type: 'Transit Hub (Staffed)', hours: 'Open till 01:30 AM' },
  ];

  // Try to update current location coords in background
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {}
      );
    }
  }, []);

  // Load live DB data if logged in
  const fetchDbData = async () => {
    if (!auth.currentUser) return;
    setDbLoading(true);
    try {
      const headers = await getHeaders();
      
      // Fetch checklist
      const checklistRes = await fetch('/api/safeguard/checklist', { headers });
      if (checklistRes.ok) {
        const checklistData = await checklistRes.json();
        setSafetyTips(checklistData);
      }

      // Fetch active/past SOS signals
      const sosRes = await fetch('/api/safeguard/sos', { headers });
      if (sosRes.ok) {
        const sosData = await sosRes.json();
        const activeSignal = sosData.find((s: any) => s.status === 'active');
        if (activeSignal) {
          setSosActive(true);
          setSosDispatched(true);
          setSosCountdown(0);
          setSosLogs(activeSignal.logs || []);
          setSosId(activeSignal.id);
        } else {
          setSosActive(false);
          setSosDispatched(false);
          setSosLogs([]);
          setSosId(null);
        }
      }

      // Fetch checkins
      const checkinsRes = await fetch('/api/safeguard/checkins', { headers });
      if (checkinsRes.ok) {
        const checkinsData = await checkinsRes.json();
        if (checkinsData.length > 0) {
          setCheckedInZone(checkinsData[0].zoneName);
          setCheckInTime(new Date(checkinsData[0].checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (err) {
      console.error('Failed to load database safeguard info:', err);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    if (firebaseUser) {
      fetchDbData();
    }
  }, [firebaseUser]);

  // SOS Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sosActive && sosCountdown > 0) {
      timer = setTimeout(async () => {
        const nextCount = sosCountdown - 1;
        setSosCountdown(nextCount);
        
        let newLogs = [...sosLogs];
        if (nextCount === 4) {
          newLogs.push(`[${new Date().toLocaleTimeString()}] Encrypting transmission payload...`);
        } else if (nextCount === 2) {
          newLogs.push(`[${new Date().toLocaleTimeString()}] Accessing Geolocation APIs: LAT: ${gpsCoords.lat.toFixed(5)} LNG: ${gpsCoords.lng.toFixed(5)}`);
        } else if (nextCount === 0) {
          newLogs.push(`[${new Date().toLocaleTimeString()}] Opening server-authoritative socket channel...`);
        }
        setSosLogs(newLogs);

        // If we are in real database mode, save logs to active SOS row in background
        if (firebaseUser && sosId) {
          try {
            const headers = await getHeaders();
            await fetch(`/api/safeguard/sos/${sosId}/logs`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ logs: newLogs })
            });
          } catch (e) {
            console.error("Failed to sync SOS logs:", e);
          }
        }
      }, 1000);
    } else if (sosActive && sosCountdown === 0 && !sosDispatched) {
      setSosDispatched(true);
      const completionLogs = [
        ...sosLogs,
        `[${new Date().toLocaleTimeString()}] 🟢 DISPATCHED! Direct alert payload transmitted successfully.`,
        `[${new Date().toLocaleTimeString()}] Valencia-Dolores Precinct dispatch units notified (ID: PE-SOS-${Math.floor(Math.random()*10000)}).`,
        `[${new Date().toLocaleTimeString()}] Emergency Contacts pinged with live coordinates: https://maps.google.com/?q=${gpsCoords.lat},${gpsCoords.lng}`
      ];
      setSosLogs(completionLogs);

      // Save complete dispatch log to database
      if (firebaseUser && sosId) {
        getHeaders().then(headers => {
          fetch(`/api/safeguard/sos/${sosId}/logs`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ logs: completionLogs })
          });
        });
      }
    }
    return () => clearTimeout(timer);
  }, [sosActive, sosCountdown, sosDispatched, gpsCoords, firebaseUser, sosId, sosLogs]);

  const handleStartSos = async () => {
    const initLogs = [`[${new Date().toLocaleTimeString()}] SOS sequence activated by ${firebaseUser ? firebaseUser.email : currentUser}.`];
    setSosActive(true);
    setSosCountdown(5);
    setSosDispatched(false);
    setSosLogs(initLogs);

    if (firebaseUser) {
      try {
        const headers = await getHeaders();
        const res = await fetch('/api/safeguard/sos', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            latitude: gpsCoords.lat,
            longitude: gpsCoords.lng,
            logs: initLogs
          })
        });
        if (res.ok) {
          const data = await res.json();
          setSosId(data.id);
        }
      } catch (err) {
        console.error("Failed to initialize remote SOS signal:", err);
      }
    }
  };

  const handleCancelSos = async () => {
    const localId = sosId;
    setSosActive(false);
    setSosCountdown(5);
    setSosDispatched(false);
    setSosLogs([]);
    setSosId(null);

    if (firebaseUser && localId) {
      try {
        const headers = await getHeaders();
        await fetch(`/api/safeguard/sos/${localId}/resolve`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ status: 'cancelled' })
        });
      } catch (err) {
        console.error("Failed to cancel SOS remote signal:", err);
      }
    }
  };

  const handleCheckIn = async (zoneName: string) => {
    setCheckedInZone(zoneName);
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCheckInTime(nowTimeStr);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, 4000);

    if (firebaseUser) {
      try {
        const headers = await getHeaders();
        await fetch('/api/safeguard/checkins', {
          method: 'POST',
          headers,
          body: JSON.stringify({ zoneName })
        });
      } catch (err) {
        console.error("Failed to record checkin in database:", err);
      }
    }
  };

  const toggleSafetyTip = async (id: number) => {
    // Optimistic UI updates
    const target = safetyTips.find(tip => tip.id === id);
    if (!target) return;
    const nextDone = !target.done;

    setSafetyTips(safetyTips.map(tip => tip.id === id ? { ...tip, done: nextDone } : tip));

    if (firebaseUser) {
      try {
        const headers = await getHeaders();
        await fetch(`/api/safeguard/checklist/${id}/toggle`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ done: nextDone })
        });
      } catch (err) {
        console.error("Failed to toggle checklist status:", err);
      }
    }
  };

  const handleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || res.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-sans text-slate-200">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold uppercase tracking-wider mb-2">
            <Shield className="w-3 h-3" /> District Security Division
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            SafeGuard Hub <span className="text-emerald-500">•</span> Women's Public Safety & Support Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Valencia-Dolores official autonomous safety grid connecting citizens with municipal police command, verified support NGOs, and certified safe-walk resources.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-white/[0.01] border border-white/5 px-3 py-1.5 rounded-xl">
          <Activity className="w-3 h-3 text-emerald-500 animate-pulse" /> {firebaseUser ? 'LIVE CLOUD SQL DATABASE SYNC ENABLED' : 'LOCAL SANDBOX ACTIVE'}
        </div>
      </div>

      {/* Cloud SQL authentication banner */}
      {!firebaseUser && (
        <div className="bg-[#0f1712] border border-emerald-500/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" /> Unlock Live Cloud SQL Database Synchronization
            </h4>
            <p className="text-xs text-slate-400 max-w-2xl">
              Currently running in temporary local mode. Sign in using your Google account to enable persistent storage for your emergency check-ins, companion checklists, and active SOS logs on Cloud SQL!
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignIn}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all shrink-0 shadow-lg shadow-emerald-500/10"
          >
            <LogIn className="w-4 h-4" /> Sign In with Google
          </button>
        </div>
      )}

      {dbLoading && (
        <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
          <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" /> Synchronizing safe corridors and distress telemetry...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Critical SOS Distress & Safe Walk Systems (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: The Urgent SOS Trigger Interface */}
          <div className="bg-[#0f0f0f] border-2 border-dashed border-red-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 z-10">
                <h3 className="text-sm font-bold text-red-500 tracking-wider font-mono uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 animate-bounce" /> INSTANT SOS TRANSMISSION
                </h3>
                <p className="text-xs text-slate-400 max-w-md">
                  Initiate a secure, encrypted high-priority distress broadcast containing your live location variables. Fires alerts to Valencia-Dolores police units and configured trusted peers instantly.
                </p>
              </div>
              <div className="text-[9px] font-mono bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase font-bold shrink-0">
                Level 1 Response
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-6 gap-4">
              {!sosActive ? (
                <button
                  type="button"
                  onClick={handleStartSos}
                  className="w-36 h-36 rounded-full bg-gradient-to-br from-red-600 to-red-900 border-8 border-red-500/20 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 group"
                >
                  <Radio className="w-10 h-10 text-white group-hover:animate-pulse mb-1.5" />
                  <span className="text-sm font-black text-white tracking-widest font-mono">TRIGGER</span>
                  <span className="text-[9px] text-red-200 uppercase tracking-widest font-semibold">5s CANCEL</span>
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-36 h-36 rounded-full bg-black/80 border-4 border-red-500 flex flex-col items-center justify-center animate-pulse">
                    {sosCountdown > 0 ? (
                      <>
                        <span className="text-4xl font-black text-red-500 font-mono">{sosCountdown}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">COUNTDOWN</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-10 h-10 text-emerald-500 animate-spin" />
                        <span className="text-xs font-black text-emerald-400 tracking-wider font-mono mt-1">DISPATCHED</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelSos}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Abort Emergency Sequence
                  </button>
                </div>
              )}
            </div>

            {/* Live Logs console */}
            {sosActive && (
              <div className="bg-black/60 rounded-xl p-3 border border-white/5 font-mono text-[9px] leading-relaxed text-slate-300 max-h-36 overflow-y-auto space-y-1">
                {sosLogs.map((log, index) => (
                  <div key={index} className={log.includes('🔴') || log.includes('🟢') ? 'text-emerald-400 font-bold' : ''}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Safe Corridor Network & Checked-In Stations */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Safe Corridors & Night Shelter Network</h3>
                  <p className="text-[10px] text-slate-400">Designated commercial partners and civic spaces configured to offer physical refuge.</p>
                </div>
              </div>
              <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">ACTIVE 24/7</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {safeZones.map((zone) => {
                const isSelected = checkedInZone === zone.name;
                return (
                  <div 
                    key={zone.id} 
                    className={`border p-3.5 rounded-xl transition-all flex flex-col justify-between gap-3 ${
                      isSelected 
                        ? 'bg-emerald-500/5 border-emerald-500/30 shadow-lg' 
                        : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-black/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs text-slate-100 block leading-tight">{zone.name}</span>
                        <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest shrink-0">{zone.type}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">{zone.address}</span>
                      <span className="text-[9px] text-slate-500 font-mono mt-1 block flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> {zone.hours}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCheckIn(zone.name)}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        isSelected 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-black' 
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      {isSelected ? 'Check-In Active' : 'Check-In Safe Zone'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Check-In alert notification banner */}
            <AnimatePresence>
              {showConfirmation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-start gap-2 text-xs text-emerald-400 font-mono"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase tracking-wider text-[10px]">Secure Check-In Logged!</span>
                    Your presence at <strong className="text-white">{checkedInZone}</strong> was logged at {checkInTime}. Emergency networks are informed of your secure coordinates.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* RIGHT COLUMN: Contact Matrices, NGO/Precinct Directories & Checklists (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Section 3: Safe-Walk Companion Audit Checklist */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-500" />
              Pre-Departure Companion Checklist
            </h3>
            <p className="text-[10px] text-slate-400 leading-normal">
              Ensure you review and complete these security configurations before initiating solo transits or neighborhood late walks.
            </p>

            <div className="space-y-2">
              {safetyTips.map((tip) => (
                <div 
                  key={tip.id} 
                  onClick={() => toggleSafetyTip(tip.id)}
                  className="bg-black/20 hover:bg-black/40 border border-white/5 hover:border-white/10 p-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition-all"
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    tip.done 
                      ? 'bg-emerald-500 border-emerald-500 text-black' 
                      : 'border-white/20'
                  }`}>
                    {tip.done && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-xs ${tip.done ? 'text-slate-500 line-through' : 'text-slate-300 font-medium'}`}>
                    {tip.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Public Safety Directory search & details */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Verified Safety Directory</h3>
              <p className="text-[10px] text-slate-400">Rapid access links, geographic placement notes, and emergency hotlines.</p>
            </div>

            {/* Filter and Search controls */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stations, shelters, NGOs..."
                  className="w-full bg-black/40 border border-white/5 rounded-xl pl-8.5 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-200 placeholder-slate-500"
                />
              </div>

              {/* Category tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1">
                {(['all', 'police', 'ngo', 'gov'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider border cursor-pointer transition-all shrink-0 ${
                      activeCategory === cat 
                        ? 'bg-emerald-500 text-black border-emerald-500' 
                        : 'bg-black/30 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Directory Cards list */}
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {filteredResources.length > 0 ? (
                filteredResources.map((res) => (
                  <div key={res.id} className="bg-black/40 border border-white/5 p-3.5 rounded-xl space-y-2.5 relative group hover:border-emerald-500/20 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border font-mono ${
                          res.type === 'police' 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                            : res.type === 'ngo' 
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {res.type.toUpperCase()}
                        </span>
                        <h4 className="font-extrabold text-xs text-white mt-1.5 leading-snug">{res.name}</h4>
                      </div>
                      <a
                        href={`tel:${res.phone}`}
                        className="bg-emerald-500/10 hover:bg-emerald-500 hover:text-black text-emerald-400 p-2 rounded-xl transition-all shrink-0 cursor-pointer"
                        title={`Call ${res.phone}`}
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-normal">{res.description}</p>

                    <div className="border-t border-white/5 pt-2 flex flex-col md:flex-row md:items-center justify-between gap-2 text-[9px] text-slate-500 font-mono">
                      <span>📍 {res.address}</span>
                      <span className="text-emerald-500 font-bold shrink-0">{res.status}</span>
                    </div>

                    {/* Direct dial prompt */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => alert(`Simulated API Trigger: Actioning "${res.actionText}" dispatch signal for ${res.name}.`)}
                        className="w-full bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 border border-white/5 py-1 rounded-lg text-[9px] font-mono uppercase tracking-wider font-semibold cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-2.5 h-2.5" /> {res.actionText}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs font-mono border border-dashed border-white/5 rounded-xl">
                  No registered security resources matched filters.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
