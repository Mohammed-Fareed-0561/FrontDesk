CUSTOMER-PROFILES-AND-CRM.md
# FrontDesk — Customer Profiles & CRM Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Customer Profiles & CRM
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Customer Profiles & CRM module defines how FrontDesk stores, organizes, and uses customer information.

The goal is not to build a large enterprise CRM in v0.1.

The goal is to create a simple customer foundation that allows FrontDesk to connect:

    Customer
        ↓
    Enquiry
        ↓
    Conversation
        ↓
    Order / Booking
        ↓
    Review
        ↓
    Retention

This foundation will later support:

- customer segmentation,
- loyalty,
- personalized experiences,
- win-back campaigns,
- AI customer agents,
- business analytics,
- marketing automation.

---

# 2. Core Principle

A customer should have one reusable profile rather than a separate identity every time they interact with a business.

Example:

    Arun Kumar

may:

- submit an enquiry,
- place an order,
- make a booking,
- leave a review,
- contact the business through WhatsApp.

FrontDesk should be able to associate these activities with the appropriate customer profile.

---

# 3. Important Identity Principle

Customer identity must be scoped appropriately.

A customer interacting with:

    Royal Bakes

does not automatically become a globally visible FrontDesk customer for every business.

Recommended conceptual model:

    FrontDesk
        ↓
    Business / Workspace
        ↓
    Customer Relationship
        ↓
    Customer Profile

---

# 4. v0.1 Scope

The initial release should support:

- basic customer profiles,
- customer name,
- contact information,
- customer creation,
- customer updates,
- customer search,
- enquiry-to-customer association,
- customer activity history,
- basic notes where appropriate,
- basic customer status.

The following should remain future scope:

- advanced CRM,
- segmentation,
- loyalty,
- automated campaigns,
- customer scoring,
- AI personalization,
- predictive churn,
- advanced customer journeys.

---

# 5. Customer Profile

A basic customer profile may contain:

    Customer
    ├── ID
    ├── Name
    ├── Phone
    ├── Email
    ├── Location
    ├── Notes
    ├── Created At
    └── Updated At

Exact database structure belongs to the database documentation.

---

# 6. Customer ID

Every customer record must have a unique internal identifier.

Example:

    customer_123

The internal ID should not depend on:

- name,
- phone number,
- email address.

---

# 7. Customer Name

Name should be stored separately from other information where practical.

Example:

    First Name:
    Arun

    Last Name:
    Kumar

However, v0.1 may allow a simple display name if that better fits onboarding.

---

# 8. Phone Number

Phone numbers should be stored in a normalized format where possible.

Example:

    +91XXXXXXXXXX

Do not assume every customer is from India.

The data model should support international phone numbers.

---

# 9. Email

Email should be stored separately from the display name.

Example:

    arun@example.com

The system should validate basic email formatting.

---

# 10. Location

A customer may optionally have location information.

Possible fields:

    City
    Area
    Pincode
    Country

Do not require a full address unless a feature actually needs it.

---

# 11. Customer Address

A business may eventually need delivery/service addresses.

These should be modeled separately from the basic customer profile.

Example:

    Customer
       ↓
    Addresses
       ├── Home
       └── Work

This is future scope unless ordering requires it.

---

# 12. Customer Notes

Businesses may need internal notes.

Example:

    Customer prefers morning appointments.

However, notes must be treated as private business information.

They should never appear on a public website or customer-facing communication unless explicitly intended.

---

# 13. Customer Status

v0.1 may support simple statuses:

    ACTIVE
    INACTIVE

Future CRM statuses may include:

    NEW
    REGULAR
    VIP
    AT_RISK
    LOST

These should not be implemented prematurely.

---

# 14. Customer Source

FrontDesk should eventually record where the customer came from.

Possible sources:

    WEBSITE
    WHATSAPP
    QR
    MANUAL
    IMPORT
    REFERRAL
    SOCIAL
    OTHER

For v0.1, basic source tracking may be optional.

---

# 15. Customer Creation

A customer may be created when:

- owner manually adds them,
- customer submits an enquiry,
- customer places an order,
- customer makes a booking,
- imported data contains a customer,
- supported integration creates a customer.

---

# 16. Automatic Customer Creation

Example:

Customer submits:

    "Do you deliver birthday cakes?"

