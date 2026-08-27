Next document: TECH-STACK.md.

This one is important because we now have the product requirements and logical database model. We need to lock down what technologies FrontDesk v0.1 will actually use, especially because you want to build it free of cost.

Create:

C:\Users\Administrator\Documents\FrontDesk\documentation\TECH-STACK.md

Use this structure:

# FrontDesk — Technical Stack

**Product:** FrontDesk  
**Version:** v0.1  
**Document:** Technical Stack  
**Status:** Draft — For Review  
**Last Updated:** 2026-08-26

---

# 1. Purpose

This document defines the approved technology stack for FrontDesk v0.1.

The primary goals are:

- zero-cost development where possible
- open-source technologies
- simple local development
- easy AI-assisted development
- scalable architecture
- strong TypeScript support
- PostgreSQL compatibility
- PWA support
- API-first backend
- minimal vendor lock-in
- ability to replace free-tier services later

---

# 2. Product Architecture

FrontDesk v0.1 will be built as a:

> **Responsive Web Application + PWA**

It is not a native Android/iOS application for v0.1.

The architecture should support:

```text
                    FRONTDESK
                       │
          ┌────────────┴────────────┐
          ↓                         ↓
    Admin Dashboard            Public Business
          │                         │
          ↓                         ↓
      Frontend                  Website/PWA
          │
          ↓
       Backend API
          │
    ┌─────┼──────────┐
    ↓     ↓          ↓
Database Storage    AI
    │
    ↓
External Integrations
3. Frontend
Framework

Next.js

Use the modern App Router architecture.

Reasons:

React ecosystem
server/client component support
routing
SEO
strong TypeScript support
PWA compatibility
good deployment support
suitable for both dashboard and public websites
4. Frontend Language

TypeScript

Do not use plain JavaScript for the main application.

Reasons:

type safety
better AI-assisted coding
easier refactoring
better API contracts
better maintainability
fewer runtime errors
5. Styling
Tailwind CSS

Use Tailwind CSS for the application design system.

Primary purposes:

responsive layouts
utility styling
design tokens
rapid development
consistent UI

Avoid uncontrolled custom CSS wherever Tailwind can provide the required behavior.

6. UI Component System

Use:

shadcn/ui

The component system should be treated as a starting point rather than a rigid design limitation.

Components should be customized according to the FrontDesk design system.

Potential components:

Button
Input
Select
Dialog
Drawer
Dropdown
Tabs
Table
Card
Toast
Alert
Sheet
Command
Form
Calendar
Tooltip
7. Icons

Use:

Lucide Icons

Reasons:

open source
consistent visual language
good React support
lightweight
large icon library
8. Frontend State Management

Do not introduce a global state library unnecessarily.

Use:

Server state

TanStack Query

For:

API data
caching
mutations
synchronization
loading/error states
Local UI state

Use:

React useState
useReducer
Context

where appropriate.

A library such as Zustand may be introduced later if actual application complexity requires it.

9. Forms

Use:

React Hook Form

with:

Zod

for validation.

Architecture:

Form
 ↓
React Hook Form
 ↓
Zod Validation
 ↓
API
10. Frontend Validation

Use Zod schemas for:

form validation
API response validation where useful
action payload validation
configuration validation

The backend must still validate all client input.

Frontend validation is not a security boundary.

11. Backend

For v0.1, use:

Node.js + TypeScript

The backend should expose REST APIs.

12. Backend Framework

Use:

Fastify

Reasons:

TypeScript support
performance
lightweight architecture
plugin system
schema validation support
suitable for API-first applications
13. API Style

FrontDesk v0.1 will primarily use:

REST API

Example:

GET    /api/v1/business
GET    /api/v1/products
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
14. API Versioning

All public API endpoints should begin with:

/api/v1

Example:

/api/v1/businesses

This allows future API versions without breaking existing clients.

15. API Response Format

Use a consistent response structure.

Success:

{
  "success": true,
  "data": {},
  "meta": {}
}

Error:

{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  }
}

Exact API conventions will be defined in API.md.

16. Database

Use:

PostgreSQL

PostgreSQL is the primary relational database for FrontDesk.

Reasons:

open source
reliable
relational integrity
JSONB
indexing
transactions
strong ecosystem
suitable for SaaS
supports future scaling
17. Database ORM

Use:

Prisma

Reasons:

TypeScript integration
migrations
schema definition
generated client
developer productivity
strong AI coding compatibility

Prisma should not replace understanding of SQL.

Complex queries may use carefully written SQL when necessary.

18. Database Extensions

Potential PostgreSQL extensions:

pgcrypto
pgvector

Use only when actually required.

19. Vector Search

For v0.1, prefer PostgreSQL + pgvector rather than introducing a separate vector database.

Architecture:

PostgreSQL
 ├── Business Data
 ├── Knowledge Data
 └── Vector Embeddings

This keeps infrastructure simple and low-cost.

20. File Storage

Business media includes:

logos
product images
menus
PDFs
uploaded documents

The application should use object storage rather than storing binary files directly in PostgreSQL.

For development:

Local filesystem

For deployment:

Use a compatible object-storage provider with a free tier where available.

The storage abstraction should allow the provider to be replaced.

21. Authentication

Authentication should use a standard secure authentication system.

For the free v0.1 development environment, prefer:

Supabase Auth

if Supabase is used as the hosted PostgreSQL/auth infrastructure.

Alternative:

Implement authentication directly in the backend only if there is a strong architectural reason.

Do not build custom password authentication unnecessarily.

22. Authorization

Authentication answers:

Who are you?

Authorization answers:

What are you allowed to do?

FrontDesk must implement workspace/business-level authorization.

Example:

User
 ↓
Workspace
 ↓
Business
 ↓
Resource

Every protected resource must verify ownership/access.

23. Multi-Tenant Security

Business data must never leak between tenants.

Every business-owned query must be scoped appropriately.

Conceptually:

current_user
    ↓
workspace
    ↓
business
    ↓
resource
24. Public Website

Public business websites should be served from the same Next.js application where practical.

Example:

dashboard.frontdesk...
business.frontdesk...

Custom domains can be added later.

25. PWA

FrontDesk v0.1 should support PWA capabilities.

Required foundation:

Web App Manifest
Service Worker
Installable experience
Responsive UI
Offline shell

Offline business editing is not required for the first release.

26. PWA Scope

v0.1 should prioritize:

Install
Launch
Responsive UI
Cached static assets
Basic offline fallback

Do not attempt full offline synchronization initially.

27. QR Codes

Use an open-source QR generation library.

QR codes should point to public FrontDesk business URLs.

Example:

https://business.frontdesk.app/royal-bakes
28. Import Engine

Business Importer may accept:

Website URL
PDF
CSV
Excel
Images
Manual data

The importer should use a modular pipeline:

Source
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
Import
29. Website Import

Website import must not simply copy another site's design/content blindly.

The system should extract:

Business information
Products
Services
Contact details
Opening hours
Images
Public content
Structure

and construct a new FrontDesk implementation.

30. AI Layer

AI should be implemented behind an internal provider abstraction.

Conceptually:

FrontDesk AI Service
        │
        ├── Provider A
        ├── Provider B
        └── Provider C

The rest of the application should not directly depend on one AI provider.

31. AI Provider Strategy

For free development:

Prefer providers that offer:

free API tiers
local models
open-weight models
replaceable APIs

Potential development options include:

Ollama
Groq
Google AI Studio / Gemini free tier
OpenRouter free models where available

Exact provider selection should depend on current availability and limits.

32. Local AI

For development, Ollama may be used for local AI experimentation.

Example architecture:

FrontDesk
   ↓
AI Provider Interface
   ↓
Ollama
   ↓
Local Model

This reduces API costs during development.

33. AI Provider Abstraction

Do not write:

if provider == "openai"

throughout the application.

Instead:

AIService
   ↓
ProviderAdapter

Example conceptual interface:

interface AIProvider {
  generateText(...)
  generateStructured(...)
  generateEmbedding(...)
}
34. Structured AI Output

AI should return structured data whenever the system needs to perform an operation.

Example:

{
  "action": "UPDATE_PRODUCT",
  "target": {
    "productId": "..."
  },
  "changes": {
    "price": 650
  }
}

Never rely on free-form AI text for critical mutations.

35. AI Action Execution

AI should not directly modify the database.

Correct flow:

User
 ↓
AI
 ↓
Structured Action
 ↓
Validation
 ↓
Permission Check
 ↓
Approval Check
 ↓
Action Executor
 ↓
Database
36. AI Safety

High-impact actions should require approval.

Examples:

Change price
Delete product
Publish website
Send campaign
Issue refund
37. AI Knowledge

AI responses should use the Business Knowledge Base when answering business-specific questions.

Architecture:

Question
 ↓
Business Context
 ↓
Knowledge Retrieval
 ↓
Business Memory
 ↓
AI
 ↓
Answer
38. Business Memory

Business Memory is different from developer MEMORY.md.

Business Memory

Customer/business-specific information:

"We prefer Tamil + English."
"Never discount premium products."
MEMORY.md

Developer/AI project handoff state:

What has been built
What is pending
Known issues
Architecture decisions
39. Business Memory Storage

Business Memory will use PostgreSQL.

Potential semantic retrieval may use pgvector later.

40. Automation Engine

Automation should initially be application-managed.

Example:

Event
 ↓
Automation Matcher
 ↓
Conditions
 ↓
Action Registry
 ↓
Execution
41. Scheduling

For v0.1, scheduled jobs can initially be handled through:

backend scheduler
database-backed jobs
deployment platform cron where available

Avoid introducing a complex distributed workflow engine initially.

42. Background Jobs

Background processing is required for:

imports
AI processing
media processing
notifications
scheduled automations

The initial implementation should remain simple.

A queue system can be introduced when actual workload requires it.

43. Notifications

Architecture:

Notification Service
        │
        ├── Email
        ├── WhatsApp
        ├── SMS
        └── Web Push

Providers should be abstracted.

44. WhatsApp

WhatsApp integration should use official APIs/providers where applicable.

Do not build the product around unofficial WhatsApp automation that could violate platform rules.

The exact integration will be specified separately in the WhatsApp technical documentation.

45. Email

For development:

Use a provider with a free tier where available.

Email functionality should be behind:

EmailService

rather than directly calling a provider from business logic.

46. Analytics

v0.1 analytics should primarily use application/domain events.

Example:

page_viewed
product_viewed
enquiry_created
enquiry_replied
qr_scanned

Store events in the application analytics/event system.

47. Observability

Development should have:

structured logs
request IDs
error logging
basic metrics

Avoid paying for an observability platform during initial development if local logging is sufficient.

48. Error Handling

Backend errors should be:

structured
predictable
logged
safe for clients

Never expose:

stack traces
database credentials
API keys
internal secrets

to production users.

49. Environment Variables

Use environment variables for:

DATABASE_URL
AUTH_SECRET
AI_PROVIDER_KEY
STORAGE_KEY
WHATSAPP_TOKEN
EMAIL_API_KEY

Never commit secrets to Git.

50. Environment Files

Use:

.env
.env.local
.env.example

Commit only:

.env.example

Never commit actual secrets.

51. Git

Use Git for source control.

Recommended branches:

main
develop
feature/*
fix/*

For a small team, main + feature branches may be sufficient.

52. Repository Structure

Initial repository:

FrontDesk/
│
├── frontend/
├── backend/
├── documentation/
└── README.md

The detailed folder structure will be defined separately in:

FOLDER-STRUCTURE.md
53. Package Management

Use:

npm

unless the team explicitly decides to standardize on another package manager.

Keep lockfiles committed.

54. Code Quality

Use:

ESLint
Prettier
TypeScript

All code should pass linting before merge.

55. Testing

Frontend:

Vitest
React Testing Library

Backend:

Vitest

API integration testing should be included.

End-to-end testing:

Playwright
56. Test Pyramid
             E2E
            /   \
       Integration
          /     \
       Unit Tests

Most tests should be unit/integration tests.

57. API Documentation

Use OpenAPI.

The API specification should be maintained alongside:

API.md

Potential tooling:

OpenAPI
Swagger UI
58. Security

Security principles:

Authentication
Authorization
Input validation
Tenant isolation
Rate limiting
Secret management
Audit logging
Secure headers
HTTPS

Detailed security rules belong in:

SECURITY.md
59. Rate Limiting

Rate limiting should be applied to:

authentication
public APIs
AI endpoints
imports
messaging
expensive operations

Exact limits will be defined later.

60. Caching

Caching may be used for:

public website data
static assets
frequently accessed configuration
AI retrieval results

Do not cache sensitive user-specific data incorrectly.

61. CDN

Static assets should eventually be served through a CDN.

For free development, rely on the deployment platform's CDN where available.

62. Image Optimization

Images should be:

resized
compressed
served in modern formats where supported
lazy-loaded where appropriate

Next.js image optimization should be used where compatible.

63. SEO

Public business websites should support:

title
meta description
canonical URL
Open Graph
structured data
sitemap
robots.txt
64. Accessibility

Target:

WCAG 2.2 AA principles

At minimum:

keyboard navigation
semantic HTML
sufficient contrast
accessible forms
labels
focus states
alt text
65. Internationalization

FrontDesk should be architected so localization can be added later.

Initial UI language:

English

Business content can support:

English
Tamil

where practical.

66. Currency

Initial primary market:

India

Default currency:

INR

The database and APIs should still support other currencies architecturally.

67. Timezone

Default Indian timezone:

Asia/Kolkata

Businesses should have configurable timezone settings.

68. Deployment Philosophy

Development:

Local machine

Production:

Managed cloud services

Use free tiers initially where practical.

69. Free Development Stack

Target:

Frontend
Next.js

Backend
Node.js + Fastify

Language
TypeScript

Database
PostgreSQL

ORM
Prisma

Auth
Supabase Auth

Storage
Free-tier object storage / local development

AI
Ollama + free-tier API providers

Styling
Tailwind CSS

Components
shadcn/ui

Icons
Lucide

Testing
Vitest + Playwright

API
REST + OpenAPI

Version Control
Git + GitHub
70. Cost Philosophy

The goal for v0.1 development is:

₹0 infrastructure cost where realistically possible.

This does not mean every production feature will remain free forever.

The architecture must allow paid infrastructure to be introduced later without rewriting the application.

71. Avoid Vendor Lock-In

Business logic should not depend directly on:

Supabase-specific APIs
AI-provider-specific APIs
Storage-provider-specific APIs
WhatsApp-provider-specific APIs
Email-provider-specific APIs

Use internal service interfaces.

72. Service Abstraction

Example:

Business Logic
      ↓
Service Interface
      ↓
Provider Adapter
      ↓
External Provider

Examples:

AIService
StorageService
EmailService
MessagingService
PaymentService
SearchService
73. Free-Tier Development Rule

Before adding any paid service:

Check whether an open-source alternative exists.
Check whether local development can replace it.
Check whether an available free tier is sufficient.
Estimate future migration effort.
Avoid unnecessary infrastructure.
74. What NOT to Build in v0.1

Do not introduce:

Kubernetes
Microservices
Kafka
Redis cluster
Dedicated vector database
Dedicated workflow engine
Dedicated search cluster
Native mobile applications
Complex event infrastructure

unless actual requirements justify them.

75. Monolith First

FrontDesk v0.1 should use a modular monolith architecture.

Frontend
   ↓
Backend
   ↓
PostgreSQL

The backend should be internally modular:

auth
business
catalog
website
import
customer
enquiry
ai
memory
automation
action
analytics
76. Why Modular Monolith

Benefits:

easier development
easier debugging
lower infrastructure cost
easier AI-assisted coding
easier deployment
fewer distributed-system problems
simple local setup
77. Future Scaling

If a module becomes independently scalable, it may later become a separate service.

Possible future services:

AI Service
Import Service
Media Processing
Automation Worker
Notification Service
Analytics

Do not split them prematurely.

78. Development Environment

Required:

Node.js
npm
Git
PostgreSQL / Supabase
VS Code or equivalent

Optional:

Docker
Ollama
79. Local Development

Expected flow:

Clone repository
 ↓
Install dependencies
 ↓
Configure .env
 ↓
Start database
 ↓
Run migrations
 ↓
Seed development data
 ↓
Start backend
 ↓
Start frontend

Exact commands belong in:

DEVELOPMENT-WORKFLOW.md
80. AI-Assisted Development Rules

AI coding tools may be used extensively.

However:

Documentation
 ↓
Plan
 ↓
Implement
 ↓
Test
 ↓
Review
 ↓
Update MEMORY.md

AI-generated code must not bypass architecture or security requirements.

81. Documentation as Source of Truth

The following hierarchy should be followed:

BRD
 ↓
PRD
 ↓
Architecture
 ↓
Technical Specifications
 ↓
Implementation

Code should not silently redefine product requirements.

If implementation requires changing a requirement:

Document Change
 ↓
Decision
 ↓
Code Change
82. v0.1 Technology Decision
APPROVED
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Lucide
TanStack Query
React Hook Form
Zod

Node.js
Fastify
TypeScript

PostgreSQL
Prisma
pgvector where required

Supabase Auth where used

REST
OpenAPI

Vitest
React Testing Library
Playwright

Git
GitHub
83. Decision Status

These choices are the initial v0.1 stack.

They may be changed only when:

a concrete technical limitation is discovered
cost becomes problematic
security requires a different solution
performance requires a different solution
the team documents the reason for the change
84. Final Architecture Principle

FrontDesk should optimize for:

Simple enough to build with a small team, structured enough to scale, and modular enough to replace individual technologies later.