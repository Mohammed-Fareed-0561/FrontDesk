Next is ENQUIRY-AND-INBOX.md.

This is a major document because it defines the first real operational loop of FrontDesk:

Customer discovers business → sends enquiry → FrontDesk captures it → owner/staff receives it → conversation happens → enquiry gets resolved.

It also becomes the foundation for the future WhatsApp-first unified inbox, AI receptionist, lead management, and AI customer agent.

Create:

FrontDesk/
└── documentation/
    └── 02-product/
        └── FEATURE-SPECIFICATIONS/
            └── ENQUIRY-AND-INBOX.md
ENQUIRY-AND-INBOX.md
# FrontDesk — Enquiry & Inbox Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Enquiry & Inbox
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Enquiry & Inbox module allows a business to receive, organize, respond to, and track customer enquiries.

The module creates the operational bridge between:

    Public Business Presence
            ↓
        Customer
            ↓
        Enquiry
            ↓
        Inbox
            ↓
        Staff / Owner
            ↓
        Response
            ↓
        Resolution
            ↓
        Customer Relationship

The v0.1 implementation should remain simple while establishing the architecture for:

- WhatsApp conversations,
- unified inbox,
- AI receptionist,
- AI customer agent,
- lead management,
- automated follow-ups,
- enquiry assignment,
- conversation history.

---

# 2. Core Principle

FrontDesk should not merely notify a business that a customer contacted them.

It should help the business:

    Receive
      ↓
    Understand
      ↓
    Respond
      ↓
    Track
      ↓
    Resolve

The inbox is therefore an operational workspace, not just a list of messages.

---

# 3. v0.1 Scope

The first release should support:

- website enquiry forms,
- enquiry creation,
- customer association,
- enquiry inbox,
- enquiry status,
- unread/read state,
- basic enquiry details,
- assignment to authorized workspace users,
- internal notes,
- basic response capability where supported,
- enquiry timestamps,
- activity history.

Future:

- unified WhatsApp inbox,
- email inbox,
- AI receptionist,
- AI agent,
- automated follow-ups,
- advanced lead pipeline,
- omnichannel conversations.

---

# 4. Enquiry Definition

An enquiry represents a customer request or business-related interaction that requires attention.

Examples:

    "Do you deliver to Tambaram?"

    "How much is the wedding cake?"

    "Can I book a haircut tomorrow?"

    "Do you make custom furniture?"

    "I want to know about your catering service."

---

# 5. Enquiry vs Conversation

These concepts should remain separate.

### Enquiry

The business request/problem/opportunity.

### Conversation

The communication exchanged between customer and business.

Example:

    Enquiry
       ↓
    Conversation
       ├── Customer message
       ├── Business response
       ├── Customer reply
       └── Business response

An enquiry may contain one or multiple communication messages.

---

# 6. Enquiry vs Lead

An enquiry is not automatically a qualified sales lead.

Example:

    "What time do you close?"

is an enquiry.

A lead may be:

    "I need 500 wedding invitations.
     Please send me a quotation."

Future lead qualification can be built on top of enquiries.

---

# 7. Enquiry Sources

Potential sources:

    WEBSITE
    QR
    WHATSAPP
    EMAIL
    PHONE
    SOCIAL
    MANUAL
    API
    AI_AGENT

v0.1 primary source:

    WEBSITE

Future:

    WHATSAPP

---

# 8. Website Enquiry Flow

Basic v0.1 flow:

    Customer
       ↓
    Public Website
       ↓
    Contact / Enquiry Form
       ↓
    Submit
       ↓
    Backend
       ↓
    Create Enquiry
       ↓
    Associate Customer
       ↓
    Inbox
       ↓
    Owner/Staff Notification

---

# 9. Enquiry Form

A basic enquiry form may contain:

    Name
    Phone
    Email
    Message

Additional optional fields:

    Product
    Service
    Preferred Date
    Preferred Time

Only collect fields needed for the business workflow.

---

# 10. Minimum Enquiry

An enquiry should not require excessive information.

Example:

    Name:
    Arun

    Message:
    "Do you deliver cakes?"

This should be sufficient to create a basic enquiry.

---

# 11. Customer Association

