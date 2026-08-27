# FrontDesk — Quotations & Invoices Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Quotations & Invoices
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Quotations & Invoices module allows businesses to create, manage, send, and track basic commercial documents.

It primarily supports businesses that sell:

- services,
- custom products,
- projects,
- furniture,
- photography,
- repairs,
- consulting,
- freelance work,
- agency services,
- home-business services.

The goal is to provide simple business documentation without attempting to become a complete accounting system.

---

# 2. Core Principle

FrontDesk separates:

    QUOTATION
    ↓
    AGREEMENT / ACCEPTANCE
    ↓
    ORDER / JOB
    ↓
    INVOICE
    ↓
    PAYMENT

These are related but different business objects.

---

# 3. v0.1 Scope

v0.1 should support:

- quotation creation,
- quotation editing,
- quotation numbering,
- customer association,
- line items,
- quantity,
- unit price,
- discounts,
- taxes where configured,
- subtotal,
- total,
- validity date,
- notes,
- terms,
- quotation status,
- PDF generation,
- sharing,
- basic invoice creation,
- invoice numbering,
- payment status,
- invoice history,
- audit history.

---

# 4. v0.1 Non-Goals

v0.1 should NOT attempt to implement:

- complete accounting,
- double-entry bookkeeping,
- balance sheets,
- general ledger,
- payroll,
- advanced tax filing,
- GST return filing,
- inventory accounting,
- purchase accounting,
- automated bank reconciliation,
- complex recurring billing,
- enterprise billing,
- multi-country tax compliance.

These may be future integrations/features.

---

# 5. Quotation

A quotation is a proposal from the business to a customer.

Example:

    Website Development

    Design          ₹15,000
    Development     ₹30,000
    Hosting          ₹5,000

    Total           ₹50,000

The quotation is not automatically an invoice.

---

# 6. Invoice

An invoice represents an amount that the business is requesting or recording as due from the customer.

Example:

    Website Development

    Total:
    ₹50,000

    Status:
    UNPAID

---

# 7. Quotation vs Invoice

Quotation:

    "This is what we propose."

Invoice:

    "This is what is due."

They must remain separate entities.

---

# 8. Quotation Lifecycle

Basic lifecycle:

    DRAFT
       ↓
    SENT
       ↓
    VIEWED
       ↓
    ACCEPTED
       ↓
    CONVERTED

Alternative:

    SENT
       ↓
    REJECTED

or:

    SENT
       ↓
    EXPIRED

---

# 9. Quotation Status

v0.1:

    DRAFT
    SENT
    ACCEPTED
    REJECTED
    EXPIRED
    CONVERTED

---

# 10. Draft Quotation

A quotation that is still being prepared.

Example:

    QT-00123

    Status:
    DRAFT

It is not considered sent to the customer.

---

# 11. Sent Quotation

The quotation has been shared with the customer.

Example:

    Status:
    SENT

---

# 12. Viewed Quotation

Future status.

The customer opened the quotation.

Example:

    SENT
       ↓
    VIEWED

This requires public document tracking.

---

# 13. Accepted Quotation

The customer accepts the quotation.

Example:

    Status:
    ACCEPTED

Future workflows may then create:

    Order
    Project
    Booking

depending on the business type.

---

# 14. Rejected Quotation

The customer rejects the quotation.

The quotation remains in history.

---

# 15. Expired Quotation

If:

    Valid Until:
    August 30

and no acceptance occurs before that date:

    EXPIRED

The exact behavior should be configurable.

---

# 16. Converted Quotation

An accepted quotation may become:

    Order

or:

    Invoice

depending on business workflow.

---

# 17. Quotation Number

Every quotation should have a human-readable reference.

Example:

    QT-000001

The internal database ID should remain separate.

---

# 18. Invoice Number

Every invoice should have a unique invoice reference.

Example:

    INV-000001

Invoice numbering rules must be configurable in future.

---

# 19. Numbering

v0.1 may use simple sequential numbering.

Example:

    QT-000001
    QT-000002

    INV-000001
    INV-000002

Future:

    QT-2026-0001
    INV-2026-0001

---

# 20. Numbering Integrity

Document numbers should not silently change after the document becomes finalized.

---

# 21. Customer Association

Every quotation/invoice should be associated with a customer where applicable.

Example:

    Customer:
    Arun Kumar

---

# 22. Customer Information Snapshot

Finalized documents should preserve relevant customer information at the time of document creation/finalization.

This protects historical document integrity if the customer's profile changes later.

---

# 23. Business Information Snapshot

Finalized documents should preserve the business information necessary to represent the document correctly.

Examples:

    Business Name
    Address
    Phone
    Email
    Tax information where configured
    Logo

---

# 24. Line Items

A quotation/invoice may contain multiple line items.

Example:

    Website Design
    Quantity: 1
    Unit Price: ₹15,000

    Development
    Quantity: 1
    Unit Price: ₹30,000

---

# 25. Line Item Fields

Conceptually:

    Line Item
    ├── Description
    ├── Quantity
    ├── Unit
    ├── Unit Price
    ├── Discount
    ├── Tax
    └── Total

---

# 26. Product Line Item

A line item may reference a FrontDesk product.

Example:

    Product:
    Dining Table

    Quantity:
    1

---

# 27. Service Line Item

A line item may represent a service.

Example:

    Photography Package

    Quantity:
    1

