<!-- title: Subscription Plan Management Flow -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-17 -->

# Subscription Plan Management Flow

## Actor

Platform Admin / Super Admin with subscription plan permissions.

## Flow

1. Super Admin clicks **Subscriptions** in the left sidebar.
2. App navigates to `/admin/subscriptions` and loads plans from
   `GET /api/v1/platform/subscription-plans`.
3. Super Admin reviews tabs (All, Draft, Published, Archived) with counts from
   API `statusCounts`.
4. Super Admin applies filters (plan type, status, billing cycle, currency) and
   searches by plan name or code.
5. Super Admin reviews table rows, status badges, and action availability from
   API `can*` flags.
6. Super Admin clicks **Create Plan** to open `/admin/subscriptions/create`.
7. Super Admin completes wizard steps:
   - Basics
   - Modules
   - Features
   - Pricing
   - Limits
   - Review & Publish
8. Super Admin saves draft or publishes plan (publish requires backend create
   endpoint; UI scaffold in place).
9. Super Admin may archive or delete plans when API allows (action menu).

## Out of Scope

- Tenant subscription purchase flow
- Payment checkout UI
- Release 2 e-commerce operational flows

## Related Files

- [[../../07_UI_UX_KNOWLEDGE/Platform_Admin_Subscription_UI]]
- [[../../04_MODULE_KNOWLEDGE/Subscription/01_Module_Overview]]
