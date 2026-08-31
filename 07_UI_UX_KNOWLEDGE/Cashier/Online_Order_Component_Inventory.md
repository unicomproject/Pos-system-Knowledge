# Online Order Component Inventory

Status: **OO-01 TARGET CANONICALIZED; IMPLEMENTATION PENDING** · Scope: `POS-UJ-036` · Updated: 2026-08-27

## Governance

Apply [[../../08_FLUTTER_POS_KNOWLEDGE/Frontend_Reusable_Component_Governance]], [[../../08_FLUTTER_POS_KNOWLEDGE/Frontend_Engineering_Canonical_Standard]], [[../../07_UI_UX_KNOWLEDGE/Design_System]], and [[Online_Order_Prototype_Flow]]. The approved target supersedes earlier OO-01 table/tab/filter ownership notes. Canonical feature ownership is `lib/features/fulfilment_pickup/`; Chunk 3 must reconcile any existing competing `lib/features/online_orders/` implementation without duplicating functionality.

## Canonical OO-01 ownership (pending Chunk 3)

| Area | Production owner |
|---|---|
| Queue screen and responsive composition | `lib/features/fulfilment_pickup/presentation/screens/` |
| Page header, debounced search, six aggregate cards and responsive order-card list | `lib/features/fulfilment_pickup/presentation/widgets/` |
| Detail screen and detail composition | `presentation/screens/online_order_detail_screen.dart`, `presentation/widgets/online_order_detail_widgets.dart` |
| Start confirmation | `presentation/widgets/start_fulfilment_dialog.dart` |
| Picking workspace | `presentation/screens/pos_online_order_picking_screen.dart`, `presentation/widgets/picking_widgets.dart` |
| Review/pack and ready | `presentation/screens/review_pack_screen.dart`, `presentation/screens/ready_for_collection_screen.dart` |
| Shared feature UI tokens/status primitives | `presentation/widgets/online_order_ui.dart` |
| State/query coordination | `lib/features/fulfilment_pickup/presentation/providers/` |
| Use cases/entities/repository contract | `lib/features/fulfilment_pickup/domain/` |
| API/repository implementation | `lib/features/fulfilment_pickup/data/` |

