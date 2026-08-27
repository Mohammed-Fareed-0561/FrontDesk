BRD.md
# FrontDesk — Business Requirements Document

**Product:** FrontDesk  
**Version:** v0.1  
**Document:** Business Requirements Document (BRD)  
**Status:** Draft — For Review  
**Last Updated:** 2026-08-26  
**Owner:** FrontDesk Product Team

---

# 1. Document Purpose

This document defines the business requirements for FrontDesk v0.1.

It describes:

- the business problem,
- target users,
- business objectives,
- product opportunity,
- value proposition,
- business assumptions,
- success criteria,
- constraints,
- risks,
- and the boundaries of the first release.

This document defines **why FrontDesk is being built and what business outcome it must achieve**.

It does not define detailed technical implementation.

Technical requirements will be defined in the PRD, architecture, API, database, UX, and engineering documentation.

---

# 2. Product Overview

FrontDesk is a business-to-digital transformation platform designed initially for small and local businesses.

The platform allows a business owner to provide existing business information and transform it into a structured digital presence.

The initial experience is:

    Import business
          ↓
    Structure information
          ↓
    Review information
          ↓
    Publish digital presence
          ↓
    Generate QR
          ↓
    Connect customers through WhatsApp
          ↓
    Receive enquiries
          ↓
    Monitor basic activity

The long-term vision is to evolve FrontDesk into an AI Business OS.

---

# 3. Business Problem

## 3.1 Primary Problem

Small businesses often need a digital presence but lack the technical knowledge, time, or resources required to build and maintain one.

A business owner may have:

- a menu,
- product photographs,
- prices,
- an Instagram account,
- a WhatsApp catalog,
- a Google Business profile,
- an existing website,
- spreadsheets,
- PDFs,
- or handwritten information.

However, these resources are usually fragmented.

The owner must manually transfer and maintain this information across different platforms.

---

# 3.2 Website Maintenance Problem

Traditional website development often creates a dependency on developers.

For simple changes such as:

- adding a product,
- changing a price,
- changing opening hours,
- replacing an image,
- adding an offer,
- removing an unavailable product,

the business owner may need technical assistance.

This creates:

- delays,
- maintenance costs,
- dependency on external people,
- inconsistent information,
- and reluctance to update the website.

FrontDesk aims to reduce this dependency.

---

# 3.3 Existing Website Builder Problem

Traditional website builders generally focus on:

> creating and editing webpages.

FrontDesk aims to focus on:

> creating and maintaining a digital representation of the business.

This distinction is fundamental.

The website is one output of the business data rather than the business data itself.

---

# 3.4 Customer Communication Problem

Many local businesses communicate with customers primarily through messaging platforms, especially WhatsApp.

A website that simply displays information may not be sufficient.

The business needs a path from:

    Discovery
       ↓
    Information
       ↓
    Enquiry
       ↓
    Conversation

FrontDesk v0.1 therefore treats customer enquiry and WhatsApp connectivity as part of the initial product experience.

---

# 4. Business Opportunity

The opportunity is to create a platform that sits between:

- website builders,
- catalog tools,
- messaging-based business communication,
- lightweight CRM,
- automation platforms,
- and AI business assistants.

However, FrontDesk should not attempt to compete with all of these categories simultaneously.

The initial opportunity is narrower:

> Help small businesses convert existing business information into a usable digital presence with minimal technical effort.

---

# 5. Target Market

## 5.1 Primary Target Market

Small and local businesses.

Initial vertical focus:

### Food businesses

- Cafés
- Restaurants
- Bakeries
- Food carts
- Small food businesses

These businesses are particularly suitable for v0.1 because they commonly have:

- menus,
- frequently changing products/prices,
- QR use cases,
- mobile customers,
- location-based discovery,
- and WhatsApp communication.

---

# 5.2 Future Target Segments

After validating the initial product, FrontDesk may expand into:

- salons,
- boutiques,
- furniture shops,
- local retail stores,
- photographers,
- freelancers,
- tutors,
- repair services,
- home businesses,
- service providers,
- hotels,
- agencies,
- and other SMBs.

Expansion should be driven by validated demand rather than assumptions.

---

# 6. Target User

## Primary User

The primary user is a small-business owner or operator who:

- is not necessarily technical,
- wants an online presence,
- already has business information,
- wants to update information independently,
- communicates with customers digitally,
- and does not want to manage technical infrastructure.

