INVENTORY-AND-CATALOG-OPERATIONS.md
# FrontDesk — Inventory & Catalog Operations Specification

**Product:** FrontDesk
**Version:** v0.1
**Module:** Inventory & Catalog Operations
**Document:** Feature Specification
**Status:** Draft — For Review
**Last Updated:** 2026-08-26

---

# 1. Purpose

The Inventory & Catalog Operations module manages the relationship between:

- products,
- services,
- prices,
- availability,
- stock,
- orders,
- business updates,
- customer-facing catalogs.

The primary goal of v0.1 is:

> Keep the business catalog accurate and prevent customers from seeing or purchasing unavailable products.

This is not intended to be a complete ERP or warehouse-management system.

---

# 2. Core Principle

FrontDesk has two related but different concepts:

## Catalog

What the business offers.

Example:

    Chocolate Cake
    ₹650

## Inventory

How much physical stock the business currently has.

Example:

    Chocolate Cake
    Available quantity:
    4

These must remain separate.

---

# 3. v0.1 Scope

v0.1 should support:

- products,
- categories,
- product availability,
- product price,
- product status,
- basic stock quantity,
- low-stock threshold,
- stock adjustments,
- stock movement history,
- order-driven stock reduction,
- out-of-stock state,
- basic inventory alerts,
- catalog synchronization.

The following should remain future scope:

- supplier management,
- purchase orders,
- warehouses,
- multiple inventory locations,
- barcode scanning,
- advanced stock forecasting,
- batch tracking,
- expiry tracking,
- manufacturing,
- accounting integration,
- full ERP.

---

# 4. Product

A product represents something the business sells.

Examples:

    Chicken Burger
    Chocolate Cake
    T-Shirt
    Wooden Table

---

# 5. Service

A service represents something performed rather than physically stocked.

Examples:

    Haircut
    Photography Session
    AC Repair
    Consultation

Services generally do not require physical inventory.

---

# 6. Catalog Item

A customer-facing catalog can contain:

    Product

or:

    Service

Example:

    Catalog
    ├── Products
    │   ├── Burger
    │   └── Pizza
    │
    └── Services
        ├── Haircut
        └── Facial

---

# 7. Product Object

Conceptually:

    Product
    ├── ID
    ├── Workspace ID
    ├── Business ID
    ├── Name
    ├── Description
    ├── Category ID
    ├── Price
    ├── Currency
    ├── Images
    ├── SKU
    ├── Track Inventory
    ├── Stock Quantity
    ├── Low Stock Threshold
    ├── Availability Status
    ├── Published
    ├── Created At
    └── Updated At

Exact database schema belongs to database documentation.

---

# 8. Product ID

Every product requires a unique internal ID.

Example:

    product_123

Customer-facing systems should not rely exclusively on internal IDs.

---

# 9. SKU

Future businesses may use:

    SKU:
    RB-CAKE-001

SKU should be optional for v0.1.

It becomes more important for:

- boutiques,
- furniture stores,
- retail shops,
- larger catalogs.

---

# 10. Product Name

Example:

    Chocolate Truffle Cake

The name should be:

- clear,
- customer-facing,
- searchable.

---

# 11. Product Description

Example:

    Rich chocolate sponge layered with
    chocolate ganache.

Descriptions may later be generated or optimized by AI.

AI-generated descriptions must still respect the actual business data.

---

# 12. Product Price

Every sellable product may have:

    Price
    Currency

Example:

    ₹650
    INR

---

# 13. Price Integrity

The customer-facing price must come from the authoritative business data.

Do not allow the frontend alone to determine final pricing.

---

# 14. Price Changes

When a price changes:

    Old:
    ₹600

    New:
    ₹650

The system should record the change when appropriate.

Historical orders must preserve the price at the time of purchase.

---

# 15. Product Availability

v0.1 should support:

    AVAILABLE
    OUT_OF_STOCK
    UNAVAILABLE

Future:

    PREORDER
    COMING_SOON
    ARCHIVED

---

# 16. Available

Product can currently be purchased or requested.

Example:

    Chocolate Cake
    AVAILABLE

---

# 17. Out of Stock

