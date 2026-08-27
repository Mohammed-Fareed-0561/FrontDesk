# FrontDesk — Observability

**Product:** FrontDesk  
**Version:** v0.1  
**Document:** Observability  
**Status:** Draft — Engineering Source of Truth  
**Last Updated:** 2026-08-26

---

# 1. Purpose

This document defines how FrontDesk observes, records, detects, investigates, and responds to application behavior.

Observability covers:

- logs
- metrics
- traces
- health checks
- errors
- audit events
- security events
- background jobs
- AI activity
- API performance
- database health
- external integrations
- frontend failures
- PWA behavior

The goal is to answer:

> What is happening?

> Why is it happening?

> Who or what is affected?

> When did it start?

> Can we safely recover?

---

# 2. Core Principle

Observability must provide useful information without unnecessarily collecting sensitive user data.

The system should follow:

```text
Visibility
    +
Privacy
    +
Security
    +
Actionability
3. Observability Pillars

FrontDesk uses four primary observability categories:

Logs
Metrics
Traces
Events
4. Logs

Logs describe individual events or operations.

Examples:

API request received
Import started
Import completed
Database operation failed
AI action rejected
Notification failed
5. Metrics

Metrics measure system behavior over time.

Examples:

request count
error rate
request latency
database latency
job duration
AI request count
AI failure rate
storage usage
6. Traces

Traces connect multiple operations belonging to the same request or workflow.

Example:

User request
    ↓
API
    ↓
Service
    ↓
Database
    ↓
Background job
    ↓
External provider

A trace should make this chain understandable.

7. Events

Events represent meaningful business, security, or system occurrences.

Examples:

Business created
Product published
Website published
AI action approved
API key created
Login failed
Import completed
8. Observability Architecture

Conceptually:

                    Frontend
                       │
                       ▼
                     API
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      Logs          Metrics         Traces
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                Observability Layer
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Errors       Alerts       Dashboards

Business and security events additionally flow into the activity/audit systems.

9. Structured Logging

Backend logs should use structured formats where practical.

Prefer:

{
  "level": "error",
  "event": "import_failed",
  "request_id": "safe-id",
  "duration_ms": 1842
}

rather than:

Something went wrong with import.
10. Log Levels

Recommended levels:

DEBUG
INFO
WARN
ERROR

Production should avoid excessive debug logging.

11. DEBUG

Use for development-level diagnostics.

Do not depend on DEBUG logs for production-critical monitoring.

12. INFO

Use for meaningful normal operations.

Examples:

application started
import completed
website published
job completed
13. WARN

Use for abnormal but recoverable conditions.

Examples:

external provider slow
retry scheduled
cache unavailable
non-critical integration failure
14. ERROR

Use when an operation fails unexpectedly or requires investigation.

Examples:

database failure
unexpected exception
job permanently failed
external service failure
15. Never Log Secrets

Never log:

passwords
API keys
access tokens
refresh tokens
session secrets
private keys
database credentials
encryption keys
16. Sensitive Data

Avoid logging unnecessary:

phone numbers
email addresses
addresses
customer messages
business documents
payment details
identity documents

If data is required for debugging, prefer:

internal identifier
hashed identifier
redacted value

where appropriate.

17. Request IDs

Every backend request should have a request/correlation identifier where practical.

Example:

Request ID:
req_abc123

This allows related logs to be connected.

18. Correlation IDs

When a request creates background work:

HTTP Request
     ↓
Job
     ↓
Worker
     ↓
External API

the correlation context should be preserved where practical.

19. User IDs in Logs

User identifiers may be included only when necessary and safe.

Never expose sensitive identity information unnecessarily.

20. Workspace IDs

Workspace/business identifiers may be useful for troubleshooting but must not expose confidential business information.

21. Log Retention

Log retention should be limited to what is operationally useful.

Do not retain logs indefinitely without a reason.

22. Error Monitoring

Production errors should be captured through an error monitoring system or equivalent mechanism.

The system should capture:

error type
timestamp
environment
request ID
safe context
stack trace
affected route/module
23. Error Grouping

Equivalent errors should be grouped.

Example:

500 requests
same underlying error

should be represented as one error group with occurrence count rather than 500 unrelated incidents.

24. Frontend Errors

Frontend monitoring should capture:

JavaScript exceptions
unhandled promise rejections
failed API requests
critical rendering failures
25. Frontend Privacy

Frontend telemetry must not capture:

password fields
private messages
API keys
authentication tokens
sensitive form values
26. API Metrics

Track:

requests per endpoint
success rate
error rate
latency
response status
27. HTTP Status Metrics

Monitor:

2xx
3xx
4xx
5xx

Special attention should be given to:

401
403
404
409
429
500
502
503
28. 401 Monitoring

Unexpected increases in 401 may indicate:

authentication problems
expired sessions
configuration errors
attack attempts
29. 403 Monitoring

Unexpected increases in 403 may indicate:

authorization problems
permission misconfiguration
attempted unauthorized access
tenant-isolation attacks
30. 429 Monitoring

Track rate-limit responses.

A sudden increase may indicate:

legitimate traffic spike
misbehaving client
bot activity
abuse attempt
31. 5xx Monitoring

5xx errors should be treated as high-priority operational signals.

32. Latency

Track at least:

average
median
p95
p99

where infrastructure permits.

33. Latency by Endpoint

Do not rely only on global latency.

Identify slow endpoints individually.

Example:

GET /api/business
POST /api/import
GET /api/inbox
POST /api/copilot/action
34. Database Metrics

Monitor:

connection count
query latency
failed queries
connection failures
storage usage
slow queries
35. Database Health

A healthy database should have:

available connections
acceptable latency
no repeated connection failures
sufficient storage
36. Slow Query Detection

Slow queries should be identifiable without logging sensitive query parameters unnecessarily.

37. Background Job Metrics

Track:

jobs created
jobs completed
jobs failed
jobs retried
job duration
queue depth
38. Job States

Standard states:

queued
processing
completed
failed
cancelled
retrying
39. Stuck Jobs

Detect jobs that remain in:

processing

for longer than their expected execution window.

40. Import Monitoring

Business imports should expose:

imports started
imports completed
imports failed
records processed
records requiring review
processing duration
41. Import Failure Monitoring

Track:

file parsing failure
unsupported format
extraction failure
validation failure
storage failure
AI extraction failure
42. Catalog Metrics

Where useful:

products created
products updated
products deleted
catalog publishing events
validation failures
43. Website Metrics

Monitor:

publishing attempts
successful publications
failed publications
build failures
public-site errors
44. Public Website Health

Public business websites should be monitored separately from the owner dashboard.

A dashboard being healthy does not prove public websites are healthy.

45. QR Monitoring

Where analytics are implemented, track safe aggregate information such as:

QR scans
destination access
failed destinations

Avoid collecting unnecessary personal information.

46. Inbox Monitoring

Track operational metrics such as:

messages received
messages sent
failed messages
pending messages
integration failures
47. Notification Monitoring

Track:

notifications created
notifications delivered
notifications failed
retry count
48. External Integration Monitoring

Each external provider should have:

request count
success rate
failure rate
latency
timeout count
retry count
49. Integration Health

An integration may be:

Connected
Healthy
Degraded
Disconnected
Failing
50. AI Observability

AI operations require specialized monitoring.

Track:

AI requests
successful responses
failed requests
timeouts
latency
token usage where available
model/provider
action proposals
action approvals
action failures
51. AI Privacy

Do not automatically store complete AI conversations in operational logs.

Conversation data belongs in the appropriate product data store with its own access and retention controls.

52. AI Request Metadata

Operational telemetry may record safe metadata such as:

model
provider
request duration
success/failure
token counts where available
request ID
action ID
53. AI Cost Monitoring

Where provider data allows, track:

requests
tokens
estimated cost
model usage
failure/retry overhead
54. AI Cost Anomalies

Alert on unusual increases in:

AI request volume
token consumption
estimated cost
retry volume
55. AI Action Monitoring

Every important AI action should be observable through:

suggested
approved
rejected
executing
completed
failed
cancelled
56. AI Action Audit

AI actions that change business state should create appropriate audit records.

57. AI Failure

If an AI action fails:

The user should receive a safe state.

The system should record:

action ID
failure category
request ID
execution state
safe diagnostic information
58. AI Authorization Monitoring

Monitor attempts where an AI action is:

unauthorized
outside allowed scope
missing approval
invalid

Repeated failures may indicate:

configuration error
prompt abuse
malicious usage
59. Security Monitoring

Security events should be monitored separately from ordinary application logs.

Examples:

failed login
account lockout
password change
MFA change
API key creation
API key revocation
permission change
suspicious access
rate-limit trigger
60. Security Event Severity

Recommended:

INFO
WARNING
HIGH
CRITICAL
61. Failed Login Monitoring

Monitor:

failed attempts
source patterns
affected accounts
time patterns

Do not expose credentials.

62. Rate-Limit Monitoring

Track:

requests blocked
endpoint
safe client identifier
time

Avoid storing raw sensitive identifiers unnecessarily.

63. API Key Monitoring

Track lifecycle events:

created
used
rotated
revoked
expired

Never log the actual key.

64. Session Monitoring

Monitor:

new session
session revocation
suspicious session behavior
authentication failures

Never log raw session tokens.

65. Tenant-Isolation Monitoring

Potential cross-workspace access attempts should generate security telemetry.

Example:

User belongs to Workspace A
        ↓
Attempts resource belonging to Workspace B
        ↓
403
        ↓
Security event
66. Audit Events

Audit events answer:

What changed?
Who initiated it?
When?
What resource changed?
What was the result?
67. Audit vs Logs

Logs:

Help engineers debug the system.

Audit events:

Provide a durable record of important actions.

They should not be treated as the same thing.

68. Audit Event Examples
business.updated
product.created
product.deleted
website.published
api_key.created
api_key.revoked
permission.changed
ai_action.approved
ai_action.executed
69. Audit Integrity

Audit records should not be casually editable by ordinary application users.

70. Audit Retention

Retention should follow:

business requirements
security requirements
privacy requirements
legal requirements

Only retain what is justified.

71. Health Checks

The backend should provide a safe health endpoint.

Example conceptual endpoint:

GET /health
72. Health Check Levels

Possible levels:

Liveness
Readiness
Dependency health
73. Liveness

Answers:

Is the application process alive?

74. Readiness

Answers:

Can the application currently serve requests?

75. Dependency Health

May verify:

database
storage
queue
required external dependencies

without exposing sensitive details.

76. Health Check Security

Health endpoints must not expose:

environment variables
database credentials
internal configuration
secret values
77. Alerts

Alerts should be based on actionable conditions.

Bad:

Alert every warning.

Better:

Alert when 5xx error rate exceeds the defined threshold.
78. Alert Categories
Availability
Performance
Errors
Database
Jobs
Security
AI
Integrations
Cost
79. Critical Alerts

Potential critical alerts:

application unavailable
database unavailable
authentication completely failing
major data integrity problem
critical security event
public websites unavailable
80. High Alerts

Examples:

5xx spike
queue backlog
AI provider unavailable
storage failures
high database latency
81. Warning Alerts

Examples:

increasing latency
increasing retries
storage approaching threshold
increased 429 responses
82. Alert Fatigue

Do not create alerts for every small event.

If alerts fire constantly and nobody acts on them, they have lost value.

83. Alert Thresholds

Thresholds should be based on actual v0.1 traffic after initial observation.

Do not invent highly precise thresholds without evidence.

84. Dashboard

A basic operations dashboard should show:

Application health
Request volume
Error rate
Latency
Database health
Background jobs
External integrations
AI usage
Security events
85. Business Dashboard vs Operations Dashboard

Do not mix technical health metrics with the business owner's normal dashboard.

Business dashboard:

customers
orders
enquiries
website activity

Operations dashboard:

latency
errors
jobs
database
infrastructure
86. Developer Dashboard

Developers may need:

errors
traces
logs
deployments
database health
jobs
API performance
87. Security Dashboard

Security monitoring may include:

failed authentication
rate-limit events
API key events
permission changes
suspicious activity
88. PWA Monitoring

Monitor:

frontend errors
service-worker errors
failed asset loads
offline/online transitions
application update failures
89. Offline Behavior

Offline events should not generate excessive telemetry.

Batch telemetry when connectivity returns where appropriate.

90. Browser Compatibility

Frontend errors should be grouped by:

browser
OS
application version

where safely available.

91. Release Monitoring

After a deployment, compare:

before release
vs
after release

for:

error rate
latency
failed jobs
API failures
frontend errors
92. Deployment Correlation

Observability should allow engineers to answer:

Did this problem start after deployment X?

Track application version/build identifiers in telemetry.

93. Version Metadata

Safe telemetry may include:

application version
build identifier
environment
94. Error Context

Useful error context:

route
module
request ID
application version
environment
safe user/workspace identifier
95. Error Context Must Not Include
password
token
API key
full customer message
private document
payment credentials

unless explicitly required by a secure diagnostic workflow.

96. Privacy Principle

Observability is not a justification for collecting more personal data.

Use the minimum information needed to diagnose the problem.

97. Data Redaction

Sensitive fields should be automatically redacted where possible.

Example:

Authorization: [REDACTED]
API-Key: [REDACTED]
Password: [REDACTED]
98. Development vs Production Logging

Development may use more verbose diagnostics.

Production should prioritize:

signal
security
performance
privacy
99. Debugging Workflow

When a production problem occurs:

1. Identify symptom
2. Check monitoring
3. Find error group
4. Identify request ID
5. Inspect trace
6. Inspect related logs
7. Check recent deployment
8. Check database/job health
9. Determine root cause
10. Recover
100. Incident Correlation

A single incident may involve:

Frontend error
      ↓
API 500
      ↓
Database timeout
      ↓
Connection exhaustion

Observability should make this relationship discoverable.

101. Background Job Debugging

For a failed job:

Job ID
 ↓
Correlation ID
 ↓
Job logs
 ↓
Input metadata
 ↓
Failure
 ↓
Retry history

Never expose sensitive job payloads unnecessarily.

102. External API Debugging

Record safe metadata:

provider
endpoint category
status
duration
retry count
request ID

Do not log authorization headers.

103. Database Debugging

Track:

query category
duration
connection state
error type

Avoid dumping sensitive query parameters into logs.

104. Storage Monitoring

Track:

upload count
upload failures
storage consumption
processing failures
105. File Processing Monitoring

Track:

files received
processing started
processing completed
processing failed
processing duration
106. Import Pipeline Trace

A business import should be traceable:

Upload
 ↓
Storage
 ↓
Extraction
 ↓
Normalization
 ↓
Validation
 ↓
Review
 ↓
Apply
107. Website Publishing Trace

Publishing should be traceable:

Draft
 ↓
Validation
 ↓
Build
 ↓
Publish
 ↓
Deployment
 ↓
Public availability
108. Customer Enquiry Trace

Where integrations permit:

Customer action
 ↓
Public interface
 ↓
API
 ↓
Enquiry
 ↓
Inbox
 ↓
Notification
109. Notification Trace
Event
 ↓
Notification creation
 ↓
Provider
 ↓
Delivery
110. AI Request Trace
User request
 ↓
Copilot
 ↓
Context retrieval
 ↓
Model
 ↓
Action proposal
 ↓
Validation
 ↓
Approval
 ↓
Execution
111. Observability of Memory

Business Memory updates should be observable through appropriate activity/audit events.

Example:

Memory entry created
Memory entry updated
Memory entry removed
112. Knowledge Base Observability

Track:

source added
source updated
source removed
indexing started
indexing completed
indexing failed
113. Search Monitoring

Where search is implemented, track:

query count
latency
failure rate
zero-result rate

Do not unnecessarily store full user queries if they contain sensitive information.

114. Performance Budgets

FrontDesk should establish practical performance budgets for:

frontend load
API latency
database queries
background jobs
public websites

Exact targets should be based on actual architecture and user requirements.

115. Public Website Performance

Because public business websites directly affect customer experience, monitor:

availability
page-load performance
asset failures
API failures
116. Monitoring Free-Tier Constraints

Because v0.1 targets low-cost infrastructure:

Avoid excessive telemetry volume.

Use:

sampling
aggregation
retention limits
batched events

where appropriate.

117. Trace Sampling

Not every request necessarily needs a full trace in production.

High-value traces should be prioritized.

118. Error Sampling

Errors should generally receive higher observability priority than successful requests.

119. Metrics Aggregation

Prefer aggregate metrics for high-volume events rather than storing every event indefinitely.

120. Monitoring Cost

Observability itself has infrastructure cost.

Review:

log volume
metric volume
trace volume
retention
storage

periodically.

121. Monitoring Failure

Observability systems can fail.

FrontDesk must not become unavailable simply because telemetry collection is temporarily unavailable.

122. Fail-Open Telemetry

Non-critical telemetry should generally fail gracefully.

Business operations should not depend on successful analytics/log transmission.

123. Critical Audit Events

Security and compliance-relevant events require stronger durability than ordinary debug logs.

124. Monitoring Access

Only authorized personnel/services should access sensitive operational telemetry.

125. Observability Security

Logs and monitoring systems may contain sensitive metadata.

Protect them like operational data.

126. Access Auditing

Access to sensitive operational systems should itself be controlled and auditable where appropriate.

127. Retention Classes

Conceptually separate:

Debug logs
Operational logs
Security events
Audit records
Metrics
Traces

Each may have different retention.

128. Data Deletion

When privacy requirements require deletion, observability systems must be considered where applicable.

Do not assume deleting the primary database record automatically deletes every copy of related telemetry.

129. Incident Timeline

For major incidents, construct:

Deployment
 ↓
First signal
 ↓
First alert
 ↓
User impact
 ↓
Investigation
 ↓
Mitigation
 ↓
Recovery
130. Post-Incident Observability

After an incident, ask:

Could we detect it earlier?

Did we have enough context?

Was the alert actionable?

Was the root cause visible?

What signal was missing?
131. Observability Improvements

Every major incident should potentially result in:

new metric
new log
new alert
new trace
new test
new dashboard

only where it provides meaningful value.

132. AI Agent Observability Rules

AI coding agents must not remove useful logging simply to hide failures.

They must not:

disable monitoring
suppress errors
remove audit events
remove security telemetry

just to make tests or deployments appear successful.

133. AI Agent Debugging

When diagnosing a production-like issue, AI agents should use:

logs
metrics
traces
recent changes
tests

rather than guessing.

134. Observability Documentation

If a new major subsystem is introduced, define:

what it logs
what it measures
what events it emits
what failures it exposes
135. Minimum v0.1 Observability

Required:

[ ] Structured backend logs
[ ] Request IDs
[ ] Error monitoring
[ ] API latency/error metrics
[ ] Database health
[ ] Background job status
[ ] Security events
[ ] Audit events
[ ] Deployment/version identification
[ ] Basic health endpoint
[ ] Production smoke checks
136. Optional v0.1

Depending on infrastructure:

[ ] Distributed tracing
[ ] Advanced dashboards
[ ] Full frontend session replay
[ ] Detailed product analytics

Session replay should NOT be introduced casually because of privacy implications.

137. Future Observability

Future versions may add:

advanced distributed tracing
anomaly detection
automated incident correlation
AI-assisted root cause analysis
advanced cost analytics
SLO management
advanced product analytics
138. Final Observability Model

FrontDesk should provide:

Logs
  → What happened?

Metrics
  → How often / how much?

Traces
  → How did it happen?

Events
  → What meaningful change occurred?

Alerts
  → Does someone need to act?

Audit
  → What important action occurred?

Health checks
  → Is the system working?
139. Final Principle

Observability should make FrontDesk:

Understandable
Detectable
Debuggable
Secure
Recoverable

without turning the product into a surveillance system.