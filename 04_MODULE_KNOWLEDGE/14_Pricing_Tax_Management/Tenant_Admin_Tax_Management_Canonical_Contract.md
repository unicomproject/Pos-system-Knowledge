<!-- title: Tenant Admin Tax Management Canonical Contract -->
<!-- status: Canonical / Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-03 -->
<!-- authority: Current Source Of Truth for Tenant Admin Tax Management -->
<!-- supersedes: 03_USER_JOURNEYS/Tenant_Admin/10_Tax_Management_Flow (pre-2026-09-03), 07_UI_UX_KNOWLEDGE/Tenant_Admin_Tax_Management (pre-2026-09-03), 08_FLUTTER_POS_KNOWLEDGE/Flutter_Tax_Management_Implementation (pre-2026-09-03) -->

# Tenant Admin Tax Management — Canonical Contract

## 0. Authority Statement

This document is the **canonical source of truth** for Tenant Admin Tax Management in OneVerz EPOS Second Brain.

It governs later, separate workstreams for:

1. Backend Tax Setup / rate-schedule implementation
2. Flutter Tax Setup screens
3. Product Setup Step 6 — Pricing & Tax integration
4. POS tax calculation
5. Refund / return tax behaviour

**Out of scope for this document task:** backend code, Flutter code, migrations, API implementation, UI implementation.

### Canonical principle

```text
Tax Setup  = MASTER tax configuration
Product    = references TaxSetupId + owns TaxPriceMode (INCLUSIVE | EXCLUSIVE)
Sale/Order = stores immutable tax snapshot applied at transaction time
Refund     = reverses original sale tax snapshot (never today's live rate)
```

### Domain vs persistence alias

| Domain term (canonical) | Current persistence / runtime alias | Notes |
|---|---|---|
| Tax Setup | `tax_classes` / `TaxClass` aggregate | UI and contracts say **Tax Setup** |
| Tax Rate (effective-dated) | `tax_rates` (+ `tax_class_rates` link) | Rate schedule owned by Tax Setup |
| TaxSetupId | `tax_class_id` / `TaxClassId` | Product assignment FK |
| TaxPriceMode | `taxExclusive` / `products.is_tax_exclusive` | Product-owned; see Inclusive/Exclusive ADR |

Physical table rename is **not** required by this contract. Backend may keep `tax_classes` while exposing Tax Setup domain language.

---

## 1. Phase 0 — Audit Summary (conflicts & actions)

| Area | Existing Second Brain Rule | Conflict / Gap | New Required Rule | Action |
|---|---|---|---|---|
| Tax UX journey | Single-page Create/Edit form + table; Tax Type + % | Conflicts with list → Add/Edit → schedule model | Tax Setup list + Add/Edit + rate schedule | **SUPERSEDE** |
| Tax Type | VAT/GST/SALES_TAX/SERVICE_TAX/OTHER or Flutter PERCENTAGE/fixed | Not Tax Treatment; no ZERO_RATED vs EXEMPT | Treatment = TAXABLE / ZERO_RATED / EXEMPT | **REMOVE** from TA Tax Setup UX; **SUPERSEDE** type as treatment |
| Used For / Applies To / Goods / Services / Both | Not strongly present in SB; must not reappear | Forbidden in new contract | No applicability filter on Tax Setup | **REMOVE** / never introduce |
| Inclusive/Exclusive | Product owns `taxExclusive` (ADR 2026-08-27) | Aligned | Product TaxPriceMode | **KEEP** |
| Rate change | Update ends current rate (`ValidUntil=today`) and creates new | Partial; no schedule UI, Next Change, history UX | Effective-dated HISTORICAL / CURRENT / SCHEDULED | **MODIFY** |
| Product count | Missing | Gap | Distinct product assignment count (derived) | **CREATE** |
| Status lifecycle | ACTIVE/INACTIVE/DELETED soft-delete; 409 if assigned | Hard delete discouraged for established taxes | ACTIVE/INACTIVE primary; hard delete restricted | **MODIFY** |
| Permissions | Runtime `tax.classes.*`; TARGET `pricing.tax_classes.view` incomplete | Incomplete create/update/schedule STATUS keys | Full `pricing.tax_classes.*` + rate schedule keys | **MODIFY** |
| API | `/api/v1/tax` aggregate exists; technical doc still cites `/tax/classes` | Dual naming | Extend `/api/v1/tax`; deprecate fragmented class/rate-only TA UX | **MODIFY** |
| Default seed taxes | Phase 4 audit: do not invent rates without catalog | Gap for empty vs seeded scenarios | Config-driven optional seed; empty valid | **CREATE** |
| Transaction snapshot | `sales_order_taxes` has code/name/rate/%/amounts/`is_tax_included` | Missing explicit Treatment snapshot | Add `tax_treatment_snapshot` (TARGET) | **MODIFY** |
| Refund tax | Return credit from original sale lines (POS) | Not explicit for rate-change case | Refund uses original snapshot rate/treatment | **CREATE** / sync |
| Product Setup Step 6 | TaxClassId + taxExclusive; create-options | Display format & inactive behaviour underspecified | Active options; TaxSetupId; TaxPriceMode | **MODIFY** |
| Jurisdiction | System DEFAULT-{COUNTRY} implicit | OK as technical detail | Not shown in Tax Setup UX | **KEEP** (hidden) |
| Fixed-amount tax | Flutter PERCENTAGE vs amount | Out of new canonical model | Percentage / treatment only for R1 Tax Setup | **REMOVE** from canonical TA contract |

