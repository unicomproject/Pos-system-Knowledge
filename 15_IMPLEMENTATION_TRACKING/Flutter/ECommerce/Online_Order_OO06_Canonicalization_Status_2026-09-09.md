<!-- title: OO-06 Ready for Collection Canonicalization -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-09 -->

# OO-06 — Ready for Collection

OO-06 READY FOR COLLECTION — CHUNK 1 SECOND BRAIN CANONICALIZATION COMPLETE

OO-06 CHUNK 2 BACKEND/API/DB COMPLETE. Verified implementation and tests: [Chunk 2 evidence](Online_Order_OO06_Backend_Chunk2_2026-09-09.md). This closure supersedes the historical Chunk 1 gap assessment below; live authenticated HTTP/device acceptance is not claimed.
OO-06 CHUNK 3 FLUTTER / INTEGRATION — **PARTIAL** (see Chunk 3 section below). Flutter + authenticated READY GET/Notify/DB PASS; live Pixel Tablet OO-06 UI navigation pending re-login.

## Authority and journey

Documentation only. No source, database, migration, seed, permission implementation, commit or push. Existing dirty work is preserved. Source was inspected on 2026-09-09; no live runtime acceptance is claimed. No dedicated OO06 canonical specification/tracker was found; an existing Ready Flutter screen and historical prototype do exist. Older prototype numbering (OO06 Review & Pack / OO07 Ready) is superseded by OO05 Review & Pack / OO06 Ready for Collection.

OO04 Pick Order → OO04B Pick Item → all required picking complete → OO05 Review & Pack → Pack → Mark Ready → Fulfillment READY and Pickup READY → OO06 Ready for Collection → optional notification → customer arrives → authorized verification/handover → Collected/Completed.

Entry requires FulfillmentOrder.FulfillmentStatus = READY, PickupOrder.PickupStatus = READY, FulfillmentOrder.ReadyAt populated and PickupOrder.CollectedAt NULL. All-picked is not Packed; Packed is not Ready; Ready is not Collected. Non-ready deep links must refetch and recover to an existing valid detail/queue surface, never fabricate Ready. Inconsistent timestamps are an entry defect.

OO05 owns Pack and Ready, including FULFILLMENT_PACKED, FULFILLMENT_READY_FOR_COLLECTION and PICKUP_READY_FOR_COLLECTION events. OO06 never repeats these commands. Customer tracking uses SalesOrder.FulfillmentStatus = READY_FOR_COLLECTION (with SalesOrder.Status ACCEPTED in ApplyPosReadyForCollection), independent of notification. No identity/PIN/signature, handover, collection, payment, refund or cancellation mutation belongs to OO06.

## Contract documents

- [[Online_Order_OO06_Read_Manifest_2026-09-09]] — exact inspected Second Brain file list and documentation verification.

- [[Online_Order_OO06_Requirements_2026-09-09]] — 55 FR and 33 BR.
- [[Online_Order_OO06_UI_Contract_2026-09-09]] — 31 component classifications and 21 states; responsive, theme and accessibility requirements.
- [[Online_Order_OO06_Attribute_Inventory_2026-09-09]] — 97 attribute rows and derived values.
- [[Online_Order_OO06_Acceptance_Cases_2026-09-09]] — 58 Given/When/Then cases, all execution pending.

## Existing source owners and findings

| Owner | Inspected evidence / decision |
|---|---|
| Flutter lib/features/fulfilment_pickup/presentation/screens/ready_for_collection_screen.dart | Existing ReadyForCollectionScreen, ReadyForCollectionHero, ReadyOrderSummary; EXTEND, no new feature root |
| presentation/screens/pos_online_order_picking_screen.dart | Hosts Ready from picking provider; current picking-view gate is not canonical collection.view_ready enforcement |
| presentation/screens/review_pack_screen.dart | Reuse/extract private summary/progress patterns within feature; no copied shared shell |
| presentation/widgets/picking/picking_progress_metrics.dart | Existing picked metric is line-based; target effective-unit variant needs explicit adaptation |
| src/E_POS.Api/Controllers/V1/Tenant/ECommerce/ClickCollectOrdersController.cs | Existing API family; no dedicated Notify command found |
| src/E_POS.Application/Modules/ECommerce/CustomerOrders/Services/PosOnlineOrderPickingService.cs | Existing picking GET permission gate needs Ready-aware extension |
| src/E_POS.Infrastructure/Modules/ECommerce/CustomerOrders/Repositories/PosOnlineOrderPickingRepository.cs | GetAsync accepts PICKING/PACKED, rejects READY; missing pickup/ReadyAt/CollectedAt projection |
| Application/Modules/ECommerce/CustomerOrders/Services/PosOnlineOrderPackingService.cs and Infrastructure matching packing repository | Pack/Ready already implemented; no notification invocation in this path |
| Domain/Modules/ECommerce/FulfilmentPickup/Entities | Existing READY statuses, quantities, events; no duplicate status/table needed |

