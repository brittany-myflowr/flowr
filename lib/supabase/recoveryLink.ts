import { supabase } from '@/constants/supabase';

import { mapAuthError } from './errors';

export function isRecoveryDeepLink(url: string): boolean {
  const normalized = url.toLowerCase();
  return (
    normalized.includes('reset-password') ||
    normalized.includes('type=recovery') ||
    normalized.includes('type%3drecovery')
  );
}

export function parseAuthParamsFromUrl(url: string): Record<string, string> {
  const params: Record<string, string> = {};

  const addPairs = (segment: string) => {
    for (const pair of segment.split('&')) {
      if (!pair) continue;
      const [key, ...rest] = pair.split('=');
      if (!key) continue;
      params[decodeURIComponent(key)] = decodeURIComponent(rest.join('='));
    }
  };

  const hashIndex = url.indexOf('#');
  if (hashIndex !== -1) {
    addPairs(url.slice(hashIndex + 1));
  }

  const queryIndex = url.indexOf('?');
  if (queryIndex !== -1) {
    const queryEnd = hashIndex !== -1 ? hashIndex : url.length;
    addPairs(url.slice(queryIndex + 1, queryEnd));
  }

  // Some parsers drop hash fragments; normalize and re-read query params.
  if (hashIndex !== -1 && !params.code) {
    try {
      const normalized = url.replace('#', '?');
      const parsed = new URL(normalized);
      parsed.searchParams.forEach((value, key) => {
        params[key] = value;
      });
    } catch {
      // Ignore malformed URLs.
    }
  }

  return params;
}

/**
 * Establish a recovery session only via PKCE code exchange.
 * Existing sessions and raw access/refresh tokens in the URL are not accepted.
 */
export async function establishRecoverySessionFromUrl(
  url?: string | null,
): Promise<string | null> {
  if (!url || !isRecoveryDeepLink(url)) {
    return 'This reset link is invalid or has expired.';
  }

  const params = parseAuthParamsFromUrl(url);
  const code = params.code?.trim();
  if (!code) {
    return 'This reset link is invalid or has expired.';
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return mapAuthError(error.message);
  return null;
}
