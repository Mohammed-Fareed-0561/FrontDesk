It should cover:

1. Testing philosophy
2. Testing pyramid
3. Test environments
4. Unit testing
5. Component testing
6. Integration testing
7. API testing
8. Database testing
9. Authentication testing
10. Authorization testing
11. Tenant-isolation testing
12. Security testing
13. File-upload testing
14. Importer testing
15. Catalog testing
16. Website testing
17. Publishing testing
18. QR testing
19. Inbox testing
20. Customer testing
21. AI Copilot testing
22. AI action testing
23. Approval testing
24. Automation testing
25. Notification testing
26. PWA/offline testing
27. Responsive UI testing
28. Accessibility testing
29. Performance testing
30. Browser testing
31. End-to-end testing
32. Regression testing
33. Error/edge-case testing
34. Failure recovery testing
35. Test data and fixtures
36. Mocking strategy
37. External-service testing
38. CI testing
39. Pre-release testing
40. Production smoke tests
41. Security release gates
42. Definition of test readiness
43. Definition of release readiness
44. AI-agent testing rules
45. v0.1 test matrix
The most important part

For FrontDesk, testing should be layered:

                 E2E
                  ▲
                  │
          Integration Tests
                  ▲
                  │
        Component/API Tests
                  ▲
                  │
             Unit Tests
                  ▲
                  │
             Type System

And security must cut across every layer:

                 SECURITY
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
   Frontend       API        Database
       │            │            │
       └────────────┼────────────┘
                    ▼
                 AI Actions
Critical v0.1 tests

These should eventually become release-blocking tests:

Authentication
     ↓
User belongs to Workspace A
     ↓
User requests Business A
     ↓
✓ Allowed

User requests Business B
     ↓
✗ Denied

That cross-workspace isolation test is more important than many visual tests.

Similarly:

Customer
   ↓
Public website
   ↓
WhatsApp/enquiry
   ↓
Inbox
   ↓
Owner reply

must be tested end-to-end.

And the AI path:

User asks Copilot
       ↓
AI understands
       ↓
Action generated
       ↓
Schema validated
       ↓
Authorization checked
       ↓
Approval required?
       │
    ┌──┴──┐
   YES    NO
    │      │
 Approval  Execute
    │
    ▼
 Execute
    │
    ▼
Audit event

must have tests specifically designed to prove that AI cannot bypass authorization or approval.

One more rule I would put prominently in this document:

A passing frontend test does not prove that the backend is secure. A passing API test does not prove the user experience works. A passing AI test does not prove the AI is authorized. Release confidence requires all applicable layers to pass.