Paths beginning Application/Infrastructure/Domain are beneath backend src/E_POS.*; Flutter paths remain beneath the existing feature. Data flow remains Screen → Provider/Controller → Repository/Use Case → Remote Data Source → existing API; no Dio in widgets. Controller owns order/outlet, loading, notification operation and generation token. Backend owns recipient, actor, lifecycle and concurrency.

## API classification and errors

Base: /api/v1/tenant/ecommerce/click-collect/orders. Existing GET /{orderId}/picking?outletId={outletId}: EXTEND. READY support currently FAIL in source. Add Ready projection and permission-aware branch to existing GET, not a new Ready GET/API family. Include authoritative PickupStatus, ReadyAt, CollectedAt and notification result projection; do not reuse stale OO05 success alone. Existing POST /{orderId}/pack and POST /{orderId}/ready are upstream only. Existing details route /pos/online-orders/:orderId is REUSE.

Exact existing Notify endpoint: NONE. Chunk2 may add only the proven missing command within ClickCollectOrdersController, after service/permission audit; this document does not invent a live route or payload. Existing customer storefront notification GET is an inbox read, not a cashier Notify command. Legacy status PATCH must not be reused as notification.

Current controller error envelope: success=false, message, errorCode, errors, traceId. Preserve it; no invented response schema.

| Case (10) | Current evidence / target response |
|---|---|
| 400 | Existing invalid request fallback; safe correction |
| 401 | Invalid context/auth handling; no stale customer content |
| 403 | Permission/entitlement/tenant/outlet denial; hide/reflow actions |
| 404 | Not found; non-disclosing recovery |
| 409 invalid_state | Existing picking READY rejection; extend GET, refetch state conflicts |
| 409 concurrency | Refetch authoritative state; never local lifecycle overwrite |
| 422 | Not established for this controller; do not invent usage |
| 5xx | Safe retry and trace ID; no internal details |
| Timeout | Unknown Notify result; refresh/dedupe before retry |
| Offline/network | No fake success or offline collection/notification mutation |

## Notification audit — EXTEND with explicit GAPs

| Concern | Finding / classification |
|---|---|
| Shared owner | REUSE Application/Modules/Shared/Notification/Services/NotificationService.cs, CreateAsync |
| Event/template factory | REUSE Application/Modules/ECommerce/CustomerOrders/Notifications/ECommerceOrderNotificationFactory.cs; OrderStatusChanged READY_FOR_COLLECTION builds ecommerce.order_ready_for_collection |
| Recipient | Server order CustomerId; CUSTOMER recipient. No arbitrary client phone/email/customer ID |
| Channels | Verified customer IN_APP via InAppNotificationChannelHandler. RealtimeNotificationChannelHandler skips non-TenantUser; not customer push. Generic ACS email infrastructure is not evidence of ready-email/SMS/WhatsApp support |
| Channel choice | Existing registered handlers decide applicability; no new UI selector. IN_APP requires CustomerId, not email/phone |
| Content | Code-owned factory text/action URL; template/version tables exist but are not used by this inspected path |
| Persistence | notification_events + notification_messages + notification_inbox_items; event types/channels reused. IN_APP DELIVERED is inbox persistence, not customer reading or external delivery |
| Outbox | integration_outbox_messages exists for onboarding; no OO06 ready dispatcher found. Do not claim it is wired |
| Duplicate | EventNumber ECOM-ORDER-READY-{orderId:N}; unique TenantId/EventNumber; sequential repeat returns AlreadyExisted with CreatedMessageCount=0 |
| Retry/re-notify | No resend/cooldown policy implemented; repeat reuses existing event, not a resend. Parallel uniqueness-race handling and timeout result recovery are Chunk2 gaps. No exactly-once external-delivery promise |
| Missing wiring | GAP: cashier Notify endpoint, canonical permission enforcement, Ready-state revalidation, server notification projection, safe parallel dedupe and observable result |

