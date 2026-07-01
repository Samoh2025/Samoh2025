import React, { useState } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { CONFIG } from '../config';
import { theme } from '../theme';
import { Card, Field, Button, Logo } from '../ui';
import { useAuth } from '../auth';

export default function Login({ onSignUp }: { onSignUp: () => void }) {
  const { width } = useWindowDimensions();
  const wide = width >= 860;
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>(CONFIG.admin.email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    const res = signIn(email, password);
    if (!res.ok) setError(res.error ?? 'Could not sign in.');
    // On success the app switches to the dashboard automatically (auth state changes).
  };

  return (
    <View style={{ flex: 1, flexDirection: wide ? 'row' : 'column', backgroundColor: theme.color.bg }}>
      {/* Brand panel */}
      <View
        style={{
          flex: wide ? 1 : undefined,
          backgroundColor: theme.color.primary,
          padding: wide ? 56 : 32,
          paddingTop: 56,
          justifyContent: 'center',
          gap: 18,
        }}
      >
        <Logo dark />
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: wide ? 38 : 28, lineHeight: wide ? 44 : 34 }}>
          {CONFIG.teamName}{'\n'}Sales Command Center
        </Text>
        <Text style={{ color: theme.color.mutedOnDark, fontSize: theme.font.body, maxWidth: 420 }}>
          Track leads, manage your reps, knock doors, and move projects from estimate to close — all in one place. {CONFIG.tagline}.
        </Text>
        <Text style={{ color: theme.color.mutedOnDark, fontSize: theme.font.small, marginTop: 8 }}>
          {CONFIG.site.url}
        </Text>
      </View>

      {/* Sign-in panel */}
      <View style={{ flex: wide ? 1 : undefined, padding: wide ? 56 : 24, justifyContent: 'center', alignItems: 'center' }}>
        <Card style={{ width: '100%', maxWidth: 400 }}>
          <Text style={{ fontSize: theme.font.h2, fontWeight: '800', color: theme.color.text }}>Sign in</Text>
          <Text style={{ color: theme.color.muted, marginTop: 4, marginBottom: 18 }}>
            Welcome back to {CONFIG.brand}.
          </Text>
          <View style={{ gap: 14 }}>
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@onehorizonhomes.com" keyboardType="email-address" />
            <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" />
            {error ? <Text style={{ color: theme.color.text, fontWeight: '700', fontSize: theme.font.small }}>⚠ {error}</Text> : null}
            <Button title="Sign in" variant="primary" icon="→" onPress={submit} />
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>New here?</Text>
              <Text onPress={onSignUp} style={{ color: theme.color.text, fontWeight: '800', fontSize: theme.font.small }}>
                Create an account
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
}
