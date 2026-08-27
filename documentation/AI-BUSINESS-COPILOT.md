# FrontDesk — AI Business Copilot Specification

**Product:** FrontDesk  
**Version:** v0.1  
**Module:** AI Business Copilot  
**Document:** Feature Specification  
**Status:** Draft — For Review  
**Last Updated:** 2026-08-26

---

# 1. Purpose

The AI Business Copilot is FrontDesk's proactive business intelligence layer.

Traditional assistants wait for the owner to ask:

> "How is my business doing?"

FrontDesk Copilot should proactively identify useful information and surface it.

Example:

> Good morning 👋
>
> Here are 3 things worth knowing today:
>
> ⚠️ Your most popular product is unavailable.
>
> 📩 You have 6 unanswered enquiries.
>
> 📈 Your weekend offer expires tonight.
>
> [Review] [Fix]

The Copilot should behave more like a lightweight digital business assistant than a generic chatbot.

---

# 2. Core Principle

The Copilot should be:

```text
PROACTIVE
CONTEXTUAL
ACTIONABLE
EXPLAINABLE
SAFE
BUSINESS-AWARE

It should not simply generate more text.

Every recommendation should ideally answer:

What happened?
Why does it matter?
What should the owner consider doing?
Can FrontDesk help perform that action?
3. Product Positioning

FrontDesk is not:

"An AI chatbot for your business."

FrontDesk Copilot is:

"An AI assistant that watches your business and helps you run it."

4. v0.1 Scope

v0.1 should focus on a small set of high-value proactive insights.

Initial capabilities:

daily business summary,
unanswered enquiry detection,
basic product availability alerts,
basic website activity alerts,
offer expiry alerts,
basic customer inactivity insights,
business health observations,
actionable recommendations,
owner approval before consequential actions,
Copilot history,
explanation of recommendations.
5. v0.1 Non-Goals

Do not attempt to build a fully autonomous AI employee in v0.1.

Not included initially:

unrestricted autonomous actions,
autonomous financial decisions,
automatic price changes,
autonomous mass marketing,
complex predictive forecasting,
unrestricted access to business data,
autonomous refunds,
autonomous deletion,
fully autonomous AI agents.

These belong to later versions.

6. Copilot Architecture Concept
Business Data
     ↓
Business Events
     ↓
Signal Detection
     ↓
Insight Generation
     ↓
Prioritization
     ↓
Recommendation
     ↓
Owner Review
     ↓
Automation / Action
7. Data Sources

The Copilot may eventually use:

Business Profile
Products
Catalog
Orders
Bookings
Enquiries
Customers
Reviews
Offers
Website Activity
Analytics
Inventory
Loyalty
Automations
Business Memory

Only data permitted by the business's access controls may be used.

8. Source of Truth

The Copilot must not invent business facts.

Business facts should come from FrontDesk's structured business data.

For example:

Product price
→ Product database

Opening hours
→ Business profile

Order status
→ Order system

Customer history
→ Customer system

AI-generated information should be distinguished from verified business data.

9. Business Knowledge

The Copilot should use the Business Knowledge Base to understand the business.

Example:

Business:
Royal Bakery

Category:
Bakery

Location:
Tambaram

Languages:
Tamil + English

Brand tone:
Premium

Discount policy:
Do not discount premium products
10. Business Memory

The Copilot may use persistent business preferences.

Example:

"Never recommend discounts on premium cakes."

This should influence future recommendations.

11. Business Memory Safety

AI should not silently create important permanent business rules from casual conversations.

Example:

Owner says:

"Don't discount this cake today."

This should not automatically become:

"Never discount cakes."

Temporary instructions and persistent business rules must be distinguishable.

12. Copilot Operating Modes

The Copilot can conceptually operate in:

OBSERVE
SUGGEST
APPROVAL
ACT
13. Observe

The Copilot monitors permitted business signals.

It does not take actions.

14. Suggest

The Copilot identifies something useful and recommends an action.

Example:

18 customers have not returned in 45 days.

Consider a win-back campaign.

15. Approval

For actions with meaningful consequences:

AI recommendation
      ↓
Owner approval
      ↓
Action
16. Act

Only low-risk actions explicitly permitted by business policy may eventually execute automatically.

v0.1 should keep this highly restricted.

17. Morning Brief

A primary v0.1 feature.

Example:

Good morning 👋

Today's business brief:

📩 6 unanswered enquiries

⚠️ 1 popular product unavailable

🎟️ Weekend offer expires tonight

📈 Website visits increased 18%

💡 Suggested action:
Follow up with unanswered enquiries.
18. Daily Brief Principles

The brief should not become a list of every metric.

It should prioritize:

Urgency
Business impact
Actionability
Relevance
Confidence
19. Insight Priority

Possible priority levels:

CRITICAL
HIGH
MEDIUM
LOW
INFO
20. Critical

Examples:

Payment integration disconnected.

Website is unavailable.

Booking system is failing.

These may require immediate attention.

21. High

Examples:

12 unanswered enquiries.

Best-selling product is unavailable.

22. Medium

Examples:

Weekend offer expires tomorrow.

Returning customers are declining.

23. Low

Examples:

Consider improving product descriptions.

24. Info

Examples:

Website traffic increased 12%.

No immediate action required.

25. Insight Structure

Every Copilot insight should conceptually contain:

Insight
├── ID
├── Type
├── Priority
├── Title
├── Explanation
├── Evidence
├── Recommendation
├── Confidence
├── Suggested Action
├── Required Permission
└── Status
26. Example Insight
Title:
6 unanswered enquiries

Explanation:
Six customer enquiries received today
have not received a response.

Evidence:
6 enquiries
Oldest: 3 hours ago

Recommendation:
Review and respond to them.

Action:
Open Inbox
27. Evidence

The Copilot should show enough evidence for the owner to understand why it generated the insight.

Example:

6 unanswered enquiries
↓
Oldest enquiry: 3h 12m
↓
2 are high-priority
28. Avoid False Precision

Do not claim:

"This will increase revenue by ₹3,400."

unless there is a reliable basis.

Prefer:

"Responding quickly may improve your chance of converting these enquiries."

29. Confidence

AI insights should have an internal confidence value.

Example:

Confidence:
HIGH

or:

Confidence:
MEDIUM

This may be exposed to the owner where useful.

30. Confidence Principle

Confidence refers to confidence in the underlying interpretation.

It does not mean:

Probability that the recommendation will succeed.

These should not be confused.

31. Signal Detection

The Copilot can detect business signals.

Example:

Signal:
Product unavailable

↓

Context:
Product received high views

↓

Insight:
Popular product is unavailable and may be
affecting potential sales.
32. v0.1 Signal Types

Initial signals:

UNANSWERED_ENQUIRIES
PRODUCT_UNAVAILABLE
OFFER_EXPIRING
WEBSITE_ACTIVITY_CHANGE
CUSTOMER_INACTIVITY
NEW_REVIEW
BUSINESS_PROFILE_ISSUE
AUTOMATION_FAILURE
33. Future Signals
LOW_STOCK
CONVERSION_DROP
CONVERSION_INCREASE
REVENUE_ANOMALY
BOOKING_DROP
ORDER_DROP
CUSTOMER_CHURN_RISK
UNUSUAL_TRAFFIC
REVIEW_SENTIMENT_CHANGE
PROFITABILITY_CHANGE
34. Unanswered Enquiries

Example:

6 unanswered enquiries

The Copilot should identify:

number,
oldest unanswered enquiry,
urgency,
source,
potential priority.
35. Enquiry Recommendation

Example:

You have 6 unanswered enquiries.

2 have been waiting for more than 3 hours.

Review them now?

[Open Inbox]
36. Product Unavailable

Example:

⚠️ Your best-selling chocolate cake is currently unavailable.

Evidence:

Top-selling product
Current availability:
Unavailable

Recommendation:

Update availability or add a replacement product.

37. Offer Expiry

Example:

🎟️ Your WEEKEND20 offer expires tonight.

Possible actions:

[Extend Offer]
[Deactivate]
[View Offer]

The Copilot must not automatically extend an offer unless explicitly authorized.

38. Website Activity Change

Example:

Website visits are down 22% compared with the previous period.

The comparison period must be clearly stated.

Example:

Compared with the previous 7 days.

39. Analytics Context

The Copilot must avoid interpreting tiny datasets as meaningful trends.

Example:

5 visitors yesterday vs 3 visitors today.

It should not confidently claim:

"Traffic is collapsing."

40. Minimum Data Thresholds

Signal generation should use minimum data thresholds where appropriate.

Example:

A conversion trend may require a sufficient number of visits.

Exact thresholds should be defined in analytics specifications.

41. Customer Inactivity

Example:

18 customers haven't returned in 45 days.

The Copilot can suggest:

Consider creating a win-back campaign.

42. Customer Segmentation

Future Copilot can identify:

New Customers
Returning Customers
VIP Customers
Inactive Customers
High-Value Customers
43. Review Insights

When a new review arrives:

⭐ A customer left a 2-star review.

The Copilot can suggest:

Review the feedback and respond.

For positive reviews:

⭐ You received a 5-star review.

Possible action:

Request permission to use the review in marketing.

44. Review Sentiment

Future AI may classify reviews:

Positive
Neutral
Negative

The classification should not be treated as absolute truth.

45. Automation Failure

Example:

⚠️ Your "Review Request" automation failed 8 times today.

Reason:

Messaging integration is disconnected.

Action:

[Fix Integration]
[View Automation]
46. Business Health

The Copilot may produce a lightweight health summary.

Example:

Business Health

Website        Good
Enquiries      Needs Attention
Catalog        Good
Automations    Warning
Customer Flow  Good
47. Avoid Vanity Scores

A single score such as:

Business Health: 82/100

should not become the primary product.

The underlying reasons are more important.

48. Business Score

If implemented later:

Website
SEO
Customer Response
Catalog
Reviews
Operations

Each score must have transparent reasoning.

49. Recommendations

A recommendation should be actionable.

Weak:

"Your customers are inactive."

Strong:

"18 customers haven't ordered in 45 days. Consider a win-back message."

50. Recommendation Actions

Possible actions:

Open Inbox
Create Offer
Create Automation
Update Product
View Analytics
Reply to Review
Fix Integration
Edit Website
51. One-Click Actions

For low-risk tasks:

[Fix]

may directly perform a safe action.

Example:

Missing image alt text detected.

[Fix All]
52. Approval Actions

For higher-impact changes:

[Review & Approve]

Example:

AI recommends sending a win-back campaign to 83 customers.

53. Approval Preview

Show:

Audience:
83 customers

Message:
We miss you...

Estimated cost:
₹X

Expected action:
Send marketing message
54. Never Hide Impact

Before consequential actions, show:

audience size,
affected products/customers,
expected external effects,
estimated cost where applicable,
permissions required.
55. Copilot Action Model

The Copilot should not directly execute arbitrary operations.

Instead:

Copilot
   ↓
Proposes structured action
   ↓
Permission validation
   ↓
Approval if required
   ↓
Action Registry
   ↓
Execution
56. Reuse Action Registry

The Copilot should use the same controlled action system as Automations.

Example:

CREATE_LEAD
CREATE_COUPON
UPDATE_PRODUCT
SEND_MESSAGE
ADD_LOYALTY_POINTS

This avoids building a separate unsafe execution system.

57. Copilot + Automations

Example:

Copilot detects:
Many unanswered enquiries

↓

Recommendation:
Create an auto-reply automation

↓

Owner:
Approve

↓

Automation created
58. Copilot + AI Agents

Future:

Copilot detects opportunity
       ↓
AI Agent investigates
       ↓
Agent uses permitted tools
       ↓
Recommendation
       ↓
Owner approval
59. Copilot + Business Memory

The Copilot should consider persistent business rules.

Example:

Business memory:

Never discount premium products.

AI recommendation:

Do not suggest a discount for premium cake.

Instead:

Consider promoting a bundle with a standard product.

60. Business Memory Priority

When conflicting information exists:

Explicit business policy
        >
Structured business data
        >
Recent owner instruction
        >
AI inference

The exact precedence rules should be finalized in the Business Memory specification.

61. Natural Language Questions

The Copilot should also support direct questions.

Example:

How did we do yesterday?

Answer should use verified business data.

62. Example Question

Owner:

Which product sold the most this week?

Copilot:

Chicken Shawarma sold 82 units, making it your best-selling product for the last 7 days.

63. Data Citation / Evidence

Where practical, the Copilot should provide the underlying data source or shortcut.

Example:

Based on 82 completed orders from Aug 20–26.

[View Orders]
64. No Hallucinated Business Facts

If data is unavailable:

I don't have enough order data to determine the best-selling product yet.

Never invent an answer.

65. Unknown vs Zero

The system must distinguish:

No sales

from:

No sales data available

These are not the same.

66. Time Context

Every analytical insight should specify the time period where relevant.

Example:

Revenue increased 14% over the last 7 days compared with the previous 7 days.

67. Business Timezone

The Copilot must use the business's configured timezone.

For example:

Asia/Kolkata
68. Daily Brief Timing

Future configuration:

Every morning

The exact delivery time should be configurable.

69. Notification Channels

Future:

FrontDesk Dashboard
Email
WhatsApp
Push Notification

v0.1 should prioritize the FrontDesk dashboard/inbox.

70. Notification Frequency

The Copilot must avoid excessive notifications.

Possible modes:

Minimal
Balanced
Proactive
71. Minimal

Only important issues.

72. Balanced

Important issues plus useful opportunities.

73. Proactive

More frequent recommendations.

Future feature.

74. Notification Suppression

If the same issue has already been shown:

Do not repeatedly notify the owner

unless the situation changes significantly.

75. Insight Lifecycle

Each insight may have:

NEW
VIEWED
DISMISSED
ACTED_ON
RESOLVED
EXPIRED
76. Dismissal

Owner can say:

Not useful.

This feedback may help future prioritization.

It should not automatically alter critical business rules.

77. Snooze

Future:

Remind me tomorrow.

or:

Snooze for 7 days.
78. Resolution

Example:

Insight:
Product unavailable

Owner:
Updated product availability

↓

Insight:
RESOLVED
79. Insight Deduplication

The same underlying issue should not create dozens of separate insights.

Example:

Product unavailable

should remain one active issue until resolved or materially changed.

80. Insight Expiry

Some insights become irrelevant.

Example:

Weekend offer expires tonight.

After expiration:

EXPIRED
81. Recommendation History

The owner should be able to review:

What did Copilot recommend?
What did I do?
Did I dismiss it?
Did I approve it?
82. Copilot Activity Log

Example:

Today 9:02 AM
Copilot detected 3 issues.

9:05 AM
Owner approved recommendation.

9:06 AM
Automation created.

9:10 AM
Issue resolved.
83. AI Audit Trail

AI-generated actions must be auditable.

Record:

AI
What it proposed
Why
Evidence
Permissions
Owner decision
Execution result
84. Explainability

Owner should be able to ask:

Why are you recommending this?

Example:

18 customers have not ordered in 45 days, and these customers previously ordered at least twice.

This is more useful than:

AI thinks you should run a campaign.

85. Recommendation Reasoning

The platform should expose concise evidence, not hidden chain-of-thought.

Do not expose private internal reasoning.

Show:

Evidence
Rule/Signal
Recommendation
86. Safety Boundary

The Copilot must never:

invent financial data,
invent customers,
fabricate orders,
change critical business data without authorization,
send mass marketing without permission,
expose private customer data,
bypass automation permissions,
bypass workspace isolation.
87. Financial Safety

The Copilot should not autonomously:

Refund payments
Change bank details
Transfer money
Change tax configuration
88. Pricing Safety

The Copilot may suggest:

Consider testing ₹700–₹750.

But should not automatically change the price.

89. Marketing Safety

The Copilot may propose:

Create a win-back campaign.

It should require appropriate approval before sending.

90. Customer Privacy

The Copilot should only access customer information necessary for the requested analysis/action.

91. Sensitive Data

Sensitive customer information should receive stricter controls.

The Copilot should not casually expose sensitive attributes in summaries.

92. Data Minimization

Only required information should be passed to AI processing.

93. AI Provider Boundary

If external AI models are used, the architecture must define:

what data is sent,
why it is sent,
retention behavior,
provider security,
customer/business controls.
94. Free-of-Cost Development Principle

For v0.1, prefer:

Existing application database
+
Existing event system
+
Open-source/local AI where practical
+
Rule-based signals

AI should not be called for every simple detection.

95. Rule-Based First

Example:

IF
unanswered_enquiries > 5

THEN
generate insight

There is no need to ask an LLM to determine this.

96. AI Where It Adds Value

Use AI for:

summarization,
explanation,
natural-language interaction,
recommendation generation,
message drafting,
business-context interpretation.
97. Cost Control

The system should avoid unnecessary model calls.

Potential strategy:

Business Events
      ↓
Cheap deterministic checks
      ↓
Potentially valuable signal
      ↓
AI analysis
98. AI Model Independence

The Copilot architecture should not be tightly coupled to one AI provider.

The application should use an internal AI service interface.

Conceptually:

Copilot
   ↓
AI Service
   ↓
Configured Model Provider
99. AI Failure

If AI is unavailable:

Core business application continues working.

Basic deterministic alerts should still function where possible.

100. Graceful Degradation

Example:

AI unavailable.

FrontDesk can still say:

You have 6 unanswered enquiries.

It may temporarily omit:

AI-generated recommendation.

101. Copilot Performance

Copilot processing should not block core business operations.

Order creation should not wait for AI analysis.

102. Asynchronous Processing

Future architecture:

Business Event
      ↓
Event Queue
      ↓
Signal Detection
      ↓
Copilot Processing
      ↓
Insight
103. Event Examples
ORDER_COMPLETED
ENQUIRY_CREATED
ENQUIRY_REPLIED
PRODUCT_UPDATED
PRODUCT_UNAVAILABLE
BOOKING_CREATED
REVIEW_CREATED
OFFER_CREATED
OFFER_EXPIRED
AUTOMATION_FAILED
104. Copilot Event Consumers

The Copilot should consume business events without modifying the original event.

105. Insight Generation

Conceptually:

Event
 ↓
Signal
 ↓
Context
 ↓
Priority
 ↓
Insight
106. Context Enrichment

Example:

Product unavailable

alone may not be very important.

But:

Product unavailable
+
Top-selling product
+
High website views

is more important.

107. Context Engine

Future Copilot should combine related signals.

108. Example
Signal 1:
Product unavailable

Signal 2:
Product received high views

Signal 3:
Product generated high sales historically

↓

Your most viewed and best-selling product is currently unavailable.

109. Insight Prioritization

Potential formula:

Priority =
Impact
×
Urgency
×
Confidence
×
Relevance

The exact scoring algorithm can evolve.

110. Do Not Over-Optimize Early

v0.1 can use simple priority rules.

Example:

Payment failure
→ HIGH

Unanswered enquiry
→ HIGH

Offer expires tomorrow
→ MEDIUM

SEO suggestion
→ LOW
111. Copilot Dashboard

Recommended layout:

┌─────────────────────────────────────┐
│ Good morning, Royal Bakery 👋       │
│                                     │
│ 3 things worth knowing today       │
├─────────────────────────────────────┤
│ ⚠️ 6 unanswered enquiries           │
│ [Open Inbox]                        │
├─────────────────────────────────────┤
│ 📦 Chocolate Cake unavailable        │
│ [Update Product]                    │
├─────────────────────────────────────┤
│ 🎟️ Weekend offer expires tonight     │
│ [View Offer]                        │
└─────────────────────────────────────┘
112. Copilot Chat

Future:

┌─────────────────────────────────────┐
│ Ask FrontDesk                       │
│                                     │
│ "Why are orders down this week?"    │
│                                     │
│ [Ask]                               │
└─────────────────────────────────────┘
113. Chat + Proactive Insights

These should share the same business context.

The owner should not have two disconnected AIs.

114. Copilot Commands

Future examples:

Show today's issues.

What should I focus on?

Why are bookings down?

Create a win-back campaign.

What changed this week?

Which products need attention?

115. Action Confirmation

For consequential commands:

I can create a win-back campaign for 83 inactive customers.

Would you like me to prepare it?

[Prepare]
[Cancel]

Then:

Preview
→ Approval
→ Send
116. Copilot Action Lifecycle
Recommendation
      ↓
Draft
      ↓
Approval
      ↓
Execution
      ↓
Result
      ↓
Outcome
117. AI Business Ideas

Future Copilot can generate opportunities.

Example:

Your burger receives high views but low conversion.

Consider testing a combo offer.

118. Opportunity vs Problem

Insights should distinguish:

PROBLEM
OPPORTUNITY
INFORMATION
TASK
WARNING
SUCCESS
119. Example Problem

6 enquiries remain unanswered.

120. Example Opportunity

23 customers viewed your cake section but didn't order.

121. Example Information

Website traffic increased 18%.

122. Example Task

Your business hours are missing from your profile.

123. Example Warning

WhatsApp integration is disconnected.

124. Example Success

Your weekend campaign generated 14 orders.

125. Copilot Feedback

Owner should be able to provide feedback:

Useful
Not useful
Already handled
Incorrect
126. Feedback Learning

Feedback may improve future ranking.

However:

"Not useful"

should not automatically teach the model a permanent business rule.

127. Recommendation Personalization

Over time the Copilot may learn:

Owner prefers concise summaries.
Owner does not use discount campaigns.
Owner prefers WhatsApp communication.

These preferences should be stored appropriately in Business Memory.

128. Owner Preferences

Future settings:

Insight frequency
Preferred channels
Preferred language
Preferred summary time
Automation approval policy
129. Language

FrontDesk should eventually support local languages.

Initial product should support architecture for:

English
Tamil

Additional languages can be added later.

130. Voice

Future:

Owner:

"What's happening today?"

Copilot:

"You have six unanswered enquiries and your most popular cake is unavailable."

Voice interaction belongs to the future Voice Business Management feature.

131. Copilot Personalization

The Copilot should understand business type.

A restaurant Copilot should care about:

Menu
Orders
Bookings
Reviews

A salon Copilot should care about:

Bookings
Services
Staff
Repeat customers
132. Industry Context

Future industry-specific Copilots:

Restaurant Copilot
Salon Copilot
Boutique Copilot
Furniture Copilot
Freelancer Copilot
Bakery Copilot
Hotel Copilot
133. Industry Rules

Industry-specific insights should be implemented carefully.

Example:

Restaurant:

Your best-selling menu item is unavailable.

Salon:

Your 6 PM slot is still available today.

134. Avoid Generic AI Advice

The Copilot should not repeatedly provide generic advice such as:

"Post more on social media."

Recommendations should be based on actual business evidence.

135. Copilot Knowledge Boundary

The Copilot should know:

What it knows
What it can infer
What it does not know
136. Missing Data

Example:

I can't determine your most profitable product because product costs haven't been configured.

Then:

[Add Product Costs]
137. Data Quality Insights

Future Copilot may identify:

23 products are missing descriptions.

8 products are missing images.

Business hours are incomplete.

This creates another operational feedback loop.

138. Data Quality vs Business Insight

Separate:

DATA QUALITY

from:

BUSINESS PERFORMANCE

Example:

Product missing image

is data quality.

Product views dropped

is performance.

139. Copilot Health

Future:

Copilot:
Healthy

Data:
Good

Integrations:
2 warnings

Automations:
1 failed
140. Copilot Availability

If Copilot processing is delayed:

Business insights are being updated.

Core business features remain available.

141. Copilot Privacy

Business owners must be able to understand what data Copilot uses.

Future:

Copilot Data Access

showing:

✓ Orders
✓ Customers
✓ Products
✓ Website Analytics

✗ Financial Credentials
✗ Authentication Secrets
142. Copilot Disable

Owner should be able to disable proactive Copilot features.

Core FrontDesk functionality should continue working.

143. AI Opt-Out

Businesses should eventually have controls for AI processing.

144. Auditability

Every Copilot recommendation should have an internal record.

Example:

Copilot Insight
CI-123

Created:
Aug 26, 2026 09:00

Signal:
6 unanswered enquiries

Recommendation:
Review enquiries

Status:
Acted On
145. Recommendation ID

Every recommendation receives a unique identifier.

Example:

REC-000123
146. Action Correlation

If a recommendation creates an automation:

Recommendation:
REC-123

Action:
Automation:
AUT-456

The relationship should be recorded.

147. Outcome Tracking

Future:

Recommendation
↓
Action
↓
Business Result

Example:

Win-back recommendation
↓
Campaign sent
↓
18 customers returned
148. Attribution Caution

The system should not claim that the recommendation caused an outcome unless the measurement supports that conclusion.

149. Copilot Metrics

Internal product metrics:

Insights Generated
Insights Viewed
Insights Acted On
Insights Dismissed
Recommendations Approved
Actions Executed
Action Success Rate
150. Product Success Metrics

Important metrics:

% businesses receiving useful insights
% businesses returning to Copilot
Recommendation action rate
7-day Copilot engagement
30-day retention
151. Avoid Optimizing for AI Usage

The goal is not:

Maximum AI messages.

The goal is:

Maximum useful business outcomes.

152. Copilot Success Definition

The Copilot succeeds when the owner thinks:

"FrontDesk noticed this before I did."

153. v0.1 P0 Requirements
COPILOT-P0-001
Copilot can read authorized business signals.

COPILOT-P0-002
Copilot can generate a daily business summary.

COPILOT-P0-003
Copilot detects unanswered enquiries.

COPILOT-P0-004
Copilot detects unavailable products.

COPILOT-P0-005
Copilot detects expiring offers.

COPILOT-P0-006
Copilot can surface basic website activity changes.

COPILOT-P0-007
Copilot can identify basic customer inactivity.

COPILOT-P0-008
Every insight has evidence.

COPILOT-P0-009
Every insight has a priority.

COPILOT-P0-010
Recommendations are distinguishable from facts.

COPILOT-P0-011
Copilot cannot execute unauthorized actions.

COPILOT-P0-012
High-impact actions require approval.

COPILOT-P0-013
Copilot uses the Action Registry for supported actions.

COPILOT-P0-014
Copilot activity is auditable.

COPILOT-P0-015
Copilot respects workspace isolation.

COPILOT-P0-016
Copilot does not expose secrets.

COPILOT-P0-017
AI failure does not stop core business functionality.

COPILOT-P0-018
Copilot does not invent unavailable business data.

COPILOT-P0-019
Owner can dismiss an insight.

COPILOT-P0-020
Owner can view insight history.
154. v0.1 P1 Requirements
COPILOT-P1-001
Natural-language business questions.

COPILOT-P1-002
Copilot recommendations.

COPILOT-P1-003
Recommendation approval flow.

COPILOT-P1-004
Business Memory integration.

COPILOT-P1-005
Automation creation from recommendations.

COPILOT-P1-006
Insight deduplication.

COPILOT-P1-007
Insight resolution tracking.

COPILOT-P1-008
Copilot feedback.

COPILOT-P1-009
Basic industry-specific recommendations.

COPILOT-P1-010
Email/push delivery of important insights.
155. v0.1 P2 Requirements
COPILOT-P2-001
Advanced predictive analytics.

COPILOT-P2-002
AI pricing recommendations.

COPILOT-P2-003
AI offer generation.

COPILOT-P2-004
Advanced customer churn prediction.

COPILOT-P2-005
AI campaign optimization.

COPILOT-P2-006
Voice Copilot.

COPILOT-P2-007
AI autonomous action mode.

COPILOT-P2-008
Industry-specific AI models.

COPILOT-P2-009
Advanced business benchmarking.

COPILOT-P2-010
AI-to-AI business communication.
156. Example Full Copilot Flow
Customer submits enquiry
        ↓
Business Event
        ↓
Copilot signal detector
        ↓
Enquiry remains unanswered
        ↓
Context:
6 unanswered enquiries
Oldest = 3 hours
        ↓
Priority:
HIGH
        ↓
Insight generated
        ↓
Owner sees:

"6 enquiries need your attention."

        ↓
Owner clicks:
[Open Inbox]
        ↓
Owner responds
        ↓
Insight:
RESOLVED
157. Example AI Recommendation Flow
Copilot detects:

18 inactive customers

        ↓

Analyzes:
Customer history
Purchase frequency
Business policies
        ↓

Recommendation:

"Consider a win-back campaign."

        ↓

Owner:
[Create Campaign]

        ↓

FrontDesk creates draft

        ↓

Owner reviews:

Audience: 18
Message: ...
Offer: None

        ↓

Owner:
[Approve]

        ↓

Automation / Action executes
158. Example Business Memory Interaction

Business Memory:

Never discount premium products.

Copilot detects:

Premium cake has declining sales.

Bad recommendation:

Give 20% discount.

Correct recommendation:

Premium products are configured as non-discountable. Consider improving visibility or creating a bundle instead.

159. Example Data Limitation

Owner:

Why did revenue decrease?

If revenue data is unavailable:

I can't determine the cause from the available data.

Then:

I can currently see website visits and enquiries, but order revenue isn't connected.

[Connect Orders]
160. Final Product Principle

FrontDesk Copilot should not try to look intelligent.

It should try to be useful.

The ideal experience is:

Business operates
       ↓
FrontDesk observes
       ↓
Important signal appears
       ↓
Copilot explains
       ↓
Owner decides
       ↓
FrontDesk helps execute
       ↓
Outcome recorded
161. Long-Term Vision

The long-term Copilot evolves toward:

Observe
   ↓
Understand
   ↓
Recommend
   ↓
Prepare
   ↓
Ask Permission
   ↓
Act
   ↓
Measure
   ↓
Learn

This eventually becomes the intelligence layer connecting:

Business Data
     +
Business Memory
     +
Automations
     +
Actions
     +
AI Agents
     +
Analytics
162. Final Principle

FrontDesk should not merely tell a business owner what happened. It should help them understand what matters, what they can do next, and safely help them do it.