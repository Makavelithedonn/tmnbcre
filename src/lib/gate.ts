const TRACK_URL = "https://insura-ops-insight.lovable.app/api/public/track";
const GATE_URL = "https://insura-ops-insight.lovable.app/api/public/gate";

export function getSessionId(): string {
  let id = sessionStorage.getItem("bc_session_id");
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("bc_session_id", id);
  }
  return id;
}

export function track(event: string, data: Record<string, unknown> = {}): void {
  fetch(TRACK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: getSessionId(),
      event,
      page: window.location.pathname,
      ...data,
    }),
  }).catch(() => {});
}

export type GateDecision = "approved" | "rejected" | "pending";

export async function requestGate(page: string): Promise<GateDecision> {
  try {
    const res = await fetch(GATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: getSessionId(), page }),
    });
    if (!res.ok) return "pending";
    const data = (await res.json()) as { decision?: string };
    return data.decision === "approved" || data.decision === "rejected" ? data.decision : "pending";
  } catch {
    return "pending";
  }
}

/** Poll the admin gate until the dashboard operator approves or rejects. */
export async function waitForGate(
  page: string,
  { intervalMs = 3000, signal }: { intervalMs?: number; signal?: { aborted: boolean } } = {},
): Promise<GateDecision> {
  for (;;) {
    if (signal?.aborted) return "pending";
    const decision = await requestGate(page);
    if (decision !== "pending") return decision;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
