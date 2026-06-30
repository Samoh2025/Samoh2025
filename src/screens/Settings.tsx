import React from 'react';
import { View, Text, ScrollView, Linking } from 'react-native';
import { useStore } from '../store';
import { CONFIG } from '../config';
import { theme } from '../theme';
import { Card, Avatar, Badge, Button, SectionTitle } from '../ui';

export default function Settings({ onSignOut }: { onSignOut: () => void }) {
  const { resetDemo } = useStore();

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View>
        <Text style={{ fontSize: theme.font.h2, fontWeight: '800', color: theme.color.text }}>Settings</Text>
        <Text style={{ color: theme.color.muted, marginTop: 2 }}>Your account and workspace</Text>
      </View>

      {/* Your link — the personalized part */}
      <Card style={{ borderColor: theme.color.accent, borderWidth: 1.5 }}>
        <SectionTitle>Your website link</SectionTitle>
        <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>
          This is {CONFIG.admin.name}'s own workspace. Bookmark this link — it's separate from any other admin's site.
        </Text>
        <View
          style={{
            marginTop: 12,
            backgroundColor: theme.color.bg,
            borderRadius: theme.radius.md,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <Text style={{ fontSize: 18 }}>🔗</Text>
          <Text style={{ flex: 1, minWidth: 200, fontWeight: '800', color: theme.color.primary, fontSize: theme.font.body }}>
            {CONFIG.site.url}
          </Text>
          <Button small variant="accent" icon="↗" title="Open" onPress={() => Linking.openURL(CONFIG.site.url)} />
        </View>
        <Badge label={`${CONFIG.admin.name}'s site`} tone="accent" />
      </Card>

      {/* Profile */}
      <Card>
        <SectionTitle>Admin profile</SectionTitle>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar initials={CONFIG.admin.initials} color={theme.color.primary} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '800', fontSize: theme.font.h3, color: theme.color.text }}>{CONFIG.admin.fullName}</Text>
            <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>{CONFIG.admin.role}</Text>
            <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny, marginTop: 2 }}>{CONFIG.admin.email}</Text>
          </View>
        </View>
      </Card>

      {/* Brand */}
      <Card>
        <SectionTitle>Company</SectionTitle>
        <Row label="Brand" value={CONFIG.brand} />
        <Row label="Team" value={CONFIG.teamName} />
        <Row label="Tagline" value={CONFIG.tagline} />
      </Card>

      {/* Data controls */}
      <Card>
        <SectionTitle>Workspace data</SectionTitle>
        <Text style={{ color: theme.color.muted, fontSize: theme.font.small, marginBottom: 12 }}>
          This standalone build stores your leads, team and projects on this device. Reset to restore the original sample data.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="outline" icon="↺" title="Reset sample data" onPress={resetDemo} />
          <Button variant="danger" icon="⎋" title="Sign out" onPress={onSignOut} />
        </View>
      </Card>

      <Text style={{ textAlign: 'center', color: theme.color.muted, fontSize: theme.font.tiny, marginTop: 8 }}>
        {CONFIG.brand} · {CONFIG.teamName} · {CONFIG.site.slug}
      </Text>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.color.border }}>
      <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>{label}</Text>
      <Text style={{ color: theme.color.text, fontWeight: '700', fontSize: theme.font.small }}>{value}</Text>
    </View>
  );
}
