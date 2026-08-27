It should cover
1. Purpose
2. Threat-modeling methodology
3. Security objectives
4. Assets
5. Trust boundaries
6. Actors
7. Attack surfaces
8. Authentication threats
9. Session threats
10. Authorization threats
11. Tenant-isolation threats
12. API threats
13. API key theft
14. IP-based rate limiting
15. Credential stuffing
16. Brute-force attacks
17. Bot/abuse protection
18. File-upload threats
19. Malicious documents
20. Website-builder threats
21. Public website threats
22. QR threats
23. Customer/enquiry threats
24. Webhook threats
25. Database threats
26. Storage threats
27. Secret-management threats
28. Supply-chain threats
29. Dependency vulnerabilities
30. XSS
31. CSRF
32. SSRF
33. SQL injection
34. Command injection
35. Path traversal
36. IDOR
37. Privilege escalation
38. Account takeover
39. Data exfiltration
40. API abuse
41. DDoS/resource exhaustion
42. AI prompt injection
43. AI data exfiltration
44. AI tool abuse
45. AI action escalation
46. AI approval bypass
47. Third-party integration threats
48. Insider threats
49. Logging/telemetry threats
50. Backup threats
51. Disaster/recovery threats
52. Threat severity
53. Mitigations
54. Detection
55. Incident response
56. Residual risk
57. v0.1 threat matrix
The architecture should explicitly define trust boundaries
                         INTERNET
                            │
                 ┌──────────┴──────────┐
                 │                     │
            Public Users          Business Users
                 │                     │
                 ▼                     ▼
          Public Website          FrontDesk App
                 │                     │
                 └──────────┬──────────┘
                            ▼
                       API Gateway
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
          Auth/AuthZ      API         Rate Limiter
              │             │             │
              └─────────────┼─────────────┘
                            ▼
                     Application Core
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
   PostgreSQL           File Storage          AI Layer
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ▼
                    External Providers

Every boundary should have an explicit security assumption.

The most important FrontDesk threat

Because FrontDesk is multi-business, tenant isolation is a critical threat, not just a normal authorization check.

Example:

Attacker
   │
   │ authenticated as Workspace A
   ▼
GET /businesses/business-B
   │
   ▼
Authorization check
   │
   ├── belongs to A → allow
   │
   └── belongs to B → DENY

The system must never rely on the frontend hiding Business B.

The backend must enforce the boundary.

Your IP-based rate limiter belongs here

Since you specifically wanted this, the threat model should define multiple layers rather than only one IP limit:

                    REQUEST
                       │
                       ▼
                 IP reputation
                       │
                       ▼
                 IP rate limit
                       │
                       ▼
             Account/user rate limit
                       │
                       ▼
             Workspace rate limit
                       │
                       ▼
             Endpoint-specific limit
                       │
                       ▼
                  API handler

For example:

Authentication
→ strict limits

AI/Copilot
→ expensive-operation limits

File uploads
→ size + frequency limits

Search
→ request-frequency limits

Public enquiry
→ abuse protection

Normal API
→ standard limits

IP alone is not sufficient because attackers can rotate IP addresses, while legitimate organizations can share one public IP.

Data theft threat model

We should explicitly model:

                  DATA
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
     Database    Storage      AI
        │          │          │
        ▼          ▼          ▼
     Internal   Downloads   External
      access      /URLs     providers

For each path, define:

Authentication
Authorization
Encryption
Validation
Logging
Rate limiting
Data minimization
API theft

"API stealing" should be broken into actual threats rather than treating it as one category:

API key exposure
        ↓
Credential reuse
        ↓
Unauthorized API calls
        ↓
Data access / resource abuse

Controls:

Short-lived credentials where appropriate
Key rotation
Key revocation
Scopes
Server-side secret storage
Never expose secret keys to frontend
Rate limits
Usage monitoring
Audit events

A frontend application should assume anything shipped to the browser can be inspected.

AI-specific threat model

This deserves its own major section because FrontDesk has Copilot + Agents + Action Registry.

Threats include:

Prompt injection
Malicious business document
        ↓
Imported into Knowledge Base
        ↓
Retrieved by AI
        ↓
Instruction attempts to manipulate AI

The AI must treat retrieved business content as data, not automatically as trusted instructions.

Data exfiltration
User asks AI:
"Show me another customer's private information."
                ↓
AI
                ↓
Authorization boundary
                ↓
DENY
Tool abuse
AI
 ↓
Action Registry
 ↓
Schema validation
 ↓
Authorization
 ↓
Approval if required
 ↓
Execution

The AI must never get unrestricted database access.

Approval bypass

Explicitly test:

AI proposes restricted action
        ↓
Approval required
        ↓
User has not approved
        ↓
Execution MUST NOT happen
File-upload threats

FrontDesk will handle documents and media, so model:

malicious file
      ↓
upload
      ↓
storage
      ↓
parser/OCR
      ↓
AI processing

Potential attacks:

malware
zip bombs
oversized files
malformed documents
polyglot files
path traversal
content-type spoofing
prompt injection
resource exhaustion

Each stage needs its own controls.

Threat severity

Use a consistent model:

Severity	Meaning
Critical	Could cause catastrophic compromise/data loss
High	Significant unauthorized access or major service impact
Medium	Limited compromise or meaningful abuse
Low	Limited impact
Informational	No direct security impact

And don't mark everything "Critical." Severity should depend on likelihood × impact × exploitability.

The v0.1 threat matrix should look like
Threat	Asset	Likelihood	Impact	Severity	Primary Control	Detection
Cross-tenant access	Business data	Medium	Critical	Critical	Server-side authorization	Security events
API key theft	API credentials	Medium	High	High	Secret isolation + rotation	Usage monitoring
Credential stuffing	Accounts	High	High	High	Rate limiting + auth controls	Login monitoring
Malicious upload	Files/system	Medium	High	High	Validation + isolation	Upload monitoring
Prompt injection	AI	High	Medium/High	High	Trust boundaries + tool controls	AI security events
AI action bypass	Business data	Medium	Critical	Critical	Action registry + approval	Audit events
SQL injection	Database	Low/Medium	Critical	High	Parameterized queries	Security testing
XSS	Users/public site	Medium	High	High	Output encoding + CSP	Security testing
DDoS/resource exhaustion	Availability	Medium	High	High	Rate limiting + infrastructure controls	Metrics/alerts

The exact ratings should be reviewed against the final architecture rather than blindly accepted.

One rule I strongly recommend

Add this to the document:

Every new FrontDesk feature must identify its new assets, trust boundaries, attack surfaces, threats, and security controls before production release.

That means security becomes part of the feature-development lifecycle:

Feature
  ↓
Threat analysis
  ↓
Security design
  ↓
Implementation
  ↓
Security tests
  ↓
Release