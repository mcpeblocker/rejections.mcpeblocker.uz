import type { NextFunction, Response } from "express";
import type { RequestWithUser } from "../types/RequestWithUser.js";
import JWTService from "../services/jwt.service.js";
import type { AuthTokenPayload } from "../types/token.types.js";

/**
 * Authentication middleware to protect routes.
 * Checks for a valid authorization token in the request headers.
 * If valid, attaches the userId to the request object.
 */
export default function authMiddleware(req: RequestWithUser, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).send({ error: "Unauthorized" });
    }

    const payload = JWTService.verifyToken(token) as AuthTokenPayload;
    if (!payload || !payload.userId) {
        return res.status(401).send({ error: "Unauthorized" });
    }

    // Attach userId to the request object for downstream handlers
    req.userId = payload.userId;

    next();
}