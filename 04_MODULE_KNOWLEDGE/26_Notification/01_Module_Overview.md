<!-- title: Notification Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Notification Module Overview

## Purpose

Manage notification channels, event types, preferences, events, templates, template versions, messages, delivery attempts, inbox items, and read receipts.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Notification` |
| Module number | 26 |
| Primary users | Customer, Tenant Admin, Cashier, Platform Admin |
| Frontend surfaces | Order notifications, Pickup ready message, Low stock/expiry alerts, In-app notification inbox, Email/SMS integration where enabled |
| API groups | `/api/v1/notifications`, `/api/v1/notification-preferences`, `/api/v1/notification-templates`, `/api/v1/notification-events` |

## Main Tables

| Table | Role |
|---|---|
| `notification_channels` | Used by this module |
| `notification_event_types` | Used by this module |
| `notification_preferences` | Used by this module |
| `notification_events` | Used by this module |
| `notification_templates` | Used by this module |
| `notification_template_versions` | Used by this module |
| `notification_messages` | Used by this module |
| `notification_delivery_attempts` | Used by this module |
| `notification_inbox_items` | Used by this module |
| `notification_read_receipts` | Used by this module |

## Core Business Rules

- Notifications are generated from business events, not random UI triggers.
- Template versions preserve sent-message history.
- Preferences control channel eligibility per customer/user/event.
- Delivery attempts are append-only and retry-safe.
- Do not store provider secrets in notification messages.

## Access Summary

| Control | Rule |
|---|---|
| Authentication | Required for protected staff/customer/admin actions |
| Tenant status | Tenant must be active or allowed for the requested operation |
| Feature entitlement | Required when this module is plan or add-on controlled |
| Permission | Required for staff/admin protected actions |
| Tenant isolation | Tenant-owned records must never leak across tenants |
| Audit/event history | Required for sensitive status, payment, inventory, auth, and access changes |

## Dependencies

- [[../19_Customer_Account_Consent/01_Module_Overview]]
- [[../23_Fulfilment_Pickup_ClickCollect/01_Module_Overview]]
- [[../27_Reporting_Analytics/01_Module_Overview]]
- [[../04_Subscription_Billing_Usage/01_Module_Overview]]

## Out Of Scope

- Marketing campaign builder
- WhatsApp commerce bot
- Full CRM automation
- Payment provider credential storage

## Related Files

- [[04_MODULE_KNOWLEDGE/26_Notification/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/26_Notification/03_Technical_Contract]]
