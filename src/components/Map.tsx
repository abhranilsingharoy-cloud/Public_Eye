import React, { useState, useEffect } from 'react';
import { Issue } from '../types';
import { 
  Pin, 
  MapPin, 
  Plus, 
  Crosshair, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Layers,
  Flame,
  ShieldAlert,
  Building,
  HeartHandshake
} from 'lucide-react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin as GooglePin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

import { HeatmapLayer } from './HeatmapLayer';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

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

// Subcomponent to handle click events
function MapClickHandler({ setClickCoord }: { setClickCoord: (coord: {lat: number, lng: number} | null) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('click', (e: any) => {
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if (lat && lng) {
        setClickCoord({ lat, lng });
      }
    });
    return () => google.maps.event.removeListener(listener);
  }, [map, setClickCoord]);
  return null;
}

// Subcomponent to detect and render nearby facilities (NGOs and Govt)
function FacilitiesLayer() {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const [facilities, setFacilities] = useState<google.maps.places.PlaceResult[]>([]);
  const [hoveredFacility, setHoveredFacility] = useState<google.maps.places.PlaceResult | null>(null);

  useEffect(() => {
    if (!placesLib || !map) return;
    const service = new placesLib.PlacesService(map);
    
    // Search for Local Government Offices
    service.nearbySearch({
      location: map.getCenter() || { lat: 37.765, lng: -122.421 },
      radius: 2000,
      type: 'local_government_office'
    }, (results, status) => {
      if (status === placesLib.PlacesServiceStatus.OK && results) {
        setFacilities(prev => [...prev, ...results.map(r => ({...r, facilityType: 'govt'}))]);
      }
    });

    // Search for NGOs
    service.nearbySearch({
      location: map.getCenter() || { lat: 37.765, lng: -122.421 },
      radius: 2000,
      keyword: 'non profit organization ngo'
    }, (results, status) => {
      if (status === placesLib.PlacesServiceStatus.OK && results) {
        setFacilities(prev => [...prev, ...results.map(r => ({...r, facilityType: 'ngo'}))]);
      }
    });
  }, [placesLib, map]);

  // Remove duplicates based on place_id
  const uniqueFacilities = Array.from(new globalThis.Map(facilities.map(f => [f.place_id, f])).values()) as any[];

  return (
    <>
      {uniqueFacilities.map((facility) => {
        if (!facility.geometry?.location) return null;
        const isGovt = (facility as any).facilityType === 'govt';
        const color = isGovt ? '#64748b' : '#ec4899'; // Slate for Govt, Pink for NGO
        const Icon = isGovt ? Building : HeartHandshake;

        return (
          <AdvancedMarker
            key={facility.place_id}
            position={{ lat: facility.geometry.location.lat(), lng: facility.geometry.location.lng() }}
            onMouseEnter={() => setHoveredFacility(facility)}
            onMouseLeave={() => setHoveredFacility(null)}
            zIndex={2}
            title={facility.name}
          >
            <div className="relative cursor-pointer transition-transform hover:scale-110 flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur-sm p-1 rounded-full border border-white/20 shadow-lg">
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
          </AdvancedMarker>
        );
      })}

      {hoveredFacility && hoveredFacility.geometry?.location && (
        <div className="absolute bg-black/95 border border-white/10 shadow-2xl rounded-xl p-3 max-w-[240px] pointer-events-none z-20 transition-all duration-150 top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider bg-white/5 border border-white/5 rounded-full px-2 py-0.5">
              {(hoveredFacility as any).facilityType === 'govt' ? 'Govt Office' : 'NGO / Non-Profit'}
            </span>
            <span className="flex items-center gap-1 text-[9px] text-emerald-400 capitalize">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          </div>
          <h4 className="font-semibold text-xs text-white line-clamp-1 mb-1">{hoveredFacility.name}</h4>
          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-1.5">{hoveredFacility.vicinity}</p>
        </div>
      )}
    </>
  );
}

