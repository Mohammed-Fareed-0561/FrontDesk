Next is BOOKINGS-AND-APPOINTMENTS.md.

This is the reusable scheduling layer for salons, hotels, photographers, tutors, repair services, consultants, freelancers, clinics-like non-medical services, and other appointment-based businesses.

For v0.1, we should keep it intentionally lightweight: availability → booking request → confirmation → status → customer notification. We should not build a Calendly/Cal.com-level scheduling system yet.

Create:

FrontDesk/
└── documentation/
    └── 02-product/
        └── FEATURE-SPECIFICATIONS/
            └── BOOKINGS-AND-APPOINTMENTS.md
BOOKINGS-AND-APPOINTMENTS.md
# FrontDesk — Bookings & Appointments Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Bookings & Appointments
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Bookings & Appointments module allows businesses to accept and manage customer bookings.

It provides a reusable scheduling foundation for businesses such as:

- salons,
- hotels,
- photographers,
- tutors,
- freelancers,
- consultants,
- repair services,
- fitness businesses,
- event services,
- home service providers,
- other appointment-based businesses.

The module should eventually support:

- website bookings,
- QR bookings,
- WhatsApp bookings,
- AI bookings,
- staff availability,
- service duration,
- booking reminders,
- rescheduling,
- cancellation,
- deposits,
- payments,
- recurring appointments.

---

# 2. Core Principle

FrontDesk should make booking simple for both sides.

Customer:

    Discover Service
          ↓
    Choose Service
          ↓
    Choose Date
          ↓
    Choose Available Time
          ↓
    Enter Details
          ↓
    Request / Confirm Booking

Business:

    Receive Booking
          ↓
    Confirm
          ↓
    Prepare / Provide Service
          ↓
    Complete
          ↓
    Follow Up

---

# 3. v0.1 Scope

The first release should establish:

- service selection,
- booking creation,
- customer association,
- date/time,
- booking status,
- basic business availability,
- owner/staff booking management,
- basic cancellation,
- basic rescheduling,
- booking notifications,
- booking activity history.

The following should remain future scope:

- complex recurring schedules,
- multi-resource scheduling,
- advanced staff calendars,
- deposits,
- payment gateways,
- waitlists,
- advanced timezone handling,
- recurring appointments,
- advanced hotel room inventory,
- complex resource allocation.

---

# 4. Booking Definition

A booking represents a customer's reservation for a service, time slot, resource, or appointment.

Example:

    Customer:
    Arun Kumar

    Service:
    Haircut

    Date:
    August 28, 2026

    Time:
    5:00 PM

    Duration:
    30 minutes

---

# 5. Booking vs Enquiry

These are separate concepts.

### Enquiry

    "Do you have appointments tomorrow?"

### Booking

    "Book me tomorrow at 5 PM."

An enquiry can lead to a booking.

---

# 6. Booking vs Order

A booking reserves time or a resource.

An order represents a transaction.

Some businesses may have both.

Example:

    Salon

    Booking:
    Haircut — 5 PM

    Order:
    Haircut — ₹300

The system should allow these entities to be linked without forcing every booking to create an order.

---

# 7. Booking Sources

Possible sources:

    WEBSITE
    QR
    WHATSAPP
    MANUAL
    AI_AGENT
    API

v0.1:

    WEBSITE
    MANUAL

---

# 8. Booking ID

Every booking requires a unique internal ID.

Example:

    booking_123

Human-readable display number:

    BK-00123

Internal and public identifiers should remain separate.

---

# 9. Booking Object

Conceptually:

    Booking
    ├── ID
    ├── Display Number
    ├── Workspace ID
    ├── Business ID
    ├── Customer ID
    ├── Service ID
    ├── Staff ID
    ├── Location ID
    ├── Start Time
    ├── End Time
    ├── Status
    ├── Source
    ├── Customer Notes
    ├── Internal Notes
    ├── Created At
    └── Updated At

Exact database schema belongs to database documentation.

---

# 10. Service

A booking normally references a business service.

Example:

    Service:
    Haircut

    Duration:
    30 minutes

    Price:
    ₹300

Services should come from the Business Knowledge Base / catalog where appropriate.

---

# 11. Service Snapshot

Historical bookings should preserve important information.

Example:

    Service:
    Premium Haircut

    Price at booking:
    ₹500

If the current service later becomes:

    ₹650

the historical booking should still display:

    ₹500

---

# 12. Service Duration

Services may have durations.

Examples:

    Haircut:
    30 minutes

    Hair Coloring:
    90 minutes

    Photography Session:
    2 hours

The scheduling system should use duration when calculating availability.

---

# 13. Buffer Time

Future businesses may need preparation/cleanup time.

