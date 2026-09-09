<!-- title: Cashier POS Canonical Permission Registry — Chunk 4 -->
<!-- status: Active — Tenant/Role/User Assignment Architecture; Resolver Deferred -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-04 -->

# Cashier POS Canonical Permission Registry — Chunk 4

## Scope

Chunk 4 makes **role-assignable** Cashier POS canonical permissions safely
assignable through the **existing** Tenant Admin tenant → role → user
permission architecture.

This chunk does **not** implement:

- Chunk 5 effective-permission resolver
- POS session permission loading
- Flutter PermissionGate / runtime visibility
- POS business endpoint `HasPermission` checks
- Sensitive DTO filtering
- Tenant Admin Flutter UI redesign
- New EF schema migration (none required)

Canonical codes remain frozen from Chunk 2/3
([[Cashier_POS_Canonical_Permission_Registry_Chunk_2]],
[[Cashier_POS_Canonical_Permission_Registry_Chunk_3]]).

Machine rules: `CashierPosPermissionAssignmentRules` +
`CashierPosPermissionCodeTaxonomy` +
`CashierPosCanonicalPermissionCatalog`.

---

## 1. Assignment architecture (verified)

```
Tenant feature entitlement
        ↓
Role permission replace-set (tenant_role_permissions)
        ↓
Optional user grant overrides (tenant_user_permissions) — grant-only
        ↓
(Future) Chunk 5 effective-permission resolution
```

| Layer | Model |
| --- | --- |
| Permission definitions | Global `permission_definitions` (Chunk 3 seeded 333 role-assignable) |
| Tenant availability | Feature entitlement + assignable catalog query (pre-auth filtered) |
| Role grants | Soft-history replace-set on `tenant_role_permissions` |
| User grants | Optional **extra grants** via `OverriddenPermissionIds` |
| User denies | **Not supported** — `DeniedPermissionIds` rejected |
| Revocation | Soft revoke (`RevokedAt` / `RevokedBy`); reactivate on re-grant |
| Audit | Actor + timestamps on grant/reactivate/revoke; user audit events |
| Entitlement | Existing assignable-by-code / validation paths |
| Membership | Existing tenant user ↔ role / outlet role assignments |

---

## 2. Canonical validation (ongoing)

Before any mutation:

1. Forbidden tokens (`*`, `/`, whitespace, `..`, leading/trailing `.`) → reject
2. Pre-auth (`pre_auth.*` / catalog PreAuth) → reject from role/user assignment
3. Managed namespace (`pos.*` / `commerce.*`) must be catalog role-assignable four-tier **or** known legacy alias
4. Unknown four-tier POS/commerce codes → reject
5. Parent rule for **new** child grants (see §4)
6. Then existing DB assignable + entitlement + delegation ceiling

Wildcards/shorthand may appear in docs only — never persisted.

---

## 3. Role permission assignment

| Operation | Contract |
| --- | --- |
| List | Existing GET role permissions / catalog |
| Grant/Revoke | **Replace-set** via `PUT .../roles/{id}/permissions` (`ReplacePermissionsAsync`) |
| Bulk | Same replace-set; entire target validated before mutation |
| Semantics | Calculate keep / reactivate / revoke / insert |
| Idempotency | Re-grant reactivates; duplicate active rows not inserted |
| Empty set | Rejected (role must retain ≥1 permission) |
| System roles | Existing editable/system guards preserved |
| Cashier ceiling | Legacy aliases + Online Order picking + all 333 role-assignable codes |

**No permanent parent→all-children auto-grant** on ongoing assignment
(Chunk 3 backfill was one-time only).

Catalog responses may include optional metadata: `ParentCode`, `IsSensitive`,
`SemanticType` (from catalog, not DB columns). Pre-auth excluded from
assignable/catalog lists.

---

## 4. Parent / child assignment rule (OPTION A)

**Chosen rule for new grants:** reject child if required parent is not in the
target assignment set.

Example:

- Parent: `pos.payments.cash.accept`
- Child: `pos.cash_payment.tender.exact`

