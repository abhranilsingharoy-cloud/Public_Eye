import React, { useEffect, useMemo } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Issue } from '../types';

interface HeatmapLayerProps {
  issues: Issue[];
}

export function HeatmapLayer({ issues }: HeatmapLayerProps) {
  const map = useMap();
  const visualization = useMapsLibrary('visualization') as any;
  
  const heatmapLayer = useMemo(() => {
    if (!visualization) return null;
    return new visualization.HeatmapLayer({
      radius: 30,
      opacity: 0.8,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
      ]
    });
  }, [visualization]);

  useEffect(() => {
    if (!heatmapLayer || !map) return;
    
    // Only show active (unresolved) issues in the heatmap
    const activeIssues = issues.filter(i => i.status !== 'resolved');
    const data = activeIssues.map(issue => new google.maps.LatLng(issue.latitude, issue.longitude));
    heatmapLayer.setData(data);
    heatmapLayer.setMap(map);

    return () => {
      heatmapLayer.setMap(null);
    };
  }, [heatmapLayer, map, issues]);

  return null;
}
