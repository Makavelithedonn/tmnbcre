Cards integration

Configuration

- VITE_CARDS_API_BASE - base URL for the Cloudflare Worker API (e.g. https://api.example.workers.dev/cards)
- VITE_CARDS_API_KEY - optional API key sent as X-API-KEY header

Client

- src/lib/cards.client.ts exports: createCard, getCard, updateCard, deleteCard, searchCards

UI

- src/components/cards/CardForm.tsx - form to create a card (name + multiple phones)
- src/components/cards/CardList.tsx - list view (masks phone numbers)
- src/components/cards/CardDetail.tsx - detail view (shows full phone numbers)
- Pages: src/routes/cards/index.tsx and src/routes/cards/[id].tsx

Security

- Do NOT store encryption keys in the frontend. The Worker encrypts phone numbers server-side. Frontend sends plaintext over HTTPS.

Testing

- Tests live under src/__tests__ and use vitest + testing-library. Add dev dependencies and run `npm test` to run them locally.

Auth

- If the backend requires an API key, set VITE_CARDS_API_KEY in your environment or hosting config.
