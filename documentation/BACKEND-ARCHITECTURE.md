Next: BACKEND-ARCHITECTURE.md.

This is the backend counterpart to FRONTEND-ARCHITECTURE.md. It should define how FrontDesk's server is organized internally, without yet becoming a duplicate of DATABASE-SCHEMA.md or API.md.

Create:

FrontDesk/
└── documentation/
    └── BACKEND-ARCHITECTURE.md
It should cover
1. Backend architecture principles
2. Runtime architecture
3. Modular monolith structure for v0.1
4. API layer
5. Authentication
6. Authorization
7. Workspace/business isolation
8. Service layer
9. Repository/data-access layer
10. Domain modules
11. Business Importer pipeline
12. Knowledge Base
13. Business Memory
14. Catalog
15. Website
16. Publishing
17. QR
18. Enquiries/Inbox
19. Customers
20. Orders
21. Payments
22. Bookings
23. Notifications
24. AI Copilot
25. AI Agents
26. Action Registry
27. Approval system
28. Automations
29. Event system
30. Background jobs
31. File processing
32. External integrations
33. Caching
34. Rate limiting
35. Transactions
36. Idempotency
37. Error handling
38. Logging
39. Audit events
40. Security boundaries
41. API-to-service flow
42. Service-to-database flow
43. Worker architecture
44. Environment separation
45. Testing architecture
46. v0.1 folder structure
47. Future scalability
48. Backend coding rules for AI agents
The key architectural decision

For v0.1, I recommend we do not build microservices.

Use a:

Modular Monolith + Background Workers

Architecture:

                    Frontend / PWA
                          │
                          ▼
                    API / Backend
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
     Auth & Access    Business Core       AI
          │               │                │
          │        ┌──────┼──────┐         │
          │        │      │      │         │
          │     Catalog Website Inbox   Copilot
          │        │      │      │         │
          │        └──────┼──────┘         │
          │               │                │
          └───────────────┼────────────────┘
                          ▼
                    Service Layer
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
          PostgreSQL    Storage      Redis
              │
              ▼
          Event System
              │
              ▼
        Background Workers
              │
       ┌──────┼──────────┐
       ▼      ▼          ▼
    Import  AI Jobs   Notifications
Why modular monolith?

For your current goal—free/very-low-cost v0.1 development with a small team and AI coding agents—microservices would create unnecessary complexity:

Microservices
├── multiple deployments
├── service discovery
├── network failures
├── multiple databases/connections
├── distributed tracing
├── more infrastructure
└── much harder local development

Instead:

One backend
├── business module
├── importer module
├── catalog module
├── website module
├── inbox module
├── AI module
├── action module
├── approval module
└── automation module

with strong module boundaries inside the same application.

That gives us a future migration path:

v0.1

Modular Monolith
       │
       │ scale when necessary
       ▼
v1+
Selective extraction
       │
       ├── AI workers
       ├── Import workers
       ├── Notification service
       └── other high-load components
Important rule for the backend document

We should explicitly define:

A module may not directly reach into another module's internal implementation.

For example:

❌ Catalog → directly modify Inbox database tables

✅ Catalog
      ↓
Catalog Service
      ↓
Event
      ↓
Inbox Handler
      ↓
Inbox Service

This will become extremely important when multiple AI agents work on the codebase.