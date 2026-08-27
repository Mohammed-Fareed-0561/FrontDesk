# FrontDesk — UI/UX Specification

**Product:** FrontDesk  
**Version:** v0.1  
**Document:** UI/UX Specification  
**Status:** Draft — Implementation Reference  
**Last Updated:** 2026-08-26

---

# 1. Purpose

This document defines the user experience, interface architecture, navigation, screens, interactions, responsive behavior, states, components, and UX rules for FrontDesk v0.1.

This document must be used by:

- frontend developers
- UI/UX designers
- AI coding agents
- QA engineers
- product developers

The purpose is to ensure that different developers or AI systems produce the same product experience instead of independently interpreting the product.

---

# 2. Product UX Vision

FrontDesk should feel like:

> A simple digital front desk for a real business.

It should NOT feel like:

- an enterprise ERP
- a complicated CRM
- an AI laboratory
- a generic website builder
- an overloaded admin panel

The owner should be able to understand the product without technical knowledge.

---

# 3. Core UX Promise

The first-time user experience should communicate:

> Bring your business here. We'll turn it into a digital presence you can actually run.

Primary workflow:

```text
Import
   ↓
Review
   ↓
Structure
   ↓
Publish
   ↓
QR
   ↓
WhatsApp / Enquiries
   ↓
Update
   ↓
Approve
4. v0.1 UX Principle

The application must prioritize:

Clarity
Speed
Trust
Simplicity
Business usefulness
Mobile usability
Recoverability
5. Primary User

The primary user is a small-business owner or operator.

Examples:

café owner
restaurant owner
bakery owner
local shop owner
service business owner
small retail business owner

The user may have:

limited technical knowledge
limited time
an existing WhatsApp Business account
Instagram presence
PDFs
menus
spreadsheets
images
an existing website
6. UX Assumptions

The user may not understand terms such as:

API
database
AI agent
RAG
webhook
knowledge base
workflow engine

Therefore UI copy should use business language.

Instead of:

Configure Knowledge Base

Prefer:

Business Information

Instead of:

Execute AI Action

Prefer:

Apply Change

Instead of:

Configure Webhook

Prefer:

Connect WhatsApp

7. UX Tone

The interface should feel:

Friendly
Professional
Calm
Modern
Trustworthy
Practical

Avoid:

Overly futuristic
Cyberpunk
Excessive gradients
Excessive AI branding
Technical terminology
Excessive animations
8. AI Positioning

AI should be presented as a helpful capability inside FrontDesk.

It should NOT dominate the interface.

Bad:

AI COMMAND CENTER

Better:

Copilot

or:

Ask FrontDesk

The product should remain useful even when AI is unavailable.

9. Application Structure

FrontDesk consists of two major experiences:

                    FrontDesk
                       │
             ┌─────────┴─────────┐
             │                   │
        Owner App            Public Site
             │                   │
        Dashboard           Business Website
        Catalog             Catalog/Menu
        Inbox               QR destination
        Copilot             Contact
        Settings
10. Platform Strategy

v0.1 will be:

Responsive Web Application + PWA

Native Android/iOS applications are NOT required for v0.1.

The owner application must work on:

Desktop
Laptop
Tablet
Mobile
11. PWA Requirements

The owner application should support:

Installable application
App icon
Standalone mode
Responsive layout
Service worker
Offline shell
Cached static assets
Update notification

Offline functionality should initially focus on:

cached application shell
recently viewed business information
basic catalog viewing
safe draft editing where technically practical

Online synchronization remains the source of truth.

12. Responsive Breakpoints

The interface should support at minimum:

Mobile:
320px+

Tablet:
768px+

Desktop:
1024px+

Large desktop:
1440px+

Exact breakpoints may be defined by the frontend implementation.

13. Desktop Layout

Desktop application:

┌──────────────────────────────────────────────────────────┐
│ Top Bar                                                   │
├───────────────┬──────────────────────────────────────────┤
│               │                                          │
│ Sidebar       │ Main Content                             │
│               │                                          │
│ Dashboard     │                                          │
│ Business      │                                          │
│ Catalog       │                                          │
│ Website       │                                          │
│ Inbox         │                                          │
│ Copilot       │                                          │
│ Activity      │                                          │
│ Settings      │                                          │
│               │                                          │
└───────────────┴──────────────────────────────────────────┘
14. Mobile Layout

Mobile should not simply shrink the desktop sidebar.

Use:

┌───────────────────────┐
│ Header                │
├───────────────────────┤
│                       │
│ Main content          │
│                       │
│                       │
├───────────────────────┤
│ Home Catalog Inbox    │
│ Copilot More          │
└───────────────────────┘

Primary actions must remain reachable with one hand.

15. Primary Navigation

Desktop navigation:

Home
Business
Catalog
Website
Inbox
Copilot
Activity
Settings

Optional secondary navigation may appear inside modules.

16. Navigation Hierarchy
Home
│
├── Business
│   ├── Overview
│   ├── Information
│   ├── Import
│   └── Business Memory
│
├── Catalog
│   ├── Products
│   ├── Categories
│   └── Availability
│
├── Website
│   ├── Overview
│   ├── Builder
│   ├── Preview
│   └── Versions
│
├── Inbox
│   ├── All
│   ├── New
│   ├── In Progress
│   └── Resolved
│
├── Copilot
│   ├── Chat
│   ├── Suggestions
│   └── Approvals
│
├── Activity
│
└── Settings
17. Authentication

Required screens:

Sign Up
Sign In
Email Verification
Forgot Password
Reset Password
MFA
Session Recovery
18. Sign Up Screen

Purpose:

Allow a new business owner to create an account.

Fields:

Name
Email
Password

Optional:

Business name

Primary CTA:

Create account

Secondary:

Already have an account? Sign in

19. Sign In Screen

Fields:

Email
Password

Actions:

Sign in
Forgot password
Continue with supported authentication provider
20. Onboarding

After authentication, the user enters onboarding.

Goal:

Get the business into FrontDesk as quickly as possible.

Onboarding should avoid long forms.

21. Onboarding Step 1

Screen:

Tell us about your business

Fields:

Business name
Business type
Location

Business type examples:

Restaurant
Café
Bakery
Retail
Services
Other
22. Onboarding Step 2

Screen:

Where does your business already exist?

Options:

Website
Instagram
PDF
CSV / Spreadsheet
Images
Manual entry

User may select multiple sources.

23. Onboarding Step 3

Screen:

Bring your business into FrontDesk

Primary actions:

Import from website
Upload files
Connect supported source
Enter manually
24. Business Import Experience

The importer is one of the most important UX flows.

It must feel like:

Give FrontDesk your existing information
             ↓
FrontDesk processes it
             ↓
You review what was found
             ↓
Confirm
             ↓
Your business is ready
25. Import Screen

Title:

Bring your business here

Description:

Import your existing business information instead of starting from scratch.

Input options:

Website URL
Upload files

Drag-and-drop area:

Drop your files here

Supported examples:

PDF
CSV
Images
Documents
26. Import Progress

The user should see meaningful progress.

Example:

Importing your business...

✓ Website connected
✓ Business information found
✓ Products found
✓ Images found
● Organizing information
○ Preparing your digital presence

Avoid fake progress percentages.

27. Import Review

After processing:

We found these details about your business

Show:

Business information
Products
Categories
Contact details
Opening hours
Images
Social links

Each section should be editable.

28. Import Confidence

If information was uncertain:

Needs review

Example:

We found two different opening times. Please confirm which one is correct.

Never silently choose potentially important conflicting business data.

29. Import Confirmation

Final CTA:

Confirm business information

Secondary:

Review again

After confirmation:

Business created
Knowledge organized
Catalog prepared
30. First Dashboard

After successful onboarding:

Welcome to FrontDesk, [Business Name]

Show immediate status.

Example:

Your business is 80% ready

✓ Business information
✓ Catalog
✓ Public page
○ QR code
○ WhatsApp
31. Dashboard Philosophy

The dashboard should answer:

What is happening?
What needs attention?
What should I do next?

Not:

Here are 42 analytics widgets.

32. Dashboard Layout
┌───────────────────────────────────────────────────────┐
│ Good morning, [Business]                              │
│ Here's what needs your attention.                     │
├───────────────────────────────────────────────────────┤
│                                                       │
│ Setup progress                                        │
│ ███████████████░░░                                   │
│                                                       │
├──────────────────────┬────────────────────────────────┤
│ Today's activity     │ Needs attention                │
│                      │                                │
│ 12 enquiries         │ 2 products need review        │
│ 48 visitors          │ 1 AI suggestion                │
│ 5 orders             │                                │
├──────────────────────┴────────────────────────────────┤
│ Recent activity                                       │
└───────────────────────────────────────────────────────┘
33. Dashboard Primary CTA

The primary CTA should change according to business state.

Examples:

Finish setup
Publish your website
Connect WhatsApp
Review imported products
Review AI suggestions

Do not permanently show the same CTA.

34. Business Overview

Business page shows:

Business name
Business category
Location
Contact information
Opening hours
Social links
Business description

Actions:

Edit
Import
Preview
35. Business Information Editor

Sections:

Basic information
Contact
Location
Opening hours
Social profiles
Description
Business settings

Use grouped sections rather than one giant form.

36. Catalog UX

Catalog should be one of the easiest areas to operate.

Primary actions:

Add product
Edit product
Duplicate
Archive
Mark unavailable
Reorder
37. Product List

Desktop:

┌────────────────────────────────────────────────────┐
│ Products                         + Add product     │
├────────────────────────────────────────────────────┤
│ Search products                                    │
├────────────────────────────────────────────────────┤
│ Product     Category      Price      Status        │
│ Product A   Drinks        ₹120       Available     │
│ Product B   Food          ₹180       Available     │
│ Product C   Dessert       ₹150       Unavailable   │
└────────────────────────────────────────────────────┘
38. Product Editor

Fields:

Name
Description
Price
Category
Images
Availability
Variants
Tags

Optional fields should remain hidden until needed.

39. Product Status

Use clear states:

Available
Unavailable
Draft
Archived
Needs review
40. Catalog Search

Search should support:

product name
category
tags

Results should update quickly.

41. Website Section

Website module should show:

Website status
Public URL
Preview
Edit
Publish
Versions
42. Website Builder Philosophy

The website builder should NOT compete with advanced design software.

The objective is:

Create a professional business presence quickly.

43. Website Builder Structure
┌──────────────┬───────────────────────────┬──────────────┐
│ Sections     │ Live Preview              │ Settings     │
│              │                           │              │
│ Hero         │                           │ Typography   │
│ About        │       WEBSITE             │ Colors       │
│ Products     │                           │ Layout       │
│ Gallery      │                           │              │
│ Contact      │                           │              │
└──────────────┴───────────────────────────┴──────────────┘
44. Website Sections

v0.1:

Hero
About
Products / Services
Gallery
Business Information
Opening Hours
Contact
Map
Social Links
Footer
45. Website Templates

v0.1 should provide a limited number of high-quality templates.

Do not create hundreds of templates.

Example:

Restaurant
Café
Bakery
Retail
Service
General business
46. Website Editing

Allow:

Edit text
Replace images
Change colors
Change layout variant
Reorder supported sections
Hide/show supported sections

Do not expose unnecessary design complexity.

47. Website Preview

Preview must support:

Desktop
Tablet
Mobile

Mobile should be the primary design reference.

48. Publishing

Before publishing:

Save
Preview
Publish

Publishing must provide confirmation.

Example:

Your website will become publicly visible.

Actions:

Cancel
Publish website
49. Publishing Status

Show:

Draft
Published
Publishing
Failed
50. Website Versions

Users should be able to see:

Current version
Previous versions
Published date
Changed by

Future versions may support advanced rollback.

51. QR Module

QR module should make QR generation extremely simple.

Screen:

Your business QR

Show:

QR preview
Destination
Download
Print
Copy link
52. QR Destination

v0.1 QR should point to a public business destination.

Examples:

Business website
Catalog/menu
Contact page
53. QR Download

Support:

PNG
SVG

if implementation supports both.

54. Inbox

Inbox is one of the main retention surfaces.

Purpose:

See and respond to customer enquiries.

55. Inbox Layout

Desktop:

┌────────────────┬───────────────────────────────┐
│ Conversations   │ Conversation                 │
│                 │                               │
│ John            │ John                          │
│ Sarah           │ Hello, are you open today?   │
│ Arun            │                               │
│                 │ Reply...             Send     │
└────────────────┴───────────────────────────────┘
56. Inbox States
New
Open
Waiting
Resolved
Archived
57. Conversation Screen

Show:

Customer
Messages
Timestamp
Channel
Status
Related product/order if available

Actions:

Reply
Resolve
Assign
Add note
58. AI Reply Assistance

AI may suggest:

Suggested reply

The user should be able to:

Use
Edit
Regenerate
Dismiss

AI should not automatically send messages without appropriate authorization.

59. Copilot

Copilot is the central AI interaction surface.

Purpose:

Help the business owner understand and operate their business.

60. Copilot Entry

Desktop:

Sidebar → Copilot

Contextual access:

Ask FrontDesk

may appear throughout the product.

61. Copilot Screen
┌───────────────────────────────────────────────────┐
│ Copilot                                           │
│                                                   │
│ What can I help with?                             │
│                                                   │
│ "What should I update today?"                     │
│                                                   │
│ [Ask FrontDesk...]                         Send   │
│                                                   │
│ Suggestions                                       │
│ • Review low-performing products                  │
│ • Update opening hours                            │
│ • Reply to 3 enquiries                            │
└───────────────────────────────────────────────────┘
62. Copilot Language

Copilot should speak in business language.

Good:

You received 8 enquiries today. Three are still waiting for a reply.

Bad:

Query execution indicates 8 records in enquiry_state=open.

63. Copilot Context

Copilot may use authorized:

Business information
Catalog
Business knowledge
Business memory
Enquiries
Activity
Approved analytics

It must respect the security model.

64. Copilot Actions

When the user asks for a change:

User
 ↓
Copilot understands request
 ↓
Shows intended action
 ↓
Permission check
 ↓
Approval if required
 ↓
Execute
 ↓
Show result
65. AI Action Preview

Example:

I can update the price of 4 products.

Show:

Product A    ₹120 → ₹130
Product B    ₹150 → ₹160
Product C    ₹90  → ₹100
Product D    ₹200 → ₹220

Actions:

Approve
Edit
Cancel
66. AI Action Result

After execution:

Done. 4 product prices were updated.

Provide:

View changes
Undo

when supported.

67. Approval Center

Approval screen shows pending actions.

Example:

Needs your approval

Update 4 product prices
Suggested by Copilot
2 minutes ago

[Review]
68. Approval Detail

Show:

What will change
Why
Affected records
Who requested it
AI explanation
Potential impact

Actions:

Approve
Reject
Modify
69. Activity

Activity provides a simple history.

Examples:

Website published
Product updated
Customer enquiry received
AI suggestion created
AI action approved
QR generated
Business information imported
70. Activity Filters

Filters:

All
Business
Catalog
Website
Inbox
AI
Security
71. Activity Detail

Each activity should show:

Action
Actor
Timestamp
Affected object
Result

For AI actions:

AI
Human approved

must be distinguishable.

72. Notifications

Notification center should contain:

Important business updates
Pending approvals
New enquiries
Import issues
Publishing failures
Security alerts

Avoid unnecessary notifications.

73. Notification Priority

Use:

Critical
Important
Informational

Critical notifications should be visually distinct without being visually aggressive.

74. Settings

Settings structure:

Account
Business
Team
Permissions
Notifications
Integrations
WhatsApp
API
Security
Billing
Danger Zone

v0.1 should only expose settings that are actually implemented.

75. Team Management

If workspace collaboration is included:

Members
Role
Status
Invite
Remove
Change role
76. Role UX

Roles should be described in plain language.

Example:

Owner
Full control

Manager
Manage business operations

Editor
Manage content

Viewer
View business information
77. Security Settings

Show:

Password
MFA
Active sessions
API keys
Security activity

Sensitive changes require re-authentication where appropriate.

78. API Keys UI

If API keys are exposed in v0.1:

Screen:

API Keys

Key name
Created
Last used
Status

+ Create API key

After creation:

Copy this key now. You won't be able to see it again.

79. Danger Zone

Potential actions:

Delete business
Delete account
Disconnect integrations

Dangerous actions must use explicit confirmation.

80. Confirmation Dialogs

Confirmation dialogs must explain consequences.

Bad:

Are you sure?

Good:

Delete this product?

This product will be removed from your catalog. Existing historical records will remain where applicable.

Actions:

Cancel
Delete product
81. Destructive Actions

Destructive actions should:

require explicit confirmation
use clear wording
avoid accidental activation
support undo where possible
82. Undo

Where feasible:

Action completed
[Undo]

Undo should be time-limited and clearly communicate what will be reversed.

83. Empty States

Empty states must explain:

What this area does
Why it is empty
What the user can do next

Example:

No enquiries yet.

When customers contact your business, you'll see their messages here.

CTA:

Share your business page

84. Loading States

Use skeleton loading for major content.

Avoid showing blank screens.

85. Button Loading

During action:

Save

becomes:

Saving...

Prevent accidental duplicate submissions.

86. Error States

Errors should explain:

What happened
Whether data was saved
What the user can do next

Example:

We couldn't publish your website.

Your changes are still saved as a draft.

CTA:

Try again

87. Network Failure

When connection is lost:

You're offline

Do not silently pretend changes were saved remotely.

88. Offline UX

If an operation is safely queued:

Saved on this device. We'll sync when you're back online.

If it cannot be safely queued:

You're offline. Connect to the internet to continue.

89. Success Feedback

Use concise confirmation.

Examples:

Product updated
Website published
QR created
Reply sent
Changes saved

Avoid excessive toast notifications.

90. Forms

Forms should:

use labels
show required fields
validate inline
preserve entered data
show useful errors
91. Form Validation

Do not wait until submission to reveal every error.

Validate appropriate fields as the user interacts with them.

92. Unsaved Changes

If a user attempts to leave a page with unsaved changes:

You have unsaved changes.

Actions:

Stay
Discard changes
Save changes
93. Search

Global search may be introduced progressively.

v0.1 search should prioritize:

Products
Customers
Enquiries
Business information
94. Command / Quick Actions

Future UI may support:

Search
Create product
Reply to enquiry
Open Copilot

Do not make command interfaces mandatory for v0.1.

95. Accessibility

Target:

WCAG 2.2 AA principles where practical.

Requirements:

keyboard navigation
visible focus
semantic HTML
accessible labels
sufficient contrast
screen-reader compatibility
reduced motion
logical heading hierarchy
96. Touch Targets

Interactive mobile controls should have appropriately large touch targets.

Avoid tiny icons as primary controls.

97. Icon Usage

Icons should support meaning rather than replace text for important actions.

For example:

[trash icon] Delete

is preferable to an unlabeled trash icon in critical contexts.

98. Typography

Typography should prioritize:

readability
hierarchy
consistency

Use a limited font system.

Recommended hierarchy:

Display
H1
H2
H3
Body
Small
Caption

Exact font selection belongs in DESIGN-SYSTEM.md.

99. Color Philosophy

Use color primarily for:

brand
status
actions
warnings
errors
success

Do not use excessive color decoration.

100. Status Colors

Conceptual system:

Success
Warning
Error
Information
Neutral

Exact color tokens belong in DESIGN-SYSTEM.md.

101. Cards

Cards should be used to group related information.

Avoid excessive nested cards.

Bad:

Card
 └── Card
      └── Card
102. Tables

Tables should be used for dense operational information such as:

Products
Orders
Customers
Activity

Mobile tables should transform into:

cards
horizontal scroll
or
stacked rows

depending on information density.

103. Modals

Use modals for:

confirmation
small focused forms
quick actions

Do not put large workflows inside tiny modal windows.

104. Drawers

Drawers may be used for:

product details
customer details
activity details
mobile navigation
105. Breadcrumbs

Use breadcrumbs where navigation becomes hierarchical.

Example:

Catalog / Products / Chocolate Cake
106. Page Titles

Every major page should clearly communicate:

Where am I?
What can I do here?

Example:

Products
Manage what customers can see in your catalog.
107. Primary vs Secondary Actions

Every screen should have one clear primary action.

Example:

Primary:
Add product

Secondary:
Import
Filter
Export

Avoid multiple competing primary buttons.

108. Mobile Bottom Navigation

Recommended:

Home
Catalog
Inbox
Copilot
More

The exact visible items may change according to usage data.

109. Mobile "More"

Secondary modules:

Website
QR
Activity
Business
Settings
110. Desktop Sidebar Collapse

Desktop sidebar may support:

Expanded
Collapsed

Collapsed mode should retain recognizable icons and tooltips.

111. Breadcrumb Mobile Behavior

On mobile, breadcrumbs may collapse to:

← Products

rather than showing the full hierarchy.

112. Responsive Website Builder

The website builder must make it obvious when editing:

Desktop
Tablet
Mobile

The owner should be able to preview all major sizes.

113. Public Website UX

Public business pages should prioritize:

Business identity
Products/services
Contact
Location
Opening hours
WhatsApp/contact CTA
114. Public Website Mobile Priority

Public websites should be designed mobile-first because many customers will arrive from:

QR codes
WhatsApp
Instagram
mobile search
115. Public CTA

Depending on business:

View Menu
Contact
WhatsApp
Book
Order
Get Directions

Only show actions supported by the business.

116. WhatsApp UX

If WhatsApp is connected:

Contact on WhatsApp

should be prominent but not intrusive.

117. QR-to-Website Flow
Customer scans QR
       ↓
Public business page
       ↓
Catalog / Menu
       ↓
Product/service
       ↓
Contact / WhatsApp / supported action
118. First-Time Owner Journey

Ideal v0.1 flow:

Landing
 ↓
Sign up
 ↓
Business setup
 ↓
Import
 ↓
Review
 ↓
Confirm
 ↓
Dashboard
 ↓
Publish
 ↓
Generate QR
 ↓
Connect WhatsApp
 ↓
Receive first enquiry
119. Activation Definition

UX should optimize for:

Business imported + published + QR created + first customer interaction.

The interface should guide the user toward this state.

120. Setup Progress

Progress should be actionable.

Example:

Business setup

✓ Business information
✓ Catalog
✓ Website
○ QR
○ WhatsApp
○ First customer interaction

Each incomplete item should have a CTA.

121. First Customer Interaction

Once the business receives its first enquiry:

Your first customer interaction is here.

This should be treated as an important product milestone.

122. Trust UX

Because FrontDesk handles business information, users should understand:

what was imported
what AI generated
what changed
who changed it
when it changed
123. AI Transparency

When AI generates something, identify it appropriately.

Examples:

Suggested by FrontDesk
Generated by Copilot
Needs your review
124. AI Confidence

Avoid exposing fake numeric confidence scores.

Instead use meaningful states:

Verified
Imported
Suggested
Needs review
Unknown
125. AI Change Explanation

For important changes, show:

What changed
Why
Source

Example:

Updated opening hours based on the latest imported business information.

126. Source Visibility

Where useful, show the source:

Imported from website
Imported from PDF
Entered manually
Suggested by AI
Updated by Fareed

The exact actor naming must come from actual account data.

127. Business Memory UX

Business Memory should not look like a technical database.

Use a human-readable presentation:

Business preferences
Policies
Important facts
Operating rules
AI instructions
128. Memory Editing

Users should be able to:

View
Add
Edit
Archive

memory entries according to permissions.

129. Memory Trust

Each memory item may show:

Source
Created
Last updated
Status
130. Knowledge Base UX

Business Knowledge should be presented as:

Business information
Products
Policies
Documents
Website content
Imported sources

rather than technical vector/database terminology.

131. Import Source Management

Users should see connected sources.

Example:

Website
Connected
Last imported: Today

Menu PDF
Imported
Last updated: Yesterday
132. Re-import

Re-import should NOT blindly overwrite everything.

Flow:

Start re-import
 ↓
Detect changes
 ↓
Show changes
 ↓
Review
 ↓
Apply
133. Conflict UX

Example:

Opening hours changed from 9 AM–8 PM to 10 AM–7 PM.

Actions:

Keep current
Use imported
Edit manually
134. Version Awareness

Important business content should preserve enough history to answer:

What was changed?
When?
By whom?
135. Activity + AI Relationship

If AI changes something:

Copilot suggested
 ↓
Human approved
 ↓
System changed

The activity history should preserve this chain.

136. Error Recovery

Every major workflow should provide a recovery path.

Examples:

Import failed
→ Try again / upload different source

Publish failed
→ Retry / view error

WhatsApp connection failed
→ Reconnect

AI action failed
→ View reason / retry
137. Avoid Dead Ends

Never leave the user on a screen with only:

Something went wrong.

Always provide an actionable next step.

138. Onboarding Skip

Where possible, users may skip optional setup.

Never block the entire product for optional integrations.

139. Progressive Disclosure

Show advanced options only when needed.

Example:

Basic product editor
       ↓
More options
       ↓
Variants
Tags
SEO
Advanced settings
140. Performance UX

The UI should feel responsive even when backend operations are asynchronous.

Use:

skeletons
optimistic updates where safe
progress indicators
background processing
clear completion states
141. AI Processing UX

Never display an indefinite spinner.

Use meaningful states:

Thinking
Preparing
Reviewing business information
Generating suggestion
Applying changes

Only use these when they reflect actual processing stages.

142. Long-Running Operations

Imports, large uploads, website generation, and other long jobs should be asynchronous.

The user should be able to leave the screen without losing the operation.

143. Background Job Notification

Example:

Your business import is ready to review.

Clicking it returns the user to the relevant screen.

144. Global Toast Rules

Use toast notifications for:

small confirmations
non-blocking status

Do not use them for:

critical security warnings
major destructive confirmations
important data conflicts
145. Critical Alerts

Critical issues should use:

banner
dialog
security alert center

depending on severity.

146. UX Security Rules

The UI must never imply that an action is permitted when the backend will reject it.

Permission-aware UI may hide or disable unavailable actions.

But:

Backend authorization remains mandatory.

147. Permission-Aware UI

Example:

Viewer
   ↓
Can see product
   ↓
Cannot edit

The edit button should not appear or should be clearly disabled.

148. Sensitive Action UX

Sensitive operations should display additional context.

Example:

This action will update 47 products.

not merely:

Confirm?

149. Bulk Operations

Bulk operations must show:

number affected
items affected
potential consequences

before execution.

150. Bulk Delete

Bulk delete should require explicit confirmation.

Where possible:

Archive

should be preferred over permanent deletion.

151. Search UX

Search results should identify:

type
name
business context

Example:

Chocolate Cake
Product · Catalog
152. Keyboard Navigation

Desktop power users should be able to navigate major controls using keyboard.

Future shortcuts may include:

/
Search

N
New item

C
Copilot

Do not implement shortcuts until documented and conflict-free.

153. Accessibility Labels

Interactive controls require meaningful accessible names.

Avoid:

aria-label="button"

Prefer:

aria-label="Delete product"
154. Reduced Motion

Respect:

prefers-reduced-motion

Animations should never be necessary to understand the interface.

155. Animation Philosophy

Animations should communicate:

transition
feedback
progress
hierarchy

Avoid animation for decoration alone.

156. Design Consistency

All modules must reuse common components.

Examples:

Button
Input
Select
Dialog
Drawer
Tabs
Table
Card
Badge
Toast
Dropdown
Tooltip
Skeleton
EmptyState
ErrorState
157. Component Source of Truth

Reusable UI components should live in the frontend component system.

Feature pages should compose existing components instead of repeatedly recreating them.

Detailed component tokens belong in:

DESIGN-SYSTEM.md
158. Routing

The frontend route architecture should conceptually follow:

/auth
/onboarding
/app
/app/business
/app/business/import
/app/catalog
/app/catalog/products
/app/website
/app/website/builder
/app/inbox
/app/copilot
/app/activity
/app/settings

Exact routing implementation belongs to the frontend architecture.

159. Public Routes

Public routes may follow:

/b/[business-slug]
/b/[business-slug]/catalog
/b/[business-slug]/contact

Exact URL architecture belongs to:

DOMAIN-AND-CUSTOM-URLS.md
160. Route Protection

Protected application routes require authentication and authorization.

Public business routes must expose only published public information.

161. Deep Links

Users should be able to open links directly to:

specific product
specific enquiry
specific approval
specific business setting

where supported.

162. Browser Back Behavior

Navigation should respect normal browser history.

Avoid trapping users inside modal-heavy flows.

163. Unsaved Navigation

Before leaving unsaved work:

Stay
Save
Discard

must be offered where applicable.

164. UX for Slow Networks

The product should remain understandable on slow connections.

Prioritize:

text
critical business data
primary actions

before large images.

165. Image Loading

Use:

responsive images
lazy loading
placeholders
appropriate compression

for public business websites.

166. Public Website Performance

Generated public websites should prioritize:

fast initial load
mobile performance
compressed assets
minimal JavaScript
SEO-friendly content
167. SEO UX

Business website editor should eventually expose:

Page title
Description
Social preview

Only if included in v0.1 implementation.

168. Public Website Trust

Public pages should visibly communicate:

Business identity
Location
Contact method
Opening hours

when available.

169. Empty Business

If imported data is incomplete:

Do not show a broken website.

Instead guide the owner:

Your business page is almost ready.

Missing items should be clearly identified.

170. Demo Data

Development environments may use demo business data.

Production must never accidentally expose development/demo data.

171. Internationalization

The UI architecture should be designed so text can eventually be translated.

Avoid hardcoding important user-facing strings across arbitrary components.

v0.1 may initially ship with English.

172. Currency

Business currency should come from business settings.

For the initial target market, INR is expected to be supported.

Do not hardcode ₹ throughout the application.

173. Date and Time

Dates and times should use the business/user locale appropriately.

Store timestamps consistently on the backend.

Render them for the user.

174. Timezone

Business timezone should be stored explicitly.

Opening hours, bookings, notifications, and activity timestamps must respect the appropriate timezone.

175. Mobile Keyboard UX

Forms should use appropriate input types:

email
tel
number
url

to improve mobile keyboard behavior.

176. Mobile Editing

Editing product information should not require horizontal scrolling.

Important fields should remain visible without excessive navigation.

177. Mobile Tables

Dense desktop tables should become:

cards
stacked rows
or horizontally scrollable tables

based on usability.

178. Mobile Inbox

Mobile inbox should prioritize:

conversation list
message reading
reply
resolve

Secondary customer details may open as a drawer/page.

179. Mobile Copilot

Copilot should behave like a conversational screen.

Input must remain easily reachable.

Suggested actions may appear above the keyboard area.

180. Mobile Approval

Approval actions must be prominent:

Approve
Reject

But should not be accidentally triggered.

181. Desktop Copilot

Copilot may eventually appear as a right-side contextual panel.

v0.1 should keep the primary Copilot experience as a dedicated screen to reduce complexity.

182. Contextual Copilot

Future enhancement:

Product page
      ↓
Ask FrontDesk about this product

The context should be automatically limited to the relevant resource.

183. AI Suggestion Cards

Suggested actions should use a consistent pattern:

Suggestion
Why it matters
Affected area
Suggested action

[Review]
184. AI Action Cards

Action cards should clearly distinguish:

Suggestion
Pending approval
Approved
Executing
Completed
Failed
Cancelled
185. AI Failure UX

If AI fails:

I couldn't safely complete that change.

Show:

What was attempted
Why it failed if safe to disclose
What the user can do next
186. AI Hallucination UX

When information is uncertain, Copilot should communicate uncertainty.

Example:

I couldn't verify today's opening hours from your available business information.

Do not invent an answer.

187. AI Source UX

Where useful:

Based on your business information
Based on your catalog
Based on recent enquiries
188. Business Activity Summary

Dashboard may show:

Visitors
Enquiries
Catalog interactions

Only metrics actually available should be displayed.

189. Analytics UX

v0.1 analytics should remain lightweight.

Focus on:

activity
enquiries
public presence
basic engagement

Avoid building a full BI dashboard.

190. Analytics Empty State

Example:

Once customers start visiting your business page, you'll see activity here.

191. Notification Preferences

Users should eventually control:

Enquiries
AI approvals
Security
Website
Business updates
192. Security Notification UX

Security alerts should be separate from normal business notifications.

Example:

New API key created

New login detected

193. Session Management

Security settings should show:

Current device
Other sessions
Last active
Location estimate if appropriate
Revoke

Do not expose unnecessary sensitive location information.

194. Error Codes

User-facing UI should not expose raw backend error codes unless useful.

Internally, error codes must remain consistent with API documentation.

195. UX/API Relationship

The frontend must consume documented API contracts.

Do not implement frontend assumptions that contradict:

API.md
DATABASE-SCHEMA.md
SYSTEM-ARCHITECTURE.md
SECURITY.md
196. UX/Data Relationship

UI fields must map to actual backend data.

Do not create UI fields merely because they "look useful" without corresponding product requirements.

197. UX Scope Rule

If a feature is not in v0.1 requirements, do not add it simply because it would make the dashboard look more complete.

Avoid:

fake analytics
fake AI features
placeholder CRM
fake automation
unimplemented integrations
198. v0.1 Primary Screens

The minimum major application screens are:

Authentication
Onboarding
Business Import
Import Review
Dashboard
Business Information
Catalog
Product Editor
Website Overview
Website Builder
Website Preview
Publishing
QR
Inbox
Conversation
Copilot
AI Approval
Activity
Settings
Security
199. v0.1 Primary User Journey
                 SIGN UP
                    │
                    ▼
                ONBOARDING
                    │
                    ▼
               IMPORT BUSINESS
                    │
                    ▼
                REVIEW DATA
                    │
                    ▼
                 CONFIRM
                    │
                    ▼
                DASHBOARD
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       CATALOG   WEBSITE      QR
          │         │         │
          └─────────┼─────────┘
                    ▼
                 PUBLISH
                    │
                    ▼
               WHATSAPP
                    │
                    ▼
                 INBOX
                    │
                    ▼
             CUSTOMER INTERACTION
                    │
                    ▼
                 COPILOT
                    │
                    ▼
             SUGGESTION / ACTION
                    │
                    ▼
                APPROVAL
                    │
                    ▼
                EXECUTION
                    │
                    ▼
                 ACTIVITY
200. v0.1 UX Priorities

Priority 0:

Authentication
Onboarding
Business Import
Import Review
Dashboard
Catalog
Website
Publishing
QR
Inbox

Priority 1:

Copilot
AI Suggestions
Approvals
Activity
Business Memory UI
Basic Analytics

Priority 2:

Advanced personalization
Advanced search
Advanced analytics
Advanced team workflows
Advanced AI agents
201. Explicitly Out of Scope for v0.1 UX

Unless separately approved:

Native mobile applications
Full ERP interface
Advanced CRM
Advanced inventory management
Marketplace
Multi-location enterprise dashboard
Advanced workflow builder
Advanced AI agent builder
Complex website design editor
Advanced BI dashboard
Large template marketplace
Custom code editor
Enterprise admin console
202. UX Quality Gate

A screen is not considered complete until:

[ ] Desktop layout works
[ ] Mobile layout works
[ ] Loading state exists
[ ] Empty state exists
[ ] Error state exists
[ ] Success state exists
[ ] Permission behavior exists
[ ] Accessibility considered
[ ] Keyboard behavior considered
[ ] Touch behavior considered
[ ] API loading/failure considered
[ ] Destructive actions protected
203. Feature UX Quality Gate

Every feature must answer:

What is this?
Why does the user need it?
What is the primary action?
What happens after the action?
What happens if it fails?
Who can use it?
What data does it affect?
Can the user undo it?
What happens on mobile?
204. AI UX Quality Gate

Every AI feature must answer:

What context does AI receive?
What is AI allowed to do?
What can AI suggest?
What can AI execute?
Does approval exist?
How is uncertainty shown?
How is the result explained?
How is the action audited?
Can it be undone?
What happens if AI is unavailable?
205. Final UX Principle

FrontDesk should always optimize for:

Less configuration. More business operation.

The owner should not need to become a designer, developer, CRM administrator, or AI engineer to use FrontDesk.

206. Document Dependencies

This document depends on:

VISION.md
BRD.md
PRD.md
USER-STORIES.md
BUSINESS-IMPORTER.md
BUSINESS-KNOWLEDGE-BASE.md
BUSINESS-MEMORY.md
AI-BUSINESS-COPILOT.md
AI-AGENTS.md
ACTION-REGISTRY.md
BUSINESS-UPDATES.md
WEBSITE-BUILDER.md
PUBLISHING-AND-VERSIONING.md
QR-AND-PUBLIC-PRESENCE.md
WHATSAPP-ENQUIRY.md
ENQUIRY-AND-INBOX.md
CUSTOMER-PROFILES-AND-CRM.md
BASIC-ANALYTICS.md
SYSTEM-ARCHITECTURE.md
SECURITY.md
API.md
DATABASE-SCHEMA.md
207. Related Future Document

Detailed visual tokens and reusable component specifications belong in:

DESIGN-SYSTEM.md

That document will define:

Color tokens
Typography
Spacing
Radius
Shadows
Buttons
Inputs
Cards
Tables
Dialogs
Drawers
Navigation
Badges
Status indicators
Charts
Responsive tokens
Accessibility tokens