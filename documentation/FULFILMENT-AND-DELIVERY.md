Next is FULFILMENT-AND-DELIVERY.md.

This defines what happens after an order is placed. For FrontDesk v0.1, we should keep it lightweight: preparation, pickup, delivery status, customer instructions, and basic tracking—not a full logistics platform.

Create:

FrontDesk/
└── documentation/
    └── 02-product/
        └── FEATURE-SPECIFICATIONS/
            └── FULFILMENT-AND-DELIVERY.md
# FrontDesk — Fulfilment & Delivery Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Fulfilment & Delivery
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Fulfilment & Delivery module manages what happens after a customer places an order.

It connects:

    Order
      ↓
    Preparation
      ↓
    Ready
      ↓
    Pickup / Delivery
      ↓
    Completed

The objective is to give small businesses a simple way to track the operational state of customer orders.

---

# 2. Core Principle

FrontDesk separates:

    ORDER

from:

    FULFILMENT

and:

    PAYMENT

Example:

    Order:
    CONFIRMED

    Payment:
    PAID

    Fulfilment:
    PREPARING

These are separate states.

---

# 3. v0.1 Scope

v0.1 should support:

- fulfilment status,
- pickup orders,
- delivery orders,
- preparation status,
- ready status,
- basic delivery information,
- customer delivery instructions,
- pickup instructions,
- estimated fulfilment time,
- basic fulfilment timeline,
- staff assignment where useful,
- customer notifications,
- manual delivery completion,
- basic delivery tracking.

---

# 4. v0.1 Non-Goals

v0.1 should NOT attempt to become:

- a delivery marketplace,
- a logistics company,
- a fleet-management platform,
- a GPS tracking platform,
- a route optimization system,
- a driver payroll system,
- a warehouse management system.

External delivery providers can be integrated later.

---

# 5. Fulfilment Types

v0.1:

    PICKUP
    DELIVERY

Future:

    DINE_IN
    TABLE_SERVICE
    CURBSIDE_PICKUP
    SHIPPING
    DIGITAL_DELIVERY
    APPOINTMENT

---

# 6. Pickup

Customer collects the order from the business.

Example:

    Order:
    ORD-00123

    Fulfilment:
    PICKUP

---

# 7. Delivery

Business or external provider delivers the order.

Example:

    Fulfilment:
    DELIVERY

---

# 8. Fulfilment Status

v0.1:

    PENDING
    CONFIRMED
    PREPARING
    READY
    OUT_FOR_DELIVERY
    COMPLETED
    CANCELLED

---

# 9. Pending

The order exists but fulfilment has not started.

---

# 10. Confirmed

Business has accepted the order.

---

# 11. Preparing

The business is currently preparing the order.

Example:

    Burger:
    Cooking

    Cake:
    Being packed

---

# 12. Ready

The order is ready for:

    Pickup

or:

    Delivery

---

# 13. Out for Delivery

The order has left the business and is being delivered.

---

# 14. Completed

The customer has received the order or successfully collected it.

---

# 15. Cancelled

Fulfilment has been cancelled.

The cancellation must remain connected to the original order.

---

# 16. Order vs Fulfilment

Example:

    Order:
    ORD-00123

    Order Status:
    CONFIRMED

    Payment:
    PAID

    Fulfilment:
    PREPARING

The system must not assume:

    PAID = COMPLETED

---

# 17. Fulfilment Object

Conceptually:

    Fulfilment
    ├── ID
    ├── Order ID
    ├── Business ID
    ├── Type
    ├── Status
    ├── Estimated Ready At
    ├── Actual Ready At
    ├── Delivery Address
    ├── Delivery Instructions
    ├── Pickup Instructions
    ├── Assigned Staff
    ├── Provider
    ├── Tracking Reference
    ├── Created At
    └── Updated At

Exact schema belongs to database documentation.

---

# 18. One Order → One Fulfilment

For basic v0.1:

    One Order
       ↓
    One Fulfilment

Future architecture may support:

    Split Fulfilments

for larger businesses.

---

# 19. Delivery Address

