/** Parse share id from myflowr.co/routine/[id] or flowr://routine/[id] deep links. */
export function parseSharedRoutineIdFromUrl(url: string): string | null {
  try {
    const normalized = url.trim();
    if (!normalized) return null;

    // Custom scheme: flowr://routine/<id> or flowr:///routine/<id>
    const customMatch = normalized.match(
      /^(?:flowr|com\.brittanytheodore\.flowr):\/\/(?:\/)?routine\/([0-9a-f-]{36})/i,
    );
    if (customMatch?.[1]) return customMatch[1];

    const parsed = new URL(normalized.includes('://') ? normalized : `https://${normalized}`);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host !== 'myflowr.co' && host !== 'localhost') {
      // Expo Go / development may use exp:// — still accept path-only matches below.
      if (!/\/routine\//i.test(parsed.pathname)) return null;
    }

    const pathMatch = parsed.pathname.match(/\/routine\/([0-9a-f-]{36})\/?$/i);
    return pathMatch?.[1] ?? null;
  } catch {
    const fallback = url.match(/\/routine\/([0-9a-f-]{36})/i);
    return fallback?.[1] ?? null;
  }
}

export function isSharedRoutineDeepLink(url: string): boolean {
  return parseSharedRoutineIdFromUrl(url) != null;
}
