# FrontDesk — System Architecture

**Product:** FrontDesk  
**Version:** v0.1  
**Document:** System Architecture  
**Status:** Draft — For Review  
**Last Updated:** 2026-08-26

---

# 1. Purpose

This document defines the technical architecture of FrontDesk v0.1.

It describes:

- major system components
- frontend architecture
- backend architecture
- database architecture
- business domain architecture
- AI architecture
- Business Knowledge architecture
- Business Memory architecture
- Action Registry
- Event system
- automation system
- authentication
- file/media handling
- public website delivery
- external integrations
- security boundaries
- data flow
- deployment boundaries
- scalability considerations

This document describes **how FrontDesk is built**, while the PRD and feature specifications describe **what FrontDesk does**.

---

# 2. Architectural Vision

FrontDesk is not fundamentally a website builder.

The long-term architecture is:

> **Business Data → Business Knowledge → Business Operations → AI → Actions → Automations**

The website is one of several surfaces consuming the same business data.

Conceptually:

```text
                    FRONTDESK
                        │
        ┌───────────────┼────────────────┐
        ↓               ↓                ↓
     Website          QR            WhatsApp
        │               │                │
        └───────────────┼────────────────┘
                        ↓
               BUSINESS PLATFORM
                        │
        ┌───────────────┼────────────────┐
        ↓               ↓                ↓
 Business Data    Business Memory   Business Knowledge
        │               │                │
        └───────────────┼────────────────┘
                        ↓
                   AI PLATFORM
                        │
        ┌───────────────┼────────────────┐
        ↓               ↓                ↓
    Copilot          AI Agents        AI Tools
        │               │                │
        └───────────────┼────────────────┘
                        ↓
                 ACTION REGISTRY
                        │
                        ↓
                   EVENTS
                        │
                        ↓
                  AUTOMATIONS
                        │
                        ↓
              EXTERNAL INTEGRATIONS
3. Core Architectural Principles
3.1 Business Data First

Business information must be represented as structured data.

Do not make the website the source of truth.

3.2 Single Source of Truth

A business should not maintain separate copies of:

products
prices
services
opening hours
offers
business information

for every surface.

Instead:

Business Data
     ↓
Website
QR
WhatsApp
AI
SEO
Marketing
Analytics
4. Separation of Concerns

FrontDesk should separate:

Presentation
↓
API
↓
Domain Logic
↓
Data

AI should not bypass these layers.

5. High-Level Architecture
┌─────────────────────────────────────────────┐
│                 CLIENT LAYER                │
│                                             │
│  Owner Dashboard                            │
│  Website Builder                            │
│  Public Business Website                    │
│  QR Experience                              │
│  Mobile/PWA Experience                      │
└─────────────────────┬───────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────┐
│                 API LAYER                   │
│                                             │
│ REST API                                    │
│ Authentication                              │
│ Authorization                               │
│ Validation                                  │
│ Rate Limiting                               │
└─────────────────────┬───────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────┐
│              APPLICATION LAYER              │
│                                             │
│ Business Management                         │
│ Catalog                                     │
│ Orders                                      │
│ Bookings                                    │
│ Enquiries                                   │
│ Customers                                   │
│ Publishing                                  │
│ Media                                       │
│ Notifications                               │
└─────────────────────┬───────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────┐
│               DOMAIN LAYER                  │
│                                             │
│ Business                                   │
│ Products                                    │
│ Services                                    │
│ Customers                                   │
│ Orders                                      │
│ Bookings                                    │
│ Offers                                      │
│ Policies                                    │
│ Business Rules                              │
└─────────────────────┬───────────────────────┘
                      │
          ┌───────────┼────────────┐
          ↓           ↓            ↓
      Knowledge     Memory       Events
          │           │            │
          └───────────┼────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│                 AI LAYER                    │
│                                             │
│ AI Gateway                                  │
│ Retrieval                                   │
│ Prompt Management                           │
│ Copilot                                     │
│ Agents                                      │
│ AI Generation                               │
└─────────────────────┬───────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────┐
│              ACTION LAYER                   │
│                                             │
│ Action Registry                             │
│ Permission Checks                           │
│ Approval Checks                             │
│ Action Execution                            │
└─────────────────────┬───────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────┐
│              EVENT LAYER                    │
│                                             │
│ Domain Events                               │
│ Automation Triggers                         │
│ Notifications                               │
│ Analytics                                   │
└─────────────────────┬───────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────┐
│          INFRASTRUCTURE LAYER               │
│                                             │
│ PostgreSQL                                  │
│ Object Storage                              │
│ Cache                                       │
│ Queue / Background Jobs                     │
│ External APIs                               │
└─────────────────────────────────────────────┘
6. v0.1 Architecture Philosophy

FrontDesk v0.1 should prioritize:

low cost
simplicity
maintainability
clear boundaries
easy local development
easy deployment
free/open-source services where practical
ability to replace infrastructure later

Do not prematurely build a distributed microservice architecture.

7. Recommended v0.1 Architecture

Use a:

Modular Monolith + Separate Frontend

architecture.

Frontend
   │
   ↓
Backend API
   │
   ├── Business Module
   ├── Catalog Module
   ├── Import Module
   ├── Website Module
   ├── Enquiry Module
   ├── Customer Module
   ├── AI Module
   ├── Memory Module
   ├── Automation Module
   └── Notification Module
          │
          ↓
       PostgreSQL
8. Why Modular Monolith

For v0.1, microservices would introduce unnecessary complexity.

Avoid initially having:

Product Service
Customer Service
AI Service
Order Service
Memory Service
Automation Service
Notification Service

as independently deployed services.

Instead:

One Backend
│
├── Business Module
├── Product Module
├── AI Module
├── Memory Module
└── Automation Module

with strong internal boundaries.

9. Future Migration

If FrontDesk grows significantly, individual modules can later become services.

Example:

v0.1

Backend
├── AI
├── Automation
└── Business

↓

Future

AI Service
Automation Service
Business Service
Notification Service

The v0.1 architecture should therefore use clean module boundaries.

10. Repository Structure

Current project structure:

FrontDesk/
├── frontend/
├── backend/
└── documentation/

This structure should remain simple initially.

11. Frontend

The frontend contains:

owner dashboard
website builder
business settings
product management
enquiry inbox
customer management
analytics
AI Copilot
memory management
automation management
publishing controls
12. Public Website

The public business website is a separate frontend experience but consumes the same backend/business data.

Conceptually:

Owner Dashboard
       │
       ↓
Backend API
       │
       ↓
Business Data
       │
       ↓
Public Website
13. Frontend Application Areas
frontend/
├── dashboard
├── builder
├── public
├── onboarding
├── importer
├── catalog
├── enquiries
├── customers
├── orders
├── bookings
├── analytics
├── ai
├── automations
├── settings
└── shared

The exact framework structure belongs in TECH-STACK.md and FOLDER-STRUCTURE.md.

14. Backend

The backend is responsible for:

authentication
authorization
business data
domain logic
API endpoints
AI orchestration
action execution
events
automations
integrations
validation
audit logs
15. Backend Module Structure

Conceptually:

backend/
├── auth/
├── businesses/
├── users/
├── products/
├── services/
├── catalog/
├── importer/
├── websites/
├── publishing/
├── enquiries/
├── customers/
├── orders/
├── bookings/
├── payments/
├── media/
├── notifications/
├── knowledge/
├── memory/
├── ai/
├── agents/
├── actions/
├── events/
├── automations/
├── analytics/
└── shared/
16. Domain-Driven Modules

Each module should own its domain logic.

Example:

Products Module

owns:

product creation
product updates
product validation
product availability
product events

The AI module should not directly manipulate the products table.

17. AI Boundary

AI should request controlled business actions.

Bad:

AI
↓
Direct SQL
↓
products table

Good:

AI
↓
Action Registry
↓
UPDATE_PRODUCT
↓
Permission Check
↓
Approval Check
↓
Product Domain
↓
Database
18. Action Registry

The Action Registry is the controlled bridge between AI and business operations.

Example:

AI
 ↓
CREATE_PRODUCT
 ↓
Permission Check
 ↓
Validation
 ↓
Approval Check
 ↓
Product Service
 ↓
Database

The Action Registry is defined in:

ACTION-REGISTRY.md

19. Business Knowledge

Business Knowledge provides business-specific context.

Business Data
      ↓
Knowledge Layer
      ↓
AI / Website / Search / Content

The detailed specification exists in:

BUSINESS-KNOWLEDGE-BASE.md

20. Business Memory

Business Memory stores persistent business preferences and instructions.

Business Memory
      ↓
Relevant Memory Retrieval
      ↓
AI Context

The detailed specification exists in:

BUSINESS-MEMORY.md

21. AI Architecture

The AI system should not be one giant prompt.

It should consist of components:

AI Request
    ↓
Task Classification
    ↓
Permission Context
    ↓
Knowledge Retrieval
    ↓
Memory Retrieval
    ↓
Business Context
    ↓
AI Model
    ↓
Structured Output
    ↓
Action Validation
    ↓
Action / Response
22. AI Gateway

All external AI model calls should preferably pass through a common AI Gateway.

Responsibilities:

model selection
provider abstraction
token/cost tracking
timeout handling
retries
structured output
error handling
fallback models
23. Model Provider Independence

Do not tightly couple FrontDesk business logic to one AI provider.

Conceptually:

AI Gateway
├── Provider A
├── Provider B
├── Local Model
└── Future Provider

The rest of FrontDesk interacts with the AI Gateway rather than provider-specific SDKs.

24. Free-Cost Development Strategy

For v0.1 development, prefer:

local models where practical
free API tiers where available
open-source libraries
local development services
inexpensive/free deployment tiers

Do not design the architecture around paid AI infrastructure.

25. AI Cost Control

Every AI request should eventually be trackable.

Store metadata such as:

business_id
task_type
model
provider
tokens
estimated_cost
latency
success
26. AI Request Types

Examples:

CONTENT_GENERATION
IMPORT_EXTRACTION
PRODUCT_DESCRIPTION
FAQ_GENERATION
SEO_GENERATION
COPILOT_ANALYSIS
MEMORY_SUGGESTION
WEBSITE_GENERATION
27. Structured AI Output

Whenever AI output affects the application, prefer structured output.

Example:

{
  "action": "CREATE_PRODUCT",
  "data": {
    "name": "Chocolate Cake",
    "price": 650,
    "currency": "INR"
  }
}

Do not rely on parsing arbitrary prose for critical actions.

28. AI Action Pipeline
AI
 ↓
Structured Intent
 ↓
Schema Validation
 ↓
Permission Check
 ↓
Business Rule Check
 ↓
Approval Check
 ↓
Action Registry
 ↓
Domain Service
 ↓
Database
29. Database

PostgreSQL is the preferred primary relational database for v0.1.

It should store:

users
businesses
workspaces
products
categories
services
business hours
offers
enquiries
customers
orders
bookings
memories
audit records
actions
events
automation definitions
30. Object Storage

Files should not be stored directly inside relational database rows.

Use object storage for:

images
PDFs
logos
menus
documents
generated media
website assets

Database stores metadata and references.

31. Media Flow
User
 ↓
Upload
 ↓
Object Storage
 ↓
Media Record
 ↓
Business/Entity Reference
32. File Upload Security

Uploaded files must be treated as untrusted.

Validate:

file type
file size
extension
MIME type
ownership
malware/security requirements where applicable
33. Business Import Architecture

Business Importer is a major v0.1 component.

Source
 ↓
Importer
 ↓
Extraction
 ↓
Normalization
 ↓
Validation
 ↓
Conflict Detection
 ↓
Review
 ↓
Approval
 ↓
Business Data
 ↓
Knowledge Base
34. Import Sources

Potential sources:

Website
PDF
CSV
Excel
Images
Menu
Business profile
Social profile
Future WhatsApp catalog
35. Import Isolation

Imported content must be treated as untrusted data.

Imported text must not become system instructions.

36. Website Builder Architecture

The Website Builder should operate on a structured page model.

Do not store a website only as arbitrary generated HTML.

Conceptually:

Website
├── Theme
├── Pages
│   ├── Sections
│   │   ├── Components
│   │   └── Content
│   └── SEO
└── Publishing Configuration
37. Design System

The builder should use design tokens:

Colors
Typography
Spacing
Radius
Shadows
Buttons
Cards
Icons

This allows:

Change Brand Color
↓
Theme Update
↓
Entire Website
38. Website Rendering

The website renderer converts structured website data into the public site.

Website Configuration
+
Business Data
↓
Renderer
↓
HTML / CSS / JS
39. Website Content Source

Product information should come from business data.

Do not duplicate product records inside page content unless there is a deliberate snapshot/version requirement.

40. Website Publishing

Publishing creates a controlled version.

Draft
 ↓
Preview
 ↓
Validation
 ↓
Publish
 ↓
Published Version
41. Versioning

Website versions should be immutable snapshots once published.

Version 1
Version 2
Version 3

The detailed behavior belongs in:

PUBLISHING-AND-VERSIONING.md

42. Public Website Architecture

A public visitor should not need an authenticated FrontDesk account.

Visitor
 ↓
Public URL
 ↓
Website Renderer
 ↓
Public Business Data
43. Public Data Boundary

Only public business information may be exposed.

Never expose:

internal costs
private customer information
staff private data
API keys
internal notes
business secrets
44. QR Architecture

QR codes should point to a stable public business URL.

Example:

https://business.frontdesk/... 

The exact domain strategy belongs in:

DOMAIN-AND-CUSTOM-URLS.md

45. QR Flow
Customer scans QR
 ↓
Public Business URL
 ↓
Catalog / Website
 ↓
Enquiry / Order / Booking
46. WhatsApp Architecture

WhatsApp should be treated as an external communication channel.

Customer
 ↓
WhatsApp
 ↓
Integration Layer
 ↓
FrontDesk
 ↓
Business Context
 ↓
Response / Action
47. External Integration Boundary

External providers should be isolated behind integration adapters.

Example:

WhatsApp Adapter
Payment Adapter
Email Adapter
Google Adapter

The core business logic should not depend directly on provider-specific APIs.

48. Integration Interface

Conceptually:

Integration
├── connect()
├── disconnect()
├── send()
├── receive()
├── validate()
└── handleWebhook()

Exact APIs belong in API.md.

49. Event Architecture

Important domain changes generate events.

Example:

PRODUCT_CREATED
PRODUCT_UPDATED
ORDER_CREATED
BOOKING_CREATED
ENQUIRY_RECEIVED
MEMORY_CREATED
WEBSITE_PUBLISHED
50. Event Flow
Domain Action
 ↓
Database Transaction
 ↓
Domain Event
 ↓
Event Handler
 ↓
Automation / Notification / Analytics
51. Event Principle

Events should represent something that has already happened.

Example:

PRODUCT_UPDATED

means the product was successfully updated.

It should not mean:

"We intend to update the product."

52. Event Reliability

Important events should not be lost silently.

For v0.1, a persistent event/outbox approach may be used where practical.

53. Automation Architecture

Automation consumes events.

Event
 ↓
Trigger
 ↓
Condition
 ↓
Action
 ↓
Result

Example:

ORDER_CREATED
 ↓
IF order > ₹1000
 ↓
ADD_LOYALTY_POINTS
 ↓
SEND_NOTIFICATION
54. Automation Safety

Automations must respect:

permissions
business rules
action availability
approval requirements
rate limits
55. Background Jobs

Long-running operations should not block normal API requests.

Examples:

Website import
PDF extraction
Image processing
AI generation
Email sending
Campaign sending
Analytics processing

These should use background jobs where necessary.

56. v0.1 Job Strategy

Keep the job system simple.

Possible architecture:

API
 ↓
Job Queue
 ↓
Worker
 ↓
Task

Avoid introducing multiple queue technologies initially.

57. Caching

Cache only data where staleness is acceptable.

Potential cache:

Public website
Public catalog
Frequently accessed business information
AI retrieval results
58. Critical Data Must Not Become Stale

Examples:

Product Price
Availability
Booking Availability
Order Status
Payment Status

These require appropriate freshness/invalidation strategies.

59. Authentication

Authentication manages:

User
Session
Identity
Login
Logout
Password / OAuth
60. Authorization

Authorization determines what a user can do.

Example:

Owner
Manager
Staff
Designer
Developer

Different roles receive different permissions.

61. Workspace Model

A user may eventually belong to multiple workspaces/businesses.

User
 ├── Workspace A
 └── Workspace B
62. Tenant Isolation

Every business-owned record must be associated with the appropriate business/workspace.

Queries must always enforce tenant boundaries.

63. Tenant Security

Never rely solely on frontend filtering.

The backend must enforce business ownership.

64. Authorization Pipeline
Request
 ↓
Authenticate
 ↓
Identify User
 ↓
Identify Workspace
 ↓
Identify Business
 ↓
Check Role
 ↓
Check Permission
 ↓
Execute
65. Audit Architecture

Important operations should create audit records.

Examples:

Price changed
Product deleted
AI action approved
Website published
Campaign sent
Memory changed
66. Audit Record

Conceptually:

Audit
├── actor
├── actor_type
├── action
├── resource
├── resource_id
├── timestamp
├── before
├── after
└── metadata
67. AI Audit

AI actions must identify:

AI
Model
Task
Action
Approval
Result
68. Approval Architecture

High-impact AI actions may require approval.

AI proposes
 ↓
Approval Request
 ↓
Owner reviews
 ↓
Approve / Reject
 ↓
Action Registry
 ↓
Execute
69. Preview Architecture

Before major changes:

Current State
      ↓
AI Proposed State
      ↓
Diff / Preview
      ↓
Approval
      ↓
Apply
70. Undo Architecture

Actions that modify multiple resources should ideally produce a reversible change set where practical.

Example:

AI Task
↓
47 description changes
↓
Change Set
↓
Apply

Then:

Undo Change Set

can restore the previous state.

71. Business Safety Mode

Before destructive or high-impact operations:

AI detects:
47 records affected

Then:

Create backup before continuing?

72. Data Backup

Business backups should protect critical business information.

At minimum:

business profile
products
services
website configuration
settings
memory
important operational records
73. Error Handling

Every layer should have predictable error handling.

Example:

Validation Error
Authentication Error
Authorization Error
Not Found
Conflict
External Integration Error
AI Error
Rate Limit
Internal Error
74. API Error Format

All APIs should eventually use a consistent error structure.

Example:

{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product was not found.",
    "request_id": "req_123"
  }
}

Exact contract belongs in API.md.

75. Request IDs

Every API request should have a traceable request ID.

This helps with:

debugging
support
audit
logs
76. Observability

FrontDesk should eventually track:

Logs
Errors
Latency
AI calls
Background jobs
Integration failures
77. Structured Logging

Prefer structured logs.

Example:

{
  "level": "error",
  "event": "product_update_failed",
  "business_id": "BUS_123",
  "request_id": "REQ_123"
}
78. Secrets

Secrets must never be stored in source code.

Examples:

Database credentials
AI API keys
OAuth secrets
Webhook secrets
Payment keys

Use environment variables or secure secret management.

79. Environment Separation

At minimum:

Development
Production

Future:

Development
Staging
Production
80. Configuration

Configuration should come from environment variables/configuration rather than hardcoded values.

81. Frontend Security

Frontend must never contain:

database credentials
private API keys
service-role credentials
signing secrets
82. API Security

API must validate:

authentication
authorization
input schema
resource ownership
rate limits
content types
83. AI Security

AI should be treated as an untrusted reasoning component.

It can propose.

The application decides whether it is allowed to execute.

84. AI Trust Boundary
AI
 ↓
UNTRUSTED PROPOSAL
 ↓
VALIDATION
 ↓
POLICY
 ↓
PERMISSION
 ↓
APPROVAL
 ↓
ACTION
85. Prompt Injection

External text can attempt to manipulate AI behavior.

Sources include:

imported websites
uploaded PDFs
customer messages
product descriptions
reviews
social media

These should be treated as untrusted data.

86. Prompt Injection Rule

Imported content must never be treated as system-level instructions.

87. Data Privacy

Customer data and business data must be separated appropriately.

The architecture must support:

consent
access control
deletion
export
retention
audit
88. Customer Data Boundary

Customer data must not accidentally appear in:

public website
public APIs
AI prompts unrelated to the customer
analytics exposed to unauthorized users
89. AI Context Privacy

AI receives only the information necessary for the task.

90. Payment Security

FrontDesk should avoid storing sensitive payment credentials directly where possible.

Use payment-provider tokenization/hosted mechanisms when available.

91. Public Website Performance

The public website should prioritize:

fast initial load
image optimization
responsive design
caching
lazy loading
minimal JavaScript where possible
92. Mobile-First

FrontDesk targets local businesses whose customers are frequently mobile users.

The public experience should therefore be mobile-first.

93. PWA Consideration

The owner dashboard may eventually support PWA capabilities.

The customer-facing business experience may also support installability where useful.

Native apps are not required for v0.1.

94. v0.1 Application Strategy

Recommended:

Owner Dashboard:
Web Application

Public Business Site:
Web / PWA-compatible

Customer Experience:
Mobile-first Web / PWA-compatible

Native Mobile:
Future
95. Why Not Native First

Native apps would increase:

development time
maintenance
release complexity
platform-specific work

The initial product does not require native capabilities.

96. Deployment Architecture

Conceptually:

Internet
   │
   ↓
Frontend Hosting
   │
   ↓
Backend API
   │
   ├── PostgreSQL
   ├── Object Storage
   ├── Background Worker
   └── External APIs
97. Free/Low-Cost Deployment Principle

The architecture should be compatible with:

free hosting tiers
open-source services
local development
inexpensive managed infrastructure

Exact providers should be documented separately in DEPLOYMENT.md.

98. Local Development

Developers should be able to run:

Frontend
Backend
Database

locally.

99. Local Development Flow
Browser
 ↓
localhost frontend
 ↓
localhost backend
 ↓
local/remote PostgreSQL
100. Development Environment

The project should provide clear:

Installation
Environment Variables
Database Setup
Migration
Seed Data
Development Server
Testing

instructions.

101. Database Migrations

Schema changes must use migrations.

Do not manually alter production database structures.

102. Seed Data

Development environments should have optional seed data.

Example:

Royal Bakes
Products
Customers
Orders
103. Testing Architecture

Testing should exist at multiple levels:

Unit Tests
Integration Tests
API Tests
Component Tests
End-to-End Tests
AI Evaluation
104. AI Testing

AI features need deterministic evaluation where possible.

Test:

Correct extraction
No hallucinated price
Correct business context
Memory retrieval
Action selection
Permission behavior
105. Import Testing

Test:

Clean PDF
Messy PDF
Image menu
Duplicate products
Conflicting prices
Missing prices
Invalid data
Large files
106. Action Testing

Every important action should test:

Authorized
Unauthorized
Approval required
Invalid input
Business conflict
Successful execution
Rollback
107. Event Testing

Test:

Event generated
Event persisted
Handler executes
Failure retries
Duplicate event handling
108. Idempotency

Important operations should be designed to avoid accidental duplication.

Example:

If an external system sends the same webhook twice:

Do not create two orders.
109. Webhook Architecture

External webhooks should:

Receive
↓
Verify
↓
Persist
↓
Deduplicate
↓
Process
↓
Emit Event
110. Rate Limiting

Rate limits should protect:

public APIs
authentication
AI endpoints
file uploads
expensive operations
webhooks where appropriate
111. Abuse Prevention

Protect against:

spam
automated abuse
excessive AI calls
malicious file uploads
unauthorized scraping
brute-force authentication
112. Scalability Strategy

v0.1:

Modular Monolith
+
PostgreSQL
+
Object Storage
+
Simple Background Worker

Later:

Horizontal Backend Scaling
+
Dedicated Workers
+
Caching
+
Queue
+
AI Service Scaling
113. Database Scaling

Start with a single PostgreSQL database.

Future options:

read replicas
indexing
partitioning
caching
archival

Do not introduce these prematurely.

114. Storage Scaling

Object storage should handle media independently of the application server.

115. AI Scaling

AI requests may become one of the largest infrastructure costs.

Architecture should therefore allow:

Model Routing
Caching
Batching
Small Models
Local Models
Provider Switching
116. Cost-Aware AI

Use the smallest capable model for simple tasks.

Example:

Simple classification
→ Small model

Complex business reasoning
→ Larger model
117. AI Fallback

If the primary model fails:

Primary Model
↓
Fallback Model
↓
Graceful Error
118. Graceful AI Failure

The business platform must continue operating when AI is unavailable.

Example:

If AI is down:

Owner can still:
Add product
Edit product
Publish website
Reply to enquiry

AI must be an enhancement, not the only path to operate the business.

119. Offline Considerations

The public business site may support caching.

The owner dashboard should gracefully handle temporary network failures.

Full offline editing is not required for v0.1 unless explicitly prioritized later.

120. Data Synchronization

When offline changes are eventually supported:

Local Change
↓
Sync Queue
↓
Server
↓
Conflict Resolution

This is future scope.

121. Search Architecture

Search may combine:

Structured database queries
+
Full-text search
+
Semantic search

Use structured search first for factual entities.

122. Example

Search:

Chocolate Cake

Use product search.

Search:

What are your cancellation rules?

Use semantic/knowledge search.

123. Analytics Architecture

Analytics should consume domain events and operational data.

Business Event
↓
Analytics Processor
↓
Metric
↓
Dashboard
124. Analytics Separation

Analytics should not directly modify core business data.

125. Business Copilot Architecture

Copilot periodically evaluates business state.

Business Data
+
Events
+
Analytics
+
Knowledge
+
Memory
↓
Copilot Analysis
↓
Opportunity / Warning
↓
Suggested Action
↓
Approval
↓
Action
126. Proactive AI

Copilot should not continuously run expensive AI calls without controls.

Use:

scheduled jobs
event triggers
thresholds
change detection

to determine when analysis is useful.

127. Example Copilot Trigger
Orders decreased > 20%
↓
Copilot analysis
↓
Identify possible reason
↓
Create recommendation
128. AI Recommendation

Recommendations should be distinguishable from completed actions.

RECOMMENDATION

is not:

ACTION_COMPLETED
129. AI Agent Architecture

An agent consists of:

Agent Configuration
+
Knowledge
+
Memory
+
Tools/Actions
+
Permissions
+
Instructions
130. Agent Execution
Customer Request
↓
Agent
↓
Knowledge Retrieval
↓
Memory Retrieval
↓
Reasoning
↓
Tool Selection
↓
Permission Check
↓
Action
↓
Response
131. Agent Guardrails

Every agent must have:

allowed actions
allowed knowledge
allowed scope
rate limits
approval requirements
132. Business Agent Isolation

Restaurant Agent A must never access Business B data.

133. Workflow Architecture

Automations should be represented as structured workflows.

Trigger
↓
Conditions
↓
Actions

Future workflows may support branching.

134. Workflow Example
ORDER_CREATED
      ↓
Order > ₹1000?
   ┌──┴──┐
  YES    NO
   ↓
Add points
   ↓
Send confirmation
135. Integration Architecture

Use adapters.

Core Platform
     │
     ├── WhatsApp Adapter
     ├── Payment Adapter
     ├── Email Adapter
     ├── Google Adapter
     └── Future Adapters
136. Provider Independence

The business domain should not contain provider-specific implementation details.

Bad:

OrderService
→ WhatsApp API

Better:

OrderService
→ Notification Interface
→ WhatsApp Adapter
137. API Architecture

v0.1 should expose a versioned API.

Example:

/api/v1/
138. API Responsibilities

API layer handles:

Authentication
Authorization
Validation
Serialization
Error Handling
Rate Limiting
Request IDs
139. Domain Logic

Business rules belong in domain/application services, not route handlers.

Bad:

POST /products
    huge business logic

Better:

POST /products
 ↓
ProductController
 ↓
ProductService
 ↓
ProductRepository
140. Repository Layer

Database access should be isolated from domain logic.

Conceptually:

Controller
↓
Service
↓
Repository
↓
Database
141. Transactions

Operations affecting multiple records should use database transactions where appropriate.

Example:

Create Order
+
Create Order Items
+
Update Inventory

should maintain consistency.

142. Concurrency

Operations involving:

inventory
booking availability
order status
payments

must account for concurrent requests.

143. Data Validation

Validation must occur server-side.

Frontend validation is for UX.

Backend validation is for security and correctness.

144. Frontend State

Frontend state should distinguish:

Server State
UI State
Form State
Temporary Draft State
145. Builder State

Website builder should maintain an editable draft separate from published state.

Published
+
Draft
146. Autosave

Future builder support may autosave drafts.

Autosave should not automatically publish.

147. Preview Environment

Preview should render draft state without affecting the live website.

148. Publish Boundary
Draft
↓
Validation
↓
Approval
↓
Published
149. Domain Model

The core domain relationships are approximately:

User
 ↓
Workspace
 ↓
Business
 ├── Locations
 ├── Products
 ├── Services
 ├── Categories
 ├── Offers
 ├── Customers
 ├── Enquiries
 ├── Orders
 ├── Bookings
 ├── Website
 ├── Knowledge
 ├── Memory
 ├── Automations
 ├── Events
 └── Integrations
150. Business as Root Entity

Most business-specific resources should ultimately be scoped to a Business/Workspace.

151. Multi-Tenant Architecture

FrontDesk is logically multi-tenant.

Business A
 ├── Products
 ├── Customers
 └── Website

Business B
 ├── Products
 ├── Customers
 └── Website
152. Tenant Isolation Rule

Every database query involving tenant-owned resources must be scoped to the authenticated business/workspace.

153. Public Tenant Resolution

For public websites:

Domain
↓
Business Resolution
↓
Public Website
154. Domain Resolution

Future custom domains:

royalbakes.in
↓
Domain Mapping
↓
Business ID
↓
Website
155. Public Caching

Public pages can be cached independently from private dashboard data.

156. Private vs Public API

Separate conceptual API access:

Private API
Owner / Staff

Public API
Customer / Website
157. Public API Restrictions

Public APIs should expose only necessary information.

158. Security Architecture
Internet
 ↓
HTTPS
 ↓
Frontend/API
 ↓
Authentication
 ↓
Authorization
 ↓
Business Scope
 ↓
Domain Logic
 ↓
Database
159. Security Principle

Never trust:

browser
AI
uploaded files
customer messages
external webhooks
imported content

All must be validated.

160. Data Flow — Owner Creates Product
Owner
 ↓
Dashboard
 ↓
POST /api/v1/products
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Product Service
 ↓
Database
 ↓
PRODUCT_CREATED
 ↓
Analytics / Automation
161. Data Flow — Customer Views Catalog
Customer
 ↓
Public URL
 ↓
Business Resolution
 ↓
Public Website
 ↓
Public Product Query
 ↓
Catalog
162. Data Flow — Business Import
Owner
 ↓
Upload / URL
 ↓
Importer
 ↓
Extraction
 ↓
Normalization
 ↓
Validation
 ↓
Conflict Detection
 ↓
Review
 ↓
Approval
 ↓
Business Data
 ↓
Knowledge
163. Data Flow — AI Creates Product
Owner
 ↓
AI Request
 ↓
Memory Retrieval
 ↓
Knowledge Retrieval
 ↓
AI Model
 ↓
Structured Action
 ↓
Schema Validation
 ↓
Permission
 ↓
Approval
 ↓
CREATE_PRODUCT
 ↓
Product Service
 ↓
Database
 ↓
PRODUCT_CREATED
164. Data Flow — Customer AI
Customer
 ↓
Chat
 ↓
AI Agent
 ↓
Business Resolution
 ↓
Permission Context
 ↓
Knowledge Retrieval
 ↓
Relevant Memory
 ↓
AI Model
 ↓
Response

If an action is required:

AI
↓
Action Registry
↓
Permission
↓
Action
165. Data Flow — Automation
Business Event
 ↓
Event Store
 ↓
Automation Trigger
 ↓
Condition Evaluation
 ↓
Action
 ↓
Permission / Approval
 ↓
Execution
 ↓
Result Event
166. Data Flow — AI Copilot
Business Activity
 ↓
Metrics / Events
 ↓
Copilot Trigger
 ↓
Relevant Knowledge
 ↓
Relevant Memory
 ↓
AI Analysis
 ↓
Recommendation
 ↓
Owner
 ↓
Approval
 ↓
Action
167. Architecture Boundaries

The following boundaries must remain clear:

UI ≠ Business Logic
AI ≠ Authorization
Knowledge ≠ Memory
Memory ≠ Permission
Events ≠ Commands
Draft ≠ Published
Public Data ≠ Private Data
Recommendation ≠ Action
168. Most Important Boundary
AI proposes.
Application decides.

AI must never bypass application controls.

169. v0.1 Required Components

Minimum architecture:

Frontend
Backend API
PostgreSQL
Object Storage
Authentication
Business Domain
Business Knowledge
Business Memory
Business Importer
Website Builder
Publishing
QR
WhatsApp Enquiry
Basic Inbox
Basic Analytics
AI Gateway
Action Registry
Events
Basic Background Jobs
Audit Logs
170. v0.1 Components That Can Be Simplified

The following should initially remain lightweight:

Advanced AI Agents
Complex Workflow Engine
Advanced CRM
Advanced Inventory
Advanced Marketplace
Semantic Knowledge Graph
Multi-region Infrastructure
Microservices
Advanced Event Streaming
171. v0.1 Non-Goals

Do not initially build:

Native iOS application
Native Android application
Full ERP
Full accounting system
Full POS
Full delivery network
Large marketplace
Complex multi-region architecture
Dedicated Kubernetes infrastructure
Custom AI foundation model
172. Architecture Evolution
Stage 1 — v0.1
Modular Monolith
+
PostgreSQL
+
Object Storage
+
Simple Worker
Stage 2
Better Queue
+
Caching
+
Dedicated AI Infrastructure
+
More Integrations
Stage 3
Selective Service Extraction
+
Advanced Event Infrastructure
+
Scalable AI Agents
173. Architecture Decision Rule

Do not introduce infrastructure merely because it is technically interesting.

Introduce it when:

Scale
Reliability
Cost
Security
Team Size
or Product Requirements

justify it.

174. Documentation Relationship

This architecture document depends on:

PRD.md
BRD.md
BUSINESS-MODEL.md
PRODUCT-ROADMAP.md

and provides architectural context for:

API.md
DATABASE-SCHEMA.md
UI-UX-SPECIFICATION.md
TECH-STACK.md
SECURITY.md
DEPLOYMENT.md
TESTING-STRATEGY.md
175. Source-of-Truth Rule

If two documents disagree:

Identify the conflict.
Do not silently choose.
Update the affected documents.
Record significant architectural decisions.
176. Architectural Decision Records

Future major decisions should be recorded as ADRs.

Example:

ADR-001:
Use Modular Monolith for v0.1.

ADR-002:
Use PostgreSQL as primary database.

ADR-003:
AI cannot directly access database.

ADR-004:
AI actions use Action Registry.
177. Recommended Future ADR Directory
documentation/
└── architecture/
    └── ADR/
        ├── ADR-001-modular-monolith.md
        ├── ADR-002-postgresql.md
        ├── ADR-003-ai-action-boundary.md
        └── ...

This can be introduced later.

178. Architecture Quality Requirements

The architecture should be:

Understandable
Modular
Testable
Secure
Affordable
Observable
Maintainable
Extensible
179. Final Architecture Principle

FrontDesk should be built as:

A business platform with multiple user-facing surfaces, not a website builder with a collection of extra features.

The website, QR, WhatsApp, AI, automation, analytics, and future agents should all operate on the same underlying business system.

180. Final System Model
                         FRONTDESK
                             │
                             ↓
                     BUSINESS WORKSPACE
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
        BUSINESS DATA     KNOWLEDGE       MEMORY
              │              │              │
              └──────────────┼──────────────┘
                             ↓
                       AI CONTEXT
                             │
                ┌────────────┼────────────┐
                ↓            ↓            ↓
             COPILOT       AGENTS       AI TOOLS
                │            │            │
                └────────────┼────────────┘
                             ↓
                       ACTION REGISTRY
                             │
                     Permission / Policy
                             │
                         Approval
                             │
                             ↓
                     DOMAIN OPERATIONS
                             │
                             ↓
                          DATABASE
                             │
                             ↓
                           EVENTS
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
         AUTOMATIONS     ANALYTICS      NOTIFICATIONS
              │
              ↓
        EXTERNAL SERVICES
181. Final v0.1 Architecture Decision

Architecture Style:

Modular Monolith + Separate Frontend + PostgreSQL + Object Storage + Background Worker + AI Gateway

Primary principle:

Business data is the source of truth.

AI principle:

AI proposes; application validates and executes.

Integration principle:

External providers are accessed through adapters.

Security principle:

Never trust client input, AI output, imported content, or external events.

Scalability principle:

Start simple, keep module boundaries clean, extract services only when justified.

---

# P0 Implementation Status (Automation Engine)

**Last Updated:** 2026-08-29

## Implemented Components

### Event System
- `DomainEvent` model with businessId, eventType, aggregateType/Id, payload
- `EventDelivery` model for consumer delivery tracking
- `emitAndDispatch()` hook used by: enquiries, orders, bookings, payments, insights routes
- Synchronous in-process dispatcher (replaceable for future queue-based processing)

### Action Registry
- `ActionDefinition` model with actionKey, name, approvalRequired flags
- Seeded on startup: CREATE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT, PUBLISH_WEBSITE, CREATE_OFFER
- `ActionExecution` records every action with input/output, status, approval reference
- `ApprovalRequest` model for human-in-the-loop approval workflow

### Automation Engine
- **Engine** (`engine.ts`): trigger matching, condition evaluation (eq/neq/gt/gte/lt/lte/contains), config validation, action execution
- **Dispatcher** (`dispatcher.ts`): matches domain events to active automations, idempotency check, manual trigger support
- **Hook** (`hook.ts`): `emitAndDispatch()` for seamless event creation + dispatch from any route

### Security
- Config validation rejects: exec, eval, Function, require, shell, system, __proto__, fetch, http
- Tenant isolation enforced on all automation operations
- Cross-tenant events cannot trigger cross-tenant automations
- Automation config is data, not executable code

### API
- `GET/POST /api/v1/businesses/:id/automations` — list, create
- `GET/PATCH/DELETE /api/v1/businesses/:id/automations/:id` — get, update, delete
- `POST .../enable`, `POST .../disable` — toggle status
- `POST .../trigger` — manual test trigger
- `GET .../runs` — execution history
- `GET /api/v1/automations/triggers` — supported trigger list

### Frontend
- `/dashboard/automations` — full CRUD UI with status, trigger/action badges, run history

### Tests
- 23 backend tests: CRUD, triggers, conditions, idempotency, approval, audit, tenant isolation, security
- Playwright E2E: API lifecycle tests + UI navigation tests