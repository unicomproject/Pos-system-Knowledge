<!-- title: ONEVERZ Tenant Admin Onboarding — Phase A / Phase B Canonical Architecture -->
<!-- status: CANONICAL ARCHITECTURE SPECIFICATION -->
<!-- system: ONEVERZ EPOS -->
<!-- last_updated: 2026-09-04 -->
<!-- applies_to: Release 1 Tenant Admin Onboarding, Identity, Credentials and Activation -->
<!-- related: 01_RELEASE_SCOPE/Release_1_Scope.md, 01_RELEASE_SCOPE/ONEVERZ_RELEASE_1_SCOPE_LOCK.md, 03_USER_JOURNEYS/Platform_Admin/18_Tenant_Onboarding_Email_Flows.md, 03_USER_JOURNEYS/Platform_Admin/FLOW_4_CREATE_TENANT_WIZARD_CANONICAL_SPEC.md -->

# ONEVERZ EPOS — TENANT ADMIN ONBOARDING CANONICAL ARCHITECTURE (PHASE A / PHASE B)

## 0. PURPOSE & ARCHITECTURAL FOUNDATION

This document defines the canonical architecture for **Tenant Administrator Onboarding** across the ONEVERZ EPOS platform. It establishes a strict two-phase boundary separating Platform Admin provisioning responsibilities from Tenant Admin self-activation responsibilities:

```text
ONEVERZ TENANT ADMIN ONBOARDING

PHASE A — PLATFORM ADMIN RESPONSIBILITY
        ↓
Tenant Creation + Invitation
        ↓
PHASE A STOP

════════════════════════════

PHASE B — TENANT ADMIN SELF-ACTIVATION
        ↓
Verify Identity
        ↓
Create Own Password
        ↓
Activate Account
        ↓
Login
```

### Approved Security Direction

1. **NO temporary password is ever emailed.**
2. **NO Platform Admin-generated password is ever shared with the Tenant Admin.**
3. **The Tenant Admin creates their own permanent password during self-activation in Phase B.**
4. **Platform Admin responsibility terminates immediately upon invitation issuance (Phase A Stop).**

Any legacy, transitional, or draft pattern involving temporary password generation, password emailing, or forced password resets on first login is **SUPERSEDED** by this specification.

---

## 1. DOCUMENT AUDIT & RECONCILIATION

An exhaustive audit of existing Second Brain onboarding, invitation, and credential documentation was conducted to reconcile prior flows with the canonical Phase A / Phase B model:

| Document | Existing Flow Described | Current Status | Canonical Reconciliation Action |
| :--- | :--- | :--- | :--- |
| `01_RELEASE_SCOPE/ONEVERZ_TENANT_ADMIN_ONBOARDING_PHASE_A_PHASE_B.md` | Phase A (Platform Admin Provisioning) / Phase B (Self-Activation) | **CANONICAL** | **AUTHORITY**: Defines master two-phase architecture and contracts. |
| `03_USER_JOURNEYS/Platform_Admin/18_Tenant_Onboarding_Email_Flows.md` | Paid / Trial tenant onboarding notification and activation emails | CURRENT | **KEEP & RECONCILE**: Governs email triggers. Reaffirms zero-password email rule. |
| `03_USER_JOURNEYS/Platform_Admin/FLOW_4_CREATE_TENANT_WIZARD_CANONICAL_SPEC.md` | Flow 4 7-step wizard specification; setup token issuance post-commit | CURRENT | **KEEP & RECONCILE**: Governs Platform Admin Step 6/7. Confirms Platform Admin stops after Phase A. |
| `03_USER_JOURNEYS/Platform_Admin/04_Create_Tenant_Wizard_Flow.md` | High-level wizard journey; setup token invitation link | CURRENT | **KEEP**: High-level journey aligned with setup token (never plaintext password). |
| `03_USER_JOURNEYS/Tenant_Admin/01_Pre_Login_Payment_Trial_Demo_Flow.md` | Pre-login setup and trial activation flow | CURRENT | **KEEP**: Explicitly states "Never email plain/temporary passwords." |
| `12_INTEGRATIONS/Email_Event_And_Template_Catalog.md` | Catalog of email event codes, subjects, and payloads | CURRENT | **KEEP**: Explicitly specifies `Must not include: Plain/temporary password`. |
| `12_INTEGRATIONS/Email_Architecture_And_Provider_Decisions.md` | ACS email integration rules and provider constraints | CURRENT | **KEEP**: Mandates raw tokens never stored/logged, zero passwords in emails. |
| `04_MODULE_KNOWLEDGE/01_Platform_Administration/03_Technical_Contract.md` | Technical contract for Platform Admin module | CURRENT | **KEEP**: Prohibits emailing plaintext/temporary passwords. |
| `13_DECISIONS_AND_CHANGES/FLOW_4_CREATE_TENANT_WIZARD_DECISION_REGISTER.md` | Decision F4-D15 (setup-token only, cryptographic hash at rest) | CURRENT | **KEEP**: Canonical decision register prohibiting plaintext temporary passwords. |
| Legacy / Transitional Temp-Password Emailing Attempts | Backend-generated temporary password sent via welcome email | **SUPERSEDED** | **SUPERSEDED**: Completely retired. No passwords in emails under any circumstance. |