FrontDesk detects sufficient customer information.

The system can create:

    Customer:
    Arun Kumar

and associate:

    Enquiry #123

with that customer.

---

# 17. Avoid Duplicate Customers

A major CRM problem is duplicate profiles.

Example:

    Arun Kumar
    +91XXXXXXXXXX

and:

    Arun K
    +91XXXXXXXXXX

should ideally be recognized as potentially the same person.

---

# 18. Duplicate Detection

FrontDesk may use matching signals such as:

    Phone
    Email
    Customer identifiers
    Verified account identity

Name alone should generally not be enough to merge customers automatically.

---

# 19. Duplicate Customer Warning

If FrontDesk detects a likely duplicate:

    Possible duplicate customer

    Arun Kumar
    +91XXXXXXXXXX

    Arun K
    +91XXXXXXXXXX

    [Review]

Do not automatically merge without appropriate confidence/permission.

---

# 20. Customer Merge

Future feature:

    Customer A
        +
    Customer B
        ↓
    Customer

The merge process must preserve important activity history.

---

# 21. Merge Safety

Customer merging is potentially destructive.

Before merging:

    Review records

    Customer A
    Customer B

    [Merge]
    [Cancel]

Future versions should support rollback/version history for important merges.

---

# 22. Customer Activity

A customer profile should eventually show a timeline.

Example:

    Customer Activity

    Aug 26
    Enquiry submitted

    Aug 20
    Order completed

    Aug 12
    Review submitted

    Aug 05
    Booking created

---

# 23. Activity Timeline

Possible activity types:

    ENQUIRY
    ORDER
    BOOKING
    MESSAGE
    REVIEW
    COUPON
    CUSTOMER_UPDATE

Only activity types actually supported by the business should appear.

---

# 24. Customer Timeline Principle

The timeline should answer:

> What has this customer done with this business?

It should not expose unrelated platform activity.

---

# 25. Customer Profile Page

Future dashboard:

    Customer

    Arun Kumar
    +91XXXXXXXXXX
    arun@example.com

    ─────────────────────

    Activity

    4 Orders
    2 Enquiries
    1 Review

    ─────────────────────

    Recent Activity
    ...

---

# 26. Customer Summary

Future customer summary may show:

    Total Orders
    Total Spend
    Last Interaction
    First Interaction
    Enquiries
    Reviews

Only metrics supported by actual business data should be displayed.

---

# 27. Total Spend

Revenue-related metrics should be calculated from actual transaction records.

Do not estimate total spend from incomplete data without clearly labeling it as an estimate.

---

# 28. Customer Lifetime Value

Future:

    Estimated Customer Value

This is not a v0.1 requirement.

It should only be calculated when sufficient transaction data exists.

---

# 29. Customer Segmentation

Future customer segments:

    New
    Regular
    VIP
    Inactive
    High Value
    Frequent Buyer
    Discount Sensitive

Segmentation should be based on defined rules rather than arbitrary AI guesses.

---

# 30. Rule-Based Segmentation

Example:

    IF
    Orders >= 5

    THEN
    Segment = Regular

Rules should be configurable in future.

---

# 31. AI Segmentation

Future AI may identify:

> Customers who are likely to return.

But AI-generated segments should explain the underlying signal where practical.

---

# 32. Customer Preferences

Businesses may store customer preferences.

Examples:

    Preferred language
    Preferred contact channel
    Preferred appointment time
    Product preferences

Only appropriate, non-sensitive preferences should be stored unless the product has explicit privacy/legal controls.

---

# 33. Sensitive Customer Data

FrontDesk must treat sensitive customer information carefully.

Examples may include:

- health information,
- financial information,
- highly personal information,
- authentication information.

Such data should not be collected simply because the system can store it.

---

# 34. Example of Sensitive Information

A customer might say:

    "I have a medical condition."

FrontDesk should not automatically turn this into a permanent customer profile field.

The system needs explicit product/legal justification and appropriate safeguards before storing sensitive information.

---

# 35. Customer Consent

Future customer data controls should allow customers to understand:

    What data is stored
    Why it is stored
    How it is used
    Communication preferences

This connects to the Customer Data Consent Center.

---

# 36. Marketing Consent

Marketing communication must be separate from ordinary customer data.

