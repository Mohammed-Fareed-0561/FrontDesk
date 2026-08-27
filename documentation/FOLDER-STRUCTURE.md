# FrontDesk — Folder Structure

**Product:** FrontDesk  
**Version:** v0.1  
**Document:** Folder Structure & Code Organization  
**Status:** Draft — For Review  
**Last Updated:** 2026-08-26

---

# 1. Purpose

This document defines the repository structure for FrontDesk v0.1.

The goals are:

- predictable code organization
- easy onboarding
- safe AI-assisted development
- separation of frontend and backend responsibilities
- clear feature ownership
- scalable modular architecture
- minimal unnecessary complexity

---

# 2. Repository Root

The current repository is:

```text
FrontDesk/
│
├── frontend/
├── backend/
├── documentation/
└── README.md
3. Root-Level Responsibilities
Folder/File	Responsibility
frontend/	Web application and public business website
backend/	API, business logic, AI, database access, integrations
documentation/	Product and technical documentation
README.md	Project overview and setup instructions
4. Frontend Architecture

The frontend uses:

Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query
React Hook Form
Zod

Recommended structure:

frontend/
│
├── app/
├── components/
├── features/
├── lib/
├── hooks/
├── providers/
├── types/
├── config/
├── public/
├── styles/
├── tests/
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── eslint.config.mjs
└── README.md
5. Next.js App Router

The app/ directory contains routes and application-level layouts.

frontend/app/
│
├── layout.tsx
├── page.tsx
├── globals.css
│
├── (auth)/
├── (dashboard)/
├── (public)/
│
├── api/
└── not-found.tsx
6. Route Groups

Use Next.js route groups to organize pages without affecting URLs.

Example:

app/
│
├── (auth)/
│   ├── login/
│   ├── signup/
│   └── onboarding/
│
├── (dashboard)/
│   └── dashboard/
│
└── (public)/
    └── [businessSlug]/
7. Authentication Routes
frontend/app/(auth)/
│
├── login/
│   └── page.tsx
│
├── signup/
│   └── page.tsx
│
├── forgot-password/
│   └── page.tsx
│
└── onboarding/
    └── page.tsx

Authentication UI should remain separate from business functionality.

8. Dashboard Routes

The dashboard is the private business-management application.

frontend/app/(dashboard)/
│
└── dashboard/
    │
    ├── page.tsx
    │
    ├── business/
    ├── importer/
    ├── catalog/
    ├── website/
    ├── enquiries/
    ├── customers/
    ├── qr/
    ├── ai/
    ├── automations/
    ├── analytics/
    └── settings/
9. Dashboard Philosophy

The dashboard should be organized around business tasks rather than technical concepts.

Prefer:

Products
Customers
Enquiries
Website
Business

over:

Database
Entities
API
Models

The user should never need to understand the internal architecture.

10. Public Website Routes

Public business pages belong under:

frontend/app/(public)/

Example:

frontend/app/(public)/
│
└── [businessSlug]/
    ├── page.tsx
    ├── menu/
    ├── products/
    ├── services/
    ├── contact/
    └── about/

The exact generated routes may depend on the website configuration.

11. Dynamic Business Website

Example:

/business/royal-bakes

The route should retrieve the business's published website configuration.

Conceptually:

URL
 ↓
Business Slug
 ↓
Business
 ↓
Published Website Version
 ↓
Renderer
 ↓
Public Website
12. Website Renderer

Do not create separate hardcoded React pages for every business.

Instead:

Website Configuration
        ↓
Section Renderer
        ↓
React Components
        ↓
Public Website

Example:

Hero
Gallery
Products
Services
Testimonials
Contact
Map
CTA
13. Frontend Components

Global reusable components belong in:

frontend/components/

Structure:

components/
│
├── ui/
├── layout/
├── navigation/
├── forms/
├── feedback/
├── data-display/
└── business/
14. UI Components

Components generated or customized from shadcn/ui belong in:

frontend/components/ui/

Examples:

button.tsx
input.tsx
dialog.tsx
dropdown-menu.tsx
table.tsx
tabs.tsx
toast.tsx

These should remain generic.

15. Layout Components
components/layout/

Examples:

DashboardShell.tsx
Sidebar.tsx
Topbar.tsx
MobileNavigation.tsx
PageHeader.tsx
16. Business Components

Business-specific reusable components belong in:

components/business/

Examples:

BusinessCard.tsx
BusinessStatus.tsx
BusinessHours.tsx
BusinessLogo.tsx
BusinessProfile.tsx
17. Feature-Based Organization

Feature-specific code belongs under:

frontend/features/

Recommended v0.1 structure:

features/
│
├── auth/
├── onboarding/
├── business/
├── importer/
├── catalog/
├── website/
├── enquiries/
├── customers/
├── qr/
├── ai/
├── memory/
├── automations/
├── analytics/
└── settings/
18. Feature Structure

Each feature should be self-contained where practical.

Example:

features/catalog/
│
├── components/
├── hooks/
├── api/
├── schemas/
├── types/
├── utils/
└── index.ts
19. Feature Components

Example:

features/catalog/components/
│
├── ProductList.tsx
├── ProductCard.tsx
├── ProductForm.tsx
├── ProductEditor.tsx
├── CategoryList.tsx
└── CategoryEditor.tsx
20. Feature API Functions

Example:

features/catalog/api/
│
├── getProducts.ts
├── getProduct.ts
├── createProduct.ts
├── updateProduct.ts
└── deleteProduct.ts

These should communicate with the backend API.

21. Feature Schemas

Example:

features/catalog/schemas/
│
├── product.schema.ts
├── category.schema.ts
└── offer.schema.ts

Use Zod.

22. Feature Types

Example:

features/catalog/types/
│
├── product.ts
├── category.ts
└── offer.ts

Avoid duplicating types unnecessarily.

23. Shared Frontend Library

Use:

frontend/lib/

for application-wide utilities.

Example:

lib/
│
├── api/
├── auth/
├── storage/
├── formatting/
├── validation/
├── analytics/
└── utils/
24. API Client
frontend/lib/api/

Contains the shared HTTP client.

Example:

client.ts
errors.ts
request.ts

Feature-specific API functions should remain inside their features.

25. Authentication Utilities
frontend/lib/auth/

Potential files:

session.ts
permissions.ts
guards.ts
26. Formatting Utilities
frontend/lib/formatting/

Examples:

currency.ts
date.ts
phone.ts
number.ts
27. Global Hooks

Use:

frontend/hooks/

only for genuinely shared hooks.

Examples:

useDebounce.ts
useMediaQuery.ts
useOnlineStatus.ts
useToast.ts

Feature-specific hooks should stay inside their feature.

28. Providers

Global providers belong in:

frontend/providers/

Examples:

QueryProvider.tsx
AuthProvider.tsx
ThemeProvider.tsx
29. Configuration

Application configuration belongs in:

frontend/config/

Example:

site.ts
navigation.ts
features.ts
environment.ts

Never store secrets here.

30. Public Assets

Static assets belong in:

frontend/public/

Example:

public/
│
├── icons/
├── images/
├── logos/
└── manifest/

Do not store user-uploaded business media here.

User media belongs in object storage.

31. Global Styles
frontend/styles/

Global styling should be minimal.

The primary styling system remains Tailwind CSS.

32. Frontend Tests
frontend/tests/

Possible structure:

tests/
│
├── unit/
├── integration/
└── e2e/

Component tests may also live next to their components.

33. Backend Architecture

The backend is a:

Modular Monolith

Recommended structure:

backend/
│
├── src/
│   ├── app/
│   ├── config/
│   ├── modules/
│   ├── shared/
│   ├── infrastructure/
│   ├── jobs/
│   └── server.ts
│
├── prisma/
├── tests/
│
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── README.md
34. Backend Entry Point
backend/src/server.ts

Responsible for starting the server.

It should not contain business logic.

35. Application Bootstrap
backend/src/app/

Example:

app/
│
├── app.ts
├── plugins/
├── middleware/
├── routes/
└── errors/
36. Fastify Configuration

app.ts should configure:

Fastify
plugins
middleware
authentication
validation
routes
error handling
logging
37. Backend Modules

Core business modules:

backend/src/modules/
│
├── auth/
├── workspaces/
├── businesses/
├── catalog/
├── importer/
├── websites/
├── media/
├── customers/
├── enquiries/
├── conversations/
├── qr/
├── knowledge/
├── memory/
├── ai/
├── actions/
├── approvals/
├── automations/
├── analytics/
├── events/
└── audit/
38. Module Philosophy

Each backend module owns its domain logic.

Example:

catalog/

owns:

products
categories
services
offers

It should not contain unrelated website logic.

39. Backend Module Structure

Example:

modules/catalog/
│
├── catalog.routes.ts
├── catalog.controller.ts
├── catalog.service.ts
├── catalog.repository.ts
├── catalog.schemas.ts
├── catalog.types.ts
└── index.ts
40. Route Layer

Routes define HTTP endpoints.

Example:

catalog.routes.ts

Responsibilities:

route registration
authentication hooks
request validation
calling controllers/services

Routes should remain thin.

41. Controller Layer

Controllers translate HTTP requests into application operations.

Example:

catalog.controller.ts

Responsibilities:

Request
 ↓
Validate
 ↓
Call Service
 ↓
Format Response

Controllers should not contain large business rules.

42. Service Layer

Business logic belongs here.

Example:

catalog.service.ts

Potential operations:

createProduct()
updateProduct()
archiveProduct()
getProducts()
43. Repository Layer

Database access belongs in:

*.repository.ts

Example:

catalog.repository.ts

The service should not scatter raw Prisma queries throughout business logic.

44. Schema Layer

Validation schemas belong in:

*.schemas.ts

Use Zod or the chosen Fastify-compatible schema mechanism.

Validate:

request body
query parameters
route parameters
important external responses
45. Types

Domain-specific types belong in:

*.types.ts

Do not duplicate database models unnecessarily.

46. Shared Backend Code
backend/src/shared/

For reusable cross-module utilities.

Example:

shared/
│
├── errors/
├── types/
├── constants/
├── utils/
├── validation/
├── security/
└── logging/
47. Infrastructure

External-system implementations belong in:

backend/src/infrastructure/

Example:

infrastructure/
│
├── database/
├── auth/
├── storage/
├── ai/
├── email/
├── whatsapp/
├── payments/
└── search/
48. Provider Abstraction

Example:

infrastructure/ai/
│
├── AIProvider.ts
├── providers/
│   ├── ollama/
│   ├── groq/
│   └── gemini/
└── AIService.ts

Business modules should depend on the internal AI interface rather than provider SDKs.

49. Storage Infrastructure
infrastructure/storage/
│
├── StorageProvider.ts
├── local/
└── object-storage/

This allows storage providers to be replaced.

50. Email Infrastructure
infrastructure/email/
│
├── EmailProvider.ts
├── providers/
└── EmailService.ts
51. WhatsApp Infrastructure
infrastructure/whatsapp/
│
├── WhatsAppProvider.ts
├── providers/
└── WhatsAppService.ts
52. Payment Infrastructure
infrastructure/payments/
│
├── PaymentProvider.ts
├── providers/
└── PaymentService.ts

Payments may remain unused until the corresponding feature is implemented.

53. Database Folder
backend/prisma/
│
├── schema.prisma
├── migrations/
└── seed.ts
54. Prisma Schema

The canonical Prisma schema belongs in:

backend/prisma/schema.prisma

It must remain synchronized with:

documentation/DATABASE-SCHEMA.md
55. Migrations
backend/prisma/migrations/

Every database schema change must be represented by a migration.

Never manually alter production schemas without a migration.

56. Seed Data
backend/prisma/seed.ts

Development seed data should create:

Demo User
Demo Workspace
Demo Business
Demo Catalog
Demo Website
Demo Customers
Demo Enquiries
Demo Business Memory
57. Background Jobs

Background jobs belong in:

backend/src/jobs/

Example:

jobs/
│
├── import/
├── ai/
├── media/
├── notifications/
├── automations/
└── analytics/
58. Job Design

Jobs should be:

retryable
observable
idempotent where possible
isolated from HTTP request lifecycle
59. Events

Domain event definitions and handlers belong in:

backend/src/modules/events/

Example:

events/
│
├── event.types.ts
├── event.publisher.ts
├── event.handlers.ts
└── event.registry.ts
60. Audit Module
backend/src/modules/audit/

Responsible for recording important mutations.

Example:

AI updated product price
Owner published website
Staff replied to enquiry
61. AI Module
backend/src/modules/ai/

Suggested:

ai/
│
├── ai.routes.ts
├── ai.controller.ts
├── ai.service.ts
├── ai.schemas.ts
├── ai.types.ts
├── prompts/
├── tools/
└── index.ts
62. AI Prompts

AI prompt templates should not be scattered throughout the codebase.

Store them in:

modules/ai/prompts/

Example:

business-analysis.prompt.ts
import-extraction.prompt.ts
customer-support.prompt.ts
website-generation.prompt.ts
copilot.prompt.ts
63. AI Tools

AI-callable actions belong in:

modules/ai/tools/

Example:

getBusinessInfo.ts
getProducts.ts
searchKnowledge.ts
createProduct.ts
updateProduct.ts
createOffer.ts

Tools must go through the Action/Permission system for mutations.

64. Business Memory Module
backend/src/modules/memory/

Responsibilities:

create memory
update memory
retrieve memory
validate memory
archive memory
record memory events
65. Knowledge Module
backend/src/modules/knowledge/

Responsibilities:

document ingestion
chunking
embedding
retrieval
source tracking
66. Importer Module
backend/src/modules/importer/

Suggested:

importer/
│
├── import.routes.ts
├── import.controller.ts
├── import.service.ts
├── import.repository.ts
├── extractors/
├── normalizers/
├── validators/
├── conflict/
└── index.ts
67. Import Extractors

Different input sources should have separate extractors.

extractors/
│
├── website/
├── pdf/
├── csv/
├── image/
└── manual/
68. Import Pipeline
Input
 ↓
Extractor
 ↓
Raw Data
 ↓
Normalizer
 ↓
Structured Data
 ↓
Validator
 ↓
Conflict Detector
 ↓
Review
 ↓
Import
69. Website Module
backend/src/modules/websites/

Responsible for:

website configuration
pages
sections
versions
publishing
domains
70. Website Renderer Contract

Frontend and backend must agree on a stable website configuration schema.

The backend stores:

Website
Page
Section
Theme
SEO
Version

The frontend renders it.

71. Catalog Module
backend/src/modules/catalog/

Owns:

categories
products
variants
services
offers
72. Customer Module
backend/src/modules/customers/

Owns:

customer profiles
preferences
consents
customer history references
73. Enquiry Module
backend/src/modules/enquiries/

Owns:

enquiries
statuses
assignment
follow-up
74. Conversation Module
backend/src/modules/conversations/

Owns:

conversations
messages
channels
message state
75. QR Module
backend/src/modules/qr/

Responsible for generating/configuring QR destinations.

76. Analytics Module
backend/src/modules/analytics/

Responsible for:

event collection
basic metrics
business activity

Advanced analytics may be added later.

77. Automation Module
backend/src/modules/automations/

Owns:

automation definitions
triggers
conditions
steps
runs
78. Action Module
backend/src/modules/actions/

Owns:

action definitions
action validation
action execution
permissions
79. Approval Module
backend/src/modules/approvals/

Owns:

approval requests
approval state
approval decisions
80. Configuration Files

Backend configuration:

backend/src/config/
│
├── env.ts
├── database.ts
├── auth.ts
├── ai.ts
├── storage.ts
└── app.ts
81. Environment Validation

Environment variables should be validated at application startup.

Invalid configuration should cause a clear startup error.

82. Backend Tests
backend/tests/
│
├── unit/
├── integration/
└── e2e/

Feature-specific tests may also be colocated where useful.

83. Documentation Folder

Current structure:

documentation/

contains product and technical documents.

The documentation should remain separate from application code.

84. Documentation Categories

Recommended categories:

Product
Architecture
Features
Technical
Security
Operations
AI Development

The existing documentation filenames should remain usable rather than renaming everything unnecessarily.

85. Documentation Naming

Use:

UPPERCASE-WITH-DASHES.md

Examples:

PRD.md
BRD.md
DATABASE-SCHEMA.md
TECH-STACK.md
SECURITY.md
86. Project README

Root:

FrontDesk/README.md

Should contain:

What FrontDesk is
Current version
Architecture overview
Local setup
Links to documentation
Development commands

It should remain concise.

87. Frontend README
frontend/README.md

Contains:

Frontend setup
Environment variables
Development command
Build command
Testing
Architecture notes
88. Backend README
backend/README.md

Contains:

Backend setup
Environment variables
Database setup
Migrations
Seed data
Development command
Testing
89. Generated Files

Do not manually edit generated files.

Examples may include:

.next/
node_modules/
coverage/
dist/
generated Prisma client

These should be ignored by Git where appropriate.

90. Git Ignore

Root or project-specific .gitignore should include:

node_modules/
.next/
dist/
coverage/
.env
.env.*
!.env.example

Exact rules depend on the tooling.

91. Secrets

Never commit:

API keys
database passwords
JWT secrets
OAuth secrets
WhatsApp tokens
payment secrets
AI provider keys
92. Temporary Files

Temporary files should not accumulate in the repository.

Use:

/tmp

or an ignored development directory where necessary.

93. Generated AI Artifacts

AI-generated intermediate files should not automatically be committed.

Only retain artifacts that are required by the application or documentation.

94. Naming Conventions
TypeScript files

Prefer:

camelCase.ts
PascalCase.tsx

depending on whether the file exports a component.

Example:

productService.ts
ProductCard.tsx
95. Components

React components use:

PascalCase

Example:

ProductCard.tsx
BusinessHeader.tsx
ImportWizard.tsx
96. Functions

Use:

camelCase

Example:

createProduct()
getBusiness()
publishWebsite()
97. Database Naming

Database naming convention:

snake_case

Example:

business_id
created_at
updated_at
98. API Naming

REST endpoints should generally use plural nouns.

Correct:

/products
/customers
/enquiries
/businesses

Avoid:

/getProducts
/createCustomer
99. Feature Ownership

A developer should be able to answer:

"Where does this code belong?"

Use:

UI-only
 → components/

Feature UI
 → features/<feature>/

API
 → backend/modules/<feature>/

Database
 → prisma/

External provider
 → infrastructure/

Shared utility
 → shared/lib/
100. Dependency Direction

The architecture should generally follow:

Route
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Database

External providers:

Service
 ↓
Internal Interface
 ↓
Infrastructure Adapter
 ↓
Provider
101. Avoid Circular Dependencies

Modules should not import each other's internal implementation details unnecessarily.

Prefer public module interfaces.

102. Cross-Module Communication

If Catalog needs information from Customers:

Prefer:

Catalog Service
 ↓
Customer Public Service Interface

rather than importing internal customer repository implementation.

103. Business Logic Location

Do not place business rules in:

React components
database queries
route handlers
AI prompts

Business rules belong in backend services/domain logic.

104. Frontend Responsibility

Frontend handles:

presentation
interaction
client-side validation
loading states
navigation
local UI state
105. Backend Responsibility

Backend handles:

authorization
business rules
database mutations
AI actions
security
integrations
audit
106. Database Responsibility

Database handles:

persistence
constraints
relationships
indexes
transactions
107. AI Responsibility

AI handles:

interpretation
classification
generation
recommendations
structured action proposals

AI does not become the source of truth.

108. AI Action Boundary

Correct:

AI
 ↓
Action Proposal
 ↓
Validation
 ↓
Permission
 ↓
Approval
 ↓
Execution

Incorrect:

AI
 ↓
Direct SQL
109. Documentation-Code Relationship

Every major module should have a corresponding documentation reference.

Example:

Importer
 ↕
BUSINESS-IMPORTER.md

Website
 ↕
WEBSITE-BUILDER.md

AI
 ↕
AI-AGENTS.md
AI-BUSINESS-COPILOT.md

Actions
 ↕
ACTION-REGISTRY.md
110. AI Developer Rule

Any AI coding agent working on FrontDesk must first inspect:

documentation/MEMORY.md

then relevant architecture/feature documents.

It should not scan the entire repository unnecessarily.

111. AI Change Workflow

Before coding:

Read MEMORY.md
 ↓
Identify relevant feature
 ↓
Read relevant documentation
 ↓
Inspect relevant code
 ↓
Plan
 ↓
Implement
 ↓
Test
 ↓
Update documentation
 ↓
Update MEMORY.md
112. MEMORY.md Location

Project-level AI development memory:

FrontDesk/MEMORY.md

Not:

documentation/BUSINESS-MEMORY.md

These serve different purposes.

113. MEMORY.md Rule

MEMORY.md should contain:

Current implementation state
Completed work
Active work
Pending work
Known bugs
Architecture decisions
Environment notes
Important commands
Files changed
Next recommended task

It should not become a copy of the entire codebase.

114. Feature Completion

When a feature is completed:

Code
 ↓
Tests
 ↓
Documentation
 ↓
MEMORY.md

All four should be updated where applicable.

115. v0.1 Folder Structure

The intended high-level structure is:

FrontDesk/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── lib/
│   ├── hooks/
│   ├── providers/
│   ├── types/
│   ├── config/
│   ├── public/
│   ├── styles/
│   └── tests/
│
├── backend/
│   ├── src/
│   │   ├── app/
│   │   ├── config/
│   │   ├── modules/
│   │   ├── shared/
│   │   ├── infrastructure/
│   │   └── jobs/
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   └── tests/
│
├── documentation/
│
├── MEMORY.md
├── README.md
└── .gitignore
116. v0.1 Implementation Boundary

Do not create folders for every future feature immediately.

Create modules when implementation begins.

For example:

If inventory is not part of the v0.1 implementation:

backend/src/modules/inventory/

does not need to exist yet.

117. Avoid Empty Architecture

Do not create:

50 empty modules

just because the roadmap contains 50 features.

The architecture should describe where future functionality belongs without requiring empty code.

118. Current v0.1 Core Modules

The first implementation should prioritize:

auth
workspaces
businesses
catalog
importer
websites
media
customers
enquiries
conversations
qr
knowledge
memory
ai
actions
approvals
audit

Automation and advanced analytics can follow according to the actual MVP scope.

119. Architecture Principle

Organize code around business capabilities, not around file types alone.

Bad:

controllers/
services/
models/

containing every feature mixed together.

Better:

modules/
 ├── catalog/
 ├── importer/
 ├── website/
 └── enquiries/

with each module owning its implementation.

120. Final Rule

The folder structure exists to make the codebase understandable.

It should never become a rigid bureaucracy.

If a new structure is objectively better:

Document the reason
 ↓
Update this file
 ↓
Implement consistently