# Selected Tenant UI ↔ API Mapping

<!-- status: Canonical / Locked -->
<!-- last_updated: 2026-08-12 -->

| Screen | Journey | User Action | API | Request body | Success | Error mapping | Permission | Entitlement | Audit |
|---|---|---|---|---|---|---|---|---|---|
| ST-01 | SA-ST-UJ-001 | Open Configure Tenant | `GET /tenants/{id}` + `GET /bootstrap/summary` | — | 200 summary DTO | 403/404 | `bootstrap.access` + `tenants.view` | per module | optional enter |
| ST-01 | SA-ST-UJ-002 | Switch Tenant | `GET /tenants` + `GET /bootstrap/summary` | new tenantId | 200 | 403 | `bootstrap.access` | — | optional switch |
| ST-01 | SA-ST-UJ-003 | Exit Tenant Context | — (client) | — | navigate | — | `tenants.view` | — | optional exit |
| ST-02 | SA-ST-UJ-005 | Save Outlet | `POST /bootstrap/outlets` | outlet JSON | 201 | 400/403/409 | `bootstrap.outlets.manage` | outlets | `outlet_created` |
| ST-03 | SA-ST-UJ-006 | Save Till | `POST /bootstrap/tills` | till JSON | 201 | 409 dep | `bootstrap.tills.manage` | tills | `till_created` |
| ST-04 | SA-ST-UJ-007 | Save Role | `POST /bootstrap/roles` | role JSON | 201 | 400/403 | `bootstrap.roles.manage` | catalog | `role_created` |
| ST-05 | SA-ST-UJ-008 | Save User | `POST /bootstrap/users` | user JSON | 201 | 409 email | `bootstrap.users.manage` | user limit | `user_created` |
| ST-06A | SA-ST-UJ-009 | Save Product | `POST /bootstrap/products` | product JSON | 201 | 400/409 | `bootstrap.products.manage` | catalog | `product_created` |
| ST-06B | SA-ST-UJ-010 | Upload CSV | `POST /bootstrap/products/import/validate` | multipart | 201 batch | 400 | `bootstrap.products.import` | catalog | — |
| ST-06B | SA-ST-UJ-010 | Commit Import | `POST /bootstrap/products/import/{id}/commit` | — | 200 | 409 in-flight | `bootstrap.products.import` | catalog | `products_imported` |
| ST-06B | SA-ST-UJ-010 | Download template | `GET /bootstrap/products/import/template` | — | 200 csv | 403 | `bootstrap.products.import` | catalog | — |

Full API schemas: [[../../05_BACKEND_ARCHITECTURE/Platform_Selected_Tenant_API_Contract]]

Product fields: [[../../03_USER_JOURNEYS/Platform_Admin/Selected_Tenant_Product_Bootstrap_Contract]]

CSV columns: [[../../03_USER_JOURNEYS/Platform_Admin/Selected_Tenant_Product_Import_Contract]]