Product exists but cannot currently be fulfilled.

Example:

    Chocolate Cake
    OUT_OF_STOCK

The customer-facing catalog should communicate this clearly.

---

# 18. Unavailable

Product is temporarily or permanently unavailable.

Example:

    Festival Special
    UNAVAILABLE

---

# 19. Product Visibility

Availability and visibility are different.

A product may be:

    Published
    + Out of Stock

or:

    Unpublished
    + Available

---

# 20. Published

The product appears on the public website/catalog.

---

# 21. Unpublished

The product exists in the business system but is not shown publicly.

---

# 22. Archived

Future state.

Archived products should remain available in historical records but normally disappear from active catalogs.

---

# 23. Category

Products can belong to categories.

Example:

    Bakery
       ├── Cakes
       ├── Pastries
       └── Cookies

---

# 24. Category Object

Conceptually:

    Category
    ├── ID
    ├── Business ID
    ├── Name
    ├── Description
    ├── Image
    ├── Sort Order
    ├── Published
    └── Created At

---

# 25. Category Ordering

Business owners should eventually be able to control:

    Cakes
    Pastries
    Cookies

rather than relying on alphabetical order.

---

# 26. Product Ordering

Products may have:

    Sort Order

Example:

    1. Best Seller
    2. Chocolate Cake
    3. Red Velvet Cake
    4. Black Forest Cake

---

# 27. Featured Product

Future:

    Featured:
    YES

Featured products may appear in:

    Homepage
    Recommended section
    Promotional campaigns

---

# 28. Product Metadata

Future product metadata may include:

    Tags
    Attributes
    Variants
    Dietary information
    Size
    Color
    Material

---

# 29. Product Variants

Future:

    T-Shirt

Variants:

    Small
    Medium
    Large

or:

    Pizza

Variants:

    Small
    Medium
    Large

Each variant may eventually have its own:

    Price
    SKU
    Inventory

Not required for basic v0.1.

---

# 30. Variant Principle

Do not treat:

    "Large Pizza"

as a completely unrelated product if it is really a variant.

Future catalog architecture should allow:

    Product
       ↓
    Variants

---

# 31. Inventory Tracking

A product may have:

    Track Inventory:
    YES

or:

    Track Inventory:
    NO

---

# 32. Inventory Not Tracked

Useful for:

    Services
    Digital products
    Made-to-order products
    Businesses that do not maintain stock counts

Example:

    Haircut

Inventory:

    Not tracked

---

# 33. Inventory Tracked

Example:

    Chocolate Cake

Stock:

    10

---

# 34. Stock Quantity

Example:

    Stock:
    25

This represents the current available quantity according to the inventory system.

---

# 35. Stock Must Not Be Floating Point

For countable products:

    10

    25

    100

Use appropriate numeric representation.

---

# 36. Stock Units

Future businesses may use:

    pieces
    kg
    g
    litre
    metre
    box

v0.1 should primarily support simple quantity-based stock.

---

# 37. Low Stock Threshold

Example:

    Stock:
    4

    Threshold:
    5

System:

    LOW STOCK

---

# 38. Low Stock Alert

Example:

> ⚠️ Chocolate Cake is running low.

    Current:
    4

    Threshold:
    5

---

# 39. Out-of-Stock Threshold

For simple countable inventory:

    Stock:
    0

↓

    OUT_OF_STOCK

---

# 40. Negative Stock

v0.1 should not normally allow:

    Stock:
    -5

unless a future business explicitly enables overselling/backorder behavior.

---

# 41. Stock Adjustment

Authorized users may adjust inventory.

Example:

    Previous:
    10

    Adjustment:
    -2

    New:
    8

---

# 42. Adjustment Reason

Every manual adjustment should record a reason.

Examples:

    Damaged
    Spoiled
    Lost
    Manual Count
    Correction
    Received Stock

---

# 43. Stock Movement

Inventory changes should create a movement record.

Example:

    Stock:
    10

    Order:
    -2

    Current:
    8

---

# 44. Stock Movement Object

