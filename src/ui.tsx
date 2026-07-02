import React from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from './theme';
import { BrandMark } from './BrandMark';

/* ----------------------------- formatting ----------------------------- */

export const money = (n: number) =>
  '$' + Math.round(n).toLocaleString('en-US');

export const moneyShort = (n: number) => {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'M';
  if (n >= 1_000) return '$' + Math.round(n / 1000) + 'k';
  return '$' + n;
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'yesterday' : `${d}d ago`;
}

/* ------------------------------- Avatar ------------------------------- */

export function Avatar({
  initials,
  color = theme.color.primary,
  size = 40,
}: {
  initials: string;
  color?: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
}

/* -------------------------------- Badge ------------------------------- */

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

// Monochrome tones: strong states are filled black, "lost"/danger is outlined.
const toneMap: Record<Tone, { bg: string; fg: string; border?: string }> = {
  neutral: { bg: '#F0F0F0', fg: '#5A5A5A' },
  success: { bg: '#0A0A0A', fg: '#FFFFFF' },
  warning: { bg: '#E2E2E2', fg: '#2A2A2A' },
  danger: { bg: '#FFFFFF', fg: '#0A0A0A', border: '#0A0A0A' },
  info: { bg: '#F0F0F0', fg: '#2A2A2A' },
  accent: { bg: '#0A0A0A', fg: '#FFFFFF' },
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const c = toneMap[tone];
  return (
    <View
      style={{
        backgroundColor: c.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.radius.pill,
        alignSelf: 'flex-start',
        borderWidth: c.border ? 1 : 0,
        borderColor: c.border ?? 'transparent',
      }}
    >
      <Text style={{ color: c.fg, fontWeight: '700', fontSize: theme.font.tiny, letterSpacing: 0.3 }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

/* -------------------------------- Logo -------------------------------- */

/**
 * One Horizon Homes logo — the interlocking-loops mark + "One Horizon Homes"
 * wordmark. Adapts to light/dark surfaces. Rebuilt as vector (BrandMark).
 */
export function Logo({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  const fg = dark ? '#FFFFFF' : theme.color.text;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <BrandMark size={compact ? 34 : 40} color={fg} />
      {!compact && (
        <Text style={{ color: fg, fontWeight: '600', fontSize: 16, letterSpacing: 0.3 }}>One Horizon Homes</Text>
      )}
    </View>
  );
}

/* -------------------------------- Card -------------------------------- */

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={{ fontSize: theme.font.h3, fontWeight: '800', color: theme.color.text }}>{children}</Text>
      {right}
    </View>
  );
}

/* ------------------------------ StatCard ------------------------------ */

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = 'info',
}: {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  tone?: Tone;
}) {
  return (
    <Card style={{ flex: 1, minWidth: 150 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: theme.color.text,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 17 }}>{icon}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 28, fontWeight: '800', color: theme.color.text, marginTop: 10 }}>{value}</Text>
      <Text style={{ fontSize: theme.font.small, color: theme.color.muted, marginTop: 2 }}>{label}</Text>
      {sub ? <Text style={{ fontSize: theme.font.tiny, color: theme.color.muted, fontWeight: '700', marginTop: 6 }}>{sub}</Text> : null}
    </Card>
  );
}

/* ------------------------------- Button ------------------------------- */

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  small,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'accent' | 'ghost' | 'outline' | 'danger';
  icon?: string;
  small?: boolean;
  style?: ViewStyle;
}) {
  const base: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: theme.radius.md,
    paddingVertical: small ? 8 : 12,
    paddingHorizontal: small ? 12 : 18,
  };
  const variants: Record<string, { c: ViewStyle; t: TextStyle }> = {
    primary: { c: { backgroundColor: theme.color.primary }, t: { color: '#fff' } },
    accent: { c: { backgroundColor: theme.color.primary }, t: { color: '#fff' } },
    ghost: { c: { backgroundColor: 'transparent' }, t: { color: theme.color.primary } },
    outline: { c: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.color.text }, t: { color: theme.color.text } },
    danger: { c: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.color.text }, t: { color: theme.color.text } },
  };
  const v = variants[variant];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [base, v.c, { opacity: pressed ? 0.85 : 1 }, style]}
    >
      {icon ? <Text style={{ fontSize: small ? 13 : 15 }}>{icon}</Text> : null}
      <Text style={[{ fontWeight: '700', fontSize: small ? theme.font.small : theme.font.body }, v.t]}>{title}</Text>
    </Pressable>
  );
}

/* -------------------------------- Field ------------------------------- */

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: theme.font.small, fontWeight: '700', color: theme.color.muted }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A9B6C2"
        keyboardType={keyboardType as any}
        secureTextEntry={secureTextEntry}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : undefined}
        autoCorrect={keyboardType === 'email-address' ? false : undefined}
        style={styles.input}
      />
    </View>
  );
}

/* ----------------------------- ChipSelect ----------------------------- */

export function ChipSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  renderLabel,
}: {
  label?: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  renderLabel?: (v: T) => string;
}) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={{ fontSize: theme.font.small, fontWeight: '700', color: theme.color.muted }}>{label}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => {
          const active = o === value;
          return (
            <Pressable
              key={o}
              onPress={() => onChange(o)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: theme.radius.pill,
                backgroundColor: active ? theme.color.primary : '#EEF2F6',
              }}
            >
              <Text style={{ color: active ? '#fff' : theme.color.muted, fontWeight: '700', fontSize: theme.font.small }}>
                {renderLabel ? renderLabel(o) : o}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ----------------------------- ProgressBar ---------------------------- */

export function ProgressBar({ value, total, color = theme.color.primary }: { value: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: '#EAEFF4', overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
    </View>
  );
}

/* ------------------------------- Modal -------------------------------- */

export function AppModal({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Card style={styles.modalCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ fontSize: theme.font.h3, fontWeight: '800', color: theme.color.text }}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={{ fontSize: 22, color: theme.color.muted }}>×</Text>
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 460 }} contentContainerStyle={{ gap: 14 }}>
            {children}
          </ScrollView>
        </Card>
      </View>
    </Modal>
  );
}

/* ----------------------------- EmptyState ----------------------------- */

export function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, gap: 8 }}>
      <Text style={{ fontSize: 34 }}>{icon}</Text>
      <Text style={{ color: theme.color.muted, fontSize: theme.font.body }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.color.card,
    borderRadius: theme.radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.color.border,
    ...theme.shadow.card,
  },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F6F8FA',
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: theme.font.body,
    color: theme.color.text,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,31,51,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
  },
});
