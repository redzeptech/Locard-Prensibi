'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

interface TraceData {
  id: number;
  os: string;
  ip: string;
  location: [number, number];
  trace_type: string;
  timestamp: string;
}

function createPulseIcon(icon: string, isNew: boolean) {
  return L.divIcon({
    html: `
      <div class="forensic-marker ${isNew ? 'forensic-pulse' : ''}">
        <div class="forensic-marker-ring"></div>
        <div class="forensic-marker-dot"><span class="forensic-marker-emoji">${icon}</span></div>
      </div>
    `,
    className: 'forensic-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export default function ForensicMapInner({
  traces,
  getOSIcon,
  onMarkerClick,
}: {
  traces: TraceData[];
  getOSIcon: (os: string) => string;
  onMarkerClick?: (trace: TraceData) => void;
}) {
  const displayTraces = traces.length > 0 ? traces : [
    { id: 1, os: 'Windows 11', ip: '192.168.1.1', location: [41.0082, 28.9784] as [number, number], trace_type: 'Demo', timestamp: new Date().toISOString() },
  ];
  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <MapContainer center={[41.0082, 28.9784]} zoom={3} className="h-full w-full" style={{ background: '#0a0e17' }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {displayTraces.map((trace, index) => (
          <Marker
            key={`${trace.id}-${trace.timestamp}`}
            position={trace.location}
            icon={createPulseIcon(getOSIcon(trace.os), index === 0)}
            eventHandlers={{
              click: () => onMarkerClick?.(trace),
            }}
          />
        ))}
      </MapContainer>
      <style jsx global>{`
        .forensic-div-icon { background: none !important; border: none !important; }
        .forensic-marker { position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
        .forensic-marker-ring { position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(239,68,68,0.4); border: 2px solid #ef4444; }
        .forensic-marker.forensic-pulse .forensic-marker-ring { animation: forensic-pulse 1.5s ease-out infinite; }
        .forensic-marker-dot { position: relative; z-index: 2; width: 20px; height: 20px; border-radius: 50%; background: #ef4444; display: flex; align-items: center; justify-content: center; }
        .forensic-marker-emoji { font-size: 12px; }
        @keyframes forensic-pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }
      `}</style>
    </>
  );
}
