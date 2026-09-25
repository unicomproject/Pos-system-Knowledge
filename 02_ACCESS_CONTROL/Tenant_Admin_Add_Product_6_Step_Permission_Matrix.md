<!-- title: Tenant Admin Add Product 6-Step Permission Matrix -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-20 -->
<!-- canonical_authority: 6-step wizard -->

# Tenant Admin Add Product 6-Step Permission Matrix

## 1. Purpose

Canonical permission contract for the Tenant Admin **6-Step Add Product Wizard**, including Step 5 Product Tracking (Quantity opening stock, Batch/Batch+Expiry identity).

This is the authoritative permission matrix. The old 7-step matrix is superseded.

---

## 2. Canonical Permission Namespace

**ACTIVE R1 Permissions:**
```
catalog.products.create
catalog.products.update
catalog.products.publish
catalog.variants.manage
catalog.barcodes.manage
catalog.product_pricing.manage
catalog.product_media.manage
```

**Feature Entitlement:**
```
product_catalog (base Product Setup)
inventory_tracking (advanced tracking)
```

---

## 3. Step-by-Step Permission Matrix

| Step | Area | Permission Required | Entitlement | Notes |
|---|---|---|---|---|
| **1** | Scan Barcode | `catalog.products.create` | `product_catalog` | Barcode resolution; no new permission |
| **2** | Basic Details | `catalog.products.create` / `update` | `product_catalog` | Product master mutation |
| **2** | Images | + `catalog.product_media.manage` | `product_catalog` | Image upload/stage |
| **2** | Channels | + `catalog.product_channels.manage` | `product_catalog` | Channel visibility |
| **3** | Product Type Selection | `catalog.products.create` / `update` | `product_catalog` | Structure configuration |
| **3** | Simple Units/Packs | Same | `product_catalog` | UOM configuration; no stock.adjust required |
| **3** | Variant Matrix | + `catalog.variants.manage` | `product_catalog` | Variant configuration |
| **3** | SKU/Barcode | + `catalog.barcodes.manage` | `product_catalog` | Identifier assignment |
| **4** | Pricing & Tax | + `catalog.product_pricing.manage` | `product_catalog` | Price entry; tax assignment |
| **5** | Tracking Method Selection | `catalog.products.create` / `update` | `product_catalog` | Policy selection |
| **5** | Quantity Opening Stock | + `tenant.stock.opening` (if exists) | `product_catalog` + `inventory_tracking` (VERIFY) | Actual stock mutation |
| **5** | Quantity Outlet Allocation | Same | Same | Outlet authorization required |
| **5** | Batch Initial Identity | Same | `inventory_tracking` (if non-empty) | Identity-only; no stock.adjust |
| **5** | Batch+Expiry Identity | Same | `inventory_tracking` (if non-empty) | Identity-only; no stock.adjust |
| **6** | Review & Create | `catalog.products.publish` + subgraph recheck | `product_catalog` | Final publish |

---

## 4. Step 5 Quantity Opening Stock (Target Requirement)

**Accessing Quantity method:**
```
catalog.products.create/update + product_catalog
```

**Entering/Publishing Opening Stock (actual mutation):**

Target requirement (if canonical permission exists):
```
tenant.stock.opening
+
authorized outlet scope
```

**Entitlement for Quantity:**

Status: **VERIFY DURING BACKEND AUDIT**

Do NOT assume. Confirm whether `inventory_tracking` is required for Quantity stock creation or only for Batch/Expiry/Serial policy.

Backend remains authoritative.

---

## 5. Backend Authorization Rules

1. Authenticate user
2. Validate tenant context
3. Check active tenant + user lifecycle
4. Verify feature entitlement
5. Check permission active status
6. Verify role assignment
7. Validate permission not revoked
8. Check tenant ownership
9. Check resource ownership
10. Validate operation-specific permission

---

## 6. Authorization Response Codes

| Scenario | HTTP Status | Code |
|---|---|---|
| Missing/invalid JWT | 401 | No resource hint |
| Missing permission | 403 | `product.permission_denied` |
| Missing entitlement | 403 | `product.entitlement_denied` |
| Cross-tenant access | 404 | Existence never disclosed |
| Identifier conflict | 409 | Safe conflict projection |

---

## 7. Related Documents

- [[../04_MODULE_KNOWLEDGE/10_Product_Core/06_Tenant_Admin_Add_Product_6_Step_Contract.md]] (main contract)
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md]] (Step 5 detail)
- [[Permission_Code_List.md]] (full permission catalog)
- [[../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md]] (decision)

---

**SUPERSEDES:** `Tenant_Admin_Add_Product_7_Step_Permission_Matrix.md`

**STATUS:** Active 6-Step Canonical Matrix