Classification legend used above: **KEEP** / **MODIFY** / **REMOVE** / **SUPERSEDE** / **CREATE**.

---

## 2. Canonical Domain Separation

```text
Tax Management
    ↓
Tax Setup
    ↓
Effective-dated Tax Rates
    ↓
Product selects Tax Setup
    ↓
Product defines Inclusive / Exclusive (TaxPriceMode)
    ↓
Sale stores actual tax snapshot
```

### Tax Setup owns

- Tax identity (Id, TenantId)
- Name, Code, Description
- Tax Treatment
- ACTIVE / INACTIVE lifecycle
- Effective-dated tax rates (historical, current, scheduled)
- Current rate (derived)
- Next scheduled rate (derived)
- Seed/source indicator (if provisioned)

### Product owns

- Selected `TaxSetupId` (via product tax assignment / pricing storage)
- `TaxPriceMode`: `INCLUSIVE` | `EXCLUSIVE`

### Sale / transaction owns

- Immutable tax result applied at transaction time
- Historical transactions must **not** depend on today’s Tax Setup configuration

---

## 3. Removed concepts (MUST NOT appear in active contracts)

The following are **not** part of canonical Tax Setup:

- Used For
- Applies To
- Goods / Services / Both
- Tax Type as VAT/GST/SERVICE_TAX UI axis (superseded by Treatment)
- Fixed-amount (non-percentage) Tax Setup for Tenant Admin R1
- Summary & Preview panel on Add Tax
- Breadcrumb on Tax Setup screens
- Manually maintained ProductCount column as business truth

Any active document that reintroduces these is non-canonical.

---

## 4. Tenant Admin navigation & initial states

```text
Tenant Admin → Products → Tax Setup
```

Screen title: **Tax Setup**  
Description concept: *Manage tax rates used by your products.*  
Primary action: **+ Add Tax Setup**  
No breadcrumb.

### Scenario A — Default taxes provided

Platform **may** provision a configured set of default Tax Setups for a new tenant (example concepts only: Standard Tax, Zero Rated, Tax Exempt).

Rules: **DT-01…DT-07** (Section 19).

Do **not** hard-code country-specific percentages as global Flutter/backend constants unless an approved jurisdiction configuration catalog exists.

### Scenario B — No default taxes

Empty state is valid:

- Message: *No tax setups have been created yet.*
- CTA: **+ Add Tax Setup**

Tax Management must work with zero initial tax records.

---

## 5. Tax Setup List contract

### Search

- Tax Name
- Tax Code

### Filter

- Status: All | Active | Inactive
- Reset Filter (OneVerz list/filter convention)

### Columns

| # | Column | Notes |
|---|---|---|
| 1 | Tax Name | Subtitle/secondary: Tax Code |
| 2 | Current Rate | Derived effective rate; EXEMPT may show `Exempt` |
| 3 | Next Change | Next scheduled rate + Effective From, or empty |
| 4 | Products Using | Distinct product count; navigates to Products Using |
| 5 | Status | ACTIVE / INACTIVE |
| 6 | Actions | View/Edit (and status actions per permission) |

**Removed columns:** Applies To, Used For, Tax Type (legacy).

### Products Using

- Count of **DISTINCT** products currently referencing the Tax Setup
- Derived from assignments — never a manually maintained ProductCount field
- Navigation: **View Products Using Tax**

---

## 6. Add Tax Setup journey

Opens **Add Tax Setup**. No breadcrumb. No Summary & Preview. No Used For.

### Sections

1. Basic Details  
2. Tax Treatment  
3. Initial Tax Rate  
4. Effective Date  

### Basic Details

| Attribute | Rules |
|---|---|
| Tax Name * | Required; trimmed; tenant-scoped; max **150** (platform `varchar(150)` name standard) |
| Tax Code * | Required; tenant-scoped unique; normalize: trim + **UPPERCASE** (same as Category/Brand code convention) |
| Description | Optional; max **2000** where text is used elsewhere; if stored as unbounded text, FE UX may still cap reasonably — backend remains authoritative |

Code uniqueness: **BR-TAX-002**.

---

## 7. Tax Treatment

Canonical values:

| Treatment | Meaning |
|---|---|
| `TAXABLE` | Percentage tax applied |
| `ZERO_RATED` | Rate is exactly **0%**; reporting classification remains Zero Rated |
| `EXEMPT` | No tax calculation; reporting classification remains Exempt |

**BR-TAX-014:** ZERO_RATED and EXEMPT are different business concepts even when `TaxAmount = 0`.

### Initial rate by treatment

| Treatment | Rate input | Effective From |
|---|---|---|
| TAXABLE | Required Rate (%) 0–100; may be > 0 | Required |
| ZERO_RATED | Forced **0%**; non-zero forbidden | Required |
| EXEMPT | No percentage calculation; UI may show `Exempt` | Effective From still required for audit timeline of the setup’s rate row if persisted; business meaning remains EXEMPT |

If backend stores `0` internally for EXEMPT technical convenience, treatment must still be **EXEMPT**, not ZERO_RATED.

---

## 8. Tax Inclusive / Exclusive (Product ownership)

**Not** Tax Setup identity. Owned by Product Pricing.

| Domain | Storage alias | Meaning |
|---|---|---|
| `INCLUSIVE` | `taxExclusive = false` / `is_tax_exclusive = false` | Entered selling price already includes tax |
| `EXCLUSIVE` | `taxExclusive = true` / `is_tax_exclusive = true` | Entered selling price is net |