Example:

    Service:
    Haircut

    Duration:
    30 minutes

    Buffer:
    10 minutes

Total occupied time:

    40 minutes

Not required for basic v0.1.

---

# 14. Booking Status

v0.1 should support:

    PENDING
    CONFIRMED
    COMPLETED
    CANCELLED

Future:

    RESCHEDULED
    NO_SHOW
    WAITING
    REJECTED

---

# 15. Pending

Meaning:

    Booking request exists but has not yet been confirmed.

Example:

    Customer requests:
    5 PM

    Status:
    PENDING

---

# 16. Confirmed

Meaning:

    Business has accepted the booking.

Example:

    Status:
    CONFIRMED

---

# 17. Completed

Meaning:

    Appointment/service was successfully completed.

Example:

    Status:
    COMPLETED

---

# 18. Cancelled

Meaning:

    Booking will not take place.

Cancellation should record:

    Who cancelled
    When
    Reason where applicable

---

# 19. Booking Status Flow

Basic:

    PENDING
       ↓
    CONFIRMED
       ↓
    COMPLETED

Cancellation may occur from appropriate states:

    PENDING
       ↓
    CANCELLED

    CONFIRMED
       ↓
    CANCELLED

---

# 20. Reopening

A cancelled booking should not normally be silently changed back to confirmed.

Future rescheduling/rebooking should create a traceable operation.

---

# 21. Date and Time

Every booking must contain:

    Start Date/Time
    End Date/Time

or:

    Start Date/Time
    Duration

The backend should derive the resulting end time consistently.

---

# 22. Timezone

Bookings must be interpreted in the business/location timezone.

The system should not blindly assume the user's computer timezone is the business timezone.

Example:

    Business:
    Chennai

    Business timezone:
    Asia/Kolkata

---

# 23. Availability

The booking system must determine whether a requested slot is available.

Conceptually:

    Requested Slot
          ↓
    Business Hours?
          ↓
    Service Available?
          ↓
    Staff Available?
          ↓
    Existing Booking Conflict?
          ↓
    Available / Unavailable

---

# 24. Business Hours

Businesses may define opening hours.

Example:

    Monday:
    9 AM – 8 PM

    Tuesday:
    9 AM – 8 PM

    Sunday:
    Closed

---

# 25. Business Hours vs Booking Availability

Opening hours do not necessarily mean every service is available all day.

Example:

    Business:
    9 AM – 8 PM

    Hair Coloring:
    Available:
    10 AM – 6 PM

The booking system should eventually support service-level availability.

---

# 26. Closed Days

Future businesses may configure:

    Sunday:
    Closed

The booking system should not offer slots on closed days.

---

# 27. Special Hours

Future:

    Festival
    Holiday
    Special Event

Example:

    Diwali:
    Closed

This should override normal business hours.

---

# 28. Staff Availability

Future businesses may assign services to staff.

Example:

    Haircut
       ↓
    Priya

    Hair Coloring
       ↓
    Arun

Availability can then depend on staff schedules.

---

# 29. Staff Assignment

A booking may optionally contain:

    Assigned Staff

Example:

    Staff:
    Priya

v0.1 may allow manual staff assignment.

---

# 30. Staff-Free Bookings

Not every business requires a staff member.

Example:

    Photography Studio

Booking:

    Studio Session
    5 PM

No individual staff assignment may be required.

---

# 31. Resource Booking

Future:

    Room
    Chair
    Table
    Equipment
    Vehicle
    Studio

A booking may reserve a resource.

Not required in initial v0.1.

---

# 32. Conflict Detection

The system must prevent overlapping bookings when the same:

    Staff
    Resource
    Service slot

cannot support simultaneous appointments.

Example:

    Priya:
    5:00–5:30 PM

A second booking for Priya:

    5:15–5:45 PM

should be rejected if overlapping appointments are not allowed.

---

# 33. Race Conditions

Two customers may attempt to book the same slot simultaneously.

The backend must ensure that both cannot successfully reserve an exclusive slot.

This must be handled server-side.

---

# 34. Availability Is Not a UI Property

The frontend may display:

    5:00 PM — Available

but the backend must re-check availability when creating the booking.

The UI result is not authoritative.

---

# 35. Slot Generation

Future scheduling engine:

    Business Hours
       +
    Service Duration
       +
    Booking Interval
       +
    Staff Availability
       +
    Existing Bookings
       ↓
    Available Slots

---

# 36. Booking Interval

Future:

    Service duration:
    45 minutes

    Booking interval:
    15 minutes

Possible slots:

    5:00
    5:15
    5:30
    5:45

Not required for the smallest v0.1.

---

# 37. Customer Information

A booking may require:

    Name
    Phone
    Email

Only required fields should be collected.

---

# 38. Guest Booking

