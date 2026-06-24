import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, CheckCircle, Brain, RefreshCw, Sparkles, TrendingUp, HelpCircle, BarChart3, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface Hotspot {
  area: string;
  severity: string;
  issueType: string;
  findings: string;
  prediction: string;
}

interface MaintenanceForecast {
  system: string;
  timeframe: string;
  risk: string;
  forecast: string;
}

interface CoordinatedRecommendation {
  department: string;
  action: string;
  impact: string;
}

interface InsightsResponse {
  hotspots: Hotspot[];
  maintenanceForecast: MaintenanceForecast[];
  recommendations: CoordinatedRecommendation[];
  warning?: string | null;
}

const HISTORICAL_TREND_DATA = [
  { name: '30d ago', 'Potholes': 18, 'Water Leaks': 5, 'Broken Lights': 12, 'Waste': 14, 'Infrastructure': 6, 'Other': 3 },
  { name: '25d ago', 'Potholes': 22, 'Water Leaks': 8, 'Broken Lights': 15, 'Waste': 19, 'Infrastructure': 4, 'Other': 5 },
  { name: '20d ago', 'Potholes': 30, 'Water Leaks': 6, 'Broken Lights': 10, 'Waste': 12, 'Infrastructure': 8, 'Other': 4 },
  { name: '15d ago', 'Potholes': 25, 'Water Leaks': 12, 'Broken Lights': 8, 'Waste': 24, 'Infrastructure': 5, 'Other': 6 },
  { name: '10d ago', 'Potholes': 35, 'Water Leaks': 18, 'Broken Lights': 14, 'Waste': 17, 'Infrastructure': 9, 'Other': 5 },
  { name: '5d ago', 'Potholes': 28, 'Water Leaks': 24, 'Broken Lights': 11, 'Waste': 15, 'Infrastructure': 7, 'Other': 3 },
  { name: 'Today', 'Potholes': 32, 'Water Leaks': 20, 'Broken Lights': 13, 'Waste': 22, 'Infrastructure': 8, 'Other': 4 },
];

