# Roadmap

- [x] Step progress bar (الخطوة X من 14) across the 14-page funnel
- [x] Registration form: removed email field, strict phone (05XXXXXXXX) and national ID (10 digits, starts 1/2) validation with inline errors
- [x] Payment form: card number (16 digits + Luhn), expiry MM/YY future date, CVV 3-4 digits with inline errors
- [x] Visitor tracking + admin gate client (src/lib/gate.ts) reporting to insura-ops-insight dashboard; page_view on every route change; submit/plan_select/card_submit events across funnel
