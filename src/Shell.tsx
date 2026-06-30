import React from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { CONFIG } from './config';
import { theme } from './theme';
import { ROUTES, RouteKey } from './nav';
import { Avatar, Logo } from './ui';
import { useAuth } from './auth';

function initialsOf(name?: string) {
  return (name ?? 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Shell({
  route,
  setRoute,
  children,
}: {
  route: RouteKey;
  setRoute: (r: RouteKey) => void;
  children: React.ReactNode;
}) {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const wide = width >= 900;
  const current = ROUTES.find((r) => r.key === route)!;
  const initials = initialsOf(user?.name);

  const NavItem = ({ r, horizontal }: { r: (typeof ROUTES)[number]; horizontal?: boolean }) => {
    const active = r.key === route;
    return (
      <Pressable
        onPress={() => setRoute(r.key)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingVertical: horizontal ? 8 : 12,
          paddingHorizontal: 14,
          borderRadius: theme.radius.md,
          backgroundColor: active ? theme.color.sidebarActive : 'transparent',
        }}
      >
        <Text style={{ fontSize: 16 }}>{r.icon}</Text>
        {(!horizontal || active) && (
          <Text
            style={{
              color: active ? '#fff' : theme.color.mutedOnDark,
              fontWeight: active ? '800' : '600',
              fontSize: theme.font.small,
            }}
          >
            {r.label}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, flexDirection: wide ? 'row' : 'column', backgroundColor: theme.color.bg }}>
      {/* Sidebar (wide) */}
      {wide ? (
        <View style={{ width: 248, backgroundColor: theme.color.sidebar, padding: 16, gap: 6 }}>
          <View style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
            <Logo dark />
            <Text style={{ color: theme.color.mutedOnDark, fontSize: theme.font.tiny, marginTop: 8 }}>{CONFIG.teamName}</Text>
          </View>
          <View style={{ height: 8 }} />
          {ROUTES.map((r) => (
            <NavItem key={r.key} r={r} />
          ))}
          <View style={{ flex: 1 }} />
          <UserFooter name={user?.name} role={user?.role === 'admin' ? CONFIG.admin.role : 'Sales Rep'} initials={initials} />
        </View>
      ) : (
        // Top bar (narrow)
        <View style={{ backgroundColor: theme.color.sidebar, paddingTop: 44, paddingBottom: 10, paddingHorizontal: 14, gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Logo dark compact />
            <Avatar initials={initials} color="#5C5C5C" size={34} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {ROUTES.map((r) => (
              <NavItem key={r.key} r={r} horizontal />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      <View style={{ flex: 1 }}>
        {wide ? (
          <View
            style={{
              height: 64,
              backgroundColor: theme.color.card,
              borderBottomWidth: 1,
              borderBottomColor: theme.color.border,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
            }}
          >
            <Text style={{ fontSize: theme.font.h3, fontWeight: '800', color: theme.color.text }}>
              {current.icon} {current.label}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>{user?.name}</Text>
              <Avatar initials={initials} color={theme.color.primary} size={36} />
            </View>
          </View>
        ) : null}
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    </View>
  );
}

function UserFooter({ name, role, initials }: { name?: string; role: string; initials: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: theme.radius.md, backgroundColor: '#1A1A1A' }}>
      <Avatar initials={initials} color="#5C5C5C" size={36} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: theme.font.small }}>{name ?? 'User'}</Text>
        <Text style={{ color: theme.color.mutedOnDark, fontSize: theme.font.tiny }}>{role}</Text>
      </View>
    </View>
  );
}
