<!-- title: Recommended Implementation Order -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->

# Recommended Implementation Order

**Audit date:** 2026-07-20  
**Rules:** P0 first; foundations before UI; contracts before FE; persistence before “done”; tests per feature; update SB after verify; no unrelated refactors; one feature per branch.

## Sequence overview

1. Fix P0 data-loss and planning-doc blockers.
2. Stand up e-commerce frontend against existing storefront APIs.
3. Complete Super Admin billing collection gap **or** formally scope it out.
4. Replace Super Admin stub reports / domain gaps.
5. Close Cashier non-cash and Tenant inventory placeholders.

---

## Work item 1 — Persist product alert/cost fields

| Field | Value |
|---|---|
| Priority | P0 |
| Branch | `fix/product-stock-alert-persistence` |
| Scope | Ensure cost, min/max stock, expiry alert days round-trip FE↔API↔DB |
| Repos | `Nytroz-POS-App`, `Unified-Commerce` |
| Areas | Flutter product create/edit DTOs; `TenantAdminProductsController`/service; product entity columns |
| Dependencies | Confirm DB columns in product tables |
| Acceptance | Values saved and returned on GET detail; rejected validation when invalid |
| Tests | Unit + ApiTests + Flutter widget/repo tests |
| SB updates | Product module status; `Full_Feature_Status_Index` |
| Excluded | Image CDN redesign; category module |

## Work item 2 — Refresh Second Brain status index

| Field | Value |
|---|---|
| Priority | P0 (planning) |
| Branch | `docs/refresh-full-feature-status-index` |
| Scope | Rewrite index rows to match live controllers; supersede ADR_006 |
| Repos | `Pos-system-Knowledge` |
| Acceptance | No “checkout not started”; ecommerce marked R1; ADR_006 archived/superseded |
| Tests | N/A (docs) |
| Excluded | Rewriting all archived SCS-TIX files in one PR |

## Work item 3 — E-commerce customer frontend MVP

| Field | Value |
|---|---|
| Priority | P0 |
| Branch | `feature/ecommerce-storefront-mvp` (new repo or existing when located) |
| Scope | Catalogue, cart, C&C checkout, guest/login, order confirmation against existing BE |
| Repos | New FE + `Unified-Commerce` (contract only if defect) |
| Dependencies | Tenant storefront seed; domain resolution |
| Acceptance | Guest can place C&C order; inventory reservation errors surfaced |
| Tests | Component + contract tests; smoke ApiTests |
| SB updates | E-commerce journeys; implementation tracking |
| Excluded | Wishlist/reviews polish; delivery |

## Work item 4 — Platform payment links (or explicit deferral)

| Field | Value |
|---|---|
| Priority | P1 |
| Branch | `feature/platform-billing-payment-links` **or** `docs/defer-payment-links` |
| Scope | If in R1: Application service + controller + Angular actions. If not: SB OUT_OF_SCOPE note only |
| Repos | Backend ± Platform Admin ± SB |
| Dependencies | Existing `SubscriptionPaymentLink` entity |
| Acceptance | Create/list/revoke link; or documented deferral with no UI affordance |
| Tests | ApiTests + Angular service specs |
| Excluded | Provider webhook automation, auto-suspend |

## Work item 5 — Super Admin reports read API + UI

| Field | Value |
|---|---|
| Priority | P1 |
| Branch | `feature/platform-reports-read` |
| Scope | Replace `AdminSectionPage` reports stub with real summary endpoints |
| Repos | `Unified-Commerce`, `Nytroz-POS-Platform_Admin` |
| Dependencies | Define minimal R1 report set (usage/subscription) |
| Acceptance | Permission-gated live data; empty/loading/error states |
| Tests | ApiTests + page/service specs |
| Excluded | Export/PDF; tenant operational reports (Flutter) |

## Work item 6 — Tenant reactivate + domain readiness

| Field | Value |
|---|---|
| Priority | P1 |
| Branch | `feature/tenant-reactivate-and-domain-readiness` |
| Scope | POST reactivate; document domain/SSL MVP or readiness checklist API |
| Repos | Backend, Platform Admin, SB |
| Excluded | Full ACME/SSL provider automation unless already designed |

## Work item 7 — Cashier card/QR path decision

| Field | Value |
|---|---|
| Priority | P0/P1 (product decision) |
| Branch | `feature/pos-card-qr-payments` or `docs/defer-noncash-pos` |
| Scope | Implement provider-backed flow **or** formal R1 deferral removing “Coming Soon” ambiguity |
| Repos | Flutter, Backend, SB |
| Excluded | Offline card finalization (excluded by scope) |

## Safe Super Admin-only order (if ecommerce owned elsewhere)

1. Docs deferral/payment-links decision (item 4).  
2. Platform reports (item 5).  
3. Tenant reactivate/domain (item 6).  
4. Remove or hide misleading `AdminSectionPage` nav items for outlets/products (ops live in Flutter).

## Related Files

- [[05_Release_1_Blockers]]
- [[01_Super_Admin_Feature_Status]]
- [[02_Super_Admin_API_Integration_Gaps]]
