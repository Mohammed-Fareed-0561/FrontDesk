# FrontDesk — Database Schema

**Product:** FrontDesk  
**Version:** v0.1  
**Document:** Database Schema  
**Status:** Draft — For Review  
**Last Updated:** 2026-08-26

---

# 1. Purpose

This document defines the database architecture and schema for FrontDesk v0.1.

It specifies:

- entities
- tables
- relationships
- primary keys
- foreign keys
- indexes
- constraints
- tenant isolation
- timestamps
- status fields
- soft deletion
- auditability
- data ownership
- AI-related data
- website data
- import data
- automation data
- event data

This document translates the conceptual architecture into a concrete relational data model.

---

# 2. Database Philosophy

FrontDesk should treat the database as the **source of truth for structured business information**.

The database should not be designed around the website.

Instead:

```text
Business Data
      ↓
Website
QR
WhatsApp
AI
Analytics
Automations

The website is a consumer of business data.

3. Recommended Database
Primary Database

PostgreSQL

Reasons:

relational integrity
strong transaction support
JSON/JSONB support
full-text search capabilities
mature indexing
suitable for multi-tenant SaaS
open-source
compatible with low-cost/free development environments
4. v0.1 Database Architecture
PostgreSQL
│
├── Identity
│   ├── users
│   ├── workspaces
│   ├── workspace_members
│   └── invitations
│
├── Business
│   ├── businesses
│   ├── business_locations
│   ├── business_hours
│   ├── business_settings
│   └── business_preferences
│
├── Catalog
│   ├── categories
│   ├── products
│   ├── product_variants
│   ├── product_images
│   ├── services
│   └── offers
│
├── Website
│   ├── websites
│   ├── website_pages
│   ├── website_sections
│   ├── website_versions
│   └── website_domains
│
├── Import
│   ├── import_jobs
│   ├── import_sources
│   ├── import_items
│   └── import_conflicts
│
├── Customers
│   ├── customers
│   ├── customer_preferences
│   └── customer_consents
│
├── Enquiries
│   ├── enquiries
│   ├── conversations
│   └── messages
│
├── Orders
│   ├── orders
│   └── order_items
│
├── Bookings
│   ├── bookings
│   └── booking_items
│
├── Payments
│   ├── payments
│   └── payment_events
│
├── Knowledge
│   ├── knowledge_documents
│   ├── knowledge_chunks
│   └── knowledge_sources
│
├── Memory
│   ├── business_memories
│   └── memory_events
│
├── AI
│   ├── ai_requests
│   ├── ai_outputs
│   └── ai_usage
│
├── Actions
│   ├── action_definitions
│   ├── action_executions
│   └── approval_requests
│
├── Automation
│   ├── automations
│   ├── automation_runs
│   └── automation_steps
│
├── Events
│   ├── domain_events
│   └── event_deliveries
│
├── Media
│   ├── media_assets
│   └── media_links
│
├── Analytics
│   └── business_events / metric records
│
└── Audit
    └── audit_logs
5. ID Strategy

Use application-generated UUIDs or UUID-compatible identifiers for primary keys.

Recommended:

UUID

Example:

550e8400-e29b-41d4-a716-446655440000

Do not expose sequential database IDs publicly where avoidable.

6. Standard Timestamp Fields

Most persistent entities should contain:

created_at
updated_at

Use UTC internally.

The frontend converts timestamps to the user's/business's local timezone.

7. Soft Deletion

Business-critical records should generally support:

deleted_at

instead of immediate physical deletion.

Examples:

products
services
customers
website pages
media
offers

Permanent deletion can be handled separately.

8. Tenant Model

FrontDesk is multi-tenant.

The core hierarchy is:

User
 ↓
Workspace
 ↓
Business
 ↓
Business Resources

Every business-owned record must be scoped to the appropriate tenant.

9. Users
Table: users

Stores authenticated users.

Fields
id                  UUID PRIMARY KEY
email               TEXT UNIQUE NOT NULL
display_name        TEXT
avatar_url          TEXT
phone               TEXT
status              TEXT
created_at          TIMESTAMP
updated_at          TIMESTAMP
last_login_at       TIMESTAMP
Status

Possible values:

active
invited
suspended
deleted
10. Workspaces
Table: workspaces

A workspace represents an account/team environment.

id                  UUID PRIMARY KEY
name                TEXT NOT NULL
slug                TEXT UNIQUE NOT NULL
owner_user_id       UUID NOT NULL
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP
11. Workspace Members
Table: workspace_members

Connects users to workspaces.

id                  UUID PRIMARY KEY
workspace_id        UUID NOT NULL
user_id             UUID NOT NULL
role                TEXT NOT NULL
status              TEXT NOT NULL
created_at          TIMESTAMP
updated_at          TIMESTAMP
Roles

Initial roles:

owner
manager
staff

Future:

designer
developer
marketer
accountant
12. Invitations
Table: invitations
id                  UUID PRIMARY KEY
workspace_id        UUID NOT NULL
email               TEXT NOT NULL
role                TEXT NOT NULL
token_hash          TEXT
expires_at          TIMESTAMP
accepted_at         TIMESTAMP
created_at          TIMESTAMP
13. Businesses
Table: businesses

This is the central business entity.

id                  UUID PRIMARY KEY
workspace_id        UUID NOT NULL
name                TEXT NOT NULL
slug                TEXT NOT NULL
description         TEXT
business_type       TEXT
industry             TEXT
phone               TEXT
email               TEXT
website_url         TEXT
logo_media_id       UUID
status              TEXT
timezone            TEXT
currency            TEXT
locale              TEXT
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP
14. Business Types

Examples:

cafe
restaurant
bakery
hotel
salon
boutique
furniture
retail
freelancer
home_business
service_provider
food_cart
photographer
tutor
repair_service
agency

The system should allow custom categories in the future.

15. Business Locations
Table: business_locations
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
name                TEXT
address_line_1      TEXT
address_line_2      TEXT
city                TEXT
state               TEXT
postal_code         TEXT
country             TEXT
latitude            DECIMAL
longitude           DECIMAL
phone               TEXT
is_primary          BOOLEAN
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP
16. Business Hours
Table: business_hours
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
location_id         UUID
day_of_week         INTEGER NOT NULL
open_time           TIME
close_time          TIME
is_closed           BOOLEAN
created_at          TIMESTAMP
updated_at          TIMESTAMP
17. Business Settings
Table: business_settings
id                  UUID PRIMARY KEY
business_id         UUID UNIQUE NOT NULL
settings            JSONB NOT NULL
created_at          TIMESTAMP
updated_at          TIMESTAMP

Use JSONB only for flexible settings, not core relational business data.

18. Business Preferences
Table: business_preferences
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
key                 TEXT NOT NULL
value               JSONB
source              TEXT
created_at          TIMESTAMP
updated_at          TIMESTAMP

Example:

language = ["Tamil", "English"]

marketing_tone = "premium"

allow_discounts = false
19. Categories
Table: categories
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
name                TEXT NOT NULL
description         TEXT
parent_id           UUID
sort_order          INTEGER
is_active           BOOLEAN
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP

Supports nested categories.

20. Products
Table: products
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
category_id         UUID
name                TEXT NOT NULL
slug                TEXT NOT NULL
description         TEXT
short_description   TEXT
sku                 TEXT
price               DECIMAL
compare_at_price    DECIMAL
cost_price          DECIMAL
currency            TEXT
status              TEXT
availability_status TEXT
stock_quantity      DECIMAL
track_inventory     BOOLEAN
is_featured         BOOLEAN
sort_order          INTEGER
metadata            JSONB
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP
21. Product Status

Possible values:

draft
active
archived
22. Product Availability
available
unavailable
out_of_stock
coming_soon
23. Product Variants
Table: product_variants

Useful for:

size
color
quantity
flavor
package size
id                  UUID PRIMARY KEY
product_id          UUID NOT NULL
name                TEXT NOT NULL
sku                 TEXT
price               DECIMAL
cost_price          DECIMAL
stock_quantity      DECIMAL
is_active           BOOLEAN
metadata            JSONB
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP
24. Services
Table: services

For businesses that sell services rather than physical products.

id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
name                TEXT NOT NULL
slug                TEXT NOT NULL
description         TEXT
price               DECIMAL
duration_minutes    INTEGER
currency            TEXT
status              TEXT
is_featured         BOOLEAN
sort_order          INTEGER
metadata            JSONB
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP
25. Offers
Table: offers
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
name                TEXT NOT NULL
code                TEXT
description         TEXT
discount_type       TEXT
discount_value      DECIMAL
minimum_order_value DECIMAL
starts_at           TIMESTAMP
ends_at             TIMESTAMP
usage_limit         INTEGER
usage_count         INTEGER
status              TEXT
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP
26. Websites
Table: websites

A business may eventually have multiple website configurations.

id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
name                TEXT
status              TEXT
draft_version_id    UUID
published_version_id UUID
theme_config        JSONB
created_at          TIMESTAMP
updated_at          TIMESTAMP
27. Website Pages
Table: website_pages
id                  UUID PRIMARY KEY
website_id          UUID NOT NULL
title               TEXT NOT NULL
slug                TEXT NOT NULL
page_type           TEXT
status              TEXT
sort_order          INTEGER
seo_config          JSONB
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP
28. Website Sections
Table: website_sections
id                  UUID PRIMARY KEY
page_id             UUID NOT NULL
section_type        TEXT NOT NULL
sort_order          INTEGER
content             JSONB
style_config        JSONB
visibility_config   JSONB
created_at          TIMESTAMP
updated_at          TIMESTAMP

The section schema should be validated at the application layer.

29. Website Versions
Table: website_versions
id                  UUID PRIMARY KEY
website_id          UUID NOT NULL
version_number      INTEGER NOT NULL
snapshot            JSONB NOT NULL
created_by          UUID
created_at          TIMESTAMP
published_at        TIMESTAMP

Published versions should be immutable.

30. Website Domains
Table: website_domains
id                  UUID PRIMARY KEY
website_id          UUID NOT NULL
domain              TEXT UNIQUE NOT NULL
type                TEXT
verification_status TEXT
is_primary          BOOLEAN
created_at          TIMESTAMP
updated_at          TIMESTAMP
31. Media Assets
Table: media_assets
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
uploaded_by         UUID
file_name           TEXT
storage_key         TEXT NOT NULL
mime_type           TEXT
file_size           BIGINT
width               INTEGER
height              INTEGER
alt_text             TEXT
status              TEXT
metadata            JSONB
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP
32. Media Links
Table: media_links

Connects media to entities.

id                  UUID PRIMARY KEY
media_id            UUID NOT NULL
entity_type         TEXT NOT NULL
entity_id           UUID NOT NULL
role                TEXT
sort_order          INTEGER
created_at          TIMESTAMP
33. Import Jobs
Table: import_jobs

Represents a business import operation.

id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
created_by          UUID
source_type         TEXT NOT NULL
source_reference    TEXT
status              TEXT
progress            INTEGER
started_at          TIMESTAMP
completed_at        TIMESTAMP
error_message       TEXT
metadata            JSONB
created_at          TIMESTAMP
updated_at          TIMESTAMP
34. Import Sources
Table: import_sources
id                  UUID PRIMARY KEY
import_job_id       UUID NOT NULL
source_type         TEXT NOT NULL
source_url          TEXT
media_id            UUID
source_metadata     JSONB
created_at          TIMESTAMP
35. Import Items
Table: import_items

Represents extracted information.

id                  UUID PRIMARY KEY
import_job_id       UUID NOT NULL
entity_type         TEXT NOT NULL
entity_data         JSONB NOT NULL
confidence_score    DECIMAL
status              TEXT
source_reference    TEXT
created_at          TIMESTAMP
updated_at          TIMESTAMP
36. Import Conflicts
Table: import_conflicts
id                  UUID PRIMARY KEY
import_job_id       UUID NOT NULL
entity_type         TEXT NOT NULL
entity_id           UUID
existing_value      JSONB
imported_value      JSONB
resolution          TEXT
resolved_by         UUID
resolved_at         TIMESTAMP
created_at          TIMESTAMP
37. Customers
Table: customers
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
name                TEXT
email               TEXT
phone               TEXT
status              TEXT
source              TEXT
first_seen_at       TIMESTAMP
last_seen_at        TIMESTAMP
metadata            JSONB
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP
38. Customer Preferences
Table: customer_preferences
id                  UUID PRIMARY KEY
customer_id         UUID NOT NULL
key                 TEXT NOT NULL
value               JSONB
source              TEXT
created_at          TIMESTAMP
updated_at          TIMESTAMP

Only store information that is appropriate, necessary, and permitted.

39. Customer Consent
Table: customer_consents
id                  UUID PRIMARY KEY
customer_id         UUID NOT NULL
consent_type        TEXT NOT NULL
status              TEXT NOT NULL
source              TEXT
granted_at          TIMESTAMP
revoked_at          TIMESTAMP
created_at          TIMESTAMP
updated_at          TIMESTAMP

Examples:

marketing
notifications
data_storage
ai_interaction
40. Conversations
Table: conversations
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
customer_id         UUID
channel             TEXT NOT NULL
status              TEXT
assigned_to         UUID
last_message_at     TIMESTAMP
metadata            JSONB
created_at          TIMESTAMP
updated_at          TIMESTAMP
41. Messages
Table: messages
id                  UUID PRIMARY KEY
conversation_id     UUID NOT NULL
sender_type         TEXT NOT NULL
sender_id           UUID
content             TEXT
message_type        TEXT
external_message_id TEXT
metadata            JSONB
created_at          TIMESTAMP
42. Enquiries
Table: enquiries
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
customer_id         UUID
conversation_id     UUID
subject             TEXT
message             TEXT
status              TEXT
priority            TEXT
assigned_to         UUID
source              TEXT
created_at          TIMESTAMP
updated_at          TIMESTAMP
closed_at           TIMESTAMP
43. Enquiry Status
new
contacted
in_progress
waiting
resolved
closed
44. Orders
Table: orders
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
customer_id         UUID
order_number        TEXT NOT NULL
status              TEXT
payment_status      TEXT
currency            TEXT
subtotal            DECIMAL
discount_amount     DECIMAL
tax_amount          DECIMAL
delivery_amount     DECIMAL
total_amount        DECIMAL
notes               TEXT
source              TEXT
created_at          TIMESTAMP
updated_at          TIMESTAMP
cancelled_at        TIMESTAMP
completed_at        TIMESTAMP
45. Order Items
Table: order_items
id                  UUID PRIMARY KEY
order_id            UUID NOT NULL
product_id          UUID
variant_id          UUID
name_snapshot       TEXT NOT NULL
unit_price          DECIMAL
quantity            DECIMAL
discount_amount     DECIMAL
tax_amount          DECIMAL
total_amount        DECIMAL
metadata            JSONB
created_at          TIMESTAMP

Use snapshots for order-critical values such as product name and price.

46. Bookings
Table: bookings
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
customer_id         UUID
location_id         UUID
booking_number      TEXT
status              TEXT
starts_at           TIMESTAMP
ends_at             TIMESTAMP
notes               TEXT
source              TEXT
created_at          TIMESTAMP
updated_at          TIMESTAMP
cancelled_at        TIMESTAMP
47. Booking Items
Table: booking_items
id                  UUID PRIMARY KEY
booking_id          UUID NOT NULL
service_id          UUID
staff_member_id     UUID
name_snapshot       TEXT
price_snapshot      DECIMAL
duration_minutes    INTEGER
created_at          TIMESTAMP
48. Payments
Table: payments
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
order_id            UUID
customer_id         UUID
provider            TEXT
provider_payment_id TEXT
amount              DECIMAL
currency            TEXT
status              TEXT
payment_method      TEXT
created_at          TIMESTAMP
updated_at          TIMESTAMP
completed_at        TIMESTAMP

Never store sensitive payment credentials.

49. Payment Events
Table: payment_events
id                  UUID PRIMARY KEY
payment_id          UUID
provider            TEXT
external_event_id   TEXT
event_type          TEXT
payload             JSONB
processed_at        TIMESTAMP
created_at          TIMESTAMP

External event IDs should support deduplication.

50. Knowledge Documents
Table: knowledge_documents
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
source_type         TEXT
source_id           UUID
title               TEXT
content             TEXT
status              TEXT
metadata            JSONB
created_at          TIMESTAMP
updated_at          TIMESTAMP
51. Knowledge Sources
Table: knowledge_sources
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
source_type         TEXT NOT NULL
source_reference    TEXT
source_hash         TEXT
last_synced_at      TIMESTAMP
metadata            JSONB
created_at          TIMESTAMP
updated_at          TIMESTAMP
52. Knowledge Chunks
Table: knowledge_chunks
id                  UUID PRIMARY KEY
document_id         UUID NOT NULL
chunk_index         INTEGER
content             TEXT NOT NULL
embedding           VECTOR / compatible representation
metadata            JSONB
created_at          TIMESTAMP

If vector search is used, the exact implementation should be documented in the technical stack.

53. Business Memory
Table: business_memories
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
key                 TEXT
content             TEXT NOT NULL
memory_type         TEXT
importance          INTEGER
confidence           DECIMAL
source              TEXT
status              TEXT
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP

Examples:

brand_preference
communication_preference
business_rule
marketing_rule
product_rule
customer_rule
operational_preference
54. Memory Events
Table: memory_events
id                  UUID PRIMARY KEY
memory_id           UUID NOT NULL
event_type          TEXT NOT NULL
old_value           JSONB
new_value           JSONB
actor_type          TEXT
actor_id            UUID
created_at          TIMESTAMP
55. AI Requests
Table: ai_requests
id                  UUID PRIMARY KEY
business_id         UUID
user_id             UUID
agent_id             UUID
request_type        TEXT
model_provider      TEXT
model_name          TEXT
status              TEXT
input_tokens        INTEGER
output_tokens       INTEGER
latency_ms          INTEGER
created_at          TIMESTAMP
completed_at        TIMESTAMP
56. AI Outputs
Table: ai_outputs
id                  UUID PRIMARY KEY
ai_request_id       UUID NOT NULL
output_type         TEXT
content             JSONB
confidence           DECIMAL
created_at          TIMESTAMP

Avoid storing unnecessary raw prompts/responses containing sensitive customer information.

57. AI Usage
Table: ai_usage
id                  UUID PRIMARY KEY
business_id         UUID
ai_request_id       UUID
provider             TEXT
model                TEXT
input_tokens        INTEGER
output_tokens       INTEGER
estimated_cost      DECIMAL
created_at          TIMESTAMP
58. Action Definitions
Table: action_definitions
id                  UUID PRIMARY KEY
action_key          TEXT UNIQUE NOT NULL
name                TEXT NOT NULL
description         TEXT
input_schema        JSONB
permission_scope    TEXT
approval_required   BOOLEAN
is_active           BOOLEAN
created_at          TIMESTAMP
updated_at          TIMESTAMP

Examples:

CREATE_PRODUCT
UPDATE_PRODUCT
CREATE_OFFER
SEND_MESSAGE
CREATE_ORDER
CREATE_BOOKING
PUBLISH_WEBSITE
CREATE_QUOTATION
59. Action Executions
Table: action_executions
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
action_definition_id UUID NOT NULL
requested_by_type   TEXT
requested_by_id     UUID
status              TEXT
input_payload       JSONB
result_payload      JSONB
error_message       TEXT
approval_request_id UUID
created_at          TIMESTAMP
started_at          TIMESTAMP
completed_at        TIMESTAMP
60. Approval Requests
Table: approval_requests
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
action_execution_id UUID
requested_by_type   TEXT
requested_by_id     UUID
status              TEXT
reason              TEXT
reviewed_by         UUID
reviewed_at         TIMESTAMP
created_at          TIMESTAMP
expires_at          TIMESTAMP
61. Automations
Table: automations
id                  UUID PRIMARY KEY
business_id         UUID NOT NULL
name                TEXT NOT NULL
description         TEXT
status              TEXT
trigger_config      JSONB
conditions_config   JSONB
actions_config      JSONB
created_by          UUID
created_at          TIMESTAMP
updated_at          TIMESTAMP
62. Automation Steps
Table: automation_steps
id                  UUID PRIMARY KEY
automation_id       UUID NOT NULL
step_order          INTEGER NOT NULL
step_type           TEXT NOT NULL
configuration       JSONB
created_at          TIMESTAMP
updated_at          TIMESTAMP
63. Automation Runs
Table: automation_runs
id                  UUID PRIMARY KEY
automation_id       UUID NOT NULL
trigger_event_id    UUID
status              TEXT
started_at          TIMESTAMP
completed_at        TIMESTAMP
error_message       TEXT
execution_context   JSONB
64. Domain Events
Table: domain_events
id                  UUID PRIMARY KEY
business_id         UUID
event_type          TEXT NOT NULL
aggregate_type      TEXT
aggregate_id        UUID
payload             JSONB NOT NULL
occurred_at         TIMESTAMP
created_at          TIMESTAMP
processed_at        TIMESTAMP
65. Event Deliveries
Table: event_deliveries
id                  UUID PRIMARY KEY
event_id            UUID NOT NULL
consumer            TEXT NOT NULL
status              TEXT
attempt_count       INTEGER
last_attempt_at     TIMESTAMP
processed_at        TIMESTAMP
error_message       TEXT
created_at          TIMESTAMP
66. Audit Logs
Table: audit_logs
id                  UUID PRIMARY KEY
business_id         UUID
actor_type          TEXT NOT NULL
actor_id            UUID
action              TEXT NOT NULL
entity_type         TEXT
entity_id           UUID
before_data         JSONB
after_data          JSONB
metadata             JSONB
request_id          TEXT
created_at          TIMESTAMP
67. Relationships

Core relationship:

users
  │
  ↓
workspace_members
  │
  ↓
workspaces
  │
  ↓
businesses

Business:

business
├── locations
├── hours
├── settings
├── preferences
├── categories
├── products
├── services
├── offers
├── customers
├── conversations
├── enquiries
├── orders
├── bookings
├── websites
├── media
├── knowledge
├── memory
├── automations
├── events
└── audit logs
68. Product Relationships
Business
 ↓
Category
 ↓
Product
 ↓
Variant
69. Order Relationships
Customer
   ↓
Order
   ↓
Order Items
   ↓
Product / Variant

Order items retain snapshots so historical orders remain accurate even if products change.

70. Booking Relationships
Customer
   ↓
Booking
   ↓
Booking Items
   ↓
Service
71. Website Relationships
Business
 ↓
Website
 ↓
Website Pages
 ↓
Website Sections

Versions are associated with websites.

72. Import Relationships
Business
 ↓
Import Job
 ├── Import Sources
 ├── Import Items
 └── Import Conflicts
73. Knowledge Relationships
Business
 ↓
Knowledge Document
 ↓
Knowledge Chunks
74. Memory Relationships
Business
 ↓
Business Memory
 ↓
Memory Events
75. AI Relationships
Business
 ↓
AI Request
 ↓
AI Output
 ↓
Action Execution
76. Automation Relationships
Business
 ↓
Automation
 ↓
Automation Steps
 ↓
Automation Runs
77. Event Relationships
Domain Event
 ↓
Event Deliveries

An event may have multiple consumers.

78. Audit Relationships

Audit logs may reference:

Business
User
AI
Action
Product
Order
Booking
Website
Memory
Automation
79. Important Indexes

Indexes should exist on common query paths.

Examples:

businesses.workspace_id
businesses.slug

products.business_id
products.category_id
products.slug
products.status

customers.business_id
customers.phone
customers.email

orders.business_id
orders.customer_id
orders.status
orders.created_at

bookings.business_id
bookings.customer_id
bookings.starts_at

enquiries.business_id
enquiries.status
enquiries.created_at

messages.conversation_id
messages.created_at

business_memories.business_id
knowledge_documents.business_id

domain_events.business_id
domain_events.event_type

audit_logs.business_id
audit_logs.created_at
80. Composite Indexes

Where queries commonly use multiple fields, use composite indexes.

Example:

products(business_id, status)

orders(business_id, created_at)

bookings(business_id, starts_at)

enquiries(business_id, status)

Exact indexes should be validated against actual query patterns.

81. Unique Constraints

Examples:

users.email

workspaces.slug

businesses(workspace_id, slug)

products(business_id, slug)

services(business_id, slug)

website_pages(website_id, slug)

website_domains.domain

orders(business_id, order_number)
82. Foreign Key Rules

Foreign keys should enforce valid relationships.

Examples:

products.business_id
→ businesses.id

orders.customer_id
→ customers.id

order_items.order_id
→ orders.id

website_pages.website_id
→ websites.id
83. Delete Rules

Do not blindly cascade delete large business datasets.

Prefer controlled deletion policies.

Example:

Deleting a category should not automatically delete products.

84. Historical Data

Historical business records should preserve important snapshots.

Examples:

Order:

product_name_snapshot
unit_price_snapshot

Booking:

service_name_snapshot
price_snapshot

This prevents historical records from changing when current catalog data changes.

85. Money Storage

Money values should use a fixed-precision numeric/decimal representation.

Avoid floating-point values for financial calculations.

Example:

DECIMAL(12,2)

Exact precision may vary by requirement.

86. Currency

Every financial record should have an explicit currency where relevant.

Example:

INR

Do not assume currency globally.

87. Timezone

Business timezone belongs to the business configuration.

Example:

Asia/Kolkata

Booking/event timestamps should be stored consistently while displayed using the business timezone.

88. JSONB Usage

JSONB is appropriate for:

flexible metadata
AI outputs
settings
theme configuration
automation configuration
integration payloads

Do not use JSONB to avoid designing obvious relational entities.

89. Vector Data

Semantic knowledge retrieval may use vector embeddings.

Possible implementation:

knowledge_chunks
    ↓
embedding

The exact vector database/extension is a technical-stack decision.

90. Sensitive Data

Avoid storing unnecessary sensitive information.

Especially:

passwords
payment credentials
private authentication secrets
unnecessary customer personal information
91. Secret Storage

Secrets should not be stored in ordinary business tables.

Use secure environment/secret storage.

92. Customer Privacy

Customer information should be scoped to the business that collected it.

93. AI Data Isolation

AI retrieval must always include business scope.

Example:

business_id = current_business

must be part of the retrieval boundary.

94. Knowledge Isolation

Knowledge search must never retrieve another business's documents.

95. Memory Isolation

Business Memory must never be shared across businesses unless an explicit future product feature permits it.

96. Public Data

Public website data should be queried through a restricted public representation.

Do not expose raw database rows directly.

97. Public Projection

Conceptually:

Private Product Record
       ↓
Public Product Projection
       ↓
Public Website

This prevents accidental exposure of internal fields such as:

cost_price
supplier information
internal notes
98. Import Data Retention

Import jobs should retain enough information for:

debugging
conflict resolution
auditability
re-import

But unnecessary raw source data should not be retained indefinitely.

99. Event Retention

Event retention policy should depend on event type.

Critical audit/business events may need longer retention.

Temporary processing events may be archived.

100. Audit Retention

Audit logs should be treated as important operational records.

Do not casually delete them.

101. Status Fields

Status fields should use controlled values.

Avoid arbitrary strings throughout the application.

The backend should validate status transitions.

102. State Transitions

Example:

Order

pending
  ↓
confirmed
  ↓
processing
  ↓
completed

Invalid transitions should be rejected.

103. Optimistic Concurrency

For frequently edited resources, consider version fields.

Example:

version INTEGER

This can help prevent one user overwriting another user's changes.

104. Website Concurrency

Website drafts should support safe concurrent editing in future.

For v0.1, basic last-write protection may be sufficient.

105. Idempotency

Important operations should support idempotency keys where duplicate requests are possible.

Especially:

payments
order creation
external webhooks
automation actions
message sending
106. External IDs

Integration records should retain external provider IDs.

Example:

provider
external_id

This allows synchronization and deduplication.

107. Integration Credentials

Integration credentials should not be stored as plain text.

Use encrypted/secure storage where necessary.

108. Database Transactions

Use transactions for multi-step operations requiring consistency.

Example:

Create Order
+
Create Order Items
+
Reserve Inventory
+
Create Payment Record
109. Background Processing

Long-running database operations should not block HTTP requests.

Examples:

bulk import
bulk product creation
large media processing
analytics processing
110. Database Migration Strategy

All schema changes must be version-controlled through migrations.

Example:

001_initial_schema
002_add_business_memory
003_add_import_conflicts
111. Migration Rules

Never rely on manually changing the production database.

Every schema change should be reproducible.

112. Seed Data

Development seed data should include at least one example business.

Example:

Royal Bakes

with:

categories
products
customers
enquiries
website
business memory
113. Test Data Isolation

Test data must never accidentally point to production resources.

114. Backup Strategy

The database must eventually have:

automated backups
restore testing
retention policy

Exact infrastructure belongs in DEPLOYMENT.md.

115. Recovery

Critical data recovery should be possible without relying on AI or application UI.

116. Database Performance Principles

Start with:

correct schema
correct indexes
appropriate queries
transaction boundaries
monitoring

Do not prematurely optimize.

117. Avoid N+1 Queries

API endpoints retrieving related entities should avoid unnecessary database query multiplication.

118. Pagination

Large collections must support pagination.

Examples:

products
customers
orders
messages
audit logs
events
119. Sorting

APIs should support controlled sorting where useful.

Example:

created_at
updated_at
name
price
120. Filtering

Collection APIs should support validated filters.

Example:

products?status=active
orders?status=pending
enquiries?status=new
121. Search

Use database/full-text search for structured business entities where appropriate.

Semantic search belongs to the knowledge layer.

122. Database Source of Truth Rules

The following are authoritative database records:

Business
Product
Service
Offer
Customer
Order
Booking
Website Draft
Published Website Version
Business Memory
Knowledge Source
Automation
Audit Record
123. Derived Data

Some information can be derived:

Analytics
Conversion Rates
Customer Segments
Business Score
AI Recommendations

Derived values should not replace source-of-truth records.

124. AI Recommendations

AI recommendations should be stored separately from core business facts when persistence is required.

Example:

Recommendation:
"Create a weekday combo."

is not a business rule until approved.

125. AI Memory

AI-generated memory should have provenance.

Store:

source
confidence
created_at

and approval state where necessary.

126. Approval State

Potential memory states:

suggested
approved
active
rejected
archived
127. Data Ownership

Every resource should have a clear owner.

Primary pattern:

business_id

For user-owned resources:

created_by
updated_by

where useful.

128. Auditability

Important mutations should identify:

Who
What
When
Before
After
Why / Source
129. AI Auditability

AI mutations should additionally identify:

Model
AI Request
Action
Approval
130. Business Import Auditability

Imported records should retain source information.

Example:

Product
Source:
PDF menu
Page 3
Confidence:
0.94
131. Knowledge Provenance

Knowledge documents should retain:

source_type
source_reference
source_hash
last_synced_at
132. Synchronization

If an imported source is re-imported:

Existing Data
+
New Source
↓
Compare
↓
Detect Changes
↓
Generate Conflicts
↓
Owner Review
↓
Apply
133. Conflict Safety

Never silently overwrite important business data based solely on an import.

134. Business Memory Safety

Memory should not automatically override explicit current business data.

Example:

Memory:

"We never discount premium products."

Current owner action:

Create premium product coupon.

The application should recognize the potential conflict rather than blindly blocking or blindly executing.

135. Data Precedence

When conflicting information exists, the system should have a defined precedence model.

Initial conceptual order:

Explicit Current Business Data
        ↓
Approved Business Rules
        ↓
Approved Business Memory
        ↓
Imported Data
        ↓
AI Inference

This precedence must be validated against the detailed product specifications before implementation.

136. Database Security

Use least-privilege database access.

The application should not use a database account with unnecessary administrative privileges.

137. Row-Level Isolation

If database-level row security is used, it should reinforce application authorization rather than replace proper application security.

138. Public Read Access

Public websites should access only explicitly public business data.

139. Database Observability

Monitor:

query latency
connection usage
errors
locks
slow queries
storage
backup status
140. Connection Management

Use a controlled connection pool.

Do not create unlimited database connections per request.

141. v0.1 Required Tables

Minimum initial implementation:

users
workspaces
workspace_members
businesses
business_locations
business_hours

categories
products
services
offers

websites
website_pages
website_sections
website_versions

media_assets

import_jobs
import_sources
import_items
import_conflicts

customers
customer_consents

conversations
messages
enquiries

business_memories
memory_events

knowledge_documents
knowledge_chunks

ai_requests
ai_outputs
ai_usage

action_definitions
action_executions
approval_requests

automations
automation_steps
automation_runs

domain_events
event_deliveries

audit_logs
142. v0.1 Optional Tables

Depending on MVP scope:

product_variants
orders
order_items
bookings
booking_items
payments
payment_events
customer_preferences
website_domains

These should only be implemented if their corresponding v0.1 feature is actually enabled.

143. Future Tables

Potential future domains:

loyalty_accounts
loyalty_transactions
memberships
referrals
campaigns
segments
inventory_movements
suppliers
purchase_orders
expenses
staff
staff_schedules
delivery_orders
marketplace_listings
plugins
developer_apps
agent_definitions
agent_runs
benchmark_metrics

These are not required for the initial schema.

144. Schema Evolution

The database should evolve incrementally.

Do not create hundreds of tables simply because the product roadmap contains future features.

145. Architecture Rule

A documented future feature does not automatically require a v0.1 database table.

Only implement data structures required by the current release.

146. Database Diagram

High-level:

                    USERS
                      │
                      ↓
                WORKSPACES
                      │
                      ↓
                  BUSINESSES
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
     CATALOG       WEBSITE       CUSTOMERS
        │             │             │
        ↓             ↓             ↓
   PRODUCTS        PAGES       CONVERSATIONS
   SERVICES       SECTIONS      ENQUIRIES
   OFFERS         VERSIONS
        │                           │
        └────────────┬──────────────┘
                     ↓
                  ORDERS
                     │
                     ↓
                ORDER ITEMS


BUSINESS
   │
   ├── IMPORT
   │     ├── JOBS
   │     ├── SOURCES
   │     ├── ITEMS
   │     └── CONFLICTS
   │
   ├── KNOWLEDGE
   │     ├── DOCUMENTS
   │     └── CHUNKS
   │
   ├── MEMORY
   │     └── MEMORIES
   │
   ├── AI
   │     ├── REQUESTS
   │     └── OUTPUTS
   │
   ├── ACTIONS
   │     ├── DEFINITIONS
   │     ├── EXECUTIONS
   │     └── APPROVALS
   │
   ├── AUTOMATIONS
   │     ├── DEFINITIONS
   │     └── RUNS
   │
   ├── EVENTS
   │     └── DELIVERIES
   │
   └── AUDIT
         └── LOGS
147. Implementation Order

Database implementation should follow dependency order.

Phase 1 — Identity
users
workspaces
workspace_members
Phase 2 — Business
businesses
business_locations
business_hours
business_settings
Phase 3 — Catalog
categories
products
services
offers
Phase 4 — Website
websites
website_pages
website_sections
website_versions
Phase 5 — Media
media_assets
media_links
Phase 6 — Import
import_jobs
import_sources
import_items
import_conflicts
Phase 7 — Customer Communication
customers
conversations
messages
enquiries
customer_consents
Phase 8 — AI Foundation
knowledge_documents
knowledge_chunks
business_memories
memory_events
ai_requests
ai_outputs
ai_usage
Phase 9 — Actions
action_definitions
action_executions
approval_requests
Phase 10 — Automations
automations
automation_steps
automation_runs
Phase 11 — Events
domain_events
event_deliveries
Phase 12 — Audit
audit_logs
148. v0.1 Database Rule

The database must support the core wedge:

Import
 ↓
Structure
 ↓
Publish
 ↓
QR
 ↓
WhatsApp
 ↓
Updates
 ↓
Approvals

It must not be bloated with future ERP/marketplace functionality.

149. Final Database Principle

FrontDesk's database should represent the business itself, not merely the website that represents the business.

Website = Surface

Business Data = Source of Truth
