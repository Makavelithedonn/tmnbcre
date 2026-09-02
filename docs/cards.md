Cards integration

Configuration

- VITE_CARDS_API_BASE - base URL for the Cloudflare Worker API (default: https://cards-api-worker.devopsjacob.workers.dev/cards)
- VITE_CARDS_API_KEY - optional API key sent as X-API-KEY header (frontend will send X-API-KEY if set)

CORS and auth

- The Worker currently does not add CORS headers. For browser calls, either enable CORS in the Worker or proxy requests through your server. The frontend does not automatically handle CORS.
- The Worker currently has no auth enforced. It's recommended to add an API key (e.g., check X-API-KEY) or use Cloudflare Access for production. If you want an API key enforced, the frontend will send VITE_CARDS_API_KEY as X-API-KEY.

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
