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
  const password = process.env.SEED_ADMIN_PASSWORD ?? "BuildersConnect2024!";
  const name = process.env.SEED_ADMIN_NAME ?? "Platform Admin";

  if (password === "BuildersConnect2024!") {
    console.warn(
      "⚠️  Using default admin password. Set SEED_ADMIN_PASSWORD in .env before production."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await db.user.upsert({
    where: { email },
    update: { name, role: "ADMIN", onboardingComplete: true },
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

  const category = await db.tradeCategory.findFirst({ where: { slug: "plumbing" } });
  if (!category) return;

  // Demo customer
  const customerUser = await db.user.upsert({
    where: { email: "customer@demo.buildersconnect.gh" },
    update: {},
    create: {
      email: "customer@demo.buildersconnect.gh",
      name: "Ama Owusu",
      passwordHash: await bcrypt.hash("Demo1234!", 12),
      role: "CUSTOMER",
      onboardingComplete: true,
      emailVerified: new Date(),
    },
  });

  await db.customerProfile.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      phone: "+233244000001",
      region: GhanaRegion.GREATER_ACCRA,
      city: "Accra",
    },
  });

  // Demo tradesperson
  const tradespersonUser = await db.user.upsert({
    where: { email: "tradesperson@demo.buildersconnect.gh" },
    update: {},
    create: {
      email: "tradesperson@demo.buildersconnect.gh",
      name: "Kofi Mensah",
      passwordHash: await bcrypt.hash("Demo1234!", 12),
      role: "TRADESPERSON",
      onboardingComplete: true,
      emailVerified: new Date(),
    },
  });

  const tradespersonProfile = await db.tradespersonProfile.upsert({
    where: { userId: tradespersonUser.id },
    update: {},
    create: {
      userId: tradespersonUser.id,
      businessName: "Mensah Plumbing Services",
      phone: "+233244000002",
      bio: "Professional plumber with 8 years of experience across Accra and Tema. Specialising in residential and commercial plumbing installations.",
      yearsOfExperience: 8,
      verificationStatus: "VERIFIED",
      onboardingStatus: "APPROVED",
      averageRating: 4.8,
      totalReviews: 24,
      totalJobsCompleted: 31,
    },
  });

  // Category link
  await db.tradespersonCategory.upsert({
    where: {
      tradespersonId_categoryId: {
        tradespersonId: tradespersonProfile.id,
        categoryId: category.id,
      },
    },
    update: {},
    create: {
      tradespersonId: tradespersonProfile.id,
      categoryId: category.id,
      isPrimary: true,
    },
  });

  // Service areas
  for (const region of [GhanaRegion.GREATER_ACCRA, GhanaRegion.EASTERN]) {
    await db.tradespersonServiceArea.upsert({
      where: {
        tradespersonId_region: {
          tradespersonId: tradespersonProfile.id,
          region,
        },
      },
      update: {},
      create: { tradespersonId: tradespersonProfile.id, region },
    });
  }

  console.log("✓ Demo data seeded (customer + tradesperson)");
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
