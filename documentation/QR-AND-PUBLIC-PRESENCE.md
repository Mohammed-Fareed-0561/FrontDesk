QR-AND-PUBLIC-PRESENCE.md
# FrontDesk — QR & Public Presence Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Public Business Presence
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The QR & Public Presence module connects a business's offline customers to its digital presence.

The goal is simple:

> A customer scans one QR code and immediately reaches the business's digital experience.

The public experience may include:

- business information,
- catalog/menu,
- products,
- services,
- opening hours,
- location,
- contact,
- WhatsApp enquiry.

---

# 2. Core Principle

FrontDesk should not treat the QR code as the product.

The QR is an entry point.

```text
Offline Customer
      ↓
     QR
      ↓
Public FrontDesk URL
      ↓
Business Experience
      ↓
Browse / Enquire / Contact
3. v0.1 Goal

A business owner should be able to:

Publish a business presence.
Get a public URL.
Generate a QR code.
Download/use the QR.
Place the QR in their physical business.
Let customers browse the business.
Let customers contact the business through WhatsApp or other supported actions.
4. Primary Use Cases
Café

QR on table:

Scan to view menu

Customer:

Scan
 ↓
Menu
 ↓
View item
 ↓
WhatsApp enquiry
Bakery

QR near storefront:

Scan to see today's cakes

Customer:

Scan
 ↓
Bakery page
 ↓
Products
 ↓
Enquire
Restaurant

QR on table or takeaway package:

Scan to view menu
Boutique

QR on visiting card:

Scan to view collection
Freelancer

QR on business card:

Scan to view services
5. Public Presence Components

A public business presence consists of:

Public Business Presence
├── Public URL
├── Website / Catalog
├── QR
├── Business Information
├── Products / Services
├── Contact Actions
└── Basic Analytics
6. Public URL

Every published business should receive a public URL.

Conceptually:

FrontDesk
   ↓
Business Slug
   ↓
Public Business Page

Example:

frontdesk.example/royal-bakes

The exact production domain will be defined separately.

7. URL Requirements

The public URL should:

be readable,
be mobile-friendly,
use a stable business identifier/slug,
avoid exposing internal database IDs where possible,
resolve only to published content.
8. Business Slug

Example:

Royal Bakes
    ↓
royal-bakes

The slug should be:

URL-safe,
unique,
stable where possible.
9. Slug Changes

If a business changes its name, FrontDesk should avoid unnecessarily breaking existing QR codes.

Future support may include:

Old URL
   ↓
Redirect
   ↓
New URL

This is especially important for printed QR codes.

10. QR Code Principle

QR codes should point to a stable public URL rather than directly embedding business information.

Correct:

QR
 ↓
Public URL
 ↓
Business

Not:

QR
 ↓
Entire Menu Data
11. Why Dynamic QR

If the business changes:

products,
prices,
opening hours,
design,

the QR should continue working.

Example:

Printed QR
     ↓
Same URL
     ↓
Updated Business

The owner should not need to reprint the QR every time the menu changes.

12. QR Generation

After publication:

Business Published
       ↓
Generate QR
       ↓
Preview
       ↓
Download
13. QR Formats

v0.1 should provide a standard QR image.

Possible formats:

PNG

Future:

SVG
PDF
Print-ready formats
14. QR Customization

Future customization may include:

business logo,
brand colors,
frame,
CTA text.

v0.1 should prioritize reliable scanning over visual customization.

15. QR Safety

QR generation should use a valid HTTPS public URL.

The QR must not contain:

private business data,
customer data,
authentication tokens,
secret information.
16. QR Lifecycle

Conceptually:

Business Draft
    ↓
Published
    ↓
QR Available
    ↓
Business Unpublished
    ↓
Public Page Disabled / Appropriate State
17. Unpublished Business

If the business has not published:

The public URL should not expose the business's private draft.

Possible response:

This business is not currently available.
18. Published Business

A published business can be accessed by customers without authentication.

Only explicitly public information should be displayed.

19. Public Data Boundary

Public website may expose:

Business Name
Description
Logo
Products
Prices
Opening Hours
Public Address
Public Phone
Public WhatsApp
Public Social Links

It must NOT expose:

Owner Account Data
Internal Notes
Customer Data
Supplier Data
Internal Costs
Private Analytics
Internal AI Memory
Audit Logs
20. Public Customer Experience

The experience should be:

Scan
 ↓
Fast Load
 ↓
Understand Business
 ↓
Find Product / Service
 ↓
Take Action

Avoid unnecessary signup requirements.

21. Mobile-First

QR users are overwhelmingly expected to arrive from mobile devices.

Therefore:

Public business pages must be designed mobile-first.

The desktop layout is secondary to the mobile experience for v0.1.

22. Mobile Requirements

The public page should:

load quickly,
use readable text,
have large tap targets,
avoid horizontal scrolling,
keep important actions accessible,
work on common mobile browsers.
23. Landing Experience

The first screen should immediately communicate:

Business Name
What they offer
Primary action

Example:

Royal Bakes

Fresh cakes and baked treats.

[View Menu]
[WhatsApp]
24. Navigation

For a small business, navigation should remain simple.

Example:

Home
Menu
About
Contact

A one-page layout is acceptable for v0.1.

25. Sticky Action

Future/optional:

A mobile sticky action bar:

[WhatsApp] [Call] [Directions]

This can significantly reduce friction.

It should not obscure important content.

26. Product Discovery

Customers should be able to browse:

Categories
   ↓
Products
   ↓
Product Details
27. Product Card

A product card may display:

Image
Name
Short Description
Price
Availability
Action

Example:

Chocolate Truffle Cake
Rich chocolate cake with truffle frosting

₹650

[Enquire]
28. Product Data Source

Product information must come from the Business Knowledge Base.

The public website should not maintain a separate product database.

29. Product Availability

If unavailable, the public page should reflect the approved business state.

Example:

Chocolate Truffle Cake

Currently unavailable

or hide the item depending on configuration.

30. Price Display

Price should be displayed using the business's configured currency.

For v0.1, the primary target is INR.

Example:

₹650
31. Product Enquiry

A customer can initiate a WhatsApp enquiry from a product.

Example:

Customer clicks:

[Enquire]

↓

WhatsApp opens

"Hi, I'd like to enquire about
Chocolate Truffle Cake."
32. WhatsApp Number

The WhatsApp destination must come from approved public business contact information.

Do not allow arbitrary frontend-supplied phone numbers to override the business's configured number.

33. WhatsApp Message Generation

The system may generate contextual messages.

Example:

Hi Royal Bakes,
I'd like to enquire about the Chocolate Truffle Cake.

Future messages may include:

Product
Quantity
Preferred date
Customer question
34. WhatsApp Flow
Customer
   ↓
Product
   ↓
Enquire
   ↓
FrontDesk generates message
   ↓
WhatsApp
   ↓
Business

FrontDesk v0.1 does not need to become a full WhatsApp inbox.

35. Simple Enquiry Flow

A general enquiry may use:

[Chat on WhatsApp]

with a generic message.

Example:

Hi, I found your business on FrontDesk
and would like to know more.
36. Contact Actions

Supported actions may include:

WhatsApp
Call
Email
Directions

Only show actions where the relevant information exists.

37. Call Action

If a public phone number exists:

[Call]

opens the device's calling interface.

38. Email Action

If a public email exists:

[Email]

opens the user's configured mail client where supported.

39. Directions Action

If a public physical location exists:

[Get Directions]

can open an appropriate map/directions destination.

The exact map integration is a separate technical decision.

40. Opening Hours

Opening hours should be read from the Business Knowledge Base.

Example:

Today
Open until 9:00 PM

Future capability may include:

Open now
Closed
Opening in 30 minutes
41. Timezone

Business opening status must use the business's timezone.

For India-focused v0.1:

Asia/Kolkata

should be the default where appropriate.

The backend should not assume the server's local timezone.

42. Business Status

The public page may show:

Open
Closed

based on approved business hours.

Future:

Temporarily Closed
Holiday Hours
43. Location

Public location may include:

Address
City
State
Postal Code
Map
Directions

Only public location information should be shown.

44. Reviews

Reviews are future functionality.

v0.1 may display a basic review section only if approved review data exists.

Full Review Engine belongs to a separate feature specification.

45. Social Links

Businesses may eventually display:

Instagram
Facebook
YouTube
Other public profiles

Only public links should be stored.

46. Business Branding

Public presence should consume:

Brand Kit
+
Website Theme

where available.

If no Brand Kit exists:

Default Theme

is used.

47. QR Branding

Future:

Brand
 ↓
QR Design

Example:

[QR]

Scan to view our menu

The QR must remain reliably scannable.

48. Public Search Metadata

The public page should expose appropriate metadata.

Potential:

Page Title
Meta Description
Open Graph
Business Structured Data

This should be generated automatically where possible.

49. Search Engine Indexing

Published businesses may eventually be indexable by search engines.

v0.1 should define a clear policy.

Possible states:

Indexable
Noindex

Default behavior should be intentional rather than accidental.

50. Local Discovery

Future FrontDesk capabilities may help businesses become discoverable through:

Business
+
Category
+
Location

Example:

Royal Bakes
Bakery
Tambaram

This belongs to the Local SEO/Discovery roadmap.

51. Avoid Search Spam

FrontDesk must not mass-generate meaningless local pages.

Location pages should exist only where they provide useful, unique information.

52. Public Performance

The public business page should prioritize:

fast initial load,
optimized images,
minimal unnecessary JavaScript,
caching,
responsive assets.
53. Public Security

The public website must not expose:

API secrets,
database credentials,
internal IDs unnecessarily,
private customer information,
private business information,
administrative endpoints.
54. Public API Boundary

The public renderer should receive only data required for rendering.

Conceptually:

Private Database
       ↓
Permission / Public Data Filter
       ↓
Public Site Data
       ↓
Public Renderer
55. Tenant Isolation

Business A:

/royal-bakes

must never accidentally render Business B's data.

Every public request must resolve the correct business safely.

56. Public Data Caching

Public business data can potentially be cached.

However, changes to:

products,
prices,
hours,
publication,

must invalidate/update relevant cached content.

57. Cache Invalidation Principle

Example:

Burger
₹180

changes to:

₹200

After publishing the change:

Knowledge Base
      ↓
Published State
      ↓
Cache Invalidation
      ↓
Customer sees ₹200

The exact caching architecture belongs in technical documentation.

58. QR Analytics

Basic QR analytics can be useful.

v0.1 may track:

QR Scan / Landing Visit

without requiring personally identifying information.

59. Public Analytics Events

Potential events:

PAGE_VIEW
PRODUCT_VIEW
CATEGORY_VIEW
WHATSAPP_CLICK
CALL_CLICK
EMAIL_CLICK
DIRECTIONS_CLICK
QR_LANDING
60. Event Principle

Analytics should answer:

What actions are customers taking?

without unnecessarily collecting:

Who exactly is this individual?

61. Privacy

FrontDesk should practice data minimization.

Do not collect personal information simply because it is technically possible.

62. Consent

If analytics or marketing technologies require user consent under applicable law, the product should provide appropriate controls.

The final legal/privacy requirements should be reviewed separately.

63. Customer Authentication

v0.1 public browsing should not require customer login.

Example:

Scan
 ↓
Browse
 ↓
Enquire

No account required.

64. Customer Accounts

Customer accounts are future.

Potential future features:

loyalty,
saved preferences,
order history,
membership,
personalized recommendations.

These should not complicate the v0.1 experience.

65. PWA Consideration

The public business experience can be built in a PWA-compatible manner.

Potential future:

Install Royal Bakes

The customer could receive:

home-screen access,
cached business page,
notifications where supported.
66. v0.1 PWA Scope

Do not require a full installable app experience to validate the product.

Prioritize:

Mobile Web
+
PWA-compatible architecture

where practical.

67. Offline Behavior

The public website may cache limited static assets.

However, v0.1 should not promise a fully offline catalog if current prices/availability can change.

Customer-facing data freshness is more important than aggressive offline caching.

68. QR Print Experience

The owner dashboard should provide:

Your QR is ready

[Download QR]
[Preview]

Future:

Download print version
Create table QR
Create counter QR
Create packaging QR
69. QR Placement Guidance

Future UI can recommend:

Place this QR on:

tables
storefront
takeaway packaging
business cards
receipts
posters

This is a growth/marketing feature rather than a core technical requirement.

70. Multiple QR Codes

Future businesses may need multiple QR codes.

Examples:

Main Website
Table 01
Table 02
Takeaway
Counter
Poster
Business Card

Each can resolve to the same business experience while tracking a source.

71. QR Campaign Tracking

Future:

QR Source:
TABLE-01

Then analytics can report:

Table 01:
184 visits
27 WhatsApp clicks

This should be implemented carefully to avoid collecting unnecessary personal information.

72. Dynamic Destination

Future QR links could support:

QR
 ↓
Smart Redirect
 ↓
Current Business Experience

This allows the business to change its public destination without reprinting.

73. Business Unpublishing

If the owner unpublishes:

Public URL
     ↓
Business unavailable

The QR itself should not become a broken random link.

A controlled state should be shown.

74. Business Deletion

Deletion is a separate lifecycle from unpublishing.

A deleted business must not remain publicly accessible indefinitely.

Backup and legal retention rules must be handled separately.

75. Preview URL

Owners should be able to preview a draft without making it public.

Conceptually:

Draft
 ↓
Private Preview

Preview URLs must not expose the draft to arbitrary users.

76. Preview Security

A preview should use controlled access, such as:

Authenticated owner

or a secure temporary preview mechanism.

Do not create predictable public draft URLs.

77. Published Version

The public URL should resolve to the latest successfully published version.

Public URL
   ↓
Published Version

Not directly to an unstable editor state.

78. Publish Failure

If a new publication fails:

Old Published Version
        ↓
Remains Live

The owner can retry the draft.

79. Public Error Handling

If the business cannot be loaded:

Avoid exposing technical errors.

Bad:

500 Database connection failed

Better:

This business is temporarily unavailable.

Please try again later.

Internal errors should be logged privately.

80. Not Found

For an invalid business URL:

Business not found.

Do not reveal internal database information.

81. Public Experience Hierarchy

Recommended:

1. Business identity
2. Primary action
3. Products/services
4. Supporting information
5. Location/contact

The exact ordering can vary by template.

82. Conversion Principle

Every business presence should have at least one obvious customer action.

Examples:

View Menu
Order
Enquire
Book
Call
WhatsApp
Get Directions

The action depends on the business type.

83. v0.1 Food Business CTA

For the initial target market:

Primary:

View Menu

Secondary:

WhatsApp

Additional:

Call
Directions
84. Public Experience Example
┌──────────────────────────────┐
│        Royal Bakes           │
│                              │
│ Fresh cakes & baked treats   │
│                              │
│ [View Menu] [WhatsApp]       │
│                              │
│ ──────────────────────────── │
│                              │
│ Popular                       │
│                              │
│ Chocolate Truffle Cake        │
│ ₹650                          │
│ [Enquire]                     │
│                              │
│ Red Velvet Cake               │
│ ₹700                          │
│ [Enquire]                     │
│                              │
│ ──────────────────────────── │
│                              │
│ Open Today                    │
│ 9:00 AM – 9:00 PM             │
│                              │
│ [Get Directions]              │
│                              │
│ [WhatsApp]                    │
└──────────────────────────────┘

This is conceptual only.

85. Public Presence and Knowledge Base

The relationship is:

Business Knowledge Base
        ↓
Public Data Filter
        ↓
Published Site
        ↓
Customer

The public layer must never bypass the Knowledge Base rules.

86. Public Presence and Website Builder

The Website Builder creates:

Design + Presentation

The Public Presence layer delivers:

Published Design
+
Approved Business Data
87. Public Presence and QR

QR points to:

Published Public Presence

not to:

Editor
Dashboard
API
Database
88. Public Presence and WhatsApp

WhatsApp is an external customer communication channel.

v0.1 should keep the integration lightweight:

Website
 ↓
WhatsApp deep link

Full WhatsApp API automation belongs to a later integration module.

89. Public Presence and Analytics

Analytics should measure meaningful actions.

The most important v0.1 events are:

Page View
Product View
WhatsApp Click
Call Click
Directions Click
90. Activation Metric

A business should not be considered fully activated merely because it has generated a website.

Suggested activation:

Business imports data
        +
Publishes
        +
Generates QR
        +
Receives first customer interaction

This aligns the public presence with actual business value.

91. v0.1 P0 Requirements
PUBLIC-P0-001
Generate public business URL.

PUBLIC-P0-002
Render published business website.

PUBLIC-P0-003
Render approved business information.

PUBLIC-P0-004
Render approved products/categories.

PUBLIC-P0-005
Render opening hours.

PUBLIC-P0-006
Render public contact information.

PUBLIC-P0-007
Provide WhatsApp action.

PUBLIC-P0-008
Provide call action where available.

PUBLIC-P0-009
Provide directions action where location exists.

PUBLIC-P0-010
Generate QR code.

PUBLIC-P0-011
Allow QR download.

PUBLIC-P0-012
Keep QR destination stable.

PUBLIC-P0-013
Support mobile-first rendering.

PUBLIC-P0-014
Prevent private data exposure.

PUBLIC-P0-015
Track basic public interaction events.

PUBLIC-P0-016
Keep failed publications from replacing working published versions.
92. v0.1 P1 Requirements
PUBLIC-P1-001
Custom domains.

PUBLIC-P1-002
QR customization.

PUBLIC-P1-003
QR SVG/PDF export.

PUBLIC-P1-004
Multiple QR codes.

PUBLIC-P1-005
QR source tracking.

PUBLIC-P1-006
Basic PWA installation.

PUBLIC-P1-007
Advanced analytics.

PUBLIC-P1-008
SEO controls.

PUBLIC-P1-009
Local SEO.

PUBLIC-P1-010
Public review integration.
93. v0.1 P2 Requirements
PUBLIC-P2-001
QR campaigns.

PUBLIC-P2-002
Dynamic QR destinations.

PUBLIC-P2-003
Personalized customer experience.

PUBLIC-P2-004
Customer accounts.

PUBLIC-P2-005
Loyalty integration.

PUBLIC-P2-006
AI customer assistant.

PUBLIC-P2-007
Online ordering.

PUBLIC-P2-008
Bookings.

PUBLIC-P2-009
Customer notifications.

PUBLIC-P2-010
AI-driven public experience optimization.
94. Acceptance Criteria

The Public Presence module is complete for v0.1 when:

A published business has a public URL.
The public URL displays the correct business.
Only published information is exposed.
Business data comes from approved Knowledge Base data.
Products/categories render correctly.
Opening hours render correctly.
Public contact actions work.
WhatsApp enquiry action works where configured.
QR can be generated.
QR can be downloaded.
QR continues working after normal business content updates.
Public pages work on mobile.
Basic customer interaction events are recorded.
Private business information is never exposed.
An unsuccessful publication does not replace the current working version.
95. Future Vision

Eventually:

Physical Business
       ↓
      QR
       ↓
FrontDesk
       ↓
┌──────────────────────────┐
│ Website                  │
│ Catalog                  │
│ WhatsApp                 │
│ Ordering                 │
│ Booking                  │
│ Reviews                  │
│ Loyalty                  │
│ Customer AI              │
│ Notifications            │
└──────────────────────────┘

The QR becomes the bridge between the physical and digital business.

96. Final Principle

The customer should never care that FrontDesk exists.

They should simply experience:

Scan → understand → act.

FrontDesk's job is to make that experience fast, trustworthy, and useful.