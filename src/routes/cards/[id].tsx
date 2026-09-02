import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCard, Card } from '../../lib/cards.client';
import CardDetail from '../../components/cards/CardDetail';

export default function CardDetailPage() {
  const params = (useParams as any)();
  const id = params.id as string;
  const [card, setCard] = useState<Card | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getCard(id).then((c) => setCard(c)).catch(console.error);
  }, [id]);

  return (
    <div>
      <button className="mb-4 btn" onClick={() => navigate(-1)}>
        Back
      </button>
      <CardDetail card={card} onBack={() => navigate(-1)} />
    </div>
  );
}
