Next is PAYMENTS-AND-TRANSACTIONS.md.

This document needs to be especially careful because payments are a high-impact financial subsystem. We should design the abstraction now, but for FrontDesk v0.1 we can keep actual payment-provider integration optional and support manual payment recording + payment-state tracking.

Create:

FrontDesk/
└── documentation/
    └── 02-product/
        └── FEATURE-SPECIFICATIONS/
            └── PAYMENTS-AND-TRANSACTIONS.md
PAYMENTS-AND-TRANSACTIONS.md
# FrontDesk — Payments & Transactions Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Payments & Transactions
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Payments & Transactions module defines how FrontDesk represents and tracks money-related activity associated with:

- orders,
- bookings,
- quotations,
- invoices,
- refunds,
- deposits,
- future subscriptions.

The module must provide a safe foundation for future payment-provider integrations without making FrontDesk dependent on a specific provider.

---

# 2. Core Principle

Orders describe:

    WHAT the customer purchased.

Payments describe:

    WHETHER and HOW money was paid.

These must remain separate.

Example:

    Order:
    ORD-00123

    Total:
    ₹1,000

    Payment:
    UNPAID

Later:

    Payment:
    ₹1,000

    Status:
    PAID

---

# 3. v0.1 Scope

The first release should support:

- payment records,
- payment status,
- association with orders,
- basic manual payment recording,
- payment amount,
- currency,
- payment method,
- transaction reference,
- payment timestamps,
- basic payment activity,
- workspace isolation,
- financial auditability.

v0.1 should NOT require:

- online payment gateway,
- automatic refunds,
- subscriptions,
- payment splitting,
- marketplace payouts,
- settlement reconciliation,
- complex accounting.

---

# 4. Payment vs Transaction

For FrontDesk:

### Payment

A monetary payment associated with a business transaction.

### Transaction

A broader financial event.

Examples:

    Payment
    Refund
    Adjustment
    Fee

The architecture should allow these to remain distinguishable.

---

# 5. Payment Lifecycle

Basic future lifecycle:

    Payment Intent
          ↓
    Payment Attempt
          ↓
    Provider Confirmation
          ↓
    Payment
          ↓
    Order / Booking Updated

For v0.1:

    Manual Payment
          ↓
    Payment Record
          ↓
    Order Updated

---

# 6. Payment Status

v0.1 should support:

    UNPAID
    PAID

Future:

    PENDING
    PROCESSING
    FAILED
    CANCELLED
    PARTIALLY_PAID
    REFUNDED
    PARTIALLY_REFUNDED

---

# 7. Why Payment Status Is Separate

Example:

    Order:
    CONFIRMED

    Payment:
    UNPAID

The business may confirm an order before receiving payment.

Therefore:

    Order Status
    ≠
    Payment Status

---

# 8. Payment Object

Conceptually:

    Payment
    ├── ID
    ├── Workspace ID
    ├── Business ID
    ├── Order ID
    ├── Booking ID
    ├── Amount
    ├── Currency
    ├── Status
    ├── Method
    ├── Provider
    ├── Provider Payment ID
    ├── Transaction Reference
    ├── Created At
    ├── Paid At
    └── Updated At

Exact schema belongs in database documentation.

---

# 9. Payment ID

Every payment must have a unique internal ID.

Example:

    payment_123

Human-readable reference:

    PAY-00123

The internal identifier and display reference should remain separate.

---

# 10. Payment Amount

The payment amount must be represented precisely.

Example:

    ₹650

The backend must remain authoritative for financial calculations.

---

# 11. Currency

Every payment must contain a currency.

Example:

    INR

Future:

    USD
    EUR
    GBP

The payment should never depend on a globally assumed currency.

---

# 12. Money Precision

Financial values should not rely on floating-point arithmetic.

The implementation should use an appropriate precise representation.

Example concept:

    amount_minor_units

For INR:

    ₹650.00
    →
    65000 paise

The exact implementation belongs to backend/database architecture.

---

# 13. Payment Method

Possible methods:

    CASH
    UPI
    CARD
    BANK_TRANSFER
    ONLINE
    OTHER

v0.1 may support:

    CASH
    UPI
    OTHER

for manual recording.

---

# 14. Manual Payment

Example:

Customer pays cash.