Example:

    Service Messages
    ✓ Allowed

    Promotional Messages
    ✕ Not Allowed

The exact implementation depends on the communication channel and applicable requirements.

---

# 37. Communication Preference

Future customer profile:

    Communication Preferences

    WhatsApp
    Email
    SMS

Preferences should not be assumed.

---

# 38. Customer Language

Future:

    Preferred Language:
    Tamil

This can help communication systems produce appropriate messages.

Example:

    Tamil + English

---

# 39. Business Memory Integration

The customer's preferences should work alongside Business Memory.

Example:

Business Memory:

    Always communicate in Tamil + English.

Customer Preference:

    Preferred language = Tamil

Communication engine can use both.

---

# 40. Customer + Business Knowledge

The Business Knowledge Base contains:

    What the business knows about itself.

The Customer Profile contains:

    What the business is permitted to know about the customer.

These must remain conceptually separate.

---

# 41. Customer + Enquiry

Example:

    Customer
       ↓
    Enquiry

The enquiry stores the interaction.

The customer profile stores the relationship.

---

# 42. Customer + Conversation

Future:

    Customer
       ↓
    Conversation
       ↓
    Messages

The conversation should reference the customer rather than duplicate the complete customer identity.

---

# 43. Customer + Order

Future:

    Customer
       ↓
    Orders
       ├── Order #1001
       ├── Order #1005
       └── Order #1012

Orders should retain historical information even if the customer's profile changes later.

---

# 44. Customer + Booking

Future:

    Customer
       ↓
    Bookings

Example:

    Aug 26 — Haircut
    Sep 02 — Hair Spa

---

# 45. Customer + Review

Future:

    Customer
       ↓
    Reviews

Example:

    5 ★
    "Excellent service."

Reviews should have their own moderation/publishing rules.

---

# 46. Customer + Loyalty

Future:

    Customer
       ↓
    Loyalty
       ├── Points
       ├── Rewards
       ├── Membership
       └── Referral History

Not part of v0.1.

---

# 47. Customer + Coupon

Future:

    Customer
       ↓
    Coupons Used

This can support:

- offer tracking,
- customer segmentation,
- campaign analysis.

---

# 48. Customer + Referral

Future:

    Customer A
        ↓
    Referral
        ↓
    Customer B

The system can track referral relationships.

---

# 49. Customer + QR

A customer may arrive through a business QR code.

Future analytics can record:

    QR
     ↓
    Customer
     ↓
    Interaction

This should respect privacy and consent.

---

# 50. Customer Source Tracking

Future:

    First Source:
    QR

    Latest Source:
    WhatsApp

This can help businesses understand acquisition channels.

---

# 51. Customer Acquisition

Future analytics:

    Website
    WhatsApp
    QR
    Instagram
    Referral
    Search

The system should distinguish source data from assumptions.

---

# 52. Customer Import

Businesses may already have customers in:

    CSV
    Excel
    CRM export

Future FrontDesk can import them.

---

# 53. Customer Import Safety

Imported customer data may contain sensitive information.

The importer should:

- preview records,
- identify duplicates,
- validate fields,
- report errors,
- avoid silently overwriting existing customers.

---

# 54. Customer Import Preview

Example:

    248 customers detected

    Valid:
    232

    Possible duplicates:
    12

    Invalid:
    4

    [Review Import]

---

# 55. Customer Import Mapping

Future:

    CSV Column
        ↓
    FrontDesk Field

    Customer Name
        → Name

    Mobile
        → Phone

    Email Address
        → Email

---

# 56. Customer Export

Future businesses may need to export their customer data.

Possible formats:

    CSV
    JSON

Export should respect:

- permissions,
- privacy controls,
- audit requirements where applicable.

---

# 57. Data Ownership Principle

The business should be able to access and export the customer data it legitimately controls.

FrontDesk should not intentionally create unnecessary vendor lock-in.

---

# 58. Customer Deletion

Future:

    Delete Customer

This requires careful consideration because customer data may be referenced by:

    Orders
    Bookings
    Reviews
    Financial records

Deleting the profile must not destroy required historical records.

---

# 59. Soft Deletion

A future implementation may use:

    ACTIVE
    ARCHIVED
    DELETED

rather than physically removing every historical reference immediately.

Exact retention policy belongs in privacy/data documentation.

---

# 60. Customer Anonymization

