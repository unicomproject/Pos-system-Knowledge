<!-- title: Cashier POS Canonical Permission Registry — Chunk 1 -->
<!-- status: Active — Foundation Only -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-04 -->

# Cashier POS Canonical Permission Registry — Chunk 1

## Scope and authority

This is the Chunk 1 mapping authority for the Cashier POS fine-grained permission
programme. It does not seed permissions, assign roles, change effective-permission
resolution, alter route/API authorization, or hide/show Flutter controls.

The naming authority remains [[Permission_Code_List]] and
[[CANONICAL_MODULE_FEATURE_PERMISSION_CATALOG_R1]]:

`domain.module.feature.action`

Every canonical user permission has exactly four lowercase dot-separated tiers.
Existing approved codes are reused even when a requested UI label uses another
name. Responsive Phone, Tablet and Desktop layouts consume the same permission;
device names never become permission-code prefixes.

## Verified requested inventory

The A–V Cashier checklist contains 369 requested rows and 366 unique capability
codes. Three repeated rows are normalized to one capability each:

| Repeated requested code | Occurrences | Canonical treatment |
| --- | ---: | --- |
| `cash_drawer.view` | 2 | One capability |
| `sales.park.reference.view` | 2 | One capability |
| `sales.park.cancel` | 2 | One capability |

Unique inventory by requested prefix:

| Prefix | Count |
| --- | ---: |
| `pos` | 26 |
| `notifications` | 10 |
| `auth` | 7 |
| `sales` | 109 |
| `returns` | 1 |
| `cash_drawer` | 59 |
| `orders` | 1 |
| `payments` | 52 |
| `receipt` | 17 |
| `customers` | 41 |
| `till` | 43 |
| **Total** | **366** |

The audit text's `payments.process` is an explicitly rejected umbrella-code
example, not a requested checklist capability, and is therefore excluded. This
confirms the 366-count baseline. No requested entry was silently discarded; only
the three identical repeats were de-duplicated.

## Verified classification totals

| Classification | Count |
| --- | ---: |
| EXACT | 8 |
| EQUIVALENT_EXISTING | 56 |
| NEW_REQUIRED | 14 |
| SPLIT_REQUIRED | 280 |
| DOCUMENTED_ONLY | 1 |
| INVALID_AS_USER_PERMISSION | 7 |
| **Total** | **366** |

The previous `OVER_BROAD=287` bucket consisted of 280 authenticated capabilities
that require future splits plus the seven pre-auth Login controls. Chunk 1
correctly separates those controls as `INVALID_AS_USER_PERMISSION`.

## Registry row contract

Every normalized capability is represented by the A–V inventory entry plus the
following mandatory metadata. Domain tables below define the common metadata and
the exception tables define canonical mappings; together they form the registry.

| Field | Rule |
| --- | --- |
| `requestedCapability` | Human-readable control/action represented by the requested code |
| `requestedPermissionCode` | Normalized unique requested A–V code |
| `canonicalPermissionCode` | Existing approved code, or proposed four-tier child code |
| `module` | Shell, Notifications, Sales, Payments, Customers, Receipts, Cash Drawer, or Till |
| `feature` | Business feature, never a device/layout variant |
| `screen` | Owning route/screen; `global` for shell controls |
| `section` | Owning card/panel/section |
| `controlType` | route, section, value, action, input, navigation, status, or message |
| `permissionType` | business, sensitive-data, presentation, mutation, or pre-auth configuration |
| `existingOrNew` | existing, proposed-child, documented-only, or not-user-permission |
| `classification` | EXACT, EQUIVALENT_EXISTING, NEW_REQUIRED, SPLIT_REQUIRED, DOCUMENTED_ONLY, or INVALID_AS_USER_PERMISSION |
| `parentPermission` | Existing business permission that owns the child capability |
| `backendRequired` | YES for protected data/mutations; NO for purely local presentation |
| `frontendRequired` | YES for every authenticated requested UI capability |
| `routeGuardRequired` | YES only for independently navigable protected screens |
| `sensitiveData` | YES for the sensitive-value inventory below |
| `deviceScope` | `all` for authenticated POS capabilities |
| `notes` | Equivalence, dependency, or deferral rationale |

## Existing canonical permissions to reuse