For delivery orders, the system may require:

    Name
    Address
    Phone
    Landmark
    Postal Code

Only necessary information should be collected.

---

# 20. Delivery Address Snapshot

When an order is finalized, relevant delivery information should be preserved with the order/fulfilment.

If the customer's profile later changes address:

    Historical order

should retain the original delivery information.

---

# 21. Customer Address

Customer profile may contain:

    Home
    Work
    Other

But an order should preserve the actual address used for that order.

---

# 22. Delivery Instructions

Customer may provide:

    "Call when you arrive."

    "Leave at security."

    "Do not ring the bell."

These should be stored as fulfilment instructions.

---

# 23. Sensitive Information

Delivery instructions should not be exposed publicly.

They are available only to authorized staff/fulfilment actors.

---

# 24. Pickup Instructions

Example:

    "Collect from counter 2."

or:

    "Show order number at pickup."

---

# 25. Pickup Code

Future:

    Pickup Code:
    4832

Customer presents the code.

Business verifies:

    Code
    Order
    Status

---

# 26. QR Pickup

Future:

    Customer scans pickup QR.

System identifies:

    Order

and verifies pickup eligibility.

---

# 27. Estimated Ready Time

Example:

    Estimated ready:
    7:30 PM

This is an estimate, not a guarantee.

---

# 28. Estimated Delivery Time

Future:

    Estimated delivery:
    8:00–8:20 PM

This may depend on:

    Preparation
    Delivery provider
    Distance
    Business rules

---

# 29. ETA Accuracy

FrontDesk should avoid presenting uncertain estimates as guarantees.

Use:

    Estimated

rather than:

    Guaranteed

unless the business explicitly supports guarantees.

---

# 30. Preparation Time

Businesses may configure:

    Default preparation time

Example:

    Café:
    20 minutes

---

# 31. Product Preparation Time

Future:

    Burger:
    15 min

    Custom Cake:
    2 days

The system can eventually calculate estimated fulfilment time.

---

# 32. Business Preparation Time

Future:

    Order received:
    6:00 PM

    Estimated preparation:
    25 minutes

    Ready:
    6:25 PM

---

# 33. Order Scheduling

Future:

Customer chooses:

    Pickup:
    7:00 PM

or:

    Delivery:
    8:00 PM

Not required for the basic fulfilment flow.

---

# 34. Scheduled Fulfilment

Future:

    Order:
    ORD-00123

    Scheduled:
    7:00 PM

Status before preparation:

    SCHEDULED

---

# 35. Staff Assignment

Future:

    Assigned Staff:
    Ahmed

Useful for:

- restaurants,
- salons,
- repair services,
- small delivery teams.

---

# 36. Staff Role

Staff should only see information necessary for their role.

Example:

    Kitchen Staff

may need:

    Order Items

but not necessarily:

    Customer payment details.

---

# 37. Delivery Staff

Delivery staff may need:

    Customer Name
    Phone
    Delivery Address
    Order Reference
    Delivery Instructions

They should not automatically receive unrelated business information.

---

# 38. Assignment

Future:

    Order ready

↓

    Assign Driver

↓

    Driver:
    Ahmed

---

# 39. External Delivery Provider

Future architecture:

    FrontDesk
        ↓
    Delivery Adapter
        ↓
    Provider

This prevents FrontDesk from being tightly coupled to one delivery company.

---

# 40. Provider Abstraction

Future provider operations:

    createDelivery()
    cancelDelivery()
    getDeliveryStatus()
    getTrackingUrl()

---

# 41. External Provider

Possible future categories:

    Local Delivery Partner
    Courier Service
    Logistics Provider

Specific integrations should be added only after validating demand.

---

# 42. Delivery Tracking

Future:

    Tracking ID

    Status:
    OUT_FOR_DELIVERY

    Tracking URL

The tracking URL may belong to the external provider.

---

# 43. Live GPS

Not v0.1.

Future optional capability:

    Driver GPS
       ↓
    Customer Map

This requires additional privacy, battery, infrastructure, and consent considerations.

---

# 44. Delivery Completion

Delivery may be completed manually:

    Mark Delivered