---

# 28. Custom Line Item

The business should be able to add a custom item.

Example:

    Custom Design Work

This is particularly important for:

- freelancers,
- agencies,
- consultants,
- repair services.

---

# 29. Quantity

Example:

    Quantity:
    3

---

# 30. Unit

Future:

    piece
    hour
    day
    kg
    session
    project

v0.1 may default to:

    unit

---

# 31. Unit Price

Example:

    Quantity:
    3

    Unit Price:
    ₹500

Subtotal:

    ₹1,500

---

# 32. Discount

A quotation/invoice may support a discount.

Example:

    Subtotal:
    ₹10,000

    Discount:
    ₹1,000

    Taxable amount:
    ₹9,000

---

# 33. Discount Types

v0.1:

    FIXED_AMOUNT

Future:

    PERCENTAGE

Both should be supported by architecture where practical.

---

# 34. Tax

Tax may be configured where applicable.

Example:

    Tax:
    18%

Tax rules should not be hardcoded into the entire system.

---

# 35. Tax Disclaimer

FrontDesk should not assume that every business must charge a particular tax rate.

Tax configuration must depend on:

- business configuration,
- jurisdiction,
- applicable rules.

---

# 36. Tax Calculation

Conceptually:

    Subtotal
       -
    Discount
       +
    Tax
       =
    Total

Exact tax behavior belongs in financial/tax configuration.

---

# 37. Tax Data

Future tax fields may include:

    Tax Name
    Tax Rate
    Tax Amount
    Tax Registration Number
    Tax Category

---

# 38. Currency

Documents should explicitly specify currency.

Example:

    INR

---

# 39. Money Precision

Financial calculations must use precise monetary representation.

Do not rely on floating-point arithmetic for final totals.

---

# 40. Server-Side Calculation

The backend must calculate authoritative:

    Subtotal
    Discount
    Tax
    Total

The frontend may preview calculations but cannot be trusted as the final authority.

---

# 41. Calculation Example

    Item A:
    ₹1,000 × 2
    = ₹2,000

    Item B:
    ₹500 × 1
    = ₹500

    Subtotal:
    ₹2,500

    Discount:
    ₹250

    Tax:
    ₹405

    Total:
    ₹2,655

---

# 42. Rounding

Financial calculations must define a consistent rounding policy.

The policy must be applied consistently across:

    UI
    API
    PDF
    Payment
    Analytics

---

# 43. Quotation Validity

A quotation may have:

    Valid Until

Example:

    Valid Until:
    September 5, 2026

---

# 44. Quotation Terms

Business can add:

    Terms & Conditions

Example:

    "50% advance required before work begins."

---

# 45. Notes

Business can add notes.

Example:

    "Delivery within 7 working days."

---

# 46. Customer Notes

Future:

    Internal Notes
    Customer-visible Notes

These must remain separate.

---

# 47. Internal Notes

Example:

    "Customer negotiated 10% discount."

Internal notes must never accidentally appear in customer-facing documents.

---

# 48. Public Notes

Example:

    "Installation included."

These can appear on the quotation/invoice.

---

# 49. Quotation PDF

FrontDesk should generate a professional PDF.

Example structure:

    Business Logo

    Business Name
    Contact Information

    QUOTATION
    QT-000123

    Customer

    Items
    --------------------------------
    Description | Qty | Price | Total

    Subtotal
    Discount
    Tax
    Total

    Valid Until

    Notes

    Terms

---

# 50. Invoice PDF

Example:

    Business Information

    INVOICE
    INV-000123

    Customer

    Invoice Date
    Due Date

    Items

    Subtotal
    Discount
    Tax
    Total

    Payment Status

    Payment Instructions

---

# 51. PDF Generation

PDF generation should occur server-side or through a controlled document-generation layer.

The generated document should use authoritative business/document data.

---

# 52. PDF Version

Finalized documents should be reproducible.

If a business later changes:

    Logo
    Address
    Tax configuration

the historical invoice should not unexpectedly change.

---

# 53. Document Snapshot

When finalized, preserve relevant document data.

Conceptually:

    Invoice
    ├── Customer Snapshot
    ├── Business Snapshot
    ├── Line Item Snapshot
    ├── Pricing Snapshot
    ├── Tax Snapshot
    └── Terms Snapshot

---

# 54. Document Immutability

Once an invoice is finalized:

    Do not silently rewrite financial values.

If something is wrong:

    Void
    Credit Note
    Adjustment
    Replacement Invoice

may be required in future.

---

# 55. Invoice Status

v0.1:

    DRAFT
    ISSUED
    PARTIALLY_PAID
    PAID
    OVERDUE
    CANCELLED

Future:

    VOID
    REFUNDED

---

# 56. Draft Invoice

Invoice is being prepared.

It is not yet considered formally issued.

---

# 57. Issued Invoice

Invoice has been finalized and delivered/issued.

---

# 58. Paid Invoice

Associated payment records indicate that the invoice has been fully paid.

---

# 59. Partially Paid

Example:

    Invoice:
    ₹10,000

    Paid:
    ₹4,000

    Outstanding:
    ₹6,000

---

# 60. Overdue

Example:

    Due Date:
    August 20

    Current Date:
    August 26

    Outstanding:
    ₹5,000

Status:

    OVERDUE

---

# 61. Cancelled Invoice

