import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { MapViewProps } from './MapView';
import { LEAFLET_CSS } from './leafletStyles';

/**
 * Inject Leaflet's stylesheet synchronously from the bundled copy.
 *
 * The map MUST have this CSS in place before it is created: Leaflet positions
 * every tile with these rules, so a missing or late stylesheet makes the tiles
 * stack and scatter (the "glitching tiles" bug). Using a bundled <style> tag
 * instead of a CDN <link> means the rules are applied immediately and can
 * never fail to load.
 */
function ensureLeafletCss() {
  const doc: any = (globalThis as any).document;
  if (!doc || doc.getElementById('leaflet-css')) return;
  const style = doc.createElement('style');
  style.id = 'leaflet-css';
  style.textContent = LEAFLET_CSS;
  doc.head.appendChild(style);
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

export default function MapView({ points, center, zoom = 12, height = 460, onSelect, onMapClick }: MapViewProps) {
  const elRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  // Keep the latest callbacks in refs so the once-created map uses fresh values.
  const clickRef = useRef(onMapClick);
  clickRef.current = onMapClick;
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  // Create the map once, with the stylesheet already applied.
  useEffect(() => {
    ensureLeafletCss();
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { scrollWheelZoom: true }).setView([center.lat, center.lng], zoom);
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
    // sits inside a scroll view / flexible card, so its width can change, and
    // it can even mount at width 0 before layout settles).
    const RO = (globalThis as any).ResizeObserver;
    let ro: any;
    if (RO && elRef.current) {
      ro = new RO(() => map.invalidateSize());
      ro.observe(elRef.current);
    }
    // One more pass after the initial layout settles.
    const settle = setTimeout(() => map.invalidateSize(), 200);

    // Tap an empty spot to drop a new door.
    map.on('click', (e: any) => {
      clickRef.current?.(e.latlng.lat, e.latlng.lng);
    });

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
  }, []);

  // Redraw markers when points change (and once the map is ready).
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    points.forEach((p) => {
      if (p.lat == null || p.lng == null) return;
      const m = L.circleMarker([p.lat, p.lng], styleFor(p.status));
      m.bindTooltip(
        `<strong>${escapeHtml(p.label)}</strong>${p.sub ? `<br/>${escapeHtml(p.sub)}` : ''}`,
      );
      // Clicking a dot opens its details (and must not also drop a new door).
      m.on('click', (e: any) => {
        L.DomEvent.stopPropagation(e);
        selectRef.current?.(p.id);
      });
      m.addTo(layer);
    });
  }, [points, mapReady]);

  return <div ref={elRef} style={{ width: '100%', height, borderRadius: 14, overflow: 'hidden' }} />;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}
