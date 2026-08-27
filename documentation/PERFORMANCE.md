# FrontDesk — Performance

**Product:** FrontDesk
**Version:** v0.1
**Document:** Performance
**Status:** Draft — Engineering Source of Truth
**Last Updated:** 2026-08-26

---

# 1. Purpose

Define performance requirements, budgets, optimization rules, measurement methods, and regression prevention for FrontDesk v0.1.

Performance must be treated as a product requirement, not a final optimization step.

---

# 2. Performance Principles

FrontDesk follows:

1. Fast initial experience.
2. Fast interaction.
3. Minimal unnecessary network requests.
4. Minimal unnecessary JavaScript.
5. Efficient database access.
6. Controlled AI latency.
7. Background processing for long operations.
8. Performance must not compromise security.
9. Measure before optimizing.
10. Avoid premature optimization.

---

# 3. Performance Layers

```text
User
 ↓
Browser / PWA
 ↓
Network
 ↓
Frontend
 ↓
API
 ↓
Backend Services
 ↓
Database / Cache / Storage
 ↓
External Services / AI

Each layer must be measurable independently.

4. Performance Categories
Frontend Performance
API Performance
Database Performance
PWA Performance
Public Website Performance
AI Performance
Background Job Performance
File Processing Performance
Network Performance
Infrastructure Performance
5. Performance Budgets

Initial v0.1 targets should be treated as engineering targets, not promises.

Measure real-world performance before tightening them.

Track:

Initial page load
Time to interactive
Largest Contentful Paint
Cumulative Layout Shift
First Input Delay / Interaction to Next Paint
API latency
Database latency
Job duration
AI response latency
6. Frontend Bundle

Avoid unnecessary dependencies.

Before adding a dependency:

1. Check whether existing code can solve the problem.
2. Check package size.
3. Check browser/runtime compatibility.
4. Check maintenance status.
5. Check whether the feature can be lazy-loaded.
7. Code Splitting

Large features should be loaded only when required.

Potential candidates:

Website Builder
Advanced Analytics
Large Import UI
Copilot
Media Manager
8. Route-Level Loading

Routes should avoid loading unrelated feature code.

Example:

Inbox

should not unnecessarily load the complete Website Builder.

9. Lazy Loading

Use lazy loading for:

large editors
charts
advanced dialogs
large media interfaces
heavy AI interfaces

when beneficial.

10. Images

Images must be optimized.

Use:

appropriate dimensions
modern formats where supported
compression
responsive images
lazy loading
11. Image Dimensions

Do not download a 3000px image when a 600px image is sufficient.

12. Public Website Images

Generated public websites must prioritize image performance because they directly affect customer experience.

13. Image Loading

Above-the-fold images should receive appropriate priority.

Below-the-fold images should generally be lazy-loaded.

14. Fonts

Avoid loading unnecessary font families and weights.

Font loading must not significantly delay rendering.

15. CSS

Avoid unnecessary global CSS.

Prefer the existing design system and reusable styling primitives.

16. Rendering

Avoid unnecessary component rerenders.

Investigate:

large lists
frequent state updates
expensive derived calculations
unnecessary context updates

before applying memoization everywhere.

17. State Management

Keep state as close as practical to where it is used.

Do not put every piece of UI state into global state.

18. Server State

Server data should have an intentional fetching and caching strategy.

Avoid duplicated requests for the same resource.

19. Request Deduplication

If multiple UI components need the same data:

Component A ─┐
Component B ─┼→ shared data request
Component C ─┘

rather than three identical requests.

20. Pagination

Large datasets must not be loaded completely into the browser.

Use pagination, cursor pagination, or appropriate incremental loading.

21. Infinite Scrolling

Use only where it improves the user experience.

Do not use infinite scrolling simply to avoid implementing pagination.

22. Virtualization

Virtualize very large lists where rendering thousands of DOM nodes becomes expensive.

Potential candidates:

large inbox
large product catalog
activity history
search results
23. API Performance

API performance must be measured per endpoint.

Track:

request count
latency
error rate
payload size
database time
external-service time
24. API Response Size

Do not return fields the client does not need.

Avoid huge nested responses.

Prefer focused endpoints or field selection where justified.

25. N+1 Queries

Backend code must avoid N+1 database queries.

Bad:

Get 100 products
 ↓
Run one query for each product's category

Prefer appropriate joins, batching, or preloading.

26. Database Indexes

Indexes should exist for frequently queried fields.

Potential categories:

workspace_id
business_id
user_id
created_at
updated_at
status
foreign keys
search/filter fields

Do not create indexes blindly.

27. Index Cost

Indexes improve reads but increase:

storage
write cost
migration complexity

Every important index should have a reason.

28. Query Performance

Slow queries must be investigated using database query analysis tools.

Do not optimize based only on intuition.

29. Database Connection Pool

Use an appropriate connection pool.

Avoid creating a new database connection unnecessarily for every request.

30. Database Transactions

Transactions should be:

short
focused
necessary

Avoid long-running transactions.

31. Database Locking

Avoid unnecessary locks and large transactional operations.

32. Caching

Caching should be introduced where measurements show repeated expensive reads.

Potential candidates:

public website configuration
business settings
catalog reads
frequently accessed metadata
33. Cache Invalidation

Every cache must have a defined invalidation strategy.

Never introduce a cache that has no clear answer to:

When does this data become stale?

34. Cache Correctness

Critical mutable information must not remain stale unexpectedly.

Examples:

price
availability
business hours
published status
permissions

must use appropriate freshness rules.

35. Public Website Caching

Public pages can generally use more aggressive caching than authenticated business-management screens.

36. PWA Caching

The service worker must distinguish between:

Static assets
Public content
Authenticated data
Sensitive data

Do not blindly cache authenticated responses.

37. Sensitive Data and Caches

Never store sensitive authenticated responses in an uncontrolled public cache.

38. Offline Storage

IndexedDB/local storage should contain only data appropriate for local persistence.

Do not store secrets unnecessarily.

39. Offline Strategy

Offline behavior should prioritize:

cached application shell
recent safe business data
queued safe actions

where supported.

40. Sync

When connectivity returns:

offline action
 ↓
local queue
 ↓
validation
 ↓
server request
 ↓
success/failure
 ↓
local state update
41. Sync Conflict

If server data changed while the user was offline:

detect conflict
 ↓
do not silently overwrite
 ↓
resolve according to feature rules
42. API Retry

Retries must be limited.

Retry only operations that are safe or idempotent.

43. Retry Backoff

Transient failures should use controlled backoff rather than immediate repeated requests.

44. Rate Limiting

Performance protection must work together with security rate limiting.

Rate limits should protect:

API
authentication
search
AI
file uploads
expensive operations
45. Expensive Operations

Operations that can take seconds or minutes should generally become background jobs.

Examples:

large imports
document extraction
image processing
AI-heavy processing
website builds
bulk operations
46. Background Job UX

The frontend should show:

Queued
Processing
Completed
Failed

instead of leaving a request hanging indefinitely.

47. Job Timeouts

Every long-running job should have a defined timeout or execution limit.

48. Job Retries

Jobs should retry only transient failures.

Retries must be idempotent.

49. Queue Backlog

Monitor:

queue depth
oldest job age
failure rate
processing duration
50. Import Performance

Business imports should process large files asynchronously.

Pipeline:

Upload
 ↓
Queue
 ↓
Extract
 ↓
Normalize
 ↓
Validate
 ↓
Review
51. Streaming

Use streaming where it meaningfully improves perceived performance.

Potential uses:

AI responses
large data exports
long-running progress
52. AI Performance

AI latency must be treated separately from normal API latency.

Measure:

time to first token
total response time
token count
model/provider
retry count
53. AI Model Selection

Do not use an unnecessarily expensive or slow model for simple operations.

Example:

Simple classification
→ lightweight model

Complex reasoning
→ stronger model
54. AI Context Size

Do not send the entire business knowledge base to every AI request.

Use:

relevant retrieval
summaries
structured context
55. Business Memory Performance

Retrieve only relevant memory entries.

Avoid loading the entire memory store into every Copilot request.

56. AI Timeout

AI requests must have bounded timeouts.

The UI must not wait forever.

57. AI Streaming

Where supported and useful, stream responses to improve perceived responsiveness.

58. AI Cost vs Performance

Optimize:

latency
+
quality
+
cost

not latency alone.

59. External APIs

External requests should use:

timeouts
appropriate retries
connection reuse where supported
response validation
60. External API Failure

A slow external service should not unnecessarily block unrelated FrontDesk functionality.

61. Parallel Requests

Independent external requests may run concurrently where appropriate.

Do not parallelize operations that have dependencies.

62. Sequential Operations

Keep dependent operations sequential.

Example:

Create business
 ↓
Get business ID
 ↓
Create catalog
63. API Payload Compression

Use compression where supported and beneficial.

Do not compress tiny responses unnecessarily.

64. Network Performance

Minimize:

round trips
payload size
duplicate requests
unnecessary polling
65. Polling

Polling should have:

reasonable interval
maximum duration
stop condition

Prefer event-driven or real-time updates where justified.

66. Website Builder Performance

The Website Builder may contain:

editor
preview
media
templates
configuration

These should be isolated so that editing one property does not rerender the entire application unnecessarily.

67. Website Preview

The preview should avoid expensive full rebuilds for every tiny edit where possible.

68. Publishing Performance

Publishing should be asynchronous if the build/publish operation is expensive.

69. Public Website Performance

Published websites should prioritize:

fast HTML
optimized assets
minimal JavaScript
responsive images
good caching
70. Public Website JavaScript

Generated public websites should not ship the complete FrontDesk dashboard application.

Only required functionality should be included.

71. QR Performance

QR destinations should resolve quickly.

Avoid unnecessary redirect chains.

72. Search Performance

Search should have:

indexed queries
pagination
reasonable result limits
debounced user input

where appropriate.

73. Search Debouncing

Do not send a network request for every keystroke.

Use debouncing where search behavior requires it.

74. Autosave

Autosave must be throttled/debounced.

Do not send a request for every character typed.

75. Autosave Reliability

Autosave must clearly communicate:

Saving...
Saved
Failed to save
76. Concurrent Editing

If future collaborative editing is introduced, performance and conflict resolution must be designed separately.

It is not required for basic v0.1.

77. Notification Performance

Notifications should generally be asynchronous.

A failed notification provider should not block the main business operation unless the notification is itself the operation.

78. File Upload Performance

Uploads should support:

progress
size validation
appropriate compression
background processing
failure recovery

where appropriate.

79. Large Files

Large files should not be loaded entirely into application memory when streaming/chunking is practical.

80. Memory Usage

Avoid unnecessary in-memory duplication of:

large files
large API responses
large images
large documents
81. Garbage Collection / Resource Cleanup

Long-running workers must release:

file handles
database connections
streams
temporary files
82. Temporary Files

Temporary files must have cleanup policies.

83. Concurrency

Concurrency should be controlled.

Do not allow unlimited:

AI requests
imports
file processing
background jobs
external API calls
84. Worker Concurrency

Worker concurrency should be configured based on:

CPU
memory
database capacity
external API limits
cost
85. Database Load Protection

Do not allow a single feature to overwhelm the database.

Use:

pagination
batching
limits
queueing
caching

where appropriate.

86. Bulk Operations

Bulk operations should be processed in controlled batches.

Avoid massive single transactions when they create unacceptable load or locking.

87. Analytics

Analytics queries should not unnecessarily slow transactional database operations.

Use appropriate aggregation/caching strategies.

88. Activity Feed

Activity feeds should paginate.

Never load the complete activity history by default.

89. Inbox

Conversation history should be loaded incrementally.

Avoid fetching every message for every conversation when only recent messages are needed.

90. Customer Search

Customer search should use appropriate indexes and pagination.

91. Catalog Search

Catalog queries should support:

category
status
search
pagination
sorting

without loading the entire catalog into memory.

92. Authentication Performance

Authentication should remain secure without creating unnecessary database/API requests.

93. Authorization Performance

Authorization checks should be efficient but must never be skipped for performance.

94. Security vs Performance

Never remove:

authorization
validation
rate limiting
input sanitization
audit events

merely to improve performance.

95. Performance Measurement

Before optimizing a bottleneck:

Measure
 ↓
Identify bottleneck
 ↓
Optimize
 ↓
Measure again
96. No Guess-Based Optimization

Do not add:

memoization
caching
database indexes
parallelism
complex queues

without a meaningful reason.

97. Performance Regression

Important performance characteristics should be tested or monitored over time.

98. Regression Detection

Watch for changes in:

bundle size
API latency
database latency
page-load metrics
job duration
AI latency
99. Performance Testing

Use:

load tests
stress tests
API benchmarks
database query analysis
browser performance tools

where appropriate.

100. Load Testing

Load testing should focus first on critical v0.1 paths:

authentication
public website
catalog
enquiry
inbox
AI requests
101. Stress Testing

Stress tests should identify:

maximum safe concurrency
failure behavior
resource exhaustion
recovery behavior
102. Rate-Limit Stress Tests

Verify that expensive endpoints cannot consume unlimited resources.

103. Database Stress Tests

Test realistic workloads rather than arbitrary huge numbers.

104. AI Load Tests

AI providers may have external rate limits and costs.

AI load testing must use controlled usage.

Do not generate unnecessary real provider costs.

105. Free-Cost Development

For v0.1:

Prefer local or mocked performance testing for expensive external services.

106. Performance Monitoring

Observability should track:

API p50
API p95
API p99
database p95
job duration
AI time-to-first-token
frontend Web Vitals

where available.

107. Performance Budgets by Area

Conceptually:

Public Website
→ strongest performance requirement

Dashboard
→ fast interactive experience

Inbox
→ responsive conversation experience

Copilot
→ fast perceived response

Importer
→ predictable asynchronous processing

Analytics
→ acceptable query latency
108. Perceived Performance

When an operation cannot be made instant:

Use:

progress
streaming
skeletons
optimistic updates
background processing

where safe.

109. Never Fake Progress

Progress indicators must not falsely imply real progress.

110. Skeleton Rules

Skeletons should appear for content that genuinely takes long enough to load.

Avoid unnecessary flashing skeletons for very fast requests.

111. Cache Warmup

Do not introduce complicated cache warmup systems until there is a demonstrated need.

112. Cold Start

Monitor backend cold-start behavior if deployed on serverless infrastructure.

113. Serverless Considerations

If serverless functions are used:

keep startup lightweight
avoid huge dependencies
avoid unnecessary initialization
reuse connections where supported
114. PWA Startup

The application shell should load quickly even when the network is slow.

115. Offline Startup

If cached assets exist:

App shell
 ↓
Load
 ↓
Show cached state
 ↓
Sync when online
116. Browser Storage Limits

Do not assume unlimited local storage.

Handle quota errors gracefully.

117. Performance Error Handling

If optimization introduces stale or inconsistent data, correctness wins.

118. Performance and Accessibility

Do not sacrifice accessibility for speed.

Examples:

Do not remove labels.
Do not remove focus states.
Do not remove accessible names.
119. Performance and Security

Do not weaken security to improve benchmark results.

120. Performance and Cost

The best solution balances:

Performance
Reliability
Security
Cost
Complexity
121. AI Coding Rules

AI agents must:

Measure before major optimization.
Avoid unnecessary abstractions.
Reuse existing caching strategies.
Avoid adding dependencies solely for micro-optimizations.
Preserve correctness.
Test performance-sensitive changes.
Document significant performance decisions.
122. Performance Change Documentation

Document significant decisions such as:

Why caching was added
Why an index was added
Why a queue was introduced
Why an endpoint was split
Why a dependency was added
123. Performance Checklist
[ ] No unnecessary API requests
[ ] No obvious N+1 queries
[ ] Pagination implemented
[ ] Images optimized
[ ] Large components lazy-loaded where appropriate
[ ] Database indexes reviewed
[ ] Cache strategy defined where needed
[ ] Background jobs used for long operations
[ ] AI requests bounded
[ ] External requests have timeouts
[ ] Errors handled
[ ] Mobile performance checked
[ ] Public website performance checked
124. Release Performance Gate

A release should not proceed if it introduces a severe unexplained regression in:

authentication
public website availability
critical API latency
database stability
background jobs
frontend startup
125. Final Performance Model
Measure
   ↓
Understand
   ↓
Optimize
   ↓
Verify
   ↓
Monitor

Never:

Guess
 ↓
Add complexity
 ↓
Hope it is faster
126. v0.1 Performance Priorities

Priority order:

1. Correctness
2. Security
3. Reliability
4. Responsiveness
5. Scalability
6. Cost efficiency

Performance optimization must not undermine the first three.