Authority: [[../../13_DECISIONS_AND_CHANGES/TENANT_ADMIN_PRODUCT_TAX_INCLUSIVE_EXCLUSIVE_DECISION_2026-08-27]]

### Exclusive

```text
TaxAmount  = NetAmount × Rate / 100
GrossAmount = NetAmount + TaxAmount
```

### Inclusive

```text
NetAmount  = GrossAmount / (1 + Rate / 100)
TaxAmount  = GrossAmount - NetAmount
```

### Zero Rated / Exempt

```text
TaxAmount = 0
```

Reporting preserves treatment classification.

All financial calculations use **decimal** arithmetic and platform canonical rounding (`MidpointRounding.ToEven` at approved money boundaries; currency decimal places). **Do not** use binary floating-point for tax.

### Product Setup Step 6 Tax Preview (SIMPLE / BUNDLE UI)

Flutter may show a **client-side Tax Preview** so the catalog user can see Exclusive vs Inclusive impact (e.g. 750 exclusive @ 15% → tax 112.50, final 862.50). This preview is **not** persisted and is **not** the sale-time tax amount. POS / checkout remain the calculation authority using the formulas above.

Discount order (unchanged): effective selling price → TaxPriceMode → tax amount.

VARIANT Product Setup shows Tax Class + **read-only Effective Tax Rate**; sale calc uses each variant’s selling price × product Tax Assignment / TaxPriceMode. Do not require per-row Tax Class on the variant matrix for current scope.

---

## 9. Product Setup integration (Step 6 — Pricing & Tax)

Full pricing ownership (SIMPLE vs VARIANT selling prices, Cost, Apply to All): [[../10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]] §6.1–6.5.

Canonical Step 6 **tax-related** fields:

- Tax dropdown from Tax Management (**ACTIVE** Tax Setups only for **new** assignment)
- SIMPLE display: `Name (15%)` in Tax Class label; VARIANT: Tax Class + Effective Tax Rate read-only
- Stores: `TaxSetupId` / `TaxClassId` via `product_tax_assignments` (+ existing path), `TaxPriceMode` on product (`taxExclusive`)
- Do **not** duplicate Tax Class / Tax Rate / Tax Treatment masters inside Product Setup tables
- Product Setup must **not** create Tax Rates
- Effective Tax Rate is derived/read-only from selected Tax Setup’s **current** effective rate + treatment

**Ownership for current Product Setup scope:**

| Concept | Owner |
|---|---|
| Tax Class / Rate / Treatment masters | Tax Management |
| TaxPriceMode Inclusive/Exclusive | Product (`is_tax_exclusive`) |
| Product Tax Assignment | Product Setup references Tax Class (may fan same class onto variants) |
| Selling price | SIMPLE: one identity; VARIANT: per `ProductVariantId` |

### Lifecycle behaviours

| Event | Rule |
|---|---|
| Product created | Must select ACTIVE Tax Setup + TaxPriceMode |
| Product edited | May change to another ACTIVE Tax Setup; may change TaxPriceMode |
| Assigned tax later INACTIVE | Existing assignment remains (Option B); product does **not** become tax-free; Tax Setup cannot be newly selected elsewhere |
| Tax rate changes in future | Products keep TaxSetupId; effective rate resolved from Tax Setup schedule — **no** mass product edit |

Preferred Product Setup options source: existing **`GET /api/v1/tenant-admin/products/create-options`** (include active tax setups). Do not force an extra Tax list call when create-options already supplies options.

Assignment permission: `catalog.product_pricing.manage` + tax lookup view permission (Section 25).

---

## 10. Edit Tax Setup

Opens **Edit Tax Setup**. No breadcrumb. No Used For.

Shows:

- Basic Details (editable per rules)
- Tax Treatment (immutable after usage — Section 14 / DEC-TAX-011)
- Current Rate + Current Rate Effective From
- Next Scheduled Change
- Rate History
- Future Rate Schedule
- Status
- Products Using

---

## 11. Current Rate logic

Current Rate is **not** “latest row created.”

```text
Given businessTimestamp (tenant/business timezone aware):
  candidates = rates where EffectiveFrom <= businessTimestamp
               and (EffectiveTo is null OR EffectiveTo > businessTimestamp)
               and status allows application
  current = candidate with greatest EffectiveFrom
```

Backend is authority. Flutter must not invent the active rate.

---

## 12. Rate History

Statuses relative to “now”:

| Classification | Meaning |
|---|---|
| HISTORICAL | Past applicable period |
| CURRENT | Applicable now |
| SCHEDULED | Future EffectiveFrom |

Past rates must **never** be overwritten simply because a new rate is created.

---

## 13. Schedule Rate Change

```text
Edit Tax Setup → Schedule Rate Change
  → New Rate (%) *
  → Effective From *
  → Notes (optional)
  → Validate → Save as SCHEDULED
  → Current rate unchanged until Effective From
```

Preview concept:

```text
Current Rate 18%  →  New Rate 20%  Effective 01 Jan 2027
```

Applies to **TAXABLE** (and ZERO_RATED only to keep 0% if treatment remains ZERO_RATED). **EXEMPT** does not use percentage rate scheduling (**TR-09**).

---

## 14. Rate schedule business rules (TR-*)

