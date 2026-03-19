'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

const PHISHING_ORIGINS: [number, number][] = [
  [39.9042, 116.4074], [55.7558, 37.6173], [40.7128, -74.006], [-23.5505, -46.6333],
  [35.6762, 139.6503], [51.5074, -0.1278], [48.8566, 2.3522], [52.52, 13.405],
  [37.7749, -122.4194], [19.4326, -99.1332], [-33.8688, 151.2093], [41.0082, 28.9784],
];

const MAP_CENTER: [number, number] = [30, 20];

interface PhishingMarker {
  id: number;
  location: [number, number];
  timestamp: string;
}

export default function PhishingMapInner({ onMarkerClick }: { onMarkerClick?: (m: PhishingMarker) => void }) {
  const [markers, setMarkers] = useState<PhishingMarker[]>([]);
  const idRef = React.useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      idRef.current += 1;
      const loc = PHISHING_ORIGINS[Math.floor(Math.random() * PHISHING_ORIGINS.length)];
      setMarkers((prev) => [...prev.slice(-40), {
        id: idRef.current,
        location: [loc[0] + (Math.random() - 0.5) * 4, loc[1] + (Math.random() - 0.5) * 4],
        timestamp: new Date().toISOString(),
      }]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const emailIcon = L.divIcon({
    html: '<div class="phishing-email">📧</div>',
    className: 'phishing-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <MapContainer center={MAP_CENTER} zoom={2} className="h-full w-full" style={{ background: '#0a0e17' }}>
        <TileLayer
          attribution="&copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={m.location}
            icon={emailIcon}
            eventHandlers={{ click: () => onMarkerClick?.(m) }}
          />
        ))}
      </MapContainer>
      <style jsx global>{`
        .phishing-div-icon { background: none !important; border: none !important; }
        .phishing-email { font-size: 24px; cursor: pointer; filter: drop-shadow(0 0 4px #f59e0b); }
        .phishing-email:hover { transform: scale(1.2); }
      `}</style>
    </>
  );
}
