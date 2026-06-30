import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useStore, repById } from '../store';
import { theme } from '../theme';
import { Card, Badge, Avatar, Button, StatCard, money, moneyShort, formatDate } from '../ui';
import { PROJECT_STATUSES, ProjectStatus } from '../types';

const statusTone: Record<ProjectStatus, any> = {
  Estimating: 'neutral',
  'Proposal Sent': 'info',
  'Contract Signed': 'accent',
  'In Progress': 'warning',
  Completed: 'success',
};

export default function Projects() {
  const { data, setProjectStatus } = useStore();
  const { projects, team } = data;
  const [filter, setFilter] = useState<'all' | ProjectStatus>('all');

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter);
  const active = projects.filter((p) => p.status !== 'Completed');
  const activeValue = active.reduce((s, p) => s + p.value, 0);
  const completedValue = projects.filter((p) => p.status === 'Completed').reduce((s, p) => s + p.value, 0);

  const advance = (status: ProjectStatus): ProjectStatus | null => {
    const i = PROJECT_STATUSES.indexOf(status);
    return i < PROJECT_STATUSES.length - 1 ? PROJECT_STATUSES[i + 1] : null;
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View>
        <Text style={{ fontSize: theme.font.h2, fontWeight: '800', color: theme.color.text }}>Projects</Text>
        <Text style={{ color: theme.color.muted, marginTop: 2 }}>Jobs from signed contract through completion</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        <StatCard icon="🏗️" label="Active projects" value={String(active.length)} tone="warning" />
        <StatCard icon="💵" label="Active value" value={moneyShort(activeValue)} tone="accent" />
        <StatCard icon="✅" label="Completed value" value={moneyShort(completedValue)} tone="success" />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
        {PROJECT_STATUSES.map((s) => (
          <Chip key={s} label={s} active={filter === s} onPress={() => setFilter(s)} />
        ))}
      </View>

      <View style={{ gap: 12 }}>
        {filtered.map((p) => {
          const rep = repById(team, p.repId);
          const next = advance(p.status);
          return (
            <Card key={p.id}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
                <View style={{ flex: 1, minWidth: 200 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text style={{ fontWeight: '800', fontSize: theme.font.body, color: theme.color.text }}>{p.client}</Text>
                    <Badge label={p.status} tone={statusTone[p.status]} />
                  </View>
                  <Text style={{ color: theme.color.muted, fontSize: theme.font.small, marginTop: 3 }}>
                    {p.type} · {p.address}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <Avatar initials={rep?.initials ?? '—'} color={rep?.color ?? theme.color.muted} size={26} />
                    <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny }}>
                      {rep?.name ?? 'Unassigned'} · started {formatDate(p.start)}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <Text style={{ fontWeight: '800', fontSize: theme.font.h3, color: theme.color.text }}>{money(p.value)}</Text>
                  {next ? (
                    <Button small variant="primary" icon="→" title={next} onPress={() => setProjectStatus(p.id, next)} />
                  ) : (
                    <Badge label="Done" tone="success" />
                  )}
                </View>
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Text
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.radius.pill,
        overflow: 'hidden',
        backgroundColor: active ? theme.color.primary : '#fff',
        borderWidth: 1,
        borderColor: active ? theme.color.primary : theme.color.border,
        color: active ? '#fff' : theme.color.muted,
        fontWeight: '700',
        fontSize: theme.font.small,
      }}
    >
      {label}
    </Text>
  );
}
