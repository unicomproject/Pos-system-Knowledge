<!-- title: Tenant Admin Tax Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-14 -->

# Tenant Admin Tax Management Flow

## Purpose

Defines the flow for managing tax configurations (creating, updating, and viewing taxes). This page provides a simplified aggregate view over `TaxClass`, `TaxRate`, and `TaxClassRate`.

## Actor

Tenant Admin

## Trigger

Tenant Admin navigates to `Product -> Tax`.

## Preconditions

- Tenant Admin has `pricing.tax_classes.*` and `pricing.tax_rates.*` permissions.

## Main Flow: Tax Management

| Step | Action | System & User Behavior |
|---:|---|---|
| 1 | **Navigate** | User opens `Product -> Tax`. System loads the Tax Management page containing a Create/Edit form at the top, and a data table of existing taxes below. |
| 2 | **Create Tax** | User fills out Tax Name, Tax Code (e.g., VAT18), Tax Type, Tax Percentage (0-100), Description, and Status. User clicks `Create Tax`. |
| 3 | **System Validation** | System ensures Tax Code is unique for the tenant. Tax Percentage is valid. System generates `TaxClassCode` and `TaxRateCode` deterministically. |
| 4 | **Creation** | Backend atomically creates `TaxClass`, `TaxRate`, `TaxClassRate`. A default Jurisdiction (`DEFAULT-{COUNTRY_CODE}`) is resolved or created if it doesn't exist. |
| 5 | **List Update** | The table at the bottom of the screen reloads, displaying the newly created Tax. |
| 6 | **Edit Tax** | User clicks `Edit` on a table row. The top form populates with the authoritative backend record. Button changes to `Save Changes`. |
| 7 | **Update Tax** | User alters percentage from 18% to 20%. System end-dates the current `TaxRate` (setting `ValidUntil = today`) and creates a new `TaxRate` (e.g. `VAT18-RATE-V2`) to preserve historical order snapshots. Status changes cascade synchronously. |
| 8 | **Delete Tax** | User clicks `Delete`. Confirmation modal appears. System attempts soft-delete. If Tax is actively assigned to products, system returns `409 Conflict`. |

## Related Specifications

- [[../../04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/02_Functional_Rules]]
