import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCard, getCard, searchCards } from '../lib/cards.client';

const mockFetch = (body: any, ok = true, status = 200) =>
  vi.fn(() => Promise.resolve({ ok, status, text: () => Promise.resolve(JSON.stringify(body)) } as any));

describe('cards.client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('createCard posts data and returns card', async () => {
    global.fetch = mockFetch({ id: '1', name: 'Alice', phones: ['+123'] }) as any;
    const res = await createCard({ name: 'Alice', phones: ['+123'] });
    expect(res.id).toBe('1');
  });

  it('getCard fetches by id', async () => {
    global.fetch = mockFetch({ id: '2', name: 'Bob', phones: [] }) as any;
    const res = await getCard('2');
    expect(res.name).toBe('Bob');
  });

  it('searchCards returns list', async () => {
    // Worker responds with { results: [...] }
    global.fetch = mockFetch({ results: [{ id: '3', name: 'C', phones: [] }] }) as any;
    const res = await searchCards('C');
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].id).toBe('3');
  });
});
