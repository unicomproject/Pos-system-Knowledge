# Second Brain Alignment Report: Tenant Admin Outlets

**Date:** 2026-08-04
**Scope:** Tenant Admin Outlets (Target UI)

## 1. Overview
This report summarizes the modifications made to the Second Brain documentation to align it with the mandatory architectural decisions and the Target UI requirements for the Tenant Admin Outlets module.

## 2. Updated Documents

### 2.1 Functional Rules
- **Path:** `04_MODULE_KNOWLEDGE/07_Outlet_Till_POS_Device_Foundation/02_Functional_Rules.md`
- **Changes:**
  - Added new **Functional Requirements** section mapping directly to the Target UI (Split-view, Debounce search, Status/Health filters).
  - Clarified **Business Rules** regarding derived Operational Health (`NEEDS_ATTENTION`) versus persisted lifecycle Status.
  - Added definitions for canonical Sales, Stock Valuation, and Open Orders calculations.
  - Specified image validation and manager assignment business logic.
  - Defined permissions mapping for all Target UI interactions.

### 2.2 User Journeys
- **Path:** `03_USER_JOURNEYS/Tenant_Admin/04_Outlet_Management_Flow.md`
- **Changes:**
  - Authored a comprehensive user journey for the Outlet Management workflow, including Split-Panel Details, Search/Filter, Manager Assignment, Image Upload, and responsive interactions.

### 2.3 API Endpoints
- **Path:** `05_BACKEND_ARCHITECTURE/API_ENDPOINTS.md`
- **Changes:**
  - Added the **Tenant Admin Outlets API Endpoints** section.
  - Proposed the canonical aggregate endpoint: `GET /api/v1/tenant-admin/outlets/{outletId}/overview`.
  - Defined the response JSON structure for the overview, aggregating Info, Manager, Tills, Sales, Stock, Orders, and Health without mutating the base data.
  - Proposed new mutation endpoints: `PUT .../manager` and `PUT/DELETE .../image`.

### 2.4 Database Knowledge
- **Path:** `06_DATABASE_KNOWLEDGE/Tables/08_Outlet_Till_And_POS_Device_Foundation_UPDATED.md`
- **Changes:**
  - Proposed `media_asset_id` (FK to `media_assets`) in the `outlets` table to properly leverage the existing MediaAsset architecture without duplicating media handling.

- **Path:** `06_DATABASE_KNOWLEDGE/Tables/06_Tenant_Users_Roles_Permissions_And_Outlet_Access_UPDATED.md`
- **Changes:**
  - Proposed `is_primary_manager` in the `outlet_user_roles` mapping table to support manager assignment without relying on role names (e.g. "Manager").

## 3. Mandatory Architectural Decisions Fulfilled

1. **Aggregate Endpoint:** The `GET .../overview` endpoint has been documented in `API_ENDPOINTS.md` as the single canonical source for the detail panel.
2. **Lifecycle & Operational Health:** `02_Functional_Rules.md` now explicitly separates `ACTIVE`/`INACTIVE` lifecycle statuses from the derived `NEEDS_ATTENTION` operational health state.
3. **Manager Mapping:** Added `is_primary_manager` to `outlet_user_roles` instead of using a hardcoded role check, enforcing the feature-based permissions requirement.
4. **Media Architecture:** Reused the `MediaAsset` strategy by proposing a `media_asset_id` on the `outlets` table.
5. **Metrics Reusability:** The `stockValue` (Remaining cost layers) and open orders (Not Completed/Cancelled) definitions reuse canonical backend logic outlined in `REPORT_CALCULATION_DEFINITIONS.md`.

## 4. Next Steps
Task 1 (Second Brain Alignment) is now complete. The updated documentation will serve as the strict contract and source of truth for **Task 2 (Backend Implementation)** and **Task 3 (Flutter Implementation)**.