or through an external provider event in the future.

---

# 45. Proof of Delivery

Future:

    OTP
    Signature
    Photo
    Customer confirmation

Not required for v0.1.

---

# 46. Delivery OTP

Future:

    Customer receives:
    483921

Driver:

    Enter OTP

System:

    Verify

↓

    COMPLETED

---

# 47. Delivery Failure

Future status:

    DELIVERY_FAILED

Examples:

    Customer unavailable
    Wrong address
    Delivery rejected

The failure reason should be recorded.

---

# 48. Delivery Retry

Future:

    DELIVERY_FAILED

↓

    Retry Delivery

or:

    Return to Business

---

# 49. Return to Business

Future:

    Delivery failed

↓

    Order returned

↓

    Business decides:

    Refund
    Reschedule
    Pickup

---

# 50. Delivery Cancellation

A delivery can be cancelled independently of an order depending on the workflow.

Example:

    Delivery:
    CANCELLED

Order may become:

    PICKUP

or:

    CANCELLED

according to business rules.

---

# 51. Fulfilment Cancellation

Cancellation must not silently delete:

    Order
    Payment
    Inventory
    Customer history

Each subsystem handles its own state.

---

# 52. Inventory Integration

When an order enters the appropriate confirmed/fulfilment state:

    Inventory
       ↓
    Stock deduction

The exact deduction event belongs to the Order/Inventory workflow.

---

# 53. Payment Integration

Payment remains separate.

Example:

    Order:
    CONFIRMED

    Payment:
    PAID

    Fulfilment:
    PREPARING

---

# 54. Cash on Delivery

Future:

    Payment Method:
    CASH_ON_DELIVERY

Payment remains:

    UNPAID

until the appropriate payment event occurs.

---

# 55. Delivery Fee

Future:

    Delivery Fee:
    ₹50

This should be represented as part of the order pricing model.

---

# 56. Free Delivery

Business may configure:

    Delivery Fee:
    ₹0

This should not require special fulfilment logic.

---

# 57. Distance-Based Delivery

Future:

    Distance:
    5 km

    Delivery Fee:
    ₹70

This belongs to future delivery pricing.

---

# 58. Delivery Zones

Future:

    Zone A:
    0–3 km
    ₹30

    Zone B:
    3–7 km
    ₹60

---

# 59. Delivery Availability

Future:

    Business serves:
    0–8 km

If customer address is outside the supported area:

    Delivery unavailable

---

# 60. Delivery Area Validation

Future system may use:

    Postal Code
    Coordinates
    Map service

to determine whether delivery is available.

---

# 61. Map Integration

Future:

    Customer Address
       ↓
    Map Provider
       ↓
    Coordinates
       ↓
    Delivery Estimate

Map provider integration should be abstracted.

---

# 62. Geolocation

FrontDesk should not require customer location permission simply to place an order.

Customers may manually enter their address.

---

# 63. Customer Address Accuracy

The customer should be allowed to review the delivery address before confirming the order.

---

# 64. Address Confirmation

Future:

    Confirm delivery address

    [Edit]

    [Confirm]

This reduces delivery failures.

---

# 65. Customer Notifications

Fulfilment events can trigger:

    ORDER_CONFIRMED
    PREPARING
    READY
    OUT_FOR_DELIVERY
    COMPLETED

Notifications may use:

    WhatsApp
    SMS
    Email
    Push

depending on configured channels.

---

# 66. Notification Example

Order confirmed:

> Your order #123 has been confirmed.

---

# 67. Preparing Notification

> Your order is being prepared.

---

# 68. Ready Notification

Pickup:

> Your order is ready for pickup.

Delivery:

> Your order is ready and will be dispatched soon.

---

# 69. Out for Delivery Notification

> Your order is on the way.

---

# 70. Completion Notification

> Your order has been marked as delivered.

---

# 71. Notification Responsibility

Fulfilment determines:

    WHAT happened.

Notifications determine:

    HOW the customer is informed.

---

# 72. WhatsApp Integration

Future:

    Fulfilment Event
          ↓
    Notification Service
          ↓
    WhatsApp Provider
          ↓
    Customer

