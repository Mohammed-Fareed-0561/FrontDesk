# FrontDesk — Automation Engine Specification

**Product:** FrontDesk  
**Version:** v0.1  
**Module:** Automation Engine  
**Document:** Feature Specification  
**Status:** Draft — For Review  
**Last Updated:** 2026-08-26

---

# 1. Purpose

The FrontDesk Automation Engine allows business owners to automate repetitive business processes without coding.

The goal is:

> If something happens, FrontDesk can automatically do something useful about it.

Examples:

```text
New enquiry
↓
Create lead
↓
Notify owner
↓
Send acknowledgement

Or:

Order completed
↓
Wait 2 days
↓
Ask for review

Or:

Customer inactive for 60 days
↓
Create win-back offer
↓
Request owner approval
↓
Send message
2. Product Vision

FrontDesk should provide:

n8n-like automation capabilities designed specifically for small businesses.

The user should not need to understand:

APIs
Webhooks
JSON
Programming
Servers
Cron jobs
Databases

Instead, they should see:

WHEN this happens
↓
IF this condition is true
↓
DO this
↓
AND then do this
3. Core Principle

Automations are deterministic workflows.

AI may help create or optimize them, but the actual workflow must remain understandable and controllable.

4. Automation Architecture
Event / Trigger
       ↓
Automation Engine
       ↓
Conditions
       ↓
Action Registry
       ↓
Action Execution
       ↓
Result
       ↓
Next Step
5. Relationship With Action Registry

Automations must use the Action Registry.

Automation
    ↓
CREATE_ORDER
    ↓
Action Registry
    ↓
Order Service

The Automation Engine must never bypass:

permissions,
validation,
business policies,
approval rules,
audit logging.
6. Automation Components

Every automation consists of:

Trigger
Conditions
Actions
Branches
Delays
Schedule
Error Handling
Execution Policy
7. Basic Automation Example
WHEN
New enquiry is received

THEN
Create lead

AND
Notify owner
8. More Advanced Example
WHEN
New enquiry is received

IF
Lead source = Instagram

THEN
Create lead

AND
Assign to sales staff

AND
Send acknowledgement

WAIT
30 minutes

IF
Lead is still unanswered

THEN
Notify owner
9. Automation Trigger

A trigger starts an automation.

Possible trigger types:

EVENT
SCHEDULE
MANUAL
WEBHOOK
CONDITION
10. Event Trigger

An automation starts when a FrontDesk event occurs.

Examples:

ORDER_CREATED
ORDER_COMPLETED
BOOKING_CREATED
BOOKING_COMPLETED
LEAD_CREATED
ENQUIRY_RECEIVED
PRODUCT_UPDATED
PRODUCT_OUT_OF_STOCK
CUSTOMER_CREATED
CUSTOMER_BECAME_INACTIVE
REVIEW_RECEIVED
PAYMENT_COMPLETED
11. Schedule Trigger

An automation runs at a configured time.

Examples:

Every day at 9 AM
Every Monday
Every first day of the month
Every Friday at 6 PM
12. Manual Trigger

The owner can manually execute an automation.

Example:

Run Win-Back Campaign
13. Webhook Trigger

Future integrations may trigger automations through authenticated webhooks.

Example:

External POS
↓
Webhook
↓
FrontDesk
↓
Automation

Webhook support should be carefully authenticated.

14. Condition Trigger

Future automations may periodically evaluate a business condition.

Example:

WHEN
Customer has not ordered for 60 days
15. Trigger Payload

Every event trigger provides structured data.

Example:

{
  "event": "ORDER_CREATED",
  "order_id": "ORD_123",
  "business_id": "BUS_123"
}

The automation should retrieve additional information through authorized services when necessary.

16. Automation Conditions

Conditions determine whether an automation continues.

Example:

IF
order.total > 1000
17. Condition Types

Possible conditions:

EQUALS
NOT_EQUALS
GREATER_THAN
LESS_THAN
GREATER_THAN_OR_EQUAL
LESS_THAN_OR_EQUAL
CONTAINS
NOT_CONTAINS
IS_EMPTY
IS_NOT_EMPTY
IN
NOT_IN
18. Logical Operators

Conditions may be combined using:

AND
OR
NOT

Example:

IF

order.total > ₹1000

AND

customer.is_new = true
19. Condition Groups

Complex conditions can be grouped.

Example:

(
  order.total > 1000
  AND
  customer.is_new = true
)

OR

customer.is_vip = true
20. Action Step

An action step invokes an Action Registry action.

Example:

CREATE_LEAD
21. Multiple Actions

An automation can execute multiple actions sequentially.

CREATE_LEAD
↓
ASSIGN_LEAD
↓
SEND_MESSAGE
22. Parallel Actions

Future workflows may execute independent actions in parallel.

Example:

ORDER_COMPLETED
       ↓
 ┌─────┴─────┐
 ↓           ↓
Send SMS   Update CRM
23. Sequential vs Parallel

Use sequential execution when:

Action B depends on Action A

Use parallel execution when:

Actions are independent
24. Delay Step

Automations can wait before continuing.

Examples:

WAIT 10 minutes
WAIT 2 hours
WAIT 2 days
WAIT until Friday 9 AM
25. Example Delay
ORDER_COMPLETED
↓
WAIT 2 days
↓
SEND_REVIEW_REQUEST
26. Scheduled Website Change

Example:

FRIDAY 6 PM
↓
ACTIVATE_WEEKEND_OFFER

Then:

SUNDAY 11 PM
↓
DEACTIVATE_WEEKEND_OFFER
27. Timezone

Automations must use the business's configured timezone.

Default for Indian businesses may be:

Asia/Kolkata

but timezone should be stored explicitly.

28. Daylight Saving

The scheduling engine should use timezone-aware timestamps rather than hard-coded UTC offsets.

29. Branching

Automations can branch based on conditions.

Example:

NEW_LEAD
   ↓
IF source = Instagram
   ├── YES → Assign Instagram Team
   └── NO  → Assign General Team
30. IF / ELSE

The visual builder should support:

IF
condition

THEN
...

ELSE
...
31. Switch Branch

Future:

SWITCH
lead.source

Instagram
Google
WhatsApp
Website
Other
32. Looping

Loops should be introduced carefully.

Example:

For each selected customer
↓
Send approved message
33. Loop Safety

Every loop must have:

maximum iterations,
execution limits,
rate limits,
failure handling.
34. Avoid Infinite Loops

Example:

PRODUCT_UPDATED
↓
UPDATE_PRODUCT
↓
PRODUCT_UPDATED
↓
UPDATE_PRODUCT

The engine must detect or prevent recursive loops where appropriate.

35. Automation Recursion

An automation should not unintentionally trigger itself forever.

Possible protections:

Execution depth
Correlation ID
Trigger origin
Recursion limit
36. Automation Variables

Automations may reference values from previous steps.

Example:

Customer Name
Order Total
Product Name
Lead Source
Booking Date
37. Variable Example

Trigger:

ORDER_CREATED

Data:

customer.name
order.total
order.id

Then message:

Hi {{customer.name}},
your order #{{order.id}} is confirmed.
38. Variable Scope

Variables may come from:

Trigger
Previous Action
Business Context
Automation Configuration
39. Variable Security

Sensitive values should not be exposed to steps that do not require them.

40. Missing Variables

If a required variable is missing:

Execution
↓
Validation Error

The automation should not silently insert fake values.

41. Automation Templates

FrontDesk should provide ready-made templates.

Examples:

New Enquiry Follow-up
Order Confirmation
Booking Reminder
Review Request
Win-Back Customer
Low Stock Alert
Birthday Offer
Lead Assignment
42. Bakery Templates
New Cake Enquiry
↓
Create Lead
↓
Notify Owner
43. Restaurant Templates
Order Completed
↓
Wait 2 Days
↓
Request Review
44. Salon Templates
Booking Created
↓
Wait Until 24 Hours Before
↓
Send Reminder
45. Freelancer Templates
New Lead
↓
Create Task
↓
Notify Freelancer
↓
Wait 24 Hours
↓
Follow Up
46. Furniture Business Templates
Quotation Sent
↓
Wait 3 Days
↓
Check Lead Status
↓
If No Response
↓
Create Follow-up Task
47. Hotel Templates
Booking Created
↓
Send Confirmation
↓
24 Hours Before Check-in
↓
Send Reminder
48. Automation Builder

The main UI should be visual.

Example:

┌───────────────────────────┐
│ WHEN                      │
│ New enquiry received      │
└─────────────┬─────────────┘
              ↓
┌───────────────────────────┐
│ IF                        │
│ Source = Instagram        │
└─────────────┬─────────────┘
              ↓
┌───────────────────────────┐
│ CREATE LEAD               │
└─────────────┬─────────────┘
              ↓
┌───────────────────────────┐
│ SEND MESSAGE              │
└───────────────────────────┘
49. No-Code Requirement

A business owner should be able to build basic automations without technical knowledge.

50. Natural Language Automation Builder

AI should allow:

"Whenever someone sends an enquiry, create a lead and notify me."

FrontDesk converts it into:

WHEN:
ENQUIRY_RECEIVED

THEN:
CREATE_LEAD

AND:
NOTIFY_OWNER
51. AI Automation Generation

AI may generate a workflow from natural language.

But the owner must see the resulting workflow before activation.

52. AI Workflow Preview

Example:

You asked me to follow up with customers who haven't ordered in 60 days.

AI shows:

1. Find customers inactive for 60 days
2. Exclude customers who opted out
3. Create campaign
4. Request approval
5. Send message
53. AI Must Not Silently Activate

Generated workflows should initially be:

DRAFT

The owner explicitly activates them.

54. Automation Status

Possible statuses:

DRAFT
ACTIVE
PAUSED
DISABLED
ARCHIVED
55. Draft

The automation is being configured.

No automatic execution.

56. Active

The automation can execute.

57. Paused

The automation is temporarily disabled.

58. Disabled

The automation cannot run until manually enabled.

59. Archived

The automation is retained for history but no longer active.

60. Automation Versioning

Every meaningful workflow change creates a version.

Example:

Win-Back v1
Win-Back v2
Win-Back v3
61. Version History

Owner can:

Preview
Compare
Restore
62. Automation Activation

Before activation:

Validate
↓
Preview
↓
Check permissions
↓
Check integrations
↓
Check missing variables
↓
Activate
63. Validation Before Activation

The system should identify:

Missing action
Missing integration
Invalid condition
Missing variable
Permission issue
Invalid schedule
64. Example Validation
Cannot activate automation.

Reason:

SEND_WHATSAPP_MESSAGE requires
WhatsApp integration.

Connect WhatsApp first.
65. Automation Execution

Every run creates an execution record.

Conceptually:

Automation
    ↓
Execution
    ├── Trigger
    ├── Steps
    ├── Conditions
    ├── Actions
    ├── Results
    └── Final Status
66. Execution Status
QUEUED
RUNNING
WAITING
WAITING_FOR_APPROVAL
COMPLETED
FAILED
CANCELLED
67. Execution History

Owner should see:

Automation:
Review Request

Runs:
127

Successful:
119

Failed:
5

Waiting:
3
68. Execution Details

Example:

10:00 AM
Trigger:
ORDER_COMPLETED

10:00 AM
Condition:
Order > ₹500
✓

10:00 AM
Wait:
2 days

10:00 AM
SEND_MESSAGE
✓

Status:
COMPLETED
69. Failed Execution

Example:

Automation failed.

Step:
SEND_WHATSAPP_MESSAGE

Reason:
WhatsApp integration unavailable.
70. Retry

Failed steps may be retried where safe.

71. Retry Policy

Possible policies:

NO_RETRY
RETRY_ONCE
RETRY_3_TIMES
EXPONENTIAL_BACKOFF
72. Non-Retryable Errors

Do not retry errors such as:

PERMISSION_DENIED
INVALID_INPUT
BUSINESS_RULE_VIOLATION
RESOURCE_NOT_FOUND
73. Retryable Errors

Examples:

TEMPORARY_NETWORK_ERROR
RATE_LIMITED
SERVICE_UNAVAILABLE
TIMEOUT

where safe.

74. Idempotency

Automation actions must use the Action Registry's idempotency mechanism.

This prevents duplicate side effects.

75. Example

An automation tries:

CREATE_ORDER

The network times out.

The engine retries.

The Action Registry recognizes the same idempotency key and avoids creating a duplicate order.

76. Approval Step

Automations may pause for human approval.

Example:

Customer inactive
↓
AI creates offer
↓
WAIT FOR APPROVAL
↓
SEND_MESSAGE
77. Approval Timeout

Approval requests can expire.

Example:

Approval valid for:
24 hours
78. Approval Expiry Behavior

Possible:

CANCEL
PAUSE
SKIP_STEP
NOTIFY_OWNER
79. Human Approval

The owner should see:

Automation:
Win-Back Campaign

Action:
Send campaign

Audience:
83 customers

[Approve]
[Reject]
80. Automation Permissions

Automations also require permissions.

Example:

Automation:
Customer Follow-up

Permissions:
customers.read
messages.send
81. Automation Ownership

Every automation belongs to a business/workspace.

82. Automation Creator

Record:

Created By
Created At
Updated By
Updated At
83. AI-Created Automation

Record:

Created By:
AI Copilot

Approved By:
Business Owner
84. Automation Audit

Record:

Who created it
Who changed it
Who activated it
Who paused it
Who approved actions
85. Automation Change Timeline

Example:

Aug 26 10:00
Created by Owner

Aug 26 10:05
AI suggested condition

Aug 26 10:10
Owner approved

Aug 26 10:12
Activated

Aug 27 09:00
First execution
86. Scheduled Automations

Examples:

Daily at 9 AM
Weekly Monday
Monthly
Specific date
Custom recurring schedule
87. One-Time Schedule

Example:

December 1, 2026 at 9 AM
88. Recurring Schedule

Example:

Every Friday at 6 PM
89. Business Calendar

Future automation scheduling can consider:

Business Holidays
Festival Days
Opening Hours
Special Events
90. Event-Based Scheduling

Example:

Booking created
↓
Wait until 24 hours before booking
↓
Send reminder
91. Relative Delay

Example:

ORDER_COMPLETED
↓
WAIT 2 DAYS
↓
SEND_REVIEW_REQUEST
92. Cancellation

Automations should support cancellation where appropriate.

Example:

Booking cancelled
↓
Cancel pending reminder
93. Automation Deduplication

The same event should not accidentally create duplicate executions.

94. Event ID

Events should contain unique IDs.

Example:

event_id:
EVT_123

The automation engine can use this for deduplication.

95. Correlation ID

All related operations should use a correlation ID.

Example:

Order
↓
Automation
↓
Message
↓
Review Request

can be traced together.

96. Automation Loop Prevention

Track:

automation_id
execution_id
trigger_event
correlation_id

to identify recursive workflows.

97. Maximum Workflow Depth

Future workflows should have a maximum execution depth.

98. Maximum Steps

Each automation should have a configurable/system-defined maximum number of steps.

99. Maximum Runtime

Long workflows should be asynchronous.

100. Cost Limits

Future businesses may configure:

Maximum automation executions/month
Maximum messaging cost
Maximum AI cost
101. AI Steps

Future automations may contain AI steps.

Example:

ORDER_COMPLETED
↓
AI generates personalized review request
↓
SEND_MESSAGE
102. AI Step Principle

AI steps should not automatically gain unrestricted permissions.

They must still use:

Action Registry

for state-changing operations.

103. AI Decision Step

Future:

AI DECIDE

Question:
Should this customer receive a win-back offer?

The result should be structured.

Example:

{
  "eligible": true,
  "reason": "Customer inactive for 75 days"
}
104. AI Output Validation

AI-generated workflow values must be validated before being used in consequential actions.

105. AI Hallucination Protection

Never allow AI to directly invent:

Customer IDs
Product IDs
Prices
Payment amounts
Booking availability

Use verified system data.

106. Automation + Business Memory

Automations may read Business Memory.

Example:

Business Memory:
Never discount premium cakes.

Therefore:

AI Offer Generator
↓
Checks Business Memory
↓
Does not create discount for premium cakes
107. Automation + Business Knowledge

Automations can reference:

Products
Services
Opening Hours
Policies
Business Information

through controlled queries.

108. Automation + Customer Data

Automations may use customer information only according to:

permissions,
privacy rules,
consent,
business policies.
109. Marketing Consent

Before sending marketing messages:

Check customer communication consent.
110. Transactional vs Marketing Messages

The system should distinguish:

TRANSACTIONAL
MARKETING

Example:

Order confirmation
=
Transactional

while:

Weekend discount
=
Marketing
111. Marketing Opt-Out

If a customer has opted out:

Marketing automation
↓
Exclude customer
112. Automation Audience

Future automations may define audiences.

Example:

Customers:
Last order > 60 days
AND
Marketing consent = true
AND
Total spend > ₹1000
113. Audience Preview

Before launching a campaign:

Audience:
83 customers

Excluded:
14 customers

Reason:
Marketing opt-out
114. Bulk Communication Safety

Mass messaging should generally require:

consent checks,
rate limits,
approval,
preview,
audit.
115. Automation Templates Marketplace

Future users may install automation templates.

Examples:

Review Request
Win-Back
Booking Reminder
Lead Follow-Up
Birthday Offer
116. Template Safety

Templates must declare:

Required permissions
Required integrations
Actions used
Data accessed
117. Template Installation
Choose Template
↓
Review
↓
Connect Integrations
↓
Configure
↓
Test
↓
Activate
118. Automation Testing

Before activation:

TEST RUN

should be available.

119. Dry Run

A dry run should show:

Trigger:
Example order

Condition:
✓ Passed

Action:
Would send message

No real message will be sent.
120. Test Data

Use simulated data where possible.

121. Production Protection

Test mode must not accidentally execute real side effects.

122. Automation Preview

The visual editor should show:

Trigger
↓
Conditions
↓
Actions
↓
Delays
↓
Branches
123. Automation Builder UX

The editor should support:

Drag
Drop
Connect
Configure
Preview
Test
Activate
124. No-Code Blocks

Possible blocks:

WHEN
IF
ELSE
WAIT
ACTION
NOTIFY
APPROVAL
AI
END
125. Trigger Block
WHEN
Order is completed
126. Condition Block
IF
Order total > ₹1000
127. Action Block
DO
Create loyalty points
128. Wait Block
WAIT
2 days
129. Approval Block
WAIT FOR APPROVAL
130. AI Block

Future:

ASK AI
Classify customer intent
131. End Block
END
132. Automation Naming

Owners should give automations human-readable names.

Example:

"Ask for reviews after completed orders"

not:

AUTO_1738
133. Automation Description

Each automation should optionally have a description.

134. Automation Tags

Future:

Marketing
Orders
Bookings
CRM
Reviews
135. Search

Owners should be able to search automations.

136. Filter

Filter by:

Status
Category
Created By
Last Run
Success Rate
137. Automation Dashboard

Example:

AUTOMATIONS

Active:
12

Paused:
3

Failed recently:
2

Executions today:
482
138. Automation Health

Each automation can show:

Healthy
Needs Attention
Failing
Paused
139. Failure Alert

If an important automation repeatedly fails:

⚠️ Your "Booking Reminder" automation has failed 7 times.

WhatsApp connection appears unavailable.

140. Automation Monitoring

Future monitoring can include:

Execution count
Success rate
Failure rate
Average duration
Last successful run
Last failure
141. Automation Logs

Each execution should have detailed step-level logs.

142. Step Log

Example:

STEP 1
Trigger received ✓

STEP 2
Condition passed ✓

STEP 3
Create lead ✓

STEP 4
Send message ✗

Reason:
Integration unavailable
143. Resume After Failure

For long workflows, future executions may resume from a failed/waiting step instead of restarting everything.

144. Human Intervention

Owner may manually continue an execution after fixing an issue.

145. Automation Cancellation

Owner can cancel an active execution where supported.

146. Pending Executions

Dashboard:

Waiting for approval:
3

Waiting for scheduled time:
18

Running:
2
147. Automation Event Bus

Long-term architecture:

Domain Service
↓
Event Bus
↓
Automation Engine
148. Event Example
ORDER_COMPLETED

may trigger:

Review Request
Loyalty Points
Customer Analytics
149. Event Consumers

Multiple automations may listen to the same event.

150. Event Isolation

One failed automation should not stop unrelated automations.

151. Event Ordering

Where ordering matters, the event system should preserve required ordering guarantees.

152. Duplicate Events

The automation engine must handle duplicate event delivery safely.

153. Automation Security

Never allow automation definitions to contain executable arbitrary code in v0.1.

154. No Arbitrary Code

Do not provide a JavaScript/Python execution block in the initial no-code automation engine.

This reduces security risk significantly.

155. Future Code Step

If a code/action extension system is introduced later, it must be sandboxed.

156. External Webhooks

Future webhook actions may allow:

POST
GET

to approved endpoints.

These require:

authentication,
timeout,
rate limits,
secret protection,
response validation.
157. Webhook Security

Do not allow arbitrary internal network access.

158. Integration Failure

If an external service fails:

Automation
↓
Retry if safe
↓
If failed
↓
Record
↓
Notify owner
159. Automation Notification

The owner may receive:

Automation failed

through supported channels.

160. Notification Preferences

Business owners should control:

Email
Dashboard
Push
WhatsApp

where available.

161. Automation Permissions Example
Automation:
Review Request

Permissions:

orders.read
customers.read
messages.send
162. Automation Cannot Escalate Permissions

An automation cannot grant itself:

payments.refund

or another permission.

163. Action Registry Integration

Every state-changing step:

ACTION

must resolve to a registered Action.

164. Query Integration

Read steps should use authorized query/domain services.

165. Automation Architecture
                         EVENT / SCHEDULE
                               │
                               ↓
                       AUTOMATION ENGINE
                               │
                 ┌─────────────┼─────────────┐
                 ↓             ↓             ↓
             Condition       Delay        Branch
                 │             │             │
                 └─────────────┼─────────────┘
                               ↓
                         ACTION REGISTRY
                               │
                 ┌─────────────┼─────────────┐
                 ↓             ↓             ↓
             Domain        Integration      Events
             Services        Services         │
                 │             │              ↓
                 ↓             ↓        Other Automations
              Database      External
166. Automation Data Model

Likely entities:

automations
automation_versions
automation_triggers
automation_steps
automation_conditions
automation_executions
automation_execution_steps
automation_schedules
automation_approvals
automation_templates

Exact database schema belongs in:

DATABASE-SCHEMA.md

167. Automation Execution Model

Conceptually:

Automation
├── Trigger
├── Version
├── Execution
│   ├── Step
│   ├── Step
│   └── Step
└── Result
168. Automation API

Future API:

GET    /automations
POST   /automations
GET    /automations/:id
PATCH  /automations/:id
DELETE /automations/:id

POST   /automations/:id/test
POST   /automations/:id/activate
POST   /automations/:id/pause

GET    /automations/:id/executions
GET    /automation-executions/:id
POST   /automation-executions/:id/cancel

Exact contracts belong in API.md.

169. Automation Events API

Future internal/event interfaces:

EVENT:
ORDER_CREATED

EVENT:
BOOKING_CREATED

EVENT:
LEAD_CREATED
170. v0.1 P0 Requirements
AUTO-P0-001
Automation data model exists.

AUTO-P0-002
Automation belongs to a business.

AUTO-P0-003
Automation supports event triggers.

AUTO-P0-004
Automation supports schedule triggers.

AUTO-P0-005
Automation supports manual execution.

AUTO-P0-006
Automation supports conditions.

AUTO-P0-007
Automation supports actions.

AUTO-P0-008
Actions execute through Action Registry.

AUTO-P0-009
Automation permissions are enforced.

AUTO-P0-010
Automation executions are logged.

AUTO-P0-011
Automation failures are recorded.

AUTO-P0-012
Automation versions are tracked.

AUTO-P0-013
Automation can be activated/paused.

AUTO-P0-014
Automation supports idempotency.

AUTO-P0-015
Automation supports basic retries.

AUTO-P0-016
Automation prevents unintended recursion.

AUTO-P0-017
Automation execution is tenant-isolated.

AUTO-P0-018
Automation cannot execute arbitrary code.

AUTO-P0-019
Marketing automations respect communication consent.

AUTO-P0-020
Automation actions are auditable.
171. v0.1 P1 Requirements
AUTO-P1-001
Visual automation builder.

AUTO-P1-002
Drag-and-drop workflow blocks.

AUTO-P1-003
IF / ELSE branches.

AUTO-P1-004
WAIT blocks.

AUTO-P1-005
Approval blocks.

AUTO-P1-006
Automation templates.

AUTO-P1-007
Dry-run testing.

AUTO-P1-008
Execution detail UI.

AUTO-P1-009
Automation health monitoring.

AUTO-P1-010
AI-assisted workflow generation.

AUTO-P1-011
Natural-language automation creation.

AUTO-P1-012
Basic AI decision steps.

AUTO-P1-013
Automation failure notifications.

AUTO-P1-014
Workflow version restore.
172. v0.1 P2 Requirements
AUTO-P2-001
Advanced branching.

AUTO-P2-002
Parallel execution.

AUTO-P2-003
Advanced loops.

AUTO-P2-004
Webhook triggers.

AUTO-P2-005
External webhook actions.

AUTO-P2-006
Advanced AI workflow generation.

AUTO-P2-007
Workflow marketplace.

AUTO-P2-008
Third-party workflow extensions.

AUTO-P2-009
Advanced analytics.

AUTO-P2-010
Cross-business agency automation management.
173. Example — Review Automation
WHEN
Order Completed

WAIT
2 days

IF
Customer has not opted out of marketing/communication
AND
Customer has not already received review request

THEN
SEND_MESSAGE
174. Example — New Enquiry
WHEN
ENQUIRY_RECEIVED

THEN
CREATE_LEAD

AND
NOTIFY_OWNER

WAIT
30 minutes

IF
Enquiry still unanswered

THEN
NOTIFY_OWNER
175. Example — Win-Back
WHEN
Customer becomes inactive for 60 days

IF
Marketing consent = true

THEN
Create campaign draft

WAIT FOR APPROVAL

THEN
SEND_MESSAGE
176. Example — Low Stock
WHEN
PRODUCT_AVAILABILITY_CHANGED

IF
Stock <= configured threshold

THEN
NOTIFY_OWNER
177. Example — Weekend Offer
SCHEDULE
Friday 6 PM

THEN
Activate Weekend Offer

SCHEDULE
Sunday 11 PM

THEN
Deactivate Weekend Offer
178. Example — Booking Reminder
WHEN
Booking Created

WAIT
Until 24 hours before booking

THEN
SEND_MESSAGE
179. Example — AI-Generated Automation

Owner:

"Whenever someone asks about a product and doesn't buy, remind me after one day."

AI proposes:

WHEN:
Product enquiry received

IF:
No order created for that enquiry

WAIT:
1 day

THEN:
Create follow-up task for owner

The owner reviews and activates it.

180. Automation Safety Principle

An automation should never be more powerful than the actions it is allowed to execute.

181. Automation UX Principle

The owner should always understand:

WHEN
→ IF
→ THEN
→ WAIT
→ THEN

without reading technical implementation details.

182. Automation Transparency

Before activation, show:

What triggers it?
What data does it read?
What actions does it perform?
Who can be affected?
Which integrations are used?
Does it require approval?
183. Automation Reliability Principle

A failed automation must fail visibly, safely, and recoverably.

It should never silently fail.

184. Automation AI Principle

AI can:

Suggest
Generate
Explain
Optimize

But the actual execution remains governed by:

Permissions
Policies
Action Registry
Approvals
185. Final Architecture Principle

FrontDesk should combine:

AI
+
Automation
+
Business Data
+
Action Registry
+
Human Approval

rather than treating AI as an unrestricted automation engine.

186. Long-Term Vision

The long-term FrontDesk automation system becomes:

                 BUSINESS EVENT
                       ↓
                 AUTOMATION ENGINE
                       ↓
              ┌────────┴────────┐
              ↓                 ↓
          Conditions           AI
              ↓                 ↓
              └────────┬────────┘
                       ↓
                 ACTION REGISTRY
                       ↓
                APPROVAL / POLICY
                       ↓
                  REAL ACTION
                       ↓
                     EVENT
                       ↓
               NEXT AUTOMATION

This creates a business operating loop.

187. Final Principle

FrontDesk Automations turn business events into controlled business actions without requiring the owner to understand technology.