Owner:

    Open Order
       ↓
    Mark Payment
       ↓
    Amount:
    ₹500

    Method:
    CASH

       ↓
    Save

Payment becomes:

    PAID

---

# 15. Manual Payment Safety

Marking a payment as paid is a financial action.

The system should:

- require authorization,
- record the actor,
- record timestamp,
- preserve the amount,
- record payment method,
- create an audit event.

---

# 16. Payment Reference

Manual payments may have:

    Transaction Reference

Example:

    UPI reference:
    123456789012

This should be optional where the payment method does not provide one.

---

# 17. Provider

Future online payments may use:

    Payment Provider

The payment model should not be hardcoded to one provider.

Conceptually:

    FrontDesk
        ↓
    Payment Service
        ↓
    Provider Adapter
        ↓
    Payment Provider

---

# 18. Provider Abstraction

Example:

    PaymentService

        createPayment()
        verifyPayment()
        refundPayment()

Provider-specific implementation remains behind an abstraction.

---

# 19. Why Provider Abstraction Matters

FrontDesk may eventually support different providers depending on:

- country,
- business,
- payment method,
- pricing,
- compliance,
- availability.

The core order system should not need to change when a provider changes.

---

# 20. Payment Intent

Future online flow:

    Customer
       ↓
    Checkout
       ↓
    Payment Intent
       ↓
    Payment Provider
       ↓
    Payment Attempt

A payment intent represents the intention to collect a specific amount.

---

# 21. Payment Attempt

A payment may have multiple attempts.

Example:

    Payment Attempt 1
    FAILED

    Payment Attempt 2
    SUCCESS

Therefore payment attempt and final payment should not necessarily be the same record.

---

# 22. Payment Attempt Object

Future:

    Payment Attempt
    ├── ID
    ├── Payment ID
    ├── Provider
    ├── Provider Attempt ID
    ├── Amount
    ├── Status
    ├── Failure Code
    ├── Created At
    └── Completed At

Not required for v0.1.

---

# 23. Payment Provider Confirmation

For online payments, FrontDesk must verify provider confirmation server-side.

Do not trust:

    Browser:
    "Payment successful"

as sufficient evidence.

---

# 24. Webhooks

Future providers may notify FrontDesk through webhooks.

Example:

    Payment Provider
          ↓
    Webhook
          ↓
    FrontDesk Backend
          ↓
    Verify Event
          ↓
    Update Payment

---

# 25. Webhook Security

Future webhook processing should validate:

- signature,
- event source,
- timestamp where applicable,
- event ID,
- expected payment/order relationship.

---

# 26. Webhook Idempotency

The same webhook may arrive more than once.

Example:

    PAYMENT_SUCCESS

received twice.

FrontDesk must not:

- create duplicate payments,
- double-count revenue,
- send duplicate confirmation,
- update an order twice incorrectly.

---

# 27. Idempotency

Important payment operations must support idempotent behavior.

Example:

    Mark Payment Paid

repeated twice should not create two payments.

---

# 28. Payment-Order Relationship

A payment may be linked to:

    Order

Example:

    Order:
    ORD-00123

    Payment:
    PAY-00123

---

# 29. Payment-Booking Relationship

Future:

    Booking:
    BK-00123

    Deposit:
    ₹500

Payment:

    PAY-00124

The booking and payment should be linked.

---

# 30. Payment-Quote Relationship

Future:

    Quote accepted

       ↓

    Order created

       ↓

    Payment

The payment should ultimately relate to the actual financial transaction.

---

# 31. Payment-Invoice Relationship

Future:

    Invoice:
    INV-00123

    Payment:
    PAY-00123

An invoice may have:

    Unpaid
    Partially Paid
    Paid

---

# 32. Partial Payments

Future:

    Order Total:
    ₹10,000

    Payment 1:
    ₹3,000

    Payment 2:
    ₹7,000

Total paid:

    ₹10,000

Status:

    PAID

---

# 33. Partial Payment Status

Future:

    UNPAID
    PARTIALLY_PAID
    PAID

This should be calculated from authoritative payment records.

---

# 34. Overpayment

The system should detect:

    Order:
    ₹1,000

    Payment:
    ₹1,200

The system must not silently treat this as a normal payment.

Possible future handling:

    reject
    refund excess
    record adjustment

Business rules must determine the correct behavior.

---

# 35. Refund

A refund reverses some or all of a previous payment.

