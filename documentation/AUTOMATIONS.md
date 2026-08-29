# FrontDesk — Automations Specification

**Product:** FrontDesk  
**Version:** v0.1  
**Module:** Automations  
**Document:** Feature Specification  
**Status:** Draft — For Review  
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Automations module allows businesses to automate repetitive operational tasks without writing code.

The core model is:

    WHEN something happens
        ↓
    CHECK conditions
        ↓
    DO one or more actions

Example:

    WHEN
    Customer submits enquiry

    IF
    Business is open

    THEN
    Create lead

    AND
    Notify owner

    AND
    Send customer acknowledgement

---

# 2. Product Principle

FrontDesk automation should be designed for non-technical business owners.

The owner should think:

> "When this happens, do this."

Not:

> "Configure a workflow engine."

The interface should hide technical complexity.

---

# 3. Core Automation Model

Every automation consists of:

```text
Trigger
   ↓
Conditions
   ↓
Actions
   ↓
Execution
   ↓
Result

Optional:

Delay
Approval
Branch
Retry
Failure handling
4. v0.1 Scope

v0.1 should support:

automation creation,
automation editing,
automation enable/disable,
basic triggers,
basic conditions,
basic actions,
manual testing,
execution history,
basic failure handling,
execution logs,
workspace isolation,
basic permissions.
5. v0.1 Non-Goals

Do not attempt to reproduce the entire functionality of n8n.

Not v0.1:

arbitrary code execution,
unrestricted external API workflows,
complex loops,
advanced branching,
distributed workflow orchestration,
marketplace of thousands of integrations,
arbitrary webhook processing,
long-running workflows,
complex data transformation language.

These belong to future versions.

6. Automation Example

Example:

Automation:
New Enquiry Alert

WHEN:
New enquiry received

THEN:
Create lead

AND:
Notify owner
7. Automation Object

Conceptually:

Automation
├── ID
├── Business ID
├── Name
├── Description
├── Status
├── Trigger
├── Conditions
├── Actions
├── Created By
├── Updated By
├── Version
├── Created At
└── Updated At

Exact database representation belongs to DATABASE-SCHEMA.md.

8. Automation Status

v0.1:

DRAFT
ACTIVE
PAUSED
ARCHIVED
9. Draft

Automation is being created or edited.

It does not execute automatically.

10. Active

Automation is enabled and can execute when its trigger occurs.

11. Paused

Automation remains configured but does not execute.

12. Archived

Automation is no longer active.

Historical executions remain available.

13. Trigger

A trigger defines:

When should this automation start?

Examples:

New Order
New Enquiry
New Customer
Booking Created
Booking Cancelled
Payment Completed
Order Completed
Review Received
Product Becomes Unavailable
Scheduled Time
14. Trigger Principle

An automation should have one primary trigger.

Example:

WHEN:
Order Completed

Conditions and actions determine what happens afterward.

15. v0.1 Triggers

Recommended initial triggers:

NEW_ENQUIRY
NEW_CUSTOMER
ORDER_CREATED
ORDER_COMPLETED
BOOKING_CREATED
BOOKING_COMPLETED
PAYMENT_COMPLETED
REVIEW_RECEIVED
SCHEDULED_TIME
16. Future Triggers

Future:

CUSTOMER_INACTIVE
PRODUCT_LOW_STOCK
PRODUCT_OUT_OF_STOCK
CUSTOMER_REACHED_POINTS
REWARD_REDEEMED
DELIVERY_DELAYED
WEBSITE_ACTIVITY
ANALYTICS_THRESHOLD
FORM_SUBMITTED
17. Event-Based Trigger

Example:

Event:
ORDER_COMPLETED

The automation engine receives the event.

↓

Checks matching automations.

↓

Executes eligible automations.

18. Scheduled Trigger

Example:

Every Monday
9:00 AM

or:

August 30
6:00 PM

Scheduled execution should use the platform's scheduling infrastructure.

19. Trigger Payload

When an event occurs, the automation receives relevant structured data.

Example:

{
  "event": "ORDER_COMPLETED",
  "order_id": "ORD-123",
  "customer_id": "CUS-456",
  "business_id": "BUS-001"
}

The automation should retrieve authoritative data from the backend rather than trusting arbitrary client-provided values.

20. Conditions

Conditions determine whether the automation should continue.

Example:

WHEN:
Order completed

IF:
Order total > ₹1,000

THEN:
Give 100 points
21. Condition Types

v0.1:

EQUALS
NOT_EQUALS
GREATER_THAN
LESS_THAN
GREATER_THAN_OR_EQUAL
LESS_THAN_OR_EQUAL
CONTAINS
IS_EMPTY
IS_NOT_EMPTY
22. Condition Example
Order Total
>
₹1,000
23. Multiple Conditions

Example:

WHEN:
Order Completed

IF:
Order Total > ₹1,000

AND:
Customer is a Loyalty Member

THEN:
Send reward
24. AND Logic

All conditions must be true.

A AND B

requires:

A = true
B = true
25. OR Logic

Future:

A OR B

Only one condition must be true.

26. Condition Groups

Future:

(A AND B)
OR
(C AND D)

Not necessary for the first basic automation builder.

27. Actions

An action defines:

What should FrontDesk do?

Examples:

Create Lead
Send Notification
Send WhatsApp Message
Add Loyalty Points
Create Coupon
Update Customer
Create Task
Send Email
28. v0.1 Actions

Recommended initial actions:

CREATE_LEAD
CREATE_TASK
SEND_NOTIFICATION
SEND_EMAIL
UPDATE_CUSTOMER
ADD_LOYALTY_POINTS

WhatsApp action may be included if the required provider integration is available.

29. Future Actions
SEND_WHATSAPP
CREATE_ORDER
CREATE_BOOKING
CREATE_QUOTATION
CREATE_INVOICE
UPDATE_PRODUCT
UPDATE_INVENTORY
CREATE_COUPON
PUBLISH_CONTENT
SEND_CAMPAIGN
CALL_EXTERNAL_API
RUN_AI_AGENT
30. Action Parameters

Each action has structured parameters.

Example:

Action:
ADD_LOYALTY_POINTS

Points:
100

Reason:
High-value order
31. Dynamic Values

Actions should be able to use data from the trigger.

Example:

Customer Name
{{customer.name}}

or:

Order Total
{{order.total}}

The exact expression syntax belongs to the automation implementation/API documentation.

32. Example Dynamic Message
Hello {{customer.name}},

Thank you for your order #{{order.number}}.

You earned {{loyalty.points}} points.
33. Variable Safety

Dynamic values must be resolved server-side.

The frontend must not be able to inject arbitrary executable code.

34. Automation Builder

The primary UI should be visual.

Example:

┌───────────────────────────────┐
│ WHEN                          │
│ Order is completed            │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ IF                            │
│ Order total > ₹1,000          │
└───────────────┬───────────────┘
                ↓
┌───────────────────────────────┐
│ THEN                          │
│ Add 100 loyalty points        │
└───────────────────────────────┘
35. No-Code Principle

The user should never need to write:

JavaScript
Python
SQL
JSON

to create normal automations.

36. Automation Templates

Provide pre-built templates.

Examples:

New Enquiry → Notify Me

Order Completed → Thank Customer

New Customer → Add to CRM

Booking Created → Send Confirmation

Order Completed → Add Loyalty Points
37. Industry Templates

Future:

Café
Order Completed
→ Add Loyalty Points
→ Send Thank You
Salon
Booking Completed
→ Send Review Request
Freelancer
New Enquiry
→ Create Lead
→ Notify Owner
Boutique
New Order
→ Update Customer
→ Send Confirmation
38. Automation Marketplace

Future users can discover:

Popular Automations

Abandoned Enquiry Follow-up
Review Request
Birthday Offer
Win-Back Campaign
Low Stock Alert
39. Marketplace Safety

Third-party automation templates must be sandboxed and permission-scoped.

Templates must not gain unrestricted access to business data.

40. Automation Installation

Future:

Template:
Review Request

[Install]

↓

FrontDesk asks:

Which channel?

WhatsApp
Email
SMS

↓

Automation configured.

41. Automation Variables

Common variables:

Business
Customer
Order
Product
Booking
Payment
Review
Loyalty
Date
Time
42. Business Variables

Example:

{{business.name}}
{{business.phone}}
{{business.address}}
43. Customer Variables
{{customer.name}}
{{customer.phone}}
{{customer.email}}
44. Order Variables
{{order.id}}
{{order.number}}
{{order.total}}
{{order.status}}
45. Booking Variables
{{booking.date}}
{{booking.time}}
{{booking.service}}
46. Loyalty Variables
{{loyalty.balance}}
{{loyalty.points_earned}}
47. Automation Example — Review Request
WHEN:
Order Completed

WAIT:
2 hours

THEN:
Send review request

Delay may be implemented in future v0.1.x depending on infrastructure.

48. Delay

A delay pauses execution before the next action.

Example:

Order Completed
      ↓
WAIT 2 HOURS
      ↓
Send Review Request
49. Delay Safety

Delayed executions must remain durable.

If the server restarts:

Automation should continue.

Do not rely solely on in-memory timers.

50. Scheduled Execution

Use durable scheduling infrastructure.

Possible implementation later:

Database
+
Queue
+
Worker
+
Scheduler

Exact infrastructure belongs to SYSTEM-ARCHITECTURE.md.

51. Approval Step

Some actions require owner approval.

Example:

WHEN:
AI detects inactive customers

THEN:
Create ₹100 coupon

REQUIRES:
Owner Approval
52. Approval Flow
Automation
   ↓
AI/Automation proposes action
   ↓
Approval Inbox
   ↓
Owner approves
   ↓
Action executes
53. High-Risk Actions

Approval should be considered for:

Changing prices
Issuing large discounts
Sending mass campaigns
Deleting products
Changing business settings
Issuing refunds
Changing financial information
54. Low-Risk Actions

May execute automatically:

Create internal task
Update non-sensitive customer metadata
Send transactional notification
Add predefined loyalty points
Create analytics event

Exact permissions depend on business configuration.

55. Automation Permissions

Each automation should have an explicit permission scope.

Example:

Automation:
Review Request

Permissions:
READ order
READ customer
SEND notification

It should not automatically have:

DELETE customer
READ financial records
CHANGE prices
56. Least Privilege

Automations should receive only the permissions required for their actions.

57. Business Owner Control

Owner should be able to see:

What can this automation access?

Example:

Customer:
Read

Orders:
Read

Marketing:
Send

Payments:
No Access
58. Automation Execution

Each execution should have a unique execution ID.

Example:

Execution:
EXE-000123
59. Execution Status
QUEUED
RUNNING
WAITING
COMPLETED
FAILED
CANCELLED
60. Execution History

Example:

Automation:
New Order Notification

Executions:
Today 10:32 AM — Success
Today 10:15 AM — Success
Yesterday 8:45 PM — Failed
61. Execution Detail

Example:

Execution:
EXE-000123

Trigger:
ORDER_COMPLETED

Started:
10:32 AM

Steps:

✓ Trigger received
✓ Customer loaded
✓ Conditions passed
✓ Notification sent

Result:
SUCCESS
62. Failed Execution

Example:

Execution:
EXE-000124

✓ Trigger received
✓ Customer loaded
✗ WhatsApp provider failed

Status:
FAILED
63. Failure Reason

The system should provide an understandable reason.

Bad:

Error 500.

Better:

WhatsApp message could not be sent because the configured provider rejected the request.

64. Retry

Transient failures may be retried.

Example:

Attempt 1 → Failed
Attempt 2 → Failed
Attempt 3 → Success
65. Retry Policy

Future configuration:

Maximum retries:
3

Delay:
1 minute
5 minutes
15 minutes
66. Retry Safety

Only actions that are safe to repeat should automatically retry.

Example:

SEND_NOTIFICATION

may be retryable.

But:

CHARGE_PAYMENT

requires idempotency and special handling.

67. Idempotency

Every action that can create side effects should have an idempotency mechanism where applicable.

Example:

Automation:
ADD_LOYALTY_POINTS

Reference:
EXECUTION-123-ACTION-2

The same action must not award points twice if execution is retried.

68. Duplicate Execution

If the same event arrives twice:

ORDER_COMPLETED
ORD-123

the automation should not blindly run twice.

Event deduplication must be considered.

69. Event ID

Each event should have a unique ID.

Example:

Event:
EVT-12345

Automation execution can reference it.

70. Execution Context

Each execution should retain:

Execution ID
Automation ID
Business ID
Trigger Event ID
Started At
Completed At
Status
Error
71. Logs

Automation logs should be useful to non-technical users.

Example:

10:32 AM
Automation started

10:32 AM
Customer found: Arun

10:32 AM
Condition passed

10:32 AM
Notification sent

10:32 AM
Automation completed
72. Technical Logs

Developers/admins may need more detailed logs.

These should be separate from the simplified owner-facing execution history.

73. Execution Data Privacy

Logs must not unnecessarily expose:

passwords,
payment credentials,
authentication tokens,
secret API keys,
sensitive personal data.
74. Automation Testing

The builder should support:

Test Automation

before activation.

75. Test Mode

Example:

Trigger:
New Enquiry

Test Data:
Demo Customer

[Run Test]
76. Test Result
✓ Trigger accepted
✓ Conditions passed
✓ Lead created
✓ Notification simulated
77. Safe Test Mode

Test mode should not accidentally send real mass campaigns or perform destructive operations.

78. Dry Run

Future:

DRY RUN

shows what the automation would do without executing side effects.

Example:

This automation would send a message to 42 customers.

79. Automation Preview

Before activation:

WHEN:
Order Completed

IF:
Order > ₹1,000

THEN:
Add 100 points

AND:
Send notification

Owner:

[Activate]
80. Activation Confirmation

For high-impact automations:

This automation may send messages to customers.

[Cancel]
[Activate]
81. Automation Limits

Protect businesses from accidental runaway workflows.

Possible limits:

Maximum executions/hour
Maximum messages/day
Maximum actions/execution
Maximum campaign recipients
82. Infinite Loop Prevention

The system must prevent:

Automation A
→ changes customer
→ triggers Automation B
→ changes customer
→ triggers Automation A
→ ...
83. Loop Detection

Possible protections:

Execution depth
Event chain ID
Maximum actions
Maximum runtime
84. Automation Chain

Future:

Order Completed
   ↓
Automation A
   ↓
Customer Updated
   ↓
Automation B
   ↓
Notification

The system should retain the relationship between these executions.

85. Maximum Execution Depth

Future system-level safeguard:

Maximum chain depth:
N

When exceeded:

Execution stopped safely.
86. Rate Limits

Automations must respect provider limits.

Example:

WhatsApp:
Provider limit reached

The automation should enter a retryable or failed state rather than endlessly retrying.

87. Provider Availability

If an external service is unavailable:

Automation
   ↓
Provider unavailable
   ↓
Retry / Failure

Core business data should remain intact.

88. Automation Independence

If:

WhatsApp

is unavailable, this should not corrupt:

Order
Customer
Loyalty
89. Automation Deactivation

When an automation is disabled:

New executions should not start.

Already-running executions require defined behavior.

For v0.1:

Running executions should normally finish unless explicitly cancelled.

90. Automation Cancellation

Owner can cancel queued/waiting executions where supported.

Example:

Execution:
WAITING

[Cancel]
91. Versioning

Every automation should have a version.

Example:

Automation:
Review Request

Version:
3
92. Why Versioning Matters

Suppose:

Version 1:
Send review request after 1 hour.

is changed to:

Version 2:
Send after 3 hours.

Existing executions should retain the version they started with.

93. Automation History

Owner should be able to see:

Version 3 — Current
Version 2 — Previous
Version 1 — Previous
94. Restore Version

Future:

Restore Version 2
95. Automation Audit

Record:

Created
Updated
Enabled
Paused
Archived
Activated
Edited
Deleted
96. Actor Types

Actions may be performed by:

OWNER
STAFF
SYSTEM
AUTOMATION
AI
97. AI-Generated Automations

This is a major future feature.

Owner writes:

"Whenever someone asks about a product we don't have, notify me."

AI generates:

WHEN:
New Enquiry

IF:
Requested Product is unavailable

THEN:
Create Task

AND:
Notify Owner
98. Natural Language Automation Builder

Future interface:

✨ What should happen automatically?

"When a customer books an appointment,
send them a confirmation and remind them
one day before."

AI converts the request into a structured workflow.

99. AI Must Not Generate Arbitrary Code

The AI should generate a structured automation definition.

Conceptually:

Trigger
Conditions
Actions
Permissions

not arbitrary executable code.

100. AI Automation Preview

AI:

I created this automation:

WHEN:
Booking Created

THEN:
Send confirmation

WAIT:
1 day before appointment

THEN:
Send reminder

Owner:

[Review]
[Activate]
101. AI Automation Validation

Before activation, the platform should check:

required permissions,
missing configuration,
invalid trigger,
invalid action,
unavailable integration,
unsafe action,
conflicting rules.
102. AI Automation Safety

AI should not automatically activate high-impact workflows.

Recommended:

AI creates draft
        ↓
Validation
        ↓
Owner approval
        ↓
Activation
103. Automation Copilot

Future owner can ask:

"Show me all automations that send WhatsApp messages."

or:

"Why didn't the review request run?"

or:

"Pause all marketing automations."

104. Explain Automation Failure

Owner:

Why wasn't the customer notified?

Copilot:

The automation ran successfully, but WhatsApp delivery failed because the configured provider rejected the message.

105. Automation Health

Future dashboard:

Automations:
18

Active:
14

Paused:
3

Failed:
1
106. Failed Automation Alerts

Future:

⚠️ Your "Review Request" automation failed 12 times today.

Possible reason:

WhatsApp integration is disconnected.

Action:

[Fix Integration]
107. Automation Recommendations

Future Business Copilot may suggest:

You receive many enquiries outside business hours.

Would you like to automatically send an acknowledgement?

[Create Automation]
108. Automation Analytics

Future metrics:

Executions
Success Rate
Failure Rate
Actions Performed
Messages Sent
Leads Created
Orders Influenced
109. Business Impact

Future:

This automation generated 18 leads this month.

Where measurable, FrontDesk should distinguish:

Directly attributed

from:

Estimated influence
110. Automation Attribution

Example:

Automation:
Win-Back Campaign

Customers contacted:
200

Orders:
18

Revenue:
₹7,200

Attribution methodology must be clearly defined.

111. Automation Cost

Future integrations may have costs.

Example:

WhatsApp messages:
₹X

Email:
₹X

AI usage:
₹X

The platform may eventually estimate automation cost.

112. Cost Guardrails

Future owner settings:

Maximum automation spend:
₹1,000/month

If exceeded:

Pause automation
113. AI Cost Guardrail

AI-generated workflows should respect:

AI usage limits
Message limits
Business budget
114. Automation Permissions

Business roles:

Owner
Admin
Manager
Staff

Possible permissions:

automation.view
automation.create
automation.edit
automation.activate
automation.pause
automation.delete
automation.test
115. Activation Permission

Only authorized users can activate automations.

116. Destructive Actions

Actions such as:

Delete
Refund
Change Price
Mass Message

should require stronger permissions.

117. Mass Messaging

Future mass messaging must include:

audience selection,
consent rules,
preview,
estimated recipient count,
approval,
provider restrictions,
rate limiting,
unsubscribe handling.
118. Marketing vs Transactional Automation

These should be distinguished.

Transactional:

Order Confirmation
Booking Confirmation

Marketing:

Weekend Offer
Win-Back Campaign

Different consent and communication rules may apply.

119. Customer Opt-Out

Customers should be able to opt out of marketing communications.

Automation must respect those preferences.

120. Automation Data Access

Example:

Review Request Automation

Can Read:
Order
Customer

Can Send:
Notification

Cannot:
Change Product
Read Payment Credentials
Delete Customer
121. Integration Permissions

External integrations should use scoped credentials.

Never expose provider secrets to the browser.

122. Secrets

API keys, OAuth tokens, and provider credentials must be securely stored.

They should never appear in normal automation logs.

123. External API

Future action:

Call External API

must have:

URL restrictions,
authentication controls,
timeout,
rate limits,
response size limits,
logging,
permission checks.
124. Webhooks

Future:

External Service
      ↓
Webhook
      ↓
FrontDesk
      ↓
Automation Trigger

Webhook validation is required.

125. Webhook Security

Future webhook system should support:

Signature verification
Replay protection
Rate limiting
IP/provider validation where appropriate
126. Automation Queue

At scale, executions should be processed asynchronously.

Conceptually:

Event
 ↓
Automation Matcher
 ↓
Queue
 ↓
Worker
 ↓
Action
127. Synchronous vs Asynchronous

Simple operations may be synchronous.

Long-running or external operations should be asynchronous.

128. Automation Worker

Future worker responsibilities:

retrieve execution,
validate state,
execute next step,
record result,
schedule next step,
retry failures,
complete execution.
129. Queue Failure

If a worker crashes:

The execution should remain recoverable.

It must not disappear.

130. Execution Recovery

Future:

RUNNING

with worker failure.

System can detect stale execution and recover it safely.

131. Automation Timeout

Each execution should have a maximum runtime.

Future configuration:

Timeout:
5 minutes

Long-running workflows may use durable waiting states.

132. Automation State

Conceptually:

Execution
├── Triggered
├── Running
├── Waiting
├── Resumed
├── Completed
└── Failed
133. Wait State

Example:

Booking Created
   ↓
WAIT UNTIL
1 day before booking
   ↓
Send Reminder

The system should persist the waiting state.

134. Date/Time Handling

Automations must respect the business timezone.

Example:

Business timezone:
Asia/Kolkata

Scheduled actions should not silently use server UTC as the business's local time.

135. Daylight Saving

The platform should use timezone-aware scheduling.

Although India does not use daylight saving time, FrontDesk may eventually support businesses in other countries.

136. Business Hours

Future condition:

IF Business is Open

This should use structured business hours.

137. Example Business-Hours Automation
WHEN:
New Enquiry

IF:
Business is closed

THEN:
Send:
"We received your message.
We'll respond when we're open."
138. Customer Language

Future automation may use the customer's preferred language.

Example:

Customer preference:
Tamil

Message:

உங்கள் விசாரணையைப் பெற்றுள்ளோம்.

139. AI Translation

Future AI can generate multilingual automation messages.

However, the business should preview important customer-facing messages.

140. Automation Templates

Templates should contain:

Name
Description
Trigger
Actions
Required Integrations
Required Permissions
141. Template Example
Template:
New Enquiry Auto Reply

Trigger:
New Enquiry

Action:
Send Notification

Required:
Messaging integration
142. Template Installation

Before installation:

Required setup:

✓ Business phone
✓ Messaging provider

Missing:
Messaging provider
143. Template Configuration

After installation, owner configures:

Message:
Thanks for contacting {{business.name}}.
We'll get back to you soon.
144. Automation Search

Future:

Search automations...

Examples:

Review
Orders
Customers
WhatsApp
Bookings
Loyalty
145. Automation Categories
Customer
Orders
Bookings
Marketing
Loyalty
Operations
Notifications
Analytics
AI
146. Automation UI

Dashboard:

Automations

[Create Automation]

Active:
14

Paused:
3

Failed:
1
147. Automation Card

Example:

Review Request

WHEN:
Order Completed

THEN:
Wait 2 hours
→ Send Review Request

Status:
ACTIVE

Executions:
1,240

Success:
98.2%
148. Automation Detail Page

Sections:

Overview
Workflow
Permissions
Executions
History
Settings
149. Workflow Editor

Basic editor:

Trigger
   ↓
Condition
   ↓
Action
   ↓
Action

Future:

Trigger
   ↓
Condition
   ├── YES → Action A
   │          ↓
   │        Action B
   │
   └── NO → Action C
150. Visual Builder Principle

The visual workflow should remain understandable to a non-technical business owner.

Avoid unnecessarily technical terminology.

Instead of:

Node

prefer:

Step

Instead of:

Payload

prefer:

Information

Instead of:

Webhook

use:

External Event

where appropriate in the owner UI.

151. Advanced Mode

Future technical users may enable:

Advanced Mode

This can expose:

JSON,
event IDs,
API configuration,
raw execution details.

Normal users should not need it.

152. AI + Visual Builder

AI can create the initial workflow.

Owner can then visually modify it.

Example:

User:
"Whenever someone books a service,
send confirmation and remind them tomorrow."

AI:
Creates workflow.

User:
"Also notify me."

AI:
Adds notification step.
153. AI Change Preview

Before applying:

AI proposes:

1. Add confirmation message
2. Add reminder
3. Add owner notification

Owner:

[Apply]
154. Natural Language Editing

Future:

"Don't send reminders for bookings within 2 hours."

AI modifies the workflow.

Result:

IF:
Booking is more than 2 hours away

THEN:
Send reminder
155. AI Automation Validation

Before activation:

✓ Trigger valid
✓ Conditions valid
✓ Actions valid
✓ Permissions valid
✓ Integrations connected
✓ No obvious loop detected
156. Automation Conflicts

Future system may detect:

Automation A:
Change price to ₹500

Automation B:
Change price to ₹450

and warn:

These automations may conflict.

157. Duplicate Automation Detection

AI may identify:

You already have an automation that sends an order confirmation.

This avoids unnecessary duplication.

158. Automation Recommendation

Business Copilot:

You receive 37 enquiries per week.

Most are answered manually.

Would you like to create an automatic acknowledgement?

159. Automation Insights

Future:

Your automations saved an estimated
6 hours this week.

This should be clearly labeled as an estimate unless actual labor savings are measured.

160. Automation Impact

Example:

Review Request

1,240 executions
890 messages delivered
73 reviews received
161. Automation Success

Success should mean:

The configured workflow completed successfully.

It does not necessarily mean:

The business achieved its desired outcome.

For example:

A campaign can successfully send 500 messages but generate zero orders.

162. Business Outcome

Analytics should separately measure:

Execution Success

and:

Business Outcome
163. Automation Cost

Future dashboard:

Executions:
5,200

Messages:
2,100

Estimated cost:
₹X
164. Cost Transparency

If an action has a third-party cost, the owner should eventually be informed.

Example:

This campaign may incur messaging charges.

165. Automation Deletion

Deleting an automation should not delete historical execution records.

166. Archive Instead of Hard Delete

Prefer:

ARCHIVED

for important historical automations.

167. Data Retention

Execution logs may eventually be subject to retention policies.

Exact retention belongs to the Privacy/Data Retention documentation.

168. Automation Export

Future:

Export Automation

could produce a portable structured definition.

169. Automation Import

Future:

Import Automation

allows businesses or developers to reuse workflows.

Imported automations must be validated before activation.

170. Automation Sharing

Future:

Share with Team

or:

Publish Template
171. Developer Extensions

Future developers may create custom:

Triggers
Actions
Integrations

through a controlled extension system.

172. Action Marketplace

Future:

Actions Marketplace

Send WhatsApp
Create Invoice
Google Sheets
Accounting
Delivery
CRM
173. Action Security

Every external action should declare its permissions.

Example:

Google Sheets Action

Requires:
READ Google Sheets
WRITE Google Sheets
174. AI Agent Actions

Future AI agents can use automation actions.

Example:

AI Customer Agent
      ↓
CREATE_ORDER
      ↓
ORDER_CREATED
      ↓
Automation
      ↓
SEND_CONFIRMATION
175. Automation vs AI Agent

They are different.

Automation:

Deterministic rules.

AI Agent:

Reasoning + tools + dynamic decisions.

Example:

Automation:
Order Completed → Send Message

Agent:

Customer asks question
→ Understand intent
→ Retrieve business data
→ Decide appropriate action
→ Respond
176. Automation as Agent Infrastructure

The long-term architecture can allow agents to call safe actions that are already used by automations.

This creates reusable business capabilities.

177. Core Action Registry

Future internal registry:

Action Registry

CREATE_LEAD
CREATE_ORDER
CREATE_BOOKING
SEND_MESSAGE
ADD_LOYALTY_POINTS
CREATE_COUPON
UPDATE_CUSTOMER
CREATE_QUOTATION

Each action defines:

Input
Output
Permissions
Side Effects
Idempotency
178. Action Contract

Conceptually:

Action:
ADD_LOYALTY_POINTS

Input:
customer_id
points
reason

Permission:
loyalty.write

Idempotency:
required

Output:
transaction_id
new_balance
179. Action Result

Example:

{
  "success": true,
  "transaction_id": "LOY-123",
  "points_added": 100,
  "new_balance": 450
}
180. Action Errors

Errors should be structured.

Example:

INSUFFICIENT_PERMISSION
INVALID_INPUT
RESOURCE_NOT_FOUND
RATE_LIMITED
PROVIDER_UNAVAILABLE
DUPLICATE_REQUEST
181. Automation Error Handling

The workflow can classify errors:

Retryable
Non-retryable
Requires Human Review
182. Human Review

Future:

Action failed.

Reason:
Customer data unavailable.

[Retry]
[Resolve Manually]
183. Automation Notifications

Owner may receive:

Automation failed

but should not receive alerts for every transient retry.

Alert thresholds should prevent notification spam.

184. Failure Alert Example

⚠️ Review Request automation failed 8 times in the last hour.

Reason: messaging integration unavailable.

185. Automation Monitoring

Future:

Health:
GOOD
WARNING
ERROR
186. Automation Health Criteria

Example:

GOOD:
> 99% success

WARNING:
95–99%

ERROR:
<95%

These thresholds should eventually be configurable.

187. Automation Security Boundary

Automations are trusted business operations.

Therefore:

authenticate every management request,
authorize every action,
isolate every workspace,
validate every input,
protect every secret,
audit important changes,
rate-limit external operations.
188. Workspace Isolation

Automation A from:

Business A

must never access:

Business B
189. Cross-Workspace Actions

Not allowed in normal v0.1 automation.

190. Automation API

Future API examples:

GET    /automations
POST   /automations
GET    /automations/:id
PATCH  /automations/:id
POST   /automations/:id/test
POST   /automations/:id/activate
POST   /automations/:id/pause
GET    /automations/:id/executions

Exact API contracts belong in API.md.

191. Execution API

Future:

GET /automation-executions
GET /automation-executions/:id
POST /automation-executions/:id/cancel
POST /automation-executions/:id/retry

Permissions must be enforced.

192. Trigger API

Internal event system may publish:

ORDER_CREATED
ORDER_COMPLETED
BOOKING_CREATED
PAYMENT_COMPLETED

The exact event schema belongs to the event architecture documentation.

193. Automation Database Concepts

Likely entities:

automations
automation_versions
automation_triggers
automation_conditions
automation_actions
automation_executions
automation_execution_steps
automation_templates

Exact schema belongs to DATABASE-SCHEMA.md.

194. Automation Execution Steps

Each step should record:

Step ID
Execution ID
Action
Status
Started At
Completed At
Input Reference
Output Reference
Error

Sensitive raw input/output should not automatically be stored.

195. Execution Ordering

For:

Action A
↓
Action B
↓
Action C

B should not execute until A succeeds unless the workflow explicitly allows parallel execution.

196. Parallel Actions

Future:

Order Completed
      ↓
 ┌────┴─────┐
 ↓          ↓
Add Points  Send Message

These can execute independently if safe.

197. Parallel Safety

Parallel execution must account for:

race conditions,
duplicate effects,
resource conflicts,
ordering requirements.
198. Conditional Branching

Future:

Order Completed
       ↓
Order > ₹1000?
   ┌───┴───┐
  YES     NO
   ↓       ↓
Reward   Nothing
199. Looping

Not v0.1.

Future workflows may support controlled iteration.

Example:

For each customer
    Send message

This requires strong rate-limit and execution safeguards.

200. Bulk Actions

Future bulk actions should include:

Recipient count
Estimated cost
Approval
Rate limit
Progress
201. Automation Progress

Example:

Sending campaign...

124 / 500 completed
202. Pause Bulk Automation

Future:

[Pause]

The system should safely stop new actions while preserving completed actions.

203. Resume

Future:

[Resume]

Continue from the correct execution state.

204. Automation Rollback

Most actions cannot safely be rolled back.

Therefore the system should not promise:

Undo everything.

Instead, each action should declare whether compensation is possible.

205. Compensation

Future:

Add Points

could have:

Reverse Points

as a compensating action.

206. Side Effect Classification

Future action registry:

READ_ONLY
REVERSIBLE
IRREVERSIBLE
EXTERNAL
FINANCIAL

This helps determine approval requirements.

207. High-Risk Classification

Examples:

Refund Payment:
FINANCIAL + IRREVERSIBLE

Send Marketing Campaign:
EXTERNAL + MASS_ACTION

Read Customer:
READ_ONLY
208. AI Approval Policy

AI-generated automation should inspect action risk.

Example:

READ_ONLY:
May execute automatically.

LOW RISK:
May execute automatically if configured.

HIGH RISK:
Require approval.
209. Automation Explainability

Owner should be able to ask:

Why did this automation run?

Answer:

Order #123 was completed at 7:42 PM, which matched the trigger.

210. Why Did It Not Run?

Answer:

The automation triggered, but the condition "Order > ₹1,000" was false.

211. Automation Debugging

The execution page should show:

Trigger:
✓ Passed

Condition:
✗ Failed

Action:
Not executed
212. Condition Evaluation

Example:

Order total:
₹850

Required:
> ₹1,000

Result:
FALSE
213. Action Preview

Before activation, owner should see:

This automation will:

• Add 100 points
• Send a notification
214. Integration Health

If an automation requires WhatsApp:

WhatsApp:
✓ Connected

If disconnected:

WhatsApp:
✗ Not connected

[Connect]
215. Missing Configuration

Activation should be blocked if a required dependency is missing.

Example:

Cannot activate.

Missing:
WhatsApp connection.
216. Automation Dependency Graph

Future system may show:

Automation
   ↓
WhatsApp Integration
   ↓
Message Template
217. Dependency Changes

If an integration is disconnected:

3 automations depend on this integration.

This gives the owner visibility before failures occur.

218. Automation Conflict Detection

Future AI can detect:

Automation A:
Send 10% discount

Automation B:
Send ₹100 discount

and warn that customers may receive conflicting offers.

219. Duplicate Message Protection

If two automations send the same message for the same event, the platform may detect duplicates where possible.

220. Automation Governance

As FrontDesk grows, the automation engine should become a controlled platform layer rather than a collection of custom scripts.

221. Core Principle

Every automation should be:

Understandable
Predictable
Auditable
Permissioned
Recoverable
222. v0.1 P0 Requirements
AUTOMATION-P0-001
Business can create an automation.

AUTOMATION-P0-002
Business can edit an automation.

AUTOMATION-P0-003
Business can enable/disable an automation.

AUTOMATION-P0-004
Automation has a defined trigger.

AUTOMATION-P0-005
Automation supports basic conditions.

AUTOMATION-P0-006
Automation supports basic actions.

AUTOMATION-P0-007
Automation execution is recorded.

AUTOMATION-P0-008
Execution status is recorded.

AUTOMATION-P0-009
Execution failures are recorded.

AUTOMATION-P0-010
Automation belongs to a workspace/business.

AUTOMATION-P0-011
Workspace isolation is enforced.

AUTOMATION-P0-012
Automation management requires authorization.

AUTOMATION-P0-013
Basic execution history is visible.

AUTOMATION-P0-014
Duplicate event processing is protected.

AUTOMATION-P0-015
Important side effects use idempotency where required.

AUTOMATION-P0-016
Automation secrets are never exposed to clients.

AUTOMATION-P0-017
Automation cannot execute arbitrary code.

AUTOMATION-P0-018
Automation cannot bypass business permissions.

AUTOMATION-P0-019
Disabled automations do not start new executions.

AUTOMATION-P0-020
Automation errors do not corrupt source business data.
223. v0.1 P1 Requirements
AUTOMATION-P1-001
Visual workflow builder.

AUTOMATION-P1-002
Automation templates.

AUTOMATION-P1-003
Manual test execution.

AUTOMATION-P1-004
Execution detail view.

AUTOMATION-P1-005
Basic retries.

AUTOMATION-P1-006
Scheduled triggers.

AUTOMATION-P1-007
Basic delays.

AUTOMATION-P1-008
Approval steps.

AUTOMATION-P1-009
Basic dynamic variables.

AUTOMATION-P1-010
WhatsApp actions where integration is available.

AUTOMATION-P1-011
Automation health indicators.

AUTOMATION-P1-012
Failure notifications.

AUTOMATION-P1-013
Basic permissions.

AUTOMATION-P1-014
Automation versioning.
224. v0.1 P2 Requirements
AUTOMATION-P2-001
Natural-language automation builder.

AUTOMATION-P2-002
AI-generated workflows.

AUTOMATION-P2-003
Advanced branching.

AUTOMATION-P2-004
Parallel execution.

AUTOMATION-P2-005
External API actions.

AUTOMATION-P2-006
Webhook triggers.

AUTOMATION-P2-007
Action marketplace.

AUTOMATION-P2-008
Automation marketplace.

AUTOMATION-P2-009
Developer-created actions.

AUTOMATION-P2-010
Advanced analytics.

AUTOMATION-P2-011
Cost tracking.

AUTOMATION-P2-012
Bulk campaigns.

AUTOMATION-P2-013
Workflow import/export.

AUTOMATION-P2-014
Advanced AI optimization.

AUTOMATION-P2-015
Agent-driven workflows.
225. Acceptance Criteria

The Automations module is complete for the initial implementation when:

A business can create an automation.
A business can define a trigger.
A business can define basic conditions.
A business can define basic actions.
Automations can be enabled and disabled.
Automation executions are recorded.
Execution failures are recorded.
Owners can inspect execution history.
Automations cannot cross workspace boundaries.
Automation permissions are enforced.
External secrets are protected.
Duplicate events cannot cause uncontrolled duplicate side effects.
High-risk actions can be protected by approval.
Automation failure cannot corrupt the source business operation.
Automations cannot execute arbitrary code.
The architecture supports future AI-generated workflows.
The architecture supports future integrations and action extensions.
226. Example — New Enquiry
WHEN
New Enquiry

THEN
Create Lead

AND
Notify Owner

Result:

Customer Enquiry
      ↓
Automation
      ↓
Lead Created
      ↓
Owner Notified
227. Example — Completed Order
WHEN
Order Completed

THEN
Add Loyalty Points

AND
Send Thank You Message
228. Example — High Value Order
WHEN
Order Completed

IF
Order Total > ₹1,000

THEN
Add 100 Loyalty Points

AND
Notify Owner
229. Example — Booking
WHEN
Booking Created

THEN
Send Confirmation

Future:

WAIT
24 hours before booking

THEN
Send Reminder
230. Example — AI Generated Automation

Owner:

"Whenever someone submits an enquiry, create a lead and tell me."

FrontDesk:

TRIGGER:
New Enquiry

ACTION:
Create Lead

ACTION:
Notify Owner

Owner:

[Review]
[Activate]
231. Long-Term Vision

FrontDesk automation eventually becomes:

The business's operating rule engine.

It connects:

Business Data
     ↓
Events
     ↓
Rules
     ↓
Actions
     ↓
AI
     ↓
External Services
232. Long-Term Architecture
                        FRONTDESK
                            │
                    ┌───────┴───────┐
                    ↓               ↓
                BUSINESS DATA    AI AGENTS
                    │               │
                    └───────┬───────┘
                            ↓
                       ACTION REGISTRY
                            │
                            ↓
                     AUTOMATION ENGINE
                            │
             ┌──────────────┼──────────────┐
             ↓              ↓              ↓
         Customers       Orders        Bookings
             │              │              │
             └──────────────┼──────────────┘
                            ↓
                     EXTERNAL SERVICES
233. Final Principle

Automations should turn FrontDesk from a tool that stores business information into a system that actively runs repetitive business processes.

The owner should be able to say:

"When X happens, automatically do Y."

without needing:

a developer,
a programmer,
an automation specialist,
a complex workflow platform.

---

# P0 Implementation Status

**Last Updated:** 2026-08-29

## What Is Implemented (P0)

The following P0 automation engine features are implemented and verified:

### Schema (Prisma)
- `Automation` — business-scoped automation definition with trigger/condition/action JSON configs
- `AutomationStep` — ordered steps within an automation
- `AutomationRun` — execution record with status, event reference, context, and error
- `DomainEvent` — business events that trigger automations
- `EventDelivery` — tracks consumer delivery status per event
- `ActionDefinition` — registered actions with approval flags
- `ActionExecution` — records each action execution with input/output
- `ApprovalRequest` — approval workflow for high-risk actions
- `AuditLog` — audit trail for all automation operations

### Backend Engine (`backend/src/modules/automations/`)
- **engine.ts** — Core automation processing: trigger matching, condition evaluation, config validation, action execution via Action Registry
- **dispatcher.ts** — Event dispatch: matches domain events to active automations, manual trigger support
- **hook.ts** — `emitAndDispatch()` helper for routes to create domain events and dispatch to automations
- **automations.routes.ts** — REST API: CRUD, enable/disable, manual trigger, run history, supported triggers list

### Triggers (P0)
Supported trigger events:
- `ENQUIRY_CREATED`
- `ORDER_CREATED`, `ORDER_COMPLETED`, `ORDER_CONFIRMED`, `ORDER_CANCELLED`
- `PAYMENT_CREATED`, `PAYMENT_PAID`
- `BOOKING_CREATED`, `BOOKING_COMPLETED`, `BOOKING_CANCELLED`
- `INSIGHT_CREATED`
- `PRODUCT_CREATED`, `PRODUCT_UPDATED`
- `MEMORY_CREATED`

### Conditions (P0)
Simple deterministic conditions with operators:
- `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `contains`
- All conditions must pass (AND logic)
- No arbitrary code execution