When an enquiry is created:

    Enquiry
       ↓
    Customer

If a matching customer exists, associate the enquiry.

If not, create a new customer relationship where appropriate.

---

# 12. Duplicate Customer Protection

The enquiry system should not create a new customer for every enquiry.

Example:

    Arun
    +91XXXXXXXXXX

submits another enquiry.

FrontDesk should attempt to associate it with the existing customer relationship.

---

# 13. Enquiry ID

Every enquiry must have a unique identifier.

Example:

    enquiry_123

A human-friendly display ID may also be used:

    ENQ-00123

The internal ID and display ID should remain separate concepts.

---

# 14. Enquiry Object

Conceptually:

    Enquiry
    ├── ID
    ├── Workspace ID
    ├── Business ID
    ├── Customer ID
    ├── Source
    ├── Subject
    ├── Message
    ├── Status
    ├── Priority
    ├── Assigned User
    ├── Created At
    └── Updated At

Exact database schema belongs to database documentation.

---

# 15. Enquiry Status

v0.1 should support:

    NEW
    IN_PROGRESS
    RESOLVED
    CLOSED

Future:

    QUALIFIED
    QUOTATION_SENT
    WAITING_FOR_CUSTOMER
    WON
    LOST

Do not turn v0.1 into a full CRM pipeline.

---

# 16. New

Meaning:

    Customer enquiry has been received
    but has not yet been handled.

Example:

    NEW

---

# 17. In Progress

Meaning:

    Business is actively handling the enquiry.

Example:

    IN_PROGRESS

---

# 18. Resolved

Meaning:

    The business has addressed the customer's request.

Example:

    RESOLVED

---

# 19. Closed

Meaning:

    The enquiry is no longer active.

Example:

    CLOSED

---

# 20. Status Transition

Expected basic flow:

    NEW
      ↓
    IN_PROGRESS
      ↓
    RESOLVED
      ↓
    CLOSED

However, reopening should be possible.

Example:

    CLOSED
      ↓
    NEW

if the customer sends a new message or the business reopens the enquiry.

---

# 21. Status Rules

The system should prevent invalid transitions where appropriate.

For example, a deleted/nonexistent enquiry cannot become:

    IN_PROGRESS

Validation belongs to the backend.

---

# 22. Inbox

The Inbox is the main operational screen for enquiries.

Recommended structure:

    Inbox

    ┌───────────────────────────────────────┐
    │ Search enquiries...                   │
    │                                       │
    │ All   New   In Progress   Resolved   │
    └───────────────────────────────────────┘

    ┌───────────────────────────────────────┐
    │ Arun Kumar                            │
    │ Do you deliver birthday cakes?        │
    │ 2 min ago                         NEW │
    └───────────────────────────────────────┘

---

# 23. Inbox List

Each item should show enough information to identify the enquiry.

Example:

    Arun Kumar
    "Do you deliver birthday cakes?"
    2 min ago
    NEW

Avoid displaying excessive customer data in the list.

---

# 24. Unread Enquiries

Unread items should be visually distinguishable.

Example:

    🔵 Arun Kumar
       New enquiry

The exact visual treatment belongs in UI/UX documentation.

---

# 25. Read State

An enquiry may have:

    UNREAD
    READ

Read state is separate from enquiry status.

Example:

    Status:
    NEW

    Read:
    YES

The owner may have read a new enquiry without responding yet.

---

# 26. Enquiry Priority

Future:

    LOW
    NORMAL
    HIGH
    URGENT

v0.1 may default to:

    NORMAL

---

# 27. AI Priority

Future AI may suggest:

> This enquiry may require urgent attention.

Example:

    Customer wants a wedding catering quotation
    for tomorrow.

AI can recommend:

    HIGH

but should not silently change priority unless explicitly permitted.

---

# 28. Inbox Filters

v0.1:

    All
    New
    In Progress
    Resolved

Future:

    Assigned to me
    Unassigned
    High Priority
    WhatsApp
    Website
    Waiting for customer

---

# 29. Search

Users should be able to search enquiries.

Possible searchable information:

    Customer Name
    Message
    Subject
    Enquiry ID

Search must respect permissions.

---

# 30. Enquiry Detail View