---

## 2. DEPRECATION OF LEGACY TEMPORARY PASSWORD PATTERN

```text
SUPERSEDED OLD FLOW:
Platform Admin creates Tenant
  → Backend generates temporary password
  → Temporary password emailed to Tenant Admin
  → Tenant Admin performs first login with temporary password
  → Forced password reset screen
[STATUS: SUPERSEDED / PROHIBITED]
```

### Why This Design Was Superseded
* **Credential Exposure:** Email is an inherently unencrypted transport across mail servers and clients; sending operational credentials over email creates severe exposure.
* **Separation of Concerns:** Platform Administrators must never hold, view, or generate user credentials for tenant boundaries.
* **Identity Ownership:** The Tenant Administrator must independently establish proof of email ownership and author their own authentication secret during self-activation.

---

## 3. PHASE A — PLATFORM ADMIN RESPONSIBILITY

Phase A encompasses the entire lifecycle of tenant provisioning initiated by the Platform Administrator up to the point of dispatching the activation invitation.

```text
PHASE A — STEP-BY-STEP SEQUENCE

1. Platform Admin initiates Create Tenant Wizard (Flow 4).

2. Backend validates:
   - Tenant legal/display name, code, slug, and uniqueness
   - Country, currency, timezone, and locale
   - Subscription plan and billing cycle
   - Feature entitlements and add-on limits
   - Tenant Admin user details (first name, email, phone)
   - Canonical role and bootstrap catalog requirements (cashier/store permissions)

3. Tenant entity is created.

4. Default TENANT_ADMIN role is provisioned with canonical administrator permissions.

5. Tenant Admin user identity is created.

6. Tenant Admin initial account state is set to:
   INVITED

7. Tenant Admin password state is:
   NOT SET (no password generated, no password hashed)

8. Backend generates a cryptographically secure, high-entropy activation token.

9. Only the strong cryptographic HASH of the activation token is persisted.

10. Invitation expiration timestamp is recorded according to configured policy.

11. The tenant provisioning database transaction COMMITS atomically.

12. The activation / invitation email is queued/dispatched via reliable email delivery.

13. The invitation email delivers:
    - ONEVERZ EPOS branding
    - Tenant / Company Name and Tenant Code
    - Tenant Admin Username / Registered Email
    - Secure "Activate Account" call-to-action link containing the raw activation reference
    - Invitation expiry notice
    - Security statement: "For your security, ONEVERZ will never email you a password."

14. PLATFORM ADMIN FLOW STOPS.
```

### Phase A Final System State

```text
Tenant Record:                  CREATED (Lifecycle status per plan/payment rules)
TENANT_ADMIN Role:              PROVISIONED
Tenant Admin User Record:       CREATED
Account Status:                 INVITED
Password:                       NOT SET
Activation Token:               GENERATED (raw token kept in memory only for email dispatch)
Persisted Token:                HASH ONLY
Invitation Expiry:              SET (UTC timestamp)
Invitation Email:               SENT / QUEUED
Account Fully Activated:        NO
Normal Tenant Admin Login:      NOT YET AVAILABLE
```

### Platform Admin Responsibility Boundary

> [!IMPORTANT]
> **PLATFORM ADMIN MUST STOP AFTER PHASE A.**  
> Platform Admin is strictly an onboarding initiator. Under no circumstances does the Platform Admin create, view, manage, or set a Tenant Admin password, nor do they complete account activation.

