# FrontDesk — Business Memory Specification

**Product:** FrontDesk  
**Version:** v0.1  
**Module:** Business Memory  
**Document:** Feature Specification  
**Status:** Implemented (P0)  
**Last Updated:** 2026-08-29

---

# 1. Purpose

Business Memory stores persistent business preferences, rules, policies, and instructions that help AI and automations make better decisions for the business.

The core model is:

```text
Business Owner
      ↓
Sets Preference / Rule / Policy
      ↓
Stored as Business Memory
      ↓
Retrieved by AI / Automations
      ↓
Applied to business operations
```

---

# 2. Core Concept

Business Memory provides long-term context that survives across conversations, sessions, and AI interactions.

Example:

```text
Business Owner:
"Never discount premium cakes below ₹500."

Stored:
Memory Type: RULE
Content: "Never discount premium cakes below ₹500."
Scope: BUSINESS
Priority: HIGH

Retrieved by:
- AI Copilot (when suggesting pricing)
- Automation Engine (when evaluating discount actions)
- AI Agents (when responding to customer pricing queries)
```

---

# 3. Memory Types

Supported memory types:

| Type | Purpose | Example |
|------|---------|---------|
| PREFERENCE | Business owner preference | "Use Tamil + English for customer messages" |
| RULE | Business rule or policy | "Never offer discounts above 15%" |
| POLICY | Formal business policy | "All refunds require manager approval" |
| INSTRUCTION | Operational instruction | "Always confirm bookings via phone" |
| BRAND_PREFERENCE | Brand voice/tone | "Professional, minimal emoji" |

---

# 4. Memory Scope

Memory can be scoped to different business entities:

| Scope | Description |
|-------|-------------|
| BUSINESS | Applies to entire business |
| LOCATION | Applies to specific location |
| PRODUCT | Applies to specific product |
| CATEGORY | Applies to product category |
| CUSTOMER | Applies to specific customer |
| STAFF | Applies to specific staff member |
| AGENT | Applies to specific AI agent |
| WORKFLOW | Applies to specific workflow |

---

# 5. Memory Properties

Each memory record contains:

- **id** — Unique identifier
- **businessId** — Tenant-scoped business reference
- **key** — Optional searchable key
- **content** — Memory content (text)
- **memoryType** — Type classification
- **scope** — Scope classification
- **scopeEntityId** — Optional entity reference
- **priority** — LOW, MEDIUM, HIGH, MANDATORY
- **importance** — 1-5 rating
- **confidence** — 0-1 confidence score
- **source** — Who/what created this memory
- **status** — active, superseded, archived, expired, pending_approval, conflicted
- **createdBy** — Who created it
- **approvedBy** — Who approved it (if required)
- **expiresAt** — Optional expiration

---

# 6. Memory Sources

Memories can originate from:

| Source | Description |
|--------|-------------|
| OWNER | Business owner manually set |
| STAFF | Staff member contributed |
| AI_SUGGESTION | AI recommended, owner confirmed |
| SYSTEM | System-generated |
| IMPORT | Imported from external data |
| WORKFLOW | Created by automation/workflow |

---

# 7. P0 Implementation

### Schema (Prisma)

- `BusinessMemory` — stores memory records with type, scope, priority, and status
- `MemoryEvent` — audit trail of memory changes

### API

- `GET /api/v1/businesses/:businessId/memories` — list memories with filtering
- `POST /api/v1/businesses/:businessId/memories` — create memory
- `GET /api/v1/businesses/:businessId/memories/:memoryId` — get memory
- `PATCH /api/v1/businesses/:businessId/memories/:memoryId` — update memory
- `DELETE /api/v1/businesses/:businessId/memories/:memoryId` — archive memory

### Retrieval

The memory retrieval system provides relevant memories for AI context:

- Scope-aware retrieval (business, location, product, customer)
- Priority-based ordering
- Status filtering (active only by default)
- Tenant isolation enforced

### Frontend

- `/dashboard/memory` — memory management page
- Create, edit, archive memories
- Filter by type, scope, status
- Priority visualization

---

# 8. Memory and Automations

Automations can reference and use business memory:

```text
Automation: "High-Value Order Recognition"
Trigger: ORDER_COMPLETED
Condition: order.total > 1000
Memory Used: "Loyalty program rules"
Action: CREATE_PRODUCT (loyalty entry)
```

---

# 9. Memory and AI

AI systems use memory for context:

```text
Customer: "Do you offer discounts?"

AI retrieves:
- Memory: "Never discount premium cakes below ₹500" (RULE, HIGH)
- Memory: "Use professional tone" (BRAND_PREFERENCE)

AI responds:
"We maintain premium pricing for our specialty items.
 Our standard offerings start from ₹350."
```

---

# 10. Security

- All memory operations are tenant-scoped
- Memory content is validated (no code execution)
- Memory changes are audited via MemoryEvent
- Sensitive memory may require approval
- Memory can expire and be automatically archived

---

# 11. Non-Goals (P0)

Not implemented in P0:

- AI auto-generated memory suggestions
- Memory conflict detection/resolution
- Memory versioning
- Cross-business memory sharing
- Memory-based personalization engine
- Automatic memory expiration policies