When an owner opens an enquiry:

    Enquiry #ENQ-00123

    Customer
    Arun Kumar
    +91XXXXXXXXXX

    Message

    "Do you deliver birthday cakes?"

    Status
    NEW

    Assigned to
    Unassigned

    Created
    9:42 AM

---

# 31. Enquiry Actions

Possible v0.1 actions:

    Mark as read
    Change status
    Assign
    Add note
    Reply
    Close

Only supported actions should appear.

---

# 32. Assignment

Enquiries can eventually be assigned to:

    Owner
    Admin
    Manager
    Staff

Example:

    Assigned to:
    Priya

---

# 33. Unassigned Enquiries

New enquiries may initially be:

    Unassigned

The inbox should make these visible.

Example:

    4 unassigned enquiries

---

# 34. Assignment Notifications

When assigned:

    Priya has been assigned a new enquiry.

This integrates with the Notifications module.

---

# 35. Reassignment

Future:

    Priya
       ↓
    Reassign
       ↓
    Arun

The system should record the change in activity history.

---

# 36. Assignment Permissions

Not every staff member should be allowed to assign enquiries.

Example permission:

    enquiry.assign

The exact permission model belongs to access-control documentation.

---

# 37. Internal Notes

Staff may add private notes.

Example:

    "Customer asked for a custom 3-tier cake."

Internal notes are:

    PRIVATE

and must never be sent to customers automatically.

---

# 38. Note Attribution

Every internal note should record:

    Who added it
    When it was added

Example:

    Priya
    Aug 26, 10:32 AM

    "Customer needs delivery before 5 PM."

---

# 39. Customer Messages

A customer message belongs to a conversation.

Example:

    Customer:
    "Do you deliver to Tambaram?"

---

# 40. Business Replies

Future response:

    Business:
    "Yes, we deliver within Tambaram."

The response should be associated with the enquiry/conversation.

---

# 41. Conversation Timeline

Enquiry detail may eventually show:

    10:02 AM
    Customer:
    Do you deliver to Tambaram?

    10:04 AM
    Business:
    Yes, we do.

    10:05 AM
    Customer:
    What is the delivery charge?

---

# 42. Response Channels

Future:

    WEBSITE
    WHATSAPP
    EMAIL
    SMS

v0.1 may only support a basic website-origin enquiry and response mechanism if implemented.

---

# 43. Unified Inbox

Long-term:

    FrontDesk Inbox

    ├── Website
    ├── WhatsApp
    ├── Email
    ├── Social
    └── AI Agent

All conversations should appear in one operational workspace.

---

# 44. Channel Indicator

Future inbox items may show:

    🌐 Website
    💬 WhatsApp
    ✉ Email

This helps staff understand where the customer came from.

---

# 45. Conversation Thread

Each enquiry should eventually have one coherent thread.

Example:

    Customer
       ↓
    Enquiry
       ↓
    Conversation
       ↓
    Messages

This avoids scattering customer communication across unrelated records.

---

# 46. Customer Reply

If a customer replies:

    Existing Conversation
          ↓
    New Message
          ↓
    Inbox Updated
          ↓
    Notification

The system should not automatically create a duplicate enquiry unless business rules require it.

---

# 47. Reopening

If a resolved enquiry receives a relevant customer reply:

    RESOLVED
       ↓
    NEW / IN_PROGRESS

The exact transition can depend on the communication source.

---

# 48. Enquiry Thread Title

Titles should be understandable.

Examples:

    Birthday Cake Enquiry
    Catering Enquiry
    Haircut Booking Question

If no subject exists:

    Customer Enquiry

---

# 49. Automatic Subject Generation

Future AI may generate:

    "Birthday cake delivery enquiry"

based on the customer message.

AI-generated subjects must remain editable.

---

# 50. AI Enquiry Summaries

Future:

    AI Summary

    Customer wants a 2 kg chocolate cake
    for Saturday delivery.

This should be derived from actual conversation content.

---

# 51. AI Suggested Reply

Future:

    Suggested Reply

    "Yes, we deliver within Tambaram.
     Delivery charges start from ₹50."

The AI must only use verified business information.

---

# 52. AI Hallucination Protection

AI must not invent:

    Prices
    Availability
    Delivery areas
    Policies
    Booking times