Example:

    Payment:
    ₹1,000

    Refund:
    ₹1,000

Remaining paid amount:

    ₹0

---

# 36. Refund Is Not Cancellation

Cancellation:

    Order will not continue.

Refund:

    Money previously received is returned.

Possible states:

    Order:
    CANCELLED

    Payment:
    REFUNDED

But cancellation does not automatically imply refund.

---

# 37. Refund Object

Future:

    Refund
    ├── ID
    ├── Payment ID
    ├── Amount
    ├── Currency
    ├── Reason
    ├── Status
    ├── Provider
    ├── Provider Refund ID
    ├── Created At
    └── Completed At

---

# 38. Refund Status

Future:

    PENDING
    SUCCEEDED
    FAILED
    CANCELLED

---

# 39. Partial Refund

Example:

    Payment:
    ₹1,000

    Refund:
    ₹300

Remaining paid:

    ₹700

The system must preserve both original payment and refund history.

---

# 40. Refund Authority

Refunds are high-impact financial operations.

Only appropriately authorized users should perform them.

Future AI should not automatically issue refunds without explicit permission.

---

# 41. Refund Audit

Every refund should record:

    Who
    Amount
    Reason
    Time
    Original Payment

---

# 42. Payment Audit Log

Important payment events should be recorded.

Example:

    10:20 AM
    Payment created

    10:22 AM
    Payment marked PAID

    Actor:
    Owner

---

# 43. Payment Activity

Future:

    Payment Created
    Payment Confirmed
    Payment Failed
    Refund Created
    Refund Completed

---

# 44. Actor Types

Payment activity may be performed by:

    CUSTOMER
    OWNER
    STAFF
    ADMIN
    SYSTEM
    AI
    AUTOMATION
    PAYMENT_PROVIDER

---

# 45. AI Payment Restrictions

AI should not independently:

    Change payment amount
    Mark arbitrary payment as paid
    Issue refunds
    Delete financial records
    Change financial history

unless explicit permissions and safety mechanisms exist.

---

# 46. AI Payment Actions

Future controlled actions:

    create_payment_request
    check_payment_status
    verify_payment
    request_refund

Each action must have permission controls.

---

# 47. AI Approval

Example:

    AI wants to issue refund:

    ₹1,000

    Reason:
    Customer requested cancellation.

    [Approve Refund]

    [Reject]

---

# 48. Payment Permissions

Future permissions:

    payment.read
    payment.create
    payment.update
    payment.mark_paid
    payment.refund
    payment.export

---

# 49. Staff Permissions

Example:

    Staff:
    View payment status

    Staff:
    Cannot issue refund

The exact permissions depend on business role configuration.

---

# 50. Owner Permissions

Owners may have:

    View
    Record
    Verify
    Refund

but important financial operations remain audited.

---

# 51. Payment List

Owner dashboard:

    Payments

    ┌─────────────────────────────────────┐
    │ PAY-00123   ORD-00123   ₹650  PAID │
    │ PAY-00124   ORD-00124   ₹500 UNPAID│
    └─────────────────────────────────────┘

---

# 52. Payment Detail

Example:

    Payment #PAY-00123

    Order:
    ORD-00123

    Customer:
    Arun Kumar

    Amount:
    ₹650

    Method:
    UPI

    Status:
    PAID

    Reference:
    123456789012

    Paid At:
    Aug 26, 2026 10:32 AM

---

# 53. Payment Filters

v0.1:

    All
    Paid
    Unpaid

Future:

    Pending
    Failed
    Refunded
    Partially Refunded
    Cash
    UPI
    Card

---

# 54. Payment Search

Future search:

    Payment ID
    Order ID
    Customer
    Transaction Reference

Search must respect workspace authorization.

---

# 55. Payment Notifications

Potential events:

    PAYMENT_CREATED
    PAYMENT_SUCCESS
    PAYMENT_FAILED
    REFUND_CREATED
    REFUND_COMPLETED

Notifications should be handled by the Notifications module.

---

# 56. Customer Payment Confirmation

Future:

    Payment received.

    Amount:
    ₹650

    Order:
    ORD-00123

This can be sent through:

    WhatsApp
    Email
    SMS
    Push

depending on configured channels.

---

# 57. Payment Failure

Future:

    Payment failed.

Customer should receive a clear message without exposing sensitive provider details unnecessarily.

