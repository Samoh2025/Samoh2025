import React, { useState } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { CONFIG } from '../config';
import { theme } from '../theme';
import { Card, Field, Button } from '../ui';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const { width } = useWindowDimensions();
  const wide = width >= 860;
  const [email, setEmail] = useState<string>(CONFIG.admin.email);
  const [password, setPassword] = useState('');

  return (
    <View style={{ flex: 1, flexDirection: wide ? 'row' : 'column', backgroundColor: theme.color.bg }}>
      {/* Brand panel */}
      <View
        style={{
          flex: wide ? 1 : undefined,
          backgroundColor: theme.color.primary,
          padding: wide ? 56 : 32,
          paddingTop: wide ? 56 : 56,
          justifyContent: 'center',
          gap: 18,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: theme.color.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 24 }}>🏠</Text>
          </View>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: theme.font.h3 }}>{CONFIG.brand}</Text>
        </View>
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: wide ? 38 : 28, lineHeight: wide ? 44 : 34 }}>
          {CONFIG.teamName}{'\n'}Sales Command Center
        </Text>
        <Text style={{ color: theme.color.mutedOnDark, fontSize: theme.font.body, maxWidth: 420 }}>
          Track leads, manage your reps, move projects from estimate to close — all in one place. {CONFIG.tagline}.
        </Text>
        <Text style={{ color: theme.color.accentSoft, fontSize: theme.font.small, marginTop: 8 }}>
          {CONFIG.site.url}
        </Text>
      </View>

      {/* Sign-in panel */}
      <View style={{ flex: wide ? 1 : undefined, padding: wide ? 56 : 24, justifyContent: 'center', alignItems: 'center' }}>
        <Card style={{ width: '100%', maxWidth: 400 }}>
          <Text style={{ fontSize: theme.font.h2, fontWeight: '800', color: theme.color.text }}>Sign in</Text>
          <Text style={{ color: theme.color.muted, marginTop: 4, marginBottom: 18 }}>
            Welcome back, {CONFIG.admin.name}.
          </Text>
          <View style={{ gap: 14 }}>
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@onehorizonhomes.com" keyboardType="email-address" />
            <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" />
            <Button title="Sign in" variant="primary" icon="→" onPress={onLogin} />
            <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny, textAlign: 'center' }}>
              Demo workspace — any password works.
            </Text>
          </View>
        </Card>
      </View>
    </View>
  );
}
