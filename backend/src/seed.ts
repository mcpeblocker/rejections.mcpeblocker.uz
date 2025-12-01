import { PrismaClient } from '@prisma/client';
import process from 'node:process';
import appConfig from './config.js';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.upsert({
        where: { email: 'system@rejections.mcpeblocker.uz' },
        update: {},
        create: {
            name: 'System Account',
            username: 'system',
            email: 'system@rejections.mcpeblocker.uz',
            password: appConfig.SYSTEM_ACCOUNT_PASSWORD,
        },
    });
    console.log(user);
}

main()
    .then(async () => {
        console.log('Seeding completed.');
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.log('Seeding failed.');
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    })