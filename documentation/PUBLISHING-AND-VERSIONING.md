Next is PUBLISHING-AND-VERSIONING.md.

This is one of the most important documents before we move into the technical architecture because FrontDesk is a visual builder + business data platform + AI system. We need to guarantee that an unfinished edit or a bad AI change never accidentally destroys the live business.

Create:

FrontDesk/
└── documentation/
    └── 02-product/
        └── FEATURE-SPECIFICATIONS/
            ├── BUSINESS-IMPORTER.md
            ├── BUSINESS-KNOWLEDGE-BASE.md
            ├── WEBSITE-BUILDER.md
            ├── QR-AND-PUBLIC-PRESENCE.md
            ├── WHATSAPP-ENQUIRY.md
            ├── BASIC-ANALYTICS.md
            ├── BUSINESS-UPDATES.md
            ├── USER-ACCOUNTS-AND-WORKSPACES.md
            └── PUBLISHING-AND-VERSIONING.md
PUBLISHING-AND-VERSIONING.md
# FrontDesk — Publishing & Versioning Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Publishing, Drafts & Version History
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Publishing & Versioning module defines how FrontDesk manages changes between:

- the owner's current edits,
- drafts,
- previews,
- published content,
- previous versions,
- restored versions.

The primary objective is:

> An owner can safely change their business without accidentally breaking the live public presence.

---

# 2. Core Principle

FrontDesk must clearly separate:

