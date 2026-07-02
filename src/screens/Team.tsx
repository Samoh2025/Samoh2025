import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useStore } from '../store';
import { useAuth } from '../auth';
import { CONFIG } from '../config';
import { theme } from '../theme';
import { Card, Avatar, Badge, Button, Field, AppModal, moneyShort } from '../ui';
import { Rep } from '../types';

export default function Team() {
  const { data, addRep, inviteRep } = useStore();
  const { isAdmin } = useAuth();
  const { team, leads } = data;
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const inviteResultText = (email: string, r: { ok: boolean; error?: string }) =>
    r.ok
      ? `✉️ Invite emailed to ${email}.`
      : r.error === 'not-configured' || r.error === 'send-failed'
      ? `Added — but automated email isn't set up yet, so share the app link with them (see SETUP.md).`
      : `Added — couldn't email the invite. Share the app link with them.`;

  // Add the rep, then try to email them a join link.
  const handleAdd = async (rep: Omit<Rep, 'id' | 'initials' | 'color'>) => {
    const res = await addRep(rep);
    if (!res.ok) return res;
    if (rep.email) {
      const inv = await inviteRep(rep.email, rep.name);
      setNotice(inv.ok ? inviteResultText(rep.email, inv) : `${rep.name} ${inviteResultText(rep.email, inv)}`);
    } else {
      setNotice(`${rep.name} added. Share the app link so they can sign up.`);
    }
    return { ok: true };
  };

  const emailInvite = async (rep: Rep) => {
    if (!rep.email) return;
    const inv = await inviteRep(rep.email, rep.name);
    setNotice(inviteResultText(rep.email, inv));
  };

  const admins = team.filter((m) => m.role === 'admin');
  const reps = team.filter((m) => m.role !== 'admin');

  const statsFor = (rep: Rep) => {
    const mine = leads.filter((l) => l.repId === rep.id);
    const won = mine.filter((l) => l.stage === 'won');
    const open = mine.filter((l) => l.stage !== 'won' && l.stage !== 'lost');
    return {
      open: open.length,
      won: won.length,
      wonValue: won.reduce((s, l) => s + l.value, 0),
      pipeline: open.reduce((s, l) => s + l.value, 0),
    };
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <View>
          <Text style={{ fontSize: theme.font.h2, fontWeight: '800', color: theme.color.text }}>{CONFIG.teamName}</Text>
          <Text style={{ color: theme.color.muted, marginTop: 2 }}>
            {reps.length} sales {reps.length === 1 ? 'rep' : 'reps'} reporting to {CONFIG.admin.name}
          </Text>
        </View>
        {isAdmin ? <Button title="Add rep" icon="＋" onPress={() => setAdding(true)} /> : null}
      </View>

      {notice ? (
        <Card style={{ borderColor: theme.color.accent, borderWidth: 1.5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ flex: 1, color: theme.color.text, fontSize: theme.font.small, fontWeight: '600' }}>{notice}</Text>
            <Text onPress={() => setNotice(null)} style={{ color: theme.color.muted, fontSize: 18 }}>×</Text>
          </View>
        </Card>
      ) : null}

      {/* Admin card(s) */}
      {(admins.length ? admins : [null]).map((admin, i) => (
        <Card key={admin?.id ?? `admin-${i}`} style={{ backgroundColor: theme.color.primary, borderColor: theme.color.primary }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar initials={admin?.initials ?? CONFIG.admin.initials} color="#5C5C5C" size={52} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: theme.font.h3 }}>
                  {admin?.name ?? CONFIG.admin.fullName}
                </Text>
                <Badge label="Admin" tone="neutral" />
              </View>
              <Text style={{ color: theme.color.mutedOnDark, fontSize: theme.font.small, marginTop: 2 }}>
                {CONFIG.admin.role} · {admin?.email ?? CONFIG.admin.email}
              </Text>
            </View>
          </View>
        </Card>
      ))}

      {reps.length === 0 ? (
        <Card>
          <Text style={{ color: theme.color.muted, fontSize: theme.font.body, textAlign: 'center', paddingVertical: 20 }}>
            {isAdmin
              ? 'No reps yet. Tap “Add rep”, then share the link so they can sign in on their own phone.'
              : 'No reps have been added yet.'}
          </Text>
        </Card>
      ) : (
        <View style={{ gap: 12 }}>
          {reps.map((rep) => {
            const s = statsFor(rep);
            const active = !!rep.userId;
            return (
              <Card key={rep.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <Avatar initials={rep.initials} color={rep.color} size={48} />
                  <View style={{ flex: 1, minWidth: 160 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Text style={{ fontWeight: '800', fontSize: theme.font.body, color: theme.color.text }}>{rep.name}</Text>
                      <Badge label={active ? 'Active' : 'Invited'} tone={active ? 'success' : 'neutral'} />
                    </View>
                    <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>{rep.title}</Text>
                    <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny, marginTop: 2 }}>
                      {[rep.email, rep.phone].filter(Boolean).join(' · ') || 'No contact details yet'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 18 }}>
                    <Metric label="Open" value={String(s.open)} />
                    <Metric label="Won" value={String(s.won)} />
                    <Metric label="Won $" value={moneyShort(s.wonValue)} accent />
                  </View>
                </View>
                {isAdmin && !active && rep.email ? (
                  <View style={{ marginTop: 10, flexDirection: 'row' }}>
                    <Button small variant="outline" icon="✉️" title="Email invite" onPress={() => emailInvite(rep)} />
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>
      )}

      <AddRepModal visible={adding} onClose={() => setAdding(false)} onAdd={handleAdd} />
    </ScrollView>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={{ alignItems: 'center', minWidth: 56 }}>
      <Text style={{ fontWeight: '800', fontSize: theme.font.h3, color: accent ? theme.color.accent : theme.color.text }}>{value}</Text>
      <Text style={{ fontSize: theme.font.tiny, color: theme.color.muted }}>{label}</Text>
    </View>
  );
}

function AddRepModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (r: Omit<Rep, 'id' | 'initials' | 'color'>) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Sales Consultant');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setName(''); setTitle('Sales Consultant'); setEmail(''); setPhone(''); setError(null);
  };

  const submit = async () => {
    if (busy) return;
    if (!name.trim()) {
      setError('Please enter a name.');
      return;
    }
    setError(null);
    setBusy(true);
    const res = await onAdd({ name: name.trim(), title: title.trim() || 'Sales Consultant', email: email.trim(), phone: phone.trim() });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'Could not add the rep.');
      return;
    }
    reset();
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Add a sales rep">
      <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>
        Add their details here, then share the site link and ask them to create an account with this same email.
        They'll sign in on their own phone and show as “Active”.
      </Text>
      <Field label="Full name" value={name} onChangeText={setName} placeholder="e.g. Alex Rivera" />
      <Field label="Title" value={title} onChangeText={setTitle} placeholder="Sales Consultant" />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="alex@onehorizonhomes.com" keyboardType="email-address" />
      <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="(201) 555-0100" keyboardType="phone-pad" />
      {error ? <Text style={{ color: theme.color.text, fontWeight: '700', fontSize: theme.font.small }}>⚠ {error}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1 }} />
        <Button title={busy ? 'Adding…' : 'Add rep'} variant="primary" icon="＋" onPress={submit} style={{ flex: 1 }} />
      </View>
    </AppModal>
  );
}
