import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useStore } from '../store';
import { useAuth } from '../auth';
import { useDialer } from '../dialer';
import { theme } from '../theme';
import {
  Card,
  SectionTitle,
  ChipSelect,
  Avatar,
  Badge,
  Button,
  Field,
  AppModal,
  EmptyState,
  relativeTime,
} from '../ui';
import {
  KNOCK_STATUSES,
  KnockStatus,
  PROPERTY_CATEGORIES,
  PropertyCategory,
  LISTING_STATUSES,
  ListingStatus,
  Lead,
} from '../types';
import { TERRITORY_CENTER, TERRITORY_ZOOM, TERRITORY_TOWNS } from '../data';
import { reverseGeocode, geocodeAddress } from '../geocode';
import type { NewDoor } from '../store';
import MapView, { MapPoint } from '../MapView';

const LEGEND: { status: KnockStatus; label: string }[] = [
  { status: 'interested', label: 'Interested' },
  { status: 'callback', label: 'Call back' },
  { status: 'no_answer', label: 'No answer' },
  { status: 'not_interested', label: 'Not interested' },
  { status: 'not_knocked', label: 'Not knocked' },
];

function Dot({ status }: { status: KnockStatus }) {
  const styles: Record<KnockStatus, any> = {
    interested: { backgroundColor: '#0A0A0A', borderColor: '#0A0A0A' },
    callback: { backgroundColor: '#FFFFFF', borderColor: '#0A0A0A', borderWidth: 3 },
    no_answer: { backgroundColor: '#9A9A9A', borderColor: '#6B6B6B' },
    not_interested: { backgroundColor: '#FFFFFF', borderColor: '#B7B7B7' },
    not_knocked: { backgroundColor: '#FFFFFF', borderColor: '#0A0A0A', borderStyle: 'dashed' },
  };
  return <View style={[{ width: 14, height: 14, borderRadius: 7, borderWidth: 2 }, styles[status]]} />;
}

const listingLabel = (s?: ListingStatus) => LISTING_STATUSES.find((x) => x.key === s)?.label ?? '';
const knockLabel = (s?: KnockStatus) => KNOCK_STATUSES.find((x) => x.key === (s ?? 'not_knocked'))?.label ?? '';

