# FrontDesk — CI/CD

**Product:** FrontDesk  
**Version:** v0.1  
**Document:** Continuous Integration & Continuous Deployment  
**Status:** Draft — Engineering Source of Truth  
**Last Updated:** 2026-08-26

---

# 1. Purpose

This document defines the automated process used to validate, build, deploy, verify, and roll back FrontDesk.

The goal is to make every change pass predictable quality and security gates before reaching production.

---

# 2. Core Pipeline

FrontDesk follows:

```text
Developer / AI Agent
        ↓
Git Commit
        ↓
Pull Request
        ↓
Static Checks
        ↓
Type Check
        ↓
Lint
        ↓
Unit Tests
        ↓
Integration Tests
        ↓
Security Checks
        ↓
Build
        ↓
Preview Environment
        ↓
E2E Tests
        ↓
Review
        ↓
Production Deployment
        ↓
Database Migration
        ↓
Health Check
        ↓
Smoke Tests
        ↓
Monitoring
3. CI vs CD
Continuous Integration

CI validates that a change does not break the project.

CI includes:

lint
typecheck
unit tests
integration tests
security checks
build
Continuous Deployment

CD handles:

build artifact
deployment
database migration
environment configuration
health checks
smoke tests
rollback
4. v0.1 Philosophy

FrontDesk v0.1 should use the simplest reliable pipeline.

Do not build an unnecessarily complex DevOps platform.

Prefer:

Git repository
+
automated CI
+
preview deployment
+
production deployment
+
managed PostgreSQL
+
managed storage

where appropriate.

5. Environments

FrontDesk should conceptually maintain:

Local
Development
Preview / Staging
Production
6. Local

Purpose:

feature development
debugging
unit testing
manual verification

Local environment must never require production credentials.

7. Development

Purpose:

integration testing
shared development
backend/frontend integration

Development data should be disposable or clearly separated from production.

8. Preview / Staging

Purpose:

pull-request verification
release candidate testing
E2E testing
manual QA
9. Production

Production contains:

real users
real business data
real credentials
real integrations

Production access must be restricted.

10. Environment Isolation

Never share production secrets with:

local
development
preview

unless explicitly required and securely controlled.

11. Branch Strategy

Recommended:

main
│
├── feature/*
├── fix/*
├── security/*
└── refactor/*

main should represent code that is safe to release.

12. Pull Request Requirement

Meaningful changes should enter main through a pull request.

The PR should describe:

What changed
Why
Affected modules
Testing performed
Security implications
Database changes
API changes
Known limitations
13. CI Trigger

CI should run when:

pull request opened
pull request updated
commit pushed

and optionally on:

main branch
scheduled security scans
14. CI Pipeline

Recommended order:

1. Checkout
2. Install dependencies
3. Restore cache
4. Validate configuration
5. Lint
6. Typecheck
7. Unit tests
8. Integration tests
9. Security checks
10. Build
11. Artifact validation
15. Dependency Installation

CI must use the repository lock file.

Do not silently resolve different dependency versions.

16. Dependency Caching

Dependency caching may be used to improve CI speed.

Caching must never compromise dependency correctness.

17. Lockfile Integrity

CI should fail if the package manifest and lock file are inconsistent when the package manager requires synchronization.

18. Lint Gate

Lint failures should block merging unless explicitly classified as non-blocking.

19. Typecheck Gate

Type errors should block merging.

Do not disable type checking merely to make a build pass.

20. Unit Test Gate

Unit tests must pass for affected modules.

Critical business logic should have mandatory coverage.

21. Integration Test Gate

Integration tests should validate interactions between:

API
Services
Database
Authentication
Authorization

where applicable.

22. Security Test Gate

Security-sensitive changes must trigger appropriate security tests.

Examples:

authentication
authorization
tenant isolation
API keys
file uploads
AI actions
permissions
23. Build Gate

The production build must complete successfully.

A successful development server does not prove that the production build works.

24. Frontend Build

Frontend CI should verify:

dependencies
type safety
lint
tests
production build
25. Backend Build

Backend CI should verify:

dependencies
type safety where applicable
lint
tests
build/startup
26. Database Validation

Database changes should be validated before deployment.

At minimum:

migration syntax
migration order
schema compatibility
application compatibility
27. Migration Rule

Production migrations must be explicitly tracked.

Never depend on manually changing production tables.

28. Safe Migration Principle

Prefer migrations that support:

old application
+
new application

during deployment transitions.

29. Dangerous Migration

Examples:

DROP COLUMN immediately
rename required column without compatibility
destructive data transformation

These require explicit planning.

30. Expand-and-Contract

For risky schema changes:

Phase 1
Add new structure

Phase 2
Application supports both

Phase 3
Migrate data

Phase 4
Switch application

Phase 5
Remove old structure
31. Preview Deployment

Each important pull request should have a deployable preview when infrastructure supports it.

The preview should allow verification of:

UI
API
database integration
authentication
critical flows
32. Preview Isolation

Preview environments must not accidentally use production data.

33. E2E Preview Tests

Critical E2E tests should run against the preview environment where practical.

34. Required v0.1 E2E Flows

At minimum:

1. Sign up
2. Login
3. Create workspace/business
4. Import business information
5. Review imported information
6. Create/edit product
7. Publish website
8. Open public website
9. Scan/open QR destination
10. Submit customer enquiry
11. View enquiry in inbox
12. Reply
13. Ask Copilot
14. Generate suggestion
15. Approve permitted action
16. Verify resulting activity
35. Deployment Approval

Production deployment should require successful CI.

Additional approval may be required for:

security changes
database migrations
authentication changes
payment-related changes
high-risk AI actions
36. Production Deployment

Production deployment sequence:

1. Validate release
2. Build
3. Deploy application
4. Apply safe database migrations
5. Verify application startup
6. Run health check
7. Run smoke tests
8. Monitor
37. Deployment Ordering

For changes involving both database and application:

Prefer:

Backward-compatible database change
        ↓
Application deployment
        ↓
Data migration if required
        ↓
Cleanup later
38. Health Check

Production should expose a health mechanism that verifies application availability without revealing secrets.

39. Health Check Should Not

Expose:

database credentials
environment variables
API keys
internal stack traces
sensitive infrastructure information
40. Smoke Tests

After production deployment, verify critical functionality.

Minimum:

Application loads
Authentication works
API responds
Database connection works
Public website works
Critical business workflow works
41. Smoke Test Failure

If critical smoke tests fail:

Stop rollout
 ↓
Assess
 ↓
Rollback if necessary
 ↓
Investigate
42. Rollback

Every production deployment must have a rollback strategy.

Application rollback:

Current version
     ↓
Previous known-good version
43. Database Rollback

Database rollback is more complicated than application rollback.

Do not assume every migration can simply be reversed.

Prefer backward-compatible migrations.

44. Migration Recovery

If a migration partially fails:

Stop deployment
 ↓
Inspect database state
 ↓
Do not blindly rerun
 ↓
Determine safe recovery
 ↓
Repair or restore
 ↓
Verify
45. Deployment Failure

Never hide deployment failures.

Record:

deployment
commit
environment
error
affected component
recovery action
46. Secrets

CI/CD secrets must be stored in the platform's secure secret mechanism.

Never put secrets in:

workflow files
source code
logs
commit messages
documentation
47. Secret Exposure

If a secret is accidentally exposed:

1. Revoke it
2. Rotate it
3. Investigate exposure
4. Remove it from source
5. Check logs
6. Document incident

Removing the text from Git alone does not make the secret safe.

48. Environment Variables

Categorize variables:

PUBLIC
SERVER-ONLY
SECRET

Only public configuration may be exposed to the browser.

49. CI Logs

CI logs must not print:

tokens
passwords
API keys
database URLs containing credentials
session secrets
50. Dependency Security

CI should periodically check dependencies for known vulnerabilities.

Security warnings should be classified:

Critical
High
Medium
Low
51. Critical Vulnerabilities

Critical vulnerabilities affecting production dependencies should block release unless explicitly accepted and documented.

52. Dependency Updates

Do not blindly update every dependency.

Before major upgrades:

check compatibility
read migration notes
run tests
verify build
53. Automated Security Scanning

Where available, CI should include:

dependency scanning
secret scanning
static analysis
container scanning

only as appropriate to the actual architecture.

Do not add scanners merely for appearance.

54. Secret Scanning

Source control should be checked for accidentally committed secrets.

55. Static Analysis

Security-sensitive code should receive static analysis where practical.

56. Container Scanning

Only required if FrontDesk uses containers in the deployment architecture.

Do not introduce containers solely because a scanner supports them.

57. Database Backups

Production database backups must exist before the system stores important real-world business data.

58. Backup Verification

A backup that has never been restored is not considered fully verified.

Test restoration periodically.

59. Recovery Objective

v0.1 should define:

RPO
How much data loss is acceptable?

RTO
How quickly should service be restored?

Exact targets should be chosen based on actual business requirements and infrastructure cost.

60. Monitoring

Production monitoring should track:

availability
error rate
latency
database health
background jobs
storage failures
authentication failures
security events
61. Deployment Monitoring

After release, watch for:

5xx increase
authentication failures
database errors
API latency
frontend errors
job failures
62. Logging

Production logs should include enough context for debugging.

Avoid excessive logging of personal or sensitive business data.

63. Correlation IDs

Where practical, requests and background jobs should have correlation/request IDs.

Example:

Request
  ↓
API
  ↓
Service
  ↓
Database
  ↓
Worker

A common identifier helps trace the operation.

64. Background Workers

Long-running tasks should not block normal API requests.

Examples:

large file processing
business imports
document extraction
AI processing
notifications
scheduled automations
65. Worker Deployment

Workers must be deployed and monitored independently from request handling when the architecture requires it.

66. Failed Jobs

Background jobs should have:

retry policy
failure state
error visibility
idempotency
67. Retry Rule

Never retry blindly.

Retry only failures that are likely transient.

Do not repeatedly retry:

invalid input
permission denied
permanent configuration errors
68. Idempotency

Operations that may be retried must be designed to avoid duplicate side effects.

Examples:

payment
notification
order creation
AI action execution
import processing
69. AI Deployment

AI-related deployment changes require additional validation.

Check:

model configuration
prompt/configuration changes
tool permissions
action registry
rate limits
cost controls
fallback behavior
70. AI Cost Control

Because FrontDesk v0.1 targets low-cost development:

AI calls should have:

limits
timeouts
maximum retries
model selection rules
failure handling
71. AI Provider Failure

If an external AI provider fails:

detect
timeout
retry when appropriate
fallback if configured
show safe user state

Do not leave the UI indefinitely waiting.

72. External Integrations

External services should not make the entire application fail unnecessarily.

Use:

timeouts
retries
circuit-breaking where justified
clear error states
73. Webhooks

Webhook endpoints must validate:

signature
source
timestamp where applicable
payload
authorization
idempotency
74. Scheduled Jobs

Scheduled jobs should be monitored for:

execution
failure
duplicate execution
missed execution
75. PWA Deployment

After frontend deployment, verify:

service worker
manifest
cache behavior
offline fallback
application update
76. PWA Update Safety

Do not allow an application update to silently destroy unsaved user work.

77. CDN / Cache

Public assets may be cached aggressively when versioned.

Dynamic business data should use controlled caching.

78. Cache Invalidation

Every important cache must have a known invalidation strategy.

79. Deployment Artifacts

Build artifacts should be reproducible.

A production deployment should correspond to a specific source revision.

80. Release Identifier

Production should expose a safe version/build identifier for debugging.

Example:

FrontDesk v0.1.x
Build: abc123

Do not expose secrets or internal credentials.

81. Release Notes

Each meaningful release should record:

Features
Fixes
Security
Database changes
Known issues
82. Hotfix Workflow

For urgent production bugs:

main
 ↓
hotfix/*
 ↓
minimal fix
 ↓
tests
 ↓
security check
 ↓
deploy
 ↓
smoke test
83. Hotfix Rule

Do not use a production emergency as an excuse to introduce unrelated refactoring.

84. Rollback vs Hotfix

Rollback when:

previous version is known-good
current version is severely broken
rollback is safe

Hotfix when:

rollback is unsafe
database compatibility prevents rollback
fix is small and well understood
85. CI Failure Classification

Failures should be categorized:

Code failure
Test failure
Dependency failure
Infrastructure failure
Configuration failure
External service failure
Flaky test
86. Flaky Tests

Do not permanently ignore flaky tests.

Investigate and fix them.

87. CI Duration

Keep CI reasonably fast.

Slow tests should be separated into appropriate stages rather than slowing every small change unnecessarily.

88. Parallel Testing

Independent tests may run in parallel where infrastructure allows.

89. Test Database

Integration tests should use an isolated test database or equivalent isolated environment.

Never run destructive test suites against production.

90. Production Data

Production data must never be copied into development environments without appropriate authorization, protection, and anonymization.

91. Deployment Permissions

Only authorized users/processes should be able to deploy to production.

92. AI Deployment Permissions

AI coding agents should not automatically receive unrestricted production deployment credentials.

Production deployment should remain an explicitly controlled operation.

93. Protected Branch

main should be protected against direct accidental changes where the Git platform supports it.

94. Required Checks

Before merging, required checks should include:

Lint
Typecheck
Tests
Build
Security checks

as applicable.

95. Review

Important changes should receive human review.

AI-generated code should not be considered automatically trustworthy because it passes CI.

96. Documentation Gate

If a change modifies:

API
database
architecture
security
UX behavior
development workflow

the relevant documentation must be updated before release.

97. Release Candidate

A release candidate should be:

fully built
tested
security checked
documented
deployable
98. Release Checklist
[ ] CI green
[ ] Dependencies verified
[ ] Security scan passed
[ ] Database migration reviewed
[ ] Environment variables verified
[ ] Build successful
[ ] Preview verified
[ ] E2E tests passed
[ ] Release notes updated
[ ] Production deployment approved
99. Production Checklist
[ ] Deployment successful
[ ] Database migration successful
[ ] Health check successful
[ ] Smoke tests successful
[ ] Public website accessible
[ ] Authentication works
[ ] Critical API works
[ ] Monitoring normal
[ ] No unexpected error spike
100. Post-Deployment Checklist
[ ] Monitor errors
[ ] Monitor latency
[ ] Monitor background jobs
[ ] Check authentication failures
[ ] Check critical user flows
[ ] Confirm expected version
101. Incident Response

If deployment causes a serious incident:

Contain
 ↓
Rollback or hotfix
 ↓
Verify recovery
 ↓
Communicate
 ↓
Investigate
 ↓
Document
 ↓
Prevent recurrence
102. Postmortem

Significant incidents should document:

What happened
Timeline
Root cause
Impact
Detection
Response
Resolution
Preventive actions
103. Free-Cost Infrastructure Principle

FrontDesk v0.1 should minimize recurring infrastructure cost.

Prefer free tiers where they are:

reliable
secure
sufficient

Do not design the architecture around free-tier limits if doing so creates dangerous technical debt.

104. Cost Monitoring

Track major cost sources:

AI inference
database
storage
bandwidth
email
messaging
external APIs
build/deployment
105. AI Cost Guardrails

AI usage should have:

per-request limits
rate limits
maximum token/output controls
retry limits
model fallback policy
106. Deployment Cost Guardrails

Avoid unnecessary:

always-on servers
multiple environments with expensive infrastructure
duplicate databases
unnecessary queues
unused third-party services
107. v0.1 Deployment Principle

The first production architecture should be:

Simple
Secure
Observable
Recoverable
Affordable

not:

Massively distributed
Over-engineered
Expensive
108. AI Agent CI Rules

AI coding agents must assume CI is the final verification authority.

They must:

read failures
identify root cause
fix relevant issues
rerun checks
report unresolved failures
109. AI Must Not Bypass CI

AI agents must not:

disable tests
skip security checks
remove failing assertions
suppress errors
change CI rules just to obtain green status

unless the change itself is explicitly requested and reviewed.

110. CI Configuration Changes

Changes to CI/CD configuration require extra review because they affect the entire development pipeline.

111. Final Quality Gate

A change is release-ready only when:

Requirements
      +
Implementation
      +
Tests
      +
Security
      +
Build
      +
Deployment verification
      +
Documentation

are all appropriately satisfied.

112. v0.1 Release Gate

The v0.1 release must not be considered production-ready if any critical issue remains in:

Authentication
Authorization
Tenant isolation
Data integrity
Secret handling
Critical API behavior
Critical user flows
Database migrations
113. Final Principle

The CI/CD system exists to make bad releases difficult.

It should not become a ceremony.

Every pipeline step must answer:

"What failure are we trying to catch?"

If a step has no meaningful purpose, it should not exist merely because it is considered standard practice.