---

# 7. User Characteristics

The product should assume that the user may:

- have limited technical knowledge,
- use a smartphone more frequently than a desktop,
- prefer simple language,
- prefer guided workflows,
- already use WhatsApp,
- have business information in multiple formats,
- not understand concepts such as APIs, databases, DNS, hosting, or SEO,
- and have limited time.

Therefore the product must minimize technical terminology.

---

# 8. Business Goals

## Goal 1 — Reduce technical dependency

Allow business owners to create and maintain their digital presence without requiring a developer for routine changes.

---

## Goal 2 — Reduce onboarding effort

Allow an existing business to start from its existing information rather than requiring manual recreation.

---

## Goal 3 — Create a structured business source of truth

Convert fragmented business information into structured data that can power multiple FrontDesk capabilities.

---

## Goal 4 — Enable customer interaction

Move beyond a static website by providing a path for customers to contact the business.

---

## Goal 5 — Validate recurring usage

Determine whether business owners continue using FrontDesk after their initial website/catalog is created.

---

# 9. Business Objectives for v0.1

FrontDesk v0.1 should validate five core assumptions.

### Objective A — Import

A business owner can provide existing business information.

### Objective B — Structure

FrontDesk can transform that information into structured business data.

### Objective C — Publish

The structured data can generate a useful mobile-first digital presence.

### Objective D — Connect

Customers can reach the business through a simple enquiry/WhatsApp flow.

### Objective E — Retain

The business owner has a reason to return to FrontDesk after publishing.

---

# 10. Core Business Hypothesis

The primary hypothesis is:

> **If FrontDesk can import a small business's existing information and turn it into a useful digital presence in minutes, then non-technical business owners will adopt the platform more easily than if they had to build their website manually.**

A secondary hypothesis is:

> **If FrontDesk becomes useful for managing customer interactions and business updates, owners will continue using it after the initial website creation.**

---

# 11. Value Proposition

## For business owners

FrontDesk provides:

- faster digital setup,
- less technical dependency,
- centralized business information,
- easier updates,
- mobile-first presence,
- QR access,
- customer enquiries,
- and a foundation for future automation.

---

# 12. Core Value Proposition Statement

> **Bring your existing business information to FrontDesk and turn it into a digital business presence without needing technical expertise.**

---

# 13. Customer Value Chain

FrontDesk should create value through the following chain:

    Existing Business Information
                ↓
             Import
                ↓
          Structured Data
                ↓
          Digital Presence
                ↓
             Discovery
                ↓
          Customer Visit
                ↓
            Enquiry
                ↓
         Business Response
                ↓
         Repeat Interaction

The more of this chain FrontDesk can support, the greater its long-term value becomes.

---

# 14. Business Requirements

## BR-001 — Business Import

FrontDesk must allow a business owner to provide existing business information.

Potential sources include:

- website URL,
- PDF,
- images,
- CSV,
- spreadsheet,
- text,
- and manually entered information.

The exact sources supported in v0.1 will be defined in the PRD.

---

## BR-002 — Business Data Structuring

FrontDesk must transform imported information into structured business records.

Examples:

- business name,
- description,
- products,
- prices,
- categories,
- opening hours,
- contact details,
- location,
- images,
- FAQs.

---

## BR-003 — Human Review

Imported information must be reviewable before becoming the business's trusted information.

The owner must be able to:

- edit,
- approve,
- reject,
- and correct imported information.

---

## BR-004 — Digital Presence

FrontDesk must generate a customer-facing digital presence using approved business information.

The initial experience should prioritize:

- mobile responsiveness,
- clarity,
- speed,
- contactability,
- and useful business information.

---

## BR-005 — Catalog/Menu

Food businesses must be able to display:

- categories,
- products,
- descriptions,
- prices,
- images,
- and availability/status where supported.

---

## BR-006 — QR Entry Point

FrontDesk must provide a QR mechanism that allows customers to access the business's digital presence easily.

---

## BR-007 — Customer Enquiry

Customers must have a simple way to contact the business.

WhatsApp should be the primary v0.1 communication pathway where technically feasible.

---

## BR-008 — Owner Updates

Business owners must be able to update their business information without developer assistance.

---

## BR-009 — Version Safety

The system should protect the business from accidental destructive changes.

