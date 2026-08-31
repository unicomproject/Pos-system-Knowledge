<!-- title: ADR 007 Canonical 4-Tier Permission Code Strategy -->
<!-- status: Accepted -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-27 -->

# ADR 007: Canonical 4-Tier Permission Code Strategy

## Status

**Accepted** (Supersedes prior Draft from 2026-06-08)

## Context

Previous permission-code definitions across the OneVerz POS / Unified Commerce system evolved with mixed and inconsistent taxonomy depths:
- **2-Tier codes:** `sales.create`, `sales.checkout`, `returns.view`, `customers.view`, `inventory.adjust`
- **3-Tier codes:** `pos.home.view`, `pos.till.open`, `pos.till.close`, `payments.cash.accept`, `platform.tenants.create`, `tenant.tills.create`, `catalog.products.create`
- **4-Tier codes:** `commerce.online_order.picking.pick`, `commerce.online_order.collection.mark_ready`

This structural inconsistency caused:
1. **Ambiguity in Backend Authorization & Catalog Hierarchy:** Mismatches between the database catalog hierarchy (`platform_modules` → `platform_features` → `permission_definitions`) and code identifiers.
2. **Fragile Frontend & UI Guards:** Redundant alias checks in Flutter POS route guards (`PosPermissionAccess.newSaleAccessCodes = [viewNewSale, createSale]`), conflicting role-permission assignments, and unclear boundaries between platform admin, tenant admin, and cashier permissions.
3. **Impediment to Automated Tooling & Testing:** Inability to deterministically parse and validate permission scopes from code strings alone.

## Decision

We formally establish the **4-Tier Permission Taxonomy** as the single canonical standard across the entire OneVerz POS / Unified Commerce platform:

$$\text{Canonical Format: } \mathbf{domain.module.feature.action}$$

### 1. Taxonomy Definitions

| Level | Component | Definition | Canonical Examples |
|---|---|---|---|
| **1** | `domain` | High-level product, administrative, or commercial bounded context (lowercase noun). | `platform`, `tenant`, `catalog`, `pricing`, `inventory`, `pos`, `commerce` |
| **2** | `module` | Functional business module within the domain (lowercase, plural or domain noun). | `admin`, `tenants`, `subscription_plans`, `outlets`, `tills`, `products`, `departments`, `sales`, `payments`, `receipts`, `returns`, `refunds`, `exchanges`, `cash_drawer`, `online_order` |
| **3** | `feature` | Specific capability, operational sub-area, or resource surface within the module (lowercase noun/snake_case). | `dashboard`, `lifecycle`, `master`, `new_sale`, `cart`, `checkout`, `manual_discount`, `held_sales`, `session`, `physical`, `movements`, `picking`, `packing`, `collection` |
| **4** | `action` | Granular operation verb permitted on that feature. | `view`, `create`, `update`, `delete`, `manage`, `apply`, `approve`, `open`, `close`, `print`, `reprint`, `accept`, `pick`, `pack`, `publish`, `archive`, `duplicate`, `restore`, `import`, `assign` |

### 2. Core Governance Rules

1. **Strict 4-Tier Structure:** Every canonical permission code must have exactly four dot-separated segments.
2. **No Role Names in Codes:** Capability codes represent actions on resources and must never contain role names (e.g. anti-patterns `cashier.sale.create` or `manager.discount.approve` are strictly prohibited).
3. **Plural Resource Nouns:** Resource segments must use plural nouns (e.g. `tenants`, `products`, `departments`, `tills`, `subscription_plans`).
4. **No Monolithic Enums:** Permissions must not be collected into a single monolithic enum. Module-wise typed constants must be maintained in domain module folders (e.g. `SalesPermissionCodes.cs`, `CatalogPermissionCodes.cs`, `pos_access_codes.dart`).
5. **No Collapsed Umbrella Codes:** Implemented granular capability actions (such as subscription plan lifecycle or picking workflow) must not be collapsed into generic `*.manage` umbrellas in runtime authorization.

## Migration Strategy

1. **Source of Truth:** `02_ACCESS_CONTROL/Permission_Code_List.md` is the authoritative registry of all canonical 4-tier permission codes and their legacy migration mappings.
2. **Database Schema Continuity:** The database schema (`permission_definitions.permission_code` with FKs to `platform_modules` and `platform_features`) directly stores the 4-tier string. Idempotent seed scripts and SQL migrations update the rows in place.
3. **Backward Compatibility & Transition:**
   - During client migration, backend authorization and frontend helpers may accept legacy 2-tier/3-tier aliases (e.g. `sales.create` mapped to canonical `pos.sales.new_sale.create`).
   - Legacy codes are marked **deprecated** and must not be newly assigned in seed data or new feature implementations.
4. **Unresolved / Gapped Codes:** Any legacy code whose 4-tier boundary cannot be verified with certainty is logged in the migration gap registry in `Permission_Code_List.md` rather than guessed.

## Consequences

- **Backend Architecture:** All C# domain constants, `[AuthorizePermission(...)]` attributes, seed data classes (`DevelopmentPos*SeedData.cs`), and authorization handlers must use canonical 4-tier codes.
- **Frontend Applications (Flutter & Angular):** Route guards, dashboard action builders, and UI rendering rules must reference canonical 4-tier constants.
- **Documentation & User Journeys:** All Second Brain documentation, user journey specifications, and API contracts must reference canonical 4-tier codes.
- **Database & Catalog Integrity:** The backend-driven permission catalog API returns strictly canonical 4-tier definitions to web and mobile clients.

## Related Documents

- [[../../02_ACCESS_CONTROL/Permission_Code_List]]
- [[../../02_ACCESS_CONTROL/Backend_Driven_Permission_Catalog]]
- [[../../02_ACCESS_CONTROL/Access_Control_Overview]]
- [[../../02_ACCESS_CONTROL/API_Authorization_Rules]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Permission_Based_UI_Rendering]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Routing_Guards]]
