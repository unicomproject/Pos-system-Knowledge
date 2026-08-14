<!-- title: New Customer Registration Flow -->
<!-- status: Active -->
<!-- system: E-Commerce Click & Collect -->
<!-- last_updated: 2026-07-29 -->

# New Customer Registration Flow

## Purpose

A seamless standalone registration flow allowing a customer to create, verify, and activate a new account so they can shop and collect their orders.

## Actor

Customer

## Source

Derived from UI/UX User Journey EC-UJ-05.

## Trigger

Customer clicks on "Create Account" from the Login screen or during the checkout redirection.

## Preconditions

- Customer does not already have an active account with the provided email address.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Login Screen | System shows login form and "Create Account" CTA. |
| 2 | Create Account | Customer opens registration flow. System displays account benefits. |
| 3 | Enter Customer Details | Customer enters First Name, Last Name, Email, Mobile Number, and Password. Agrees to Terms. |
| 4 | Submit Registration | System validates fields. Creates pending customer account and triggers verification email. |
| 5 | Email Verification | System displays code entry screen. Customer receives and enters the 6-digit code. |
| 6 | Verification Success | System accepts valid code. Activates account and displays success confirmation. |
| 7 | Login / Continue Checkout | System allows login or redirects back to the checkout context (if registration started from checkout). |

## Data Used Or Captured

- Customer Name (First Name, Last Name)
- Email Address
- Mobile Number
- Password (Securely hashed)
- 6-Digit Email Verification Code
- Return URL / Checkout Context state

## Access And Security Rules

- **Account Necessity:** Guest checkout is not allowed in Release 1. A verified account is required before ordering.
- **Data Integrity:** Duplicate email accounts are not allowed. Terms acceptance is mandatory.
- **Verification:** Email verification is strictly required before account activation. Only verified accounts can continue to checkout.
- **Security:** Secure password handling (hashing). Valid codes must expire after a set duration. Support for resending codes.

## Validation And Error Cases

- Customer attempts to register with an email already existing in the system.
- Password does not meet security policies.
- Customer enters an incorrect or expired 6-digit verification code.
- User closes the browser during the verification step (pending account state handling).

## Outcome

Account is successfully verified and activated. Customer signs in or seamlessly continues their checkout process.

## Related Files

- `00_ECommerce_User_Flow_Analysis.md`
