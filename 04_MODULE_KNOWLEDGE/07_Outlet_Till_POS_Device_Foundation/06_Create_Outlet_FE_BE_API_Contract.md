# 06 Create Outlet FE BE API Contract

> Last Verified Date: 2026-08-06
> Source basis: `OutletsController.cs` and `TenantAdminOutletsController.cs`

## 1. Current Implemented Endpoints

### 1.1 `OutletsController` (Base CRUD)
- **Get Lookup Options**: `GET /api/v1/outlets/create-options`
  - **Required Permission**: `tenant.outlets.view`
  - **Response 200 OK**:
    ```json
    {
      "outletTypes": [
        { "value": "STORE", "label": "Store" },
        { "value": "WAREHOUSE", "label": "Warehouse" }
      ],
      "timezones": [
        { "value": "America/New_York", "label": "America/New_York (UTC-05:00)" }
      ],
      "defaults": {
        "timezone": "America/New_York",
        "status": "ACTIVE"
      }
    }
    ```

- **Create Outlet**: `POST /api/v1/outlets`
  - **Headers**: `Content-Type: application/json`
  - **Required Permission**: `tenant.outlets.manage`
  - **Request Schema**: See Target Payload in Section 2.
  - **Response 201 Created**: Returns created Outlet entity ID.

- **Get Details**: `GET /api/v1/outlets/{id}`
  - **Required Permission**: `tenant.outlets.view`

### 1.2 `TenantAdminOutletsController`
- **Set/Assign Manager**: `PUT /api/v1/tenant-admin/outlets/{id}/manager`
  - **Request Body**: `{ "tenantUserId": "uuid" }`
- **Revoke Manager**: `DELETE /api/v1/tenant-admin/outlets/{id}/manager`
- **Set Image Reference**: `PUT /api/v1/tenant-admin/outlets/{id}/image`
  - **Request Body**: `{ "mediaAssetId": "uuid" }`
- **Remove Image**: `DELETE /api/v1/tenant-admin/outlets/{id}/image`

---

## 2. Target API Payload (`POST /api/v1/outlets`)

This represents the proposed payload structure to fully cover the four-step wizard values:

### 2.1 Request Example
```json
{
  "outletName": "Downtown Store",
  "outletType": "STORE",
  "status": "ACTIVE",
  "timezone": "Asia/Colombo",
  "managerTenantUserId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "phone": "+94770000000",
  "email": "downtown@oneverz.com",
  "isCentralOutlet": false,
  "isDefaultTillOutlet": false,
  "address": {
    "addressLine1": "123 Main Street",
    "addressLine2": null,
    "city": "Colombo",
    "stateOrProvince": "Western",
    "postalCode": "00100",
    "countryCode": "LK",
    "contactName": "James Anderson",
    "contactPhone": "+94770000000",
    "contactEmail": "operations@oneverz.com"
  },
  "regularHours": [
    {
      "dayOfWeek": 1,
      "openingTime": "08:00:00",
      "closingTime": "22:00:00",
      "isClosed": false,
      "spansNextDay": false
    }
  ],
  "specialHours": [
    {
      "specialDate": "2025-12-25",
      "name": "Christmas Day",
      "openingTime": "09:00:00",
      "closingTime": "18:00:00",
      "isClosed": false,
      "spansNextDay": false
    }
  ],
  "mediaAssetId": "8f3b9c8c-1234-5678-abcd-ef1234567890"
}
```

### 2.2 Response Codes

| Status Code | Code Identifier | Description |
|---|---|---|
| **201 Created** | — | Outlet created successfully. Returns payload details. |
| **400 Bad Request** | `outlet.validation_failed` | One or more inputs failed validation. Includes details. |
| **401 Unauthorized** | `outlet.invalid_tenant_context` | Unauthenticated or invalid token claims. |
| **403 Forbidden** | `outlet.permission_denied` | Insufficient permissions to manage outlets. |
| **409 Conflict** | `outlet.duplicate_code` | Generated outlet code conflicts with existing record. |
| **422 Unprocessable** | `outlet.limit_reached` | Subscription outlet limit reached. |
