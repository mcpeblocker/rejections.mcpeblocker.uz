import type { NextFunction, Response } from "express";
import type { RequestWithUser } from "../types/RequestWithUser.js";
import JWTService from "../services/jwt.service.js";
import type { AuthTokenPayload } from "../types/token.types.js";


const AUTH_ERROR = new Error("Unauthorized");

/**
 * Authentication middleware to protect routes.
 * Checks for a valid authorization token in the request headers.
 * If valid, attaches the userId to the request object.
 */
export default function authMiddleware(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw AUTH_ERROR;
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            throw AUTH_ERROR;
        }

        const payload = JWTService.verifyToken(token) as AuthTokenPayload;
        if (!payload || !payload.userId) {
            throw AUTH_ERROR;
        }

        // Attach userId to the request object for downstream handlers
        req.userId = payload.userId;

        next();
    } catch (error) {
        return res.status(401).send({ error: "Unauthorized" });
    }
}