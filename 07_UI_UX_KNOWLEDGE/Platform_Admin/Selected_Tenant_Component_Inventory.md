# Selected-Tenant Component Inventory

**Date:** 2026-08-12  
**Status:** Conceptual component contracts — **not** production Angular components  

---

## SelectedTenantContextHeader

| Attribute | Specification |
|---|---|
| **Purpose** | Persistent ST-UX-001 tenant awareness |
| **Inputs** | `tenantName`, `tenantCode`, `lifecycleStatus`, `planName`, `isSuspended` |
| **States** | default, suspended-warning |
| **Actions** | `exitContext`, `switchTenant` (optional) |
| **Visibility** | All Selected-Tenant routes |
| **Permissions** | `platform.tenants.view` |
| **A11y** | `role="region"` `aria-label="Selected tenant context"` |
| **Responsive** | Stack vertically <768px; Exit full-width on narrow |

## SelectedTenantStatusChip

| **Purpose** | Lifecycle badge in context header |
| **Inputs** | `status` enum |
| **States** | draft, pending_payment, pending_activation, active, suspended, cancelled |

## TenantContextExitAction

| **Purpose** | Exit Selected-Tenant Mode |
| **Actions** | Emits `exitRequested`; confirms if dirty |
| **Journey** | SA-ST-UJ-003 |

## TenantSwitcher

| **Purpose** | Switch selected tenant |
| **Inputs** | `tenants[]`, `currentTenantId` |
| **Journey** | SA-ST-UJ-002 |

## SetupModuleCard

| **Purpose** | Hub module tile |
| **Inputs** | `title`, `description`, `status`, `summary`, `dependencyNotice`, `configureRoute`, `disabled`, `disabledReason` |
| **States** | NOT_STARTED, IN_PROGRESS, CONFIGURED, NOT_REQUIRED, NOT_ENTITLED |
| **Actions** | Configure CTA |

## SetupDependencyNotice

| **Purpose** | Explain blocked module (e.g. till needs outlet) |
| **Inputs** | `message`, `resolveRoute` |

## EntitlementBlockedState

| **Purpose** | Full-page feature-not-enabled |
| **Journey** | Contract error state |

## PermissionDeniedState

| **Purpose** | Full-page missing permission |
| **Journey** | Contract error state |

## TenantSuspendedState

| **Purpose** | Read-only hub overlay / mutation block |
| **Inputs** | `suspendedAt`, `reason` optional |

## SetupProgressSummary

| **Purpose** | Handoff panel on hub |
| **Inputs** | `tenantAdminInviteStatus`, `operationalSetupLabel` |

## JourneySuccessBanner

| **Purpose** | Transient success after bootstrap action |
| **Inputs** | `message`, `dismissible` |

## BootstrapFormFooter

| **Purpose** | Sticky Cancel + Primary |
| **Actions** | cancel, submit |

## CsvImportPreviewTable

| **Purpose** | ST-06B validation preview |
| **Inputs** | `rows[]`, `errors[]` |

## OnlineStoreBootstrapForm

| Attribute | Specification |
|---|---|
| **Purpose** | ST-07 initial Online Store readiness |
| **Inputs** | `storeStatus`, `taxDisplayMode`, `entitled`, `clickCollectNotice` |
| **States** | default, validation, not_entitled, dependency_notice, success |
| **Actions** | save (`PUT`), cancel |
| **Journey** | SA-ST-UJ-011 / SA-UJ-057 |
| **Permission** | `platform.tenants.bootstrap.online_store.manage` |
| **Entitlement** | Effective `online_store` |
| **Fields** | `storeStatus` required (`DRAFT`\|`ACTIVE`); `taxDisplayMode` optional (`MATCH_TENANT`) |

## PermissionGroupSelector

| **Purpose** | ST-04 entitlement-filtered permissions |
| **Inputs** | `groups[]`, `entitledFeatureCodes[]` |