### Actions (P0)
Safe actions (no approval required):
- `CREATE_PRODUCT` — creates a product in the business catalog
- `CREATE_OFFER` — creates an offer in the business catalog

Approval-required actions:
- `UPDATE_PRODUCT` — requires human approval before execution
- `DELETE_PRODUCT` — requires human approval before execution

### Security
- Config validation rejects: `exec`, `eval`, `Function`, `require`, `shell`, `system`, `__proto__`, `fetch`, `http`
- Automation config is data, not executable code
- No arbitrary JavaScript/SQL/shell execution
- Tenant isolation enforced on all operations

### Frontend (`/dashboard/automations`)
- Automation list with status badges
- Create automation form (name, description, trigger, condition, action)
- Enable/disable toggle
- Manual trigger button
- Run history expand/collapse
- Empty, loading, and error states

### Tests
- **Backend:** 23 tests covering CRUD, triggers, conditions, idempotency, approval, audit, tenant isolation, security, run status
- **Playwright:** API-based E2E tests + UI navigation tests for create flow

## What Is NOT Implemented (Future)

- Visual workflow editor
- Branching/conditional logic (if/else)
- Delay/wait steps
- Scheduled/cron triggers
- External notification providers (WhatsApp, email, push)
- Multi-step action chains with branching
- Automation templates
- Automation analytics/attribution
- AI-generated automations
- Full approval workflow UI
- Retry/backoff logic
- Rate limiting per automation