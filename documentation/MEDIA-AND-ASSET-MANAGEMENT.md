MEDIA-AND-ASSET-MANAGEMENT.md
# FrontDesk — Media & Asset Management Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Media, Images & Digital Assets
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Media & Asset Management module defines how FrontDesk stores, organizes, processes, references, displays, and safely manages digital assets belonging to a business.

Assets may include:

- logos,
- product images,
- service images,
- gallery images,
- banners,
- icons,
- business documents,
- uploaded menus,
- imported images,
- generated images,
- social-media assets,
- future AI-generated product photography.

The goal is:

> Upload once → reuse safely across the entire business.

---

# 2. Core Principle

Media should be treated as business assets, not as random files attached to individual pages.

Conceptually:

                 Business
                    |
              Asset Library
                    |
       +------------+------------+
       |            |            |
     Website      Catalog       QR
       |            |            |
       +------------+------------+
                    |
              Future AI / CRM

A product image should not need to be uploaded separately for every place where it appears.

3. Why Asset Management Matters

Without centralized asset management:

duplicate images are created,
storage is wasted,
changing an image becomes difficult,
deleted images can break websites,
imported images become difficult to track,
AI-generated assets become disconnected from the business.

FrontDesk should provide a centralized asset system.

4. Asset Types

v0.1 should conceptually support:

Asset
├── Image
├── Logo
├── Document
└── Other supported file

The first public-facing implementation should prioritize images.

5. Image Categories

Images may be categorized as:

Logo
Product
Service
Gallery
Banner
Profile
Cover
Other

The category is metadata and does not necessarily restrict how the image is used.

6. Asset Ownership

Every business asset must belong to a workspace/business.

Conceptually:

Workspace
   |
   +── Asset A
   +── Asset B
   +── Asset C

A user leaving the workspace must not cause the business assets to disappear.

7. Asset Library

The dashboard should eventually contain:

Media Library

[ Upload ]

All
Images
Products
Logos
Banners
Documents

Possible future filters:

category,
upload date,
file type,
usage,
search.
8. Upload Flow

Basic v0.1 flow:

Owner
  ↓
Upload
  ↓
Select File
  ↓
Validate
  ↓
Process
  ↓
Store
  ↓
Create Asset Record
  ↓
Asset Library
9. Supported Image Formats

The implementation should prioritize commonly supported web formats.

Potential:

JPEG
PNG
WebP

Future:

AVIF
SVG
HEIC

Support should be explicitly defined by the technical implementation.

10. File Validation

Before storing an uploaded file, FrontDesk should validate:

file type,
file size,
file integrity,
supported format,
basic security constraints.

Do not trust only the filename extension.

11. File Size

v0.1 should enforce a maximum upload size.

The exact limit should be decided according to:

storage provider,
bandwidth,
processing requirements,
free-tier constraints.

The UI should clearly communicate the limit.

Example:

Maximum image size: X MB.

12. Upload Error

If an upload fails:

Upload failed.

Your existing assets are unchanged.

[Retry]

The user should receive a clear reason where possible.

13. Upload Progress

For larger uploads:

Uploading...

████████████░░░░
72%

Then:

Processing image...

Then:

Uploaded
14. Asset Processing

After upload, FrontDesk may process the image.

Potential processing:

resize,
compression,
format conversion,
thumbnail generation,
metadata extraction.
15. Original Asset

Where practical, the original uploaded asset should be retained according to the storage policy.

This allows future processing without repeatedly degrading an already compressed image.

16. Optimized Asset

The public website should preferably use optimized representations rather than unnecessarily serving the original large file.

Conceptually:

Original
   ↓
Processing
   ↓
Optimized Versions
   ├── Thumbnail
   ├── Medium
   └── Large
17. Responsive Images

Future public websites should be able to request an appropriate image size.

Example:

Mobile → smaller image
Tablet → medium image
Desktop → larger image

This improves performance.

18. Image Quality

FrontDesk should balance:

Visual Quality
        vs
