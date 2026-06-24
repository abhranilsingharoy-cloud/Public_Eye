import React, { useState } from 'react';
import { Issue } from '../types';
import { 
  Pin, 
  MapPin, 
  Plus, 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Layers,
  Flame,
  ShieldAlert
} from 'lucide-react';

interface MapProps {
  issues: Issue[];
  selectedIssueId: string | null;
  onSelectIssue: (issueId: string) => void;
  onMapClickToReport: (lat: number, lng: number) => void;
}

const MIN_LAT = 37.758;
const MAX_LAT = 37.772;
const MIN_LNG = -122.432;
const MAX_LNG = -122.410;

export default function Map({ issues, selectedIssueId, onSelectIssue, onMapClickToReport }: MapProps) {
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);
  const [clickCoord, setClickCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [activeLayer, setActiveLayer] = useState<'streets' | 'heatmap' | 'hazards'>('streets');

  // Map coordinates projection
  const projectCoords = (lat: number, lng: number) => {
    const y = 100 - ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100;
    const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
    return { x, y };
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // Only capture click if clicking directly on the map background/streets
    const target = e.target as SVGElement;
    if (target.tagName !== 'svg' && target.id !== 'map-bg' && !target.classList.contains('map-street')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const pctX = clickX / rect.width;
    const pctY = clickY / rect.height;

    const clickedLng = MIN_LNG + pctX * (MAX_LNG - MIN_LNG);
    const clickedLat = MAX_LAT - pctY * (MAX_LAT - MIN_LAT);

    // Round to 4 decimals
    const roundedLat = Math.round(clickedLat * 10000) / 10000;
    const roundedLng = Math.round(clickedLng * 10000) / 10000;

    setClickCoord({ lat: roundedLat, lng: roundedLng });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'pothole': return '#EF4444'; // Red
      case 'water_leak': return '#3B82F6'; // Blue
      case 'broken_light': return '#F59E0B'; // Amber
      case 'waste': return '#10B981'; // Green
      case 'infrastructure': return '#8B5CF6'; // Purple
      default: return '#6B7280'; // Gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-3 h-3 text-emerald-600" />;
      case 'in_progress': return <Clock className="w-3 h-3 text-blue-600" />;
      default: return <AlertCircle className="w-3 h-3 text-red-500" />;
    }
  };

  return (
    <div className="relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-xl aspect-[1.6] md:aspect-auto md:h-[550px]">
      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-black/85 backdrop-blur-md border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-300 pointer-events-none">
        <div className="font-semibold text-white tracking-wide uppercase">Valencia-Dolores District</div>
        <div className="text-[10px] text-slate-500">Interactive Architectural Grid Map</div>
      </div>

      {/* Layer Control Toggle Overlay */}
      <div className="absolute top-4 right-4 z-10 bg-black/85 backdrop-blur-md border border-white/10 rounded-xl p-1 flex items-center gap-1 shadow-2xl">
        <button
          id="layer-btn-streets"
          onClick={() => setActiveLayer('streets')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            activeLayer === 'streets'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title="Standard Street View"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Streets</span>
        </button>
        <button
          id="layer-btn-heatmap"
          onClick={() => setActiveLayer('heatmap')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            activeLayer === 'heatmap'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title="High-Contrast Hotspots Heatmap"
        >
          <Flame className="w-3.5 h-3.5 text-orange-400 group-hover:animate-pulse" />
          <span className="hidden sm:inline">Heatmap</span>
        </button>
        <button
          id="layer-btn-hazards"
          onClick={() => setActiveLayer('hazards')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            activeLayer === 'hazards'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title="Public Safety Hazard Overlays"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">Hazards</span>
        </button>
      </div>

      {/* Guide tooltip */}
      <div className="absolute bottom-4 right-4 z-10 bg-black/90 border border-white/5 rounded-lg p-2.5 max-w-[200px] text-[11px] text-slate-400">
        <p className="font-medium text-amber-500 mb-1">💡 Interactive Guide</p>
        <p>Click anywhere on the grid streets to place a pin and report an issue at those exact coordinates.</p>
      </div>

      {/* Grid Canvas */}
      <svg
        className="w-full h-full cursor-crosshair select-none"
        onClick={handleSvgClick}
        viewBox="0 0 1000 600"
      >
        {/* Background Grid */}
        <rect id="map-bg" width="1000" height="600" fill="#060606" />
        
        {/* Fine Architectural Gridlines & Heatmap Gradients */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#262626" strokeWidth="0.5" opacity="0.4" />
          </pattern>

          <radialGradient id="heat-pothole" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#EF4444" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="heat-water" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="heat-light" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="heat-waste" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="heat-infra" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1000" height="600" fill="url(#grid)" />

        {/* Dolores Park Area (Greenbelt) */}
        <g opacity="0.12">
          {/* Dolores Park is located on the left/west side */}
          <rect x="80" y="250" width="180" height="280" fill="#22c55e" rx="10" />
          <text x="170" y="390" fill="#22c55e" fontSize="14" fontWeight="600" textAnchor="middle" letterSpacing="1">Dolores Park</text>
        </g>

        {/* Commercial Building Zones */}
        <g opacity="0.08" fill="#475569">
          <rect x="580" y="80" width="120" height="100" rx="4" />
          <text x="640" y="135" fill="#94a3b8" fontSize="11" textAnchor="middle">Safeway Plaza</text>

          <rect x="350" y="450" width="140" height="90" rx="4" />
          <text x="420" y="500" fill="#94a3b8" fontSize="11" textAnchor="middle">Civic Pavilion</text>
        </g>

        {/* Streets & Roads Grid */}
        <g opacity={activeLayer === 'heatmap' ? '0.1' : '0.3'}>
          {/* Main Avenues - North/South */}
          {/* Church St (West) */}
          <line x1="80" y1="0" x2="80" y2="600" stroke="#475569" strokeWidth="16" className="map-street" />
          {/* Dolores St (Center-West) */}
          <line x1="280" y1="0" x2="280" y2="600" stroke="#475569" strokeWidth="20" className="map-street" />
          {/* Valencia St (Center-East) */}
          <line x1="580" y1="0" x2="580" y2="600" stroke="#475569" strokeWidth="18" className="map-street" />
          {/* Mission St (East) */}
          <line x1="880" y1="0" x2="880" y2="600" stroke="#475569" strokeWidth="18" className="map-street" />

          {/* Cross Streets - East/West */}
          {/* 16th St (North) */}
          <line x1="0" y1="120" x2="1000" y2="120" stroke="#475569" strokeWidth="16" className="map-street" />
          {/* 17th St (Mid-North) */}
          <line x1="0" y1="260" x2="1000" y2="260" stroke="#475569" strokeWidth="14" className="map-street" />
          {/* 18th St (Mid-South) */}
          <line x1="0" y1="400" x2="1000" y2="400" stroke="#475569" strokeWidth="16" className="map-street" />
          {/* 19th St (South) */}
          <line x1="0" y1="520" x2="1000" y2="520" stroke="#475569" strokeWidth="14" className="map-street" />

          {/* Dotted lines inside lanes */}
          <line x1="80" y1="0" x2="80" y2="600" stroke="#ffffff" strokeWidth="1" strokeDasharray="6,8" />
          <line x1="280" y1="0" x2="280" y2="600" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="12,12" /> {/* Double yellow line represent */}
          <line x1="580" y1="0" x2="580" y2="600" stroke="#ffffff" strokeWidth="1" strokeDasharray="6,8" />
          <line x1="880" y1="0" x2="880" y2="600" stroke="#ffffff" strokeWidth="1" strokeDasharray="6,8" />
          <line x1="0" y1="120" x2="1000" y2="120" stroke="#ffffff" strokeWidth="1" strokeDasharray="6,8" />
          <line x1="0" y1="400" x2="1000" y2="400" stroke="#ffffff" strokeWidth="1" strokeDasharray="6,8" />
        </g>

        {/* Heatmap Glow Overlays */}
        {activeLayer === 'heatmap' && (
          <g id="heatmap-glow-layer">
            {issues.map((issue) => {
              const { x, y } = projectCoords(issue.latitude, issue.longitude);
              const svgX = (x / 100) * 1000;
              const svgY = (y / 100) * 600;
              
              let gradientId = 'heat-infra';
              if (issue.category === 'pothole') gradientId = 'heat-pothole';
              else if (issue.category === 'water_leak') gradientId = 'heat-water';
              else if (issue.category === 'broken_light') gradientId = 'heat-light';
              else if (issue.category === 'waste') gradientId = 'heat-waste';

              // Scale heat radius dynamically based on verification upvotes and AI severity
              const multiplier = issue.aiSeverity === 'high' ? 2.2 : issue.aiSeverity === 'medium' ? 1.6 : 1.1;
              const baseRadius = 40 + (issue.upvotes * 5);
              const finalRadius = Math.min(130, baseRadius * multiplier);

              return (
                <g key={`heat-${issue.id}`}>
                  {/* Large outer warm ambient glow */}
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r={finalRadius}
                    fill={`url(#${gradientId})`}
                    className="animate-pulse"
                    opacity="0.65"
                    style={{ animationDuration: '3s' }}
                  />
                  {/* Intense inner hotspot */}
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r={finalRadius * 0.35}
                    fill={`url(#${gradientId})`}
                    opacity="0.9"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* Public Safety Hazard Overlays */}
        {activeLayer === 'hazards' && (
          <g id="hazard-overlays-layer">
            {issues.filter(i => i.status !== 'resolved').map((issue) => {
              const { x, y } = projectCoords(issue.latitude, issue.longitude);
              const svgX = (x / 100) * 1000;
              const svgY = (y / 100) * 600;
              
              // Draw a warning buffer zone around the unresolved hazards
              const severityColor = issue.aiSeverity === 'high' ? '#ef4444' : '#f59e0b';
              const bufferRadius = issue.aiSeverity === 'high' ? 65 : 45;

              return (
                <g key={`hazard-buffer-${issue.id}`}>
                  {/* Translucent warning boundary zone */}
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r={bufferRadius}
                    fill={severityColor}
                    fillOpacity="0.08"
                    stroke={severityColor}
                    strokeWidth="1.5"
                    strokeDasharray="5,6"
                  >
                    <animate attributeName="stroke-dashoffset" values="0;22" dur="3s" repeatCount="indefinite" />
                  </circle>

                  {/* Intermittent danger warning boundary ring */}
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r={bufferRadius + 12}
                    fill="none"
                    stroke={severityColor}
                    strokeWidth="0.75"
                    strokeDasharray="2,8"
                    opacity="0.5"
                  />

                  {/* Small flashing caution badge */}
                  <g transform={`translate(${svgX + bufferRadius - 4}, ${svgY - bufferRadius + 4})`}>
                    <circle r="7" fill="#000000" stroke={severityColor} strokeWidth="1.2" />
                    <text
                      y="3"
                      fill={severityColor}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      !
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Translucent danger warning stripes along primary hazard avenues */}
            <g opacity="0.15">
              {/* Valencia St Corridor alert */}
              <line x1="580" y1="50" x2="580" y2="550" stroke="#ef4444" strokeWidth="24" strokeLinecap="round" strokeDasharray="10,15" />
              {/* 16th St Corridor alert */}
              <line x1="100" y1="120" x2="900" y2="120" stroke="#f59e0b" strokeWidth="20" strokeLinecap="round" strokeDasharray="10,15" />
            </g>
          </g>
        )}

        {/* Dynamic New Marker Placement Pre-Indicator */}
        {clickCoord && (
          <g>
            {/* Pulsing ring */}
            <circle
              cx={(clickCoord.lng - MIN_LNG) / (MAX_LNG - MIN_LNG) * 1000}
              cy={(1 - (clickCoord.lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 600}
              r="22"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              opacity="0.8"
            >
              <animate attributeName="r" values="8;24;8" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.8s" repeatCount="indefinite" />
            </circle>
            {/* Targeted center */}
            <circle
              cx={(clickCoord.lng - MIN_LNG) / (MAX_LNG - MIN_LNG) * 1000}
              cy={(1 - (clickCoord.lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 600}
              r="5"
              fill="#f59e0b"
            />
          </g>
        )}

        {/* Existing Issue Pins */}
        {issues.map((issue) => {
          const { x, y } = projectCoords(issue.latitude, issue.longitude);
          // Scale x, y percentage to 1000x600 coordinates
          const svgX = (x / 100) * 1000;
          const svgY = (y / 100) * 600;
          const isSelected = selectedIssueId === issue.id;
          const isHovered = hoveredIssue?.id === issue.id;
          const pinColor = getCategoryColor(issue.category);

          return (
            <g
              key={issue.id}
              onClick={() => onSelectIssue(issue.id)}
              onMouseEnter={() => setHoveredIssue(issue)}
              onMouseLeave={() => setHoveredIssue(null)}
              className="cursor-pointer group"
            >
              {/* Outer pulsing shadow circle for selected or high severity issues */}
              {(isSelected || issue.aiSeverity === 'high') && (
                <circle
                  cx={svgX}
                  cy={svgY}
                  r={isSelected ? "18" : "12"}
                  fill={pinColor}
                  opacity={isSelected ? "0.3" : "0.15"}
                >
                  <animate attributeName="r" values="10;22;10" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Pin Base Circle */}
              <circle
                cx={svgX}
                cy={svgY}
                r={isSelected ? "9" : "7"}
                fill={isSelected ? "#ffffff" : pinColor}
                stroke={isSelected ? pinColor : "#0f172a"}
                strokeWidth={isSelected ? "3" : "1.5"}
                className="transition-all duration-200 group-hover:scale-125"
              />

              {/* Status Dot */}
              <circle
                cx={svgX}
                cy={svgY}
                r="2.5"
                fill={issue.status === 'resolved' ? '#060606' : '#ffffff'}
              />
            </g>
          );
        })}
      </svg>

      {/* Live Coordinate Footer Indicator */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur-md border border-white/5 rounded-lg px-2.5 py-1 text-[10px] text-slate-400 font-mono flex items-center gap-1.5 pointer-events-none">
        <Crosshair className="w-3.5 h-3.5 text-slate-500" />
        <span>37.7651° N, 122.4211° W</span>
      </div>

      {/* Hover Info Card Overlay */}
      {hoveredIssue && (
        <div
          className="absolute bg-black/95 border border-white/10 shadow-2xl rounded-xl p-3 max-w-[240px] pointer-events-none z-20 transition-all duration-150"
          style={{
            left: `${Math.min(80, Math.max(5, projectCoords(hoveredIssue.latitude, hoveredIssue.longitude).x))}%`,
            top: `${Math.min(75, Math.max(5, projectCoords(hoveredIssue.latitude, hoveredIssue.longitude).y - 28))}%`
          }}
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider bg-white/5 border border-white/5 rounded-full px-2 py-0.5">
              {hoveredIssue.category.replace('_', ' ')}
            </span>
            <span className="flex items-center gap-1 text-[9px] text-slate-400 capitalize">
              {getStatusIcon(hoveredIssue.status)}
              {hoveredIssue.status.replace('_', ' ')}
            </span>
          </div>
          <h4 className="font-semibold text-xs text-white line-clamp-1 mb-1">{hoveredIssue.title}</h4>
          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-1.5">{hoveredIssue.description}</p>
          <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-white/5 pt-1.5">
            <span>By: {hoveredIssue.reporter.split('@')[0]}</span>
            <span className="text-amber-500 font-medium">▲ {hoveredIssue.upvotes} Votes</span>
          </div>
        </div>
      )}

      {/* Floating coordinates confirmation container */}
      {clickCoord && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#121212] border border-white/10 p-4 rounded-xl shadow-2xl z-20 text-center max-w-[280px]">
          <MapPin className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-white mb-1">Set Pin Coordinates</h4>
          <p className="text-xs text-slate-400 font-mono mb-3">
            {clickCoord.lat.toFixed(4)}° N, {clickCoord.lng.toFixed(4)}° W
          </p>
          <div className="flex items-center gap-2 justify-center">
            <button
              onClick={() => {
                onMapClickToReport(clickCoord.lat, clickCoord.lng);
                setClickCoord(null);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> File Report
            </button>
            <button
              onClick={() => setClickCoord(null)}
              className="bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5 text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