Future behavior must preserve historical audit information.

Cancellation must not simply delete the invoice.

---

# 62. Due Date

Invoice may contain:

    Invoice Date
    Due Date

Example:

    Invoice Date:
    Aug 26

    Due:
    Sep 10

---

# 63. Payment Status

Payment status should be derived from the Payments module.

Example:

    Invoice Total:
    ₹10,000

    Paid:
    ₹10,000

    Status:
    PAID

---

# 64. Outstanding Amount

Conceptually:

    Outstanding =
    Invoice Total
    -
    Valid Payments
    +
    Applicable Adjustments

Exact financial rules belong to the Payments/Financial model.

---

# 65. Payment Integration

Invoice:

    INV-000123

Payment:

    PAY-000123

Relationship:

    Invoice
       ↓
    Payments

---

# 66. Multiple Payments

Example:

    Invoice:
    ₹10,000

    Payment 1:
    ₹3,000

    Payment 2:
    ₹7,000

Invoice:

    PAID

---

# 67. Payment Link

Future:

    Invoice
       ↓
    Generate Payment Link
       ↓
    Customer Pays
       ↓
    Payment Confirmed

This belongs to the Payments module.

---

# 68. Quotation to Invoice

Future workflow:

    Quotation
       ↓
    Accepted
       ↓
    Convert
       ↓
    Invoice

The invoice should use the accepted quotation's agreed commercial information.

---

# 69. Quotation to Order

Alternative:

    Quotation
       ↓
    Accepted
       ↓
    Order

Then:

    Order
       ↓
    Invoice

The correct workflow depends on the business type.

---

# 70. Quotation to Project

For agencies/freelancers:

    Quotation
       ↓
    Accepted
       ↓
    Project

The project may later generate invoices.

---

# 71. Quotation to Booking

For event/photography/service businesses:

    Quotation
       ↓
    Accepted
       ↓
    Booking

---

# 72. Conversion Integrity

When converting:

    Quotation → Invoice

the system should preserve the original quotation.

Do not delete it.

---

# 73. Conversion Reference

Invoice should be able to show:

    Based on quotation:
    QT-000123

---

# 74. Invoice Reference

Quotation may show:

    Converted to:
    INV-000123

This provides traceability.

---

# 75. Customer Approval

Future quotation acceptance may use:

    Accept

button.

Customer may optionally provide:

    Name
    Confirmation
    Timestamp

---

# 76. Digital Acceptance

Future:

    Customer opens quotation.

    [Accept Quote]

System records:

    Accepted At
    Customer
    Document Version

---

# 77. Quote Acceptance Security

Public acceptance links must use secure, non-guessable identifiers.

---

# 78. Quote Expiration

If quotation is expired:

    Customer should not be able to accept it unless the business explicitly extends validity.

---

# 79. Quote Revision

Customer requests:

    "Can you reduce the price?"

Business creates:

    Revision

rather than silently overwriting the already-sent quotation.

---

# 80. Quote Versions

Example:

    QT-000123 v1

    ₹50,000

Customer requests changes.

    QT-000123 v2

    ₹46,000

---

# 81. Revision History

Show:

    Version 1
    Version 2

and:

    Who changed it
    What changed
    When

---

# 82. Sent Document Integrity

A quotation that was already sent should remain reproducible.

If the business changes the draft later:

    New Version

should be created.

---

# 83. AI Quotation Generator

Future owner request:

> "Create a quotation for Arun for a basic website."

AI uses business information.

Draft:

    Website Development

    Design:
    ₹15,000

    Development:
    ₹30,000

    Hosting:
    ₹5,000

    Total:
    ₹50,000

The result must be:

    DRAFT

until approved.

---

# 84. AI Must Not Invent Pricing

AI must not invent a business's actual price unless:

- the owner explicitly provides it,
- the price exists in the business knowledge base,
- or the owner explicitly asks for a suggested price.

Suggested prices must be clearly labeled as suggestions.

---

# 85. AI Quote Approval

Example:

> AI created a quotation for ₹50,000.

    [Review]

    [Edit]

    [Send]

AI should not automatically send high-impact commercial documents without appropriate authorization.

---

# 86. AI Invoice Generation

Future:

> "Create the invoice for Arun based on accepted quotation QT-00123."

AI retrieves:

    Customer
    Quotation
    Items
    Prices
    Tax configuration

and creates:

    Draft Invoice

---

# 87. AI Invoice Safety

AI should not independently:

- change invoice totals,
- invent taxes,
- mark invoices paid,
- delete invoices,
- issue refunds.

These require controlled operations.

---

# 88. AI Approval Inbox

Future:

    AI wants to send:

    Invoice INV-00123

    Amount:
    ₹50,000

    Customer:
    Arun

    [Approve & Send]

    [Edit]

    [Reject]

---

# 89. Business Memory Integration

Business memory may contain:

    "Always request 50% advance."

The quotation/invoice system can use this as a business rule.

However, critical financial rules should eventually be represented as structured configuration rather than relying solely on free-form AI memory.

---

# 90. Business Rules

Future:

    default_advance_percentage = 50

    quotation_validity_days = 15

    invoice_payment_terms = 30

    require_quote_approval = true

---

# 91. Templates

Businesses should eventually be able to configure:

    Quotation Template
    Invoice Template

Customization:

    Logo
    Colors
    Fonts
    Footer
    Terms
    Layout

