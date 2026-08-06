# 09 Create Outlet Non Functional Requirements

> Last Verified Date: 2026-08-06
> Source basis: OneVerz Platform Non-Functional Standards

## 1. Performance and Latency

- **Wizard Transitions**: Step-to-step changes in the wizard must occur client-side without full-page reloads. Transition response must be immediate (< 100ms).
- **Manager Search Debounce**: Searching active users in Step 1 must apply a 300ms debounce on keystrokes to limit DB queries.
- **Target API Latency**:
  - `POST /api/v1/outlets` target: < 500ms under standard load conditions.
  - Options pre-fetch target: < 300ms.

---

## 2. Reliability & Resilience

- **Atomic Transactions**: Registration of `outlets`, `outlet_addresses`, and initial `outlet_business_hours` must occur within a single database transaction boundary. Any failure in child objects (e.g., address validation) must trigger a complete database rollback.
- **Idempotency**: Requests must include an `Idempotency-Key` header. If a network interruption occurs and the client retries, the backend must return the previously processed response rather than creating duplicate records.
- **Data Preservation**:
  - Going back and forth in steps must not lose form fields or uploaded image previews.
  - Image files uploaded during Step 2 should be temporarily staged; if the wizard is abandoned, a background worker must clean up the orphaned image assets after 24 hours.

---

## 3. Accessibility (WCAG 2.1 AA)

- **Keyboard Controls**: Complete wizard navigation (Next, Back, Cancel, Dropdowns, Segmented controls) must support `Tab`, `Space`, and `Enter` inputs.
- **Visible Focus**: All active fields, buttons, and selection cards must render a clear, outline-styled focus indicator when navigated via keyboard.
- **Touch Targets**: Button and dropdown components must have a minimum interactive size of 44 × 44 pixels.
- **Color Independence**: Status information (such as active/inactive or step completeness) must not rely on color changes alone. Iconography and text labels must accompany color states.

---

## 4. Responsive Layout Rules

- **Desktop (16:9)**: Split-screen layout: left form area (2-column fields), right help/guidance panel (fixed width).
- **Tablet / Small Screen**:
  - Right guidance panel moves below the main form or collapses into a sheet.
  - Stepper remains readable in a horizontal layout.
- **Mobile (< 768px)**:
  - Form fields collapse to single-column stacking.
  - Stepper switches to horizontal scroll or step-number badge index.
  - Cancel and Next buttons stack vertically.