| ID | Rule |
|---|---|
| TR-01 | Scheduled rate must not overwrite current rate prematurely |
| TR-02 | Future schedules are effective-dated |
| TR-03 | Two rates for same Tax Setup cannot share the same EffectiveFrom |
| TR-04 | Rate periods must not overlap |
| TR-05 | Historical rates used by transactions cannot be deleted |
| TR-06 | Historical rates used by transactions cannot be edited |
| TR-07 | Future rates may be edited/deleted only before effective and where audit rules permit |
| TR-08 | ZERO_RATED remains 0% unless Treatment changes via explicit supported workflow |
| TR-09 | EXEMPT does not require percentage rate scheduling |
| TR-10 | Treatment change TAXABLE ↔ ZERO_RATED ↔ EXEMPT is not casual |

### DEC-TAX-011 — Treatment mutability (LOCKED)

**Option A (safer):** Tax Treatment becomes **immutable** after either:

- at least one product assignment exists, **or**
- at least one transaction tax snapshot references the Tax Setup

Before that, treatment may be edited.

There is **no** effective-dated Treatment history in R1. To change treatment after usage: create a **new** Tax Setup and reassign products intentionally.

---

## 15. Effective date & timezone

Canonical rule:

```text
A scheduled tax rate becomes effective at 00:00:00
on its Effective From date
in the Tenant default timezone (tenants.default_timezone — IANA).
```

- Persist/compare in UTC internally as needed
- Do **not** use developer machine timezone
- Do **not** use Flutter device timezone as taxation authority

---

## 16. ACTIVE / INACTIVE

| Status | New product assignment | Existing assignments | Historical sales |
|---|---|---|---|
| ACTIVE | Allowed | Continue | Unchanged |
| INACTIVE | Forbidden | Continue (Option B) | Unchanged |

### DEC-TAX-012 — Deactivation safety (LOCKED) — Option B

If Tax Setup is used by products, deactivation shows impact:

> This Tax Setup is currently used by X products.

Provide **View Products**. Deactivation **does not** silently clear product tax or make products tax-free. Existing assignments continue to resolve rates from the (now inactive) Tax Setup. Only **new** assignments are blocked.

Reasoning: aligns with Product Setup “ACTIVE only for new selection,” preserves POS continuity, avoids forced mass reassignment blocker.

---

## 17. Delete rules

Hard delete is **not** the standard lifecycle for an established Tax Setup.

Cannot hard delete when any of:

- assigned to products
- has rate history beyond a never-used draft edge case
- has transaction references

Use ACTIVE / INACTIVE. Future scheduled rates removable only under TR-07.

---

## 18. Products Using Tax view

```text
Tax Setup → Products Using → View Products
```

Minimum columns:

- Product Name
- Product Code (or canonical identifier)
- Product Status
- Tax Price Mode (Inclusive / Exclusive)

Server-side paging. Supporting Tax Management view — not a separate Product master.

---

## 19. Default / seeded Tax Setups (DT-*)

| ID | Rule |
|---|---|
| DT-01 | Seed/default taxes are configuration-driven |
| DT-02 | Do not hard-code country tax % in Flutter |
| DT-03 | Each seeded Tax Setup belongs to the tenant |
| DT-04 | No cross-tenant mutable tax master |
| DT-05 | Provisioning must be idempotent |
| DT-06 | Zero seeded taxes is valid |
| DT-07 | Tenant can add its own Tax Setup |

### DEC-TAX-013 — Seed editability (LOCKED)

Seeded Tax Setups are **fully editable** by the tenant (name, description, rates, status, schedule) under the same rules as custom taxes. `IsSeeded` / Source is informational for support/audit only. Code remains tenant-unique and follows normal edit restrictions after transactional use if platform code-immutability patterns require it (prefer: code editable until first transaction/assignment conflict rules say otherwise — uniqueness always enforced).

---

## 20. Transaction tax snapshot

On sale/order finalization, preserve applied tax details. Reuse existing `sales_order_taxes` where possible:

Already present (KEEP):

- `tax_class_id` (TaxSetupId)
- `tax_rate_id`
- `tax_class_code_snapshot` / `tax_rate_code_snapshot`
- `tax_name_snapshot`
- `tax_rate_percent`
- `taxable_amount`
- `tax_amount`
- `is_tax_included` (maps to Inclusive mode; note Product uses `is_tax_exclusive` — snapshot uses included flag historically)

**TARGET gap (MODIFY):** add `tax_treatment_snapshot` (`TAXABLE` | `ZERO_RATED` | `EXEMPT`) so ZERO_RATED vs EXEMPT survive when amount is 0.

Canonical rule: future Tax Setup changes must **never** rewrite historical sales.

---

## 21. Refund / return tax

Example: sale 01 Jun 2026 at 18%; rate becomes 20% on 01 Jan 2027; return in 2027 → refund uses **18%** from original snapshot.

```text
Return / Refund must reverse tax from the ORIGINAL sale tax snapshot.
```

Do not recalculate using today’s live Tax Setup rate.

---

## 22. Canonical data attributes

### Tax Setup (logical)

| Attribute | Required | Notes |
|---|---|---|
| Id | Y | UUID |
| TenantId | Y | Isolation |
| Name | Y | varchar(150) |
| Code | Y | varchar(80), unique per tenant |
| Description | N | |
| Treatment | Y | TAXABLE / ZERO_RATED / EXEMPT |
| Status | Y | ACTIVE / INACTIVE (DELETED reserved for soft-delete edge only) |
| IsSeeded / Source | N | If architecture requires |
| CreatedAt / CreatedBy | Y | |
| UpdatedAt / UpdatedBy | Y | |
| RowVersion | If platform concurrency pattern requires | |

### Tax Rate (logical)

