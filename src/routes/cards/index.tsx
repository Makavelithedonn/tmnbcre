import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import CardForm from '../../components/cards/CardForm';
import CardList from '../../components/cards/CardList';
import type { Card } from '../../lib/cards.client';

export const Route = createFileRoute('/cards/')({
  component: CardsPage,
});

function CardsPage() {
  const [q, setQ] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<Card | null>(null);

  async function load(qs = '') {
    try {
      const { searchCards } = await import('../../lib/cards.client');
      const res = await searchCards(qs);
      setCards(res || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cards</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium">Create</h2>
          <CardForm onCreated={() => load()} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or phone"
              className="border p-2 rounded w-full"
            />
            <button className="btn" onClick={() => load(q)}>
              Search
            </button>
          </div>

          <CardList
            cards={cards}
            onView={async (id) => {
              const { getCard } = await import('../../lib/cards.client');
              const c = await getCard(id);
              setSelected(c);
            }}
          />

          {selected && (
            <div className="mt-4">
              <h3 className="font-medium">Detail</h3>
              <div className="mt-2 p-4 border rounded">
                <div className="font-semibold">{selected.name}</div>
                <div className="mt-2">
                  {selected.phones.map((p, i) => (
                    <div key={i} className="text-sm font-mono">
                      {p}
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <button className="btn" onClick={() => setSelected(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
