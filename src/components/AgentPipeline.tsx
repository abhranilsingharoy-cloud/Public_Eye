import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Eye,
  Layers,
  Shield,
  Send,
  AlertTriangle,
  CheckCircle,
  Cpu,
  ArrowRight,
  HelpCircle,
  Database,
  Search,
  BookOpen,
  TrendingUp,
  Award
} from 'lucide-react';

export default function AgentPipeline() {
  const [selectedAgent, setSelectedAgent] = useState<number>(0);

  const agents = [
    {
      id: 1,
      name: 'Agent 1: Intake & Vision Agent',
      icon: Eye,
      role: 'Multimodal Classification & Diagnostics',
      tech: 'Gemini 3 Flash (Multimodal)',
      description: 'Triggered instantly upon report submission. Receives photos, videos, or voice reports and uses vision and spatial diagnostics to categorize the issue (pothole, waste, streetlight, etc.) and calculate a severity score (1-5) based on physical size and risk.',
      inputs: ['Citizen Photo/Video', 'Report Text', 'Voice Transcription'],
      outputs: ['Structured JSON (Category, Severity, Tags)', 'Gemini-Embedding-2 unified vector']
    },
    {
      id: 2,
      name: 'Agent 2: Duplicate & Cluster Agent',
      icon: Layers,
      role: 'Semantic De-duplication',
      tech: 'Gemini Multimodal Embeddings',
      description: 'Queries the neighborhood database. By calculating cosine similarity between the multimodal embeddings of the new report and nearby existing ones, it merges duplicates into a single active thread and flags emerging geospatial hotspots.',
      inputs: ['Unified report embedding', 'GPS coordinates'],
      outputs: ['Merged issue thread ID', 'Hotspot correlation index']
    },
    {
      id: 3,
      name: 'Agent 3: Verification & Trust Agent',
      icon: Shield,
      role: 'Spam Auditing & Reputation Score',
      tech: 'Gemini 3 Pro + Firestore',
      description: 'Evaluates report validity against community corroboration, user points history, and upvote metrics. It assigns a trust rating to the post and flag potential fraudulent or spam submissions for moderation.',
      inputs: ['User points history', 'Community upvotes', 'Verification logs'],
      outputs: ['Audit trust score (0-100)', 'Spam flag status']
    },
    {
      id: 4,
      name: 'Agent 4: Routing & Dispatch Agent',
      icon: Send,
      role: 'Jurisdictional Ward Assignment',
      tech: 'Grounding with Google Maps',
      description: 'Cross-references coordinates with SF city ward and utility boundaries. It automatically drafts a formal municipal work-order summary with category-specific dispatch metadata and assigns a recommended SLA.',
      inputs: ['Coordinates', 'Category details'],
      outputs: ['Dispatched department name', 'Work-order summary draft', 'SLA Target (e.g. 24h)']
    },
    {
      id: 5,
      name: 'Agent 5: Escalation & SLA Agent',
      icon: AlertTriangle,
      role: 'SLA Countdown & Auto-Escalation',
      tech: 'Cloud Functions & Scheduler',
      description: 'Runs periodic sweeps over unresolved reports. If an issue is nearing or breaches its SLA timeline without public department updates, it triggers an escalation: bumping priority, notifying council representatives, and increasing dashboard prominence.',
      inputs: ['Resolution timeline', 'Department response history'],
      outputs: ['Urgency level boost', 'Representative alert notification']
    },
    {
      id: 6,
      name: 'Agent 6: Resolution Verification Agent',
      icon: CheckCircle,
      role: 'Resolution Proof Auditor',
      tech: 'Gemini Vision (Before/After Comparative Analysis)',
      description: 'When a department or citizen logs a "resolved" status, this agent performs comparative vision analysis between the before and after photos to prove the hazard has been fully cleared. If false, it reopens the ticket.',
      inputs: ['Before photo', 'Submitted resolution photo', 'Closing notes'],
      outputs: ['Approval / Rejection decision', 'Resolution quality score']
    },
    {
      id: 7,
      name: 'Agent 7: Citizen Assistant Agent',
      icon: Cpu,
      role: 'Conversational Copilot',
      tech: 'Gemini 3.5 Flash + Grounded Tool-Use',
      description: 'A grounded chat interface that helps citizens register issues verbally or textually, audits active logs, drafts compliant city letters, and guides them through the leaderboard system using strict function calling.',
      inputs: ['User chat dialogue', 'District issue dataset'],
      outputs: ['Natural language responses', 'Triggered tool actions']
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Overview Card */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 lg:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10" />
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest font-mono">Autonomous Architecture</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mb-3">
            Multi-Agent Cognitive Framework
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            PublicEye operates on a high-integrity, multi-agent cognitive mesh rather than simple chat prompts. Every reported civic incident is handled by specialized, self-correcting AI agents that coordinate directly to intake, deduplicate, verify, route, escalate, and approve physical municipal resolutions.
          </p>
        </div>
      </div>

      {/* Visually Stunning Pipeline Flow (Interactive Diagram) */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-500" /> Complete Incident Pipeline Handoff Loop
        </h3>

        {/* CSS Diagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 relative">
          {agents.map((agent, idx) => {
            const IconComponent = agent.icon;
            const isSelected = selectedAgent === idx;
            return (
              <div key={agent.id} className="flex flex-col items-center relative">
                {/* Connector line for large screens */}
                {idx < 6 && (
                  <div className="hidden lg:block absolute left-[calc(50%+16px)] top-[28px] w-[calc(100%-32px)] h-0.5 bg-dashed bg-white/5 -z-10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-slate-700 shrink-0" />
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setSelectedAgent(idx)}
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-amber-500 border-amber-500 text-black shadow-lg ring-4 ring-amber-500/15 scale-105'
                      : 'bg-black/40 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                  <span className="absolute -bottom-1 -right-1 bg-black text-[9px] border border-white/10 text-slate-400 w-4.5 h-4.5 rounded-full flex items-center justify-center font-mono font-bold">
                    {agent.id}
                  </span>
                </button>
                <span className={`text-[10px] font-semibold font-mono mt-3 text-center line-clamp-2 px-1 ${
                  isSelected ? 'text-amber-400 font-bold' : 'text-slate-500'
                }`}>
                  {agent.name.replace('Agent ' + (idx+1) + ': ', '')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Agent Details Panel */}
        <div className="bg-black/40 border border-white/5 rounded-xl p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 transition-all">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center">
                {(() => {
                  const Icon = agents[selectedAgent].icon;
                  return <Icon className="w-5 h-5" />;
                })()}
              </div>
              <div>
                <h4 className="font-bold text-white text-base leading-none mb-1">{agents[selectedAgent].name}</h4>
                <p className="text-xs text-slate-500 font-mono font-medium">{agents[selectedAgent].role}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {agents[selectedAgent].description}
            </p>

            <div className="flex items-center gap-2 text-[10px] bg-white/5 border border-white/5 p-2 rounded-lg text-amber-400 font-mono font-medium w-fit">
              <Cpu className="w-3.5 h-3.5" /> Engine model: {agents[selectedAgent].tech}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-3.5 border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono block mb-1.5">Input Parameters</span>
              <div className="flex flex-wrap gap-1.5">
                {agents[selectedAgent].inputs.map((inp, i) => (
                  <span key={i} className="bg-white/5 border border-white/5 text-[9px] text-slate-300 font-mono px-2 py-1 rounded">
                    {inp}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono block mb-1.5">Output Artifacts</span>
              <div className="flex flex-wrap gap-1.5">
                {agents[selectedAgent].outputs.map((out, i) => (
                  <span key={i} className="bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 font-mono px-2 py-1 rounded">
                    {out}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Illustrated Walkthrough (First-time-user trust / onboarding explainers) */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="border-b border-white/5 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <HelpCircle className="w-4.5 h-4.5 text-amber-500" /> Citizen Handbook: How AI Auditing Works
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">We maintain the highest standards of municipal trust. Here is how citizen reports translate into real municipal actions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3 bg-white/[0.01] border border-white/5 p-5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-xs font-bold font-mono">
              01
            </div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">1. Hyperlocal Intake</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Snap a photo of the road hazard, water leak, or pile of debris, and log your coordinates. Agent 1 immediately determines severity and generates digital vector markers.
            </p>
          </div>

          <div className="space-y-3 bg-white/[0.01] border border-white/5 p-5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-xs font-bold font-mono">
              02
            </div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">2. Community Corroboration</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Neighbors upvote or register independent audit notes. When multiple citizens verify the same coordinates, the priority escalates and dispatches to SF Public Works immediately.
            </p>
          </div>

          <div className="space-y-3 bg-white/[0.01] border border-white/5 p-5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-xs font-bold font-mono">
              03
            </div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">3. Comparative Audit Proof</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              When closed, a resolution photo is verified by Agent 6. It compares before/after states to ensure the hazard is fully cleared, rewarding you with civic leaderboard points!
            </p>
          </div>
        </div>
      </div>

      {/* Gamification Rules Box */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-amber-500 text-[9px] font-bold tracking-widest text-black px-2.5 py-1 rounded-bl-lg font-mono uppercase">
          Points & Leaderboard Engine
        </div>
        <div className="md:col-span-8 space-y-3">
          <h4 className="font-bold text-white text-sm uppercase tracking-wider font-mono">Civic Points Multiplier system</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every audit or file report earns you civic points, helping you rise on the Valencia-Dolores district leaderboards. Points are distributed based on severity level and verified actions:
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-bold font-mono text-amber-500">+50 pts</span>
              <span>Reporting a new hazard</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-bold font-mono text-amber-500">+20 pts</span>
              <span>Upvoting/Corroborating a report</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-bold font-mono text-amber-500">+100 pts</span>
              <span>Submitting resolution proof</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-bold font-mono text-amber-500">+150 pts</span>
              <span>Verified field audit log</span>
            </div>
          </div>
        </div>
        <div className="md:col-span-4 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 space-y-2">
          <Award className="w-10 h-10 text-amber-500 shrink-0" />
          <span className="font-bold text-white text-xs uppercase tracking-wider font-mono">District Heroes</span>
          <p className="text-[10px] text-slate-500 text-center">Top 3 monthly contributors unlock the exclusive "Ward Marshal" gold badge.</p>
        </div>
      </div>
    </div>
  );
}
