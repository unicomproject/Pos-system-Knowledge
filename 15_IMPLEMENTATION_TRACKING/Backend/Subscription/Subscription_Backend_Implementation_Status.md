<!-- title: Subscription Backend Implementation Status -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-22 -->

# Subscription Backend Implementation Status

## Summary

| Item | Value |
|---|---|
| Module | Platform Subscription Plans |
| Status | Release 1 draft/pricing/limits/publish flow complete |
| Latest update | 2026-06-22 (docs sync) |

## Status contract fix (2026-06-19)

- **Issue:** Publish/list responses returned `published` while DB stores `active`.
- **Fix:** `SubscriptionPlanMapper.ToApiStatus` now returns DB values (`draft`, `active`, `retired`).
- **Rule:** Backend must not return UI-only status aliases; frontend maps `active` → Published label.

## Verified endpoints

- `GET /api/v1/platform/subscription-plans`
- `POST /api/v1/platform/subscription-plans`
- `PATCH /api/v1/platform/subscription-plans/{planId}/pricing`
- `PATCH /api/v1/platform/subscription-plans/{planId}/limits` (added 2026-06-19)
- `POST /api/v1/platform/subscription-plans/{planId}/publish`

## Tests

- Unit tests: create, publish (response `active`), list item status `active`, pricing/limits update, permission/validation cases
- Build/test: **109/109 passed** after status contract fix (2026-06-19)

## Manual verification (2026-06-19)

Swagger/API flow on `http://localhost:5050`:

1. Platform login → JWT
2. POST create draft → `status: draft`
3. PATCH pricing → `base_price: 12900`
4. PATCH limits → `max_outlets/tills/users` saved
5. POST publish → `status: active`
6. GET list → item `status: active`

DB (`nytroz_pos_dev.subscription_plans`, plan `VERIFY-164143`):

- `base_price = 12900`, limits 5/10/25, `status = active`

## Remaining TODOs

- Module/feature catalog endpoints for wizard steps 2–3
- Archive/delete/duplicate plan write endpoints if required by list UI actions

## Related Files

- [[../../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../../../04_MODULE_KNOWLEDGE/Subscription/03_Technical_Contract]]
