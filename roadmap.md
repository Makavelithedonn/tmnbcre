# BeCaree Public Site Roadmap

## Active Tasks
- [ ] Verify/fix database connectivity for workflow writes (anon role currently lacks INSERT/SELECT on `applications`)
- [ ] Answer user: which submitted data is not reflected on dashboard

## Completed
- Homepage redesign matching reference
- KSA access gate
- 40 realistic insurance offers
- Per-offer selection with Saudi ID/phone validation
- Workflow submission to Supabase tables

## Pending: Clone gosuksa-tmin flow (post-home only)
- Cannot access https://gosuksa-tmin.lovable.app/ from sandbox — reCAPTCHA + KSA-IP gate blocks Playwright and the website-fetch gateway.
- Waiting for user to upload the reference project files (zip) or per-step screenshots to clone the flow, pages, and prices.
- Scope: keep current homepage unchanged; edit only downstream pages.
