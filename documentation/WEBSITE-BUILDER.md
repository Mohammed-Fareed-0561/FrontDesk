WEBSITE-BUILDER.md
# FrontDesk — Website Builder Specification

**Product:** FrontDesk  
**Version:** v0.1  
**Module:** Website Builder / Digital Presence Builder  
**Document:** Feature Specification  
**Status:** Draft — For Review  
**Last Updated:** 2026-08-26

---

# 1. Purpose

The FrontDesk Website Builder converts approved business information into a professional, mobile-first digital presence.

The builder should allow non-technical business owners to:

- generate a website,
- select a design,
- edit content,
- rearrange supported sections,
- customize basic appearance,
- preview changes,
- publish,
- and update the website later.

The owner should not need to understand:

- HTML,
- CSS,
- JavaScript,
- hosting,
- databases,
- deployment,
- responsive design,
- SEO configuration,
- or frontend development.

---

# 2. Core Product Principle

The Website Builder is not the source of business information.

It is a presentation layer over the Business Knowledge Base.

```text
Business Knowledge Base
          ↓
      Site Generator
          ↓
      Site Structure
          ↓
       Theme
          ↓
     Visual Editor
          ↓
        Preview
          ↓
       Publish
3. Core Rule

Business data and website design must remain separate.

Example:

Business Knowledge Base

Product:
Chocolate Truffle Cake

Price:
₹650

The website decides:

Display:
Product Card

The website must not create a second independent copy of:

Chocolate Truffle Cake = ₹650
4. v0.1 Goal

The v0.1 builder should prove:

A non-technical business owner can create and publish a professional business website without needing a developer.

The system does NOT need to compete with:

Webflow,
Framer,
Wix,
Squarespace,
full Shopify theme editing,
professional design software.

The initial editor should be intentionally constrained.

5. v0.1 Supported Business Types

The first design system should prioritize:

cafés,
restaurants,
bakeries,
small food businesses.

The architecture should remain extensible to:

salons,
boutiques,
furniture stores,
freelancers,
photographers,
service providers,
local shops.
6. Website Generation Flow
Approved Business Data
        ↓
Choose Business Type
        ↓
Choose Design
        ↓
Generate Site
        ↓
Review
        ↓
Customize
        ↓
Preview
        ↓
Validate
        ↓
Publish
7. First-Time Experience

After importing and approving business information:

Your business is ready.

We found:

✓ Business information
✓ 42 products
✓ 6 categories
✓ Opening hours
✓ Contact information

Then:

Create your website

8. Design Selection

The owner can choose from a limited set of templates.

Example:

Choose a style

[Modern Café]
[Premium Bakery]
[Minimal Restaurant]
[Bold Food]

Each template should preview real business data.

9. Template Principle

Templates define:

layout,
visual hierarchy,
section composition,
spacing,
typography,
component arrangement,
visual style.

Templates must not contain hard-coded business facts.

10. Template Structure

Conceptually:

Template
├── Metadata
├── Supported Sections
├── Layout
├── Design Tokens
├── Component Variants
└── Responsive Rules
11. Template Data

A template should describe:

Hero
About
Categories
Products
Gallery
Reviews
Contact
Location
Hours
Footer

It should not store:

Royal Bakes
₹650
Tambaram

Those come from the Business Knowledge Base.

12. Site Structure

A v0.1 website may support:

Home
├── Hero
├── About
├── Featured Products
├── Categories
├── Gallery
├── Business Information
├── Opening Hours
├── Location
├── Contact
└── Footer

Not every template needs every section.

13. Sections

Sections are the main building blocks.

Examples:

Hero
About
Products
Categories
Gallery
Contact
Location
Hours
CTA
Footer
14. Section Rules

Each section should have:

id
type
content_reference
settings
visibility
order

The exact data model belongs in the technical documentation.

15. Section Ordering

The owner should be able to reorder supported sections.

Example:

Hero
Products
About
Gallery
Contact

can become:

Hero
About
Products
Gallery
Contact
16. Drag-and-Drop

The builder should eventually support simple drag-and-drop.

For v0.1, drag-and-drop should primarily operate at the:

section/block level

rather than allowing unrestricted pixel-level design.

This keeps the editor manageable and responsive.

17. Why Constrained Editing

A completely unrestricted editor creates problems:

broken layouts,
poor mobile experiences,
inconsistent spacing,
inaccessible designs,
difficult responsive behavior,
difficult AI manipulation,
complicated rendering.

FrontDesk should optimize for:

Professional results with minimal effort.

Not:

Maximum design freedom.

18. Section Controls

Each section may provide:

Move Up
Move Down
Duplicate
Hide
Edit
Delete

Some sections may be required and cannot be deleted.

19. Required Sections

A template may define required sections.

Example:

Hero
Contact
Footer

The owner may be prevented from deleting critical sections.

20. Optional Sections

Optional sections may include:

gallery,
reviews,
featured products,
about,
CTA.

These can be added or removed.

21. Add Section

The owner can select:

+ Add Section

Example:

Add Section

Business
├── About
├── Contact
├── Hours
├── Location

Products
├── Product Grid
├── Featured Products
├── Categories

Media
├── Gallery
├── Banner
22. Section Library

The section library should only show components compatible with the selected template/design system.

23. Product Sections

Product sections must consume the Business Knowledge Base.

Examples:

Featured Products
Product Grid
Category List
Popular Items
24. Product Selection

The owner may eventually choose:

Show:
[All Products]

or

Show:
[Selected Products]

The actual product data remains in the Knowledge Base.

The website stores only the presentation configuration.

25. Product Changes

If the owner changes:

Burger
₹180 → ₹200

in the Business Knowledge Base:

The website should automatically use the current approved value when the relevant product is displayed.

The owner should not need to manually edit the website card.

26. Product Availability

If a product becomes unavailable:

Knowledge Base
       ↓
Product:
OUT_OF_STOCK
       ↓
Website
       ↓
Appropriate display

Example:

Currently unavailable

or the product may be hidden depending on business settings.

27. Hero Section

The hero may contain:

business name,
short description,
primary CTA,
image/background,
optional secondary CTA.

Example:

Royal Bakes

Fresh cakes made for every occasion.

[View Menu]
[Contact Us]
28. Hero Rules

The hero must use approved business information.

AI may assist with wording only when requested or enabled.

AI must not invent:

awards,
rankings,
claims,
certifications,
statistics.
29. About Section

The About section can use:

business description,
business story,
owner-provided content.

AI-generated rewriting must remain grounded in the source information.

30. Contact Section

The contact section may include:

phone,
WhatsApp,
email,
contact CTA.

Only approved public contact information should appear.

31. Location Section

The location section may include:

address,
map,
directions CTA.

The system should avoid exposing private location information.

32. Opening Hours Section

Opening hours are retrieved from the Business Knowledge Base.

The website should not maintain a separate manual copy.

33. Footer

Footer may contain:

business name,
contact,
social links,
location,
legal links where available.
34. Theme System

The builder should use a centralized design-token system.

Conceptually:

Theme
├── Colors
├── Typography
├── Spacing
├── Radius
├── Shadows
├── Buttons
├── Cards
├── Inputs
└── Icons
35. Design Tokens

Example:

Primary Color
Secondary Color
Background Color
Text Color
Muted Text Color
Border Color

Heading Font
Body Font

Small Radius
Medium Radius
Large Radius

Small Spacing
Medium Spacing
Large Spacing

The exact token structure belongs in the UI/UX/design-system documentation.

36. Brand Customization

The owner should eventually be able to change:

primary color,
secondary color,
typography,
button style,
card style.

Changing a token should update all relevant components.

37. Global Theme Change

Example:

Primary:
Blue

→

Green

All components using the primary token should update.

The owner should not need to edit every button individually.

38. Brand Kit Integration

Future Brand Kit:

Logo
Colors
Fonts
Button Style
Image Style
Tone

The website builder consumes the Brand Kit.

39. Design Lock

Future capability:

The owner can lock:

🔒 Logo
🔒 Brand Colors
🔒 Fonts

AI and automatic theme operations cannot modify locked values without permission.

40. Typography

The builder should provide a controlled font selection system.

Avoid allowing arbitrary font combinations in v0.1.

Provide curated combinations instead.

Example:

Modern
Elegant
Friendly
Premium
Minimal
41. Responsive Design

Every generated website must be responsive.

Supported targets:

Mobile
Tablet
Desktop
42. Responsive Principle

The owner should not need to manually rebuild the site for mobile.

The design system should define responsive behavior automatically.

43. Mobile Preview

The builder should provide a mobile preview.

Example controls:

[Desktop] [Tablet] [Mobile]
44. Responsive Safety

The system should prevent or detect:

horizontal overflow,
unreadable text,
overlapping components,
clipped images,
broken navigation,
inaccessible buttons.
45. Image Handling

Images should support:

automatic resizing,
appropriate aspect ratios,
responsive delivery,
lazy loading where appropriate.

Future image optimization can become part of Performance Autopilot.

46. Image Cropping

The owner may eventually choose:

Cover
Contain
Original

or a controlled focal point.

The v0.1 editor should avoid complicated image manipulation.

47. Navigation

The site should provide simple navigation.

For a one-page business site:

Home
Menu
About
Contact

may scroll to sections.

Multi-page websites can be added later.

48. v0.1 Site Architecture

Prefer a simple one-page or lightweight multi-page structure.

Do not build a full CMS in v0.1.

49. Customer CTA

Important customer actions should be easy to access.

Examples:

View Menu
WhatsApp
Call
Get Directions
Enquire
50. WhatsApp CTA

The website may contain:

Chat on WhatsApp

The button should use the approved business WhatsApp number.

51. Product Enquiry CTA

A product card may include:

Enquire

The system can generate a contextual message.

Example:

Hi, I'd like to enquire about the
Chocolate Truffle Cake.

The product data should come from the Knowledge Base.

52. Editor Layout

Conceptual editor:

┌──────────────────────────────────────────────┐
│ FrontDesk     Preview     Save     Publish   │
├──────────────┬───────────────────────────────┤
│              │                               │
│ Sections     │                               │
│              │        Website Preview        │
│ Hero         │                               │
│ About        │                               │
│ Products     │                               │
│ Gallery      │                               │
│ Contact      │                               │
│              │                               │
├──────────────┴───────────────────────────────┤
│ Properties / Settings                        │
└──────────────────────────────────────────────┘

This is conceptual and will be refined in the UI/UX documentation.

53. Editor Modes

Potential modes:

Edit
Preview
Publish

Future:

Mobile
Tablet
Desktop
54. Editing Content

When selecting a section:

Section:
Hero

Content:
Title
Description
Primary CTA
Secondary CTA
Image

The owner edits supported fields without touching code.

55. Editing Business Data vs Editing Presentation

This distinction is critical.

If the owner edits:

Burger price = ₹200

that should update the Business Knowledge Base.

If the owner edits:

Burger card layout = large

that should update the Website Presentation configuration.

56. Data Editing Rule

The builder should make the distinction visible.

Example:

Product Information

Managed in:
Business Catalog

[Edit Product]

rather than creating a duplicate price field inside the website editor.

57. Presentation Configuration

The website may store:

Product display style:
Card

Products per row:
3

Show image:
Yes

Show description:
Yes

Show price:
Yes

These are presentation settings.

58. Template Switching

The owner may eventually switch templates.

When switching:

Business Data
      ↓
New Template
      ↓
New Presentation

Business data should remain unchanged.

59. Template Switching Safety

Before applying a major template change:

Preview new design?

The current published version should remain intact until the owner publishes.

60. Remix / Inspiration

Future feature:

Remix This Business

The owner can provide an inspiration source.

FrontDesk can extract:

layout patterns,
section hierarchy,
typography hierarchy,
visual style,
component arrangement.

It should not blindly copy protected third-party content or proprietary assets.

The result should be a new FrontDesk design using the owner's business data.

This is P2/future, not a v0.1 requirement.

61. AI Website Changes

Future capability:

What would you like to change?

"Make the homepage more premium."

AI converts this into structured design changes.

Example:

Change Proposal

Theme:
Increase spacing

Typography:
Use premium heading preset

Hero:
Increase visual prominence

[Preview]
[Apply]

AI should not directly manipulate arbitrary frontend code.

62. AI Change Safety

AI changes should follow:

User Request
     ↓
Interpretation
     ↓
Structured Change
     ↓
Validation
     ↓
Preview
     ↓
Approval
     ↓
Apply
63. AI Change Scope

AI should operate on a controlled design schema.

Example:

section.order
section.visibility
theme.color.primary
theme.radius
component.variant

Not:

execute arbitrary JavaScript
64. Preview

Preview must show the proposed state before publication.

The owner should be able to inspect:

desktop,
mobile,
navigation,
products,
contact actions.
65. Preview vs Published

The system should maintain a distinction:

Draft
Published

Example:

Current Published:
Version 12

Draft:
Version 13
66. Save Behavior

Changes should not be lost unexpectedly.

The builder should autosave where technically practical.

However:

Autosaving a draft is not the same as publishing it.

67. Publishing

Publishing should be explicit.

Example:

[Save Draft]

[Preview]

[Publish]
68. Publish Validation

Before publication, FrontDesk should check:

required business information,
broken links,
missing important sections,
mobile layout issues,
invalid configuration,
missing customer contact method where applicable.
69. Publish Failure

If publication fails:

Your draft is safe.

We couldn't publish the latest version.

[Retry]

The existing published version should remain active.

70. Zero-Downtime Principle

A failed draft publication should not destroy the currently published site.

Conceptually:

Published Version
        +
Draft Version
        ↓
Publish
        ↓
New Published Version
71. Version History

Future version history:

Today 7:30 PM
Today 5:10 PM
Yesterday
Aug 20

Each version can support:

Preview
Restore
72. Undo

Basic editor undo/redo should eventually support:

Undo
Redo

This is separate from full version restoration.

73. AI Undo

Future:

Undo AI Changes

This should reverse the complete AI task rather than forcing the owner to manually undo multiple changes.

74. Business Safety Mode

Future:

Before a major AI change:

AI detected a large change.

47 products may be affected.

[Create Backup]
[Continue]
[Cancel]
75. SEO

v0.1 should provide basic SEO automatically.

Potentially:

page title,
meta description,
canonical URL,
basic structured data,
sitemap,
Open Graph information.

The owner should not need to configure these manually.

76. SEO Source

SEO information should use approved business information.

AI may assist with metadata generation but should not invent unsupported claims.

77. Local SEO

Future:

Business
+
Location
+
Services/Products

can support local search optimization.

Avoid mass-generating low-value location pages.

78. Accessibility

The builder should aim for accessible defaults.

Examples:

sufficient contrast,
readable typography,
semantic structure,
keyboard-accessible controls,
alt text support,
accessible buttons,
form labels.
79. Accessibility Validation

Future AI Website Critic:

Accessibility:
87/100

Issues:
2 images missing alt text
1 low contrast component
80. Performance

Generated sites should prioritize:

optimized images,
minimal JavaScript,
lazy loading,
efficient fonts,
caching,
responsive images.
81. Performance Principle

A beautiful website that loads poorly is not a successful FrontDesk website.

The builder should prefer:

Good visual quality + good performance

over excessive animation.

82. Animations

v0.1 should use controlled animation presets.

Examples:

None
Subtle
Smooth

Avoid arbitrary animation timelines in v0.1.

83. Component System

The builder should be component-driven.

Potential components:

Button
Card
Product Card
Category Card
Image
Text
Heading
CTA
Navbar
Footer
Gallery
Contact Block
84. Component Variants

A component can have controlled variants.

Example:

Product Card

Variant:
Compact
Standard
Featured

This provides flexibility without arbitrary styling.

85. Component Safety

Components should have defined:

accepted data,
visual variants,
responsive behavior,
accessibility behavior.
86. Website Schema

The site can be represented conceptually as:

{
  "site": {
    "template": "modern-cafe",
    "theme": {},
    "pages": [
      {
        "slug": "/",
        "sections": [
          {
            "type": "hero",
            "config": {}
          },
          {
            "type": "product-grid",
            "config": {}
          }
        ]
      }
    ]
  }
}

This is illustrative.

The final schema belongs in technical documentation.

87. Why a Structured Site Schema

A structured site representation enables:

visual editing,
AI changes,
versioning,
template switching,
validation,
rendering,
future migration.
88. Do Not Store Arbitrary HTML as the Primary Model

Avoid making:

entire website = HTML string

the primary representation.

This makes:

editing,
validation,
AI modification,
responsive behavior,
migrations

much harder.

A structured component tree is preferable.

89. Rendering Architecture

Conceptually:

Site Schema
    ↓
Renderer
    ↓
Components
    ↓
HTML/CSS
    ↓
Customer
90. Editor Architecture

Conceptually:

Site Schema
    ↓
Editor State
    ↓
Visual Editor
    ↓
Schema Changes
    ↓
Preview Renderer
91. Customer Renderer

The public website should consume a validated published site state.

Conceptually:

Published Site
      ↓
Public Renderer
      ↓
Customer
92. Draft Renderer

The editor should be able to render:

Draft Site

without changing:

Published Site
93. Publishing Snapshot

When publishing:

Draft Site
    ↓
Validation
    ↓
Immutable / identifiable published snapshot
    ↓
Public Renderer

This provides a stable public state.

94. Custom Domain

Custom domains are future/P1.

v0.1 may use a FrontDesk-managed URL.

Example:

frontdesk.example/business/royal-bakes

The exact URL structure will be decided during technical architecture.

95. PWA

A public business presence may eventually support PWA installation.

However, v0.1 should not require a full native application.

The initial priority is:

Fast mobile web experience.

96. QR Integration

The QR should point to the published business URL.

Example:

QR
 ↓
Published FrontDesk Business

QR generation must not depend on the editor.

97. Analytics Integration

The site may emit basic events:

PAGE_VIEW
PRODUCT_VIEW
WHATSAPP_CLICK
CALL_CLICK
DIRECTIONS_CLICK

Analytics must not store more customer data than necessary.

98. Website Health

Future:

Website Health

Performance: 94
Accessibility: 91
SEO: 87
Mobile: 96

This should eventually be integrated with AI Website Critic.

99. AI Website Critic

Future capability:

AI Website Health

3 issues found:

⚠ Hero CTA is weak
⚠ 2 images lack alt text
⚠ Mobile spacing is inconsistent

[Fix All]

AI fixes should create structured proposals rather than directly editing arbitrary code.

100. Website Builder and Business Memory

Future AI design behavior can use:

Brand:
Premium

Preference:
No emojis

Locked:
Brand colors

The AI must respect these constraints.

101. Website Builder and Business Knowledge

The builder should always distinguish:

Business Facts

from:

Presentation Decisions

Example:

Fact:
Opening time = 9 AM

Presentation:
Display hours as a card
102. Data Flow
Business Knowledge Base
        ↓
Site Generation
        ↓
Site Schema
        ↓
Visual Editor
        ↓
Draft
        ↓
Validation
        ↓
Published Snapshot
        ↓
Public Website
103. v0.1 Scope

The v0.1 builder should support:

P0

✓ Generate website
✓ Limited templates
✓ Business data binding
✓ Basic section editing
✓ Section reordering
✓ Basic theme customization
✓ Product sections
✓ Contact
✓ Location
✓ Opening hours
✓ Preview
✓ Mobile responsiveness
✓ Save draft
✓ Publish
✓ Public URL
✓ Basic validation
104. v0.1 Exclusions

Do NOT require:

Full freeform canvas
Pixel-perfect positioning
Advanced animations
Complex multi-page CMS
Custom JavaScript
Custom CSS editor
Advanced e-commerce
Custom domain management
Advanced SEO controls
AI website agent
Full collaborative editing
Template marketplace
Designer marketplace

These can be future capabilities.

105. P1 Features

Potential next-stage features:

More templates
Brand Kit
Better visual editor
Drag-and-drop sections
Advanced responsive controls
Version history
Undo/redo
SEO controls
Accessibility checker
Performance optimization
Custom domain
More business types
106. P2 Features

Future:

Remix This Business
AI website changes
AI Website Critic
AI Website Repair
Template marketplace
Designer marketplace
Collaborative editing
Advanced animations
Multi-page builder
Plugin system
Developer components
107. Acceptance Criteria

The Website Builder is complete for v0.1 when:

Approved business data can generate a website.
User can choose from supported templates.
Template uses business data rather than hard-coded business information.
User can edit supported sections.
User can reorder supported sections.
User can customize basic theme settings.
Product information comes from the Business Knowledge Base.
Website works on mobile.
User can preview changes.
User can save a draft.
User can publish.
Failed publishing does not destroy the current published version.
Public website uses approved business information.
Basic validation runs before publishing.
Unauthorized users cannot edit another business's website.
108. P0 Requirements
WEB-P0-001
Generate website from approved business data.

WEB-P0-002
Support template selection.

WEB-P0-003
Support structured site schema.

WEB-P0-004
Support basic section editing.

WEB-P0-005
Support section ordering.

WEB-P0-006
Support basic theme customization.

WEB-P0-007
Support product/catalog sections.

WEB-P0-008
Support business information sections.

WEB-P0-009
Support responsive rendering.

WEB-P0-010
Support preview.

WEB-P0-011
Support draft saving.

WEB-P0-012
Support publishing.

WEB-P0-013
Protect current published version.

WEB-P0-014
Validate before publishing.

WEB-P0-015
Enforce business ownership.
109. P1 Requirements
WEB-P1-001
Version history.

WEB-P1-002
Undo/redo.

WEB-P1-003
Brand Kit.

WEB-P1-004
Additional templates.

WEB-P1-005
Advanced responsive controls.

WEB-P1-006
SEO controls.

WEB-P1-007
Accessibility checks.

WEB-P1-008
Performance optimization.

WEB-P1-009
Custom domains.

WEB-P1-010
Advanced business types.
110. P2 Requirements
WEB-P2-001
Remix This Business.

WEB-P2-002
AI Website Changes.

WEB-P2-003
AI Website Critic.

WEB-P2-004
Automatic Website Repair.

WEB-P2-005
Collaborative Editing.

WEB-P2-006
Template Marketplace.

WEB-P2-007
Designer Marketplace.

WEB-P2-008
Plugin System.

WEB-P2-009
Advanced freeform editor.

WEB-P2-010
Developer components.
111. Critical Architectural Rule

The Website Builder must not become a second business database.

Correct:

Business Knowledge Base
        ↓
Website

Incorrect:

Business Knowledge Base
        +
Website's independent business database
112. Critical UX Rule

The owner should never have to understand the difference between:

frontend,
backend,
database,
deployment,
hosting,
DNS,
CSS,
JavaScript.

FrontDesk should expose:

Business decisions

instead of technical configuration.

113. Long-Term Vision

The eventual experience should become:

Owner:

"Make my website more premium."

        ↓

FrontDesk AI

Understands:
Business
Brand
Theme
Memory
Constraints

        ↓

Creates structured change

        ↓

Preview

        ↓

Owner approves

        ↓

Published

The visual editor remains available, but natural-language editing becomes an alternative to manual editing.

114. Final Principle

The FrontDesk Website Builder should not compete by giving users the most controls.

It should compete by producing:

The best result with the least technical effort.

The owner should feel:

"I built this myself."

even though FrontDesk handled:

layout,
responsiveness,
component composition,
hosting,
validation,
optimization,
and deployment.