Conceptually:

    Stock Movement
    ├── ID
    ├── Product ID
    ├── Business ID
    ├── Type
    ├── Quantity
    ├── Previous Quantity
    ├── New Quantity
    ├── Reference
    ├── Reason
    ├── Actor
    └── Created At

---

# 45. Movement Types

v0.1:

    MANUAL_ADJUSTMENT
    ORDER_DEDUCTION
    CORRECTION

Future:

    PURCHASE
    RETURN
    DAMAGE
    TRANSFER
    RESTOCK
    REFUND_RETURN

---

# 46. Stock History

Owner should eventually be able to see:

    Aug 26
    Stock received +20

    Aug 26
    Order ORD-00123 -2

    Aug 26
    Damaged -1

Current:

    17

---

# 47. Stock Auditability

The system should not silently change:

    10 → 5

without explaining why.

Every meaningful stock change should be attributable.

---

# 48. Order Integration

When an order is completed or reaches the appropriate fulfillment state:

    Product Stock
          ↓
    Deduct Quantity

The exact deduction point must be defined by the Order/Fulfillment workflow.

---

# 49. Important Order Rule

Do not automatically deduct stock merely because a customer viewed a product.

Stock changes must be tied to an appropriate business event.

---

# 50. Stock Reservation

Future:

    Customer begins checkout

↓

    Stock temporarily reserved

This is not required for basic v0.1.

---

# 51. Stock Reservation Problem

Without reservation:

    Stock:
    1

Customer A:
    Checkout

Customer B:
    Checkout

Both may attempt to purchase the same item.

Future order processing must handle this safely.

---

# 52. Overselling

Future businesses may choose:

    Allow Overselling:
    YES / NO

For v0.1:

    Default:
    NO

---

# 53. Out-of-Stock Ordering

When stock reaches zero:

    Add to Cart

should normally become unavailable.

Alternative future:

    Notify Me

---

# 54. Backorders

Future:

    Product:
    Out of Stock

Customer:

    Place Backorder

Not v0.1.

---

# 55. Product Availability and Booking

Some businesses use inventory to support bookings.

Example:

    Photography Studio

Equipment:
    Camera A

Booking:
    5 PM

Future resource inventory should not be confused with product stock.

---

# 56. Catalog Sync

The public catalog should reflect current business data.

Example:

    Product:
    Chocolate Cake

    Stock:
    0

Public catalog:

    Out of Stock

---

# 57. Catalog Sync Delay

The system should minimize stale catalog states.

However, distributed systems may briefly have propagation delays.

The backend must remain authoritative.

---

# 58. Customer Purchase Validation

Even if the catalog says:

    Available

the backend should re-check availability when an order is created.

---

# 59. Backend Authority

The server must validate:

    Product exists
    Product published
    Product available
    Quantity valid
    Stock sufficient

before accepting an order.

---

# 60. Price Snapshot

When an order is created:

    Product Price:
    ₹650

Order item should preserve:

    Unit Price:
    ₹650

If product price later becomes:

    ₹700

the existing order remains:

    ₹650

---

# 61. Product Snapshot

Historical orders should preserve relevant product information.

Example:

    Product:
    Chocolate Cake

    At purchase:
    ₹650

The current catalog may later show:

    ₹700

but historical order data remains correct.

---

# 62. Product Deletion

Products should generally not be hard-deleted if historical orders reference them.

Instead:

    Archive

This preserves historical integrity.

---

# 63. Product Archive

Archived product:

    Not visible publicly

but:

    Historical orders remain valid.

---

# 64. Product Restoration

Future:

    Archived

↓

    Restore

↓

    Draft / Unpublished

Owner can republish if required.

---

# 65. Product Import

Products may enter FrontDesk through:

    Business Importer
    Manual Entry
    CSV
    Excel
    AI extraction
    Future API

---

# 66. Import Validation

Imported products must be validated.

Example:

    Product:
    Chocolate Cake

    Price:
    ₹650

If price is missing:

    Needs Review

---

# 67. AI Product Extraction

Future:

    Upload menu photo

AI extracts:

    Product
    Price
    Description
    Category

Example:

    Chocolate Cake — ₹650

The extracted data should become:

    Draft

until validated where accuracy matters.

---

# 68. AI Must Not Invent Product Data