Example:

    "Your payment could not be completed.
     Please try again."

---

# 58. Payment Retry

Future:

    Payment failed

       ↓

    Retry Payment

A new payment attempt may be created rather than corrupting the original attempt.

---

# 59. Payment Expiry

Future payment intents may expire.

Example:

    Payment request valid for:
    15 minutes

After expiry:

    EXPIRED

This belongs to payment intent logic.

---

# 60. Payment Link

Future:

    Generate Payment Link

Customer receives:

    Pay ₹650

Payment link should contain a secure, non-guessable identifier.

---

# 61. Payment Link Security

A public payment link must not expose:

- internal IDs,
- customer private data,
- business private data,
- unrelated orders.

---

# 62. Payment Link Amount

The amount shown to the customer must be generated by the server from authoritative transaction data.

The customer should not be able to change:

    ₹650

to:

    ₹1

through client-side manipulation.

---

# 63. Payment Link Expiration

Future payment links may have:

    Created:
    10:00 AM

    Expires:
    10:30 AM

---

# 64. Payment Link Reuse

The system should define whether a payment link can be reused.

For one-time payment links:

    Paid
       ↓
    Link invalid

---

# 65. QR Payments

Future:

    Generate payment QR

This should use supported payment infrastructure rather than inventing a proprietary payment mechanism.

---

# 66. UPI

For Indian businesses, UPI may eventually be an important payment method.

However, FrontDesk should not assume that displaying a static UPI identifier is equivalent to verified payment confirmation.

A verified payment integration should be used when payment status needs to be authoritative.

---

# 67. Cash Payments

Cash may be recorded manually.

Example:

    Method:
    CASH

    Amount:
    ₹500

    Recorded By:
    Owner

---

# 68. Bank Transfer

Future:

    Method:
    BANK_TRANSFER

Reference:

    UTR / transaction reference

Payment may initially remain:

    PENDING

until verified.

---

# 69. Payment Verification

Future:

    Payment:
    PENDING

Owner:

    Verify

↓

    PAID

Verification should be auditable.

---

# 70. Payment Reconciliation

Future:

    FrontDesk Records
          ↕
    Provider Settlement
          ↕
    Bank Records

This is outside v0.1.

---

# 71. Settlement

Payment success does not necessarily mean funds have settled into the business bank account.

These concepts should remain separate in future:

    Payment
    Settlement

---

# 72. Provider Fees

Future payment providers may charge fees.

Example:

    Customer Paid:
    ₹1,000

    Provider Fee:
    ₹20

    Business Settlement:
    ₹980

Provider fees should be represented separately from the customer's order amount.

---

# 73. Revenue

FrontDesk should not define:

    Payment = Revenue

because accounting/revenue recognition can be more complex.

Analytics should use clearly defined financial metrics.

---

# 74. Tax

Payment records should not automatically determine tax liability.

Tax calculation and accounting are separate concerns.

---

# 75. Financial Data Integrity

Historical financial records should not be casually edited.

Instead of:

    Edit payment from ₹1,000 → ₹500

future systems should use:

    Adjustment
    Refund
    Correction

with audit history.

---

# 76. Payment Immutability

Once a successful payment is recorded, core financial attributes should be treated as immutable.

Example:

    Amount
    Currency
    Provider Reference
    Paid At

Changes should require controlled correction mechanisms.

---

# 77. Deletion

Payments should generally not be hard-deleted.

Use:

    Void
    Refund
    Adjustment

where applicable.

This preserves financial history.

---

# 78. Payment Data Retention

Payment data may have legal/accounting retention requirements.

FrontDesk should provide configurable retention policies in future.

Exact retention requirements should be determined based on jurisdiction and business use.

---

# 79. Workspace Isolation

Payment data belonging to:

    Business A

must never be visible to:

    Business B

even if both exist in the same FrontDesk deployment.

---

# 80. Role-Based Access

Every payment management endpoint must verify:

    Authenticated User
          ↓
    Workspace Membership
          ↓
    Role / Permission
          ↓
    Payment Access

---

# 81. API Security

Payment endpoints must include:

- authentication,
- authorization,
- input validation,
- rate limiting,
- idempotency where applicable,
- secure error handling.

---

# 82. Sensitive Provider Data

Do not unnecessarily store:

    Card numbers
    CVV
    Bank passwords
    Provider secrets

