<!-- title: OO-06 Ready for Collection — Requirements -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-09 -->

# OO-06 Ready for Collection — Requirements

Documentation-only acceptance contract; implementation and runtime verification remain pending. Parent: [[Online_Order_OO06_Canonicalization_Status_2026-09-09]].

## Functional requirements (55)

| ID | Requirement |
|---|---|
| FR-01 | Open Ready for Collection screen |
| FR-02 | Validate authoritative Ready state |
| FR-03 | Display back action |
| FR-04 | Display title: Ready for Collection |
| FR-05 | Display step: 3 of 3 |
| FR-06 | Display subtitle |
| FR-07 | Show Items metric |
| FR-08 | Show Picked metric |
| FR-09 | Show Remaining/Overdue metric |
| FR-10 | Show Units metric |
| FR-11 | Show ready-success hero |
| FR-12 | Show success icon |
| FR-13 | Show "All items picked and packed!" state |
| FR-14 | Show Ready for customer collection message |
| FR-15 | Show What's Next section |
| FR-16 | Show Customer Collection informational step |
| FR-17 | Show Verify Collection informational step |
| FR-18 | Show Complete Order informational step |
| FR-19 | Show Notify Customer CTA |
| FR-20 | Notification is optional |
| FR-21 | Notification success feedback |
| FR-22 | Notification failure feedback |
| FR-23 | Notification retry |
| FR-24 | Already-notified state if backend supports it |
| FR-25 | Show Order Summary |
| FR-26 | Show order number |
| FR-27 | Show current status |
| FR-28 | Show customer display |
| FR-29 | Show collection outlet |
| FR-30 | Show collection date/time |
| FR-31 | Show Remaining/Overdue |
| FR-32 | Show Order Progress |
| FR-33 | Show progress ring |
| FR-34 | Show Picked/Pending/Issues |
| FR-35 | Show semantic Ready banner |
| FR-36 | Show View Order Details |
| FR-37 | No Print Collection Slip |
| FR-38 | No Share Collection Info |
| FR-39 | Reuse current POS header |
| FR-40 | Reuse current POS footer |
| FR-41 | Loading state |
| FR-42 | Error state |
| FR-43 | Permission-aware actions |
| FR-44 | Permission-driven reflow |
| FR-45 | Route-order stale-response protection |
| FR-46 | Authoritative refetch |
| FR-47 | External lifecycle change handling |
| FR-48 | Collected externally handling |
| FR-49 | Cancelled/terminal-state handling |
| FR-50 | Fixed tablet 1280×800 |
| FR-51 | Whole-page scroll NONE |
| FR-52 | Internal target scroll NONE |
| FR-53 | Theme support |
| FR-54 | Accessibility |
| FR-55 | Real backend data only |

## Business rules (33)

| ID | Rule |
|---|---|
| BR-01 | Only authoritative READY state may render active OO-06. |
| BR-02 | Picked 100% alone does not imply Ready. |
| BR-03 | Packed alone does not imply Ready. |
| BR-04 | OO-05 owns Pack + Ready. |
| BR-05 | OO-06 does not normally Pack. |
| BR-06 | OO-06 does not normally call Ready. |
| BR-07 | READY != COLLECTED. |
| BR-08 | Customer notification does not mark Ready. |
| BR-09 | Customer notification does not mark Collected. |
| BR-10 | Notification failure does not rollback READY. |
| BR-11 | Notification success does not change READY lifecycle. |
| BR-12 | Customer tracking should reflect authoritative READY even if customer notification was not sent. |
| BR-13 | Customer notification recipient must be server-authoritative or follow current notification architecture. |
| BR-14 | No arbitrary recipient from frontend unless existing architecture requires it. |
| BR-15 | Tenant isolation required. |
| BR-16 | Outlet scope required. |
| BR-17 | Backend permission enforcement required. |
| BR-18 | Frontend permission gating = UX only. |
| BR-19 | No role-name checks. |
| BR-20 | Server time is authoritative. |
| BR-21 | ReadyAt is server-generated. |
| BR-22 | CollectedAt must remain NULL until handover. |
| BR-23 | Completed/Collected cannot return to active Ready flow. |
| BR-24 | Cancelled cannot show active Ready notification. |
| BR-25 | Another cashier may mutate lifecycle while screen is open. |
| BR-26 | Frontend must refetch authoritative state. |
| BR-27 | Duplicate Notify actions must follow canonical idempotency/re-notification rules. |
| BR-28 | No duplicate notification table solely for OO-06. |
| BR-29 | No duplicate Ready state table. |
| BR-30 | No client-side status mutation. |
| BR-31 | No client-side collected mutation. |
| BR-32 | No Print Collection Slip in this screen. |
| BR-33 | No Share Collection Info in this screen. |

## Interpretation

These are target requirements, not claims of implemented features. Missing READY GET/notification support is explicitly tracked in the parent. Existing metrics count picked lines; target effective units require an explicit compatible metric variant, never silently substitute line count for quantity. Effective quantity = requested minus cancelled; pending = max(effective minus picked, 0). An unresolved issue count must not be fabricated as zero. Collection countdown is time, not unpicked quantity.

