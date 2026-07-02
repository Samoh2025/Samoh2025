/**
 * Turn map coordinates into a street address using OpenStreetMap's free
 * Nominatim service. Runs in the user's browser (no API key). If it fails or
 * is rate-limited, we fall back to showing the coordinates so a door can still
 * be dropped and the rep can type the address in.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=json&zoom=18&addressdetails=1` +
      `&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(String(res.status));
    const data: any = await res.json();
    const a = data?.address ?? {};
    const line1 = [a.house_number, a.road].filter(Boolean).join(' ');
    const town = a.city || a.town || a.village || a.hamlet || a.suburb || a.county;
    const parts = [line1 || null, town || null, a.state || null].filter(Boolean);
    if (parts.length) return parts.join(', ');
    if (typeof data?.display_name === 'string') {
      return data.display_name.split(',').slice(0, 3).join(',').trim();
    }
  } catch {
    /* fall through to coordinates */
  }
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

/**
 * Turn a street address into map coordinates (forward geocoding via Nominatim).
 * Returns null if the address can't be found. Used when importing a list of
 * properties so each one drops on the map at its real location.
 *
 * Nominatim asks for no more than ~1 request/second, so callers should space
 * out bulk lookups (see the property import in the door-knock screen).
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const q = /nj|new jersey/i.test(address) ? address : `${address}, NJ, USA`;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(String(res.status));
    const data: any = await res.json();
    if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    /* not found */
  }
  return null;
}