| Platform Admin Responsible For | Platform Admin NOT Responsible For |
| :--- | :--- |
| Validating tenant and administrative profile | Creating Tenant Admin passwords |
| Provisioning tenant container & subscription | Viewing or generating temporary passwords |
| Provisioning `TENANT_ADMIN` role | Emailing credentials |
| Generating secure activation invitation | Setting permanent passwords |
| Dispatching invitation email | Manually marking password setup complete |
| Tracking invitation status & resending if needed | Performing Tenant Admin self-activation |

---

## 4. PHASE B — TENANT ADMIN SELF-ACTIVATION

Phase B represents the self-activation journey executed exclusively by the Tenant Administrator.

```text
PHASE B — STEP-BY-STEP SEQUENCE

1. Tenant Admin receives invitation email in their registered inbox.

2. Tenant Admin opens secure invitation link (delivering the high-entropy setup token).

3. Tenant Admin application extracts setup token and calls backend validation:
   GET /api/tenant-admin/onboarding/setup-token/{setupToken}/validate

4. Backend validates token hash and ensures:
   - Invitation record exists
   - Token hash matches
   - Token is not expired (rejects with INVITE_EXPIRED)
   - Token is single-use and unconsumed (rejects with INVITE_USED)
   - Target tenant is active/valid
   - Invited Tenant Admin belongs to that tenant (cross-tenant isolation)
   - Target Tenant Admin user is in valid INVITED state

5. Successful token possession and validation verifies possession of the invitation email channel for the current onboarding flow.

6. Tenant Admin proceeds directly to Set Password screen in the Tenant Admin workspace app.

7. Tenant Admin creates their own strong permanent password.

8. Backend validates password policy:
   - Minimum: 8 characters
   - Maximum: 128 characters
   - Uppercase: required
   - Lowercase: required
   - Digit: required

9. Backend hashes password using canonical PBKDF2-SHA256 password hashing service (100,000 iterations, 16-byte random salt, 32-byte derived hash).

10. Within an atomic database transaction with row-level locking:
    - Password hash is stored
    - Tenant Admin account status transitions: INVITED → ACTIVE
    - Invitation status transitions: SENT/PENDING → ACCEPTED
    - Accepted timestamp and user binding are permanently recorded

11. Tenant Admin application redirects to /tenant-admin/setup/success and subsequently to /tenant-login.

12. ACTIVE Tenant Admin logs in normally with registered email and newly created password.

13. Reusing the consumed invitation token is rejected (INVITE_USED / already accepted).
```

### Phase B Implementation Status
* **Phase B Architecture:** APPROVED / RECONCILED
* **Phase B Implementation:** IMPLEMENTED
* **Automated Verification:** COMPLETE
  - Backend API Tests: 12 PASS (`TenantAdminOnboardingInvitationControllerTests.cs`)
  - Backend Unit Tests: 1602 PASS
  - Backend API Tests: 524 PASS
  - Backend Integration Tests: 7 PASS
  - Flutter Widget Tests: 12 PASS (`tenant_admin_phase_b_widget_test.dart`)
  - Flutter Relevant Auth Tests: 50 PASS
  - Flutter Analyze: PASS
* **Controlled Full End-to-End Verification:** PENDING TA-BOOT-B4
* **Final Closure / Freeze:** PENDING TA-BOOT-B4

### Tenant Admin Secondary Email OTP Architecture Decision
```text
TENANT ADMIN SECONDARY EMAIL OTP

Current R1 Requirement:
NOT REQUIRED

Current Runtime Implementation:
NOT USED

Current Verification Mechanism:
SECURE SINGLE-USE EMAIL INVITATION TOKEN

Future Secondary OTP:
OPTIONAL FUTURE SECURITY ENHANCEMENT
NOT PART OF CURRENT R1 TENANT ADMIN ACTIVATION
```

> [!NOTE]
> **Email Possession Verification Rationale:**  
> The secure invitation token is delivered directly to the registered Tenant Admin email address. Successful possession and validation of this high-entropy, single-use, expiring invitation token establishes control of that invitation email channel for the current activation flow.  
> 
> A secondary code delivered through that same email channel is not required for the approved current R1 activation contract.
> 
> *Security Note:* This token-link possession verification is not multi-factor authentication (MFA/2FA) because the link is delivered through the email channel itself. Optional secondary OTP or MFA may be introduced in a future release as a separate enhancement.  
> 
> *(Unrelated E-Commerce customer authentication OTP flows remain distinct and unchanged).*