---

# 92. Brand Kit Integration

The document templates should consume the business Brand Kit.

Example:

    Brand Primary:
    #1B2A4A

The quotation/invoice can automatically use it.

---

# 93. Template Safety

Financial documents should prioritize:

    Readability
    Accuracy
    Professionalism

over decorative design.

---

# 94. Business Information

Documents may contain:

    Business Name
    Address
    Phone
    Email
    Website
    Tax ID where configured

---

# 95. Customer Information

Documents may contain:

    Customer Name
    Email
    Phone
    Address

Only information necessary for the document should be included.

---

# 96. Privacy

Do not expose customer information through public document URLs unnecessarily.

---

# 97. Public Document Link

Future:

    Share Quote

generates:

    Secure public link

Customer can view:

    Quotation

without requiring a FrontDesk account.

---

# 98. Public Invoice Link

Future:

    Share Invoice

Customer can view:

    Invoice
    Payment status
    Payment option

---

# 99. Public Link Security

Public document links should:

- use non-guessable tokens,
- support expiration,
- allow revocation,
- avoid exposing internal identifiers,
- avoid exposing unrelated customer information.

---

# 100. Link Revocation

Owner can:

    Revoke public link

After revocation:

    Link no longer works.

---

# 101. Document Sharing

Future channels:

    WhatsApp
    Email
    Copy Link
    Download PDF

---

# 102. WhatsApp Integration

Future:

    Owner clicks:

    Send via WhatsApp

FrontDesk prepares:

    Customer message
    Secure document link

Example:

> Hi Arun, your quotation QT-00123 is ready.

---

# 103. Email Integration

Future:

    To:
    customer@email.com

    Subject:
    Quotation QT-00123

    Attachment:
    PDF

---

# 104. Delivery Status

Future:

    SENT
    DELIVERED
    VIEWED

This should not be confused with:

    ACCEPTED

---

# 105. Quote Analytics

Future:

    Sent:
    30

    Viewed:
    25

    Accepted:
    12

    Conversion:
    40%

---

# 106. Invoice Analytics

Future:

    Issued:
    ₹100,000

    Paid:
    ₹70,000

    Outstanding:
    ₹30,000

---

# 107. Business Copilot Integration

Future:

> You have ₹32,000 in overdue invoices.

> 4 quotations are waiting for customer responses.

> 2 quotations expire this week.

---

# 108. Smart Follow-Up

Future:

    Quote sent
       ↓
    No response for 3 days
       ↓
    AI suggests:
    "Send follow-up?"

Owner:

    [Approve]

---

# 109. Automated Follow-Up

Future:

    WHEN
    Quote remains unanswered for 5 days

    THEN
    Send follow-up

This belongs to the automation system.

---

# 110. Quote Expiry Reminder

Future:

    Quote expires in 2 days.

Copilot:

> QT-00123 expires in 2 days.

> Customer has not responded.

> Send reminder?

---

# 111. Invoice Reminder

Future:

    Invoice overdue for 3 days.

AI:

> INV-00123 is overdue by 3 days.

> Send payment reminder?

---

# 112. Automated Invoice Reminder

Future:

    WHEN
    Invoice becomes overdue

    THEN
    Wait 3 days

    THEN
    Send payment reminder

Owner-controlled.

---

# 113. Customer Communication Preferences

Customer communication should respect:

    Marketing consent
    Transactional communication preferences

Transactional invoice/quotation messages may be handled differently from marketing communications according to applicable rules.

---

# 114. Audit Log

Important events:

    QUOTE_CREATED
    QUOTE_UPDATED
    QUOTE_SENT
    QUOTE_VIEWED
    QUOTE_ACCEPTED
    QUOTE_REJECTED
    QUOTE_EXPIRED
    QUOTE_CONVERTED

    INVOICE_CREATED
    INVOICE_ISSUED
    INVOICE_SENT
    INVOICE_PAID
    INVOICE_CANCELLED

---

# 115. Actor

Every important document event should identify:

    Owner
    Staff
    Customer
    AI
    Automation
    System

where applicable.

---

# 116. Financial Audit

Invoices should have stronger audit requirements than ordinary content.

Example:

    INV-00123

    Created:
    10:00 AM

    Issued:
    10:15 AM

    Paid:
    11:30 AM

---

# 117. Document Deletion

Finalized invoices should not be hard-deleted.

Draft documents may be deletable according to permissions.

---

# 118. Quote Deletion

Draft quotations may be deleted.

Sent/accepted quotations should generally be retained.

---

# 119. Workspace Isolation

A business must only access its own:

    Quotations
    Invoices
    Customers
    Payments

---

# 120. Role-Based Access

Future permissions:

    quote.read
    quote.create
    quote.update
    quote.send
    quote.accept
    quote.delete

    invoice.read
    invoice.create
    invoice.update
    invoice.issue
    invoice.send
    invoice.cancel

---

# 121. Financial Permissions

High-impact actions should require stronger permissions.

Examples:

    Issue Invoice
    Cancel Invoice
    Approve Discount
    Send Quote
    Record Payment

---

# 122. AI Permissions

Future:

    AI may:
    Create draft quote

    AI may:
    Suggest invoice

    AI may require approval:
    Send invoice

    AI may not:
    Delete finalized invoice

---

# 123. Approval Workflow

