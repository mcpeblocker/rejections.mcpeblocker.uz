import { Router } from "express";
import authMiddleware from "../middlewares/auth.js";
import type { RequestWithUser } from "../types/RequestWithUser.js";
import { prisma } from "../core/prisma.js";

const router = Router();

/**
 * GET /api/rejections/
 * Retrieves all rejections for the authenticated user.
 */
router.get("/", authMiddleware, async (req: RequestWithUser, res) => {
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

/**
 * GET /api/rejections/count
 * Retrieves the count of rejections for the authenticated user.
 */
router.get("/count", authMiddleware, async (req: RequestWithUser, res) => {
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

/**
 * GET /api/rejections/check?emailId=...
 * Checks if a rejection with the given emailId exists for the authenticated user.
 */
router.get("/check", authMiddleware, async (req: RequestWithUser, res) => {
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

/**
 * POST /api/rejections/log-from-email
 * Logs a rejection based on email data sent from the client (browser extension).
 */
router.post("/log-from-email", authMiddleware, async (req: RequestWithUser, res) => {
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

router.post("/log-from-website", authMiddleware, async (req: RequestWithUser, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).send({ error: "Unauthorized" });
    }

    const { title, category, description, reflections } = req.body;
    // Basic validation
    if (!title || !category) {
        return res.status(400).send({ error: "Missing required fields: title, category" });
    }

    let content = `Category: ${category}\n\n`;
    if (description) {
        content += `Description: ${description}\n\n`;
    }
    if (reflections) {
        content += `Reflections: ${reflections}\n\n`;
    }
    // Default timestamp to now
    const timestamp = new Date();

    const newRejection = await prisma.rejection.create({
        data: {
            userId: userId,
            title,
            content,

            timestamp,
        }
    })
    // Logic to log rejection would go here
    res.status(201).send({ message: "Rejection logged successfully", rejectionId: newRejection.id });
});

export default router;