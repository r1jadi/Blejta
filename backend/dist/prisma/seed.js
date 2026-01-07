"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function hashPassword(password) {
    const bcrypt = require('bcrypt');
    return bcrypt.hash(password, 10);
}
async function main() {
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
//# sourceMappingURL=seed.js.map