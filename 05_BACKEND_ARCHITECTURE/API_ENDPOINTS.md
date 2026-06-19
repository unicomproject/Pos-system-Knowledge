<!-- title: Platform Subscription Plan API Endpoints -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-19 -->

# Platform Subscription Plan API Endpoints

Base route: `/api/v1/platform/subscription-plans`

All endpoints require platform JWT authentication.

## Endpoints

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/platform/subscription-plans` | `platform.subscription_plans.view` | List subscription plans |
| POST | `/api/v1/platform/subscription-plans` | `platform.subscription_plans.create` | Create draft plan |
| PATCH | `/api/v1/platform/subscription-plans/{planId}/pricing` | `platform.subscription_plans.edit` | Save draft `base_price` |
| PATCH | `/api/v1/platform/subscription-plans/{planId}/limits` | `platform.subscription_plans.edit` | Save draft outlet/till/user limits |
| POST | `/api/v1/platform/subscription-plans/{planId}/publish` | `platform.subscription_plans.edit` | Publish draft → DB `active` |

## Release 1 write flow

1. **Create draft** — basics fields on `subscription_plans`
2. **Update pricing** — `base_price` only, draft status required
3. **Update limits** — `max_outlets`, `max_tills`, `max_users`, draft status required
4. **Publish** — status `draft` → `active`; API response returns `status: active`

## Status contract

| Layer | Values |
|---|---|
| Database | `draft`, `active`, `retired` |
| API plan `status` field | Same DB values (no `published`/`archived` in responses) |
| Frontend labels | UI may show Published for `active`; backend does not |

Publish response example: `{ "status": "active", ... }`

## Limits request example

```json
{
  "maxOutlets": 5,
  "maxTills": 10,
  "maxUsers": 25
}
```

## Related Files

- [[../../04_MODULE_KNOWLEDGE/Subscription/03_Technical_Contract]]
- [[../../06_DATABASE_KNOWLEDGE/Subscription_Tables]]
