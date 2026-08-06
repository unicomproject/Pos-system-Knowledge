# 10 Create Outlet Error States and Messages

> Last Verified Date: 2026-08-06
> Source basis: OneVerz POS Screen Validation specification

## 1. Field-Level Error Messages

The following validation messages must display inline directly below the corresponding input field when validation rules are violated:

| Validation Constraint | Error Message |
|---|---|
| **Outlet Name Empty** | `Enter an outlet name.` |
| **Name Too Long** | `Outlet name must be 200 characters or less.` |
| **Duplicate Outlet Code** | `This outlet code is already used. Generate a new code and try again.` |
| **Outlet Type Missing** | `Select an outlet type.` |
| **Timezone Missing** | `Select the outlet timezone.` |
| **Manager User Invalid** | `Select an eligible user from this tenant.` |
| **Invalid Email Address** | `Enter a valid email address.` |
| **Invalid Phone Number** | `Enter a valid phone number.` |
| **Address Line 1 Empty** | `Enter Address Line 1.` |
| **City Empty** | `Enter a city.` |
| **Country Code Missing** | `Select a country or region.` |
| **Image Size Exceeded** | `Upload an image smaller than 2 MB.` |
| **Image Format Blocked** | `Upload a JPG or PNG image.` |
| **Opening Hours Invalid** | `Closing time must be after opening time, or enable Overnight.` |
| **Duplicate Holiday Date** | `A special day already exists for this date.` |

---

## 2. Page-Level Error Handling

### 2.1 Subscription Limit Reached
- **Trigger**: The backend returns `422 Unprocessable Entity` with code `outlet.limit_reached` on submission.
- **UI Action**: Show a page-level banner:
  `The subscription outlet limit has been reached. Please upgrade your subscription plan to create more outlets.`

### 2.2 Concurrent Central Outlet Modifications
- **Trigger**: Another administrator designates a different outlet as Central after the wizard load but before this client submits.
- **UI Action**: Show a modal warning:
  `Another outlet was designated as the central outlet during your setup. Please review the updated configuration before submitting.`

### 2.3 Network Interruption & Recoverability
- If a network failure occurs during creation, show an error alert:
  `We could not create the outlet. Your entered information has been preserved. Please check your connection and try again.`
- **Data Preservation Rule**: The form state must remain populated; the user should not have to re-enter details. Clicking "Retry" resubmits the cached form data.