| Attribute | Required | Notes |
|---|---|---|
| Id | Y | |
| TaxSetupId | Y | |
| TenantId | Y | Per backend tenant pattern |
| Rate | Y | numeric; 0–100; EXEMPT may store 0 with treatment EXEMPT |
| EffectiveFrom | Y | Date (business tz start-of-day) |
| EffectiveTo | Optional | Explicit end if period model used |
| Notes | N | |
| Audit fields | Y | |

### Product tax assignment (business ownership)

| Attribute | Notes |
|---|---|
| ProductId | |
| TaxSetupId | |
| TaxPriceMode | INCLUSIVE / EXCLUSIVE via `is_tax_exclusive` on product |

Do **not** force a new assignment table if `product_tax_assignments` + product flag already satisfy ownership. Prefer reuse.

---

## 23. Logical data model & constraints

```text
Tenant 1 ─── * TaxSetup
TaxSetup 1 ─── * TaxRate
TaxSetup 1 ─── * Product assignments
Product * ─── 1 TaxSetup
Product has TaxPriceMode
TransactionLine / sales_order_taxes stores Tax Snapshot
```

Constraints:

- Tenant-scoped Tax Code uniqueness
- Tenant isolation on every query/mutation
- TaxRate belongs to same-tenant TaxSetup
- No duplicate EffectiveFrom per TaxSetup
- No overlapping rate periods
- Active product assignment points to same-tenant TaxSetup
- Financial precision: `numeric` / decimal — not float

**No migrations in this documentation task.**

Jurisdiction / `tax_class_rates` remain technical infrastructure for calculation plumbing; Tenant Admin Tax Setup UX does not expose jurisdiction hierarchy.

---

## 24. API capability contract

Prefer existing aggregate: **`/api/v1/tax`** (TaxesController). Do not invent a parallel Tax Setup API if this aggregate can be extended.

| Capability | Method / path concept | Notes |
|---|---|---|
| List Tax Setups | `GET /api/v1/tax` | search, status, page, pageSize; return CurrentRate, NextRate, ProductCount, Treatment, Status |
| Get detail | `GET /api/v1/tax/{id}` | basics, treatment, status, current, future, permitted history |
| Create | `POST /api/v1/tax` | name, code, description, treatment, initial rate, effectiveFrom |
| Update | `PUT /api/v1/tax/{id}` | permitted editable fields only |
| Schedule rate | `POST /api/v1/tax/{id}/rates` (or `/schedule`) | future rate |
| Edit future rate | `PUT /api/v1/tax/{id}/rates/{rateId}` | future only |
| Delete future rate | `DELETE /api/v1/tax/{id}/rates/{rateId}` | future only |
| Change status | `POST /api/v1/tax/{id}/activate` & `/deactivate` (or status PATCH) | |
| Products using | `GET /api/v1/tax/{id}/products` | paginated |
| Product create options | Existing create-options | Active tax options |

Legacy fragmented docs citing only `/api/v1/tax/classes` + `/api/v1/tax/rates` as the Tenant Admin UX API are **superseded** for TA Tax Setup by the aggregate above (lower-level class/rate APIs may remain internal/compat).

List response concept:

`Id, Name, Code, Treatment, CurrentRate, CurrentRateEffectiveFrom, NextRate, NextRateEffectiveFrom, ProductCount, Status`

---

## 25. Permission contract

Audit findings:

- Runtime today: `tax.classes.view|create|update|delete`, `tax.rates.*`
- Product Setup TARGET lookup: `pricing.tax_classes.view`, `pricing.tax_rates.view`
- Permission catalog already lists `pricing.tax_classes.master.view` / `pricing.tax_rates.master.view`

**Do not invent `catalog.tax.*`.** Follow `pricing.tax_*` TARGET namespace.

| Permission (TARGET) | Description | Tenant Admin UI | Backend | Product Setup |
|---|---|---|---|---|
| `pricing.tax_classes.view` | View Tax Setup list/detail | Show Tax Setup nav/list | Enforce on GET | Lookup (with create-options) |
| `pricing.tax_classes.create` | Create Tax Setup | + Add Tax Setup | POST create | — |
| `pricing.tax_classes.update` | Edit basic details | Edit form save | PUT update | — |
| `pricing.tax_classes.status.manage` | Activate / Deactivate | Status actions | Status endpoints | — |
| `pricing.tax_rates.view` | View rates/history | History section | GET detail rates | Optional dedicated rate lookup |
| `pricing.tax_rates.schedule.manage` | Schedule / edit / delete future rates | Schedule Rate Change | Schedule APIs | — |
| `pricing.tax_classes.products.view` | View products using tax | Products Using | Products-using API | — |
| `catalog.product_pricing.manage` | Assign tax on product | — | Draft/publish pricing | Step 6 assign |

Compatibility map (one-way where already documented):

- `tax.classes.view` → `pricing.tax_classes.view`
- `tax.classes.create` → `pricing.tax_classes.create`
- `tax.classes.update` → `pricing.tax_classes.update`
- `tax.rates.*` → `pricing.tax_rates.view` / `pricing.tax_rates.schedule.manage`

Delete permission: prefer status lifecycle over hard delete; `tax.classes.delete` may remain compatibility-only for never-referenced rows.

---

## 26. Functional requirements (FR-TAX-*)