If a photo says:

    Chocolate Cake ₹650

AI must not silently invent:

    "Serves 8 people"

unless that information exists elsewhere in the business data.

---

# 69. AI Product Creation

Future:

    Owner:
    "Add chicken shawarma 150 rupees."

AI:

    Creates Draft Product

Owner:

    Approve

↓

    Product becomes published/active according to configuration.

---

# 70. AI Product Updates

Future:

    Owner:
    "Increase all burger prices by ₹20."

AI should show:

    5 products will change.

    Old → New

before applying the change.

---

# 71. Bulk Product Update

Future:

    Select products

↓

    Update:

    Category
    Price
    Availability
    Published state

---

# 72. AI Safety

High-impact changes should require confirmation.

Example:

> 27 products will have their prices changed.

    [Review Changes]

    [Apply]

---

# 73. Product Change Preview

Future:

    BEFORE

    Burger ₹180

    AFTER

    Burger ₹200

Owner:

    Apply

---

# 74. Product Version History

Future:

    Product:
    Chocolate Cake

    10:00 AM
    Price ₹600

    2:00 PM
    Price ₹650

The history should show:

    Who changed it
    What changed
    When

---

# 75. Catalog Versioning

The product catalog should integrate with FrontDesk publishing/versioning.

Example:

    Draft Catalog
       ↓
    Preview
       ↓
    Publish

---

# 76. Product Draft

Imported or AI-generated products may initially be:

    DRAFT

They should not automatically become publicly visible unless configured to do so.

---

# 77. Product Approval

Future businesses can configure:

    AI-created products:
    Require approval

or:

    Automatically publish

The safer default should be:

    Require approval

for significant changes.

---

# 78. Business Memory Integration

Business memory may contain:

    "Never publish products without an image."

The product workflow should eventually represent this as a structured business rule where possible.

---

# 79. Business Rules

Future structured rules:

    require_product_image = true

    prevent_out_of_stock_orders = true

    default_currency = INR

    low_stock_threshold = 5

Structured rules are safer than relying only on AI memory.

---

# 80. Product Images

Products may contain:

    Primary Image
    Additional Images

Images belong to the Media & Asset Management module.

---

# 81. Image Requirements

The inventory module should reference media assets rather than duplicate image storage logic.

---

# 82. Product SEO

Future:

    SEO Title
    SEO Description
    Alt Text

This belongs to SEO/content systems.

---

# 83. Product Search

Customers should eventually be able to search:

    Chocolate
    Cake
    Burger
    Black Shirt

Search should use product names, descriptions, categories, and appropriate metadata.

---

# 84. Product Tags

Future:

    Bestseller
    New
    Vegan
    Spicy
    Premium

Tags can help:

    Search
    Filters
    Recommendations
    AI

---

# 85. Product Recommendations

Future:

    Customer buys:
    Burger

System may recommend:

    Fries
    Coke

This belongs to personalization/recommendation systems.

---

# 86. Inventory Alerts

Future alerts:

    LOW_STOCK
    OUT_OF_STOCK
    UNUSUAL_STOCK_CHANGE

---

# 87. Business Copilot Integration

Future:

> ⚠️ 3 products are out of stock.

> ⚠️ 5 products are below your low-stock threshold.

> ⚠️ Your best-selling burger is unavailable.

---

# 88. AI Inventory Insight

Future:

> "Your chocolate cake sells out every weekend."

AI may suggest:

> "Increase weekend production by 20%?"

The AI should recommend rather than automatically change purchasing/production.

---

# 89. Demand Forecasting

Future:

    Historical Sales
          ↓
    Seasonal Patterns
          ↓
    Current Inventory
          ↓
    Forecast

Example:

> "You may run out of chocolate cake by Saturday evening."

This is future scope.

---

# 90. Smart Restock Recommendation

Future:

> "Recommended restock: 25 units."

The recommendation should be explainable.

Example:

    Average daily sales:
    5

    Current stock:
    8

    Expected demand:
    20

---

# 91. Supplier Management

Future:

    Product
       ↓
    Supplier
       ↓
    Purchase Order
       ↓
    Inventory

Not v0.1.

---