export default function DoorKnock() {
  const { data, addDoor, importDoors, setKnockStatus, setCategory, setListingStatus, setDnc, addNote, deleteLead, isDnc } = useStore();
  const { user } = useAuth();
  const { leads } = data;

  const [catFilter, setCatFilter] = useState<'all' | PropertyCategory>('all');
  const [listFilter, setListFilter] = useState<'all' | ListingStatus>('all');
  const [pending, setPending] = useState<{ lat: number; lng: number; address: string; loading: boolean } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const doors = useMemo(
    () =>
      leads.filter(
        (l) =>
          l.lat != null &&
          l.lng != null &&
          (catFilter === 'all' || (l.category ?? 'residential') === catFilter) &&
          (listFilter === 'all' || (l.listingStatus ?? 'none') === listFilter),
      ),
    [leads, catFilter, listFilter],
  );

  const points: MapPoint[] = doors.map((l) => ({
    id: l.id,
    lat: l.lat as number,
    lng: l.lng as number,
    label: l.name,
    sub: `${l.address} · ${knockLabel(l.knockStatus)}`,
    status: l.knockStatus ?? 'not_knocked',
  }));

  const counts = KNOCK_STATUSES.map((k) => ({
    ...k,
    n: doors.filter((d) => (d.knockStatus ?? 'not_knocked') === k.key).length,
  }));

  const selected = selectedId ? leads.find((l) => l.id === selectedId) ?? null : null;

  const handleMapClick = (lat: number, lng: number) => {
    setPending({ lat, lng, address: '', loading: true });
    reverseGeocode(lat, lng).then((address) =>
      setPending((p) => (p && p.lat === lat && p.lng === lng ? { ...p, address, loading: false } : p)),
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <View>
          <Text style={{ fontSize: theme.font.h2, fontWeight: '800', color: theme.color.text }}>Door-Knocking Map</Text>
          <Text style={{ color: theme.color.muted, marginTop: 2 }}>
            {TERRITORY_TOWNS.join(' · ')} — {doors.length} doors in the field
          </Text>
        </View>
        <Button title="Import list" icon="⇪" variant="outline" onPress={() => setImportOpen(true)} />
      </View>

      {/* Filters */}
      <View style={{ gap: 10 }}>
        <ChipSelect
          label="Property type"
          options={['all', ...PROPERTY_CATEGORIES.map((c) => c.key)] as ('all' | PropertyCategory)[]}
          value={catFilter}
          onChange={setCatFilter}
          renderLabel={(k) => (k === 'all' ? 'All' : PROPERTY_CATEGORIES.find((c) => c.key === k)?.label ?? k)}
        />
        <ChipSelect
          label="Listing status"
          options={['all', ...LISTING_STATUSES.map((s) => s.key)] as ('all' | ListingStatus)[]}
          value={listFilter}
          onChange={setListFilter}
          renderLabel={(k) => (k === 'all' ? 'All' : LISTING_STATUSES.find((s) => s.key === k)?.label ?? k)}
        />
      </View>

      {/* Status summary */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {counts.map((c) => (
          <Card key={c.key} style={{ paddingVertical: 12, paddingHorizontal: 14, minWidth: 110, flexGrow: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Dot status={c.key} />
              <Text style={{ fontSize: 22, fontWeight: '800', color: theme.color.text }}>{c.n}</Text>
            </View>
            <Text style={{ color: theme.color.muted, fontSize: theme.font.small, marginTop: 4 }}>{c.label}</Text>
          </Card>
        ))}
      </View>

      {/* Map */}
      <Card style={{ padding: 8 }}>
        <View style={{ paddingHorizontal: 8, paddingTop: 4, paddingBottom: 8 }}>
          <Text style={{ color: theme.color.text, fontWeight: '800', fontSize: theme.font.small }}>
            👆 Tap anywhere on the map to drop a door
          </Text>
          <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny, marginTop: 2 }}>
            The address is filled in automatically. Tap an existing dot to log what happened.
          </Text>
        </View>
        <MapView
          points={points}
          center={TERRITORY_CENTER}
          zoom={TERRITORY_ZOOM}
          height={460}
          onMapClick={handleMapClick}
          onSelect={setSelectedId}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, padding: 12 }}>
          {LEGEND.map((l) => (
            <View key={l.status} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Dot status={l.status} />
              <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny }}>{l.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Door list */}
      <SectionTitle>Doors on the route</SectionTitle>
      {doors.length === 0 ? (
        <Card>
          <EmptyState icon="🗺️" text="No doors yet — tap the map to add one, or import contacts with addresses." />
        </Card>
      ) : (
        <View style={{ gap: 12 }}>
          {doors.map((l) => {
            const noteCount = data.notes.filter((n) => n.leadId === l.id).length;
            return (
              <Pressable key={l.id} onPress={() => setSelectedId(l.id)}>
                <Card>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <Dot status={l.knockStatus ?? 'not_knocked'} />
                    <View style={{ flex: 1, minWidth: 160 }}>
                      <Text style={{ fontWeight: '800', color: theme.color.text }}>{l.name}</Text>
                      <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny }}>📍 {l.address}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Badge label={(l.category ?? 'residential') === 'commercial' ? 'Commercial' : 'Residential'} tone="neutral" />
                      {l.listingStatus && l.listingStatus !== 'none' ? <Badge label={listingLabel(l.listingStatus)} tone="info" /> : null}
                      {l.dnc ? <Badge label="Do Not Call" tone="danger" /> : null}
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny }}>
                      {knockLabel(l.knockStatus)}{noteCount ? ` · ${noteCount} note${noteCount === 1 ? '' : 's'}` : ''}
                    </Text>
                    <Text style={{ color: theme.color.text, fontWeight: '700', fontSize: theme.font.tiny }}>Open →</Text>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}

      <Text style={{ textAlign: 'center', color: theme.color.muted, fontSize: theme.font.tiny, marginTop: 4 }}>
        Map data © OpenStreetMap. Doors and notes sync live across the whole team.
      </Text>

      {/* Add-door modal (from a map tap) */}
      <AddDoorModal
        pending={pending}
        onClose={() => setPending(null)}
        onAdd={async (input) => {
          const id = await addDoor({ ...input, repId: user?.id });
          setPending(null);
          if (id) setSelectedId(id);
        }}
      />

      {/* Door details modal (from tapping a dot / list row) */}
      <DoorDetailsModal
        door={selected}
        notes={data.notes.filter((n) => n.leadId === selectedId)}
        onClose={() => setSelectedId(null)}
        onKnock={(s) => selected && setKnockStatus(selected.id, s)}
        onCategory={(c) => selected && setCategory(selected.id, c)}
        onListing={(s) => selected && setListingStatus(selected.id, s)}
        onDnc={(v) => selected && setDnc(selected.id, v)}
        onNote={(text) =>
          selected &&
          addNote(selected.id, { text, outcome: selected.knockStatus, authorId: user?.userId, authorName: user?.name ?? 'Team member' })
        }
        onDelete={() => {
          if (selected) {
            deleteLead(selected.id);
            setSelectedId(null);
          }
        }}
        blockedCall={selected ? isDnc(selected.phone) || !!selected.dnc : false}
      />

      {/* Import a list of properties (addresses + statuses) */}
      <ImportPropertiesModal visible={importOpen} onClose={() => setImportOpen(false)} onImport={importDoors} team={data.team} />
    </ScrollView>
  );
}

/* ------------------------------ Add door ------------------------------ */

function AddDoorModal({
  pending,
  onClose,
  onAdd,
}: {
  pending: { lat: number; lng: number; address: string; loading: boolean } | null;
  onClose: () => void;
  onAdd: (input: {
    address: string;
    lat: number;
    lng: number;
    name?: string;
    phone?: string;
    category: PropertyCategory;
    listingStatus: ListingStatus;
    knockStatus: KnockStatus;
  }) => void;
}) {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<PropertyCategory>('residential');
  const [listingStatus, setListingStatus] = useState<ListingStatus>('none');
  const [knock, setKnock] = useState<KnockStatus>('not_knocked');

  const pinKey = pending ? `${pending.lat},${pending.lng}` : null;
  // Reset the form each time a new pin is dropped.
  useEffect(() => {
    if (!pinKey) return;
    setAddress('');
    setName('');
    setPhone('');
    setCategory('residential');
    setListingStatus('none');
    setKnock('not_knocked');
  }, [pinKey]);
  // Fill in the address once the reverse-geocode resolves (rep can still edit).
  useEffect(() => {
    if (pending && !pending.loading) setAddress((a) => a || pending.address);
  }, [pending?.loading, pending?.address]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => {
    if (!pending) return;
    onAdd({
      address: address.trim() || pending.address || `${pending.lat.toFixed(5)}, ${pending.lng.toFixed(5)}`,
      lat: pending.lat,
      lng: pending.lng,
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
      category,
      listingStatus,
      knockStatus: knock,
    });
  };

  return (
    <AppModal visible={!!pending} onClose={onClose} title="Add a door">
      <Field
        label="Address"
        value={pending?.loading && !address ? 'Finding address…' : address}
        onChangeText={setAddress}
        placeholder="123 Main St, Wayne, NJ"
      />
      {pending && !pending.loading && address.trim() && !/^\s*\d/.test(address) ? (
        <Text style={{ color: theme.color.text, fontWeight: '700', fontSize: theme.font.tiny }}>
          ⚠ No house number detected — add it (e.g. “123 {address.trim()}”) so reps hit the right house.
        </Text>
      ) : null}
      <Field label="Name / business (optional)" value={name} onChangeText={setName} placeholder="e.g. The Smiths / Corner Deli" />
      <Field label="Phone (optional)" value={phone} onChangeText={setPhone} placeholder="(973) 555-0100" keyboardType="phone-pad" />
      <ChipSelect
        label="Property type"
        options={PROPERTY_CATEGORIES.map((c) => c.key)}
        value={category}
        onChange={setCategory}
        renderLabel={(k) => PROPERTY_CATEGORIES.find((c) => c.key === k)?.label ?? k}
      />
      <ChipSelect
        label="Listing status"
        options={LISTING_STATUSES.map((s) => s.key)}
        value={listingStatus}
        onChange={setListingStatus}
        renderLabel={(k) => LISTING_STATUSES.find((s) => s.key === k)?.label ?? k}
      />
      <ChipSelect
        label="What happened?"
        options={KNOCK_STATUSES.map((k) => k.key)}
        value={knock}
        onChange={setKnock}
        renderLabel={(k) => KNOCK_STATUSES.find((x) => x.key === k)?.label ?? k}
      />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1 }} />
        <Button title="Add door" variant="primary" icon="＋" onPress={submit} style={{ flex: 1 }} />
      </View>
    </AppModal>
  );
}

/* ---------------------------- Door details ---------------------------- */

function DoorDetailsModal({
  door,
  notes,
  onClose,
  onKnock,
  onCategory,
  onListing,
  onDnc,
  onNote,
  onDelete,
  blockedCall,
}: {
  door: Lead | null;
  notes: { id: string; authorName: string; text: string; createdAt: string; outcome?: KnockStatus | null }[];
  onClose: () => void;
  onKnock: (s: KnockStatus) => void;
  onCategory: (c: PropertyCategory) => void;
  onListing: (s: ListingStatus) => void;
  onDnc: (v: boolean) => void;
  onNote: (text: string) => void;
  onDelete: () => void;
  blockedCall: boolean;
}) {
  const { call } = useDialer();
  const [note, setNote] = useState('');

  const addNote = () => {
    if (!note.trim()) return;
    onNote(note.trim());
    setNote('');
  };

  if (!door) return null;

  return (
    <AppModal visible={!!door} onClose={onClose} title={door.name}>
      <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>📍 {door.address}</Text>

      {/* Call */}
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {door.phone ? (
          blockedCall ? (
            <Badge label="Do Not Call" tone="danger" />
          ) : (
            <Button small variant="primary" icon="📞" title={`Call ${door.phone}`} onPress={() => call(door.phone, door.name)} />
          )
        ) : (
          <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny }}>No phone number on file</Text>
        )}
        <Button
          small
          variant="outline"
          icon={door.dnc ? '↺' : '⃠'}
          title={door.dnc ? 'Remove Do-Not-Call' : 'Mark Do Not Call'}
          onPress={() => onDnc(!door.dnc)}
        />
      </View>

      <ChipSelect
        label="Outcome"
        options={KNOCK_STATUSES.map((k) => k.key)}
        value={door.knockStatus ?? 'not_knocked'}
        onChange={onKnock}
        renderLabel={(k) => KNOCK_STATUSES.find((x) => x.key === k)?.label ?? k}
      />
      <ChipSelect
        label="Property type"
        options={PROPERTY_CATEGORIES.map((c) => c.key)}
        value={door.category ?? 'residential'}
        onChange={onCategory}
        renderLabel={(k) => PROPERTY_CATEGORIES.find((c) => c.key === k)?.label ?? k}
      />
      <ChipSelect
        label="Listing status"
        options={LISTING_STATUSES.map((s) => s.key)}
        value={door.listingStatus ?? 'none'}
        onChange={onListing}
        renderLabel={(k) => LISTING_STATUSES.find((s) => s.key === k)?.label ?? k}
      />

      {/* Notes log */}
      <SectionTitle>Notes ({notes.length})</SectionTitle>
      <View style={{ gap: 10 }}>
        {notes.length === 0 ? (
          <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>
            No notes yet. Log what happened so the whole team can see it.
          </Text>
        ) : (
          notes.map((n) => (
            <View key={n.id} style={{ backgroundColor: theme.color.bg, borderRadius: theme.radius.md, padding: 10 }}>
              <Text style={{ color: theme.color.text, fontSize: theme.font.small }}>{n.text}</Text>
              <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny, marginTop: 3 }}>
                {n.authorName || 'Team member'}
                {n.outcome ? ` · ${knockLabel(n.outcome)}` : ''} · {relativeTime(n.createdAt)}
              </Text>
            </View>
          ))
        )}
      </View>
      <Field label="Add a note" value={note} onChangeText={setNote} placeholder="Homeowner interested — call back Saturday" />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="Close" variant="outline" onPress={onClose} style={{ flex: 1 }} />
        <Button title="Save note" variant="primary" icon="＋" onPress={addNote} style={{ flex: 1 }} />
      </View>
      <Button title="Remove this door" variant="danger" icon="🗑" onPress={onDelete} />
    </AppModal>
  );
}

