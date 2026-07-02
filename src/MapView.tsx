import React from 'react';
import { View, Text } from 'react-native';
import { theme } from './theme';

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  sub?: string;
  status?: string;
};

export type MapViewProps = {
  points: MapPoint[];
  center: { lat: number; lng: number };
  zoom?: number;
  height?: number;
  onSelect?: (id: string) => void;
  /** Fired when the rep taps an empty spot on the map (web only). */
  onMapClick?: (lat: number, lng: number) => void;
};

/**
 * Native fallback. The interactive Leaflet map lives in MapView.web.tsx and is
 * what the deployed website (sam-one-horizon-homes.expo.app) uses.
 */
export default function MapView({ points }: MapViewProps) {
  return (
    <View style={{ height: 300, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.color.bg }}>
      <Text style={{ color: theme.color.muted }}>Map view is available on the web app ({points.length} stops).</Text>
    </View>
  );
}
