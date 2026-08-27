Next is ORDERS-AND-ORDER-MANAGEMENT.md.

This defines the transaction layer that comes after the enquiry system:

Catalog → Customer → Enquiry → Order → Payment → Fulfilment → Completion

For v0.1, we should not turn FrontDesk into a full Shopify/POS/ERP. We need a lightweight order foundation that can later support online ordering, WhatsApp orders, AI agents, payments, inventory, invoices, and analytics.

Create:

FrontDesk/
└── documentation/
    └── 02-product/
        └── FEATURE-SPECIFICATIONS/
            └── ORDERS-AND-ORDER-MANAGEMENT.md
ORDERS-AND-ORDER-MANAGEMENT.md
# FrontDesk — Orders & Order Management Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Orders & Order Management
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Orders & Order Management module defines how FrontDesk represents, creates, tracks, updates, and completes customer orders.

The goal is to provide a lightweight order foundation for businesses such as:

- cafés,
- restaurants,
- bakeries,
- boutiques,
- furniture businesses,
- home businesses,
- food carts,
- local shops,
- freelancers,
- service providers.

The module should eventually support:

- website orders,
- QR orders,
- WhatsApp orders,
- manually created orders,
- AI-created orders,
- payment tracking,
- fulfilment,
- inventory integration,
- invoices,
- analytics.

---

# 2. Core Principle

FrontDesk should treat an order as a business transaction rather than simply a message.

The long-term flow is:

    Customer
       ↓
    Product / Service
       ↓
    Order
       ↓
    Payment
       ↓
    Fulfilment
       ↓
    Completion
       ↓
    Customer History

---

# 3. v0.1 Scope

The first release should establish:

- basic order creation,
- order items,
- customer association,
- order status,
- order totals,
- basic payment status,
- order source,
- order details,
- order history,
- owner/staff access,
- basic order activity.

The following should remain future scope:

- full ecommerce,
- advanced inventory,
- POS,
- payment gateway orchestration,
- delivery management,
- subscriptions,
- advanced tax/accounting,
- marketplace orders.

---

# 4. Order Definition

An order represents a customer's request to purchase a product or service.

Example:

    Customer:
    Arun Kumar

    Order:
    2 × Chocolate Cake
    1 × Brownie

    Total:
    ₹1,480

---

# 5. Order vs Enquiry

These are different entities.

### Enquiry

Customer is asking or requesting information.

Example:

    "How much is a 2 kg cake?"

### Order

Customer has requested a purchase.

Example:

    "I want to order one 2 kg chocolate cake."

An enquiry may eventually become an order.

---

# 6. Enquiry → Order

Future flow:

    Enquiry
       ↓
    Customer confirms purchase
       ↓
    Order

The original enquiry should remain linked to the resulting order.

---

# 7. Order Sources

Possible sources:

    WEBSITE
    QR
    WHATSAPP
    MANUAL
    AI_AGENT
    API
    MARKETPLACE
    POS

v0.1 may initially support:

    WEBSITE
    MANUAL

---

# 8. Order ID

Every order must have a unique internal identifier.

Example:

    order_123

A human-readable display number may be:

    ORD-00123

The internal ID and public/display number should remain separate.

---

# 9. Order Object

Conceptually:

    Order
    ├── ID
    ├── Display Number
    ├── Workspace ID
    ├── Business ID
    ├── Customer ID
    ├── Source
    ├── Status
    ├── Payment Status
    ├── Fulfilment Status
    ├── Currency
    ├── Subtotal
    ├── Discount
    ├── Tax
    ├── Delivery Fee
    ├── Total
    ├── Customer Notes
    ├── Internal Notes
    ├── Created At
    └── Updated At

Exact database structure belongs to database documentation.

---

# 10. Order Items

An order contains one or more items.

Example:

    Order #ORD-00123

    Items:

    Chocolate Cake
    Quantity: 2
    Unit Price: ₹650

    Brownie
    Quantity: 1
    Unit Price: ₹180