Future:

    AI creates document

        ↓

    Approval Inbox

        ↓

    Owner reviews

        ↓

    Approve

        ↓

    Send / Issue

---

# 124. Document Version History

Every major document change should be traceable.

Example:

    QT-00123

    Version 1
    ₹50,000

    Version 2
    ₹47,500

---

# 125. Restore

Future drafts may support:

    Restore previous version

Finalized financial documents should use controlled correction rather than unrestricted restoration.

---

# 126. Document Preview

Before sending:

    Preview PDF

Owner can verify:

    Customer
    Items
    Amount
    Tax
    Terms
    Branding

---

# 127. Finalization Confirmation

Before issuing an invoice:

> This invoice will become a finalized financial document.

    Total:
    ₹50,000

    Customer:
    Arun Kumar

    [Cancel]

    [Issue Invoice]

---

# 128. Invoice Immutability

After issuance:

    Core financial fields should not be silently edited.

If correction is required:

    Create appropriate adjustment/correction workflow.

---

# 129. Credit Notes

Future.

Used when:

    Invoice needs financial reduction/correction.

Example:

    Invoice:
    ₹10,000

    Credit:
    ₹2,000

---

# 130. Debit Notes

Future.

Not required for v0.1.

---

# 131. Recurring Invoices

Future:

    Monthly Website Maintenance

    ₹5,000/month

Not v0.1.

---

# 132. Recurring Billing

Future architecture may support:

    Schedule
    Invoice Generation
    Payment Collection

This belongs to a future billing module.

---

# 133. Subscription Billing

Future:

    Customer
       ↓
    Subscription
       ↓
    Recurring Invoice
       ↓
    Payment

Not v0.1.

---

# 134. Multi-Currency

Future documents may support:

    INR
    USD
    EUR
    GBP

The original document currency must remain immutable after finalization.

---

# 135. Currency Conversion

If reporting converts:

    USD → INR

the original invoice remains:

    USD

Reporting conversion must be separate.

---

# 136. Tax Compliance Boundary

FrontDesk can provide configurable tax fields and calculations.

It should not claim:

> "This automatically makes your business tax compliant."

Compliance depends on jurisdiction and business circumstances.

---

# 137. India Considerations

For Indian businesses, future versions may support fields such as:

    GSTIN
    HSN/SAC
    CGST
    SGST
    IGST

But v0.1 should avoid hardcoding assumptions about every Indian business.

---

# 138. GST Architecture

Future tax engine:

    Business
       ↓
    Tax Configuration
       ↓
    Customer Location
       ↓
    Product/Service Tax Category
       ↓
    Tax Calculation

This should be a separate module.

---

# 139. GST Invoice Generation

Future versions may support compliant GST invoice formats where applicable.

This requires proper legal/tax validation before production use.

---

# 140. Invoice PDF Disclaimer

If FrontDesk provides non-compliant/demo invoice functionality during development, it must not falsely represent those documents as legally compliant invoices.

---

# 141. Quote PDF

Quotation PDFs may be less legally sensitive than invoices but should still accurately represent:

    Business
    Customer
    Items
    Price
    Validity
    Terms

---

# 142. AI Business Copilot

Future Copilot questions:

> "Which quotations haven't been answered?"

> "How much money is outstanding?"

> "Which customers haven't paid?"

> "Show invoices due this week."

All answers must use authoritative records.

---

# 143. AI Financial Safety

AI must distinguish between:

    Fact

and:

    Recommendation

Example:

    FACT:
    ₹30,000 is outstanding.

    RECOMMENDATION:
    Send reminders to 4 customers.

---

# 144. AI Suggested Pricing

If AI says:

> "I suggest charging ₹55,000."

it must be clearly identified as a recommendation.

It must not modify the quotation automatically.

---

# 145. Revenue Intelligence

Future:

    Quotation Value
       ↓
    Accepted Value
       ↓
    Invoiced Value
       ↓
    Paid Value

This gives the business a basic commercial funnel.

---

# 146. Quote Funnel

Future:

    Quotes Sent
       ↓
    Quotes Viewed
       ↓
    Quotes Accepted
       ↓
    Orders Created
       ↓
    Invoices Issued
       ↓
    Payments Received

---

# 147. Business Growth Insight

Future AI:

> "Your quotation acceptance rate increased from 32% to 41%."

or:

> "Most rejected quotations are above ₹50,000."

Such insights require enough historical data.

---

# 148. Customer History

Customer profile may eventually show:

    Quotations
    Orders
    Invoices
    Payments
    Bookings
    Reviews

This should be linked through the CRM/customer system.

---

# 149. Customer Timeline

Example:

    Aug 20
    Quote QT-00123 sent

    Aug 21
    Quote viewed

    Aug 22
    Quote accepted

    Aug 23
    Invoice INV-00123 issued

    Aug 24
    ₹25,000 paid

---

# 150. Business Memory

The business knowledge base may contain:

    "Our standard quotation validity is 15 days."

    "Website projects require 50% advance."

These can assist document generation.

---

# 151. Structured Business Configuration

Where possible, convert important business preferences into structured configuration:

    quotation_validity_days
    default_payment_terms
    default_discount_limit
    default_currency
    require_quote_approval

---

# 152. AI + Structured Configuration

AI may read:

    Business Memory

but financial documents should ultimately use:

    Structured Configuration

