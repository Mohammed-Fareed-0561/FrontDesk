# FrontDesk — Loyalty & Rewards Specification

**Product:** FrontDesk  
**Version:** v0.1  
**Module:** Loyalty & Rewards  
**Document:** Feature Specification  
**Status:** Draft — For Review  
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Loyalty & Rewards module helps businesses retain customers and encourage repeat purchases.

It allows businesses to create:

- loyalty points,
- rewards,
- coupons,
- referral rewards,
- memberships,
- customer milestones,
- repeat-purchase incentives.

The primary goal is:

> Turn one-time customers into returning customers.

---

# 2. Core Principle

Loyalty is a separate business system.

It should connect with:

- Customers
- Orders
- Payments
- Catalog
- Offers
- CRM
- Notifications
- Analytics
- Automations

but should not tightly couple all of these systems together.

---

# 3. v0.1 Scope

The first version should focus on a simple points-based loyalty system.

v0.1 should support:

- loyalty program creation,
- enabling/disabling loyalty,
- points earning rules,
- points balance,
- points transaction history,
- basic rewards,
- points redemption,
- customer eligibility,
- points expiry configuration,
- basic loyalty dashboard,
- fraud/abuse safeguards,
- customer loyalty visibility.

---

# 4. v0.1 Non-Goals

Do not build a complete loyalty ecosystem initially.

Not v0.1:

- advanced gamification,
- complex membership billing,
- airline-style reward systems,
- multi-business loyalty wallets,
- cryptocurrency rewards,
- transferable points,
- advanced partner rewards,
- sophisticated recommendation engines,
- complex tier management.

These can come later.

---

# 5. Loyalty Program

Each business may create a loyalty program.

Example:

> Royal Bakery Rewards

Configuration:

```text
Program:
Royal Bakery Rewards

Status:
ACTIVE

Earn:
1 point per ₹10 spent

Redeem:
100 points = ₹50 reward
6. Program Status

v0.1:

DRAFT
ACTIVE
PAUSED
ARCHIVED
7. Active Program

Customers can earn and redeem rewards.

8. Paused Program

Customers cannot earn new points.

Existing points may remain available depending on business configuration.

9. Archived Program

Program is no longer active.

Historical loyalty records must remain available.

10. Customer Enrollment

Future customer flow:

Customer
   ↓
Join Loyalty
   ↓
Consent
   ↓
Loyalty Account Created

v0.1 may automatically enroll customers when they opt in.

11. Customer Loyalty Account

Conceptually:

Customer
   │
   └── Loyalty Account
          ├── Balance
          ├── Lifetime Earned
          ├── Lifetime Redeemed
          ├── Transactions
          └── Rewards
12. Points Balance

Example:

Available Points:
450

This is the amount currently available for redemption.

13. Lifetime Points

Example:

Lifetime Earned:
1,250

Lifetime Redeemed:
800

Current Balance:
450
14. Points Ledger

The points balance should be derived from a transaction ledger rather than being treated as an unexplained number.

Example:

+100  Order #1234
+50   Order #1250
-100  Reward Redemption
+200  Promotional Bonus
15. Loyalty Transaction

Conceptually:

Loyalty Transaction
├── ID
├── Customer ID
├── Business ID
├── Type
├── Points
├── Reference
├── Reason
├── Expiry
├── Created At
└── Actor
16. Transaction Types

v0.1:

EARN
REDEEM
ADJUSTMENT
EXPIRATION
REVERSAL
17. Earn Transaction

Customer receives points.

Example:

Order:
₹1,000

Rule:
1 point per ₹10

Earned:
100 points
18. Redemption Transaction

Customer uses points.

Example:

Balance:
500

Redeem:
200

Remaining:
300
19. Adjustment

Authorized business staff may manually add or remove points.

Example:

Customer had an issue with their order. Add 100 goodwill points.

The adjustment must be audited.

20. Expiration

Points may expire according to business rules.

Example:

Points earned:
Jan 1

Expiry:
Jul 1

The system must record the expiration rather than silently deleting points.

21. Reversal

If points were awarded because of an order that is later cancelled/refunded, the associated points may need to be reversed.

Example:

Order:
₹1,000

Earned:
100 points

Order refunded

↓

Reverse:
-100 points

The exact behavior depends on the business's loyalty rules.

22. Earning Rule

Businesses configure how customers earn points.

Example:

₹10 spent
=
1 point
23. Minimum Purchase

Future:

Minimum order:
₹200

Orders below ₹200 earn no points.

24. Maximum Points

Future businesses may cap points earned per transaction.

Example:

Maximum:
500 points/order
25. Eligible Orders

The business can configure whether points are earned on:

all orders,
selected products,
selected categories,
selected days,
selected channels.
26. Discounted Orders

Future business rule:

Points are calculated after discounts.

or:

Points are calculated before discounts.

This must be explicit.

27. Tax and Points

Loyalty calculation should have a defined basis.

Example:

Product:
₹1,000

Discount:
₹100

Tax:
₹162

Total:
₹1,062

The business must configure whether points use:

Pre-discount amount
Post-discount amount
Tax-inclusive amount
Tax-exclusive amount

For v0.1, keep the calculation rule simple and clearly documented.

28. Payment Requirement

Businesses may choose whether points are earned:

When order is confirmed

or:

When order is completed/paid

For stronger fraud protection, awarding after a completed qualifying transaction is preferred.

29. Cancelled Orders

If an order is cancelled before points are awarded:

No points

If points were already awarded:

Reverse points

according to the configured policy.

30. Refunded Orders

Refunds may trigger:

Point reversal

depending on the original loyalty rule.

31. Partial Refund

Future:

Order:
₹1,000

Points earned:
100

Partial refund:
₹300

The system may calculate a proportional reversal if the business enables that rule.

Not required for basic v0.1.

32. Reward

A reward is something the customer can obtain using points.

Example:

Reward:
₹50 Off

Cost:
100 points
33. Reward Fields

Conceptually:

Reward
├── ID
├── Name
├── Description
├── Points Cost
├── Reward Type
├── Value
├── Eligibility
├── Expiry
├── Usage Limit
├── Status
└── Created At
34. Reward Types

v0.1:

FIXED_DISCOUNT
PERCENTAGE_DISCOUNT

Future:

FREE_PRODUCT
FREE_DELIVERY
FREE_SERVICE
MEMBERSHIP
GIFT
35. Fixed Discount

Example:

100 points

↓

₹50 discount
36. Percentage Discount

Example:

200 points

↓

10% off

Future configuration may include:

Maximum discount:
₹500
37. Reward Eligibility

Rewards may be limited by:

customer segment,
minimum order,
product,
category,
business location,
expiry,
membership.
38. Reward Inventory

Future businesses may limit:

100 rewards available

Once exhausted:

SOLD OUT
39. Reward Expiry

A reward may have:

Issued:
Aug 20

Expires:
Sep 20
40. Reward Redemption

Basic flow:

Customer
   ↓
Select Reward
   ↓
Check Points
   ↓
Redeem
   ↓
Points Deducted
   ↓
Reward Issued
41. Redemption Validation

Before redemption:

loyalty program must be active,
customer must be eligible,
sufficient points must exist,
reward must be active,
reward must not be expired,
usage limits must not be exceeded.
42. Prevent Negative Balance

The system must never allow:

Balance:
50

Redeem:
100

unless the business explicitly supports another mechanism.

43. Atomic Redemption

Point deduction and reward creation should happen atomically.

If redemption fails:

No points deducted.
44. Redemption Reference

Each redemption should have a unique reference.

Example:

REWARD-000123
45. Reward Coupon

Future reward redemption may generate:

Coupon:
LOYALTY50

The coupon can then be used during checkout.

46. Loyalty + Coupons

The systems should remain separate.

Loyalty
   ↓
Reward
   ↓
Coupon

Loyalty determines eligibility.

Coupon determines discount application.

47. Loyalty Dashboard

Business owner should see:

Members:
1,240

Points Issued:
125,000

Points Redeemed:
76,000

Active Members:
820

Rewards Redeemed:
420
48. Loyalty Health

Future:

Repeat Purchase Rate
Loyalty Participation
Average Customer Value
Reward Redemption Rate
Inactive Members
49. Customer Loyalty Dashboard

Customer-facing:

Royal Bakery Rewards

Points:
450

Next Reward:
50 points away

Available Rewards:

₹50 Off
100 points

10% Off
200 points
50. Progress Indicator

Example:

450 / 500 points

50 points until your next reward.

This should encourage repeat engagement without misleading customers.

51. Customer Loyalty History

Customer can view:

Aug 25
+100
Order #1234

Aug 20
-200
₹100 Reward

Aug 12
+50
Order #1210
52. Loyalty Notifications

Future notifications:

You earned 100 points 🎉
You are 50 points away from your next reward.
Your 200 points expire in 7 days.
53. Notification Controls

Customers should be able to control marketing/promotional notifications.

Transactional loyalty information should be handled separately.

54. Loyalty Expiry Reminder

Future:

Customer has:
500 points

200 points expire in 7 days.

System can notify the customer.

55. Loyalty Automation

Future:

WHEN
Customer earns 500 points

THEN
Send reward notification
56. Loyalty + Business Copilot

Future:

42 customers are close to their next reward.

18 customers have unused points expiring this month.

Loyalty members purchase 2.4× more frequently than non-members.

Insights should only be shown when sufficient data exists.

57. AI Loyalty Recommendations

Future AI:

Your repeat customers respond well to small rewards.

Consider creating a ₹50 reward for 100 points.

The AI should recommend rather than silently modify loyalty rules.

58. AI Loyalty Campaign

Future:

Owner:

"I want more customers to come back next week."

AI:

Suggested campaign:

Double points
Monday–Thursday

Target:
Customers who haven't purchased
in the last 30 days.

Owner:

[Review]
[Activate]
59. AI Safety

AI must not automatically:

issue unlimited points,
create unlimited discounts,
modify redemption rules,
remove customer points,
launch expensive campaigns.

High-impact changes require approval.

60. Loyalty Rules

Important rules should be structured.

Example:

points_per_currency = 0.1
minimum_order_value = 200
points_award_event = ORDER_COMPLETED
points_expiry_days = 365
61. Business Memory

Business memory may contain:

"We want loyalty rewards to feel premium."

The AI can use this for recommendations.

But actual loyalty calculations must use structured rules.

62. Membership

Membership is a future extension of loyalty.

Example:

Royal Bakery Gold

₹299/month

Benefits:
10% discount
Double points
Member-only products
63. Membership vs Loyalty

They are different.

Loyalty:

Earn based on behavior.

Membership:

Pay/qualify for a defined benefit program.

They can work together.

64. Membership Tiers

Future:

Bronze
Silver
Gold
Platinum

Example:

Gold:
10% discount
2× points
Priority support
65. Tier Qualification

Future:

Spend ₹10,000
within 12 months

↓

Gold

Not v0.1.

66. Referral Program

Future:

Customer A
   ↓
Shares referral
   ↓
Customer B joins
   ↓
Customer B completes purchase
   ↓
A receives reward
67. Referral Code

Example:

ARUN50

Referral attribution must be tracked.

68. Referral Fraud Prevention

The system should prevent obvious abuse such as:

self-referrals,
repeated fake accounts,
repeated referral claims,
suspicious automated activity.
69. Referral Reward Timing

Reward should ideally be issued only after the referred customer completes a qualifying action.

70. Referral Reversal

If qualifying purchase is refunded/cancelled:

Referral reward
    ↓
Review / Reverse

depending on configured rules.

71. Customer Segments

Loyalty can connect with CRM segmentation.

Examples:

VIP
Regular
New
Inactive
High-value
72. Loyalty Segment

Future:

Loyalty Member
Non-member
Active Member
Inactive Member
73. Win-Back Integration

Example:

Customer has not purchased
for 60 days.

↓

AI suggests:

₹50 loyalty reward

↓

Owner approves

↓

Campaign sent
74. Personalized Rewards

Future AI may recommend:

Customer usually buys cakes.

Offer a cake-related reward.

The reward must respect business rules.

75. Product-Specific Rewards

Future:

500 points

↓

Free Chocolate Cake
76. Category Rewards

Future:

500 points

↓

20% off Bakery Products
77. Location Rewards

For multi-location businesses:

Reward valid at:
Tambaram Branch

Future capability.

78. Multi-Location Loyalty

Future:

Business
├── Location A
├── Location B
└── Location C

        ↓

One Loyalty Program
79. Shared Customer Balance

Future customer can use points across locations belonging to the same business.

80. Multi-Business Loyalty

Not planned.

A customer should not automatically have a universal FrontDesk loyalty wallet across unrelated businesses.

This would create significant complexity and fraud considerations.

81. Loyalty Privacy

Customer loyalty information should be private.

Businesses must only access loyalty information belonging to their own customers.

82. Customer Data

Loyalty should store only the information necessary to operate the program.

83. Data Deletion

If a customer requests deletion:

The system must follow the Privacy module's rules.

Financial/legal records may have separate retention requirements.

84. Points Deletion

Do not physically delete historical points transactions merely because a balance changed.

Use:

REVERSAL

or:

ADJUSTMENT

for corrections.

85. Audit Log

Important events:

LOYALTY_ENABLED
LOYALTY_DISABLED
CUSTOMER_ENROLLED
POINTS_EARNED
POINTS_REDEEMED
POINTS_ADJUSTED
POINTS_EXPIRED
POINTS_REVERSED
REWARD_CREATED
REWARD_UPDATED
REWARD_REDEEMED
86. Actor

Every manual adjustment should identify:

Owner
Staff
System
Automation
AI
87. AI Audit

If AI recommends or creates a reward:

Actor:
AI

Action:
Created reward draft

Status:
Awaiting approval
88. Approval Workflow

Future:

AI creates campaign
       ↓
Approval Inbox
       ↓
Owner reviews
       ↓
Approve
       ↓
Campaign activates
89. Loyalty Fraud Protection

Basic safeguards should include:

server-side point calculations,
authenticated customer identity,
transaction references,
duplicate-event prevention,
atomic redemption,
audit logs,
rate limits.
90. Duplicate Order Protection

If the same order event is processed twice:

Order:
ORD-123

Points:
100

The system must not award:

200 points
91. Idempotency

Point-awarding operations should use an idempotent reference.

Example:

Order:
ORD-123

Loyalty Event:
EARN-ORD-123

Processing it twice should produce only one earning transaction.

92. Redemption Concurrency

If a customer has:

500 points

and simultaneously tries to redeem:

400

twice, the system must prevent the balance becoming negative.

93. Atomic Balance Validation

The server should validate:

Available Points >= Requested Points

within the same transactional operation that performs the deduction.

94. Points Expiration

Expiration must be deterministic.

Example:

Points:
100

Earned:
Jan 1

Expiry:
Jan 1 next year

At expiry:

-100
EXPIRATION
95. Expiration Policy

Business can eventually configure:

Never expire
Expire after 90 days
Expire after 180 days
Expire after 365 days
96. Expiry Priority

Future redemption may consume:

Soonest-expiring points first

This can reduce accidental customer loss.

97. Reward Limits

Future:

One reward per customer per month.

or:

Maximum:
3 redemptions/customer
98. Campaign Bonus

Future:

Double Points Weekend

Configuration:

Multiplier:
2×

Start:
Friday

End:
Sunday
99. Campaign Scheduling

This connects to the Scheduled Website/Business Changes system.

Example:

Friday 6 PM
↓
Double Points activated

Sunday 11 PM
↓
Double Points disabled
100. Festival Loyalty Campaigns

Future:

Pongal
Eid
Diwali
Christmas
New Year

Business can activate special loyalty campaigns.

101. Loyalty + Festival Mode

Example:

Diwali Campaign

2× Points
+
Special Reward
+
Website Banner
+
WhatsApp Campaign

This should be orchestrated by the campaign/automation system rather than duplicated inside loyalty.

102. Loyalty + QR

Customer scans business QR.

↓

Public business page.

↓

Customer logs into loyalty account.

↓

Customer sees:

Points:
450
103. Loyalty + Website

Website may display:

Join Rewards

Customer can enroll.

104. Loyalty + WhatsApp

Future:

Customer:

"How many points do I have?"

Business AI:

"You currently have 450 points."

105. Loyalty + AI Customer Agent

Future:

Customer:

"What rewards can I get?"

AI:

"You have 450 points. You can redeem ₹50 off for 100 points or 10% off for 200 points."

The AI must retrieve live loyalty data.

106. Loyalty + Orders

Example:

Order Completed
      ↓
Loyalty Engine
      ↓
Calculate Points
      ↓
Create Earn Transaction
      ↓
Notify Customer
107. Loyalty + Payments

Payment status may determine when points are awarded.

Example:

Order Completed
AND
Payment Completed

↓

Award Points

Business can configure the qualifying event.

108. Loyalty + Refunds

Refund event:

Payment Refunded
      ↓
Loyalty Engine
      ↓
Calculate Point Reversal
109. Loyalty + CRM

Customer profile:

Arun Kumar

Loyalty:
450 points

Lifetime Earned:
1,250

Lifetime Redeemed:
800

Last Purchase:
5 days ago
110. Loyalty + Analytics

Business analytics may show:

Members:
1,240

Orders from members:
620

Orders from non-members:
380
111. Loyalty ROI

Future:

Loyalty Revenue
-
Reward Cost
=
Estimated Loyalty Contribution

This should be clearly labeled as an estimate.

112. Reward Cost

Example:

100 points
=
₹50 discount

Business can estimate the cost of rewards.

113. AI Business Insight

Future:

Loyalty members generated ₹42,000 in revenue this month.

₹3,500 of rewards were redeemed.

Estimated reward cost ratio: 8.3%.

Only provide this when underlying data is reliable.

114. Repeat Purchase Rate

Future:

Customers who purchased again
÷
Customers who purchased

Compare:

Loyalty Members
vs
Non-members
115. Loyalty Activation Metric

A useful metric:

Loyalty Enrollment Rate

Example:

1,000 customers

300 enrolled

Enrollment:
30%
116. Reward Redemption Rate

Example:

Issued:
1,000 rewards

Redeemed:
420

Redemption:
42%
117. Inactive Loyalty Members

Future:

120 loyalty members haven't purchased in 90 days.

AI may suggest a win-back campaign.

118. Business Copilot

Example:

Good morning 👋

Loyalty update:

• 18 customers have points expiring this week.
• 42 members haven't purchased in 60 days.
• 12 rewards were redeemed yesterday.
• Loyalty members generated ₹18,400 this week.

Suggested action:

[Create Win-Back Campaign]
119. AI Recommendation Safety

The AI should explain why it made a recommendation.

Example:

42 loyalty members haven't purchased in 60 days.

I recommend a small win-back reward because these customers previously purchased at least twice.

120. Customer Consent

Businesses should clearly explain:

what the loyalty program stores,
how points work,
how rewards work,
whether marketing messages are sent.
121. Terms

Every loyalty program should have accessible terms.

Example:

Points cannot be exchanged for cash.

Points may expire after 12 months.

Rewards are subject to availability.

The business is responsible for ensuring its terms are legally appropriate.

122. Terms Versioning

Future:

Terms v1
Terms v2

Customers should be associated with the version they accepted where required.

123. Loyalty Program Changes

If the business changes:

1 point / ₹10

to:

1 point / ₹20

the system must define whether existing points remain unchanged.

Existing points should not be silently recalculated.

124. Reward Changes

If a reward changes from:

100 points → ₹50

to:

150 points → ₹50

already-issued rewards should preserve their original terms where appropriate.

125. Program Migration

Future:

Old Program
     ↓
New Program

Migration must preserve customer history.

126. Loyalty Program Version

Future architecture may support:

Program v1
Program v2

This allows rule changes without rewriting historical transactions.

127. Manual Points Adjustment

Owner:

Add 100 points to Arun for the service issue.

System:

Adjustment:
+100

Reason:
Customer service goodwill

Actor:
Owner
128. Negative Adjustment

Owner may remove points when authorized.

Example:

-100

Reason:
Fraudulent transaction reversal

This must be audited.

129. Adjustment Permissions

Only authorized roles should be able to manually modify points.

130. AI Adjustment

AI should not directly perform unrestricted point adjustments.

Instead:

AI recommendation
      ↓
Approval
      ↓
Adjustment
131. Loyalty API Boundary

Future API capabilities:

GET /loyalty/account
GET /loyalty/transactions
GET /loyalty/rewards

POST /loyalty/enroll
POST /loyalty/redeem
POST /loyalty/adjust

Exact API specification belongs in API.md.

132. Customer API Security

Customers must only access their own loyalty information.

133. Business API Security

Businesses can access loyalty records only for their own workspace.

134. Rate Limiting

Loyalty endpoints should be protected against:

brute force,
redemption abuse,
automated account creation,
excessive reward requests.
135. Event API

Future internal events:

ORDER_COMPLETED
PAYMENT_COMPLETED
ORDER_REFUNDED
CUSTOMER_ENROLLED
REWARD_REDEEMED
136. Loyalty Event Consumer

Example:

ORDER_COMPLETED
       ↓
Loyalty Service
       ↓
Evaluate Rule
       ↓
Award Points
137. Event Failure

If loyalty processing fails:

The original order should not automatically become failed unless the business workflow explicitly requires transactional coupling.

A retryable loyalty event should be recorded.

138. Retry

Future:

LOYALTY_EVENT_PENDING
       ↓
PROCESSING
       ↓
SUCCESS

or:

FAILED
       ↓
RETRY
139. Event Idempotency

Every loyalty-triggering event should have a unique business reference.

140. Customer Identity

A loyalty account must be associated with a stable customer identity.

Possible identifiers:

Customer ID
Verified phone
Verified email
Account ID

The exact identity strategy belongs to the authentication/customer architecture.

141. Guest Customers

Future businesses may allow loyalty enrollment after a guest order.

Example:

Guest Order
   ↓
Customer invited to join
   ↓
Claim Loyalty Points

This requires secure identity verification.

142. Guest Point Claiming

Never allow arbitrary users to claim another customer's points.

Verification must be required.

143. Loyalty Wallet

The term "wallet" should be used carefully.

FrontDesk loyalty points are:

Business-specific reward points.

They are not:

money,
cryptocurrency,
a bank balance,
transferable financial assets.
144. Cash Conversion

v0.1 should not support:

100 points → ₹100 cash withdrawal

Rewards should be redeemed according to configured business offers.

145. Multi-Business Points

Not v0.1.

A customer's points belong to a specific business.

146. Customer Transfer

Not v0.1.

Customers should not transfer points between accounts.

147. Loyalty Security

The backend is authoritative for:

Points
Rewards
Eligibility
Redemption
Expiry

Never trust client-submitted balances.

148. Client-Side Display

Frontend may display:

450 points

but the server must verify the real balance for redemption.

149. Reward Redemption Confirmation

Before redemption:

Redeem ₹50 Off?

Cost:
100 points

Current balance:
450

Remaining:
350

[Cancel]
[Redeem]
150. Redemption Success
Reward redeemed successfully.

Reward:
₹50 Off

Points used:
100

Remaining:
350
151. Redemption Failure

Example:

Unable to redeem reward.

Your points may have changed.
Please refresh and try again.

The system must not deduct points if the redemption transaction failed.

152. Customer Experience Principle

The customer should always know:

How many points they have
How they earned them
What they can redeem
What rewards expire
What happened to their points
153. Business Experience Principle

The owner should always know:

How many members they have
How much loyalty is being used
Which rewards are popular
How much is being redeemed
Whether loyalty appears to improve retention
154. v0.1 P0 Requirements
LOYALTY-P0-001
Business can enable a loyalty program.

LOYALTY-P0-002
Business can disable/pause the loyalty program.

LOYALTY-P0-003
Customer can have a loyalty account.

LOYALTY-P0-004
Points balance is tracked.

LOYALTY-P0-005
Points transactions are recorded.

LOYALTY-P0-006
Businesses can configure a basic earning rule.

LOYALTY-P0-007
Qualifying completed orders can award points.

LOYALTY-P0-008
Customers can view their points balance.

LOYALTY-P0-009
Customers can view loyalty transaction history.

LOYALTY-P0-010
Businesses can create basic rewards.

LOYALTY-P0-011
Customers can redeem eligible rewards.

LOYALTY-P0-012
Server validates available points.

LOYALTY-P0-013
Redemption is atomic.

LOYALTY-P0-014
Duplicate loyalty events do not create duplicate points.

LOYALTY-P0-015
Manual adjustments are audited.

LOYALTY-P0-016
Workspace isolation is enforced.

LOYALTY-P0-017
Historical loyalty transactions are preserved.

LOYALTY-P0-018
Cancelled/refunded orders can trigger appropriate point reversal logic.

LOYALTY-P0-019
Loyalty state is independent from payment state.

LOYALTY-P0-020
Loyalty state is independent from order state.
155. v0.1 P1 Requirements
LOYALTY-P1-001
Points expiry.

LOYALTY-P1-002
Expiry notifications.

LOYALTY-P1-003
Customer loyalty dashboard.

LOYALTY-P1-004
Business loyalty dashboard.

LOYALTY-P1-005
Reward usage limits.

LOYALTY-P1-006
Percentage rewards.

LOYALTY-P1-007
Customer segments.

LOYALTY-P1-008
Win-back campaigns.

LOYALTY-P1-009
WhatsApp loyalty notifications.

LOYALTY-P1-010
Basic referral program.

LOYALTY-P1-011
Business Copilot loyalty insights.

LOYALTY-P1-012
Loyalty automation triggers.
156. v0.1 P2 Requirements
LOYALTY-P2-001
Memberships.

LOYALTY-P2-002
Membership tiers.

LOYALTY-P2-003
Double-points campaigns.

LOYALTY-P2-004
Advanced personalization.

LOYALTY-P2-005
Product-specific rewards.

LOYALTY-P2-006
Multi-location loyalty.

LOYALTY-P2-007
Advanced referral system.

LOYALTY-P2-008
Gamification.

LOYALTY-P2-009
Advanced loyalty analytics.

LOYALTY-P2-010
AI loyalty optimization.

LOYALTY-P2-011
Partner rewards.

LOYALTY-P2-012
Advanced campaign engine.
157. Acceptance Criteria

The Loyalty & Rewards module is complete for v0.1 when:

A business can enable loyalty.
Customers can have loyalty accounts.
Points balances can be tracked.
Points transactions are stored.
Businesses can define a basic earning rule.
Qualifying completed orders can award points.
Customers can view their balance.
Customers can view their history.
Businesses can create basic rewards.
Customers can redeem eligible rewards.
Server-side balance validation is enforced.
Negative balances cannot occur.
Duplicate events cannot double-award points.
Redemption is atomic.
Manual adjustments are audited.
Historical loyalty transactions are preserved.
Loyalty is isolated between businesses.
Loyalty does not become a financial wallet.
Loyalty does not automatically imply cash value.
Loyalty integrates cleanly with orders, payments, CRM, notifications, and automation.
158. Example — Café
Royal Café Rewards

Earn:
1 point per ₹10

Customer:
Arun

Order:
₹500

Points:
+50

Balance:
250

Customer later redeems:

₹50 Off

Cost:
100 points

Remaining:
150 points
159. Example — Bakery
Order:
₹1,200

Earn:
120 points

Customer balance:
320

Available reward:

₹100 off
200 points

Customer redeems:

Balance:
120
160. Example — Win-Back
Customer:
Arun

Last purchase:
75 days ago

Lifetime orders:
8

Current points:
350

Copilot:

Arun is a repeat customer who hasn't purchased in 75 days.

Consider offering a small loyalty reward.

[Create Offer]

The AI does not automatically send the campaign.

161. Example — Point Reversal
Order:
₹1,000

Points:
+100

Order is later refunded.

Loyalty ledger:

+100
EARN — ORD-123

-100
REVERSAL — REFUND-ORD-123

Balance remains mathematically traceable.

162. Example — Duplicate Event

System receives:

ORDER_COMPLETED
ORD-123

twice.

First event:

+100 points

Second event:

Already processed

No additional points are created.

163. Example — Concurrent Redemption

Customer:

Balance:
500

Two requests attempt:

Redeem 400

Only one should succeed.

Final balance:

100

The second request should fail safely.

164. Example — AI Recommendation

Owner:

How can I increase repeat purchases?

AI:

Observation:

Loyalty members purchase more frequently
than non-members.

Suggestion:

Create a small reward for customers
who haven't purchased in 45 days.

[Create Draft Campaign]
165. Final Architecture
                    CUSTOMER
                       │
                       ↓
                  LOYALTY ACCOUNT
                       │
             ┌─────────┴─────────┐
             ↓                   ↓
          POINTS               REWARDS
             │                   │
             ↓                   ↓
       POINTS LEDGER       REDEMPTIONS
             │
             ↓
       ORDER EVENTS
             │
             ↓
     COMPLETED / REFUND
166. Integration Architecture
                         FrontDesk
                             │
       ┌─────────────────────┼─────────────────────┐
       ↓                     ↓                     ↓
    Orders                Loyalty               CRM
       │                     │                     │
       ↓                     ↓                     ↓
  Completed             Points/Rewards        Customer
  Refunded              Transactions           Profile
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
        Notifications    Automation      Analytics
              │              │              │
              ↓              ↓              ↓
           WhatsApp        Campaigns       Insights
167. Final Principle

Loyalty should reward real customer behavior, not simply create artificial discounts.

The system should help businesses answer:

"Why should this customer come back?"

while protecting:

customer trust,
business margins,
points integrity,
privacy,
financial accuracy.
