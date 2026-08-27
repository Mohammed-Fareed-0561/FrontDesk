Next is USER-STORIES.md. This turns the PRD into implementation-ready user requirements that we can later trace to UI, API, database, and tests.

Create:

FrontDesk/
└── documentation/
    └── 02-product/
        ├── PRD.md
        └── USER-STORIES.md
USER-STORIES.md
# FrontDesk — User Stories & Acceptance Criteria

**Product:** FrontDesk  
**Version:** v0.1  
**Document:** User Stories & Acceptance Criteria  
**Status:** Draft — For Review  
**Last Updated:** 2026-08-26

---

# 1. Purpose

This document translates the FrontDesk v0.1 Product Requirements Document into concrete user stories.

Each story describes:

- who needs something,
- what they need,
- why they need it,
- acceptance criteria,
- priority,
- and dependencies where applicable.

These stories will later be traced to:

- UI screens,
- user flows,
- API endpoints,
- database entities,
- AI behavior,
- security requirements,
- and automated tests.

---

# 2. User Story Format

Standard format:

> As a [user], I want [capability], so that [outcome].

Each story has:

### Priority

- P0 — Required for v0.1 validation
- P1 — Important but can be simplified
- P2 — Future

### Acceptance Criteria

Specific conditions that must be true for the story to be considered complete.

---

# 3. Actors

FrontDesk v0.1 has two primary actors.

## 3.1 Business Owner

The person who owns or manages the business.

The owner can:

- create a business,
- import information,
- review information,
- manage products,
- customize the digital presence,
- publish,
- generate QR,
- manage business settings,
- and view activity.

---

## 3.2 Customer

A person visiting a published FrontDesk business presence.

The customer does not need a FrontDesk account.

The customer can:

- view business information,
- browse products/menu,
- view opening hours,
- view location/contact information,
- and initiate an enquiry.

---

# 4. Authentication Stories

## US-AUTH-001 — Create Account

**Priority:** P0

> As a business owner, I want to create a FrontDesk account so that I can manage my business.

### Acceptance Criteria

- User can enter required registration information.
- Invalid information is rejected.
- Successful registration creates an authenticated account.
- User receives appropriate feedback after registration.
- Authentication credentials are handled securely.
- User cannot access another user's private business data.

---

## US-AUTH-002 — Sign In

**Priority:** P0

> As a business owner, I want to sign in so that I can access my business workspace.

### Acceptance Criteria

- User can submit valid credentials.
- Valid credentials create an authenticated session.
- Invalid credentials produce a clear error.
- Private business information is inaccessible without authentication.

---

## US-AUTH-003 — Sign Out

**Priority:** P0

> As a business owner, I want to sign out so that my account is protected on shared devices.

### Acceptance Criteria

- User can sign out.
- Session is invalidated appropriately.
- Protected pages cannot be accessed after logout without re-authentication.

---

## US-AUTH-004 — Recover Account

**Priority:** P1

> As a business owner, I want to recover access to my account if I forget my credentials.

### Acceptance Criteria

- Recovery flow exists where supported by the authentication provider.
- Recovery does not expose private information.
- User can regain access through the supported recovery mechanism.

---

# 5. Business Workspace Stories

## US-BUS-001 — Create Business

**Priority:** P0

> As a business owner, I want to create my business in FrontDesk so that I can begin building its digital presence.

### Acceptance Criteria

- User can create a business workspace.
- Business has a unique identifier.
- Business is associated with the authenticated owner.
- Required business fields are validated.
- Newly created business starts in an appropriate initial state.

---

## US-BUS-002 — View Business

**Priority:** P0

> As a business owner, I want to view my business information so that I can understand what FrontDesk currently knows about my business.

### Acceptance Criteria

- Owner can view business information.
- Information is grouped logically.
- Missing information is clearly identifiable.
- No private information belonging to another business is shown.

---

## US-BUS-003 — Edit Business Information

**Priority:** P0

> As a business owner, I want to edit my business information so that customers see accurate information.

