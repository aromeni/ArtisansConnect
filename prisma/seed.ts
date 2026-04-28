/**
 * BuildersConnect — Database Seed
 *
 * Run: npx prisma db seed
 *
 * Seeds:
 *   1. Trade categories (Ghana-relevant trades)
 *   2. Super admin user (change credentials before production)
 */

import { PrismaClient, GhanaRegion } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// ─── Trade Categories ─────────────────────────────────────────────────────────

type CategorySeed = {
  name: string;
  slug: string;
  description: string;
  icon: string;      // lucide-react icon name
  color: string;     // tailwind bg color class
  sortOrder: number;
  children?: Omit<CategorySeed, "children" | "sortOrder" | "color">[];
};

const TRADE_CATEGORIES: CategorySeed[] = [
  {
    name: "Plumbing",
    slug: "plumbing",
    description: "Water systems, pipe installation, leaks, bathrooms, and drainage",
    icon: "Wrench",
    color: "#3b82f6",
    sortOrder: 1,
    children: [
      { name: "Leak Repair", slug: "leak-repair", description: "Fixing water leaks", icon: "Droplets" },
      { name: "Bathroom Installation", slug: "bathroom-installation", description: "Bathrooms and showers", icon: "Bath" },
      { name: "Pipe Installation", slug: "pipe-installation", description: "Water and drainage pipes", icon: "Pipette" },
      { name: "Water Heater", slug: "water-heater", description: "Boilers and water heaters", icon: "Flame" },
    ],
  },
  {
    name: "Electrical",
    slug: "electrical",
    description: "Wiring, installations, repairs, and electrical safety inspections",
    icon: "Zap",
    color: "#eab308",
    sortOrder: 2,
    children: [
      { name: "Wiring & Rewiring", slug: "wiring-rewiring", description: "Electrical wiring", icon: "Cable" },
      { name: "Socket & Switch Installation", slug: "socket-switch", description: "Sockets and light switches", icon: "ToggleLeft" },
      { name: "Consumer Unit", slug: "consumer-unit", description: "Fuse boxes and consumer units", icon: "SquareStack" },
      { name: "Solar Installation", slug: "solar-installation", description: "Solar panels and inverters", icon: "Sun" },
    ],
  },
  {
    name: "Carpentry & Joinery",
    slug: "carpentry",
    description: "Doors, windows, furniture, and bespoke woodwork",
    icon: "Hammer",
    color: "#a16207",
    sortOrder: 3,
    children: [
      { name: "Door Installation", slug: "door-installation", description: "Fitting and hanging doors", icon: "DoorOpen" },
      { name: "Furniture Making", slug: "furniture-making", description: "Bespoke furniture", icon: "Armchair" },
      { name: "Wardrobes & Shelving", slug: "wardrobes-shelving", description: "Built-in storage", icon: "Package" },
      { name: "Decking & Fencing", slug: "decking-fencing", description: "Outdoor woodwork", icon: "Trees" },
    ],
  },
  {
    name: "Building & Construction",
    slug: "building-construction",
    description: "Extensions, new builds, renovations, and structural work",
    icon: "Building2",
    color: "#78716c",
    sortOrder: 4,
    children: [
      { name: "Extensions & Additions", slug: "extensions", description: "Building extensions", icon: "SquarePlus" },
      { name: "Renovations", slug: "renovations", description: "General building renovations", icon: "HardHat" },
      { name: "Masonry & Bricklaying", slug: "masonry-bricklaying", description: "Brickwork and blockwork", icon: "Layers" },
      { name: "Plastering", slug: "plastering", description: "Internal and external plastering", icon: "PaintBucket" },
    ],
  },
  {
    name: "Painting & Decorating",
    slug: "painting-decorating",
    description: "Interior and exterior painting, wallpaper, and finishing",
    icon: "Paintbrush",
    color: "#ec4899",
    sortOrder: 5,
  },
  {
    name: "Roofing",
    slug: "roofing",
    description: "Roof repairs, replacements, guttering, and waterproofing",
    icon: "Home",
    color: "#64748b",
    sortOrder: 6,
  },
  {
    name: "Tiling & Flooring",
    slug: "tiling-flooring",
    description: "Floor and wall tiles, hardwood floors, laminate, and vinyl",
    icon: "Grid3x3",
    color: "#0ea5e9",
    sortOrder: 7,
  },
  {
    name: "HVAC & Air Conditioning",
    slug: "hvac-air-conditioning",
    description: "AC installation, servicing, fans, and ventilation systems",
    icon: "Wind",
    color: "#06b6d4",
    sortOrder: 8,
  },
  {
    name: "Landscaping & Gardening",
    slug: "landscaping-gardening",
    description: "Garden design, lawn care, paving, and outdoor maintenance",
    icon: "TreePine",
    color: "#22c55e",
    sortOrder: 9,
  },
  {
    name: "Cleaning",
    slug: "cleaning",
    description: "Deep cleaning, end-of-tenancy, post-construction cleaning",
    icon: "Sparkles",
    color: "#8b5cf6",
    sortOrder: 10,
  },
  {
    name: "Security Systems",
    slug: "security-systems",
    description: "CCTV, alarms, intercoms, and access control installation",
    icon: "Shield",
    color: "#ef4444",
    sortOrder: 11,
  },
  {
    name: "Welding & Fabrication",
    slug: "welding-fabrication",
    description: "Metal gates, grilles, railings, and structural steel",
    icon: "Flame",
    color: "#f97316",
    sortOrder: 12,
  },
  {
    name: "Windows & Glazing",
    slug: "windows-glazing",
    description: "Window installation, glass repair, and aluminium framing",
    icon: "Square",
    color: "#0284c7",
    sortOrder: 13,
  },
  {
    name: "Interior Design",
    slug: "interior-design",
    description: "Space planning, styling, and interior fit-out consultation",
    icon: "LayoutDashboard",
    color: "#db2777",
    sortOrder: 14,
  },
  {
    name: "Pest Control",
    slug: "pest-control",
    description: "Termites, cockroaches, rodents, and fumigation services",
    icon: "Bug",
    color: "#65a30d",
    sortOrder: 15,
  },
  {
    name: "Moving & Removals",
    slug: "moving-removals",
    description: "House moves, office relocations, and furniture delivery",
    icon: "Truck",
    color: "#7c3aed",
    sortOrder: 16,
  },
  {
    name: "Pool & Water Systems",
    slug: "pool-water-systems",
    description: "Swimming pool construction, servicing, and water treatment",
    icon: "Waves",
    color: "#0891b2",
    sortOrder: 17,
  },
  {
    name: "TV & Electronics",
    slug: "tv-electronics",
    description: "TV mounting, home theatre, and electronic installations",
    icon: "Tv",
    color: "#1d4ed8",
    sortOrder: 18,
  },
];