File Size

The goal is not maximum compression.

The goal is:

Good visual quality with reasonable loading performance.

19. Image Metadata

An asset may have metadata such as:

Asset
├── ID
├── Workspace ID
├── File Name
├── MIME Type
├── Size
├── Width
├── Height
├── Created At
├── Updated At
└── Status

Exact schema belongs in database documentation.

20. Asset Name

Uploaded filename:

IMG_4829.jpg

should not necessarily become the public-facing product name.

Asset filename and business content are separate concepts.

21. Asset Title

Future:

Chocolate Truffle Cake — Front

can be used to make the asset easier to identify.

22. Asset Description

Future:

Product image showing Royal Bakes chocolate truffle cake.

This can assist with:

accessibility,
search,
organization,
AI understanding.
23. Alt Text

Images used on public websites should support meaningful alt text.

Example:

Chocolate truffle cake from Royal Bakes.

Alt text should describe the image's purpose/content rather than keyword-stuffing.

24. Automatic Alt Text

Future AI may suggest:

Suggested alt text:
Chocolate truffle cake topped with chocolate shavings.

Owner can:

Accept
Edit
Ignore

AI-generated alt text should not be treated as automatically correct.

25. Product Image Relationship

A product should reference an asset rather than embedding the actual image file inside the product record.

Conceptually:

Product
   |
   +── primary_image_id
   |
   +── gallery_asset_ids
26. Reusable Assets

The same asset may be used in multiple places.

Example:

Chocolate Cake Image
       |
       +── Product Card
       +── Homepage
       +── QR Menu
       +── Promotional Banner
27. Reference-Based Architecture

Pages should reference assets.

Avoid conceptually:

Page
└── duplicated image file

Prefer:

Page
└── Asset Reference
      ↓
   Asset Library
28. Asset Usage

Future asset details should show:

Used in:

Chocolate Cake
Homepage
QR Menu
Summer Campaign

This is important before deleting an asset.

29. Asset Deletion

Deleting an asset can break references.

Therefore FrontDesk should check usage before deletion.

Example:

This image is used in 4 places.

[Cancel]
[Replace Uses]
[Delete Anyway]

The final options depend on dependency rules.

30. Safe Deletion

Recommended model:

Asset
 ↓
Check References
 ↓
Referenced?
 ├── Yes → Block / Replace / Archive
 └── No  → Delete / Archive
31. Asset Archiving

Future/P1:

Instead of permanent deletion:

Active
Archived

Archived assets remain available for historical versions and possible restoration.

32. Version Safety

An asset referenced by a published version must not be deleted in a way that breaks that version.

Example:

v10 → uses Image A
v11 → uses Image B

Deleting Image A should not make v10 impossible to render if historical rendering is supported.

33. Published Asset Protection

If an asset is currently used by the live website, the system should warn the owner before destructive deletion.

Example:

This image is currently used on your live website.

34. Asset Replacement

Owner should be able to replace an image without manually editing every reference.

Example:

Current:
product-old.jpg

Replace with:
product-new.jpg

All configured references can then use the new asset according to the replacement behavior.

35. Replace vs Update

Important distinction:

Replace Reference

Change one component from:

Asset A

to:

Asset B
Replace Asset

Replace the underlying asset while maintaining references.

The technical implementation should clearly distinguish these concepts.

36. Logo Management

A business may have:

Primary Logo
Light Logo
Dark Logo
Icon / Mark

v0.1 can begin with:

Primary Logo

Future themes can support variants.

37. Logo Safety

The logo is a core brand asset.

Future Brand Kit integration may allow:

🔒 Logo locked

AI should not replace a locked logo without explicit permission.

38. Brand Asset Relationship

Future:

Brand Kit
├── Logo
├── Colors
├── Fonts
├── Icons
└── Image Style

Media Library stores the actual assets.

Brand Kit defines their business role.

39. Product Gallery

A product may eventually have multiple images.

Example:

Chocolate Cake
├── Front
├── Side
├── Close-up
└── Packaging