---

# 11. Order Item Object

Conceptually:

    Order Item
    ├── Product/Service ID
    ├── Name Snapshot
    ├── SKU Snapshot
    ├── Quantity
    ├── Unit Price
    ├── Discount
    ├── Tax
    └── Total

---

# 12. Historical Price Snapshot

Orders must preserve the price used at the time of purchase.

Example:

    Product current price:
    ₹750

    Historical order price:
    ₹650

The old order must continue to show:

    ₹650

Changing a product's current price must not rewrite historical orders.

---

# 13. Product Snapshot

Orders should preserve relevant product information needed for historical display.

Example:

    Product:
    Chocolate Cake

    Ordered at:
    ₹650

Even if the product is later:

    Renamed
    Deleted
    Repriced

the historical order should remain understandable.

---

# 14. Service Orders

Orders may eventually contain services.

Example:

    Haircut
    ₹300

or:

    Photography Package
    ₹15,000

The underlying order model should support both products and services where appropriate.

---

# 15. Quantity

Order items should support quantity.

Example:

    Chocolate Cake × 2

Quantity should use a suitable numeric representation.

---

# 16. Unit-Based Products

Future businesses may sell:

    kg
    litre
    metre
    hour
    session

Example:

    Cake:
    2 kg

The initial order model should avoid assuming every item is simply "one unit."

---

# 17. Product Variants

Future:

    Chocolate Cake
    Size:
    1 kg

    Chocolate Cake
    Size:
    2 kg

Variants may affect:

    Price
    SKU
    Inventory

Not required for the smallest v0.1 implementation unless the catalog requires it.

---

# 18. Add-ons

Future:

    Burger
    + Cheese
    + Fries

The order model should eventually support configurable add-ons.

---

# 19. Customization

Businesses may have customized orders.

Example:

    Cake:
    "Happy Birthday Sara"

Custom instructions should be stored with the order item where appropriate.

---

# 20. Customer Notes

Customer may provide:

    "Please deliver before 5 PM."

This should be stored separately from internal business notes.

---

# 21. Internal Notes

Staff may add:

    "Customer requested extra packaging."

Internal notes must not automatically appear to the customer.

---

# 22. Order Status

v0.1 should support:

    PENDING
    CONFIRMED
    COMPLETED
    CANCELLED

Future:

    PROCESSING
    READY
    OUT_FOR_DELIVERY
    DELIVERED
    REFUNDED

---

# 23. Pending

Meaning:

    Order has been created but is not yet confirmed.

Example:

    Customer submitted order.

    Status:
    PENDING

---

# 24. Confirmed

Meaning:

    Business has accepted the order.

Example:

    Status:
    CONFIRMED

---

# 25. Completed

Meaning:

    Order has successfully been fulfilled/completed.

Example:

    Status:
    COMPLETED

---

# 26. Cancelled

Meaning:

    Order will not be fulfilled.

Example:

    Status:
    CANCELLED

Cancellation should record an appropriate reason where required.

---

# 27. Order Status Transitions

Basic flow:

    PENDING
       ↓
    CONFIRMED
       ↓
    COMPLETED

Cancellation may occur from appropriate states:

    PENDING
       ↓
    CANCELLED

    CONFIRMED
       ↓
    CANCELLED

Exact transition rules belong to business logic.

---

# 28. Payment Status

Payment status is separate from order status.

Possible:

    UNPAID
    PENDING
    PAID
    FAILED
    REFUNDED
    PARTIALLY_REFUNDED

v0.1 may only need:

    UNPAID
    PAID

---

# 29. Why Payment Status Is Separate

Example:

    Order:
    CONFIRMED

    Payment:
    UNPAID

This is valid.

A business may accept an order before payment.

Therefore:

    Order Status
    ≠
    Payment Status

---

# 30. Payment Provider

