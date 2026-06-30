import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useStore, repById } from '../store';
import { theme } from '../theme';
import { Card, SectionTitle, ChipSelect, Avatar, EmptyState } from '../ui';
import { KNOCK_STATUSES, KnockStatus } from '../types';
import { TERRITORY_CENTER } from '../data';
import MapView, { MapPoint } from '../MapView';

const LEGEND: { status: KnockStatus; label: string }[] = [
  { status: 'interested', label: 'Interested' },
  { status: 'callback', label: 'Call back' },
  { status: 'no_answer', label: 'No answer' },
  { status: 'not_interested', label: 'Not interested' },
  { status: 'not_knocked', label: 'Not knocked' },
];

function Dot({ status }: { status: KnockStatus }) {
  const styles: Record<KnockStatus, any> = {
    interested: { backgroundColor: '#0A0A0A', borderColor: '#0A0A0A' },
    callback: { backgroundColor: '#FFFFFF', borderColor: '#0A0A0A', borderWidth: 3 },
    no_answer: { backgroundColor: '#9A9A9A', borderColor: '#6B6B6B' },
    not_interested: { backgroundColor: '#FFFFFF', borderColor: '#B7B7B7' },
    not_knocked: { backgroundColor: '#FFFFFF', borderColor: '#0A0A0A', borderStyle: 'dashed' },
  };
  return <View style={[{ width: 14, height: 14, borderRadius: 7, borderWidth: 2 }, styles[status]]} />;
}

export default function DoorKnock() {
  const { data, setKnockStatus } = useStore();
  const { leads, team } = data;

  const doors = useMemo(() => leads.filter((l) => l.lat != null && l.lng != null), [leads]);
  const points: MapPoint[] = doors.map((l) => ({
    id: l.id,
    lat: l.lat as number,
    lng: l.lng as number,
    label: l.name,
    sub: `${l.address} · ${KNOCK_STATUSES.find((k) => k.key === (l.knockStatus ?? 'not_knocked'))?.label}`,
    status: l.knockStatus ?? 'not_knocked',
  }));

  const counts = KNOCK_STATUSES.map((k) => ({
    ...k,
    n: doors.filter((d) => (d.knockStatus ?? 'not_knocked') === k.key).length,
  }));

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View>
        <Text style={{ fontSize: theme.font.h2, fontWeight: '800', color: theme.color.text }}>Door-Knocking Map</Text>
        <Text style={{ color: theme.color.muted, marginTop: 2 }}>
          Live territory map for your reps — {doors.length} doors in the field
        </Text>
      </View>

      {/* Status summary */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {counts.map((c) => (
          <Card key={c.key} style={{ paddingVertical: 12, paddingHorizontal: 14, minWidth: 120, flexGrow: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Dot status={c.key} />
              <Text style={{ fontSize: 22, fontWeight: '800', color: theme.color.text }}>{c.n}</Text>
            </View>
            <Text style={{ color: theme.color.muted, fontSize: theme.font.small, marginTop: 4 }}>{c.label}</Text>
          </Card>
        ))}
      </View>

      {/* Map */}
      <Card style={{ padding: 8 }}>
        {points.length ? (
          <MapView points={points} center={TERRITORY_CENTER} height={460} />
        ) : (
          <EmptyState icon="🗺️" text="No mapped doors yet — import contacts or add leads with addresses." />
        )}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, padding: 12 }}>
          {LEGEND.map((l) => (
            <View key={l.status} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Dot status={l.status} />
              <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny }}>{l.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Route / door list with quick status update */}
      <SectionTitle>Doors on the route</SectionTitle>
      <View style={{ gap: 12 }}>
        {doors.map((l) => {
          const rep = repById(team, l.repId);
          return (
            <Card key={l.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <Dot status={l.knockStatus ?? 'not_knocked'} />
                <View style={{ flex: 1, minWidth: 160 }}>
                  <Text style={{ fontWeight: '800', color: theme.color.text }}>{l.name}</Text>
                  <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny }}>📍 {l.address}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Avatar initials={rep?.initials ?? '—'} color={rep?.color ?? theme.color.muted} size={22} />
                  <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny }}>{rep?.name ?? 'Unassigned'}</Text>
                </View>
              </View>
              <View style={{ marginTop: 10 }}>
                <ChipSelect
                  options={KNOCK_STATUSES.map((k) => k.key)}
                  value={l.knockStatus ?? 'not_knocked'}
                  onChange={(s) => setKnockStatus(l.id, s)}
                  renderLabel={(k) => KNOCK_STATUSES.find((x) => x.key === k)?.label ?? k}
                />
              </View>
            </Card>
          );
        })}
      </View>

      <Text style={{ textAlign: 'center', color: theme.color.muted, fontSize: theme.font.tiny, marginTop: 4 }}>
        Map data © OpenStreetMap. Real-time tracking of every rep's phone needs the backend step (see README).
      </Text>
    </ScrollView>
  );
}