Customers should eventually be able to book without creating a FrontDesk account.

Example:

    Name:
    Arun

    Phone:
    +91XXXXXXXXXX

    Booking:
    Haircut

---

# 39. Customer Association

If the customer already exists:

    Booking
       ↓
    Existing Customer

Otherwise:

    Booking
       ↓
    New Customer Relationship

---

# 40. Duplicate Customer Protection

The system should attempt to avoid creating duplicate business customer profiles for the same person.

Matching rules must be carefully designed.

---

# 41. Customer Notes

Customer may provide:

    "I prefer the senior stylist."

This information may be visible to authorized staff.

---

# 42. Internal Notes

Staff may record:

    "Customer requested appointment before wedding."

Internal notes are private.

---

# 43. Booking Confirmation

After successful confirmation:

    Booking Confirmed

Example:

    Your haircut is booked for
    Friday, August 28 at 5:00 PM.

---

# 44. Booking Request Confirmation

If the business uses approval:

    Booking Request Received

instead of:

    Booking Confirmed

This distinction prevents misleading customers.

---

# 45. Manual Confirmation

Owner can open:

    Pending Booking

and select:

    Confirm

or:

    Reject

---

# 46. Rejection

Future status:

    REJECTED

If implemented, rejection should record a reason where appropriate.

Example:

    "Requested slot is unavailable."

---

# 47. Rescheduling

Future:

    Existing Booking
       ↓
    Reschedule
       ↓
    New Slot
       ↓
    Confirm

The system should preserve the history of the change.

---

# 48. Reschedule History

Example:

    Original:
    Aug 28 — 5 PM

    Changed:
    Aug 28 — 6 PM

    Changed by:
    Owner

---

# 49. Cancellation

Cancellation may be initiated by:

    CUSTOMER
    OWNER
    STAFF
    SYSTEM
    AI

All important cancellation actions should be auditable.

---

# 50. Cancellation Reason

Examples:

    Customer request
    Business unavailable
    Staff unavailable
    Duplicate booking
    Other

---

# 51. Cancellation Policy

Future businesses can configure:

    Free cancellation until 2 hours before appointment.

or:

    Cancellation requires approval.

Not required in basic v0.1.

---

# 52. No-Show

Future status:

    NO_SHOW

This is useful for:

    Salons
    Tutors
    Consultants
    Clinics
    Photography
    Service businesses

---

# 53. Waitlist

Future:

    Slot unavailable

↓

    Join Waitlist

↓

    Slot becomes available

↓

    Notify customer

Not part of v0.1.

---

# 54. Booking Notifications

Potential events:

    BOOKING_CREATED
    BOOKING_CONFIRMED
    BOOKING_CANCELLED
    BOOKING_RESCHEDULED
    BOOKING_COMPLETED

The Notifications module should handle delivery.

---

# 55. Reminder Notifications

Future:

    24 hours before

    Your appointment is tomorrow.

Another:

    1 hour before

    Your appointment starts in 1 hour.

Reminder timing should be configurable.

---

# 56. Notification Channels

Future:

    Website
    Push
    WhatsApp
    Email
    SMS

v0.1 may use:

    In-App Notification

and later:

    Email / WhatsApp

---

# 57. Notification Preferences

Businesses may eventually choose:

    Customer confirmation:
    ON

    Reminder:
    ON

    Marketing:
    OFF

Communication preferences must respect customer consent.

---

# 58. Customer Calendar Integration

Future:

    Add to Google Calendar

    Add to Apple Calendar

    Download .ics

Not required for v0.1.

---

# 59. Booking Detail

Example:

    Booking #BK-00123

    Customer:
    Arun Kumar

    Service:
    Haircut

    Date:
    Aug 28, 2026

    Time:
    5:00 PM – 5:30 PM

    Staff:
    Priya

    Status:
    CONFIRMED

---

# 60. Booking List

Owner dashboard:

    Bookings

    ┌──────────────────────────────────────┐
    │ Arun Kumar                           │
    │ Haircut                              │
    │ Aug 28 · 5:00 PM              CONFIRMED │
    └──────────────────────────────────────┘

---

# 61. Calendar View

Future UI:

    Day
    Week
    Month

v0.1 may begin with:

    List
    Day schedule

A full calendar engine is not necessary initially.

---

# 62. Today's Schedule

Useful v0.1 view:

    Today

    10:00 AM
    Arun — Haircut

    11:30 AM
    Priya — Hair Coloring

    2:00 PM
    Ravi — Consultation

---

# 63. Upcoming Bookings

Dashboard:

    Upcoming

    Today:
    8

    Tomorrow:
    11

---

# 64. Booking Filters

v0.1:

    All
    Pending
    Confirmed
    Completed
    Cancelled

