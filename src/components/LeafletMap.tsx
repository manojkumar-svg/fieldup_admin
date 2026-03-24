'use client';

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapLocation {
  id: string;
  name: string;
  type: 'Venue' | 'Academy' | 'Trainer' | 'Gym';
  latitude: number;
  longitude: number;
  city: string;
  status: string;
}

const TYPE_COLORS: Record<string, string> = {
  Venue: '#7c3aed',
  Academy: '#0284c7',
  Trainer: '#f59e0b',
  Gym: '#e11d48',
};

function createColorIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
    html: `<div style="width:24px;height:24px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,.3)"></div>`,
  });
}

export default function LeafletMap({ locations }: Readonly<{ locations: MapLocation[] }>): React.ReactElement {
  const center = useMemo(() => {
    if (locations.length === 0) return [20.5937, 78.9629] as [number, number]; // India center
    const avgLat = locations.reduce((sum, l) => sum + l.latitude, 0) / locations.length;
    const avgLng = locations.reduce((sum, l) => sum + l.longitude, 0) / locations.length;
    return [avgLat, avgLng] as [number, number];
  }, [locations]);

  const icons = useMemo(() => {
    const map: Record<string, L.DivIcon> = {};
    for (const [type, color] of Object.entries(TYPE_COLORS)) {
      map[type] = createColorIcon(color);
    }
    return map;
  }, []);

  return (
    <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc) => (
        <Marker key={`${loc.type}-${loc.id}`} position={[loc.latitude, loc.longitude]} icon={icons[loc.type]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{loc.name}</p>
              <p className="text-xs text-gray-500">{loc.type} &middot; {loc.city}</p>
              <p className="text-xs mt-0.5">
                <span className={loc.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-400'}>
                  {loc.status}
                </span>
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
