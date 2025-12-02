import { Router } from "express";
import authRouter from "./auth.router.js";
import rejectionsRouter from "./rejections.router.js";
import publicRouter from "./public.router.js";

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
router.use("/public", publicRouter);

export default router;