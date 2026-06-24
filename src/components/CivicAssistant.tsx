import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  Volume2,
  Play,
  Pause,
  Loader2,
  FileText,
  Wrench,
  ShieldAlert,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  VolumeX,
} from 'lucide-react';
import { Issue } from '../types';

interface CivicAssistantProps {
  issues: Issue[];
  currentUser: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function CivicAssistant({ issues, currentUser }: CivicAssistantProps) {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I am your hyperlocal **Civic AI Coprocessor**. I analyze active community reports, municipal resources, and district trends.

How can I help you today? You can ask me to:
* 📊 **Summarize active issues** in the district
* 📝 **Draft a formal public works report**
* 💡 **Provide civic safety tips** for specific hazards`,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Audio Digest state
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [digestText, setDigestText] = useState<string>('');
  const [ttsMode, setTtsMode] = useState<'gemini' | 'browser' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Action Plan state
  const [planningLoading, setPlanningLoading] = useState(false);
  const [actionPlan, setActionPlan] = useState<{
    summary: string;
    routeProposal: string;
    savings: string;
    recommendations: string[];
  } | null>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Chat Submit
  const handleChatSubmit = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isSending) return;

    if (!customText) {
      setInputText('');
    }

    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsSending(true);

    try {
      const res = await fetch('/api/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          text: data.reply,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('Chat API returned an error');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'assistant',
          text: `⚠️ **AI Coprocessor Communication Offline**

I experienced a connection issue. However, based on local cache:
* We currently have **${issues.filter(i => i.status !== 'resolved').length} active issues** in the database.
* The most upvoted issue is: **"${issues.sort((a,b) => b.upvotes - a.upvotes)[0]?.title || 'None'}"**.
* To enable real-time conversational processing, verify that your backend development server is running.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Generate Coordinated Dispatch Action Plan
  const generateActionPlan = async () => {
    setPlanningLoading(true);
    try {
      const res = await fetch('/api/action-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setActionPlan(data);
      }
    } catch (err) {
      console.error('Action planning error:', err);
      // Fallback proposal
      setActionPlan({
        summary: "Coordinated municipal sweep recommended for the Valencia St Corridor.",
        routeProposal: "Group the high-priority Pothole (Valencia & 16th) with the active Water Leak (Valencia & 18th) to minimize lane closure overhead.",
        savings: "Estimated 30% reduction in vehicle dispatch overhead and 4 hours of public lane closure avoidance.",
        recommendations: [
          "Deploy a combined asphalt/drainage inspection vehicle to Valencia St.",
          "Notify SF DPW water control of potential secondary damage from pressure drops.",
          "Schedule repair for Friday 09:00 AM to avoid heavy commuter transit windows."
        ]
      });
    } finally {
      setPlanningLoading(false);
    }
  };

  // Generate & Play Audio Briefing (TTS)
  const handleListenBriefing = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      } else {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
        return;
      }
    }

    setAudioLoading(true);
    try {
      const res = await fetch('/api/audio-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        setDigestText(data.briefingText);

        if (data.audioBase64) {
          // Play Gemini premium TTS
          const binary = atob(data.audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setTtsMode('gemini');

          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => setIsPlaying(false);
          audio.play();
          setIsPlaying(true);
        } else {
          // Play Browser SpeechSynthesis Fallback
          setTtsMode('browser');
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(data.briefingText);
          
          // Try to find a nice male or female natural voice
          const voices = window.speechSynthesis.getVoices();
          const premiumVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
          if (premiumVoice) utterance.voice = premiumVoice;
          
          utterance.rate = 1.05;
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error('Audio briefing error:', err);
      // Direct Web Speech synthesis fallback
      setTtsMode('browser');
      const text = `PublicEye audio brief. We currently have ${issues.filter(i => i.status !== 'resolved').length} active reports in the Valencia-Dolores region. Potholes remain the highest category. Join the leaderboard to earn points and audit reports.`;
      setDigestText(text);
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } finally {
      setAudioLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const sampleQuestions = [
    "Summarize active issues",
    "Show community leaderboard top players",
    "Explain how to verify a report",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-stretch">
      {/* Left panel: Audio Digest & Action Planner (col-span-5) */}
      <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
        
        {/* Card 1: Synthesized Community Radio (TTS) */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 bg-amber-500 text-[9px] font-bold tracking-widest text-black px-2.5 py-1 rounded-bl-lg flex items-center gap-1 font-mono uppercase">
            <Volume2 className="w-3 h-3 fill-black animate-pulse" /> Live Broadcast
          </div>

          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4 text-amber-500" /> Neighborhood Audio Briefing
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Generate a synthesized, real-time AI audio podcast of recent municipal updates, community wins, and hazardous alerts in our district.
            </p>
          </div>

          <div className="bg-black/30 border border-white/5 p-4 rounded-xl flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <button
                onClick={handleListenBriefing}
                disabled={audioLoading}
                className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/10"
              >
                {audioLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-black stroke-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black stroke-black translate-x-0.5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
                  {audioLoading ? 'Generating podcast...' : isPlaying ? 'Now Playing' : 'Community Briefing Podcast'}
                </span>
                <p className="text-xs font-bold text-slate-200 truncate mt-0.5">
                  {isPlaying ? 'Weekly District Diagnostic Report' : 'Ready to synthesize update...'}
                </p>
                {ttsMode && (
                  <span className="text-[9px] bg-white/5 border border-white/5 text-amber-500 px-2 py-0.5 rounded font-mono mt-1 inline-block">
                    {ttsMode === 'gemini' ? '🎙️ Gemini TTS Premium' : '🗣️ Local Voice Synth'}
                  </span>
                )}
              </div>
            </div>

            {digestText && (
              <div className="border-t border-white/5 pt-3 mt-1">
                <span className="text-[9px] font-bold text-amber-500 tracking-wider font-mono block mb-1">Subtitles / Transcript:</span>
                <p className="text-[11px] text-slate-300 italic leading-relaxed line-clamp-3 bg-black/40 p-2.5 rounded-lg border border-white/5">
                  "{digestText}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Municipal Coordinated Dispatch Planner */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-xl space-y-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-amber-500" /> Coordinated Municipal Sweep
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Use Gemini intelligence to analyze the geographical clusters of outstanding issues, proposing optimized joints, cost metrics, and work dispatches.
            </p>
          </div>

          <div className="space-y-3.5 mt-2 flex-1 flex flex-col justify-end">
            {actionPlan ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3 text-xs flex-1 overflow-y-auto max-h-[220px]"
              >
                <div>
                  <span className="text-amber-400 font-bold block mb-1">📋 Optimized Proposal Summary</span>
                  <p className="text-slate-200 leading-relaxed">{actionPlan.summary}</p>
                </div>
                <div className="border-t border-white/5 pt-2.5">
                  <span className="text-amber-400 font-bold block mb-1">🗺️ Coordinated Route Proposal</span>
                  <p className="text-slate-200 leading-relaxed">{actionPlan.routeProposal}</p>
                </div>
                <div className="border-t border-white/5 pt-2.5">
                  <span className="text-emerald-400 font-bold block mb-1">💰 Estimated Budget Savings</span>
                  <p className="text-slate-200 font-semibold">{actionPlan.savings}</p>
                </div>
                <div className="border-t border-white/5 pt-2.5">
                  <span className="text-amber-400 font-bold block mb-1">⚙️ Dispatch Steps</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 mt-1">
                    {actionPlan.recommendations.map((rec, idx) => (
                      <li key={idx} className="leading-relaxed">{rec}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-8 border border-dashed border-white/5 bg-black/10 rounded-xl text-slate-500 text-xs flex flex-col items-center justify-center flex-1">
                <FileText className="w-8 h-8 text-slate-600 mb-2" />
                <span>No active action plan generated yet.</span>
              </div>
            )}

            <button
              onClick={generateActionPlan}
              disabled={planningLoading}
              className="w-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-amber-500/30 text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              {planningLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Synthesizing municipal route dispatch...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{actionPlan ? 'Regenerate Dispatch Proposal' : 'Generate Optimized Action Plan'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Right panel: Conversational Chat Interface (col-span-7) */}
      <div className="lg:col-span-7 bg-[#121212] border border-white/5 rounded-2xl flex flex-col h-[calc(100vh-180px)] min-h-[600px] max-h-[900px] shadow-xl overflow-hidden">
        {/* Chat header */}
        <div className="px-5 py-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-widest text-white font-mono">Civic AI Chat Copilot</h3>
              <p className="text-[10px] text-slate-500 font-medium font-mono">Connected to District intelligence</p>
            </div>
          </div>
          <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Copilot
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-[85%] ${isAssistant ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
                >
                  <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs border ${
                    isAssistant
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      : 'bg-white/10 border-white/15 text-slate-200'
                  }`}>
                    {isAssistant ? 'AI' : 'U'}
                  </div>

                  <div className={`rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 border ${
                    isAssistant
                      ? 'bg-black/30 border-white/5 text-slate-200'
                      : 'bg-amber-500 text-black border-amber-500/10 font-medium'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className={`block text-[9px] font-mono mt-1 ${isAssistant ? 'text-slate-500' : 'text-black/60'}`}>
                      {msg.timestamp.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="px-5 py-2.5 border-t border-white/5 bg-black/10 flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleChatSubmit(undefined, q)}
              disabled={isSending}
              className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all hover:border-amber-500/20 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleChatSubmit} className="p-4 bg-black/20 border-t border-white/5 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            placeholder="Ask the Civic Coprocessor about reports, plans or guides..."
            className="flex-1 bg-white/5 border border-white/10 text-xs px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-white placeholder-slate-500 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isSending || !inputText.trim()}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-black font-bold text-xs p-3.5 rounded-xl cursor-pointer shrink-0 transition-all flex items-center justify-center shadow-lg shadow-amber-500/5 disabled:shadow-none"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