v0.1 should not tightly couple the order model to one payment provider.

Future:

    Order
       ↓
    Payment Service
       ↓
    Payment Provider

---

# 31. Manual Payment

Future/manual business flow:

    Customer pays cash.

Owner marks:

    PAID

This action should be permission-controlled and auditable.

---

# 32. Online Payment

Future:

    Customer
       ↓
    Checkout
       ↓
    Payment Provider
       ↓
    Payment Confirmation
       ↓
    Order

The provider should confirm payment through a secure server-side mechanism.

Do not trust only client-side payment success messages.

---

# 33. Payment Confirmation

The backend should verify payment before changing:

    UNPAID
       ↓
    PAID

The exact implementation belongs to payment architecture.

---

# 34. Currency

Orders should store the currency associated with the transaction.

Example:

    INR

Do not assume all businesses operate in INR forever.

---

# 35. Money Representation

Financial values should not rely on floating-point arithmetic.

Use an appropriate precise money representation.

Exact implementation belongs in backend/database architecture.

---

# 36. Subtotal

Example:

    Product A:
    ₹500

    Product B:
    ₹300

    Subtotal:
    ₹800

---

# 37. Discount

Example:

    Subtotal:
    ₹800

    Discount:
    ₹100

    Total before other charges:
    ₹700

Discount should be represented explicitly.

---

# 38. Tax

Future:

    Subtotal:
    ₹800

    Tax:
    ₹40

Tax logic must be configurable and should not assume one universal tax rule.

---

# 39. Delivery Fee

Future:

    Delivery:
    ₹50

This should be represented separately from the product price.

---

# 40. Total

Conceptually:

    Total =
    Subtotal
    - Discount
    + Tax
    + Delivery Fee
    + Other applicable charges

Exact calculation rules must be centralized.

---

# 41. Order Total Immutability

Once an order is finalized, changing the product catalog should not automatically change the historical order total.

---

# 42. Price Calculation

The server must calculate authoritative order totals.

Do not trust totals submitted by the browser.

Example:

    Client:
    Total = ₹100

    Server:
    Calculates actual total = ₹150

Server value wins.

---

# 43. Order Validation

Before creating an order, backend should validate:

    Customer
    Product
    Quantity
    Price
    Availability
    Discounts
    Taxes
    Currency

Only applicable checks should be performed.

---

# 44. Product Availability

Future order creation should check whether a product is available.

Example:

    Product:
    Chocolate Cake

    Status:
    OUT OF STOCK

The system should prevent or warn about ordering it according to business configuration.

---

# 45. Race Conditions

Two customers may try to purchase the last available item simultaneously.

Future inventory/order systems must handle concurrent operations safely.

This is especially important once inventory becomes authoritative.

---

# 46. Inventory Integration

Long-term:

    Order Created
       ↓
    Inventory Reservation
       ↓
    Order Confirmed
       ↓
    Inventory Deducted

The order system should not directly embed all inventory logic.

---

# 47. Inventory v0.1

Full inventory is outside the initial scope.

The catalog may simply contain:

    Available
    Unavailable

This is sufficient for the first product version.

---

# 48. Order Fulfilment

Future fulfilment states:

    NOT_STARTED
    PREPARING
    READY
    OUT_FOR_DELIVERY
    DELIVERED
    COMPLETED

Not all businesses require all states.

---

# 49. Pickup

Future:

    Fulfilment Method:
    PICKUP

Possible details:

    Pickup Location
    Pickup Time

---

# 50. Delivery

Future:

    Fulfilment Method:
    DELIVERY

Possible details:

    Address
    Delivery Fee
    Delivery Time
    Delivery Status

---

# 51. Service Fulfilment

For service businesses:

    Booking / Appointment
       ↓
    Service Completed
       ↓
    Order Completed

The order system should remain compatible with service-based transactions.

---

# 52. Order Address

Future orders may require delivery addresses.

