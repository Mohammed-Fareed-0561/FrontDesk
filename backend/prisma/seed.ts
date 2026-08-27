import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding FrontDesk...");

  const email = "demo@royalbakes.test";
  const password = "demo12345";
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: hash, displayName: "Royal Bakes Owner", phone: "+91 98765 43210" }
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: "royal-bakes-workspace" },
    update: {},
    create: { name: "Royal Bakes Workspace", slug: "royal-bakes-workspace", ownerUserId: user.id }
  });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } } as any,
    update: {},
    create: { workspaceId: workspace.id, userId: user.id, role: "owner", status: "active" }
  }).catch(async () => {
    const exists = await prisma.workspaceMember.findFirst({ where: { workspaceId: workspace.id, userId: user.id } });
    if (!exists) await prisma.workspaceMember.create({ data: { workspaceId: workspace.id, userId: user.id, role: "owner", status: "active" } });
  });

  const business = await prisma.business.upsert({
    where: { id: "seed-business-id" } as any,
    update: {},
    create: {
      id: "seed-business-id",
      workspaceId: workspace.id,
      name: "Royal Bakes",
      slug: "royal-bakes",
      description: "Artisan bakery in Chennai — cakes, breads, and pastries baked fresh daily.",
      businessType: "bakery",
      industry: "Food & Beverage",
      phone: "+91 98765 43210",
      email: "hello@royalbakes.test",
      websiteUrl: "https://royalbakes.example",
      timezone: "Asia/Kolkata",
      currency: "INR",
      locale: "en-IN",
      createdBy: user.id,
    }
  }).catch(async () => {
    let b = await prisma.business.findFirst({ where: { workspaceId: workspace.id, slug: "royal-bakes" } });
    if (!b) b = await prisma.business.create({ data: { workspaceId: workspace.id, name: "Royal Bakes", slug: "royal-bakes", description: "Artisan bakery — Chennai", businessType: "bakery", phone: "+91 98765 43210", email: "hello@royalbakes.test", timezone: "Asia/Kolkata", currency: "INR", createdBy: user.id } });
    return b;
  });

  const biz = business as any;

  await prisma.businessLocation.upsert({
    where: { id: "seed-location-id" } as any,
    update: {},
    create: { id: "seed-location-id", businessId: biz.id, name: "Main Store", addressLine1: "12 Anna Nagar", city: "Chennai", state: "Tamil Nadu", postalCode: "600040", country: "IN", isPrimary: true }
  }).catch(async () => {
    const exists = await prisma.businessLocation.findFirst({ where: { businessId: biz.id } });
    if (!exists) await prisma.businessLocation.create({ data: { businessId: biz.id, name: "Main Store", addressLine1: "12 Anna Nagar", city: "Chennai", state: "Tamil Nadu", postalCode: "600040", country: "IN", isPrimary: true } });
  });

  // Hours 9am-9pm
  for (let d = 0; d < 7; d++) {
    const existing = await prisma.businessHours.findFirst({ where: { businessId: biz.id, dayOfWeek: d } });
    if (!existing) await prisma.businessHours.create({ data: { businessId: biz.id, dayOfWeek: d, openTime: "09:00", closeTime: "21:00", isClosed: d === 0 ? false : false } });
  }

  const cat1 = await prisma.category.upsert({ where: { id: "seed-cat-1" } as any, update: {}, create: { id: "seed-cat-1", businessId: biz.id, name: "Cakes", description: "Fresh cakes" } }).catch(async () => {
    let c = await prisma.category.findFirst({ where: { businessId: biz.id, name: "Cakes" } });
    if (!c) c = await prisma.category.create({ data: { businessId: biz.id, name: "Cakes" } });
    return c;
  });
  const cat2 = await prisma.category.upsert({ where: { id: "seed-cat-2" } as any, update: {}, create: { id: "seed-cat-2", businessId: biz.id, name: "Beverages" } }).catch(async () => {
    let c = await prisma.category.findFirst({ where: { businessId: biz.id, name: "Beverages" } });
    if (!c) c = await prisma.category.create({ data: { businessId: biz.id, name: "Beverages" } });
    return c;
  });

  const products = [
    { name: "Chocolate Truffle Cake", slug: "chocolate-truffle-cake", description: "Rich chocolate truffle cake — 1kg", price: 650, categoryId: (cat1 as any).id },
    { name: "Red Velvet Cake", slug: "red-velvet-cake", description: "Classic red velvet with cream cheese", price: 700, categoryId: (cat1 as any).id },
    { name: "Cappuccino", slug: "cappuccino", description: "Freshly brewed cappuccino", price: 120, categoryId: (cat2 as any).id },
    { name: "Veg Puff", slug: "veg-puff", description: "Crispy veg puff", price: 35, categoryId: (cat1 as any).id },
  ];
  for (const p of products) {
    const exists = await prisma.product.findFirst({ where: { businessId: biz.id, slug: p.slug } });
    if (!exists) await prisma.product.create({ data: { businessId: biz.id, name: p.name, slug: p.slug, description: p.description, price: p.price, currency: "INR", status: "active", availability: "available", categoryId: p.categoryId, isFeatured: p.slug.includes("chocolate") } });
  }

  // website
  let website = await prisma.website.findFirst({ where: { businessId: biz.id } });
  if (!website) {
    website = await prisma.website.create({ data: { businessId: biz.id, name: "Royal Bakes Website", status: "draft", themeConfig: JSON.stringify({ primary: "#0f172a", secondary: "#334155", radius: "12px" }) } });
    const home = await prisma.websitePage.create({ data: { websiteId: website.id, title: "Home", slug: "home", pageType: "home", sortOrder: 0 } });
    await prisma.websiteSection.createMany({
      data: [
        { pageId: home.id, sectionType: "hero", sortOrder: 0, content: JSON.stringify({ heading: "Royal Bakes", subheading: "Chennai's favourite bakery since 2018. Fresh cakes, breads & more.", cta: "Contact on WhatsApp", ctaLink: "https://wa.me/919876543210" }) },
        { pageId: home.id, sectionType: "products", sortOrder: 1, content: JSON.stringify({ title: "Best sellers", showFeatured: true }) },
        { pageId: home.id, sectionType: "about", sortOrder: 2, content: JSON.stringify({ title: "About us", text: "We bake fresh every morning with premium ingredients." }) },
        { pageId: home.id, sectionType: "contact", sortOrder: 3, content: JSON.stringify({ phone: "+91 98765 43210", email: "hello@royalbakes.test", address: "12 Anna Nagar, Chennai" }) },
      ]
    });
  }

  // memories
  const memExists = await prisma.businessMemory.findFirst({ where: { businessId: biz.id } });
  if (!memExists) {
    await prisma.businessMemory.createMany({
      data: [
        { businessId: biz.id, content: "Always use Tamil + English in customer-facing messages when possible.", memoryType: "communication_preference", importance: 4, source: "owner", status: "active" },
        { businessId: biz.id, content: "Never discount premium cakes below 10% without approval.", memoryType: "business_rule", importance: 5, source: "owner", status: "active" },
      ]
    });
  }

  // knowledge
  const kd = await prisma.knowledgeDocument.findFirst({ where: { businessId: biz.id } });
  if (!kd) {
    const doc = await prisma.knowledgeDocument.create({ data: { businessId: biz.id, title: "Royal Bakes Profile", content: "Royal Bakes is a bakery in Chennai...", sourceType: "business_profile" } });
    await prisma.knowledgeChunk.create({ data: { documentId: doc.id, chunkIndex: 0, content: "Royal Bakes offers cakes, puffs, beverages. Location: Anna Nagar, Chennai. Hours: 9am-9pm daily. Phone: +91 98765 43210." } });
  }

  // customer + enquiry
  let cust = await prisma.customer.findFirst({ where: { businessId: biz.id, phone: "+91 90000 11111" } });
  if (!cust) cust = await prisma.customer.create({ data: { businessId: biz.id, name: "Arun Kumar", phone: "+91 90000 11111", source: "seed" } });
  const enq = await prisma.enquiry.findFirst({ where: { businessId: biz.id } });
  if (!enq) {
    const conv = await prisma.conversation.create({ data: { businessId: biz.id, customerId: cust.id, channel: "website", status: "open", lastMessageAt: new Date() } });
    await prisma.message.create({ data: { conversationId: conv.id, senderType: "customer", senderId: cust.id, content: "Hi, is the chocolate truffle cake available for tomorrow?" } });
    await prisma.enquiry.create({ data: { businessId: biz.id, customerId: cust.id, conversationId: conv.id, subject: "Cake availability", message: "Hi, is the chocolate truffle cake available for tomorrow?", status: "new", source: "website" } });
  }

  // action definitions
  for (const def of [{ actionKey: "CREATE_PRODUCT", name: "Create Product" }, { actionKey: "UPDATE_PRODUCT", name: "Update Product", approvalRequired: true }, { actionKey: "DELETE_PRODUCT", name: "Delete Product", approvalRequired: true }, { actionKey: "PUBLISH_WEBSITE", name: "Publish Website" }]) {
    await prisma.actionDefinition.upsert({ where: { actionKey: def.actionKey }, update: {}, create: { actionKey: def.actionKey, name: def.name, approvalRequired: (def as any).approvalRequired || false } });
  }

  console.log("✅ Seed done");
  console.log(`   Demo login: ${email} / ${password}`);
  console.log(`   Business: ${biz.name} (${biz.slug})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
