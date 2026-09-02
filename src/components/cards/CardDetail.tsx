import React from 'react';
import { Card } from '../../lib/cards.client';
import { Button } from '../ui/button';

export const CardDetail: React.FC<{ card: Card | null; onBack?: () => void }> = ({ card, onBack }) => {
  if (!card) return <div>No card</div>;

  return (
    <div className="p-4 border rounded-md">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">{card.name}</h2>
          <div className="text-sm text-muted-foreground">Created: {card.createdAt ?? '—'}</div>
        </div>
        <div>
          <Button onClick={onBack}>Back</Button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-medium">Phone numbers</h3>
        <ul className="list-disc list-inside mt-2">
          {card.phones?.map((p, i) => (
            <li key={i} className="font-mono">{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CardDetail;
