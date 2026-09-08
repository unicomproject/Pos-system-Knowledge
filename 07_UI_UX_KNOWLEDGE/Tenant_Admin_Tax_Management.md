<!-- title: Tenant Admin Tax Management UI/UX -->
<!-- status: Canonical / Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-03 -->
<!-- authority: [[../04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]] -->
<!-- supersedes: pre-2026-09-03 split Create/Edit form + Tax Type table -->

# Tenant Admin Tax Management UI/UX

## Design system

Preserve existing OneVerz Tenant Admin standards (tablet-first, 1024×768, compact layout, existing tokens, orange primary CTA, table/pagination). No new design system. **No breadcrumb** on Tax Setup screens.

## Screen: Tax Setup List

**Heading:** Tax Setup  
**Subtitle:** Manage tax rates used by your products.  
**Primary CTA:** + Add Tax Setup

### Search & filter

- Search: Tax Name, Tax Code
- Status: All | Active | Inactive
- Reset Filter

### Table columns

1. Tax Name (secondary: Tax Code)
2. Current Rate
3. Next Change
4. Products Using
5. Status
6. Actions (View/Edit)

**Do not show:** Applies To, Used For, Tax Type (legacy).

### Empty state

Message: *No tax setups have been created yet.*  
CTA: + Add Tax Setup

## Screen: Add Tax Setup

No breadcrumb. **No Summary & Preview.** **No Used For.**

Sections:

1. Basic Details — Tax Name *, Tax Code *, Description
2. Tax Treatment — TAXABLE | ZERO_RATED | EXEMPT
3. Initial Tax Rate — per treatment
4. Effective Date — Effective From *

Actions: Cancel | Create Tax Setup

## Screen: Edit Tax Setup

Sections/info: Basic Details, Treatment (read-only after lock), Current Rate, Current Effective From, Next Scheduled Change, Rate History, Future Schedule, Status, Products Using.

## Modal / sheet: Schedule Rate Change

Fields: New Rate (%) *, Effective From *, Notes (optional).  
Preview: Current → New + Effective date.

## Confirmation: Activate / Deactivate

If products use tax, show count and **View Products**. Apply Option B deactivation rule.

## Screen: Products Using Tax

Columns: Product Name, Product Code, Status, Tax Price Mode (Inclusive/Exclusive). Server-side paging.

## Product Setup Step 6 integration

Tax dropdown from active Tax Setups; Inclusive | Exclusive control. See [[Tenant_Admin_Add_Product_7_Step_UI_UX_Specification]].

## Validation (UX only)

Backend remains authoritative. FE: required name/code/treatment/effective date; rate rules by treatment; unique code conflict from API.

## Related

- [[../04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]]
- [[../03_USER_JOURNEYS/Tenant_Admin/10_Tax_Management_Flow]]
