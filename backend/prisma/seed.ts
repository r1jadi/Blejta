import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Simple bcrypt hash function (or use bcrypt package if available)
async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcrypt');
  return bcrypt.hash(password, 10);
}

async function main() {
  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@blejta.local' },
    update: {},
    create: {
      email: 'admin@blejta.local',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });
  console.log('✅ Admin user created:', admin.email, '(password: admin123)');

  // Create sample user
  const userPassword = await hashPassword('user123');
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Test User',
      role: 'user',
    },
  });
  console.log('✅ Test user created:', user.email, '(password: user123)');

  // Create products
  await prisma.product.createMany({
    data: [
      {
        name: 'Wireless Earbuds',
        price: 19.99,
        description: 'High-quality earbuds for tech lovers',
        images: ["/demo/earbuds1.jpg"]
      },
      {
        name: 'Mini LED Lamp',
        price: 9.49,
        description: 'Compact LED lamp for room décor',
        images: ["/demo/lamp.jpg"]
      }
    ]
  });
  console.log('✅ Products created');
  console.log('✅ Seed data created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