// ─── Seed functions ───────────────────────────────────────────────────────────

async function seedCategories() {
  console.log("Seeding trade categories...");

  for (const cat of TRADE_CATEGORIES) {
    const parent = await db.tradeCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });

    if (cat.children) {
      for (let i = 0; i < cat.children.length; i++) {
        const child = cat.children[i];
        await db.tradeCategory.upsert({
          where: { slug: child.slug },
          update: {
            name: child.name,
            description: child.description,
            icon: child.icon,
            parentId: parent.id,
            sortOrder: i,
            isActive: true,
          },
          create: {
            name: child.name,
            slug: child.slug,
            description: child.description,
            icon: child.icon,
            parentId: parent.id,
            sortOrder: i,
            isActive: true,
          },
        });
      }
    }
  }

  const count = await db.tradeCategory.count();
  console.log(`✓ ${count} trade categories seeded`);
}

async function seedAdminUser() {
  console.log("Seeding admin user...");

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@buildersconnect.gh";
  const password = (process.env.SEED_ADMIN_PASSWORD ?? "BuildersConnect2024!").trim();
  const name = process.env.SEED_ADMIN_NAME ?? "Platform Admin";

  if (password === "BuildersConnect2024!") {
    console.warn(
      "⚠️  Using default admin password. Set SEED_ADMIN_PASSWORD in .env before production."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await db.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "ADMIN", onboardingComplete: true },
    create: {
      email,
      name,
      passwordHash,
      role: "ADMIN",
      onboardingComplete: true,
      emailVerified: new Date(),
    },
  });

  console.log(`✓ Admin user seeded: ${admin.email}`);
}

