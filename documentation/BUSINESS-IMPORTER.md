Next, we should create the first detailed feature specification: BUSINESS-IMPORTER.md.

This is one of FrontDesk's most important v0.1 features because the product's initial wedge is:

Bring your existing business → FrontDesk understands it → you review it → FrontDesk builds your digital presence.

Create:

FrontDesk/
└── documentation/
    └── 02-product/
        └── FEATURE-SPECIFICATIONS/
            └── BUSINESS-IMPORTER.md
BUSINESS-IMPORTER.md
# FrontDesk — Business Importer Specification

**Product:** FrontDesk  
**Version:** v0.1  
**Module:** Business Importer  
**Document:** Feature Specification  
**Status:** Draft — For Review  
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Business Importer allows an existing business to bring its existing information into FrontDesk instead of recreating the business manually.

The importer is one of the primary differentiators of FrontDesk v0.1.

The core promise is:

> **"Bring your business. We'll structure it for you."**

The importer should transform messy business information into structured business data.

---

# 2. Problem

Small businesses often already have information distributed across:

- websites,
- PDFs,
- menus,
- images,
- spreadsheets,
- social profiles,
- WhatsApp catalogs,
- business documents,
- handwritten information,
- and existing digital platforms.

A traditional website builder expects the owner to manually recreate this information.

FrontDesk should reduce that work.

---

# 3. Core Concept

The importer follows:

```text
Existing Business Information
          ↓
       Import
          ↓
      Extraction
          ↓
     Normalization
          ↓
     Validation
          ↓
       Review
          ↓
       Approval
          ↓
 Business Knowledge Base

The importer must NOT directly publish extracted information.

4. Design Principle

The most important rule is:

Imported information is not automatically trusted business information.

Imported data must pass through review/approval before becoming authoritative.

5. Supported Import Sources — v0.1

The initial implementation should prioritize low-cost and technically controllable sources.

P0
1. PDF

Examples:

restaurant menu,
bakery menu,
price list,
service brochure,
business profile.
2. Image

Examples:

photographed menu,
price board,
business card,
product list,
printed brochure.
3. CSV

Examples:

name,description,price,category
Burger,Chicken burger,180,Burgers
Pizza,Cheese pizza,250,Pizza
4. Manual Entry

The user must always have a fallback.

Example:

"I don't have a file."

→ Enter information manually.

6. Future Import Sources

These should not be required for the initial release.

Potential future sources:

existing website URL,
Instagram,
Google Business Profile,
WhatsApp catalog,
additional spreadsheets,
online stores,
POS systems,
other business-management platforms.

These require separate technical, API, authentication, legal, and reliability considerations.

7. Import Entry Point

The onboarding should present:

Bring your existing business

Possible actions:

[Import PDF]

[Upload Images]

[Import CSV]

[Enter Manually]

Future:

[Import Website]

[Connect Instagram]

[Connect Google Business]

[Import WhatsApp Catalog]
8. User Flow

The complete v0.1 flow:

Create Business
      ↓
Choose Import
      ↓
Select Source
      ↓
Upload / Enter
      ↓
Validate Source
      ↓
Create Import Job
      ↓
Process
      ↓
Extract
      ↓
Normalize
      ↓
Detect Problems
      ↓
Review
      ↓
Edit
      ↓
Approve
      ↓
Save to Knowledge Base
9. Import Job

Every import operation should be represented as an import job.

Conceptually:

ImportJob
├── id
├── business_id
├── source_type
├── source_reference
├── status
├── created_at
├── started_at
├── completed_at
├── error
└── result

The exact database schema will be defined separately.

10. Import States

The importer should use explicit states.

CREATED
   ↓
UPLOADING
   ↓
UPLOADED
   ↓
PROCESSING
   ↓
EXTRACTING
   ↓
NORMALIZING
   ↓
VALIDATING
   ↓
REVIEW_REQUIRED
   ↓
APPROVED
   ↓
COMPLETED

Failure:

FAILED

Cancellation:

CANCELLED
11. State Definitions
CREATED

Import job exists but processing has not started.

UPLOADING

The source file is being uploaded.

UPLOADED

The source has been successfully received.

PROCESSING

The system is preparing the source.

Examples:

file inspection,
conversion,
page processing.
EXTRACTING

Information is being extracted.

Possible technologies:

OCR,
document parsing,
AI extraction,
CSV parsing.

The exact implementation belongs to the technical architecture.

NORMALIZING

Raw extracted information is converted into FrontDesk's structured format.

Example:

"Choc Truffle"
"Chocolate Truffle Cake"
"Chocolate truffle cake"

may potentially represent the same product.

Normalization must not blindly merge distinct products.

VALIDATING

The system checks:

required fields,
invalid values,
duplicates,
conflicts,
suspicious extraction,
missing information.
REVIEW_REQUIRED

The owner must review the extracted information.

APPROVED

The owner has approved the relevant information.

COMPLETED

Approved information has been written to the Business Knowledge Base.

12. File Validation

Before processing an uploaded file, FrontDesk should validate:

file type,
file size,
file integrity,
supported format,
upload completion.

Unsupported files should produce a clear error.

Example:

This file type isn't supported yet. Please upload a PDF, image, or CSV.

13. Security During Upload

Uploaded files should be treated as untrusted input.

The system should consider:

file type validation,
file size limits,
malware/security scanning where practical,
safe file handling,
access control,
storage isolation,
automatic cleanup policies.

Files must not be publicly accessible unless explicitly intended.

14. PDF Import

A PDF may contain:

text,
tables,
images,
scanned pages,
mixed content.

The extraction system should determine whether the PDF contains machine-readable text.

If text exists:

PDF
 ↓
Text Extraction
 ↓
Structured Extraction

If the PDF is scanned:

PDF
 ↓
Page Image
 ↓
OCR
 ↓
Structured Extraction
15. Image Import

Images may contain:

printed text,
handwritten text,
tables,
prices,
product names,
logos,
product photos.

Potential pipeline:

Image
 ↓
Image Processing
 ↓
OCR / Vision
 ↓
Text / Visual Information
 ↓
Structured Extraction
16. CSV Import

CSV is inherently more structured than PDF/image imports.

The system should allow column mapping.

Example:

CSV Column       FrontDesk Field
--------------------------------
product_name  →  Product Name
description   →  Description
price         →  Price
category      →  Category
image_url     →  Image
17. CSV Column Mapping

If column names are obvious:

name
description
price
category

FrontDesk may automatically suggest mappings.

If uncertain:

Which column contains the product price?

The owner selects the correct column.

18. Manual Import

Manual entry must always remain available.

Example:

Business Name
Description
Phone
Address
Opening Hours

Then:

Add Product

Manual entry prevents users from being blocked by unsupported sources.

19. Extraction Output

The importer should produce structured candidate data.

Example:

{
  "business": {
    "name": "Royal Bakes",
    "description": "...",
    "phone": "...",
    "location": "...",
    "opening_hours": {}
  },
  "products": [
    {
      "name": "Chocolate Truffle Cake",
      "description": "...",
      "price": 650,
      "category": "Cakes"
    }
  ]
}

This is conceptual.

The actual schema will be defined in the database/API documentation.

20. Business Information Categories

The importer should attempt to identify:

Business
├── Name
├── Description
├── Contact
├── Location
├── Opening Hours
├── Social Links
├── Products
├── Categories
├── Prices
├── Images
├── FAQs
└── Policies

Not every source will contain every category.

Missing information is acceptable.

21. Product Extraction

A product may contain:

Product
├── Name
├── Description
├── Price
├── Category
├── Image
└── Availability

The importer should only populate information that can reasonably be extracted.

22. Never Invent Critical Data

If the source says:

Chocolate Cake

but contains no price:

The system must NOT generate:

₹500

Instead:

Chocolate Cake
Price: Missing

The owner can add the price during review.

23. AI Extraction Rules

AI may:

identify entities,
classify products,
summarize descriptions,
normalize formatting,
suggest categories,
identify likely duplicates.

AI must not:

invent prices,
invent availability,
invent opening hours,
invent addresses,
invent contact numbers,
invent products,
silently overwrite approved information.
24. Confidence

Extraction may produce confidence values.

Example:

Chocolate Truffle Cake

Name:
High confidence

Price:
High confidence

Category:
Medium confidence

Potential confidence levels:

HIGH
MEDIUM
LOW
UNKNOWN

Confidence should help prioritize review.

It must not be presented as mathematical certainty unless the underlying system supports that interpretation.

25. Review Interface

The review screen is a critical part of the importer.

Conceptually:

┌─────────────────────────────────────┐
│ Review Your Business                │
│                                     │
│ ✓ Business Information              │
│                                     │
│ Products                            │
│                                     │
│ Chocolate Truffle Cake              │
│ ₹650                                │
│ ✓ High confidence                   │
│                                     │
│ Chicken Burger                      │
│ ₹?                                  │
│ ⚠ Price needs review                │
│                                     │
│ [Approve All]                       │
└─────────────────────────────────────┘

The exact UI belongs in the UX specification.

26. Review Actions

For each extracted item the owner may:

Approve
Edit
Reject

For collections:

Approve All
Review Issues
27. Review Priority

The review interface should prioritize:

missing critical fields,
conflicts,
low-confidence information,
suspicious values,
duplicates,
ordinary extracted information.

This reduces the owner's review workload.

28. Critical Fields

Examples:

Business
name,
phone,
address,
opening hours.
Product
name,
price where applicable.

Critical fields depend on business type.

A service provider may not have product prices.

29. Missing Information

Example:

⚠ Missing information

Opening hours
Phone number
3 product prices

Action:

Fix Missing Information

The owner can complete the information manually.

30. Conflicting Information

Example:

⚠ Conflicting price

Chocolate Cake

PDF:
₹650

CSV:
₹700

Which one should FrontDesk use?

[₹650]
[₹700]
[Enter different value]

The system must not silently choose without sufficient confidence.

31. Duplicate Detection

Example:

Potential duplicate:

Chocolate Truffle Cake
Chocolate Truffle Cake - 1kg

The system should ask:

Are these the same product?

Possible actions:

Merge
Keep Both
Ignore Suggestion
32. Normalization

Normalization may include:

capitalization,
whitespace,
currency formatting,
phone formatting,
category formatting,
duplicate whitespace,
consistent naming.

Example:

"₹ 650"
"650"
"Rs.650"

may normalize to:

650 INR

However, the original source should remain traceable where required.

33. Price Handling

Prices require special care.

The system should preserve:

numeric amount,
currency,
pricing unit where known.

Examples:

₹150
₹150 / plate
₹500 / kg
Starting at ₹999

These are not necessarily equivalent.

The data model should support richer pricing later.

34. Product Availability

Availability should only be imported when supported by the source.

Examples:

Available
Unavailable
Out of stock
Seasonal
Unknown

If no availability information exists:

Unknown

The system must not assume:

Available

simply because the product exists in the source.

35. Images

The importer may identify:

business logo,
product images,
gallery images.

Images should be associated with the appropriate entity where confidence is sufficient.

Incorrect image association must be reviewable.

36. Logo Detection

If a source contains a recognizable logo:

Detected Logo
[Preview]

Use as business logo?

[Yes]
[No]

The owner should remain in control.

37. Source Traceability

Where possible, each extracted item should retain source information.

Example:

Product:
Chocolate Truffle Cake

Source:
menu.pdf

Page:
2

For image:

Source:
menu-photo.jpg

For CSV:

Source:
products.csv
Row:
24

This makes verification easier.

38. Import History

The owner should eventually be able to see previous imports.

Example:

Import History

Aug 26
menu.pdf
Completed

Aug 20
products.csv
Completed

Aug 10
menu-old.pdf
Failed

Full import-history UI may be P1.

39. Re-import

Future versions should allow:

Import updated menu.

Potential behavior:

Existing Business Data
        +
New Import
        ↓
Compare
        ↓
Changes Detected
        ↓
Review
        ↓
Apply

This is especially valuable for businesses that frequently change menus.

A simplified version may be considered after v0.1 validation.

40. Import Diff

Future import comparison:

Added:
+ Mango Cake

Changed:
Chocolate Cake
₹600 → ₹650

Removed:
Red Velvet Cake

This prevents a new import from blindly replacing the existing business.

41. Partial Success

An import can partially succeed.

Example:

✓ Business information found
✓ 38 products found
⚠ 4 products have missing prices
⚠ 2 images could not be identified

The system should preserve valid extraction results rather than failing everything.

42. Complete Failure

If nothing useful can be extracted:

We couldn't find enough structured information in this file.

Try:
• Upload a clearer image
• Upload the original PDF
• Use CSV
• Enter information manually
43. OCR Failure

If OCR cannot reliably read an image:

We couldn't read some text from this image.

Try uploading:
• a clearer image
• a higher-resolution photo
• a straightened photo
44. AI Failure

If the AI extraction service fails:

We couldn't complete AI extraction right now.

Your uploaded file is safe.

[Retry]
[Enter Manually]

The system must not lose the original source unnecessarily.

45. Network Failure

If the upload is interrupted:

Upload interrupted.

[Retry]

The UI should avoid giving the impression that the import completed.

46. Import Cancellation

If the user cancels processing:

CANCELLED

Existing approved business data must remain unchanged.

47. Import Does Not Overwrite Approved Data

This is a critical rule.

Example:

Existing:

Burger
₹180

New import:

Burger
₹200

The new value must not silently replace the approved value.

Instead:

Conflict detected

Existing:
₹180

New import:
₹200

[Keep ₹180]
[Use ₹200]
48. Import Isolation

Each import should initially operate against a temporary/import dataset.

Conceptually:

Source
 ↓
Import Workspace
 ↓
Review
 ↓
Approved Business Data

This prevents incomplete extraction from corrupting the live business.

49. Import Workspace

The owner should be able to leave the review and return later.

Example:

Import Review
Status: 63% reviewed

This may be P1 if implementation complexity is high.

50. Import Progress

Progress should be meaningful.

Avoid fake progress bars.

Bad:

████████████ 83%

when the system does not actually know progress.

Prefer:

Uploading...
Reading document...
Extracting products...
Checking information...
Preparing review...
51. Processing Architecture Concept

The importer should eventually be separated into services/components:

Import API
    ↓
Import Job
    ↓
Source Processor
    ↓
Extraction Layer
    ↓
Normalization Layer
    ↓
Validation Layer
    ↓
Review Dataset
    ↓
Approval
    ↓
Business Knowledge Base
52. Source Processor

Different source types should have different processing strategies.

PDF
 ↓
PDF Processor

Image
 ↓
Image Processor

CSV
 ↓
CSV Processor

They eventually produce a common intermediate representation.

53. Common Intermediate Representation

All import sources should converge into a normalized candidate format.

Conceptually:

ImportedBusiness
├── business
├── products
├── categories
├── contacts
├── locations
├── hours
├── media
└── metadata

This prevents the rest of FrontDesk from needing to understand every source format.

54. Import Metadata

Each imported object may contain metadata such as:

source
source_type
source_location
confidence
extraction_method
created_at

This is primarily for internal traceability.

55. Extraction Method

Possible values:

MANUAL
OCR
PDF_TEXT
CSV_PARSE
VISION_MODEL
LLM
HYBRID

The actual supported values will be finalized in the technical architecture.

56. AI Hallucination Protection

The extraction system should use constrained structured output.

Instead of:

"Tell me everything about this business."

prefer:

Extract products, prices, categories, and descriptions using the provided source. Do not infer missing values.

The AI output should be validated before entering the review layer.

57. Schema Validation

AI output must be validated against an expected schema.

Example:

Product
├── name: string
├── description: optional string
├── price: optional number
├── currency: optional string
└── category: optional string

Invalid output must not directly enter business data.

58. Human-in-the-Loop Principle

The importer should follow:

AI
 ↓
Suggestion
 ↓
Human Review
 ↓
Approval

rather than:

AI
 ↓
Production

This is particularly important for:

prices,
contact details,
business hours,
product availability,
and other customer-facing information.
59. Import Performance

The importer should feel responsive even when processing takes time.

Long-running tasks should be asynchronous where appropriate.

The UI should allow the user to:

see progress,
leave the screen where supported,
return later,
and receive a completion state.
60. Import Cost Principle

The importer should be designed to minimize unnecessary AI/API usage.

Prefer:

Deterministic Parsing
       ↓
OCR if needed
       ↓
AI only where useful

rather than sending every file blindly to a large AI model.

This is especially important because FrontDesk v0.1 is intended to be developed with minimal cost.

61. Free-First Strategy

For development and testing, prefer:

open-source parsers,
local OCR,
local models where practical,
deterministic CSV parsing,
lightweight extraction,
provider abstraction.

Paid APIs should not be hard-coded into the product architecture.

62. Import Security

The importer must prevent:

unauthorized file access,
cross-business file access,
accidental public exposure,
unsafe file execution,
unvalidated data insertion.
63. Prompt Injection Consideration

Imported documents may contain text intended to manipulate AI systems.

Example:

IGNORE PREVIOUS INSTRUCTIONS

The importer must treat source content as data, not instructions.

Conceptually:

System Instructions
       ↓
Extraction Task
       ↓
Untrusted Source Content

Source content must not override system behavior.

64. Malicious or Suspicious Content

The importer should not execute:

scripts,
macros,
embedded commands,
arbitrary code.

Imported files should be treated as untrusted data.

65. Privacy

Imported business files may contain sensitive information.

The system should:

restrict access,
minimize retention where possible,
define deletion policies,
avoid exposing source files publicly,
and document how AI processing handles uploaded information.
66. Source Retention

The technical architecture must define whether original files are:

permanently stored,
temporarily stored,
deleted after processing,
retained for re-import.

The default should favor minimizing unnecessary retention.

67. User Feedback

After successful import:

Your business information is ready.

We found:

✓ Business information
✓ 42 products
✓ 6 categories
⚠ 3 products need price verification

The owner should immediately understand the next action.

68. Import Completion

Completion should not simply say:

Done.

Instead:

Your business has been imported.

42 products found
6 categories found
3 items need review

[Review Business]
69. Import Success Metrics

The product team should measure:

Import Start Rate

Percentage of new businesses that begin an import.

Import Completion Rate

Percentage of started imports that reach usable results.

Review Completion Rate

Percentage of imports that owners finish reviewing.

Approval Rate

Percentage of extracted information approved.

Correction Rate

Percentage of extracted fields changed by owners.

High correction rates may indicate extraction quality problems.

Time to First Publish

Time between starting import and publishing the digital presence.

This is a key metric.

70. Import Quality Metrics

Potential metrics:

Extraction Accuracy
Field Completion
Correction Rate
Duplicate Detection Precision
Conflict Detection Rate
Import Failure Rate

These metrics should be evaluated separately by source type.

71. Business Importer KPIs

Primary:

Time from existing business information → published digital presence

Secondary:

import completion,
review completion,
extraction accuracy,
correction rate,
publish conversion,
customer interaction after publish.
72. Acceptance Criteria — Overall

The Business Importer is complete for v0.1 when:

User can select a supported source.
User can provide the source.
System validates the source.
Import job is created.
Source is processed.
Business information is extracted.
Extracted information is structured.
Missing information is not invented.
Extraction results enter a review state.
Owner can edit results.
Owner can approve results.
Approved data enters the Business Knowledge Base.
Existing approved data is not silently overwritten.
Failures are communicated clearly.
Unauthorized users cannot access another business's import data.
73. P0 Requirements
IMP-P0-001
Support PDF import.

IMP-P0-002
Support image import.

IMP-P0-003
Support CSV import.

IMP-P0-004
Support manual entry.

IMP-P0-005
Create import jobs.

IMP-P0-006
Process imported data.

IMP-P0-007
Extract structured business information.

IMP-P0-008
Prevent unverified data from becoming authoritative.

IMP-P0-009
Provide review interface.

IMP-P0-010
Allow owner corrections.

IMP-P0-011
Allow owner approval.

IMP-P0-012
Write approved data to Business Knowledge Base.

IMP-P0-013
Handle failures safely.

IMP-P0-014
Protect imported data.

IMP-P0-015
Prevent AI from inventing critical business information.
74. P1 Requirements
IMP-P1-001
Confidence indicators.

IMP-P1-002
Source traceability.

IMP-P1-003
Conflict detection.

IMP-P1-004
Duplicate detection.

IMP-P1-005
Import history.

IMP-P1-006
Continue review later.

IMP-P1-007
Partial import recovery.

IMP-P1-008
Improved image/logo association.

IMP-P1-009
Import comparison.

IMP-P1-010
Re-import workflow.
75. P2 / Future
IMP-P2-001
Website URL import.

IMP-P2-002
Instagram import.

IMP-P2-003
Google Business import.

IMP-P2-004
WhatsApp catalog import.

IMP-P2-005
POS import.

IMP-P2-006
Ecommerce platform migration.

IMP-P2-007
Automatic recurring imports.

IMP-P2-008
AI-powered business migration from multiple platforms.
76. Future — "Import My Business"

The long-term experience should become:

Import My Business
        ↓
Website
PDF
Instagram
Google
WhatsApp
CSV
Images
        ↓
FrontDesk understands everything
        ↓
Detect conflicts
        ↓
Build Business Knowledge Base
        ↓
Preview
        ↓
Publish

This should become one of FrontDesk's strongest acquisition experiences.

77. Future — Website URL Rebuild

Example:

Owner enters:

examplecafe.com

FrontDesk analyzes:

business information,
pages,
products,
contact information,
structure.

Then:

Existing Website
      ↓
Extract Business Data
      ↓
Create New FrontDesk Structure
      ↓
New Design
      ↓
Preview

Important:

FrontDesk should use the business's authorized content appropriately and generate a new implementation rather than blindly copying third-party copyrighted designs or content.

78. Future — Multi-Source Import

Eventually:

Website
   +
Instagram
   +
Google
   +
PDF
   +
CSV
   +
WhatsApp
   ↓
Unified Business Import

The system should identify conflicts across sources.

79. Future — Continuous Business Sync

Long-term:

Business
   ↓
FrontDesk
   ↕
External Sources

Changes could be detected and presented for approval.

This should only be implemented after source integrations are reliable.

80. Importer Design Principle

The importer should not simply answer:

"Can we extract this?"

It should answer:

"Can we safely turn this into reliable business information?"

That distinction is fundamental to FrontDesk.

81. Final Architecture Principle

The importer is not the Business Knowledge Base.

The relationship is:

IMPORTER
   ↓
Candidate Data
   ↓
Review
   ↓
Approval
   ↓
BUSINESS KNOWLEDGE BASE
   ↓
Website
Catalog
QR
WhatsApp
AI
Future Operations

The Business Knowledge Base remains the source of truth.

82. Document Status

Status: DRAFT — FOR REVIEW

This document should remain synchronized with:

PRD.md
USER-STORIES.md
BUSINESS-KNOWLEDGE-BASE.md
API documentation
database documentation
UI/UX documentation
AI architecture
security documentation
testing documentation

Any change to import behavior should be reviewed against these dependent documents.