Important changes should be reversible where technically feasible.

---

## BR-010 — Basic Activity

FrontDesk should provide basic evidence that the digital presence is being used.

Examples may include:

- visits,
- QR scans,
- enquiries,
- clicks,
- and basic engagement.

Detailed analytics are outside the initial scope.

---

# 15. Non-Functional Business Requirements

## Usability

The product must be usable by non-technical business owners.

---

## Accessibility

The customer-facing experience should follow reasonable accessibility practices.

---

## Mobile Experience

The customer experience must be mobile-first.

The owner dashboard must also remain usable on mobile devices.

---

## Reliability

Published business information should remain accessible and stable.

---

## Data Protection

Business and customer information must be protected from unauthorized access.

---

## Recoverability

Important business changes should be recoverable where possible.

---

# 16. Business Success Metrics

## Primary Metric

### Activated Businesses

A business is considered activated when it has:

1. imported or entered business information,
2. approved its business information,
3. published a digital presence,
4. created or activated a QR entry point,
5. and received at least one customer interaction.

This is more meaningful than simply counting websites created.

---

# 17. Secondary Metrics

### Time to Activation

Time between account creation and first meaningful customer interaction.

---

### Import Completion Rate

Percentage of businesses that begin importing information and successfully complete the import process.

---

### Publish Rate

Percentage of businesses that successfully publish their digital presence.

---

### QR Activation Rate

Percentage of published businesses that activate a QR entry point.

---

### Customer Interaction Rate

Percentage of activated businesses that receive at least one customer interaction.

---

### 7-Day Retention

Percentage of activated businesses that return within seven days.

---

### 30-Day Retention

Percentage of activated businesses that continue using FrontDesk 30 days after activation.

---

# 18. North Star Metric

For early validation, the proposed North Star Metric is:

> **Number of retained businesses receiving meaningful customer activity through FrontDesk.**

This should be refined after actual pilot data is available.

---

# 19. Business Activity Definition

A meaningful business activity may include:

- updating a product,
- updating business information,
- responding to an enquiry,
- reviewing activity,
- publishing an update,
- or another validated operational action.

Simply logging in should not automatically count as meaningful activity.

---

# 20. Monetization Direction

Monetization is **not the primary validation objective of v0.1**.

The initial objective is to validate:

- usefulness,
- adoption,
- activation,
- customer interaction,
- and retention.

Potential future monetization models include:

### Freemium

Free basic digital presence.

Paid advanced features.

### Subscription

Monthly or annual business plans.

### Usage-based

Charges for selected services such as:

- AI usage,
- messaging,
- automation,
- advanced analytics,
- or other resource-intensive capabilities.

### Agency

Agencies manage multiple businesses under a paid plan.

### Marketplace

FrontDesk takes commissions from:

- designers,
- developers,
- automation creators,
- AI agent creators,
- and other service providers.

These are future possibilities and are not required for v0.1.

---

# 21. v0.1 Business Scope

## Included

### Business

- account creation,
- business creation,
- business profile,
- basic settings.

### Import

- business information import,
- structured extraction,
- review,
- correction,
- approval.

### Digital Presence

- mobile-first website/catalog,
- basic customization,
- publishing.

### QR

- business QR,
- customer access.

### Customer Interaction

- WhatsApp enquiry flow,
- basic enquiry visibility.

### Activity

- basic activity metrics.

### Safety

- basic version history,
- change tracking,
- safe AI proposal model where applicable.

---

# 22. Explicitly Excluded from v0.1

The following should not be added simply because they are part of the long-term vision:

- full CRM,
- advanced inventory,
- ERP,
- accounting,
- loyalty engine,
- advanced coupons,
- advanced marketing automation,
- workflow builder,
- AI agent builder,
- AI agent marketplace,
- developer marketplace,
- designer marketplace,
- business marketplace,
- multi-location enterprise management,
- full POS,
- advanced payment infrastructure,
- advanced A/B testing,
- sophisticated benchmarking,
- full AI Business Copilot,
- autonomous AI operations.

These remain potential future roadmap items.

---

# 23. Business Constraints

## C-001 — Zero-Cost Development

The initial development phase should target a ₹0 software/infrastructure budget where practical.

Free and open-source technologies should be preferred.

Paid services should not become mandatory for local development.

---

## C-002 — Avoid Vendor Lock-In

