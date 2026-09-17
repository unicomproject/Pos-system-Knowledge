# Workspace permission provisioning

Status: implemented and migrated to configured local Development DB (2026-09-10). Authenticated device acceptance is not claimed.

Workspace entry is an explicit permission, never inferred from operational access:

- `workspace.pos.access`: default CASHIER role; does not grant `pos.till.open`.
- `workspace.tenant_admin.access`: default TENANT_ADMIN role; does not grant POS workspace entry.
- Multiple role grants can give both. Neither grants no workspace access.

`WorkspacePermissions` defines the codes. `TenantRoleSetupCatalog` includes POS entry in cashier provisioning. `TenantAdminBootstrapPermissionCatalog` includes Admin entry as a base grant, and excludes POS entry when reusing cashier operational grants. No runtime role-name authorization is added.

`20260910120000_ProvisionWorkspacePermissions` uses `WorkspacePermissionSeedData` to add missing definitions and role grants across tenants. It resolves existing module/feature IDs through the stable `pos.till.open` and `tenant.dashboard.view` catalog anchors. No new feature, entitlement override, table, column or hardcoded existing ID. The existing entitlement resolver remains authoritative. Permission definitions have TENANT scope, action `access`, system/active flags, descriptive text and no operational parent dependency.

Existing grants and explicit revocations are preserved via ON CONFLICT DO NOTHING. Missing anchor definitions stop the migration rather than silently provisioning incomplete data. Down intentionally preserves access records. Historical Development migration helpers are unchanged; the new forward migration includes existing Development roles, while future tenant provisioning uses the updated catalogs.

Login and token refresh re-resolve effective grants. Existing unexpired JWTs and stored sessions do not change automatically: refresh/re-login is required after deployment. Frontend routing remains unchanged: POS-only auto-selects POS, Admin-only selects Admin, both with no selection show chooser, neither shows no-access. Existing remembered workspace preference remains supported.

Validation: frontend workspace/post-login tests 15 passed; focused backend permission/auth tests 55 passed; additional bootstrap/auth filter 54 passed (overlapping, not additive); real PostgreSQL backfill/effective-resolution integration test 1 passed. Backend build succeeded during EF update; git diff --check passed. Full backend suite was not run.

Applied migration: 20260910120000_ProvisionWorkspacePermissions. Two active TENANT workspace definitions now exist. Current mapping reuses POS pos_checkout and the existing tenant.dashboard.view anchor's product_catalog feature (both currently core); no invented entitlement override. Current DB active grants: CASHIER POS entry 1, TENANT_ADMIN Admin entry 3. The production algorithm is all-tenant and uses role codes, not these counts or account IDs.

Actual TenantAuthRepository effective-resolution verification: cashier001@gmail.com has workspace.pos.access and pos.till.open, not workspace.tenant_admin.access; tenantadmin001@gmail.com has workspace.tenant_admin.access and tenant.dashboard.view, not workspace.pos.access. SQL was executed twice within a rollback-only integration-test transaction; definition/grant counts remained stable. Login/refresh service tests verify both workspace codes in response and token-factory claims using existing test architecture. No password changes or live password login/refresh requests were made; device token contents remain unverified. Re-login after deployment is required to replace old session permissions.
