It should cover
1. Purpose
2. Integration principles
3. Integration architecture
4. Trust boundaries
5. External provider classification
6. AI providers
7. WhatsApp / messaging
8. Email providers
9. Payment providers
10. Cloud storage
11. Domain/DNS providers
12. QR-related services
13. Analytics providers
14. Authentication providers
15. Webhook architecture
16. API credentials
17. API key storage
18. OAuth
19. Access scopes
20. Token lifecycle
21. Token refresh
22. Token revocation
23. Credential rotation
24. Provider rate limits
25. IP rate limiting
26. Request timeouts
27. Retry strategy
28. Exponential backoff
29. Idempotency
30. Circuit breaking
31. Provider outages
32. Provider fallback
33. Provider replacement
34. Webhook verification
35. Webhook replay protection
36. Webhook idempotency
37. Signature validation
38. External data validation
39. External data normalization
40. External data privacy
41. Data minimization
42. Data sent to providers
43. Data received from providers
44. Provider logging
45. Provider monitoring
46. Provider cost controls
47. AI provider security
48. AI provider data handling
49. Third-party security assessment
50. Integration testing
51. Sandbox/testing environments
52. Production credentials
53. Secret exposure prevention
54. Provider incident response
55. Provider compromise
56. Provider migration
57. Integration removal
58. v0.1 integration matrix
The core architecture

Every external service should pass through a controlled integration boundary:

FrontDesk
   │
   ▼
Integration Adapter
   │
   ├── Authentication
   ├── Validation
   ├── Rate limiting
   ├── Timeout
   ├── Retry
   ├── Logging
   └── Error normalization
   │
   ▼
External Provider

Don't scatter provider-specific API calls throughout the application.

Bad:

Inbox component
    ↓
WhatsApp API

Backend service
    ↓
WhatsApp API

Notification component
    ↓
WhatsApp API

Preferred:

Inbox
  ↓
Messaging Service
  ↓
WhatsApp Adapter
  ↓
WhatsApp

This makes provider replacement much easier.

Credentials

Define a strict hierarchy:

Browser
   │
   ✗ NEVER gets server secrets
   │
   ▼
FrontDesk Backend
   │
   ▼
Secret Manager / Environment
   │
   ▼
Integration Adapter
   │
   ▼
Provider

Never put provider secrets in:

frontend source
localStorage
IndexedDB
public environment variables
URLs
logs
error messages
Git
OAuth integrations

Use:

Connect
  ↓
Authorization
  ↓
Callback
  ↓
Validate state
  ↓
Exchange code
  ↓
Securely store token
  ↓
Use through adapter

Tokens should have:

provider
account
scopes
created_at
expires_at
refresh capability
revocation status

where applicable.

Webhooks

Every webhook should follow:

Provider
   ↓
Webhook endpoint
   ↓
Verify signature
   ↓
Verify timestamp/replay protection
   ↓
Validate payload
   ↓
Check idempotency
   ↓
Queue/process
   ↓
Update FrontDesk
   ↓
Audit/event

Never trust a webhook merely because it arrived at the correct URL.

Provider failures

An external provider should not automatically take down unrelated FrontDesk functionality.

For example:

WhatsApp unavailable
       ↓
Inbox integration degraded
       │
       ├── Catalog still works
       ├── Website still works
       ├── Business settings still work
       └── Internal enquiries still work
AI providers

Because FrontDesk has Copilot and Agents, this needs special treatment:

FrontDesk
    ↓
AI Gateway / Provider Adapter
    ↓
Provider

The application should not hardwire every feature directly to one model provider.

The adapter should normalize:

request
response
errors
timeouts
usage
cost metadata
model information

And AI provider failure must never bypass:

authorization
Action Registry
approval
audit
Provider data boundary

For every integration, explicitly document:

What data is sent?
Why is it sent?
What data comes back?
How long is it retained?
Who can access it?
What happens if the provider is unavailable?

This is particularly important for:

AI
WhatsApp
email
payments
analytics
v0.1 integration matrix

End the document with something like:

Integration	Purpose	Direction	Credentials	Webhook	Criticality	Fallback
AI Provider	Copilot	Both	Server secret	No/optional	High	Controlled fallback
Messaging	Customer communication	Both	OAuth/API	Yes	High	Queue/retry
Email	Notifications	Outbound	Server secret/OAuth	Optional	Medium	Retry
Storage	Files/assets	Both	Server credentials	No	High	Retry
Domain/DNS	Publishing	Both	Restricted credentials	Optional	High	Manual recovery
Payments	Transactions	Both	Server secret	Yes	High	Provider-specific
Analytics	Product insights	Outbound	Public/limited key	Usually no	Low	Disable
Auth provider	Authentication	Both	Restricted	Optional	Critical	Recovery path

The exact providers should be finalized separately; don't lock FrontDesk into a vendor merely because this document lists an integration category.