/**
 * Inject Open Graph meta into shared-routine pages so iMessage (and other
 * previews) show "[Name]'s [Routine]" with steps + schedule — not the static
 * "Shared routine" fallback. Applies to all user-agents (Apple's crawler is
 * not reliably detectable as a bot).
 */

const SUPABASE_URL = 'https://ayzrexnnqsxzausobhmb.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5enJleG5ucXN4emF1c29iaG1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNjM0MDcsImV4cCI6MjA5NTczOTQwN30.5WyhE7kK4A5i8o7P8m-AA2EqZBr0VaQXkPNLupq7h-I';

export const config = {
  matcher: ['/shared-routine', '/routine/:path*'],
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shareIdFromRequest(request) {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get('id');
  if (fromQuery && /^[0-9a-f-]{36}$/i.test(fromQuery)) return fromQuery;
  const match = url.pathname.match(/\/routine\/([0-9a-f-]{36})\/?$/i);
  return match ? match[1] : null;
}

function formatFrequency(frequency) {
  switch (frequency) {
    case 'daily':
      return 'Every day';
    case 'weekly':
      return 'Weekly';
    case 'biweekly':
      return 'Every 2 weeks';
    case 'monthly':
      return 'Monthly';
    case 'custom':
      return 'Custom';
    case 'cycle':
      return 'Cycle phase';
    default:
      return frequency || '';
  }
}

function formatTimeOfDay(timeOfDay) {
  if (!timeOfDay) return '';
  return timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1);
}

function formatSharedTitle(snapshot) {
  const name = (snapshot?.name ? String(snapshot.name) : '').trim() || 'Routine';
  const person = (snapshot?.sharedByFirstName ? String(snapshot.sharedByFirstName) : '').trim();
  if (!person) return name;
  return `${person}'s ${name}`;
}

function formatDescription(snapshot) {
  const steps = Array.isArray(snapshot?.steps) ? snapshot.steps : [];
  const stepLabel = `${steps.length} ${steps.length === 1 ? 'step' : 'steps'}`;
  const schedule = snapshot?.schedule || {};
  const frequency =
    schedule.frequency === 'custom'
      ? `Every ${schedule.customIntervalDays || 3} days`
      : formatFrequency(schedule.frequency);
  const timeOfDay = formatTimeOfDay(schedule.timeOfDay || snapshot?.timeOfDay);
  return [stepLabel, frequency, timeOfDay].filter(Boolean).join(' · ');
}

async function fetchSnapshot(shareId) {
  const endpoint =
    `${SUPABASE_URL}/rest/v1/shared_routines?id=eq.${encodeURIComponent(shareId)}&select=snapshot`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) return null;
  const rows = await response.json();
  return rows?.[0]?.snapshot ?? null;
}

function replaceMeta(html, attr, value) {
  const safe = escapeHtml(value);
  const named = new RegExp(
    `(<meta[^>]*(?:name|property)=["']${attr}["'][^>]*content=["'])([^"']*)(["'][^>]*>)`,
    'i',
  );
  if (named.test(html)) {
    return html.replace(named, `$1${safe}$3`);
  }
  return html.replace(
    '</head>',
    `  <meta property="${attr}" content="${safe}" />\n</head>`,
  );
}

function injectSocialMeta(html, { title, description, url, image }) {
  let next = html;
  next = next.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)} — flowr</title>`);
  next = replaceMeta(next, 'description', description);
  next = replaceMeta(next, 'og:title', title);
  next = replaceMeta(next, 'og:description', description);
  next = replaceMeta(next, 'og:url', url);
  next = replaceMeta(next, 'og:image', image);
  next = replaceMeta(next, 'twitter:title', title);
  next = replaceMeta(next, 'twitter:description', description);
  next = replaceMeta(next, 'twitter:image', image);
  return next;
}

export default async function middleware(request) {
  const shareId = shareIdFromRequest(request);
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  // Load the static page without re-entering this middleware (.html is not matched).
  const pageResponse = await fetch(new URL('/shared-routine.html', origin));
  if (!pageResponse.ok) {
    return pageResponse;
  }

  let html = await pageResponse.text();
  const canonical = shareId
    ? `${origin}/shared-routine?id=${encodeURIComponent(shareId)}`
    : `${origin}/shared-routine`;
  const image = `${origin}/assets/app-store-icon.png`;

  if (shareId) {
    try {
      const snapshot = await fetchSnapshot(shareId);
      if (snapshot) {
        html = injectSocialMeta(html, {
          title: formatSharedTitle(snapshot),
          description: formatDescription(snapshot),
          url: canonical,
          image,
        });
      }
    } catch {
      // keep static meta
    }
  }

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
