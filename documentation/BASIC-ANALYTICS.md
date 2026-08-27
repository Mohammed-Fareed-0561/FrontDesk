Next is BASIC-ANALYTICS.md.

This is intentionally a small v0.1 analytics layer. We don't want to accidentally turn FrontDesk into Google Analytics before we've validated the core product.

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
            └── BASIC-ANALYTICS.md
BASIC-ANALYTICS.md
# FrontDesk — Basic Analytics Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Basic Business Analytics
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Basic Analytics module provides business owners with a simple understanding of how customers interact with their FrontDesk digital presence.

The purpose is NOT to provide an advanced analytics platform.

The purpose is to answer a few important questions:

> Are people visiting my business page?

> What are they looking at?

> Are they trying to contact me?

> Which products are getting attention?

> Is my digital presence actually being used?

---

# 2. Core Principle

FrontDesk analytics should translate technical events into business-friendly information.

Do not show the owner:

```text
event_name
session_id
request_id
API_latency

unless they are relevant to debugging.

Instead show:

Visitors
Product Views
WhatsApp Clicks
Call Clicks
Directions
3. v0.1 Goal

The analytics system should provide:

basic activity tracking,
simple dashboard metrics,
product interest,
contact actions,
basic traffic information,
business activation measurement.
4. Analytics Philosophy

FrontDesk should follow:

Simple enough for a non-technical business owner.

The owner should be able to understand the dashboard without knowing:

analytics terminology,
funnels,
event schemas,
SQL,
tracking pixels,
cookies.
5. v0.1 Dashboard

The initial dashboard may show:

Business Activity

Today

Visitors             142
Product Views         68
WhatsApp Clicks       17
Call Clicks             6
Directions              4
6. Time Range

v0.1 should support simple ranges:

Today
Last 7 days
Last 30 days

Future:

Custom Range
This Month
Previous Month
Year to Date
7. Primary Metrics

The v0.1 system should focus on:

Page Views
Product Views
WhatsApp Clicks
Call Clicks
Directions Clicks
8. Page Views

A page view represents a visit/load of a published public business page.

Event:

PAGE_VIEW

Example:

Royal Bakes

Today:
142 page views
9. Unique Visitors

Unique visitors are more complicated than page views.

For v0.1, the product should avoid presenting an overly precise "unique customer" number unless the measurement method supports it reliably.

Possible metric:

Visitors

rather than:

Unique Customers

10. Why This Distinction Matters

A customer may:

visit twice,
use multiple devices,
clear browser storage,
use private browsing,
share a device.

Therefore analytics should not claim certainty that it cannot provide.

11. Product Views

Event:

PRODUCT_VIEW

Triggered when a customer meaningfully views a product.

Example:

Chocolate Truffle Cake
42 views
12. Product Analytics

The dashboard may display:

Most Viewed Products

1. Chocolate Truffle Cake      42
2. Red Velvet Cake             31
3. Brownie                     19
4. Black Forest Cake           15
13. WhatsApp Clicks

Event:

WHATSAPP_CLICK

This means:

Customer clicked a WhatsApp CTA.

It does NOT necessarily mean:

Customer sent a WhatsApp message.

14. Call Clicks

Event:

CALL_CLICK

This means:

Customer clicked the call button.

It does not prove:

The customer completed a phone call.

15. Directions Clicks

Event:

DIRECTIONS_CLICK

This means:

Customer clicked the directions action.

It does not prove:

Customer physically visited the business.

16. Event Accuracy Principle

FrontDesk must distinguish between:

Observed Action

and:

Business Outcome

Example:

WhatsApp Click
≠
Message Sent
≠
Lead
≠
Order
≠
Revenue

This distinction must be preserved throughout the product.

17. Event Naming

Events should use consistent names.

v0.1:

PAGE_VIEW
PRODUCT_VIEW
WHATSAPP_CLICK
CALL_CLICK
DIRECTIONS_CLICK

Future:

CATEGORY_VIEW
CTA_CLICK
ORDER_CREATED
BOOKING_CREATED
LEAD_CREATED
COUPON_USED
18. Event Structure

Conceptually:

{
  "event": "PRODUCT_VIEW",
  "business_id": "business_123",
  "product_id": "product_456",
  "timestamp": "2026-08-26T10:30:00Z"
}

This is illustrative.

The final API schema belongs in API documentation.

19. Business ID

Every analytics event must belong to a specific business.

Conceptually:

Event
 ↓
Business

This is essential for multi-tenant isolation.

20. Product ID

Product-related events should reference the relevant product.

Do not identify products only by their display name.

Bad:

product_name = "Cake"

Better:

product_id = product_123

The product name can change while the identity remains stable.

21. Timestamp

Every event should have a timestamp.

The backend should use a consistent time representation.

The dashboard can convert timestamps to the business's configured timezone.

22. Business Timezone

For an India-focused business:

Asia/Kolkata

may be the default.

However, the architecture should support other timezones in the future.

23. Device Information

Basic anonymous technical information may be useful.

Potential:

Mobile
Tablet
Desktop

This can help answer:

Are customers mostly using phones?

24. Device Analytics

Example:

Customer Devices

Mobile       91%
Desktop       7%
Tablet        2%

This is optional for early v0.1.

25. Traffic Source

Future capability:

QR
Google
Instagram
Direct
Other

This can help businesses understand where visitors originate.

v0.1 may keep this minimal.

26. QR Analytics

The QR entry point can generate:

QR_LANDING

or equivalent page-view/source information.

Example:

QR Visits
124
27. QR Source

Future QR codes may have source identifiers.

Example:

TABLE_01
COUNTER
PACKAGING
POSTER
BUSINESS_CARD

This enables:

Which QR placement gets the most engagement?

28. v0.1 QR Analytics

For the initial version:

Track:

QR → Public Page

Avoid building complex QR campaign analytics until usage is validated.

29. Activity Overview

The dashboard may show:

Today's Activity

142 visitors
68 product views
17 WhatsApp clicks
6 calls
4 directions clicks
30. Activity Trend

A simple chart can show:

Visitors
│
│       ╭──╮
│   ╭───╯  ╰──╮
│───╯         ╰──
└────────────────
   Mon Tue Wed Thu Fri

The exact visualization belongs in the UI/UX documentation.

31. Product Interest

A simple section:

Most Viewed Products

Chocolate Truffle Cake     42
Red Velvet Cake            31
Brownie                    19
32. Customer Actions

A simple section:

Customer Actions

WhatsApp       17
Calls           6
Directions      4
33. No-Data State

A new business may have:

No activity yet.

Do not display misleading zeros without context.

Better:

Your website is live. Share your QR to start getting visitors.

34. First Activity

When the first meaningful interaction occurs:

🎉 Your first customer interaction!

Example:

Someone clicked WhatsApp from your website.

This can improve onboarding feedback.

35. Activation Metric

FrontDesk should define business activation separately from website creation.

Suggested definition:

Activated Business
=
Imported Business Data
+
Published Presence
+
QR Created
+
First Customer Interaction
36. Why Activation Matters

A business having a website does not necessarily mean FrontDesk created value.

A stronger signal is:

The business is live and customers are interacting with it.

37. Activation Dashboard

Internal/product analytics may track:

Businesses Imported
Businesses Published
QRs Created
Businesses Receiving First Interaction
38. Business Activity Metric

The owner-facing dashboard should use simple language.

Instead of:

Event conversion rate

show:

Customer activity

39. Activity Score

Do NOT create a complicated "business score" in v0.1.

That belongs to a future Business Health feature.

v0.1 should prioritize raw, understandable activity metrics.

40. Conversion Rate

A conversion rate should not be shown unless the numerator and denominator are clearly defined.

For example:

WhatsApp Click Rate
=
WhatsApp Clicks / Page Views

could be displayed later.

But avoid presenting:

Customer conversion rate

when FrontDesk cannot measure actual customers or purchases.

41. v0.1 Recommended Derived Metric

Optional:

Contact Rate
=
(WhatsApp Clicks + Call Clicks)
/
Page Views

This should be clearly labeled and explained.

42. Analytics Dashboard Example
┌─────────────────────────────────────────────┐
│ Business Activity                           │
│                                             │
│ Last 7 days                                 │
│                                             │
│ Visitors        Product Views    WhatsApp   │
│ 842             391              76         │
│                                             │
│ Calls           Directions                   │
│ 21              14                           │
│                                             │
├─────────────────────────────────────────────┤
│ Visitor Activity                            │
│                                             │
│       ╭──╮                                  │
│   ╭───╯  ╰──╮                               │
│───╯         ╰───                            │
│                                             │
├─────────────────────────────────────────────┤
│ Most Viewed Products                        │
│                                             │
│ Chocolate Cake                 84            │
│ Red Velvet Cake               62            │
│ Brownie                       41            │
│                                             │
├─────────────────────────────────────────────┤
│ Customer Actions                            │
│                                             │
│ WhatsApp                     76             │
│ Calls                        21             │
│ Directions                   14             │
└─────────────────────────────────────────────┘
43. Dashboard Principles

The dashboard should:

prioritize important information,
use plain language,
avoid unnecessary metrics,
show trends where useful,
explain unfamiliar metrics,
avoid false precision.
44. Analytics Detail

Clicking a metric may eventually show more detail.

Example:

WhatsApp Clicks: 76

Top Products:
Chocolate Cake       24
Red Velvet Cake       18
Brownie               11
General Contact       23

This can be P1.

45. Analytics and Business Knowledge Base

Analytics should reference stable business/product identifiers.

Example:

Business Knowledge Base
        ↓
Product ID
        ↓
Analytics Event
        ↓
Dashboard

If the product name changes, historical events should still belong to the same product.

46. Deleted Products

If a product is deleted:

Historical analytics should not necessarily disappear.

Example:

Product:
Chocolate Cake

Historical Views:
421

The dashboard may show:

Chocolate Cake (Archived)

This is a future data-retention/UI decision.

47. Product Renaming

If:

Chocolate Cake

becomes:

Premium Chocolate Cake

historical events should continue to reference the same product identity where appropriate.

48. Analytics and Website Builder

Website Builder emits customer interaction events.

Example:

Product Component
       ↓
PRODUCT_VIEW
49. Analytics and Public Presence

Public Presence defines:

Public Business

Analytics measures:

Customer Interaction
50. Analytics and WhatsApp

WhatsApp module emits:

WHATSAPP_CLICK

Analytics stores/aggregates that event.

The analytics system must not claim message delivery without evidence.

51. Event Collection Architecture

Conceptually:

Customer
   ↓
Public Website
   ↓
Analytics Event
   ↓
Analytics Collection Layer
   ↓
Validation
   ↓
Storage
   ↓
Aggregation
   ↓
Dashboard
52. Event Validation

The backend should validate:

event type,
business association,
product association where required,
timestamp,
allowed properties.

Clients should not be trusted to send arbitrary business IDs or sensitive fields.

53. Tenant Isolation

Business A must never be able to retrieve:

Business B Analytics

The backend must enforce authorization.

54. Analytics API

Conceptually:

POST /analytics/events

and:

GET /businesses/{businessId}/analytics

The exact API specification belongs in:

API.md
55. Public Event Endpoint

If public websites send analytics directly to the backend, the endpoint must be designed to prevent abuse.

Do not assume that public requests are trusted.

56. Analytics Abuse

Potential abuse includes:

fake page views,
event flooding,
automated bots,
malicious event properties.

v0.1 should implement basic validation/rate limiting where practical.

57. Bot Traffic

Public websites can receive automated traffic.

Therefore:

Page views should not automatically be interpreted as real human customers.

Future analytics can introduce bot filtering.

58. Privacy Principle

FrontDesk should collect the minimum information necessary to provide useful analytics.

The v0.1 analytics system should avoid collecting:

names,
phone numbers,
email addresses,
message contents,
exact personal identities.

unless required by a future feature with appropriate controls.

59. Customer Identification

v0.1 does not need a customer identity system.

Analytics should focus on aggregate activity.

60. Cookies

The product should avoid unnecessary tracking cookies.

Where analytics can work using privacy-preserving event measurement without persistent identifiers, prefer that approach.

Exact implementation depends on the final analytics architecture and legal requirements.

61. IP Addresses

If IP information is technically processed for security or abuse prevention, it should not automatically become an owner-facing customer identity metric.

Retention and processing requirements must be documented separately.

62. Analytics Retention

v0.1 should define a reasonable retention policy.

The product should not retain detailed event-level data forever by default.

Possible future model:

Raw Events
    ↓
Limited Retention
    ↓
Aggregated Analytics
    ↓
Longer Retention

The exact retention period requires product/legal review.

63. Aggregation

Analytics can eventually aggregate events into:

Daily
Weekly
Monthly

This reduces storage and improves dashboard performance.

64. Data Accuracy

Analytics should clearly distinguish:

Measured
Estimated
Derived

Example:

Measured:
WhatsApp Clicks

Derived:
Contact Rate

Estimated:
Unique Visitors
65. Empty State

For a new business:

No customer activity yet.

Your business is live.

Try sharing your QR code with your customers.
66. Error State

If analytics cannot load:

We couldn't load your activity right now.

Your website is still live.

[Try Again]

Do not expose technical backend errors.

67. Date Handling

Dashboard filters must correctly handle:

timezone,
day boundaries,
daylight-saving changes for future international support.

For India, timezone handling is simpler because India does not currently use daylight-saving time.

68. Analytics Export

Not required for v0.1.

Future:

Export CSV
Export PDF
69. Advanced Reports

Not required for v0.1.

Future:

Weekly Report
Monthly Report
Business Insights
AI Recommendations
70. AI Business Copilot Integration

Future AI Copilot can consume analytics.

Example:

Analytics
   ↓
AI Business Copilot
   ↓
Insight

Example:

Your Chocolate Truffle Cake received 42 views this week but only 2 WhatsApp clicks.

71. AI Insight Rules

AI should not make unsupported claims.

Bad:

Customers hate your cake.

Better:

The cake received many views but relatively few WhatsApp clicks. Consider reviewing its presentation or offer.

72. Future Business Opportunities

Analytics can eventually power:

AI Business Ideas
Revenue Intelligence
Product Intelligence
A/B Testing
Business Benchmarking
Business Health

These are future modules.

73. v0.1 Analytics Boundaries

The analytics system does NOT include:

Full CRM
Customer profiles
Revenue analytics
Inventory analytics
Profit analytics
A/B testing
Benchmarking
AI recommendations
Advanced attribution
Heatmaps
Session replay
Marketing automation
74. v0.1 P0 Requirements
ANALYTICS-P0-001
Track PAGE_VIEW.

ANALYTICS-P0-002
Track PRODUCT_VIEW.

ANALYTICS-P0-003
Track WHATSAPP_CLICK.

ANALYTICS-P0-004
Track CALL_CLICK.

ANALYTICS-P0-005
Track DIRECTIONS_CLICK.

ANALYTICS-P0-006
Associate events with the correct business.

ANALYTICS-P0-007
Associate product events with the correct product.

ANALYTICS-P0-008
Provide Today / 7 Days / 30 Days filters.

ANALYTICS-P0-009
Display basic business activity.

ANALYTICS-P0-010
Display top viewed products.

ANALYTICS-P0-011
Protect tenant analytics data.

ANALYTICS-P0-012
Avoid exposing private customer information.

ANALYTICS-P0-013
Handle empty states.

ANALYTICS-P0-014
Handle analytics errors gracefully.

ANALYTICS-P0-015
Document event definitions.
75. v0.1 P1 Requirements
ANALYTICS-P1-001
QR source analytics.

ANALYTICS-P1-002
Traffic source analytics.

ANALYTICS-P1-003
Device breakdown.

ANALYTICS-P1-004
Product-level engagement details.

ANALYTICS-P1-005
Contact rate.

ANALYTICS-P1-006
Trend comparisons.

ANALYTICS-P1-007
CSV export.

ANALYTICS-P1-008
Weekly summary.

ANALYTICS-P1-009
Improved bot filtering.
76. v0.1 P2 Requirements
ANALYTICS-P2-001
Revenue Intelligence.

ANALYTICS-P2-002
Product Intelligence.

ANALYTICS-P2-003
Business Benchmarking.

ANALYTICS-P2-004
AI Business Insights.

ANALYTICS-P2-005
AI Business Copilot.

ANALYTICS-P2-006
A/B Testing.

ANALYTICS-P2-007
Advanced attribution.

ANALYTICS-P2-008
Customer journey analytics.

ANALYTICS-P2-009
Predictive analytics.

ANALYTICS-P2-010
Automated growth recommendations.
77. Acceptance Criteria

The Basic Analytics module is complete for v0.1 when:

Public page views can be measured.
Product views can be measured.
WhatsApp clicks can be measured.
Call clicks can be measured.
Directions clicks can be measured.
Events belong to the correct business.
Product events reference the correct product.
The owner can view activity for today.
The owner can view activity for the last 7 days.
The owner can view activity for the last 30 days.
The owner can identify popular products.
Empty businesses receive a useful empty state.
Analytics errors do not break the public website.
One business cannot access another business's analytics.
The system does not claim outcomes that it cannot actually measure.
Customer privacy is respected.
78. Example End-to-End Flow
Customer scans QR
        ↓
Public Website
        ↓
PAGE_VIEW
        ↓
Customer opens Chocolate Cake
        ↓
PRODUCT_VIEW
        ↓
Customer clicks WhatsApp
        ↓
WHATSAPP_CLICK
        ↓
WhatsApp opens
        ↓
Business sees customer message

FrontDesk can reliably report:

1 page view
1 product view
1 WhatsApp click

It should NOT automatically report:

1 customer
1 lead
1 sale
₹650 revenue

because those outcomes were not observed by the v0.1 system.

79. Example Business Dashboard
Royal Bakes
────────────────────────────────────

Business Activity
Last 7 days

842
Visitors

391
Product Views

76
WhatsApp Clicks

21
Call Clicks

14
Directions

────────────────────────────────────

Most Viewed Products

1. Chocolate Truffle Cake     84
2. Red Velvet Cake            62
3. Brownie                    41

────────────────────────────────────

Customer Actions

WhatsApp      76
Calls         21
Directions    14

────────────────────────────────────

Your website is getting attention.

Try sharing your QR code in-store
and on your packaging.
80. Long-Term Analytics Vision

Eventually:

Business Activity
       ↓
Customer Behavior
       ↓
Product Intelligence
       ↓
Business Intelligence
       ↓
AI Business Copilot
       ↓
Recommended Actions

Example:

Data

Chocolate Cake:
High views
Low enquiries

        ↓

AI

"Your Chocolate Cake receives strong
interest but relatively few enquiries."

        ↓

Suggested Action

"Try improving the product presentation
or testing a limited-time offer."

        ↓

[Create Offer]
[Edit Product]
[Ignore]
81. Final Principle

Analytics should help the owner understand what is happening, not overwhelm them with numbers.

The v0.1 dashboard should answer:

"Is my digital business presence actually doing something?"

Not:

"How many technical events did my frontend generate?"