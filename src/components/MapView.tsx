'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/Badge';

interface MapLocation {
  id: string;
  name: string;
  type: 'Venue' | 'Academy' | 'Trainer' | 'Gym';
  latitude: number;
  longitude: number;
  city: string;
  status: string;
}

async function fetchLocations(): Promise<MapLocation[]> {
  const res = await fetch('/api/dashboard/locations');
  if (!res.ok) return [];
  const data = await res.json();
  return data.locations ?? [];
}

const TYPE_COLORS: Record<string, string> = {
  Venue: '#7c3aed',
  Academy: '#0284c7',
  Trainer: '#f59e0b',
  Gym: '#e11d48',
};

export default function MapView(): React.ReactElement {
  const { data: locations, isLoading } = useQuery({
    queryKey: ['map-locations'],
    queryFn: fetchLocations,
  });

  const [MapComponent, setMapComponent] = useState<React.ComponentType<{ locations: MapLocation[] }> | null>(null);

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    import('./LeafletMap').then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-gray-100 animate-pulse h-[400px] flex items-center justify-center">
        <span className="text-sm text-gray-400">Loading map...</span>
      </div>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 border border-gray-200 h-[400px] flex flex-col items-center justify-center gap-2">
        <span className="text-sm text-gray-500">No entities with location data</span>
        <span className="text-xs text-gray-400">Add latitude/longitude to your venues, academies, trainers, or gyms</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-500">{type}</span>
          </div>
        ))}
        <Badge variant="info" size="sm">{locations.length} locations</Badge>
      </div>
      <div className="rounded-xl overflow-hidden border border-gray-200 h-[400px]">
        {MapComponent ? <MapComponent locations={locations} /> : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <span className="text-sm text-gray-400">Loading map...</span>
          </div>
        )}
      </div>
    </div>
  );
}
