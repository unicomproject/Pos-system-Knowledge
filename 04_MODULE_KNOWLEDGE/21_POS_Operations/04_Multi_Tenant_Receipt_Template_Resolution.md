<!-- title: Multi-Tenant Receipt Template Resolution -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-05 -->

# Multi-Tenant Receipt Template Resolution

## 1. Existing Template Tables
The foundation for receipt templates relies on existing tables:
- `receipt_templates`: Template identity and tenant ownership.
- `receipt_template_versions`: Versioned template configuration.
- `receipt_template_assignments`: Template assignment scoping (outlet/till/device).
- `receipts`: Immutable receipt reference and snapshot.

No new receipt template table or column is required for this feature.

## 2. Template, Version, and Assignment Responsibilities
- **Template**: Identifies a group of configuration variations owned by a tenant.
- **Version**: Contains the actual renderable JSON configuration (`template_data`), page size, and active status.
- **Assignment**: Maps a specific version to an execution context (e.g., specific POS device, till, or outlet) over an effective date range.

## 3. Resolution Priority
Templates are resolved in the following priority order, using existing scopes:
1. Active POS Device assignment.
2. Active Till assignment.
3. Active Outlet assignment.
4. Active tenant base/default receipt template.
5. System-safe fallback template.

## 4. Effective Date Rules
- Expired or inactive versions must not be selected.
- The `effective_from` and `effective_to` dates of assignments must encompass the transaction's completion time.

## 5. Tenant Isolation
- Cross-tenant template resolution is forbidden.
- Templates and assignments are rigidly scoped by `tenant_id`.

## 6. Fallback Behavior
- Ambiguous active assignments must fail safely or use a deterministic rule.
- If no tenant template resolves, a system fallback template is used. Use of the fallback template must be observable.
- Resolution failure must not corrupt the completed sale.

## 7. Branding Resolution
- Tenant and outlet branding (merchant name, trading name, logo URL, address, contact details) are resolved at receipt creation time and stored in the snapshot.

## 8. Immutable Receipt Snapshot
- The backend resolves the active receipt template and merges it with the completed transaction facts.
- The output is validated and stored as `receipt_data_json` within the `receipts` table alongside `receipt_template_version_id`.
- This ensures historical reprints accurately reflect the formatting and branding at the time of the sale.

## 9. Historical Reprint Behavior
- Historical reprints must render the immutable `receipt_data_json` exactly as saved.
- Do not fetch the current tenant branding or active template to reconstruct an old receipt.

## 10. Template Data vs Transaction Data Separation
- **Template Data**: Reusable configuration dictates layout, visibility, labels, and styles.
- **Transaction Data**: Immutable facts like sale number, products, totals, and tenders cannot be overridden by templates.

## 11. Current Implementation Gaps
- **Database/entity foundation**: Existing.
- **Runtime assignment resolution**: Service Implemented (`ReceiptTemplateResolutionService`). Supports priority: POS Device -> Till -> Outlet -> Tenant Default.
- **Tenant & Date filtering**: Service implemented to filter by tenant and active status.
- **Template version selection**: Service implemented.
- **Fallback behavior**: Service implemented to return a fallback JSON string if no templates resolve.
- **Missing Optional Branding**: Not implemented yet.
- **`receipt_template_version_id` population**: Not Implemented. `PosCheckoutRepository` does not yet call the resolution service.
- **Receipt snapshot generation**: Partially Implemented. DTO fields exist and legacy/static JSON is constructed during checkout, but true dynamic snapshot generation merging template data is Not Implemented.
- **Resolved snapshot API exposure**: Implemented. DTOs (`PosCheckoutStartPaymentResponseDto`, `PosReceiptDetailDto`) expose `ReceiptDataJson`.

## 12. Future Tenant Admin Management Separation
- Management capabilities (creating templates, versions, activating assignments) are separate capabilities for the Tenant Admin UI. These are **Not Implemented**.
- The POS application does not manage receipt templates; it only consumes the resolved snapshots.