# 92. Purchase Receipt

Future:

    Upload Supplier Invoice

↓

AI extracts:

    Product
    Quantity
    Cost

↓

Owner approves.

↓

Inventory increases.

---

# 93. Receipt-to-Inventory

Future feature:

> 📷 Upload supplier receipt

AI:

    20 × Milk
    10 × Cream
    5 × Chocolate

Owner:

    [Review]

Then:

    Add to inventory

---

# 94. Inventory Cost

Future businesses may track:

    Purchase Cost
    Selling Price
    Estimated Margin

This should be kept separate from payment data.

---

# 95. Profit Intelligence

Future:

    Selling Price:
    ₹650

    Estimated Cost:
    ₹400

    Estimated Contribution:
    ₹250

---

# 96. Cost Changes

Future:

    Ingredient cost increases.

AI may identify:

> "Your chocolate cake margin dropped from 42% to 35%."

---

# 97. Inventory and Profit

Inventory data can support analytics, but the inventory module should not become the accounting system.

---

# 98. Multi-Location Inventory

Future:

    Business
       ├── Store A
       ├── Store B
       └── Warehouse

Each location may have:

    Stock

Not v0.1.

---

# 99. Location Stock

Future:

    Chocolate Cake

    Store A:
    4

    Store B:
    12

---

# 100. Stock Transfer

Future:

    Store A
       ↓
    Transfer 5
       ↓
    Store B

Not v0.1.

---

# 101. Warehouse

Future businesses may need:

    Warehouse
    Storage Location
    Bin

Not v0.1.

---

# 102. Barcode

Future:

    Scan Barcode

↓

    Identify Product

↓

    Update Stock

Not v0.1.

---

# 103. QR Product Identification

Future:

    QR Code

↓

    Product

↓

    Inventory action

---

# 104. Batch Tracking

Future:

    Batch Number
    Production Date
    Expiry Date

Important for certain industries.

Not v0.1.

---

# 105. Expiry Tracking

Future:

    Product expires:
    Aug 30

AI:

> ⚠️ 8 products expire within 3 days.

---

# 106. Food Business

For restaurants/bakeries, inventory may eventually include ingredients rather than only finished products.

Example:

    Chocolate Cake
       ↓
    Chocolate
    Flour
    Eggs
    Cream

This requires a recipe/BOM system.

Not v0.1.

---

# 107. Recipe / Bill of Materials

Future:

    Burger
       ├── Bun ×1
       ├── Patty ×1
       ├── Cheese ×1
       └── Sauce ×1

Selling one burger could deduct ingredient inventory.

---

# 108. Ingredient Inventory

Future:

    Patty:
    30

    Cheese:
    50

    Buns:
    40

---

# 109. Production

Future:

    Ingredients
       ↓
    Production
       ↓
    Finished Product

Not v0.1.

---

# 110. Made-to-Order

Some businesses don't maintain finished-product stock.

Example:

    Custom Cake

Inventory may instead be:

    Ingredient-based

This is future functionality.

---

# 111. Catalog Availability Without Inventory

A business can manually set:

    Available

without tracking quantity.

This is important for small businesses.

---

# 112. Example: Freelancer

Service:

    Website Development

Inventory:

    Not tracked

Availability:

    Available

---

# 113. Example: Salon

Service:

    Haircut

Inventory:

    Not tracked

Booking:

    Uses scheduling system

---

# 114. Example: Boutique

Product:

    Black Shirt

Inventory:

    4

---

# 115. Example: Bakery

Product:

    Chocolate Cake

Inventory:

    3

---

# 116. Example: Furniture Shop

Product:

    Wooden Dining Table

Inventory:

    2

---

# 117. Example: Home Business

Product:

    Custom Cake

Inventory:

    Manual availability

---

# 118. Inventory Dashboard

Future:

    Inventory

    Total Products:
    125

    Low Stock:
    8

    Out of Stock:
    3

---

# 119. Low Stock List

Example:

    ⚠️ Low Stock

    Chocolate Cake — 4
    Burger Buns — 8
    Vanilla Cream — 2

---

# 120. Out-of-Stock List

