import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Linking, TextInput } from 'react-native';
import { useAuth } from '../auth';
import { useStore } from '../store';
import { CONFIG } from '../config';
import { theme } from '../theme';
import { Card, Avatar, Badge, Button, Field, AppModal, SectionTitle } from '../ui';

export default function Settings({ onSignOut }: { onSignOut: () => void }) {
  const { user, isAdmin } = useAuth();
  const { data, importDnc } = useStore();
  const [dncOpen, setDncOpen] = useState(false);

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

      {/* Calling */}
      <Card>
        <SectionTitle>Calling</SectionTitle>
        <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>
          Tap 📞 on any lead or door to call. Once Twilio is connected (see SETUP.md), calls happen
          right inside the app; until then, the button hands off to your phone's dialer.
        </Text>
      </Card>

      {/* Do-Not-Call list (admin) */}
      {isAdmin ? (
        <Card>
          <SectionTitle right={<Badge label={`${data.dnc.length} on list`} tone="neutral" />}>Do-Not-Call list</SectionTitle>
          <Text style={{ color: theme.color.muted, fontSize: theme.font.small, marginBottom: 12 }}>
            Import numbers that must never be called. The app blocks calling any contact whose number is on this
            list (or that a rep marks Do Not Call). There's no public "every town" list — add numbers you obtain
            (e.g. from the National Registry by area code, or your own opt-outs).
          </Text>
          <Button variant="outline" icon="⇪" title="Import Do-Not-Call numbers" onPress={() => setDncOpen(true)} />
        </Card>
      ) : null}

      {/* Account */}
      <Card>
        <SectionTitle>Account</SectionTitle>
        <Text style={{ color: theme.color.muted, fontSize: theme.font.small, marginBottom: 12 }}>
          Your leads, team and projects are saved securely in the cloud and stay in sync on every device.
        </Text>
        <Button variant="danger" icon="⎋" title="Sign out" onPress={onSignOut} />
      </Card>

      <ImportDncModal visible={dncOpen} onClose={() => setDncOpen(false)} onImport={importDnc} />

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

function ImportDncModal({
  visible,
  onClose,
  onImport,
}: {
  visible: boolean;
  onClose: () => void;
  onImport: (phones: string[]) => Promise<number>;
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  const numbers = useMemo(
    () => text.split(/[\n,;]+/).map((s) => s.trim()).filter((s) => s.replace(/\D/g, '').length >= 7),
    [text],
  );

  const submit = async () => {
    if (busy || numbers.length === 0) return;
    setBusy(true);
    const n = await onImport(numbers);
    setBusy(false);
    setDone(n);
    setText('');
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Import Do-Not-Call numbers">
      <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>
        Paste phone numbers (one per line, or separated by commas). Any format works — we match on the digits.
      </Text>
      <TextInput
        value={text}
        onChangeText={(t) => { setText(t); setDone(null); }}
        placeholder={'(973) 555-0100\n201-555-0200\n9735550300'}
        placeholderTextColor="#A9A9A9"
        multiline
        style={{
          minHeight: 140,
          backgroundColor: '#F6F6F6',
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.radius.md,
          padding: 12,
          fontSize: theme.font.small,
          color: theme.color.text,
          textAlignVertical: 'top',
        }}
      />
      <Text style={{ color: theme.color.text, fontWeight: '700', fontSize: theme.font.small }}>
        {done != null ? `✓ Added ${done} number${done === 1 ? '' : 's'} to the list` : `${numbers.length} number${numbers.length === 1 ? '' : 's'} detected`}
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="Close" variant="outline" onPress={onClose} style={{ flex: 1 }} />
        <Button title={busy ? 'Importing…' : 'Import'} variant="primary" icon="⇪" onPress={submit} style={{ flex: 1 }} />
      </View>
    </AppModal>
  );
}