Future:

    Assigned to Me
    Today
    Tomorrow
    This Week
    No-Show
    Unpaid

---

# 65. Search

Search by:

    Booking Number
    Customer Name
    Phone
    Service

Search must respect workspace permissions.

---

# 66. Booking Actions

Possible:

    Confirm
    Cancel
    Reschedule
    Assign
    Add Note
    Complete

Only valid actions should be displayed.

---

# 67. Permissions

Future permissions:

    booking.read
    booking.create
    booking.update
    booking.confirm
    booking.cancel
    booking.reschedule
    booking.complete

---

# 68. Staff Permissions

Example:

    Staff can:
    View bookings
    Confirm bookings
    Complete bookings

    Staff cannot:
    Change business availability

Permissions should be configurable.

---

# 69. Owner Permissions

Owners generally have broader access.

However, high-impact actions should still be logged.

---

# 70. Booking Activity Timeline

Example:

    4:12 PM
    Booking created

    4:14 PM
    Assigned to Priya

    4:16 PM
    Booking confirmed

    Aug 28
    Appointment completed

---

# 71. Audit Log

Important booking changes should record:

    Actor
    Action
    Time
    Previous State
    New State

---

# 72. AI Attribution

Future:

    Created by:
    AI Agent

    Confirmed by:
    Owner

This creates accountability.

---

# 73. Booking + Enquiry

Example:

    Enquiry:
    "Do you have an appointment at 5 PM?"

↓

    Booking:
    Aug 28 — 5 PM

The relationship should remain available.

---

# 74. Booking + Order

Some businesses may have:

    Booking
       ↓
    Service
       ↓
    Order

Example:

    Salon

    Booking:
    Haircut at 5 PM

    Order:
    Haircut ₹300

These should be linked when applicable.

---

# 75. Booking + Customer CRM

Completed booking updates the customer timeline.

Example:

    Aug 28
    Haircut appointment completed

---

# 76. Booking + Loyalty

Future:

    Booking Completed
       ↓
    Loyalty Engine
       ↓
    Award Points

---

# 77. Booking + Review

Future:

    Booking Completed
       ↓
    Review Request

Example:

    "How was your experience?"

---

# 78. Booking + Win-Back

Future:

    Last appointment:
    60 days ago

AI may recommend:

    "Customer hasn't returned in 60 days."

---

# 79. AI Booking Assistant

Future customer conversation:

    Customer:
    "Can I get a haircut tomorrow evening?"

AI:

    Checks:
    Business hours
    Service
    Availability

Then:

    "I have 5 PM and 6 PM available."

---

# 80. AI Booking Confirmation

AI should ask for confirmation before finalizing where appropriate.

Example:

    "Haircut tomorrow at 5 PM for ₹300.
     Shall I confirm it?"

Customer:

    "Yes."

↓

    Booking created.

---

# 81. AI Booking Safety

AI must not invent availability.

Availability must come from the booking system.

AI should not say:

    "5 PM is available."

unless the scheduling system has confirmed it.

---

# 82. AI Rescheduling

Future:

    Customer:
    "Can I move my appointment to 6 PM?"

AI:

    Checks availability.

If available:

    "6 PM is available.
     Shall I move your appointment?"

---

# 83. AI Cancellation

Future:

    Customer:
    "Cancel my appointment."

The AI should verify the correct booking/customer context before cancellation.

---

# 84. AI Permissions

The business can eventually control:

    AI can:
    Answer booking questions

    AI can:
    Suggest slots

    AI can:
    Create bookings

    AI cannot:
    Cancel bookings without confirmation

---

# 85. Booking Approval

For high-value services:

    Customer requests booking

↓

    AI creates:
    PENDING

↓

    Owner approves.

This is useful for:

    Weddings
    Photography
    Large events
    Custom services

---

# 86. Deposit

Future:

    Booking

    Deposit:
    ₹500

    Remaining:
    ₹2,000

Payment/deposit should be implemented in the Payment module.

---

# 87. Booking Payment Status

Future:

    UNPAID
    DEPOSIT_PAID
    PAID
    REFUNDED

Do not duplicate payment logic inside booking.

---

# 88. Resource Availability

Future resources:

    Room
    Table
    Chair
    Vehicle
    Equipment
    Studio

Example:

    Photography Studio A

    5 PM:
    Available

---

# 89. Multi-Resource Booking

Future:

    Booking
       ├── Staff: Priya
       ├── Room: Room 2
       └── Equipment: Camera A

The system must ensure all required resources are available.

---

# 90. Hotel Use Case

Hotels are more complex than simple appointments.

Potential future model:

    Room Type
       ↓
    Availability
       ↓
    Reservation
       ↓
    Check-in
       ↓
    Stay
       ↓
    Check-out

