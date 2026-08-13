# Product CRUD & Wizard Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 10_Product_Core |
| Feature | Product Wizard Setup Flow |
| Feature Type | End-to-End / API / Unit / Integration |
| API Endpoint | `/api/v1/tenant-admin/products` |
| Required Permission | `catalog.products.*` |
| Tenant Scoped | Yes |

---

## 1. Wizard Setup & Validation Tests

- **PROD-WIZ-001**: Basic Details Step. Verifies Product Name validation, Category assignment, Brand mapping, and transactional image replacement (rollback on error).
- **PROD-WIZ-002**: Product Type & Tracking. Checks that changing product types warning prompts correctly, Track Inventory ON allows Batch/Expiry/Serial rules, and Track Inventory OFF locks child tracking settings.
- **PROD-WIZ-003**: Units & Conversion. Validates Single UOM vs conversion factors for multiple UOMs (maintained in base unit). Ensures step auto-skips for bundles.
- **PROD-WIZ-004**: Product Configuration. Variant generator Cartesian combination verification. Persists excluded combinations.
- **PM-UJ-003**: Bundle candidates eligibility. Disallows drafts, inactive items, or nested bundles. Validates stock calculation formula: `Min(Floor(Component Stock / Required Qty))`.
- **PROD-WIZ-005**: SKU & Barcodes. Enforces unique SKU and primary barcode constraints. Conflict detail drawer launches and displays conflicting owner info without resetting wizard state.
- **PROD-WIZ-006**: Pricing & Tax. margin calculation validation for tax-inclusive and tax-exclusive items. Outlet and variant pricing overrides.
- **PROD-WIZ-007**: Channel Visibility. Toggles POS and Online storefront availability. Clicking click-and-collect requires online storefront visibility enabled.
- **PROD-WIZ-008**: Atomic Publish. Verifies that all steps validation checks must pass before saving active state. Ensures rollback of partial updates on publish failure.

---

## 2. Post-Create & Operations Tests

- **PROD-OP-001**: Save Draft on step change. Checks that incomplete wizard data can be saved as DRAFT.
- **PROD-OP-002**: Resume Draft. Verifies wizard state restoration to the exact `current_setup_step` and pre-filling fields.
- **PROD-OP-003**: Duplicate product. Verifies duplicating copies metadata but resets SKU, Barcode, Stock quantities, and Audit logs.
- **PROD-OP-004**: Soft Archive. Verifies product is hidden from POS searches and Online stores, but historical references, orders, and ledgers are preserved.
- **PROD-OP-005**: Restore Product. Restores archived product to INACTIVE state.
- **PROD-OP-006**: Product Audit Trail. Immutable logging of creation, variant updates, component changes, pricing modifications, and archiving.

---

## 3. Current Test Coverage & Gaps
- **Legacy Product CRUD**: Passed (deprecating).
- **Tenant Admin Product Wizard validation tests**: In Progress.

