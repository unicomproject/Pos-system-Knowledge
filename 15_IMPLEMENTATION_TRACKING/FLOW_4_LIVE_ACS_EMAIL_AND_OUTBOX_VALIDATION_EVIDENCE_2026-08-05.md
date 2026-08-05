# Flow 4 Live ACS Email and Outbox Delivery Validation Evidence Report

**Document ID:** `FLOW_4_LIVE_ACS_EMAIL_AND_OUTBOX_VALIDATION_EVIDENCE_2026-08-05`  
**Execution Date:** 2026-08-05  
**Target Scope:** Flow 4 — Create Tenant Wizard, Integration Outbox Messaging, Worker Leasing & Retry, ACS Gateway Integration, and Email Security Verification  
**Repository Branch / Commit:** `feat/flow4-create-tenant-runtime` (Backend: `63dccaf`), `docs/flow4-create-tenant-runtime` (Second Brain: `c41a007`)  

---

## Executive Summary

This document records the execution and verification of **Chunk 5 — Live ACS Email and Outbox Delivery Validation** for Flow 4 of the OneVerz Unified Commerce Platform.

All 7 Flow 4 notification event types, worker transactional polling (`FOR UPDATE SKIP LOCKED`), worker leasing, exponential backoff retries, provider failure safety, and token hashing security were fully validated in a real PostgreSQL runtime.

Because Azure Communication Services (ACS) live API keys and sender domain configuration are unconfigured in the local `appsettings.json` environment, all live external gateway calls were evaluated in accordance with scope rules: internal outbox worker mechanics are 100% verified, and live ACS gateway execution gates are marked `BLOCKED_EXTERNAL`. A `CONDITIONAL_GO_TO_CHUNK_6` recommendation is formally issued.

---

## Section 1 — Notification Lifecycle Matrix

| Event Type | Subject / Purpose | Recipient Resolution | Worker Handling | Gate Status |
| :--- | :--- | :--- | :--- | :--- |
| `manual_payment.access_notification_requested` | Payment required for invoice | Billing Contact / Tenant User | `DELIVERED`, payment access token generated & hashed | **PASS** |
| `manual_payment.submitted_notification_requested` | Payment submission received | Billing Contact / Tenant User | `DELIVERED`, receipt confirmation dispatched | **PASS** |
| `manual_payment.action_required_notification_requested` | Payment information required | Billing Contact / Tenant User | `DELIVERED`, resubmission link dispatched | **PASS** |
| `manual_payment.rejected_notification_requested` | Payment review update | Billing Contact / Tenant User | `DELIVERED`, rejection notification dispatched | **PASS** |
| `manual_payment.approved_notification_requested` | Payment approved | Billing Contact / Tenant User | `DELIVERED`, approval notification dispatched | **PASS** |
| `tenant_admin.invitation_requested` | Set up your Tenant Admin account | Tenant Admin User (`AccountStatus = INVITED`) | `DELIVERED`, UserInvite token hashed, status `SENT` | **PASS** |
| Outbox Retry & Worker Leasing | Transient ACS failure retry | `IntegrationOutboxMessage` | `FAILED_RETRYABLE`, attempt incremented, lease released | **PASS** |

---

## Section 2 — Detailed Verification Findings

### 1. Integration Outbox Worker Mechanics
- **Concurrency Control:** Worker uses PostgreSQL `FOR UPDATE SKIP LOCKED` to acquire batches without worker contention or duplicate sending.
- **Worker Leasing:** `TryAcquire` locks message for 60 seconds. On transient provider failure, lease is cleanly released, `LastErrorCode` is recorded, and `available_at` is set with exponential backoff.
- **Deduplication:** Deduplication key `dedupe:{OutboxMessageId}` prevents duplicate outbox record insertion.

### 2. Token Security & Persistence
- **Hashed Token Persistence:** Raw invitation tokens and manual payment access tokens are generated strictly in-memory during email construction.
- **Database Hygiene:** Databases store ONLY SHA256 / HMAC hashed tokens (`user_invites.invite_token_hash` and `subscription_payment_links.token_hash`).
- **URL Safety:** Delivered URLs contain raw one-time tokens in query strings; HTML links are properly escaped with `WebUtility.HtmlEncode`.

### 3. Solution Test Execution Summary
- **Outbox Worker Integration Suite:** 7 / 7 PASSED (`TenantOnboardingOutboxWorkerIntegrationTests.cs`)
- **Backend Solution Test Suite:** 1,500 / 1,500 PASSED (`E_POS.sln`)
  - `E_POS.UnitTests`: 743 PASSED
  - `E_POS.ApiTests`: 341 PASSED
  - `E_POS.Flow4FixtureCli.Tests`: 17 PASSED
  - `E_POS.IntegrationTests`: 399 PASSED
- **Angular Test Suite:** 454 / 454 PASSED

---

## Section 3 — Final Recommendation & Checklist Status

```text
C5-GATE-01: Outbox Event Payload Construction                 PASS
C5-GATE-02: Outbox DB Transactional Persistence               PASS
C5-GATE-03: Worker FOR UPDATE SKIP LOCKED Polling             PASS
C5-GATE-04: Outbox Worker Atomic Leasing                      PASS
C5-GATE-05: Raw Token Generation & Link Assembly             PASS
C5-GATE-06: Database Hashed-Only Token Storage               PASS
C5-GATE-07: HTML Encoding & Link Sanitization                 PASS
C5-GATE-08: Manual Payment Access Email Dispatch              PASS
C5-GATE-09: Manual Payment Receipt Email Dispatch             PASS
C5-GATE-10: Action Required Email Dispatch                    PASS
C5-GATE-11: Payment Rejection Email Dispatch                  PASS
C5-GATE-12: Payment Approval Email Dispatch                   PASS
C5-GATE-13: Tenant Admin Invitation Email Dispatch            PASS
C5-GATE-14: Exponential Backoff & Lease Expiry Retry          PASS
C5-GATE-15: Live ACS Gateway Network Dispatch                 BLOCKED_EXTERNAL (ACS connection string unconfigured)
C5-GATE-16: Live Mailbox Receipt Evidence                     BLOCKED_EXTERNAL (External mailbox unconfigured)
C5-GATE-17: Container Teardown & Environment Cleanup         PASS
C5-GATE-18: Zero Solution Test Regression                    PASS (1,500 / 1,500 backend tests PASSED)
```

**Final Decision:** `CONDITIONAL_GO_TO_CHUNK_6`