The v0.1 booking model should not attempt to fully implement hotel PMS functionality.

---

# 91. Hotel Compatibility

The architecture should avoid preventing future:

    Room Reservation

but hotel-specific inventory and rate management remain future scope.

---

# 92. Tutor Use Case

Example:

    Service:
    Mathematics Tuition

    Duration:
    1 hour

    Availability:
    Monday–Friday

Customer:

    Books:
    Tuesday 6 PM

---

# 93. Photographer Use Case

Example:

    Service:
    Wedding Consultation

    Duration:
    1 hour

Customer:

    Books:
    Saturday 3 PM

Future:

    Quote
    Deposit
    Contract

---

# 94. Repair Service Use Case

Example:

    Service:
    AC Inspection

    Booking:
    Aug 30, 10 AM

Future:

    Booking
       ↓
    Service Visit
       ↓
    Quote
       ↓
    Order
       ↓
    Payment

---

# 95. Home Business Use Case

Example:

    Service:
    Custom Cake Consultation

Customer chooses:

    Saturday
    4 PM

Booking is created.

---

# 96. Availability Configuration

Future business settings:

    Opening Hours
    Booking Interval
    Minimum Notice
    Maximum Advance Booking
    Service Duration
    Staff Availability

---

# 97. Minimum Notice

Future:

    Minimum notice:
    2 hours

Customer cannot book:

    10:00 AM

at:

    9:00 AM

---

# 98. Maximum Advance Booking

Future:

    Maximum:
    30 days

Customer cannot book:

    3 months in advance.

---

# 99. Same-Day Booking

Businesses may allow:

    YES

or:

    NO

---

# 100. Booking Window

Future example:

    Accept bookings:
    7 days ahead

This belongs to scheduling configuration.

---

# 101. Time Slot Granularity

Future:

    15 minutes
    30 minutes
    60 minutes

The scheduling engine should support configurable intervals.

---

# 102. Recurring Availability

Future:

    Monday:
    9 AM – 6 PM

    Tuesday:
    9 AM – 6 PM

This should be represented as recurring rules rather than thousands of stored slots.

---

# 103. Exceptions

Future exceptions:

    Holiday
    Leave
    Special event
    Emergency closure

Exceptions override recurring availability.

---

# 104. Staff Leave

Future:

    Priya unavailable:
    Aug 30

The scheduling engine should remove affected slots.

---

# 105. Business Closure

Future:

    Business closed:
    Aug 30

No booking slots should be generated.

---

# 106. Booking Capacity

Some services may allow multiple customers per slot.

Example:

    Yoga Class
    Capacity:
    10

Future scheduling must support capacity-based bookings.

---

# 107. Group Booking

Future:

    Yoga Class
    10 seats

Customer books:

    2 seats

Not required in v0.1.

---

# 108. Waitlist Capacity

Future:

    Capacity:
    10

Current:

    10/10

Customer:

    Join Waitlist

---

# 109. Booking Reminder

Future:

    Booking tomorrow

↓

    Reminder

↓

    Customer confirms attendance

This can later improve no-show rates.

---

# 110. Customer Confirmation

Future reminder:

    "Your appointment is tomorrow at 5 PM.
     Confirm?"

    [Confirm]
    [Reschedule]
    [Cancel]

---

# 111. Booking No-Show

Future:

    Appointment time passes

↓

    Staff marks:

    NO_SHOW

This can feed:

    Customer history
    Analytics
    Future policies

---

# 112. No-Show Analytics

Future:

    No-show rate:
    7%

This may help businesses improve reminders/deposits.

---

# 113. Booking Analytics

Future metrics:

    Total bookings
    Confirmed bookings
    Cancelled bookings
    Completed bookings
    No-shows
    Average booking value
    Repeat booking rate
    Utilization
    Cancellation rate

Definitions belong to analytics documentation.

---

# 114. Business Copilot Integration

Future:

    Good morning 👋

    You have 8 bookings today.

    2 customers haven't confirmed
    their appointments.

    1 staff member is unavailable tomorrow.

    [Review]

---

# 115. Business Health Integration

Future:

    "Your cancellation rate increased
     from 8% to 14% this week."

The booking module provides the data.

Analytics interprets it.

---

# 116. Booking Automation

Future:

    WHEN
    Booking confirmed

    THEN
    Send confirmation

    AND
    Add customer activity

---

# 117. Reminder Automation

Future:

    WHEN
    Booking is 24 hours away

    THEN
    Send reminder

---

# 118. Post-Booking Automation

Future:

    WHEN
    Booking completed

    THEN
    Ask for review

    AND
    Award loyalty points

---

# 119. Follow-Up Automation

Future:

    WHEN
    Customer hasn't booked again
    for 60 days

    THEN
    Create win-back recommendation

