# FrontDesk — Event System Specification

**Product:** FrontDesk  
**Version:** v0.1  
**Module:** Event System  
**Document:** Feature Specification / Architecture  
**Status:** Draft — For Review  
**Last Updated:** 2026-08-26

---

# 1. Purpose

The FrontDesk Event System provides the event-driven communication layer between business modules.

An event represents something that has already happened.

Examples:

- A customer was created.
- An enquiry was received.
- An order was created.
- A booking was completed.
- A product became unavailable.
- A review was received.

Events allow other parts of FrontDesk to react without tightly coupling every module together.

---

# 2. Core Principle

An event describes:

> **Something happened.**

An action describes:

> **Something should happen.**

Example:

```text
ACTION
CREATE_ORDER
       ↓
EVENT
ORDER_CREATED
       ↓
AUTOMATION
       ↓
ACTION
SEND_MESSAGE
3. Event Architecture
                    BUSINESS MODULE
                          │
                          ↓
                     DOMAIN ACTION
                          │
                          ↓
                     EVENT CREATED
                          │
                          ↓
                     EVENT SYSTEM
                          │
             ┌────────────┼────────────┐
             ↓            ↓            ↓
        Automation     Analytics     Notifications
             │
             ↓
        Action Registry
             │
             ↓
        Business Action
4. Why Events Are Needed

Without an event system:

Order Service
    ↓
send WhatsApp
    ↓
update CRM
    ↓
update analytics
    ↓
send review request

The Order Service becomes responsible for everything.

This creates tightly coupled architecture.

Instead:

Order Service
    ↓
ORDER_CREATED

Then independent consumers react.

5. Event-Driven Model
Producer
   ↓
Event
   ↓
Event Infrastructure
   ↓
Consumers
6. Event Producer

The producer is the component that creates the event.

Examples:

Order Service
Booking Service
Customer Service
Product Service
Payment Service
Review Service
Website Service
7. Event Consumer

A consumer receives an event and performs some processing.

Examples:

Automation Engine
Analytics Service
Notification Service
CRM Service
AI Copilot
8. Event Name Convention

Use:

RESOURCE_EVENT

Examples:

CUSTOMER_CREATED
LEAD_CREATED
ENQUIRY_RECEIVED
ORDER_CREATED
ORDER_COMPLETED
BOOKING_CREATED
BOOKING_COMPLETED
PRODUCT_CREATED
PRODUCT_UPDATED
PRODUCT_ARCHIVED
REVIEW_RECEIVED
PAYMENT_COMPLETED
9. Event Naming Rules

Event names should:

describe something that happened,
use past-tense meaning where appropriate,
be stable,
be unique,
be predictable.
10. Action vs Event

Incorrect:

CREATE_ORDER

as an event.

Correct:

ORDER_CREATED

Because:

CREATE_ORDER
=
command/action

ORDER_CREATED
=
fact/event
11. Event Categories

Initial categories:

BUSINESS
CUSTOMER
LEAD
ENQUIRY
PRODUCT
ORDER
BOOKING
PAYMENT
REVIEW
WEBSITE
MARKETING
LOYALTY
SYSTEM
12. v0.1 Event Catalog

Initial events:

Business
BUSINESS_CREATED
BUSINESS_UPDATED
BUSINESS_PUBLISHED
Customer
CUSTOMER_CREATED
CUSTOMER_UPDATED
CUSTOMER_BECAME_INACTIVE
Leads
LEAD_CREATED
LEAD_UPDATED
LEAD_ASSIGNED
LEAD_STATUS_CHANGED
Enquiries
ENQUIRY_RECEIVED
ENQUIRY_UPDATED
ENQUIRY_ASSIGNED
ENQUIRY_RESOLVED
Products
PRODUCT_CREATED
PRODUCT_UPDATED
PRODUCT_AVAILABILITY_CHANGED
PRODUCT_ARCHIVED
Orders
ORDER_CREATED
ORDER_CONFIRMED
ORDER_CANCELLED
ORDER_COMPLETED
ORDER_STATUS_CHANGED
Bookings
BOOKING_CREATED
BOOKING_CONFIRMED
BOOKING_CANCELLED
BOOKING_COMPLETED
BOOKING_STATUS_CHANGED
Payments
PAYMENT_CREATED
PAYMENT_COMPLETED
PAYMENT_FAILED
PAYMENT_REFUNDED
Reviews
REVIEW_RECEIVED
REVIEW_UPDATED
Website
WEBSITE_PUBLISHED
WEBSITE_VERSION_CREATED
Loyalty
LOYALTY_POINTS_EARNED
LOYALTY_REWARD_REDEEMED
13. Event Envelope

Every event should have a standard envelope.

Conceptually:

{
  "event_id": "EVT_123",
  "event_type": "ORDER_CREATED",
  "event_version": 1,
  "business_id": "BUS_123",
  "occurred_at": "2026-08-26T10:30:00+05:30",
  "source": {
    "type": "ORDER_SERVICE",
    "id": "order-service"
  },
  "actor": {
    "type": "CUSTOMER",
    "id": "CUS_123"
  },
  "correlation_id": "COR_123",
  "data": {}
}
14. Event ID

Every event must have a unique ID.

Example:

EVT_01JXYZ...

The event ID is used for:

deduplication,
tracing,
auditing,
debugging.
15. Event Type

Example:

ORDER_CREATED

This identifies the event meaning.

16. Event Version

Every event should have a version.

Example:

ORDER_CREATED
version: 1

Future:

ORDER_CREATED
version: 2
17. Why Event Versioning

Consumers may depend on a specific event structure.

Changing the structure without versioning can break consumers.

18. Business ID

Every business-scoped event must contain:

business_id

Example:

BUS_123

This is critical for tenant isolation.

19. Occurred At

The event records when the business event actually happened.

Example:

occurred_at:
2026-08-26T10:30:00+05:30
20. Published At

The system may also record when the event was published.

These are not necessarily the same.

occurred_at
≠
published_at
21. Source

Source identifies which service produced the event.

Example:

ORDER_SERVICE
22. Actor

Where applicable, identify who caused the event.

Possible actors:

CUSTOMER
OWNER
STAFF
AI_AGENT
AI_COPILOT
AUTOMATION
SYSTEM
INTEGRATION
23. Correlation ID

Related operations should share a correlation ID.

Example:

Customer order
    ↓
Order created
    ↓
Automation
    ↓
Message
    ↓
Review request

All can be traced through:

COR_123
24. Causation ID

Where useful, an event should reference the action/event that directly caused it.

Example:

ORDER_CREATED
caused_by:
ACTION_REQUEST_123
25. Event Data

The data field contains business-specific information.

Example:

{
  "order_id": "ORD_123",
  "customer_id": "CUS_123",
  "total": 850,
  "currency": "INR"
}
26. Event Data Principle

Only include data necessary for consumers.

Do not place entire database records into events unnecessarily.

27. Sensitive Data

Do not include sensitive information unless required.

Avoid putting:

passwords
API keys
authentication tokens
payment credentials

inside events.

28. Personal Data

Events containing customer information must follow FrontDesk privacy rules.

29. Event Immutability

Once published, an event should be treated as immutable.

Do not modify:

ORDER_CREATED

after publication.

If something changes, publish another event:

ORDER_STATUS_CHANGED
30. Event History

Events provide a historical record of business activity.

Example:

ORDER_CREATED
↓
ORDER_CONFIRMED
↓
ORDER_COMPLETED
31. Event Ordering

Some events have logical ordering.

Example:

ORDER_CREATED

should logically occur before:

ORDER_COMPLETED
32. Ordering Scope

Ordering should be guaranteed only where required.

Do not assume global ordering across the entire platform.

33. Entity Ordering

For example, order-related events may be ordered by:

order_id
34. Duplicate Events

Consumers must be prepared for duplicate delivery.

Example:

ORDER_CREATED
ORDER_CREATED

must not cause:

two duplicate review campaigns
35. Deduplication

Consumers should use:

event_id

or an appropriate business idempotency key.

36. Event Delivery

Delivery may be:

AT_LEAST_ONCE

in the initial architecture.

Consumers must therefore be idempotent.

37. Exactly Once

Do not claim exactly-once processing unless the underlying infrastructure genuinely guarantees it.

For v0.1:

Design consumers assuming duplicate delivery is possible.

38. Event Retry

If a consumer fails temporarily:

EVENT
↓
CONSUMER
↓
FAIL
↓
RETRY
39. Retryable Errors

Examples:

TIMEOUT
TEMPORARY_NETWORK_ERROR
SERVICE_UNAVAILABLE
RATE_LIMITED
40. Non-Retryable Errors

Examples:

INVALID_EVENT
UNAUTHORIZED
BUSINESS_RULE_VIOLATION
RESOURCE_NOT_FOUND
41. Retry Strategy

Use controlled retries.

Example:

Attempt 1
↓
Wait
↓
Attempt 2
↓
Wait
↓
Attempt 3

Use exponential backoff where appropriate.

42. Dead-Letter Handling

If an event repeatedly fails processing, it should eventually be placed into a dead-letter mechanism.

Conceptually:

Event
 ↓
Retry
 ↓
Retry
 ↓
Retry
 ↓
Dead Letter
43. Dead-Letter Event

The event should not simply disappear.

The system should record:

Event ID
Event Type
Consumer
Failure Reason
Attempts
Last Attempt
44. Dead-Letter Recovery

Authorized administrators should be able to:

Inspect
Retry
Discard

where appropriate.

45. Event Consumer Isolation

One consumer failure must not prevent unrelated consumers from receiving the event.

Example:

ORDER_COMPLETED
   ├── Analytics ✓
   ├── Loyalty ✓
   ├── Review Automation ✗

Analytics and Loyalty should still succeed.

46. Event Fan-Out

One event may have many consumers.

ORDER_COMPLETED
      │
 ┌────┼────┬────┐
 ↓    ↓    ↓    ↓
CRM  Loyalty Review Analytics
47. Event Subscription

Consumers subscribe to event types.

Example:

Review Automation
subscribes to:
ORDER_COMPLETED
48. Automation Subscription

The Automation Engine is a major event consumer.

Example:

ORDER_COMPLETED
↓
Automation Engine
↓
Find matching automations
49. Event Filtering

Automations may filter events.

Example:

WHEN ORDER_COMPLETED

IF
order.total > ₹1000
50. Event Routing

The Event System routes events to appropriate consumers.

51. Event Bus

Conceptually:

Producer
↓
Event Bus
↓
Consumers
52. v0.1 Event Infrastructure

The implementation should prioritize simplicity and zero/minimal cost.

The exact technology should be determined by the final system architecture.

Possible initial approaches:

Database-backed event/outbox pattern
+
Background worker

rather than introducing expensive infrastructure immediately.

53. Transactional Outbox

For important domain events, use an outbox pattern where practical.

Conceptually:

Database Transaction
 ├── Business Change
 └── Event Outbox Record

        ↓

Background Worker

        ↓

Event Processing
54. Why Outbox

Without an outbox:

Database update ✓
Event publishing ✗

can leave the system inconsistent.

The outbox provides a durable handoff.

55. Outbox Record

Conceptually:

outbox_event
├── id
├── event_type
├── business_id
├── payload
├── created_at
├── published_at
├── attempts
└── status
56. Outbox Status

Possible:

PENDING
PROCESSING
PUBLISHED
FAILED
57. Event Processing

A worker reads pending events and dispatches them.

Outbox
↓
Worker
↓
Event Consumer
58. Event Processing Transaction

Consumer processing should use appropriate idempotency.

59. Event Consumer Record

The system may track processed events.

Conceptually:

processed_events
├── event_id
├── consumer
├── processed_at
└── result
60. Duplicate Protection

Before processing:

Has this consumer already processed event_id?

If yes:

Skip duplicate
61. Event Schema

Every event type should have a documented schema.

Example:

ORDER_CREATED v1

Required:
order_id
business_id
customer_id
total
currency

Optional:
source
62. Event Schema Compatibility

Schema changes must not unexpectedly break consumers.

63. Additive Changes

Prefer backward-compatible additions where possible.

Example:

Add:
order.source

without removing existing fields.

64. Breaking Changes

Breaking schema changes require a new event version.

65. Example — ORDER_CREATED
{
  "event_id": "EVT_123",
  "event_type": "ORDER_CREATED",
  "event_version": 1,
  "business_id": "BUS_123",
  "occurred_at": "2026-08-26T10:30:00+05:30",
  "correlation_id": "COR_123",
  "data": {
    "order_id": "ORD_123",
    "customer_id": "CUS_123",
    "total": 850,
    "currency": "INR"
  }
}
66. Example — ENQUIRY_RECEIVED
{
  "event_type": "ENQUIRY_RECEIVED",
  "event_version": 1,
  "business_id": "BUS_123",
  "data": {
    "enquiry_id": "ENQ_123",
    "customer_id": "CUS_123",
    "channel": "WHATSAPP"
  }
}
67. Example — BOOKING_CREATED
{
  "event_type": "BOOKING_CREATED",
  "event_version": 1,
  "business_id": "BUS_123",
  "data": {
    "booking_id": "BKG_123",
    "customer_id": "CUS_123",
    "service_id": "SRV_123",
    "scheduled_at": "2026-08-27T15:00:00+05:30"
  }
}
68. Example — PRODUCT_AVAILABILITY_CHANGED
{
  "event_type": "PRODUCT_AVAILABILITY_CHANGED",
  "event_version": 1,
  "business_id": "BUS_123",
  "data": {
    "product_id": "PRD_123",
    "available": false
  }
}
69. Example — REVIEW_RECEIVED
{
  "event_type": "REVIEW_RECEIVED",
  "event_version": 1,
  "business_id": "BUS_123",
  "data": {
    "review_id": "REV_123",
    "customer_id": "CUS_123",
    "rating": 5
  }
}
70. Event Security

Every business event must be tenant-scoped.

71. Tenant Isolation

A consumer processing:

BUS_123

must not accidentally access:

BUS_456
72. Event Authorization

Consumers should only access the data required for their function.

73. AI Event Consumption

The AI Business Copilot may consume selected business events.

Example:

PRODUCT_AVAILABILITY_CHANGED

may contribute to:

"Your best-selling cake is currently unavailable."

74. AI Must Not Receive Everything

The AI Copilot should not automatically receive every internal event.

Use controlled event subscriptions.

75. AI Event Filtering

Events should be filtered to:

relevant business,
relevant event types,
appropriate data,
permitted information.
76. Copilot Event Example
ORDER_COMPLETED

may update:

Today's sales

while:

PAYMENT_INTERNAL_PROCESSING_EVENT

may remain internal.

77. Event Aggregation

Multiple events may contribute to one business insight.

Example:

PRODUCT_VIEWED
PRODUCT_VIEWED
PRODUCT_VIEWED
ORDER_NOT_CREATED

could eventually contribute to:

High product interest but low conversion.

78. Event Retention

Not every event needs to be retained forever.

Retention policies should depend on:

business value,
audit requirements,
privacy,
storage cost.
79. Event Retention Classes

Future classification:

AUDIT_REQUIRED
BUSINESS_HISTORY
TEMPORARY
ANALYTICS_ONLY
80. Personal Data Retention

Customer-related event data must follow privacy and retention policies.

81. Event Deletion

If a customer requests deletion where legally applicable, FrontDesk must handle relevant personal data according to the Privacy specification.

82. Event Redaction

Where historical event records must remain for audit but personal information must be removed, use appropriate redaction/anonymization strategies.

83. Event Replay

Future capability:

Replay event

This can be useful for:

rebuilding projections,
recovering failed processing,
debugging.
84. Replay Safety

Replay must not accidentally create duplicate real-world side effects.

For example:

ORDER_CREATED

should not cause:

another order

to be created.

85. Replay Mode

Future replay may support:

ANALYSIS_ONLY
REBUILD_STATE
REPROCESS_CONSUMER
86. Event Timestamp

Use server-generated timestamps for authoritative event timing.

87. Client Timestamp

Client-provided timestamps should not be trusted as the authoritative occurrence time without validation.

88. Clock Handling

Services should use consistent timezone-aware timestamps.

Prefer storing timestamps in a canonical format such as UTC internally while preserving business timezone configuration for display/scheduling.

89. Event Payload Size

Events should remain reasonably small.

Large files should not be embedded directly.

Instead use references.

Example:

document_id
image_id
file_id
90. File Events

Example:

DOCUMENT_IMPORTED

may contain:

document_id

rather than the entire PDF.

91. Import Events

FrontDesk's Business Importer will eventually generate events such as:

IMPORT_STARTED
IMPORT_COMPLETED
IMPORT_FAILED
92. Website Events

Website operations may generate:

WEBSITE_VERSION_CREATED
WEBSITE_PUBLISHED
WEBSITE_PUBLISH_FAILED
93. AI Events

Future events may include:

AI_RECOMMENDATION_CREATED
AI_ACTION_REQUESTED
AI_ACTION_APPROVED
AI_ACTION_REJECTED

These should be used carefully and should not expose private model reasoning.

94. Approval Events

Examples:

APPROVAL_REQUESTED
APPROVAL_GRANTED
APPROVAL_REJECTED
APPROVAL_EXPIRED
95. Automation Events

Examples:

AUTOMATION_STARTED
AUTOMATION_COMPLETED
AUTOMATION_FAILED
AUTOMATION_PAUSED
96. Action Events

The Action Registry may emit events around execution.

Examples:

ACTION_REQUESTED
ACTION_SUCCEEDED
ACTION_FAILED

These should be distinguished from domain events.

97. Domain Event vs System Event
Domain Event

Something meaningful happened in the business.

ORDER_COMPLETED
System Event

Something happened in the platform infrastructure.

AUTOMATION_FAILED
98. Event Naming Separation

Avoid confusing:

ORDER_COMPLETED

with:

ACTION_SUCCEEDED

The first is business meaning.

The second is execution/infrastructure meaning.

99. Event Chaining

Events may lead to actions that produce more events.

Example:

ORDER_COMPLETED
↓
Automation
↓
ADD_LOYALTY_POINTS
↓
LOYALTY_POINTS_EARNED
100. Event Chain Safety

Event chains must be observable and protected against unintended loops.

101. Correlation Example
COR_001

ORDER_COMPLETED
   ↓
Automation: Review Request
   ↓
SEND_MESSAGE
   ↓
MESSAGE_SENT
   ↓
CUSTOMER_RESPONDED

All can be traced through:

COR_001
102. Event Observability

Internal monitoring should track:

Events Published
Events Processed
Processing Latency
Failures
Retries
Dead-Letter Events
Duplicate Events
103. Event Latency

Measure:

occurred_at
↓
consumer_processed_at

This helps identify slow event processing.

104. Event Health Dashboard

Future internal dashboard:

EVENT SYSTEM

Published:
12,482

Processed:
12,451

Failed:
18

Retrying:
13

Dead Letter:
0
105. Consumer Health

Track each consumer.

Example:

Automation Engine
Healthy

Analytics
Healthy

Notification Service
Warning
106. Event Failure Alert

Repeated failures should generate internal alerts.

107. Event Backpressure

If event volume increases, consumers should process at a controlled rate.

108. v0.1 Scale Principle

Do not build a distributed event architecture prematurely.

Start with a reliable, simple implementation that can evolve.

109. Suggested v0.1 Pattern

Recommended conceptual implementation:

Domain Transaction
       ↓
Outbox Table
       ↓
Background Worker
       ↓
Event Dispatcher
       ↓
Automation / Other Consumers

This can later evolve toward dedicated messaging infrastructure if FrontDesk requires it.

110. Event Security Principle

Events are trusted platform messages, not arbitrary user input.

But event payloads originating from users must still be validated before becoming trusted domain events.

111. Event Validation

Before publishing:

Validate event type
Validate schema
Validate business ID
Validate entity ownership
Validate required fields
112. Event Producer Rule

Only authorized backend/domain services should publish authoritative domain events.

The frontend must not directly publish:

ORDER_COMPLETED
113. Frontend Events

Frontend interaction events such as:

BUTTON_CLICKED
PAGE_VIEWED

may be tracked separately as analytics events.

They should not be confused with authoritative business events.

114. Analytics Events

Future analytics events:

PAGE_VIEWED
PRODUCT_VIEWED
CTA_CLICKED
CATALOG_OPENED
QR_SCANNED

These can power analytics but should not automatically be treated as business state changes.

115. QR Scan Event

Example:

QR_SCANNED

may contain:

business_id
qr_id
timestamp
device/session metadata

subject to privacy rules.

116. Conversion Event

Future:

CATALOG_VIEWED
↓
PRODUCT_VIEWED
↓
ORDER_CREATED

can help calculate conversion.

117. Event Privacy

Analytics events should minimize unnecessary personal data.

118. Event Access

Not every internal event should be exposed through public APIs.

119. Public Events

Future developer APIs may expose selected business events.

Example:

ORDER_CREATED
BOOKING_CREATED

only where the business explicitly enables the integration.

120. Public Event Security

External subscriptions require:

authentication,
authorization,
tenant isolation,
rate limits,
delivery verification.
121. Webhook Delivery

Future public event delivery may use:

HTTPS Webhook
122. Webhook Signature

Future webhook events should include a verifiable signature.

123. Webhook Retry

Failed webhook deliveries should use controlled retries.

124. Webhook Secret

Secrets must be stored securely and never exposed to AI models.

125. Event Replay for Webhooks

Future APIs may support replaying failed webhook events.

126. Event Schema Registry

As the platform grows, maintain a central catalog of:

Event Name
Version
Schema
Producer
Consumers
Data Classification
Retention
127. Event Documentation Format

Each event should be documented as:

## EVENT_NAME

### Purpose

### Producer

### Consumers

### Version

### Payload

### Trigger Conditions

### Ordering

### Idempotency

### Retry Policy

### Data Classification
128. Example Event Documentation
ORDER_COMPLETED
Purpose

Indicates that an order has been completed.

Producer

Order Service.

Consumers

Potential consumers:

Automation Engine
Loyalty Service
Analytics
Version

v1

Payload
order_id
business_id
customer_id
total
currency
completed_at
129. Event Catalog — v0.1 Priority
P0
BUSINESS_CREATED
BUSINESS_UPDATED

CUSTOMER_CREATED
CUSTOMER_BECAME_INACTIVE

LEAD_CREATED
LEAD_UPDATED
LEAD_STATUS_CHANGED

ENQUIRY_RECEIVED
ENQUIRY_RESOLVED

PRODUCT_CREATED
PRODUCT_UPDATED
PRODUCT_AVAILABILITY_CHANGED

ORDER_CREATED
ORDER_CONFIRMED
ORDER_CANCELLED
ORDER_COMPLETED
ORDER_STATUS_CHANGED

BOOKING_CREATED
BOOKING_CONFIRMED
BOOKING_CANCELLED
BOOKING_COMPLETED
BOOKING_STATUS_CHANGED

REVIEW_RECEIVED

WEBSITE_PUBLISHED
130. P1 Events
PAYMENT_CREATED
PAYMENT_COMPLETED
PAYMENT_FAILED

LOYALTY_POINTS_EARNED

APPROVAL_REQUESTED
APPROVAL_GRANTED
APPROVAL_REJECTED

AUTOMATION_STARTED
AUTOMATION_COMPLETED
AUTOMATION_FAILED

IMPORT_STARTED
IMPORT_COMPLETED
IMPORT_FAILED
131. P2 Events
AI_RECOMMENDATION_CREATED
AI_ACTION_REQUESTED
AI_ACTION_APPROVED
AI_ACTION_REJECTED

QR_SCANNED
CATALOG_VIEWED
PRODUCT_VIEWED

WEBHOOK_DELIVERY_FAILED
132. v0.1 Success Criteria

The Event System succeeds when:

Events have consistent schemas.

Events are tenant-isolated.

Duplicate delivery is safely handled.

Consumers can retry failed processing.

Important events are durable.

Automation can reliably react to events.

Event chains are traceable.

Sensitive information is protected.

The architecture can scale later without rewriting business logic.
133. Event System Anti-Patterns

Avoid:

Frontend directly creates authoritative business events.

Avoid:

One service directly calls every downstream service.

Avoid:

Events containing entire database records.

Avoid:

Events containing secrets.

Avoid:

Assuming exactly-once delivery.

Avoid:

Ignoring duplicate events.

Avoid:

Unbounded automatic retries.

Avoid:

Global event ordering when it isn't necessary.
134. Relationship With Action Registry
ACTION
CREATE_ORDER
     ↓
ACTION REGISTRY
     ↓
Order Service
     ↓
EVENT
ORDER_CREATED

The Action Registry controls what FrontDesk does.

The Event System communicates what happened.

135. Relationship With Automations
EVENT
ORDER_COMPLETED
     ↓
AUTOMATION ENGINE
     ↓
Condition
     ↓
ACTION
SEND_MESSAGE
136. Relationship With AI Copilot
EVENT
PRODUCT_AVAILABILITY_CHANGED
     ↓
COPILOT
     ↓
Business insight
     ↓
Recommendation

Example:

"Your best-selling cake is unavailable. Consider marking it as unavailable on your website and updating today's promotion."

137. Relationship With Business Memory

Events can provide historical information that contributes to business memory.

Example:

Owner changed brand rule
↓
BUSINESS_MEMORY_UPDATED

However, not every event should automatically become permanent memory.

138. Memory Promotion

Future AI systems may identify repeated patterns and suggest:

"Would you like me to remember that premium products should never be discounted?"

The owner explicitly confirms.

139. Relationship With Analytics

Events can feed analytics.

Example:

PRODUCT_VIEWED
ORDER_CREATED
ORDER_COMPLETED

can contribute to:

Views
Orders
Conversion
Revenue
140. Relationship With AI Business Copilot

The Copilot can consume selected event streams to identify:

Anomalies
Opportunities
Tasks
Warnings
Trends
141. Proactive Insight Example

Events:

PRODUCT_VIEWED × 250
ORDER_CREATED × 8

Copilot:

"Your chocolate cake received high interest but converted poorly today."

Potential recommendation:

"Review pricing or product presentation?"

142. Event-to-Insight Principle

The Event System should provide facts.

The AI interprets those facts.

The AI should not invent business events.

143. Event-to-Action Principle
Event
↓
AI / Automation
↓
Proposed Action
↓
Action Registry
↓
Policy / Approval
↓
Action
144. Final Architecture
                         FRONTDESK
                             │
                 ┌───────────┴───────────┐
                 │                       │
             BUSINESS ACTION         EXTERNAL EVENT
                 │                       │
                 ↓                       ↓
          ACTION REGISTRY             EVENT INGESTION
                 │                       │
                 └───────────┬───────────┘
                             ↓
                        EVENT SYSTEM
                             │
             ┌───────────────┼────────────────┐
             ↓               ↓                ↓
        AUTOMATIONS       ANALYTICS        AI COPILOT
             │                                │
             ↓                                ↓
      ACTION REGISTRY                    RECOMMENDATION
             │                                │
             └───────────────┬────────────────┘
                             ↓
                       BUSINESS ACTION
                             │
                             ↓
                           EVENT
145. Final Principle

Events tell FrontDesk what happened. Automations decide what should happen next. Actions make it happen.