export type Card = {
  id?: string;
  name: string;
  phones: string[];
  createdAt?: string;
};

const BASE = (import.meta as any).env.VITE_CARDS_API_BASE || '/api/cards';
const API_KEY = (import.meta as any).env.VITE_CARDS_API_KEY || '';

async function request(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };
  if (API_KEY) headers['X-API-KEY'] = API_KEY;

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(body?.message || res.statusText);
    (err as any).status = res.status;
    (err as any).body = body;
    throw err;
  }
  return body;
}

export async function createCard(card: Card) {
  return request('/', {
    method: 'POST',
    body: JSON.stringify(card),
  }) as Promise<Card>;
}

export async function getCard(id: string) {
  return request(`/${encodeURIComponent(id)}`, { method: 'GET' }) as Promise<Card>;
}

export async function updateCard(id: string, card: Partial<Card>) {
  return request(`/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(card),
  }) as Promise<Card>;
}

export async function deleteCard(id: string) {
  return request(`/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function searchCards(q: string) {
  const qs = new URLSearchParams();
  if (q) qs.set('q', q);
  return request(`/search?${qs.toString()}`, { method: 'GET' }) as Promise<Card[]>;
}
