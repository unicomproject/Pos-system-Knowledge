<!-- title: Selected Tenant Setup Hub Status Model -->
<!-- status: Canonical / Locked -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->
<!-- lock_date: 2026-08-12 -->

# Selected Tenant Setup Hub Status Model

## Authority

Locks **GAP 4 — Setup hub status derivation**.

## Architecture decision (LOCKED)

**DERIVED STATUS ONLY.**

The Setup Hub **must not** persist a parallel `tenant_setup_status` or module checklist table for Selected-Tenant Mode in Release 1.

Status is calculated at read time from:

- Domain footprint counts
- Effective entitlements
- Plan limits
- Tenant lifecycle
- Caller permissions

## Status vocabulary

| Status | Meaning |
|---|---|
| `NOT_ENTITLED` | Module not on tenant plan / feature ineffective |
| `NOT_REQUIRED` | Module optional and bootstrap threshold already satisfied by system provisioning |
| `NOT_STARTED` | Entitled but zero qualifying domain records |
| `CONFIGURED` | Entitled and bootstrap threshold met |
| `BLOCKED` | Dependency or lifecycle prevents action (e.g. suspended, missing outlet) |

**`IN_PROGRESS` is NOT used** — no durable bootstrap draft model exists.

## Derivation rules

### Outlet Setup

| Condition | Status |
|---|---|
| Outlet module not entitled | `NOT_ENTITLED` |
| `activeOutletCount == 0` | `NOT_STARTED` |
| `activeOutletCount >= 1` | `CONFIGURED` |

**Count source:** `outlets` where `status = 'ACTIVE'` for tenant.

### Till Setup

| Condition | Status |
|---|---|
| POS/till module not entitled | `NOT_ENTITLED` |
| Entitled but `activeOutletCount == 0` | `BLOCKED` (dependency: outlet) |
| `activeOutletCount >= 1` and `activeTillCount == 0` | `NOT_STARTED` |
| `activeTillCount >= 1` | `CONFIGURED` |

### Roles & Permissions

| Condition | Status |
|---|---|
| Bootstrap Tenant Admin role provisioned at tenant create (always) | `NOT_REQUIRED` |
| `customRoleCount >= 1` (roles beyond system bootstrap TA role) | `CONFIGURED` |
| Otherwise | `NOT_REQUIRED` |

**Note:** Card copy: "Default TA role exists" — Configure still allowed for additional roles.

### Additional Users

| Condition | Status |
|---|---|
| `tenantUserCount == 1` (wizard TA only) | `NOT_STARTED` |
| `tenantUserCount > 1` | `CONFIGURED` |

Wizard Tenant Admin counts as 1.

### Product Onboarding

| Condition | Status |
|---|---|
| Product module not entitled | `NOT_ENTITLED` |
| `activeOrDraftProductCount == 0` | `NOT_STARTED` |
| `activeOrDraftProductCount >= 1` | `CONFIGURED` |

**Count:** `products` where `status IN ('ACTIVE','DRAFT')` and not archived.

### Online Store (hub card)

| Status | Always show |
|---|---|
| `DECISION_REQUIRED` / hidden | **Not rendered** in Selected-Tenant Phase 1 — e-commerce bootstrap OUT OF SCOPE |

## API response shape (`GET /bootstrap/summary`)

```json
{
  "modules": [
    {
      "moduleKey": "outlets",
      "status": "NOT_STARTED",
      "count": 0,
      "entitled": true,
      "canConfigure": true,
      "dependencyNotice": null
    }
  ]
}
```

## Persistence decision

| Question | Answer |
|---|---|
| Durable setup checklist table needed? | **NO** for Release 1 |
| Future persistence | Only if product approves cross-session bootstrap drafts — separate ADR |

## Hub refresh triggers

- After any bootstrap mutation success
- On tenant switch
- On hub re-entry
- On browser refresh (re-fetch summary)