Customer profiles may have addresses, but an order should preserve the address used for that order.

Example:

    Customer current address:
    Address B

    Historical order:
    Address A

The old order should remain associated with Address A.

---

# 53. Order Address Snapshot

When an order is confirmed, relevant delivery information should be captured as an order snapshot.

This prevents later customer profile changes from rewriting historical delivery records.

---

# 54. Customer Association

Every order should reference the appropriate business customer relationship where possible.

Example:

    Order #1001
        ↓
    Customer #123

---

# 55. Guest Orders

Future orders may be placed without a FrontDesk customer account.

Example:

    Guest Checkout
       ↓
    Order

The system may create a business customer relationship if enough information is available.

---

# 56. Customer Account Requirement

A customer should not be forced to create a FrontDesk account merely to place an order unless the business specifically requires it.

---

# 57. Order Source Attribution

Example:

    Order #1001

    Source:
    QR

or:

    Source:
    WhatsApp

This can later support revenue attribution.

---

# 58. QR Order Flow

Future:

    Customer scans QR
       ↓
    Business Catalog
       ↓
    Select Products
       ↓
    Cart
       ↓
    Order
       ↓
    Payment
       ↓
    Business

---

# 59. WhatsApp Order Flow

Future:

    Customer:
    "I want 2 chicken shawarmas."

↓

    AI / Staff
       ↓
    Structured Order
       ↓
    Customer Confirmation
       ↓
    Order Created

The system should not create an order from an ambiguous message without appropriate confirmation.

---

# 60. AI Order Creation

Future AI may extract:

    Product:
    Chicken Shawarma

    Quantity:
    2

from:

    "I want two chicken shawarmas."

Before finalizing an order, the system should confirm:

    2 × Chicken Shawarma
    Total ₹300

    Confirm order?

---

# 61. AI Order Safety

AI should not invent:

    Product
    Price
    Quantity
    Availability
    Delivery fee

All critical values must come from authoritative business data.

---

# 62. Customer Order Confirmation

Future:

    Your order is:

    2 × Chicken Shawarma
    1 × Coke

    Total:
    ₹350

    [Confirm]

This creates a clear confirmation boundary.

---

# 63. Order Confirmation Timestamp

Important order transitions should record when they occurred.

Example:

    Created:
    10:20 AM

    Confirmed:
    10:24 AM

    Completed:
    11:15 AM

---

# 64. Order Activity

Future order timeline:

    Order Created
    ↓
    Payment Received
    ↓
    Confirmed
    ↓
    Preparing
    ↓
    Ready
    ↓
    Completed

---

# 65. Order Audit

Important changes should record:

    Who
    What
    When

Example:

    Owner changed order status:
    PENDING → CONFIRMED

---

# 66. AI Attribution

Future:

    Status changed by:
    AI Agent

or:

    Order created by:
    AI Agent

AI actions must be auditable.

---

# 67. Automation Attribution

Future:

    Order confirmation sent by:
    Automation

---

# 68. Order Cancellation

Cancellation should record:

    Cancelled By
    Cancelled At
    Cancellation Reason

Possible actors:

    CUSTOMER
    OWNER
    STAFF
    SYSTEM
    AI
    AUTOMATION

---

# 69. Cancellation Rules

The business may configure:

    Cancellation allowed before preparation.

or:

    Cancellation requires staff approval.

Exact rules are future configuration.

---

# 70. Refund

Refund is separate from cancellation.

Example:

    Order:
    CANCELLED

    Payment:
    REFUNDED

The system must not assume cancellation automatically means refund.

---

# 71. Partial Refund

Future:

    Order:
    ₹1,000

    Refund:
    ₹300

    Remaining:
    ₹700

This requires a dedicated payment/refund model.

---

# 72. Refund Authority

Refunds are high-impact financial actions.

Future AI should not perform refunds without explicit permission.

---

# 73. Order Notes