A Notify action must revalidate tenant/outlet/ownership/READY, resolve recipient server-side, persist notification through the existing subsystem and return real outcome. It must not mutate FulfillmentStatus, PickupStatus, ReadyAt, CollectedAt or customer tracking. Failure cannot roll back the already committed Ready transition. Another cashier's notify/collect/cancel/complete requires authoritative refresh; stale route results must be discarded. Retry must follow deterministic dedupe, never invent a new event key to force dispatch.

## Permissions and security

Exact canonical catalog codes: commerce.online_order.orders.access, commerce.online_order.orders.view, commerce.online_order.collection.view_ready, commerce.online_order.collection.notify_customer. First two exist in existing order access flow; ready/notify codes are verified in Permission_Code_List but runtime constants/enforcement/grants were not found in inspected non-migration source. Their runtime provision is an explicit Chunk2 verification GAP, not claimed active.

View target requires access + view + view_ready; Notify additionally notify_customer. Details reuse orders.view within base access. Adjacent catalog permissions collection.mark_ready, collection.scan_qr, collection.validate_qr, collection.manual_lookup, collection.verify_items, collection.handover, collection.collect belong to other actions, not implicit OO06 authority. Prefix is commerce.online_order. for each.

| Role example | Permissions | Target authority |
|---|---|---|
| Cashier | Base access/view + view_ready | View only |
| Cashier | Above + notify_customer | View and notify |
| Manager | Same set as cashier | Same actions; no role bypass |
| Supervisor | Same set as cashier | Same actions; no role bypass |
| Any role | Missing view_ready / notify_customer | Deny corresponding capability |

Authentication, tenant isolation, activated outlet scope, authoritative order ownership and server actor are mandatory. No role-name checks, cross-tenant notification, client lifecycle authority or client collection authority. Show minimum customer display; no secrets/tokens/raw recipient logging. Permission removal reflows, not blank CTA space.

## Non-functional and implementation handoff

Use bounded current Click & Collect projection; avoid N+1/full event history (current issue-event aggregation needs bounding; notes already capped). Preserve fast tablet render, correlation/trace ID, order/fulfillment reference and action/result without unnecessary PII. Separate controller and notification service for tests. ServerTime anchors countdown, not device clock. Read-only cached display never authorizes mutation. Route/outlet change invalidates pending results.

Chunk2: extend READY GET/projection and permissions without weakening PICKING/PACKED gates; correct cancel-aware metrics; reuse notification service/factory; implement only missing Notify capability in existing family; verify recipient/channel/content/audit, parallel dedupe/retry, scope, terminal-state rejection and no lifecycle mutation with focused tests. No new table/column/migration is justified by current evidence; revisit only with concrete unavoidable evidence.

Chunk3: extend existing Ready screen and provider; reuse shell and summary/progress; implement informational guidance, real Notify, existing detail navigation, permission reflow and stale-response guards. Exclude print/share. Validate all tablet sizes, no-scroll, both tenant themes, accessibility, Flutter tests and safe Development runtime including independent customer tracking and notification result. Final runtime closure is pending.

## Chunk 3 — Flutter / integration / live runtime (2026-09-09)

Status: **PARTIAL** — Flutter OO-06 canonicalized and focused tests PASS; authenticated Development READY GET + Notify + DB verification PASS; Pixel Tablet live OO-06 screen navigation/screenshots NOT EXECUTED (emulator was on POS Home; cashier session must re-login to receive newly catalogued `view_ready` / `notify_customer` JWT claims).

### Screen / route / data owners

