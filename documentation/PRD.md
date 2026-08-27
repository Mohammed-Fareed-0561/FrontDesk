PRD.md
# FrontDesk — Product Requirements Document

**Product:** FrontDesk
**Version:** v0.1
**Document:** Product Requirements Document
**Status:** Draft — For Review
**Last Updated:** 2026-08-26
**Product Stage:** MVP / Validation Release

---

# 1. Document Purpose

This document defines the product requirements for FrontDesk v0.1.

It translates the business strategy and market problem into a concrete product specification.

This document defines:

- target users,
- product goals,
- user journeys,
- features,
- functional requirements,
- non-functional requirements,
- product states,
- permissions,
- acceptance criteria,
- edge cases,
- and v0.1 scope boundaries.

This document does not define detailed implementation.

Implementation details belong in:

- system architecture,
- database specification,
- API specification,
- UI/UX specification,
- AI architecture,
- security documentation,
- testing documentation,
- and development documentation.

---

# 2. Product Definition

FrontDesk is a business-to-digital transformation platform for small and local businesses.

The v0.1 product allows a business owner to:

1. create a business workspace,
2. import existing business information,
3. allow FrontDesk to structure that information,
4. review and correct the imported information,
5. create a digital business presence,
6. publish the presence,
7. generate a QR entry point,
8. connect customers to the business through WhatsApp,
9. receive basic enquiries,
10. update business information,
11. and view basic business activity.

---

# 3. Product Vision

The long-term vision is:

> FrontDesk becomes the digital operating layer for small businesses.

v0.1 is intentionally much narrower.

The first product must prove:

> A non-technical business owner can bring an existing business into FrontDesk, publish it digitally, connect with customers, and return later to manage it.

---

# 4. v0.1 Product Promise

The primary product promise is:

> **Import your business → Make it digital → Connect with customers.**

The internal workflow is:

```text
Existing Business
       ↓
     Import
       ↓
AI / Extraction
       ↓
Review
       ↓
Business Knowledge Base
       ↓
Website / Catalog
       ↓
Publish
       ↓
QR
       ↓
Customer
       ↓
WhatsApp
       ↓
Enquiry
5. Product Goals
Goal 1 — Fast onboarding

A business should be able to begin from existing information rather than a blank website.

Goal 2 — Reduce technical dependency

A non-technical owner should be able to manage routine business information without a developer.

Goal 3 — Create structured business information

Business data should exist independently from the website.

Goal 4 — Create a useful digital presence

The generated website/catalog must be useful to actual customers.

Goal 5 — Connect businesses with customers

The digital presence must provide a simple path to customer enquiry.

Goal 6 — Validate recurring usage

Owners should have a reason to return after initial publishing.

6. Non-Goals for v0.1

The following are explicitly outside v0.1.

Full CRM
Full inventory management
ERP
Accounting
POS
Advanced loyalty
Advanced coupon engine
Full marketing automation
Visual workflow builder
AI agent builder
AI agent marketplace
Developer marketplace
Designer marketplace
Business marketplace
Multi-location enterprise management
Advanced A/B testing
Business benchmarking
Full AI Business Copilot
Autonomous AI operations
Complex payment infrastructure
Native Android application
Native iOS application

These may appear in future roadmap documentation.

7. Target Users
7.1 Primary User — Business Owner

The primary user owns or manages a small business.

Examples for the initial vertical:

café owner,
restaurant owner,
bakery owner,
food-cart owner,
small food-business operator.

The user may have little or no technical knowledge.

7.2 Secondary User — Business Staff

Future versions may allow staff members to help manage:

products,
enquiries,
content,
and business information.

Basic multi-user functionality is not required for the first release unless necessary for testing.

7.3 Customer

The customer does not need a FrontDesk account.

The customer should be able to:

open the business website,
browse information,
view products/menu,
view business details,
and contact the business.
8. Primary User Journey

The ideal v0.1 journey is:

Landing Page
     ↓
Create Account
     ↓
Create Business
     ↓
Import Business
     ↓
Extraction
     ↓
Review
     ↓
Approve
     ↓
Choose / Generate Design
     ↓
Preview
     ↓
Publish
     ↓
Generate QR
     ↓
Share
     ↓
Customer Visits
     ↓
Customer Enquiry
     ↓
Owner Responds
9. Product Modules

FrontDesk v0.1 consists of the following major modules:

1. Authentication
2. Business Workspace
3. Business Importer
4. Business Knowledge Base
5. Import Review
6. Website / Catalog Generator
7. Website Editor
8. Preview
9. Publishing
10. QR
11. WhatsApp Enquiry
12. Enquiry Inbox
13. Business Updates
14. Activity
15. Version / Safety
16. Basic Settings
10. Module 1 — Authentication
Purpose

Allow a user to securely access FrontDesk.

Required capabilities
Sign up
Sign in
Sign out
Session persistence
Password recovery where supported
Requirements

AUTH-001

A user must be able to create an account.

AUTH-002

A registered user must be able to sign in.

AUTH-003

A user must only access businesses they are authorized to access.

AUTH-004

Authentication secrets must never be exposed to the frontend.

11. Module 2 — Business Workspace

After authentication, the user creates or accesses a business.

Business identity

The workspace should contain:

business name,
business type,
description,
contact information,
address/location,
opening hours,
logo,
images,
social links.
Requirements

BUS-001

A user must be able to create a business.

BUS-002

A business must have an owner.

BUS-003

The business must have a unique internal identifier.

BUS-004

The user must be able to edit basic business information.

BUS-005

Business information must be stored independently from website presentation.

12. Module 3 — Business Importer

This is one of the defining v0.1 features.

Purpose

Allow an existing business to provide information it already possesses.

Potential sources:

Website URL
PDF
Images
CSV
Text
Manual information

The exact source availability may depend on implementation and free infrastructure.

13. Import Flow
Choose Import Source
        ↓
Upload / Connect
        ↓
Processing
        ↓
Extraction
        ↓
Normalization
        ↓
Confidence / Validation
        ↓
Review
        ↓
Approve
14. Import Requirements

IMP-001

The owner must be able to select an import source.

IMP-002

The system must validate supported file types.

IMP-003

The system must create an import job.

IMP-004

The system must track import processing status.

IMP-005

Extracted information must not immediately become trusted business data.

IMP-006

Imported information must enter a review state.

IMP-007

The owner must be able to edit extracted information.

IMP-008

The owner must be able to approve extracted information.

IMP-009

The system must preserve the source associated with imported information where practical.

15. Import States

An import job may have states such as:

CREATED
   ↓
UPLOADING
   ↓
PROCESSING
   ↓
EXTRACTING
   ↓
REVIEW_REQUIRED
   ↓
APPROVED

Failure state:

FAILED

Cancelled state:

CANCELLED

The exact state machine will be defined in the technical architecture.

16. Module 4 — Business Knowledge Base

The Business Knowledge Base is the structured representation of the business.

For v0.1:

Business
├── Identity
├── Contact
├── Location
├── Opening Hours
├── Products
├── Categories
├── Images
├── FAQs
└── Basic Policies
17. Source of Truth Principle

The website must not become the source of truth.

Instead:

Business Knowledge Base
          ↓
     Website
     Catalog
     QR
     WhatsApp Context

If a product price changes, the business data should change first.

The website should consume the updated information.

18. Module 5 — Product / Catalog Management

The owner must be able to manage catalog items.

Each product may contain:

name,
description,
price,
category,
image,
availability/status.
Requirements

CAT-001

Owner can create a product.

CAT-002

Owner can edit a product.

CAT-003

Owner can delete/archive a product.

CAT-004

Owner can assign a category.

CAT-005

Owner can add an image.

CAT-006

Owner can update price.

CAT-007

Owner can mark availability where supported.

19. Product Data Integrity

The system must avoid silently changing critical business data.

Examples:

price,
product name,
availability,
opening hours.

AI-generated modifications to critical fields should require appropriate review.

20. Module 6 — Website / Catalog Generation

FrontDesk must create a customer-facing digital presence using approved business data.

The initial site should support:

homepage,
business information,
product/menu sections,
contact information,
location,
opening hours,
WhatsApp contact.

The exact page system will be defined in the UI/UX specification.

21. Website Generation Principle

The system should generate from:

Business Data
+
Theme
+
Page Configuration

rather than storing arbitrary generated HTML as the primary business representation.

22. Module 7 — Design System

v0.1 should support basic design customization.

Potential settings:

primary color,
secondary color,
typography,
button style,
card style,
layout style.

The design system must be token-based where practical.

Example:

Brand Primary
Brand Secondary
Heading Font
Body Font
Border Radius
Button Style
Card Style
Spacing
23. AI Website Generation

AI may assist in generating:

page structure,
copy,
section ordering,
design suggestions.

However:

AI-generated website output must remain connected to structured business data.

AI should not invent important business facts.

24. Module 8 — Preview

Before publishing, the owner must be able to preview the website.

The preview should show:

desktop representation where appropriate,
mobile representation,
product/catalog content,
business information,
contact actions.
25. AI Change Preview

Future AI-powered changes should follow:

User Request
     ↓
AI Interpretation
     ↓
Proposed Changes
     ↓
Preview
     ↓
Approve
     ↓
Apply

For v0.1, this may initially be limited to lower-risk changes.

26. Module 9 — Publishing

The owner must be able to publish the business presence.

Required states:

DRAFT
   ↓
READY
   ↓
PUBLISHED

Possible failure:

PUBLISH_FAILED
27. Publishing Requirements

PUB-001

Owner can preview before publishing.

PUB-002

Owner can publish an approved business presence.

PUB-003

Published content must use approved business information.

PUB-004

Owner can unpublish or disable the public presence where supported.

PUB-005

Publishing should not modify the underlying business data unexpectedly.

28. Public Business URL

Each published business must have a public URL.

Example:

frontdesk.example/business/royal-bakes

The exact production URL structure will be decided in the architecture/domain documentation.

Custom domains are not required for the core v0.1 validation unless implemented without introducing unnecessary cost.

29. Module 10 — QR

The owner must be able to generate a QR code pointing to the published business presence.

Requirements

QR-001

A QR code can be generated for a published business.

QR-002

The QR must resolve to the correct business.

QR-003

The QR should remain valid when supported URLs change through controlled routing.

QR-004

The owner can download or display the QR.

30. Module 11 — WhatsApp Enquiry

WhatsApp is the preferred initial communication channel.

Customer flow:

Customer
   ↓
Business Website
   ↓
Contact / Enquire
   ↓
WhatsApp
   ↓
Business Owner

The initial implementation may use a WhatsApp link/deep-link approach rather than a full WhatsApp Business API integration.

This allows v0.1 to remain low-cost.

31. WhatsApp Requirements

WA-001

Customer can initiate a WhatsApp conversation from the business page.

WA-002

The business phone number must be configurable.

WA-003

The generated message may include contextual information.

Example:

Hi, I found your business on FrontDesk and would like to enquire about Chocolate Truffle Cake.

WA-004

The system must not claim to have sent or received WhatsApp messages unless the relevant integration actually supports it.

32. Module 12 — Enquiry Inbox

Where technically supported in v0.1, the owner should have a lightweight view of customer enquiries.

If official WhatsApp message ingestion is not available, the initial inbox may instead record:

enquiry clicks,
enquiry initiation,
contextual information.

The system must clearly distinguish:

WhatsApp conversation initiated

from:

WhatsApp message received.

33. Module 13 — Business Updates

The owner must be able to update:

products,
prices,
images,
descriptions,
opening hours,
contact information.

Changes should follow:

Edit
 ↓
Save
 ↓
Validate
 ↓
Publish / Update
34. Module 14 — Activity

v0.1 should provide a minimal activity layer.

Potential metrics:

page visits,
QR scans/clicks where measurable,
WhatsApp enquiry clicks,
published status,
recent updates.

The activity system must avoid pretending to measure events that the platform cannot reliably observe.

35. Module 15 — Version History

A basic version/history mechanism should protect owners from accidental changes.

The owner should eventually be able to see:

Today
Yesterday
Earlier version

and restore an earlier state where supported.

For v0.1, the implementation may be limited to business/site snapshots rather than a full Git-like system.

36. Module 16 — Safety

FrontDesk must protect important business information.

Examples of high-impact changes:

price changes,
deleting products,
changing business phone number,
changing business address,
publishing large website changes.

These should receive stronger validation or confirmation.

37. AI Safety Requirements

AI must:

operate using approved business context,
distinguish known information from generated content,
avoid inventing business facts,
avoid silently modifying critical business information,
provide proposed changes where appropriate,
respect business permissions,
maintain an auditable record of significant AI actions.
38. Business Data Lifecycle

Business information should follow:

SOURCE
  ↓
IMPORTED
  ↓
EXTRACTED
  ↓
REVIEW
  ↓
APPROVED
  ↓
ACTIVE
  ↓
UPDATED
  ↓
ARCHIVED

The exact technical state model will be defined later.

39. User Permissions

v0.1 should support at least:

Owner

Full access to their business.

Customer

Public access only.

The architecture should be designed so that future roles can be added.

Future roles:

Manager
Staff
Designer
Developer
Agency
Administrator
40. Tenant Isolation

A user must not be able to access another business's private data.

Every protected resource must be associated with the correct business/workspace.

This is a critical security requirement.

41. Error Handling

The system must provide understandable errors.

Avoid:

HTTP 500

for ordinary users.

Prefer:

We couldn't import this file. Please check that the file is supported and try again.

Technical details may be logged internally.

42. Empty States

The product must handle empty states intentionally.

Examples:

No products

Your catalog is empty.

Actions:

Add Product

Import Products

No website

Your digital presence isn't published yet.

Action:

Create Website

No activity

Your business hasn't received activity yet.

Avoid presenting zero activity as an error.

43. Loading States

Long-running operations must have visible progress.

Examples:

Uploading...
Extracting...
Understanding business information...
Preparing catalog...
Generating preview...
Publishing...

The user should not be left wondering whether the application is frozen.

44. Import Confidence

Where AI extraction is used, the system should eventually be able to indicate confidence or uncertainty.

Example:

Product:
Chocolate Truffle Cake

Price:
₹650

Confidence:
High

If uncertain:

Price:
₹650?

Please verify.

The exact UI will be defined later.

45. Import Source Traceability

Where practical, imported information should retain its source.

Example:

Product: Chocolate Truffle Cake
Source: menu.pdf
Page: 2

This helps the owner verify extracted information.

46. Business Knowledge Integrity

The system must distinguish:

Verified information

Owner-approved.

Imported information

Extracted but not yet approved.

AI-generated content

Generated by AI.

User-entered information

Entered manually by the owner.

These states should not be silently mixed.

47. Natural Language Business Updates

The long-term interface should support:

"Add chicken shawarma for ₹150."

"Change our opening time to 10 AM."

"Remove the unavailable burger."

For v0.1, natural-language editing may be implemented selectively.

Where implemented, it must produce structured proposed changes.

Example:

Request:
"Change burger price to ₹200."

Proposed change:

Burger
₹180 → ₹200

[Cancel]
[Apply]
48. Website Editor

v0.1 should provide enough editing capability for owners to make basic adjustments.

The editor should prioritize:

simple controls,
mobile usability,
safe changes,
reusable sections,
and structured data.

It should not attempt to become a full professional design application.

49. Template Strategy

FrontDesk should provide a limited number of high-quality templates for v0.1.

The objective is:

Quality over quantity.

Templates should be industry-oriented.

Example:

Café
hero,
featured items,
menu,
about,
location,
contact.
Bakery
hero,
products,
categories,
featured products,
contact.

The exact template inventory is defined in UI/UX documentation.

50. Business Import as Primary Onboarding

The onboarding experience should prioritize:

Start with existing business

rather than:

Start with blank website

Potential options:

Import Website
Import PDF
Import CSV
Upload Images
Enter Manually

The exact supported options may be limited by v0.1 implementation.

51. Onboarding Requirements

ONB-001

New users must understand what FrontDesk does.

ONB-002

Users should reach business creation quickly.

ONB-003

Users should have a guided import path.

ONB-004

Users must be able to skip import and enter information manually.

ONB-005

The system must clearly communicate processing states.

ONB-006

The owner must review imported information before publication.

52. Activation Definition

A business is considered activated when:

Business is created.
Information is imported or entered.
Information is approved.
Digital presence is published.
QR is generated.
At least one measurable customer interaction occurs.

This definition may be revised after pilot testing.

53. Core User Story Set
US-001 — Create Business

As a business owner,

I want to create my business in FrontDesk,

so that I can establish my digital presence.

US-002 — Import Business

As a business owner,

I want to import my existing business information,

so that I don't have to enter everything manually.

US-003 — Review Import

As a business owner,

I want to review extracted information,

so that incorrect information does not reach customers.

US-004 — Edit Product

As a business owner,

I want to change a product,

so that my catalog remains accurate.

US-005 — Publish

As a business owner,

I want to publish my digital presence,

so that customers can access it.

US-006 — QR

As a business owner,

I want a QR code,

so that customers can quickly access my business.

US-007 — Customer Enquiry

As a customer,

I want to contact the business easily,

so that I can ask questions.

US-008 — Update

As a business owner,

I want to update business information without technical assistance,

so that my customers see accurate information.

US-009 — Activity

As a business owner,

I want to see basic activity,

so that I know whether my digital presence is being used.

54. Critical User Journey

The most important v0.1 journey is:

Signup
 ↓
Create Business
 ↓
Import
 ↓
Review
 ↓
Approve
 ↓
Generate
 ↓
Preview
 ↓
Publish
 ↓
QR
 ↓
Customer Visit
 ↓
WhatsApp Enquiry

If this journey fails, additional features should not be prioritized over fixing it.

55. Critical UX Principle

At every stage the user should understand:

Where am I?
What is happening?
What do I need to do?
What happens next?
56. Functional Requirements Summary
| ID       | Requirement             | Priority |
| -------- | ----------------------- | -------- |
| AUTH-001 | User registration       | P0       |
| AUTH-002 | User login              | P0       |
| BUS-001  | Create business         | P0       |
| BUS-004  | Edit business           | P0       |
| IMP-001  | Import source selection | P0       |
| IMP-003  | Import job              | P0       |
| IMP-006  | Review extracted data   | P0       |
| IMP-008  | Approve imported data   | P0       |
| CAT-001  | Create product          | P0       |
| CAT-002  | Edit product            | P0       |
| PUB-001  | Preview                 | P0       |
| PUB-002  | Publish                 | P0       |
| QR-001   | Generate QR             | P0       |
| WA-001   | WhatsApp contact        | P0       |
| ACT-001  | Basic activity          | P1       |
| VER-001  | Basic version history   | P1       |
| AI-001   | AI-assisted extraction  | P0       |
| AI-002   | AI-generated content    | P1       |
| AI-003   | AI proposed changes     | P1       |

57. Priority Definitions
P0 — Critical

Required to validate the v0.1 product hypothesis.

P1 — Important

Useful but can be simplified or deferred if necessary.

P2 — Future

Not required for v0.1.

58. v0.1 Release Criteria

The release candidate must allow a test business to complete:

Create account
      ↓
Create business
      ↓
Import or enter information
      ↓
Review
      ↓
Approve
      ↓
Generate digital presence
      ↓
Preview
      ↓
Publish
      ↓
Generate QR
      ↓
Customer opens site
      ↓
Customer initiates enquiry
59. Technical Independence Requirement

The PRD does not mandate a particular frontend, backend, database, AI provider, hosting provider, or cloud provider.

Those decisions belong to architecture documentation.

However, the implementation must satisfy the product requirements defined here.

60. Cost Requirement

The v0.1 development strategy should prioritize free and open-source tools wherever practical.

The product should not require paid infrastructure simply to demonstrate the core workflow during development.

External paid services may be introduced later where unavoidable.

61. Privacy Requirement

FrontDesk may eventually handle:

business information,
customer information,
enquiries,
activity,
and AI context.

Therefore privacy must be designed into the architecture from the beginning.

v0.1 should collect only information necessary for the intended functionality.

62. Security Requirement

The product must protect:

authentication,
business data,
customer data,
imported files,
AI credentials,
and internal system secrets.

Users must never receive access to another business's private information.

63. Performance Requirements

Customer-facing pages should prioritize:

fast initial loading,
optimized images,
minimal unnecessary JavaScript,
responsive layouts,
and mobile performance.

The exact measurable performance targets will be established in the technical and QA documentation.

64. Reliability Requirements

The system should gracefully handle:

failed imports,
invalid files,
AI failures,
publishing failures,
network failures,
incomplete data,
and unavailable integrations.

A failure should not silently corrupt business data.

65. Data Integrity Requirements

Critical business fields include:

business name,
phone number,
address,
opening hours,
product name,
price,
availability.

Changes to these fields must be validated.

66. AI Requirement

AI must not be treated as the source of truth.

The hierarchy should be:

Owner-approved Business Data
          ↓
       Source of Truth
          ↓
          AI

AI can:

interpret,
organize,
suggest,
generate,
summarize.

AI must not silently override verified business information.

67. AI Provider Independence

The product should eventually support an AI abstraction layer.

Conceptually:

FrontDesk AI Service
        ↓
Provider Adapter
   ┌────┼────┐
   ↓    ↓    ↓
Local  API  Other
Model       Provider

This allows the development environment to use free/local models where practical.

68. Import Provider Independence

Similarly:

Import Service
      ↓
Source Adapter
 ┌────┼────┐
 ↓    ↓    ↓
PDF  URL  CSV

This prevents individual import mechanisms from becoming tightly coupled to the rest of the application.

69. Future Compatibility

Although v0.1 is intentionally small, the data model should avoid blocking future capabilities such as:

CRM,
orders,
bookings,
automation,
AI agents,
multi-location,
staff,
integrations,
APIs.

However:

Future compatibility must not justify unnecessary v0.1 complexity.

70. Product Principle — Progressive Complexity

The user should see only what is relevant to their current stage.

Example:

New business
Import
Website
QR
WhatsApp

Later:

Customers
Analytics
Automation
AI

Advanced functionality should not overwhelm new users.

71. Product Principle — Safe Defaults

When uncertain, FrontDesk should choose the safer option.

Examples:

don't publish unapproved imported data,
don't automatically change prices,
don't delete business records permanently,
don't send campaigns without authorization,
don't expose private data.
72. Product Principle — Explainable AI

When AI performs important work, the owner should be able to understand:

what AI found,
what AI changed,
what AI recommends,
and what requires approval.
73. Product Principle — No False Automation

FrontDesk must never present an action as completed when it was only suggested or attempted.

Example:

Incorrect:

"WhatsApp campaign sent."

when the system only created a message.

Correct:

"Campaign draft created."

74. Product Principle — Business Data First

All major product decisions should preserve the distinction:

Business Data
     ≠
Website Design

A redesign should not require rebuilding business information.

75. Product Principle — Reversibility

Important changes should be reversible wherever technically feasible.

Examples:

website changes,
product changes,
AI changes,
publishing changes.
76. Product Principle — Customer First

The business owner is the primary product user.

However, the ultimate value is created when customers successfully interact with the business.

Therefore the product must optimize both:

Owner Experience
       +
Customer Experience
77. Edge Case Requirements

The product must handle:

Empty business

User creates business but provides no information.

Invalid import

Uploaded file cannot be processed.

Partial import

Only some information can be extracted.

Conflicting information

Two sources contain different prices.

Duplicate products

Same product appears multiple times.

Missing price

Product exists but price is unavailable.

Missing image

Product has no image.

Failed AI generation

AI provider/model fails.

Publish failure

Publishing fails.

Deleted product

Product is removed after previously being published.

Unpublished business

Customer accesses an unavailable business.

78. Conflicting Information

If multiple sources disagree:

Source A:
Burger ₹180

Source B:
Burger ₹200

FrontDesk should not silently choose a value.

The system should:

identify the conflict,
show the owner,
ask for confirmation,
store the approved value.
79. Duplicate Information

If the importer finds:

Chocolate Cake
Chocolate Cake
Chocolate Cake

the system should attempt to identify duplicates.

It must not automatically delete potentially distinct products without sufficient confidence.

80. Missing Information

The product should allow incomplete business data.

Example:

Product:
Chicken Burger

Price:
Not provided

The system should not invent a price.

Instead:

Price missing — add price before publishing this product.

81. Publication Validation

Before publishing, FrontDesk should check for critical missing information.

Potential checks:

business name,
contact method,
required product fields,
broken images,
invalid links,
missing essential information.

The owner should receive a clear summary.

82. Publication Warning

Example:

Your website is ready, but 2 products don't have prices.

Actions:

Fix Issues

Publish Anyway

Whether "Publish Anyway" is permitted depends on the severity of the issue.

83. Account Deletion

The product must eventually support account/business deletion policies.

Deletion behavior must be documented separately in security/privacy documentation.

84. Auditability

Significant changes should eventually record:

Who
What
When
Source
Reason

For AI actions:

AI
Action
Input
Proposed Change
Approval
Result
85. Product Analytics

v0.1 should measure the product funnel.

Example:

Signup
 ↓
Business Created
 ↓
Import Started
 ↓
Import Completed
 ↓
Review Completed
 ↓
Published
 ↓
QR Created
 ↓
Customer Visit
 ↓
WhatsApp Enquiry

This will identify where users drop out.

86. Activation Funnel

Primary funnel:

100 Signups
     ↓
Business Created
     ↓
Import Started
     ↓
Import Completed
     ↓
Published
     ↓
QR Created
     ↓
Customer Interaction

The exact conversion targets should be determined through pilot data rather than arbitrary assumptions.

87. Retention Definition

A retained business is a business that performs a meaningful action after initial activation.

Examples:

updates product,
changes business information,
reviews activity,
handles enquiry,
publishes update.

Logging in alone should not necessarily qualify.

88. MVP Success

v0.1 is successful if:

target businesses can understand the product,
import is useful,
setup is significantly easier than manual recreation,
customers can access the resulting business presence,
customer enquiries can occur,
owners can update information,
and businesses return after initial setup.
89. Failure Conditions

The product hypothesis should be reconsidered if:

import provides little value,
businesses prefer manual setup,
businesses do not publish,
customers do not interact,
owners never return,
or the target businesses do not consider the problem important.

Failure of one feature does not automatically mean failure of the entire company.

The product strategy should adapt based on evidence.

90. Future Roadmap Categories

The following are intentionally future-facing.

Business Operations
CRM
inventory
orders
bookings
quotations
invoices
Marketing
coupons
loyalty
campaigns
content generation
win-back
Automation
workflows
triggers
actions
integrations
AI
Business Copilot
industry AI
AI agents
AI approval inbox
Ecosystem
developer marketplace
designer marketplace
automation marketplace
AI agent marketplace
91. v0.1 Feature Freeze

Once implementation begins, new features should not be added to v0.1 unless they:

directly support the core activation flow,
fix a critical usability problem,
fix a security issue,
fix a data integrity problem,
or are required to validate a core hypothesis.

Everything else should enter the future roadmap.

92. Requirement Traceability

Every implementation feature should map to a requirement ID.

Example:

IMP-001
   ↓
Import UI
   ↓
Import API
   ↓
Import Service
   ↓
Import Database
   ↓
Tests

This makes it possible to determine:

Why does this feature exist?

and:

Has this requirement actually been implemented?

93. Definition of Done

A v0.1 feature is not considered complete merely because the UI exists.

A feature is complete when:

UI exists,
backend behavior exists where required,
validation exists,
authorization exists,
error states exist,
loading states exist,
data integrity is preserved,
tests exist,
documentation is updated,
and the feature works through the intended user journey.
94. Documentation Dependencies

This PRD will be referenced by:

PRD
 ↓
UI/UX
 ↓
Architecture
 ↓
Database
 ↓
API
 ↓
AI
 ↓
Security
 ↓
Testing
 ↓
Deployment

Changes to major product requirements must update dependent documentation.

95. Final v0.1 Product Definition

FrontDesk v0.1 is:

A simple, import-first digital business platform that allows small businesses to transform existing information into a structured business profile, publish a mobile-first website/catalog, create a QR entry point, connect customers through WhatsApp, and manage basic business updates without technical assistance.

The product is deliberately not yet a complete AI Business OS.

The purpose of v0.1 is to establish the foundation and validate the core workflow.

96. Final Product Principle

The most important product principle is:

Do not build a website for the business. Build the business's digital foundation, and let the website become one of its interfaces.

97. Document Status

Status: DRAFT — FOR PRODUCT REVIEW

This PRD should be considered the primary product specification for FrontDesk v0.1.

Any major change to:

target user,
core workflow,
business data model,
activation definition,
v0.1 scope,
or product promise

must trigger a PRD review.