| ID | Requirement |
|---|---|
| FR-TAX-001 | View Tax Setup list |
| FR-TAX-002 | Show valid empty state |
| FR-TAX-003 | Display provisioned default taxes where configured |
| FR-TAX-004 | Search by name/code |
| FR-TAX-005 | Filter by status + reset |
| FR-TAX-006 | Create Tax Setup |
| FR-TAX-007 | Support TAXABLE |
| FR-TAX-008 | Support ZERO_RATED |
| FR-TAX-009 | Support EXEMPT |
| FR-TAX-010 | Define initial effective tax rate |
| FR-TAX-011 | Edit permitted Tax Setup fields |
| FR-TAX-012 | View current effective rate |
| FR-TAX-013 | View rate history |
| FR-TAX-014 | Schedule future rate |
| FR-TAX-015 | Edit permitted future scheduled rate |
| FR-TAX-016 | Delete permitted future scheduled rate |
| FR-TAX-017 | Activate Tax Setup |
| FR-TAX-018 | Deactivate Tax Setup safely (Option B + impact) |
| FR-TAX-019 | View product count (derived) |
| FR-TAX-020 | View products using tax (paged) |
| FR-TAX-021 | Expose active taxes to Product Setup |
| FR-TAX-022 | Store Product TaxPriceMode |
| FR-TAX-023 | Calculate Inclusive taxation |
| FR-TAX-024 | Calculate Exclusive taxation |
| FR-TAX-025 | Preserve Zero Rated classification |
| FR-TAX-026 | Preserve Exempt classification |
| FR-TAX-027 | Use effective rate by business timestamp |
| FR-TAX-028 | Preserve historical transaction tax snapshot |
| FR-TAX-029 | Refund using original tax snapshot |
| FR-TAX-030 | Enforce tenant isolation |
| FR-TAX-031 | Normalize Tax Code (trim + uppercase) |
| FR-TAX-032 | Block hard delete when business references exist |
| FR-TAX-033 | Idempotent optional default tax provisioning |

**Count: 33**

---

## 27. Business rules (BR-TAX-*)

| ID | Rule |
|---|---|
| BR-TAX-001 | Every Tax Setup belongs to exactly one tenant |
| BR-TAX-002 | Tax Code unique within tenant |
| BR-TAX-003 | Only ACTIVE Tax Setups selectable for new Product Setup assignments |
| BR-TAX-004 | Tax Setup has no Goods/Services/Both applicability |
| BR-TAX-005 | Product references selected Tax Setup |
| BR-TAX-006 | Product controls Inclusive/Exclusive TaxPriceMode |
| BR-TAX-007 | Tax rate is effective-dated |
| BR-TAX-008 | Current rate derived from effective-date logic |
| BR-TAX-009 | Future schedules cannot overlap |
| BR-TAX-010 | Historical transaction-used rates immutable |
| BR-TAX-011 | Future rate must not overwrite current prematurely |
| BR-TAX-012 | ZERO_RATED calculates 0 tax and remains Zero Rated |
| BR-TAX-013 | EXEMPT calculates no tax and remains Exempt |
| BR-TAX-014 | ZERO_RATED ≠ EXEMPT |
| BR-TAX-015 | Config changes cannot mutate historical transactions |
| BR-TAX-016 | Refund reverses original transaction tax |
| BR-TAX-017 | Inactive tax cannot be newly assigned |
| BR-TAX-018 | Deactivation cannot silently remove required tax behaviour from products |
| BR-TAX-019 | Cross-tenant tax access forbidden |
| BR-TAX-020 | Default tax setup records are tenant-owned |
| BR-TAX-021 | Hard delete restricted once business references exist |
| BR-TAX-022 | Product count derived from assignments |
| BR-TAX-023 | Tax calculations use decimal + canonical rounding |
| BR-TAX-024 | Effective date uses tenant/business timezone |
| BR-TAX-025 | Treatment immutable after assignment or transactional use (DEC-TAX-011) |
| BR-TAX-026 | Tax Name required; Tax Code required |
| BR-TAX-027 | TAXABLE rate must be in [0, 100]; ZERO_RATED rate must be 0 |

**Count: 27**

---

## 28. Business logic (BL-TAX-*)

### BL-TAX-001 Resolve current effective rate

```text
function resolveCurrentRate(taxSetupId, businessTs):
  rates = loadRates(taxSetupId)
  applicable = rates where effectiveFrom <= businessTs
               and (effectiveTo is null or effectiveTo > businessTs)
  return maxBy(applicable, effectiveFrom) or none
```

### BL-TAX-002 Resolve next scheduled rate

```text
function resolveNextRate(taxSetupId, businessTs):
  future = rates where effectiveFrom > businessTs
  return minBy(future, effectiveFrom) or none
```

### BL-TAX-003 Validate future schedule

- EffectiveFrom > current business date (or ≥ next day start — implementation: must be strictly after current period start and not overlap)
- No duplicate EffectiveFrom
- No overlap with existing periods
- Treatment TAXABLE: rate in range; ZERO_RATED: rate == 0; EXEMPT: reject percentage schedule

### BL-TAX-004 Exclusive tax

```text
taxAmount = round(netAmount * rate / 100)
gross = netAmount + taxAmount
```

### BL-TAX-005 Inclusive tax

```text
net = round(gross / (1 + rate/100))
taxAmount = gross - net
```

### BL-TAX-006 Zero Rated

`taxAmount = 0`; snapshot.treatment = ZERO_RATED

### BL-TAX-007 Exempt

`taxAmount = 0`; snapshot.treatment = EXEMPT; no percentage application

### BL-TAX-008 Count products using tax

`COUNT(DISTINCT product_id)` active assignments for TaxSetupId within tenant

