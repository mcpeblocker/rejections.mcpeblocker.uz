import { Router } from "express";
import authRouter from "./auth.router.js";
import rejectionsRouter from "./rejections.router.js";

const router = Router();

/**
 * GET /api/health
 * Health check endpoint.
 */
router.get("/health", (req, res) => {
    res.send({ status: "OK" });
});

router.use("/auth", authRouter);
router.use("/rejections", rejectionsRouter);

export default router;