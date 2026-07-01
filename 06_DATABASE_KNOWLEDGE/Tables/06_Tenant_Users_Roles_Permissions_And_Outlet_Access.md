<!-- title: Tenant Users, Roles, Permissions & Outlet Access -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 06. Tenant Users, Roles, Permissions & Outlet Access

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `tenant_users` | Stores tenant users records for this module. |
| `role_templates` | Stores role templates records for this module. |
| `role_template_versions` | Stores role template versions records for this module. |
| `role_template_version_permissions` | Stores role template version permissions records for this module. |
| `tenant_roles` | Stores tenant roles records for this module. |
| `tenant_role_permissions` | Stores tenant role permissions records for this module. |
| `permission_definitions` | Stores permission definitions records for this module. |
| `tenant_user_roles` | Stores tenant user roles records for this module. |
| `tenant_user_permissions` | Stores tenant user permissions records for this module. |
| `outlet_user_roles` | Stores outlet user roles records for this module. |
| `outlet_user_permissions` | Stores outlet user permissions records for this module. |

## tenant_users

Module: Tenant Users, Roles, Permissions & Outlet Access

Purpose: Stores tenant users records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. Unique business key. Partial unique where normalized_phone IS NOT NULL. |
| normalized_email | citext | UNIQUE | Unique business key. |
| normalized_phone | varchar(40) | UNIQUE | Unique business key. Partial unique where normalized_phone IS NOT NULL. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'INVITED', 'LOCKED', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, normalized_email)
UNIQUE(tenant_id, normalized_phone) WHERE normalized_phone IS NOT NULL
CHECK(status IN ('ACTIVE', 'INACTIVE', 'INVITED', 'LOCKED', 'DELETED'))
```

## role_templates

Module: Tenant Users, Roles, Permissions & Outlet Access

Purpose: Stores role templates records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| template_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(template_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## role_template_versions

Module: Tenant Users, Roles, Permissions & Outlet Access

Purpose: Stores role template versions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| role_template_id | uuid | FK NOT UNIQUE | References `role_templates(id)`. Unique business key. |
| version_number | integer | UNIQUE CHECK | Unique business key. CHECK(version_number > 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(role_template_id) REFERENCES role_templates(id)
UNIQUE(role_template_id, version_number)
CHECK(version_number > 0)
```

## role_template_version_permissions

Module: Tenant Users, Roles, Permissions & Outlet Access

Purpose: Stores role template version permissions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| description | text | NULL | Description or notes. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| permission_definition_id | uuid | FK NOT UNIQUE | References `permission_definitions(id)`. Unique business key. |
| role_template_version_id | uuid | FK NOT UNIQUE | References `role_template_versions(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(role_template_version_id) REFERENCES role_template_versions(id)
FK(permission_definition_id) REFERENCES permission_definitions(id)
UNIQUE(role_template_version_id, permission_definition_id)
```

## tenant_roles

Module: Tenant Users, Roles, Permissions & Outlet Access

Purpose: Stores tenant roles records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| role_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| role_template_version_id | uuid | FK NOT | References `role_template_versions(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(role_template_version_id) REFERENCES role_template_versions(id)
UNIQUE(tenant_id, role_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## tenant_role_permissions

Module: Tenant Users, Roles, Permissions & Outlet Access

Purpose: Stores tenant role permissions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| description | text | NULL | Description or notes. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| permission_definition_id | uuid | FK NOT UNIQUE | References `permission_definitions(id)`. Unique business key. |
| tenant_role_id | uuid | FK NOT UNIQUE | References `tenant_roles(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_role_id) REFERENCES tenant_roles(id)
FK(permission_definition_id) REFERENCES permission_definitions(id)
UNIQUE(tenant_role_id, permission_definition_id)
```

## permission_definitions

Module: Tenant Users, Roles, Permissions & Outlet Access

Purpose: Stores permission definitions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| permission_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(permission_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## tenant_user_roles

Module: Tenant Users, Roles, Permissions & Outlet Access

Purpose: Stores tenant user roles records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_user_id | uuid | FK NULL UNIQUE | References `tenant_users(id)`. Unique business key. |
| description | text | NULL | Description or notes. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| tenant_role_id | uuid | FK NOT UNIQUE | References `tenant_roles(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_user_id) REFERENCES tenant_users(id)
FK(tenant_role_id) REFERENCES tenant_roles(id)
UNIQUE(tenant_user_id, tenant_role_id)
```

## tenant_user_permissions

Module: Tenant Users, Roles, Permissions & Outlet Access

Purpose: Stores tenant user permissions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_user_id | uuid | FK NULL UNIQUE | References `tenant_users(id)`. Unique business key. |
| description | text | NULL | Description or notes. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| permission_definition_id | uuid | FK NOT UNIQUE | References `permission_definitions(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_user_id) REFERENCES tenant_users(id)
FK(permission_definition_id) REFERENCES permission_definitions(id)
UNIQUE(tenant_user_id, permission_definition_id)
```

## outlet_user_roles

Module: Tenant Users, Roles, Permissions & Outlet Access

Purpose: Stores outlet user roles records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_user_id | uuid | FK NULL UNIQUE | References `tenant_users(id)`. Unique business key. |
| outlet_id | uuid | FK NULL UNIQUE | References `outlets(id)`. Unique business key. |
| description | text | NULL | Description or notes. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| tenant_role_id | uuid | FK NOT UNIQUE | References `tenant_roles(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(outlet_id) REFERENCES outlets(id)
FK(tenant_user_id) REFERENCES tenant_users(id)
FK(tenant_role_id) REFERENCES tenant_roles(id)
UNIQUE(outlet_id, tenant_user_id, tenant_role_id)
```

## outlet_user_permissions

Module: Tenant Users, Roles, Permissions & Outlet Access

Purpose: Stores outlet user permissions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_user_id | uuid | FK NULL UNIQUE | References `tenant_users(id)`. Unique business key. |
| outlet_id | uuid | FK NULL UNIQUE | References `outlets(id)`. Unique business key. |
| description | text | NULL | Description or notes. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| permission_definition_id | uuid | FK NOT UNIQUE | References `permission_definitions(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(outlet_id) REFERENCES outlets(id)
FK(tenant_user_id) REFERENCES tenant_users(id)
FK(permission_definition_id) REFERENCES permission_definitions(id)
UNIQUE(outlet_id, tenant_user_id, permission_definition_id)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
