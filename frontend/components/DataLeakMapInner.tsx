'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { CurveLayer } from './CurveLayer';

const PARDUS_ORIGIN: [number, number] = [39.9334, 32.8597]; // Ankara - Pardus
const LEAK_DESTINATIONS: [number, number][] = [
  [55.7558, 37.6173], [40.7128, -74.006], [-23.5505, -46.6333], [35.6762, 139.6503],
  [51.5074, -0.1278], [48.8566, 2.3522], [52.52, 13.405], [37.7749, -122.4194],
];

function curvePath(start: [number, number], end: [number, number]): ['M', [number, number], 'Q', [number, number], [number, number]] {
  const midLat = (start[0] + end[0]) / 2;
  const midLon = (start[1] + end[1]) / 2;
  const ctrl: [number, number] = [midLat + 2, midLon - 1];
  return ['M', start, 'Q', ctrl, end];
}

interface LeakTrace {
  id: number;
  target: [number, number];
  timestamp: string;
}

export default function DataLeakMapInner({ onTraceClick }: { onTraceClick?: (trace: LeakTrace & { location: [number, number]; os: string; ip: string }) => void }) {
  const [traces, setTraces] = useState<LeakTrace[]>([]);
  const traceIdRef = React.useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      traceIdRef.current += 1;
      const target = LEAK_DESTINATIONS[Math.floor(Math.random() * LEAK_DESTINATIONS.length)];
      setTraces((prev) => [...prev.slice(-15), {
        id: traceIdRef.current,
        target,
        timestamp: new Date().toISOString(),
      }]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const pardusIcon = L.divIcon({
    html: '<div class="pardus-origin">🇹🇷 Pardus</div>',
    className: 'pardus-div-icon',
    iconSize: [60, 28],
    iconAnchor: [30, 14],
  });

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <MapContainer center={PARDUS_ORIGIN} zoom={4} className="h-full w-full" style={{ background: '#0a0e17' }}>
        <TileLayer
          attribution="&copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={PARDUS_ORIGIN} icon={pardusIcon} />
        {traces.map((trace) => {
          const path = curvePath(PARDUS_ORIGIN, trace.target);
          const fakeTrace = {
            ...trace,
            location: PARDUS_ORIGIN,
            os: 'Linux (Pardus)',
            ip: '10.0.0.1',
          };
          return (
            <React.Fragment key={trace.id}>
              <CurveLayer
                positions={path}
                options={{ color: '#22d3ee', weight: 2, opacity: 0.8 }}
                onClick={() => onTraceClick?.(fakeTrace)}
              />
              <Marker position={trace.target} icon={L.divIcon({
                html: '<div class="leak-dest">📤</div>',
                className: 'leak-dest-icon',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })} />
            </React.Fragment>
          );
        })}
      </MapContainer>
      <style jsx global>{`
        .pardus-div-icon, .leak-dest-icon { background: none !important; border: none !important; }
        .pardus-origin { font-size: 11px; font-weight: 700; color: #22d3ee; background: rgba(34,211,238,0.2); padding: 4px 8px; border-radius: 4px; border: 1px solid #22d3ee; }
        .leak-dest { font-size: 16px; cursor: pointer; }
      `}</style>
    </>
  );
}