If the Business Knowledge Base does not contain the information:

    "I don't have enough information to answer this."

or:

    "Please confirm with the business."

---

# 53. AI Customer Agent

Future:

    Customer
       ↓
    AI Agent
       ↓
    Business Knowledge Base
       ↓
    Answer

If the request requires an action:

    AI
       ↓
    Action
       ↓
    Permission
       ↓
    Execute

---

# 54. AI Human Handoff

If AI cannot safely answer:

    AI:
    "I'll connect you with our team."

↓

    Human Handoff

↓

    Staff Notification

---

# 55. Human Handoff Notification

Example:

    Customer needs human assistance.

    Reason:
    Custom wedding cake quotation

    [Open Conversation]

---

# 56. AI Confidence

Future AI may internally classify:

    HIGH CONFIDENCE
    MEDIUM CONFIDENCE
    LOW CONFIDENCE

Low-confidence situations should favor:

    Ask clarification
    or
    Human handoff

rather than guessing.

---

# 57. Business Knowledge Base Integration

The AI enquiry system should retrieve:

    Products
    Services
    Prices
    Opening Hours
    Policies
    FAQs
    Locations
    Availability

from the Business Knowledge Base.

---

# 58. Business Memory Integration

AI communication should also respect Business Memory.

Example:

    Business Memory:
    "Always communicate in Tamil + English."

AI reply:

    "ஆம், delivery available.
     Yes, we deliver within Tambaram."

---

# 59. Enquiry Automation

Future automation example:

    WHEN
    New enquiry created

    THEN
    Notify owner

    AND
    Create customer

    AND
    Assign to staff

---

# 60. Follow-Up Automation

Future:

    WHEN
    Enquiry remains unanswered for 2 hours

    THEN
    Notify owner

Potentially:

    "You have an unanswered enquiry."

---

# 61. Customer Follow-Up

Future:

    WHEN
    Customer hasn't responded for 2 days

    THEN
    Suggest follow-up

This should preferably require business configuration or approval before automated customer messaging.

---

# 62. Enquiry SLA

Future businesses may define response targets.

Example:

    Target response:
    Within 30 minutes

Dashboard:

    Response SLA:
    92%

Not required in v0.1.

---

# 63. Response Time

Future analytics:

    Average first response time

Example:

    12 minutes

This is useful for measuring operational performance.

---

# 64. Resolution Time

Future:

    Average enquiry resolution time

Example:

    4 hours 12 minutes

---

# 65. Enquiry Analytics

Future:

    Total enquiries
    New enquiries
    Resolved enquiries
    Unanswered enquiries
    Average response time
    Conversion rate

Only implement metrics once definitions are centralized.

---

# 66. Enquiry Conversion

Future:

    Enquiry
       ↓
    Order

or:

    Enquiry
       ↓
    Booking

This allows:

    Enquiry-to-order conversion

---

# 67. Lead Qualification

Future:

    New Enquiry
       ↓
    Qualification
       ↓
    Lead

Possible information:

    Intent
    Budget
    Quantity
    Timeline

This belongs to future CRM/lead management.

---

# 68. Enquiry Tags

Future:

    Catering
    Birthday
    Wedding
    Custom Order
    Delivery

Tags help filtering and automation.

---

# 69. AI Tagging

Future AI can suggest:

    Tags:
    Wedding
    Catering
    High Value

Owner can approve/edit.

AI should not silently create misleading tags.

---

# 70. Enquiry Priority Rules

Future businesses can define:

    IF
    Customer requests wedding catering

    THEN
    Priority = HIGH

---

# 71. Inbox Views

Future:

    All
    Assigned to Me
    Unassigned
    Waiting
    High Priority
    Resolved

---

# 72. Saved Views

Future users can save:

    "My Unanswered Enquiries"

    "High Priority Leads"

    "Today's Enquiries"

This is not required for v0.1.

---

# 73. Bulk Actions

Future:

    Select 10 enquiries

    Mark as read
    Assign
    Change status
    Archive

Bulk actions should have confirmation for destructive operations.

---

# 74. Archive

Future:

    Archive enquiry

Archiving should not necessarily delete the underlying data.

---

# 75. Delete