---

## 5. SECURITY & ARCHITECTURAL CONTRACTS

### 5.1 Invitation Token Security Contract
1. **Entropy:** Activation tokens are generated using a cryptographically secure pseudorandom number generator (`RandomNumberGenerator`).
2. **Storage:** Raw activation tokens MUST NEVER be persisted in the database. Only the cryptographic hash (SHA-256 / PBKDF2) is stored in the database.
3. **Single-Use:** Once an activation token is redeemed, it is permanently marked used/consumed.
4. **Lifecycle Expiry:** Every activation token carries an immutable UTC expiration date.
5. **Transport Security:** Activation URLs require HTTPS.
6. **Zero-Log Exposure:** Raw activation tokens and email payload secrets MUST NEVER appear in application logs, database traces, or outbox payloads.

### 5.2 Expiry Policy
* **Invitation Token Expiry:** Configurable activation window (defaulting to 24–72 hours; runtime default locked during Phase A implementation).
* **Tenant Admin Secondary OTP:** Not required / not used for current R1 Tenant Admin activation.

### 5.3 Password Security Contract
* **Password generated by Platform Admin:** NO.
* **Password generated by Backend for email:** NO.
* **Password sent by email:** STRICTLY PROHIBITED.
* **Password created by Tenant Admin:** YES (Phase B self-activation only).
* **Plaintext password persisted:** NEVER.
* **Password storage:** Persisted exclusively via canonical PBKDF2 password hashing (100,000 iterations, 16-byte random salt, 32-byte derived hash).

### 5.4 Email Contract — Phase A Invitation
The invitation email must adhere to the following contract:

**Required Content:**
1. ONEVERZ EPOS official branding.
2. Tenant / Business Name.
3. Tenant Code (where applicable for user reference).
4. Tenant Admin registered email (login username).
5. Secure "Activate Account" call-to-action button and URL.
6. Invitation expiration details.
7. Tenant Admin application/login entry point.
8. Explicit Security Statement: *"For your security, ONEVERZ will never email you a password. You will set your own secure password upon activating your account."*

**Strictly Prohibited Content:**
* Temporary passwords
* Permanent passwords
* Password hashes
* Internal database primary keys (GUIDs / integer IDs)
* Security stack traces or system diagnostics
* Internal permission code catalogs

### 5.5 Reference Invitation Email Copy
```text
Subject: Welcome to ONEVERZ EPOS — Activate Your Administrator Account

Hello <Admin Name>,

Welcome to ONEVERZ EPOS! Your Tenant Administrator account for <Tenant Name> has been provisioned.

Account Summary:
--------------------------------------------------
Company / Business: <Tenant Name>
Tenant Code:        <Tenant Code>
Username:           <Registered Email>
--------------------------------------------------

To complete your setup and access your system, please activate your account:

[ Activate Account ]
<Secure HTTPS Activation Link>

Important Information:
- This invitation link is valid until <Expiry UTC Date & Time>.
- During activation, you will create your own secure, confidential password.
- For your security, ONEVERZ will never send you a password by email.

If you did not request or expect this invitation, please contact ONEVERZ Support immediately.

Warm regards,
The ONEVERZ EPOS Team
```

---

## 6. CONCEPTUAL ACCOUNT LIFECYCLE & JOURNEY STATES

The Tenant Admin identity progresses through defined journey states across the two phases:

```text
PHASE A:
[ PROVISIONED ] ──► [ INVITED ] ──► [ EMAIL DISPATCHED ]
                                            │
════════════════════════════════════════════╪═════════════════════════════
                                            ▼
PHASE B (IMPLEMENTED / CONTROLLED E2E PENDING):
                                  [ INVITATION OPENED ]
                                            │
                                            ▼
                                  [ TOKEN VERIFIED ]
                        (Email channel control established)
                                            │
                                            ▼
                                  [ PASSWORD CREATED ]
                                            │
                                            ▼
                                       [ ACTIVE ]
```

