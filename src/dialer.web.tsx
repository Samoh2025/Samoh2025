import React, { createContext, useContext, useRef, useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { supabase } from './supabase';
import { normalizePhone } from './mappers';
import { theme } from './theme';
import type { Dialer, DialerStatus } from './dialer';

export type { Dialer, DialerStatus } from './dialer';

const DialerContext = createContext<Dialer | null>(null);

/** Dial the +1 (US) E.164 form Twilio expects; leave already-formatted input alone. */
function toE164(phone: string): string {
  const digits = (phone || '').replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  const n = normalizePhone(phone);
  return n.length === 10 ? `+1${n}` : digits ? `+${digits}` : '';
}

export function DialerProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<DialerStatus>('idle');
  const [activeLabel, setActiveLabel] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<'twilio' | 'device'>('twilio');
  const deviceRef = useRef<any>(null);
  const callRef = useRef<any>(null);

  const reset = () => {
    setStatus('idle');
    setActiveLabel(undefined);
    callRef.current = null;
  };

  const deviceDialer = (phone: string) => {
    setMode('device');
    const n = normalizePhone(phone);
    if (n) Linking.openURL(`tel:${n}`);
    reset();
  };

  const call = async (phone: string, label?: string) => {
    if (!phone) return;
    setActiveLabel(label || phone);

    // No backend at all → straight to the device dialer.
    if (!supabase) return deviceDialer(phone);

    setStatus('connecting');
    try {
      // Ask our Edge Function for a short-lived Twilio access token.
      const { data, error } = await supabase.functions.invoke('twilio-token');
      const token = (data as any)?.token;
      if (error || !token) throw new Error('twilio-not-configured');

      setMode('twilio');
      const sdk: any = await import('@twilio/voice-sdk');
      // One device per call keeps token/lifecycle handling simple.
      const device = new sdk.Device(token, { closeProtection: true });
      deviceRef.current = device;

      const outgoing = await device.connect({ params: { To: toE164(phone) } });
      callRef.current = outgoing;
      outgoing.on('ringing', () => setStatus('ringing'));
      outgoing.on('accept', () => setStatus('in_call'));
      outgoing.on('disconnect', () => { reset(); device.destroy(); });
      outgoing.on('cancel', () => { reset(); device.destroy(); });
      outgoing.on('reject', () => { reset(); device.destroy(); });
      outgoing.on('error', () => { setStatus('error'); setTimeout(reset, 2500); device.destroy(); });
    } catch {
      // Twilio isn't set up (or failed) → fall back to the phone's dialer.
      deviceDialer(phone);
    }
  };

  const hangup = () => {
    try {
      callRef.current?.disconnect?.();
      deviceRef.current?.destroy?.();
    } catch {
      /* ignore */
    }
    reset();
  };

  const value: Dialer = { call, hangup, status, activeLabel, mode };

  return (
    <DialerContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        {status !== 'idle' && mode === 'twilio' ? (
          <CallBar status={status} label={activeLabel} onHangup={hangup} />
        ) : null}
      </View>
    </DialerContext.Provider>
  );
}

function CallBar({ status, label, onHangup }: { status: DialerStatus; label?: string; onHangup: () => void }) {
  const text =
    status === 'connecting' ? 'Connecting…' :
    status === 'ringing' ? 'Ringing…' :
    status === 'in_call' ? 'On call' :
    status === 'error' ? 'Call failed' : '';
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 20,
        alignItems: 'center',
      }}
      pointerEvents="box-none"
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          backgroundColor: theme.color.primary,
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderRadius: theme.radius.pill,
          ...theme.shadow.card,
        }}
      >
        <Text style={{ fontSize: 16 }}>📞</Text>
        <View>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: theme.font.small }}>{label}</Text>
          <Text style={{ color: theme.color.mutedOnDark, fontSize: theme.font.tiny }}>{text}</Text>
        </View>
        <Pressable
          onPress={onHangup}
          style={{ backgroundColor: '#fff', borderRadius: theme.radius.pill, paddingVertical: 8, paddingHorizontal: 16 }}
        >
          <Text style={{ color: theme.color.primary, fontWeight: '800', fontSize: theme.font.small }}>End</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function useDialer() {
  const ctx = useContext(DialerContext);
  if (!ctx) throw new Error('useDialer must be used inside DialerProvider');
  return ctx;
}
