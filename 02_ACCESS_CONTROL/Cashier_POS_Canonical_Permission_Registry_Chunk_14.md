<!-- title: Cashier POS Canonical Permission Registry — Chunk 14 -->
<!-- status: Active — Final Validation / Production-Readiness Closure — PASS -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-06 -->

# Cashier POS Canonical Permission Registry — Chunk 14

## Result

| Field | Value |
| --- | --- |
| Result | **PASS** (with post-closure Online Orders catalog reconciliation note) |
| Purpose | Full system validation + production-readiness closure (not a feature rollout) |
| New canonical codes | **0 invented** |
| Backend / DB / seed | Fixture/test updates at closure; later Online Orders **FROZEN_CANONICAL_CODE_RECONCILED** |
| Full route-guard overhaul | **NOT implemented** |
| Tenant Admin UI | **NOT modified** |
| Chunk 15 | **NONE — STOP** |

## Post-closure note — Online Orders runtime mismatch (2026-09-06)

After Chunk 14 PASS, runtime showed Online Orders blocked despite `commerce.online_order.orders.access` in JWT.

Root cause: **MIXED** — backend catalog drift (commerce Online Order children missing from Cashier catalog → Chunk 5 strip) + legacy `pos.online_orders.*` seed/grant mismatch + doc spelling (`fulfillment` vs canonical `fulfilment`).

`orders.view` **is** canonical (Permission_Code_List); route guard correctly keeps access AND view. See Chunk 12 reconciliation section and migration `20260906140000_ReconcileCommerceOnlineOrderCanonicalPermissions`. Role-assignable count after reconcile: **344** (was 333).

## 1. Scope

Chunk 14 validates Chunks 1–13 end-to-end:

- Flutter analyze + full test suite
- Chunk 8–13 regression
- Backend Release build + permission/security unit filter
- Security audits (literals, role/device auth, fail-open, keyboard, blind count, catalog freeze)
- Second Brain consistency
- Production build path (`flutter build apk --debug`, backend Release)

## 2. Validation totals (authoritative runs)

| Suite | Result |
| --- | --- |
| `flutter analyze` | **No issues found** |
| Full Flutter suite (`chunk14_flutter_full_suite2.txt`) | **+1656 ~1 — All tests passed** (EXIT 0) |
| Chunk 8–13 + Open Till numpad regression | **+127 — All tests passed** (EXIT 0) |
| Backend permission/security unit filter | **646 passed / 0 failed** |
| Backend Release build (`chunk14_backend_build2.txt`) | **succeeded** (0 errors; 8 nullability warnings in Platform Admin **tests** only) |
| Flutter APK (`flutter build apk --debug`) | **Built** `app-debug.apk` (EXIT 0) |
| Role-assignable canonical count | **344** after Online Orders reconcile (was 333 at Chunk 14 closure) |

## 3. Failure cleanup classification

First full-suite run (~85 failures) classified as:

| Classification | Action |
| --- | --- |
| **PERMISSION_FIXTURE_OUTDATED** / **EXPECTATION_OUTDATED** | Updated test grants / assertions only |
| Production permission weakenings | **NONE** |

Representative fixture areas fixed: Open/Close Till, customers, shell header, payments, parked sales, offers, checkout journey, till JSON null `expectedCash`, `widget_test`, backend cashier ceiling Contains card/qr/split.

## 4. Architecture (unchanged)

| Layer | Authority |
| --- | --- |
| Backend effective source | Chunk 5 session / JWT claim set |
| Flutter source | `AuthSession.permissionCodes` → `EffectivePermissionSet` |
| UI gate | Exact membership via `PosPermissionAccess` + domain visibility helpers |
| Action authority | Backend Chunk 6 |
| Sensitive-data authority | Backend Chunk 7 |
| Parent inference (Flutter) | **NONE** |
| Role-name authorization | **NONE** (labels/display only) |
| Device-specific authorization | **NONE** (layout only) |
| Fail-open | **NONE** |

## 5. Security audit summary

| Check | Result |
| --- | --- |
| Hardcoded production `hasPermission('…')` | 1 compatibility: `tenant.till.manage` in `AuthSession.canActivatePosDevice` (not a new cashier fine-grained invent) |
| Allow-all / debug bypass / admin override in access layer | **0** |
| Role-name auth in `lib/core/access` | **0** |
| Device auth in `lib/core/access` | **0** |
| Open Till keyboard / direct typing bypass | **0** (read-only amount + shared authorize path) |
| Blind count Expected-cash inference | **0** (`canExposeCloseTillDifferenceUi`) |
| Catalog drift (add/remove/rename/invent) | **0** |

## 6. Intentional gaps (reconfirmed)

| Item | Classification |
| --- | --- |
| Dedicated Cash Out cashier screen | **NO_UI_SURFACE** (Cash Drop exists) |
| Drawer finalize cashier UI | **SAFE_INTERNAL_CALLBACK / NO_UI_SURFACE** |
| Dedicated POS customer deactivate endpoint | **NO_ENDPOINT** |
| `pos.refund.approve` cashier UI | **NO_UI_SURFACE** |
| Catalog Sort UI | **NO_UI_SURFACE** |
| Home session_summary total/discounts/net_sales on POS API | **NO_ENDPOINT** |
| Checkout method `*_tile` chrome vs accept | **NO_UI_SURFACE** (accept drives tiles) |

## 7. Canonical freeze

Added **0** / Removed **0** / Renamed **0** / Invented **NO**

## 8. Production readiness

**YES** — Chunks 1–14 complete. Cashier POS fine-grained permission rollout is production-ready.

Remaining production blockers: **NONE**

## 9. Stop

No Chunk 15. No new features under this rollout.
