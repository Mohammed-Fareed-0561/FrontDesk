Next is DESIGN-SYSTEM.md.

This will be the visual and component-level source of truth that sits underneath UI-UX.md. It should prevent you or another AI from randomly changing colors, spacing, buttons, cards, typography, etc. during development.

Create:

FrontDesk/
└── documentation/
    └── DESIGN-SYSTEM.md
# FrontDesk — Design System

**Product:** FrontDesk  
**Version:** v0.1  
**Document:** Design System  
**Status:** Draft — Implementation Reference  
**Last Updated:** 2026-08-26

---

# 1. Purpose

This document defines the visual language, design tokens, reusable components, interaction patterns, responsive rules, accessibility requirements, and UI consistency rules for FrontDesk v0.1.

This document is the visual source of truth for:

- frontend developers
- UI/UX designers
- AI coding agents
- QA engineers
- future design contributors

The objective is to ensure that every FrontDesk screen looks and behaves as part of the same product.

---

# 2. Design Philosophy

FrontDesk should feel:

> Simple enough for a small-business owner, powerful enough to become their daily business workspace.

The visual design should communicate:

```text
Trust
Clarity
Professionalism
Simplicity
Speed
Warmth
Modern technology
3. Design Direction

FrontDesk should NOT visually resemble:

A generic AI chatbot
A crypto dashboard
A developer console
An enterprise ERP
A gaming interface
A futuristic AI laboratory
A template marketplace

Instead, it should feel like:

A premium modern business application
+
A calm operational workspace
+
A lightweight digital front desk
4. Core Visual Principle

The interface should prioritize:

Content > Decoration
Action > Complexity
Clarity > Cleverness
Consistency > Novelty
Trust > Flashiness
5. Design System Layers

The design system consists of:

Design Tokens
     ↓
Primitive Components
     ↓
Composite Components
     ↓
Feature Components
     ↓
Page Layouts

Example:

Color token
    ↓
Button
    ↓
Action button group
    ↓
Product editor
    ↓
Catalog page
6. Design Token Philosophy

Do not hardcode visual values throughout the application.

Bad:

color: #123456;
margin: 17px;
border-radius: 13px;

Repeated randomly throughout components.

Prefer semantic tokens:

--color-primary
--color-surface
--color-text-primary
--space-4
--radius-md
7. Color System

FrontDesk should use a restrained palette.

The final visual palette should be established as design tokens rather than repeatedly chosen per component.

Primary categories:

Brand
Primary
Secondary
Background
Surface
Text
Border
Success
Warning
Error
Info
8. Brand Color

The primary brand color should communicate:

trust
technology
professionalism

Recommended initial direction:

Deep navy / blue

The exact production hex value must be finalized during visual implementation and then stored as a single token.

9. Primary Color

Semantic token:

--color-primary

Used for:

primary buttons
links
active navigation
selected states
important controls

Do not use primary color for every visual element.

10. Primary Hover
--color-primary-hover

Hover must be visually distinguishable but not dramatically different from the base color.

11. Primary Active
--color-primary-active

Used when the user presses or activates the primary control.

12. Background

Primary application background:

--color-background

Should be visually calm and support long sessions.

Avoid extremely saturated backgrounds.

13. Surface
--color-surface

Used for:

cards
panels
dialogs
drawers
tables
inputs
14. Elevated Surface
--color-surface-elevated

Used for elements that visually sit above the primary surface.

Avoid excessive elevation.

15. Text Colors

Required semantic tokens:

--color-text-primary
--color-text-secondary
--color-text-muted
--color-text-disabled

Hierarchy:

Primary
   ↓
Secondary
   ↓
Muted
   ↓
Disabled
16. Border Colors

Use:

--color-border
--color-border-subtle
--color-border-strong

Borders should remain subtle.

Do not outline every element heavily.

17. Status Colors

Required:

Success
Warning
Error
Info

Semantic tokens:

--color-success
--color-warning
--color-error
--color-info
18. Status Usage
Success

Examples:

Published
Saved
Connected
Completed
Warning

Examples:

Needs review
Expiring
Incomplete
Error

Examples:

Failed
Invalid
Blocked
Unauthorized
Info

Examples:

Imported
Processing
New information
19. Color Accessibility

Color must never be the only way to communicate status.

Bad:

green = available
red = unavailable

without text.

Prefer:

✓ Available
! Needs review
× Unavailable

with appropriate color support.

20. Dark Mode

Dark mode is not mandatory for v0.1 unless implemented intentionally.

If introduced, it must use semantic tokens rather than manually replacing individual colors.

Do not build two unrelated visual systems.

21. Typography

Typography should prioritize:

Readability
Hierarchy
Scanning
Consistency

Recommended font direction:

Modern sans-serif

The exact production font must be selected once and documented in the implementation.

22. Font Roles

Use:

Display
Heading
Body
Label
Caption
Monospace
23. Typography Hierarchy

Conceptual scale:

Display
H1
H2
H3
H4
Body Large
Body
Body Small
Caption

Do not create arbitrary font sizes for individual components.

24. Heading Rules

Headings should:

clearly establish hierarchy
remain concise
avoid excessive weight
maintain consistent spacing

Example:

Products

Manage what customers can see in your catalog.
25. Body Text

Body text should be comfortable for long-form reading.

Avoid excessively small text in important workflows.

26. Monospace

Use monospace only where technical information genuinely requires it.

Examples:

API keys
IDs
code
logs
technical values

Do not use monospace for normal business content.

27. Spacing System

Use a consistent spacing scale.

Recommended base:

4px

Conceptual tokens:

space-1 = 4px
space-2 = 8px
space-3 = 12px
space-4 = 16px
space-5 = 20px
space-6 = 24px
space-8 = 32px
space-10 = 40px
space-12 = 48px
space-16 = 64px

The exact values may be adjusted during implementation but must remain tokenized.

28. Spacing Rules

Use smaller spacing for:

related controls
form fields
metadata

Use larger spacing for:

sections
major page groups
page headers
29. Layout Grid

Desktop layouts should use a consistent content grid.

Recommended:

12-column conceptual grid

with responsive adaptation.

30. Content Width

Long-form content should not span the entire screen.

Use a maximum readable width.

Operational dashboards may use wider layouts.

31. Page Padding

Desktop:

comfortable horizontal padding

Tablet:

reduced padding

Mobile:

compact but touch-friendly padding

Exact values should come from spacing tokens.

32. Border Radius

Use a restrained radius system.

Example:

radius-sm
radius-md
radius-lg
radius-xl
radius-full

Suggested semantic usage:

sm → small controls
md → inputs/buttons
lg → cards
xl → prominent panels
full → pills/avatars
33. Avoid Excessive Rounded Design

Do not make every element a giant rounded pill.

Use rounded shapes intentionally.

34. Shadows

Use shadows sparingly.

Primary use cases:

dialogs
dropdowns
floating panels
elevated surfaces

Most cards should work without heavy shadows.

35. Elevation

Conceptual levels:

Level 0
Page

Level 1
Card

Level 2
Dropdown

Level 3
Dialog / Drawer

Level 4
Critical floating interface
36. Icons

Use one consistent icon family throughout the application.

Do not mix unrelated icon styles.

Icons should generally:

have consistent stroke weight
align with text
use semantic meaning
37. Icon Sizes

Standard sizes should include:

16px
18px
20px
24px
32px

Avoid arbitrary icon sizes.

38. Icon + Text

Important actions should generally use:

Icon + Text

rather than icon-only controls.

Icon-only controls require accessible labels and tooltips.

39. Buttons

Primary button variants:

Primary
Secondary
Tertiary
Destructive
Ghost
Icon
40. Primary Button

Use for the main action of a page.

Examples:

Add product
Publish website
Save changes
Approve

A page should generally have one dominant primary action.

41. Secondary Button

Use for supporting actions.

Examples:

Preview
Import
Cancel
Edit
42. Tertiary / Ghost Button

Use for low-emphasis actions.

Examples:

View details
Learn more
43. Destructive Button

Used for:

Delete
Remove
Disconnect
Revoke

Destructive actions must be clearly labeled.

44. Button States

Every button must support:

Default
Hover
Focus
Active
Disabled
Loading
45. Button Loading

Example:

Save

becomes:

Saving...

The button should normally remain disabled while the same operation is executing.

46. Inputs

Standard input types:

Text
Email
Password
Number
URL
Search
Textarea
Select
Multi-select
Date
Time
47. Input Structure

Recommended:

Label
Input
Helper text
Error message

Example:

Business name

[ ABC Bakery                 ]

This name appears on your public page.
48. Input States

Every input should support:

Default
Hover
Focus
Filled
Disabled
Read-only
Error
Success
49. Validation

Errors should appear close to the affected field.

Bad:

Something went wrong.

Better:

Business name is required.
50. Select

Use select controls when users choose from a defined set.

Do not use free text when only predefined values are valid.

51. Checkbox

Use for independent options.

Example:

☐ Show opening hours
52. Radio

Use when exactly one option should be selected.

53. Switch

Use for immediate on/off settings.

Example:

WhatsApp integration
                 ON

Avoid switches for actions that require confirmation.

54. Search Input

Search should include:

search icon
clear control
keyboard focus
55. Cards

Cards should group related information.

Examples:

Setup progress
Activity
Business overview
AI suggestion
Product summary
56. Card Anatomy
Title
Description
Content
Optional metadata
Optional action
57. Badges

Use badges for compact status.

Examples:

Published
Draft
Available
Needs review
Pending
58. Badge Rules

Badges should remain short.

Bad:

This product is currently waiting for administrator approval

Better:

Pending approval
59. Avatar

Used for:

user
team member
customer

Provide initials when no image exists.

60. User Menu

Top-right user menu may contain:

Profile
Business
Settings
Security
Sign out
61. Navigation

Desktop sidebar:

Home
Business
Catalog
Website
Inbox
Copilot
Activity
Settings
62. Active Navigation

Active navigation should use:

background
text
icon

with sufficient contrast.

Do not rely solely on a tiny color change.

63. Sidebar

Sidebar should:

remain visually stable
clearly show active area
support collapse if implemented
64. Mobile Navigation

Primary mobile navigation:

Home
Catalog
Inbox
Copilot
More

Secondary modules belong under More.

65. Tabs

Use tabs for related views at the same hierarchy.

Examples:

Products | Categories
Overview | Versions
All | New | Resolved

Do not use tabs for unrelated sections.

66. Breadcrumbs

Use for deep hierarchy:

Catalog / Products / Chocolate Cake

Mobile may collapse to a back navigation.

67. Tables

Tables are for dense operational data.

Required states:

loading
empty
populated
error
68. Table Actions

Row actions should not become visually overwhelming.

Use:

Edit
More

for secondary actions.

69. Mobile Tables

Tables should transform appropriately.

Possible strategies:

horizontal scrolling
stacked cards
responsive rows

Choose based on content.

70. Dialog

Dialogs are for focused interactions.

Use for:

confirmation
small forms
high-risk actions
71. Dialog Anatomy
Title
Description
Content
Actions
72. Destructive Dialog

Example:

Delete product?

This will remove the product from your active catalog.

[Cancel] [Delete product]
73. Drawer

Use drawers for contextual information.

Examples:

Product details
Customer details
Activity details
74. Toast

Use for short non-blocking feedback.

Examples:

Product saved
Website published
QR created
75. Toast Rules

Toasts must:

be dismissible where appropriate
not contain excessive text
not hide important controls
not be the only indication of critical errors
76. Alert

Use alerts for persistent information.

Examples:

Website unpublished
WhatsApp disconnected
Import needs review
77. Tooltip

Tooltips are for supplementary information.

Do not hide critical instructions exclusively inside tooltips.

78. Empty State

Standard structure:

Illustration/Icon
Title
Explanation
Primary CTA

Example:

No enquiries yet

When customers contact your business,
their conversations will appear here.

[Share your business page]
79. Loading State

Use skeletons for content-heavy pages.

Example:

████████████
████████
████████████████

Avoid excessive animated spinners.

80. Spinner

Use spinners for short operations.

Examples:

Saving
Connecting
Sending
81. Progress Indicator

Use progress indicators for long operations.

Examples:

Business import
File processing
Website publishing

Progress must represent real or meaningful progress.

82. Stepper

Use for multi-stage workflows.

Example:

Import
   ↓
Review
   ↓
Confirm
   ↓
Publish
83. Status Indicator

Standard states:

Active
Inactive
Pending
Processing
Success
Warning
Error
84. Skeleton Design

Skeletons should roughly match the shape of the content they replace.

Do not create a generic full-screen skeleton for every page.

85. Modal vs Page

Use a page when:

workflow is long
multiple sections exist
user needs navigation

Use a modal when:

decision is small
confirmation is required
quick action is needed
86. Forms vs Inline Editing

Use inline editing for:

simple values
quick catalog changes

Use dedicated forms for:

complex product configuration
business settings
security settings
87. Product Card

Product card should support:

image
name
price
availability
category
quick action
88. Product List Item

Mobile list item:

┌────────────────────────────┐
│ Image  Product Name        │
│        ₹120                │
│        Available           │
│                    ⋯       │
└────────────────────────────┘
89. AI Suggestion Card

Structure:

AI suggestion

Title

Why this matters

Affected data

[Review]
90. AI Approval Card

Structure:

Needs approval

Action
Affected items
Reason
Risk / impact

[Reject] [Review]
91. AI Action Status

Visual states:

Suggested
Awaiting approval
Approved
Executing
Completed
Failed
Cancelled
92. AI Attribution

AI-generated content should be identifiable without dominating the UI.

Use subtle labels:

Suggested by FrontDesk
Generated by Copilot
93. Business Memory Card

Example:

Business preference

"Do not offer discounts above 10%."

Source: Owner
Updated: Today

[Edit]
94. Knowledge Source Card

Example:

Website

Imported
Last updated: Today

[View] [Re-import]
95. Activity Item

Example:

● Website published

By Fareed
Today, 10:42 AM

AI action:

● Product prices updated

Suggested by Copilot
Approved by owner
Today, 10:45 AM
96. Visual Hierarchy

Every screen should have:

Primary hierarchy
    ↓
Page title
    ↓
Primary action
    ↓
Main content
    ↓
Secondary information
    ↓
Metadata
97. Density

FrontDesk should generally use:

Medium information density.

Too sparse:

large empty spaces
few useful controls

Too dense:

ERP-like tables everywhere
98. Dashboard Density

Dashboard should prioritize scanning.

Use:

summary
attention items
recent activity

rather than excessive graphs.

99. Catalog Density

Catalog can be denser because it is an operational interface.

100. Inbox Density

Inbox should maximize conversation readability.

Avoid excessive decoration.

101. Copilot Density

Copilot should feel spacious and conversational.

102. Website Builder Density

Website builder may be dense because it contains editing controls, but the preview must remain dominant.

103. Responsive Design Rule

Do not merely shrink desktop components.

For every component ask:

What is the mobile equivalent?
What information is essential?
What can collapse?
What can move?
104. Mobile Priority

On mobile:

Primary action
    ↓
Primary content
    ↓
Secondary information
    ↓
Advanced settings
105. Touch Interaction

Touch targets should be large enough for comfortable interaction.

Avoid closely packed destructive controls.

106. Hover Independence

Important functionality must not depend on hover.

Mobile users do not have hover.

107. Focus States

Keyboard focus must be clearly visible.

Do not remove browser focus indicators without replacing them with an accessible equivalent.

108. Accessibility Contrast

Text and important controls must meet appropriate contrast requirements.

Do not use light gray text for critical information merely for visual style.

109. Reduced Motion

All major animations must respect reduced-motion preferences.

110. Animation Timing

Animations should be:

short
subtle
purposeful

Avoid long transitions that slow down business operations.

111. Skeleton Animation

Skeleton animation should be subtle.

Respect reduced-motion preferences.

112. Page Transitions

Page transitions are optional.

Do not sacrifice perceived performance for animation.

113. Public Website Design

Generated public websites may use more visual expression than the owner dashboard.

However, FrontDesk templates must remain:

professional
fast
mobile-first
accessible
business-appropriate
114. Template Consistency

All templates must use the same underlying design token system where possible.

Template personality may change:

layout
imagery
typography pairing
section arrangement

but accessibility and interaction conventions remain consistent.

115. Public Website CTA

CTA style must be consistent with the selected template.

Supported primary actions may include:

Order
Book
Contact
WhatsApp
Get Directions
View Menu

Only show relevant actions.

116. QR Design

QR codes should be:

high contrast
scannable
sufficiently large
print-friendly

Avoid decorative modifications that reduce scanning reliability.

117. Image Guidelines

Business images should support:

object-fit
responsive sizing
lazy loading
fallback
118. Image Fallback

If an image fails:

Do not show a broken-image icon as the primary experience.

Show an appropriate placeholder.

119. Avatar Fallback

If user/customer image unavailable:

Use initials or a neutral avatar.

120. Error Visual Hierarchy

Errors should be noticeable but not visually overwhelming.

Critical errors should use stronger emphasis.

Minor validation errors should remain close to their fields.

121. Success Visual Hierarchy

Success should be reassuring but brief.

Do not turn every successful save into a large celebration animation.

122. Warning Visual Hierarchy

Warnings should communicate:

what may happen
what the user should do
123. Confirmation UX

High-risk actions should require intentional confirmation.

Do not use confirmation dialogs for every tiny action.

124. Undo UX

Undo is preferred over confirmation for safe reversible actions.

Example:

Product archived.

[Undo]
125. Destructive UX

Permanent destruction should use confirmation.

Examples:

Delete business
Delete account
Permanently delete document
126. Business Owner Mental Model

UI labels should map to familiar business concepts:

Products
Customers
Messages
Website
Orders
Bookings
Business information

rather than:

Entities
Resources
Nodes
Objects
Contexts
127. AI Mental Model

AI should map to:

Ask
Suggest
Review
Approve
Apply
Undo

not:

Execute tool
Run agent
Invoke function
128. Security Mental Model

Security settings should communicate:

Your account
Your sessions
Your keys
Your access

rather than exposing implementation terminology unnecessarily.

129. Consistent Terminology

Use these preferred terms:

Technical Concept	User-Facing Term
Knowledge Base	Business Information
Memory	Business Memory
Agent	Assistant / Copilot
Tool Call	Action
Function	Action
Execution	Apply
Tenant	Business / Workspace
Resource	Business item
Webhook	Integration event, when necessary
API Credential	API Key
Audit Event	Activity

Technical documentation may still use the technical terms.

130. Copywriting Rules

UI copy should be:

short
clear
direct
friendly
specific

Avoid:

unnecessary jargon
marketing-heavy copy
long explanations
technical terminology
131. Button Copy

Prefer:

Save
Publish
Add product
Review
Approve
Connect
Retry

Avoid:

Proceed
Continue
Submit
Execute
Perform operation

when a more specific action can be named.

132. Error Copy

Use:

What happened + what to do

Example:

We couldn't connect WhatsApp. Check the connection details and try again.

133. AI Copy

AI should not pretend certainty.

Prefer:

I found two possible opening times. Which one should I use?

instead of:

Your opening time is 10 AM.

when the data conflicts.

134. Loading Copy

Prefer:

Importing business information...
Preparing your catalog...
Publishing your website...

instead of:

Loading...

for meaningful long operations.

135. Empty Copy

Prefer:

No products yet.

Add your first product to start building your catalog.

136. Confirmation Copy

Prefer:

Publish website?

Your current draft will become publicly visible.

137. Component Naming

Frontend components should use consistent names.

Examples:

Button
Input
Select
Dialog
Drawer
Card
Badge
Avatar
Tabs
Table
Toast
Alert
Skeleton
EmptyState
ErrorState

Feature components:

BusinessCard
ProductCard
EnquiryList
CopilotMessage
ApprovalCard
ActivityItem
138. Component Reuse Rule

Before creating a new component:

Search the existing component library.
Reuse if possible.
Extend if appropriate.
Create a new component only if necessary.
139. No Duplicate Components

Avoid:

PrimaryButton
MainButton
ActionButton
BlueButton
SaveButton

when they represent the same design primitive.

Use one canonical button system with variants.

140. Component Variants

Prefer:

<Button variant="primary">
<Button variant="secondary">
<Button variant="destructive">

rather than separate components.

141. Token Usage Rule

Components should consume semantic tokens.

Example:

Button
 ↓
--color-primary
--color-primary-hover
--color-primary-active

Do not hardcode unrelated colors inside individual components.

142. Dark/Light Theme Architecture

If themes are implemented:

Component
    ↓
Semantic token
    ↓
Theme value

not:

Component
    ↓
Hardcoded color
143. Component States

Every interactive component should define:

Default
Hover
Focus
Active
Disabled
Loading
Error

only where applicable.

144. Disabled Controls

Disabled controls should remain understandable.

Do not use extremely low contrast that makes them indistinguishable from broken UI.

145. Read-Only Controls

Read-only information should visually differ from editable inputs.

146. Form Section Headers

Long forms should be divided into logical sections.

Example:

Business information
--------------------

Contact details
--------------------

Opening hours
--------------------
147. Sticky Actions

Long forms may use a sticky action bar:

Unsaved changes
[Cancel] [Save]

on desktop and mobile where appropriate.

148. Mobile Sticky Actions

Ensure sticky actions do not cover:

keyboard
content
important controls
149. Scrolling

Avoid nested scrolling unless necessary.

The primary page should generally scroll naturally.

150. Long Lists

Long lists should support:

pagination
infinite scrolling
virtualization

depending on data size and implementation.

151. Filtering

Filters should be:

easy to understand
removable
persistent when useful

Example:

Status: Available ×
Category: Drinks ×
152. Sorting

Sort controls should clearly indicate:

field
direction
153. Search + Filter

Search and filters should work together.

Changing a filter should not unexpectedly clear the search query unless explicitly designed.

154. Data Refresh

For dynamic business information:

Refresh

should communicate when data was last updated where useful.

155. Real-Time UX

If real-time updates are introduced:

Show subtle status:

Updated just now

Avoid disruptive page refreshes.

156. Optimistic Updates

Optimistic UI may be used only for safe reversible operations.

Do not optimistically claim:

payment completed
message sent
website published

before the backend confirms success.

157. Business Import UX Rule

Import is a high-trust workflow.

Never silently:

overwrite
delete
merge

important business data.

158. Import Progress UX

Import stages should map to actual backend stages.

Example:

Uploading
Processing
Extracting
Structuring
Reviewing
Ready
159. Import Failure UX

If part of an import fails:

Show:

Imported successfully:
Products
Business information

Needs attention:
3 images
Opening hours

Do not discard successful work.

160. Website Publishing UX

Publishing must clearly distinguish:

Saved
Draft
Published
161. Version UX

Users should know:

Current version
Published version
Draft changes
162. Approval UX

Approval screens must avoid accidental execution.

The final approval action should be explicit.

163. AI Safety UX

Never use ambiguous buttons such as:

Do it
Run
Execute

Prefer:

Apply changes
Send message
Update products
Publish website
164. Activity UX

Activity should answer:

What happened?
Who/what did it?
When?
What changed?
165. Security Activity

Security events should be distinguishable from normal business activity.

Examples:

New login
API key created
Password changed
MFA enabled
166. PWA Installation UX

If browser supports installation:

Provide a subtle prompt:

Install FrontDesk for faster access.

Do not repeatedly interrupt the user.

167. Offline Indicator

When offline:

Offline

should be visible without blocking the entire application.

168. Sync Indicator

When appropriate:

Saving...
Saved
Syncing...
Synced
169. PWA Update UX

When a new application version is available:

A new version of FrontDesk is ready.

Action:

Update

Avoid unexpected reloads during unsaved work.

170. Accessibility Testing

Before release test:

keyboard navigation
screen reader
contrast
focus
mobile zoom
reduced motion
171. Browser Testing

Minimum supported testing should include modern:

Chrome
Edge
Firefox
Safari

with emphasis on mobile Safari and Chromium-based browsers.

Exact browser support policy belongs in implementation documentation.

172. Responsive QA

Every major screen must be reviewed at:

320px
375px
768px
1024px
1440px

or equivalent representative sizes.

173. UX QA Checklist
[ ] Layout correct
[ ] Typography correct
[ ] Spacing correct
[ ] Colors correct
[ ] Buttons correct
[ ] Forms correct
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Success state
[ ] Mobile layout
[ ] Tablet layout
[ ] Desktop layout
[ ] Keyboard navigation
[ ] Accessibility
[ ] Permission states
174. Visual Regression

Where practical, important screens should use screenshot-based visual regression testing.

175. Design-to-Code Rule

Design decisions should be represented in:

design tokens
component variants
layout primitives

rather than one-off CSS.

176. AI Coding Rule

AI coding agents must:

Inspect existing components before creating new ones.
Reuse design tokens.
Follow existing spacing.
Follow existing typography.
Avoid arbitrary colors.
Avoid arbitrary border radii.
Avoid creating duplicate components.
Test responsive layouts.
Preserve accessibility.
Update documentation when introducing a new design pattern.
177. New Component Rule

A new reusable component should be introduced only when:

the pattern appears multiple times
or
the component represents a clear reusable interaction
178. Design Change Rule

If a design token changes:

update token
 ↓
verify dependent components
 ↓
visual regression

Do not manually patch dozens of screens.

179. Product Consistency Rule

The same concept must look the same everywhere.

Examples:

Product status
Approval status
Success message
Error message
Primary action
Destructive action
180. Final Design Principles

FrontDesk follows:

1. Simple before clever.
2. Clear before beautiful.
3. Consistent before unique.
4. Mobile before desktop where customer-facing.
5. Business language before technical language.
6. Content before decoration.
7. Accessibility by default.
8. AI should assist, not dominate.
9. Every important action must have clear feedback.
10. Every dangerous action must be intentional.
181. v0.1 Design System Scope

Required:

Color tokens
Typography
Spacing
Radius
Elevation
Icons
Buttons
Inputs
Forms
Cards
Badges
Tables
Dialogs
Drawers
Tabs
Navigation
Toast
Alerts
Skeletons
Empty states
Error states
AI cards
Activity items
Responsive rules
Accessibility rules
182. Future Design System Scope

Future versions may add:

Advanced chart system
Data visualization tokens
Advanced motion system
White-label themes
Business-specific branding
Theme editor
Custom template design system
Enterprise design tokens
183. Source of Truth

For visual implementation:

DESIGN-SYSTEM.md
        ↓
Frontend design tokens
        ↓
Reusable components
        ↓
Feature components
        ↓
Pages

For UX behavior:

UI-UX.md

For product requirements:

PRD.md
BRD.md

For architecture:

SYSTEM-ARCHITECTURE.md

For security:

SECURITY.md