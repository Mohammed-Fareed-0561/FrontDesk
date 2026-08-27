Next is WHATSAPP-ENQUIRY.md.

This is an important v0.1 document because WhatsApp is not just a contact button in FrontDesk. It is part of the initial product wedge:

Import → Structure → Publish → QR → WhatsApp

Create:

FrontDesk/
└── documentation/
    └── 02-product/
        └── FEATURE-SPECIFICATIONS/
            ├── BUSINESS-IMPORTER.md
            ├── BUSINESS-KNOWLEDGE-BASE.md
            ├── WEBSITE-BUILDER.md
            ├── QR-AND-PUBLIC-PRESENCE.md
            └── WHATSAPP-ENQUIRY.md
WHATSAPP-ENQUIRY.md
# FrontDesk — WhatsApp Enquiry Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** WhatsApp Enquiry
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The WhatsApp Enquiry module allows customers to contact a business directly from its FrontDesk public presence.

The goal is to reduce the distance between:

Customer sees something
        ↓
Customer wants to know more
        ↓
Customer contacts business

FrontDesk should make this:

Customer sees product
        ↓
[Enquire on WhatsApp]
        ↓
WhatsApp
        ↓
Business

---

# 2. Core Principle

> FrontDesk should help businesses receive customer enquiries without forcing the customer to create an account or learn a new system.

For v0.1, WhatsApp should remain the primary communication channel.

---

# 3. Why WhatsApp

The initial target businesses are local businesses such as:

- cafés,
- restaurants,
- bakeries,
- boutiques,
- salons,
- furniture shops,
- freelancers,
- service providers,
- home businesses.

These businesses often already communicate with customers through WhatsApp.

Therefore FrontDesk should connect the digital catalog to the business's existing communication behavior instead of forcing a completely new workflow.

---

# 4. v0.1 Scope

The v0.1 WhatsApp module should support:

- business WhatsApp number,
- general enquiry button,
- product enquiry button,
- pre-filled WhatsApp messages,
- contextual product information,
- mobile deep linking,
- basic enquiry click analytics.

It should NOT attempt to become a complete WhatsApp CRM in v0.1.

---

# 5. v0.1 User Flow