| Requested capability family | Canonical permission | Classification / decision |
| --- | --- | --- |
| POS Home route and dashboard | `pos.sales.dashboard.view` | EQUIVALENT_EXISTING — reuse |
| New Sale route | `pos.sales.new_sale.view` | EQUIVALENT_EXISTING — reuse |
| Create sale | `pos.sales.new_sale.create` | EQUIVALENT_EXISTING — reuse |
| Product catalog | `pos.sales.catalog.view` | EQUIVALENT_EXISTING — reuse |
| Product search/scanner lookup | `pos.sales.catalog.search` | EQUIVALENT_EXISTING — reuse |
| Cart add/update/remove/clear | `pos.sales.cart.{add_item|update_item|remove_item|clear}` | EQUIVALENT_EXISTING — reuse actions; do not duplicate umbrella aliases |
| Proceed/checkout/complete sale | `pos.sales.checkout.execute` | EQUIVALENT_EXISTING — shared authoritative mutation parent |
| Apply discount | `pos.sales.manual_discount.apply` | EQUIVALENT_EXISTING — reuse |
| Park sale | `pos.sales.held_sales.create` | EQUIVALENT_EXISTING — reuse |
| View parked sales | `pos.sales.held_sales.view` | EQUIVALENT_EXISTING — reuse |
| Recall parked sale | `pos.sales.held_sales.recall` | EQUIVALENT_EXISTING — reuse |
| Cash payment | `pos.payments.cash.accept` | EQUIVALENT_EXISTING — reuse |
| Card payment | `pos.payments.card.accept` | EQUIVALENT_EXISTING — reuse |
| QR payment | `pos.payments.qr.accept` | EQUIVALENT_EXISTING — reuse |
| Split payment | `pos.payments.split.accept` | EQUIVALENT_EXISTING — reuse |
| Payment success/receipt view | `pos.receipts.digital.view` | EQUIVALENT_EXISTING — reuse |
| Print receipt | `pos.receipts.physical.print` | EQUIVALENT_EXISTING — reuse |
| Reprint receipt | `pos.receipts.history.reprint` | EQUIVALENT_EXISTING — reuse |
| Customers view | `pos.customers.management.view` | EQUIVALENT_EXISTING — reuse |
| Customers create | `pos.customers.management.create` | EQUIVALENT_EXISTING — reuse |
| Customers edit | `pos.customers.management.update` | EQUIVALENT_EXISTING — reuse |
| Notification inbox | `pos.notifications.alerts.view` | EQUIVALENT_EXISTING parent; child granularity requires split |
| Cash drawer view | `pos.cash_drawer.dashboard.view` | EQUIVALENT_EXISTING — reuse |
| Cash movement | `pos.cash_drawer.movements.create` | EQUIVALENT_EXISTING parent; movement-type split required |
| Physical drawer open | `pos.cash_drawer.physical.open` | EQUIVALENT_EXISTING — reuse |
| Till session view | `pos.tills.session.view` | EQUIVALENT_EXISTING — reuse |
| Open till | `pos.tills.session.open` | EQUIVALENT_EXISTING — reuse |
| Close till | `pos.tills.session.close` | EQUIVALENT_EXISTING — reuse |

Legacy two/three-tier Flutter and seed aliases remain compatibility inputs only.
They are not new canonical permissions and must not be copied into the registry.

## Classification overlay for the complete A–V inventory

The requested code is not automatically the canonical code. Apply these rules in
order to every normalized inventory entry:

1. The seven `auth.login.*` controls are `INVALID_AS_USER_PERMISSION`.
2. An exact current four-tier canonical match with identical meaning is `EXACT`.
3. A row represented by one reusable business permission above is
   `EQUIVALENT_EXISTING`.
4. A separately configurable child beneath an existing business permission is
   `SPLIT_REQUIRED`; its canonical proposal must use four tiers.
5. A capability with no semantic parent is `NEW_REQUIRED`.
6. A Second Brain-only code absent from production is `DOCUMENTED_ONLY`.

The old `OVER_BROAD` label maps to `SPLIT_REQUIRED`; it is not permission
approval. Proposed children remain registry-only until a later migration/seed,
assignment and enforcement chunk implements them.

## Proposed child namespaces (not yet seeded)