FrontDesk should rely on provider-hosted secure payment mechanisms wherever appropriate.

---

# 83. Secret Management

Payment provider credentials must never be stored:

    in frontend code,
    in public repositories,
    in documentation,
    in database records accessible to normal users.

Secrets belong in secure server-side configuration.

---

# 84. Error Messages

Payment errors should not expose sensitive information.

Avoid:

    "Stripe secret key invalid: sk_live_..."

Instead:

    "Payment could not be processed."

Detailed provider errors belong in protected server logs.

---

# 85. Payment Webhook Logs

Future webhook processing should record safe diagnostic information.

Do not log:

    payment secrets
    authentication tokens
    sensitive payment credentials

---

# 86. Payment Event Architecture

Conceptually:

    Payment Service
          ↓
    PAYMENT_SUCCESS
          ↓
    +------------+-------------+
    |            |             |
   Order       Notification  Analytics
    |
    ↓
  Customer

---

# 87. Order Integration

Example:

    Order:
    ₹650

    Payment:
    ₹650

    Payment status:
    PAID

Then:

    Order may transition according
    to business rules.

Payment should not blindly control order status.

---

# 88. Booking Integration

Example:

    Booking:
    Haircut

    Deposit:
    ₹100

Payment:

    PAID

The booking remains:

    CONFIRMED

Payment and booking status remain separate.

---

# 89. Quote Integration

Future:

    Quote:
    ₹10,000

Customer accepts.

↓

    Order:
    ₹10,000

↓

    Payment:
    ₹5,000

Payment status:

    PARTIALLY_PAID

---

# 90. Invoice Integration

Future:

    Invoice:
    ₹10,000

    Payments:
    ₹4,000
    ₹6,000

Invoice:

    PAID

---

# 91. Loyalty Integration

Future:

    Successful order/payment

↓

    Loyalty Engine

↓

    Award points

Points should be awarded according to defined business rules, not simply whenever a payment record is created.

---

# 92. Review Integration

Future:

    Order completed

or:

    Booking completed

↓

    Review request

Payment completion alone should not automatically trigger a review unless business rules require it.

---

# 93. Analytics Integration

Future metrics:

    Gross payment volume
    Paid orders
    Average transaction value
    Refund amount
    Payment success rate

Definitions must be documented centrally.

---

# 94. Business Copilot Integration

Future:

    "You received ₹18,500
     in payments today."

or:

    "3 orders remain unpaid."

The Copilot should consume validated analytics/payment data.

---

# 95. Payment Health Monitoring

Future:

    Payment success rate:
    97%

    Failed payments:
    3

    Refunds:
    ₹2,400

---

# 96. Payment Anomaly Detection

Future AI may detect:

    Unusual refund volume

    Sudden increase in failed payments

    Repeated payment attempts

    Duplicate payment patterns

AI should recommend investigation rather than automatically making financial changes.

---

# 97. Fraud Signals

Future:

    Multiple failed payment attempts
    Unusual order patterns
    Suspicious transaction behavior

Fraud detection should remain a separate specialized capability.

---

# 98. Payment Reconciliation

Future:

    Payment Records
       ↓
    Provider Transactions
       ↓
    Settlement Records
       ↓
    Reconciliation

This is not a v0.1 feature.

---

# 99. Multi-Currency

Future businesses may operate internationally.

Payment records should preserve:

    Currency

and must not silently convert historical amounts.

---

# 100. Currency Conversion

Future analytics may convert currencies for reporting.

The original payment must preserve its original:

    Amount
    Currency

---

# 101. Exchange Rate

If conversion is used:

    Original:
    €100

    Converted:
    ₹9,200

The conversion rate and timestamp should be preserved for reproducibility.

---

# 102. Payment Export

Future:

    CSV
    JSON

Export must respect:

    Permissions
    Privacy
    Financial access rules

---

# 103. Payment Reports

Future:

    Daily Payments
    Weekly Payments
    Monthly Payments

These belong to reporting/analytics.

---

# 104. Financial Dashboard

Future:

    Revenue
    Payments
    Refunds
    Outstanding Amount
    Payment Success Rate

This must use centralized metric definitions.

---

# 105. Outstanding Payments

Future:

    Order:
    ₹5,000

    Paid:
    ₹3,000

    Outstanding:
    ₹2,000

