import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function section(sectionType: string, sortOrder: number, content: Record<string, any>, components: Array<{ componentType: string; sortOrder: number; props: Record<string, any>; content: Record<string, any> }>, styleConfig?: Record<string, any>) {
  return { sectionType, sortOrder, content: JSON.stringify(content), styleConfig: styleConfig ? JSON.stringify(styleConfig) : undefined, components: components.map(c => ({ ...c, props: JSON.stringify(c.props), content: JSON.stringify(c.content) })) };
}

const templates = [
  {
    name: "Restaurant Modern",
    slug: "restaurant-modern",
    description: "Modern restaurant website with menu, gallery, and contact",
    category: "restaurant",
    themeConfig: { colors: { primary: { value: "#dc2626" }, secondary: { value: "#1f2937" } } },
    pages: [
      { title: "Home", slug: "home", pageType: "home", sortOrder: 0, sections: [
        section("hero", 0, { heading: "Welcome to Our Restaurant", subheading: "Authentic flavors, unforgettable experience", cta: "View Menu" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 1 }, content: { text: "Welcome to Our Restaurant" } },
          { componentType: "text", sortOrder: 1, props: {}, content: { text: "Authentic flavors, unforgettable experience" } },
          { componentType: "button", sortOrder: 2, props: { variant: "primary" }, content: { text: "View Menu", href: "/menu" } },
        ]),
        section("about", 1, { heading: "Our Story", subheading: "Serving authentic cuisine since 2010" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Our Story" } },
          { componentType: "text", sortOrder: 1, props: {}, content: { text: "Serving authentic cuisine since 2010" } },
        ]),
        section("products", 2, { title: "Featured Menu", showFeatured: true }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Featured Menu" } },
        ]),
        section("gallery", 3, { title: "Our Gallery" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Our Gallery" } },
        ]),
        section("testimonials", 4, { title: "What Our Customers Say" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "What Our Customers Say" } },
        ]),
        section("contact", 5, { title: "Find Us" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Find Us" } },
        ]),
      ]},
      { title: "Menu", slug: "menu", pageType: "menu", sortOrder: 1, sections: [
        section("products", 0, { title: "Our Menu", showFeatured: false }, [
          { componentType: "heading", sortOrder: 0, props: { level: 1 }, content: { text: "Our Menu" } },
        ]),
      ]},
      { title: "About", slug: "about", pageType: "about", sortOrder: 2, sections: [
        section("about", 0, { heading: "About Us", subheading: "Our journey began in 2010" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 1 }, content: { text: "About Us" } },
          { componentType: "text", sortOrder: 1, props: {}, content: { text: "Our journey began in 2010 with a simple passion for great food." } },
        ]),
      ]},
      { title: "Contact", slug: "contact", pageType: "contact", sortOrder: 3, sections: [
        section("contact", 0, { title: "Contact Us" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 1 }, content: { text: "Contact Us" } },
        ]),
      ]},
    ],
  },
  {
    name: "Salon Beauty",
    slug: "salon-beauty",
    description: "Elegant salon website with services, team, and booking",
    category: "salon",
    themeConfig: { colors: { primary: { value: "#be185d" }, secondary: { value: "#1f2937" } } },
    pages: [
      { title: "Home", slug: "home", pageType: "home", sortOrder: 0, sections: [
        section("hero", 0, { heading: "Beauty & Wellness", subheading: "Look your best, feel your best", cta: "Book Now" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 1 }, content: { text: "Beauty & Wellness" } },
          { componentType: "text", sortOrder: 1, props: {}, content: { text: "Look your best, feel your best" } },
        ]),
        section("services", 1, { title: "Our Services" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Our Services" } },
        ]),
        section("testimonials", 2, { title: "Client Reviews" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Client Reviews" } },
        ]),
        section("contact", 3, { title: "Visit Us" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Visit Us" } },
        ]),
      ]},
    ],
  },
  {
    name: "Clinic Healthcare",
    slug: "clinic-healthcare",
    description: "Professional clinic website with services and contact",
    category: "clinic",
    themeConfig: { colors: { primary: { value: "#0891b2" }, secondary: { value: "#1f2937" } } },
    pages: [
      { title: "Home", slug: "home", pageType: "home", sortOrder: 0, sections: [
        section("hero", 0, { heading: "Quality Healthcare", subheading: "Your health is our priority", cta: "Book Appointment" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 1 }, content: { text: "Quality Healthcare" } },
          { componentType: "text", sortOrder: 1, props: {}, content: { text: "Your health is our priority" } },
        ]),
        section("services", 1, { title: "Our Services" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Our Services" } },
        ]),
        section("contact", 2, { title: "Contact Us" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Contact Us" } },
        ]),
      ]},
    ],
  },
  {
    name: "Agency Business",
    slug: "agency-business",
    description: "Professional agency website with services and portfolio",
    category: "agency",
    themeConfig: { colors: { primary: { value: "#2563eb" }, secondary: { value: "#1f2937" } } },
    pages: [
      { title: "Home", slug: "home", pageType: "home", sortOrder: 0, sections: [
        section("hero", 0, { heading: "Digital Agency", subheading: "We build digital experiences", cta: "Get Started" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 1 }, content: { text: "Digital Agency" } },
          { componentType: "text", sortOrder: 1, props: {}, content: { text: "We build digital experiences" } },
        ]),
        section("services", 1, { title: "What We Do" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "What We Do" } },
        ]),
        section("testimonials", 2, { title: "Client Testimonials" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Client Testimonials" } },
        ]),
        section("contact", 3, { title: "Let's Talk" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Let's Talk" } },
        ]),
      ]},
    ],
  },
  {
    name: "Portfolio Creative",
    slug: "portfolio-creative",
    description: "Creative portfolio website for artists and designers",
    category: "portfolio",
    themeConfig: { colors: { primary: { value: "#7c3aed" }, secondary: { value: "#1f2937" } } },
    pages: [
      { title: "Home", slug: "home", pageType: "home", sortOrder: 0, sections: [
        section("hero", 0, { heading: "Creative Portfolio", subheading: "Showcasing my work", cta: "View Projects" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 1 }, content: { text: "Creative Portfolio" } },
          { componentType: "text", sortOrder: 1, props: {}, content: { text: "Showcasing my work" } },
        ]),
        section("gallery", 1, { title: "Featured Work" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Featured Work" } },
        ]),
        section("contact", 2, { title: "Get In Touch" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Get In Touch" } },
        ]),
      ]},
    ],
  },
  {
    name: "Retail Store",
    slug: "retail-store",
    description: "Retail store website with products and contact",
    category: "retail",
    themeConfig: { colors: { primary: { value: "#ea580c" }, secondary: { value: "#1f2937" } } },
    pages: [
      { title: "Home", slug: "home", pageType: "home", sortOrder: 0, sections: [
        section("hero", 0, { heading: "Welcome to Our Store", subheading: "Quality products, great prices", cta: "Shop Now" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 1 }, content: { text: "Welcome to Our Store" } },
          { componentType: "text", sortOrder: 1, props: {}, content: { text: "Quality products, great prices" } },
        ]),
        section("products", 1, { title: "Featured Products", showFeatured: true }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Featured Products" } },
        ]),
        section("contact", 2, { title: "Visit Us" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Visit Us" } },
        ]),
      ]},
    ],
  },
  {
    name: "Freelancer Pro",
    slug: "freelancer-pro",
    description: "Professional freelancer website with services and contact",
    category: "freelancer",
    themeConfig: { colors: { primary: { value: "#059669" }, secondary: { value: "#1f2937" } } },
    pages: [
      { title: "Home", slug: "home", pageType: "home", sortOrder: 0, sections: [
        section("hero", 0, { heading: "Professional Services", subheading: "Expert solutions for your business", cta: "Hire Me" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 1 }, content: { text: "Professional Services" } },
          { componentType: "text", sortOrder: 1, props: {}, content: { text: "Expert solutions for your business" } },
        ]),
        section("services", 1, { title: "What I Offer" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "What I Offer" } },
        ]),
        section("testimonials", 2, { title: "Client Feedback" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Client Feedback" } },
        ]),
        section("contact", 3, { title: "Let's Connect" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Let's Connect" } },
        ]),
      ]},
    ],
  },
  {
    name: "Real Estate Homes",
    slug: "real-estate-homes",
    description: "Real estate website with listings and contact",
    category: "real-estate",
    themeConfig: { colors: { primary: { value: "#0369a1" }, secondary: { value: "#1f2937" } } },
    pages: [
      { title: "Home", slug: "home", pageType: "home", sortOrder: 0, sections: [
        section("hero", 0, { heading: "Find Your Dream Home", subheading: "Premium properties for sale and rent", cta: "Browse Listings" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 1 }, content: { text: "Find Your Dream Home" } },
          { componentType: "text", sortOrder: 1, props: {}, content: { text: "Premium properties for sale and rent" } },
        ]),
        section("products", 1, { title: "Featured Properties", showFeatured: true }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Featured Properties" } },
        ]),
        section("contact", 2, { title: "Contact Agent" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Contact Agent" } },
        ]),
      ]},
    ],
  },
  {
    name: "Education Academy",
    slug: "education-academy",
    description: "Education institution website with courses and contact",
    category: "education",
    themeConfig: { colors: { primary: { value: "#4f46e5" }, secondary: { value: "#1f2937" } } },
    pages: [
      { title: "Home", slug: "home", pageType: "home", sortOrder: 0, sections: [
        section("hero", 0, { heading: "Welcome to Our Academy", subheading: "Empowering minds, shaping futures", cta: "Explore Courses" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 1 }, content: { text: "Welcome to Our Academy" } },
          { componentType: "text", sortOrder: 1, props: {}, content: { text: "Empowering minds, shaping futures" } },
        ]),
        section("services", 1, { title: "Our Courses" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Our Courses" } },
        ]),
        section("testimonials", 2, { title: "Student Reviews" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Student Reviews" } },
        ]),
        section("contact", 3, { title: "Get In Touch" }, [
          { componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Get In Touch" } },
        ]),
      ]},
    ],
  },
];

