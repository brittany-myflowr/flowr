/** Parse share id from myflowr.co shared links or flowr:// deep links. */
export function parseSharedRoutineIdFromUrl(url: string): string | null {
  try {
    const normalized = url.trim();
    if (!normalized) return null;

    // Clipboard / deferred token pasted as a pseudo-URL
    if (normalized.startsWith('flowr-share:')) {
      const id = normalized.slice('flowr-share:'.length).trim();
      return /^[0-9a-f-]{36}$/i.test(id) ? id : null;
    }

    // Custom scheme: flowr://routine/<id> or flowr:///routine/<id>
    const customMatch = normalized.match(
      /^(?:flowr|com\.brittanytheodore\.flowr):\/\/(?:\/)?(?:routine|shared-routine)\/([0-9a-f-]{36})/i,
    );
    if (customMatch?.[1]) return customMatch[1];

    // flowr://shared-routine?id=<uuid>
    const customQuery = normalized.match(
      /^(?:flowr|com\.brittanytheodore\.flowr):\/\/(?:\/)?shared-routine\/?\?[^#]*id=([0-9a-f-]{36})/i,
    );
    if (customQuery?.[1]) return customQuery[1];

    const parsed = new URL(normalized.includes('://') ? normalized : `https://${normalized}`);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const isFlowrHost = host === 'myflowr.co' || host === 'localhost';

    const queryId = parsed.searchParams.get('id');
    if (queryId && /^[0-9a-f-]{36}$/i.test(queryId)) {
      if (isFlowrHost || /shared-routine|\/routine/i.test(parsed.pathname)) {
        return queryId;
      }
    }

    if (!isFlowrHost && !/\/routine\//i.test(parsed.pathname)) {
      return null;
    }

    const pathMatch = parsed.pathname.match(/\/routine\/([0-9a-f-]{36})\/?$/i);
    return pathMatch?.[1] ?? null;
  } catch {
    const queryFallback = url.match(/[?&]id=([0-9a-f-]{36})/i);
    if (queryFallback?.[1]) return queryFallback[1];
    const fallback = url.match(/\/routine\/([0-9a-f-]{36})/i);
    return fallback?.[1] ?? null;
  }
}

export function isSharedRoutineDeepLink(url: string): boolean {
  return parseSharedRoutineIdFromUrl(url) != null;
}
