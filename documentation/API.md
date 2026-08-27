Next document: API.md.

This is one of the most important documents before implementation because it defines the contract between FrontDesk frontend, backend, AI services, and external integrations.

Create:

C:\Users\Administrator\Documents\FrontDesk\documentation\API.md

Use this content:

# FrontDesk — API Specification

**Product:** FrontDesk  
**Version:** v0.1  
**Document:** API Specification  
**Status:** Draft — For Review  
**Last Updated:** 2026-08-26

---

# 1. Purpose

This document defines the API contract for FrontDesk v0.1.

The API connects:

```text
Frontend
   ↓
FrontDesk API
   ↓
Business Logic
   ↓
Database / AI / External Services

The API is responsible for:

authentication
authorization
business management
catalog management
business importing
website management
customer management
enquiries
conversations
QR generation
knowledge management
business memory
AI operations
actions
approvals
audit history
analytics
2. API Architecture

FrontDesk v0.1 uses:

REST API
JSON
HTTPS
API Versioning
OpenAPI

Base URL:

/api/v1

Example:

GET /api/v1/businesses
3. API Principles

The API must be:

predictable
versioned
authenticated where required
tenant-safe
validated
observable
idempotent where appropriate
backward-compatible within a version
4. API Versioning

All API routes use:

/api/v1

Example:

/api/v1/businesses
/api/v1/products
/api/v1/enquiries

A breaking API change requires a new version.

Example:

/api/v2
5. Content Type

Requests containing structured data use:

Content-Type: application/json

Responses:

Content-Type: application/json

File uploads may use:

multipart/form-data
6. Authentication

Protected endpoints require authentication.

Conceptual request:

Authorization: Bearer <access_token>

The authentication implementation may use Supabase Auth or another approved authentication provider.

The backend must validate the token.

7. Authorization

Authentication alone is insufficient.

Every protected request must verify:

User
 ↓
Workspace
 ↓
Business
 ↓
Resource

Example:

A user authenticated to Workspace A must not access:

Business belonging to Workspace B
8. Tenant Isolation

Every business-owned resource must be scoped to its business/workspace.

Example:

GET /api/v1/businesses/:businessId/products

The backend must verify that the authenticated user has access to:

businessId

before returning data.

9. Standard Success Response

Recommended response:

{
  "success": true,
  "data": {},
  "meta": {}
}

Example:

{
  "success": true,
  "data": {
    "id": "prod_123",
    "name": "Chocolate Truffle Cake",
    "price": 650
  },
  "meta": {}
}
10. Collection Response

For lists:

{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 125
  }
}
11. Error Response

Standard error:

{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  }
}
12. Validation Error

Example:

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "price",
        "message": "Price must be greater than or equal to 0"
      }
    ]
  }
}
13. HTTP Status Codes

Use standard HTTP status codes.

Status	Meaning
200	Successful request
201	Resource created
202	Accepted for asynchronous processing
204	Successful request with no response body
400	Invalid request
401	Authentication required/invalid
403	Insufficient permission
404	Resource not found
409	Conflict
422	Validation/business-rule failure
429	Rate limit exceeded
500	Internal server error
503	Service temporarily unavailable
14. API Naming

Use plural nouns.

Correct:

/products
/customers
/businesses
/enquiries

Avoid:

/getProducts
/createCustomer
/deleteBusiness

HTTP methods express the operation.

15. Common HTTP Methods
GET
POST
PATCH
DELETE

Use:

POST

for creating resources.

Use:

PATCH

for partial updates.

Use:

DELETE

for deletion/archive operations where appropriate.

16. Resource IDs

Use stable opaque identifiers.

Example:

biz_01J...
prod_01J...
cust_01J...

The exact ID technology will be finalized during database implementation.

Do not expose sequential database IDs if that creates security or enumeration concerns.

17. Pagination

Collection endpoints should support pagination.

Example:

GET /api/v1/products?page=1&pageSize=20

Recommended defaults:

page = 1
pageSize = 20

Maximum page size should be enforced.

18. Sorting

Where appropriate:

?sortBy=createdAt
&sortOrder=desc

Example:

GET /api/v1/products?sortBy=createdAt&sortOrder=desc
19. Filtering

Example:

GET /api/v1/products?status=active&categoryId=cat_123

Filtering rules should be defined per resource.

20. Search

Example:

GET /api/v1/products?search=chocolate

Search behavior should be documented per endpoint.

21. Authentication Endpoints

The authentication provider may handle core authentication.

FrontDesk-specific endpoints may include:

GET /api/v1/auth/me

Returns the authenticated user's application profile.

Example:

{
  "success": true,
  "data": {
    "id": "usr_123",
    "email": "owner@example.com"
  }
}
22. Workspace Endpoints
GET    /api/v1/workspaces
POST   /api/v1/workspaces
GET    /api/v1/workspaces/:workspaceId
PATCH  /api/v1/workspaces/:workspaceId
23. Workspace Members
GET    /api/v1/workspaces/:workspaceId/members
POST   /api/v1/workspaces/:workspaceId/members
PATCH  /api/v1/workspaces/:workspaceId/members/:memberId
DELETE /api/v1/workspaces/:workspaceId/members/:memberId

Permission checks are mandatory.

24. Business Endpoints
GET    /api/v1/businesses
POST   /api/v1/businesses
GET    /api/v1/businesses/:businessId
PATCH  /api/v1/businesses/:businessId
DELETE /api/v1/businesses/:businessId
25. Business Profile
GET   /api/v1/businesses/:businessId/profile
PATCH /api/v1/businesses/:businessId/profile

Potential data:

name
description
category
phone
email
address
location
openingHours
socialLinks
logo
26. Business Settings
GET   /api/v1/businesses/:businessId/settings
PATCH /api/v1/businesses/:businessId/settings
27. Business Import

The importer is one of FrontDesk's primary v0.1 features.

Create import:

POST /api/v1/businesses/:businessId/imports

Possible input types:

website
pdf
csv
image
manual
28. Website Import

Example:

{
  "sourceType": "website",
  "url": "https://example.com"
}

Endpoint:

POST /api/v1/businesses/:businessId/imports

The API should return an import job.

29. Import Job Response

Because imports may take time:

{
  "success": true,
  "data": {
    "importId": "imp_123",
    "status": "processing"
  }
}

Use:

202 Accepted

where appropriate.

30. Import Status
GET /api/v1/businesses/:businessId/imports/:importId

Example:

{
  "success": true,
  "data": {
    "id": "imp_123",
    "status": "completed",
    "sourceType": "website"
  }
}

Possible statuses:

pending
processing
review_required
completed
failed
cancelled
31. Import Preview

Before applying extracted information:

GET /api/v1/businesses/:businessId/imports/:importId/preview

The preview may contain:

business information
products
categories
services
opening hours
images
contact information
potential conflicts
32. Import Confirmation

After review:

POST /api/v1/businesses/:businessId/imports/:importId/confirm

The backend validates the proposed import before applying it.

33. Import Conflicts

Example:

{
  "type": "PRICE_CONFLICT",
  "existing": 600,
  "imported": 650
}

The frontend should allow the user to choose:

Keep existing
Use imported
Edit manually
Ignore
34. Catalog Endpoints

Products:

GET    /api/v1/businesses/:businessId/products
POST   /api/v1/businesses/:businessId/products
GET    /api/v1/businesses/:businessId/products/:productId
PATCH  /api/v1/businesses/:businessId/products/:productId
DELETE /api/v1/businesses/:businessId/products/:productId
35. Product Creation

Example:

{
  "name": "Chocolate Truffle Cake",
  "description": "Rich chocolate cake",
  "price": 650,
  "currency": "INR",
  "available": true,
  "categoryId": "cat_123"
}
36. Product Update

Example:

{
  "price": 700,
  "available": false
}

Only supplied fields should be modified.

37. Product Categories
GET    /api/v1/businesses/:businessId/categories
POST   /api/v1/businesses/:businessId/categories
PATCH  /api/v1/businesses/:businessId/categories/:categoryId
DELETE /api/v1/businesses/:businessId/categories/:categoryId
38. Product Availability

The API should support changing availability without deleting the product.

Example:

PATCH /api/v1/businesses/:businessId/products/:productId
{
  "available": false
}
39. Website Configuration
GET  /api/v1/businesses/:businessId/website
PATCH /api/v1/businesses/:businessId/website

Website configuration may include:

theme
pages
sections
navigation
SEO
contact information
40. Website Preview
GET /api/v1/businesses/:businessId/website/preview

Preview should represent unpublished changes.

41. Website Versions
GET /api/v1/businesses/:businessId/website/versions
GET /api/v1/businesses/:businessId/website/versions/:versionId
POST /api/v1/businesses/:businessId/website/versions/:versionId/restore
42. Website Publishing
POST /api/v1/businesses/:businessId/website/publish

Example response:

{
  "success": true,
  "data": {
    "versionId": "ver_123",
    "publishedAt": "2026-08-26T10:00:00Z"
  }
}
43. Website Rollback
POST /api/v1/businesses/:businessId/website/versions/:versionId/restore

A restore operation should create an auditable event.

44. QR Endpoints
GET  /api/v1/businesses/:businessId/qr
POST /api/v1/businesses/:businessId/qr
PATCH /api/v1/businesses/:businessId/qr/:qrId
DELETE /api/v1/businesses/:businessId/qr/:qrId
45. QR Destination

A QR code may point to:

business website
menu
product
offer
ordering page
contact page
46. QR Analytics

Where enabled:

GET /api/v1/businesses/:businessId/qr/:qrId/analytics

Potential metrics:

scans
unique visitors
date/time
destination

Avoid collecting unnecessary personal information.

47. Customers
GET    /api/v1/businesses/:businessId/customers
POST   /api/v1/businesses/:businessId/customers
GET    /api/v1/businesses/:businessId/customers/:customerId
PATCH  /api/v1/businesses/:businessId/customers/:customerId
DELETE /api/v1/businesses/:businessId/customers/:customerId
48. Customer Consent
GET   /api/v1/businesses/:businessId/customers/:customerId/consents
POST  /api/v1/businesses/:businessId/customers/:customerId/consents
PATCH /api/v1/businesses/:businessId/customers/:customerId/consents/:consentId

Consent requirements must follow the privacy/security specification.

49. Enquiries
GET   /api/v1/businesses/:businessId/enquiries
POST  /api/v1/businesses/:businessId/enquiries
GET   /api/v1/businesses/:businessId/enquiries/:enquiryId
PATCH /api/v1/businesses/:businessId/enquiries/:enquiryId
50. Enquiry Status

Possible statuses:

new
contacted
in_progress
quotation_sent
won
lost
closed
51. Conversations
GET /api/v1/businesses/:businessId/conversations
GET /api/v1/businesses/:businessId/conversations/:conversationId
GET /api/v1/businesses/:businessId/conversations/:conversationId/messages
POST /api/v1/businesses/:businessId/conversations/:conversationId/messages
52. Message Channels

Potential channels:

website
whatsapp
email
manual

The exact integrations depend on the v0.1 implementation.

53. Knowledge Base

Business knowledge:

GET    /api/v1/businesses/:businessId/knowledge
POST   /api/v1/businesses/:businessId/knowledge
GET    /api/v1/businesses/:businessId/knowledge/:knowledgeId
PATCH  /api/v1/businesses/:businessId/knowledge/:knowledgeId
DELETE /api/v1/businesses/:businessId/knowledge/:knowledgeId
54. Knowledge Sources

Knowledge may originate from:

business profile
catalog
website
uploaded document
import
manual entry
business memory
55. Business Memory

Business Memory endpoints:

GET    /api/v1/businesses/:businessId/memory
POST   /api/v1/businesses/:businessId/memory
PATCH  /api/v1/businesses/:businessId/memory/:memoryId
DELETE /api/v1/businesses/:businessId/memory/:memoryId
56. Memory Example
{
  "content": "Always use Tamil + English in customer-facing messages.",
  "category": "communication_preference",
  "importance": "high"
}
57. AI Query

General business AI endpoint:

POST /api/v1/businesses/:businessId/ai/chat

Example:

{
  "message": "What are today's important business tasks?"
}
58. AI Response

Example:

{
  "success": true,
  "data": {
    "message": "You have 3 important things to review today.",
    "sources": [],
    "actions": []
  }
}
59. AI Must Not Be the Source of Truth

AI responses must be generated from authoritative business data.

For example:

Product price

must come from the catalog/database.

The AI should not invent the price.

60. Structured AI Actions

When AI proposes a mutation:

{
  "action": {
    "type": "UPDATE_PRODUCT",
    "targetId": "prod_123",
    "payload": {
      "price": 700
    }
  }
}

The backend must validate it.

61. Action Execution

Actions should use:

POST /api/v1/businesses/:businessId/actions/execute

Example:

{
  "actionType": "UPDATE_PRODUCT",
  "targetId": "prod_123",
  "payload": {
    "price": 700
  }
}

This endpoint is primarily an internal application boundary and must have strict authorization.

62. AI Action Proposal

AI may instead create an approval request:

POST /api/v1/businesses/:businessId/approvals

Example:

{
  "actionType": "UPDATE_PRODUCT",
  "targetId": "prod_123",
  "payload": {
    "price": 700
  },
  "reason": "Demand has increased."
}
63. Approval Endpoints
GET   /api/v1/businesses/:businessId/approvals
GET   /api/v1/businesses/:businessId/approvals/:approvalId
POST  /api/v1/businesses/:businessId/approvals/:approvalId/approve
POST  /api/v1/businesses/:businessId/approvals/:approvalId/reject
64. Approval Rules

High-impact actions may require approval.

Examples:

price changes
deletions
publishing
customer campaigns
refunds
large data changes

The exact policy belongs in SECURITY.md and ACTION-REGISTRY.md.

65. AI Copilot

The AI Copilot may expose:

POST /api/v1/businesses/:businessId/copilot/query

Example:

{
  "message": "What should I do today?"
}

The Copilot may analyze:

catalog
enquiries
activity
website
business memory
business knowledge
66. Copilot Recommendations

Example:

{
  "success": true,
  "data": {
    "recommendations": [
      {
        "type": "OUT_OF_STOCK",
        "priority": "high",
        "message": "Your most viewed cake is unavailable.",
        "actionAvailable": true
      }
    ]
  }
}
67. Audit Logs
GET /api/v1/businesses/:businessId/audit-logs
GET /api/v1/businesses/:businessId/audit-logs/:auditId

Audit records should include:

who
what
when
target
source
reason
result
68. AI Audit Records

AI-generated changes should explicitly identify AI as the actor.

Example:

{
  "actorType": "ai",
  "action": "UPDATE_PRODUCT",
  "targetId": "prod_123"
}
69. Analytics

Basic business activity:

GET /api/v1/businesses/:businessId/analytics/overview

Possible metrics:

website views
QR scans
product views
enquiries
responses
70. Events

Internal analytics events may include:

website_viewed
product_viewed
qr_scanned
enquiry_created
enquiry_replied
product_updated
website_published
import_completed
71. Public API

Public business data may eventually be exposed through controlled public endpoints.

Example:

GET /api/v1/public/businesses/:businessSlug
GET /api/v1/public/businesses/:businessSlug/products

Public endpoints must return only intentionally public information.

72. Public Business Endpoint

Example:

GET /api/v1/public/businesses/royal-bakes

Potential response:

{
  "success": true,
  "data": {
    "name": "Royal Bakes",
    "description": "...",
    "location": {},
    "openingHours": {},
    "website": {}
  }
}
73. Public Catalog Endpoint
GET /api/v1/public/businesses/:businessSlug/products

Only published/active products should be returned.

74. Public Security

Public APIs must not expose:

private customer data
internal business memory
private analytics
audit logs
internal IDs where unnecessary
private pricing rules
AI prompts
provider credentials
75. File Upload API

Generic uploads:

POST /api/v1/businesses/:businessId/media

Supported categories may include:

image
pdf
document
logo
product_image
menu
76. Upload Flow

Prefer:

Request upload
 ↓
Receive upload URL
 ↓
Upload file
 ↓
Confirm upload
 ↓
Process asynchronously

This avoids sending large files through the main API unnecessarily.

77. Media Processing

Uploaded media may trigger:

image optimization
OCR
metadata extraction
AI classification
knowledge ingestion

These should preferably run asynchronously.

78. Asynchronous Jobs

Long-running operations should return a job identifier.

Example:

{
  "success": true,
  "data": {
    "jobId": "job_123",
    "status": "processing"
  }
}
79. Job Status
GET /api/v1/jobs/:jobId

Possible statuses:

queued
processing
completed
failed
cancelled
80. Idempotency

Operations that could accidentally execute twice should support idempotency.

Example:

Idempotency-Key: 8b2f...

Especially important for:

payments
orders
messages
external API operations
automation actions
81. Rate Limits

Rate limiting should protect:

authentication
AI requests
imports
public APIs
message sending
file uploads

Initial limits should be configurable.

82. AI Rate Limits

AI endpoints may have separate limits because they are computationally expensive.

Example conceptual policy:

Normal API
higher limit

AI API
lower limit

Exact production values will be decided after testing.

83. Request IDs

Every API request should receive a request ID.

Example:

X-Request-ID: req_123

The ID should appear in logs.

84. Logging

Never log:

passwords
access tokens
API keys
payment secrets
private customer information unnecessarily
85. API Security

All production APIs must use HTTPS.

The backend must validate:

authentication
authorization
input
content type
file type
file size
rate limits
86. CORS

CORS should be explicitly configured.

Do not use:

Access-Control-Allow-Origin: *

for authenticated production APIs unless there is a documented reason.

87. CSRF

CSRF protections must be applied according to the authentication mechanism.

Do not assume bearer tokens and cookie authentication have identical requirements.

88. API Documentation

The API should eventually generate an OpenAPI specification.

Recommended location:

documentation/openapi.yaml

or:

backend/openapi.yaml

The final location will be decided during implementation.

89. OpenAPI

The OpenAPI specification should describe:

paths
parameters
request bodies
responses
authentication
errors
schemas
90. API Schema Ownership

API request/response schemas should remain synchronized with implementation.

Changes to:

API.md
OpenAPI
Backend schemas
Frontend types

should be treated as one API contract change.

91. Frontend API Client

The frontend should not scatter raw fetch() calls throughout components.

Prefer:

Component
 ↓
Feature API function
 ↓
API client
 ↓
Backend
92. Example Frontend Call

Instead of:

fetch("/api/v1/products")

inside a React component:

getProducts(businessId)

should be used.

93. Backend API Layers

Expected flow:

HTTP Request
 ↓
Route
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Database

For external services:

Service
 ↓
Internal Provider Interface
 ↓
Infrastructure Adapter
 ↓
External Service
94. AI API Flow
Frontend
 ↓
AI Endpoint
 ↓
AI Service
 ↓
Business Context
 ↓
Knowledge Retrieval
 ↓
Business Memory
 ↓
AI Provider
 ↓
Structured Response
 ↓
Frontend
95. AI Mutation Flow
User Request
 ↓
AI
 ↓
Action Proposal
 ↓
Schema Validation
 ↓
Permission Check
 ↓
Approval Check
 ↓
Action Executor
 ↓
Database
 ↓
Audit Log
96. Import API Flow
Upload / URL
 ↓
Import API
 ↓
Import Job
 ↓
Extractor
 ↓
Normalizer
 ↓
Validator
 ↓
Conflict Detection
 ↓
Preview
 ↓
User Confirmation
 ↓
Database
 ↓
Knowledge Base
97. Public Website Flow
Browser
 ↓
Next.js
 ↓
Public Business API
 ↓
Published Website Version
 ↓
Renderer
 ↓
Business Website
98. API Transaction Rule

Operations that modify multiple related records should use database transactions where required.

Example:

Confirm Import

may modify:

business
categories
products
knowledge
website

These operations should be designed carefully for consistency.

99. Soft Delete

Where business history matters, prefer archiving/soft deletion instead of permanently deleting data immediately.

Examples:

products
customers
enquiries
website versions

Permanent deletion must follow explicit data-retention rules.

100. API Compatibility

Within v1:

avoid breaking response changes
avoid renaming fields unnecessarily
add optional fields instead of removing fields
document deprecated fields
maintain backward compatibility where practical
101. API Testing

Every major endpoint should have:

happy-path test
validation test
authorization test
not-found test
business-rule test

Sensitive endpoints should also have security tests.

102. Example Complete Request

Create product:

POST /api/v1/businesses/biz_123/products
Authorization: Bearer <token>
Content-Type: application/json

Body:

{
  "name": "Cappuccino",
  "price": 120,
  "currency": "INR",
  "available": true
}

Response:

201 Created
{
  "success": true,
  "data": {
    "id": "prod_123",
    "name": "Cappuccino",
    "price": 120,
    "currency": "INR",
    "available": true
  },
  "meta": {}
}
103. Example Update Request
PATCH /api/v1/businesses/biz_123/products/prod_123
Authorization: Bearer <token>
Content-Type: application/json

Body:

{
  "price": 130
}
104. Example Authorization Failure
403 Forbidden
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSION",
    "message": "You do not have permission to perform this action."
  }
}
105. Example Not Found
404 Not Found
{
  "success": false,
  "error": {
    "code": "BUSINESS_NOT_FOUND",
    "message": "Business not found."
  }
}
106. Example AI Request
POST /api/v1/businesses/biz_123/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

Body:

{
  "message": "Which products should I promote this weekend?"
}
107. Example AI Response
{
  "success": true,
  "data": {
    "message": "Your chocolate truffle cake has high views but lower conversion than your other cakes.",
    "recommendations": [
      {
        "type": "PROMOTION",
        "targetId": "prod_123",
        "reason": "High product interest with lower conversion."
      }
    ]
  }
}

The AI must clearly distinguish:

observed fact
recommendation
assumption
108. API and Business Truth

The API is the authoritative application interface.

The AI is not authoritative.

The frontend is not authoritative.

Business data stored in the backend/database is the source of truth.

109. v0.1 API Priority
P0 — Required
Authentication
Businesses
Catalog
Importer
Website
QR
Enquiries
Conversations
Media
Knowledge Base
Business Memory
Basic AI
Approvals
Audit
P1 — After core MVP validation
Customers
Analytics
Automations
Advanced AI Copilot
P2 — Future
Orders
Payments
Inventory
Loyalty
CRM
AI Agents
Marketplace
Developer API
AI-to-AI communication

The exact scope remains governed by PRD.md and PRODUCT-ROADMAP.md.

110. API Design Principle

The API should expose business capabilities, not database tables.

Bad:

POST /database-record

Good:

POST /businesses/:businessId/products
111. Final Architecture
                    FRONTEND
                       │
                       │ REST/JSON
                       ↓
                ┌──────────────┐
                │  API v1      │
                └──────┬───────┘
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       Business       AI         Import
       Modules       Module       Module
          │            │            │
          └────────────┼────────────┘
                       ↓
                 Service Layer
                       │
             ┌─────────┴─────────┐
             ↓                   ↓
        PostgreSQL          Integrations
             │                   │
             │              ┌────┼────┐
             │              ↓    ↓    ↓
             │             AI  WhatsApp
             │                  Storage
             ↓
          Audit/Event
112. Final Rules
All protected resources require authorization.
All business data must be tenant-isolated.
AI must never directly access the database for mutations.
AI mutations must use structured actions.
High-impact AI actions require approval.
Important mutations must create audit records.
Long-running operations should use asynchronous jobs.
External providers must be abstracted.
API contracts must be documented.
Breaking changes require a new API version.