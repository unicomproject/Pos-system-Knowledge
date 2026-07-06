<!-- title: Tenant Users, Roles, Permissions & Outlet Access -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-06 -->
<!-- source: Updated from uploaded ERD image: 06_Tenant Users, Roles, Permissions & Outlet Access.png -->

# 06. Tenant Users, Roles, Permissions & Outlet Access

## Purpose

This file documents the database tables, attributes, keys, nullability, indexes, constraints, and external reference entities for this module.

## ERD Update Rule

This markdown version follows the uploaded ERD image as the source of truth. Table names, column names, data types, PK/FK markers, NULL/NOT NULL rules, and notes were updated to match the ERD image.

Enum/domain-style data types are not used in this document. Status/type/action columns are written as `varchar(...)`, with CHECK constraints or backend constants expected where applicable.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `tenant_users` | Stores tenant user login/profile/access base records. |
| `role_templates` | Stores default role template masters. |
| `role_template_versions` | Stores versioned role template definitions. |
| `role_template_version_permissions` | Stores permission rows assigned to a role template version. |
| `tenant_roles` | Stores tenant-owned roles created from templates or custom roles. |
| `tenant_role_permissions` | Stores permission rows granted/revoked for tenant roles. |
| `permission_definitions` | Stores platform permission definition catalog. |
| `tenant_user_roles` | Stores tenant-level role assignments for users. |
| `tenant_user_permissions` | Stores direct tenant-level permission assignments for users. |
| `outlet_user_roles` | Stores outlet-scoped role assignments for users. |
| `outlet_user_permissions` | Stores outlet-scoped direct permission assignments for users. |

---

## `tenant_users`

Purpose: Stores tenant user login/profile/access base records.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `email` | varchar(255) |  | NOT NULL | Tenant user email/login identifier. |
| `encrypted_password` | varchar(255) |  | NOT NULL | Encrypted/hashed password value. |
| `phone` | varchar(20) |  | NULL | Masked/display phone value. |
| `unmasked_phone` | varchar(25) |  | NULL | Raw phone value used for uniqueness/search. |
| `password_` | text |  | NULL | Password-related field as shown in ERD image. Raw passwords should not be stored in production. |
| `password_salt` | varchar(255) |  | NOT NULL | Password salt. |
| `full_name` | varchar(255) |  | NOT NULL | User full name. |
| `display_name` | varchar(500) |  | NULL | User display name. |
| `profile_image_url` | uuid | FK | NULL | ERD marks this as FK uuid. |
| `outlet_id` | uuid | FK | NULL | References `outlets(id)`. |
| `default_outlet_id` | varchar(50) |  | NOT NULL | Default outlet identifier as shown in ERD image. |
| `user_type` | varchar(20) |  | NOT NULL | User type. |
| `account_status` | varchar(20) |  | NOT NULL | Account lifecycle status. |
| `locked_until` | timestamp |  | NULL | Lock expiry timestamp. |
| `failed_login_attempts` | int |  | NOT NULL | Failed login attempt count. |
| `password_change_required_at` | timestamp |  | NULL | Timestamp when password change is required. |
| `accepted_privacy_terms` | boolean |  | NOT NULL | Privacy terms acceptance flag. |
| `accepted_terms_version` | varchar(10) |  | NOT NULL | Accepted terms version. |
| `created_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `source_user_type` | varchar(50) |  | NOT NULL | Source user type. |
| `notes` | text |  | NULL | Notes. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(outlet_id) REFERENCES outlets(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, email, unmasked_phone)
CHECK(locked_until IS NULL OR locked_until > now())
CHECK(source_user_type IN ('admin', 'outlet', 'platform'))
```

---

## `role_templates`

Purpose: Stores default role template masters.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `template_code` | varchar(100) |  | NOT NULL | Template code. |
| `template_name` | varchar(255) |  | NOT NULL | Template name. |
| `description` | text |  | NULL | Template description. |
| `is_default` | boolean |  | NOT NULL | Default template flag. |
| `is_active` | boolean |  | NOT NULL | Active flag. |
| `created_by_tenant_user_id` | uuid | FK | NOT NULL | References `tenant_users(id)`. |
| `updated_by_tenant_user_id` | uuid | FK | NOT NULL | References `tenant_users(id)`. |
| `created_at` | timestamp |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamp |  | NOT NULL | Last update timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(template_code)
```

---

## `role_template_versions`

Purpose: Stores versioned role template definitions.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `role_template_id` | uuid | FK | NOT NULL | References `role_templates(id)`. |
| `version_number` | int |  | NOT NULL | Template version number. |
| `version_label` | varchar(100) |  | NULL | Version label. |
| `is_active` | boolean |  | NOT NULL | Active flag. |
| `effective_from` | timestamp |  | NOT NULL | Version effective start. |
| `effective_until` | timestamp |  | NULL | Version effective end. |
| `created_by_tenant_user_id` | uuid | FK | NOT NULL | References `tenant_users(id)`. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(role_template_id) REFERENCES role_templates(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(role_template_id, version_number)
CHECK(effective_until IS NULL OR effective_until > effective_from)
```