---

# 73. Notification Consent

Marketing communication and transactional communication must remain conceptually separate.

---

# 74. Customer Tracking Page

Future:

    Order #123

    ✓ Confirmed
    ✓ Preparing
    ✓ Ready
    ● Out for Delivery
    ○ Completed

---

# 75. Public Tracking Link

Future:

    Secure Order Tracking URL

Customer can view:

    Status
    ETA
    Basic order information

---

# 76. Tracking Security

Public tracking links must:

- use secure tokens,
- avoid predictable IDs,
- expose minimal information,
- support expiration where appropriate,
- be revocable if necessary.

---

# 77. Customer Tracking Information

Public page may show:

    Order Number
    Status
    Estimated Time
    Business Name
    Basic Items

It should not expose:

    Internal notes
    Staff information
    Payment credentials
    Private business data

---

# 78. Fulfilment Timeline

Example:

    6:00 PM
    Order confirmed

    6:05 PM
    Preparing

    6:22 PM
    Ready

    6:30 PM
    Out for delivery

    6:52 PM
    Completed

---

# 79. Fulfilment Audit

Important state transitions should record:

    Who
    What
    When

Example:

    Staff Ahmed
    changed:
    PREPARING → READY

---

# 80. AI Fulfilment Actions

Future AI can:

    View fulfilment status
    Suggest delays
    Notify customer
    Suggest follow-ups

---

# 81. AI Safety

AI should not automatically:

- mark an order delivered without evidence,
- fabricate delivery status,
- change delivery address,
- cancel high-value orders,
- issue refunds.

---

# 82. AI Delivery Delay Detection

Future:

> Order #123 has been preparing for 55 minutes.

AI:

> This order appears delayed.

Possible action:

    [Notify Owner]

---

# 83. AI Customer Communication

Future:

> "Order #123 is delayed by approximately 20 minutes."

The system should only communicate verified/approved information.

---

# 84. Business Copilot

Future:

> Good morning 👋

> 3 orders are waiting for fulfilment.

> 2 orders have been ready for more than 20 minutes.

> 1 delivery appears delayed.

Actions:

    [Review]

---

# 85. Fulfilment Health

Future metrics:

    Average preparation time
    Average delivery time
    Fulfilment completion rate
    Delayed orders
    Cancelled orders

---

# 86. Operational Analytics

Future:

    Orders:
    100

    Average preparation:
    22 min

    Average delivery:
    31 min

    Delayed:
    8%

---

# 87. Business Intelligence

Future AI may identify:

> Saturday preparation time is 35% slower than weekdays.

Possible suggestion:

> Add one additional preparation staff member during peak hours.

This is a recommendation, not an automatic staffing decision.

---

# 88. Peak Hours

Future:

    12 PM–2 PM
    High order volume

    7 PM–9 PM
    High order volume

This can improve operational planning.

---

# 89. Preparation SLA

Future businesses may configure:

    Target preparation time:
    20 minutes

AI can detect:

    Actual:
    35 minutes

---

# 90. SLA Alerts

Future:

> ⚠️ 4 orders exceeded the 20-minute preparation target.

---

# 91. Delivery SLA

Future:

    Target delivery:
    30 minutes

System:

    Actual:
    45 minutes

---

# 92. Customer Experience

Future fulfilment analytics may connect with:

    Reviews
    Ratings
    Repeat purchases

Example:

> Customers receiving orders within 30 minutes are more likely to return.

Such conclusions require sufficient data.

---

# 93. Review Integration

After completion:

    Fulfilment:
    COMPLETED

↓

    Review request

This should be controlled by the Reviews module.

---

# 94. Loyalty Integration

Completed orders may trigger:

    Loyalty points

according to loyalty rules.

---

# 95. Customer CRM Integration

Fulfilment history contributes to:

    Customer Timeline

Example:

    Customer:
    Arun

    Orders:
    12

    Completed:
    11

    Cancelled:
    1

---

# 96. Business Memory

Business memory may contain:

    "We don't deliver after 10 PM."