Deleting enquiries should be restricted.

Because enquiries may be linked to:

    Customer
    Conversation
    Order
    Analytics
    Audit Logs

---

# 76. Data Retention

Enquiry retention policies should be defined in privacy/data documentation.

Do not assume unlimited storage.

---

# 77. Spam Protection

Public enquiry forms may receive spam.

Future protections:

    Rate limiting
    CAPTCHA / bot protection
    Abuse detection
    Duplicate detection

---

# 78. Spam Classification

Future AI/system:

    Possible spam enquiry

Owner can:

    Mark as spam

---

# 79. Spam Isolation

Spam enquiries should not pollute:

    Customer CRM
    Analytics
    AI recommendations

where appropriate.

---

# 80. Form Security

Public enquiry forms must protect against:

    Automated spam
    Malicious input
    Injection attempts
    Excessive requests

The exact security architecture belongs in security documentation.

---

# 81. Input Validation

Backend must validate:

    Name
    Email
    Phone
    Message
    IDs
    Uploaded content if supported

Never trust client-side validation alone.

---

# 82. Message Length

The system should define reasonable limits for:

    Subject
    Message
    Notes

This protects storage and prevents abuse.

---

# 83. Attachments

Future enquiries may allow attachments.

Examples:

    Customer sends:
    Product reference image

    Customer sends:
    Room measurement

This is not required for basic v0.1.

---

# 84. Attachment Security

Future attachments require:

    File type validation
    Size limits
    Malware scanning where appropriate
    Access control
    Secure storage

---

# 85. Enquiry Notifications

New enquiry should create:

    In-App Notification

Example:

    New enquiry received

    Arun asked:
    "Do you deliver birthday cakes?"

    [View Enquiry]

---

# 86. Notification Integration

The Enquiry module should publish an event:

    ENQUIRY_CREATED

The Notifications system handles notification delivery.

Do not duplicate notification logic inside the enquiry module.

---

# 87. Event-Driven Architecture

Conceptually:

    Customer submits enquiry
           ↓
    ENQUIRY_CREATED
           ↓
    +-------------------+
    |                   |
    Notification      CRM
    |                   |
    Owner alert       Customer
                        |
                        ↓
                    Activity
88. Enquiry Event Types

Future:

ENQUIRY_CREATED
ENQUIRY_ASSIGNED
ENQUIRY_UPDATED
ENQUIRY_REPLIED
ENQUIRY_RESOLVED
ENQUIRY_REOPENED
ENQUIRY_CLOSED
ENQUIRY_ARCHIVED
89. Event Attribution

Events should record:

Actor

Possible:

CUSTOMER
OWNER
STAFF
AI
AUTOMATION
SYSTEM
90. Example Audit
10:20 AM
Customer created enquiry

10:22 AM
Owner assigned enquiry to Priya

10:25 AM
Priya replied

10:30 AM
Enquiry marked resolved
91. Enquiry Audit Log

Future:

Activity

Enquiry created
Assigned to Priya
Status changed
Message sent
Status resolved

This supports accountability.

92. Internal vs External Messages

Critical distinction:

External

Customer can see it.

Internal

Only authorized workspace users can see it.

Example:

"Customer wants delivery before 5 PM."

may be internal.

93. Internal Notes Must Never Leak

Internal notes must never accidentally appear in:

Customer messages
Website
WhatsApp
Email
AI customer responses
94. Staff Collaboration

Future:

Priya:
"I will handle this."

Manager:
"Customer needs quotation."

This can happen through internal notes.

95. @Mentions

Future:

@Priya please follow up.

This can generate an internal notification.

96. Enquiry Assignment Rules

Future:

IF
enquiry.category = "salon"

THEN
assign to Salon Manager
97. Round-Robin Assignment

Future:

New enquiry
    ↓
Staff A
    ↓
Staff B
    ↓
Staff C

This should only be used if the business wants automated assignment.

98. Working Hours

Future assignment/notifications may consider staff availability.

Example:

Staff is offline

↓

Assign to another available staff member.

Not part of v0.1.

99. AI Copilot Integration

Future AI Business Copilot:

Good morning 👋

You have:
6 unanswered enquiries
2 high-priority enquiries
1 enquiry waiting for 2 days

