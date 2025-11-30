import { PrismaClient } from '@prisma/client';
import process from 'node:process';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            name: 'One and only user',
            username: 'uniqueusername',
            email: 'user@example.com',
            password: 'securepassword',
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