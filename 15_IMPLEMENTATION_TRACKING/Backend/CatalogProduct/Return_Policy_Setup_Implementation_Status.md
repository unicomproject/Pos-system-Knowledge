<!-- title: Return Policy Setup Implementation Status -->
<!-- status: Completed -->
<!-- system: TM-EPOS MVP -->
<!-- module: CatalogProduct -->
<!-- feature: Return Policy Templates / Return Policy CRUD -->
<!-- last_updated: 2026-07-20 -->

# Return Policy Templates / Return Policy CRUD Implementation Status

## Implementation Status

| Item | Value |
|---|---|
| Feature | Return Policy Templates / Return Policy CRUD |
| Module | CatalogProduct |
| Platform | Backend + Platform Admin UI |
| Status | Completed |
| Backend completed | 2026-07-03 |
| Platform Admin UI completed | 2026-07-20 |
| Tests | Passed |
| Evidence | [[SA-P1-04_Return_Policy_Template_UI_Implementation]] |

## Implemented Scope

- Platform-protected Return Policy Template CRUD under `/api/v1/platform/return-policy-templates`.
- Tenant-protected Return Policy CRUD under `/api/v1/return-policies`.
- New platform/system table `return_policy_templates` with seeded defaults: `NO_RETURN`, `SAME_DAY`, `7DAYS`, `14DAYS`.
- Existing tenant table `return_policies` now includes `status` for soft delete.
- Server-side tenant context from JWT claims; request body does not accept `tenant_id`.
- DTO-based responses only; EF entities are not returned directly.
- Platform permissions: `platform.return_policy_templates.view`, `platform.return_policy_templates.create`, `platform.return_policy_templates.update`, `platform.return_policy_templates.delete`, `platform.return_policy_templates.manage`.
- Tenant permissions: `catalog.return_policies.view`, `catalog.return_policies.create`, `catalog.return_policies.update`, `catalog.return_policies.delete`, `catalog.return_policies.manage`.
- Migration seeds platform permissions, tenant permissions, and development role assignments.
- Platform Admin Angular journey: list, create, detail/edit, delete — [[SA-P1-04_Return_Policy_Template_UI_Implementation]].
## Not Included

- Full Tenant Admin product-to-return-policy assignment UI workflows beyond CRUD.
- Product non-returnable flag/table.
- Return request/refund workflow (see Cashier Return flow docs).
- Customer-facing return policy display API.
- Import/export for return policies.

## Development seed assignment (2026-07-18)

Migration `20260718180000_AssignReturnPolicyToExistingPosProducts` creates tenant policy `DEV-14DAYS` (`dddd0001-0014-4000-8000-000000000001`) as default and sets `products.return_policy_id` for ACTIVE sellable `MER-%` products that had no policy. This unblocks POS Return Step 3 for seeded merchandise such as `MER-006-SIZE-8`.