| Module | Canonical parent | Child feature namespace | Type / reason |
| --- | --- | --- | --- |
| POS shell | `pos.sales.dashboard.view` | `pos.shell.topbar.*`, `pos.shell.bottom_nav.*`, `pos.shell.navigation.*` | SPLIT_REQUIRED — independently configured shell presentation/navigation |
| Notifications | `pos.notifications.alerts.view` | `pos.notifications.panel.*`, `pos.notifications.messages.*` | SPLIT_REQUIRED — list fields and actions require independent policy |
| Home | `pos.sales.dashboard.view` | `pos.home.profile.*`, `pos.home.session_summary.*` | SPLIT_REQUIRED — profile/metric visibility |
| Catalog | `pos.sales.catalog.view` | `pos.catalog.product_card.*`, `pos.catalog.product_detail.*` | SPLIT_REQUIRED — requested fields and actions |
| Cart | `pos.sales.cart.*` | `pos.cart.summary.*`, `pos.cart.lines.*` | SPLIT_REQUIRED — view/value granularity separate from mutation parents |
| Held sales | `pos.sales.held_sales.*` | `pos.held_sales.details.*`, `pos.held_sales.filters.*` | SPLIT_REQUIRED — requested fields, filters and pagination |
| Checkout | `pos.sales.checkout.execute` | `pos.checkout.summary.*`, `pos.checkout.customer.*` | SPLIT_REQUIRED — sensitive summary/customer presentation |
| Cash | `pos.payments.cash.accept` | `pos.cash_payment.tender.*`, `pos.cash_payment.controls.*` | SPLIT_REQUIRED — Exact, Quick Amounts, Numpad, Backspace, Clear and change visibility |
| Receipt | `pos.receipts.digital.view` | `pos.receipts.details.*` | SPLIT_REQUIRED — independently governed receipt fields |
| Customers | `pos.customers.management.*` | `pos.customers.sensitive.*`, `pos.customers.history.*` | SPLIT_REQUIRED — PII and commercial history |
| Cash drawer | `pos.cash_drawer.dashboard.view` | `pos.cash_drawer.summary.*`, `pos.cash_drawer.movement_fields.*` | SPLIT_REQUIRED — cash-sensitive values |
| Cash movement | `pos.cash_drawer.movements.create` | `pos.cash_movements.cash_in.*`, `pos.cash_movements.cash_out.*`, `pos.cash_movements.cash_drop.*` | SPLIT_REQUIRED — independent mutation workflows |
| Till | `pos.tills.session.{open|close}` | `pos.tills.opening.*`, `pos.tills.closing.*` | SPLIT_REQUIRED — input/action/value separation |

Names ending in `*` above are namespaces, not wildcard grants and not permission
definitions. Exact leaf approval belongs to the later catalogue/migration chunk.

## Parent/child hierarchy

```text
pos.sales.dashboard.view
├── pos.shell.topbar.*
├── pos.shell.bottom_nav.*
├── pos.home.profile.*
└── pos.home.session_summary.*

pos.notifications.alerts.view
├── pos.notifications.panel.*
└── pos.notifications.messages.*

pos.sales.checkout.execute
├── pos.checkout.summary.*
└── pos.checkout.customer.*

pos.payments.cash.accept
├── pos.cash_payment.tender.exact
├── pos.cash_payment.tender.quick_amount
├── pos.cash_payment.controls.numpad
├── pos.cash_payment.controls.backspace
├── pos.cash_payment.controls.clear
├── pos.cash_payment.tender.change_view
└── pos.sales.checkout.execute (completion mutation dependency)

pos.customers.management.view
├── pos.customers.sensitive.phone_view
├── pos.customers.sensitive.email_view
├── pos.customers.sensitive.spend_view
└── pos.customers.history.purchase_view

pos.cash_drawer.dashboard.view
├── pos.cash_drawer.summary.opening_cash
├── pos.cash_drawer.summary.expected_cash
└── pos.cash_drawer.movement_fields.amount_view

pos.tills.session.open
└── pos.tills.opening.*

pos.tills.session.close
└── pos.tills.closing.*
```

Parent metadata is declarative in Chunk 1. Runtime dependency enforcement is
explicitly deferred.

## Sensitive-data classification

The following requested values have `sensitiveData=YES`, `backendRequired=YES`
when returned by an API, and `frontendRequired=YES`: customer phone/email/spend/
purchase history; expected/opening/counted cash; movement amount; discounts; net
sales; cash received; change due; and receipt/customer/payment details. A parent
screen permission does not automatically authorize every sensitive child in the
target model.

## Pre-auth exception

`auth.login.view`, branding, email input, password input, password visibility,
submit and validation-message visibility are not logged-in cashier permissions.
They are pre-auth application, tenant-branding, security and device-activation
configuration. Assigning them through cashier roles would be circular and is
forbidden.

## Chunk 1 completion boundary

Completed here: current-source audit, unique inventory count, duplicate removal,
naming rule, existing-equivalence map, proposed split namespaces, hierarchy,
sensitive-data flags, pre-auth exception and multi-device rule.

**Chunk 2 status:** exact leaf codes, hierarchy, sensitive metadata, and
machine catalogs are finalized in
[[Cashier_POS_Canonical_Permission_Registry_Chunk_2]]. Runtime enforcement,
seeds, role assignment, and UI gating remain deferred to Chunk 3+.

Deferred originally to Chunk 2+: approval of every proposed leaf code; backend
constants and catalogue records — **now completed in Chunk 2**. Still deferred:
migrations/seeds; role/user assignment; dependency resolver; Flutter visibility
and route guards; API/service authorization; DTO field filtering; Tenant Admin
configuration UI; runtime and multi-device acceptance.

No runtime enforcement claim is made by this document.