export default function Map({ issues, selectedIssueId, onSelectIssue, onMapClickToReport }: MapProps) {
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);
  const [clickCoord, setClickCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [activeLayer, setActiveLayer] = useState<'streets' | 'heatmap' | 'hazards'>('streets');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  let activeInRadius = 0;
  let resolvedInRadius = 0;
  if (clickCoord) {
    issues.forEach((issue) => {
      const distance = getDistanceInMeters(clickCoord.lat, clickCoord.lng, issue.latitude, issue.longitude);
      if (distance <= 500) {
        if (issue.status === 'resolved') {
          resolvedInRadius++;
        } else {
          activeInRadius++;
        }
      }
    });
  }

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

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

  if (!hasValidKey) {
    return (
      <div className="flex items-center justify-center h-[550px] font-sans bg-[#121212] border border-white/5 rounded-2xl p-6 text-center">
        <div className="max-w-[520px]">
          <h2 className="text-xl font-bold text-white mb-4">Google Maps API Key Required</h2>
          <p className="text-slate-400 mb-2"><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener" className="text-amber-500 hover:underline">Get an API Key</a></p>
          <p className="text-slate-400 mb-2"><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
          <ul className="text-left leading-relaxed text-slate-300 text-sm list-disc pl-5 mb-4 space-y-1">
            <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
            <li>Select <strong>Secrets</strong></li>
            <li>Type <code className="bg-white/10 px-1 rounded text-amber-400">GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name, press <strong>Enter</strong></li>
            <li>Paste your API key as the value, press <strong>Enter</strong></li>
          </ul>
          <p className="text-xs text-slate-500">The app rebuilds automatically after you add the secret.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-xl aspect-[1.6] md:aspect-auto md:h-[550px]">
      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-black/85 backdrop-blur-md border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-300 pointer-events-none">
        <div className="font-semibold text-white tracking-wide uppercase">Valencia-Dolores District</div>
        <div className="text-[10px] text-slate-500">Interactive Map View</div>
      </div>

      {/* Layer Control Toggle Overlay */}
      <div className="absolute top-4 right-4 z-10 bg-black/85 backdrop-blur-md border border-white/10 rounded-xl p-1 flex items-center gap-1 shadow-2xl">
        <button
          onClick={() => setActiveLayer('streets')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            activeLayer === 'streets'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title="Standard Street View"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pins</span>
        </button>
        <button
          onClick={() => setActiveLayer('heatmap')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            activeLayer === 'heatmap'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title="High-Contrast Hotspots Heatmap"
        >
          <Flame className={`w-3.5 h-3.5 ${activeLayer === 'heatmap' ? '' : 'text-orange-400'} group-hover:animate-pulse`} />
          <span className="hidden sm:inline">Heatmap</span>
        </button>
      </div>

      {/* Guide tooltip */}
      <div className="absolute bottom-4 right-4 z-10 bg-black/90 border border-white/5 rounded-lg p-2.5 max-w-[200px] text-[11px] text-slate-400 pointer-events-none">
        <p className="font-medium text-amber-500 mb-1">💡 Interactive Guide</p>
        <p>Click anywhere on the map to place a pin and report an issue at those exact coordinates.</p>
      </div>

      <APIProvider apiKey={API_KEY} version="weekly">
        <GoogleMap
          defaultCenter={{lat: 37.765, lng: -122.421}}
          defaultZoom={15}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{width: '100%', height: '100%'}}
          disableDefaultUI={true}
        >
          <MapClickHandler setClickCoord={setClickCoord} />
          
          <FacilitiesLayer />
          
          {activeLayer === 'heatmap' && <HeatmapLayer issues={issues} />}

          {/* User Location Marker */}
          {userLocation && (
            <AdvancedMarker position={userLocation} title="Your Location">
              <div className="relative w-4 h-4">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
              </div>
            </AdvancedMarker>
          )}

          {/* Issues Markers */}
          {activeLayer === 'streets' && issues.map((issue) => {
            const isSelected = selectedIssueId === issue.id;
            const pinColor = getCategoryColor(issue.category);
            
            return (
              <AdvancedMarker 
                key={issue.id}
                position={{lat: issue.latitude, lng: issue.longitude}}
                onClick={() => onSelectIssue(issue.id)}
                onMouseEnter={() => setHoveredIssue(issue)}
                onMouseLeave={() => setHoveredIssue(null)}
                zIndex={isSelected ? 10 : 1}
              >
                 <div className={`relative cursor-pointer transition-transform ${isSelected ? 'scale-125' : 'hover:scale-110'}`}>
                    {isSelected && (
                      <div className="absolute -inset-2 bg-amber-500/20 rounded-full animate-pulse" />
                    )}
                    <GooglePin 
                      background={isSelected ? '#ffffff' : pinColor} 
                      borderColor={isSelected ? pinColor : '#0f172a'} 
                      glyphColor={isSelected ? pinColor : '#ffffff'} 
                      scale={isSelected ? 1.2 : 1}
                    />
                 </div>
              </AdvancedMarker>
            );
          })}
        </GoogleMap>
      </APIProvider>

      {/* Hover Info Card Overlay */}
      {hoveredIssue && (
        <div
          className="absolute bg-black/95 border border-white/10 shadow-2xl rounded-xl p-3 max-w-[240px] pointer-events-none z-20 transition-all duration-150 top-4 left-1/2 -translate-x-1/2"
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

          <div className="bg-white/5 rounded-lg p-2.5 mb-4 text-left border border-white/10">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">500m Radius Summary</h5>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Active Reports</span>
              <span className="font-mono text-amber-500 font-bold">{activeInRadius}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Resolved Issues</span>
              <span className="font-mono text-emerald-500 font-bold">{resolvedInRadius}</span>
            </div>
          </div>

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
