<!-- title: Tenant Admin Tax Management Flow -->
<!-- status: Canonical / Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-03 -->
<!-- authority: [[../../04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]] -->
<!-- supersedes: pre-2026-09-03 single-page Tax Type form flow -->

# Tenant Admin Tax Management Flow

## Purpose

Defines Tenant Admin journeys for **Tax Setup**: list, create, edit, schedule rates, activate/deactivate, and view products using a tax.

## Actor

Tenant Admin (with Tax Setup permissions)

## Trigger

Tenant Admin navigates to `Products → Tax Setup`.

## Preconditions

- Tenant context valid
- Entitlement for Pricing/Tax (or catalog plan feature as configured)
- Permission: at minimum `pricing.tax_classes.view` (TARGET; runtime may map `tax.classes.view`)

## Canonical journey IDs

| ID | Journey |
|---|---|
| TA-UJ-063 | Browse Tax Setup |
| TA-UJ-064 | Create Tax Setup |
| TA-UJ-065 | Edit Tax Setup |
| TA-UJ-066 | Schedule Tax Rate Change |
| TA-UJ-067 | Activate / Deactivate Tax Setup |
| TA-UJ-068 | View Products Using Tax |
| TA-UJ-069 | Assign Tax in Product Setup (Step 6) |

## Main flows

### TA-UJ-063 Browse Tax Setup

| Step | Action | Behaviour |
|---:|---|---|
| 1 | Open Tax Setup | List loads (or empty state). No breadcrumb. |
| 2 | Search / filter | Name, Code; Status All/Active/Inactive; Reset Filter. |
| 3 | Read columns | Tax Name (+ Code), Current Rate, Next Change, Products Using, Status, Actions. |
| 4 | Open row | Navigate to Edit Tax Setup (TA-UJ-065). |

Empty state: *No tax setups have been created yet.* + **+ Add Tax Setup**.

### TA-UJ-064 Create Tax Setup

| Step | Action | Behaviour |
|---:|---|---|
| 1 | + Add Tax Setup | Opens Add Tax Setup (no Summary & Preview, no Used For). |
| 2 | Basic Details | Name *, Code *, Description. |
| 3 | Treatment | TAXABLE / ZERO_RATED / EXEMPT. |
| 4 | Initial rate + Effective From | Per treatment rules. |
| 5 | Create | Backend creates Tax Setup + initial rate; list refreshes. |

### TA-UJ-065 Edit Tax Setup

View/edit permitted fields; see current rate, next change, history, status, products using. Treatment locked after usage (DEC-TAX-011).

### TA-UJ-066 Schedule Tax Rate Change

Edit → Schedule Rate Change → New Rate + Effective From + optional Notes → save SCHEDULED. Current rate unchanged until effective date (tenant TZ 00:00:00).

### TA-UJ-067 Activate / Deactivate

Show impact if products use tax. **Option B:** existing assignments continue; new assignments blocked when INACTIVE. Historical sales unchanged.

### TA-UJ-068 Products Using Tax

Paged list: Product Name, Code, Status, Tax Price Mode (Inclusive/Exclusive).

### TA-UJ-069 Product Setup assign tax

Step 6 Pricing & Tax: select ACTIVE Tax Setup + TaxPriceMode INCLUSIVE/EXCLUSIVE. See Product 7-Step contract.

## Explicit removals

- Used For / Applies To / Goods / Services / Both
- Tax Type VAT/GST UI axis
- Single-page top form as the only UX pattern
- Hard delete as standard lifecycle for established taxes

## Related Specifications

- [[../../04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]]
- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Tax_Management]]
- [[../../13_DECISIONS_AND_CHANGES/TENANT_ADMIN_TAX_MANAGEMENT_DECISION_REGISTER_2026-09-03]]