The architecture should avoid making the business dependent on a single external provider wherever reasonably possible.

---

## C-003 — Small Development Team

The product should be designed so that a small team can build and maintain v0.1.

---

## C-004 — Limited Initial Scope

The product must resist feature expansion before the core workflow is validated.

---

## C-005 — Non-Technical Users

The product must hide technical complexity from business owners.

---

# 24. Key Business Risks

## Risk 1 — Website builders already solve the visible problem

Users may ask:

> "Why do I need FrontDesk instead of Wix, Shopify, Canva, or another website builder?"

### Mitigation

Focus on:

- importing existing business information,
- business data structure,
- WhatsApp interaction,
- operational updates,
- and eventual business intelligence.

---

## Risk 2 — Users only use FrontDesk once

A business may create a website and never return.

### Mitigation

Introduce recurring operational value gradually.

---

## Risk 3 — Import quality is poor

If imported information requires extensive correction, the core promise fails.

### Mitigation

Use:

- extraction validation,
- review,
- confidence indicators,
- source references,
- and human approval.

---

## Risk 4 — AI creates incorrect business information

Incorrect prices, hours, or products could damage customer trust.

### Mitigation

Use business data as the source of truth and require approval for important changes.

---

## Risk 5 — Too many features

The product could become a complicated platform before the core workflow is validated.

### Mitigation

Maintain a strict v0.1 scope.

---

## Risk 6 — Free infrastructure limits

Free infrastructure may become insufficient as usage grows.

### Mitigation

Keep infrastructure modular and monitor usage.

---

# 25. Competitive Positioning

FrontDesk should not position itself primarily as:

> "Another website builder."

Instead:

> **"Bring your existing business here and turn it into a digital business."**

The competitive distinction should eventually become:

| Category | Primary purpose |
|---|---|
| Website builder | Build websites |
| Ecommerce platform | Sell products online |
| Automation platform | Automate workflows |
| CRM | Manage customer relationships |
| AI coding tool | Generate software |
| **FrontDesk** | **Digitize and operate a small business** |

This positioning must be validated through customer interviews and market testing.

---

# 26. Strategic Wedge

The initial strategic wedge is:

> **Import → Structure → Publish → QR → WhatsApp**

This wedge is intentionally narrower than the long-term AI Business OS vision.

---

# 27. Expansion Strategy

The intended expansion sequence is:

### Phase 1

Digital presence

### Phase 2

Customer interactions

### Phase 3

Business operations

### Phase 4

Automation

### Phase 5

AI Copilot

### Phase 6

AI Agents

### Phase 7

AI Business OS ecosystem

Each phase should be entered only after the previous phase demonstrates meaningful user value.

---

# 28. Business Acceptance Criteria for v0.1

The business requirements for v0.1 are considered validated when pilot users can successfully:

1. Create a FrontDesk account.
2. Create or import a business.
3. Provide existing business information.
4. Review and correct extracted information.
5. Approve business information.
6. Generate a customer-facing digital presence.
7. Publish it.
8. Generate a QR entry point.
9. Have a customer access the digital presence.
10. Allow the customer to contact the business.
11. Allow the business owner to view the resulting activity.
12. Return later and update business information.

---

# 29. Key Product Principle

The primary business outcome is not:

> "A website was generated."

The primary business outcome is:

> **"A real business became digitally accessible and received useful customer interaction."**

This distinction should guide product decisions throughout v0.1.

---

# 30. Business Requirement Traceability

Every major product feature should eventually trace back to a business requirement.

Example:

    BR-001 Business Import
             ↓
    Importer Feature
             ↓
    Import UI
             ↓
    Import API
             ↓
    Import Database Model
             ↓
    Import Tests

This traceability should be maintained throughout development.

---

# 31. Final Business Requirement

FrontDesk v0.1 must prove that it can reduce the effort required for a small business to establish and maintain a useful digital presence.

The product should optimize for:

> **Speed → Simplicity → Accuracy → Customer Access → Repeat Usage**

rather than maximizing the number of features.

---

# 32. Document Status

Status:

**DRAFT**

This document must be reviewed before the PRD is finalized.

Changes to the following should trigger a BRD review:

- target market,
- initial wedge,
- core business problem,
- primary business objective,
- activation definition,
- major v0.1 scope changes,
- or fundamental positioning.