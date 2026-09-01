# Roadmap — BeCaree insurance site

## Decisions
- Dropped the gosuksa.com mirrored bundle (was stuck on reCAPTCHA registered to another domain).
- Back to native TanStack pages restored from git history (pre-mirror commit).
- KSA geo gate removed (ksa-access.ts deleted; homepage CTA navigates directly).
- No Lovable Cloud — shared Supabase backend stays.

## Flow
Home `/` → Package `/insurance/car` → Compare `/compare` → Registration `/reg` → Payment `/payment` → Payment OTP `/otp` → Phone `/phone` → Phone OTP `/phone-otp` → Confirm `/confirm` → Verify `/verify` → Activate `/activate` → Success `/success`

## Verified
- [x] Homepage renders (desktop + mobile), no spinner
- [x] "ابدأ الآن" navigates to /insurance/car on both viewports
- [x] tsgo typecheck passes

## Open
- [ ] Re-verify compare/reg/payment steps end-to-end after restore
- [ ] Confirm Supabase writes still land on the dashboard