---

## `role_template_version_permissions`

Purpose: Stores permission rows assigned to a role template version.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `role_template_version_id` | uuid | FK | NOT NULL | References `role_template_versions(id)`. |
| `permission_id` | uuid | FK | NOT NULL | References `permission_definitions(id)`. |
| `is_active` | boolean |  | NOT NULL | Active flag. |
| `created_at` | timestamp |  | NOT NULL | Creation timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(role_template_version_id) REFERENCES role_template_versions(id)
FK(permission_id) REFERENCES permission_definitions(id)
UNIQUE(role_template_version_id, permission_id)
CHECK(is_active IN (true, false))
```

---

## `tenant_roles`

Purpose: Stores tenant-owned roles created from templates or custom roles.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `source_role_template_id` | uuid | FK | NULL | References `role_templates(id)`. |
| `source_role_template_version_id` | uuid | FK | NULL | References `role_template_versions(id)`. |
| `role_name` | varchar(255) |  | NOT NULL | Role name. |
| `role_code` | varchar(100) |  | NOT NULL | Tenant role code. |
| `role_description` | text |  | NULL | Role description. |
| `is_custom` | boolean |  | NULL | Custom role flag. |
| `is_active` | boolean |  | NOT NULL | Active flag. |
| `created_by_tenant_user_id` | uuid | FK | NOT NULL | References `tenant_users(id)`. |
| `updated_by_tenant_user_id` | uuid | FK | NOT NULL | References `tenant_users(id)`. |
| `created_at` | timestamp |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamp |  | NOT NULL | Last update timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(source_role_template_id) REFERENCES role_templates(id)
FK(source_role_template_version_id) REFERENCES role_template_versions(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, role_code)
UNIQUE(tenant_id, role_name)
-- ERD note: when is_default_role_template = true
```

---

## `tenant_role_permissions`

Purpose: Stores permission rows granted/revoked for tenant roles.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `role_id` | uuid | FK | NOT NULL | References `tenant_roles(id)`. |
| `permission_id` | uuid | FK | NOT NULL | References `permission_definitions(id)`. |
| `granted_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `revoked_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `granted_at` | timestamp |  | NULL | Granted timestamp. |
| `revoked_at` | timestamp |  | NULL | Revoked timestamp. |
| `notes` | text |  | NULL | Notes. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(role_id) REFERENCES tenant_roles(id)
FK(permission_id) REFERENCES permission_definitions(id)
FK(granted_by_tenant_user_id) REFERENCES tenant_users(id)
FK(revoked_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, role_id, permission_id)
-- ERD note: when revoked_at is null
```

---

## `permission_definitions`

Purpose: Stores platform permission definition catalog.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `permission_code` | varchar(100) |  | NOT NULL | Unique permission code. |
| `module_id` | uuid | FK | NOT NULL | References `platform_modules(id)`. |
| `feature_id` | uuid | FK | NOT NULL | References `platform_features(id)`. |
| `action_type` | varchar(50) | FK | NOT NULL | Action type as shown in ERD. |
| `description` | text |  | NULL | Permission description. |
| `is_system` | boolean |  | NOT NULL | System permission flag. |
| `is_active` | boolean |  | NOT NULL | Active flag. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(module_id) REFERENCES platform_modules(id)
FK(feature_id) REFERENCES platform_features(id)
UNIQUE(permission_code)
```

---

## `tenant_user_roles`

Purpose: Stores tenant-level role assignments for users.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `user_id` | uuid | FK | NOT NULL | References `tenant_users(id)`. |
| `role_id` | uuid | FK | NOT NULL | References `tenant_roles(id)`. |
| `assigned_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `assigned_by_tenant_user_id` | uuid | FK | NULL | Duplicate attribute row visible in ERD image; kept to preserve image fidelity. Validate before database migration. |
| `assigned_at` | timestamp |  | NULL | Assigned timestamp. |
| `revoked_at` | timestamp |  | NULL | Revoked timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(user_id) REFERENCES tenant_users(id)
FK(role_id) REFERENCES tenant_roles(id)
FK(assigned_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, user_id, role_id)
CHECK(revoked_at IS NULL OR revoked_at > assigned_at)
-- ERD note: OR effective_from or revoked_at
```