as the authoritative source where the setting affects calculations or financial behavior.

---

# 153. Document Search

Future search:

    Quote Number
    Invoice Number
    Customer
    Status
    Date

---

# 154. Filters

Quotation filters:

    Draft
    Sent
    Accepted
    Rejected
    Expired

Invoice filters:

    Draft
    Issued
    Paid
    Partially Paid
    Overdue
    Cancelled

---

# 155. Date Filters

Future:

    Today
    This Week
    This Month
    Custom Range

---

# 156. Document Dashboard

Future:

    Quotations:
    24

    Accepted:
    9

    Invoices:
    31

    Outstanding:
    ₹48,500

---

# 157. Quick Actions

Owner dashboard:

    + New Quote

    + New Invoice

    Record Payment

    View Outstanding

---

# 158. Quote Creation Flow

    New Quote
        ↓
    Select Customer
        ↓
    Add Items
        ↓
    Set Prices
        ↓
    Discount
        ↓
    Tax
        ↓
    Terms
        ↓
    Preview
        ↓
    Save Draft
        ↓
    Send

---

# 159. Invoice Creation Flow

    New Invoice
        ↓
    Select Customer
        ↓
    Add Items
        ↓
    Calculate Total
        ↓
    Set Due Date
        ↓
    Preview
        ↓
    Issue
        ↓
    Send

---

# 160. Quote-to-Invoice Flow

    Quote
       ↓
    Accepted
       ↓
    Convert to Invoice
       ↓
    Review
       ↓
    Issue

---

# 161. Quote-to-Order Flow

    Quote
       ↓
    Accepted
       ↓
    Create Order
       ↓
    Fulfillment

---

# 162. Furniture Business Example

Customer:

    Arun Kumar

Quotation:

    Custom Dining Table

    Table:
    ₹45,000

    Delivery:
    ₹3,000

    Total:
    ₹48,000

Customer accepts.

↓

Order created.

↓

Invoice issued.

↓

₹24,000 advance payment.

Invoice:

    PARTIALLY_PAID

---

# 163. Freelancer Example

Customer:

    ABC Company

Quotation:

    Website Development
    ₹50,000

    Maintenance
    ₹5,000

Total:

    ₹55,000

Customer accepts.

↓

Invoice:

    ₹55,000

↓

Payment:

    ₹27,500

Invoice:

    PARTIALLY_PAID

---

# 164. Photographer Example

Quotation:

    Wedding Photography

    Package:
    ₹75,000

    Album:
    ₹10,000

Total:

    ₹85,000

Customer accepts.

↓

Booking created.

↓

50% advance:

    ₹42,500

---

# 165. Repair Business Example

Quotation:

    AC Repair

    Service:
    ₹1,500

    Parts:
    ₹2,000

Total:

    ₹3,500

Customer accepts.

↓

Order/job created.

↓

Invoice issued after completion.

---

# 166. Home Business Example

Quotation:

    Custom Birthday Cake

    Cake:
    ₹1,200

    Delivery:
    ₹150

Total:

    ₹1,350

Customer accepts.

↓

Booking/order created.

---

# 167. AI Business Workflow Example

Owner:

> "Create a quotation for Rahul for a premium website."

AI:

    Finds customer Rahul.

    Finds business service:
    Premium Website

    Finds configured pricing.

    Creates:

    Draft Quote

Owner:

    [Review]

↓

    [Send]

---

# 168. AI Follow-Up Example

AI:

> QT-00123 was sent 5 days ago and hasn't been accepted.

> Would you like to send a follow-up?

    [Send Follow-up]

---

# 169. AI Outstanding Example

Owner:

> "Who owes us money?"

AI:

    6 unpaid invoices.

    Total outstanding:
    ₹42,500

    2 are overdue.

---

# 170. AI Invoice Example

Owner:

> "Invoice the customer for the accepted furniture quotation."

AI:

    Found:
    QT-00123

    Customer:
    Arun

    Accepted:
    Yes

    Total:
    ₹48,000

    Draft invoice created.

    [Review Invoice]

---

# 171. AI Safety Example

AI must NOT do:

> "I found an old quotation, changed its price, and sent a new invoice."

Instead:

> "I found QT-00123. Its accepted total is ₹48,000. I created a draft invoice using the accepted quotation."

---

# 172. Automation Integration

Future:

    WHEN
    Quote is accepted

    THEN
    Create order

    AND
    Notify owner

    AND
    Create invoice draft

---

# 173. Automation Approval

Financial actions should have configurable approval.

Example:

    Quote accepted

↓

    Create invoice draft

↓

    Owner approval

↓

    Issue invoice

---

# 174. Payment Integration

Invoice:

    ₹50,000

Payment:

    ₹25,000

System:

    Invoice = PARTIALLY_PAID

---

# 175. Refund Integration

Future:

    Payment
       ↓
    Refund
       ↓
    Invoice/payment status recalculated

Financial relationships must remain traceable.

---

# 176. Document Events

Suggested event types:

    QUOTE_CREATED
    QUOTE_UPDATED
    QUOTE_SENT
    QUOTE_VIEWED
    QUOTE_ACCEPTED
    QUOTE_REJECTED
    QUOTE_EXPIRED
    QUOTE_CONVERTED

    INVOICE_CREATED
    INVOICE_ISSUED
    INVOICE_SENT
    INVOICE_VIEWED
    INVOICE_PAID
    INVOICE_OVERDUE
    INVOICE_CANCELLED

