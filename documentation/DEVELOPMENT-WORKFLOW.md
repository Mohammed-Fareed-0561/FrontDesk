# FrontDesk — Development Workflow

**Product:** FrontDesk  
**Version:** v0.1  
**Document:** Development Workflow  
**Status:** Draft — Engineering Source of Truth  
**Last Updated:** 2026-08-26

---

# 1. Purpose

This document defines how FrontDesk v0.1 is developed, tested, reviewed, documented, handed off, and maintained.

It is specifically designed for a development environment where:

- human developers
- AI coding agents
- multiple AI systems
- frontend developers
- backend developers

may work on the same codebase at different times.

The objective is to prevent:

- conflicting implementations
- duplicate features
- undocumented architectural changes
- accidental breaking changes
- security regressions
- AI agents misunderstanding project state
- one AI overwriting another AI's work
- undocumented technical decisions

---

# 2. Core Development Principle

FrontDesk development follows:

> Understand → Plan → Implement → Verify → Document → Handoff.

AI agents must never begin large implementation work by blindly generating code.

---

# 3. Source-of-Truth Hierarchy

When information conflicts, use the following priority:

```text
1. Explicit product decision
2. PRD / BRD
3. Architecture documentation
4. Security documentation
5. API / database contracts
6. UI/UX documentation
7. Existing implementation
8. AI assumption

An AI must not silently choose an assumption when a higher-level source is ambiguous.

4. Project Structure

The project is organized as:

FrontDesk/
│
├── frontend/
│
├── backend/
│
└── documentation/

Documentation is part of the engineering system.

It is not optional project decoration.

5. AI Agent Startup Protocol

Every AI coding agent must begin a development session by reading:

MEMORY.md

if available at the project root.

Then determine:

Current project state
Current active feature
Completed work
Known issues
Pending work
Recent decisions
Blocked tasks
6. Documentation Reading Protocol

An AI must NOT read every documentation file for every task.

It should identify the minimum relevant documents.

Example:

For catalog work:

MEMORY.md
PRD.md
USER-STORIES.md
INVENTORY-AND-CATALOG-OPERATIONS.md
BUSINESS-MODEL.md
DATABASE-SCHEMA.md
API.md
UI-UX-SPECIFICATION.md
DESIGN-SYSTEM.md
FRONTEND-ARCHITECTURE.md
BACKEND-ARCHITECTURE.md
SECURITY.md
7. Task Classification

Before coding, classify the task.

Possible categories:

Feature
Bug
Refactor
Security
Performance
Database
API
Frontend
Backend
Infrastructure
Documentation
Testing
8. Small Task Workflow

For a small task:

Read MEMORY
 ↓
Read relevant documentation
 ↓
Inspect affected code
 ↓
Plan
 ↓
Implement
 ↓
Test
 ↓
Update MEMORY
9. Large Feature Workflow

For a large feature:

Read MEMORY
 ↓
Read requirements
 ↓
Read architecture
 ↓
Read relevant data/API docs
 ↓
Inspect codebase
 ↓
Create implementation plan
 ↓
Identify affected modules
 ↓
Implement incrementally
 ↓
Run tests
 ↓
Run security checks
 ↓
Review integration
 ↓
Update documentation
 ↓
Update MEMORY
10. Never Code From Memory Alone

AI agents must not assume that previous conversations represent the current codebase.

The codebase is the implementation source of truth.

Documentation defines intended behavior.

MEMORY.md defines current project state.

11. Existing Code Inspection

Before creating a new:

component
hook
service
utility
API route
database model
schema
type

the AI must search the existing codebase.

12. Duplicate Prevention

Before creating something new, ask:

Does this already exist?

Can an existing implementation be reused?

Can the existing implementation be extended?

Is this genuinely a new abstraction?

Do not create duplicate versions of existing functionality.

13. Example of Bad AI Behavior

Bad:

components/Button.tsx
components/PrimaryButton.tsx
components/common/ActionButton.tsx
components/ui/BusinessButton.tsx

when all perform the same function.

14. Preferred Approach

Use one canonical component:

Button

with variants:

primary
secondary
destructive
ghost
15. Feature Boundaries

Every major feature should belong to a defined module.

Examples:

Business
Importer
Catalog
Website
Inbox
Copilot
Approvals
Activity
Settings
16. Module Ownership

A module owns:

business logic
validation
services
types
tests
UI components

where appropriate.

Other modules should interact through defined interfaces rather than accessing internal implementation details.

17. Cross-Module Communication

Avoid direct internal access.

Bad:

Catalog module
    ↓
directly modifies
Inbox database tables

Preferred:

Catalog Service
    ↓
Event / defined service interface
    ↓
Inbox Service
18. Frontend Development

Frontend development must follow:

UI-UX-SPECIFICATION.md
DESIGN-SYSTEM.md
FRONTEND-ARCHITECTURE.md

before introducing new patterns.

19. Backend Development

Backend development must follow:

BACKEND-ARCHITECTURE.md
SYSTEM-ARCHITECTURE.md
API.md
DATABASE-SCHEMA.md
SECURITY.md
20. Database Changes

Never modify production database structure casually.

Every schema change must be represented as a migration.

Workflow:

Design change
 ↓
Review data model
 ↓
Create migration
 ↓
Apply locally
 ↓
Run tests
 ↓
Verify existing functionality
21. Database Migration Rules

Migrations must be:

repeatable
ordered
reviewable
safe
documented

Avoid destructive migrations unless explicitly approved.

22. Data Migration

When changing an existing data structure:

Schema change
 ↓
Data migration if required
 ↓
Validation
 ↓
Application update
 ↓
Cleanup migration later

Do not immediately delete old data structures if a safe transition is required.

23. API Changes

Before changing an API:

Identify consumers
 ↓
Check API.md
 ↓
Check frontend usage
 ↓
Determine compatibility impact
 ↓
Implement
 ↓
Test
 ↓
Update API documentation
24. Breaking API Changes

Breaking changes require explicit documentation.

Record:

Old behavior
New behavior
Reason
Migration requirement
Affected clients
25. API Contract

The frontend must not invent backend response structures.

The backend must expose documented contracts.

If the API changes, update:

API.md

and affected frontend types.

26. Type Safety

Frontend and backend types should be strongly typed where practical.

Avoid:

any
unknown
untyped API responses

unless there is a documented reason.

27. Environment Variables

Never hardcode:

API keys
database passwords
JWT secrets
private credentials
service tokens

inside source code.

28. Environment Separation

Use separate environments conceptually:

Development
Testing
Production

Never point local development at production data unless explicitly authorized and protected.

29. Secrets

Secrets must be supplied through secure environment configuration.

Never commit:

.env
private keys
API secrets
database credentials
service tokens

to source control.

30. Frontend Environment Variables

Only variables safe for frontend exposure may be exposed to the client.

A frontend environment variable must NEVER be treated as secret merely because it is stored in .env.

Anything shipped to the browser is potentially public.

31. Authentication

Authentication logic must follow:

USER-ACCOUNTS-AND-WORKSPACES.md
SECURITY.md

Do not implement custom authentication shortcuts without explicit architectural approval.

32. Authorization

Authentication answers:

Who are you?

Authorization answers:

What are you allowed to do?

Every protected backend operation must enforce authorization server-side.

33. Tenant Isolation

Every business/workspace-scoped operation must verify the appropriate ownership or membership.

Never trust a client-provided:

business_id
workspace_id
user_id

without server-side authorization.

34. Security Before Convenience

If a shortcut makes development easier but weakens:

authentication
authorization
tenant isolation
data protection
API security

do not use the shortcut.

35. AI Coding Security Rule

AI agents must treat security-sensitive code as high-risk.

Examples:

authentication
authorization
API keys
sessions
payments
file uploads
database access
AI tool execution
webhooks
admin actions

These areas require additional review.

36. Security Documentation

Security changes must be checked against:

SECURITY.md

If a new security boundary is introduced, update the security documentation.

37. AI Action Development

AI actions must follow:

ACTION-REGISTRY.md
AI-AGENTS.md
AI-BUSINESS-COPILOT.md
SECURITY.md

AI agents must not invent arbitrary backend actions.

38. AI Action Rule

Every AI-executable action must have:

defined action
input schema
authorization requirements
validation
execution behavior
audit behavior
error behavior
39. AI Approval Rule

Actions requiring human approval must not bypass the approval mechanism.

Bad:

Copilot
 ↓
Direct database mutation

Preferred:

Copilot
 ↓
Action proposal
 ↓
Permission check
 ↓
Approval
 ↓
Execution
 ↓
Audit
40. AI Uncertainty

AI must not silently invent missing business information.

If information is uncertain:

flag uncertainty
request clarification
or avoid taking the action
41. Import Development

Business import changes must respect:

BUSINESS-IMPORTER.md
BUSINESS-KNOWLEDGE-BASE.md
BUSINESS-MEMORY.md

Imported information should preserve source context where required.

42. Import Safety

Import operations must not blindly overwrite important business data.

When conflicts exist:

Detect
 ↓
Present
 ↓
Review
 ↓
Apply
43. File Uploads

File uploads must be treated as untrusted input.

Validate:

file type
file size
content
filename
storage path
authorization
44. User-Generated Content

Treat user-provided:

text
images
documents
URLs
metadata

as untrusted input.

Never assume uploaded content is safe.

45. Testing Philosophy

Testing is part of implementation.

A feature is not complete merely because:

the page loads
46. Minimum Testing Layers

Depending on feature:

Unit tests
Integration tests
API tests
Component tests
End-to-end tests
Security tests
47. Unit Tests

Use unit tests for:

business rules
validation
utility functions
data transformations
permission logic
48. Integration Tests

Use integration tests for:

API + database
service interactions
authentication flows
module interactions
49. End-to-End Tests

Critical flows should have end-to-end coverage.

v0.1 priority:

Sign up
Login
Business import
Import review
Publish website
Catalog update
QR access
Customer enquiry
Inbox reply
AI suggestion
Approval
50. Security Testing

Security-sensitive features should be tested for:

unauthorized access
cross-workspace access
invalid tokens
expired sessions
IDOR
privilege escalation
rate limiting
input validation
file upload abuse
API abuse
51. Frontend Verification

Before considering a frontend feature complete:

desktop
mobile
loading
empty
error
success
permission
accessibility

must be checked as applicable.

52. Build Verification

Before handoff, run:

lint
typecheck
tests
build

where those scripts exist.

53. Do Not Ignore Errors

AI agents must not conclude:

The feature works.

while known:

type errors
build errors
console errors
failing tests
API errors

remain unresolved.

If an error is intentionally deferred, document it.

54. Browser Verification

For user-facing features, verify the actual browser experience when practical.

Check:

layout
navigation
interaction
console
network errors
responsive behavior
55. Performance

Avoid unnecessary:

API requests
database queries
rerenders
large client bundles
unoptimized images
56. Caching

Caching must not cause stale critical business information.

For mutable business data:

define cache duration
define invalidation
define source of truth
57. Optimistic UI

Use optimistic updates only when failure can be safely recovered.

Never show irreversible success before server confirmation.

58. Error Handling

Errors should be:

caught
classified
logged appropriately
shown safely to users
recoverable where possible
59. User-Facing Errors

Do not expose:

stack traces
database queries
internal secrets
service credentials
internal infrastructure details
60. Logging

Logs should help developers understand:

what happened
where it happened
when it happened
which request/job was involved

Sensitive information must not be unnecessarily logged.

61. Audit Logging

Security-sensitive and business-critical actions should generate appropriate audit events.

Examples:

API key created
Business data changed
AI action approved
Website published
Permission changed
62. Commit Strategy

Commits should represent coherent changes.

Good:

feat: add business import review
fix: prevent duplicate product submission
docs: update API contract
test: add workspace authorization coverage

Avoid giant commits containing unrelated changes.

63. Commit Scope

Prefer:

one feature
one bug fix
one refactor

per logical commit where practical.

64. Do Not Mix Unrelated Changes

Avoid:

feature implementation
+
mass formatting
+
unrelated refactor
+
dependency upgrade

in one commit unless necessary.

65. Branch Strategy

Use branches for meaningful development work.

Example:

main
│
├── feature/business-import
├── feature/catalog
├── feature/inbox
├── feature/copilot
└── fix/import-validation
66. AI Agent Branch Safety

An AI agent must know which branch/worktree it is operating in before making substantial changes.

Do not assume the working tree is clean.

67. Dirty Working Tree

Before modifying files:

inspect git status

If unrelated uncommitted changes exist:

do not overwrite them

unless explicitly instructed.

68. Existing Changes

If the working tree contains changes from another AI:

inspect
understand
preserve

Do not reset or discard them blindly.

69. Dependency Changes

Before adding a package:

check whether existing dependency solves the problem
check compatibility
check maintenance status
check bundle/runtime impact

Avoid dependency bloat.

70. Free-Cost Development Principle

Because v0.1 is intended to be developed with minimal/free-cost infrastructure:

Prefer:

open-source libraries
free tiers
local development
self-hostable components
managed services only where necessary

But never choose a technology solely because it is free if it creates an unreasonable security or maintenance risk.

71. Infrastructure Simplicity

v0.1 should minimize infrastructure.

Prefer:

one frontend application
one backend application
one primary database
one storage system
background worker where necessary
72. Avoid Premature Microservices

Do not split the v0.1 backend into many services without demonstrated need.

Use modular boundaries inside the backend first.

73. Feature Flags

Use feature flags for risky or incomplete functionality when appropriate.

Do not leave hidden experimental functionality permanently active.

74. Feature Completion

A feature is not complete when code is written.

It is complete when:

implementation
+
tests
+
security
+
UX
+
documentation
+
memory

are appropriately updated.

75. Definition of Done

A feature is DONE when:

[ ] Requirements understood
[ ] Relevant docs read
[ ] Existing implementation inspected
[ ] Implementation completed
[ ] Typecheck passes
[ ] Lint passes
[ ] Tests pass
[ ] Build passes
[ ] Browser checked where relevant
[ ] Security reviewed
[ ] Error states handled
[ ] Loading states handled
[ ] Mobile checked
[ ] Documentation updated
[ ] MEMORY.md updated
76. Bug Workflow

For a bug:

Reproduce
 ↓
Identify root cause
 ↓
Determine affected area
 ↓
Fix
 ↓
Add regression test
 ↓
Verify
 ↓
Update MEMORY if relevant
77. Do Not Patch Symptoms Blindly

AI agents should identify the root cause where practical.

Bad:

Add timeout

when the actual issue is:

unhandled database failure
78. Regression Prevention

Every significant bug should lead to at least one of:

test
validation
type constraint
architecture improvement
documentation clarification

where appropriate.

79. Refactoring

Refactoring must preserve behavior unless the task explicitly changes behavior.

Before refactoring:

identify existing behavior
identify consumers
80. Large Refactoring

Large refactors should be incremental.

Prefer:

Step 1
introduce new abstraction

Step 2
migrate consumers

Step 3
verify

Step 4
remove old implementation
81. Documentation Changes

Update documentation when:

architecture changes
API changes
database changes
security behavior changes
user behavior changes
development conventions change
82. Documentation Is Code

Documentation that defines architecture or behavior must be treated as an engineering artifact.

Do not allow implementation and documentation to diverge intentionally.

83. MEMORY.md Purpose

MEMORY.md is the project's operational handoff state.

It is NOT:

a duplicate of the codebase
a copy of all documentation
a complete changelog
84. MEMORY.md Should Contain

At minimum:

Current phase
Current feature
Completed work
Current implementation state
Known issues
Important decisions
Recent changes
Blocked work
Next actions
Test status
Environment notes
Important warnings
85. MEMORY.md Must Remain Concise

Do not dump entire source files into MEMORY.md.

The purpose is:

Allow another AI to understand the current development state quickly.

86. Memory Update Timing

Update MEMORY.md after:

major feature completion
important architectural decision
important bug fix
database migration
API change
security change
handoff
87. AI Handoff

Before ending a significant development session, the AI should record:

What I changed
What works
What does not work
What remains
Files changed
Tests run
Known warnings
Next recommended step
88. Handoff Example
Current task:
Business importer review UI

Completed:
- Import review page
- Product conflict display
- Approve/reject actions

Verified:
- Typecheck
- Unit tests
- Browser mobile view

Known issue:
- Large PDF imports still need background-job integration

Next:
Implement import job polling.
89. AI Agent Must Not Claim Completion Falsely

Never write:

Completed

when implementation is partial.

Use:

Partial
Blocked
Needs verification

when appropriate.

90. Work Resumption

When an AI starts an existing task:

Read MEMORY
 ↓
Inspect changed files
 ↓
Check git status
 ↓
Run relevant tests
 ↓
Continue

Do not restart the feature from scratch.

91. Context Efficiency

AI agents should not load the entire codebase into context unnecessarily.

Use:

MEMORY
+
relevant docs
+
relevant files
+
targeted searches
92. Codebase Search

Search before editing.

Useful search targets:

component names
routes
API endpoints
database models
types
service names
TODOs
feature flags
93. TODO Rules

A TODO should be meaningful.

Bad:

TODO: fix this

Better:

TODO(v0.2): Add background processing for large PDF imports.
94. Temporary Code

Temporary implementation must be identifiable.

Do not leave experimental code that looks production-ready.

95. Mock Data

Mock data must be clearly separated from production data.

Never accidentally ship:

fake customers
fake orders
demo API keys
test credentials
96. Seed Data

Development seed data must be deterministic where practical.

97. Testing Data Isolation

Tests should not corrupt:

development data
production data
other test runs
98. API Testing

Important API tests should verify:

authentication
authorization
validation
successful operation
failure operation
tenant isolation
99. Database Testing

Important database behavior should test:

constraints
relationships
authorization assumptions
migration behavior
100. Frontend Testing

Important frontend flows should test:

rendering
interaction
validation
loading
error
success
permission behavior
101. AI Testing

AI features require deterministic safeguards around nondeterministic output.

Test:

action validation
permission enforcement
approval requirements
tool restrictions
unsafe requests
missing data
invalid AI output
102. AI Never Gets Database Authority

AI must not receive unrestricted direct database access.

AI should operate through approved application actions.

Preferred:

AI
 ↓
Action Registry
 ↓
Validation
 ↓
Authorization
 ↓
Execution
103. AI Tool Boundary

Every AI tool must define:

input schema
authorization
allowed scope
validation
side effects
audit event
104. Production Safety

Before production deployment:

[ ] Debug disabled
[ ] Secrets configured
[ ] Database migrations verified
[ ] HTTPS enabled
[ ] Security headers checked
[ ] Rate limiting enabled
[ ] Logging configured
[ ] Error reporting configured
[ ] Backups verified
[ ] CORS verified
[ ] Authentication verified
[ ] Authorization verified
105. Deployment

Deployment documentation must define:

build
test
migration
deploy
health check
rollback
106. Rollback

Every production deployment should have a known rollback strategy.

Do not deploy database changes that cannot safely coexist with the previous application version unless explicitly planned.

107. Health Checks

Backend should expose appropriate health information without leaking sensitive internals.

108. Monitoring

Monitor:

errors
latency
availability
background jobs
database health
security events
109. Incident Workflow

If production breaks:

Detect
 ↓
Assess
 ↓
Contain
 ↓
Fix / Rollback
 ↓
Verify
 ↓
Document
 ↓
Prevent recurrence
110. AI Agent Incident Rule

If an AI agent causes an unexpected regression:

Do NOT blindly make more changes.

First:

identify changed files
inspect diff
reproduce issue
identify root cause

Then fix.

111. Git Diff Review

Before committing:

inspect git diff

Check for:

unexpected files
debug code
secrets
temporary code
unrelated changes
large generated files
112. Generated Files

Do not commit generated artifacts unless the project explicitly requires them.

Examples:

build output
temporary logs
local caches
debug screenshots
113. Dependency Lock Files

Lock files should be committed when required by the selected package manager.

Do not manually edit them unless necessary.

114. Package Management

Use one package manager consistently within a project.

Do not randomly mix:

npm
pnpm
yarn
bun

without an explicit decision.

115. Backend Package Management

The same principle applies to backend dependencies.

Use the project's selected package manager and lock strategy consistently.

116. Versioning

FrontDesk v0.1 should maintain clear version identity.

Version changes should be documented when behavior materially changes.

117. Release Notes

Significant releases should document:

new features
fixes
breaking changes
security changes
known issues
118. Documentation Index

When a new major document is created:

Update the documentation index if one exists.

Do not create duplicate documents with similar purposes.

119. Duplicate Documentation Rule

Before creating a documentation file:

Search documentation/
 ↓
Check for equivalent document
 ↓
Update existing document if appropriate
 ↓
Create new document only if genuinely distinct
120. Documentation Naming

Use:

UPPERCASE-WITH-HYPHENS.md

for major engineering documents.

Example:

DATABASE-SCHEMA.md
SYSTEM-ARCHITECTURE.md
SECURITY.md
DEVELOPMENT-WORKFLOW.md
121. Documentation Versioning

Major documents should contain:

Version
Status
Last Updated
122. Decision Records

Important architectural decisions should be documented.

Example:

Decision:
Use modular monolith for v0.1.

Reason:
Lower infrastructure complexity and cost.

Future:
Extract high-load services only when justified.
123. Avoid Architecture Drift

If implementation repeatedly diverges from documentation:

stop
identify reason
update architecture or implementation

Do not allow permanent undocumented divergence.

124. Feature Request Workflow

New feature:

Idea
 ↓
Product decision
 ↓
PRD update
 ↓
UX update
 ↓
Architecture impact
 ↓
API/database impact
 ↓
Security impact
 ↓
Implementation
 ↓
Testing
 ↓
Documentation
125. Scope Control

For v0.1:

Do not implement future roadmap features merely because they are documented.

Documentation may describe the future product.

Implementation must follow the current release scope.

126. Out-of-Scope Request

If a task is outside v0.1:

identify it
check roadmap
do not silently add it
127. Dependency on Future Features

Do not create unnecessary infrastructure solely for hypothetical future features.

Build extensibility only where it does not significantly increase v0.1 complexity.

128. Simplicity Rule

Prefer:

simple implementation
clear boundary
strong tests

over:

complex abstraction
premature scalability
129. Scalability Rule

v0.1 should be designed so that scaling is possible later, but it does not need to be fully scaled today.

130. AI Coding Agent Instructions

Every AI coding agent working on FrontDesk should:

1. Read MEMORY.md.
2. Identify the task.
3. Read relevant documentation.
4. Inspect the existing implementation.
5. Avoid duplicates.
6. Plan before large changes.
7. Preserve unrelated work.
8. Follow architecture boundaries.
9. Follow security requirements.
10. Test changes.
11. Inspect the final diff.
12. Update documentation when necessary.
13. Update MEMORY.md.
14. Clearly report incomplete work.
131. AI Prohibited Behavior

AI agents must not:

delete unrelated work
reset another developer's changes
hardcode secrets
bypass authorization
disable security checks to make tests pass
silently change architecture
invent API contracts
invent database fields
create duplicate components
claim unverified completion
132. AI Before Coding Checklist
[ ] Read MEMORY
[ ] Identify task
[ ] Identify relevant docs
[ ] Search existing implementation
[ ] Check git status
[ ] Identify dependencies
[ ] Identify security implications
[ ] Plan changes
133. AI After Coding Checklist
[ ] Inspect diff
[ ] Typecheck
[ ] Lint
[ ] Test
[ ] Build
[ ] Browser verify if relevant
[ ] Security check
[ ] Documentation update
[ ] MEMORY update
134. Handoff Checklist

Before another AI takes over:

[ ] Current feature documented
[ ] Files changed documented
[ ] Tests documented
[ ] Known issues documented
[ ] Remaining work documented
[ ] Blockers documented
[ ] Architecture decisions documented
[ ] MEMORY.md updated
135. Final Development Principle

FrontDesk should be developed as:

Product decisions
      ↓
Documentation
      ↓
Architecture
      ↓
Implementation
      ↓
Testing
      ↓
Verification
      ↓
Memory / Handoff

Never:

AI generates code
      ↓
Hope it works