Next is DOMAIN-AND-CUSTOM-URLS.md.

This defines how a FrontDesk business becomes an actual web presence. It is important because the public URL, QR code, preview URL, and future custom domain all need to work together without breaking when the owner changes their design or business information.

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
            ├── PUBLISHING-AND-VERSIONING.md
            ├── MEDIA-AND-ASSET-MANAGEMENT.md
            └── DOMAIN-AND-CUSTOM-URLS.md
DOMAIN-AND-CUSTOM-URLS.md
# FrontDesk — Domain & Custom URL Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Public URLs, Domains & Web Identity
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

This document defines how FrontDesk businesses receive and manage their public web addresses.

The module covers:

- FrontDesk-hosted URLs,
- business slugs,
- public URLs,
- preview URLs,
- QR destinations,
- custom domains,
- domain verification,
- HTTPS,
- redirects,
- domain changes,
- future domain management.

The goal is:

> Every business should receive a stable public web address without needing technical knowledge.

---

# 2. Core Principle

The business identity and the public URL should be separate concepts.

Example:

Business:

    Royal Bakes

Public URL:

    frontdesk.example/royal-bakes

The business should remain the same even if its URL changes.

---

# 3. URL Layers

FrontDesk should conceptually support:

```text
FrontDesk URL
      ↓
Business Slug
      ↓
Public Website
      ↓
Optional Custom Domain

Example:

frontdesk.example/royal-bakes

Later:

royalbakes.com

Both can represent the same FrontDesk business.

4. v0.1 Scope

The first release should prioritize:

FrontDesk-hosted business URL,
unique business slug,
public website routing,
stable QR destination,
basic slug editing,
preview URL.

Custom domains can be architected now but implemented later if required.

5. FrontDesk-Hosted URL

Every published business should receive a platform URL.

Conceptually:

https://frontdesk.example/{business-slug}

Example:

https://frontdesk.example/royal-bakes

The actual production domain will be selected separately.

6. Business Slug

The slug identifies the business in the FrontDesk URL.

Example:

Business:
Royal Bakes

Slug:
royal-bakes
7. Slug Requirements

A slug should generally be:

URL-safe,
readable,
unique,
reasonably short,
stable.

Avoid:

royal bakes!!!

Prefer:

royal-bakes
8. Slug Generation

When creating a business, FrontDesk can automatically generate a slug.

Example:

Business Name:
Royal Bakes

Generated:
royal-bakes

The owner can change it if available.

9. Slug Uniqueness

Two businesses cannot normally use the same slug on the same FrontDesk domain.

Example:

royal-bakes

If already used:

royal-bakes-chennai

may be suggested.

10. Slug Availability

The UI should provide immediate feedback.

Example:

royal-bakes

✓ Available

or:

royal-bakes

✕ Already taken
11. Slug Suggestions

If a slug is unavailable, FrontDesk can suggest alternatives.

Example:

royal-bakes-chennai
royalbakes
royal-bakes-tambaram
royal-bakes-official

Suggestions should not imply ownership or affiliation that does not exist.

12. Slug Changes

Owner may eventually change:

royal-bakes

to:

royal-bakes-chennai

Changing the slug affects the public URL.

Therefore FrontDesk should warn:

Changing your web address may affect existing links.

13. Redirects

When supported, the previous URL should redirect to the new URL.

Example:

Old:
frontdesk.example/royal-bakes

        ↓ redirect

New:
frontdesk.example/royal-bakes-chennai
14. QR Stability

QR codes should preferably point to a stable business URL.

Recommended:

QR
 ↓
Stable FrontDesk business URL
 ↓
Current published business

If the business slug changes, FrontDesk should preserve the QR destination through redirects or a stable internal route where technically possible.

15. Important QR Principle

Do NOT make QR codes depend directly on:

website version

or:

specific page deployment

A QR code should continue working when the owner updates the website.

16. Public URL vs Published Version

The public URL represents the business.

The published version represents the current content.

Conceptually:

Public URL
    ↓
Business
    ↓
Current Published Version

Therefore:

Publish v10

and later:

Publish v11

should not require a new public URL.

17. Public Website Routing

A public request:

GET /royal-bakes

should resolve:

royal-bakes
   ↓
Business
   ↓
Published State
   ↓
Render Website
18. Unpublished Business

If a business has not published a public presence:

frontdesk.example/royal-bakes

should not expose incomplete private business information.

Possible response:

This business has not published its website yet.

or an appropriate not-found/private state.

19. Suspended Business

If a business becomes unavailable due to account/platform status, public behavior should follow the platform's suspension policy.

Do not expose private administrative details.

20. Archived Business

If a business is archived, the public URL behavior should be explicitly defined.

Possible:

Business unavailable.

The system should not accidentally expose archived/private data.

21. Preview URL

Draft websites require a separate preview mechanism.

Conceptually:

Preview URL
      ↓
Draft

while:

Public URL
      ↓
Published Version
22. Preview Example
Public:
frontdesk.example/royal-bakes

Preview:
preview.frontdesk.example/royal-bakes/{secure-preview}

The exact implementation is an architecture decision.

23. Preview Security

Preview URLs must not expose unpublished content to arbitrary users.

Possible protections:

authentication,
temporary token,
expiring preview URL,
secret preview identifier.
24. Search Engine Protection

Draft/preview pages should not be indexed by search engines.

Conceptually:

Preview
 ↓
No Index

The exact mechanism belongs in SEO/security documentation.

25. Custom Domains

Future feature:

Owner connects:

royalbakes.com

to FrontDesk.

Customer visits:

https://royalbakes.com

and sees the FrontDesk-powered business website.

26. Custom Domain Principle

A custom domain should point to the business.

It should not be tied directly to:

specific version

or:

specific server

The platform resolves:

Domain
 ↓
Business
 ↓
Published Version
27. Domain Connection Flow

Future:

Owner
 ↓
Add Domain
 ↓
Enter Domain
 ↓
FrontDesk Provides DNS Instructions
 ↓
Owner Configures DNS
 ↓
FrontDesk Verifies
 ↓
Domain Connected
 ↓
HTTPS Enabled
 ↓
Website Live
28. Domain Verification

FrontDesk must verify that the user controls the domain before activating it.

Verification should use an appropriate DNS or equivalent ownership mechanism.

29. Domain Verification Principle

Do not allow:

User A

to connect:

example.com

without proving control of the domain.

30. DNS Configuration

Future domain setup may require records such as:

A
AAAA
CNAME
TXT

The exact required records depend on the hosting architecture.

The UI should explain them in non-technical language.

31. Non-Technical Domain Setup

Instead of:

Configure DNS records manually.

FrontDesk should explain:

Your domain needs one small connection to FrontDesk.

Then show:

Step 1
Open your domain provider.

Step 2
Add this record.

Step 3
Return here.

[Verify Connection]
32. DNS Provider Examples

Future documentation may include instructions for providers such as:

GoDaddy,
Namecheap,
Cloudflare,
Hostinger,
other supported registrars.

These should be provider-specific help guides, not hardcoded into the core domain model.

33. HTTPS

Custom domains should use HTTPS.

The platform should handle certificate provisioning/renewal where supported by the hosting infrastructure.

The business owner should not need to manually manage certificates.

34. HTTP → HTTPS

If a customer visits:

http://royalbakes.com

the platform should redirect to:

https://royalbakes.com

where appropriate.

35. Domain Status

Future UI:

royalbakes.com

✓ Connected
✓ Verified
✓ HTTPS Active

Possible statuses:

NOT_CONNECTED
PENDING_VERIFICATION
VERIFIED
ACTIVE
ERROR
DISCONNECTED
36. Domain Connection Error

Example:

We couldn't verify your domain yet.

Possible reason:
The DNS record has not propagated.

[Check Again]
[View Instructions]

The UI should avoid claiming that DNS changes are wrong unless the system can verify that.

37. DNS Propagation

DNS changes can take time to propagate.

FrontDesk should communicate this clearly.

Example:

Your DNS change may take some time to become visible.

Avoid promising a specific duration unless the system can reliably determine it.

38. Domain Ownership Changes

If a domain is transferred to another registrar/owner, FrontDesk should not assume continued ownership.

Domain verification status may need to be re-established where appropriate.

39. Domain Removal

Owner can disconnect a custom domain.

Before removal:

This domain will no longer display your FrontDesk website.

The FrontDesk-hosted URL should remain available if the business remains active.

40. Custom Domain Replacement

Owner may change:

old-domain.com

to:

new-domain.com

The old domain may continue redirecting if configured and still controlled by the owner.

41. Domain Redirects

Future:

www.royalbakes.com
        ↓
royalbakes.com

or:

royalbakes.com
        ↓
www.royalbakes.com

The owner should select a canonical domain.

42. Canonical Domain

A business should have one preferred public domain.

Example:

Canonical:
https://royalbakes.com

Other connected variants may redirect to it.

43. WWW Handling

Future domain setup should support:

www.example.com

and:

example.com

according to the chosen hosting architecture.

44. Domain and SEO

The canonical domain should be reflected in SEO metadata.

Future:

canonical URL
Open Graph URL
sitemap
structured data

must use the correct public domain.

45. Domain and Sitemap

For a custom domain:

https://royalbakes.com/sitemap.xml

should represent the published website where supported.

46. Domain and Robots

Future:

https://royalbakes.com/robots.txt

should be generated appropriately.

Preview environments must not behave like production sites.

47. Domain and QR

A QR code may continue using:

FrontDesk stable URL

even after the business connects a custom domain.

Alternatively, future QR management can point directly to the canonical domain.

The system should make the behavior explicit.

48. Recommended QR Strategy

For long-term stability:

QR
 ↓
FrontDesk controlled redirect
 ↓
Current canonical business URL

This gives FrontDesk the ability to change the final destination without requiring the owner to reprint QR codes.

49. QR Redirect Safety

The redirect system must not become an unrestricted URL redirector.

Only approved business destinations should be allowed.

This reduces abuse/security risk.

50. Public URL Stability

The following should ideally remain stable across normal changes:

Business
QR
Public Website

while the following can change:

Design
Products
Prices
Content
Published Version
51. Business Slug vs Domain

These are separate:

Business Slug:
royal-bakes

Custom Domain:
royalbakes.com

A business can have:

FrontDesk URL
+
Custom Domain

at the same time.

52. Domain Priority

If a custom domain is active:

royalbakes.com

becomes the preferred customer-facing URL.

The FrontDesk URL can remain as a fallback.

53. Business Slug Change with Custom Domain

If the owner changes:

royal-bakes

to:

royal-bakes-chennai

the custom domain:

royalbakes.com

should continue pointing to the same business.

This demonstrates why the domain must resolve to a business ID rather than a slug internally.

54. Internal Domain Mapping

Conceptually:

Domain
   ↓
Business ID
   ↓
Published State

not:

Domain
   ↓
Slug
   ↓
Page ID

This makes future changes safer.

55. Multiple Domains

Future:

A business may connect:

royalbakes.com
royalbakes.in
royalbakes.co.in

One becomes canonical.

Others redirect to it.

56. Domain Limits

v0.1 should avoid unnecessary multi-domain complexity.

A simple future model:

One primary custom domain

can be enough initially.

57. Domain Subdomains

Future:

menu.royalbakes.com
booking.royalbakes.com

could support specialized business experiences.

Not required for v0.1.

58. Free FrontDesk URL

Every business should have a free platform URL regardless of custom domain ownership.

This is important for:

onboarding,
previews,
testing,
free plans,
QR,
fallback access.
59. Free Plan Principle

A business should be able to publish a useful public presence without buying a domain.

Example:

frontdesk.example/royal-bakes

This supports FrontDesk's low/no-cost MVP.

60. URL Customization

Future free plans may allow limited slug customization.

Paid/future plans may offer:

custom domains,
multiple domains,
advanced redirects.

Billing decisions belong to monetization documentation.

61. Domain Availability

FrontDesk should not claim:

royalbakes.com is available

unless it has a reliable domain availability integration.

The platform can instead say:

Connect your domain

and let the owner verify ownership.

62. Domain Purchase

Future:

FrontDesk may eventually integrate domain purchasing.

This is not required for v0.1.

Do not make domain purchasing a core dependency.

63. Domain Transfer

Future:

Users may transfer domains into/out of supported domain management.

This is a separate advanced capability.

64. Domain Expiration

If FrontDesk integrates domain purchasing/management in the future, it may need:

expiration monitoring,
renewal reminders,
payment handling,
ownership verification.

Not required for v0.1.

65. Domain Health

Future dashboard:

Domain Health

✓ DNS connected
✓ HTTPS active
✓ Canonical domain configured
✓ Website reachable
66. Website Health Integration

The existing AI Website Health feature may eventually check:

Domain reachable?
HTTPS valid?
Redirect working?
Canonical URL correct?
67. Domain Monitoring

Future system monitoring may detect:

Domain disconnected
Certificate problem
DNS configuration changed
Website unavailable

The owner can receive an alert.

68. Domain Security

The platform should protect against:

unauthorized domain claiming,
domain takeover,
malicious redirects,
DNS verification abuse,
cross-business domain mapping.
69. Domain Reassignment

A domain that is already connected to one business cannot be attached to another business without proper disconnection/verification.

Example:

royalbakes.com
   ↓
Royal Bakes

Another business should not be able to claim it simply by entering the domain.

70. Domain Verification Record

Future architecture may store:

Domain
├── Domain ID
├── Workspace ID
├── Domain Name
├── Verification Status
├── Verification Method
├── Verified At
├── SSL Status
├── Canonical Flag
└── Created At

Exact database schema belongs elsewhere.

71. Domain Mapping

Conceptually:

royalbakes.com
      ↓
workspace_123
      ↓
business_123
      ↓
published_version_18
72. Host-Based Routing

Future infrastructure may identify the business from the request hostname.

Example:

Host:
royalbakes.com

maps to:

Business:
Royal Bakes
73. Platform URL Routing

For platform URLs:

Host:
frontdesk.example

Path:
/royal-bakes

maps to:

Business:
Royal Bakes
74. Routing Consistency

Both routes should eventually render the same published business state:

frontdesk.example/royal-bakes

and:

royalbakes.com
75. Domain + Preview

A custom domain should never accidentally show draft content merely because the owner is logged in.

The production domain should always resolve to published content.

Preview remains separate.

76. Domain + Publishing

Publishing a new version:

v18 → v19

does not change:

royalbakes.com

The domain continues resolving to the current published version.

77. Domain + Rollback

If the owner restores an earlier version and publishes it:

Domain
 ↓
Current published version

automatically reflects the restored version.

No DNS change is needed.

78. Domain + Website Builder

Website builder only changes the business's website configuration.

It should not directly manipulate DNS.

79. Domain + Business Importer

Importing an existing website may detect:

Existing domain:
examplecafe.com

But importing the website must not automatically claim/control that domain.

The owner must explicitly connect/verify it.

80. Domain + Existing Website

Future migration flow:

Existing Website
      ↓
Import Business
      ↓
Build New FrontDesk Website
      ↓
Preview
      ↓
Connect Domain
      ↓
Publish

This creates a smooth migration path.

81. Migration Safety

Before switching a domain:

Old Website
      ↓
New FrontDesk Website

the owner should be able to preview the new site first.

82. Domain Cutover

Future:

Preview
 ↓
Connect Domain
 ↓
Verify
 ↓
Publish
 ↓
Traffic moves to FrontDesk

The exact cutover mechanism depends on hosting architecture.

83. Old Website

FrontDesk should not automatically delete the old website.

Domain switching is a routing/hosting change, not permission to destroy external infrastructure.

84. Redirects During Migration

Future:

old-site.com/page
      ↓
new FrontDesk page

may require redirect mapping.

This is advanced migration functionality.

85. URL Paths

Future websites may contain:

/
 /menu
 /products
 /services
 /about
 /contact

The website builder should define which paths exist.

86. Slugged Pages

Future:

/products/chocolate-truffle-cake

could be generated.

The page URL should use stable identifiers internally where appropriate.

87. Product URL Changes

If a product name changes:

Chocolate Cake

to:

Premium Chocolate Cake

the URL should not necessarily break.

Future routing should support stable product identifiers and/or redirects.

88. URL Redirect Management

Future owner tool:

Redirects

/old-menu → /menu
/old-cake → /products/chocolate-cake

This is useful for SEO and migrations.

89. 404 Page

Public websites should have a friendly 404 experience.

Example:

This page doesn't exist.

[Go to Home]
90. 404 Safety

404 pages should not expose:

internal IDs,
database information,
stack traces,
private business data.
91. Reserved Slugs

The platform should reserve system-critical slugs.

Examples:

admin
api
login
dashboard
settings
help
pricing

The exact reserved list belongs to routing architecture.

92. Profanity / Abuse

Future slug creation may need basic abuse protection.

The system should avoid allowing URLs that violate platform policies.

The exact moderation policy belongs in platform policy documentation.

93. Business Name Changes

If:

Royal Bakes

becomes:

Royal Bakes & Cafe

the public business identity changes.

The slug should not automatically change without owner confirmation.

94. Slug vs Business Name Principle

Changing the business name should not unexpectedly break the existing URL.

Recommended:

Business Name:
Royal Bakes & Cafe

Slug:
royal-bakes

unless the owner explicitly changes the slug.

95. Domain vs Business Identity Principle

Changing the business name should not automatically disconnect a verified custom domain.

The domain is an independently controlled identity.

96. Domain Disconnect Safety

Before disconnecting:

Your custom domain will stop showing this website.

The FrontDesk URL should remain available.

97. Domain Ownership and Team Members

Only users with the appropriate workspace permission should be able to:

connect domains,
disconnect domains,
change canonical domain,
modify domain configuration.

A normal staff member should not automatically have domain-management permissions.

98. Domain Permissions

Future:

domain.read
domain.connect
domain.verify
domain.update
domain.disconnect

This integrates with the broader permission system.

99. Audit Log

Future domain actions should be recorded:

Fareed connected royalbakes.com
Fareed verified domain
Manager changed canonical domain

Sensitive domain operations should be attributable.

100. Domain Event Model

Future internal events may include:

DOMAIN_ADDED
DOMAIN_VERIFICATION_STARTED
DOMAIN_VERIFIED
DOMAIN_CONNECTED
DOMAIN_DISCONNECTED
DOMAIN_SET_CANONICAL
DOMAIN_ERROR

These can feed monitoring and notifications.

101. v0.1 P0 Requirements
DOMAIN-P0-001
Every published business receives a FrontDesk-hosted public URL.

DOMAIN-P0-002
Public URLs use a unique business slug.

DOMAIN-P0-003
Business slugs are URL-safe.

DOMAIN-P0-004
Business slugs are unique.

DOMAIN-P0-005
Owner can view the public URL.

DOMAIN-P0-006
Public URL resolves to the published business.

DOMAIN-P0-007
Draft content is not exposed through the public URL.

DOMAIN-P0-008
QR destinations remain stable across normal website updates.

DOMAIN-P0-009
Preview URLs are separate from production URLs.

DOMAIN-P0-010
Preview content is protected from unintended public access.

DOMAIN-P0-011
Changing website content does not require changing the public URL.

DOMAIN-P0-012
Public URLs do not expose private workspace data.

DOMAIN-P0-013
Unauthorized users cannot change a business slug.
102. v0.1 P1 Requirements
DOMAIN-P1-001
Owner can change the business slug.

DOMAIN-P1-002
Old slugs can redirect to the new slug.

DOMAIN-P1-003
Custom domain connection.

DOMAIN-P1-004
Custom domain verification.

DOMAIN-P1-005
HTTPS for custom domains.

DOMAIN-P1-006
Canonical domain selection.

DOMAIN-P1-007
Domain status UI.

DOMAIN-P1-008
Domain disconnect.

DOMAIN-P1-009
Basic domain health monitoring.

DOMAIN-P1-010
Domain-related audit events.
103. v0.1 P2 Requirements
DOMAIN-P2-001
Multiple custom domains.

DOMAIN-P2-002
Advanced redirect management.

DOMAIN-P2-003
Domain purchasing.

DOMAIN-P2-004
Domain transfer.

DOMAIN-P2-005
Automated DNS setup.

DOMAIN-P2-006
Advanced migration tooling.

DOMAIN-P2-007
Subdomain management.

DOMAIN-P2-008
Advanced domain health monitoring.

DOMAIN-P2-009
Automatic domain recovery workflows.

DOMAIN-P2-010
Agency domain management.
104. Acceptance Criteria

The Domain & URL module is complete for v0.1 when:

Every active published business receives a public URL.
Each business has a unique URL slug.
The slug is URL-safe.
Customers can access the published business without authentication.
Draft data is not publicly accessible.
Website updates do not change the public URL.
QR codes continue to resolve after normal website updates.
Preview URLs are separated from production URLs.
Preview content is protected.
Business owners can see their public URL.
Unauthorized users cannot modify URL configuration.
The architecture supports future custom domains.
The architecture separates domain identity from business identity.
The architecture supports future redirects.
Public routing resolves to the current published version.
105. Example End-to-End Scenario
Business Creation
Royal Bakes

↓

FrontDesk generates:

frontdesk.example/royal-bakes

↓

Owner publishes.

↓

Customer visits:

frontdesk.example/royal-bakes

and sees the live business.

106. Website Update

Owner changes:

Homepage

and publishes v12.

The URL remains:

frontdesk.example/royal-bakes

Only the published content changes.

107. Slug Change

Owner changes:

royal-bakes

to:

royal-bakes-chennai

FrontDesk:

Old URL
     ↓
Redirect
     ↓
New URL

where supported.

108. Custom Domain

Future owner connects:

royalbakes.com

After verification:

royalbakes.com
       ↓
Royal Bakes
       ↓
Current Published Version
109. Version Update with Custom Domain

Owner publishes:

v15

The domain remains:

royalbakes.com

and automatically serves v15.

No domain changes are required.

110. Rollback

Owner restores an earlier version.

After publishing:

royalbakes.com

automatically serves the restored published state.

111. Final Architecture Principle

The public web identity should follow:

             Domain / URL
                   ↓
              Business ID
                   ↓
          Published Business
                   ↓
        Current Published Version
                   ↓
        Website / Catalog / QR

Not:

Domain
 ↓
Page
 ↓
Specific deployment
112. Final Principle

The URL belongs to the business. The content belongs to the published version.

Changing the website should not require changing the business's identity.