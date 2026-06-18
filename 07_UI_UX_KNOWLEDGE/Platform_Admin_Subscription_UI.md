<!-- title: Platform Admin Subscription UI -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-17 -->

# Platform Admin Subscription UI

## Scope

Super Admin subscription plan template management only. This is not a tenant
purchase or payment checkout flow.

## Routes

| Route | Page |
|---|---|
| `/admin/subscriptions` | Subscription Plans list |
| `/admin/subscriptions/create` | Create Subscription Plan wizard |

Sidebar item **Subscriptions** stays active for all routes under
`/admin/subscriptions/*`. No hardcoded notification badge on sidebar items.

## List Page

### Header

- Breadcrumb: `Subscriptions / Plans`
- Title: **Subscription Plans**
- Subtitle: Create and manage plan templates for tenants.
- Primary action: **Create Plan** → `/admin/subscriptions/create` (plus icon)

Search input appears only on the list page, not on create/edit pages.

### Status Tabs

Tabs with counts from API `statusCounts` (never hardcoded):

| Tab | Filter |
|---|---|
| All | No status filter |
| Draft | `status=draft` |
| Published | `status=published` |
| Archived | `status=archived` |

### Filters (combined with tabs and search)

- Plan Type: All, Free, Trial, Paid, Custom
- Status: All, Draft, Published, Archived
- Billing Cycle: All, Monthly, Annual, Both
- Currency: All, LKR, USD, GBP, EUR
- Search: debounced (300ms), matches plan name and plan code

### Table Columns

Plan Name, Plan Code, Plan Type, Tenant Monthly Price, Tenant Annual Price,
Included Modules, Add-ons, Active Tenants, Status, Last Updated, Actions.

### Status Badges

| Status | Style |
|---|---|
| Published | Green pill |
| Draft | Amber/orange pill |
| Archived | Gray pill |

### Actions

Icon buttons: View, Edit, Duplicate, More menu.

More menu respects API flags: Publish (draft only), Archive, Delete.
Delete disabled when `canDelete=false`; tooltip shows `deleteBlockedReason`.

### States

- Loading: skeleton table rows
- Empty: centered empty state with Create Plan CTA
- Error: message + Try again button

### Pagination

Uses API metadata: `pageNumber`, `pageSize`, `totalItems`, `totalPages`,
`hasPreviousPage`, `hasNextPage`. Range label example:
`Showing 1 to 10 of 25 plans`.

## Create Plan Wizard

Six steps: Basics → Modules → Features → Pricing → Limits → Review & Publish.

Layout: step content left, sticky **Draft Summary** panel right.

Wording uses **Tenant monthly price** and **Tenant annual price**. No payment
checkout wording (no "You will be charged").

Modules and features load from API service methods. Empty catalog states shown
when backend catalog endpoints are not yet available. No hardcoded module or
feature names in templates.

Publish opens confirmation modal explaining post-publish edit restrictions.

## API

List: `GET /api/v1/platform/subscription-plans`

Create/publish/catalog endpoints are stubbed in frontend service with TODO until
backend endpoints are available.

## Permission and Error State Rules (Verified 2026-06-17)

| State | When shown |
|---|---|
| Loading | API request in progress; tab counts show `—`, table shows skeleton rows |
| Empty | API returns `200` with zero items |
| Error + Retry | Real API/network failure (non-permission) |
| Permission denied | API returns `403` with backend message such as missing `platform.subscription_plans.view` |

Do not show permission denied before the API responds. Frontend does not bypass
backend permission checks.

### Create Plan Button Visibility

Show only when auth session includes `platform.subscription_plans.create`, or
legacy `platform.subscription.manage` if present in session permissions.

## Related Files

- [[../03_USER_JOURNEYS/Platform_Admin/Subscription_Plan_Management_Flow]]
- [[../09_ANGULAR_ADMIN_KNOWLEDGE/Subscription_UI_Implementation]]
- [[../04_MODULE_KNOWLEDGE/Subscription/03_Technical_Contract]]
