Next: BUSINESS-KNOWLEDGE-BASE.md.

This is the architectural heart of FrontDesk v0.1. The Business Importer feeds it, and eventually the website, catalog, QR, WhatsApp, CRM, automations, Copilot, and agents will all consume it.

Create:

FrontDesk/
└── documentation/
    └── 02-product/
        └── FEATURE-SPECIFICATIONS/
            ├── BUSINESS-IMPORTER.md
            └── BUSINESS-KNOWLEDGE-BASE.md
BUSINESS-KNOWLEDGE-BASE.md
# FrontDesk — Business Knowledge Base Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Business Knowledge Base
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Business Knowledge Base (BKB) is the structured source of truth for a business inside FrontDesk.

It stores the information FrontDesk is allowed to use when generating and operating a business's digital presence.

The Business Knowledge Base is intentionally separated from website presentation.

This distinction is fundamental.

```text
Business Data
     ↓
Business Knowledge Base
     ↓
 ┌───┼────┬──────┬─────────┐
 ↓   ↓    ↓      ↓         ↓
Web Catalog QR WhatsApp Future AI

The same business information should not be duplicated independently across every feature.

2. Core Principle

One business data source, many business experiences.

For example:

Product:
Chocolate Truffle Cake
Price:
₹650

The same approved information can appear in:

website,
catalog,
QR menu,
customer enquiry,
future AI assistant,
future automation,
future API.
3. Why the Knowledge Base Exists

Without a central knowledge layer, FrontDesk could become:

Website Data
Catalog Data
WhatsApp Data
AI Data
CRM Data

with conflicting values.

Example:

Website:
Burger ₹180

WhatsApp:
Burger ₹200

AI:
Burger ₹150

This creates trust problems.

Instead:

Business Knowledge Base
        ↓
Burger = ₹180
        ↓
Every approved surface
4. Source of Truth

The Business Knowledge Base should be the authoritative source for customer-facing business facts.

However, not every piece of information in the database should automatically be considered authoritative.

Data must have a state.

5. Data Lifecycle
External Source
      ↓
Imported Candidate
      ↓
Review
      ↓
Approved
      ↓
Business Knowledge Base
      ↓
Published Surface

Manual data:

Owner Entry
    ↓
Validation
    ↓
Approved
    ↓
Knowledge Base

AI-generated content:

AI Suggestion
    ↓
Review / Approval
    ↓
Knowledge Base
6. Data Trust States

Every relevant piece of business information should have a clear lifecycle.

Suggested states:

CANDIDATE
PENDING_REVIEW
APPROVED
REJECTED
ARCHIVED
7. CANDIDATE

Information has been discovered but has not been reviewed.

Example:

Source:
menu.pdf

Product:
Chocolate Truffle Cake

Price:
₹650

State:
CANDIDATE

It must not automatically be treated as authoritative.

8. PENDING_REVIEW

The system has identified information that requires owner attention.

Examples:

low-confidence extraction,
conflicting price,
missing required field,
possible duplicate.
9. APPROVED

The owner has accepted the information.

Approved information can be used by customer-facing features according to publication rules.

10. REJECTED

The owner has explicitly rejected the candidate information.

Rejected information should not become active business data.

11. ARCHIVED

Information is no longer active but may need to remain available for history or recovery.

Example:

Product:
Christmas Special Cake

Status:
ARCHIVED
12. Core Business Entity

Conceptually:

Business
├── Identity
├── Contact
├── Location
├── Hours
├── Categories
├── Products
├── Services
├── Media
├── FAQs
├── Policies
├── Offers
└── Preferences

The v0.1 implementation does not need every future entity.

13. v0.1 Knowledge Model

The minimum useful model is:

Business
├── Profile
├── Contact
├── Location
├── Opening Hours
├── Categories
├── Products
├── Media
└── FAQs
14. Business Profile

Potential fields:

Business
├── id
├── owner_id
├── name
├── description
├── category
├── logo
├── status
├── created_at
└── updated_at

Exact database types belong in the database specification.

15. Business Name

Business name is a critical field.

Example:

Royal Bakes

The system should avoid automatically modifying the official business name based on AI suggestions.

16. Business Description

Description can be:

manually entered,
imported,
AI-assisted,
approved.

AI may improve wording but must not invent unsupported claims.

Bad:

"Royal Bakes is Chennai's #1 bakery."

if the source does not establish that.

Better:

"Royal Bakes offers cakes, pastries, and baked goods."

when supported by the business information.

17. Business Category

Examples:

Bakery
Café
Restaurant
Salon
Boutique
Furniture
Freelancer
Service Provider

A business may eventually have:

primary category,
secondary categories.
18. Contact Information

Potential fields:

Phone
WhatsApp
Email
Website
Social Links

v0.1 should keep the model simple.

19. Contact Data Rules

Contact information is customer-facing and therefore sensitive to mistakes.

The system should:

validate format,
allow owner correction,
avoid AI invention,
preserve approved values.
20. Location

Potential fields:

Address
City
State
Country
Postal Code
Latitude
Longitude
Map URL

v0.1 may only require:

Address
City
State
Postal Code

with optional coordinates.

21. Opening Hours

Opening hours should support:

Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
Sunday

Each day may have:

Open
Closed
Opening Time
Closing Time

Future support may include:

split shifts,
holiday hours,
special hours.
22. Product

A product represents something a business sells or presents in its catalog.

Conceptually:

Product
├── id
├── business_id
├── name
├── description
├── category_id
├── price
├── currency
├── image
├── availability
├── status
├── source
└── timestamps
23. Product Name

Required for an active product.

Example:

Chocolate Truffle Cake
24. Product Description

Optional.

The description should describe only known information.

AI may assist with wording.

25. Product Price

Price should be represented structurally.

Example:

amount: 650
currency: INR

Do not store only:

"₹650"

as the sole representation.

Structured pricing allows future calculations and integrations.

26. Price Uncertainty

The system must support cases where pricing is unclear.

Examples:

Starting from ₹500
₹500–₹700
Market price
Contact for price
Price unavailable

The v0.1 implementation can simplify this, but the architecture should not assume every product has one fixed numeric price forever.

27. Product Availability

Possible states:

AVAILABLE
UNAVAILABLE
OUT_OF_STOCK
UNKNOWN

Unknown must remain distinct from available.

28. Category

Products can belong to categories.

Example:

Cakes
├── Chocolate Cake
├── Red Velvet Cake
└── Black Forest Cake

A category belongs to a business.

29. Category Rules

Categories should:

belong to a business,
have a name,
have an ordering value where required,
be archivable,
not be globally editable by another business.
30. Media

Media can include:

Logo
Product Image
Gallery Image
Banner

Each media object should have ownership information.

31. Media Rules

The system should distinguish:

Original Upload
Processed Image
Generated Image
External Reference

Generated media should not silently replace an owner's original media.

32. FAQ

FAQs can be represented as:

Question
Answer
Status
Source

Example:

Question:
Do you offer eggless cakes?

Answer:
Yes, selected cakes are available eggless.

Only approved information should be used as authoritative customer-facing FAQ data.

33. Business Policies

Policies are future-oriented but should eventually support information such as:

Cancellation
Returns
Delivery
Payment
Booking
Ordering

v0.1 may keep this limited.

34. Business Preferences

Business preferences are different from business facts.

Example:

Brand tone:
Premium

Language:
Tamil + English

Marketing style:
Professional

Emoji usage:
None

These are instructions/preferences, not customer facts.

They become increasingly important for future AI features.

35. Business Memory

Business Memory is a future extension of the Knowledge Base.

Example:

Business Preference:
Never discount premium products.

This should influence AI recommendations.

However:

Memory must not override factual business data.

36. Facts vs Preferences

This distinction is critical.

Fact
Burger price = ₹180
Preference
Do not discount burgers.
Instruction
Use Tamil + English in marketing.
Historical Event
Burger price changed from ₹160 to ₹180.

These should not be treated as the same type of data.

37. Source Metadata

Important information should retain source metadata where practical.

Example:

Product
Chocolate Cake

Source:
menu.pdf

Page:
2

Extraction:
OCR

Confidence:
HIGH
38. Provenance

Provenance answers:

Where did this information come from?

Potential source types:

MANUAL
IMPORT
OWNER_EDIT
AI_SUGGESTION
EXTERNAL_INTEGRATION
SYSTEM
39. Provenance Rule

AI-generated information should be distinguishable from owner-provided information.

Example:

Description

Source:
AI-assisted

Approved by:
Business Owner

Once approved, it may become customer-facing content, but its origin should remain auditable where required.

40. Approval Metadata

An approved record may need:

approved_by
approved_at
approval_source

For v0.1, the approval source will normally be the business owner.

41. Versioning

Business information can change.

Example:

Burger
₹160
   ↓
₹180
   ↓
₹200

The system should eventually preserve meaningful history.

This supports:

undo,
auditing,
AI safety,
change tracking.
42. Current Value vs History

The Knowledge Base should expose the current approved value.

Historical changes belong to version/change history.

Conceptually:

Knowledge Base
     ↓
Current Approved Value

Change History
     ↓
Previous Values
43. Business Status

Potential business states:

DRAFT
SETUP
READY
PUBLISHED
SUSPENDED
ARCHIVED

v0.1 may use a simpler subset.

44. Draft Business

A business can exist before it has complete information.

Example:

Business:
Royal Bakes

Status:
SETUP

It does not need to be publicly accessible.

45. Published Business

A business becomes public only when:

required information is present,
validation passes,
owner publishes.
46. Knowledge Base vs Website

The Knowledge Base should NOT contain:

Button position
Hero animation
Card radius
Page layout
Font size
Section ordering

Those belong to the presentation/design layer.

Instead:

Knowledge Base:
Product = Chocolate Cake
Price = ₹650

Website:
Display Chocolate Cake as card
47. Knowledge Base vs Design System

Business data:

Business name
Product
Price
Address
Hours

Design system:

Colors
Typography
Spacing
Buttons
Cards

These should remain separate.

48. Knowledge Base vs AI

The AI should consume the Knowledge Base.

Conceptually:

AI
 ↓
Retrieve relevant approved business information
 ↓
Generate response/action

AI should not be treated as the permanent source of truth.

49. AI Grounding Rule

For factual customer questions:

Use approved business data first.

Example:

Customer:

What is the price of the chocolate cake?

AI:

Knowledge Base
Chocolate Cake
₹650

Response:

The Chocolate Truffle Cake is ₹650.

50. Unknown Information

If information is absent:

Knowledge Base:
Price = UNKNOWN

AI should not guess.

Example:

"I don't have the current price for that item. Please contact the business."

51. Conflicting Information

If two sources disagree:

Existing approved:
₹650

New candidate:
₹700

The approved value remains authoritative until the owner resolves the conflict.

52. Data Precedence

Suggested precedence:

Owner-approved current value
        ↓
Owner-entered value
        ↓
Approved imported value
        ↓
External verified integration
        ↓
AI suggestion
        ↓
Unverified extraction

This hierarchy must be reviewed during the final data architecture design.

It should never be assumed that an external integration is automatically more trustworthy than an explicit owner edit.

53. Important Correction to the Precedence Model

Precedence should be field- and context-specific, not one universal hierarchy.

Example:

For business hours:

Owner-confirmed hours

may be authoritative.

For an automatically synchronized external system:

Verified external source

may be more appropriate.

Therefore the final architecture should support:

Source
+
Trust State
+
Approval
+
Timestamp
+
Context

rather than relying only on a simple ranking.

54. Freshness

Business information changes.

Examples:

prices,
opening hours,
availability,
offers.

The Knowledge Base should eventually support freshness metadata.

Example:

Price:
₹650

Last confirmed:
2026-08-26

This can become important for AI responses.

55. Stale Information

Future system behavior:

Price hasn't been confirmed for 180 days.

AI may warn the owner:

This information may be outdated.

It should not automatically assume it is false.

56. Data Validation

Knowledge Base data should be validated.

Examples:

Phone

Correct format.

Price

Valid numeric value where applicable.

Hours

Valid time ranges.

Required Fields

Required data present before publishing.

57. Business-Specific Schema

Not every business has the same data model.

A restaurant may need:

Menu
Categories
Food Items

A salon may need:

Services
Duration
Price
Staff

A freelancer may need:

Services
Packages
Portfolio

The long-term model should therefore support extensibility.

58. Core + Extensions Model

Recommended conceptual architecture:

Core Business
├── Identity
├── Contact
├── Location
├── Hours
├── Media
└── Categories

Industry Extensions
├── Restaurant
├── Salon
├── Boutique
├── Freelancer
└── etc.

This avoids creating one enormous table containing every possible field.

59. Industry Schema

Future industry-specific extensions may define:

Restaurant
├── Menu
├── Menu Items
├── Dietary Information
└── Ordering

Salon
├── Services
├── Staff
├── Duration
└── Booking

Furniture
├── Products
├── Dimensions
├── Materials
└── Quote
60. v0.1 Simplification

For v0.1, do not build a full industry schema engine.

Use a common business model that can support the first target vertical.

The architecture should remain extensible.

61. Data Ownership

Every business record should belong to a specific business.

Conceptually:

business_id

must be associated with relevant private data.

62. Multi-Tenant Isolation

FrontDesk is expected to support multiple businesses.

Therefore:

Business A
   ↓
Data A

Business B
   ↓
Data B

Business A must never be able to access Business B's private records.

This applies to:

API,
database,
files,
imports,
AI context,
analytics.
63. Public vs Private Data

Not all Knowledge Base information is public.

Public
business name,
public description,
menu,
products,
opening hours,
location,
public contact.
Private
owner information,
internal notes,
customer data,
internal costs,
private preferences,
audit records.

The public website must only receive explicitly public information.

64. Customer Data Boundary

Customer information should NOT be placed into the same unrestricted business knowledge context as public business facts.

Future CRM data requires separate access controls.

Conceptually:

Business Knowledge
        +
Customer Data
        +
Internal Business Data

are related but permission-separated domains.

65. AI Context Boundary

AI should receive only the information necessary for its task.

Example:

A customer asking:

What time do you close?

AI does not need:

owner email,
supplier data,
internal costs,
customer history.
66. Data Minimization

Only provide AI with the minimum relevant context.

This improves:

privacy,
security,
cost,
response quality.
67. Business Knowledge Retrieval

Future AI architecture may use:

User Query
   ↓
Intent Detection
   ↓
Relevant Knowledge Retrieval
   ↓
Permission Check
   ↓
AI Response

Do not send the entire business database to the model unnecessarily.

68. Structured Data First

For factual queries, prefer structured data over semantic search.

Example:

"What's the burger price?"

Retrieve:

product.price

rather than relying only on vector search.

69. Search / Semantic Layer

A semantic retrieval layer may eventually be useful for:

FAQs,
long descriptions,
policies,
documents,
unstructured business information.

It should complement structured data rather than replace it.

70. Knowledge Base API Principle

All FrontDesk features should ideally access business data through a controlled domain layer rather than directly manipulating database tables.

Conceptually:

Frontend
   ↓
API
   ↓
Business Domain Layer
   ↓
Knowledge Base

This helps maintain business rules consistently.

71. Example: Product Price Change

A price change should not simply be:

UPDATE products
SET price = 200;

without business rules.

The domain operation should conceptually be:

Request Price Change
       ↓
Authorization
       ↓
Validation
       ↓
Approval Requirement
       ↓
Change
       ↓
Audit Event

The exact implementation belongs in technical documentation.

72. Change Events

Future event system may produce:

PRODUCT_CREATED
PRODUCT_UPDATED
PRODUCT_ARCHIVED
PRICE_CHANGED
BUSINESS_UPDATED
HOURS_CHANGED
PUBLISH_CREATED

This will become useful for automation.

73. Knowledge Base as Event Source

Eventually:

Knowledge Base Change
        ↓
Event
        ↓
Automation

Example:

Product availability changed
        ↓
Automation
        ↓
Update website

This should not be required in v0.1.

74. Publication Snapshot

A published website should ideally reference a known approved state.

Conceptually:

Knowledge Base
     ↓
Approved State
     ↓
Publication Snapshot
     ↓
Public Website

This helps prevent half-completed edits from accidentally becoming public.

75. Draft vs Published

Business owners may edit information without immediately publishing.

Conceptually:

Current Published
        +
Draft Changes
        ↓
Preview
        ↓
Publish

This becomes increasingly important as the visual editor evolves.

76. AI Changes

Future AI changes should follow:

User Request
     ↓
AI interprets
     ↓
Structured Change Proposal
     ↓
Validation
     ↓
Permission Check
     ↓
Owner Approval if required
     ↓
Knowledge Base Change
     ↓
Publication

AI should not directly modify arbitrary database records.

77. Example AI Change

User:

Change my burger price to ₹200.

AI creates:

Change Proposal

Entity:
Product

Field:
Price

Current:
₹180

Proposed:
₹200

Owner:

[Cancel]
[Apply]

Then the domain layer performs the change.

78. Business Memory Integration

Future:

Knowledge Base
      +
Business Memory
      ↓
AI Context

Example:

Fact:
Premium Cake = ₹900

Preference:
Never discount premium cakes.

Instruction:
Use premium tone.

AI can use all three appropriately.

79. Memory Priority

Memory must not override reality.

Example:

Memory:

Never show unavailable products.

Actual data:

Cake
Availability:
OUT_OF_STOCK

AI should respect the current structured state.

80. Data Deletion

Businesses should eventually be able to delete or archive information.

Deletion must consider:

dependencies,
published content,
audit requirements,
customer records,
backups.

Not every deletion should mean immediate physical destruction.

81. Data Export

Future capability:

Export my business data.

Potential formats:

JSON,
CSV,
ZIP.

This reduces vendor lock-in and increases user trust.

82. Business Portability

Long-term principle:

The business owns its business information.

FrontDesk should avoid intentionally trapping a business's core data.

This can become a competitive trust advantage.

83. Backup

Future:

Business Snapshot

could preserve:

business data,
catalog,
settings,
theme,
publication state.

This supports recovery.

84. Knowledge Base Health

Future dashboard:

Business Knowledge Health

Products: 42
Missing Prices: 3
Missing Images: 8
Outdated Information: 2
Conflicts: 1

This turns data quality into something the owner can understand.

85. Data Quality Rules

Potential checks:

Missing required field
Invalid price
Duplicate product
Conflicting price
Invalid phone
Invalid hours
Missing category
Missing image
Stale information
86. v0.1 Data Quality Priority

For v0.1 prioritize:

Missing critical data.
Invalid values.
Duplicate products where detectable.
Conflicting imported values.
Publication-blocking errors.

Do not build an elaborate data-quality engine yet.

87. Knowledge Base and Website Generation

The website generator should consume approved data.

Example:

Approved Business
       ↓
Website Generator
       ↓
Hero
About
Categories
Products
Contact
Location
Hours

The website should not create its own independent source of truth.

88. Knowledge Base and QR

QR simply points toward a published customer-facing destination.

It should not store duplicate business information.

89. Knowledge Base and WhatsApp

WhatsApp enquiry generation can use:

Business Name
Product Name
Product Price

only when those fields are approved and appropriate.

90. Knowledge Base and Analytics

Analytics should reference business entities through stable IDs.

Example:

product_id = abc123

rather than only:

"Chocolate Cake"

This prevents problems when product names change.

91. Stable Identifiers

Business entities should have stable IDs.

Examples:

business_id
product_id
category_id
media_id
faq_id

Names are mutable.

IDs should remain stable where possible.

92. Slugs

Public URLs may use human-readable slugs:

frontdesk.app/royal-bakes

But internal relationships should use stable IDs.

93. Localization

Business information may eventually support multiple languages.

Example:

Business Name
English
Tamil

v0.1 should avoid overengineering multilingual storage unless the first vertical requires it.

94. Currency

The business should eventually define:

currency = INR

v0.1 should primarily target INR if the initial market remains India-focused.

The architecture should not hard-code INR into every price field.

95. Timezone

Business hours should eventually be associated with a timezone.

For Indian businesses:

Asia/Kolkata

The system should not rely on the server's timezone.

96. Knowledge Base API Boundary

Future API documentation should expose domain operations such as:

Get Business
Update Business
List Products
Create Product
Update Product
Archive Product
Get Categories
Update Hours

The exact API paths will be defined separately.

97. Security Rules

Every private Knowledge Base operation must verify:

Authenticated User
        ↓
Business Membership / Ownership
        ↓
Permission
        ↓
Operation

Never trust a client-provided business ID alone.

98. AI Security Rule

AI must not become a bypass around authorization.

Bad:

User asks AI:
"Show me another business's customer data."

The AI must still respect the same permissions as the normal application.

99. Auditability

Important changes should eventually record:

Who
What
When
Previous Value
New Value
Reason / Source

This supports future AI safety and business accountability.

100. v0.1 Simplified Audit

At minimum, important owner changes should be traceable through timestamps and ownership.

Full audit logs can be expanded later.

101. Example Complete Business
{
  "business": {
    "name": "Royal Bakes",
    "category": "Bakery",
    "description": "Bakery offering cakes and baked goods.",
    "contact": {
      "phone": "+91XXXXXXXXXX",
      "whatsapp": "+91XXXXXXXXXX"
    },
    "location": {
      "address": "Example Address",
      "city": "Tambaram",
      "state": "Tamil Nadu",
      "country": "India"
    },
    "hours": {
      "monday": {
        "open": "09:00",
        "close": "21:00"
      }
    }
  },
  "categories": [
    {
      "name": "Cakes"
    }
  ],
  "products": [
    {
      "name": "Chocolate Truffle Cake",
      "description": "Chocolate cake with truffle frosting.",
      "price": {
        "amount": 650,
        "currency": "INR"
      },
      "availability": "AVAILABLE"
    }
  ]
}

This is illustrative only.

The production schema will be defined in the database/API documentation.

102. Example Data Flow
menu.pdf
   ↓
Business Importer
   ↓
Candidate Product
   ↓
Owner Review
   ↓
Approved Product
   ↓
Business Knowledge Base
   ↓
Website
   ↓
Customer
103. Example Change Flow
Owner
  ↓
Change Price
  ↓
Validation
  ↓
Approval
  ↓
Knowledge Base
  ↓
Version/Event
  ↓
Preview
  ↓
Publish
104. Example AI Flow
Customer:
"How much is the chocolate cake?"

        ↓

Intent:
PRODUCT_PRICE

        ↓

Knowledge Retrieval

        ↓

Product:
Chocolate Truffle Cake

Price:
₹650

        ↓

AI Response
105. Example Unknown Flow
Customer:
"How much is the red velvet cake?"

        ↓

Knowledge Base:
Price = UNKNOWN

        ↓

AI:
"I don't have the current price for the Red Velvet Cake.
Please contact the business for the latest price."

The AI must not guess.

106. Example Conflict Flow
Knowledge Base:
₹650 approved

New Import:
₹700 candidate

        ↓

Conflict

        ↓

Owner Review

        ↓
   ┌────┴────┐
   ↓         ↓
Keep ₹650  Change ₹700
107. v0.1 Acceptance Criteria

The Business Knowledge Base is complete for v0.1 when:

Every business has isolated data.
Core business information can be stored.
Products can be stored.
Categories can be stored.
Contact information can be stored.
Location can be stored.
Opening hours can be stored.
Imported candidate data can be separated from approved data.
Approved data can be consumed by the website.
Approved data can be consumed by catalog.
Business ownership is enforced.
Customer-facing features cannot access private data.
Critical information is not invented by AI.
Data changes can be validated.
The architecture allows future extensions.
108. P0 Requirements
KB-P0-001
Create Business entity.

KB-P0-002
Store Business Profile.

KB-P0-003
Store Contact Information.

KB-P0-004
Store Location.

KB-P0-005
Store Opening Hours.

KB-P0-006
Store Categories.

KB-P0-007
Store Products.

KB-P0-008
Store Product Prices.

KB-P0-009
Store Product Availability where supported.

KB-P0-010
Store Media references.

KB-P0-011
Support candidate/approved data states.

KB-P0-012
Prevent unauthorized cross-business access.

KB-P0-013
Expose approved data to website generation.

KB-P0-014
Expose approved data to catalog.

KB-P0-015
Maintain separation between business data and presentation.
109. P1 Requirements
KB-P1-001
Source provenance.

KB-P1-002
Confidence.

KB-P1-003
Change history.

KB-P1-004
Freshness metadata.

KB-P1-005
Conflict tracking.

KB-P1-006
Duplicate tracking.

KB-P1-007
Draft vs published state.

KB-P1-008
Business knowledge health.

KB-P1-009
Data export.

KB-P1-010
Business snapshots.
110. P2 Requirements
KB-P2-001
Industry-specific schemas.

KB-P2-002
Multilingual business data.

KB-P2-003
Advanced semantic search.

KB-P2-004
External source synchronization.

KB-P2-005
Multi-location businesses.

KB-P2-006
Advanced business memory.

KB-P2-007
AI agent context layer.

KB-P2-008
Public Business API.

KB-P2-009
Business data portability ecosystem.
111. Critical Architectural Rule

The Business Knowledge Base must be designed before implementing large portions of:

AI Copilot,
AI agents,
CRM,
automation,
marketplace,
API ecosystem.

Those systems will depend on this layer.

112. Anti-Pattern

Do not build:

Website
  ↓
Own database

AI
  ↓
Own database

WhatsApp
  ↓
Own database

Catalog
  ↓
Own database

This creates duplicated truth.

113. Preferred Architecture

Build:

                  Business Knowledge Base
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
       Website           Catalog         WhatsApp
          │                │                │
          └────────────────┼────────────────┘
                           ↓
                       Future AI
                           ↓
                      Automations
114. Final Principle

The Business Knowledge Base should become:

The structured digital representation of a business inside FrontDesk.

FrontDesk is not ultimately storing a website.

It is storing:

the business itself as structured, permission-controlled, continuously evolving data.

The website is only one presentation of that business.