This should eventually become structured configuration:

    delivery_end_time = 22:00

---

# 97. Business Rules

Future:

    delivery_radius
    delivery_hours
    minimum_order
    preparation_time
    pickup_instructions

Critical operational rules should be structured.

---

# 98. Automation Integration

Future:

    WHEN
    Order becomes READY

    THEN
    Notify customer

    AND
    Notify assigned staff

---

# 99. Automation Example

    WHEN
    Order is OUT_FOR_DELIVERY

    THEN
    Send WhatsApp update

    AND
    Start delivery timer

---

# 100. Automation Safety

Automations should not perform irreversible fulfilment actions without appropriate authorization.

---

# 101. Scheduled Orders

Future:

    Customer:
    "Deliver tomorrow at 7 PM."

System:

    Scheduled Fulfilment

The order may remain:

    SCHEDULED

until preparation begins.

---

# 102. Pickup Scheduling

Future:

    Pickup:
    6:30 PM

Business can prepare the order in advance.

---

# 103. Delivery Window

Future:

    7:00–7:30 PM

This may be more realistic than a precise guaranteed time.

---

# 104. Delivery Notes

Example:

    "Call before arriving."

These should be visible to authorized delivery actors.

---

# 105. Customer Contact

Delivery staff may need customer contact.

Access should be limited to the necessary information.

---

# 106. Masked Phone Number

Future:

    Delivery staff sees:
    Masked/controlled contact

instead of exposing the customer's full number unnecessarily.

---

# 107. Privacy

Delivery information can contain sensitive personal data.

FrontDesk must follow the Privacy and Data Protection architecture.

---

# 108. Staff Access

Staff should only access fulfilments belonging to businesses/workspaces they are authorized to access.

---

# 109. Multi-Staff

Future:

    Kitchen
    Packing
    Delivery

Each role can have different access.

---

# 110. Fulfilment Dashboard

Future:

```text
Orders to Prepare      8

Preparing              5

Ready                  3

Out for Delivery       4

Completed Today       42
111. Kanban View

Future:

PENDING
   ↓
CONFIRMED
   ↓
PREPARING
   ↓
READY
   ↓
OUT FOR DELIVERY
   ↓
COMPLETED

Useful for restaurant/café operations.

112. Order Card

Example:

#1234

Arun Kumar

2 × Chicken Burger
1 × Fries

₹520

PAID

Pickup

[Start Preparing]
113. Kitchen-Friendly View

Future businesses may use:

Kitchen Display Mode

Showing:

Order Number
Items
Notes
Time Waiting

This is future scope.

114. Kitchen Display

Future:

NEW
────────────
#1234
2 Burger
1 Fries

PREPARING
────────────
#1230
1 Pizza
2 Coke

READY
────────────
#1228
Cake
115. Packing Status

Future:

PREPARING
   ↓
PACKING
   ↓
READY

Not required for basic v0.1.

116. Delivery Assignment

Future:

Ready Orders

#1234
#1237
#1240

Assign:

Ahmed
117. Delivery Batch

Future businesses may batch multiple nearby deliveries.

Not v0.1.

118. Route Optimization

Future:

Delivery A
Delivery B
Delivery C

AI recommends:

Optimal route

This requires mapping infrastructure.

119. External Delivery Provider

Future workflow:

Order
  ↓
Ready
  ↓
Create Delivery
  ↓
Provider
  ↓
Driver Assigned
  ↓
Out for Delivery
  ↓
Delivered
120. Provider Failure

If provider creation fails:

Fulfilment remains in a recoverable state.

The system must not falsely report:

OUT_FOR_DELIVERY
121. Provider Webhooks

Future:

Delivery Provider
      ↓
Webhook
      ↓
FrontDesk
      ↓
Verify
      ↓
Update Fulfilment

Webhook processing must be idempotent.

122. Idempotency

If:

DELIVERY_COMPLETED

webhook arrives twice:

the system must not:

create duplicate completion events,
send duplicate notifications unnecessarily,
double-award loyalty points.
123. Fulfilment Event Model

Future events:

FULFILMENT_CREATED
FULFILMENT_CONFIRMED
FULFILMENT_STARTED
FULFILMENT_READY
FULFILMENT_DISPATCHED
FULFILMENT_COMPLETED
FULFILMENT_CANCELLED
FULFILMENT_FAILED
124. Event Consumers

Events may be consumed by:

Notifications
CRM
Loyalty
Analytics
Copilot
Automation
125. Event Principle

Fulfilment should emit business events.

Other systems should react to them rather than tightly coupling every module together.

126. Cancellation Integration

If an order is cancelled:

Fulfilment may become:
CANCELLED

Inventory/payment actions remain separate.

127. Refund Integration

A cancelled delivery does not automatically mean:

REFUND

Refund decisions belong to payment/business rules.

128. Inventory Return

If physical goods are returned:

Inventory may be increased.

This must depend on actual return condition.

129. Return Workflow

Future:

Delivered
   ↓
Customer requests return
   ↓
Return approved
   ↓
Item received
   ↓
Inspection
   ↓
Restock / Reject

Not v0.1.

130. Shipping

Future businesses may need:

Courier Shipping

This differs from local delivery.

Shipping may require:

Tracking Number
Courier
Shipping Label
Shipment Status

Not v0.1.

131. Shipping Abstraction

Future:

Fulfilment
   ├── Local Delivery
   ├── Pickup
   └── Shipping

This should be possible without redesigning the Order model.

132. Delivery Pricing

Future pricing may depend on:

Distance
Zone
Order Value
Weight
Provider

Pricing logic should remain separate from fulfilment status.

133. Minimum Order

Future:

Delivery minimum:
₹300

If:

Order = ₹250

then:

Delivery unavailable

unless the business overrides it.

134. Free Delivery Threshold

Future:

Orders above ₹1,000

receive:

Free Delivery
135. Delivery Schedule

Future business configuration:

Delivery Hours

Monday:
10 AM – 10 PM

Tuesday:
10 AM – 10 PM
136. Closed Hours

If delivery is unavailable:

Customer should not be allowed to select unavailable delivery times.
137. Holiday Configuration

Future:

Holiday:
Aug 30

Delivery:

Disabled
138. Festival Mode

Future event/festival systems may change:

Delivery hours
Offers
Preparation times

without changing core fulfilment architecture.

139. Business Copilot Example
Good morning 👋

Fulfilment summary:

• 8 orders are waiting.
• 3 orders have been ready for over 15 minutes.
• Average preparation time increased 18% yesterday.
• 2 deliveries were delayed.

[Review Orders]
140. AI Delay Recommendation

AI:

Order #123 has been preparing for 48 minutes.

The normal preparation time is 25 minutes.

Would you like to notify the customer?

[Notify Customer]
[Ignore]
141. AI Address Change Safety

Customer:

"Change my delivery address."

AI should not silently change a live delivery address if the order is already dispatched.

Instead:

"Your order is already out for delivery. I'll ask the business whether the address can be changed."

142. AI Cancellation Safety

Customer:

"Cancel my order."

If cancellation is possible:

Request cancellation

If already dispatched:

Explain that the business must review.

AI should not override fulfilment rules.

143. Customer Tracking

Future customer page:

Order #1234

✓ Order Confirmed
✓ Preparing
✓ Ready
● Out for Delivery
○ Delivered

Estimated arrival:
8:15–8:30 PM
144. Customer Self-Service

Future customer actions:

Track Order
Contact Business
Request Cancellation
Request Support

Actions depend on order status.

145. Support Handoff

If AI cannot resolve an issue:

Customer
   ↓
AI
   ↓
Human Staff

The conversation should be visible in the business inbox.

146. Customer Communication

Customer should receive meaningful status changes without being spammed.

The notification system should avoid unnecessary duplicate messages.

147. Notification Deduplication

If the same event is processed twice:

Customer should not receive two identical notifications unnecessarily.
148. Delivery Notification Failure

If WhatsApp notification fails:

Fulfilment should still remain correct.

Notification failure must not roll back the order state.

149. Operational Independence

Core fulfilment state must not depend on:

WhatsApp
Email
SMS

Notifications are secondary systems.

150. Offline Business Operations

Future PWA support may allow limited offline staff operation.

Example:

Kitchen loses internet temporarily.

The system could locally display recently synchronized orders.

However, actions that modify authoritative order/fulfilment state require synchronization and conflict handling.

151. Offline Safety

Do not allow offline clients to confidently perform irreversible operations without synchronization.

152. Conflict Handling

If two devices change:

PREPARING → READY

and:

PREPARING → CANCELLED

the backend must resolve according to authoritative state-transition rules.

153. State Transition Validation

Only valid transitions should be accepted.

Example:

PENDING → CONFIRMED
CONFIRMED → PREPARING
PREPARING → READY
READY → OUT_FOR_DELIVERY
OUT_FOR_DELIVERY → COMPLETED

Invalid transitions should be rejected.

154. Example Invalid Transition
COMPLETED → PREPARING

should normally be rejected.

A controlled correction workflow may exist in future.

155. Fulfilment Audit Timeline

Example:

6:00 PM
Order confirmed
Actor: Owner

6:04 PM
Preparing
Actor: Staff

6:25 PM
Ready
Actor: Staff

6:30 PM
Out for delivery
Actor: Driver

6:52 PM
Completed
Actor: Driver
156. v0.1 P0 Requirements
FULFILMENT-P0-001
Orders can have a fulfilment record.

FULFILMENT-P0-002
Fulfilment belongs to the correct business/workspace.

FULFILMENT-P0-003
Pickup and delivery fulfilment types are supported.

FULFILMENT-P0-004
Fulfilment status is tracked.

FULFILMENT-P0-005
Authorized users can update fulfilment status.

FULFILMENT-P0-006
Invalid status transitions are rejected.

FULFILMENT-P0-007
Delivery fulfilments can store delivery information.

FULFILMENT-P0-008
Pickup fulfilments can store pickup instructions.

FULFILMENT-P0-009
Customer delivery instructions can be stored.

FULFILMENT-P0-010
Estimated ready time can be represented.

FULFILMENT-P0-011
Fulfilment status changes are auditable.

FULFILMENT-P0-012
Order, payment, inventory, and fulfilment states remain separate.

FULFILMENT-P0-013
Completion can be recorded.

FULFILMENT-P0-014
Cancellation can be recorded.

FULFILMENT-P0-015
Workspace isolation is enforced.
157. v0.1 P1 Requirements
FULFILMENT-P1-001
Customer fulfilment tracking page.

FULFILMENT-P1-002
Customer status notifications.

FULFILMENT-P1-003
WhatsApp fulfilment notifications.

FULFILMENT-P1-004
Fulfilment timeline.

FULFILMENT-P1-005
Staff assignment.

FULFILMENT-P1-006
Pickup code.

FULFILMENT-P1-007
Delivery notes.

FULFILMENT-P1-008
Fulfilment dashboard.

FULFILMENT-P1-009
Delayed fulfilment detection.

FULFILMENT-P1-010
Basic fulfilment analytics.

FULFILMENT-P1-011
Business Copilot fulfilment alerts.
158. v0.1 P2 Requirements
FULFILMENT-P2-001
External delivery provider integrations.

FULFILMENT-P2-002
Delivery tracking.

FULFILMENT-P2-003
Driver assignment.

FULFILMENT-P2-004
Delivery OTP.

FULFILMENT-P2-005
Proof of delivery.

FULFILMENT-P2-006
Delivery zones.

FULFILMENT-P2-007
Distance-based pricing.

FULFILMENT-P2-008
Route optimization.

FULFILMENT-P2-009
Live GPS tracking.

FULFILMENT-P2-010
Courier shipping.

FULFILMENT-P2-011
Returns.

FULFILMENT-P2-012
Delivery batching.

FULFILMENT-P2-013
Advanced SLA monitoring.

FULFILMENT-P2-014
AI delivery optimization.
159. Acceptance Criteria

The Fulfilment & Delivery module is complete for v0.1 when:

Orders can have fulfilment information.
Pickup and delivery are supported.
Fulfilment status is tracked.
Only valid state transitions are accepted.
Authorized staff can update fulfilment status.
Delivery information can be stored securely.
Pickup instructions can be stored.
Customer instructions can be stored.
Estimated ready time can be represented.
Fulfilment changes are auditable.
Fulfilment remains separate from payment state.
Fulfilment remains separate from inventory state.
Fulfilment remains separate from order state.
Customer-facing status can eventually be exposed safely.
The system can support future external delivery integrations.
Notification failure cannot corrupt fulfilment state.
Fulfilment data is isolated between businesses.
160. Example — Café
Customer:
Arun

Order:
2 × Chicken Burger
1 × Fries

Total:
₹520

Payment:
PAID

Fulfilment:
PICKUP

Status:
CONFIRMED

Kitchen:

PREPARING

Then:

READY

Customer receives:

Your order is ready for pickup.

Customer collects it.

COMPLETED
161. Example — Bakery Delivery
Order:
Birthday Cake

Total:
₹1,200

Payment:
PAID

Fulfilment:
DELIVERY

Status:

CONFIRMED
↓
PREPARING
↓
READY
↓
OUT_FOR_DELIVERY
↓
COMPLETED
162. Example — External Delivery Future
FrontDesk

Order #123
     ↓
READY
     ↓
Create Delivery
     ↓
Delivery Provider
     ↓
Driver Assigned
     ↓
OUT_FOR_DELIVERY
     ↓
Provider Webhook
     ↓
COMPLETED
163. Example — Delivery Delay

Normal preparation:

25 minutes

Current:

48 minutes

Copilot:

⚠️ Order #123 appears delayed.

Normal preparation time: 25 min

Current time: 48 min

Would you like to notify the customer?

[Notify]
[Ignore]
164. Example — Customer Tracking
Order #123

✓ Confirmed
✓ Preparing
✓ Ready
● Out for Delivery
○ Completed

Estimated arrival:
8:15–8:30 PM
165. Example — Pickup
Order:
#1234

Pickup:
6:30 PM

Pickup Code:
4832

Status:
READY

Customer shows:

4832

Business verifies and completes fulfilment.

166. Example — Cancellation
Order:
#1234

Status:
PREPARING

Customer requests cancellation.

System:

Cancellation Requested

Business reviews.

If approved:

Order:
CANCELLED

Fulfilment:
CANCELLED

Payment/refund handling remains a separate workflow.

167. Final Architecture
                         CUSTOMER
                            │
                            ↓
                         ORDER
                            │
                ┌───────────┴───────────┐
                ↓                       ↓
             PAYMENT                FULFILMENT
                │                       │
                │              ┌────────┴────────┐
                │              ↓                 ↓
                │           PICKUP            DELIVERY
                │                                │
                │                                ↓
                │                         DELIVERY PROVIDER
                │
                ↓
             FINANCIAL
168. Event Architecture
Order
  │
  └── ORDER_CONFIRMED
            ↓
       Fulfilment
            │
            ├── PREPARING
            │
            ├── READY
            │
            ├── OUT_FOR_DELIVERY
            │
            └── COMPLETED
                    │
                    ├── Notifications
                    ├── Loyalty
                    ├── CRM
                    ├── Reviews
                    ├── Analytics
                    └── Business Copilot
169. Final Architectural Principle

Fulfilment tells the business what is happening to the customer's order physically or operationally.

It should not determine:

whether money was paid,
whether inventory exists,
whether a customer is loyal,
whether a review was submitted.

Those systems communicate through explicit events and relationships.

170. FrontDesk v0.1 Boundary

The first version should solve:

Order
 ↓
Prepare
 ↓
Ready
 ↓
Pickup / Delivery
 ↓
Completed

It should NOT attempt to solve:

Fleet Management
GPS Tracking
Route Optimization
Courier Marketplace
Warehouse Management
Advanced Logistics
171. Final Principle

FrontDesk should make it obvious to the business, the staff, and the customer what is happening with an order right now.

The core experience should be:

Ordered → Confirmed → Preparing → Ready → On the way / Pickup → Completed