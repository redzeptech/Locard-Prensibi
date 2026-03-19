'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

const MAP_CENTER: [number, number] = [41.0082, 28.9784];

export default function RansomwareMapInner() {
  const [lockProgress, setLockProgress] = useState(0);
  const GRID_SIZE = 8;
  const totalCells = GRID_SIZE * GRID_SIZE;

  useEffect(() => {
    const interval = setInterval(() => {
      setLockProgress((p) => Math.min(p + 1, totalCells));
    }, 800);
    return () => clearInterval(interval);
  }, [totalCells]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <div className="relative h-full w-full">
        <MapContainer center={MAP_CENTER} zoom={4} className="h-full w-full" style={{ background: '#0a0e17' }}>
          <TileLayer
            attribution="&copy; CARTO"
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        </MapContainer>
        <div
          className="absolute inset-0 pointer-events-none grid gap-1 p-4"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          }}
        >
          {Array.from({ length: totalCells }, (_, i) => (
            <div
              key={i}
              className={`flex items-center justify-center transition-all duration-500 ${
                i < lockProgress
                  ? 'bg-red-500/40 border border-red-500/60 rounded opacity-100'
                  : 'bg-transparent opacity-0'
              }`}
            >
              {i < lockProgress && (
                <span className="text-2xl drop-shadow-lg">🔒</span>
              )}
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-900/80 px-4 py-2 rounded border border-red-500/50">
          <p className="text-red-400 font-bold text-sm">RANSOMWARE LOCKING: %{Math.round((lockProgress / totalCells) * 100)}</p>
        </div>
      </div>
    </>
  );
}