Example:

    Out of Stock

    Red Velvet Cake
    Strawberry Pastry

---

# 121. Inventory Search

Search:

    Product
    SKU
    Category

---

# 122. Inventory Filters

Future:

    All
    Available
    Low Stock
    Out of Stock
    Not Tracked
    Archived

---

# 123. Stock Adjustment UI

Example:

    Chocolate Cake

    Current:
    10

    Adjustment:
    -2

    Reason:
    Damaged

    New:
    8

    [Save]

---

# 124. Stock Safety

The UI should make destructive adjustments clear.

Example:

> Reduce stock by 20 units?

    [Cancel]
    [Confirm]

---

# 125. Inventory Audit

Future:

    Product:
    Chocolate Cake

    10:00 AM
    Stock 10 → 20
    Reason: Restock
    Actor: Owner

    2:00 PM
    Stock 20 → 18
    Reason: Order
    Actor: System

---

# 126. Inventory Event Architecture

Conceptually:

    Inventory Service
          ↓
    STOCK_CHANGED
          ↓
    +------------+------------+
    |            |            |
   Catalog      Copilot     Analytics
    |
    ↓
 Customer-facing availability

---

# 127. Order Event

Future:

    ORDER_CONFIRMED
          ↓
    Inventory Service
          ↓
    Deduct Stock

The exact event should be defined by the order lifecycle.

---

# 128. Refund Event

Future:

If a returned product is physically restocked:

    REFUND / RETURN
          ↓
    Inventory Adjustment

This should not happen automatically for every refund because the physical return state may differ.

---

# 129. Cancellation Event

Cancelling an order before stock deduction may require:

    No inventory change

If stock was already reserved/deducted:

    Release / Restock

This depends on the future order lifecycle.

---

# 130. Idempotency

Inventory deductions must be idempotent.

If:

    ORDER_CONFIRMED

is processed twice,

stock must not be deducted twice.

---

# 131. Concurrency

If stock is:

    1

and two customers simultaneously attempt:

    Quantity 1

the backend must ensure the business does not unintentionally sell:

    2

units.

---

# 132. Server Authority

Inventory decisions must happen server-side.

Frontend:

    "Available"

is informational.

Backend:

    "Stock = 0"

is authoritative.

---

# 133. Transaction Safety

Inventory and order updates should be designed so that partial operations do not create impossible states.

Example:

    Order says:
    2 units purchased

but inventory says:

    0 units deducted

must be prevented or recoverable.

---

# 134. Failure Handling

If stock deduction fails:

    Order processing should not silently report success.

The system should return a controlled failure or enter an explicitly defined recovery state.

---

# 135. Import Integration

Business Importer may import:

    Product
    Price
    Category
    Image
    Availability

Inventory quantity may be:

    Unknown

if the source does not provide reliable stock information.

---

# 136. Unknown Stock

Do not assume:

    Unknown = 0

Instead:

    Inventory Tracking:
    NOT_CONFIGURED

This prevents imported products from incorrectly appearing out of stock.

---

# 137. CSV Import

Future CSV columns:

    Name
    Description
    Category
    Price
    SKU
    Stock
    Published

---

# 138. Import Preview

Before import:

    42 products detected.

    37 valid
    3 missing prices
    2 duplicate products

Owner:

    [Review]

---

# 139. Import Approval

Imported inventory changes should be reviewable before affecting live customer-facing data.

---

# 140. Bulk Availability

Owner may select:

    20 products

and:

    Mark Unavailable

---

# 141. Bulk Price Change

Future:

    Increase selected products by 10%

AI should show:

    20 products affected

with preview before applying.

---

# 142. Bulk Stock Adjustment

Future:

    Import stock count

or:

    Update multiple products.

Every resulting change should remain auditable.

---

# 143. AI Catalog Cleanup

Future:

> "I found 12 products with missing images."

> "4 products have duplicate names."

> "3 products have no category."

The AI can suggest fixes.

---

# 144. AI Product Deduplication

Future:

    Chocolate Cake
    Chocolate cake
    Choco Cake

AI may suggest:

> "These may be duplicates."

It should not automatically merge them without approval.

---

# 145. AI Catalog Critic

