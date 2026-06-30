import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useStore, repById } from '../store';
import { CONFIG } from '../config';
import { theme } from '../theme';
import {
  Card,
  StatCard,
  SectionTitle,
  Avatar,
  Badge,
  ProgressBar,
  money,
  moneyShort,
  relativeTime,
} from '../ui';
import { LEAD_STAGES } from '../types';
import type { RouteKey } from '../nav';

export default function Dashboard({ go }: { go: (r: RouteKey) => void }) {
  const { data } = useStore();
  const { leads, team, appointments, activity } = data;

  const open = leads.filter((l) => l.stage !== 'won' && l.stage !== 'lost');
  const won = leads.filter((l) => l.stage === 'won');
  const pipelineValue = open.reduce((s, l) => s + l.value, 0);
  const wonValue = won.reduce((s, l) => s + l.value, 0);
  const upcoming = appointments.filter((a) => !a.done);

  const stageCounts = LEAD_STAGES.map((s) => ({
    ...s,
    count: leads.filter((l) => l.stage === s.key).length,
  }));
  const maxStage = Math.max(1, ...stageCounts.map((s) => s.count));

  // Per-rep leaderboard by won value
  const leaderboard = team
    .map((r) => {
      const repWon = won.filter((l) => l.repId === r.id);
      return {
        rep: r,
        wonValue: repWon.reduce((s, l) => s + l.value, 0),
        wins: repWon.length,
        openCount: open.filter((l) => l.repId === r.id).length,
      };
    })
    .sort((a, b) => b.wonValue - a.wonValue);
  const topValue = Math.max(1, ...leaderboard.map((x) => x.wonValue));

  const stageTone: Record<string, any> = {
    new: 'info',
    contacted: 'accent',
    appointment: 'warning',
    quoted: 'accent',
    won: 'success',
    lost: 'danger',
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
      {/* Greeting */}
      <View>
        <Text style={{ fontSize: theme.font.h1, fontWeight: '800', color: theme.color.text }}>
          Good to see you, {CONFIG.admin.name} 👋
        </Text>
        <Text style={{ color: theme.color.muted, marginTop: 4, fontSize: theme.font.body }}>
          Here's how {CONFIG.teamName} is performing today.
        </Text>
      </View>

      {/* KPI row */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        <StatCard icon="🧲" label="Open leads" value={String(open.length)} sub={`${leads.length} total`} tone="info" />
        <StatCard icon="💰" label="Pipeline value" value={moneyShort(pipelineValue)} sub="potential revenue" tone="accent" />
        <StatCard icon="🏆" label="Deals won" value={String(won.length)} sub={money(wonValue)} tone="success" />
        <StatCard icon="📅" label="Upcoming visits" value={String(upcoming.length)} sub="this week" tone="warning" />
      </View>

      {/* Pipeline + Leaderboard */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18 }}>
        {/* Pipeline funnel */}
        <Card style={{ flex: 1, minWidth: 300 }}>
          <SectionTitle right={<Text onPress={() => go('leads')} style={link}>View all →</Text>}>Pipeline</SectionTitle>
          <View style={{ gap: 12 }}>
            {stageCounts.map((s) => (
              <View key={s.key} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: theme.font.small, fontWeight: '700', color: theme.color.text }}>{s.label}</Text>
                  <Text style={{ fontSize: theme.font.small, color: theme.color.muted }}>{s.count}</Text>
                </View>
                <ProgressBar
                  value={s.count}
                  total={maxStage}
                  color={
                    s.key === 'won'
                      ? theme.color.success
                      : s.key === 'lost'
                      ? theme.color.danger
                      : theme.color.primary
                  }
                />
              </View>
            ))}
          </View>
        </Card>

        {/* Leaderboard */}
        <Card style={{ flex: 1, minWidth: 300 }}>
          <SectionTitle right={<Text onPress={() => go('team')} style={link}>Team →</Text>}>Top performers</SectionTitle>
          <View style={{ gap: 14 }}>
            {leaderboard.map((row, i) => (
              <View key={row.rep.id} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ width: 16, fontWeight: '800', color: theme.color.muted }}>{i + 1}</Text>
                  <Avatar initials={row.rep.initials} color={row.rep.color} size={34} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: theme.color.text }}>{row.rep.name}</Text>
                    <Text style={{ fontSize: theme.font.tiny, color: theme.color.muted }}>
                      {row.wins} won · {row.openCount} open
                    </Text>
                  </View>
                  <Text style={{ fontWeight: '800', color: theme.color.text }}>{moneyShort(row.wonValue)}</Text>
                </View>
                <ProgressBar value={row.wonValue} total={topValue} color={row.rep.color} />
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Upcoming + Activity */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18 }}>
        <Card style={{ flex: 1, minWidth: 300 }}>
          <SectionTitle right={<Text onPress={() => go('appointments')} style={link}>Calendar →</Text>}>Next appointments</SectionTitle>
          <View style={{ gap: 12 }}>
            {upcoming.slice(0, 4).map((a) => {
              const rep = repById(team, a.repId);
              return (
                <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 44,
                      borderRadius: 10,
                      backgroundColor: theme.color.infoSoft,
                      paddingVertical: 6,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: theme.font.tiny, color: theme.color.info, fontWeight: '700' }}>
                      {new Date(a.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: theme.color.info }}>
                      {new Date(a.date).getDate()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: theme.color.text }}>{a.client}</Text>
                    <Text style={{ fontSize: theme.font.tiny, color: theme.color.muted }}>
                      {a.kind} · {rep?.name ?? 'Unassigned'}
                    </Text>
                  </View>
                  <Badge label={a.kind} tone="info" />
                </View>
              );
            })}
            {upcoming.length === 0 ? (
              <Text style={{ color: theme.color.muted }}>No upcoming appointments.</Text>
            ) : null}
          </View>
        </Card>

        <Card style={{ flex: 1, minWidth: 300 }}>
          <SectionTitle>Recent activity</SectionTitle>
          <View style={{ gap: 12 }}>
            {activity.slice(0, 6).map((ac) => (
              <View key={ac.id} style={{ flexDirection: 'row', gap: 10 }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    marginTop: 6,
                    backgroundColor:
                      ac.kind === 'win'
                        ? theme.color.success
                        : ac.kind === 'lead'
                        ? theme.color.info
                        : theme.color.accent,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.color.text, fontSize: theme.font.small }}>{ac.text}</Text>
                  <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny, marginTop: 2 }}>
                    {relativeTime(ac.at)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const link = { color: theme.color.primary, fontWeight: '700', fontSize: theme.font.small } as const;
