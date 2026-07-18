import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
// Bundle Leaflet's stylesheet with the app instead of fetching it from a CDN at
// runtime. Loading the CSS from unpkg.com meant that whenever that request was
// slow, blocked, or offline the map lost all its layout rules and "glitched
// out" — tiles rendered as scrambled, misaligned boxes. Importing it here lets
// Metro inline the styles into the web bundle, so the map is always styled.
import 'leaflet/dist/leaflet.css';
import type { MapViewProps } from './MapView';

// A neutral, map-like background shown under the tiles. If a tile ever fails to
// load, the gap blends into this color instead of showing a broken-image icon.
const MAP_BG = '#E8EAED';
// 1×1 transparent pixel used in place of a failed tile so missing tiles fade
// into the map background rather than rendering the browser's broken-image glyph.
const BLANK_TILE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

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
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { scrollWheelZoom: true }).setView([center.lat, center.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
      errorTileUrl: BLANK_TILE,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    // Leaflet needs a second sizing pass once the container has its final
    // dimensions, otherwise the tile grid can render offset on first paint.
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

  return (
    <div
      ref={elRef}
      style={{ width: '100%', height, borderRadius: 14, overflow: 'hidden', background: MAP_BG }}
    />
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}
