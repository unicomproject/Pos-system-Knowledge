# Selected Tenant Permission Final Matrix

<!-- status: Canonical / Locked -->
<!-- last_updated: 2026-08-12 -->

| Permission | Description | Journey | Route | API | Seed (Super Admin) | Entitlement check | Audit action |
|---|---|---|---|---|---|---|---|
| `platform.tenants.view` | View tenant list/detail | 001 precond | `/admin/tenants/:id` | `GET /tenants/{id}` | Grant | None | — |
| `platform.tenants.bootstrap.access` | Enter ST mode + hub | SA-ST-UJ-001 | `/configure` | `GET /bootstrap/summary` | Grant | None | optional `context_entered` |
| `platform.tenants.bootstrap.outlets.manage` | Create bootstrap outlet | SA-ST-UJ-005 | `/configure/outlets/create` | `POST /bootstrap/outlets` | Grant | Outlet module | `outlet_created` |
| `platform.tenants.bootstrap.tills.manage` | Create bootstrap till | SA-ST-UJ-006 | `/configure/tills/create` | `POST /bootstrap/tills` | Grant | Till/POS module | `till_created` |
| `platform.tenants.bootstrap.roles.manage` | Create bootstrap role | SA-ST-UJ-007 | `/configure/roles/create` | `POST /bootstrap/roles` | Grant | Permission catalog | `role_created` |
| `platform.tenants.bootstrap.users.manage` | Add bootstrap user | SA-ST-UJ-008 | `/configure/users/create` | `POST /bootstrap/users` | Grant | User limit | `user_created` |
| `platform.tenants.bootstrap.products.manage` | Manual product bootstrap | SA-ST-UJ-009 | `/configure/products/manual` | `POST /bootstrap/products` | Grant | Catalog module | `product_created` |
| `platform.tenants.bootstrap.products.import` | CSV product bootstrap | SA-ST-UJ-010 | `/configure/products/import` | import endpoints | Grant | Catalog module | `products_imported` |

**Switch (002) and Exit (003)** use `bootstrap.access` + `tenants.view` — no additional permission.

**Confirmation:** No unnecessary permissions created. Eight bootstrap codes + existing `tenants.view`.