The product record can identify:

Primary Image
Gallery Images
40. Gallery Ordering

Future:

Owner can reorder images:

1. Front
2. Close-up
3. Packaging

The first image may become the primary image.

41. Drag-and-Drop Upload

The Media Library should support:

Drag files here

where supported.

This improves usability for non-technical users.

42. Multi-File Upload

Future/P1:

Owner can upload multiple assets simultaneously.

Example:

Upload 20 product images

FrontDesk processes them as a batch.

43. Batch Processing

Batch uploads should show:

20 files

18 processed
1 processing
1 failed

The successful assets should remain available even if one file fails.

44. Camera Upload

Especially useful for mobile/PWA users.

Owner can:

Take Photo

and upload directly.

Potential workflow:

Camera
 ↓
Preview
 ↓
Upload
 ↓
Crop / Optimize
 ↓
Save
45. Camera-to-Business

Future AI feature:

Owner photographs:

Price board

AI extracts:

Product
Price
Category

Then creates draft business data.

This is related to Business Importer and should reuse the Media system.

46. Menu Image

A business may upload:

PDF Menu

or:

Image Menu

The original file should be retained as an imported source where appropriate.

The importer may extract structured business data from it.

47. Source Asset

Imported assets should retain provenance where useful.

Example:

Source:
Business Importer

Original:
menu-page-3.jpg

This helps future debugging and reprocessing.

48. Asset Provenance

Future metadata:

Source:
UPLOAD
IMPORT
AI_GENERATED
SYSTEM
INTEGRATION
49. AI-Generated Assets

Future AI features may create:

product photography,
banners,
social posts,
backgrounds,
promotional graphics.

These should be stored as normal business assets with additional provenance metadata.

50. AI Asset Example
Asset

Name:
Chocolate Cake Studio Image

Source:
AI_GENERATED

Created By:
FrontDesk AI

Based On:
Original product photo
51. AI Generated Asset Safety

AI-generated images should not automatically replace original business assets.

Recommended:

Original
   ↓
AI Generated Alternative
   ↓
Preview
   ↓
Owner Approval
52. Original Preservation

When AI transforms an uploaded image:

Original Asset
      +
Generated Asset

should be retained separately.

Do not overwrite the original by default.

53. Image Editing

Future built-in tools may support:

crop,
resize,
rotate,
background removal,
compression,
aspect-ratio conversion.

v0.1 should keep editing capabilities minimal unless required by the website builder.

54. Crop

Different website components may require different aspect ratios.

Example:

Product Card:
4:3

Hero:
16:9

Square:
1:1

The system should preferably create derived representations rather than destroying the original.

55. Focal Point

Future:

Owner can select the important part of an image.

Example:

[ Image ]

       ●
    Focal Point

Responsive crops can then keep the important subject visible.

56. Image Background Removal

Future AI feature:

Upload product photo
        ↓
Remove background
        ↓
Transparent product image

Useful for:

boutiques,
food,
furniture,
product businesses.
57. AI Product Photography

Future:

Original Phone Photo
        ↓
AI Enhancement
        ↓
Studio-style Product Image

Possible operations:

background cleanup,
lighting improvement,
composition,
consistent style.

The owner should be able to preview before replacement.

58. Copyright / Ownership

Users should only upload assets they have the right to use.

FrontDesk should not imply that generated or imported assets are automatically free of third-party rights issues.

Future legal/product documentation should define appropriate policies.

59. External Image URLs

Future integrations may allow references to externally hosted images.

However, external URLs can introduce:

reliability problems,
hotlink restrictions,
privacy concerns,
unexpected deletion.

For core business assets, FrontDesk should prefer controlled storage.

60. Asset Storage

v0.1 should use an object/file storage system appropriate for the selected architecture.

Potential future implementation:

Frontend
   ↓
Backend / Storage API
   ↓
Object Storage

The exact provider is an architecture decision.

61. Free-Cost Requirement