> [!NOTE]
> **Persisted Status vs. Journey States:**  
> The actual persisted database account status in `tenant_users.account_status` transitions from `INVITED` (Phase A) to `ACTIVE` (Phase B). Concurrently, the invitation in `user_invites.invite_status` transitions to `ACCEPTED`. Intermediate journey states (`EMAIL DISPATCHED`, `TOKEN VERIFIED`, `PASSWORD CREATED`) represent operational milestones and audit logs, not database enum schema modifications.

---

## 7. TECHNICAL RESPONSIBILITY & TRANSACTION BOUNDARIES

### 7.1 Technical Component Ownership

| Component | Phase A Responsibilities | Phase B Responsibilities |
| :--- | :--- | :--- |
| **Platform Admin UI** | Captures wizard data; initiates `POST /api/v1/platform-admin/tenants` | None (Platform Admin does not participate in Phase B) |
| **Backend API / Core** | Validates request; provisions tenant, role, and admin user (`INVITED`); generates activation token; hashes token; commits transaction | Validates token hash (`GET /api/tenant-admin/onboarding/setup-token/{token}/validate`); verifies token expiry, single-use, and tenant-binding; hashes user password; atomically sets password, marks invite `ACCEPTED`, transitions user to `ACTIVE` (`POST /api/tenant-admin/onboarding/setup-password`) |
| **Database** | Atomically commits tenant, user, role, token hash, and expiry records | Updates user password hash; invalidates token; marks invitation `ACCEPTED`; updates account status to `ACTIVE` |
| **Email Service** | Delivers Phase A activation invitation email | Delivers confirmation email (if configured) |
| **Tenant Admin UI** | None | Hosts activation landing page (`/tenant-admin/setup/:setupToken`), token validation UI, password creation form, success screen (`/tenant-admin/setup/success`), and login redirect (`/tenant-login`) |

### 7.2 Transaction Boundary & Failure Isolation
1. **Single Provisioning Transaction:** Tenant entity, subscription records, `TENANT_ADMIN` role assignment, Tenant Admin user (`INVITED`), and the activation token hash/expiry MUST be committed in a single atomic database transaction.
2. **Email Delivery Decoupling:** External email dispatch occurs post-commit (or via reliable outbox). A third-party network failure delivering the email does not roll back the database or corrupt the tenant state.
3. **Resend Capability:** If the email delivery fails or the invitation expires, the system supports an idempotent Resend Invitation action that invalidates prior tokens and generates a fresh activation token with a renewed expiry.

---

## 8. TENANT ADMIN ONBOARDING SECURITY PRINCIPLES

1. **Never send passwords by email:** Passwords transmitted via email represent a critical architectural defect.
2. **Tenant Admin creates their own password:** Secret generation remains exclusively in the hands of the authenticated identity owner.
3. **Store activation token hash only:** Database breaches must not yield redeemable invitation tokens.
4. **Invitations are expiring:** Activation tokens have a strict, bounded time-to-live.
5. **Invitations are single-use:** Once redeemed or superseded, an invitation token cannot be reused.
6. **Activation secrets are never logged:** Raw tokens are scrubbed from telemetry, application logs, and database tracing.
7. **Canonical password hashing:** Passwords are hashed using the platform standard PBKDF2-SHA256 hasher.
8. **Layered isolation:** Tenant membership is strictly scoped to the tenant container `(tenant_id, email)`.
9. **Mandatory HTTPS:** Activation links and credential submissions require TLS/HTTPS transport security.
10. **Zero administrative knowledge:** Platform Administrators have zero visibility into Tenant Admin credentials.

---

## 9. RESPONSIBILITY & IMPLEMENTATION MATRICES

### 9.1 Responsibility Matrix

| Responsibility Area | Platform Admin / Phase A | Tenant Admin / Phase B |
| :--- | :---: | :---: |
| Create Tenant Container | **YES** | NO |
| Provision TENANT_ADMIN Role | **YES** | NO |
| Create Tenant Admin User Identity | **YES** | NO |
| Set User Status to `INVITED` | **YES** | NO |
| Generate Activation Invitation Token | **YES** | NO |
| Store Activation Token Hash | **YES** | NO |
| Send Activation Invitation Email | **YES** | NO |
| Open Activation Link | NO | **YES** |
| Verify Email Possession (Token Link) | NO | **YES** |
| Create Confidential Permanent Password | NO | **YES** |
| Consume Activation Token | NO | **YES** |
| Activate Account (`INVITED` → `ACTIVE`) | NO | **YES** |
| Normal Workspace Login | NO | **YES** |