| Item | Value |
|---|---|
| Screen owner | `lib/features/fulfilment_pickup/presentation/screens/ready_for_collection_screen.dart` (EXTEND existing; no second OO-06 screen) |
| Host | `pos_online_order_picking_screen.dart` — READY routes to OO-06; back uses `_showReviewFromReady` without reversing Ready |
| Feature owner | `lib/features/fulfilment_pickup/` |
| Route | `/pos/online-orders/:orderId/picking` (READY projection hosted; not a separate path) |
| Provider | `pos_online_orders_provider.dart` — `posPickingOrderProvider`, `PosPickingActions.notifyCustomerOrderReady` |
| Repository | `pos_online_orders_repository_impl.dart` |
| Remote | `pos_online_orders_remote_datasource.dart` |
| READY GET | `GET /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/picking?outletId=` |
| Notify | `POST .../orders/{orderId}/notify-ready?outletId=` — empty body; no client recipient/channel |

### Frontend capability / reuse (Chunk 3)

REUSE-heavy: shell header/footer, metrics, summary, progress ring/legend, primary/secondary buttons, permission helpers, loading/error, theme tokens, request-generation guards on detail provider.

FEATURE-LOCAL: Ready Hero, What's Next (informational only), OO-06 composition.

EXCLUDED (absent, no placeholder gap): Print Collection Slip; Share Collection Info.

Permissions: `PosPermissionCodes.viewOnlineOrderReady` / `notifyOnlineOrderCustomer` via `PosPermissionAccess` — no role-name checks. Missing notify reflows (CTA hidden).

### Justified backend defect fixes required for live READY (outside Flutter-only boundary)

1. Cashier POS catalog lacked `commerce.online_order.collection.view_ready` and `.notify_customer` → JWT fail-closed even after DB grant. Added to `CashierPosCanonicalPermissionCatalog` (+ chunk2 JSON).
2. DEV seed/grant for those permission definitions + CASHIER role (DB).
3. READY GET 500: `EventPayloadJson.ToLower()` on jsonb → `lower(jsonb)` Postgres error in `PosOnlineOrderPickingRepository.GetAsync`. Fixed by evaluating issue payloads in memory.

### Live authenticated evidence (Development :5150)

| Check | Result |
|---|---|
| Order | `ECOMM-SEED-ACCEPTED-002` / `e0000101-0004-4000-8000-000000000001` |
| READY GET | PASS — Fulfillment READY, Pickup READY, ReadyAt set, CollectedAt null, `readyNotificationStatus=DELIVERED` |
| Notify POST | PASS — `alreadyExisted=true`, same `eventId` / `ECOM-ORDER-READY-E0000101000440008000000000000001` |
| DB after Notify | Fulfillment READY, Pickup READY, ReadyAt unchanged, row_version=5, CollectedAt NULL; 1 event, 1 message, 1 inbox |
| Duplicate logical event | NONE (count=1) |
| Device OO-06 UI | NOT EXECUTED — Pixel Tablet `emulator-5554` showed POS Home; evidence `test_evidence/oo06_ready_for_collection/00-pos-home-before-oo06-nav.png` |
| Reference image | `test_evidence/oo06_ready_for_collection/99-reference-oo06.png` |

### Flutter verification

| Check | Result |
|---|---|
| `flutter analyze` (fulfilment_pickup + access + endpoints) | No issues found |
| OO-06 focused tests | 12 passed / 0 failed / 0 skipped |
| OO-05 + OO-06 regression batch | 30 passed / 0 failed / 0 skipped |
| Full Flutter suite | NOT RUN |
| Fixed tablet widget sizes | 1280×800, 1180×820, 1100×700 — no overflow; no whole-page scroll at ≥1180 |
| Orange-like / Pink-like | PASS (widget tests) |
| git diff --check (Flutter) | PASS (CRLF warnings only) |

### Remaining blockers for COMPLETE

1. Cashier **re-login** on Pixel Tablet so JWT includes `collection.view_ready` + `collection.notify_customer`.
2. Open `ECOMM-SEED-ACCEPTED-002` through POS journey → capture live OO-06 screenshots (ready / notify / details).
3. Optional: customer-tracking projection API check proving READY before Notify (lifecycle already READY in DB independent of Notify).

Commit/push: NOT PERFORMED.

## Validation boundary

Documentation coverage is complete; implementation acceptance is not. READY GET source audit is FAIL as documented; runtime UI, notification and hardware tests were not run. This chunk only changes Second Brain Markdown. Existing OO05 completion evidence remains owned by its tracker; earlier OO05 Chunk1 API-gap wording is superseded by implemented source and latest tracker entry.