[Review Inbox]
100. AI Opportunity Detection

Future:

"14 customers asked about wedding catering this month."

AI:

"You may want to create a dedicated catering package."
101. AI Suggested Actions

Possible:

Reply
Assign
Create quote
Create product
Create offer
Schedule follow-up

All actions must respect permissions and approval rules.

102. AI Approval

If AI wants to send a customer message:

AI wants to send:

"We offer wedding catering from ₹25,000."

[Review]
[Approve]
[Reject]

The price must come from verified business data.

103. Quote Integration

Future:

Enquiry
   ↓
Generate Quote
   ↓
Send Customer

This connects with the future Quote/Invoice module.

104. Booking Integration

Future:

Customer:
"Can I book tomorrow at 5 PM?"

AI / Staff
   ↓
Availability
   ↓
Booking

The enquiry may then be marked:

RESOLVED

or linked to the booking.

105. Order Integration

Future:

Customer:
"I want one chocolate cake."

Enquiry
   ↓
Order

The enquiry should remain historically linked to the order.

106. Customer CRM Integration

The enquiry module should create/update customer activity.

Enquiry
   ↓
Customer Timeline

Example:

Aug 26
New enquiry
107. Search Integration

Enquiries should be searchable through:

Search & Discovery

using permitted fields.

108. Notification Integration

New/assigned/replied enquiries should trigger appropriate notifications.

The notification engine owns delivery.

109. Analytics Integration

Enquiry events should eventually feed:

Business Analytics

Examples:

enquiries_received
enquiries_resolved
response_time
110. Business Memory Integration

Business Memory may contain rules such as:

"Always mention delivery charges."

The AI response layer should use these rules.

111. Public Website Integration

Website components may include:

Contact Us
Ask a Question
Request a Quote
Book a Service

All can eventually create enquiries.

112. Enquiry Form Customization

Future businesses may customize:

Fields
Labels
Required fields
Success message

Example:

"Request a Quote"

instead of:

"Send Enquiry"
113. Industry-Specific Forms

Future:

Restaurant
Order enquiry
Salon
Booking enquiry
Furniture
Custom quote request
Freelancer
Project enquiry
Hotel
Room enquiry

The underlying enquiry model should remain reusable.

114. Form Templates

Future Business Kits may provide:

Restaurant Enquiry Form
Salon Booking Form
Freelancer Project Form
Furniture Quote Form
115. Enquiry Confirmation

After submission:

Thank you!

Your enquiry has been sent to
Royal Bakes.

The business can customize this message later.

116. Customer Confirmation

Future:

Your enquiry has been received.

Reference:
ENQ-00123

This can be sent through configured channels.

117. Enquiry Reference

A customer-facing reference may help support:

ENQ-00123

This should not expose internal IDs.

118. Enquiry Status Visibility

Future customer portal:

Your enquiry:
In Progress

Do not expose internal staff notes or internal workflow details.

119. Customer Follow-Up

Future customer can ask:

"Any update on my enquiry?"

The system can identify the relevant enquiry if identity/context is sufficiently established.

120. Multiple Enquiries

One customer may have:

Enquiry #101
Cake

Enquiry #104
Catering

These should remain separate unless the business intentionally merges them.

121. Related Enquiries

Future:

Related Enquiries

can connect similar requests.

Example:

Wedding Catering
Wedding Cake

But this should not automatically merge unrelated records.

122. Enquiry Merge

Future feature:

Merge Enquiries

This must preserve message/activity history.

Not part of v0.1.

123. Enquiry Labels

Future:

Urgent
Catering
Birthday
Custom
Delivery

Labels can support filtering and automation.

124. Enquiry SLA Monitoring

Future:

Unanswered for:
2h 14m

SLA:
30 min

⚠️ At risk
125. Business Health Integration

Future AI:

"Your response time increased from
18 minutes to 46 minutes this week."

This becomes a Business Health signal.

126. Inbox Dashboard Metrics

Future:

New:
12

Unanswered:
6

In Progress:
4

Resolved:
18
127. v0.1 Dashboard Metric

One simple metric may be sufficient:

New / Unread Enquiries

This avoids overwhelming the initial dashboard.

