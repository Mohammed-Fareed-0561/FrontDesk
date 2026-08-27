Next: PRIVACY.md.

Create:

FrontDesk/
└── documentation/
    └── PRIVACY.md

This should turn the principles from DATA-GOVERNANCE.md into concrete privacy behavior for FrontDesk v0.1.

It should cover:

1. Purpose
2. Privacy principles
3. Privacy-by-design
4. Data minimization
5. What FrontDesk collects
6. Account data
7. Business data
8. Customer data
9. Uploaded files
10. Communication data
11. AI/Copilot data
12. Business Memory
13. Knowledge Base
14. Analytics/telemetry
15. Cookies and browser storage
16. PWA local storage
17. Authentication/session data
18. API keys and secrets
19. Payment-related information
20. Security/audit data
21. Why each category is processed
22. User consent
23. Consent withdrawal
24. Data access
25. Data correction
26. Data export
27. Data deletion
28. Account deletion
29. Workspace/business deletion
30. Customer-data deletion
31. Retention
32. Backups and deletion limitations
33. Third-party providers
34. AI providers
35. External integrations
36. Data sent outside FrontDesk
37. AI training/data-use restrictions
38. Sensitive-data handling
39. Children's data
40. Public website visitor data
41. Contact/enquiry data
42. Security safeguards
43. Data breach response
44. Privacy incident response
45. Privacy requests
46. Data portability
47. Data residency
48. International transfers
49. Privacy documentation
50. v0.1 privacy matrix
One distinction we need to lock down

FrontDesk has two different privacy perspectives:

                  FRONTDESK
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
     BUSINESS USER          CUSTOMER
          │                     │
          ▼                     ▼
 Business data            Enquiry/contact
 Customers               Public website
 Products                QR interaction
 Knowledge               Communications

The business owner is a FrontDesk user, while their customers may interact with FrontDesk-powered public experiences without having a FrontDesk account.

So privacy requirements must cover both.

AI privacy boundary

This should be explicit:

Business data
      ↓
Relevant retrieval
      ↓
AI request
      ↓
AI response

Not:

Entire business database
        ↓
       AI

And:

Conversation
    ↓
Potential memory
    ↓
Privacy/sensitivity evaluation
    ↓
Business Memory

not:

Everything the user says
          ↓
Permanent Memory
Local/PWA storage

We also need a strict rule:

Browser / IndexedDB
        │
        ├── cached application data
        ├── safe offline data
        └── queued operations

must **not automatically become a place for:

passwords
API keys
long-lived secrets
unnecessary sensitive customer data

This is particularly important because we're planning FrontDesk as a PWA-capable application.

Third-party AI

The document should also distinguish:

FrontDesk stores data
        ≠
AI provider receives data
        ≠
AI provider may train on data

Those are separate questions that must be explicitly controlled by the architecture, provider configuration, contracts/policies, and user-facing disclosures.

Privacy request lifecycle

Define a standard flow:

User requests access/deletion/export
              ↓
Identity verification
              ↓
Determine scope
              ↓
Collect affected data
              ↓
Apply policy
              ↓
Execute request
              ↓
Verify
              ↓
Record completion

For deletion:

Primary database
       +
File storage
       +
Derived indexes
       +
Caches
       +
Relevant application data
       +
Future backup lifecycle

must be considered. Deleting one database row does not necessarily mean all copies of the data have disappeared immediately.

v0.1 privacy matrix

End the document with something like:

Data	Purpose	Stored	AI Access	User Export	Delete
Account data	Account operation	Yes	Limited	Yes	Yes
Business data	Product operation	Yes	Controlled	Yes	Yes
Customer data	CRM/enquiries	Yes	Controlled	Yes	Controlled
Knowledge	Business assistance	Yes	Yes	Yes	Yes
Business Memory	Persistent context	Yes	Yes	Yes	Yes
Conversations	Product functionality	Yes	Yes	Yes	Yes
API secrets	Authentication/integrations	Yes	No	No/raw secret	Revoke
Audit events	Accountability	Yes	Restricted	Restricted	Policy-based
Security events	Protection	Yes	Restricted	Restricted	Policy-based

The exact retention periods and legal obligations should not be invented in this document. They need to be finalized based on the actual jurisdictions, providers, business model, and applicable legal requirements.