---

# 177. Idempotency

Operations such as:

    Issue Invoice
    Convert Quote
    Send Invoice

must avoid accidental duplication.

Example:

    Clicking "Issue Invoice" twice

must not create:

    INV-00123
    INV-00124

for the same action unintentionally.

---

# 178. Concurrency

If two staff members attempt to issue the same draft invoice simultaneously, the backend must prevent duplicate issuance.

---

# 179. Workspace Isolation

Business A must never be able to access:

    Business B's quotes
    Business B's invoices
    Business B's customers

---

# 180. API Security

Document APIs require:

- authentication,
- workspace authorization,
- role checks,
- input validation,
- rate limiting,
- audit logging.

---

# 181. Public Document Security

Public links should:

- use secure tokens,
- be revocable,
- optionally expire,
- expose only the intended document.

---

# 182. Data Privacy

Customer information must be handled according to FrontDesk privacy policies.

Only required information should be exposed in:

    Public documents
    PDFs
    Sharing links

---

# 183. Document Export

Future:

    PDF
    CSV
    JSON

Exports must respect permissions.

---

# 184. Document Storage

Generated PDFs should be associated with:

    Document ID
    Version
    Generated At

rather than being treated as the source of truth.

The database/document model remains authoritative.

---

# 185. Regeneration

If a draft changes:

    Generate new PDF

Finalized documents should preserve the appropriate version.

---

# 186. Document Hash

Future security feature:

    Document Hash

can help identify whether a generated document has changed.

Not required for v0.1.

---

# 187. Digital Signature

Future:

    Digital Signature

for contracts/quotations.

Not v0.1.

---

# 188. Contract Integration

Future:

    Quote accepted
       ↓
    Contract generated
       ↓
    Digital signature
       ↓
    Project starts

Not v0.1.

---

# 189. Recurring Service Example

Future:

    Website Maintenance

    ₹5,000/month

    Invoice generated monthly.

This belongs to future recurring billing.

---

# 190. Document Templates Marketplace

Future designers may create:

    Quote Templates
    Invoice Templates

Businesses can install them.

This can connect with the FrontDesk ecosystem.

---

# 191. Industry Templates

Future:

    Freelancer Quote

    Furniture Quote

    Photography Quote

    Repair Quote

    Agency Proposal

    Consultant Invoice

---

# 192. Business Kits

Business Kits may include document templates.

Example:

    Freelancer Kit

    Website
    Portfolio
    Quote Template
    Invoice Template
    Contact Form
    WhatsApp
    CRM

---

# 193. v0.1 P0 Requirements

    QUOTE-P0-001
    Authorized users can create quotations.

    QUOTE-P0-002
    Quotations have unique references.

    QUOTE-P0-003
    Quotations can contain line items.

    QUOTE-P0-004
    Line items support quantity and price.

    QUOTE-P0-005
    Backend calculates authoritative totals.

    QUOTE-P0-006
    Quotations support validity dates.

    QUOTE-P0-007
    Quotations support notes and terms.

    QUOTE-P0-008
    Quotations have lifecycle statuses.

    QUOTE-P0-009
    Quotations can be saved as drafts.

    QUOTE-P0-010
    Quotations can be converted into appropriate downstream records.

    INVOICE-P0-001
    Authorized users can create invoices.

    INVOICE-P0-002
    Invoices have unique references.

    INVOICE-P0-003
    Invoices contain line items.

    INVOICE-P0-004
    Backend calculates invoice totals.

    INVOICE-P0-005
    Invoices support due dates.

    INVOICE-P0-006
    Invoices support payment status.

    INVOICE-P0-007
    Invoices can be issued.

    INVOICE-P0-008
    Finalized invoice data cannot be silently overwritten.

    INVOICE-P0-009
    Invoices can be associated with customers.

    INVOICE-P0-010
    Invoices can be associated with payments.

    DOCUMENT-P0-001
    Quotation PDFs can be generated.

    DOCUMENT-P0-002
    Invoice PDFs can be generated.

    DOCUMENT-P0-003
    Generated documents use authoritative data.

    DOCUMENT-P0-004
    Document actions are auditable.

    DOCUMENT-P0-005
    Workspace isolation is enforced.
194. v0.1 P1 Requirements
QUOTE-P1-001
Public quotation links.

QUOTE-P1-002
Quotation view tracking.

QUOTE-P1-003
Quotation acceptance.

QUOTE-P1-004
Quotation rejection.

QUOTE-P1-005
Quotation versioning.

QUOTE-P1-006
Quotation follow-up suggestions.

QUOTE-P1-007
WhatsApp sharing.

QUOTE-P1-008
Email sharing.

INVOICE-P1-001
Public invoice links.

INVOICE-P1-002
Invoice payment reminders.

INVOICE-P1-003
Partial payment display.

INVOICE-P1-004
Overdue invoice detection.

INVOICE-P1-005
Invoice search.

INVOICE-P1-006
Invoice filters.

AI-P1-001
AI quotation drafting.

AI-P1-002
AI invoice drafting.

AI-P1-003
AI quote follow-up suggestions.

AI-P1-004
AI outstanding-payment summaries.

AI-P1-005
AI document change preview.
195. v0.1 P2 Requirements
QUOTE-P2-001
Advanced quotation versioning.