Because the initial FrontDesk project aims to be developed with minimal/no cost:

The asset architecture should prioritize:

free tiers,
local development,
low storage usage,
efficient image compression,
avoiding unnecessary duplicates.

The exact provider should be selected later based on current pricing/limits.

62. Storage Separation

Do not store large binary images directly in the relational database unless there is a specific reason.

Prefer:

Database
  → asset metadata/reference

Object Storage
  → actual file
63. Asset URL

The database may store a stable reference rather than relying on hardcoded public URLs.

Conceptually:

asset_id
storage_key

The application can resolve the appropriate URL.

64. Public vs Private Assets

Some assets are public:

Product image
Logo
Website banner

Others may be private:

Supplier invoice
Private business document
Internal image

The storage layer must distinguish access requirements.

65. Public Asset Access

Public website assets must be accessible to customers.

However, the URL should not expose unrelated private assets.

66. Private Asset Access

Private assets require authenticated/authorized access.

Example:

Supplier Invoice

must not become publicly accessible simply because it exists in the business's Media Library.

67. Asset Security

The system should consider:

MIME spoofing,
malicious files,
oversized uploads,
unauthorized access,
path manipulation,
accidental public exposure.

The detailed security policy belongs in security documentation.

68. Filename Safety

Original filenames should not be trusted for storage paths.

Prefer generated storage keys.

Conceptually:

workspace-id/
    assets/
        generated-asset-id
69. Asset IDs

Every asset should have a unique identifier.

The ID should not depend on:

filename

or:

product name
70. Asset References

Other systems should reference assets using stable asset identifiers.

Example:

Product
primary_asset_id

rather than:

Product
image_url = some-hardcoded-url
71. Asset Lifecycle
Created
   ↓
Processing
   ↓
Ready
   ↓
Referenced
   ↓
Possibly Archived
   ↓
Deleted
72. Asset Status

Possible statuses:

UPLOADING
PROCESSING
READY
FAILED
ARCHIVED
DELETED

v0.1 may only need:

PROCESSING
READY
FAILED
73. Processing Failure

If image processing fails:

Asset processing failed.

[Retry]

The original upload should be preserved where feasible for retry/debugging.

74. Asset Search

Future:

Owner can search:

cake
logo
burger
banner

Search can use:

filename,
title,
description,
metadata,
tags.
75. Asset Tags

Future:

#cakes
#homepage
#festival
#product

Tags improve organization.

76. Asset Collections

Future:

Summer Campaign
Festival Campaign
Menu Photos
Brand Assets

This is useful for businesses with large asset libraries.

77. Asset Duplicate Detection

Future AI/system feature:

When owner uploads an identical or near-identical image:

This image may already exist in your library.

Options:

Use Existing
Upload Anyway

This reduces duplicate storage.

78. Image Hashing

Future implementation may use file hashes/perceptual hashes for duplicate detection.

Exact technical design belongs in backend architecture documentation.

79. Image Dimensions

The system should know:

Width
Height
Aspect Ratio

This allows the builder to warn owners.

Example:

This image may appear blurry in a large hero section.

80. Image Recommendations

Future AI can say:

Your homepage hero image is too small for this layout.

Possible action:

[Choose Better Image]
[Optimize Automatically]
81. Asset-to-Component Compatibility

Future website builder may define requirements:

Hero:
Minimum recommended dimensions

Product Card:
Recommended aspect ratio

Logo:
Recommended dimensions

The asset system can help validate these.

82. Asset Accessibility

For every meaningful public image:

Alt Text

should be supported.

Decorative images may be marked decorative.

83. Decorative Image

Example:

Background texture

may not require descriptive alt text.

84. Asset Replacement and Versioning

If an owner replaces an image:

Asset A
   ↓
Asset B

the website version should know which asset it uses.

This helps historical versions remain understandable.

85. Historical Version Rendering

If FrontDesk supports historical previews:

Version 10
 ↓
Asset A

Version 15
 ↓
Asset B

