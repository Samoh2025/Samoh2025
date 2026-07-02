import React from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { CONFIG } from '../config';
import { theme } from '../theme';
import { Card, Logo } from '../ui';

/**
 * Shown when the app hasn't been connected to its Supabase backend yet
 * (the EXPO_PUBLIC_SUPABASE_* values are missing). It tells whoever set up the
 * deployment exactly what to do — see SETUP.md for the full walkthrough.
 */
export default function SetupNeeded() {
  const { width } = useWindowDimensions();
  const wide = width >= 820;

  const steps = [
    'Create a free project at supabase.com.',
    'Open the SQL Editor and run the script in supabase/schema.sql.',
    'Copy your Project URL and anon key (Project Settings → API).',
    'Add them as GitHub secrets EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, then re-deploy.',
    'Reload this page and create the first account — that becomes the admin.',
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <View style={{ backgroundColor: theme.color.primary, padding: wide ? 40 : 24, paddingTop: 56, gap: 12 }}>
        <Logo dark />
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: wide ? 30 : 24 }}>
          Almost live — one setup step left
        </Text>
        <Text style={{ color: theme.color.mutedOnDark, fontSize: theme.font.body, maxWidth: 560 }}>
          {CONFIG.teamName} needs to be connected to its database so every rep can sign in on
          their own phone and share the same live data.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: wide ? 40 : 20, gap: 16 }}>
        <Card>
          <Text style={{ fontSize: theme.font.h3, fontWeight: '800', color: theme.color.text, marginBottom: 12 }}>
            Connect the backend
          </Text>
          <View style={{ gap: 14 }}>
            {steps.map((s, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: theme.color.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: theme.font.small }}>{i + 1}</Text>
                </View>
                <Text style={{ flex: 1, color: theme.color.text, fontSize: theme.font.body, lineHeight: 22 }}>{s}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Text style={{ textAlign: 'center', color: theme.color.muted, fontSize: theme.font.tiny }}>
          Full instructions are in SETUP.md · {CONFIG.site.url}
        </Text>
      </ScrollView>
    </View>
  );
}
