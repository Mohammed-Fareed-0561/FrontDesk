Next is SEARCH-AND-DISCOVERY.md.

This is important because FrontDesk shouldn't eventually be only a tool for creating a business presence. It should also provide the foundation for finding businesses, products, services, and information later.

Create:

FrontDesk/
└── documentation/
    └── 02-product/
        └── FEATURE-SPECIFICATIONS/
            └── SEARCH-AND-DISCOVERY.md
SEARCH-AND-DISCOVERY.md
# FrontDesk — Search & Discovery Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Search & Discovery
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Search & Discovery module defines how users find information across FrontDesk.

The system may eventually support:

- business search,
- product search,
- service search,
- category search,
- location search,
- dashboard search,
- customer search,
- business discovery,
- hyperlocal discovery,
- marketplace discovery.

The v0.1 implementation should remain focused on internal business/workspace search and the minimum search capabilities required by the product.

---

# 2. Core Principle

Search should help users find something quickly.

The system should not require users to understand:

- database structures,
- internal IDs,
- technical terminology,
- complex filters.

The experience should be:

> Search naturally → find the right thing → take action.

---

# 3. Search Layers

FrontDesk will eventually have multiple search contexts.

```text
Search
│
├── Dashboard Search
│
├── Business Search
│
├── Product Search
│
├── Service Search
│
├── Customer Search
│
└── Public Discovery

These should be logically separated even if they eventually share infrastructure.

4. v0.1 Scope

The first release should prioritize:

dashboard search,
business data search,
product/service search,
basic filtering,
basic sorting,
exact and partial matching,
permission-aware results.

Public marketplace/discovery search is future scope.

5. Search Context

Search results must respect where the user is searching.

Example:

Inside:

Products

searching:

cake

should primarily return products.

Inside:

Customers

searching:

Arun

should primarily return customers.

6. Global Search

Future FrontDesk dashboard may provide:

⌘ / Ctrl + K

or a search field.

Example:

Search FrontDesk...

The user could search:

Royal Cake
Arun
Enquiries
Website
Products
7. Global Search Results

Possible structure:

Search Results

Products
  Chocolate Cake
  Black Forest Cake

Customers
  Arun Kumar

Enquiries
  Cake delivery enquiry

Pages
  Menu
  Contact
8. Search Result Categories

Future global search can categorize results:

BUSINESS
PRODUCT
SERVICE
CUSTOMER
ENQUIRY
ORDER
BOOKING
PAGE
MEDIA
SETTING

Only categories accessible to the user should appear.

9. Search Permissions

Search must never bypass authorization.

If a user cannot access:

Customer Data

the search system must not expose customer information.

10. Workspace Isolation

Search queries must always be scoped to the correct workspace.

Example:

Workspace A
   ↓
Search
   ↓
Workspace A Data

Never:

Workspace A
   ↓
Search
   ↓
All platform businesses

unless the user is explicitly using a public discovery feature.

11. Public Discovery vs Dashboard Search

These are fundamentally different.

Dashboard Search

Private operational data.

Public Discovery

Public business/product/service information.

They should use separate authorization and data exposure rules.

12. Search Query

A search query may contain:

cake

or:

chocolate cake

or:

birthday cake under 1000

Natural-language search can be added later.

13. Basic Matching

v0.1 should support:

exact matching,
partial matching,
case-insensitive matching.

Example:

Searching:

cake

can find:

Chocolate Cake
Chocolate Truffle Cake
Cake Box
14. Prefix Matching

Searching:

cho

may return:

Chocolate Cake
Chocolate Brownie

where supported by the search implementation.

15. Typo Tolerance

Future:

Search:
choclate cake

could return:

Chocolate Cake

This should not be required for the first implementation if it significantly increases complexity.

16. Search Ranking

Results should be ranked by relevance.

Possible ranking factors:

Exact match
↓
Prefix match
↓
Partial match
↓
Field importance
↓
Popularity
↓
Recency

The exact ranking algorithm belongs to the search architecture.

17. Field Weighting

Not all fields should have equal importance.

Example product:

Name
Description
Category
Tags
SKU

A match in:

Name

should generally rank higher than a match buried in:

Description
18. Product Search

Product search may search:

Product Name
Description
Category
Tags
SKU

Example:

Search:
truffle

Results:

Chocolate Truffle Cake
Truffle Pastry
Truffle Brownie
19. Service Search

Service search may search:

Service Name
Description
Category
Tags

Example:

Search:
hair

Results:

Haircut
Hair Coloring
Hair Spa
20. Customer Search

Future customer search may support:

Name
Phone
Email
Customer ID

Sensitive fields must only be searchable by authorized users.

21. Enquiry Search

Future enquiry search may support:

Customer
Message
Status
Subject

Example:

Search:
birthday

may return enquiries containing:

birthday cake
birthday decoration
birthday catering
22. Page Search

Website pages may be searchable.

Example:

Search:
menu

returns:

Menu
23. Media Search

Future:

Search:
cake

may find:

cake-01.jpg
chocolate-cake.png
birthday-cake.webp

using filenames, metadata, tags, or AI-generated labels.

24. Search Filters

Future filters may include:

Category
Status
Price
Availability
Date
Location
Type

Filters should only appear when relevant.

25. Product Filters

Example:

Products

Search: cake

Filters:
Category
Availability
Price
Status
26. Customer Filters

Future:

Customers

Filters:
New
Regular
VIP
Inactive
High-value

This connects with the future Customer CRM.

27. Enquiry Filters

Future:

Enquiries

Filters:
New
Contacted
Waiting
Resolved
Closed
28. Sorting

Search results may support:

Relevance
Newest
Oldest
Price
Popularity
Name

Not every entity needs every sorting option.

29. Empty Search

If no query is entered, the UI may show:

Recent items
Frequently accessed items
Suggested actions

rather than an empty screen.

30. No Results

Example:

No products found for "strawberry pizza".

Then suggest:

Try:
strawberry
pizza
cake
31. Search Suggestions

As the user types:

cho...

the system may suggest:

Chocolate Cake
Chocolate Brownie
Chocolate Shake
32. Search Debouncing

The frontend should avoid sending a request for every keystroke unnecessarily.

Example:

c
ca
cak
cake

should be handled efficiently.

The exact implementation belongs to frontend architecture.

33. Search Loading State

While searching:

Searching...

or skeleton results may be displayed.

The interface should not appear frozen.

34. Search Result Preview

Results should provide enough information to identify the item.

Example:

Chocolate Truffle Cake
₹650
Cakes
Available
35. Search Result Actions

Results may include:

Open
Edit
Preview
View

depending on permissions.

36. Keyboard Navigation

Future global search should support:

↑
↓
Enter
Esc

for fast navigation.

37. Command Palette

Global search may eventually become a command palette.

Example:

Search or type a command...

> Add product
> Open enquiries
> Edit homepage
> View analytics
> Publish website

This would combine:

Search
+
Navigation
+
Actions
38. AI Search

Future:

Instead of:

Search:
cake

owner could ask:

Show me my best-selling cakes.

The AI can query structured business data.

39. Natural Language Business Search

Future examples:

Which products are unavailable?

Show customers who haven't ordered in 60 days.

Find all enquiries about catering.

Which services cost more than ₹1,000?

This should be powered by structured data rather than blindly searching text.

40. AI Search Safety

Natural-language search must respect:

workspace permissions,
role permissions,
customer privacy,
sensitive information rules.

An AI query must not become an authorization bypass.

41. Business Discovery

Future public discovery could allow customers to search:

Restaurants
Cafés
Bakeries
Salons
Boutiques
Freelancers
Service Providers
42. Public Business Search

Example:

Search:
Bakery near Tambaram

Possible results:

Royal Bakes
Fresh Oven
Bake House

This is future scope.

43. Location Search

Future public discovery may support:

Near me
City
Area
Pincode
Landmark

Example:

Bakery near Tambaram
44. Location Accuracy

FrontDesk should not claim that a business is "near" a customer unless it has reliable location data.

Business location should be based on verified/owner-provided information where possible.

45. Hyperlocal Discovery

Long-term:

Customer
   ↓
Location
   ↓
Category
   ↓
Businesses
   ↓
Products/Services

Example:

Bakeries within 5 km that are open now.

46. Business Categories

The system should support standardized categories.

Examples:

Restaurant
Cafe
Bakery
Salon
Boutique
Furniture
Hotel
Freelancer
Photographer
Tutor
Repair Service
Home Business
Food Cart
47. Category Hierarchy

Future:

Food
├── Restaurant
├── Cafe
├── Bakery
└── Food Cart

Beauty
├── Salon
├── Spa
└── Makeup Artist

The category model should be extensible.

48. Business Tags

Businesses may have tags:

Vegetarian
Home Delivery
Cashless
Open Late
Custom Orders
Halal
Pet Friendly

Only verified or owner-provided attributes should be presented as factual claims.

49. Product Discovery

Future:

Customer
 ↓
Search "chocolate cake"
 ↓
Businesses
 ↓
Products

This can become a marketplace layer later.

50. Service Discovery

Similarly:

Search:
bridal makeup

may return:

Service Providers

with:

service,
location,
price range,
availability where supported.
51. Availability Search

Future:

Find salons with a haircut appointment today.

This requires integration with booking/availability systems.

Do not display availability unless it is current and reliable.

52. Price Search

Future:

Cakes under ₹500 near me.

The system can filter public products where price information is available.

53. Open Now

Future:

Restaurants open now.

This requires reliable:

business hours,
timezone,
current time.

Special holiday/temporary closures may also need to be considered.

54. Public Business Profiles

Search results can eventually lead to:

Business Profile
├── About
├── Products
├── Services
├── Opening Hours
├── Location
├── Reviews
├── Offers
└── Contact
55. Search Result Ranking

Future public discovery ranking may consider:

Relevance
Distance
Open status
Popularity
Reviews
Completeness
Availability

The ranking system should avoid unfairly favoring businesses simply because they pay more unless clearly disclosed and designed as advertising.

56. Sponsored Results

Potential future monetization:

Sponsored

results.

If introduced, sponsored placement must be clearly labeled.

57. Search Personalization

Future:

Customer search behavior may help personalize results.

Example:

A customer frequently searches:

Cafes

FrontDesk may prioritize relevant cafes.

This requires appropriate privacy controls.

58. Search History

Future customers/users may have:

Recent searches

Example:

cake
salon
coffee near me

Users should have appropriate controls to clear history.

59. Search Privacy

Private search history should not automatically become visible to businesses.

60. Business Search Analytics

Future business owners may see:

Search impressions
Search clicks
Profile views
Search-to-enquiry
Search-to-order

This can become part of Business Analytics.

61. Search Analytics Example
"birthday cake"

may produce:

128 impressions
32 profile views
11 product views
4 enquiries
2 orders

This helps businesses understand customer intent.

62. Search-to-Action

The strongest discovery flow is:

Search
 ↓
Discover
 ↓
View
 ↓
Enquire
 ↓
Order / Book

FrontDesk should eventually optimize this complete journey.

63. Search Index

Future architecture may maintain a search index containing public searchable data.

Conceptually:

Business
Product
Service
Location
Category

The search index should not contain unrestricted private data.

64. Indexing Rules

Only data marked as searchable should enter the public index.

Example:

Product
public = true

may be indexed.

Private internal notes must not be indexed publicly.

65. Search Index Updates

When business data changes:

Product Updated
      ↓
Search Index Updated

The update process should be reliable.

66. Deleted Content

When a product is deleted or made private:

Product
 ↓
Not Public
 ↓
Remove/disable public search result

Search results must not continue exposing deleted/private information indefinitely.

67. Search Consistency

The system should define acceptable indexing delay.

For v0.1, direct database search may be sufficient.

Future large-scale discovery may require a dedicated search engine/index.

68. v0.1 Search Architecture

Recommended starting approach:

Frontend
   ↓
Search API
   ↓
Backend
   ↓
PostgreSQL

Use database-supported matching initially.

Avoid introducing a dedicated search infrastructure unless required.

69. Future Search Architecture

At larger scale:

Frontend
   ↓
Search API
   ↓
Search Service
   ↓
Search Index
   ↓
Business Data

The exact technology is an architecture decision.

70. Search API

Future concepts:

GET /search?q=cake

Scoped examples:

GET /products/search?q=cake
GET /services/search?q=hair
GET /customers/search?q=arun

Exact API contracts belong in API documentation.

71. Pagination

Search results should not return unlimited records.

Example:

Page 1
20 results

Future APIs may use:

limit
cursor

for efficient pagination.

72. Search Result Limits

Global search may return a small number per category:

Products
5 results

Customers
5 results

Enquiries
5 results

with:

View all
73. Search Performance

The search experience should feel fast.

The system should avoid:

unnecessary full-table scans at scale,
loading entire datasets into the browser,
returning huge result payloads.
74. Search Error

If search fails:

We couldn't complete the search.

[Try Again]

Do not expose backend errors.

75. Search Availability

If search infrastructure is temporarily unavailable, normal business operations should not necessarily fail.

Search should be treated as a supporting capability.

76. Public Search Safety

Public search must not expose:

private customer data,
internal notes,
staff information,
unpublished products,
private pricing,
private business documents.
77. Search Abuse Protection

Future public search needs protection against:

scraping,
automated excessive queries,
enumeration,
malicious query patterns.

Potential controls:

rate limiting,
caching,
pagination limits,
abuse detection.
78. Search and SEO

Public search should not automatically create thousands of thin pages.

Search-result URLs should be handled carefully.

FrontDesk should avoid generating indexable pages for every arbitrary query.

79. Local SEO Relationship

Public business discovery and SEO are related but different.

SEO helps:

Google/Search Engine
 ↓
Business

FrontDesk discovery helps:

FrontDesk
 ↓
Business

Both should use the same authoritative business data where appropriate.

80. Business Knowledge Base Relationship

Search should consume structured business data.

Example:

Business Knowledge Base
├── Products
├── Services
├── Hours
├── Locations
└── Categories

The same data can power:

Website
Search
AI
SEO
WhatsApp
Analytics
81. Search + AI Business Copilot

The AI Copilot can use search internally.

Example:

Find all products that haven't sold in 30 days.

The AI translates the request into a structured query.

82. Search + AI Customer Agent

A customer AI agent can use public business search.

Example:

Do you have chocolate cake?

The agent searches the business's public catalog.

It should not access private inventory information unless explicitly authorized and supported.

83. Search + Business Importer

Imported business data should become searchable after successful ingestion.

Example:

Import Menu
 ↓
Products
 ↓
Searchable Catalog
84. Search + Website Builder

Website builder users can search:

Product
Section
Page
Media

to quickly insert existing business data.

85. Search + Media

Future asset picker:

Add Image
 ↓
Search assets
 ↓
cake
 ↓
Select image
86. Search + Business Updates

When a product is updated:

Product Update
 ↓
Database
 ↓
Website
 ↓
Search Index

The exact synchronization mechanism belongs to architecture documentation.

87. Search + Versioning

Search should normally operate against the current state appropriate to its context.

Public search:

Published data

Dashboard search:

Current authorized workspace data

Preview search:

Preview/draft state

These must not be mixed.

88. Search + Permissions

Example:

Owner
→ Can search all business data

Staff
→ Can search permitted operational data

Customer
→ Can search public business data
89. Search + Roles

Search result visibility must follow the same permission model as direct navigation.

If a user cannot open an object directly, search must not provide access to it.

90. Search + Multi-Location

Future businesses may have multiple locations.

Example:

Royal Bakes
├── Tambaram
├── Chromepet
└── Velachery

Search may support:

Location

as a filter.

91. Search + Multi-Business Workspace

Agencies may eventually manage:

Workspace
├── Business A
├── Business B
├── Business C

Global search may search across managed businesses only when the user has permission.

92. Search + White Label

Agency customers may have their own search experience.

The underlying search architecture should not depend on FrontDesk branding.

93. Future Marketplace Search

Long-term:

Search FrontDesk

Businesses
Products
Services
Designers
Developers
Automations
AI Agents
Integrations

This can eventually support the broader FrontDesk ecosystem.

94. Marketplace Search Categories

Future:

Businesses
├── Restaurants
├── Salons
├── Boutiques
└── Services

Apps
├── Integrations
├── Automations
└── AI Agents

Professionals
├── Designers
├── Developers
└── Marketers
95. Discovery Ecosystem

The long-term model becomes:

Customer
      ↓
FrontDesk Discovery
      ↓
Business
      ↓
Product / Service
      ↓
Enquiry / Order / Booking

And:

Business
      ↓
FrontDesk Marketplace
      ↓
Designer / Developer / Automation / AI Agent
96. Search Relevance Principle

Search should prioritize what the user actually wants.

Avoid ranking results based purely on:

internal IDs,
arbitrary creation order,
technical metadata.
97. Search Transparency

For future AI-powered search, the system should be able to explain basic result reasoning where useful.

Example:

Showing these bakeries because they match your category and location.

Do not reveal sensitive ranking signals.

98. Search Suggestions from Business Data

Future AI may identify popular search terms.

Example:

Customers frequently search:
birthday cakes
wedding cakes
eggless cakes

Business can use these insights for:

products,
SEO,
website sections,
offers.
99. Search Opportunity Detection

Future AI Copilot:

42 customers searched for "eggless cake", but you don't currently list one.

Potential action:

[Add Product]

This connects discovery with business intelligence.

100. Search Conversion Intelligence

Future:

Search Term
 ↓
Result
 ↓
Click
 ↓
Enquiry
 ↓
Order

FrontDesk can identify:

High search
Low conversion

and suggest improvements.

101. Example
Search:
Chocolate Cake

1,200 searches
480 product views
74 enquiries
21 orders

AI:

Many customers are viewing chocolate cakes but only a small percentage are ordering. Consider improving the product page or offer.

102. Search Quality Metrics

Future system metrics:

Search success rate
Zero-result rate
Click-through rate
Search-to-action rate
Average response time
103. Zero-Result Monitoring

If many users search:

wedding cake

and get no results, FrontDesk can identify an opportunity.

104. Business Owner Insight

Future:

Customers searched for "birthday cakes" 37 times this week.

This can become an actionable recommendation.

105. Search Result Feedback

Future users may provide:

Helpful
Not helpful

for AI/discovery results where appropriate.

This can improve search quality.

106. v0.1 P0 Requirements
SEARCH-P0-001
Authenticated workspace users can search permitted business data.

SEARCH-P0-002
Search supports case-insensitive matching.

SEARCH-P0-003
Search supports partial matching.

SEARCH-P0-004
Search results respect workspace isolation.

SEARCH-P0-005
Search results respect user permissions.

SEARCH-P0-006
Products can be searched.

SEARCH-P0-007
Services can be searched where supported.

SEARCH-P0-008
Search results can be opened from the interface.

SEARCH-P0-009
Search does not expose private data to unauthorized users.

SEARCH-P0-010
Search supports basic empty/no-result states.

SEARCH-P0-011
Search requests are reasonably efficient for the v0.1 dataset size.

SEARCH-P0-012
The search architecture can be extended to additional entity types.
107. v0.1 P1 Requirements
SEARCH-P1-001
Global dashboard search.

SEARCH-P1-002
Search suggestions.

SEARCH-P1-003
Filtering.

SEARCH-P1-004
Sorting.

SEARCH-P1-005
Keyboard navigation.

SEARCH-P1-006
Customer search.

SEARCH-P1-007
Enquiry search.

SEARCH-P1-008
Media search.

SEARCH-P1-009
Search history.

SEARCH-P1-010
Improved typo tolerance.
108. v0.1 P2 Requirements
SEARCH-P2-001
Public business discovery.

SEARCH-P2-002
Hyperlocal search.

SEARCH-P2-003
Product marketplace search.

SEARCH-P2-004
Service marketplace search.

SEARCH-P2-005
Natural-language search.

SEARCH-P2-006
AI semantic search.

SEARCH-P2-007
Personalized discovery.

SEARCH-P2-008
Search analytics.

SEARCH-P2-009
Search opportunity detection.

SEARCH-P2-010
FrontDesk marketplace search.
109. Acceptance Criteria

The Search & Discovery module is complete for v0.1 when:

Authorized users can search their business data.
Search is scoped to the correct workspace.
Search respects permissions.
Products can be found by name and relevant searchable fields.
Services can be found where supported.
Partial matching works.
Case differences do not prevent expected matches.
Results can be opened.
Empty queries are handled correctly.
No-result searches are handled clearly.
Private information is never exposed through search.
The implementation does not unnecessarily introduce expensive search infrastructure.
The architecture can later support public business discovery.
The architecture can later support AI/natural-language search.
110. Example v0.1 Scenario

Business:

Royal Bakes

Products:

Chocolate Cake
Black Forest Cake
Red Velvet Cake
Chocolate Brownie

Owner searches:

chocolate

Result:

Products

Chocolate Cake
₹650

Chocolate Brownie
₹180

Owner clicks:

Chocolate Cake

and is taken to the product editor.

111. Example Global Search

Owner types:

Arun

Results:

Customers
Arun Kumar

Enquiries
Arun — Birthday Cake Enquiry

Orders
Order #1024 — Arun Kumar

Only objects the owner is authorized to view are shown.

112. Future Public Discovery Scenario

Customer searches:

Bakery near Tambaram

Future result:

Royal Bakes
4.7 ★
0.8 km
Open until 10 PM

[View Business]

This capability is intentionally outside the core v0.1 scope.

113. Future AI Search Scenario

Owner asks:

Show me products that are getting lots of views but few orders.

AI:

I found 3 products:

1. Chocolate Cake
2. Red Velvet Cake
3. Birthday Cupcake Box

Then:

Chocolate Cake has the highest opportunity.

[View Product]
114. Final Architecture Principle

The search system should follow:

User
 ↓
Search Context
 ↓
Permission Scope
 ↓
Search Query
 ↓
Relevant Data
 ↓
Ranked Results
 ↓
Action

For public discovery:

Customer
 ↓
Public Search
 ↓
Public Business Data
 ↓
Discovery
 ↓
Business
 ↓
Enquiry / Order / Booking
115. Final Principle

Search should not merely find data. It should help users reach the next useful action.

For FrontDesk, the long-term goal is:

Find
 ↓
Understand
 ↓
Act
 ↓
Convert