### BL-TAX-009 Validate deactivation

Load product count; return impact DTO; allow deactivate under Option B; never null out TaxSetupId on products

### BL-TAX-010 Populate Product Setup tax options

Active Tax Setups only; label = `Name — rateDisplay`; include Id, Treatment, CurrentRate

### BL-TAX-011 Create immutable transaction tax snapshot

On finalize: copy TaxSetupId, codes, name, treatment, rate %, taxable, tax amount, included flag into `sales_order_taxes` (and line totals as already designed)

### BL-TAX-012 Reverse original tax during refund

Read original snapshot rows; reverse amounts proportionally / per return qty rules; **do not** call live rate resolver for original lines

**Count: 12**

---

## 29. Validation contract

### Backend authoritative

- Tax Name required (trimmed, length)
- Tax Code required, unique per tenant, normalized
- Valid Treatment enum
- Valid Status enum
- Valid percentage for TAXABLE; =0 for ZERO_RATED
- Valid Effective From
- No duplicate schedule EffectiveFrom
- No overlapping periods
- Tax Setup tenant match
- Product tenant match; TaxSetup same tenant
- Inactive cannot be newly assigned
- Historical edit/delete forbidden when used
- Future schedule restrictions (TR-*)
- Treatment immutable after usage

### Frontend

UX-only early validation. Backend remains authority.

---

## 30. Non-functional requirements

### Security

Tenant isolation; permission enforcement; IDOR prevention; input validation; server-side authorization.

### Financial correctness

Decimal arithmetic; central rounding; deterministic calculations; immutable historical snapshot.

### Performance

Server-side search/filter/pagination; efficient aggregate product count; no N+1 product fetch on list.

### Reliability

Idempotent default provisioning; concurrency-safe scheduling; no overlapping periods.

### Auditability

Created/modified by; schedule create/change; activate/deactivate; timestamps; before/after where audit architecture supports.

### Usability

Clear empty state, validation, status, current rate, next change, deactivation impact.

### Responsive UI contract

Preserve OneVerz standards: tablet-first; 1024×768; compact layout; existing typography/spacing/buttons/tokens; orange primary CTA; existing table/pagination. **No new design system.**

---

## 31. UI screen inventory

| # | Screen / state | Notes |
|---|---|---|
| 1 | Tax Setup List | No breadcrumb |
| 2 | Tax Setup Empty State | Valid |
| 3 | Add Tax Setup | No Summary & Preview; no Used For |
| 4 | Edit Tax Setup | |
| 5 | Rate History | May be section of Edit |
| 6 | Schedule Rate Change | Modal / side sheet |
| 7 | Activate/Deactivate confirmation | Impact + View Products |
| 8 | Products Using Tax | Paged |
| 9 | Product Setup Tax dropdown | Step 6 |
| 10 | Product Setup Inclusive/Exclusive | Step 6 |

Explicitly **removed** from design: Applies To, Used For, Goods/Services/Both, Add-Tax Summary & Preview, unnecessary grid view unless global design requires it.

---

## 32. Attribute / DTO matrices

### Domain attribute matrix

| Domain | Attribute | Type Concept | Required | Validation | Source | Editable | Notes |
|---|---|---|---|---|---|---|---|
| TaxSetup | Id | UUID | Y | | System | N | |
| TaxSetup | TenantId | UUID | Y | Same tenant | Context | N | |
| TaxSetup | Name | string(150) | Y | Trim, length | User | Y* | *until other locks |
| TaxSetup | Code | string(80) | Y | Unique, UPPER | User | Conditional | Prefer lock after transactional use |
| TaxSetup | Description | string | N | Length | User | Y | |
| TaxSetup | Treatment | enum | Y | Enum | User | Until usage | DEC-TAX-011 |
| TaxSetup | Status | enum | Y | ACTIVE/INACTIVE | User/System | Via status API | |
| TaxSetup | IsSeeded | bool | N | | Provisioning | N | Informational |
| TaxRate | Id | UUID | Y | | System | N | |
| TaxRate | TaxSetupId | UUID | Y | Same tenant | System | N | |
| TaxRate | Rate | decimal | Y* | 0–100 | User | Future only | *EXEMPT N/A business |
| TaxRate | EffectiveFrom | date | Y | TZ rule | User | Future only | |
| TaxRate | EffectiveTo | date | N | No overlap | System/User | Restricted | |
| TaxRate | Notes | string | N | | User | Future only | |
| ProductTax | ProductId | UUID | Y | | Product | | |
| ProductTax | TaxSetupId | UUID | Y | Active on new | User | Y | |
| ProductTax | TaxPriceMode | enum | Y | INC/EXC | User | Y | via is_tax_exclusive |
| SaleSnapshot | TaxSetupId | UUID | N/Y | | Sale | N | Immutable |
| SaleSnapshot | TaxCode | string | | | Sale | N | Snapshot |
| SaleSnapshot | Treatment | enum | Y TARGET | | Sale | N | Gap today |
| SaleSnapshot | RateApplied | decimal | Y | | Sale | N | |
| SaleSnapshot | IsTaxIncluded | bool | Y | | Sale | N | |
| SaleSnapshot | TaxableAmount | decimal | Y | | Sale | N | |
| SaleSnapshot | TaxAmount | decimal | Y | | Sale | N | |

### API DTO matrix (conceptual)

