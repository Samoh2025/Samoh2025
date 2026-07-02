import React, { createContext, useContext } from 'react';
import { Linking } from 'react-native';
import { normalizePhone } from './mappers';

/**
 * Native dialer. The deployed product is the web app, where in-app Twilio
 * calling lives in dialer.web.tsx. On a native build we simply hand off to the
 * phone's own dialer.
 */
export type DialerStatus = 'idle' | 'connecting' | 'ringing' | 'in_call' | 'error';

export type Dialer = {
  call: (phone: string, label?: string) => Promise<void>;
  hangup: () => void;
  status: DialerStatus;
  activeLabel?: string;
  /** 'twilio' = in-app calls; 'device' = handoff to the phone dialer. */
  mode: 'twilio' | 'device';
};

const DialerContext = createContext<Dialer | null>(null);

export function DialerProvider({ children }: { children: React.ReactNode }) {
  const value: Dialer = {
    call: async (phone) => {
      const n = normalizePhone(phone);
      if (n) Linking.openURL(`tel:${n}`);
    },
    hangup: () => {},
    status: 'idle',
    mode: 'device',
  };
  return <DialerContext.Provider value={value}>{children}</DialerContext.Provider>;
}

export function useDialer() {
  const ctx = useContext(DialerContext);
  if (!ctx) throw new Error('useDialer must be used inside DialerProvider');
  return ctx;
}
