# Roadmap — BeCaree insurance site

## Decisions
- Dropped the gosuksa.com mirrored bundle (was stuck on reCAPTCHA registered to another domain).
- Back to native TanStack pages restored from git history (pre-mirror commit).
- KSA geo gate removed (ksa-access.ts deleted; homepage CTA navigates directly).
- No Lovable Cloud — shared Supabase backend stays.
- Removed `/insurance/car` package-selection page; package choice now happens on `/reg`.

## Flow
Home `/` → Registration `/reg` → Compare `/compare` → Payment `/payment` → Payment OTP `/otp` → Phone `/phone` → Phone OTP `/phone-otp` → Confirm `/confirm` → Verify `/verify` → Activate `/activate` → Success `/success`

## Verified
- [x] Homepage renders (desktop + mobile), no spinner
- [x] tsgo typecheck passes

## Open
- [ ] Re-verify compare/reg/payment steps end-to-end after flow change
- [ ] Confirm Supabase writes still land on the dashboard
- [ ] Answer user: explain frontend/database/backend/admin dashboard setup