| API | Request attributes | Response attributes | Rules |
|---|---|---|---|
| GET list | search, status, page, pageSize | items[], totalCount, paging | Tenant scope |
| GET detail | id | basics, treatment, status, currentRate, nextRate, history[], productCount | |
| POST create | name, code, description, treatment, rate?, effectiveFrom | id | Treatment-specific rate |
| PUT update | name, description, (code if allowed) | 204/entity | No silent treatment change after lock |
| POST schedule | rate, effectiveFrom, notes? | rateId | TR-* |
| PUT future rate | rate, effectiveFrom, notes? | | Future only |
| DELETE future rate | rateId | | Future only |
| POST deactivate | optional reason | impact acknowledged | Option B |
| GET products | page, pageSize | products[] | Distinct assignments |
| create-options | — | taxes[] active | Product Setup |

---

## 33. End-to-end user journeys

| Journey | ID | Flow |
|---|---|---|
| A Use default tax | TA-UJ-063 + TA-UJ-069 | List defaults → Product Setup select tax + mode → Save |
| B Create custom tax | TA-UJ-064 | Add Tax Setup → Create → available in Product Setup |
| C Empty tax | TA-UJ-063 | Empty state → Add first tax |
| D Rate change | TA-UJ-066 | Schedule → current unchanged → later new txs use new rate |
| E View products | TA-UJ-068 | Products Using paged list |
| F Deactivate | TA-UJ-067 | Impact → Option B → historical sales unchanged |
| G Refund after change | (POS return journeys) | Original snapshot reversal |

Canonical Tax Management journey IDs: **TA-UJ-063 … TA-UJ-069** (Section 36).

---

## 34–35. Cross-document sync & supersession

Active authorities after this contract:

- This file (primary)
- Inclusive/Exclusive ADR (KEEP)
- Product 7-Step contract Step 6 (updated to reference this)
- DB `14_Pricing_And_Tax_Management` + `20_Unified_Order_And_Sales` (updated notes)
- Permission catalogs (updated)

Superseded as **Tax Management UX / journey / Flutter contract** (historical evidence only):

- Pre-2026-09-03 versions of Tax Management Flow, UI/UX, Flutter Tax Management Implementation (headers marked SUPERSEDED)

---

## 36. User Journey IDs

No prior dedicated Tax Management TA-UJ IDs existed (index ended at TA-UJ-062). Allocated:

| Journey ID | Name |
|---|---|
| TA-UJ-063 | Browse Tax Setup |
| TA-UJ-064 | Create Tax Setup |
| TA-UJ-065 | Edit Tax Setup |
| TA-UJ-066 | Schedule Tax Rate Change |
| TA-UJ-067 | Activate / Deactivate Tax Setup |
| TA-UJ-068 | View Products Using Tax |
| TA-UJ-069 | Assign Tax in Product Setup (Step 6) |

Do not renumber. Update indexes/matrices accordingly.

---

## 37. Decision register (summary)

Full register: [[../../13_DECISIONS_AND_CHANGES/TENANT_ADMIN_TAX_MANAGEMENT_DECISION_REGISTER_2026-09-03]]

| ID | Decision | Status |
|---|---|---|
| DEC-TAX-001 | Used For / Goods / Services / Both removed | LOCKED |
| DEC-TAX-002 | Tax Setup owns identity/treatment/rates | LOCKED |
| DEC-TAX-003 | Product owns TaxPriceMode | LOCKED |
| DEC-TAX-004 | Rates are effective-dated | LOCKED |
| DEC-TAX-005 | Historical rates preserved | LOCKED |
| DEC-TAX-006 | ZERO_RATED ≠ EXEMPT | LOCKED |
| DEC-TAX-007 | Defaults tenant-owned, config-driven | LOCKED |
| DEC-TAX-008 | Sale tax is snapshot-based | LOCKED |
| DEC-TAX-009 | Refund uses original sale tax | LOCKED |
| DEC-TAX-010 | Inactive cannot be newly assigned | LOCKED |
| DEC-TAX-011 | Treatment immutable after usage | LOCKED |
| DEC-TAX-012 | Deactivation Option B | LOCKED |
| DEC-TAX-013 | Seeded taxes fully editable | LOCKED |
| DEC-TAX-014 | API extends `/api/v1/tax` aggregate | LOCKED |
| DEC-TAX-015 | Permissions under `pricing.tax_*` | LOCKED |

---

## 38. Acceptance criteria checklist

| AC | Criterion | Status |
|---|---|---|
| AC-01 | One canonical Tax Management contract | Met (this file) |
| AC-02 | No active Used For / Goods / Services / Both requirement | Met |
| AC-03–AC-25 | List/Add/Edit/Treatment/Schedule/History/TZ/Status/Product/IncEx/Formulas/Snapshot/Refund/Perms/API/Attrs/Tables/Validation/BR/BL/NFR/Isolation/Empty | Met in this contract |
| AC-26 | Related Product/POS/Refund docs synchronized | Met via linked updates |
| AC-27 | Conflicting docs superseded | Met |

---

## Related files

- [[01_Module_Overview]]
- [[02_Functional_Rules]]
- [[03_Technical_Contract]]
- [[../../13_DECISIONS_AND_CHANGES/TENANT_ADMIN_TAX_MANAGEMENT_DECISION_REGISTER_2026-09-03]]
- [[../../13_DECISIONS_AND_CHANGES/TENANT_ADMIN_PRODUCT_TAX_INCLUSIVE_EXCLUSIVE_DECISION_2026-08-27]]
- [[../../03_USER_JOURNEYS/Tenant_Admin/10_Tax_Management_Flow]]
- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Tax_Management]]
- [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]]
- [[../10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]]