This is a calculated business metric.

---

# 106. Payment Reminder

Future:

    Order unpaid for 2 days

↓

    AI suggests:

    "Send payment reminder?"

Owner:

    Approve

↓

    Customer receives reminder.

---

# 107. Automated Payment Reminder

Future:

    WHEN
    Invoice is unpaid for 7 days

    THEN
    Send reminder

This belongs to the automation system.

---

# 108. AI Payment Assistant

Future owner request:

    "Show me unpaid orders."

AI:

    7 unpaid orders
    Total outstanding:
    ₹18,500

---

# 109. AI Payment Query

Owner:

    "Was Arun's order paid?"

AI:

    "Yes. ₹650 was recorded as paid
     by UPI on August 26."

AI must retrieve actual payment records.

---

# 110. AI Financial Safety

AI should never answer financial questions from assumptions.

For example:

    "Did we make ₹50,000 today?"

The answer must come from validated analytics/payment data.

---

# 111. Payment Approval Inbox

Future high-risk operations:

    AI wants to:

    Issue refund ₹2,000

    [Approve]
    [Reject]

This integrates with the AI Approval system.

---

# 112. Business Safety Mode

Payment-related actions should receive stronger protection than ordinary content changes.

Example:

    AI requested financial action.

    Amount:
    ₹5,000

    Reason:
    Customer cancellation

    [Review]

---

# 113. Payment Audit Timeline

Example:

    Aug 26 — 10:00 AM
    Order created

    Aug 26 — 10:05 AM
    Payment initiated

    Aug 26 — 10:06 AM
    Payment confirmed

    Aug 26 — 10:07 AM
    Order marked paid

Every important event should preserve attribution.

---

# 114. Manual Correction

If a payment was entered incorrectly:

Do not simply overwrite history.

Future correction flow:

    Original Payment
          ↓
    Correction
          ↓
    Audit Record

---

# 115. Financial Data Integrity Rule

> Never silently rewrite financial history.

Every material financial change must be:

    Explicit
    Authorized
    Auditable

---

# 116. v0.1 Free-Cost Implementation

For the first free development version:

### Supported

    Manual payment records
    Cash
    UPI reference
    Payment status
    Payment history
    Order association
    Basic audit

### Not required

    Payment gateway
    Automated refunds
    Subscription billing
    Settlement reconciliation
    Payment marketplace

---

# 117. v0.1 P0 Requirements

    PAYMENT-P0-001
    Authorized users can create manual payment records.

    PAYMENT-P0-002
    Every payment has a unique ID.

    PAYMENT-P0-003
    Payments belong to the correct workspace/business.

    PAYMENT-P0-004
    Payments can be associated with an order.

    PAYMENT-P0-005
    Payment amount is stored precisely.

    PAYMENT-P0-006
    Payment currency is stored.

    PAYMENT-P0-007
    Payment status is supported.

    PAYMENT-P0-008
    Payment method is recorded.

    PAYMENT-P0-009
    Payment timestamp is recorded.

    PAYMENT-P0-010
    Authorized users can view payment information.

    PAYMENT-P0-011
    Marking a payment as paid is authorized.

    PAYMENT-P0-012
    Important payment actions are auditable.

    PAYMENT-P0-013
    Payment data is isolated between businesses.

    PAYMENT-P0-014
    Financial values are calculated server-side.

    PAYMENT-P0-015
    Payment history cannot be silently rewritten.

---

# 118. v0.1 P1 Requirements

    PAYMENT-P1-001
    Payment search.

    PAYMENT-P1-002
    Payment filters.

    PAYMENT-P1-003
    Payment activity timeline.

    PAYMENT-P1-004
    Customer payment history.

    PAYMENT-P1-005
    Outstanding payment calculation.

    PAYMENT-P1-006
    Payment notifications.

    PAYMENT-P1-007
    Payment export.

    PAYMENT-P1-008
    Manual refund records.

    PAYMENT-P1-009
    Partial payment support.

    PAYMENT-P1-010
    Payment analytics.

---

