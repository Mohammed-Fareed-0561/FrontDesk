Next document: ACTION-REGISTRY.md

This is a core architecture document for FrontDesk. It defines the controlled operations that AI Agents, AI Copilot, Automations, the dashboard, and eventually external integrations are allowed to perform.

Create:

FrontDesk/
└── documentation/
    └── FEATURE-SPECIFICATIONS/
        └── ACTION-REGISTRY.md

Use this:

# FrontDesk — Action Registry Specification

**Product:** FrontDesk  
**Version:** v0.1  
**Module:** Action Registry  
**Document:** Core Architecture / Feature Specification  
**Status:** Draft — For Review  
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Action Registry is the controlled execution layer of FrontDesk.

It defines what FrontDesk is allowed to do on behalf of:

- Business owners
- Staff
- Automations
- AI Copilot
- AI Agents
- Future external AI agents
- Integrations

The core principle is:

> **AI can propose an action, but the Action Registry decides whether and how that action can execute.**

---

# 2. Why the Action Registry Exists

FrontDesk will eventually contain multiple systems capable of requesting actions.

For example:

```text
AI Agent
    ↓
"Create an order"

AI Copilot
    ↓
"Create a win-back campaign"

Automation
    ↓
"Send confirmation"

Dashboard
    ↓
"Update product"

External API
    ↓
"Create booking"

Without a centralized action system, every module would implement its own authorization and validation.

That would create inconsistent and unsafe behavior.

Instead:

                    ACTION REGISTRY
                          ↑
        ┌─────────────────┼─────────────────┐
        │                 │                 │
      Agent            Copilot          Automation
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ↑
                      Dashboard
3. Core Principle

All meaningful business-side effects should pass through controlled actions.

Request
   ↓
Authentication
   ↓
Authorization
   ↓
Action Registry
   ↓
Validation
   ↓
Risk Check
   ↓
Approval Check
   ↓
Execution
   ↓
Result Validation
   ↓
Audit Log
4. Action vs Event

These are different concepts.

Action

Something FrontDesk is asked to do.

Example:

CREATE_ORDER
Event

Something that happened.

Example:

ORDER_CREATED
5. Example
CREATE_ORDER
        ↓
Order successfully created
        ↓
ORDER_CREATED
        ↓
Automation
        ↓
SEND_ORDER_CONFIRMATION

An action causes a side effect.

An event reports a state change.

6. Action Sources

Actions may originate from:

OWNER
STAFF
DASHBOARD
AI_COPILOT
AI_AGENT
AUTOMATION
API
INTEGRATION
SYSTEM
7. Action Source Trust

The source does not automatically determine whether an action is allowed.

For example:

AI Agent

must still pass:

Permission
Policy
Validation
Risk
Approval
8. Action Definition

Every action must have a formal definition.

Conceptually:

Action
├── ID
├── Name
├── Description
├── Version
├── Category
├── Input Schema
├── Output Schema
├── Permissions
├── Risk Level
├── Approval Policy
├── Validation Rules
├── Side Effects
├── Idempotency
├── Rate Limits
├── Audit Requirements
└── Availability
9. Action Naming

Use predictable uppercase identifiers.

Examples:

CREATE_LEAD
UPDATE_PRODUCT
CREATE_ORDER
CREATE_BOOKING
SEND_MESSAGE
CREATE_COUPON
CREATE_QUOTATION
10. Action Categories

Initial categories:

BUSINESS
CATALOG
CUSTOMER
ORDER
BOOKING
COMMUNICATION
MARKETING
CRM
CONTENT
WEBSITE
ANALYTICS
LOYALTY
DOCUMENT
SYSTEM
INTEGRATION
11. v0.1 Core Actions

The first implementation should remain intentionally small.

Recommended initial actions:

CREATE_LEAD
UPDATE_LEAD

CREATE_PRODUCT
UPDATE_PRODUCT
UPDATE_PRODUCT_AVAILABILITY

CREATE_ENQUIRY
UPDATE_ENQUIRY
ASSIGN_ENQUIRY

CREATE_ORDER
UPDATE_ORDER_STATUS

CREATE_BOOKING
UPDATE_BOOKING_STATUS

SEND_MESSAGE

CREATE_COUPON

CREATE_QUOTATION

ADD_LOYALTY_POINTS

UPDATE_BUSINESS_PROFILE

PUBLISH_WEBSITE

CREATE_WEBSITE_VERSION

RESTORE_WEBSITE_VERSION
12. Action Permission Model

Every action requires a permission.

Example:

products.update

allows:

UPDATE_PRODUCT

but does not automatically allow:

DELETE_PRODUCT
13. Permission Format

Recommended format:

<resource>.<operation>

Examples:

products.read
products.create
products.update
products.delete

orders.read
orders.create
orders.update

customers.read
customers.create
customers.update

bookings.read
bookings.create
bookings.update

messages.send
14. Permission Principle

Permissions should be:

explicit,
scoped,
auditable,
revocable,
tenant-aware.
15. Tenant Isolation

Every action must be executed within a business/workspace context.

Example:

business_id = BUS_123

The action cannot access:

BUS_456
16. Action Authorization

Before execution:

Actor
+
Business
+
Permission
+
Action

must be validated.

17. Actor

An actor is the entity requesting the action.

Possible actors:

USER
STAFF
AGENT
COPILOT
AUTOMATION
SYSTEM
API_CLIENT
18. Actor Identity

Every action request should contain an identifiable actor.

Example:

actor_type:
AGENT

actor_id:
AGT_123
19. Action Request

Conceptual structure:

{
  "action": "CREATE_ORDER",
  "business_id": "BUS_123",
  "actor": {
    "type": "AGENT",
    "id": "AGT_123"
  },
  "input": {}
}

The actual API contract belongs in API.md.

20. Action Validation

Validation occurs before execution.

Checks include:

Input schema
Business ownership
Permission
Business rules
Data existence
Data state
Risk
Approval
Rate limit
Idempotency
21. Input Schema

Every action must define exactly what it accepts.

Example:

CREATE_LEAD

Required:
name
contact

Optional:
source
notes
email
phone
22. Reject Unknown Input

Actions should not silently accept arbitrary fields.

This prevents accidental or malicious behavior.

23. Output Schema

Every action should return a predictable result.

Example:

CREATE_LEAD

Output:
lead_id
status
created_at
24. Action Result

Possible statuses:

SUCCESS
FAILED
REJECTED
PENDING_APPROVAL
CANCELLED
25. Action Errors

Use structured errors.

Example:

PERMISSION_DENIED
VALIDATION_FAILED
RESOURCE_NOT_FOUND
BUSINESS_RULE_VIOLATION
APPROVAL_REQUIRED
RATE_LIMITED
DUPLICATE_REQUEST
INTEGRATION_ERROR
SYSTEM_ERROR
26. Error Principle

Never return:

Something went wrong.

when a useful structured explanation is available.

27. Example

Instead of:

ERROR

return:

CODE:
PRODUCT_UNAVAILABLE

MESSAGE:
The requested product is currently unavailable.
28. Risk Levels

Every action receives a risk classification.

LOW
MEDIUM
HIGH
CRITICAL
29. Low Risk

Examples:

UPDATE_PRODUCT_DESCRIPTION
UPDATE_IMAGE_ALT_TEXT
CREATE_INTERNAL_TASK
UPDATE_FAQ

These may be allowed automatically.

30. Medium Risk

Examples:

CREATE_ORDER
CREATE_BOOKING
CREATE_QUOTATION
SEND_ONE_TO_ONE_MESSAGE
UPDATE_PRODUCT_PRICE

Approval depends on business policy.

31. High Risk

Examples:

SEND_MASS_CAMPAIGN
CHANGE_PRICE
ISSUE_DISCOUNT
REFUND_PAYMENT
DELETE_PRODUCT

These generally require explicit approval.

32. Critical

Examples:

CHANGE_PAYMENT_ACCOUNT
CHANGE_SECURITY_CONFIGURATION
DELETE_BUSINESS_DATA

These should require strong authorization and explicit human confirmation.

33. Risk Is Not Permission

An action can be:

LOW RISK

but still be forbidden to an actor.

Example:

UPDATE_PRODUCT_DESCRIPTION

may be low risk but unavailable to a read-only staff member.

34. Approval Policy

Each action defines whether approval is required.

Possible modes:

NEVER
CONFIGURABLE
ALWAYS
35. Example
UPDATE_PRODUCT_DESCRIPTION
Approval:
NEVER

for trusted automation.

But:

UPDATE_PRODUCT_PRICE
Approval:
ALWAYS

for an AI agent.

36. Business Approval Policy

The business owner can configure additional restrictions.

Example:

AI may update descriptions automatically.

AI must ask before changing prices.

AI cannot delete products.
37. Permission + Approval

Both are required when applicable.

Permission:
YES

Approval:
REQUIRED

↓

Cannot execute yet.
38. Approval Object

Conceptually:

Approval
├── ID
├── Action Request ID
├── Business ID
├── Requested By
├── Requested At
├── Status
├── Approved By
├── Approved At
└── Reason
39. Approval Status
PENDING
APPROVED
REJECTED
EXPIRED
CANCELLED
40. Approval Expiry

Approval requests may expire.

Example:

Offer campaign approval
Valid for:
30 minutes

This prevents old requests from executing unexpectedly.

41. Approval Preview

Before approval, show:

What will happen?
Who is affected?
What data will change?
What message will be sent?
What is the estimated cost?
42. Example
AI wants to send:

WIN-BACK campaign

Audience:
83 customers

Message:
"We miss you..."

Action:
Send WhatsApp message

[Approve] [Reject]
43. Side Effects

Every action must declare its side effects.

Example:

CREATE_ORDER

Side Effects:
- Creates order
- Reduces available inventory where configured
- Emits ORDER_CREATED event
44. Side Effect Transparency

The system must know what an action can change.

This is important for:

approvals,
auditing,
rollback,
testing.
45. Idempotency

Actions that create side effects should support idempotency where appropriate.

Example:

An AI Agent retries:

CREATE_ORDER

The same request should not create two orders.

46. Idempotency Key

Example:

idempotency_key:
agent-task-123-order-creation
47. Idempotency Rule

If the same valid request is received again:

Return previous result

instead of performing the side effect twice.

48. Idempotency Scope

The idempotency key should be scoped appropriately to the business/action.

49. Action Versioning

Actions should be versioned.

Example:

CREATE_ORDER:v1
CREATE_ORDER:v2
50. Why Version Actions

Changing an action's input/output behavior can break:

automations,
agents,
integrations,
existing workflows.
51. Backward Compatibility

When possible:

v1

should remain supported until dependent clients migrate.

52. Action Deprecation

An action may eventually become:

ACTIVE
DEPRECATED
DISABLED
REMOVED
53. Action Availability

An action may be unavailable because:

Permission missing
Integration missing
Business feature disabled
Business plan restriction
System maintenance
54. Integration Requirements

Example:

SEND_WHATSAPP_MESSAGE

may require:

WhatsApp Integration

If not connected:

WhatsApp isn't connected.

Do not pretend the action succeeded.

55. Action Preconditions

Every action can define preconditions.

Example:

CREATE_BOOKING

Requires:
- Service exists
- Staff/resource exists
- Time slot available
56. Precondition Failure

Return:

BOOKING_SLOT_UNAVAILABLE

rather than creating an invalid booking.

57. State Validation

Actions should validate the current state.

Example:

UPDATE_ORDER_STATUS

should ensure the requested transition is valid.

58. Order State Machine

Example:

PENDING
   ↓
CONFIRMED
   ↓
PROCESSING
   ↓
COMPLETED

Some transitions may be invalid.

59. Invalid Transition

Example:

COMPLETED
→
PENDING

may be rejected depending on the order system.

60. Booking State Machine

Example:

REQUESTED
   ↓
CONFIRMED
   ↓
COMPLETED

or:

REQUESTED
   ↓
CANCELLED
61. Lead State Machine
NEW
 ↓
CONTACTED
 ↓
QUALIFIED
 ↓
QUOTATION_SENT
 ↓
NEGOTIATION
 ↓
WON / LOST
62. Action Registry and State Machines

Actions must respect the state machines defined by each domain.

63. Action Transactions

Where multiple database changes must succeed together, use a transaction.

Example:

CREATE_ORDER

may require:

Create order
+
Create order items
+
Update inventory

These should not leave inconsistent partial state.

64. Atomicity

If a critical transaction fails:

Rollback

where appropriate.

65. External Actions

Some actions involve external services.

Example:

SEND_MESSAGE

The external service may fail after internal state changes.

The system must handle this explicitly.

66. External Action Status

Possible:

QUEUED
SENDING
SENT
FAILED
UNKNOWN
67. Unknown External State

If the external provider times out, FrontDesk should not automatically assume failure.

Example:

Message delivery status is currently unknown.

68. Retry Policy

Each action may define retry behavior.

Example:

SEND_MESSAGE

Retry:
3 attempts

Backoff:
Exponential

Exact infrastructure belongs in the system architecture.

69. Non-Retryable Errors

Do not retry:

INVALID_INPUT
PERMISSION_DENIED
RESOURCE_NOT_FOUND
BUSINESS_RULE_VIOLATION
70. Rate Limits

Actions may have limits.

Example:

SEND_MESSAGE
100 messages/minute
71. Why Rate Limits

Protect against:

AI loops,
automation bugs,
accidental bulk actions,
abuse,
integration limits.
72. Per-Business Limits

Limits should be scoped by business where appropriate.

73. Per-Agent Limits

Agents may have stricter limits.

Example:

Customer Agent:
50 outbound messages/hour
74. Per-Action Limits

Each action can define its own limit.

75. Action Timeout

Every action should have a defined timeout.

Long-running operations should become asynchronous jobs.

76. Synchronous Action

Example:

UPDATE_PRODUCT

may complete immediately.

77. Asynchronous Action

Example:

SEND_CAMPAIGN

may become:

QUEUED

and process in the background.

78. Action Job

Conceptually:

Action Request
↓
Job Queue
↓
Worker
↓
Action Execution
79. Action Audit

Every executed action must produce an audit record.

Example:

Actor:
AI Agent

Action:
UPDATE_PRODUCT_PRICE

Old:
₹180

New:
₹200

Approval:
Approved by Fareed

Time:
10:42 AM
80. Audit Requirements

Record:

Action ID
Business ID
Actor
Source
Input Summary
Result
Timestamp
Approval
Correlation ID

Never store secrets unnecessarily.

81. Sensitive Inputs

Audit logs should redact:

Passwords
API keys
Tokens
Payment credentials
Private secrets
82. Action History

Business owners should eventually be able to see:

Activity
├── Owner changes
├── Staff changes
├── AI changes
├── Automation changes
└── Integration changes
83. AI Attribution

AI-generated actions should clearly identify:

Executed by:
AI Agent — Bakery Assistant
84. Automation Attribution

Example:

Executed by:
Automation — New Order Confirmation
85. Human Attribution

Example:

Executed by:
Staff — Manager
86. Action Explainability

For AI-triggered actions, store:

Why was this action proposed?
What evidence was used?
What policy allowed it?

Do not store or expose hidden chain-of-thought.

87. Action Registry Security

The Action Registry is a security boundary.

It must never trust:

Client-supplied permissions
Client-supplied actor type
Client-supplied business_id

without server-side verification.

88. Server-Side Authorization

Authorization must happen on the server.

The frontend cannot decide:

"This user is an admin."

89. Frontend Responsibility

The frontend may hide unavailable actions for UX.

But the backend must enforce permissions regardless.

90. API Responsibility

Every API endpoint invoking an action must pass through the same authorization mechanism.

91. Agent Responsibility

Agents cannot bypass the Action Registry.

92. Automation Responsibility

Automations cannot bypass the Action Registry.

93. Internal Service Responsibility

Even internal services should use controlled service permissions where practical.

94. Action Registry as a Policy Enforcement Point

Conceptually:

Request
 ↓
Action Registry
 ├── Authentication
 ├── Authorization
 ├── Validation
 ├── Policy
 ├── Approval
 ├── Rate Limit
 └── Execution
95. Example Action — CREATE_LEAD
Action:
CREATE_LEAD

Permission:
leads.create

Risk:
LOW

Approval:
NEVER

Input:
name
phone
email
source
notes

Output:
lead_id
status

Side Effects:
Creates lead

Idempotency:
Supported
96. Example Action — UPDATE_PRODUCT
Action:
UPDATE_PRODUCT

Permission:
products.update

Risk:
LOW / MEDIUM

Approval:
Configurable

Input:
product_id
fields_to_update

Output:
product

Side Effects:
Updates product

Validation:
Product must exist
97. Example Action — UPDATE_PRODUCT_PRICE
Action:
UPDATE_PRODUCT_PRICE

Permission:
products.update_price

Risk:
HIGH

Approval:
ALWAYS for AI

Input:
product_id
new_price

Validation:
Price > 0
Product exists
Currency valid

Audit:
Required
98. Example Action — CREATE_ORDER
Action:
CREATE_ORDER

Permission:
orders.create

Risk:
MEDIUM

Approval:
Configurable

Input:
customer
items
fulfillment
notes

Validation:
Products exist
Products available
Quantities valid
Prices current

Output:
order_id
status
total

Side Effects:
Creates order
May update inventory
Emits ORDER_CREATED
99. Example Action — CREATE_BOOKING
Action:
CREATE_BOOKING

Permission:
bookings.create

Risk:
MEDIUM

Input:
customer_id
service_id
staff_id
date
time

Validation:
Service exists
Staff available
Slot available

Output:
booking_id
status
100. Example Action — SEND_MESSAGE
Action:
SEND_MESSAGE

Permission:
messages.send

Risk:
MEDIUM

Approval:
Configurable

Input:
recipient
channel
message

Validation:
Channel connected
Recipient valid
Business policy permits message

Output:
message_id
status
101. Example Action — CREATE_COUPON
Action:
CREATE_COUPON

Permission:
marketing.coupons.create

Risk:
MEDIUM

Input:
code
discount
expiry
conditions

Validation:
Code unique
Discount valid
Expiry valid

Output:
coupon_id
102. Example Action — SEND_MASS_CAMPAIGN
Action:
SEND_MASS_CAMPAIGN

Permission:
marketing.campaigns.send

Risk:
HIGH

Approval:
ALWAYS

Input:
campaign_id

Validation:
Audience valid
Consent requirements satisfied
Message valid
Integration connected
103. Example Action — REFUND_PAYMENT
Action:
REFUND_PAYMENT

Permission:
payments.refund

Risk:
CRITICAL

Approval:
ALWAYS

Additional:
Strong authentication may be required
104. Example Action — DELETE_PRODUCT
Action:
DELETE_PRODUCT

Permission:
products.delete

Risk:
HIGH

Approval:
ALWAYS for AI

Additional:
Prefer archive/soft-delete where appropriate
105. Soft Delete

For important business records, prefer:

ARCHIVE_PRODUCT

over immediate permanent deletion.

106. Destructive Actions

Destructive actions should have:

Explicit confirmation
Audit log
Permission
Approval
Recovery strategy
107. Restore Actions

Where possible:

ARCHIVE
↓
RESTORE

rather than irreversible deletion.

108. Bulk Actions

Bulk actions require additional protection.

Example:

UPDATE 500 PRODUCTS

should display:

Affected:
500 products

before execution.

109. Bulk Action Approval

Bulk operations may require approval even if the individual action is low-risk.

110. Bulk Limits

v0.1 should limit maximum affected records per action.

111. Preview Before Bulk Action

Example:

AI wants to update:

47 products

Fields:
Descriptions

[Preview]
[Approve]
112. Action Dry Run

Future actions may support:

dry_run = true

to calculate intended changes without executing them.

113. Example
UPDATE_PRODUCTS

Dry Run:

47 products affected
0 validation errors
3 products missing data

Then:

[Apply]
114. Action Preview

Dry-run capability is especially valuable for:

AI,
bulk updates,
imports,
migrations.
115. Action Composition

Future actions may be composed into workflows.

Example:

CREATE_COUPON
↓
UPDATE_WEBSITE
↓
CREATE_SOCIAL_POST
↓
CREATE_WHATSAPP_CAMPAIGN
116. Action Composition Safety

Each individual action must still pass its own permissions and policy checks.

117. Action Registry + Workflow Engine
Workflow
  ↓
Action 1
  ↓
Action 2
  ↓
Action 3

The workflow engine should not become a bypass around the Action Registry.

118. Action Dependencies

Some actions require other resources.

Example:

CREATE_ORDER

requires:

Customer
Product
Availability
119. Action Preconditions

Preconditions should be machine-checkable where possible.

120. Action Postconditions

After execution, validate expected state.

Example:

CREATE_LEAD

postcondition:

Lead exists
121. Action Verification

For external systems:

SEND_MESSAGE

postcondition may be:

Provider accepted message

not necessarily:

Customer received message

These are different states.

122. Action State

Possible action lifecycle:

REQUESTED
↓
VALIDATING
↓
PENDING_APPROVAL
↓
APPROVED
↓
EXECUTING
↓
SUCCEEDED

Failure path:

EXECUTING
↓
FAILED
123. Action Cancellation

Actions that support cancellation should define when cancellation is possible.

124. Action Retry

Retry behavior must be explicitly defined.

Never blindly retry destructive actions.

125. Action Observability

Each action should emit structured logs/metrics.

126. Action Metrics

Internal metrics:

Total Invocations
Success Rate
Failure Rate
Average Duration
Approval Rate
Rejected Rate
Retry Count
127. Action Registry Health

Future admin dashboard:

Action Registry

Healthy:
98%

Failed:
2%

Top failing action:
SEND_MESSAGE
128. Action Registry Testing

Every action should have:

Unit Tests
Validation Tests
Authorization Tests
Permission Tests
Integration Tests
Failure Tests
Idempotency Tests
129. AI Action Testing

AI-specific tests:

Agent requests allowed action
Agent requests forbidden action
Agent attempts wrong business
Agent submits malformed input
Agent attempts high-risk action
130. Security Testing

Test:

Cross-business access
Permission bypass
Role escalation
Parameter tampering
Replay attacks
Duplicate execution
131. Action Registry API Boundary

The frontend should call APIs.

The API should resolve the action.

The action registry should enforce it.

Frontend
 ↓
API
 ↓
Action Registry
 ↓
Domain Service
 ↓
Database / Integration
132. Domain Service

The Action Registry should not contain all business logic itself.

Instead:

Action Registry
↓
Domain Service

Example:

CREATE_ORDER
↓
OrderService.create()
133. Separation of Concerns

Action Registry handles:

Authorization
Validation
Policy
Approval
Execution orchestration
Audit

Domain services handle:

Business logic
134. Example Architecture
                    CLIENT
                       ↓
                     API
                       ↓
                ACTION REGISTRY
                       ↓
          ┌────────────┼────────────┐
          ↓            ↓            ↓
      OrderService  ProductService CRMService
          ↓            ↓            ↓
       Database     Database     Database
135. Integration Actions

External integrations should also be represented as controlled actions where appropriate.

Example:

SEND_WHATSAPP_MESSAGE
SYNC_GOOGLE_BUSINESS
CREATE_PAYMENT_LINK
SEND_EMAIL
136. Integration Credentials

Actions may reference integration configuration.

The action should never expose credentials to the AI.

137. Secret Boundary
Agent
 ↓
Action
 ↓
Integration Service
 ↓
Secret Store
 ↓
External Provider

The agent never receives the provider secret.

138. Action Registry and Business Memory

Business Memory may constrain actions.

Example:

Business Memory:
Never discount premium products.

AI:
CREATE_COUPON

Action Registry:
Checks policy
↓
Rejected
139. Policy Rejection

Return:

BUSINESS_POLICY_VIOLATION

with a safe explanation.

140. Action Registry and Copilot

Copilot:

Create a win-back campaign.

Action Registry:

CREATE_CAMPAIGN

checks:

Permission
Audience
Consent
Approval
141. Action Registry and Agents

Agent:

CREATE_ORDER

Registry:

Check permission
Check product
Check availability
Check customer confirmation
Execute
Audit
142. Action Registry and Automations

Automation:

WHEN ORDER_CREATED
→ SEND_MESSAGE

Registry:

Validate message
Check integration
Execute
Audit
143. Action Registry and Dashboard

Owner:

Update product price.

Dashboard:

UPDATE_PRODUCT_PRICE

Registry:

Permission:
Yes

Approval:
Owner already authenticated

Execute
144. Action Registry and External API

External API clients receive scoped credentials.

Example:

API client:
POS Integration

may have:

products.read
orders.read
orders.create

but not:

payments.refund
145. API Scope

External API credentials should map to permissions.

146. Action Discovery

Future developers/agents may query:

What actions are available?

The response should include only actions they are authorized to see/use.

147. Action Metadata

Example:

{
  "name": "CREATE_ORDER",
  "description": "Create a customer order",
  "risk": "MEDIUM",
  "permission": "orders.create",
  "approval": "CONFIGURABLE"
}
148. Agent Tool Generation

Agent tools can be generated from Action Registry definitions.

This avoids duplicating schemas.

Action Registry
↓
Tool Definition
↓
AI Agent
149. Automation Builder

The automation builder can also select actions from the Action Registry.

WHEN:
Order Created

THEN:
SEND_MESSAGE
150. Single Source of Truth

The Action Registry should be the source of truth for action capabilities.

151. Action Naming Consistency

Do not have:

sendWhatsapp
send_whatsapp
whatsappSend
SEND_WHATSAPP

for the same operation.

Choose one canonical action.

Example:

SEND_WHATSAPP_MESSAGE
152. Action Documentation

Every production action should have documentation.

Minimum:

Purpose
Input
Output
Permission
Risk
Approval
Side Effects
Errors
Examples
153. Action Registry Documentation Format

Recommended internal template:

## ACTION_NAME

### Purpose

### Permission

### Risk

### Approval

### Input

### Output

### Preconditions

### Side Effects

### Errors

### Idempotency

### Example
154. v0.1 Action Catalog

Initial catalog:

Catalog
CREATE_PRODUCT
UPDATE_PRODUCT
UPDATE_PRODUCT_AVAILABILITY
ARCHIVE_PRODUCT
Leads
CREATE_LEAD
UPDATE_LEAD
ASSIGN_LEAD
Enquiries
CREATE_ENQUIRY
UPDATE_ENQUIRY
ASSIGN_ENQUIRY
Orders
CREATE_ORDER
UPDATE_ORDER_STATUS
Bookings
CREATE_BOOKING
UPDATE_BOOKING_STATUS
Communication
SEND_MESSAGE
Marketing
CREATE_COUPON
Quotations
CREATE_QUOTATION
Loyalty
ADD_LOYALTY_POINTS
Business
UPDATE_BUSINESS_PROFILE
Website
PUBLISH_WEBSITE
CREATE_WEBSITE_VERSION
RESTORE_WEBSITE_VERSION
155. Actions Deliberately Excluded From Early v0.1

Do not initially expose:

REFUND_PAYMENT
CHANGE_BANK_ACCOUNT
DELETE_BUSINESS
DELETE_CUSTOMER
SEND_MASS_CAMPAIGN
CHANGE_TAX_CONFIGURATION

until their security and approval systems are mature.

156. Action Expansion Rule

A new action should only be added when:

The business capability exists.
The domain service exists.
Permissions are defined.
Validation is defined.
Risk is classified.
Approval behavior is defined.
Audit behavior is defined.
Failure behavior is defined.
Tests exist.
157. Action Registry Anti-Patterns

Avoid:

AI directly writes to database.

Avoid:

Frontend directly changes protected business data.

Avoid:

Automation bypasses permissions.

Avoid:

Agent gets database credentials.

Avoid:

Every feature implements its own permission system.
158. Database Access

AI should never receive direct unrestricted database access.

Instead:

AI
↓
Action / Query Tool
↓
Authorized Service
↓
Database
159. Read Operations

Not every read needs to be a side-effecting Action.

FrontDesk may also have controlled query services.

For example:

GET_PRODUCT
SEARCH_PRODUCTS
GET_ORDER

These can follow a similar authorization model.

160. Action vs Query

Recommended distinction:

QUERY
=
Read information

ACTION
=
Cause a state change
161. Query Registry

Future architecture may introduce:

Query Registry

for standardized AI-safe read operations.

162. v0.1 Recommendation

Do not over-engineer Query Registry initially.

Use controlled domain queries/services.

163. Action Security Principle

No state-changing operation should happen simply because an AI model requested it.

164. Action Registry Success Criteria

The Action Registry succeeds when:

Every business action has a predictable contract.

Every actor is authorized.

Every consequential action is controlled.

Every AI action is auditable.

Every failed action is explainable.

No AI system can bypass business permissions.
165. Final Architecture
                           FRONTDESK
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ↓                      ↓                      ↓
    Dashboard              AI Copilot             AI Agents
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               ↓
                       ACTION REGISTRY
                               │
        ┌──────────────────────┼──────────────────────┐
        ↓                      ↓                      ↓
   Authorization          Validation              Policy
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               ↓
                          Approval Layer
                               ↓
                         Domain Services
                               ↓
                  ┌────────────┼────────────┐
                  ↓            ↓            ↓
               Database    Integrations   Events
166. Final Principle

The Action Registry is the controlled bridge between FrontDesk's intelligence and FrontDesk's real-world business operations.

AI may understand.

AI may recommend.

AI may plan.

But:

The Action Registry decides what FrontDesk is actually allowed to do.