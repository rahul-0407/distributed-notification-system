import { prisma } from "./index";

async function main() {
  console.log("[DB SEED] Starting manual database seed...");

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@netify.io";
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "admin123";

  const adminCount = await prisma.platformAdmin.count();
  if (adminCount === 0) {
    console.log(`[DB SEED] Creating initial Platform Super Admin (${adminEmail})...`);
    const passwordHash = await Bun.password.hash(adminPassword, { algorithm: "bcrypt", cost: 10 });
    await prisma.platformAdmin.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "System Super Admin",
        role: "SUPER_ADMIN",
      },
    });
    console.log(`[DB SEED] Platform Super Admin successfully created.`);
  } else {
    console.log("[DB SEED] Platform Super Admin already exists. Skipping.");
  }

  const tenantCount = await prisma.tenant.count();
  if (tenantCount === 0) {
    console.log("[DB SEED] Creating demo tenant (Acme Corporation)...");
    const tenant = await prisma.tenant.create({
      data: {
        id: "tnt_acme_88",
        name: "Acme Corporation",
        slug: "acme-corp",
      },
    });

    const memberPassword = process.env.INITIAL_MEMBER_PASSWORD || "password123";
    const memberPasswordHash = await Bun.password.hash(memberPassword, { algorithm: "bcrypt", cost: 10 });
    await prisma.tenantMember.create({
      data: {
        tenantId: tenant.id,
        name: "Tenant Owner",
        email: "owner@acme.com",
        passwordHash: memberPasswordHash,
        role: "OWNER",
      },
    });

    await prisma.endUser.createMany({
      data: [
        { tenantId: tenant.id, externalId: "user_9812", email: "jane.smith@example.com", name: "Jane Smith" },
        { tenantId: tenant.id, externalId: "user_4430", email: "alex.dev@example.com", name: "Alex Dev" },
      ],
    });
    console.log("[DB SEED] Demo tenant successfully created.");
  } else {
    console.log("[DB SEED] Tenant data already exists. Skipping.");
  }
}

main()
  .catch((e) => {
    console.error("[DB SEED ERROR]:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
