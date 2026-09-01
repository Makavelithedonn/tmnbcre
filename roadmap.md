# Roadmap — gosuksa.com clone

## Constraints
- Clone gosuksa.com exactly from the uploaded export. No new pages/fields/features/redesign.
- NO Lovable Cloud / Supabase / new backend. Reuse existing deployed API.
- Backend API base: `https://jb-end-production.up.railway.app` (Railway, per user).
  Configured via env `VITE_BACKEND_WS_URL` (see `.env.example`); the original
  bundle's compiled-in fallback (`doctamworkerme.mysemitgo.workers.dev`) is
  replaced at serve time by `src/routes/app-bundle[.]js.ts`.
  Endpoints observed:
  - `GET /api/vicinfomain/captcha`
  - `POST /api/vicinfomain/createRequest`
  - `GET /api/user/init`, `GET /api/chat/enabled`, `/breinit`
  - reCAPTCHA v3 site key + Turnstile site key from bundle
- Submissions must land in the existing admin dashboard → same endpoints, same payload shape.

## Tasks
- [ ] Inspect original export: routes, sections, forms, fields, copy, styles
- [ ] Port assets (logos, hero, icons) via lovable-assets
- [ ] Rebuild pages/routes in TanStack Start (RTL, Cairo font)
- [ ] Wire forms to existing API with identical request/response contract
- [ ] Responsive parity (mobile/desktop) + final visual comparison

## Fixes
- [x] Site stuck buffering: backend CORS rejected browser calls → all API traffic now
      routed same-origin through `/api-proxy/*` (`src/routes/api-proxy/$.ts`),
      which forwards to the Railway backend server-side.
- [x] Remove KSA-only restriction for now (geo gate bypassed via server-side proxy).
- [ ] BLOCKED (user-side): Railway backend must expose the REST routes the frontend
      calls — `/api/user/init`, `/api/vicinfomain/captcha`, `/api/vicinfomain/createRequest`,
      `/api/chat/enabled`, `/api/data/store-details`, `/api/store-policy`.
      Today it only serves `/`, `/health`, `/socket.io/*`. Once added, the existing
      `/api-proxy/*` forwarding works with no frontend changes.

## Open
- Homepage stuck on loading spinner: cloned gosuksa.com bundle initializes /api-proxy/breinit + /api/user/init OK, but the SPA never mounts past the spinner. Likely waiting on reCAPTCHA (key registered for gosuksa.com, fails on localhost / tamnbcare.online) or another gosuksa-only init check inside the compiled bundle.
- Remove KSA gate: /api-proxy/breinit already returns {ok:true} unconditionally; no other KSA gate remains in project code (src/lib/ksa-access.ts is unused now that / serves the mirrored shell).
- Do NOT use Lovable Cloud (per user).
- Unify mobile experience: the mirrored bundle already ships one responsive layout, but is blocked behind the spinner issue above.
