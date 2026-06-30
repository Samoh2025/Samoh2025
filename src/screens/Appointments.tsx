import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useStore, repById } from '../store';
import { theme } from '../theme';
import { Card, Badge, Avatar, EmptyState, formatDay, formatTime } from '../ui';

const kindTone: Record<string, any> = {
  Consultation: 'info',
  'Site Visit': 'accent',
  Walkthrough: 'warning',
  Closing: 'success',
};

export default function Appointments() {
  const { data, toggleAppointment } = useStore();
  const { appointments, team } = data;

  const sorted = [...appointments].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const upcoming = sorted.filter((a) => !a.done);
  const done = sorted.filter((a) => a.done);

  const Row = ({ a }: { a: (typeof appointments)[number] }) => {
    const rep = repById(team, a.repId);
    return (
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <View style={{ width: 56, borderRadius: 12, backgroundColor: theme.color.bg, paddingVertical: 8, alignItems: 'center' }}>
            <Text style={{ fontSize: theme.font.tiny, color: theme.color.muted, fontWeight: '700' }}>
              {new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.color.text }}>{new Date(a.date).getDate()}</Text>
            <Text style={{ fontSize: theme.font.tiny, color: theme.color.muted }}>{formatTime(a.date)}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 180 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text style={{ fontWeight: '800', color: theme.color.text, fontSize: theme.font.body }}>{a.client}</Text>
              <Badge label={a.kind} tone={kindTone[a.kind]} />
            </View>
            <Text style={{ color: theme.color.muted, fontSize: theme.font.small, marginTop: 3 }}>{a.title}</Text>
            <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny, marginTop: 2 }}>📍 {a.address}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <Avatar initials={rep?.initials ?? '—'} color={rep?.color ?? theme.color.muted} size={22} />
              <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny }}>{rep?.name ?? 'Unassigned'} · {formatDay(a.date)}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => toggleAppointment(a.id)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              borderWidth: 2,
              borderColor: a.done ? theme.color.success : theme.color.border,
              backgroundColor: a.done ? theme.color.success : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {a.done ? <Text style={{ color: '#fff', fontWeight: '800' }}>✓</Text> : null}
          </Pressable>
        </View>
      </Card>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View>
        <Text style={{ fontSize: theme.font.h2, fontWeight: '800', color: theme.color.text }}>Appointments</Text>
        <Text style={{ color: theme.color.muted, marginTop: 2 }}>Consultations, site visits & closings</Text>
      </View>

      <Text style={{ fontWeight: '800', color: theme.color.text, fontSize: theme.font.h3 }}>Upcoming ({upcoming.length})</Text>
      {upcoming.length === 0 ? (
        <Card><EmptyState icon="📅" text="No upcoming appointments." /></Card>
      ) : (
        <View style={{ gap: 12 }}>{upcoming.map((a) => <Row key={a.id} a={a} />)}</View>
      )}

      {done.length > 0 ? (
        <>
          <Text style={{ fontWeight: '800', color: theme.color.muted, fontSize: theme.font.h3, marginTop: 6 }}>Completed ({done.length})</Text>
          <View style={{ gap: 12, opacity: 0.7 }}>{done.map((a) => <Row key={a.id} a={a} />)}</View>
        </>
      ) : null}
    </ScrollView>
  );
}
