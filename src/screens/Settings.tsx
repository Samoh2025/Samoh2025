import React from 'react';
import { View, Text, ScrollView, Linking } from 'react-native';
import { useAuth } from '../auth';
import { CONFIG } from '../config';
import { theme } from '../theme';
import { Card, Avatar, Badge, Button, SectionTitle } from '../ui';

export default function Settings({ onSignOut }: { onSignOut: () => void }) {
  const { user, isAdmin } = useAuth();

  const displayName = user?.name || CONFIG.admin.fullName;
  const displayEmail = user?.email || CONFIG.admin.email;
  const roleLabel = isAdmin ? CONFIG.admin.role : (user?.title || 'Sales Rep');

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View>
        <Text style={{ fontSize: theme.font.h2, fontWeight: '800', color: theme.color.text }}>Settings</Text>
        <Text style={{ color: theme.color.muted, marginTop: 2 }}>Your account and workspace</Text>
      </View>

      {/* The team link — share this with reps */}
      <Card style={{ borderColor: theme.color.accent, borderWidth: 1.5 }}>
        <SectionTitle>Your team's link</SectionTitle>
        <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>
          {isAdmin
            ? 'Share this link with your reps. Each rep creates their own account and signs in from their own phone — everyone shares the same live data.'
            : `This is ${CONFIG.admin.name}'s workspace. Bookmark this link and sign in from any device.`}
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
        <Badge label="Live · shared across all devices" tone="accent" />
      </Card>

      {/* Profile */}
      <Card>
        <SectionTitle>Your profile</SectionTitle>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar initials={user?.initials || CONFIG.admin.initials} color={theme.color.primary} size={56} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text style={{ fontWeight: '800', fontSize: theme.font.h3, color: theme.color.text }}>{displayName}</Text>
              <Badge label={isAdmin ? 'Admin' : 'Sales Rep'} tone="neutral" />
            </View>
            <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>{roleLabel}</Text>
            <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny, marginTop: 2 }}>{displayEmail}</Text>
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

      {/* Account */}
      <Card>
        <SectionTitle>Account</SectionTitle>
        <Text style={{ color: theme.color.muted, fontSize: theme.font.small, marginBottom: 12 }}>
          Your leads, team and projects are saved securely in the cloud and stay in sync on every device.
        </Text>
        <Button variant="danger" icon="⎋" title="Sign out" onPress={onSignOut} />
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
