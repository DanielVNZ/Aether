export type ConsentValue = 'granted' | 'denied';

export const CONSENT_KEY = 'analytics_consent';
const DISTINCT_ID_KEY = 'analytics_distinct_id';
const SESSION_EVENT_KEY = 'analytics_app_open_sent';

const MIXPANEL_TOKEN = '39c0a649e3f52c61fb688687ef94f04d';
let mixpanelReady = false;

export function getConsent(): ConsentValue | null {
  return localStorage.getItem(CONSENT_KEY) as ConsentValue | null;
}

function getOrCreateDistinctId(): string {
  const existing = localStorage.getItem(DISTINCT_ID_KEY);
  if (existing) return existing;
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `anon-${Math.random().toString(36).slice(2)}${Date.now()}`;
  localStorage.setItem(DISTINCT_ID_KEY, id);
  return id;
}

async function ensureMixpanel() {
  if (mixpanelReady) return;
  const token = MIXPANEL_TOKEN;
  if (!token) return;
  try {
    const mp = await import('mixpanel-browser');
    mp.default.init(token, {
      api_host: 'https://api.mixpanel.com',
      autocapture: false,
      track_pageview: false,
      persistence: 'localStorage',
      ip: false,
      debug: import.meta.env.DEV,
    });
    mp.default.identify(getOrCreateDistinctId());
    mixpanelReady = true;
    if (import.meta.env.DEV) {
      console.log('[analytics] mixpanel initialized');
    }
  } catch (err) {
    console.error('[analytics] failed to init mixpanel:', err);
  }
}

export async function initAnalytics() {
  if (getConsent() !== 'granted') return;
  await ensureMixpanel();
}

export async function trackAppOpen() {
  if (getConsent() !== 'granted') return;
  if (sessionStorage.getItem(SESSION_EVENT_KEY)) return;
  await ensureMixpanel();
  if (!mixpanelReady) return;
  const mp = (await import('mixpanel-browser')).default;
  if (import.meta.env.DEV) {
    console.log('[analytics] sending app_open');
  }
  mp.track('app_open');
  sessionStorage.setItem(SESSION_EVENT_KEY, '1');
}

export function recordConsent(value: ConsentValue) {
  localStorage.setItem(CONSENT_KEY, value);
}

export async function setConsent(value: ConsentValue) {
  recordConsent(value);
  if (value === 'granted') {
    await initAnalytics();
    await trackAppOpen();
    return;
  }

  sessionStorage.removeItem(SESSION_EVENT_KEY);
  try {
    const mp = (await import('mixpanel-browser')).default;
    mp.opt_out_tracking();
  } catch {
    // no-op
  }
}