Future:

    Catalog Health:

    87/100

    Missing images:
    5

    Missing descriptions:
    8

    Out-of-date products:
    3

---

# 146. Business Copilot

Future:

> Good morning 👋

> Your best-selling burger is out of stock.

> 4 products are below the low-stock threshold.

> You haven't updated your menu in 12 days.

Actions:

    [Review]
    [Fix]

---

# 147. Business Memory

Future:

    "Never show unavailable products."

This should be converted into a structured business rule where possible:

    hide_out_of_stock = true

---

# 148. Automation Integration

Future:

    WHEN
    Product becomes out of stock

    THEN
    Hide from catalog

    AND
    Notify owner

---

# 149. Automation Example

Future:

    WHEN
    Stock <= 5

    THEN
    Notify owner

    AND
    Create restock recommendation

---

# 150. Automation Safety

Inventory automations should not automatically place purchases or spend money without explicit authorization.

---

# 151. Notification Integration

Inventory events may generate:

    LOW_STOCK
    OUT_OF_STOCK
    STOCK_ADJUSTED

Notifications are handled by the Notifications module.

---

# 152. Analytics Integration

Future inventory metrics:

    Stock turnover
    Out-of-stock rate
    Low-stock count
    Inventory value
    Product availability

Definitions belong to analytics documentation.

---

# 153. Product Performance

Future product-level analytics:

    Views
    Orders
    Revenue
    Conversion
    Stockouts

This allows:

> "Your burger is your best-selling product but frequently goes out of stock."

---

# 154. Inventory Intelligence

Future AI can combine:

    Sales
    Stock
    Seasonality
    Promotions

to recommend:

    Production
    Restocking
    Product availability

---

# 155. Important Boundary

FrontDesk v0.1 is NOT:

    SAP
    Oracle ERP
    Warehouse Management System
    Manufacturing ERP
    Full accounting platform

The initial objective is:

> Accurate catalog + simple stock awareness.

---

# 156. v0.1 P0 Requirements

    INVENTORY-P0-001
    Authorized users can create products.

    INVENTORY-P0-002
    Products belong to the correct business/workspace.

    INVENTORY-P0-003
    Products can have categories.

    INVENTORY-P0-004
    Products can have prices.

    INVENTORY-P0-005
    Products can be published/unpublished.

    INVENTORY-P0-006
    Products can be marked available/unavailable.

    INVENTORY-P0-007
    Inventory tracking can be enabled or disabled.

    INVENTORY-P0-008
    Tracked products can have stock quantities.

    INVENTORY-P0-009
    Authorized users can adjust stock.

    INVENTORY-P0-010
    Stock adjustments record a reason.

    INVENTORY-P0-011
    Stock changes are auditable.

    INVENTORY-P0-012
    Zero stock can result in OUT_OF_STOCK.

    INVENTORY-P0-013
    Basic low-stock thresholds are supported.

    INVENTORY-P0-014
    Product information can be consumed by the public catalog.

    INVENTORY-P0-015
    Backend validates product availability before order creation.

    INVENTORY-P0-016
    Historical orders preserve product price snapshots.

    INVENTORY-P0-017
    Product deletion does not destroy historical order integrity.

    INVENTORY-P0-018
    Inventory data is isolated between businesses.

---

# 157. v0.1 P1 Requirements

    INVENTORY-P1-001
    Stock movement history.

    INVENTORY-P1-002
    Inventory dashboard.

    INVENTORY-P1-003
    Low-stock alerts.

    INVENTORY-P1-004
    Out-of-stock alerts.

    INVENTORY-P1-005
    CSV product import.

    INVENTORY-P1-006
    Bulk product updates.

    INVENTORY-P1-007
    Product version history.

    INVENTORY-P1-008
    Product drafts.

    INVENTORY-P1-009
    AI product extraction.

    INVENTORY-P1-010
    AI product update preview.

---