| Scenario | Behaviour |
| --- | --- |
| Child without parent (new) | Reject — `tenant_roles.parent_permission_required` / user equivalent |
| Parent + child | Allowed |
| Revoke one child, keep parent + sibling | Allowed (child independence) |
| Revoke parent, leave children stored | Allowed — orphans may remain stored; Chunk 5 makes them ineffective |

Clients assign permission **codes** only — they do not mutate the hierarchy graph.

---

## 5. User override semantics

| Capability | Supported? |
| --- | --- |
| Direct grant override | YES — `OverriddenPermissionIds` replace-set when override enabled |
| Explicit deny / revoke override | NO — `DeniedPermissionIds` rejected |
| Role inheritance interaction at assignment time | Parent check uses **override set only** (role grants are not merged into available parents during user validation) |
| Tenant validation | Existing same-tenant role/user lookups |
| Canonical validation | Same `CashierPosPermissionAssignmentRules` as roles |

**Chunk 5 note:** resolver must treat user overrides as grant-only extras over
role grants; deny-override is out of scope until product adds it.

---

## 6. Tenant isolation & entitlement

- All role/user mutations are scoped by request `tenantId`.
- Cross-tenant role/user IDs resolve as not found / inaccessible (no existence leak).
- Entitlement: existing `GetAssignablePermissionsByCodeAsync` /
  user assignable validation rejects codes outside tenant feature entitlement
  (typically surfaces as delegation ceiling / not assignable).
- No device-specific permission codes (`phone.pos.*` forbidden pattern).

---

## 7. Pre-auth exclusion (blocking)

These seven codes remain outside normal role/user assignment:

- `pre_auth.login.screen.view`
- `pre_auth.login.branding.view`
- `pre_auth.login.email.input`
- `pre_auth.login.password.input`
- `pre_auth.login.password_visibility.toggle`
- `pre_auth.login.submit.execute`
- `pre_auth.login.validation.message`

Error: `tenant_roles.pre_auth_permission_not_assignable` /
`user.pre_auth_permission_not_assignable`.

---

## 8. Fine-grained independence

Independently assignable when parent dependency is satisfied:

- `pos.payments.cash.accept` / `card` / `qr` / `split` (four payment methods)
- Cash children e.g. Exact Cash, Numpad
- Sensitive children e.g. `pos.customers.list.phone`,
  `pos.cash_drawer.summary.expected_cash`
- Notification message children e.g. `pos.notifications.messages.body`

Revoking one child does **not** revoke siblings or parent.

---

## 9. Error codes (role / user)

| Scenario | Role error | Mutation |
| --- | --- | --- |
| Invalid format / wildcard / slash | `tenant_roles.invalid_permission_format` | No |
| Unknown canonical | `tenant_roles.unknown_permission` | No |
| Pre-auth | `tenant_roles.pre_auth_permission_not_assignable` | No |
| Missing parent (new child) | `tenant_roles.parent_permission_required` | No |
| Not entitled / not assignable / ceiling | existing delegation / not-assignable | No |
| Empty role permission set | `tenant_roles.validation_failed` | No |
| Cross-tenant | not found / inaccessible | No |

User mapping uses `user.invalid_permission_format`,
`user.pre_auth_permission_not_assignable`, `user.unknown_permission`,
`user.parent_permission_required`.

---

## 10. Multi-device rule

Assignments are tenant/role/user capabilities. One canonical grant applies to
Phone, Tablet, and Desktop. Device-specific UI belongs to later Flutter chunks.

---

## 11. Deferred work (Chunk 5+)

1. Effective permission resolver:
   `effective(child) = effective(parent) AND effective(child)`
2. Session / login permission loading using resolver
3. Runtime Flutter visibility / PermissionGate
4. Sensitive DTO filtering
5. Optional: count role-granted parents when validating user child overrides
6. Optional: product deny-override model (not present today)

---

## 12. Tests

Primary: `CashierPosChunk4PermissionAssignmentTests`

Covers format rejection, all 7 pre-auth codes, unknown codes, Cash/Card/QR/Split
independence, parent/child OPTION A, orphan retention after parent revoke,
sibling independence, cashier ceiling includes catalog, sensitive metadata,
and replace-set rejection without repository mutation.
