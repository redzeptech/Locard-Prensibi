'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { CurveLayer } from './CurveLayer';

const BANK_SERVER: [number, number] = [41.0082, 28.9784];

export type ThreatLevel = 'Critical' | 'High' | 'Medium';

export interface RecoveredEvidence {
  file: string;
  recovery_rate: string;
  note?: string;
}

interface AttackTrace {
  id: number;
  os: string;
  ip: string;
  location: [number, number];
  target?: [number, number];
  trace_type: string;
  timestamp: string;
  attack?: boolean;
  threat_level?: ThreatLevel;
  attack_vector?: string;
  attack_tool?: string;
  recovered_evidence?: RecoveredEvidence[];
}

/** Quadratic Bezier SVG path: M start, Q control, end */
function curvePath(
  start: [number, number],
  end: [number, number]
): ['M', [number, number], 'Q', [number, number], [number, number]] {
  const midLat = (start[0] + end[0]) / 2;
  const midLon = (start[1] + end[1]) / 2;
  const ctrl: [number, number] = [midLat + 3, midLon - 2];
  return ['M', start, 'Q', ctrl, end];
}

const THREAT_COLORS: Record<ThreatLevel, string> = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#ca8a04',
};

function createAttackIcon(threatLevel?: ThreatLevel) {
  const level = threatLevel || 'Medium';
  const color = THREAT_COLORS[level];
  return L.divIcon({
    html: `<div class="attack-marker" style="--threat-color:${color}">
      <span>⚔</span>
      <span class="threat-badge">${level}</span>
    </div>`,
    className: 'attack-div-icon',
    iconSize: [56, 36],
    iconAnchor: [28, 12],
  });
}

function createBankTargetIcon(showShield: boolean) {
  return L.divIcon({
    html: `<div class="bank-target">
      ${showShield ? '<div class="hacking-shield"><span>!!! ALERT: SYSTEM BREACH !!!</span></div>' : ''}
      <div class="bank-target-inner">🎯<div class="bank-target-ring"></div></div>
    </div>`,
    className: 'bank-target-div-icon',
    iconSize: [80, 80],
    iconAnchor: [40, 40],
  });
}

export default function BankHeistMapInner({
  traces,
  onTraceClick,
}: {
  traces: AttackTrace[];
  onTraceClick?: (trace: AttackTrace) => void;
}) {
  const handleCurveOrMarkerClick = (trace: AttackTrace) => () => onTraceClick?.(trace);
  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <MapContainer center={BANK_SERVER} zoom={4} className="h-full w-full" style={{ background: '#0a0e17' }}>
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={BANK_SERVER} icon={createBankTargetIcon(traces.length > 0)} />
        {traces.map((trace) => {
          const target = (trace.target as [number, number]) || BANK_SERVER;
          const path = curvePath(trace.location, target);
          return (
            <React.Fragment key={`${trace.id}-${trace.timestamp}`}>
              <CurveLayer
                positions={path}
                options={{ color: '#ef4444', weight: 2, opacity: 0.7 }}
                onClick={handleCurveOrMarkerClick(trace)}
              />
              <Marker
                position={trace.location}
                icon={createAttackIcon(trace.threat_level)}
                eventHandlers={{ click: handleCurveOrMarkerClick(trace) }}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
      <style jsx global>{`
        .leaflet-curve-clickable { cursor: pointer !important; }
        .attack-div-icon, .bank-target-div-icon { background: none !important; border: none !important; }
        .attack-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          cursor: pointer;
        }
        .attack-marker > span:first-child {
          width: 24px; height: 24px;
          background: var(--threat-color, #ef4444);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px;
          border: 2px solid rgba(255,255,255,0.6);
        }
        .attack-marker:hover > span:first-child { transform: scale(1.2); }
        .threat-badge {
          font-size: 8px;
          font-weight: 700;
          color: var(--threat-color);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .bank-target { position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
        .bank-target-inner { position: relative; font-size: 28px; filter: drop-shadow(0 0 8px #ef4444); }
        .bank-target-ring { position: absolute; inset: -6px; width: 40px; height: 40px; margin: auto; border: 3px solid #ef4444; border-radius: 50%; animation: bank-pulse 1.5s ease-out infinite; }
        .hacking-shield {
          position: absolute;
          inset: -20px;
          border: 3px solid #ef4444;
          border-radius: 50%;
          animation: shield-pulse 1.2s ease-in-out infinite;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .hacking-shield::before {
          content: '';
          position: absolute;
          inset: -8px;
          border: 2px solid rgba(239,68,68,0.5);
          border-radius: 50%;
          animation: shield-pulse 1.2s ease-in-out infinite 0.3s;
        }
        .hacking-shield span {
          position: absolute;
          top: -14px;
          font-size: 10px;
          font-weight: 900;
          color: #ef4444;
          text-shadow: 0 0 10px #ef4444;
          letter-spacing: 2px;
          white-space: nowrap;
          animation: alert-blink 0.8s ease-in-out infinite;
        }
        @keyframes alert-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes bank-pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2); opacity: 0; } }
        @keyframes shield-pulse { 0%, 100% { transform: scale(1); opacity: 0.9; box-shadow: 0 0 20px rgba(239,68,68,0.6); } 50% { transform: scale(1.15); opacity: 0.6; box-shadow: 0 0 40px rgba(239,68,68,0.8); } }
      `}</style>
    </>
  );
}