Future systems may need to anonymize customer identity while preserving necessary business records.

Example:

    Customer:
    Deleted Customer

    Historical Order:
    Order #1002

This must be designed carefully.

---

# 61. Customer Access

Customers should not automatically have access to the internal CRM profile.

The business dashboard is private.

---

# 62. Customer Portal

Future:

    Customer
       ↓
    Customer Portal

Possible features:

    Orders
    Bookings
    Loyalty
    Profile
    Communication Preferences

Not part of v0.1.

---

# 63. Customer Account

A customer may eventually create a FrontDesk customer account.

However, v0.1 should not require customers to create an account just to submit a basic enquiry.

---

# 64. Guest Customer

Important:

A customer should be able to interact without creating an account where the business workflow permits it.

Example:

    Customer enters:
    Name
    Phone
    Message

    ↓

    Enquiry created

---

# 65. Customer Identity Verification

For higher-risk operations, future systems may require verification.

Examples:

    Account access
    Payment
    Sensitive changes

This is not required for basic v0.1 enquiries.

---

# 66. Customer Search

Customer search is defined in the Search & Discovery documentation.

Possible search fields:

    Name
    Phone
    Email

Search must remain permission-aware.

---

# 67. Customer Filters

Future:

    New
    Active
    Inactive
    High Value
    Recent
    No Recent Interaction

These belong to the future CRM layer.

---

# 68. Customer Notes Permissions

Not every staff member should necessarily see private customer notes.

Future permissions:

    customer.read
    customer.update
    customer.notes.read
    customer.notes.write
    customer.export

---

# 69. Customer Assignment

Future businesses may assign customers/conversations to staff.

Example:

    Customer:
    Arun Kumar

    Assigned to:
    Priya

---

# 70. Customer Ownership

Customer ownership should be treated carefully.

The same customer may interact with multiple staff members.

Therefore:

    Assigned Staff

is generally more useful than:

    Customer Owner

unless the business explicitly needs ownership semantics.

---

# 71. Customer Activity Attribution

Activity should record who performed it where appropriate.

Example:

    Customer profile updated by:
    Manager

or:

    Note added by:
    Staff Member

---

# 72. Customer Timeline Attribution

Future:

    8:32 PM
    AI created a customer profile

    8:35 PM
    Owner updated phone number

    8:40 PM
    Customer submitted enquiry

---

# 73. AI Customer Profile Creation

Future AI can extract customer information from an enquiry.

Example:

Customer message:

    "Hi, I'm Arun. I need 2 kg chocolate cake for Saturday."

AI may extract:

    Name = Arun
    Product Interest = Chocolate Cake
    Quantity = 2 kg
    Date = Saturday

Only validated fields should be persisted automatically.

---

# 74. AI Extraction Safety

AI should not invent:

    Phone number
    Email
    Address
    Preferences

If information was not provided, leave the field empty.

---

# 75. AI Customer Summaries

Future:

> Arun is a repeat customer with 4 previous orders. His last order was 32 days ago.

This should be generated from actual structured data.

---

# 76. AI Customer Insights

Future:

> This customer has purchased 5 times but hasn't returned in 60 days.

This can feed:

    Win-Back Engine

---

# 77. AI Customer Recommendations

Future:

> Would you like to send Arun a reminder?

The system should recommend rather than automatically act unless permissions and automation rules allow it.

---

# 78. Customer Segmentation + Automation

Future:

    Customer becomes INACTIVE
        ↓
    Automation
        ↓
    AI generates message
        ↓
    Owner approval
        ↓
    Communication
79. Customer CRM and Business Copilot

Future AI Copilot can answer:

How many customers haven't returned in 60 days?

or:

Which customers are most valuable?

The answer must be based on actual business data.

80. Customer CRM and Analytics

Future metrics:

New Customers
Returning Customers
Repeat Rate
Customer Retention
Average Order Value
Customer Lifetime Value

Only implement metrics once their definitions are documented.

81. Customer Metric Definitions

Example:

Repeat Customer

Definition:

Customer with at least 2 completed transactions.

The exact definition should be centralized so analytics and AI use the same meaning.

82. Customer Activity Events

Future events may include:

CUSTOMER_CREATED
CUSTOMER_UPDATED
CUSTOMER_ARCHIVED
CUSTOMER_MERGED
ENQUIRY_CREATED
ORDER_CREATED
BOOKING_CREATED
REVIEW_CREATED
83. Customer Event Principle

Events should describe what happened.

Example:

ORDER_COMPLETED

rather than:

CUSTOMER_IS_GOOD

Avoid subjective event names.

84. Customer Data Model Relationship

Conceptually:

Workspace
    ↓
Business
    ↓
Customer
    ↓
Activities
    ├── Enquiries
    ├── Conversations
    ├── Orders
    ├── Bookings
    └── Reviews

The exact database relationship will be defined separately.

85. Multi-Business Customers

A person may interact with:

Royal Bakes
Royal Salon

FrontDesk should not automatically assume these are the same business relationship.

Each business should have its own customer relationship.

86. Global Customer Identity

A future platform-wide customer account may exist.

However, global identity and business-specific CRM relationships must remain separate.

Conceptually:

FrontDesk User
    ↓
Business A Customer Relationship

and:

FrontDesk User
    ↓
Business B Customer Relationship
87. Customer Data Isolation

Business A must not be able to see:

Customer activity with Business B

unless there is an explicit product feature and lawful basis allowing such sharing.

88. Customer Profile UI

Recommended v0.1 structure:

Customer

┌───────────────────────────┐
│ Arun Kumar                │
│ +91XXXXXXXXXX             │
│ arun@example.com          │
└───────────────────────────┘

Activity

───────────────────────────

Recent Enquiries
...

Recent Activity
...
89. Customer Quick Actions

Possible:

Add Note
Contact
View Enquiry
View Order

Only actions supported by the user's permissions should appear.

90. Customer Contact Action

Future:

[WhatsApp]
[Email]
[Call]

The platform should not assume the channel is available.

91. Contact Logging

Future communication actions may be logged:

Owner contacted customer
Channel: WhatsApp

This should not imply successful delivery unless the communication provider confirms it.

92. Customer Profile Completion

Future:

Profile completeness:
80%

This should be informational rather than a forced requirement.

93. Minimal Customer Profile

A customer should not need to provide every field.

Minimum viable record may be:

Customer ID
+ one identifying/contact field

For example:

Name

or:

Phone

depending on the business workflow.

94. Guest Enquiry Example

Customer submits:

Name: Arun
Message: Need birthday cake

No email.

The enquiry can still be created.

95. Customer Deduplication After More Information

Later the customer provides:

Phone: +91XXXXXXXXXX

FrontDesk may identify a possible match.

This should not silently overwrite a different customer record.

96. Customer Data Validation

Basic validation should include:

Phone format
Email format
Required fields
Field length
Invalid characters where appropriate

Validation rules should not unnecessarily reject legitimate international information.

97. Customer Privacy

The customer CRM must follow the broader privacy architecture.

Important principles:

collect only necessary information,
restrict access,
provide appropriate deletion/export mechanisms,
protect sensitive data,
separate private notes from public content.
98. Customer Data Encryption

Sensitive stored data should use appropriate security controls.

Exact encryption strategy belongs to Security Architecture documentation.

99. Customer Data Logging

Logs should not unnecessarily contain:

full phone numbers,
full email addresses,
sensitive notes,
private customer data.

Use redaction where appropriate.

100. Customer API

Future API concepts:

GET /customers
GET /customers/:id
POST /customers
PATCH /customers/:id
DELETE /customers/:id

Exact API contracts belong to API documentation.

101. Customer Activity API

Future:

GET /customers/:id/activity

Possible response categories:

enquiry
order
booking
review
message
102. Customer Permissions

Future permission model:

customer.read
customer.create
customer.update
customer.archive
customer.export
customer.merge
103. v0.1 P0 Requirements
CUSTOMER-P0-001
The system can create a customer profile.

CUSTOMER-P0-002
Every customer has a unique internal ID.

CUSTOMER-P0-003
Customer records are scoped to the correct business/workspace.

CUSTOMER-P0-004
Basic name/contact information can be stored.

CUSTOMER-P0-005
Customer records can be updated by authorized users.

CUSTOMER-P0-006
Authorized users can view customer profiles.

CUSTOMER-P0-007
Customer search is supported.

CUSTOMER-P0-008
Enquiries can be associated with customers.