Separate:

    Customer Notes

from:

    Internal Notes

Customer notes may be visible to staff.

Internal notes are private.

---

# 74. Customer Order History

Customer profile may show:

    Orders

    #1001
    ₹650
    Completed

    #1012
    ₹1,200
    Completed

---

# 75. Business Order List

Owner dashboard:

    Orders

    ┌─────────────────────────────────────┐
    │ #1001   Arun Kumar   ₹650   PAID   │
    │ #1002   Priya        ₹420   UNPAID │
    │ #1003   Ravi         ₹1,200 PENDING│
    └─────────────────────────────────────┘

---

# 76. Order Filters

v0.1:

    All
    Pending
    Confirmed
    Completed
    Cancelled

Future:

    Paid
    Unpaid
    Delivery
    Pickup
    High Value
    Today

---

# 77. Order Search

Search by:

    Order Number
    Customer Name
    Phone
    Product

Only fields the user is authorized to access should be searchable.

---

# 78. Order Detail

Recommended:

    Order #ORD-00123

    Customer
    Arun Kumar

    Items
    2 × Chocolate Cake

    Subtotal
    ₹1,300

    Discount
    ₹100

    Total
    ₹1,200

    Payment
    UNPAID

    Status
    PENDING

---

# 79. Order Actions

Possible:

    Confirm
    Cancel
    Mark Paid
    Add Note
    Complete

Only valid actions for the current state should be shown.

---

# 80. Order Permissions

Future permissions:

    order.read
    order.create
    order.update
    order.confirm
    order.cancel
    order.mark_paid
    order.refund
    order.export

---

# 81. Staff Access

A staff member may be allowed to:

    View orders
    Update status

but not:

    Refund payments

Permissions should be granular.

---

# 82. Owner Access

Owners may have broader access.

However, even owner actions should be audited for important financial operations.

---

# 83. Order Notifications

Possible events:

    ORDER_CREATED
    ORDER_CONFIRMED
    PAYMENT_RECEIVED
    ORDER_CANCELLED
    ORDER_COMPLETED

These events should be handled by the Notifications system.

---

# 84. Customer Notifications

Future:

    Your order has been confirmed.

    Your order is ready.

    Your order has been completed.

The exact communication channel depends on configuration.

---

# 85. Order Communication

Future channels:

    Website
    WhatsApp
    Email
    SMS
    Push

Do not implement all channels in v0.1.

---

# 86. Order + Enquiry

Example:

    Enquiry:
    "Can I order 2 kg cake?"

↓

    Order:
    2 kg Chocolate Cake

The relationship should remain visible.

---

# 87. Order + Customer CRM

Order completion should update the customer activity timeline.

Example:

    Aug 26
    Order #1002 completed

---

# 88. Order + Analytics

Future analytics can calculate:

    Revenue
    Orders
    Average Order Value
    Conversion Rate
    Repeat Purchase Rate

Definitions must be centralized.

---

# 89. Order + Business Copilot

Future AI:

    "You received 18 orders today,
     20% more than yesterday."

or:

    "Your average order value dropped 8%."

These are analytics capabilities, not order logic itself.

---

# 90. Order + Inventory

Future:

    Product ordered
       ↓
    Inventory updated

Inventory must remain a separate module.

---

# 91. Order + Loyalty

Future:

    Order completed
       ↓
    Loyalty Engine
       ↓
    Points Awarded

Example:

    ₹500 spent
       ↓
    50 points

---

# 92. Order + Reviews

Future:

    Order Completed
       ↓
    Review Request

Example:

    "How was your experience?"

This should be handled through the communications system.

---

# 93. Order + Win-Back

Future:

    Last Order:
    60 days ago

↓

    Customer becomes eligible
    for win-back recommendation.

---

# 94. Order + Offers

Future:

    Coupon:
    WEEKEND20

Order records:

    Coupon Used:
    WEEKEND20

    Discount:
    ₹120