128. Mobile Experience

Because many local business owners operate primarily from phones, the inbox should be mobile-friendly.

The PWA/web application should support:

Open enquiry
Read message
Reply
Assign
Change status

without requiring desktop.

129. PWA Notifications

Future browser push notifications can alert owners about:

New enquiry

where permission is granted.

130. Offline Behavior

v0.1 does not need full offline inbox operation.

However, previously loaded information should fail gracefully if connectivity is lost.

131. Error Handling

If reply submission fails:

Message could not be sent.

[Retry]

The message should not appear as successfully sent unless the backend confirms it.

132. Duplicate Reply Protection

If the user clicks:

Send

multiple times, the system should avoid creating duplicate messages where possible.

Use idempotency for important communication actions.

133. Rate Limiting

Public enquiry submission must be rate-limited.

Otherwise an attacker could create:

10,000 enquiries

for a business.

134. Abuse Protection

Future:

Spam detection
CAPTCHA
IP/device controls
Rate limiting
Abuse monitoring
135. Public Form Security

Customer input should be treated as untrusted.

The backend must validate and sanitize input.

136. Attachment Security

If attachments are added later:

Validate type
Validate size
Store securely
Restrict access
137. Communication Provider Abstraction

The enquiry system should not be tightly coupled to one communication provider.

Conceptually:

Enquiry
   ↓
Conversation
   ↓
Communication Service
   ↓
Channel
138. Future WhatsApp Flow
Customer
   ↓
WhatsApp
   ↓
WhatsApp Provider
   ↓
FrontDesk
   ↓
Conversation
   ↓
Inbox
139. Future Unified Inbox

The long-term inbox becomes:

FrontDesk Inbox

┌─────────────────────────────┐
│ All                         │
│                             │
│ 🌐 Website                  │
│ 💬 WhatsApp                │
│ ✉ Email                    │
│ 🤖 AI                      │
└─────────────────────────────┘
140. Future AI Agent Flow
Customer
   ↓
WhatsApp
   ↓
FrontDesk
   ↓
AI Agent
   ↓
Business Knowledge
   ↓
Answer

If action required:

AI
   ↓
Permission
   ↓
Action
   ↓
Confirmation
141. AI Agent Restrictions

The AI should not be allowed to:

Change prices
Issue refunds
Delete data
Cancel important bookings
Send mass campaigns

without appropriate permissions/approval.

142. AI Action Logging

Future:

AI answered customer

AI checked menu

AI created booking

Owner approved quotation

Every significant AI action should be auditable.

143. Business Safety Mode

Future:

AI wants to perform 3 actions.

1. Create booking
2. Send customer message
3. Apply discount

[Review All]

This connects with the AI Approval Inbox.

144. v0.1 P0 Requirements
ENQUIRY-P0-001
Customer can submit a website enquiry.

ENQUIRY-P0-002
Backend creates an enquiry record.

ENQUIRY-P0-003
Enquiry has a unique ID.

ENQUIRY-P0-004
Enquiry belongs to the correct business/workspace.

ENQUIRY-P0-005
Enquiry can be associated with a customer.

ENQUIRY-P0-006
Owner can view enquiries in an inbox.

ENQUIRY-P0-007
Owner can open enquiry details.

ENQUIRY-P0-008
Enquiry supports basic status.

ENQUIRY-P0-009
Enquiry supports read/unread state.

ENQUIRY-P0-010
Authorized users can assign enquiries.

ENQUIRY-P0-011
Authorized users can add internal notes.

ENQUIRY-P0-012
New enquiries trigger an in-app notification.

ENQUIRY-P0-013
Enquiry data is isolated between workspaces.

ENQUIRY-P0-014
Public forms are protected by backend validation.

ENQUIRY-P0-015
Public enquiry submission is rate-limited.
145. v0.1 P1 Requirements
ENQUIRY-P1-001
Basic response capability.

ENQUIRY-P1-002
Conversation timeline.

ENQUIRY-P1-003
Assignment notifications.

ENQUIRY-P1-004
Enquiry search.

ENQUIRY-P1-005
Enquiry filters.

ENQUIRY-P1-006
Enquiry activity history.

ENQUIRY-P1-007
Customer activity integration.

