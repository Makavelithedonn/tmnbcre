Cards integration

Configuration

- VITE_CARDS_API_BASE - base URL for the Cloudflare Worker API (default: https://cards-api-worker.devopsjacob.workers.dev/cards)
- VITE_CARDS_API_KEY - optional API token; if set the frontend will send it as an Authorization: Bearer <token> header

CORS and auth

- The Worker currently does not add CORS headers. For browser calls, either enable CORS in the Worker or proxy requests through your server. The frontend does not automatically handle CORS.
- The Worker currently has no auth enforced. For production it's recommended to require an Authorization: Bearer token (WORKER_API_TOKEN). If you set VITE_CARDS_API_KEY in the frontend environment, the client will send it as Authorization: Bearer <token>.

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
