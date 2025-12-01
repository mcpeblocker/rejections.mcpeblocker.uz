import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Connect to the database and log
prisma.$connect()
    .then(() => {
        console.log("Connected to the database successfully.");
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error);
    });

// Disconnect from the database on process exit
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    console.log("Disconnected from the database.");
    process.exit(0);
});