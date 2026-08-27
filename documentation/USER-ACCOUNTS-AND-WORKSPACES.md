USER-ACCOUNTS-AND-WORKSPACES.md
# FrontDesk — User Accounts & Workspaces Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Accounts, Workspaces & Access Control
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

This document defines how users, businesses, workspaces, memberships, roles, and access permissions work inside FrontDesk.

The purpose is to establish a secure foundation for a multi-business platform.

FrontDesk should support:

- individual business owners,
- multiple businesses,
- teams,
- staff members,
- managers,
- designers,
- agencies,
- future developers and collaborators.

---

# 2. Core Principle

FrontDesk separates:

```text
User
  ↓
Workspace
  ↓
Business
  ↓
Business Data

A user account represents a person.

A workspace represents an environment in which a business is managed.

Business information belongs to the workspace/business, not directly to the person.

3. Why This Separation Matters

Consider:

Fareed

as a user.

He may manage:

Royal Bakes

and later:

Fareed Photography

The same user should not need two completely separate FrontDesk identities.

Conceptually:

User
 ├── Workspace A
 │     └── Royal Bakes
 │
 └── Workspace B
       └── Fareed Photography
4. Terminology
User

A person who has a FrontDesk account.

Workspace

The management environment containing a business and its configuration.

Business

The real-world business represented by a workspace.

Membership

The relationship between a user and a workspace.

Role

The permissions assigned to a membership.

5. v0.1 Simplification

Although FrontDesk is designed for future teams, v0.1 should keep the access model simple.

Initial roles:

Owner
Member

Future roles:

Manager
Staff
Designer
Marketing
Developer
Accountant
Viewer
Agency Admin
6. User Account

A user account may contain:

User
├── ID
├── Name
├── Email
├── Authentication Provider
├── Profile Information
├── Created At
└── Last Active At

The exact database schema belongs in database documentation.

7. Authentication

FrontDesk users must authenticate before accessing private business-management functionality.

Public business websites should NOT require authentication.

8. Public vs Private
Public

Customers can access:

Business Website
Catalog
Products
Opening Hours
Contact Information
QR Destination
Public Business Information

without creating a FrontDesk account.

Private

Only authorized members can access:

Business Dashboard
Business Editor
Analytics
Business Data
Drafts
Settings
Team Management
9. Basic User Flow
User
 ↓
Sign Up / Sign In
 ↓
Dashboard
 ↓
Select Workspace
 ↓
Manage Business
10. New User Onboarding

A new user should be able to:

Create Account
      ↓
Create / Import Business
      ↓
Business Workspace Created
      ↓
Business Setup
11. Business Import Onboarding

The primary FrontDesk onboarding may be:

Create Account
      ↓
Build My Business
      ↓
Import Existing Business
      ↓
Review Imported Information
      ↓
Create Workspace
      ↓
Publish

The exact onboarding flow is defined in the Business Importer specification.

12. Workspace Creation

A workspace should have:

Workspace
├── ID
├── Name
├── Business
├── Owner
├── Members
├── Settings
├── Created At
└── Status
13. Workspace Name

The workspace name can initially default to the business name.

Example:

Business:
Royal Bakes

Workspace:
Royal Bakes

The owner may change the internal workspace name later.

14. Business Name vs Workspace Name

These are not necessarily the same.

Example:

Workspace:
Royal Bakes — Chennai

Public Business:
Royal Bakes

The public business name is customer-facing.

The workspace name is administrative.

15. Workspace Ownership

Every workspace must have at least one owner.

The owner has full administrative control over the workspace.

16. Owner Responsibilities

The owner can:

manage business information,
manage products,
manage website,
publish changes,
view analytics,
configure contact information,
manage workspace members,
change workspace settings.
17. Owner Role

v0.1:

OWNER

The owner has full permissions except actions restricted by system-level security policies.

18. Member Role

v0.1 may support:

MEMBER

A member can be granted limited business-management access.

The exact permission matrix should remain intentionally simple in the first release.

19. Future Role Model

Future:

OWNER
MANAGER
STAFF
DESIGNER
MARKETING
DEVELOPER
ACCOUNTANT
VIEWER

Roles should be permission-based rather than hard-coded throughout the application.

20. Permission Principle

Do not build application logic such as:

if user.role == "owner"

everywhere.

Prefer conceptually:

user
 ↓
membership
 ↓
permissions
 ↓
action allowed?

This makes future roles easier to introduce.

21. Permission Categories

Future permissions may include:

business.read
business.update

products.read
products.create
products.update
products.delete

website.read
website.edit
website.publish

analytics.read

team.read
team.invite
team.remove

settings.read
settings.update
22. v0.1 Permission Set

Initial minimum:

Owner
Read Business
Update Business
Manage Products
Edit Website
Publish Website
View Analytics
Manage Members
Manage Settings
Member

Initially configurable or restricted depending on implementation.

23. Membership

A user should not gain access merely because they know a workspace ID.

Access should exist through an explicit membership.

Conceptually:

User
 ↓
Membership
 ↓
Workspace
 ↓
Permissions
24. Membership Record

Conceptually:

Membership
├── ID
├── User ID
├── Workspace ID
├── Role
├── Status
├── Created At
└── Updated At
25. Membership Status

Potential statuses:

INVITED
ACTIVE
SUSPENDED
REMOVED

v0.1 may only require:

ACTIVE
INVITED
26. Invitation Flow

Future/P1:

Owner
 ↓
Invite Member
 ↓
Email / Invite Link
 ↓
User Accepts
 ↓
Membership Created
 ↓
User Accesses Workspace
27. Invitation Security

Invitation links should:

expire,
be difficult to guess,
be associated with the intended workspace,
not grant access after cancellation,
not expose private business information.
28. Invitation Acceptance

If the invited person does not have a FrontDesk account:

Invite
 ↓
Create Account
 ↓
Accept Invitation
 ↓
Join Workspace

If they already have an account:

Invite
 ↓
Sign In
 ↓
Accept
 ↓
Join Workspace
29. Workspace Switching

A user with multiple workspaces should be able to switch between them.

Example:

Current Workspace:
Royal Bakes

▼ Switch Workspace

Royal Bakes
Fareed Photography
My Freelance Business
30. Workspace Isolation

When a user switches workspaces:

Workspace A data

must not appear in:

Workspace B

unless explicitly shared through a supported system.

31. Tenant Isolation

FrontDesk is a multi-tenant application.

Every private business resource must be associated with a workspace/business.

Conceptually:

Workspace A
 ├── Products
 ├── Website
 ├── Analytics
 └── Business Data

Workspace B
 ├── Products
 ├── Website
 ├── Analytics
 └── Business Data
32. Security Boundary

The workspace is a primary security boundary.

A request such as:

GET /products

must not simply return all products.

The backend must determine:

Which user?
Which membership?
Which workspace?
Which resources?
33. Authorization

Authentication answers:

Who are you?

Authorization answers:

What are you allowed to access?

FrontDesk requires both.

34. Example

User:

user_123

Membership:

workspace_456
role = OWNER

Request:

Update Product

Backend verifies:

User authenticated?
        ↓
Yes

Member of workspace?
        ↓
Yes

Permission to update product?
        ↓
Yes

Apply change.
35. Unauthorized Example

User:

user_999

tries to modify:

workspace_456

Backend:

Not a member
      ↓
Reject request

The system should not rely on frontend hiding the button.

36. Frontend Security Principle

Hiding UI elements is NOT authorization.

For example:

[Delete Product]

being hidden does not mean the user is unable to call the delete API.

The backend must enforce permissions.

37. Workspace Deletion

Deleting a workspace is destructive.

v0.1 should avoid permanent immediate deletion.

Potential flow:

Owner
 ↓
Delete Workspace
 ↓
Confirmation
 ↓
Soft Delete / Deactivation

Permanent deletion can be a later capability with stronger safeguards.

38. Business Deactivation

A workspace may eventually be:

ACTIVE
SUSPENDED
ARCHIVED
DELETED

A suspended workspace should not necessarily mean its public website is immediately deleted.

The final behavior requires product policy.

39. Account Deletion

Future:

User
 ↓
Request Account Deletion
 ↓
Identity Verification
 ↓
Data Handling
 ↓
Deletion

Account deletion must consider whether the user owns active workspaces.

40. Ownership Transfer

Future/P1:

Owner can transfer ownership:

Current Owner
      ↓
Select Member
      ↓
Transfer Ownership
      ↓
New Owner

This should require strong confirmation.

41. Ownership Transfer Safety

Before transferring ownership:

You will no longer be the owner of this workspace.

Potentially require:

Confirm
Password / Re-authentication

depending on the authentication system.

42. Multiple Owners

Future architecture may support multiple owners or administrators.

v0.1 can simplify this to:

One primary owner
43. Personal Profile

The user profile is separate from business information.

Example:

User Profile:
Fareed

Business:
Royal Bakes

The owner's personal name should not automatically appear publicly on the business website.

44. Business Identity

Public identity belongs to:

Business

not:

User

unless the business explicitly chooses to show owner information.

45. Email Changes

Changing a user's email should be handled by the authentication system.

The application should not casually overwrite identity information without appropriate verification.

46. Authentication Providers

v0.1 can support one or more authentication methods depending on implementation.

Possible future providers:

Email + Password
Email OTP
Google
Apple
Microsoft
Phone OTP

The product should not tightly couple business data to a specific provider.

47. Password Handling

FrontDesk should never store raw passwords.

Authentication should use a trusted authentication system/provider.

48. Session Management

Authenticated sessions should be securely managed.

Future security documentation should define:

session expiration,
refresh behavior,
logout,
device/session management.
49. Logout

User should be able to log out from the application.

Public websites remain accessible to customers.

50. Session Isolation

A logged-in user's private workspace data must not become accessible through public URLs.

51. Public Business URL

A public business URL may look conceptually like:

frontdesk.example/royal-bakes

The public URL identifies a published business presence.

It should not expose internal workspace identifiers unnecessarily.

52. Internal IDs

Internal identifiers should not be treated as secret authentication credentials.

However, predictable IDs should not be relied upon for access control.

Authorization must still be enforced.

53. Slugs

Public business slugs may be:

royal-bakes

They should be:

readable,
URL-safe,
unique where required.
54. Slug Changes

Changing a public slug may affect existing links.

Future behavior should consider redirects.

Example:

old:
frontdesk.example/royal-bakes

new:
frontdesk.example/royal-bakes-chennai

A redirect may preserve existing links.

55. Workspace Settings

Future settings may include:

Workspace Name
Timezone
Currency
Language
Business Category
Team
Domains
Integrations
Billing
56. Business Settings

Business-specific settings belong to the business.

Example:

Opening Hours
WhatsApp
Public Contact
Business Description

These should not be mixed with personal user settings.

57. User Settings

User-specific settings may include:

Name
Profile Photo
Notification Preferences
Interface Preferences
58. Separation Example
User Settings
 └── Notification Preference

Workspace Settings
 └── Default Timezone

Business Data
 └── Opening Hours

This separation prevents confusion.

59. Notifications

Future workspace notifications:

Website published
Business update approved
New member joined
Important business activity

v0.1 can keep notifications minimal.

60. Team Activity

Future:

Team Activity

Fareed updated menu
Manager changed opening hours
Designer edited homepage

This connects with the Business Change Timeline.

61. Collaboration

Future collaborative editing may support:

Owner
Designer
Marketing
Developer

working on the same workspace.

62. Designer Access

Future:

Owner invites:

designer@example.com

Role:

DESIGNER

Permissions:

Edit Website
View Business Data
Cannot Change Financial Settings
63. Developer Access

Future:

Developer may receive:

API access
Integration permissions
Custom component access

without receiving unrestricted business-owner permissions.

64. Agency Model

Future:

An agency may manage multiple businesses.

Conceptually:

Agency Workspace
 ├── Client A
 ├── Client B
 ├── Client C
 └── Client D

This is a future architecture requirement.

65. White-Label Future

Future agencies may use FrontDesk infrastructure under their own branding.

This requires a larger organization/tenant model.

Not required for v0.1.

66. Multiple Businesses

A single user may eventually own multiple businesses.

Example:

Fareed
 ├── Royal Bakes
 ├── Fareed Photography
 └── Fareed Digital Services

Each should have isolated business data.

67. Business Creation Limits

v0.1 may enforce a simple limit depending on the product plan.

For the free MVP, the initial assumption can be:

One user
→ One workspace

unless implementation/testing requires multiple workspaces.

The architecture should not make multiple workspaces impossible.

68. Free MVP Principle

Because FrontDesk is being developed with a free/low-cost objective:

Avoid introducing unnecessary billing complexity into v0.1.

Billing can be documented separately later.

69. Workspace Status

Potential:

SETUP
ACTIVE
SUSPENDED
ARCHIVED

v0.1 primarily needs:

SETUP
ACTIVE
70. Setup Workspace

During onboarding:

Workspace
Status:
SETUP

The business can be incomplete.

After successful publication:

Status:
ACTIVE
71. Workspace Activation

Suggested:

Workspace Activation
=
Business Imported/Created
+
Business Data Valid
+
Public Presence Published

The product activation metric is defined separately in analytics documentation.

72. Deleting a Member

Owner removes a member:

Workspace
 ↓
Members
 ↓
Select User
 ↓
Remove Access

The user's personal FrontDesk account remains intact.

Only the workspace membership is removed.

73. Important Distinction

Removing:

User from Workspace

does NOT mean:

Delete User Account
74. Owner Removal

The owner cannot simply remove themselves if that would leave the workspace without an owner.

The system should require:

Transfer Ownership

or:

Delete/Archive Workspace
75. Member Invitation Collision

If a user is already a workspace member:

Invite

should not create a duplicate membership.

76. Duplicate Business

Future business import may detect:

This business may already exist in FrontDesk.

This should be handled carefully.

Do not automatically merge businesses based solely on:

name,
phone,
address.

Multiple businesses can legitimately share similar information.

77. Business Claiming

Future:

A business owner may claim an existing imported/public business.

This requires verification.

Potential verification methods:

Phone
Email
Domain
Google Business
Other verified business signal

This is outside v0.1.

78. Workspace Data Ownership

Business data should belong to the workspace/business rather than an individual employee.

If an employee leaves:

Employee leaves
      ↓
Membership removed
      ↓
Business remains intact

This is essential for business continuity.

79. Example
Owner:
Fareed

Member:
Ahmed

Business:
Royal Bakes

Ahmed adds:

Chocolate Cake

If Ahmed leaves:

Chocolate Cake

remains part of:

Royal Bakes
80. Auditability

Every sensitive workspace modification should eventually be attributable to:

User
Workspace
Action
Timestamp

This supports the future AI Audit Log and Business Change Timeline.

81. AI Identity

Future AI actions should not appear as if a human performed them.

Example:

Actor:
FrontDesk AI

Action:
Updated product description

Approval:
Fareed

This distinction is important.

82. AI Permissions

AI should eventually have scoped permissions.

Example:

AI
Can:
Create draft product description

AI
Cannot:
Change price without approval

This belongs to future AI permission documentation.

83. System Administrator

FrontDesk may have internal administrative users.

These are separate from business users.

Conceptually:

Platform Admin
      ↓
Platform Operations

Business Owner
      ↓
Business Workspace

Platform administrators should not automatically appear as members of customer workspaces.

84. Support Access

Future support tools may allow controlled temporary access.

Such access should be:

explicitly authorized,
time-limited,
logged,
auditable.

This belongs to security/operations documentation.

85. Tenant Isolation Requirements

All private resources should be scoped to a workspace/business.

Examples:

Products
Website Configuration
Drafts
Analytics
Media
Business Knowledge
Members
Settings
86. Database Principle

Conceptually:

workspace_id

should exist on relevant tenant-owned resources or be safely derivable through relationships.

The database design document will define the exact schema.

87. Backend Principle

Every protected request should establish:

Authenticated User
        ↓
Workspace Membership
        ↓
Permission
        ↓
Resource
88. Frontend Routing

Private routes may conceptually follow:

/dashboard
/workspace/{workspace}/business
/workspace/{workspace}/website
/workspace/{workspace}/analytics
/workspace/{workspace}/settings

The exact route structure belongs to frontend architecture documentation.

89. Public Routing

Public routes may conceptually follow:

/{business-slug}

or a future custom domain.

Public routes should only expose published information.

90. Custom Domains

Future:

royalbakes.com

may point to the FrontDesk business.

This is not required for v0.1.

91. Workspace Security Checklist

For every private API operation:

Authenticated?
      ↓
Correct workspace?
      ↓
Active membership?
      ↓
Required permission?
      ↓
Resource belongs to workspace?
      ↓
Perform operation
92. Common Security Mistakes to Avoid

Do NOT rely on:

frontend route protection alone,
hidden buttons,
workspace IDs as secrets,
client-provided role claims,
client-provided ownership claims.

Authorization must be enforced server-side.

93. v0.1 P0 Requirements
ACCOUNT-P0-001
User can create an account.

ACCOUNT-P0-002
User can authenticate.

ACCOUNT-P0-003
User can create a workspace.

ACCOUNT-P0-004
Workspace has an owner.

ACCOUNT-P0-005
Business data belongs to a workspace.

ACCOUNT-P0-006
Private workspace data requires authentication.

ACCOUNT-P0-007
Public business pages do not require authentication.

ACCOUNT-P0-008
Workspace data is tenant-isolated.

ACCOUNT-P0-009
Backend enforces authorization.

ACCOUNT-P0-010
Owner can access workspace management.

ACCOUNT-P0-011
User can log out.

ACCOUNT-P0-012
Workspace and user identity are separated.

ACCOUNT-P0-013
Removing a member does not delete business data.

ACCOUNT-P0-014
Unauthorized users cannot access workspace data.

ACCOUNT-P0-015
Workspace setup and active states are supported.
94. v0.1 P1 Requirements
ACCOUNT-P1-001
Workspace invitations.

ACCOUNT-P1-002
Member management.

ACCOUNT-P1-003
Basic role management.

ACCOUNT-P1-004
Workspace switching.

ACCOUNT-P1-005
Ownership transfer.

ACCOUNT-P1-006
Audit activity.

ACCOUNT-P1-007
User notification preferences.

ACCOUNT-P1-008
Workspace settings.

ACCOUNT-P1-009
Business slug management.

ACCOUNT-P1-010
Multiple workspaces per user.
95. v0.1 P2 Requirements
ACCOUNT-P2-001
Granular permissions.

ACCOUNT-P2-002
Designer role.

ACCOUNT-P2-003
Developer role.

ACCOUNT-P2-004
Agency workspace model.

ACCOUNT-P2-005
Multiple businesses per organization.

ACCOUNT-P2-006
White-label organizations.

ACCOUNT-P2-007
Advanced collaboration.

ACCOUNT-P2-008
Temporary support access.

ACCOUNT-P2-009
Business claiming.

ACCOUNT-P2-010
Enterprise organization management.
96. Acceptance Criteria

The Accounts & Workspaces module is complete for v0.1 when:

A user can create an account.
A user can authenticate.
A user can create a workspace.
A workspace has an owner.
Business data belongs to a workspace.
Private business data requires authentication.
Public business pages can be accessed without authentication.
Backend authorization is enforced.
A user cannot access another user's workspace data without membership.
Workspace resources are tenant-isolated.
User identity is separate from business identity.
Logging out removes access to private workspace functionality.
Removing workspace access does not delete business data.
The system supports a clear setup/active workspace state.
The architecture does not prevent future team roles.
97. Example End-to-End Scenario
Step 1 — User
Fareed

creates a FrontDesk account.

Step 2 — Workspace
Create Workspace

Name:

Royal Bakes
Step 3 — Business
Royal Bakes
Bakery
Tambaram
Step 4 — Owner
Fareed
Role:
OWNER
Step 5 — Business Data
Products
Hours
Address
WhatsApp
Logo
Website

belong to:

Royal Bakes Workspace
Step 6 — Public Customer

Customer visits:

frontdesk.example/royal-bakes

No account required.

Step 7 — Business Owner

Fareed signs in:

/dashboard

and can manage:

Royal Bakes
98. Future Team Scenario
Royal Bakes
│
├── Fareed
│   └── Owner
│
├── Ahmed
│   └── Manager
│
├── Sara
│   └── Marketing
│
└── Designer
    └── Designer

Everyone works on the same business.

Business data remains owned by the workspace.

99. Future Agency Scenario
Agency
│
├── Client A
├── Client B
├── Client C
└── Client D

Agency users can have different permissions across different client workspaces.

This is future architecture, not v0.1 functionality.

100. Final Principle

People have accounts. Businesses have workspaces. Data belongs to businesses. Permissions belong to memberships.

This separation should remain consistent across the entire FrontDesk architecture.