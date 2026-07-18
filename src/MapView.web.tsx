import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { MapViewProps } from './MapView';

const CSS_HREF = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

/**
 * Load Leaflet's stylesheet and report when it is actually ready.
 *
 * The map MUST NOT be created before this CSS is in place: Leaflet positions
 * its tiles with rules from leaflet.css, so initialising early makes the tiles
 * stack and scatter (the "glitching tiles" bug). We gate map creation on this
 * flag, and fail open (ready = true) if the CDN is slow or blocked so the map
 * still renders.
 */
function useLeafletCss() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const doc: any = (globalThis as any).document;
    if (!doc) return;

    const markReady = () => setReady(true);

    const existing = doc.getElementById('leaflet-css');
    if (existing) {
      // Already loaded in a previous mount → its stylesheet is attached.
      if (existing.sheet) {
        markReady();
      } else {
        existing.addEventListener('load', markReady);
        existing.addEventListener('error', markReady);
      }
      return;
    }

    const link = doc.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = CSS_HREF;
    link.addEventListener('load', markReady);
    link.addEventListener('error', markReady); // fail open — try to render anyway
    doc.head.appendChild(link);

    // Safety net in case neither event fires (cached/odd browsers).
    const timer = setTimeout(markReady, 3000);
    return () => clearTimeout(timer);
  }, []);

  return ready;
}

// Black & white marker styling by door-knock status.
function styleFor(status?: string) {
  switch (status) {
    case 'interested':
      return { color: '#0A0A0A', fillColor: '#0A0A0A', fillOpacity: 1, radius: 9, weight: 2 };
    case 'callback':
      return { color: '#0A0A0A', fillColor: '#FFFFFF', fillOpacity: 1, radius: 8, weight: 3 };
    case 'no_answer':
      return { color: '#6B6B6B', fillColor: '#9A9A9A', fillOpacity: 0.85, radius: 7, weight: 2 };
    case 'not_interested':
      return { color: '#B7B7B7', fillColor: '#FFFFFF', fillOpacity: 1, radius: 6, weight: 2 };
    default: // not_knocked
      return { color: '#0A0A0A', fillColor: '#FFFFFF', fillOpacity: 1, radius: 7, weight: 2, dashArray: '3' };
  }
}

export default function MapView({ points, center, height = 460, onSelect }: MapViewProps) {
  const elRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const cssReady = useLeafletCss();

  // Create the map once — but only after the Leaflet CSS is ready.
  useEffect(() => {
    if (!cssReady) return;
    if (!elRef.current || mapRef.current) return;

    const map = L.map(elRef.current, { scrollWheelZoom: true }).setView([center.lat, center.lng], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
      // Redraw eagerly while panning/zooming so tiles don't lag behind.
      updateWhenIdle: false,
      keepBuffer: 4,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    map.invalidateSize();
    setMapReady(true);

    // Keep the tile grid aligned whenever the container is resized (the map
    // sits inside a scroll view / flexible card, so its width can change).
    const RO = (globalThis as any).ResizeObserver;
    let ro: any;
    if (RO && elRef.current) {
      ro = new RO(() => map.invalidateSize());
      ro.observe(elRef.current);
    }
    // One more pass after layout settles for the initial mount.
    const settle = setTimeout(() => map.invalidateSize(), 200);

    // "My location" for the rep currently knocking.
    const nav: any = (globalThis as any).navigator;
    if (nav?.geolocation) {
      nav.geolocation.getCurrentPosition(
        (pos: any) => {
          const { latitude, longitude } = pos.coords;
          L.circleMarker([latitude, longitude], {
            color: '#FFFFFF',
            fillColor: '#0A0A0A',
            fillOpacity: 1,
            radius: 8,
            weight: 3,
          })
            .bindPopup('You are here')
            .addTo(map);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 },
      );
    }

    return () => {
      clearTimeout(settle);
      if (ro) ro.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cssReady]);

  // Redraw markers when points change (and once the map is ready).
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    points.forEach((p) => {
      if (p.lat == null || p.lng == null) return;
      const m = L.circleMarker([p.lat, p.lng], styleFor(p.status));
      m.bindPopup(
        `<strong>${escapeHtml(p.label)}</strong>${p.sub ? `<br/>${escapeHtml(p.sub)}` : ''}`,
      );
      if (onSelect) m.on('click', () => onSelect(p.id));
      m.addTo(layer);
    });
  }, [points, onSelect, mapReady]);

  return <div ref={elRef} style={{ width: '100%', height, borderRadius: 14, overflow: 'hidden' }} />;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}