async function seedDemoData() {
  // Only seed demo data in development
  if (process.env.NODE_ENV !== "development") return;
  if (process.env.SEED_DEMO !== "true") return;

  console.log("Seeding demo data...");

  const demoPasswordHash = await bcrypt.hash("Demo1234!", 12);
  const day = 24 * 60 * 60 * 1000;
  const daysAgo = (days: number) => new Date(Date.now() - days * day);
  const daysFromNow = (days: number) => new Date(Date.now() + days * day);

  const categories = await db.tradeCategory.findMany({
    where: {
      slug: {
        in: [
          "plumbing",
          "electrical",
          "carpentry",
          "building-construction",
          "painting-decorating",
          "roofing",
          "tiling-flooring",
        ],
      },
    },
  });
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  const requiredSlugs = [
    "plumbing",
    "electrical",
    "carpentry",
    "building-construction",
    "painting-decorating",
  ];
  const missingSlugs = requiredSlugs.filter((slug) => !categoryBySlug.has(slug));
  if (missingSlugs.length > 0) {
    throw new Error(`Missing demo categories: ${missingSlugs.join(", ")}`);
  }

  const upsertUser = async ({
    email,
    name,
    role,
  }: {
    email: string;
    name: string;
    role: "CUSTOMER" | "TRADESPERSON";
  }) =>
    db.user.upsert({
      where: { email },
      update: {
        name,
        role,
        passwordHash: demoPasswordHash,
        onboardingComplete: true,
        emailVerified: new Date(),
        suspended: false,
      },
      create: {
        email,
        name,
        passwordHash: demoPasswordHash,
        role,
        onboardingComplete: true,
        emailVerified: new Date(),
      },
    });

  const customerUsers = await Promise.all([
    upsertUser({
      email: "customer@demo.buildersconnect.gh",
      name: "Ama Owusu",
      role: "CUSTOMER",
    }),
    upsertUser({
      email: "kwame.customer@demo.buildersconnect.gh",
      name: "Kwame Boateng",
      role: "CUSTOMER",
    }),
  ]);

  const customerProfiles = await Promise.all([
    db.customerProfile.upsert({
      where: { userId: customerUsers[0].id },
      update: {
        phone: "+233244000001",
        region: GhanaRegion.GREATER_ACCRA,
        city: "Accra",
        address: "East Legon",
      },
      create: {
        userId: customerUsers[0].id,
        phone: "+233244000001",
        region: GhanaRegion.GREATER_ACCRA,
        city: "Accra",
        address: "East Legon",
      },
    }),
    db.customerProfile.upsert({
      where: { userId: customerUsers[1].id },
      update: {
        phone: "+233244000003",
        region: GhanaRegion.ASHANTI,
        city: "Kumasi",
        address: "Nhyiaeso",
      },
      create: {
        userId: customerUsers[1].id,
        phone: "+233244000003",
        region: GhanaRegion.ASHANTI,
        city: "Kumasi",
        address: "Nhyiaeso",
      },
    }),
  ]);

  const tradespersonSeeds = [
    {
      email: "tradesperson@demo.buildersconnect.gh",
      name: "Kofi Mensah",
      businessName: "Mensah Plumbing Services",
      phone: "+233244000002",
      bio: "Professional plumber with 8 years of experience across Accra and Tema. Specialising in residential and commercial plumbing installations.",
      yearsOfExperience: 8,
      averageRating: 4.8,
      totalReviews: 24,
      totalJobsCompleted: 31,
      slugs: ["plumbing"],
      regions: [GhanaRegion.GREATER_ACCRA, GhanaRegion.EASTERN],
    },
    {
      email: "efua.electrician@demo.buildersconnect.gh",
      name: "Efua Adjei",
      businessName: "Adjei Electrical Works",
      phone: "+233244000004",
      bio: "Certified electrician handling rewiring, lighting, sockets, consumer units, and solar inverter setups.",
      yearsOfExperience: 6,
      averageRating: 4.6,
      totalReviews: 18,
      totalJobsCompleted: 22,
      slugs: ["electrical"],
      regions: [GhanaRegion.GREATER_ACCRA, GhanaRegion.CENTRAL],
    },
    {
      email: "yaw.carpenter@demo.buildersconnect.gh",
      name: "Yaw Antwi",
      businessName: "Antwi Woodcraft",
      phone: "+233244000005",
      bio: "Custom wardrobes, kitchen cabinets, doors, shelving, and furniture repairs for homes and offices.",
      yearsOfExperience: 11,
      averageRating: 4.9,
      totalReviews: 37,
      totalJobsCompleted: 44,
      slugs: ["carpentry"],
      regions: [GhanaRegion.ASHANTI, GhanaRegion.GREATER_ACCRA],
    },
    {
      email: "abena.painting@demo.buildersconnect.gh",
      name: "Abena Sarpong",
      businessName: "Sarpong Finishes",
      phone: "+233244000006",
      bio: "Interior and exterior painting team with neat prep work, colour advice, and fast turnaround.",
      yearsOfExperience: 5,
      averageRating: 4.7,
      totalReviews: 15,
      totalJobsCompleted: 19,
      slugs: ["painting-decorating", "tiling-flooring"],
      regions: [GhanaRegion.GREATER_ACCRA, GhanaRegion.VOLTA],
    },
    {
      email: "nana.builder@demo.buildersconnect.gh",
      name: "Nana Osei",
      businessName: "Osei Building & Renovations",
      phone: "+233244000007",
      bio: "Small building crew for renovations, blockwork, plastering, extensions, and structural repair jobs.",
      yearsOfExperience: 13,
      averageRating: 4.8,
      totalReviews: 29,
      totalJobsCompleted: 36,
      slugs: ["building-construction", "roofing"],
      regions: [GhanaRegion.GREATER_ACCRA, GhanaRegion.ASHANTI, GhanaRegion.EASTERN],
    },
  ];

  const tradespeople = [];
  for (const seed of tradespersonSeeds) {
    const user = await upsertUser({
      email: seed.email,
      name: seed.name,
      role: "TRADESPERSON",
    });

    const profile = await db.tradespersonProfile.upsert({
      where: { userId: user.id },
      update: {
        businessName: seed.businessName,
        phone: seed.phone,
        bio: seed.bio,
        yearsOfExperience: seed.yearsOfExperience,
        verificationStatus: "VERIFIED",
        onboardingStatus: "APPROVED",
        averageRating: seed.averageRating,
        totalReviews: seed.totalReviews,
        totalJobsCompleted: seed.totalJobsCompleted,
        ghanaCardName: seed.name.toUpperCase(),
        paystackRecipientCode: `RCP_DEMO_${user.id.slice(-8).toUpperCase()}`,
        payoutAccountNumber: `020${user.id.slice(-7)}`,
        payoutAccountName: seed.name,
      },
      create: {
        userId: user.id,
        businessName: seed.businessName,
        phone: seed.phone,
        bio: seed.bio,
        yearsOfExperience: seed.yearsOfExperience,
        verificationStatus: "VERIFIED",
        onboardingStatus: "APPROVED",
        averageRating: seed.averageRating,
        totalReviews: seed.totalReviews,
        totalJobsCompleted: seed.totalJobsCompleted,
        ghanaCardName: seed.name.toUpperCase(),
        paystackRecipientCode: `RCP_DEMO_${user.id.slice(-8).toUpperCase()}`,
        payoutAccountNumber: `020${user.id.slice(-7)}`,
        payoutAccountName: seed.name,
      },
    });

    await db.tradespersonCategory.deleteMany({ where: { tradespersonId: profile.id } });
    await db.tradespersonServiceArea.deleteMany({ where: { tradespersonId: profile.id } });
    await db.portfolioImage.deleteMany({ where: { tradespersonId: profile.id } });

    for (const [index, slug] of seed.slugs.entries()) {
      const category = categoryBySlug.get(slug);
      if (!category) continue;

      await db.tradespersonCategory.create({
        data: {
          tradespersonId: profile.id,
          categoryId: category.id,
          isPrimary: index === 0,
        },
      });
    }

    for (const region of seed.regions) {
      await db.tradespersonServiceArea.create({
        data: { tradespersonId: profile.id, region },
      });
    }

    await db.portfolioImage.createMany({
      data: [0, 1, 2].map((index) => ({
        tradespersonId: profile.id,
        publicId: `demo/${profile.id}/portfolio-${index + 1}`,
        url: `https://picsum.photos/seed/${profile.id}-${index + 1}/900/600`,
        caption: `${seed.businessName} project ${index + 1}`,
        sortOrder: index,
      })),
    });

    tradespeople.push({ user, profile, seed });
  }

  const demoCustomerIds = customerProfiles.map((profile) => profile.id);
  const oldDemoJobs = await db.job.findMany({
    where: { customerId: { in: demoCustomerIds } },
    select: { id: true },
  });
  const oldDemoJobIds = oldDemoJobs.map((job) => job.id);
  const oldDemoHires = await db.hire.findMany({
    where: { jobId: { in: oldDemoJobIds } },
    select: { id: true },
  });
  const oldDemoHireIds = oldDemoHires.map((hire) => hire.id);
  const oldDemoPayments = await db.payment.findMany({
    where: { jobId: { in: oldDemoJobIds } },
    select: { id: true },
  });
  const oldDemoPaymentIds = oldDemoPayments.map((payment) => payment.id);
  const oldDemoThreads = await db.chatThread.findMany({
    where: { jobId: { in: oldDemoJobIds } },
    select: { id: true },
  });
  const oldDemoThreadIds = oldDemoThreads.map((thread) => thread.id);
  const oldDemoMessages = await db.chatMessage.findMany({
    where: { threadId: { in: oldDemoThreadIds } },
    select: { id: true },
  });

  await db.messageAttachment.deleteMany({
    where: { messageId: { in: oldDemoMessages.map((message) => message.id) } },
  });
  await db.chatMessage.deleteMany({ where: { threadId: { in: oldDemoThreadIds } } });
  await db.chatThread.deleteMany({ where: { id: { in: oldDemoThreadIds } } });
  await db.review.deleteMany({ where: { jobId: { in: oldDemoJobIds } } });
  await db.disputeEvidence.deleteMany({ where: { dispute: { jobId: { in: oldDemoJobIds } } } });
  await db.dispute.deleteMany({ where: { jobId: { in: oldDemoJobIds } } });
  await db.refund.deleteMany({ where: { paymentId: { in: oldDemoPaymentIds } } });
  await db.payout.deleteMany({ where: { paymentId: { in: oldDemoPaymentIds } } });
  await db.commission.deleteMany({ where: { paymentId: { in: oldDemoPaymentIds } } });
  await db.paymentHold.deleteMany({ where: { paymentId: { in: oldDemoPaymentIds } } });
  await db.payment.deleteMany({ where: { id: { in: oldDemoPaymentIds } } });
  await db.shortlist.deleteMany({ where: { jobId: { in: oldDemoJobIds } } });
  await db.jobInterest.deleteMany({ where: { jobId: { in: oldDemoJobIds } } });
  await db.hire.deleteMany({ where: { id: { in: oldDemoHireIds } } });
  await db.jobImage.deleteMany({ where: { jobId: { in: oldDemoJobIds } } });
  await db.adminNote.deleteMany({ where: { jobId: { in: oldDemoJobIds } } });
  await db.job.deleteMany({ where: { id: { in: oldDemoJobIds } } });

  const [amaProfile, kwameProfile] = customerProfiles;
  const [kofi, efua, yaw, abena, nana] = tradespeople;

  const createJob = async ({
    customerId,
    categorySlug,
    title,
    description,
    region,
    city,
    address,
    budgetType,
    budgetMin,
    budgetMax,
    urgency,
    propertyType,
    status,
    interestCount = 0,
    publishedDaysAgo,
  }: {
    customerId: string;
    categorySlug: string;
    title: string;
    description: string;
    region: GhanaRegion;
    city: string;
    address: string;
    budgetType: "FIXED" | "RANGE" | "REQUEST_QUOTE";
    budgetMin?: number | null;
    budgetMax?: number | null;
    urgency: "FLEXIBLE" | "WITHIN_A_WEEK" | "WITHIN_A_MONTH" | "URGENT";
    propertyType: "HOUSE" | "APARTMENT" | "COMMERCIAL" | "LAND" | "OTHER";
    status: "DRAFT" | "OPEN" | "HIRED" | "IN_PROGRESS" | "COMPLETED";
    interestCount?: number;
    publishedDaysAgo?: number;
  }) => {
    const publishedAt =
      status === "DRAFT" || publishedDaysAgo === undefined ? null : daysAgo(publishedDaysAgo);

    const job = await db.job.create({
      data: {
        customerId,
        categoryId: categoryBySlug.get(categorySlug)!.id,
        title,
        description,
        region,
        city,
        address,
        budgetType,
        budgetMin: budgetMin ?? null,
        budgetMax: budgetMax ?? null,
        urgency,
        propertyType,
        status,
        interestCount,
        desiredStartDate: daysFromNow(10),
        publishedAt,
        closedAt: publishedAt ? daysFromNow(20) : null,
        viewCount: 12 + interestCount * 8,
      },
    });

    await db.jobImage.create({
      data: {
        jobId: job.id,
        publicId: `demo/jobs/${job.id}`,
        url: `https://picsum.photos/seed/${job.id}/1000/650`,
        caption: title,
      },
    });

    return job;
  };

  const jobs = await Promise.all([
    createJob({
      customerId: amaProfile.id,
      categorySlug: "plumbing",
      title: "Fix leaking kitchen sink and replace tap",
      description:
        "The kitchen sink has a steady leak underneath and the mixer tap needs replacing. Looking for someone who can inspect the pipes and complete the repair this week.",
      region: GhanaRegion.GREATER_ACCRA,
      city: "Accra",
      address: "East Legon",
      budgetType: "RANGE",
      budgetMin: 45000,
      budgetMax: 85000,
      urgency: "WITHIN_A_WEEK",
      propertyType: "APARTMENT",
      status: "OPEN",
      interestCount: 2,
      publishedDaysAgo: 2,
    }),
    createJob({
      customerId: amaProfile.id,
      categorySlug: "electrical",
      title: "Install ceiling lights and extra sockets",
      description:
        "Need four ceiling lights installed in the living room and two extra double sockets in the home office. Walls are already painted, so neat finishing matters.",
      region: GhanaRegion.GREATER_ACCRA,
      city: "Tema",
      address: "Community 25",
      budgetType: "FIXED",
      budgetMin: 120000,
      budgetMax: null,
      urgency: "URGENT",
      propertyType: "HOUSE",
      status: "OPEN",
      interestCount: 1,
      publishedDaysAgo: 1,
    }),
    createJob({
      customerId: amaProfile.id,
      categorySlug: "painting-decorating",
      title: "Paint two-bedroom apartment before move-in",
      description:
        "Fresh coat of paint needed for a two-bedroom apartment. Walls need minor preparation and clean lines around existing fittings.",
      region: GhanaRegion.GREATER_ACCRA,
      city: "Madina",
      address: "Social Welfare",
      budgetType: "RANGE",
      budgetMin: 180000,
      budgetMax: 260000,
      urgency: "WITHIN_A_MONTH",
      propertyType: "APARTMENT",
      status: "DRAFT",
    }),
    createJob({
      customerId: kwameProfile.id,
      categorySlug: "carpentry",
      title: "Build fitted wardrobes for main bedroom",
      description:
        "Looking for a carpenter to measure, design, and build fitted wardrobes with sliding doors and internal shelves.",
      region: GhanaRegion.ASHANTI,
      city: "Kumasi",
      address: "Nhyiaeso",
      budgetType: "RANGE",
      budgetMin: 350000,
      budgetMax: 550000,
      urgency: "WITHIN_A_MONTH",
      propertyType: "HOUSE",
      status: "HIRED",
      interestCount: 2,
      publishedDaysAgo: 8,
    }),
    createJob({
      customerId: kwameProfile.id,
      categorySlug: "plumbing",
      title: "Replace bathroom WC and shower mixer",
      description:
        "Bathroom upgrade is mostly complete, but the WC and shower mixer need replacing. Materials are already on site.",
      region: GhanaRegion.ASHANTI,
      city: "Kumasi",
      address: "Danyame",
      budgetType: "FIXED",
      budgetMin: 95000,
      budgetMax: null,
      urgency: "FLEXIBLE",
      propertyType: "HOUSE",
      status: "COMPLETED",
      interestCount: 1,
      publishedDaysAgo: 20,
    }),
    createJob({
      customerId: amaProfile.id,
      categorySlug: "building-construction",
      title: "Repair cracked boundary wall",
      description:
        "A section of the boundary wall has cracks and loose blocks after heavy rain. Need assessment, reinforcement, and clean plaster finish.",
      region: GhanaRegion.GREATER_ACCRA,
      city: "Accra",
      address: "Spintex",
      budgetType: "RANGE",
      budgetMin: 220000,
      budgetMax: 380000,
      urgency: "WITHIN_A_WEEK",
      propertyType: "HOUSE",
      status: "OPEN",
      interestCount: 1,
      publishedDaysAgo: 3,
    }),
    createJob({
      customerId: amaProfile.id,
      categorySlug: "building-construction",
      title: "Convert garage into small office",
      description:
        "We want to convert an existing garage into a small office with block partitioning, plastering, floor screed, and basic finishing.",
      region: GhanaRegion.GREATER_ACCRA,
      city: "Tema",
      address: "Community 18",
      budgetType: "RANGE",
      budgetMin: 850000,
      budgetMax: 1400000,
      urgency: "WITHIN_A_MONTH",
      propertyType: "HOUSE",
      status: "OPEN",
      interestCount: 1,
      publishedDaysAgo: 5,
    }),
    createJob({
      customerId: kwameProfile.id,
      categorySlug: "building-construction",
      title: "Plaster and skim new two-room extension",
      description:
        "Two-room extension is ready for plastering. Looking for a team to handle internal plaster, external render, and neat corner beads.",
      region: GhanaRegion.ASHANTI,
      city: "Kumasi",
      address: "Ahodwo",
      budgetType: "FIXED",
      budgetMin: 620000,
      budgetMax: null,
      urgency: "WITHIN_A_WEEK",
      propertyType: "HOUSE",
      status: "OPEN",
      interestCount: 1,
      publishedDaysAgo: 1,
    }),
    createJob({
      customerId: kwameProfile.id,
      categorySlug: "building-construction",
      title: "Build outdoor store room",
      description:
        "Need a small outdoor store room built beside the house, including foundation, blockwork, roofing frame, plastering, and door fitting.",
      region: GhanaRegion.ASHANTI,
      city: "Kumasi",
      address: "Asokwa",
      budgetType: "REQUEST_QUOTE",
      urgency: "FLEXIBLE",
      propertyType: "HOUSE",
      status: "OPEN",
      interestCount: 0,
      publishedDaysAgo: 4,
    }),
    createJob({
      customerId: amaProfile.id,
      categorySlug: "building-construction",
      title: "Renovate shop front and entrance steps",
      description:
        "Small commercial shop needs front wall repair, entrance step rebuild, floor patching, and a clean cement finish before repainting.",
      region: GhanaRegion.GREATER_ACCRA,
      city: "Osu",
      address: "Oxford Street",
      budgetType: "RANGE",
      budgetMin: 400000,
      budgetMax: 750000,
      urgency: "URGENT",
      propertyType: "COMMERCIAL",
      status: "OPEN",
      interestCount: 1,
      publishedDaysAgo: 2,
    }),
  ]);

  const createInterest = async (
    jobId: string,
    tradespersonId: string,
    status: "PENDING" | "SHORTLISTED" | "HIRED" | "DECLINED",
    estimatedCostPesewas: number,
    coverLetter: string
  ) =>
    db.jobInterest.create({
      data: {
        jobId,
        tradespersonId,
        status,
        estimatedCostPesewas,
        estimatedDuration: "1-2 days",
        availableFrom: daysFromNow(3),
        coverLetter,
      },
    });

  const sinkKofiInterest = await createInterest(
    jobs[0].id,
    kofi.profile.id,
    "SHORTLISTED",
    70000,
    "I can inspect the leak, replace the tap, and test the waste line this week."
  );
  await createInterest(
    jobs[0].id,
    efua.profile.id,
    "PENDING",
    80000,
    "I can help if there is any electrical work around the sink cabinet or disposal point."
  );
  await createInterest(
    jobs[1].id,
    efua.profile.id,
    "PENDING",
    120000,
    "I can complete the lights and sockets neatly and test the circuit before handover."
  );
  await createInterest(
    jobs[3].id,
    abena.profile.id,
    "DECLINED",
    440000,
    "We can handle wardrobe finishing and paint touch-ups after installation."
  );
  const wardrobeYawInterest = await createInterest(
    jobs[3].id,
    yaw.profile.id,
    "HIRED",
    480000,
    "I will measure the room, build the carcass, and install sliding doors with shelves."
  );
  const bathroomKofiInterest = await createInterest(
    jobs[4].id,
    kofi.profile.id,
    "HIRED",
    95000,
    "I can replace both fittings and pressure-test the plumbing."
  );
  await createInterest(
    jobs[5].id,
    nana.profile.id,
    "PENDING",
    330000,
    "I can inspect the wall, rebuild loose sections, and finish the plaster cleanly."
  );
  await createInterest(
    jobs[6].id,
    nana.profile.id,
    "PENDING",
    1250000,
    "My crew can handle the partitioning, screed, and finishing work end to end."
  );
  await createInterest(
    jobs[7].id,
    nana.profile.id,
    "PENDING",
    620000,
    "We can start the plastering this week and keep the finishing neat."
  );
  await createInterest(
    jobs[9].id,
    nana.profile.id,
    "PENDING",
    680000,
    "I can visit the shop, confirm measurements, and complete the entrance repairs quickly."
  );

  await db.shortlist.create({
    data: {
      jobId: jobs[0].id,
      tradespersonId: kofi.profile.id,
      interestId: sinkKofiInterest.id,
    },
  });
  await db.shortlist.create({
    data: {
      jobId: jobs[3].id,
      tradespersonId: yaw.profile.id,
      interestId: wardrobeYawInterest.id,
    },
  });

  const wardrobeHire = await db.hire.create({
    data: {
      jobId: jobs[3].id,
      tradespersonId: yaw.profile.id,
      customerId: kwameProfile.id,
      agreedAmountPesewas: 480000,
      status: "FUNDED",
      scopeNotes: "Fitted wardrobes with sliding doors, shelving, and installation.",
    },
  });
  const bathroomHire = await db.hire.create({
    data: {
      jobId: jobs[4].id,
      tradespersonId: kofi.profile.id,
      customerId: kwameProfile.id,
      agreedAmountPesewas: 95000,
      status: "COMPLETED",
      scopeNotes: "Replace WC, install shower mixer, and check for leaks.",
      completedAt: daysAgo(3),
    },
  });

  const createPaymentStack = async ({
    jobId,
    hireId,
    customerId,
    tradespersonId,
    reference,
    grossAmountPesewas,
    status,
    released,
  }: {
    jobId: string;
    hireId: string;
    customerId: string;
    tradespersonId: string;
    reference: string;
    grossAmountPesewas: number;
    status: "HELD" | "RELEASED";
    released: boolean;
  }) => {
    const commissionPesewas = Math.round(grossAmountPesewas * 0.1);
    const pspFeePesewas = Math.round(grossAmountPesewas * 0.0195);
    const netPayoutPesewas = grossAmountPesewas - commissionPesewas - pspFeePesewas;
    const payment = await db.payment.create({
      data: {
        jobId,
        hireId,
        customerId,
        paystackReference: reference,
        paystackTransactionId: `${reference}_TX`,
        grossAmountPesewas,
        commissionPesewas,
        pspFeePesewas,
        netPayoutPesewas,
        status,
        channel: "card",
        paidAt: daysAgo(2),
      },
    });

    await db.paymentHold.create({
      data: {
        paymentId: payment.id,
        tradespersonId,
        amountPesewas: netPayoutPesewas,
        releasedAt: released ? daysAgo(2) : null,
        releaseReason: released ? "Customer confirmed job completion" : null,
      },
    });
    await db.commission.create({
      data: {
        paymentId: payment.id,
        amountPesewas: commissionPesewas,
        rate: 0.1,
      },
    });

    if (released) {
      await db.payout.create({
        data: {
          paymentId: payment.id,
          tradespersonId,
          amountPesewas: netPayoutPesewas,
          paystackRecipientCode: "RCP_DEMO_RELEASED",
          paystackTransferCode: "TRF_DEMO_RELEASED",
          status: "COMPLETED",
          completedAt: daysAgo(1),
        },
      });
    }
  };

  await createPaymentStack({
    jobId: jobs[3].id,
    hireId: wardrobeHire.id,
    customerId: kwameProfile.id,
    tradespersonId: yaw.profile.id,
    reference: "BC_DEMO_WARDROBE",
    grossAmountPesewas: 480000,
    status: "HELD",
    released: false,
  });
  await createPaymentStack({
    jobId: jobs[4].id,
    hireId: bathroomHire.id,
    customerId: kwameProfile.id,
    tradespersonId: kofi.profile.id,
    reference: "BC_DEMO_BATHROOM",
    grossAmountPesewas: 95000,
    status: "RELEASED",
    released: true,
  });

  const sinkThread = await db.chatThread.create({
    data: {
      jobId: jobs[0].id,
      customerId: customerUsers[0].id,
      tradespersonId: kofi.user.id,
    },
  });
  await db.chatMessage.createMany({
    data: [
      {
        threadId: sinkThread.id,
        senderId: customerUsers[0].id,
        content: "Hi Kofi, can you come by Thursday morning to inspect the leak?",
        createdAt: daysAgo(1),
      },
      {
        threadId: sinkThread.id,
        senderId: kofi.user.id,
        content: "Yes, Thursday works. Please send a photo of the current tap if possible.",
        createdAt: daysAgo(1),
      },
    ],
  });

  await db.review.create({
    data: {
      jobId: jobs[4].id,
      tradespersonId: kofi.profile.id,
      reviewerId: customerUsers[1].id,
      revieweeId: kofi.user.id,
      rating: 5,
      comment: "Quick, tidy, and explained the work clearly before leaving.",
    },
  });

  console.log(
    "✓ Demo data seeded (2 customers, 5 tradespeople, 10 jobs, interests, hires, messages, payments)"
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    await seedCategories();
    await seedAdminUser();
    await seedDemoData();
    console.log("✅ Seed completed successfully");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
