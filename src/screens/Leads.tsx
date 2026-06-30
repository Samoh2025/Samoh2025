import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useStore, repById, ImportRow } from '../store';
import { theme } from '../theme';
import {
  Card,
  Badge,
  Avatar,
  Button,
  Field,
  ChipSelect,
  AppModal,
  EmptyState,
  money,
  formatDate,
} from '../ui';
import { LEAD_STAGES, LeadStage, PROJECT_TYPES, ProjectType, Lead } from '../types';

const stageTone: Record<LeadStage, any> = {
  new: 'info',
  contacted: 'accent',
  appointment: 'warning',
  quoted: 'accent',
  won: 'success',
  lost: 'danger',
};

const nextStage: Partial<Record<LeadStage, LeadStage>> = {
  new: 'contacted',
  contacted: 'appointment',
  appointment: 'quoted',
  quoted: 'won',
};

export default function Leads() {
  const { data, addLead, setLeadStage, importLeads } = useStore();
  const { leads, team } = data;
  const [filter, setFilter] = useState<'all' | LeadStage>('all');
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);

  const filtered = useMemo(
    () => (filter === 'all' ? leads : leads.filter((l) => l.stage === filter)),
    [leads, filter],
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <View>
          <Text style={{ fontSize: theme.font.h2, fontWeight: '800', color: theme.color.text }}>Leads & Pipeline</Text>
          <Text style={{ color: theme.color.muted, marginTop: 2 }}>{leads.length} leads in your funnel</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="Import contacts" icon="⇪" variant="outline" onPress={() => setImporting(true)} />
          <Button title="Add lead" icon="＋" variant="primary" onPress={() => setAdding(true)} />
        </View>
      </View>

      {/* Filter chips */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <FilterChip label={`All (${leads.length})`} active={filter === 'all'} onPress={() => setFilter('all')} />
        {LEAD_STAGES.map((s) => (
          <FilterChip
            key={s.key}
            label={`${s.label} (${leads.filter((l) => l.stage === s.key).length})`}
            active={filter === s.key}
            onPress={() => setFilter(s.key)}
          />
        ))}
      </View>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon="🧲" text="No leads in this stage yet." />
        </Card>
      ) : (
        <View style={{ gap: 12 }}>
          {filtered.map((l) => {
            const rep = repById(team, l.repId);
            const adv = nextStage[l.stage];
            return (
              <Card key={l.id}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
                  <Avatar initials={initials(l.name)} color={rep?.color ?? theme.color.primary} />
                  <View style={{ flex: 1, minWidth: 180 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Text style={{ fontWeight: '800', fontSize: theme.font.body, color: theme.color.text }}>{l.name}</Text>
                      <Badge label={LEAD_STAGES.find((s) => s.key === l.stage)!.label} tone={stageTone[l.stage]} />
                    </View>
                    <Text style={{ color: theme.color.muted, fontSize: theme.font.small, marginTop: 3 }}>
                      {l.type} · {l.address}
                    </Text>
                    <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny, marginTop: 3 }}>
                      {l.phone} · {l.email} · via {l.source}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ fontWeight: '800', fontSize: theme.font.h3, color: theme.color.text }}>{money(l.value)}</Text>
                    <Text style={{ fontSize: theme.font.tiny, color: theme.color.muted }}>
                      {rep?.name ?? 'Unassigned'} · {formatDate(l.createdAt)}
                    </Text>
                  </View>
                </View>

                {/* Stage actions */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  {adv ? (
                    <Button
                      small
                      variant="primary"
                      title={`Move to ${LEAD_STAGES.find((s) => s.key === adv)!.label}`}
                      icon="→"
                      onPress={() => setLeadStage(l.id, adv)}
                    />
                  ) : null}
                  {l.stage !== 'won' && l.stage !== 'lost' ? (
                    <>
                      <Button small variant="danger" title="Lost" onPress={() => setLeadStage(l.id, 'lost')} />
                      {l.stage !== 'quoted' ? (
                        <Button small variant="outline" title="Mark won" onPress={() => setLeadStage(l.id, 'won')} />
                      ) : null}
                    </>
                  ) : (
                    <Button small variant="outline" title="Reopen" onPress={() => setLeadStage(l.id, 'contacted')} />
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      )}

      <AddLeadModal visible={adding} onClose={() => setAdding(false)} onAdd={(l) => { addLead(l); setAdding(false); }} teamIds={team} />
      <ImportContactsModal
        visible={importing}
        onClose={() => setImporting(false)}
        onImport={(rows) => importLeads(rows)}
      />
    </ScrollView>
  );
}

/** Parse pasted CSV / spreadsheet text into contact rows. */
export function parseContacts(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const delim = lines[0].includes('\t') ? '\t' : ',';
  const split = (line: string) => line.split(delim).map((c) => c.trim());

  // Detect a header row.
  const first = split(lines[0]).map((h) => h.toLowerCase());
  const looksLikeHeader = first.some((h) => /name|email|phone|address|contact/.test(h));
  const headers = looksLikeHeader ? first : ['name', 'phone', 'email', 'address', 'value', 'type', 'source'];
  const body = looksLikeHeader ? lines.slice(1) : lines;

  const idx = (keys: string[]) => headers.findIndex((h) => keys.some((k) => h.includes(k)));
  const ni = idx(['name', 'contact']);
  const pi = idx(['phone', 'mobile', 'cell']);
  const ei = idx(['email']);
  const ai = idx(['address', 'street']);
  const vi = idx(['value', 'amount', 'budget']);
  const si = idx(['source', 'lead source']);

  return body
    .map((line) => {
      const c = split(line);
      const pick = (i: number) => (i >= 0 ? c[i] ?? '' : '');
      const name = ni >= 0 ? pick(ni) : c[0] ?? '';
      const valueRaw = pick(vi).replace(/[^0-9.]/g, '');
      return {
        name,
        phone: pick(pi),
        email: pick(ei),
        address: pick(ai),
        value: valueRaw ? Number(valueRaw) : 0,
        source: pick(si) || 'Imported',
      } as ImportRow;
    })
    .filter((r) => r.name);
}

function ImportContactsModal({
  visible,
  onClose,
  onImport,
}: {
  visible: boolean;
  onClose: () => void;
  onImport: (rows: ImportRow[]) => number;
}) {
  const [text, setText] = useState('');
  const parsed = useMemo(() => parseContacts(text), [text]);

  const sample = 'Name, Phone, Email, Address, Value, Source\nJohn Smith, (201) 555-0123, john@email.com, 12 Elm St Ridgewood NJ, 45000, Referral';

  const submit = () => {
    const n = onImport(parsed);
    if (n > 0) {
      setText('');
      onClose();
    }
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Import contacts">
      <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>
        Paste your contact list from a spreadsheet (Excel, Google Sheets) or a CSV. The first row can be column
        headers like Name, Phone, Email, Address, Value, Source.
      </Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={sample}
        placeholderTextColor="#A9A9A9"
        multiline
        style={{
          minHeight: 150,
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
        {parsed.length} contact{parsed.length === 1 ? '' : 's'} detected
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1 }} />
        <Button title={`Import ${parsed.length || ''}`.trim()} variant="primary" icon="⇪" onPress={submit} style={{ flex: 1 }} />
      </View>
    </AppModal>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.radius.pill,
        backgroundColor: active ? theme.color.primary : '#fff',
        borderWidth: 1,
        borderColor: active ? theme.color.primary : theme.color.border,
      }}
    >
      <Text style={{ color: active ? '#fff' : theme.color.muted, fontWeight: '700', fontSize: theme.font.small }}>{label}</Text>
    </Pressable>
  );
}

function AddLeadModal({
  visible,
  onClose,
  onAdd,
  teamIds,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (l: Omit<Lead, 'id' | 'createdAt' | 'stage'>) => void;
  teamIds: { id: string; name: string }[];
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState<ProjectType>(PROJECT_TYPES[0]);
  const [source, setSource] = useState('Website');
  const [repId, setRepId] = useState(teamIds[0]?.id ?? '');

  const reset = () => {
    setName(''); setPhone(''); setEmail(''); setAddress(''); setValue('');
    setType(PROJECT_TYPES[0]); setSource('Website'); setRepId(teamIds[0]?.id ?? '');
  };

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      type,
      value: Number(value.replace(/[^0-9.]/g, '')) || 0,
      source,
      repId: repId || teamIds[0]?.id || '',
    });
    reset();
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="New lead">
      <Field label="Customer name" value={name} onChangeText={setName} placeholder="e.g. Jane Doe" />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}><Field label="Phone" value={phone} onChangeText={setPhone} placeholder="(201) 555-0100" keyboardType="phone-pad" /></View>
        <View style={{ flex: 1 }}><Field label="Est. value" value={value} onChangeText={setValue} placeholder="$50,000" keyboardType="numeric" /></View>
      </View>
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="jane@email.com" keyboardType="email-address" />
      <Field label="Property address" value={address} onChangeText={setAddress} placeholder="123 Main St, Ridgewood, NJ" />
      <ChipSelect label="Project type" options={PROJECT_TYPES} value={type} onChange={setType} />
      <ChipSelect label="Source" options={['Website', 'Referral', 'Google Ads', 'Houzz', 'Instagram'] as string[]} value={source} onChange={setSource} />
      <ChipSelect
        label="Assign to"
        options={teamIds.map((t) => t.id)}
        value={repId}
        onChange={setRepId}
        renderLabel={(id) => teamIds.find((t) => t.id === id)?.name ?? id}
      />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1 }} />
        <Button title="Add lead" variant="primary" icon="＋" onPress={submit} style={{ flex: 1 }} />
      </View>
    </AppModal>
  );
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}