| Component | Purpose | Screens | Inputs / states | Actions | Permission | API | Source / owner | Responsive / accessibility | Decision |
|---|---|---|---|---|---|---|---|---|---|
| POS shell | Shared header/navigation/session context | All | tenant, outlet, till, connectivity | navigate | existing shell policy | none | shared POS shell | landmark order; tablet/phone variants | REUSE |
| Order summary cards | Key order/value/time facts | OO-01,02,10,13 | counts, amount, promise, status | open | `commerce.online_order.orders.view` | queue/detail | shared summary-card pattern | wrap grid; semantic labels | EXTEND |
| Debounced search | Find queue orders | OO-01 | order/customer/phone/pickup reference; loading/empty-search | submit after debounce | `commerce.online_order.orders.access`, `commerce.online_order.orders.view` | list | shared search input + feature provider | semantic label; keyboard/touch | REUSE |
| Six status summary cards | Authoritative queue aggregates | OO-01 | New/Preparing/Ready/Delayed/Collected/Cancelled counts | none | `.access`, `.view` | list summary | fulfilment-pickup feature | six across when possible; responsive wrap | NEW FEATURE-SPECIFIC |
| Online order card | Operational list entry | OO-01 | order/pickup, customer, window, count, status/payment, previews | chevron opens detail only | `.access`, `.view` | list/detail | fulfilment-pickup feature | horizontal tablet/desktop; stacked phone | NEW FEATURE-SPECIFIC |
| Countdown indicator | Delay/expiry visibility | OO-01,02,07,08,10,11 | backend timestamps; overdue states | none | read permission | response timestamps | shared time pattern | announced text; no color-only | EXTEND |
| Detail header and summary groups | Stable order context | OO-02–07,10–13 | order, collection, payment, items | back/refresh | contextual view | detail | online-order feature | sticky/contextual | NEW FEATURE-SPECIFIC |
| Start preparation dialog | Confirm start/assignment | OO-03 | outlet, reservation, assignee, pending/error | confirm/cancel | `.fulfilment.start` | start | shared confirmation dialog | focus trap, Esc/cancel | EXTEND |
| Picking progress/steps | Unit and line progress | OO-04–06 | required/picked/remaining; current step | select item | `.picking.view` | picking detail | online-order feature | compact progress + text | NEW FEATURE-SPECIFIC |
| Picking item/location card | Identify next work | OO-04–06 | media, product, variant, SKU, qty, location | open/confirm | contextual picking | detail/pick | product media + feature card | image alt/fallback | EXTEND |
| Barcode scan panel/manual entry | Capture item evidence | OO-05 | scanner status, entered barcode, match/mismatch | scan/manual submit | `.picking.scan`, `.picking.manual_entry` | pick | shared scanner capability | hardware/keyboard/touch; focus | EXTEND |
| Issue action and notes | Report unavailable item | OO-05 | reason, note, pending/error | report/cancel | `.picking.report_issue` | issue command | shared dialog/form | labelled fields, error summary | EXTEND |
| Review list/packing notes | Reconcile before package | OO-06 | picked/packed qty, notes, discrepancies | save | `.packing.view`, `.packing.pack` | packing | feature + shared list/form | responsive rows | NEW FEATURE-SPECIFIC |
| Package/staging card | Package identity and staging | OO-06,07,10,12,13 | package no., location, packed by/at, lines | view/retrieve | contextual | detail/pack | online-order feature | concise card; copy-safe IDs | NEW FEATURE-SPECIFIC |
| Ready/notification/print panel | Mark ready and communicate | OO-07 | ready eligibility, notification/print state | mark/notify/print | `commerce.online_order.collection.mark_ready`, `commerce.online_order.collection.notify_customer` | ready/notify; print integration | shared action patterns | independent failures | EXTEND |
| QR scanner/manual action | Capture pickup credential | OO-09 | permission, camera, scan, pending/error | validate/manual | `.collection.scan_qr` | validate | shared scanner | camera fallback and keyboard route | EXTEND |
| Validation result panels | Server result | OO-10,11 | success or reason codes | continue/retry/manual | `.collection.validate_qr` | validate | shared result-state pattern | icon+heading+message | EXTEND |
| Retrieve package/contents preview/checklist | Safe handover | OO-10,12 | packages, lines, quantities, checklist | verify/handover | `.verify_items`, `.handover`, `.collect` | detail/handover | online-order feature | tappable checklist, summary | NEW FEATURE-SPECIFIC |
| Cash due/payment panel | Collect remaining cash | OO-15A–D | due, received, change, pending/success/failure | submit/retry | `commerce.online_order.payment.accept_cash`, `commerce.online_order.payment.retry` | payment command | canonical POS cash-payment capability | numeric keyboard; double-submit lock | REUSE |
| Numeric input/quick amounts/change due | Tender assistance | OO-15B,C | currency, suggested amounts, validation | enter/select | `commerce.online_order.payment.accept_cash` | none until submit | shared payment components | large targets, locale currency | REUSE |
| Collection complete panel | Final evidence | OO-13 | order, pickup, paid, collector, time | return/print if allowed | read contextual | handover response | shared success pattern | screen-reader summary | EXTEND |
| Loading/empty/error/denied/not-entitled | Full state coverage | All | state-specific copy and recovery | retry/back | effective auth | relevant read | shared state components | never raw exceptions | REUSE |

## Reuse constraints

Do not duplicate shell/navigation, search/filter/pagination, status chips, loading/empty/error, dialogs, scanner, payment keypad/service, notification, printing or product-media infrastructure. New feature-specific components contain Online Order semantics only and compose shared primitives.

## Implementation gate

OO-01 target ownership is canonicalized but implementation is pending Chunk 3. The queue must not expose filters, tabs, sorting, table headers, Open/Start buttons or visible pagination. Existing source under a competing feature path is migration/reconciliation input, not proof that this target is complete. Downstream OO-02+ rows remain governed by their own implementation evidence.