```text
Customer
   ↓
FrontDesk Website
   ↓
Views Product
   ↓
Clicks "Enquire"
   ↓
FrontDesk generates message
   ↓
WhatsApp opens
   ↓
Customer sends message
   ↓
Business receives enquiry
6. General Enquiry

The website may provide:

[Chat on WhatsApp]

Example generated message:

Hi, I found your business on FrontDesk and would like to know more.

The exact wording should be configurable later.

7. Product Enquiry

A product card can contain:

[Enquire on WhatsApp]

Example:

Customer is viewing:

Chocolate Truffle Cake
₹650

Customer clicks:

[Enquire]

WhatsApp opens with:

Hi Royal Bakes,
I'd like to enquire about the Chocolate Truffle Cake.
8. Why Contextual Messages Matter

Compare:

Generic

Hi, I want to know about your products.

with:

Contextual

Hi Royal Bakes, I'd like to enquire about the Chocolate Truffle Cake.

The second message gives the business immediate context.

This reduces unnecessary back-and-forth.

9. Message Generation

The message can be generated from approved business data.

Potential fields:

Business Name
Product Name
Product Category
Price
Selected Variant

Only information appropriate for customer communication should be included.

10. Price in Message

Price should not automatically be included if:

price is unknown,
price is hidden by the business,
pricing is dynamic,
the business explicitly disables it.

Example:

Hi Royal Bakes,
I'd like to enquire about the Chocolate Truffle Cake.

instead of:

Chocolate Truffle Cake — ₹650

when price display is not appropriate.

11. Product Availability

If the product is unavailable:

The system should not encourage an enquiry that implies it is currently available unless the business has configured that behavior.

Example:

Currently unavailable

Potential action:

[Ask When Available]

Future feature.

12. WhatsApp Number Source

The destination WhatsApp number must come from:

Business Knowledge Base
        ↓
Approved Public Contact

The frontend must not arbitrarily decide the destination number.

13. Number Validation

The system should validate the configured number before generating the WhatsApp destination.

Invalid or missing numbers should prevent the WhatsApp CTA from appearing.

14. Country Code

Phone numbers should be stored in a standardized format.

For example:

+91XXXXXXXXXX

The application should avoid storing multiple inconsistent versions such as:

XXXXXXXXXX
91XXXXXXXXXX
+91XXXXXXXXXX

as separate representations of the same contact.

15. WhatsApp Link

For v0.1, FrontDesk can use a WhatsApp click/deep-link mechanism rather than requiring a full WhatsApp API integration.

Conceptually:

FrontDesk
   ↓
WhatsApp Link
   ↓
WhatsApp

The exact implementation belongs in the API/integration documentation.

16. Mobile Behavior

On mobile devices:

Customer clicks WhatsApp
        ↓
WhatsApp App / Supported WhatsApp Experience

The user should not be forced to copy and paste the message manually.

17. Desktop Behavior

On desktop:

Customer clicks WhatsApp
        ↓
Supported WhatsApp Web/Desktop experience

The exact behavior depends on the platform/browser.

18. Customer Authentication

The customer should NOT need a FrontDesk account.

Required flow:

Scan QR
 ↓
Browse
 ↓
Enquire
 ↓
WhatsApp

No FrontDesk signup.

19. Customer Data

For v0.1, FrontDesk does not need to capture:

customer name,
customer phone number,
customer email,
customer account.

The customer communicates directly with the business through WhatsApp.

20. Privacy Principle

FrontDesk should not unnecessarily collect customer information just because an enquiry occurs.

A WhatsApp click does not automatically mean FrontDesk should create a customer profile.

21. Enquiry Analytics

FrontDesk can track that a customer clicked:

WHATSAPP_CLICK

It should not claim that:

WhatsApp message was actually sent

unless the integration can reliably confirm that event.

22. Important Analytics Distinction

These are different events:

WhatsApp CTA Clicked
        ≠
WhatsApp Opened
        ≠
Message Sent
        ≠
Conversation Started
        ≠
Sale Completed

v0.1 should primarily track the first event.

23. Product Enquiry Event

Example:

Event:
WHATSAPP_CLICK

Properties:
business_id
product_id
source_page
device_type
timestamp

Only collect fields necessary for analytics.

24. General WhatsApp Event

Example:

Event:
WHATSAPP_CLICK

Properties:
business_id
source:
general_contact
timestamp
25. Source Tracking

Future:

Source:
product_card
hero
footer
sticky_button
qr

This allows businesses to understand where customers initiate enquiries.

26. Product-Level Analytics

Future dashboard:

WhatsApp Enquiries

Chocolate Cake       42
Red Velvet Cake      31
Black Forest Cake    17
Brownie              11

This can help identify customer interest.

27. Important Limitation

A WhatsApp click is not necessarily an enquiry.

Therefore FrontDesk should label the metric accurately.

Use:

WhatsApp Clicks

rather than:

Confirmed Enquiries

unless actual message delivery/conversation data is available.

28. Business Dashboard

v0.1 may display:

Customer Activity

Today

Website Views       142
Product Views        68
WhatsApp Clicks      17
Call Clicks           6
Directions            4

This gives the business a simple activity overview.

29. Product Context

The system should preserve the product identity at the moment of the click.

Example:

Product:
Chocolate Truffle Cake
Product ID:
product_123

This allows analytics to associate the click with the product.

30. Message Template

The initial template can be:

Hi {business_name},
I'd like to enquire about {product_name}.

Example:

Hi Royal Bakes,
I'd like to enquire about Chocolate Truffle Cake.
31. Future Message Variables

Future templates may support:

{business_name}
{product_name}
{category}
{price}
{variant}
{customer_question}
{business_location}

Only valid variables should be available.

32. Business Customization

Future:

Business owner can configure:

Message style:
Professional

Language:
English
Tamil
Tamil + English

Example:

வணக்கம் Royal Bakes,
Chocolate Truffle Cake பற்றி enquire செய்ய விரும்புகிறேன்.

This should be a future feature rather than a v0.1 requirement.

33. AI Message Generation

Future AI may generate contextual messages.

Example:

Customer:

"I want to ask if the cake can be made eggless."

FrontDesk could prepare:

Hi Royal Bakes,
I'd like to know whether the Chocolate Truffle Cake
can be prepared eggless.

This is future functionality.

34. AI Must Not Invent

AI-generated messages must not claim:

Eggless available
Delivery available
Discount available
Stock available

unless the relevant business information supports it.

35. WhatsApp CTA Placement

Possible locations:

Hero
Product Card
Product Details
Contact Section
Footer
Sticky Mobile CTA

The template determines the default placement.

36. CTA Priority

For food businesses:

Primary:

View Menu

Secondary:

WhatsApp

For service businesses:

Primary:

Book / Enquire

Secondary:

WhatsApp

The CTA system should eventually adapt to business type.

37. Sticky WhatsApp Button

Future mobile experience:

┌───────────────────────────┐
│                           │
│      Website              │
│                           │
│                           │
├───────────────────────────┤
│   [WhatsApp] [Directions] │
└───────────────────────────┘

This should be tested carefully to avoid obstructing content.

38. Product Enquiry Button Rules

The button should only appear when:

Business WhatsApp

is configured.

If no WhatsApp number exists:

[Enquire]

should not silently fail.

Alternative actions may be:

Call
Email
Contact

depending on available business information.

39. Missing WhatsApp Number

Owner dashboard should show:

WhatsApp isn't connected yet.

CTA:

[Add WhatsApp Number]
40. Invalid WhatsApp Number

The owner should receive:

We couldn't validate this WhatsApp number.

Provide:

[Fix Number]

The public site should not display a broken WhatsApp action.

41. WhatsApp Number Change

If the owner changes the number:

Old Number
     ↓
New Approved Number
     ↓
All WhatsApp CTAs

should use the new number.

The owner should not need to manually edit every page.

42. WhatsApp and Business Knowledge Base

The flow is:

Business Knowledge Base
        ↓
Approved WhatsApp Contact
        ↓
Website CTA
        ↓
Generated Message

The website must not store a duplicate WhatsApp number independently.

43. WhatsApp and Website Builder

The Website Builder controls:

CTA appearance
CTA location
CTA label

The Business Knowledge Base controls:

WhatsApp number

The message-generation layer controls:

Message content

These responsibilities should remain separate.

44. WhatsApp and QR

The QR flow is:

QR
 ↓
Public Website
 ↓
Product
 ↓
WhatsApp

The QR itself does not need to contain WhatsApp information.

45. WhatsApp and Public URL

If the business URL changes internally, the WhatsApp destination remains based on the business's approved contact information.

These systems should not be tightly coupled.

46. Business Ownership

Only authorized business members should be able to:

add WhatsApp number,
change WhatsApp number,
remove WhatsApp number,
configure public CTA behavior.
47. Staff Permissions

Future roles may include:

Owner
Manager
Staff
Designer
Marketing

For v0.1, a simple owner/business-member permission model is sufficient.

48. Security

The frontend must not trust:

business_id
whatsapp_number
product_id

from arbitrary user input when performing privileged business operations.

The backend must validate business ownership and data relationships.

49. Abuse Prevention

Future WhatsApp-related features must consider:

spam,
excessive automated messages,
malicious message generation,
fake business information.

v0.1 does not automate message sending from FrontDesk, which reduces this risk.

50. No Automatic Customer Messaging in v0.1

FrontDesk should NOT automatically send WhatsApp messages to customers in v0.1.

Instead:

Customer clicks
 ↓
WhatsApp opens
 ↓
Customer decides to send

This keeps the first version simple and avoids unnecessary messaging automation complexity.

51. No WhatsApp Inbox in v0.1

Do not build:

WhatsApp Inbox
Conversation Management
Message Search
Auto Reply
Agent
Conversation Assignment

in the first release.

These belong to later phases.

52. No WhatsApp API Dependency for MVP

The MVP should not depend on a complex official WhatsApp API integration if the basic click-to-chat flow is sufficient.

This supports the project's:

Free / low-cost MVP

objective.

53. Future WhatsApp API

Later, FrontDesk may integrate official WhatsApp business messaging capabilities where appropriate.

Potential capabilities:

Incoming Messages
Outgoing Messages
Templates
Automated Replies
Customer Support
Conversation History
Campaigns
Notifications
AI Agent

These belong to a separate integration architecture.

54. Future WhatsApp Inbox

Potential future flow:

Customer
   ↓
WhatsApp
   ↓
FrontDesk
   ↓
Inbox
   ├── New
   ├── In Progress
   ├── Waiting
   └── Closed
55. Future AI Customer Agent

Eventually:

Customer
   ↓
WhatsApp
   ↓
FrontDesk AI Agent
   ↓
Business Knowledge Base

Example:

Customer:

Are you open today?

Agent:

Yes, Royal Bakes is open until 9 PM today.

56. AI Grounding

The future AI agent must answer from approved business data.

It must not guess.

Example:

Knowledge Base:
Cake price = UNKNOWN

AI:

I don't have the current price. Please contact the business.

57. Future AI Actions

An AI agent could eventually perform:

Check Product
Check Availability
Create Order
Create Booking
Generate Quote
Send Confirmation

These should use controlled Actions rather than unrestricted database access.

58. Future Business Actions

This aligns with the future FrontDesk Actions architecture:

Action:
Create Order

Action:
Create Booking

Action:
Generate Quote

Action:
Send Message

The WhatsApp agent can call approved actions.

59. Future Automation

Eventually:

WHEN:
Customer submits enquiry

THEN:
Create Lead

AND:
Notify Business

AND:
Send Confirmation

This is not v0.1.

60. Future Lead Management

A future WhatsApp integration may turn conversations into:

Lead
 ↓
Contacted
 ↓
Quotation
 ↓
Won/Lost

This belongs to the CRM/Lead Management module.

61. Future Customer Profiles

Eventually a confirmed customer interaction may create:

Customer
├── Conversations
├── Orders
├── Bookings
├── Preferences
└── History

This requires appropriate privacy controls and consent.

62. WhatsApp Conversion Funnel

Future analytics:

Website View
     ↓
Product View
     ↓
WhatsApp Click
     ↓
Message Sent
     ↓
Lead
     ↓
Order

v0.1 should only reliably claim the events it can actually measure.

63. Attribution

Future:

Customer came from:
QR
Google
Instagram
Direct

Then:

Source
 ↓
Website
 ↓
WhatsApp
 ↓
Lead

This can help businesses understand which channels generate interest.

64. QR + WhatsApp Example

A bakery prints:

Scan to see today's menu

Customer:

Scan QR
 ↓
Royal Bakes
 ↓
Chocolate Cake
 ↓
₹650
 ↓
Enquire
 ↓
WhatsApp

This is the core v0.1 journey.

65. Error Handling

If WhatsApp cannot be opened:

Show:

WhatsApp could not be opened.

Possible fallback:

[Copy Message]
[Call Business]

The exact fallback depends on platform capabilities.

66. Copy Message

Future/optional fallback:

Message:

Hi Royal Bakes,
I'd like to enquire about Chocolate Truffle Cake.

[Copy]

The customer can manually paste it into WhatsApp.

67. Offline Consideration

The public website may load cached information.

However, WhatsApp requires an appropriate network connection to complete the communication flow.

FrontDesk should not claim that WhatsApp enquiries work fully offline.

68. Localization

Future message language options:

English
Tamil
Hindi
Tamil + English

The initial message can default to the business's configured language preference.

69. Business Language Preference

This should eventually live in:

Business Preferences / Business Memory

Example:

Language:
Tamil + English
70. Message Tone

Future:

Professional
Friendly
Casual
Premium

The message should remain short and practical.

71. Avoid Over-Automation

The v0.1 goal is:

Help the customer start a conversation.

Not:

Automatically manage the entire customer relationship.

72. v0.1 Architecture

Conceptually:

Business Knowledge Base
        │
        ├── Business WhatsApp Number
        │
        └── Product Information
                  │
                  ↓
          WhatsApp Message Builder
                  │
                  ↓
             WhatsApp Link
                  │
                  ↓
              Customer
73. Message Builder Responsibilities

The message builder should:

Receive approved business data.
Receive the enquiry context.
Validate required fields.
Generate a safe message.
Encode it appropriately.
Produce the WhatsApp destination.

It should NOT:

modify business data,
send messages autonomously,
access private customer data.
74. Example Message Builder Input
{
  "businessName": "Royal Bakes",
  "whatsappNumber": "+91XXXXXXXXXX",
  "context": {
    "type": "product",
    "productName": "Chocolate Truffle Cake"
  }
}
75. Example Output
Destination:
WhatsApp

Message:
Hi Royal Bakes,
I'd like to enquire about the Chocolate Truffle Cake.

The exact implementation will be defined in API documentation.

76. Message Length

Messages should remain concise.

Avoid automatically including:

entire product descriptions,
large catalogs,
unnecessary metadata,
internal identifiers.
77. Injection / Content Safety

Imported business content may contain unexpected text.

The message builder should treat business data as data.

Do not allow imported content to manipulate application behavior.

Example:

A product description containing:

Ignore all previous instructions...

must remain product content and must not become an instruction to FrontDesk AI.

78. HTML / URL Safety

Generated WhatsApp messages must be correctly encoded.

Special characters should not break the generated destination.

79. Internationalization

Although v0.1 may target India first, the architecture should avoid hard-coding:

+91
INR
English

into every component.

Country, currency, and language should be configurable.

80. Business Removal

If the business removes its WhatsApp number:

Business Knowledge Base
        ↓
WhatsApp = None

All WhatsApp CTAs should disappear or be replaced with another configured contact method.

81. Published State

If the business changes its WhatsApp number:

The change should not necessarily become public until the owner publishes/approves the relevant business update, depending on the final publication model.

82. Versioning

Future business changes should be traceable.

Example:

Aug 26
WhatsApp:
+91 98765 XXXXX

Aug 27
WhatsApp:
+91 91234 XXXXX
83. Audit

Future audit log:

Who:
Business Owner

What:
Changed WhatsApp number

From:
Old Number

To:
New Number

When:
2026-08-27
84. Metrics

v0.1 should focus on:

WhatsApp CTA Clicks
Product Enquiry Clicks
General Enquiry Clicks

Future:

Message Sent
Lead Created
Order Created
Conversion Rate
Revenue Attributed
85. Activation

WhatsApp can be part of business activation:

Import
 ↓
Publish
 ↓
QR
 ↓
WhatsApp configured
 ↓
First customer interaction

The exact activation definition is maintained in the product metrics documentation.

86. v0.1 P0 Requirements
WA-P0-001
Business can store an approved WhatsApp number.

WA-P0-002
Public website can display WhatsApp CTA.

WA-P0-003
Customer can initiate general WhatsApp enquiry.

WA-P0-004
Customer can initiate product-specific enquiry.

WA-P0-005
Product enquiry message contains correct business/product context.

WA-P0-006
WhatsApp CTA uses approved business contact information.

WA-P0-007
Invalid/missing WhatsApp numbers do not create broken CTAs.

WA-P0-008
WhatsApp click events can be tracked.

WA-P0-009
Customer does not need a FrontDesk account.

WA-P0-010
FrontDesk does not automatically send WhatsApp messages.

WA-P0-011
Private business/customer data is not included in messages.

WA-P0-012
Business ownership rules apply to WhatsApp configuration.
87. v0.1 P1 Requirements
WA-P1-001
Custom message templates.

WA-P1-002
Tamil/English message support.

WA-P1-003
WhatsApp source attribution.

WA-P1-004
Product-level WhatsApp analytics.

WA-P1-005
Copy-message fallback.

WA-P1-006
Multiple WhatsApp numbers / departments.

WA-P1-007
Basic WhatsApp activity dashboard.
88. v0.1 P2 Requirements
WA-P2-001
Official WhatsApp Business API integration.

WA-P2-002
WhatsApp Inbox.

WA-P2-003
Automated replies.

WA-P2-004
AI Customer Support Agent.

WA-P2-005
Conversation history.

WA-P2-006
Lead creation.

WA-P2-007
WhatsApp campaigns.

WA-P2-008
Order notifications.

WA-P2-009
Booking notifications.

WA-P2-010
AI-to-WhatsApp workflows.
89. Acceptance Criteria

The WhatsApp Enquiry module is complete for v0.1 when:

A business can configure a public WhatsApp number.
The number is validated.
The public website displays a WhatsApp CTA.
General enquiries open an appropriate WhatsApp destination.
Product enquiries open an appropriate WhatsApp destination.
Product messages contain the correct product name.
Business information is correct.
Missing WhatsApp configuration is handled gracefully.
Customer does not need a FrontDesk account.
FrontDesk does not automatically send messages.
WhatsApp clicks are measured accurately.
Private data is not leaked.
Product/business data comes from approved Knowledge Base information.
Business authorization is enforced.
90. What v0.1 Is NOT

The v0.1 WhatsApp feature is NOT:

a WhatsApp clone,
a CRM,
a WhatsApp inbox,
a campaign platform,
an AI agent,
an order-management system,
a customer database,
an automated messaging platform.

It is:

A bridge between a business's digital presence and its existing WhatsApp communication channel.

91. Long-Term Vision

Eventually:

Customer
   ↓
FrontDesk Website / QR
   ↓
WhatsApp
   ↓
FrontDesk AI
   ↓
Business Knowledge Base
   ↓
Actions
   ├── Check Product
   ├── Check Availability
   ├── Create Order
   ├── Create Booking
   ├── Generate Quote
   └── Notify Business

The WhatsApp enquiry system becomes the first communication layer for a much larger AI Business OS.

92. Final Principle

Make the first customer conversation effortless.

The customer should not need to:

register,
fill a form,
copy a phone number,
explain which product they saw,
repeat information already visible on the website.

The ideal flow is:

See
 ↓
Understand
 ↓
Enquire
 ↓
WhatsApp