---

# 95. Coupon Validation

The server must validate:

    Coupon exists
    Active
    Not expired
    Minimum order
    Product eligibility
    Usage limit
    Customer eligibility

Do not trust client-submitted discount values.

---

# 96. Tax

Tax calculations should be configurable and region-aware.

Do not hardcode:

    18%

as a universal tax rate.

---

# 97. Invoice Integration

Future:

    Order
       ↓
    Invoice

The invoice should preserve transaction information.

---

# 98. Quote → Order

Future:

    Quote
       ↓
    Customer Accepts
       ↓
    Order Created

The relationship should be preserved.

---

# 99. Quote vs Order

### Quote

Proposal.

### Order

Customer/business transaction commitment.

They should remain separate entities.

---

# 100. Order Number

Display order numbers should be human-friendly.

Example:

    ORD-2026-00123

The exact format may be configurable in future.

---

# 101. Multi-Business Order Isolation

Order #1001 from:

    Business A

must never be visible to:

    Business B

---

# 102. Multi-Location Orders

Future businesses may have:

    Royal Bakes
    ├── Tambaram
    └── Chromepet

An order may belong to a specific location.

Example:

    Location:
    Tambaram

This is future multi-location scope.

---

# 103. Timezone

Order timestamps should be stored consistently and displayed according to the relevant business/user timezone.

Do not assume all businesses use the same timezone.

---

# 104. Historical Data

Historical orders should remain understandable even if:

    Product deleted
    Product renamed
    Price changed
    Customer updated

Historical snapshots are therefore important.

---

# 105. Order Immutability

Once an order reaches an important finalized state, changes should be controlled.

Example:

    COMPLETED

should not casually be changed to:

    PENDING

without an explicit operation.

---

# 106. Order Revision

Future:

    Order modification

should record:

    Previous state
    New state
    Actor
    Time

---

# 107. Version History

Important order changes should be auditable.

Example:

    10:30 AM
    Quantity changed:
    1 → 2

    By:
    Owner

---

# 108. Customer-Facing Order Status

Future customers may see:

    Order Received

    Confirmed

    Preparing

    Ready

    Completed

Internal statuses may be more detailed than customer-facing statuses.

---

# 109. Public Order Tracking

Future:

    /order/ORD-00123

should not expose sensitive information without appropriate access controls.

---

# 110. Order Tracking Token

Future public tracking may use a secure, non-guessable token.

Do not rely only on:

    ORD-00123

for authentication.

---

# 111. Order Security

Order data may contain:

    Customer information
    Address
    Phone
    Payment status
    Business information

Access must be protected.

---

# 112. Order API

Future concepts:

    GET /orders
    GET /orders/:id
    POST /orders
    PATCH /orders/:id

Actions:

    POST /orders/:id/confirm
    POST /orders/:id/cancel
    POST /orders/:id/complete

Exact API design belongs to API documentation.

---

# 113. Payment API

Future:

    POST /orders/:id/payment

However, payment provider callbacks/webhooks should be handled through secure server-side mechanisms.

---

# 114. Order Events

Future events:

    ORDER_CREATED
    ORDER_UPDATED
    ORDER_CONFIRMED
    ORDER_CANCELLED
    ORDER_COMPLETED
    PAYMENT_RECEIVED
    REFUND_CREATED

---

# 115. Event Architecture

Conceptually:

    Order Service
         ↓
    Business Event
         ↓
    +-----------+------------+
    |           |            |
 Notification Analytics    CRM
116. Idempotency

Important operations should be protected against duplicate requests.

Example:

Confirm Order

If the request is accidentally submitted twice, the system should not create two confirmations or duplicate financial operations.

117. Concurrent Updates

If two staff members update the same order simultaneously, the backend must avoid silently overwriting important changes.

Future implementation may use:

optimistic concurrency
version numbers
transaction controls

Exact strategy belongs to architecture documentation.

