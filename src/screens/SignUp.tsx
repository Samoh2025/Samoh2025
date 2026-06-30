import React, { useState } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { CONFIG } from '../config';
import { theme } from '../theme';
import { Card, Field, Button, Logo } from '../ui';
import { useAuth } from '../auth';

export default function SignUp({ onBack }: { onBack: () => void }) {
  const { width } = useWindowDimensions();
  const wide = width >= 860;
  const { signUp } = useAuth();

  const [name, setName] = useState<string>(CONFIG.admin.fullName);
  const [email, setEmail] = useState<string>(CONFIG.admin.email);
  const [company, setCompany] = useState<string>(CONFIG.brand);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    const res = signUp({ name, email, password, company });
    if (!res.ok) setError(res.error ?? 'Could not create the account.');
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
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: wide ? 36 : 26, lineHeight: wide ? 42 : 32 }}>
          Create your admin{'\n'}account
        </Text>
        <Text style={{ color: theme.color.mutedOnDark, fontSize: theme.font.body, maxWidth: 420 }}>
          Set up {CONFIG.admin.name}'s workspace. Everyone you add afterwards becomes a sales rep on your team.
        </Text>
        <Text style={{ color: theme.color.mutedOnDark, fontSize: theme.font.small, marginTop: 6 }}>{CONFIG.site.url}</Text>
      </View>

      {/* Form panel */}
      <View style={{ flex: wide ? 1 : undefined, padding: wide ? 56 : 24, justifyContent: 'center', alignItems: 'center' }}>
        <Card style={{ width: '100%', maxWidth: 420 }}>
          <Text style={{ fontSize: theme.font.h2, fontWeight: '800', color: theme.color.text }}>Create account</Text>
          <Text style={{ color: theme.color.muted, marginTop: 4, marginBottom: 16 }}>You'll be the team admin.</Text>
          <View style={{ gap: 12 }}>
            <Field label="Full name" value={name} onChangeText={setName} placeholder="Sam Horizon" />
            <Field label="Work email" value={email} onChangeText={setEmail} placeholder="sam@onehorizonhomes.com" keyboardType="email-address" />
            <Field label="Company" value={company} onChangeText={setCompany} placeholder="One Horizon Homes" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" /></View>
              <View style={{ flex: 1 }}><Field label="Confirm" value={confirm} onChangeText={setConfirm} placeholder="••••••••" /></View>
            </View>
            {error ? <Text style={{ color: theme.color.text, fontWeight: '700', fontSize: theme.font.small }}>⚠ {error}</Text> : null}
            <Button title="Create account" variant="primary" icon="→" onPress={submit} />
            <Button title="Back to sign in" variant="ghost" onPress={onBack} />
          </View>
        </Card>
      </View>
    </View>
  );
}