```text
Draft
  ≠
Published

The customer should only see the published state.

The owner can continue editing a draft without immediately affecting the public website.

3. Basic Publishing Flow
Owner
  ↓
Edit
  ↓
Draft
  ↓
Preview
  ↓
Validate
  ↓
Publish
  ↓
Live
4. Current State Model

A FrontDesk business can conceptually have:

┌──────────────────────┐
│ Published Version    │
│ What customers see   │
└──────────┬───────────┘
           │
           │
┌──────────▼───────────┐
│ Current Draft        │
│ What owner is editing│
└──────────────────────┘

There may be many historical versions.

5. Version History

Conceptually:

Version 1
Version 2
Version 3
Version 4 ← Published
Version 5 ← Draft

Only one version should be the current published state for a business/publication target.

6. Why Versioning Matters

Without versioning:

Owner edits
   ↓
Something breaks
   ↓
No way to restore

With versioning:

Owner edits
   ↓
Preview
   ↓
Publish
   ↓
Problem
   ↓
Restore previous version
7. Draft

A draft represents changes that are not currently live.

Example:

Published:
Chocolate Cake ₹650

Draft:
Chocolate Cake ₹700

Customers continue seeing:

₹650

until the draft is published.

8. Autosave

The editor may automatically save changes to the draft.

Important distinction:

Autosave
    ≠
Publish

Autosaving must never unexpectedly publish customer-facing changes.

9. Draft Persistence

If the owner:

closes the browser,
loses connection,
leaves the dashboard,
returns later,

the draft should remain available where technically feasible.

10. Draft Status

A draft can conceptually have:

NO_CHANGES
DRAFT
READY_TO_PUBLISH
PUBLISHING
PUBLISHED
FAILED

The exact implementation may simplify these states.

11. Published Version

The published version represents the customer-facing state.

Example:

Published Version:
v12

The public website must render from the published state.

12. Public Website Rule

The public website must NOT read arbitrary editor state.

It should read:

Published Business State
+
Published Website Configuration
13. Example

Owner changes:

Homepage headline

From:
Freshly baked every morning.

To:
Premium cakes for every celebration.

Before publishing:

Customer sees:

Freshly baked every morning.

Owner preview sees:

Premium cakes for every celebration.

After publishing:

Customer sees:

Premium cakes for every celebration.
14. Preview

Preview allows the owner to inspect draft changes before publication.

Flow:

Draft
 ↓
Preview
 ↓
Review
 ↓
Publish
15. Preview Principle

Preview should make it obvious that the displayed content is not necessarily live.

Example banner:

PREVIEW — Changes are not live
16. Preview Environment

The preview should use:

Draft Data
+
Draft Website Configuration

while the public site uses:

Published Data
+
Published Website Configuration
17. Preview URL

Future implementation may provide a private preview URL.

Example:

preview.frontdesk.example/business/royal-bakes

The preview must not accidentally become publicly indexed.

18. Preview Security

Preview pages should not expose unpublished business information to arbitrary users.

Potential protections:

authenticated access,
secure preview token,
expiration,
no-index directives.

The exact security mechanism belongs in security documentation.

19. Publish Action

The owner should explicitly initiate publishing.

Example:

[Publish Changes]

Publishing should not happen accidentally because of:

autosave,
browser refresh,
navigating away,
AI generation,
editor changes.
20. Publish Confirmation

For small changes:

Ready to publish?

[Cancel] [Publish]

For larger changes:

You are about to publish:

12 product changes
2 new products
1 homepage change
1 opening-hours change

[Cancel]
[Publish]
21. Change Summary

Before publishing, FrontDesk should summarize important changes.

Example:

Changes ready to publish

+ Added 2 products
~ Updated 4 prices
~ Changed opening hours
~ Updated homepage

This helps the owner understand the impact.

22. Change Severity

Future changes can be classified:

Low Risk
text edits,
image replacement,
description changes.
Medium Risk
price changes,
opening-hour changes,
navigation changes.
High Risk
deleting many products,
changing business identity,
changing public domain,
removing major sections.

The UI can require stronger confirmation for high-risk operations.

23. Publish Validation

Before publication, FrontDesk should validate the draft.

Possible checks:

Required fields
Broken references
Invalid products
Invalid images
Missing business information
Invalid URLs
Invalid contact information
24. Publish Must Fail Safely

If validation fails:

Publish failed.

Your current live website is unchanged.

[Review Issues]

The draft should remain available for correction.

25. Example

Draft contains:

Product:
Chocolate Cake

Image:
Missing

Publishing should not produce a broken live product.

Instead:

1 issue must be fixed before publishing.
26. Atomic Publishing

A publish operation should produce a coherent published state.

Avoid situations such as:

New price
+
Old product name
+
Missing image

when these changes belong to one logical update.

27. Atomicity Principle

Conceptually:

Validate entire publish
        ↓
Success?
   ┌────┴────┐
  Yes        No
   ↓          ↓
Publish     Keep old
all changes live state
28. Failed Publishing

If deployment or publication fails:

Draft
  ↓
Publish
  ↓
Failure

The existing published version must remain available.

The system should not replace the working version with a partially failed state.

29. Publishing Status

The owner should be able to see:

Publishing...

then:

Published successfully

or:

Publishing failed
30. Retry

If publishing fails because of a temporary problem:

[Retry Publish]

The owner should not have to recreate the changes.

31. Version Creation

A successful publish should create a version.

Example:

Before:
v12

Publish
 ↓

After:
v13
32. Version Identity

A version should have a stable identity.

Conceptually:

Version
├── Version ID
├── Workspace ID
├── Created By
├── Created At
├── Change Summary
├── Status
└── Snapshot / Reference

Exact database design belongs in the database documentation.

33. Version Author

Every version should eventually identify its source.

Examples:

Owner
Manager
AI
System
34. AI Version

If AI prepares a change:

Created by:
FrontDesk AI

If the owner approves it:

Approved by:
Owner

This distinction should be preserved.

35. Change Source

Future version metadata:

Source:
MANUAL
AI
IMPORT
SYSTEM
INTEGRATION

This helps with auditing.

36. Version Timeline

Future UI:

Business History

Today

7:30 PM
v14 — Published
Updated 4 product prices

5:10 PM
v13 — Published
Added summer menu

Yesterday

v12 — Published
Updated homepage
37. Version Details

Selecting a version can show:

Version 14

Published:
Aug 26, 7:30 PM

By:
Fareed

Changes:
4 product prices
1 product description
38. Version Preview

Owner should eventually be able to preview historical versions.

Example:

Version 12
[Preview]

Version 13
[Preview]

Version 14
[Preview]
39. Restore

Future:

Version 12
[Restore]

Restoring should NOT simply delete all newer versions.

40. Safe Restore

If the current state is:

v14

and owner restores:

v12

the system should conceptually create:

v15

whose content is based on:

v12

rather than deleting:

v13
v14
41. Why Restore Creates a New Version

History should remain understandable.

Example:

v12
v13
v14
v15 ← Restored from v12

This shows what actually happened.

42. Restore Confirmation

Before restoring:

Restore Version 12?

This will replace the current draft/live content
with the state from Version 12.

[Cancel]
[Restore]

The exact wording depends on whether the restore affects draft or live content.

43. Draft Restore

A safer initial restore flow:

Historical Version
       ↓
Restore as Draft
       ↓
Preview
       ↓
Publish

This prevents accidental immediate replacement of the live site.

44. Recommended v0.1 Restore Model

If restoration is implemented in v0.1:

Restore historical version → create a new draft → owner reviews → owner publishes.

Do NOT silently replace the live website.

45. Undo vs Restore

These are different.

Undo

Reverses a recent editing action.

Example:

Changed button color
        ↓
Undo
Restore

Returns to a previous saved version.

Example:

Current:
v14

Restore:
v10
46. Future Undo AI

A dedicated future action:

Undo AI Changes

could revert all changes created by one AI operation.

Example:

AI Task:
"Make homepage more premium"

Changes:
- typography
- spacing
- colors
- cards
- buttons

[Undo AI Changes]
47. AI Change Grouping

AI-generated modifications should be grouped into a single logical task.

Example:

AI Task #42

Changed:
Homepage
Hero
Cards
Buttons
Typography

This allows easier review and rollback.

48. AI Approval Flow

Future:

Owner asks AI
       ↓
AI creates proposed changes
       ↓
Preview
       ↓
Approval
       ↓
Draft
       ↓
Publish
49. AI Must Not Automatically Publish

Unless the owner explicitly grants such permission in a future system, AI should not publish critical changes automatically.

50. Business Safety Mode

Future:

AI detected a large change.

47 products will be modified.

Create a backup before continuing?

[Backup & Continue]
[Cancel]
51. Backup

Version history itself may serve as the logical application-level backup for business content.

However, this should not be confused with infrastructure/database backups.

Application versioning:

Business State

Infrastructure backup:

Database / Storage Recovery

These are separate concerns.

52. Version Retention

v0.1 should avoid unlimited expensive storage assumptions.

Possible retention policy:

Recent versions:
Full detail

Older versions:
Retained according to product policy

The exact retention period should be defined after storage architecture decisions.

53. Version Storage

Potential strategies include:

Snapshot

Store the complete published state.

Delta

Store only changes.

Hybrid

Store periodic snapshots plus changes between snapshots.

For v0.1, simplicity should be prioritized.

54. Recommended v0.1 Approach

Prefer a straightforward model that is:

reliable,
easy to debug,
easy to restore,
inexpensive.

Do not prematurely optimize version storage.

The exact implementation will be decided in the architecture/database documentation.

55. Publishing and Business Data

Business updates follow:

Edit
 ↓
Draft Business Data
 ↓
Validate
 ↓
Publish
 ↓
Published Business Data
56. Publishing and Website Design

Website builder changes follow:

Edit
 ↓
Draft Site Configuration
 ↓
Preview
 ↓
Publish
 ↓
Published Site Configuration
57. Two Related States

FrontDesk may have:

Business Data State

and:

Website Design State

They should remain conceptually separate.

58. Example

Owner changes:

Product Price:
₹650 → ₹700

This is a business data change.

Owner changes:

Button:
Blue → Purple

This is a website design change.

Both may be published together, but they should not be confused internally.

59. Combined Publishing

FrontDesk may allow:

Business Changes
+
Design Changes

to be published together as one release.

Example:

Publish v20

Business:
3 price changes

Design:
New homepage layout
60. Publish Scope

Future:

Publish All

or:

Publish Business Changes
Publish Website Changes

v0.1 may keep this simple with a single publish action.

61. Scheduled Publishing

Future/P1:

Owner edits now:

Christmas Website

Then:

Publish:
December 1
9:00 AM
62. Scheduled Publishing Flow
Draft
 ↓
Schedule
 ↓
Waiting
 ↓
Scheduled Time
 ↓
Validation
 ↓
Publish
63. Scheduled Publish Failure

If scheduled publishing fails:

Scheduled publication failed.

Current live version remains unchanged.

[Review]
[Retry]

The owner should be notified.

64. Scheduled Changes

Scheduled changes can eventually include:

Festival Theme
Offers
Product Availability
Homepage Banner
Opening Hours
Campaigns

This is future functionality.

65. Publish Preview

For scheduled publication:

Preview scheduled version

should be possible before scheduling.

66. Publication Lock

When a publish is already running:

Publishing...

another conflicting publish should not create an inconsistent state.

67. Concurrent Publishing

If two users attempt to publish simultaneously:

Owner A → Publish
Owner B → Publish

the system must have a defined conflict strategy.

For v0.1:

The backend should serialize publication operations for a workspace.

68. Draft Conflicts

Two users may edit the same draft.

Full real-time collaborative editing is out of scope for v0.1.

The architecture should leave room for future conflict handling.

69. Publication Lock

A simple v0.1 mechanism may be:

Publish started
 ↓
Workspace publishing lock
 ↓
Publish completes
 ↓
Lock released
70. Publish Idempotency

A repeated request caused by:

double-click,
network retry,
browser retry,

should not accidentally create multiple conflicting publications.

The API should eventually support idempotent publishing operations.

71. Public Cache

Published content may be cached for performance.

When a new version is published:

Publish v14
 ↓
Invalidate relevant cache
 ↓
Public site serves v14
72. Cache Consistency

A customer should not remain indefinitely on an obsolete published version after publication.

The architecture should define appropriate cache invalidation/revalidation.

73. CDN / Edge Future

Future FrontDesk infrastructure may use:

CDN
Edge Cache
Static Generation
ISR / Revalidation

The exact implementation belongs in infrastructure architecture documentation.

74. Publish and Custom Domains

Future:

Custom Domain
       ↓
Published Version

Publishing should update the custom-domain experience as well.

75. Publish and QR

The QR destination should normally remain stable:

QR
 ↓
Public URL
 ↓
Current Published Version

Publishing does not require regenerating the QR.

76. Publish and Analytics

Analytics should continue tracking the public business after each publication.

The system may optionally record:

version_id

with events for internal analysis.

77. Publish and WhatsApp

WhatsApp CTAs should use the current published business information.

78. Publish and SEO

Published pages should use the published SEO-relevant business data.

Future generated metadata must not expose draft content.

79. Draft Privacy

Unpublished information must not leak through:

public URLs,
search indexing,
public APIs,
analytics responses,
image URLs,
cached pages.
80. Media Versioning

If an image is replaced:

Old Image
New Image

the system should avoid deleting the old media immediately if a previous published version still references it.

81. Media Safety

Deleting media should consider:

Current Draft
Published Version
Historical Versions

An image required by a historical or published version should not be prematurely destroyed.

82. Publishing Dependencies

Before publication, FrontDesk may check:

Business exists
Products valid
Images available
Website configuration valid
URLs valid
Required fields present
83. Dependency Failure

If a dependency is unavailable:

Publish blocked.

Reason:
Required image could not be processed.

Current live state remains unchanged.

84. Publish Result

A successful publish should produce something conceptually like:

Publication

Status:
SUCCESS

Version:
v18

Published At:
2026-08-26 20:15

Published By:
Owner
85. Publication Error

Internal errors should be logged for developers.

The owner should receive a human-readable message.

Instead of:

500 Internal Server Error

show:

We couldn't publish your changes. Your live website is unchanged.

86. Publication History

Future dashboard:

Publication History

v18
Published
Aug 26, 8:15 PM

v17
Published
Aug 25, 6:20 PM

v16
Published
Aug 24, 9:10 PM
87. Version Comparison

Future:

Compare v17 vs v18

could show:

Added:
2 products

Changed:
4 prices

Removed:
1 product

Design:
Homepage updated
88. Diff Types

Future version comparison can distinguish:

Added
Removed
Changed
Moved
Renamed
89. Website Design Diff

Example:

Homepage

Hero:
Changed

Menu:
Moved above Gallery

Footer:
Unchanged
90. Business Data Diff

Example:

Products

Chocolate Cake:
₹650 → ₹700

Brownie:
Added

Coffee:
Availability changed
Available → Unavailable
91. Version Naming

Technical versions can use:

v1
v2
v3

Owner-facing labels can be more descriptive:

v14 — Updated Summer Menu
v15 — New Homepage
v16 — Updated Prices

Future feature.

92. Release Notes

Future:

Owner can optionally add:

Updated festival menu.

The version history can display:

v16
Updated festival menu
Published by Fareed
93. AI Release Notes

AI may generate a summary:

Updated 6 products and changed the homepage hero.

The owner should be able to review it before publication if shown publicly/internal.

94. Business Safety Principle

The most important publishing rule is:

Never sacrifice the last known-good published state because a new change failed.

95. Recovery Principle

At any time, the system should conceptually maintain:

Last Known Good Published Version

If a new publication fails:

Last Known Good
       ↓
Remains Live
96. v0.1 P0 Requirements
PUBLISH-P0-001
Draft and published states are separate.

PUBLISH-P0-002
Autosave does not publish changes.

PUBLISH-P0-003
Owner can preview draft changes.

PUBLISH-P0-004
Owner can explicitly publish changes.

PUBLISH-P0-005
Published website uses published state.

PUBLISH-P0-006
Draft content is not publicly exposed.

PUBLISH-P0-007
Publication validates required data.

PUBLISH-P0-008
Failed publication does not replace the current live version.

PUBLISH-P0-009
Successful publication creates a version.

PUBLISH-P0-010
Version has creation time.

PUBLISH-P0-011
Version identifies its creator/source where available.

PUBLISH-P0-012
Publishing is protected by workspace authorization.

PUBLISH-P0-013
Concurrent publication is handled safely.

PUBLISH-P0-014
Repeated publish requests do not create inconsistent state.

PUBLISH-P0-015
Published content remains accessible during failed publication.
97. v0.1 P1 Requirements
PUBLISH-P1-001
Version history UI.

PUBLISH-P1-002
Historical version preview.

PUBLISH-P1-003
Restore as draft.

PUBLISH-P1-004
Change summaries.

PUBLISH-P1-005
Version comparison.

PUBLISH-P1-006
Scheduled publishing.

PUBLISH-P1-007
Publication notifications.

PUBLISH-P1-008
Improved publication monitoring.

PUBLISH-P1-009
Release notes.

PUBLISH-P1-010
Publish history filtering.
98. v0.1 P2 Requirements
PUBLISH-P2-001
Undo AI task.

PUBLISH-P2-002
AI approval workflow.

PUBLISH-P2-003
Business Safety Mode.

PUBLISH-P2-004
Advanced collaborative editing.

PUBLISH-P2-005
Conflict resolution.

PUBLISH-P2-006
Automated scheduled website changes.

PUBLISH-P2-007
Advanced version comparison.

PUBLISH-P2-008
External platform synchronization.

PUBLISH-P2-009
Deployment health monitoring.

PUBLISH-P2-010
Automatic rollback.
99. Acceptance Criteria

The Publishing & Versioning module is complete for v0.1 when:

Draft content can exist without affecting the live website.
Autosaved changes remain unpublished.
Owner can preview changes.
Owner explicitly publishes changes.
Published pages use the published state.
Draft data is not publicly exposed.
Publication validates the draft.
Invalid drafts cannot replace the live state.
Failed publication preserves the previous live state.
Successful publication creates a new version.
Versions can be associated with their creator/source.
Publishing requires appropriate workspace permissions.
Concurrent publication cannot corrupt the published state.
Duplicate publish requests are handled safely.
Public QR URLs continue pointing to the current published business.
Historical state can eventually support restoration without destroying history.
100. Example End-to-End Scenario
Current
Published Version: v10

Chocolate Cake
₹650
Owner Edits
Draft

Chocolate Cake
₹700
Preview

Owner sees:

PREVIEW

Chocolate Cake
₹700

Customer still sees:

Chocolate Cake
₹650
Publish
[Publish Changes]

FrontDesk validates.

Validation:
✓ Product exists
✓ Price valid
✓ Image exists
✓ Business valid
Publication
v11

becomes the new published version.

Customer

Now sees:

Chocolate Cake
₹700
101. Failed Publication Scenario

Current:

v10

Owner publishes:

v11

but an internal deployment problem occurs.

Result:

v10 remains live
v11 remains unpublished/failed

Owner sees:

We couldn't publish your changes. Your live website is unchanged.

This is the required safety behavior.

102. Restore Scenario

Current:

v15

Owner wants the state from:

v12

FrontDesk:

v12
 ↓
Restore as Draft
 ↓
Preview
 ↓
Publish
 ↓
v16

History remains:

v12
v13
v14
v15
v16 ← restored state
103. Future AI Scenario

Owner:

Make the homepage more premium.

AI:

Proposed Changes

Hero typography
Card spacing
Button style
Section layout

Owner:

[Preview Changes]

Then:

[Approve]

The changes become part of a draft.

Owner finally:

[Publish]

This creates a controlled AI → Draft → Publish workflow.

104. Long-Term Publishing Architecture

Eventually:

                 ┌───────────────┐
                 │ Business Data │
                 └───────┬───────┘
                         │
                 ┌───────▼───────┐
                 │     Draft     │
                 └───────┬───────┘
                         │
                    Validate
                         │
                    ┌────▼────┐
                    │ Preview │
                    └────┬────┘
                         │
                    Approval
                         │
                  ┌──────▼──────┐
                  │   Publish   │
                  └──────┬──────┘
                         │
                  ┌──────▼──────┐
                  │   Version    │
                  └──────┬──────┘
                         │
                ┌────────▼────────┐
                │ Public Business  │
                └─────────────────┘
105. Final Principle

Edit freely. Preview safely. Publish deliberately. Recover confidently.

The owner should never feel:

"If I change something, I might destroy my website."

Instead:

"I can experiment because FrontDesk keeps my live business safe."