# 158. v0.1 P2 Requirements

    INVENTORY-P2-001
    Product variants.

    INVENTORY-P2-002
    Multi-location inventory.

    INVENTORY-P2-003
    Supplier management.

    INVENTORY-P2-004
    Purchase orders.

    INVENTORY-P2-005
    Receipt-to-inventory.

    INVENTORY-P2-006
    Barcode scanning.

    INVENTORY-P2-007
    Ingredient inventory.

    INVENTORY-P2-008
    Recipe/BOM management.

    INVENTORY-P2-009
    Batch tracking.

    INVENTORY-P2-010
    Expiry tracking.

    INVENTORY-P2-011
    Stock transfers.

    INVENTORY-P2-012
    Demand forecasting.

    INVENTORY-P2-013
    AI restock recommendations.

    INVENTORY-P2-014
    Inventory valuation.

    INVENTORY-P2-015
    Advanced warehouse management.
159. Acceptance Criteria

The Inventory & Catalog Operations module is complete for v0.1 when:

Authorized users can create products.
Products belong to the correct business.
Products can be categorized.
Products can have prices.
Products can be published/unpublished.
Products can be marked available/unavailable.
Inventory tracking can be enabled or disabled.
Tracked products have reliable stock quantities.
Authorized users can adjust stock.
Stock adjustments record reasons.
Stock changes are auditable.
Zero stock is handled correctly.
Low-stock thresholds can be configured.
Public catalog data reflects authoritative product state.
Orders cannot intentionally purchase unavailable stock.
Historical orders preserve the relevant product price.
Product archival preserves historical references.
Inventory data is isolated between businesses.
The architecture supports future variants.
The architecture supports future multi-location inventory.
The architecture supports future supplier/purchase workflows.
The v0.1 implementation does not require a paid inventory service.
160. Example: Bakery

Business:

Royal Bakes

Product:

Chocolate Truffle Cake

Price:

₹650

Inventory:

Tracked

Stock:

5

Threshold:

3

Public catalog:

Available

Customer purchases:

2

Stock:

3

System:

LOW_STOCK

Customer purchases:

3

Stock:

0

System:

OUT_OF_STOCK

Public catalog:

Out of Stock
161. Example: Boutique

Product:

Black Oversized T-Shirt

SKU:

BOT-001

Stock:

8

Customer orders:

2

New stock:

6

Movement:

ORDER_DEDUCTION
-2
162. Example: Salon

Service:

Haircut

Inventory:

NOT_TRACKED

Availability:

Determined by bookings.

The system should not create:

Stock = 0

for a service.

163. Example: Freelancer

Service:

Website Development

Inventory:

NOT_TRACKED

Booking:

Uses scheduling system.
164. Example: AI Product Creation

Owner:

"Add chicken shawarma for ₹150."

AI:

Creates:

Draft Product

Name:
Chicken Shawarma

Price:
₹150

Owner:

[Review]

↓

[Publish]
165. Example: AI Stock Update

Owner:

"We received 20 chocolate cakes."

AI:

Detected inventory change:

Chocolate Cake
Current: 4
Add: 20
New: 24

Reason:
Restock

[Approve]

After approval:

Stock:
24
166. Example: Business Copilot

Copilot:

⚠️ Your Chocolate Cake is out of stock.

It sold 18 units this week.

It usually sells out every Saturday.

Future recommendation:

Consider increasing weekend production.

167. Example: Product Change Safety

Owner:

"Increase all cake prices by ₹50."

AI:

8 products affected.

Example:

Chocolate Cake
₹600 → ₹650

Red Velvet
₹700 → ₹750

Black Forest
₹650 → ₹700

[Review Changes]

[Apply]
168. Future Architecture

Long-term:

Product
   |
   +---- Category
   |
   +---- Media
   |
   +---- Price
   |
   +---- Inventory
   |
   +---- Orders
   |
   +---- Analytics
   |
   +---- AI
   |
   +---- Automations
   |
   +---- Catalog
   |
   +---- Business Knowledge Base
169. Final Architecture Principle

The catalog should describe:

What the business offers.

Inventory should describe:

What the business currently has available.

Orders should describe:

What customers requested/purchased.

Payments should describe:

What money was received.

These systems must remain separate but connected.

170. Final Principle

FrontDesk should never promise a customer something the business cannot fulfill.

Therefore:

Catalog → Availability → Order → Inventory

must be connected through authoritative backend rules.