const CATEGORY_CHART_COLORS = [
  { key: 'Potholes', color: '#ef4444' },
  { key: 'Water Leaks', color: '#3b82f6' },
  { key: 'Broken Lights', color: '#f59e0b' },
  { key: 'Waste', color: '#10b981' },
  { key: 'Infrastructure', color: '#8b5cf6' },
  { key: 'Other', color: '#64748b' }
];

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 rounded-xl shadow-2xl font-mono text-[11px] space-y-1.5">
        <p className="font-bold text-amber-500 border-b border-white/5 pb-1 flex items-center justify-between gap-4">
          <span>{label} Timeline</span>
          <span className="text-[9px] text-slate-500 font-normal">district audit</span>
        </p>
        <div className="space-y-1">
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }} />
                {entry.name}:
              </span>
              <span className="font-bold text-white">{entry.value} reports</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function PredictiveReport() {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartStyle, setChartStyle] = useState<'area' | 'line'>('area');

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/predictive-insights');
      if (!res.ok) throw new Error('Failed to retrieve predictive logs.');
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Server did not respond to insights request.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getSeverityBorder = (lvl: string) => {
    switch (lvl?.toLowerCase()) {
      case 'high': return 'border-l-4 border-l-red-500/80 bg-red-500/5 border-y border-r border-white/5';
      case 'medium': return 'border-l-4 border-l-amber-500/80 bg-amber-500/5 border-y border-r border-white/5';
      default: return 'border-l-4 border-l-white/10 bg-white/[0.01] border-y border-r border-white/5';
    }
  };

  const getRiskColor = (lvl: string) => {
    switch (lvl?.toLowerCase()) {
      case 'high': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-white/5 text-slate-300 border border-white/5';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard title and control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6.5 h-6.5 text-amber-500 fill-amber-500/15" /> AI Predictive Hotspots
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Proactive planning utilizing localized citizen reporting coordinates to analyze spatial clustering, forecast infrastructure failure, and optimize municipal mobilization.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 disabled:bg-white/10 disabled:text-slate-500 text-black font-bold text-xs px-4.5 py-2.5 rounded-xl flex items-center gap-2 self-start cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Run Predictive Model
        </button>
      </div>

      {/* Sandbox/Live Key banner */}
      {data && data.warning && (
        <div className="glass-panel border-0 rounded-xl p-4 text-xs text-slate-300 flex items-center gap-3.5 shadow-md">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
          <div className="flex-1">
            <span className="font-bold text-white uppercase block">AI Sandbox Mode active</span>
            <p className="text-slate-400 leading-relaxed">
              Using heuristic categorization model. {data.warning}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center space-y-3 glass-panel border-0 rounded-2xl shadow-2xl">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-200">Feeding spatial data into Gemini model...</p>
          <p className="text-xs text-slate-500">Analyzing street reports, verification logs, and neighborhood density maps.</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-500/5 border border-red-500/20 rounded-2xl space-y-2">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h4 className="font-semibold text-red-400 text-sm">Model Analysis Failed</h4>
          <p className="text-xs text-red-400/85">{error}</p>
          <button
            onClick={fetchInsights}
            className="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Main Column - Active Hotspots & Forecasts */}
          <div className="lg:col-span-2 space-y-6">
            {/* 30-Day Historical Trend Chart */}
            <div className="glass-panel border-0 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="font-bold text-base text-white">30-Day Report Volume Trend</h3>
                    <p className="text-[10px] text-slate-400">Audit report history partitioned by category</p>
                  </div>
                </div>
                
                {/* Control switches */}
                <div className="flex items-center bg-black/40 border border-white/5 rounded-lg p-0.5 self-start">
                  <button
                    onClick={() => setChartStyle('area')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-all ${
                      chartStyle === 'area' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Area
                  </button>
                  <button
                    onClick={() => setChartStyle('line')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-all ${
                      chartStyle === 'line' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Line
                  </button>
                </div>
              </div>

              <div className="h-64 w-full pr-4 text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  {chartStyle === 'area' ? (
                    <AreaChart data={HISTORICAL_TREND_DATA} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        {CATEGORY_CHART_COLORS.map((cat, idx) => (
                          <linearGradient key={idx} id={`color-${cat.key.replace(' ', '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={cat.color} stopOpacity={0.25}/>
                            <stop offset="95%" stopColor={cat.color} stopOpacity={0}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid stroke="#1e1e24" strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Legend 
                        iconType="circle" 
                        iconSize={8} 
                        wrapperStyle={{ paddingTop: 10, fontSize: 10 }}
                      />
                      {CATEGORY_CHART_COLORS.map((cat, idx) => (
                        <Area
                          key={idx}
                          type="monotone"
                          dataKey={cat.key}
                          stroke={cat.color}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill={`url(#color-${cat.key.replace(' ', '')})`}
                          name={cat.key}
                          stackId="1"
                        />
                      ))}
                    </AreaChart>
                  ) : (
                    <LineChart data={HISTORICAL_TREND_DATA} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#1e1e24" strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Legend 
                        iconType="circle" 
                        iconSize={8} 
                        wrapperStyle={{ paddingTop: 10, fontSize: 10 }}
                      />
                      {CATEGORY_CHART_COLORS.map((cat, idx) => (
                        <Line
                          key={idx}
                          type="monotone"
                          dataKey={cat.key}
                          stroke={cat.color}
                          strokeWidth={2.5}
                          dot={{ r: 3, strokeWidth: 1 }}
                          activeDot={{ r: 5 }}
                          name={cat.key}
                        />
                      ))}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active Hotspots list */}
            <div className="glass-panel border-0 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <TrendingUp className="w-5 h-5 text-slate-300" />
                <h3 className="font-bold text-base text-white">Spatial Vulnerability Hotspots</h3>
              </div>

              <div className="space-y-4">
                {data.hotspots?.map((hotspot, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl ${getSeverityBorder(hotspot.severity)} space-y-2`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">{hotspot.area}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold font-mono uppercase tracking-wide">
                          Clustered concern: {hotspot.issueType}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${getRiskColor(hotspot.severity)}`}>
                        {hotspot.severity} Risk
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 pt-1">
                      <p className="text-slate-400">
                        <strong className="text-slate-200">Observation Findings:</strong> {hotspot.findings}
                      </p>
                      <p className="text-slate-300 font-medium italic bg-black/40 p-2.5 rounded-lg border border-white/5">
                        🎯 <strong className="text-amber-400">AI Prediction:</strong> {hotspot.prediction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance Forecast list */}
            <div className="glass-panel border-0 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Shield className="w-5 h-5 text-slate-300" />
                <h3 className="font-bold text-base text-white">System Failure Horizon (Proactive Schedule)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.maintenanceForecast?.map((item, idx) => (
                  <div key={idx} className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-slate-200 text-sm">{item.system}</h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getRiskColor(item.risk)}`}>
                          {item.risk} Risk
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-500 font-bold font-mono uppercase">
                        Forecast horizon: {item.timeframe}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1 font-normal">
                      {item.forecast}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Recommendations */}
          <div className="glass-panel border-0 rounded-2xl p-6 shadow-xl space-y-5 h-fit">
            <div className="border-b border-white/5 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                ⚡ Coordinated Dispatch Recommendations
              </h3>
              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                Smart joint work-orders modeled to patch multiple adjacent issues in single mobilizations.
              </p>
            </div>

            <div className="space-y-4">
              {data.recommendations?.map((item, idx) => (
                <div key={idx} className="bg-amber-500/[0.03] border border-amber-500/15 p-4 rounded-xl space-y-3.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500 opacity-5 rounded-full translate-x-4 -translate-y-4" />
                  
                  <div className="space-y-1">
                    <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20 font-bold px-2 py-0.5 rounded uppercase font-mono">
                      {item.department}
                    </span>
                    <h4 className="font-bold text-slate-200 text-xs leading-relaxed pt-1">
                      {item.action}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-2 font-normal">
                    ✨ <strong className="text-amber-400 font-bold">Optimization Impact:</strong> {item.impact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400">
          No predictive data loaded. Press 'Run Predictive Model' to analyze.
        </div>
      )}
    </div>
  );
}