118. Order Export

Future:

CSV
JSON

Export should respect permissions.

119. Order Reporting

Future:

Daily Orders
Weekly Orders
Monthly Orders

These belong to analytics/reporting rather than the core order module.

120. Business Health

Future AI may detect:

Orders dropped 25%.

or:

Weekend orders increased 18%.

The order module provides events/data; analytics interprets them.

121. v0.1 Free-Cost Principle

Since FrontDesk is being developed with minimal/no cost:

v0.1 should avoid mandatory paid payment or commerce infrastructure.

The initial order model can support:

Manual order creation
Basic order status
Manual payment status

Online payment integration can be added later.

122. v0.1 P0 Requirements
ORDER-P0-001
Authorized users can create an order.

ORDER-P0-002
Every order has a unique internal ID.

ORDER-P0-003
Orders belong to the correct workspace/business.

ORDER-P0-004
Orders can be associated with a customer.

ORDER-P0-005
Orders contain one or more items.

ORDER-P0-006
Order items contain quantity.

ORDER-P0-007
Historical item price is preserved.

ORDER-P0-008
Order subtotal and total are calculated server-side.

ORDER-P0-009
Order status is supported.

ORDER-P0-010
Payment status is separate from order status.

ORDER-P0-011
Authorized users can view orders.

ORDER-P0-012
Authorized users can update valid order states.

ORDER-P0-013
Order data is isolated between businesses.

ORDER-P0-014
Order changes are appropriately validated.

ORDER-P0-015
Important order events can be emitted for future integrations.
123. v0.1 P1 Requirements
ORDER-P1-001
Order search.

ORDER-P1-002
Order filters.

ORDER-P1-003
Order activity history.

ORDER-P1-004
Customer order history.

ORDER-P1-005
Enquiry-to-order relationship.

ORDER-P1-006
Basic fulfilment status.

ORDER-P1-007
Manual payment recording.

ORDER-P1-008
Order notifications.

ORDER-P1-009
Basic order analytics.

ORDER-P1-010
Order export.
124. v0.1 P2 Requirements
ORDER-P2-001
Online payments.

ORDER-P2-002
Shopping cart.

ORDER-P2-003
QR ordering.

ORDER-P2-004
WhatsApp ordering.

ORDER-P2-005
AI order agent.

ORDER-P2-006
Inventory integration.

ORDER-P2-007
Delivery management.

ORDER-P2-008
Pickup management.

ORDER-P2-009
Coupons.

ORDER-P2-010
Loyalty integration.

ORDER-P2-011
Invoice generation.

ORDER-P2-012
Refund management.

ORDER-P2-013
POS integration.

ORDER-P2-014
Subscription orders.

ORDER-P2-015
Marketplace orders.

---

# 125. Acceptance Criteria

The Orders & Order Management module is complete for v0.1 when:

1. Authorized users can create orders.
2. Orders belong to the correct business/workspace.
3. Orders can be associated with customers.
4. Orders contain products/services as items.
5. Quantities are supported.
6. Historical prices are preserved.
7. Server-side totals are authoritative.
8. Order status is supported.
9. Payment status is separate from order status.
10. Authorized users can view and update orders.
11. Invalid status transitions are rejected.
12. Historical orders remain understandable after product changes.
13. Order information is protected by workspace permissions.
14. Important order events can integrate with notifications and analytics.
15. The architecture can later support online payments.
16. The architecture can later support inventory.
17. The architecture can later support WhatsApp and AI ordering.

---

# 126. Example End-to-End Flow

## Bakery Order

Customer visits:

    Royal Bakes

↓

Views:

    Chocolate Cake
    ₹650

↓

Selects:

    Quantity:
    2

↓

Creates order:

    ORD-00123

↓

Order:

    2 × Chocolate Cake
    ₹1,300

↓

Payment:

    UNPAID

↓

Business confirms:

    Order:
    CONFIRMED

