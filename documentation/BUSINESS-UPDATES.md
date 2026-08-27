BUSINESS-UPDATES.md
# FrontDesk — Business Updates Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Business Updates & Single Source of Truth
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Business Updates module defines how a business owner changes information inside FrontDesk after the initial business setup.

The central objective is:

> Change business information once → FrontDesk updates every relevant surface.

For example:

Owner changes:

Chocolate Truffle Cake
₹650 → ₹700

FrontDesk updates the approved value used by:

- website,
- catalog,
- product cards,
- QR menu,
- WhatsApp enquiry context,
- SEO information,
- future AI customer assistant,
- future ordering system.

---

# 2. Core Principle

## Single Source of Truth

Business information should have one authoritative location.

```text
                 Business Knowledge Base
                          │
             ┌────────────┼────────────┐
             ↓            ↓            ↓
         Website          QR        WhatsApp
             ↓
          Analytics
             ↓
        Future AI Agent

The different surfaces should consume the same approved business information.

3. Problem

Without a single source of truth, a business owner may need to update:

Website price
QR menu price
WhatsApp catalog price
Instagram information
AI answer
Product card

This creates:

duplicated data,
inconsistent prices,
outdated information,
customer confusion,
operational mistakes.

FrontDesk should eliminate this problem wherever it controls the relevant surface.

4. v0.1 Goal

The owner should be able to update:

business name,
description,
contact information,
WhatsApp number,
opening hours,
address,
products,
prices,
categories,
product availability,
product descriptions,
images.

Changes should propagate automatically to all FrontDesk-managed surfaces.

5. Update Flow
Owner
  ↓
Edit Business Information
  ↓
Validate
  ↓
Save Draft
  ↓
Review
  ↓
Approve / Publish
  ↓
Business Knowledge Base
  ↓
Dependent FrontDesk Surfaces
6. Draft vs Published

FrontDesk should distinguish:

Draft Data

from:

Published Data

Example:

Current Published Price:
₹650

Draft Price:
₹700

Customers should continue seeing:

₹650

until the owner publishes the update.

7. Why Draft State Matters

It allows owners to prepare multiple changes.

Example:

Change price
Add new product
Update opening hours
Change description

Then:

Publish all changes

instead of exposing incomplete changes one at a time.

8. Basic Update Lifecycle
Current
   ↓
Edit
   ↓
Draft
   ↓
Validate
   ↓
Preview
   ↓
Publish
   ↓
Current Published Version
9. Business Information Categories

Business information should be organized into logical groups.

Business
├── Identity
├── Contact
├── Location
├── Hours
├── Products
├── Categories
├── Media
├── Policies
└── Preferences
10. Business Identity

May include:

business name,
tagline,
description,
logo,
business category.
11. Contact Information

May include:

phone,
WhatsApp,
email,
public social links.

Only approved public contact information should appear on public surfaces.

12. Location Information

May include:

address,
city,
state,
postal code,
map location.
13. Opening Hours

Example:

Monday       9:00 AM – 9:00 PM
Tuesday      9:00 AM – 9:00 PM
Wednesday    9:00 AM – 9:00 PM
Thursday     9:00 AM – 9:00 PM
Friday       9:00 AM – 9:00 PM
Saturday     9:00 AM – 10:00 PM
Sunday       10:00 AM – 8:00 PM
14. Product Information

A product may contain:

Product
├── Name
├── Description
├── Price
├── Category
├── Images
├── Availability
├── Variants
└── Metadata

Only fields supported by the current version should be exposed to the owner.

15. Product Update Example

Before:

Chocolate Truffle Cake
₹650

Owner changes:

₹700

After publishing:

Business Knowledge Base
        ↓
₹700
        ↓
Website
        ↓
Product Card
        ↓
Future AI
16. Product Availability

Owner can change:

Available

to:

Unavailable

The website should reflect the new approved state.

17. Availability Safety

If a product is unavailable, FrontDesk should not allow the public website to accidentally represent it as available.

Possible display:

Currently unavailable

or hide the product according to the business configuration.

18. Category Updates

Owner may:

create category,
rename category,
reorder category,
hide category,
delete category.

Deleting a category should not silently delete its products.

The system should require an appropriate reassignment or handling strategy.

19. Product Deletion

Deleting a product is a destructive action.

The UI should make the impact clear.

Example:

Delete Chocolate Truffle Cake?

This will remove it from your public catalog.

Potential future behavior:

Archive

is preferred over permanent deletion where historical data is important.

20. Product Archiving

Future:

Active
Archived

Archived products:

disappear from active catalog,
remain in historical analytics,
can potentially be restored.
21. Bulk Updates

Future/P1:

Owner selects multiple products:

☑ Burger
☑ Chicken Burger
☑ Cheese Burger

Then:

[Change Category]
[Change Availability]
[Archive]
22. Bulk Price Updates

Future:

Selected Products
+
Increase Price
5%

Before applying:

12 products will change.

[Preview]
[Apply]

This is especially important for AI-driven changes.

23. Business Information Editing Interface

Conceptual:

Business
├── General
├── Contact
├── Location
├── Hours
├── Catalog
│   ├── Products
│   └── Categories
└── Media

The final UI is defined in UI/UX documentation.

24. Quick Edit

The owner should be able to quickly edit common information.

Example:

Today's Status

Open until:
9:00 PM

[Edit]
25. Dashboard Quick Actions

Potential:

Add Product
Change Hours
Update Price
Update Business Info
Change WhatsApp

These reduce navigation for common tasks.

26. Product Editing

Example:

Chocolate Truffle Cake

Name
[Chocolate Truffle Cake]

Price
[₹700]

Description
[Rich chocolate cake...]

Availability
[Available]

Category
[Cakes]

[Save Draft]
27. Validation

Before saving/publishing, FrontDesk should validate:

required fields,
valid prices,
valid business relationships,
valid category references,
valid image references,
valid contact information where appropriate.
28. Price Validation

Price should not accept invalid values.

Examples of invalid input:

abc
-500
₹₹650

The internal representation should be numeric.

Currency formatting belongs to presentation.

29. Currency

v0.1 targets India primarily.

Default:

INR

But the underlying model should support future currencies.

30. Price Representation

Avoid storing:

₹650

as the canonical numeric value.

Prefer conceptually:

amount: 650
currency: INR

The UI can display:

₹650
31. Opening Hours Validation

The system should prevent invalid configurations such as:

Opening:
10 PM

Closing:
8 AM

unless the system explicitly supports overnight hours.

32. Overnight Hours

Future support:

Monday:
6 PM → 2 AM

This requires explicit handling because the closing time belongs to the following day.

33. Temporary Hours

Future:

Today:
10 AM – 4 PM

without permanently changing regular hours.

This is useful for:

holidays,
special events,
maintenance,
emergencies.
34. Business Closure

Future quick action:

Temporarily closed

Possible public display:

Temporarily closed today.

The regular opening schedule remains stored.

35. Change Propagation

When approved business information changes:

Knowledge Base
      ↓
Change Event
      ↓
Dependent Systems

Potential dependent systems:

Website
QR Public Presence
WhatsApp Message Builder
SEO Metadata
Analytics Labels
Future AI
36. Change Propagation Principle

A dependent system should retrieve the authoritative value rather than maintaining a stale duplicate.

37. Example

Business:

Royal Bakes

Product:

Chocolate Truffle Cake
Price: ₹650

Website displays:

₹650

Owner changes:

₹700

After publication:

Website
₹700

WhatsApp contextual message
₹700 where price inclusion is enabled

AI knowledge
₹700

Catalog
₹700
38. What FrontDesk Cannot Automatically Update

FrontDesk does not control external platforms unless an official integration exists.

For example:

Instagram
Google Business
External POS
External marketplaces

cannot be assumed to update automatically.

The UI must not promise:

Updated everywhere

when FrontDesk only controls its own surfaces.

39. External Sync

Future integrations may support:

FrontDesk
   ↕
Google Business
   ↕
WhatsApp Business
   ↕
POS
   ↕
Other Platforms

Each integration needs its own synchronization rules.

40. Sync Status

Future:

FrontDesk
✓ Updated

Google
✓ Updated

Instagram
⚠ Manual update required

This prevents false assumptions.

41. Change Preview

Before publishing major changes:

Current
     vs
Draft

Example:

Chocolate Truffle Cake

Current:
₹650

Draft:
₹700
42. Change Summary

The system should summarize changes.

Example:

3 changes ready to publish

+ Added 2 products
~ Updated 4 prices
~ Changed opening hours
43. Publish Confirmation

For normal small changes:

[Publish Changes]

For major changes:

You are about to publish:

12 product changes
2 new categories
1 opening-hour change

[Cancel]
[Publish]
44. Dangerous Changes

Potentially dangerous changes include:

deleting many products,
changing many prices,
removing WhatsApp,
changing business URL,
changing business identity,
hiding large parts of the catalog.

These should require stronger confirmation.

45. Business Safety Mode

Future:

Large change detected.

47 products will be modified.

[Create Backup & Continue]
[Cancel]
46. Version History

Future/P1:

Business Changes

Today 7:30 PM
Today 5:10 PM
Yesterday
Aug 20
Aug 15

Each version can support:

Preview
Restore
47. Change History

The system should eventually record:

Who
What
When
Before
After
Why

Example:

Owner
Changed price
₹650 → ₹700
Aug 26, 7:30 PM
48. Audit Log

The audit log is different from user-facing version history.

Audit logs are primarily for:

security,
accountability,
debugging,
administrative review.
49. Future AI Changes

When AI changes business data:

AI
 ↓
Proposed Change
 ↓
Owner Approval
 ↓
Business Knowledge Base

AI should not silently modify critical business data by default.

50. AI Price Change Example

Owner:

Increase all cake prices by 10%.

AI:

12 products affected

Example:
Chocolate Cake
₹650 → ₹715

Red Velvet
₹700 → ₹770

Then:

[Preview]
[Approve]
51. AI Permission Levels

Future:

Allowed Automatically:
Product descriptions

Approval Required:
Prices

Approval Required:
Product deletion

Not Allowed:
Financial data

The final permission system belongs to AI safety documentation.

52. Business Memory

Business preferences can influence updates.

Example:

Business Memory:

Never discount premium cakes.
Always use Tamil + English.
Do not promote unavailable products.

An AI update should respect these rules.

53. Business Memory vs Business Data

Important distinction:

Business Data:
Chocolate Cake = ₹700

Business Memory:

Never discount premium cakes.

Memory influences behavior.

Data represents current business facts.

54. Update Conflicts

Future collaborative editing may produce conflicts.

Example:

Owner:
₹650 → ₹700

Manager:
₹650 → ₹680

The system should eventually identify the conflict rather than silently overwriting one change.

55. v0.1 Conflict Strategy

For v0.1:

Prefer a simple last-approved-save model with clear ownership rules.

Complex real-time collaborative conflict resolution is out of scope.

56. Autosave

The editor may autosave drafts.

Important:

Autosave
≠
Publish

Customer-facing content should only change according to the publication model.

57. Immediate vs Published Changes

Some future settings may be safe to update immediately.

Example:

Draft UI setting

However, for v0.1, use a consistent publish model wherever practical.

58. Update Notifications

Future:

After publishing:

Your website has been updated successfully.

For important changes:

12 product prices were updated.

59. Failed Update

If publishing fails:

Your changes are still saved as a draft.

The currently published business is unchanged.

[Retry]
60. Rollback

Future:

Restore Previous Version

should restore the business state to a known previous version.

61. Rollback Safety

Rollback should:

create a new change/version,
not destroy historical records,
clearly indicate what happened.

Example:

Version 15 restored from Version 12.
62. Update and Website Rendering

Website rendering should consume the current published state.

Published Business Data
        +
Published Site Configuration
        ↓
Public Website
63. Update and Analytics

Analytics should preserve historical product identity where possible.

If a price changes:

Product ID remains the same.

Historical views remain associated with the product.

64. Update and QR

QR destination should remain stable after normal business updates.

Same QR
 ↓
Same Public URL
 ↓
Updated Business
65. Update and WhatsApp

WhatsApp message generation should use current approved information.

Example:

Product:
Chocolate Cake

Current Price:
₹700

Future contextual messages should use the current approved price if price inclusion is enabled.

66. Update and SEO

Future SEO generation may use updated:

business name,
product name,
product descriptions,
location,
services.

SEO updates should not generate unsupported claims.

67. Update and AI Knowledge

Future AI systems should use the current approved business state.

The AI should not continue answering:

Chocolate Cake costs ₹650

after the approved value has changed to:

₹700.

68. Stale Data Protection

If a downstream cache or generated representation becomes stale, the system should have a mechanism to refresh it.

Conceptually:

Business Update
     ↓
Version Change
     ↓
Invalidate Dependent Data
     ↓
Regenerate / Refresh
69. Version Number

Future implementation may assign versions:

Business Version 1
Business Version 2
Business Version 3

This can help with:

caching,
publishing,
rollback,
synchronization,
debugging.
70. Change Event

Future architecture may emit internal events.

Example:

BUSINESS_UPDATED
PRODUCT_UPDATED
PRODUCT_PRICE_UPDATED
PRODUCT_AVAILABILITY_CHANGED
HOURS_UPDATED
CONTACT_UPDATED

These events can notify dependent systems.

71. Event Principle

Events should describe facts.

Example:

PRODUCT_PRICE_UPDATED

rather than:

UPDATE_WEBSITE_NOW

The website can react to the fact that business data changed.

72. Decoupling

The Knowledge Base should not need to know every downstream consumer.

Instead:

Business Data
      ↓
Change Event
      ↓
Consumers

Possible consumers:

Website
Analytics
SEO
AI
WhatsApp
Future Ordering
73. Future Queue/Event System

For the MVP, a simple synchronous update may be sufficient.

Future scale may require:

Business Update
      ↓
Event Queue
      ↓
Consumers

This should not be over-engineered for v0.1.

74. Update Performance

Normal business updates should feel immediate.

The owner should receive:

Saved

quickly.

Heavy downstream processing can happen asynchronously where appropriate.

75. Update Atomicity

A published business state should be internally consistent.

Avoid publishing:

New product name
+
Old price
+
Missing image

when the change should be atomic.

76. Transaction Principle

Where multiple related fields must change together:

Validate
 ↓
Apply as one logical update
77. Example Atomic Update

Changing:

Product
Name
Price
Description

should result in one valid product state.

78. Partial Failure

If a downstream operation fails:

Example:

Business update succeeded
Website cache refresh failed

The system should:

retain the valid business state,
retry refresh,
report the issue internally,
avoid corrupting the business data.
79. Public Consistency

The goal is:

Customers should see a valid published business state.

Temporary propagation delays should be minimized and handled safely.

80. v0.1 Update Categories
P0
Business Name
Description
Contact
WhatsApp
Hours
Address
Products
Categories
Prices
Availability
P1
Bulk editing
Temporary hours
Archive
Version history
Rollback
Advanced media management
P2
AI updates
External synchronization
Conflict resolution
Advanced automation
Business Memory integration
Autonomous updates
81. v0.1 P0 Requirements
UPDATE-P0-001
Business information has a single source of truth.

UPDATE-P0-002
Owner can edit business information.

UPDATE-P0-003
Owner can edit products.

UPDATE-P0-004
Owner can edit categories.

UPDATE-P0-005
Owner can change prices.

UPDATE-P0-006
Owner can change product availability.

UPDATE-P0-007
Owner can edit opening hours.

UPDATE-P0-008
Owner can edit public contact information.

UPDATE-P0-009
Changes can be saved as draft.

UPDATE-P0-010
Owner can publish changes.

UPDATE-P0-011
Published website uses published business data.

UPDATE-P0-012
QR destination remains stable after normal updates.

UPDATE-P0-013
WhatsApp contextual data uses approved business information.

UPDATE-P0-014
Validation occurs before publication.

UPDATE-P0-015
Failed publication does not destroy the current published state.

UPDATE-P0-016
Business ownership is enforced.
82. v0.1 P1 Requirements
UPDATE-P1-001
Bulk editing.

UPDATE-P1-002
Product archiving.

UPDATE-P1-003
Temporary business hours.

UPDATE-P1-004
Change preview.

UPDATE-P1-005
Change summary.

UPDATE-P1-006
Version history.

UPDATE-P1-007
Rollback.

UPDATE-P1-008
Audit history.

UPDATE-P1-009
Change notifications.

UPDATE-P1-010
Improved propagation monitoring.
83. v0.1 P2 Requirements
UPDATE-P2-001
AI business updates.

UPDATE-P2-002
Natural-language editing.

UPDATE-P2-003
AI approval inbox.

UPDATE-P2-004
Business Memory integration.

UPDATE-P2-005
External platform synchronization.

UPDATE-P2-006
Collaborative editing.

UPDATE-P2-007
Conflict resolution.

UPDATE-P2-008
Autonomous updates.

UPDATE-P2-009
Advanced event-driven synchronization.

UPDATE-P2-010
Automatic business optimization.
84. Acceptance Criteria

The Business Updates module is complete for v0.1 when:

A business has one authoritative source for its core information.
Owner can edit business information.
Owner can edit products.
Owner can edit categories.
Owner can update prices.
Owner can update availability.
Owner can update opening hours.
Owner can update contact information.
Changes can remain in draft state.
Owner can publish changes.
Published surfaces use the approved state.
Product data is not duplicated inside the website builder.
QR URLs remain stable after normal updates.
WhatsApp messages use current approved business information.
Invalid updates are rejected.
Failed publication does not replace the current live state.
Unauthorized users cannot modify another business.
Historical product identity can remain stable across normal edits.
85. Example End-to-End Scenario
Initial State
Royal Bakes

Chocolate Truffle Cake
₹650

Open:
9 AM – 9 PM

WhatsApp:
+91 XXXXX XXXXX
Owner Makes Changes
Price:
₹650 → ₹700

Hours:
9 AM – 9 PM
→
10 AM – 10 PM
Draft
2 changes ready

Chocolate Cake:
₹650 → ₹700

Opening Hours:
9 AM – 9 PM
→
10 AM – 10 PM
Owner Publishes
[Publish Changes]
FrontDesk
Knowledge Base
       ↓
Published State
       ↓
Website
       ↓
QR
       ↓
WhatsApp Context
       ↓
Future AI
Customer

Sees:

Chocolate Truffle Cake
₹700

Open today:
10 AM – 10 PM
86. Future Vision

Eventually FrontDesk should reach:

Owner:

"Tomorrow we're closing at 6 PM."

        ↓

FrontDesk

Understands:
Temporary opening-hours change

        ↓

Creates proposed update

        ↓

Updates:
Website
QR menu
Business information
AI knowledge
Future Google sync

        ↓

Owner approves
87. Final Principle

The owner should update the business, not the website.

This is a foundational FrontDesk principle.

The website is only one representation of the business.

The business itself is the source of truth.