/* --------------------------- Import properties ------------------------- */

type ParsedRow = {
  address: string;
  listingStatus: ListingStatus;
  category: PropertyCategory;
  name?: string;
  phone?: string;
  lat?: number;
  lng?: number;
};

function toListing(s: string): ListingStatus {
  const t = (s || '').toLowerCase();
  if (/under\s*contract|\bu\/?c\b|contingent|attorney review/.test(t)) return 'under_contract';
  if (/pending|under offer|accepted offer/.test(t)) return 'pending';
  if (/lease|rent/.test(t)) return 'for_lease';
  if (/for\s*sale|active|coming soon|listed|\bsale\b/.test(t)) return 'for_sale';
  return 'none';
}

function toCategory(s: string): PropertyCategory {
  return /commercial|retail|office|industrial|business|storefront|\bshop\b|\bstore\b/.test((s || '').toLowerCase())
    ? 'commercial'
    : 'residential';
}

/** Split a line, respecting double-quoted CSV fields (Excel/Redfin exports). */
function splitLine(line: string, delim: string): string[] {
  if (delim !== ',') return line.split(delim).map((c) => c.trim());
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

/** Parse a pasted spreadsheet/CSV of properties into rows. Understands common
 *  exports (incl. Redfin's "Download All"), using latitude/longitude columns
 *  directly when present and building a full address from separate city/state
 *  columns. */
export function parseProperties(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const delim = lines[0].includes('\t') ? '\t' : ',';

  const first = splitLine(lines[0], delim).map((h) => h.toLowerCase());
  const hasHeader = first.some((h) => /address|status|type|name|phone|latitude|city/.test(h));
  const headers = hasHeader ? first : [];
  const body = hasHeader ? lines.slice(1) : lines;

  const col = (keys: string[]) => headers.findIndex((h) => keys.some((k) => h.includes(k)));
  const ai = col(['address', 'street']);
  const ci = col(['city']);
  const sti = col(['state', 'province']);
  const zi = col(['zip', 'postal']);
  const si = col(['status', 'stage', 'sale type']);
  const ti = col(['property type', 'type', 'category', 'class']);
  const ni = col(['name', 'owner', 'business']);
  const pi = col(['phone', 'mobile', 'cell']);
  const lati = col(['latitude', 'lat']);
  const lngi = col(['longitude', 'lng', 'lon']);

  return body
    .map((line) => {
      const c = splitLine(line, delim);
      const pick = (i: number) => (i >= 0 ? (c[i] ?? '').trim() : '');
      // Build the fullest address we can from whatever columns exist.
      let address: string;
      if (!hasHeader) address = line;
      else if (ci >= 0) address = [pick(ai) || c[0], pick(ci), [pick(sti), pick(zi)].filter(Boolean).join(' ')].filter(Boolean).join(', ');
      else address = pick(ai) || c[0] || '';

      const lat = lati >= 0 ? parseFloat(pick(lati)) : NaN;
      const lng = lngi >= 0 ? parseFloat(pick(lngi)) : NaN;
      const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);

      return {
        address: address.trim(),
        listingStatus: toListing(hasHeader ? pick(si) : line),
        category: toCategory(hasHeader ? pick(ti) : line),
        name: pick(ni) || undefined,
        phone: pick(pi) || undefined,
        lat: hasCoords ? lat : undefined,
        lng: hasCoords ? lng : undefined,
      } as ParsedRow;
    })
    .filter((r) => r.address && r.address.length > 4);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function ImportPropertiesModal({
  visible,
  onClose,
  onImport,
  team,
}: {
  visible: boolean;
  onClose: () => void;
  onImport: (doors: NewDoor[]) => Promise<number>;
  team: { id: string; name: string; role?: string }[];
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [assignTo, setAssignTo] = useState('');
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);

  const parsed = useMemo(() => parseProperties(text), [text]);
  const sample =
    'Address, Status, Type\n12 Oak St, Wayne, NJ, Pending, Residential\n55 Pompton Ave, Cedar Grove, NJ, Under Contract, Commercial';

  const submit = async () => {
    if (busy || parsed.length === 0) return;
    setBusy(true);
    setResult(null);
    const doors: NewDoor[] = [];
    for (let i = 0; i < parsed.length; i++) {
      setProgress({ done: i, total: parsed.length });
      const row = parsed[i];
      let { lat, lng } = row;
      // Coordinates already in the file (e.g. Redfin export) → use them directly.
      const needGeo = lat == null || lng == null;
      if (needGeo) {
        const geo = await geocodeAddress(row.address);
        if (geo) { lat = geo.lat; lng = geo.lng; }
      }
      if (lat != null && lng != null) {
        doors.push({
          address: row.address,
          lat,
          lng,
          name: row.name,
          phone: row.phone,
          category: row.category,
          listingStatus: row.listingStatus,
          repId: assignTo || undefined,
        });
      }
      // Only throttle when we actually hit the free geocoder.
      if (needGeo && i < parsed.length - 1) await sleep(1100);
    }
    setProgress(null);
    const added = await onImport(doors);
    setBusy(false);
    setResult({ added, skipped: parsed.length - doors.length });
    if (added > 0) setText('');
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Import a property list">
      <Text style={{ color: theme.color.muted, fontSize: theme.font.small }}>
        Paste a list from a spreadsheet or CSV — one property per line. Include an{' '}
        <Text style={{ fontWeight: '800' }}>Address</Text> column, and optionally{' '}
        <Text style={{ fontWeight: '800' }}>Status</Text> (For Sale, For Lease, Under Contract, Pending) and{' '}
        <Text style={{ fontWeight: '800' }}>Type</Text> (Residential/Commercial). Each address is placed on the map
        at its real location.
      </Text>
      <TextInput
        value={text}
        onChangeText={(t) => { setText(t); setResult(null); }}
        placeholder={sample}
        placeholderTextColor="#A9A9A9"
        multiline
        editable={!busy}
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
      {team.length ? (
        <ChipSelect
          label="Assign these doors to"
          options={['', ...team.map((t) => t.id)]}
          value={assignTo}
          onChange={setAssignTo}
          renderLabel={(id) => (id === '' ? 'Unassigned (shared)' : team.find((t) => t.id === id)?.name ?? id)}
        />
      ) : null}
      <Text style={{ color: theme.color.text, fontWeight: '700', fontSize: theme.font.small }}>
        {busy && progress
          ? `Adding properties… ${progress.done + 1} of ${progress.total}`
          : result
          ? `✓ Added ${result.added} to the map${result.skipped ? ` · ${result.skipped} couldn't be located` : ''}`
          : `${parsed.length} propert${parsed.length === 1 ? 'y' : 'ies'} detected`}
      </Text>
      {parsed.length > 60 && !busy ? (
        <Text style={{ color: theme.color.muted, fontSize: theme.font.tiny }}>
          Large lists are placed about one per second (free map service limit), so this can take a few minutes — keep this window open.
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="Close" variant="outline" onPress={onClose} style={{ flex: 1 }} />
        <Button
          title={busy ? 'Importing…' : `Import ${parsed.length || ''}`.trim()}
          variant="primary"
          icon="⇪"
          onPress={submit}
          style={{ flex: 1 }}
        />
      </View>
    </AppModal>
  );
}