↓

Customer pays:

    Payment:
    PAID

↓

Business prepares order.

↓

Order:

    COMPLETED

↓

Customer profile:

    Order added to activity history.

↓

Future:

    Review request sent.

---

# 127. Example Enquiry → Order

Customer:

    "How much is a 2 kg cake?"

↓

Enquiry:

    ENQ-00123

↓

Business replies:

    ₹650

↓

Customer:

    "Okay, I'll take one."

↓

Business creates:

    ORD-00124

↓

Relationship:

    ENQ-00123
         ↓
    ORD-00124

This allows FrontDesk to understand the complete customer journey.

---

# 128. Example Manual Order

A customer walks into the shop.

Owner opens FrontDesk.

Clicks:

    + New Order

Enters:

    Customer:
    Arun

    Product:
    Coffee

    Quantity:
    2

    Total:
    ₹240

Clicks:

    Create Order

Order:

    ORD-00125

Source:

    MANUAL

---

# 129. Example Future WhatsApp Order

Customer:

    "Hi, I want 2 chocolate cakes."

↓

AI checks:

    Product exists
    Price
    Availability

↓

AI:

    "2 Chocolate Cakes are ₹1,300.
     Would you like to place the order?"

↓

Customer:

    "Yes."

↓

AI creates:

    Order #ORD-00126

↓

Customer receives:

    Order confirmation.

---

# 130. Example AI Safety

Customer:

    "Give me 50% discount and place the order."

AI should not automatically apply the discount unless:

    Business rules allow it.

Otherwise:

    "I can't apply that discount, but I can ask the business."

---

# 131. Future Order Lifecycle

The long-term model:

    Discover
       ↓
    Product / Service
       ↓
    Enquiry
       ↓
    Order
       ↓
    Payment
       ↓
    Fulfilment
       ↓
    Completion
       ↓
    Review
       ↓
    Loyalty
       ↓
    Repeat Purchase

---

# 132. Final Architecture Principle

Orders should remain independent from:

- catalog,
- customer profiles,
- enquiries,
- payments,
- inventory,
- communications,
- loyalty,
- analytics.

They should connect through clear relationships and events.

Conceptually:

    Order
       |
       +---- Customer
       |
       +---- Order Items
       |
       +---- Enquiry
       |
       +---- Payment
       |
       +---- Fulfilment
       |
       +---- Communication
       |
       +---- Future Inventory
       |
       +---- Analytics

---

# 133. Final Principle

> An order is the transaction boundary between customer intent and business fulfilment.

FrontDesk should make this transaction:

**Clear → Reliable → Traceable → Secure → Extensible.**

---

# 134. Document Status

**Status:** DRAFT — FOR REVIEW

This document must remain synchronized with:

- PRD.md
- BRD.md
- BUSINESS-IMPORTER.md
- BUSINESS-KNOWLEDGE-BASE.md
- WEBSITE-BUILDER.md
- QR-AND-PUBLIC-PRESENCE.md
- WHATSAPP-ENQUIRY.md
- BASIC-ANALYTICS.md
- BUSINESS-UPDATES.md
- USER-ACCOUNTS-AND-WORKSPACES.md
- PUBLISHING-AND-VERSIONING.md
- MEDIA-AND-ASSET-MANAGEMENT.md
- DOMAIN-AND-CUSTOM-URLS.md
- NOTIFICATIONS-AND-COMMUNICATIONS.md
- SEARCH-AND-DISCOVERY.md
- CUSTOMER-PROFILES-AND-CRM.md
- ENQUIRY-AND-INBOX.md
- Payment documentation
- Inventory documentation
- Fulfilment documentation
- Quote/Invoice documentation
- Booking documentation
- Loyalty documentation
- Automation documentation
- AI Business Copilot documentation
- AI Agent documentation
- Security documentation
- Privacy documentation
- API documentation
- Database schema documentation
- MEMORY.md