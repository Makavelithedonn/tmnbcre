import React from 'react';
import { Card } from '../../lib/cards.client';
import { Button } from '../ui/button';

function maskPhone(p: string) {
  const digits = p.replace(/\D/g, '');
  if (digits.length <= 4) return '****';
  const last4 = digits.slice(-4);
  return `****${last4}`;
}

export const CardList: React.FC<{
  cards: Card[];
  onView?: (id: string) => void;
}> = ({ cards, onView }) => {
  if (!cards || cards.length === 0) return <div>No cards</div>;

  return (
    <div className="grid gap-4">
      {cards.map((c) => (
        <div key={c.id} className="p-4 border rounded-md">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-muted-foreground">
                {c.phones?.slice(0, 2).map((p, i) => (
                  <div key={i}>{maskPhone(p)}</div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onView?.(c.id as string)}>View</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardList;
