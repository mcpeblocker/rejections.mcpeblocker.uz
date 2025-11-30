import type { NextFunction, Response } from "express";
import type { RequestWithUser } from "../types/RequestWithUser.js";

export default function authMiddleware(req: RequestWithUser, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    if (token !== process.env.SERVER_AUTH_TOKEN) {
        return res.status(403).send({ error: "Forbidden" });
    }

    req.userId = 1;

    next();
}