CUSTOMER-P0-009
Customer activity can be displayed where supported.

CUSTOMER-P0-010
Customer information is protected by workspace permissions.

CUSTOMER-P0-011
Customer data is not exposed publicly.

CUSTOMER-P0-012
The architecture supports future orders, bookings, reviews, and conversations.
104. v0.1 P1 Requirements
CUSTOMER-P1-001
Customer activity timeline.

CUSTOMER-P1-002
Customer notes.

CUSTOMER-P1-003
Customer source tracking.

CUSTOMER-P1-004
Duplicate detection.

CUSTOMER-P1-005
Customer import.

CUSTOMER-P1-006
Customer export.

CUSTOMER-P1-007
Customer communication preferences.

CUSTOMER-P1-008
Customer segmentation foundation.

CUSTOMER-P1-009
Customer assignment.

CUSTOMER-P1-010
Customer audit history.
105. v0.1 P2 Requirements
CUSTOMER-P2-001
Advanced CRM.

CUSTOMER-P2-002
Customer segmentation.

CUSTOMER-P2-003
Loyalty system.

CUSTOMER-P2-004
Memberships.

CUSTOMER-P2-005
Referral engine.

CUSTOMER-P2-006
Win-back engine.

CUSTOMER-P2-007
Customer scoring.

CUSTOMER-P2-008
AI customer insights.

CUSTOMER-P2-009
AI personalization.

CUSTOMER-P2-010
Predictive churn detection.

CUSTOMER-P2-011
Customer portal.

CUSTOMER-P2-012
Global FrontDesk customer accounts.
106. Acceptance Criteria

The Customer Profiles & CRM module is complete for v0.1 when:

Authorized users can create customer profiles.
Customer profiles belong to the correct business/workspace.
Basic contact information can be stored.
Customers can be searched.
Customers can be updated by authorized users.
Enquiries can be associated with customers.
Customer information is not exposed publicly.
Workspace isolation is enforced.
Customer data access follows role permissions.
The model can support future orders and bookings.
The model can support future conversations.
The model can support future reviews.
The design does not require customers to create an account for basic enquiries.
The architecture can support future CRM capabilities without replacing the customer foundation.
107. Example End-to-End Flow

Customer:

Arun Kumar

↓

Visits:

Royal Bakes website

↓

Submits:

"Do you have a 2 kg chocolate cake?"

↓

FrontDesk:

Creates/identifies customer

↓

Creates:

Enquiry #1001

↓

Links:

Customer
    ↓
Enquiry

↓

Owner sees:

New enquiry from Arun Kumar

↓

Future:

Owner responds through WhatsApp

↓

Future:

Customer places order

↓

Customer timeline:

Enquiry
↓
Conversation
↓
Order
108. Example Repeat Customer

Arun orders again.

FrontDesk recognizes the existing customer relationship.

Instead of creating:

Customer #2

the system associates:

Order #1045
    ↓
Arun Kumar

Customer activity becomes:

3 Orders
2 Enquiries
1 Review
109. Example Customer Insight

Future AI:

Arun has purchased 4 times.
His last purchase was 52 days ago.

Would you like to create a
win-back offer?

[Create Offer]

The AI must derive this from actual transaction history.

110. Example Customer Privacy

A staff member without customer access attempts:

Search:
Arun

The system returns:

No accessible results.

It must not reveal:

Customer exists
Phone number
Email
Order history
111. Long-Term CRM Loop

FrontDesk's future CRM loop:

Customer
   ↓
Discover
   ↓
Enquire
   ↓
Conversation
   ↓
Order / Booking
   ↓
Review
   ↓
Loyalty
   ↓
Return
   ↓
Referral

This is one of the long-term retention loops of the FrontDesk Business OS.

112. Final Architecture Principle

The customer layer should act as a reusable identity and relationship foundation:

Customer
    ↓
Business Relationship
    ↓
Activities
    ├── Enquiries
    ├── Conversations
    ├── Orders
    ├── Bookings
    ├── Reviews
    └── Future Loyalty

Do not embed all CRM behavior directly inside the customer table/model.

113. Final Principle

A customer profile is not the CRM itself. It is the identity foundation that allows FrontDesk to build the CRM later.

The v0.1 goal is therefore:

Know who the customer is → connect their interactions → protect their data → prepare for future business relationships.