<!-- title: Open Questions -->
<!-- status: Draft -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->

# Open Questions

## Purpose

Track decisions that must be confirmed without inventing production behavior.
Normative documentation keeps safe defaults until an owner records a decision.

## Hardware Decisions

| ID | Question | Why required | Current safe position | Owner/status |
|---|---|---|---|---|
| HW-01 | Which Card provider and terminal model are approved? | Card execution/certification | Provider unavailable; Card blocked | Product/Security â€” Open |
| HW-02 | How is production Local Agent HTTPS certificate issued/rotated/trusted? | Release Android blocks clear-text | Private debug HTTP only; production not ready | Security/Operations â€” Open |
| HW-03 | Are direct Android USB and Bluetooth printers required for MVP? | Adapter/platform scope | Unsupported/unverified | Product/Hardware â€” Open |
| HW-04 | Is direct TCP printer support a committed production transport? | Security/acceptance | Separate adapter; no Agent fallback | Product/Hardware â€” Open |
| HW-05 | What Tamil/Unicode strategy is approved? | Single-byte generators degrade text | Unsupported glyphs may be `?`; not ready | Product/UX/Hardware â€” Open |
| HW-06 | What is the customer/merchant copy policy and configuration owner? | Multi-copy orchestration/paper use | One customer, zero merchant snapshot | Product/Finance â€” Open |
| HW-07 | Is a distinct merchant-copy or sensitive-reprint permission required? | Access/audit | Existing print/reprint permissions only | Security/Product â€” Open |
| HW-08 | Which drawer pin and pulse on/off timing apply per printer/drawer? | Safe `ESC p` execution | No pulse implemented | Hardware â€” Open |
| HW-09 | When may Cash payment, Split Cash, Cash refund and no-sale open pulse drawer? | Financial control | No automatic/manual pulse implemented | Finance/Product â€” Open |
| HW-10 | Does manual drawer open require manager approval and which reason policy? | Fraud/audit control | Permission/reason/approval TBD | Finance/Security â€” Open |
| HW-11 | How long are hardware-test evidence and Local Agent operations retained? | Support/compliance | Agent operations default 30 days; evidence TBD | Operations/Compliance â€” Open |
| HW-12 | What numeric stability/performance targets apply? | Timeouts, scan rate, receipt size | Use bounded configurable behavior; SLA TBD | Product/QA â€” Open |
| HW-13 | Which barcode symbologies are officially supported? | Scanner/printer acceptance | Exact string lookup; physical formats unapproved | Product/Hardware â€” Open |
| HW-14 | May assigned printer/drawer/terminal change during an active shift? | Reconciliation/audit | Silent change prohibited | Finance/Operations â€” Open |
| HW-15 | What digital-only/no-print policy applies per tenant/outlet/document? | Receipt compliance/operations | No persisted policy found | Product/Legal â€” Open |
| HW-16 | Which return/refund/exchange/till reports require physical copies? | Contract/acceptance | Not production-complete | Finance/Product â€” Open |
| HW-17 | What offline receipt/drawer behavior is approved? | Network-loss safety | Card/refund/final close blocked; hardware E2E incomplete | Architecture/Product â€” Open |
| HW-18 | Should the two manual ESC/POS generators be consolidated? | Drift risk | Each owns separate transport | Architecture â€” Open |

## Decision Recording Rule

Each resolved question must record decision date, approver, affected module,
security/business consequences, migration/configuration impact, rollout,
automated/physical acceptance, and related ADR when architectural.

Do not resolve a question from implementation accident, mock/test code, package
presence or assumed printer/provider capability.

## Confirmed Architecture Reference

Physical Android POS â†’ private LAN â†’ Windows Local Print Agent â†’ Windows RAW
spooler â†’ laptop USB printer is already documented as the current receipt path.
This file does not reopen that implementation fact; production HTTPS/deployment
and wider transport policy remain open.

## Related Files

- [[../12_INTEGRATIONS/POS_Hardware_Integration]]
- [[../12_INTEGRATIONS/Receipt_Printer_Integration]]
- [[../12_INTEGRATIONS/Cash_Drawer_Integration]]
- [[../12_INTEGRATIONS/Card_Reader_Integration]]
- [[../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Implementation_Status]]

<!-- RBAC_HARDENING_2026_08_15_START -->
## Tenant Admin RBAC Open Decisions / Gaps - 2026-08-15

| ID | Item | Status |
|---|---|---|
| RBAC-001 | Explicit deny semantics and precedence. | OPEN_DECISION |
| RBAC-002 | Last-admin/super-admin protection rules for tenant role changes. | IMPLEMENTATION_GAP |
| RBAC-003 | Role mutation idempotency and optimistic concurrency policy. | OPEN_DECISION |
| RBAC-004 | Whether outlet-scoped permissions are embedded in session context or resolved per resource request. | OPEN_DECISION |
| RBAC-005 | Role template update/sync policy for existing tenant roles. | OPEN_DECISION |
| RBAC-006 | Permission cache invalidation strategy after role/user/entitlement changes. | IMPLEMENTATION_GAP |
| RBAC-007 | Tenant Admin `/roles` and `/permission-catalog` backend endpoints. | IMPLEMENTATION_GAP |
<!-- RBAC_HARDENING_2026_08_15_END -->

## Product Setup Initial Tracking — 2026-08-24

| ID | Question | Why required | Current safe position | Owner/status |
|---|---|---|---|---|
| PRODUCT-TRACK-001 | Where is VARIANT initial identity assigned? | Parent Product must not own variant inventory | LOCKED: Option 2. Assign at Step 7 via `initialTrackingAssignedVariantId`. Step 4 remains matrix-only. | Product/Inventory — Resolved 2026-08-24 |
| PRODUCT-TRACK-002 | Exact `serial_numbers.serial_status` / `product_batches.status` token for identity-without-stock | Publish must not imply received quantity | Do not invent Product-level serial semantics. Map to existing inventory constants; `current_inventory_balance_id` and `received_at` stay NULL until receiving. | Inventory implementation — OPEN mapping, not an ownership blocker |
| PRODUCT-PERM-001 | Which Product Setup permission namespace is canonical? | Dual `catalog.*` vs `tenant.products.*` is unsafe | LOCKED: `catalog.*` only; one-way map from `tenant.products.*` during compatibility window | Access/Product — Resolved 2026-08-24 |
| PRODUCT-PERM-002 | Which entitlement codes are runtime vs docs? | Docs mixed `product_catalog` / `product_management` / `inventory_tracking` / `inventory_management` | LOCKED: runtime `product_catalog` + `inventory_tracking`; `product_management` is module_code; `inventory_management` is docs group | Access/Product — Resolved 2026-08-24 |
| PRODUCT-PERM-003 | Does Initial Tracking require stock.adjust? | Identity without quantity | LOCKED: Product Setup create/update + `inventory_tracking`; never `inventory.stock.adjust` | Access/Inventory — Resolved 2026-08-24 |

Authority: [[PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP1_DECISION_2026-08-24]].

