MARKET-PROBLEM.md
# FrontDesk — Market Problem

**Product:** FrontDesk  
**Version:** v0.1  
**Document:** Market Problem Definition  
**Status:** Draft — Validation Required  
**Last Updated:** 2026-08-26

---

# 1. Purpose

This document defines the market problem that FrontDesk intends to solve.

It distinguishes between:

- observed problems,
- customer pain points,
- market assumptions,
- current alternatives,
- gaps in existing solutions,
- and hypotheses that must be validated.

This document is not a substitute for formal market research.

Any claim that requires external evidence should be verified through customer interviews, competitor research, surveys, or reliable market data.

---

# 2. Problem Statement

Many small and local businesses need a digital presence but do not necessarily want to become website developers, designers, marketers, automation engineers, or software administrators.

Their business information may already exist, but it is often distributed across multiple sources.

For example:

    Existing Website
    Instagram
    WhatsApp
    Google Business
    PDF Menu
    Excel
    Images
    Paper
    Owner's Knowledge

The business owner must then manually maintain this information across different digital surfaces.

FrontDesk proposes to turn these fragmented sources into a structured digital business.

---

# 3. Core Market Problem

The core problem can be expressed as:

> **Small businesses have business information and customer interactions distributed across disconnected tools, while existing digital tools often require the owner to understand and manage each tool separately.**

FrontDesk aims to reduce this complexity.

---

# 4. Problem Layer 1 — Getting Online

A business may need:

- business information,
- website,
- catalog,
- menu,
- contact information,
- location,
- opening hours,
- product information,
- photographs,
- and customer communication.

Creating these independently can require multiple tools or technical assistance.

The proposed FrontDesk approach is:

    Existing Information
           ↓
        Import
           ↓
      Structured Data
           ↓
     Digital Presence

---

# 5. Problem Layer 2 — Updating Information

A digital presence becomes less useful when information becomes outdated.

Examples:

> "The price changed."

> "This item is unavailable."

> "We have a new product."

> "Our opening time changed."

> "We have a festival offer."

The desired experience is:

    Owner describes change
             ↓
       FrontDesk updates
             ↓
       Owner reviews
             ↓
          Publish

The owner should not need to understand the underlying technical implementation.

---

# 6. Problem Layer 3 — Fragmented Business Information

A business may maintain different information in different places.

Example:

    WhatsApp → customer conversations

    Instagram → marketing/content

    Google → discovery information

    Website → business information

    Spreadsheet → products/prices

    Paper/PDF → menu

This can create inconsistencies.

For example:

    Website: ₹180
    WhatsApp: ₹200
    Printed menu: ₹180

FrontDesk's long-term goal is to establish a structured business source of truth.

---

# 7. Problem Layer 4 — Customer Discovery to Conversation

A customer journey may look like:

    Find business
         ↓
    View information
         ↓
    Check product/service
         ↓
    Ask question
         ↓
    Contact business

Many digital tools focus heavily on the first steps but may not provide a unified operational experience for the business owner.

FrontDesk's initial wedge is to connect:

    Digital Presence
          ↓
      WhatsApp
          ↓
       Enquiry

---

# 8. Problem Layer 5 — Technical Dependency

A small business owner may not have technical expertise.

They should not need to understand:

- HTML,
- CSS,
- JavaScript,
- databases,
- APIs,
- hosting,
- deployment,
- DNS,
- or frontend frameworks

to make routine business changes.

FrontDesk aims to hide this complexity.

---

# 9. Problem Layer 6 — Existing Business Migration

A major potential barrier to adoption is:

> "I already have everything somewhere else."

A new platform that requires complete manual recreation creates additional work.

Therefore FrontDesk's proposed acquisition wedge includes:

    Existing Website
    PDF
    CSV
    Images
    Instagram
    WhatsApp Catalog
           ↓
        Import
           ↓
        FrontDesk

The objective is to reduce migration effort.

---

# 10. Problem Layer 7 — Static Website Limitation

A website can provide a digital storefront but may not by itself solve ongoing business operations.

The long-term FrontDesk direction is:

    Website
       +
    Catalog
       +
    Customer Interaction
       +
    Business Data
       +
    Automation
       +
    AI

The website therefore becomes one interface over the business data rather than the entire product.

---

# 11. Initial Vertical Problem

FrontDesk should initially focus on food businesses.

Examples:

- cafés,
- restaurants,
- bakeries,
- food carts,
- small food businesses.