Both asset references may need to remain available.

86. Asset Garbage Collection

Future system functionality may identify unused assets.

Example:

32 images are not used anywhere.

Owner can:

Review
Archive
Delete

Do not automatically delete unused assets without a safe retention policy.

87. Asset Usage Counter

Future:

Used in 4 places

This helps owners understand deletion impact.

88. Media Library UX

Conceptual:

Media Library

[ + Upload ]

Search assets...

┌────┐ ┌────┐ ┌────┐
│ IMG│ │ IMG│ │ IMG│
└────┘ └────┘ └────┘

Chocolate Cake
Burger
Royal Bakes Logo
89. Asset Details Panel

Selecting an asset:

Asset Details

Preview

Name
Type
Size
Dimensions
Uploaded
Used In
Alt Text

[Replace]
[Archive]
90. Drag-and-Drop Builder Integration

In the website builder:

Image Component
      ↓
Choose Asset
      ↓
Media Library

Owner can select an existing asset instead of uploading another copy.

91. Product Editor Integration

Product editor:

Product
 ├── Name
 ├── Price
 ├── Description
 └── Image
       ↓
   Choose from Media Library
92. Importer Integration

Business Importer may create:

Imported Asset

then associate it with:

Imported Product
93. Knowledge Base Integration

The Business Knowledge Base can reference asset IDs where images are part of business entities.

Example:

Product
├── Name
├── Price
├── Description
└── Image Asset

The knowledge base should not duplicate the actual binary file.

94. Website Builder Integration

Website components reference assets.

Example:

Hero
└── background_asset_id

Product Card
└── product.primary_asset_id
95. QR Integration

QR pages use the same published asset references as the main website where applicable.

96. Analytics Integration

Analytics should not store images.

Analytics can optionally reference:

product_id

rather than:

image_url

This keeps business analytics independent of media storage.

97. AI Integration

Future AI systems may read asset metadata and images.

Example:

AI
 ↓
Product
 ↓
Primary Image
 ↓
Asset

The AI should know which asset belongs to which business entity.

98. AI Image Understanding

Future:

AI can analyze uploaded product images to suggest:

category,
description,
alt text,
tags,
image quality,
background issues.

These suggestions should become draft metadata unless explicitly approved.

99. AI Asset Actions

Future AI actions:

Remove background
Generate product photo
Create banner
Create social image
Resize image
Generate alt text
Find duplicate

These should respect AI permission and approval rules.

100. Asset Audit Trail

Future:

Asset:
cake-front.jpg

Created:
Owner

Used:
Product: Chocolate Cake

Replaced:
Aug 26

Archived:
Future

This helps debugging.

101. Media and Business Safety

If an AI action attempts:

Delete 50 images

FrontDesk should identify the impact.

Example:

18 images are currently used by your published website.

[Cancel]
[Review]
102. Media and Publishing

Publishing should validate that referenced assets are available.

Example:

Hero
 ↓
Asset A
 ↓
Asset status:
READY

If:

Asset status:
FAILED

the publish should fail or use a valid fallback according to explicit product rules.

103. Media and Offline/PWA

The PWA may cache selected assets for performance/offline experiences.

However, the architecture should distinguish:

Server Asset

from:

Local Browser Cache

Browser cache must not become the authoritative source.

104. Cache Invalidation

When an asset changes:

New Asset Version
 ↓
Relevant Cache Invalidation
 ↓
Updated Public Representation

The exact caching strategy belongs to infrastructure documentation.

105. v0.1 P0 Requirements
MEDIA-P0-001
Business can upload images.

MEDIA-P0-002
Assets belong to a workspace.

MEDIA-P0-003
Uploaded files are validated.

MEDIA-P0-004
Unsupported files are rejected.

MEDIA-P0-005
Asset metadata is stored separately from binary storage.

MEDIA-P0-006
Owner can view uploaded assets.

MEDIA-P0-007
Owner can select existing assets when editing products.

MEDIA-P0-008
Owner can use assets in website components.

