import { useLinkingURL } from 'expo-linking';
import { useEffect } from 'react';

import { isRecoveryDeepLink, establishRecoverySessionFromUrl } from '@/lib/supabase/recoveryLink';

/** Captures recovery deep links as early as possible, before route screens mount. */
export function RecoveryLinkHandler() {
  const url = useLinkingURL();

  useEffect(() => {
    if (!url || !isRecoveryDeepLink(url)) return;
    void establishRecoverySessionFromUrl(url);
  }, [url]);

  return null;
}