async function main() {
  console.log("🌱 Seeding website templates...");

  for (const tpl of templates) {
    const existing = await prisma.websiteTemplate.findUnique({ where: { slug: tpl.slug } });
    if (existing) {
      console.log(`   Template "${tpl.name}" already exists, skipping.`);
      continue;
    }

    await prisma.websiteTemplate.create({
      data: {
        name: tpl.name,
        slug: tpl.slug,
        description: tpl.description,
        category: tpl.category,
        isBuiltIn: true,
        themeConfig: tpl.themeConfig ? JSON.stringify(tpl.themeConfig) : undefined,
        pages: {
          create: tpl.pages.map((p: any) => ({
            title: p.title,
            slug: p.slug,
            pageType: p.pageType,
            sortOrder: p.sortOrder,
            sections: {
              create: p.sections.map((s: any) => ({
                sectionType: s.sectionType,
                sortOrder: s.sortOrder,
                content: s.content,
                styleConfig: s.styleConfig,
                components: {
                  create: s.components.map((c: any) => ({
                    componentType: c.componentType,
                    sortOrder: c.sortOrder,
                    props: c.props,
                    content: c.content,
                  })),
                },
              })),
            },
          })),
        },
      },
    });
    console.log(`   ✓ Created template: ${tpl.name}`);
  }

  console.log("🌱 Seeding section packs...");

  const packs = [
    { name: "Restaurant Starter", slug: "restaurant-starter", description: "Essential sections for a restaurant website", category: "restaurant", sections: [
      section("hero", 0, { heading: "Welcome", subheading: "Great food awaits", cta: "View Menu" }, [{ componentType: "heading", sortOrder: 0, props: { level: 1 }, content: { text: "Welcome" } }]),
      section("about", 1, { heading: "About Us" }, [{ componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "About Us" } }]),
      section("products", 2, { title: "Our Menu" }, [{ componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Our Menu" } }]),
      section("gallery", 3, { title: "Gallery" }, [{ componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Gallery" } }]),
      section("testimonials", 4, { title: "Reviews" }, [{ componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Reviews" } }]),
      section("contact", 5, { title: "Contact" }, [{ componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Contact" } }]),
    ]},
    { name: "Salon Starter", slug: "salon-starter", description: "Essential sections for a salon website", category: "salon", sections: [
      section("hero", 0, { heading: "Beauty & Wellness", subheading: "Look your best", cta: "Book Now" }, [{ componentType: "heading", sortOrder: 0, props: { level: 1 }, content: { text: "Beauty & Wellness" } }]),
      section("services", 1, { title: "Services" }, [{ componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Services" } }]),
      section("testimonials", 2, { title: "Reviews" }, [{ componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Reviews" } }]),
      section("contact", 3, { title: "Visit Us" }, [{ componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Visit Us" } }]),
    ]},
    { name: "Business Starter", slug: "business-starter", description: "Essential sections for a business website", category: "general", sections: [
      section("hero", 0, { heading: "Welcome", subheading: "We can help", cta: "Get Started" }, [{ componentType: "heading", sortOrder: 0, props: { level: 1 }, content: { text: "Welcome" } }]),
      section("services", 1, { title: "Our Services" }, [{ componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Our Services" } }]),
      section("testimonials", 2, { title: "Testimonials" }, [{ componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Testimonials" } }]),
      section("contact", 3, { title: "Contact Us" }, [{ componentType: "heading", sortOrder: 0, props: { level: 2 }, content: { text: "Contact Us" } }]),
    ]},
  ];

  for (const pack of packs) {
    const existing = await prisma.sectionPack.findUnique({ where: { slug: pack.slug } });
    if (existing) {
      console.log(`   Pack "${pack.name}" already exists, skipping.`);
      continue;
    }

    await prisma.sectionPack.create({
      data: {
        name: pack.name,
        slug: pack.slug,
        description: pack.description,
        category: pack.category,
        isBuiltIn: true,
        sections: {
          create: pack.sections.map((s: any) => ({
            sectionType: s.sectionType,
            sortOrder: s.sortOrder,
            content: s.content,
            styleConfig: s.styleConfig,
            components: {
              create: s.components.map((c: any) => ({
                componentType: c.componentType,
                sortOrder: c.sortOrder,
                props: c.props,
                content: c.content,
              })),
            },
          })),
        },
      },
    });
    console.log(`   ✓ Created pack: ${pack.name}`);
  }

  console.log("✅ Template seed done");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
