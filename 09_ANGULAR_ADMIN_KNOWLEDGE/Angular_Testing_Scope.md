<!-- title: Angular Testing Scope -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Angular Testing Scope

## Purpose

This file defines Release 1 Angular testing scope for the SCS-TIX Platform Admin
Web Portal.

Testing must focus on included Platform Admin features only.

## Unit Test Coverage

Unit tests should cover:

- Auth service.
- Tenant context service.
- Permission service.
- Feature entitlement service.
- Guards.
- API error mapper.
- Form validators.
- Tenant switch state clearing.
- Environment config usage.

## Component Test Coverage

Component tests should cover:

- Sidebar.
- Tenant switcher.
- Data table.
- Permission matrix.
- Entitlement selector.
- Product form.
- Category form.
- Report filter panel.
- Empty/loading/error states.
- Permission denied screen.
- Tenant context banner.

## E2E Test Coverage

E2E tests should cover:

- Login.
- Create tenant.
- Assign features.
- Switch tenant.
- Create product.
- Create category.
- View reports.
- Permission denied route.
- Disabled feature route.
- Missing tenant context route.

## Negative Tests

Negative tests must include:

- Missing tenant context.
- Invalid permission.
- Disabled feature.
- Stale tenant state after tenant switch.
- API 401.
- API 403.
- API 500 safe error display.
- No hardcoded API URLs in review.

## Related Files

- [[Angular_App_Architecture]]
- [[Routing_And_Guards]]
- [[Angular_Form_Validation_Guide]]
- [[Reusable_Component_Strategy]]
