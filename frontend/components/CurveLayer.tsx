'use client';

import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { CurvePathData } from '@elfalem/leaflet-curve/types/leaflet.curve';
import '@elfalem/leaflet-curve';

interface CurveLayerProps {
  /** SVG path: ['M', start, 'Q', control, end] for quadratic Bezier */
  positions: CurvePathData;
  options?: L.PathOptions;
  /** Click handler for the curve (e.g. to open Deep Dive) */
  onClick?: () => void;
}

/**
 * Leaflet Curve layer using @elfalem/leaflet-curve (SVG path commands).
 * Supports: M, L, C, Q, S, T, H, V, Z
 */
export function CurveLayer({ positions, options = {}, onClick }: CurveLayerProps) {
  const map = useMap();
  const layerRef = useRef<ReturnType<typeof L.curve> | null>(null);

  useEffect(() => {
    if (!map || !positions?.length) return;
    const pathOptions = {
      color: '#ef4444',
      weight: 4,
      opacity: 0.7,
      ...options,
      ...(onClick ? { className: 'leaflet-curve-clickable' } : {}),
    };
    const curve = L.curve(positions, pathOptions);
    if (onClick) {
      curve.on('click', () => onClick());
    }
    curve.addTo(map);
    layerRef.current = curve;
    return () => {
      curve.remove();
      layerRef.current = null;
    };
  }, [map, JSON.stringify(positions), JSON.stringify(options), onClick]);

  return null;
}
