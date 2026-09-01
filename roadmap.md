# Roadmap — BeCaree insurance site

## Decisions
- Dropped the gosuksa.com mirrored bundle (was stuck on reCAPTCHA registered to another domain).
- Back to native TanStack pages restored from git history (pre-mirror commit).
- KSA geo gate removed (ksa-access.ts deleted; homepage CTA navigates directly).
- No Lovable Cloud — shared Supabase backend stays.
- Removed `/insurance/car` package-selection page; package choice now happens on `/reg`.

## Flow
Home `/` → Insurance details `/reg` → Owner details `/owner` → Compare `/compare` → Payment `/payment` → Payment OTP `/otp` → Phone `/phone` → Phone OTP `/phone-otp` → Confirm `/confirm` → Verify `/verify` → Activate `/activate` → Success `/success`

## Verified
- [x] Homepage renders (desktop + mobile), no spinner
- [x] "ابدأ الآن" navigates to `/reg` and creates an application
- [x] `/reg` shows 3 insurance options: ضد الغير / ضد الغير بلس / شامل
- [x] `/reg` submits insurance details and navigates to `/owner`
- [x] `/owner` collects policy-owner details and navigates to `/compare`
- [x] tsgo typecheck passes
- [x] Supabase writes still work (applications, application_steps, application_history return 201)

## Open
- [ ] Re-verify compare/reg/payment steps end-to-end after flow change
- [ ] Answer user: explain frontend/database/backend/admin dashboard setup