---

# 120. Booking Events

Future event types:

    BOOKING_CREATED
    BOOKING_CONFIRMED
    BOOKING_CANCELLED
    BOOKING_RESCHEDULED
    BOOKING_COMPLETED
    BOOKING_NO_SHOW

---

# 121. Event Architecture

Conceptually:

    Booking Service
          ↓
    BOOKING_CONFIRMED
          ↓
    +-----------+-------------+
    |           |             |
 Notification  CRM        Automation
    |
    ↓
 Customer

---

# 122. Idempotency

Important operations must avoid duplicate effects.

Example:

    Confirm booking

should not send two confirmations because the request was accidentally submitted twice.

---

# 123. Concurrency

The backend must safely handle simultaneous booking attempts.

Example:

    Customer A → 5 PM
    Customer B → 5 PM

Only the allowed capacity should succeed.

---

# 124. Server Authority

The backend is authoritative for:

    Availability
    Booking status
    Staff assignment
    Time slots

The client is not authoritative.

---

# 125. Validation

Backend validates:

    Business
    Customer
    Service
    Date
    Time
    Staff
    Availability
    Booking status

---

# 126. Invalid Booking

Examples:

    Service does not exist.

    Business is closed.

    Staff unavailable.

    Slot already occupied.

    Booking time is in the past.

The API should return clear errors.

---

# 127. Past Booking

The system should prevent creation of bookings in the past unless explicitly allowed for manual historical entry.

---

# 128. Manual Historical Booking

Future:

    Owner enters:

    "Customer visited yesterday."

This may be supported as a historical record.

It should be clearly identified as manually created historical data.

---

# 129. Booking Deletion

Bookings should generally not be hard-deleted.

Instead:

    Cancel
    Archive

This preserves history.

---

# 130. Data Retention

Booking retention should be defined by:

    Privacy
    Legal
    Business
    Storage

requirements.

Do not assume unlimited retention.

---

# 131. Public Booking Page

Future public route:

    /book

or:

    /business/service/book

Customer sees:

    Service
    Date
    Available Times

---

# 132. Public Booking Security

Public booking URLs should not expose:

    Internal staff data
    Internal notes
    Private customer information

---

# 133. Booking Confirmation Page

Example:

    Booking Confirmed

    Haircut

    Friday
    Aug 28

    5:00 PM

    Reference:
    BK-00123

---

# 134. Booking Reference

Customer-facing reference:

    BK-00123

should not be used as authentication.

---

# 135. Booking Modification Link

Future customers may receive:

    Manage Booking

The link should use a secure token rather than relying solely on the booking number.

---

# 136. Customer Self-Service

Future:

    View booking
    Reschedule
    Cancel
    Confirm

Subject to business policies.

---

# 137. Booking API

Future:

    GET /bookings
    GET /bookings/:id
    POST /bookings
    PATCH /bookings/:id

Actions:

    POST /bookings/:id/confirm
    POST /bookings/:id/cancel
    POST /bookings/:id/complete
    POST /bookings/:id/reschedule

Exact API contracts belong in API documentation.

---

# 138. Availability API

Future:

    GET /availability

Possible inputs:

    Service
    Date
    Location
    Staff

The API should return slots generated from authoritative scheduling rules.

---

# 139. Booking Events API

Future integrations may consume:

    BOOKING_CREATED
    BOOKING_CONFIRMED
    BOOKING_CANCELLED
    BOOKING_COMPLETED

---

# 140. Integration with AI Agent

The AI agent should use:

    Availability API

rather than directly manipulating scheduling tables.

This provides a controlled action boundary.

---

# 141. AI Agent Booking Action

Future action:

    check_availability

Then:

    create_booking

Then:

    confirm_booking

Each action should respect permissions.

---

# 142. AI Approval

Businesses may configure:

    AI can:
    Check availability

    AI can:
    Suggest times

    AI needs approval:
    Create high-value bookings

---

# 143. AI Booking Memory

Future business memory:

    "Never book wedding consultations
     after 7 PM."

The scheduling/action system should enforce business rules where possible.

AI memory should not be the only enforcement mechanism for critical constraints.

---

# 144. Business Knowledge Base Integration

Booking system can read:

    Services
    Service durations
    Prices
    Locations
    Opening hours
    Policies

---

# 145. Business Memory Integration

Example:

    "Appointments require 24 hours notice."

This should ideally become a structured business rule rather than remaining only as natural-language memory.

---

# 146. Structured Business Rules

Long-term:

    minimum_notice = 24h

rather than relying only on:

    "We usually need one day's notice."

Structured rules are safer for automation.

---

# 147. Business Kit Integration

Industry kits may include booking configurations.