These businesses provide a clear initial use case because they commonly have structured information such as:

- menus,
- categories,
- products,
- prices,
- images,
- opening hours,
- locations,
- offers.

They also provide a clear customer journey:

    Discover
       ↓
    View Menu
       ↓
    Ask
       ↓
    Order / Enquire

This makes them suitable for validating the initial FrontDesk workflow.

---

# 12. Customer Pain Points to Validate

The following are hypotheses that should be tested with real business owners.

## Pain Point A

> "Creating a website is difficult or requires someone else."

---

## Pain Point B

> "Updating my website is inconvenient."

---

## Pain Point C

> "My business information is spread across different platforms."

---

## Pain Point D

> "Customers ask questions whose answers already exist in my menu/catalog."

---

## Pain Point E

> "I mainly communicate with customers through WhatsApp."

This should be validated rather than assumed for every business.

---

## Pain Point F

> "I don't want to learn another complicated business software."

---

## Pain Point G

> "I already have business information and don't want to enter everything again."

---

# 13. Jobs To Be Done

The primary functional jobs are:

### JTBD-001

> When I have an existing business, I want to bring my information into one place so that I can establish a digital presence without rebuilding everything manually.

### JTBD-002

> When my business information changes, I want to update it easily so that customers see accurate information.

### JTBD-003

> When customers discover my business, I want them to quickly understand what I offer and how to contact me.

### JTBD-004

> When customers have questions, I want enquiries to reach me through a channel I already use.

### JTBD-005

> When I use a digital platform, I want it to remain simple enough that I can manage it without technical expertise.

---

# 14. Current Alternative Solutions

Businesses may currently use combinations of:

- social media,
- messaging applications,
- Google Business tools,
- website builders,
- ecommerce platforms,
- QR menu systems,
- freelancers,
- agencies,
- spreadsheets,
- paper menus,
- and custom websites.

FrontDesk does not need to replace every existing tool immediately.

Its initial objective is to reduce the fragmentation between these workflows.

---

# 15. Alternative 1 — Social Media

Businesses may use social platforms as their primary digital presence.

### Strengths

- familiar,
- easy to update,
- audience already exists,
- strong visual communication.

### Potential limitations

- business information can be difficult to structure,
- catalog management may be limited,
- customers may need to navigate social content,
- business data may remain platform-dependent.

### FrontDesk opportunity

Use existing social information as an import source and create a structured business presence.

---

# 16. Alternative 2 — Messaging

Businesses may use WhatsApp or other messaging channels heavily.

### Strengths

- familiar to businesses,
- direct customer communication,
- conversational,
- useful for enquiries.

### Potential limitations

- information may remain unstructured,
- repeated questions consume owner time,
- catalog/business information may not represent the complete digital presence.

### FrontDesk opportunity

Use messaging as the customer communication layer while keeping structured business information separately.

---

# 17. Alternative 3 — Website Builders

Website builders provide:

- templates,
- visual editing,
- hosting,
- domains,
- pages,
- forms,
- and other website capabilities.

### Strength

They solve website creation effectively.

### Potential FrontDesk gap

FrontDesk should not compete solely on visual website creation.

The differentiation should increasingly come from:

- business import,
- structured business data,
- business-specific workflows,
- customer interaction,
- and operational intelligence.

---

# 18. Alternative 4 — Freelancers and Agencies

Businesses can hire people to create and maintain websites.

### Strengths

- customization,
- human expertise,
- professional design.

### Potential limitations

- ongoing dependency,
- update delays,
- recurring maintenance costs,
- communication overhead.

### FrontDesk opportunity

Allow the owner to manage routine updates independently while still leaving room for professional designers/agencies in future versions.

---

# 19. Alternative 5 — Ecommerce Platforms

Some businesses may use ecommerce platforms.

### Strengths

- products,
- orders,
- payments,
- inventory,
- customer management.

### Potential limitation

A small business may not require a full ecommerce system.

FrontDesk can initially focus on the simpler problem:

> Establish a digital presence and customer enquiry flow.

More advanced commerce capabilities can be introduced only when validated.

---

# 20. Market Gap Hypothesis

The central gap FrontDesk intends to investigate is:

> **There may be an opportunity between simple website builders and full business-management platforms for small businesses that want their existing information transformed into an easy-to-manage digital business.**

This is a hypothesis, not a proven market fact.

It must be validated.

---

# 21. Why "Import" Matters

The import capability can potentially solve two problems simultaneously:

### Acquisition

