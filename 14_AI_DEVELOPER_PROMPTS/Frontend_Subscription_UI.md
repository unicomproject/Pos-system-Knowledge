<!-- title: Frontend Subscription UI -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-17 -->

# Frontend Subscription UI — Implementation Notes

## Confirmed Implementation (2026-06-17)

Super Admin subscription plan management UI implemented in Angular platform
admin app.

## Rules for Future Changes

- Do not hardcode plans, modules, features, tab counts, or notification badges
- Use API service + model layer; no business data in component templates
- Keep existing dark blue sidebar and admin shell layout
- Routes use `/admin/subscriptions` prefix (not root `/subscriptions`)
- No payment checkout wording; use tenant pricing labels
- No "Modules & Features Seeded" wizard step
- No Release 2 e-commerce operational flow
- Backend is final authority for permissions and action flags

## Component Structure

```
features/admin/
  models/platform-subscription-plan.model.ts
  services/platform-subscription-plan-api.service.ts
  pages/platform-subscription-plans-page/
  pages/platform-create-subscription-plan-page/
```

## API

List integrated: `GET /api/v1/platform/subscription-plans`

Wizard create/publish/catalog methods exist with TODO stubs until backend ready.

## Related Files

- [[../07_UI_UX_KNOWLEDGE/Platform_Admin_Subscription_UI]]
- [[../09_ANGULAR_ADMIN_KNOWLEDGE/Subscription_UI_Implementation]]
