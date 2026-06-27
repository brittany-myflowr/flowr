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
  if (hashIndex !== -1 && !params.access_token && !params.code && !params.token_hash) {
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

export async function establishRecoverySessionFromUrl(
  url?: string | null,
): Promise<string | null> {
  if (url && isRecoveryDeepLink(url)) {
    const params = parseAuthParamsFromUrl(url);
    const { access_token: accessToken, refresh_token: refreshToken, code, token_hash: tokenHash } =
      params;

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) return mapAuthError(error.message);
      return null;
    }

    if (tokenHash) {
      const { error } = await supabase.auth.verifyOtp({
        type: 'recovery',
        token_hash: tokenHash,
      });
      if (error) return mapAuthError(error.message);
      return null;
    }

    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) return mapAuthError(error.message);
      return null;
    }
  }

  const { data } = await supabase.auth.getSession();
  if (data.session) return null;

  return 'This reset link is invalid or has expired.';
}