Example:

    Salon Kit

    Services
    Booking Page
    Staff
    Availability
    Reminders
    Review Flow

---

# 148. Industry-Specific Booking

The same booking engine should power:

    Salon
    Photographer
    Tutor
    Consultant
    Repair Service

while allowing industry-specific fields.

---

# 149. Custom Fields

Future businesses may define:

    Event Type
    Number of Guests
    Preferred Stylist
    Vehicle Type
    Project Scope

Custom fields should be structured and permission-aware.

---

# 150. Booking Form Builder

Future visual form builder:

    Drag:
    Name

    Drag:
    Phone

    Drag:
    Service

    Drag:
    Date

    Drag:
    Time

    Drag:
    Custom Question

Not required in v0.1.

---

# 151. Booking Conversion

Future metric:

    Booking Page Visits
          ↓
    Booking Requests
          ↓
    Confirmed Bookings

This belongs to analytics.

---

# 152. Booking Funnel

Future:

    Visitors
       ↓
    Service Views
       ↓
    Booking Started
       ↓
    Booking Completed

Useful for identifying booking friction.

---

# 153. Booking Abandonment

Future:

    Customer selected:
    Haircut

    Selected:
    5 PM

    Left without booking.

This can become a future conversion signal.

---

# 154. Privacy

Bookings may contain personal information.

The system should:

- minimize collected data,
- restrict access,
- protect customer information,
- provide appropriate deletion/export mechanisms,
- maintain consent where required.

Detailed requirements belong in privacy documentation.

---

# 155. Security

Booking endpoints must enforce:

- authentication for business management,
- workspace authorization,
- input validation,
- rate limiting,
- secure identifiers,
- server-side availability checks.

---

# 156. v0.1 Free-Cost Principle

FrontDesk is intended to be developed at minimal/no cost.

Therefore v0.1 should avoid requiring paid:

- scheduling APIs,
- SMS providers,
- WhatsApp providers,
- payment providers,
- calendar APIs.

The core booking engine should run on FrontDesk's own backend.

---

# 157. v0.1 P0 Requirements

    BOOKING-P0-001
    Authorized users can create bookings.

    BOOKING-P0-002
    Every booking has a unique ID.

    BOOKING-P0-003
    Bookings belong to the correct workspace/business.

    BOOKING-P0-004
    Bookings can be associated with customers.

    BOOKING-P0-005
    Bookings can reference a service.

    BOOKING-P0-006
    Bookings contain date/time information.

    BOOKING-P0-007
    Booking status is supported.

    BOOKING-P0-008
    Business availability can be represented.

    BOOKING-P0-009
    Server validates booking availability.

    BOOKING-P0-010
    Authorized users can view bookings.

    BOOKING-P0-011
    Authorized users can confirm bookings.

    BOOKING-P0-012
    Authorized users can cancel bookings.

    BOOKING-P0-013
    Booking data is isolated between businesses.

    BOOKING-P0-014
    Booking changes are validated.

    BOOKING-P0-015
    Important booking events can be emitted.

---

# 158. v0.1 P1 Requirements

    BOOKING-P1-001
    Today's schedule.

    BOOKING-P1-002
    Booking search.

    BOOKING-P1-003
    Booking filters.

    BOOKING-P1-004
    Manual staff assignment.

    BOOKING-P1-005
    Basic rescheduling.

    BOOKING-P1-006
    Booking activity history.

    BOOKING-P1-007
    Customer booking history.

    BOOKING-P1-008
    In-app booking notifications.

    BOOKING-P1-009
    Basic availability configuration.

    BOOKING-P1-010
    Basic booking analytics.

---

# 159. v0.1 P2 Requirements

    BOOKING-P2-001
    WhatsApp booking.

    BOOKING-P2-002
    AI booking agent.

    BOOKING-P2-003
    Automated reminders.

    BOOKING-P2-004
    Customer self-service.

    BOOKING-P2-005
    Calendar integrations.

    BOOKING-P2-006
    Deposits.

    BOOKING-P2-007
    Online payments.

    BOOKING-P2-008
    Recurring bookings.

    BOOKING-P2-009
    Staff scheduling.

    BOOKING-P2-010
    Resource scheduling.

    BOOKING-P2-011
    Group bookings.

    BOOKING-P2-012
    Waitlists.

    BOOKING-P2-013
    No-show management.

    BOOKING-P2-014
    Advanced booking rules.

    BOOKING-P2-015
    Hotel reservation capabilities.
160. Acceptance Criteria

The Bookings & Appointments module is complete for v0.1 when:

Authorized business users can create bookings.
A booking belongs to the correct business/workspace.
A booking can reference a customer.
A booking can reference a service.
Date/time is stored correctly.
Business availability can be configured at a basic level.
The backend validates slot availability.
Conflicting bookings are rejected where the slot is exclusive.
Owners can view bookings.
Owners can confirm bookings.
Owners can cancel bookings.
Basic booking status is supported.
Booking history is retained.
Booking data is isolated between businesses.
Important booking events can be consumed by other FrontDesk modules.
The architecture supports future staff scheduling.
The architecture supports future AI booking.
The architecture supports future WhatsApp booking.
The architecture does not require a paid external scheduling service.
161. Example End-to-End Scenario
Salon

Business:

Royal Salon

Service:

Haircut
₹300
30 minutes

Business hours:

9 AM – 8 PM

Customer:

Arun

↓

Customer opens:

Book Appointment

↓

Selects:

Haircut

↓

Selects:

Friday, Aug 28

↓

Available:

4:00 PM
4:30 PM
5:00 PM
5:30 PM

↓

Customer chooses:

5:00 PM

↓

Submits:

Name:
Arun

Phone:
+91XXXXXXXXXX

↓

FrontDesk creates:

BK-00123

↓

Status:

PENDING

↓

Owner confirms.

↓

Status:

CONFIRMED

↓

Customer receives:

Booking confirmed.

↓

Appointment occurs.

↓

Owner marks:

COMPLETED

↓

Future:

Review request

↓

Future:

Loyalty points
162. Example Enquiry → Booking

Customer:

"Can I get a haircut tomorrow?"

↓

Enquiry:

ENQ-00125

↓

Staff:

"Yes, we have 5 PM available."

↓

Customer:

"Book it."

↓

Booking:

BK-00124

↓

Relationship:

ENQ-00125
     ↓
BK-00124
163. Example Future AI Booking

Customer:

"I need a haircut tomorrow evening."

↓

AI:

Checks business services.

↓

Finds:

Haircut — 30 minutes

↓

Checks availability.

↓

Available:

5 PM
6 PM

↓

AI:

"I have 5 PM and 6 PM available.
 Which would you prefer?"

Customer:

"6 PM."

↓

AI:

"Haircut tomorrow at 6 PM for ₹300.
 Shall I confirm?"

Customer:

"Yes."

↓

AI executes:

create_booking

↓

Booking:

CONFIRMED

↓

Customer receives confirmation.

164. Example Conflict

Customer A:

Books:
5 PM – 5:30 PM

Customer B:

Requests:
5 PM – 5:30 PM

If the service/staff capacity is one:

Customer B

must receive:

Slot unavailable

The backend must enforce this even if both customers saw the slot as available earlier.

165. Future Booking Lifecycle

Long-term:

Discovery
   ↓
Service
   ↓
Availability
   ↓
Booking
   ↓
Confirmation
   ↓
Reminder
   ↓
Appointment
   ↓
Completion
   ↓
Payment
   ↓
Review
   ↓
Loyalty
   ↓
Repeat Booking
166. Final Architecture Principle

Bookings should remain independent from:

services,
customers,
orders,
payments,
staff,
resources,
notifications,
AI agents,
automations.

They should connect through explicit relationships and events.

Conceptually:

Booking
   |
   +---- Customer
   |
   +---- Service
   |
   +---- Staff
   |
   +---- Resource
   |
   +---- Location
   |
   +---- Enquiry
   |
   +---- Order
   |
   +---- Notification
   |
   +---- Future AI Agent
   |
   +---- Future Automation
167. Final Principle

A booking is a controlled reservation of business time, capacity, or resources.

FrontDesk should make booking:

Simple → Reliable → Conflict-safe → Trackable → Extensible.

168. Document Status

Status: DRAFT — FOR REVIEW

This document must remain synchronized with:

PRD.md
BRD.md
BUSINESS-IMPORTER.md
BUSINESS-KNOWLEDGE-BASE.md
WEBSITE-BUILDER.md
QR-AND-PUBLIC-PRESENCE.md
WHATSAPP-ENQUIRY.md
BASIC-ANALYTICS.md
BUSINESS-UPDATES.md
USER-ACCOUNTS-AND-WORKSPACES.md
PUBLISHING-AND-VERSIONING.md
MEDIA-AND-ASSET-MANAGEMENT.md
DOMAIN-AND-CUSTOM-URLS.md
NOTIFICATIONS-AND-COMMUNICATIONS.md
SEARCH-AND-DISCOVERY.md
CUSTOMER-PROFILES-AND-CRM.md
ENQUIRY-AND-INBOX.md
ORDERS-AND-ORDER-MANAGEMENT.md
Payment documentation
Inventory documentation
Fulfilment documentation
Quote/Invoice documentation
Loyalty documentation
Automation documentation
AI Business Copilot documentation
AI Agent documentation
Security documentation
Privacy documentation
API documentation
Database schema documentation
MEMORY.md