import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import CardDetail from '../../components/cards/CardDetail';
import type { Card } from '../../lib/cards.client';

export const Route = createFileRoute('/cards/$id')({
  component: CardDetailPage,
});

function CardDetailPage() {
  const { id } = Route.useParams();
  const [card, setCard] = useState<Card | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    import('../../lib/cards.client')
      .then(({ getCard }) => getCard(id))
      .then((c) => setCard(c))
      .catch(console.error);
  }, [id]);

  return (
    <div>
      <button className="mb-4 btn" onClick={() => navigate({ to: '..' })}>
        Back
      </button>
      <CardDetail card={card} onBack={() => navigate({ to: '..' })} />
    </div>
  );
}
