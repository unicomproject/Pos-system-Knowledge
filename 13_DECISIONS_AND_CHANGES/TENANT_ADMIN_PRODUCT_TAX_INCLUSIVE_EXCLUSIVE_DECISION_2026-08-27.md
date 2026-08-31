# DECISION: Product Pricing Tax Inclusive / Exclusive Contract

## Date
2026-08-27

## Status
Accepted

## Context
The EPOS system must clearly define how tax is applied to a product's selling price, both for backend calculations (POS Engine, Receipts) and frontend presentation (Product Setup Wizard, Edit, Draft). Previously, the Second Brain documentation contained contradictions or lacked a canonical structure for "Tax Inclusive" versus "Tax Exclusive" modeling, and some UI specs dictated a read-only Tax Exclusive behavior.

## Decision
OneVerz EPOS supports two product tax calculation modes:
- **INCLUSIVE**
- **EXCLUSIVE**

### User-facing Terminology
- Inclusive
- Exclusive

### Canonical Boolean Representation
Where applicable (API, Database, State):
- `taxExclusive = false` → Inclusive
- `taxExclusive = true` → Exclusive

### Tax Management Linkage
Tax Name and Tax Rate originate strictly from tenant Tax Management records. Hardcoding of "VAT 18%" rules is prohibited; the product must reference valid configured tax records.

### Tax Inclusive Business Rule
When **Tax Inclusive** is selected (`taxExclusive = false`), the entered selling price already includes tax.
- **Base Price** = Inclusive Price / (1 + TaxRate / 100)
- **Tax Amount** = Inclusive Price - Base Price
- **Canonical Rule**: Never add tax again to an inclusive price.

### Tax Exclusive Business Rule
When **Tax Exclusive** is selected (`taxExclusive = true`), the entered selling price excludes tax.
- **Tax Amount** = Selling Price × TaxRate / 100
- **Final Amount** = Selling Price + Tax Amount
- **Canonical Rule**: Tax is added once on top of the taxable selling amount.

### Discount Order Contract
Tax is applied to the **effective selling price** (Standard Selling Price, unless replaced by a Promotional/Discount Price). The calculation order remains:
1. Determine effective selling price (e.g. Discount Price if active).
2. Determine Tax calculation type (Inclusive or Exclusive).
3. Compute tax amount based on the effective selling price according to the rules above.

### Product Setup & State
- **Draft & Resume**: The `taxExclusive` selection must persist in the draft state and resume seamlessly in Step 6.
- **Publish & Edit**: At Review & Create, display the human-readable text (e.g., "Inclusive" or "Exclusive"). On Edit, the flag must restore correctly without resetting.

## Consequences
- The database requires `is_tax_exclusive` boolean mapping in the `products` table.
- Flutter UI in Step 6 must present a selectable control for `Inclusive | Exclusive`.
- POS Pricing Engine uses `Product.IsTaxExclusive` to compute correct subtotal and tax amounts dynamically.
- Existing legacy references to `taxInclusive=true` or read-only exclusive restrictions are superseded by this ADR.
