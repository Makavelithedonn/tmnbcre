Cards integration

Configuration

- VITE_CARDS_API_BASE - base URL for the Cloudflare Worker API (default: https://cards-api-worker.devopsjacob.workers.dev/cards)
- VITE_CARDS_API_KEY - required API token for production; if set the frontend will send it as X-API-KEY header

CORS and auth

- The Worker now handles CORS (including OPTIONS preflight). For browser calls you must ensure the frontend origin is allowed by the Worker.
- The Worker requires an X-API-KEY header in production. Set VITE_CARDS_API_KEY in your hosting/CI environment (Vercel/Netlify/Github Actions) to the WORKER_API_KEY secret and the frontend will send it automatically.

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