Existing businesses have a reason to try FrontDesk.

### Activation

The business does not start from an empty screen.

Instead of:

    Create Website
         ↓
    Choose Template
         ↓
    Enter Everything

FrontDesk proposes:

    Bring Existing Business
              ↓
           Import
              ↓
       Review Information
              ↓
           Publish

This may significantly reduce onboarding friction.

The actual improvement must be measured.

---

# 22. Why Business Data Matters

A website-first architecture treats the website as the primary object.

FrontDesk proposes:

    Business
       ↓
    Structured Business Data
       ↓
    Multiple Experiences

Potential experiences:

- website,
- catalog,
- QR,
- WhatsApp,
- AI,
- analytics,
- automation,
- future agents.

This creates a potential foundation for long-term expansion.

---

# 23. Problem-to-Solution Mapping

| Problem | FrontDesk Response |
|---|---|
| Business information is fragmented | Business Importer |
| Manual website creation | AI-assisted generation |
| Website updates require technical help | Owner editor + AI changes |
| Existing website is outdated | Website import/rebuild |
| Menu/catalog is difficult to maintain | Structured catalog |
| Customers need easy access | Mobile-first website + QR |
| Customers need to contact business | WhatsApp enquiry |
| Owner needs to understand activity | Basic business activity |
| AI changes could be dangerous | Review/approval |
| Business data needs consistency | Business Knowledge Base |

---

# 24. Core Market Hypotheses

FrontDesk must validate the following.

## H1 — Import Demand

Existing businesses prefer importing their current information over rebuilding manually.

### Validation

Measure:

- import starts,
- import completion,
- manual-entry comparison,
- time to activation.

---

## H2 — Time-to-Value

Businesses can obtain a useful digital presence significantly faster through the import workflow than through conventional manual setup.

### Validation

Measure:

- time from signup to publish,
- number of manual steps,
- number of corrections required.

---

## H3 — Digital Presence Demand

Target businesses consider a mobile-friendly digital presence useful.

### Validation

Customer interviews and pilot adoption.

---

## H4 — WhatsApp Relevance

Target businesses consider WhatsApp a useful customer communication channel.

### Validation

Ask actual businesses about:

- enquiry volume,
- current communication channels,
- response workflow,
- willingness to connect.

---

## H5 — Update Frequency

Businesses have enough recurring information changes to justify returning to FrontDesk.

### Validation

Track:

- product changes,
- price changes,
- opening-hour changes,
- offer updates,
- content updates.

---

## H6 — Retention

Businesses continue using FrontDesk after their initial digital presence is published.

### Validation

Measure 7-day and 30-day retention.

---

## H7 — Willingness to Pay

Businesses are willing to pay for capabilities that create measurable operational value.

### Validation

Pricing interviews and controlled paid pilots.

---

# 25. Validation Strategy

FrontDesk should validate the problem before assuming the solution is correct.

## Stage 1 — Interviews

Interview target businesses.

Questions should focus on existing behavior rather than asking:

> "Would you use FrontDesk?"

Instead ask:

> "How do you currently update your menu?"

> "Who updates your website?"

> "How often do prices change?"

> "Where do customers usually contact you?"

> "What happens when a customer asks about a product?"

---

# 26. Stage 2 — Observation

Where possible, observe actual workflows.

Example:

Ask a café owner to show:

> "How would you add a new item to your current digital presence?"

This can reveal problems that interviews may miss.

---

# 27. Stage 3 — Prototype

Create a lightweight prototype of:

    Import
       ↓
    Review
       ↓
    Publish
       ↓
    QR
       ↓
    WhatsApp

Test this workflow with real businesses.

---

# 28. Stage 4 — Pilot

Onboard a small number of real businesses.

Measure:

- onboarding completion,
- activation,
- time to publish,
- customer interaction,
- updates,
- retention,
- and qualitative feedback.

---

# 29. Stage 5 — Monetization Validation

Only after recurring value is demonstrated should FrontDesk test:

- free vs paid,
- subscription,
- feature limits,
- usage-based pricing,
- and agency plans.

---

# 30. Evidence Classification

All future market claims should be classified as:

### VALIDATED

Supported by direct evidence.

### SUPPORTED

Supported by credible external research.

### HYPOTHESIS

A reasonable assumption requiring validation.

### UNKNOWN

Insufficient evidence currently exists.

This classification should be used throughout FrontDesk's strategic documentation.

---

# 31. Current Evidence Status

At the time of writing:

| Assumption | Status |
|---|---|
| Small businesses need digital presence | Hypothesis / requires segmentation evidence |
| Business information is fragmented | Hypothesis / requires user research |
| Import reduces onboarding effort | Hypothesis |
| WhatsApp is valuable for target businesses | Hypothesis / requires vertical-specific validation |
| Existing website migration is attractive | Hypothesis |
| Owners want no-code editing | Hypothesis |
| Website alone has weak retention | Strategic hypothesis |
| Operational features improve retention | Strategic hypothesis |
| Business Knowledge Base creates long-term value | Strategic hypothesis |
| AI Business OS is a viable long-term opportunity | Strategic hypothesis |

No assumption should be treated as proven merely because it appears in product strategy.

---

# 32. Important Market Research Questions

The following questions must eventually be answered.

### Customer

1. Who exactly experiences the problem?
2. How frequently does the problem occur?
3. How painful is it?
4. Who currently solves it?
5. How much does the current solution cost?

### Workflow

6. Where does business information currently live?
7. How is information updated?
8. Who performs the updates?
9. How long do updates take?
10. What causes information to become outdated?

### Customer interaction

11. How do customers discover the business?
12. How do customers ask questions?
13. How do customers order or book?
14. How much enquiry volume exists?

### Technology

15. What tools are already being used?
16. What is frustrating about those tools?
17. What prevents switching?

### Economics

18. What would the business pay for?
19. What outcome would justify payment?
20. Would the owner prefer subscription, transaction, or another model?

---

# 33. Market Segmentation Principle

FrontDesk should not initially treat:

> "small businesses"

as a single homogeneous market.

Different businesses have different workflows.

For example:

### Café

    Menu
    QR
    Orders
    WhatsApp

### Salon

    Services
    Staff
    Availability
    Booking

### Furniture Shop

    Catalog
    Enquiry
    Quotation
    Lead management

### Freelancer

    Portfolio
    Services
    Enquiry
    Quotation

Therefore the platform should establish a strong common business foundation while allowing industry-specific workflows later.

---

# 34. Initial Beachhead

The proposed beachhead is:

> **Small food businesses that need a frequently updated digital menu/catalog and a simple customer enquiry path.**

This should be validated through actual customer research.

---

# 35. Why Not Target Everyone Initially?

Supporting every business category from day one creates:

- more complex onboarding,
- more workflows,
- more UI,
- more testing,
- more AI logic,
- more edge cases,
- and weaker product positioning.

A narrow beachhead allows FrontDesk to solve one workflow deeply before generalizing.

---

# 36. Expansion Trigger

FrontDesk should expand into another vertical only when:

- the common platform foundation is stable,
- the initial vertical demonstrates retention,
- a second vertical shows clear demand,
- and the additional workflow can be represented without damaging product simplicity.

---

# 37. Long-Term Market Opportunity

The long-term opportunity is broader than website creation.

Potential category:

> **Digital operating infrastructure for small businesses.**

Possible layers:

    Digital Presence
         ↓
    Customer Interaction
         ↓
    Business Operations
         ↓
    Automation
         ↓
    AI Assistance
         ↓
    AI Agents

The size and attractiveness of this broader opportunity must be researched independently before making market-size claims.

---

# 38. Strategic Insight

The central strategic insight is:

> **The business itself should become the primary object in FrontDesk, rather than the website.**

If this is successful, one structured business model can power many capabilities.

---

# 39. Problem Definition

The working problem definition is:

> Small businesses often have the information necessary to establish a digital presence, but that information is fragmented across multiple channels and tools. Existing solutions may require the business owner to manually create, maintain, and connect those digital surfaces. FrontDesk aims to reduce this complexity by importing existing business information, structuring it into a reusable business model, publishing a digital presence, and connecting customers through a familiar communication channel.

---

# 40. What Must Be Proven

Before expanding the product substantially, FrontDesk must prove:

1. Target businesses experience the identified problem.
2. Import meaningfully reduces onboarding effort.
3. Businesses can successfully publish through FrontDesk.
4. Customers interact with the resulting digital presence.
5. Owners return to update or manage the business.
6. The initial workflow creates enough value to support a sustainable business model.

---

# 41. Document Status

**Status:** DRAFT — VALIDATION REQUIRED

This document must be updated when new evidence is collected.

Market assumptions must not silently become facts.

Future research should distinguish:

- customer evidence,
- competitor evidence,
- market research,
- internal product data,
- and strategic inference.