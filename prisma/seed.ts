import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/utils/password";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@gearup.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin@1234";
const SAMPLE_PASSWORD = "Password@123";

const categories = [
  { name: "Camping", description: "Tents, sleeping bags, and camp kitchen gear" },
  { name: "Water Sports", description: "Kayaks, paddleboards, and life jackets" },
  { name: "Climbing", description: "Harnesses, ropes, and protection hardware" },
  { name: "Cycling", description: "Mountain and road bikes with accessories" },
  { name: "Winter Sports", description: "Skis, snowboards, and cold-weather kit" },
];

const providers = [
  { email: "trailhead.rentals@gearup.com", name: "Trailhead Rentals" },
  { email: "summit.gear@gearup.com", name: "Summit Gear Co" },
];

const gearItems = [
  {
    id: "a1a1a1a1-0000-4000-8000-000000000001",
    name: "4-Person Dome Tent",
    brand: "Coleman",
    description: "Weatherproof family tent, easy 10-minute setup",
    pricePerDay: 18,
    stock: 8,
    category: "Camping",
    provider: "trailhead.rentals@gearup.com",
  },
  {
    id: "a1a1a1a1-0000-4000-8000-000000000002",
    name: "Sleeping Bag (-5°C)",
    brand: "Naturehike",
    description: "Three-season mummy bag rated to -5°C",
    pricePerDay: 6,
    stock: 20,
    category: "Camping",
    provider: "trailhead.rentals@gearup.com",
  },
  {
    id: "a1a1a1a1-0000-4000-8000-000000000003",
    name: "Touring Kayak",
    brand: "Perception",
    description: "Stable single-seat kayak with paddle and spray skirt",
    pricePerDay: 35,
    stock: 5,
    category: "Water Sports",
    provider: "trailhead.rentals@gearup.com",
  },
  {
    id: "a1a1a1a1-0000-4000-8000-000000000004",
    name: "Climbing Harness Kit",
    brand: "Black Diamond",
    description: "Harness, belay device, and locking carabiner set",
    pricePerDay: 12,
    stock: 10,
    category: "Climbing",
    provider: "summit.gear@gearup.com",
  },
  {
    id: "a1a1a1a1-0000-4000-8000-000000000005",
    name: "Full-Suspension Mountain Bike",
    brand: "Trek",
    description: "29er trail bike with hydraulic disc brakes",
    pricePerDay: 45,
    stock: 6,
    category: "Cycling",
    provider: "summit.gear@gearup.com",
  },
  {
    id: "a1a1a1a1-0000-4000-8000-000000000006",
    name: "All-Mountain Snowboard",
    brand: "Burton",
    description: "156cm board with bindings, boots available separately",
    pricePerDay: 30,
    stock: 7,
    category: "Winter Sports",
    provider: "summit.gear@gearup.com",
  },
];

async function main() {
  const adminHash = await hashPassword(ADMIN_PASSWORD);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: adminHash, role: "ADMIN", status: "ACTIVE" },
    create: {
      name: "GearUp Admin",
      email: ADMIN_EMAIL,
      password: adminHash,
      role: "ADMIN",
    },
  });

  const categoryMap = new Map<string, string>();
  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { name: category.name },
      update: { description: category.description },
      create: category,
    });
    categoryMap.set(category.name, record.id);
  }

  const providerHash = await hashPassword(SAMPLE_PASSWORD);
  const providerMap = new Map<string, string>();
  for (const provider of providers) {
    const record = await prisma.user.upsert({
      where: { email: provider.email },
      update: { name: provider.name, role: "PROVIDER", status: "ACTIVE" },
      create: {
        name: provider.name,
        email: provider.email,
        password: providerHash,
        role: "PROVIDER",
      },
    });
    providerMap.set(provider.email, record.id);
  }

  for (const gear of gearItems) {
    const data = {
      name: gear.name,
      brand: gear.brand,
      description: gear.description,
      pricePerDay: gear.pricePerDay,
      stock: gear.stock,
      isAvailable: true,
      categoryId: categoryMap.get(gear.category)!,
      providerId: providerMap.get(gear.provider)!,
    };
    await prisma.gearItem.upsert({
      where: { id: gear.id },
      update: data,
      create: { id: gear.id, ...data },
    });
  }

  console.log("Seed complete:");
  console.log(`  Admin:      ${admin.email} / ${ADMIN_PASSWORD}`);
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Providers:  ${providers.length} (password ${SAMPLE_PASSWORD})`);
  console.log(`  Gear items: ${gearItems.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