---

## `tenant_user_permissions`

Purpose: Stores direct tenant-level permission assignments for users.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `user_id` | uuid | FK | NOT NULL | References `tenant_users(id)`. |
| `permission_id` | uuid | FK | NOT NULL | References `permission_definitions(id)`. |
| `assigned_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `assigned_by_tenant_user_id` | uuid | FK | NULL | Duplicate attribute row visible in ERD image; kept to preserve image fidelity. Validate before database migration. |
| `assigned_at` | timestamp |  | NULL | Assigned timestamp. |
| `revoked_at` | timestamp |  | NULL | Revoked timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(user_id) REFERENCES tenant_users(id)
FK(permission_id) REFERENCES permission_definitions(id)
FK(assigned_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, user_id, permission_id)
-- ERD note: OR effective_from or revoked_at
```

---

## `outlet_user_roles`

Purpose: Stores outlet-scoped role assignments for users.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `outlet_id` | uuid | FK | NOT NULL | References `outlets(id)`. |
| `user_id` | uuid | FK | NOT NULL | References `tenant_users(id)`. |
| `role_id` | uuid | FK | NOT NULL | References `tenant_roles(id)`. |
| `assigned_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `revoked_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `assigned_at` | timestamp |  | NULL | Assigned timestamp. |
| `revoked_at` | timestamp |  | NULL | Revoked timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(outlet_id) REFERENCES outlets(id)
FK(user_id) REFERENCES tenant_users(id)
FK(role_id) REFERENCES tenant_roles(id)
FK(assigned_by_tenant_user_id) REFERENCES tenant_users(id)
FK(revoked_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, outlet_id, user_id, role_id)
CHECK(revoked_at IS NULL OR revoked_at > assigned_at)
-- ERD note: OR effective_from or revoked_at
```

---

## `outlet_user_permissions`

Purpose: Stores outlet-scoped direct permission assignments for users.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `outlet_id` | uuid | FK | NOT NULL | References `outlets(id)`. |
| `user_id` | uuid | FK | NOT NULL | References `tenant_users(id)`. |
| `permission_id` | uuid | FK | NOT NULL | References `permission_definitions(id)`. |
| `assigned_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `revoked_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `assigned_at` | timestamp |  | NULL | Assigned timestamp. |
| `revoked_at` | timestamp |  | NULL | Revoked timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(outlet_id) REFERENCES outlets(id)
FK(user_id) REFERENCES tenant_users(id)
FK(permission_id) REFERENCES permission_definitions(id)
FK(assigned_by_tenant_user_id) REFERENCES tenant_users(id)
FK(revoked_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, outlet_id, user_id, permission_id)
-- ERD note: OR effective_from or revoked_at
```

---

## Reference Entities (External)

| Table | Key Fields | Note |
| --- | --- | --- |
| `tenants` | id uuid PK, tenant_code varchar(100), domain varchar(200), status varchar(20) | Tenant reference. |
| `outlets` | id uuid PK, tenant_id uuid FK, outlet_code varchar(100), outlet_name varchar(200), status varchar(20) | Outlet reference. |
| `platform_users` | id uuid PK, email varchar(255), full_name varchar(255), role_code varchar(50), status varchar(20) | Platform user reference. |
| `platform_modules` | id uuid PK, module_code varchar(100), module_name varchar(200), status varchar(20) | Permission module reference. |
| `platform_features` | id uuid PK, module_id uuid FK, feature_code varchar(100), feature_name varchar(150), status varchar(20) | Permission feature reference. |

## Image Fidelity Notes

- The ERD image labels both `tenant_user_permissions` and `outlet_user_roles` as table number `10`; the entity table names are still unique and both are documented.
- The ERD image shows `assigned_by_tenant_user_id` twice inside `tenant_user_roles` and `tenant_user_permissions`. The duplicate rows are preserved in this documentation for image fidelity and flagged in the double-check report.
- The ERD image note mentions `effective_from` in assignment tables, but `effective_from` is not visible as an attribute in those entity cards.

## Related Files

- [[03_Catalog_Plans_Addons_Entitlements]]
- [[07_Invitations_Authentication_Tokens_And_Security_Audit]]
- [[08_Outlet_Till_POS_Device_Foundation]]
