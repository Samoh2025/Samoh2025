import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { MapViewProps } from './MapView';

const CSS_HREF = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

function ensureLeafletCss() {
  const doc: any = (globalThis as any).document;
  if (!doc) return;
  if (doc.getElementById('leaflet-css')) return;
  const link = doc.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = CSS_HREF;
  doc.head.appendChild(link);
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

  // Create the map once.
  useEffect(() => {
    ensureLeafletCss();
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { scrollWheelZoom: true }).setView([center.lat, center.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 50);

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
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw markers when points change.
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
  }, [points, onSelect]);

  return <div ref={elRef} style={{ width: '100%', height, borderRadius: 14, overflow: 'hidden' }} />;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}