MEDIA-P0-009
Product images use asset references.

MEDIA-P0-010
Public website uses appropriate asset URLs.

MEDIA-P0-011
Asset access respects workspace isolation.

MEDIA-P0-012
Live assets are protected from unsafe deletion.

MEDIA-P0-013
Image processing failures do not corrupt existing assets.

MEDIA-P0-014
Original assets are not overwritten by default.

MEDIA-P0-015
Asset references remain stable across normal business updates.
106. v0.1 P1 Requirements
MEDIA-P1-001
Media Library search.

MEDIA-P1-002
Asset categories.

MEDIA-P1-003
Drag-and-drop upload.

MEDIA-P1-004
Multi-file upload.

MEDIA-P1-005
Asset replacement.

MEDIA-P1-006
Asset archiving.

MEDIA-P1-007
Usage information.

MEDIA-P1-008
Image optimization.

MEDIA-P1-009
Responsive image variants.

MEDIA-P1-010
Basic image editing.

MEDIA-P1-011
Alt-text management.

MEDIA-P1-012
Asset metadata editing.
107. v0.1 P2 Requirements
MEDIA-P2-001
AI image enhancement.

MEDIA-P2-002
AI product photography.

MEDIA-P2-003
Background removal.

MEDIA-P2-004
AI alt-text generation.

MEDIA-P2-005
Duplicate detection.

MEDIA-P2-006
AI asset classification.

MEDIA-P2-007
Asset collections.

MEDIA-P2-008
Advanced asset versioning.

MEDIA-P2-009
External media integrations.

MEDIA-P2-010
Automatic unused-asset cleanup suggestions.
108. Acceptance Criteria

The Media & Asset Management module is complete for v0.1 when:

A business owner can upload supported images.
Uploaded assets belong to the correct workspace.
File type and size are validated.
Asset metadata is stored separately from binary data.
Assets can be viewed in a Media Library.
Products can reference existing assets.
Website components can reference existing assets.
The same asset can be reused in multiple places.
Public assets can be served to customers.
Private assets cannot be accessed by unauthorized users.
Deleting an asset does not silently break a published website.
Processing failures are handled safely.
Asset references remain stable across normal updates.
Images can be optimized for web delivery.
The architecture supports future AI-generated assets.
The architecture supports future asset versioning.
109. Example End-to-End Scenario
Upload

Owner uploads:

IMG_4829.jpg

↓

FrontDesk validates the file.

↓

Creates:

Asset:
asset_123

Type:
IMAGE

Status:
PROCESSING

↓

Processing completes:

Status:
READY
110. Product Assignment

Owner edits:

Chocolate Truffle Cake

and selects:

asset_123

as the primary image.

The product stores the asset reference.

111. Website Usage

The homepage also uses:

asset_123

Now:

Asset
├── Product Card
└── Homepage

No duplicate upload is required.

112. Image Replacement

Owner uploads:

IMG_5001.jpg

and replaces the product image.

Now:

Product
 ↓
asset_456

The old asset remains available according to the retention policy.

113. Delete Attempt

Owner attempts to delete:

asset_456

FrontDesk detects:

Used by:
Chocolate Truffle Cake
Published Website

and warns:

This image is currently being used by your live website.

114. Future AI Scenario

Owner uploads a poor phone photo.

FrontDesk AI suggests:

Improve Product Image

✓ Remove background
✓ Improve lighting
✓ Create clean studio background
✓ Generate square version

Owner selects:

[Preview]

Then:

[Use This Image]

The generated image becomes a new asset.

The original remains untouched.

115. Future Business Import Scenario

Owner uploads a PDF menu.

Business Importer extracts:

Product:
Chocolate Cake

Price:
₹650

Image:
Page 3 image

The extracted image becomes:

Imported Asset

and is associated with:

Chocolate Cake
116. Final Principle

Assets belong to the business, not to a page.

The website, catalog, QR page, AI systems, and future marketing tools should all reuse the same business asset library.