ENQUIRY-P1-008
Basic enquiry analytics.

ENQUIRY-P1-009
Spam reporting.

ENQUIRY-P1-010
Mobile-optimized inbox.

---

# 146. v0.1 P2 Requirements

```text
ENQUIRY-P2-001
WhatsApp inbox.

ENQUIRY-P2-002
Unified multi-channel inbox.

ENQUIRY-P2-003
AI customer agent.

ENQUIRY-P2-004
AI suggested replies.

ENQUIRY-P2-005
AI summaries.

ENQUIRY-P2-006
Human handoff.

ENQUIRY-P2-007
Automated follow-ups.

ENQUIRY-P2-008
Lead qualification.

ENQUIRY-P2-009
Quotation integration.

ENQUIRY-P2-010
Booking integration.

ENQUIRY-P2-011
Order integration.

ENQUIRY-P2-012
SLA monitoring.

ENQUIRY-P2-013
Advanced analytics.

ENQUIRY-P2-014
AI enquiry classification.

ENQUIRY-P2-015
AI opportunity detection.
147. Acceptance Criteria

The Enquiry & Inbox module is complete for v0.1 when:

A customer can submit an enquiry from a published business website.
The backend validates the submission.
FrontDesk creates a unique enquiry.
The enquiry belongs to the correct business/workspace.
A customer profile can be created or associated.
The owner can see the enquiry in the inbox.
The owner can open the enquiry.
The owner can mark it read.
The owner can change its status.
Authorized users can assign it.
Authorized users can add internal notes.
Internal notes are never exposed to customers.
A new enquiry generates an in-app notification.
Search can locate authorized enquiries.
Public enquiry submission is protected against basic abuse.
The architecture supports future conversations.
The architecture supports future WhatsApp integration.
The architecture supports future AI customer agents.
148. Example End-to-End Scenario
Scenario: Bakery Enquiry

Customer visits:

Royal Bakes

↓

Clicks:

Contact Us

↓

Submits:

Name:
Arun Kumar

Phone:
+91XXXXXXXXXX

Message:
"Do you deliver a 2 kg chocolate cake
 to Tambaram on Saturday?"

↓

FrontDesk:

Creates/identifies customer

↓

Creates:

ENQ-00123

↓

Status:

NEW

↓

Owner receives:

New enquiry received

↓

Owner opens inbox.

↓

Owner assigns:

Priya

↓

Priya receives:

You have been assigned a new enquiry.

↓

Priya opens the conversation.

↓

Future:

Replies through WhatsApp.

↓

Customer responds.

↓

Conversation continues.

↓

Business resolves enquiry.

↓

Status:

RESOLVED

↓

Customer timeline:

Enquiry created
↓
Conversation
↓
Resolved

---

# 149. Future Operational Loop

The long-term FrontDesk loop becomes:

    Customer
       ↓
    Discovery
       ↓
    Website / QR / WhatsApp
       ↓
    Enquiry
       ↓
    Inbox
       ↓
    AI / Staff
       ↓
    Response
       ↓
    Quote / Booking / Order
       ↓
    Customer
       ↓
    Review
       ↓
    Retention

This is the beginning of the FrontDesk Business OS operational layer.

---

# 150. Final Architecture Principle

The Enquiry system should remain independent from:

- notification delivery,
- customer profiles,
- communication providers,
- AI agents,
- automations,
- orders,
- bookings.

They should connect through well-defined relationships/events.

Conceptually:

    Enquiry
       |
       +---- Customer
       |
       +---- Conversation
       |
       +---- Notification
       |
       +---- Assignment
       |
       +---- Future Order
       |
       +---- Future Booking
       |
       +---- Future AI Agent

---

# 151. Final Principle

> **An enquiry is the bridge between a business being discovered and a business actually doing business.**

FrontDesk should make that bridge:

**Fast → Organized → Trackable → Actionable → Eventually Automated.**

---

# 152. Document Status

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
- Communication documentation
- Orders documentation
- Booking documentation
- Quote/Invoice documentation
- Automation documentation
- AI Business Copilot documentation
- AI Agent documentation
- Security documentation
- Privacy documentation
- API documentation
- Database schema documentation
- MEMORY.md