QUOTE-P2-002
Digital quote acceptance.

QUOTE-P2-003
Digital signatures.

QUOTE-P2-004
Contracts.

QUOTE-P2-005
Proposal builder.

INVOICE-P2-001
Recurring invoices.

INVOICE-P2-002
Subscription billing.

INVOICE-P2-003
Credit notes.

INVOICE-P2-004
Debit notes.

INVOICE-P2-005
Automated tax compliance.

INVOICE-P2-006
Advanced accounting integrations.

INVOICE-P2-007
Multi-currency billing.

INVOICE-P2-008
Payment gateway integration.

INVOICE-P2-009
Automated reconciliation.

AI-P2-001
Autonomous invoice workflows.

AI-P2-002
AI commercial negotiation assistance.

AI-P2-003
Revenue forecasting.
196. Acceptance Criteria

The Quotations & Invoices module is complete for v0.1 when:

Authorized users can create quotations.
Quotations have unique references.
Quotations can contain multiple line items.
Quantities and prices are supported.
Discounts are supported where configured.
Tax configuration can be represented without hardcoding a single tax regime.
Backend calculations are authoritative.
Quotations support validity dates.
Quotations support notes and terms.
Quotation status is tracked.
Quotations can be saved as drafts.
Authorized users can create invoices.
Invoices have unique references.
Invoices contain line items.
Backend calculates invoice totals.
Invoices support due dates.
Invoice payment status integrates with the Payments module.
Finalized invoices preserve their historical financial information.
Quotation and invoice PDFs can be generated.
Documents preserve appropriate business/customer information.
Document actions are auditable.
Workspace isolation is enforced.
The system does not falsely claim tax/accounting compliance.
The architecture supports future payment integrations.
The architecture supports future accounting integrations.
197. Example End-to-End Workflow
Furniture Business

Customer:

Arun Kumar

Owner creates:

Quotation QT-000123

Items:

Custom Dining Table
₹45,000

Delivery
₹3,000

Total:

₹48,000

Status:

DRAFT

Owner reviews.

↓

SEND

Status:

SENT

Customer views.

↓

VIEWED

Customer accepts.

↓

ACCEPTED

FrontDesk creates:

Order

Owner creates:

Invoice INV-000123

Total:

₹48,000

Invoice:

ISSUED

Customer pays:

₹24,000

Invoice:

PARTIALLY_PAID

Remaining:

₹24,000

Customer pays remaining amount.

Invoice:

PAID

Complete history:

Quote
  ↓
Acceptance
  ↓
Order
  ↓
Invoice
  ↓
Payment
  ↓
Paid

---

# 198. Example Freelancer Workflow

```text
Customer requests website.

        ↓

AI/Owner creates Quote

        ↓

₹50,000

        ↓

Customer accepts

        ↓

Project created

        ↓

Invoice:
₹50,000

        ↓

50% advance

        ↓

₹25,000 paid

        ↓

Invoice:
PARTIALLY_PAID

        ↓

Project completed

        ↓

Remaining ₹25,000

        ↓

PAID
199. Example AI Workflow

Owner:

Create a quote for Arun for the Premium Website package.

AI:

Customer found:
Arun Kumar

Service found:
Premium Website

Configured price:
₹50,000

Quotation:
QT-000124

Status:
DRAFT

AI:

I created the draft. Review it before sending.

Owner:

[Review]

Owner approves:

[Send]

Only then is the quotation sent.

200. Example Business Copilot
Good morning 👋

Commercial activity:

• 4 quotations are waiting for responses.
• 2 quotations expire within 3 days.
• ₹32,500 remains outstanding.
• 3 invoices are overdue.

Suggested actions:

[Follow up on quotes]

[Review overdue invoices]

[View outstanding payments]
201. Example Business Memory

Business memory:

We normally request 50% advance
for website projects.

Quotes are valid for 15 days.

Do not offer discounts above 10%
without owner approval.

Structured configuration:

advance_percentage = 50
quote_validity_days = 15
maximum_discount_without_approval = 10

The structured configuration should be authoritative for actual financial behavior.

202. Final Architecture
Customer
   │
   ├───────────────┐
   ↓               ↓
Quotation       Direct Order
   │               │
   ↓               │
Acceptance         │
   │               │
   ↓               │
Order ◄────────────┘
   │
   ↓
Invoice
   │
   ↓
Payment
   │
   ↓
Fulfillment
203. System Relationships
Customer
   │
   ├── Quotations
   ├── Orders
   ├── Bookings
   ├── Invoices
   └── Payments

Quotation
   │
   ├── Customer
   ├── Line Items
   ├── Order
   └── Invoice

Invoice
   │
   ├── Customer
   ├── Line Items
   ├── Payments
   └── Order

Payment
   │
   └── Invoice / Order
204. Architectural Boundary

FrontDesk is responsible for:

Business Documents
Customer Communication
Quotation Workflow
Invoice Workflow
Payment Status
Basic Financial Visibility

FrontDesk is NOT initially responsible for:

Full Accounting
Tax Filing
General Ledger
Payroll
Bank Reconciliation
Enterprise ERP

Those capabilities may be provided through future integrations.

205. Final Principle

A quotation proposes value.

An order records the customer's commitment.

An invoice records what is due.

A payment records what was paid.

FrontDesk must preserve these distinctions.