### 9.2 Implementation Status Matrix

| Functional Capability | Architecture Status | Implementation Status | Verification Status | Implementation Phase |
| :--- | :--- | :--- | :--- | :--- |
| Tenant Creation | **APPROVED** | **EXISTING** | **VERIFIED** | Phase A |
| TENANT_ADMIN Role Bootstrap | **APPROVED** | **EXISTING** | **VERIFIED** | Phase A |
| Tenant Admin User Provisioning | **APPROVED** | **EXISTING** | **VERIFIED** | Phase A |
| `INVITED` Account State | **APPROVED** | **IMPLEMENTED** | **VERIFIED** | Phase A |
| Password `NOT SET` State | **APPROVED** | **IMPLEMENTED** | **VERIFIED** | Phase A |
| Secure Activation Token Generator | **APPROVED** | **IMPLEMENTED** | **VERIFIED** | Phase A |
| Token Hash Storage & Expiry | **APPROVED** | **IMPLEMENTED** | **VERIFIED** | Phase A |
| Canonical Invitation Email Dispatch | **APPROVED** | **IMPLEMENTED** | **VERIFIED** | Phase A |
| Activation Token Validation API | **APPROVED** | **IMPLEMENTED** | **VERIFIED (12 Backend API Tests PASS)** | Phase B |
| Email Possession Verification (Token Link) | **APPROVED** | **IMPLEMENTED** | **VERIFIED (API + Widget Tests PASS)** | Phase B |
| Tenant Admin Password Setup UX & API | **APPROVED** | **IMPLEMENTED** | **VERIFIED (12 Widget Tests PASS)** | Phase B |
| Account Activation (`INVITED` → `ACTIVE`) | **APPROVED** | **IMPLEMENTED** | **VERIFIED (Integration + API Tests PASS)** | Phase B |
| Normal Tenant Admin Workspace Login | **APPROVED** | **IMPLEMENTED** | **VERIFIED (Auth Suite PASS)** | Phase B |

---

## 10. USE CASE TRACEABILITY & PROJECT GOVERNANCE

### 10.1 Canonical Use Case Traceability
* **Total Canonical Use Cases Before:** **291**
* **Total Canonical Use Cases After:** **291**
* **New Duplicate Use Cases Created:** **0**
* **Traceability Index Alignment:**
  - `SA-UJ-006` (Create Tenant Wizard) maps to Phase A.
  - `SA-UJ-009` (Resend Tenant Admin Invitation) maps to Phase A invitation lifecycle.
  - `TA-UJ-003` (Account Activation / Password Setup) maps to Phase B.
  - `TA-UJ-001` (Tenant Login) maps to post-activation workspace access.

### 10.2 Business Module Ownership
* **Primary Module:** **BM-01 Authentication & Workspace**
* **Supporting Module:** **Platform Administration (Tenant Onboarding / Lifecycle)**
* No new business modules are created.

### 10.3 Release 1 Governance & Audit Remediation Status
* **Phase A Governance:** **CLOSED / VERIFIED / FROZEN** (Platform Admin responsibility terminates at invitation email dispatch).
* **Phase B Governance:** **IMPLEMENTED / AUTOMATED VERIFICATION COMPLETE / CONTROLLED FULL E2E PENDING TA-BOOT-B4** (Final freeze reserved for TA-BOOT-B4).
* **Audit Gaps Closed in TA-BOOT-B3:**
  - `GAP-TA-BOOT-B1-003`: CLOSED (Second Brain reflects verified Backend + Flutter implementation).
  - `GAP-TA-BOOT-B1-004`: CLOSED (Canonical email possession verification defined as secure single-use invitation token link; secondary email OTP is NOT REQUIRED).
* **Historical Audit Gap Status:**
  - `GAP-TA-BOOT-B1-001`: CLOSED (Backend HTTP/API controller tests merged).
  - `GAP-TA-BOOT-B1-002`: CLOSED (Flutter widget tests merged).
* **Online Store (OS-R1-4):** **CLOSED / RECONCILED / RE-FROZEN** (Commercial baseline preserved).
* **Commercial Scope (`ONEVERZ_R1_STD`):** Preserved and unchanged (7 physical features, 15 conceptual capabilities).