# 119. v0.1 P2 Requirements

    PAYMENT-P2-001
    Online payment gateway.

    PAYMENT-P2-002
    Payment intents.

    PAYMENT-P2-003
    Payment attempts.

    PAYMENT-P2-004
    Provider webhooks.

    PAYMENT-P2-005
    Automatic payment verification.

    PAYMENT-P2-006
    Payment links.

    PAYMENT-P2-007
    QR payments.

    PAYMENT-P2-008
    Automated refunds.

    PAYMENT-P2-009
    Partial refunds.

    PAYMENT-P2-010
    Subscriptions.

    PAYMENT-P2-011
    Payment reconciliation.

    PAYMENT-P2-012
    Settlement tracking.

    PAYMENT-P2-013
    Provider fee tracking.

    PAYMENT-P2-014
    Multi-currency payment processing.

    PAYMENT-P2-015
    AI financial actions.
120. Acceptance Criteria

The Payments & Transactions module is complete for v0.1 when:

Authorized users can record a manual payment.
Every payment has a unique identifier.
Every payment belongs to the correct workspace/business.
A payment can be linked to an order.
Payment amount is stored precisely.
Currency is explicitly stored.
Payment method is stored.
Payment status is supported.
Payment timestamps are preserved.
Only authorized users can record/modify payment state.
Important payment actions are audited.
Historical financial information cannot be silently overwritten.
Payment data is isolated between businesses.
Server-side calculations are authoritative.
The architecture supports future payment providers.
The architecture supports future refunds.
The architecture supports future payment webhooks.
The architecture supports future partial payments.
The architecture does not require a paid payment provider for v0.1.
121. Example Manual Payment

Order:

ORD-00123

Total:

₹650

Customer pays:

UPI

Owner opens order.

Selects:

Record Payment

Enters:

Amount:
₹650

Method:
UPI

Reference:
123456789012

Clicks:

Save Payment

FrontDesk records:

PAY-00123

Status:
PAID

Order remains:

CONFIRMED

Payment status:

PAID
122. Example Partial Payment

Future:

Order:

₹10,000

Customer pays:

₹3,000

Payment:

PARTIALLY_PAID

Outstanding:

₹7,000

Later:

₹7,000

Total paid:

₹10,000

Order payment state:

PAID
123. Example Refund

Order:

₹1,000

Payment:

₹1,000 PAID

Customer cancels.

Business approves refund.

Refund:

₹1,000

Payment state:

REFUNDED

Order:

CANCELLED

Both events remain in history.

124. Example Future Online Payment

Customer:

Order total:
₹650

↓

FrontDesk creates:

Payment Intent

↓

Customer completes payment through provider.

↓

Provider:

Payment successful

↓

Provider sends:

Webhook

↓

FrontDesk verifies webhook.

↓

Payment:

PAID

↓

Order:

Payment state updated.

↓

Customer:

Payment confirmation.
125. Example Failed Payment

Customer attempts:

₹650

↓

Payment Attempt:

FAILED

↓

Payment remains:

UNPAID

Customer:

Retry Payment

↓

New attempt.

The failed attempt remains in history.

126. Example Payment Safety

AI:

"The customer requested a refund."

AI proposes:

Refund:
₹1,000

Owner sees:

AI wants to issue a ₹1,000 refund.

Reason:
Customer cancellation

[Approve]
[Reject]

Only after approval:

Refund operation executes.
127. Example Business Copilot

Future:

Good morning 👋

Payment summary:

₹18,500 received yesterday.

4 orders remain unpaid.

Outstanding:
₹6,200

1 payment failed twice.

[Review Payments]
128. Future Payment Lifecycle

Long-term:

Customer
   ↓
Order / Booking
   ↓
Payment Intent
   ↓
Payment Attempt
   ↓
Provider
   ↓
Verification
   ↓
Payment
   ↓
Order / Booking
   ↓
Fulfilment
   ↓
Completion
   ↓
Refund if required
129. Final Architecture Principle

Payments should remain independent from:

orders,
bookings,
invoices,
quotations,
customers,
inventory,
notifications,
analytics,
AI agents.

They should connect through explicit relationships and events.

Conceptually:

Payment
   |
   +---- Order
   |
   +---- Booking
   |
   +---- Invoice
   |
   +---- Customer
   |
   +---- Provider
   |
   +---- Refund
   |
   +---- Notification
   |
   +---- Analytics
   |
   +---- Audit Log
130. Final Principle

Money-related records must be more trustworthy than ordinary business content.

FrontDesk should treat payments as:

Precise → Authorized → Verifiable → Auditable → Immutable.