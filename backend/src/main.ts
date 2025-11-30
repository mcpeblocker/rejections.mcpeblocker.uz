import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import morgan from "morgan";
import authMiddleware from "./middlewares/auth.js";
import { prisma } from "./prisma.js";
import type { RequestWithUser } from "./types/RequestWithUser.js";

const IS_PROD = process.env.NODE_ENV === "production";

if (!IS_PROD) {
    configDotenv({
        path: "../.env",
    });
}

const app = express();

app.use(morgan(IS_PROD ? "combined" : "dev"));
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.send({ status: "OK" });
});

app.get("/api/rejections/", authMiddleware, async (req: RequestWithUser, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).send({ error: "Unauthorized" });
    }

    const rejections = await prisma.rejection.findMany({
        where: {
            userId: userId,
        },
    });

    res.send(rejections);
});

app.get("/api/rejections/count", authMiddleware, async (req: RequestWithUser, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).send({ error: "Unauthorized" });
    }

    const count = await prisma.rejection.count({
        where: {
            userId: userId,
        },
    });

    res.send({ count });
});

app.get("/api/rejections/check", authMiddleware, async (req: RequestWithUser, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).send({ error: "Unauthorized" });
    }

    const { emailId } = req.query;
    if (!emailId || typeof emailId !== "string") {
        return res.status(400).send({ error: "Missing or invalid emailId query parameter" });
    }

    const rejection = await prisma.rejection.findFirst({
        where: {
            userId: userId,
            emailId: emailId,
        },
    });

    if (rejection) {
        return res.send({ exists: true });
    } else {
        return res.send({ exists: false });
    }
});

app.post("/api/rejections/log", authMiddleware, async (req: RequestWithUser, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).send({ error: "Unauthorized" });
    }

    const { emailId, subject, content, sender, timestamp, reason } = req.body;
    // Basic validation
    if (!emailId || !reason || !subject) {
        return res.status(400).send({ error: "Missing required fields: emailId, reason, subject" });
    }

    // Default timestamp to now if not provided
    const rejectionTimestamp = timestamp ? new Date(timestamp) : new Date();

    const newRejection = await prisma.rejection.create({
        data: {
            userId: userId,
            emailId,
            title: subject,
            content,
            sender,
            timestamp: rejectionTimestamp,
            reason,
        }
    })
    // Logic to log rejection would go here
    res.status(201).send({ message: "Rejection logged successfully", rejectionId: newRejection.id });
});

app.use((req, res) => {
    res.status(404).send({ error: "Not Found" });
});

const PORT = process.env.SERVER_PORT || 8000;

if (!PORT) {
    throw new Error("SERVER_PORT is not defined in environment variables");
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