### Acceptance Criteria

Owner can update supported fields such as:

- business name,
- description,
- phone,
- address,
- opening hours,
- links,
- images.

Changes are validated.

Changes are saved to the business data layer.

The updated information can be reflected in the customer-facing presence.

---

## US-BUS-004 — View Business Completeness

**Priority:** P1

> As a business owner, I want to know what information is missing so that I can complete my business profile.

### Acceptance Criteria

The system can identify important missing information.

Example:

```text
Business Profile

✓ Business name
✓ Phone
✓ Location
⚠ Opening hours
⚠ Description
✓ Products

The owner can navigate directly to incomplete areas.

6. Import Stories
US-IMP-001 — Choose Import Source

Priority: P0

As a business owner, I want to choose where my existing business information comes from so that I don't have to recreate it manually.

Potential sources
PDF
Image
CSV
Website URL
Manual entry
Acceptance Criteria
Supported sources are clearly displayed.
Unsupported sources are not presented as available.
User understands what each source can import.
US-IMP-002 — Upload Import File

Priority: P0

As a business owner, I want to upload my existing business file so that FrontDesk can extract the information.

Acceptance Criteria
User can select a supported file.
Unsupported file types are rejected.
File size limits are enforced.
Upload progress is shown where appropriate.
Upload failure is communicated clearly.
Original file is not treated as approved business data automatically.
US-IMP-003 — Create Import Job

Priority: P0

As the system, I want to create an import job so that long-running import processing can be tracked.

Acceptance Criteria

An import job has:

unique ID,
business ID,
source type,
processing state,
timestamps,
result/error information where applicable.
US-IMP-004 — Process Import

Priority: P0

As a business owner, I want FrontDesk to process my imported information so that I can avoid manual data entry.

Acceptance Criteria
Import enters a processing state.
Processing progress/state is available.
Extracted information is associated with the correct business.
Processing failure is recoverable where possible.
The system does not silently publish extracted information.
US-IMP-005 — Extract Business Information

Priority: P0

As a business owner, I want FrontDesk to identify business information from my source so that it can build my business profile.

Potential extracted information
business name,
description,
phone,
address,
opening hours,
products,
categories,
prices,
product descriptions,
images,
FAQs.
Acceptance Criteria
Extracted information is represented in structured form.
Uncertain information can be identified.
Missing information remains missing.
AI does not invent required business facts.
US-IMP-006 — Review Imported Information

Priority: P0

As a business owner, I want to review imported information before it becomes trusted business information.

Acceptance Criteria

The owner can:

inspect extracted information,
edit information,
reject information,
approve information.

Imported data is visually distinguishable from already-approved information.

US-IMP-007 — Correct Imported Information

Priority: P0

As a business owner, I want to correct extraction mistakes so that customers receive accurate information.

Acceptance Criteria
Owner can modify extracted fields.
Corrections are saved.
Corrected information can be approved.
The original source remains traceable where supported.
US-IMP-008 — Approve Imported Information

Priority: P0

As a business owner, I want to approve imported information so that FrontDesk can use it as trusted business data.

Acceptance Criteria
Owner can approve individual items or appropriate groups.
Approved information enters the trusted business data layer.
Approved data can be used by the website/catalog.
Approval is recorded where auditability is supported.
US-IMP-009 — Handle Import Failure

Priority: P0

As a business owner, I want to understand when an import fails so that I know what to do next.

Acceptance Criteria
Failed imports show a human-readable error.
User can retry where possible.
Partial successful extraction is handled safely.
Failure does not corrupt existing business information.
US-IMP-010 — Detect Conflicting Information

Priority: P1

As a business owner, I want FrontDesk to identify conflicting information so that I don't accidentally publish incorrect data.

Example
Source A:
Burger — ₹180

Source B:
Burger — ₹200
Acceptance Criteria
Conflict can be identified.
Conflicting values are presented to the owner.
System does not silently choose a value when confidence is insufficient.
Owner can select the trusted value.
US-IMP-011 — Detect Duplicate Products

Priority: P1

As a business owner, I want duplicate imported products identified so that my catalog remains clean.

Acceptance Criteria
Potential duplicates can be identified.
Owner can merge, keep, or reject where supported.
Distinct products are not automatically removed without sufficient confidence.
7. Business Knowledge Base Stories
US-KB-001 — Store Structured Business Data

Priority: P0

As FrontDesk, I need structured business data so that multiple product surfaces can use the same source of truth.

Acceptance Criteria

Business data is stored separately from website presentation.

The structure can represent:

business identity,
products,
categories,
prices,
hours,
contact,
location,
media,
FAQs.
US-KB-002 — Distinguish Data State

Priority: P0

As FrontDesk, I need to distinguish imported, approved, user-entered, and generated information so that untrusted information is not treated as authoritative.

States may include
Imported
Pending Review
Approved
User Entered
AI Generated
Archived
US-KB-003 — Track Source

Priority: P1

As a business owner, I want to know where imported information came from so that I can verify it.

Acceptance Criteria

Where technically possible, the system can show:

Product: Chocolate Cake
Source: menu.pdf
Page: 2
8. Catalog Stories
US-CAT-001 — View Catalog

Priority: P0

As a business owner, I want to view my catalog so that I can manage my products.

US-CAT-002 — Add Product

Priority: P0

As a business owner, I want to add a product so that customers can see what I offer.

Required behavior

Owner can provide supported product information.

The product is stored against the correct business.

US-CAT-003 — Edit Product

Priority: P0

As a business owner, I want to edit a product so that its information stays accurate.

US-CAT-004 — Archive Product

Priority: P0

As a business owner, I want to remove a product from the active catalog without necessarily permanently deleting its historical record.

Acceptance Criteria
Product can be archived.
Archived product is not shown as active.
Existing data integrity is preserved.
US-CAT-005 — Set Product Availability

Priority: P1

As a business owner, I want to indicate whether a product is available so that customers are not misled.

US-CAT-006 — Categorize Products

Priority: P0

As a business owner, I want to organize products into categories so that customers can browse the catalog easily.

US-CAT-007 — Add Product Image

Priority: P1

As a business owner, I want to add a product image so that customers can understand the product visually.

9. Website / Digital Presence Stories
US-WEB-001 — Generate Digital Presence

Priority: P0

As a business owner, I want FrontDesk to create a digital presence from my approved business data so that I don't need to build every section manually.

Acceptance Criteria

Generated presence includes appropriate business information.

It does not invent critical business facts.

US-WEB-002 — Select Design

Priority: P0

As a business owner, I want to choose a design suitable for my business so that my digital presence looks professional.

US-WEB-003 — Customize Theme

Priority: P1

As a business owner, I want to customize basic visual settings so that my website reflects my business identity.

Potential controls:

colors,
typography,
buttons,
cards,
layout.
US-WEB-004 — Edit Content

Priority: P0

As a business owner, I want to edit business content so that my website remains accurate.

US-WEB-005 — Preview Website

Priority: P0

As a business owner, I want to preview my website before publishing so that I can verify how customers will see it.

Acceptance Criteria
Preview reflects current approved business data.
Mobile experience can be inspected.
Customer-facing navigation works in preview.
US-WEB-006 — Mobile-Friendly Experience

Priority: P0

As a customer, I want the business website to work well on my phone so that I can easily browse it.

US-WEB-007 — Contact Business

Priority: P0

As a customer, I want an obvious way to contact the business so that I can ask questions.

10. Publishing Stories
US-PUB-001 — Publish Business

Priority: P0

As a business owner, I want to publish my digital presence so that customers can access it.

Acceptance Criteria
Required publication checks run.
Owner receives clear validation feedback.
Successful publication creates a public URL.
Published version uses approved information.
US-PUB-002 — Publication Validation

Priority: P0

As a business owner, I want FrontDesk to identify critical missing information before publishing so that I don't accidentally publish an incomplete business presence.

US-PUB-003 — Update Published Business

Priority: P0

As a business owner, I want to update my published business so that customers see current information.

US-PUB-004 — Unpublish

Priority: P1

As a business owner, I want to disable my public business presence when necessary.

11. QR Stories
US-QR-001 — Generate QR

Priority: P0

As a business owner, I want to generate a QR code for my business so that customers can access it easily.

Acceptance Criteria
QR points to the correct public business.
QR is generated only for an appropriate business state.
QR can be displayed or downloaded.
US-QR-002 — Customer Opens QR

Priority: P0

As a customer, I want to scan the business QR so that I can access its digital presence.

12. WhatsApp Stories
US-WA-001 — Connect WhatsApp Number

Priority: P0

As a business owner, I want to provide my WhatsApp business number so that customers can contact me.

US-WA-002 — Start WhatsApp Enquiry

Priority: P0

As a customer, I want to contact the business through WhatsApp so that I can ask questions.

Acceptance Criteria
Contact action opens the appropriate WhatsApp flow.
Correct business number is used.
Optional contextual message is populated correctly.
FrontDesk does not falsely claim message delivery.
US-WA-003 — Product-Specific Enquiry

Priority: P1

As a customer, I want to enquire about a specific product so that the business knows what I am asking about.

Example:

Hi, I would like to enquire about:
Chocolate Truffle Cake
₹650
13. Enquiry Stories
US-ENQ-001 — Record Enquiry Interaction

Priority: P1

As a business owner, I want to know when customers initiate enquiries so that I can understand customer interest.

Important limitation:

The system must distinguish an observed click/action from an actual received WhatsApp message.

US-ENQ-002 — View Enquiry Activity

Priority: P1

As a business owner, I want to see basic enquiry activity so that I understand customer engagement.

14. Activity Stories
US-ACT-001 — View Business Activity

Priority: P1

As a business owner, I want to view basic activity so that I can understand whether my digital presence is being used.

Potential metrics:

visits,
enquiry clicks,
QR activity where measurable,
recent updates.
US-ACT-002 — View Recent Activity

Priority: P1

As a business owner, I want to see recent business activity so that I can quickly understand what happened.

Example:

Today

24 website visits
4 WhatsApp enquiry clicks
2 product updates
15. Version & Safety Stories
US-VER-001 — Save Version

Priority: P1

As FrontDesk, I want to preserve important business/site states so that owners can recover from mistakes.

US-VER-002 — View Version History

Priority: P1

As a business owner, I want to see previous versions so that I can understand what changed.

US-VER-003 — Restore Version

Priority: P1

As a business owner, I want to restore a previous version so that I can recover from an unwanted change.

16. AI Stories
US-AI-001 — AI Import Extraction

Priority: P0

As a business owner, I want AI to understand my imported information so that I don't need to manually structure it.

US-AI-002 — AI Content Assistance

Priority: P1

As a business owner, I want AI to help create business descriptions and product copy so that I can prepare content faster.

Important rule

AI-generated content must not invent critical facts.

US-AI-003 — AI Change Proposal

Priority: P1

As a business owner, I want to describe a change in natural language so that FrontDesk can propose the corresponding structured change.

Example:

"Change burger price to ₹200."

Expected:

Burger

₹180 → ₹200

[Cancel]
[Apply]
US-AI-004 — AI Change Approval

Priority: P1

As a business owner, I want to approve AI-proposed changes before important changes are applied.

US-AI-005 — AI Explain Change

Priority: P1

As a business owner, I want to understand what AI is proposing so that I can make an informed decision.

17. Search / Discovery Stories

Search/discovery is not a major v0.1 capability.

Future:

US-DISC-001 — Local Discovery

Priority: P2

As a customer, I want to discover nearby businesses so that I can find relevant businesses.

This remains future scope.

18. Business Settings Stories
US-SET-001 — Manage Business Contact

Priority: P0

As a business owner, I want to manage my business contact information so that customers can reach me.

US-SET-002 — Manage Opening Hours

Priority: P0

As a business owner, I want to manage opening hours so that customers see accurate availability.

US-SET-003 — Manage Location

Priority: P0

As a business owner, I want to manage my business location so that customers can find me.

19. Permissions Stories
US-PERM-001 — Business Isolation

Priority: P0

As a business owner, I want my business data to remain private from other businesses.

Acceptance Criteria
User cannot access another business by modifying an ID in a request.
APIs verify business ownership/authorization.
Public data is intentionally separated from private data.
US-PERM-002 — Public Customer Access

Priority: P0

As a customer, I want to view published business information without creating an account.

20. Error & Recovery Stories
US-ERR-001 — Understand Failure

Priority: P0

As a business owner, I want understandable error messages so that I know what to do when something fails.

US-ERR-002 — Retry Failed Operation

Priority: P1

As a business owner, I want to retry recoverable operations so that temporary failures do not force me to start over.

US-ERR-003 — Preserve Existing Data

Priority: P0

As a business owner, I want failed operations to avoid corrupting existing business data.

21. Onboarding Stories
US-ONB-001 — Understand FrontDesk

Priority: P0

As a new user, I want to understand what FrontDesk does so that I know why I should use it.

US-ONB-002 — Guided Setup

Priority: P0

As a business owner, I want a guided setup process so that I don't feel overwhelmed.

US-ONB-003 — Skip Import

Priority: P0

As a business owner, I want to enter information manually if I don't have an import source available.

US-ONB-004 — Continue Later

Priority: P1

As a business owner, I want to leave setup and continue later without losing my progress.

22. Customer Stories
US-CUST-001 — View Business

Priority: P0

As a customer, I want to quickly understand what a business offers.

US-CUST-002 — Browse Menu

Priority: P0

As a customer, I want to browse products/menu categories so that I can find what I want.

US-CUST-003 — View Product

Priority: P0

As a customer, I want to see product details and price so that I can decide whether to enquire.

US-CUST-004 — View Opening Hours

Priority: P0

As a customer, I want to see opening hours so that I know when the business is available.

US-CUST-005 — Find Location

Priority: P0

As a customer, I want to find the business location so that I can visit it.

US-CUST-006 — Contact Business

Priority: P0

As a customer, I want to contact the business from its digital presence so that I can ask a question.

23. Data Integrity Stories
US-DATA-001 — Do Not Invent Price

Priority: P0

As a business owner, I want FrontDesk to avoid inventing prices so that customers are not given false information.

US-DATA-002 — Do Not Invent Availability

Priority: P0

As a business owner, I want FrontDesk to avoid claiming a product is available unless that information is known.

US-DATA-003 — Preserve Approved Data

Priority: P0

As a business owner, I want approved business data to remain authoritative unless I explicitly change it.

24. Publishing Safety Stories
US-SAFE-001 — Validate Before Publishing

Priority: P0

As a business owner, I want FrontDesk to check important issues before publication so that I don't accidentally publish broken information.

US-SAFE-002 — Confirm High-Impact Changes

Priority: P0

As a business owner, I want important changes to require appropriate confirmation so that accidental changes do not affect customers.

Examples:

price changes,
phone number changes,
address changes,
deletion of products.
25. Analytics Stories
US-AN-001 — Track Funnel

Priority: P1

As the product team, we want to understand the onboarding funnel so that we can identify where users struggle.

Potential events:

signup
business_created
import_started
import_completed
review_started
review_completed
website_generated
preview_opened
published
qr_generated
customer_visit
whatsapp_clicked
US-AN-002 — Track Activation

Priority: P1

As the product team, we want to identify activated businesses so that we can measure the core product hypothesis.

26. Story Dependencies

The core dependency chain is:

AUTH
  ↓
BUSINESS
  ↓
IMPORT
  ↓
KNOWLEDGE BASE
  ↓
CATALOG
  ↓
WEBSITE
  ↓
PREVIEW
  ↓
PUBLISH
  ↓
QR
  ↓
CUSTOMER
  ↓
WHATSAPP
  ↓
ACTIVITY

A later feature should not be allowed to hide a failure in an earlier critical dependency.

27. P0 Story Set

The minimum v0.1 validation story set is:

Authentication
    ↓
Business Creation
    ↓
Import
    ↓
Review
    ↓
Approval
    ↓
Catalog
    ↓
Website
    ↓
Preview
    ↓
Publish
    ↓
QR
    ↓
Customer Access
    ↓
WhatsApp

These stories represent the core product hypothesis.

28. P1 Story Set

Important but simplifiable:

business completeness,
source traceability,
conflict detection,
duplicate detection,
product availability,
product images,
activity,
version history,
AI content assistance,
AI proposed changes,
enquiry activity,
retry flows,
continue-later onboarding.
29. P2 Story Set

Future:

local discovery,
CRM,
loyalty,
advanced automation,
AI Business Copilot,
AI agents,
marketplace,
advanced analytics,
multi-location,
advanced payments.
30. Acceptance Criteria Principles

A story should not be considered complete if:

only the frontend exists,
only the API exists,
the happy path works but errors do not,
authorization is missing,
data can be corrupted,
mobile behavior is broken,
or the feature contradicts the PRD.
31. Definition of Done

A story is complete when:

Requirement is implemented.
UI is implemented where required.
API/backend behavior is implemented where required.
Validation exists.
Authorization exists.
Error states exist.
Loading/empty states exist where appropriate.
Relevant tests pass.
Documentation is updated.
The story can be demonstrated through its intended user flow.
32. Requirement Traceability IDs

The following ID families should be maintained:

AUTH-*   Authentication
BUS-*    Business
IMP-*    Import
KB-*     Knowledge Base
CAT-*    Catalog
WEB-*    Website
PUB-*    Publishing
QR-*     QR
WA-*     WhatsApp
ENQ-*    Enquiry
ACT-*    Activity
VER-*    Version
AI-*     AI
SET-*    Settings
PERM-*   Permissions
ERR-*    Errors
ONB-*    Onboarding
CUST-*   Customer
DATA-*   Data Integrity
SAFE-*   Safety
AN-*     Analytics

These IDs should eventually appear in:

PRD,
UI specifications,
API specifications,
database documentation,
test cases,
and implementation tickets.
33. Traceability Example

Example:

US-IMP-006
Review Imported Information
        ↓
UX-IMPORT-REVIEW
        ↓
GET /imports/:id
        ↓
ImportReview model
        ↓
TC-IMP-006

This creates an auditable chain from:

Business requirement → user need → interface → API → data → test.

34. Future Story Rule

Future features should not be added directly to this document without:

identifying the business/product reason,
assigning a priority,
defining acceptance criteria,
checking whether the feature belongs in v0.1,
and updating the relevant PRD requirements.
35. Final Core User Journey

The most important story chain is:

US-AUTH-001
Create Account
       ↓
US-BUS-001
Create Business
       ↓
US-IMP-001
Choose Import
       ↓
US-IMP-005
Extract Information
       ↓
US-IMP-006
Review
       ↓
US-IMP-008
Approve
       ↓
US-CAT-002
Add / Manage Products
       ↓
US-WEB-001
Generate Digital Presence
       ↓
US-WEB-005
Preview
       ↓
US-PUB-001
Publish
       ↓
US-QR-001
Generate QR
       ↓
US-CUST-001
Customer Views Business
       ↓
US-WA-002
Customer Starts Enquiry

This is the core v0.1 value chain.

36. Product Rule

If a proposed feature does not improve:

onboarding,
business data quality,
digital presence,
customer interaction,
owner updates,
or validation of recurring usage,

it should normally be deferred from v0.1.

37. Document Status

Status: DRAFT — FOR REVIEW

This document should remain synchronized with:

PRD.md
UX documentation
API documentation
database documentation
testing documentation

When a requirement changes, its dependent stories must be reviewed.